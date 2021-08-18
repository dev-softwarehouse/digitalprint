<?php

use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Models\Description\CategoriesDescription;
use DreamSoft\Models\Description\CategoriesDescriptionLang;
use DreamSoft\Models\Description\SubcategoriesDescription;
use DreamSoft\Models\Description\SubcategoriesDescriptionLang;
use DreamSoft\Models\Product\CategoryLang;
use DreamSoft\Models\Upload\UploadFile;
use DreamSoft\Models\Product\Category;
use DreamSoft\Core\Controller;

class SubcategoriesDescriptionsController extends Controller
{

    public $useModels = array();

    /**
     * @var SubcategoriesDescription
     */
    protected $SubcategoriesDescription;
    /**
     * @var SubcategoriesDescriptionLang
     */
    protected $SubcategoriesDescriptionLang;
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
     * @var CategoryLang
     */
    protected $CategoryLang;
    /**
     * @var Category
     */
    protected $Category;
    /**
     * @var CategoriesDescription
     */
    private $CategoriesDescription;
    /**
     * @var CategoriesDescriptionLang
     */
    private $CategoriesDescriptionLang;

    /**
     * SubcategoriesDescriptionsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->SubcategoriesDescription = SubcategoriesDescription::getInstance();
        $this->SubcategoriesDescriptionLang = SubcategoriesDescriptionLang::getInstance();
        $this->CategoryLang = CategoryLang::getInstance();
        $this->Uploader = Uploader::getInstance();
        $this->CategoriesDescription = CategoriesDescription::getInstance();
        $this->CategoriesDescriptionLang = CategoriesDescriptionLang::getInstance();
        $this->UploadFile = UploadFile::getInstance();
        $this->Category = Category::getInstance();
        $this->fileFolder = 'uploadedFiles/';
        $this->thumbFolder = 'uploadedFiles/' . companyID . '/thumbs/';
        $this->croppedFolder = 'uploadedFiles/' . companyID . '/cropped/';
    }

    public function setDomainID($ID)
    {
        parent::setDomainID($ID);
        $this->SubcategoriesDescription->setDomainID($ID);
        $this->Category->setDomainID($ID);
    }

    /**
     * @param $params
     * @return array
     */
    public function subcategoriesDescriptions($params)
    {
        $categoryID = $params['subcategory_id'];
        $lang = $params['lang'];
        $data_resp = $this->SubcategoriesDescription->customGetAll($categoryID);
        $data_descTypes = $this->SubcategoriesDescription->getDescTypes();
        $data['descriptions'] = $this->prepareData($data_resp);
        $data['descTypes'] = $data_descTypes;
        if (empty($data)) {
            $data = array();
        }

        return $data;
    }

    /**
     * @param $data_resp
     * @return array
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
            $countFormats = $this->SubcategoriesDescription->countFormats($descID);
            $data[$descID]['countFormats'] = $countFormats;
        }
        $data = array_values($data);

        return $data;
    }

    /**
     * @param $params
     * @return mixed
     */
    public function post_subcategoriesDescriptions($params)
    {
        $categoriesDescriptions = $this->Data->getPost('subcategoryDescriptions');
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
            $maxOrder = $this->SubcategoriesDescription->getMaxOrder($categoryID);

            if( !$maxOrder ) {
                $maxOrder = 1;
            } else {
                $maxOrder++;
            }

            $lastDescID = $this->SubcategoriesDescription->createDesc($categoryID, $descType, $visAttr, $maxOrder);
            foreach ($names as $lang => $name) {

                $return = false;

                if ($lastDescID) {
                    $lastID = $this->SubcategoriesDescriptionLang->set($lastDescID, $lang, $name['name']);
                    $lastOne = $this->SubcategoriesDescription->getForView($lastDescID, $showLang);
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
    public function put_subcategoriesDescriptions()
    {

        $post = $this->Data->getAllPost();
        $descriptionID = $post['descID'];
        $visible = $post['visible'];

        if ($visible) {
            $visAttr = 1;
        } else {
            $visAttr = 0;
        }
        $changedVisible = $this->SubcategoriesDescription->editVisible($descriptionID, $visAttr);

        $savedLanguages = 0;
        foreach ($post['langs'] as $lang => $desc) {
            $savedLanguages += intval(
                $this->SubcategoriesDescriptionLang->set($descriptionID, $lang, $desc['name'], $desc['description'])
            );
        }

        if( $changedVisible || $savedLanguages > 0 ) {
            $item = $this->SubcategoriesDescription->get('ID', $descriptionID);
            $languages = $this->SubcategoriesDescriptionLang->get('descID', $descriptionID, true);

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
    public function delete_subcategoriesDescriptions($descID)
    {
        if ($this->SubcategoriesDescription->removeDesc($descID)) {
            return true;
        }

        return false;
    }

    /**
     * @return bool
     */
    public function patch_categoriesDescriptions()
    {
        $sort = $this->Data->getAllPost();
        foreach ($sort as $order => $descID) {
            $edit = $this->SubcategoriesDescription->editOrder($descID, $order);
        }
        return $edit;
    }

    /**
     * @param $params
     * @return array|mixed
     */
    public function subcategoriesDescriptionsPublic($params)
    {
        $categoryURL = $params['categoryURL'];
        $categoryID = $this->CategoryLang->getByUrl($categoryURL, lang);

        $categoryEntity = $this->Category->getOne($categoryID);


        if( $categoryEntity['parent'] == 0 ) {
            $data_resp = $this->CategoriesDescription->getByCategoryId($categoryID);
        } else {
            $data_resp = $this->SubcategoriesDescription->customGetAll($categoryID);
        }

        error_log( var_export($data_resp, true) );

        $data = $this->prepareData($data_resp);
        $descArr = array();
        foreach ($data as $row) {
            $descArr[] = $row['descID'];
        }


        if( $categoryEntity['parent'] == 0 ) {
            $files = $this->CategoriesDescription->getFilesByList($descArr);
        } else {
            $files = $this->SubcategoriesDescription->getFilesByList($descArr);
        }

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
     * @return bool|mixed
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
        if ($res) {
            $id = $this->UploadFile->setUpload($filename, 'subCategoryDesc', $dirNumber . '/' . $filename);
            $response = $this->UploadFile->getFileByID($id);
        }
        return $response;
    }

    /**
     * @return array
     */
    public function files()
    {

        $files = $this->UploadFile->getFiles('categoryDesc');

        $files = $this->prepareFiles($files);

        return $files;
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

    /**
     * @return bool
     */
    public function patch_files()
    {

        $post = $this->Data->getAllPost();
        $clear = $this->SubcategoriesDescription->clearDescriptionFiles($post['descID']);
        if (!$clear) {
            return false;
        }
        foreach ($post['files'] as $f) {
            $res = $this->SubcategoriesDescription->setDescriptionFiles($post['descID'], $f['ID']);
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

        $descFilesPair = $this->SubcategoriesDescription->getDescriptionFiles($descID);
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

            if( $this->SubcategoriesDescription->removeDescriptionFiles($fileID) ) {
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

}
