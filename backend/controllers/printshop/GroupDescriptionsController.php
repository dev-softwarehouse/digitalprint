<?php

use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopProduct\PrintShopGroupDescription;
use DreamSoft\Models\PrintShopProduct\PrintShopGroupDescriptionLanguage;
use DreamSoft\Models\PrintShopProduct\PrintShopGroup;
use DreamSoft\Models\Upload\UploadFile;
use DreamSoft\Models\PrintShopProduct\PrintShopGroupLanguage;

class GroupDescriptionsController extends Controller
{

    public $useModels = array();

    /**
     * @var PrintShopGroup
     */
    protected $PrintShopGroup;
    /**
     * @var PrintShopGroupLanguage
     */
    protected $PrintShopGroupLanguage;
    /**
     * @var PrintShopGroupDescription
     */
    protected $PrintShopGroupDescription;
    /**
     * @var PrintShopGroupDescriptionLanguage
     */
    protected $PrintShopGroupDescriptionLanguage;
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
     * GroupDescriptionsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopGroup = PrintShopGroup::getInstance();
        $this->PrintShopGroupLanguage = PrintShopGroupLanguage::getInstance();
        $this->PrintShopGroupDescription = PrintShopGroupDescription::getInstance();
        $this->PrintShopGroupDescriptionLanguage = PrintShopGroupDescriptionLanguage::getInstance();
        $this->Uploader = Uploader::getInstance();
        $this->UploadFile = UploadFile::getInstance();
        $this->fileFolder = 'uploadedFiles/';
        $this->croppedFolder = 'uploadedFiles/' . companyID . '/cropped/';
        $this->thumbFolder = 'uploadedFiles/' . companyID . '/thumbs/';
    }

    /**
     * @param $params
     * @return array
     */
    public function groupDescriptions($params)
    {
        $groupID = $params['gid'];
        $lang = $params['lang'];
        $this->PrintShopGroup->setGroupID($groupID);
        $data_resp = $this->PrintShopGroupDescription->getByGroup($groupID);
        $data_descTypes = $this->PrintShopGroupDescription->getDescTypes();
        $data['descriptions'] = $this->prepareData($data_resp);
        $data['descTypes'] = $data_descTypes;
        if (empty($data)) {
            $data = array();
        }

        return $data;
    }

    /**
     * @param $params
     * @return mixed
     */
    public function post_groupDescriptions($params)
    {
        $groupDescriptions = $this->Data->getPost('groupDescriptions');
        $groupID = $this->Data->getPost('ID');
        $names = $groupDescriptions['langs'];
        $showLang = $this->Data->getPost('showLang');
        $descType = $groupDescriptions['descType'];
        $visible = $groupDescriptions['visible'];
        if ($visible) {
            $visAttr = 1;
        } else {
            $visAttr = 0;
        }

        if ($names) {

            $maxOrder = $this->PrintShopGroupDescription->getMaxOrder($groupID);
            if(!$maxOrder) {
                $maxOrder = 1;
            } else {
                $maxOrder++;
            }

            $lastDescID = $this->PrintShopGroupDescription->createDesc($groupID, $descType, $visAttr, $maxOrder);
            foreach ($names as $lang => $name) {

                if ($lastDescID) {
                    $lastID = $this->PrintShopGroupDescriptionLanguage->set($lastDescID, $lang, $name['name']);

                    $lastOne = $this->PrintShopGroupDescription->getForView($lastDescID, $showLang);

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
    public function put_groupDescriptions()
    {

        $post = $this->Data->getAllPost();
        $descriptionID = $post['descID'];
        $visible = $post['visible'];

        if ($visible) {
            $visAttr = 1;
        } else {
            $visAttr = 0;
        }
        $changedVisible = $this->PrintShopGroupDescription->editVisible($descriptionID, $visAttr);

        $savedLanguages = 0;
        foreach ($post['langs'] as $lang => $desc) {

            $savedLanguages += intval(
                $this->PrintShopGroupDescriptionLanguage->set($descriptionID, $lang, $desc['name'], $desc['description'])
            );
        }

        if( $changedVisible || $savedLanguages > 0 ) {

            $item = $this->PrintShopGroupDescription->get('ID', $descriptionID);
            $languages = $this->PrintShopGroupDescriptionLanguage->get('descID', $descriptionID, true);

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
    public function delete_groupDescriptions($descID)
    {

        if ($this->PrintShopGroupDescription->removeDesc($descID)) {

            return true;
        }
    }

    /**
     * @param $data_resp
     * @return mixed
     */
    public function prepareData($data_resp)
    {

        $data = array();

        foreach ($data_resp as $key => $gd) {
            $descID = $gd['descID'];
            $curLang = $gd['lang'];
            $data[$descID]['ID'] = $gd['ID'];
            $data[$descID]['groupID'] = $gd['groupID'];
            $data[$descID]['descID'] = $gd['descID'];
            $data[$descID]['order'] = $gd['order'];
            $data[$descID]['langs'][$curLang]['name'] = $gd['name'];
            $data[$descID]['langs'][$curLang]['description'] = $gd['description'];
            $data[$descID]['descType'] = $gd['descType'];
            $data[$descID]['visible'] = $gd['visible'];
            $data[$descID]['isOpen'] = $gd['visible'] == 1 ? true : false;
            $countFormats = $this->PrintShopGroupDescription->countFormats($descID);
            $data[$descID]['countFormats'] = $countFormats;
        }
        if( is_array($data) ) {
            $data = array_values($data);
        }

        return $data;
    }

    /**
     * @return bool
     */
    public function patch_groupDescriptions()
    {
        $sort = $this->Data->getAllPost();
        $edit = array();
        foreach ($sort as $order => $descID) {
            $edit = $this->PrintShopGroupDescription->editOrder($descID, $order);
        }
        return $edit;
    }

    /**
     * @param $params
     * @return array|mixed
     */
    public function groupDescriptionsPublic($params)
    {
        $groupUrl = $params['groupUrl'];
        $groupLanguageEntity = $this->PrintShopGroupLanguage->getByUrl($groupUrl);

        if (!$groupLanguageEntity) {
            return array();
        }

        $groupID = $groupLanguageEntity['groupID'];

        $data_resp = $this->PrintShopGroupDescription->getByGroup($groupID);
        $data = $this->prepareData($data_resp);

        $descArr = array();
        foreach ($data as $row) {
            $descArr[] = $row['descID'];
        }

        $files = $this->PrintShopGroupDescription->getFilesByList($descArr);
        if (!empty($files)) {
            foreach ($files as $descID => $fls) {
                foreach ($fls as $kf => $f) {
                    $files[$descID][$kf]['url'] = STATIC_URL . $this->fileFolder . companyID . '/' . $f['path'];
                    $files[$descID][$kf]['urlCrop'] = STATIC_URL . $this->thumbFolder . $f['path'];
                }
            }
        }

        foreach ($data as $key => $row) {
            if (isset($files[$row['descID']])) {
                $data[$key]['files'] = $files[$row['descID']];
            }
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @return array
     * @throws ImagickException
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

        $destCroppedFolder = $this->croppedFolder . $dirNumber . '/';
        $destCroppedPath = MAIN_UPLOAD . $destCroppedFolder;
        if (!is_dir($destinationThumbPath)) {
            mkdir($destinationThumbPath, 0755, true);
            chmod($destinationThumbPath, 0755);
        }
        if (!is_dir($destCroppedPath)) {
            mkdir($destCroppedPath, 0755, true);
            chmod($destCroppedPath, 0755);
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
            $id = $this->UploadFile->setUpload($filename, 'groupDesc', $dirNumber . '/' . $filename);
            $response['item'] = $this->UploadFile->getFileByID($id);
            $response['item'] = $this->prepareFile($response['item']);
            $response['thumbSaved'] = $thumbSaved;
        }
        return $response;
    }

    private function prepareFile($file)
    {
        $iconFolder = 'uploadedFiles/' . companyID . '/icons/';

        $iconsDestination = array(
            'groupDesc',
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
     * @return array
     */
    public function files()
    {

        $files = $this->UploadFile->getFiles('groupDesc');

        if (!$files) {
            return array();
        }

        $files = $this->prepareFiles($files);

        return $files;
    }

    /**
     * @return array|bool
     */
    public function patch_files()
    {

        $post = $this->Data->getAllPost();
        $clear = $this->PrintShopGroupDescription->clearDescriptionFiles($post['descID']);
        if (!$clear) {
            return false;
        }

        $result = array();

        foreach ($post['files'] as $f) {
            $result = $this->PrintShopGroupDescription->setDescriptionFiles($post['descID'], $f['ID']);
            if ($result === false) {
                return false;
            }
        }
        return $result;
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

        $filePath = MAIN_UPLOAD . $this->fileFolder . companyID . $fileEntity['path'];
        $thumbFilePath =  MAIN_UPLOAD . $this->fileFolder . companyID . '/thumbs/' . $fileEntity['path'];

        $removedFiles = 0;
        $removedFromDescription = false;
        if( $this->UploadFile->delete('ID', $fileEntity['ID']) ) {

            if( $this->PrintShopGroupDescription->removeDescriptionFiles($fileID) ) {
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

    /**
     * @param $descID
     * @return array
     */
    public function descFiles($descID)
    {

        $descFilesPair = $this->PrintShopGroupDescription->getDescriptionFiles($descID);
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


}
