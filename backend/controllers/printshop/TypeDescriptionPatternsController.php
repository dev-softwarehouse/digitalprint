<?php

use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Models\PrintShopProduct\PrintShopFormat;
use DreamSoft\Models\PrintShopProduct\PrintShopTypePattern;
use DreamSoft\Models\Upload\UploadFile;
use DreamSoft\Core\Controller;

class TypeDescriptionPatternsController extends Controller
{

    public $useModels = array();
    /**
     * @var PrintShopTypePattern
     */
    protected $PrintShopTypePattern;
    /**
     * @var Uploader
     */
    protected $Uploader;
    /**
     * @var string
     */
    protected $fileFolder;
    /**
     * @var UploadFile
     */
    protected $UploadFile;
    /**
     * @var PrintShopFormat
     */
    protected $PrintShopFormat;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopTypePattern = PrintShopTypePattern::getInstance();
        $this->PrintShopFormat = PrintShopFormat::getInstance();
        $this->Uploader = Uploader::getInstance();
        $this->UploadFile = UploadFile::getInstance();
        $this->fileFolder = 'uploadedFiles/';
    }

    public function patterns($params)
    {

        $typeID = $params['typeID'];
        $descID = $params['descID'];
        //$lang = $params['lang'];

        $data = $this->PrintShopTypePattern->customGetAll($typeID, $descID);

        if (empty($data)) {
            $data = array();
        }

        foreach ($data as $key => $row) {
            $data[$key]['patternIcon'] = STATIC_URL . $this->fileFolder . companyID . '/' . 'modelsIcons' . '/' . $row['ext'] . '.png';
            $data[$key]['patternFile'] = STATIC_URL . $this->fileFolder . companyID . '/' . $row['path'];
        }

        return $data;
    }

    public function patternsPublic($params)
    {
        $typeID = $params['typeID'];
        $descID = $params['descID'];

        $data = $this->PrintShopTypePattern->customGetAll($typeID, $descID, lang);

        if (empty($data)) {
            $data = array();
        }

        foreach ($data as $key => $row) {
            $data[$key]['patternIcon'] = STATIC_URL . $this->fileFolder . companyID . '/' . 'modelsIcons' . '/' . $row['ext'] . '.png';
            $data[$key]['patternFile'] = STATIC_URL . $this->fileFolder . companyID . '/' . $row['path'];
        }

        return $data;
    }

    public function post_patterns()
    {

        $params['lang'] = filter_input(INPUT_POST, 'lang');
        $params['formatID'] = filter_input(INPUT_POST, 'formatID');
        $params['descID'] = filter_input(INPUT_POST, 'descID');
        $params['typeID'] = filter_input(INPUT_POST, 'typeID');

        $maxID = $this->UploadFile->getMaxID();
        $dirNumber = floor($maxID / 100);
        $filename = $_FILES['file']['name'];
        $destFolder = $this->fileFolder . companyID . '/' . $dirNumber . '/';
        $destFilePath = MAIN_UPLOAD . $destFolder;

        $extFilename = explode('.', $filename);

        $params['ext'] = end($extFilename);

        if (is_file($destFilePath . $filename)) {
            $nameParts = explode('.', $filename);
            for ($i = 1; ; $i++) {
                $newFileName = $nameParts[0] . '_' . $i . '.' . $nameParts[1];
                if (!is_file($destFilePath . $newFileName)) {
                    $filename = $newFileName;
                    break;
                }
            }
        }

        $res = $this->Uploader->upload($_FILES, 'file', $destFolder, $filename);

        if ($res) {
            $fileID = $this->UploadFile->setUpload($filename, 'typePattern', $dirNumber . '/' . $filename);
            $newFile = $this->UploadFile->get('ID', $fileID);

            $params['fileID'] = $fileID;

            $lastID = $this->PrintShopTypePattern->create($params);

            $format = $this->PrintShopFormat->customGet($params['formatID']);

            $pattern = $this->PrintShopTypePattern->get('ID', $lastID);
            $pattern['patternIcon'] = STATIC_URL . $this->fileFolder . companyID . '/' . 'modelsIcons' . '/' . $pattern['ext'] . '.png';
            $pattern['patternFile'] = STATIC_URL . $this->fileFolder . companyID . '/' . $newFile['path'];
            $pattern['formatName'] = $format['name'];

            $response = array('response' => true, 'pattern' => $pattern, 'file' => $newFile);

        } else {
            $response['response'] = false;
        }

        return $response;
    }

    public function delete_patterns($ID)
    {


        $response['response'] = false;

        $pattern = $this->PrintShopTypePattern->get('ID', $ID);

        if (!$pattern) {
            return $response;
        }

        $file = $this->UploadFile->get('ID', $pattern['fileID']);

        if (!$file) {
            return $response;
        }

        $destFilePath = MAIN_UPLOAD . $this->fileFolder . companyID . '/';

        $pattern['patternFile'] = $destFilePath . $file['path'];

        if ($this->PrintShopTypePattern->delete('ID', $pattern['ID'])) {
            if ($this->UploadFile->delete('ID', $file['ID'])) {
                unlink($pattern['patternFile']);
                $response['response'] = true;
            }
        }

        return $response;
    }

}