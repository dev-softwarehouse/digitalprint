<?php

use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Models\Description\CategoriesDescription;
use DreamSoft\Models\Description\CategoriesDescriptionLang;
use DreamSoft\Models\Product\CategoryLang;
use DreamSoft\Models\Upload\UploadFile;
use DreamSoft\Core\Controller;
/**
 * Class CategoriesDescriptionsController
 */
class CategoriesDescriptionsController extends Controller
{

    /**
     * @var array
     */
    public $useModels = array();

    /**
     * @var CategoriesDescription
     */
    protected $CategoriesDescription;
    /**
     * @var CategoriesDescriptionLang
     */
    protected $CategoriesDescriptionLang;
    /**
     * @var Uploader
     */
    protected $Uploader;
    /**
     * @var UploadFile
     */
    protected $UploadFile;
    /**
     * @var CategoryLang
     */
    protected $CategoryLang;

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
     * CategoriesDescriptionsController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->CategoriesDescription = CategoriesDescription::getInstance();
        $this->CategoriesDescriptionLang = CategoriesDescriptionLang::getInstance();
        $this->Uploader = Uploader::getInstance();
        $this->UploadFile = UploadFile::getInstance();
        $this->CategoryLang = CategoryLang::getInstance();
        $this->fileFolder = 'uploadedFiles/';
        $this->thumbFolder = 'uploadedFiles/' . companyID . '/thumbs/';
        $this->croppedFolder = 'uploadedFiles/' . companyID . '/cropped/';
    }

    public function setDomainID($ID)
    {
        parent::setDomainID($ID);
        $this->CategoriesDescription->setDomainID($ID);
    }

    /**
     * @param $params
     * @return array
     */
    public function categoriesDescriptions($params)
    {
        $categoryID = $params['category_id'];
        $lang = $params['lang'];
        $data_resp = $this->CategoriesDescription->getByCategoryId($categoryID);
        $data_descTypes = $this->CategoriesDescription->getDescTypes();
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
    public function post_categoriesDescriptions($params)
    {

        $categoriesDescriptions = $this->Data->getPost('categoryDescriptions');
        $categoryID = $this->Data->getPost('ID');
        $names = $categoriesDescriptions['langs'];
        $showLang = $this->Data->getPost('showLang');
        $descType = $categoriesDescriptions['descType'];
        $visible = $categoriesDescriptions['visible'];
        if ($visible) {
            $visAttr = 1;
        } else {
            $visAttr = 0;
        }
        if ($names) {

            $maxOrder = $this->CategoriesDescription->getMaxOrder($categoryID);
            if( !$maxOrder ) {
                $maxOrder = 1;
            } else {
                $maxOrder++;
            }

            $lastDescID = $this->CategoriesDescription->createDesc($categoryID, $descType, $visAttr, $maxOrder);
            foreach ($names as $lang => $name) {

                if ($lastDescID) {
                    $lastID = $this->CategoriesDescriptionLang->set($lastDescID, $lang, $name['name']);
                    $lastOne = $this->CategoriesDescription->getForView($lastDescID, $showLang);
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
    public function put_categoriesDescriptions()
    {

        $post = $this->Data->getAllPost();
        $descriptionID = $post['descID'];
        $visible = $post['visible'];

        if ($visible) {
            $visAttr = 1;
        } else {
            $visAttr = 0;
        }
        $changedVisible = $this->CategoriesDescription->editVisible($descriptionID, $visAttr);

        $savedLanguages = 0;
        foreach ($post['langs'] as $lang => $desc) {

            $savedLanguages += intval(
                $this->CategoriesDescriptionLang->set($descriptionID, $lang, $desc['name'], $desc['description'])
            );
        }

        if( $changedVisible || $savedLanguages > 0 ) {

            $item = $this->CategoriesDescription->get('ID', $descriptionID);
            $languages = $this->CategoriesDescriptionLang->get('descID', $descriptionID, true);

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
    public function delete_categoriesDescriptions($descID)
    {

        if ($this->CategoriesDescription->removeDesc($descID)) {

            return true;
        }
    }

    /**
     * @param $data_resp
     * @return mixed
     */
    public function prepareData($data_resp)
    {
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
            $countFormats = $this->CategoriesDescription->countFormats($descID);
            $data[$descID]['countFormats'] = $countFormats;
        }
        $data = array_values($data);
        return $data;
    }

    /**
     * @param $data_resp
     * @return mixed
     */
    public function prepareDataPublic($data_resp)
    {

        foreach ($data_resp as $categoryID => $descriptions) {

            foreach ($descriptions as $cd) {
                $descID = $cd['descID'];
                $curLang = $cd['lang'];
                $data[$categoryID][$descID]['ID'] = $cd['ID'];
                $data[$categoryID][$descID]['groupID'] = $cd['groupID'];
                $data[$categoryID][$descID]['descID'] = $cd['descID'];
                $data[$categoryID][$descID]['order'] = $cd['order'];
                $data[$categoryID][$descID]['langs'][$curLang]['name'] = $cd['name'];
                $data[$categoryID][$descID]['langs'][$curLang]['description'] = $cd['description'];
                $data[$categoryID][$descID]['descType'] = $cd['descType'];
                $data[$categoryID][$descID]['visible'] = $cd['visible'];
                $data[$categoryID][$descID]['isOpen'] = $cd['visible'] == 1 ? true : false;
                $countFormats = $this->CategoriesDescription->countFormats($descID);
                $data[$categoryID][$descID]['countFormats'] = $countFormats;
            }

        }

        return $data;
    }

    /**
     * @return array
     */
    public function patch_categoriesDescriptions()
    {
        $sort = $this->Data->getAllPost();
        foreach ($sort as $order => $descID) {
            $edit = $this->CategoriesDescription->editOrder($descID, $order);
        }
        return $edit;
    }

    /**
     * @param $params
     * @return array|mixed
     */
    public function categoriesDescriptionsPublic($params)
    {

        $categoryList = explode(',', $params['list']);

        $data_resp = $this->CategoriesDescription->customGetByList($categoryList);

        if( !$data_resp ) {
            return array();
        }

        $descArr = array();
        foreach ($data_resp as $categoryID => $descriptions) {
            foreach ($descriptions as $cd) {
                $descArr[] = $cd['descID'];
            }
        }

        $data = $this->prepareDataPublic($data_resp);

        $files = $this->CategoriesDescription->getFilesByList($descArr);

        if (!empty($files)) {
            foreach ($files as $descID => $fls) {
                foreach ($fls as $kf => $f) {
                    $files[$descID][$kf]['url'] = STATIC_URL . $this->fileFolder . companyID . '/' . $f['path'];
                    $files[$descID][$kf]['urlCrop'] = STATIC_URL . $this->thumbFolder . $f['path'];
                }
            }
        }

        foreach ($data as $catID => $descriptions) {
            foreach ($descriptions as $dID => $value) {
                if (isset($files[$dID])) {
                    $data[$catID][$dID]['files'] = $files[$dID];
                }
            }
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @return array|bool|mixed
     * @throws ImagickException
     */
    public function post_files()
    {
        $maxID = $this->UploadFile->getMaxID();
        $dirNumber = floor($maxID / 100);
        $filename = $_FILES['file']['name'];
        $destFolder = $this->fileFolder . companyID . '/' . $dirNumber . '/';
        $destFilePath = MAIN_UPLOAD . $destFolder;


        $destThumbFolder = $this->thumbFolder . $dirNumber . '/';
        $destThumbPath = MAIN_UPLOAD . $destThumbFolder;
        $destCroppedFolder = $this->croppedFolder . $dirNumber . '/';
        $destCroppedPath = MAIN_UPLOAD . $destCroppedFolder;

        if (!is_dir($destThumbPath)) {
            mkdir($destThumbPath, 0755, true);
            chmod($destThumbPath, 0755);
        }
        if (!is_dir($destCroppedPath)) {
            mkdir($destCroppedPath, 0755, true);
            chmod($destCroppedPath, 0755);
        }
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
        $imagick = new Imagick($destFilePath . $filename);
        $w = $imagick->getimagewidth();
        $h = $imagick->getimageheight();

        if ($w > 100 && $h > 100) {
            $resizeVar = 100 / $w;
            $newH = ($h * $resizeVar);
            $thumb = $imagick->thumbnailimage(100, $newH);
        }
        $imagick->writeimage($destThumbPath . $filename);

        $thumbW = $imagick->getimagewidth();
        $thumbH = $imagick->getimageheight();

        if ($thumbH > 100 && $thumbW > 100) {
            $imagick->cropimage(100, 100, 0, 0);
        } elseif ($thumbH > 100) {
            $imagick->cropimage($thumbW, 100, 0, 0);
        } else {
            $imagick->cropimage(100, $thumbH, 0, 0);
        }
        $imagick->writeimage($destCroppedPath . $filename);

        $response = array('response' => false);

        if ($res) {
            $id = $this->UploadFile->setUpload($filename, 'categoryDesc', $dirNumber . '/' . $filename);
            $response = $this->UploadFile->getFileByID($id);
            $response = $this->prepareFile($response);
        }
        return $response;
    }

    /**
     * @return bool
     */
    public function files()
    {

        $files = $this->UploadFile->getFiles('categoryDesc');

        $files = $this->prepareFiles($files);

        return $files;
    }

    /**
     * @return bool
     */
    public function patch_files()
    {

        $post = $this->Data->getAllPost();
        $clear = $this->CategoriesDescription->clearDescriptionFiles($post['descID']);
        if (!$clear) {
            return false;
        }
        foreach ($post['files'] as $f) {
            $res = $this->CategoriesDescription->setDescriptionFiles($post['descID'], $f['ID']);
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

        $descFilesPair = $this->CategoriesDescription->getDescriptionFiles($descID);
        $descFiles = array();
        foreach ($descFilesPair as $df) {
            $descFileArr = $this->UploadFile->getFileByID($df['fileID']);
            $descFiles[] = $descFileArr;
        }

        $descFiles = $this->prepareFiles($descFiles);

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

        $filePath = MAIN_UPLOAD . $this->fileFolder . companyID . $fileEntity['path'];
        $thumbFilePath =  MAIN_UPLOAD . $this->fileFolder . companyID . '/thumbs/' . $fileEntity['path'];

        $removedFiles = 0;
        $removedFromDescription = false;
        if( $this->UploadFile->delete('ID', $fileEntity['ID']) ) {

            if( $this->CategoriesDescription->removeDescriptionFiles($fileID) ) {
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

    private function prepareFile($file)
    {
        $iconFolder = $this->fileFolder . companyID;

        $iconsDestination = array(
            'categoryDesc',
        );

        if( in_array($file['destination'], $iconsDestination) ) {

            $file['url'] = STATIC_URL . $iconFolder . $file['path'];
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

}

