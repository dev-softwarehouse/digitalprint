<?php

use DreamSoft\Controllers\Components\Delete;
use DreamSoft\Controllers\Components\Filter;
use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeTax;
use DreamSoft\Models\PrintShopProduct\PrintShopGroup;
use DreamSoft\Models\Product\ProductCategory;
use DreamSoft\Models\Seo\MetaTag;
use DreamSoft\Models\Upload\UploadFile;
use DreamSoft\Models\PrintShopProduct\PrintShopGroupLanguage;
use DreamSoft\Models\PrintShopProduct\PrintShopStaticPrice;

/**
 * Class ProductGroupsController
 */
class ProductGroupsController extends Controller
{

    public $useModels = array();
    /**
     * @var PrintShopType
     */
    protected $PrintShopType;
    /**
     * @var PrintShopGroup
     */
    protected $PrintShopGroup;
    /**
     * @var PrintShopGroupLanguage
     */
    protected $PrintShopGroupLanguage;
    /**
     * @var PrintShopTypeTax
     */
    protected $PrintShopTypeTax;
    /**
     * @var MetaTag
     */
    protected $MetaTag;
    /**
     * @var Delete
     */
    protected $Delete;
    /**
     * @var Filter
     */
    protected $Filter;
    /**
     * @var UploadFile
     */
    protected $UploadFile;
    /**
     * @var string
     */
    protected $iconFolder;
    /**
     * @var array
     */
    public $configs;
    /**
     * @var ProductCategory
     */
    protected $ProductCategory;
    /**
     * @var Uploader
     */
    protected $Uploader;
    /**
     * @var PrintShopStaticPrice
     */
    protected $PrintShopStaticPrice;

    /**
     * ProductGroupsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopGroup = PrintShopGroup::getInstance();
        $this->PrintShopGroupLanguage = PrintShopGroupLanguage::getInstance();
        $this->PrintShopTypeTax = PrintShopTypeTax::getInstance();
        $this->MetaTag = MetaTag::getInstance();
        $this->UploadFile = UploadFile::getInstance();
        $this->ProductCategory = ProductCategory::getInstance();
        $this->PrintShopStaticPrice = PrintShopStaticPrice::getInstance();

        $this->Delete = Delete::getInstance();
        $this->Filter = Filter::getInstance();
        $this->Uploader = Uploader::getInstance();
        $this->setConfigs();

        $this->iconFolder = 'uploadedFiles/' . companyID . '/icons/';
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->PrintShopTypeTax->setDomainID($domainID);
    }

    public function setConfigs()
    {
        $this->configs = array(
            'forSeller' => array('type' => 'string', 'table' => 'ps_products_groups', 'field' => 'forSeller', 'sign' => $this->Filter->signs['e']),
        );
    }

    /**
     * @return array
     */
    public function getConfigs()
    {
        return $this->configs;
    }

