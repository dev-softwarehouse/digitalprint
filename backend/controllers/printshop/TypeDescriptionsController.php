<?php

use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeDescription;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeDescriptionFormat;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeDescriptionLanguage;
use DreamSoft\Models\PrintShopProduct\PrintShopFormat;
use DreamSoft\Models\PrintShopProduct\PrintShopTypePattern;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeLanguage;
use DreamSoft\Models\Upload\UploadFile;

class TypeDescriptionsController extends Controller
{

    public $useModels = array();
    /**
     * @var PrintShopType
     */
    protected $PrintShopType;
    /**
     * @var PrintShopTypeLanguage
     */
    protected $PrintShopTypeLanguage;
    /**
     * @var PrintShopFormat
     */
    protected $PrintShopFormat;
    /**
     * @var PrintShopTypeDescription
     */
    protected $PrintShopTypeDescription;
    /**
     * @var PrintShopTypeDescriptionLanguage
     */
    protected $PrintShopTypeDescriptionLanguage;
    /**
     * @var PrintShopTypeDescriptionFormat
     */
    protected $PrintShopTypeDescriptionFormat;
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
     * @var string
     */
    protected $thumbFolder;
    /**
     * @var string
     */
    protected $croppedFolder;
    /**
     * @var UploadFile
     */
    protected $UploadFile;

    /**
     * TypeDescriptionsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopTypeLanguage = PrintShopTypeLanguage::getInstance();
        $this->PrintShopTypeDescription = PrintShopTypeDescription::getInstance();
        $this->PrintShopTypeDescriptionLanguage = PrintShopTypeDescriptionLanguage::getInstance();
        $this->PrintShopFormat = PrintShopFormat::getInstance();
        $this->PrintShopTypeDescriptionFormat = PrintShopTypeDescriptionFormat::getInstance();
        $this->PrintShopTypePattern = PrintShopTypePattern::getInstance();
        $this->Uploader = Uploader::getInstance();
        $this->UploadFile = UploadFile::getInstance();
        $this->fileFolder = 'uploadedFiles/';
        $this->thumbFolder = 'uploadedFiles/' . companyID . '/thumbs/';
        $this->croppedFolder = 'uploadedFiles/' . companyID . '/cropped/';
    }

    /**
     * @param $params
     * @return array
     */
    public function typeDescriptions($params)
    {
        $typeID = $params['tid'];
        $groupID = $params['gid'];
        $lang = $params['lang'];
        $this->PrintShopType->setGroupID($groupID);
        $data_resp = $this->PrintShopTypeDescription->customGetAll($typeID);
        $data_descTypes = $this->PrintShopTypeDescription->getDescTypes();
        $data['descriptions'] = $this->prepareData($data_resp);
        $data['descTypes'] = $data_descTypes;
        if (empty($data)) {
            $data = array();
        }

        return $data;
    }

    /**
     * @param $params
     * @return bool|string
     */
    public function setFormats($params)
    {
        $descID = $params['descID'];
        $formatID = $params['formatID'];

        $actID = $this->PrintShopTypeDescriptionFormat->setFormat($descID, $formatID);

        return $actID;
    }

    /**
     * @param $params
     * @return mixed
     */
    public function post_typeDescriptions($params)
    {
        $typeDescriptions = $this->Data->getPost('typeDescriptions');
        $typeID = $this->Data->getPost('ID');
        $names = $typeDescriptions['langs'];
        $showLang = $this->Data->getPost('showLang');
        $descType = $typeDescriptions['descType'];
        $visible = $typeDescriptions['visible'];
        if ($visible) {
            $visAttr = 1;
        } else {
            $visAttr = 0;
        }
        if ($names) {

            $maxOrder = $this->PrintShopTypeDescription->getMaxOrder($typeID);
            if( !$maxOrder ) {
                $maxOrder = 1;
            } else {
                $maxOrder++;
            }

            $lastDescID = $this->PrintShopTypeDescription->createDesc($typeID, $descType, $visAttr, $maxOrder);
            foreach ($names as $lang => $name) {

                if ($lastDescID) {
                    $lastID = $this->PrintShopTypeDescriptionLanguage->set($lastDescID, $lang, $name['name']);

                    $lastOne = $this->PrintShopTypeDescription->getForView($lastDescID, $showLang);
                    $descID = $lastOne['descID'];
                    $return['ID'] = $lastOne['ID'];
                    $return['descID'] = $descID;
                    $return['langs'][$lastOne['lang']]['name'] = $lastOne['name'];
                    $return['descType'] = $lastOne['descType'];
                    $return['visible'] = $lastOne['visible'];
                }

                if (!$return) {
                    $return['response'] = false;
                    return $return;
                }
            }
            return $return;
        } else {
            $return = $this->sendFailResponse('01');
            return $return;
        }
    }

    /**
     * @return array
     */
    public function put_typeDescriptions()
    {

        $post = $this->Data->getAllPost();
        $descriptionID = $post['descID'];
        $visible = $post['visible'];

        if ($visible) {
            $visAttr = 1;
        } else {
            $visAttr = 0;
        }
        $changedVisible = $this->PrintShopTypeDescription->editVisible($descriptionID, $visAttr);

        $savedLanguages = 0;
        foreach ($post['langs'] as $lang => $desc) {

            $savedLanguages += intval(
                $this->PrintShopTypeDescriptionLanguage->set($descriptionID, $lang, $desc['name'], $desc['description'])
            );
        }

        if( $changedVisible || $savedLanguages > 0 ) {

            $item = $this->PrintShopTypeDescription->get('ID', $descriptionID);
            $languages = $this->PrintShopTypeDescriptionLanguage->get('descID', $descriptionID, true);

            if( $languages ) {
                foreach ($languages as $language) {
                    $item['langs'][$language['lang']] = array('name' => $language['name']);
                }
            }

            return array(
                'response' => true,
                'item' => $item
            );
        }
        return array('response' => false);
    }

    /**
     * @param $descID
     * @return bool
     */
    public function delete_typeDescriptions($descID)
    {

        $destFilePath = MAIN_UPLOAD . $this->fileFolder . companyID . '/';

        if ($this->PrintShopTypeDescription->removeDesc($descID)) {
            $patterns = $this->PrintShopTypePattern->getByDesc($descID);
            foreach ($patterns as $key => $p) {
                if ($this->PrintShopTypePattern->delete('ID', $p['ID'])) {
                    if ($this->UploadFile->delete('ID', $p['fileID'])) {
                        $pathFile = $destFilePath . $p['path'];
                        unlink($pathFile);
                    }
                }
            }
            return true;
        }
    }

    /**
     * @param $data_resp
     * @return mixed
     */
    private function prepareData($data_resp)
    {
        $data = array();

        foreach ($data_resp as $key => $gd) {
            $descID = $gd['descID'];
            $curLang = $gd['lang'];
            $data[$descID]['ID'] = $gd['ID'];
            $data[$descID]['typeID'] = $gd['typeID'];
            $data[$descID]['descID'] = $gd['descID'];
            $data[$descID]['order'] = $gd['order'];
            $data[$descID]['langs'][$curLang]['name'] = $gd['name'];
            $data[$descID]['langs'][$curLang]['description'] = $gd['description'];
            $data[$descID]['descType'] = $gd['descType'];
            $data[$descID]['isOpen'] = intval($gd['visible']) === 1 ? true : false;
            $data[$descID]['visible'] = $gd['visible'];
            $countFormats = $this->PrintShopTypeDescription->countFormats($descID);
            $data[$descID]['countFormats'] = $countFormats;
        }
        $data = array_values($data);

        return $data;
    }

    /**
     * @return bool
     */
    public function patch_typeDescriptions()
    {
        $sort = $this->Data->getAllPost();
        foreach ($sort as $order => $descID) {
            $edit = $this->PrintShopTypeDescription->editOrder($descID, $order);
        }
        return $edit;
    }