    /**
     * @param null $ID
     * @return array|bool|mixed
     */
    public function groups($ID = NULL)
    {

        if (intval($ID) > 0) {
            $data = $this->PrintShopGroup->customGet($ID);
        } else {
            $data = $this->PrintShopGroup->getAll();

            if( !$data ) {
                return array();
            }

            $data = $this->fillMetaData($data);
            $data = $this->fillIcons($data);

        }
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $groups
     * @return mixed
     */
    private function fillMetaData($groups)
    {
        foreach ($groups as $key => $group) {
            $metaData = $this->MetaTag->getByElemID('groupID', $group['ID']);
            if (!empty($metaData)) {
                $metaArray = array();
                foreach ($metaData as $md) {
                    $metaArray[$md['lang']] = $md;
                }
                $groups[$key]['metaTags'] = $metaArray;
            }
        }

        return $groups;
    }

    /**
     * @param $groups
     * @return mixed
     */
    private function fillIcons($groups)
    {
        $aggregateIcons = array();
        foreach ($groups as $key => $group) {
            if ($group['iconID']) {
                $aggregateIcons[] = $group['iconID'];
            }
        }

        $icons = $this->UploadFile->getFileByList($aggregateIcons);

        if ($icons) {
            foreach ($icons as $key => $icon) {
                $icons[$key]['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
            }
        }

        foreach ($groups as $key => $group) {
            if ($group['iconID']) {
                $groups[$key]['icon'] = NULL;
                if(array_key_exists($group['iconID'], $icons)) {
                    $groups[$key]['icon'] = $icons[$group['iconID']];
                }
            }
        }

        return $groups;
    }

    /**
     * @return array|bool
     */
    public function post_groups()
    {

        $name = $this->Data->getPost('name');
        $metaTags = $this->Data->getPost('metaTags');
        $forSeller = $this->Data->getPost('forSeller');
        $round = $this->Data->getPost('round');
        $names = $this->Data->getPost('names');
        $slugs = $this->Data->getPost('slugs');
        $icons = $this->Data->getPost('icons');
        if (!$forSeller) {
            $forSeller = 0;
        }

        if (($name || $names)) {
            $lastID = $this->PrintShopGroup->customCreate($name, $forSeller);
            if (!$lastID) {
                return $this->sendFailResponse('03');
            }

            if( $lastID ) {
                $this->PrintShopGroup->update($lastID, 'round', $round);
            }

            if (!empty($names)) {
                foreach ($names as $lang => $name) {
                    $slug = NULL;
                    if( isset($slugs[$lang]) && !empty($slugs[$lang]) ) {
                        $slug = $slugs[$lang];
                    }
                    $res = $this->PrintShopGroupLanguage->set($lang, $name, $lastID, $slug);
                    if (!$res) {
                        $return = $this->sendFailResponse('09');
                        return $return;
                    }
                }
            }

            if (!empty($icons)) {
                foreach ($icons as $lang => $desc) {
                    if (!$desc || $desc == NULL) {
                        continue;
                    }
                    $res = $this->PrintShopGroupLanguage->setIcon($lang, $desc, $lastID);
                    if (!$res) {
                        $return = $this->sendFailResponse('09');
                        return $return;
                    }
                }
            }

            $metaTagsSaved = NULL;
            if (!empty($metaTags)) {
                foreach ($metaTags as $lang => $meta) {
                    $elem = 'groupID';
                    $title = $meta['title'];
                    $keywords = $meta['keywords'];
                    $description = $meta['description'];
                    $lastMetaTagID = $this->MetaTag->set($lang, $elem, $lastID, $title, $keywords, $description);
                    if($lastMetaTagID) {
                        $metaTagsSaved[$lang] = compact('title', 'keywords', 'description');
                    }
                }
            }
            $return['item'] = $this->PrintShopGroup->customGet($lastID);
            $return['item']['metaTags'] = $metaTagsSaved;
            $return['response'] = true;
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    /**
     * @return mixed
     */
    public function put_groups()
    {
        $post = $this->Data->getAllPost();

        $names = $post['names'];
        $slugs = $post['slugs'];
        $icons = $post['icons'];
        $metaTags = $post['metaTags'];
        $post['active'] = intval($post['active']);
        $post['forSeller'] = intval($post['forSeller']);
        unset($post['names']);
        unset($post['icons']);

        $goodKeys = array(
            'name',
            'leftDescription',
            'simpleEditor',
            'active',
            'forSeller',
            'round',
            'cardGuide',
            'icons'
        );

        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }

        $res = false;
        foreach ($post as $key => $value) {

            if ($key == 'taxes' && is_array($value)) {
                $taxesList = array();
                foreach ($value as $tax) {
                    if ($tax['selected'] == 1) {
                        $taxesList[] = $tax['ID'];
                    }
                }
                $this->PrintShopTypeTax->createFromList($taxesList, $ID);
            }

            if (in_array($key, $goodKeys)) {
                $res = $this->PrintShopGroup->update($ID, $key, $value);
            }
        }

        if ($res) {
            $return['response'] = true;
        } else {
            $return['response'] = false;
        }

        if (!empty($names)) {
            foreach ($names as $lang => $name) {
                $slug = NULL;
                if( isset($slugs[$lang]) && !empty($slugs[$lang]) ) {
                    $slug = $slugs[$lang];
                }
                $res = $this->PrintShopGroupLanguage->set($lang, $name, $ID, $slug);
                if (!$res) {
                    $return = $this->sendFailResponse('09');
                    return $return;
                }
            }
        }

        if (!empty($icons)) {
            foreach ($icons as $lang => $desc) {
                if ($desc == NULL || strlen($desc) == 0) {
                    $this->PrintShopGroupLanguage->setIcon($lang, NULL, $ID);
                    continue;
                }
                $res = $this->PrintShopGroupLanguage->setIcon($lang, $desc, $ID);
                if (!$res) {
                    $return = $this->sendFailResponse('09');
                    return $return;
                }
            }
        }

        $updatedMetaTags = array();
        if (!empty($metaTags)) {
            $elem = 'groupID';
            $this->MetaTag->removeByElemID($elem, $ID);
            foreach ($metaTags as $lang => $m) {
                $res = $this->MetaTag->set($lang, $elem, $ID, $m['title'], $m['keywords'], $m['description']);
                if (!$res) {
                    $return = $this->sendFailResponse('09');
                    return $return;
                }
                $updatedMetaTags[$lang] = array(
                    'title' => $m['title'],
                    'keywords' => $m['keywords'],
                    'description' => $m['description']
                );
            }

        } else {
            $groupMetaTags = $this->MetaTag->getByGroup($ID);
            foreach ($groupMetaTags as $row) {
                $updatedMetaTags[$row['lang']] = $row;
            }
        }

        $return['item'] = $this->PrintShopGroup->customGet($ID);
        $return['item']['metaTags'] = $updatedMetaTags;
        if( intval($return['item']['iconID']) > 0 ) {
            $icon = $this->UploadFile->get('ID', $return['item']['iconID']);
            $icon['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
            $return['item']['icon'] = $icon;
        }
        return $return;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_groups($ID)
    {
        if (intval($ID) > 0) {
            $response = $this->PrintShopGroup->delete('ID', $ID);
            if ($response) {
                $this->PrintShopType->setGroupID($ID);
                $this->PrintShopTypeTax->removeByGroup($ID);
                $this->MetaTag->removeByElemID('groupID', $ID);
                $types = $this->PrintShopType->getAll();
                $this->PrintShopStaticPrice->delete('groupID', $ID);
                if (!empty($types)) {
                    foreach ($types as $t) {
                        $this->Delete->deleteType($ID, $t['ID']);

                    }
                }
                $this->ProductCategory->deleteByItem($ID, 1);
            }

            if (!$this->PrintShopGroupLanguage->delete('groupID', $ID)) {
                $data = $this->sendFailResponse('09');
                return $data;
            }

            $data['response'] = $response;
            return $data;
        } else {
            $data['response'] = false;
            return $data;
        }
    }

    public function groupList($params = NULL)
    {

    }

    /**
     * @param null $params
     * @return array
     */
    /*public function count($params = NULL)
    {

        $configs = $this->getConfigs();

        $filters = $this->Filter->prepare($configs, $params);

        $count = $this->PrintShopGroup->count($filters);
        return array('count' => $count);
    }*/

    /**
     * @return array
     */
    /*public function offerProducts()
    {
        $data = $this->PrintShopGroup->getOfferTypes();
        if (!$data) {
            $data = array();
        }
        return $data;
    }*/

    /**
     * @param $groupUrl
     * @return array|bool
     */
    public function getOneForView($groupUrl)
    {

        $groupLangEntity = $this->PrintShopGroupLanguage->getByUrl($groupUrl);

        if( !$groupLangEntity ) {
            return array();
        }
        $data = $this->PrintShopGroup->customGet($groupLangEntity['groupID']);
        if (!$data) {
            $data = array();
        }
        return $data;
    }

    /**
     * @return mixed
     */
    public function post_uploadIcon()
    {
        $response['response'] = false;
        $groupID = $this->Data->getPost('groupID');

        $maxID = $this->UploadFile->getMaxID();
        $dirNumber = floor($maxID / 100);
        $filename = $_FILES['file']['name'];
        $destinationFolder = $this->iconFolder . '/' . $dirNumber . '/';

        $group = $this->PrintShopGroup->customGet($groupID);

        $one = $this->UploadFile->get('ID', $group['iconID']);

        $this->Uploader->remove($this->iconFolder, $one['path']);

        $destinationIconPath = MAIN_UPLOAD . $destinationFolder;

        if (!is_dir($destinationIconPath)) {
            mkdir($destinationIconPath, 0755, true);
            chmod($destinationIconPath, 0755);
        }

        if (is_file($destinationIconPath . $filename)) {
            $nameParts = explode('.', $filename);
            for ($i = 1; ; $i++) {
                $newFileName = $nameParts[0] . '_' . $i . '.' . $nameParts[1];
                if (!is_file($destinationIconPath . $newFileName)) {
                    $filename = $newFileName;
                    break;
                }
            }
        }

        $res = $this->Uploader->upload($_FILES, 'file', $destinationFolder, $filename);

        if ($res) {
            $lastID = $this->UploadFile->setUpload($filename, 'groupIcon', $dirNumber . '/' . $filename);

            $this->PrintShopGroup->update($group['ID'], 'iconID', $lastID);

            $icon = $this->UploadFile->get('ID', $lastID);

            if ($icon) {
                $icon['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
                $response['icon'] = $icon;
                $response['item'] = $group;
                $response['response'] = true;
            }

        }
        return $response;
    }

    /**
     * @param $group
     * @return mixed
     */
    public function delete_uploadIcon($group)
    {
        $data['response'] = false;
        $group = $this->PrintShopGroup->customGet($group);

        $one = $this->UploadFile->get('ID', $group['iconID']);

        if ($this->Uploader->remove($this->iconFolder, $one['path'])) {
            $data['response'] = $this->UploadFile->delete('ID', $one['ID']);
            $this->PrintShopGroup->update($group['ID'], 'iconID', NULL);
        }

        return $data;
    }

    public function groupsForSelect()
    {
        $data = $this->PrintShopGroup->getAll();
        if (!$data) {
            return array();
        }

        return $data;
    }

    /**
     * @return array|bool|mixed
     */
    public function getActiveGroups()
    {
        $data = $this->PrintShopGroup->getAll(true, true);

        if( !$data ) {
            return array();
        }

        $data = $this->fillMetaData($data);
        $data = $this->fillIcons($data);

        return $data;
    }

    public function getActiveGroupsPublic()
    {
        return $this->getActiveGroups();
    }

}