    /**
     * @param $params
     * @return array|mixed
     */
    public function typeDescriptionsPublic($params)
    {
        $groupID = $params['groupID'];
        $typeID = $params['typeID'];
        $this->PrintShopType->setGroupID($groupID);
        $data_resp = $this->PrintShopTypeDescription->customGetAll($typeID);
        $data = $this->prepareData($data_resp);

        $descPatternArr = array();
        $aggregateDescriptions = array();
        foreach ($data as $row) {
            $aggregateDescriptions[] = $row['descID'];
            if ($row['descType'] == 7) {
                $descPatternArr[] = $row['descID'];
            }
        }

        $patterns = array();
        if (!empty($descPatternArr)) {
            $patterns = $this->PrintShopTypePattern->getByList($typeID, $descPatternArr, lang);
        }

        $files = $this->PrintShopTypeDescription->getFilesByList($aggregateDescriptions);
        if (!empty($files)) {
            foreach ($files as $descID => $fls) {
                foreach ($fls as $kf => $f) {
                    $files[$descID][$kf]['url'] = STATIC_URL . $this->fileFolder . companyID . '/' . $f['path'];
                    $files[$descID][$kf]['urlCrop'] = STATIC_URL . $this->thumbFolder . $f['path'];
                }
            }
        }

        $formats = $this->PrintShopTypeDescriptionFormat->getForDescList($aggregateDescriptions);
        foreach ($data as $key => $row) {
            if (isset($formats[$row['descID']])) {
                $data[$key]['formats'] = $formats[$row['descID']];
            } else {
                $data[$key]['formats'] = array();
            }
            if (isset($files[$row['descID']])) {
                $data[$key]['files'] = $files[$row['descID']];
            }

            if ($row['descType'] == 7) {
                $data[$key]['patterns'] = array();
                if( array_key_exists($row['descID'], $patterns) ) {
                    $data[$key]['patterns'] = $patterns[$row['descID']];
                }
            }

        }


        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $params
     */
    public function groupDescriptionPublic($params)
    {
        $groupID = $params['groupID'];
        $data_resp = $this->PrintShopTypeDescription->getAllForGroup($groupID);
        $data = $this->prepareData($data_resp);
        foreach ($data as $row) {
            $descArr[] = $row['descID'];
        }
    }

    /**
     * @return array
     */
    public function post_files()
    {
        $maxID = $this->UploadFile->getMaxID();
        $dirNumber = floor($maxID / 100);
        $filename = $_FILES['file']['name'];
        $destinationFolder = $this->fileFolder . companyID . '/' . $dirNumber . '/';
        $destinationFilePath = MAIN_UPLOAD . $destinationFolder;


        $destinationThumbFolder = $this->thumbFolder . $dirNumber . '/';
        $destinationThumbPath = MAIN_UPLOAD . $destinationThumbFolder;
        $destinationCroppedFolder = $this->croppedFolder . $dirNumber . '/';
        $destinationCroppedPath = MAIN_UPLOAD . $destinationCroppedFolder;

        if (!is_dir($destinationThumbPath)) {
            mkdir($destinationThumbPath, 0755, true);
            chmod($destinationThumbPath, 0755);
        }
        if (!is_dir($destinationCroppedPath)) {
            mkdir($destinationCroppedPath, 0755, true);
            chmod($destinationCroppedPath, 0755);
        }


        if (is_file($destinationFilePath . $filename)) {
            $nameParts = explode('.', $filename);
            for ($i = 1; ; $i++) {
                $newFileName = $nameParts[0] . '_' . $i . '.' . $nameParts[1];
                if (!is_file($destinationFilePath . $newFileName)) {
                    $filename = $newFileName;
                    break;
                }
            }
        }

        $res = $this->Uploader->upload($_FILES, 'file', $destinationFolder, $filename);
        $imagick = new Imagick($destinationFilePath . $filename);

        $h = $imagick->getimageheight();

        $explodeName = explode('.', $filename);
        $extension = end($explodeName);

        $extensionsAllowedThumb = array('jpg', 'jpeg', 'png');

        $thumbSaved = false;

        if ( $h > THUMB_RESIZE_HEIGHT && in_array($extension, $extensionsAllowedThumb) ) {
            $imagick->resizeImage ( 0, THUMB_RESIZE_HEIGHT,  imagick::FILTER_LANCZOS, 1);
            $imagick->writeimage($destinationThumbPath . $filename);
        } else {
            $fileSource = MAIN_UPLOAD . $destinationFolder . $filename;
            $fileDestination = MAIN_UPLOAD . $destinationThumbFolder . $filename;
            $thumbSaved = copy($fileSource,  $fileDestination);
        }

        $response = array('response' => false);

        if ($res) {
            $response['response'] = true;
            $id = $this->UploadFile->setUpload($filename, 'typeDesc', $dirNumber . '/' . $filename);
            $response['item'] = $this->UploadFile->getFileByID($id);
            $response['item'] = $this->prepareFile($response['item']);
            $response['thumbSaved'] = $thumbSaved;
        }
        return $response;
    }

    /**
     * @return bool
     */
    public function files()
    {

        $files = $this->UploadFile->getFiles('typeDesc');

        $files = $this->prepareFiles($files);

        return $files;
    }

    private function prepareFile($file)
    {
        $iconFolder = 'uploadedFiles/' . companyID . '/icons/';

        $iconsDestination = array(
            'typeDesc',
        );

        if( in_array($file['destination'], $iconsDestination) ) {

            $file['url'] = STATIC_URL . $iconFolder . '/' . $file['path'];
            $file['miniatureUrl'] = STATIC_URL . $this->thumbFolder . $file['path'];

        }

        return $file;
    }

    private function prepareFiles($files)
    {
        if( !$files ) {
            return array();
        }

        foreach ($files as $key => $file) {
            $files[$key] = $this->prepareFile($file);
        }

        return $files;
    }

    /**
     * @return bool
     */
    public function patch_files()
    {

        $post = $this->Data->getAllPost();
        $clear = $this->PrintShopTypeDescription->clearDescriptionFiles($post['descID']);
        if (!$clear) {
            return false;
        }
        $descID = $post['descID'];
        foreach ($post['files'] as $f) {
            $res = $this->PrintShopTypeDescription->setDescriptionFiles($post['descID'], $f['ID']);
            if ($res === false) {
                return false;
            }
        }
        return $res;
    }

    /**
     * @param $descID
     * @return array
     */
    public function descFiles($descID)
    {

        $descFilesPair = $this->PrintShopTypeDescription->getDescriptionFiles($descID);

        if( !$descFilesPair ) {
            return array();
        }

        $aggregateDescriptionFiles = array();
        foreach ($descFilesPair as $descriptionFile) {
            $aggregateDescriptionFiles[] = $descriptionFile['fileID'];
        }

        $descFiles = $this->UploadFile->getByList($aggregateDescriptionFiles);

        foreach ($descFiles as $key => $file) {
            $descFiles[$key]['miniatureUrl'] = STATIC_URL . $this->fileFolder . companyID . '/thumbs/' . $file['path'];
        }

        sort($descFiles);

        return $descFiles;
    }

    /**
     * @param $fileID
     * @return array
     */
    public function delete_files($fileID)
    {
        $fileEntity = $this->UploadFile->getFileByID($fileID);

        if( !$fileEntity ) {
            return $this->sendFailResponse('06');
        }

        $response = false;
        $removedFiles = 0;
        $removedFromDescription = false;

        $filePath = MAIN_UPLOAD . $this->fileFolder . companyID . '/' . $fileEntity['path'];
        $thumbFilePath =  MAIN_UPLOAD . $this->fileFolder . companyID . '/thumbs/' . $fileEntity['path'];

        if( $this->UploadFile->delete('ID', $fileEntity['ID']) ) {

            if( $this->PrintShopTypeDescription->removeDesc($fileID) ) {
                $removedFromDescription = true;
            }

            $response = true;
            if( unlink($filePath) ) {
                $removedFiles++;
            }
            if( unlink($thumbFilePath) ) {
                $removedFiles++;
            }
        }

        return array(
            'response' => $response,
            'item' => $fileEntity,
            'removedFiles' => $removedFiles,
            'removedFromDescription' => $removedFromDescription
        );
    }

    public function setDomainID($ID)
    {
        parent::setDomainID($ID);
        $this->PrintShopTypeDescription->setDomainID($ID);
    }

}
