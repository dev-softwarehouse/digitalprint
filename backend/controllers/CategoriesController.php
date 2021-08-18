<?php

use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Models\Discount\UserDiscountGroup;
use DreamSoft\Models\Discount\DiscountGroupLang;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\Product\CategoryLang;
use DreamSoft\Models\Promotion\Promotion;
use DreamSoft\Controllers\Components\PromotionCalculation;
use DreamSoft\Controllers\Components\Standard;
use DreamSoft\Models\PrintShopProduct\PrintShopGroup;
use DreamSoft\Models\Product\ProductCategory;
use DreamSoft\Models\Product\Category;
use DreamSoft\Models\Seo\MetaTag;
use DreamSoft\Models\Upload\UploadFile;
use DreamSoft\Controllers\Components\CategoriesAssistant;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\User\UserOption;

/**
 * Description of ProductCategories
 *
 * @author Rafał
 */
class CategoriesController extends Controller
{

    public $useModels = array();

    /**
     * @var ProductCategory
     */
    private $ProductCategory;
    /**
     * @var Category
     */
    private $Category;
    /**
     * @var CategoryLang
     */
    private $CategoryLang;
    /**
     * @var MetaTag
     */
    private $MetaTag;
    /**
     * @var PrintShopType
     */
    private $PrintShopType;
    /**
     * @var PrintShopGroup
     */
    private $PrintShopGroup;
    /**
     * @var Setting
     */
    private $Setting;
    /**
     * @var UploadFile
     */
    private $UploadFile;
    /**
     * @var Uploader
     */
    private $Uploader;
    /**
     * @var UserOption
     */
    private $UserOption;
    /**
     * @var UserDiscountGroup
     */
    private $UserDiscountGroup;
    /**
     * @var DiscountGroupLang
     */
    private $DiscountGroupLang;
    /**
     * @var PromotionCalculation
     */
    private $PromotionCalculation;
    /**
     * @var Promotion
     */
    private $Promotion;
    /**
     * @var Standard
     */
    private $Standard;
    /**
     * @var string
     */
    protected $iconFolder;
    /**
     * @var CategoriesAssistant
     */
    protected $CategoriesAssistant;


    /**
     * CategoriesController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->ProductCategory = ProductCategory::getInstance();
        $this->Category = Category::getInstance();
        $this->CategoryLang = CategoryLang::getInstance();
        $this->MetaTag = MetaTag::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopGroup = PrintShopGroup::getInstance();
        $this->Setting = Setting::getInstance();
        $this->UploadFile = UploadFile::getInstance();
        $this->UserOption = UserOption::getInstance();
        $this->Uploader = Uploader::getInstance();
        $this->UserDiscountGroup = UserDiscountGroup::getInstance();
        $this->DiscountGroupLang = DiscountGroupLang::getInstance();
        $this->Promotion = Promotion::getInstance();
        $this->PromotionCalculation = new PromotionCalculation();
        $this->iconFolder = 'uploadedFiles/' . companyID . '/icons/';
        $this->Standard = Standard::getInstance();
        $this->Setting->setModule('general');
        $this->CategoryLang = CategoryLang::getInstance();
        $this->CategoriesAssistant = CategoriesAssistant::getInstance();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->Category->setDomainID($domainID);
        $this->ProductCategory->setDomainID($domainID);
        $this->Setting->setDomainID($domainID);
        $this->CategoriesAssistant->setDomainID($domainID);
    }

    /**
     * @param null $ID
     * @return array
     */
    public function index($ID = NULL)
    {

        $result = array();
        if (intval($ID) > 0) {
            $result = $this->Category->get('ID', $ID);
            $result = $this->prepareLanguages($result);
        } else {
            $data = $this->Category->getAll(NULL, 'all');

            if ($data) {
                $iconsIDs = array();
                $aggregateDiscountGroups = array();
                foreach ($data as $key => $row) {
                    if ($row['iconID']) {
                        $iconsIDs[] = $row['iconID'];
                    }
                    if ($row['discountGroupID']) {
                        $aggregateDiscountGroups[] = $row['discountGroupID'];
                    }
                    if (strlen($row['langs'])) {
                        unset($data[$key]['langs']);
                        $exp1 = explode("||", $row['langs']);
                        foreach ($exp1 as $oneLang) {
                            $exp2 = explode("::", $oneLang);
                            $data[$key]['langs'][$exp2[0]]['url'] = $exp2[1];
                            $data[$key]['langs'][$exp2[0]]['name'] = $exp2[2];
                            if ( array_key_exists(3, $exp2) && $exp2[3]) {
                                $data[$key]['icons'][$exp2[0]] = $exp2[3];
                            }

                        }
                    } else {
                        unset($data[$key]['langs']);
                    }
                }

                $icons = $this->UploadFile->getFileByList($iconsIDs);

                if ($icons) {
                    foreach ($icons as $key => $icon) {
                        $icons[$key]['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
                    }
                }

                $discountGroupNames = $this->DiscountGroupLang->getNames($aggregateDiscountGroups);

                foreach ($data as $key => $row) {
                    if ($row['parentID'] == 0) {
                        $result[$row['ID']] = $row;
                        $result[$row['ID']]['childs'] = array();
                        if ($row['iconID']) {
                            $result[$row['ID']]['icon'] = $icons[$row['iconID']];
                        }
                        if ($row['discountGroupID']) {
                            $result[$row['ID']]['discountGroupNames'] = $discountGroupNames[$row['discountGroupID']];
                        }
                        unset($data[$key]);
                    } else if ($row['parentID'] > 0) {
                        $result[$row['parentID']]['childs'][$row['ID']] = $row;

                        $metaData = $this->MetaTag->getByElemID('subcatID', $row['ID']);
                        if (!empty($metaData)) {
                            $metaArray = array();
                            foreach ($metaData as $md) {
                                $metaArray[$md['lang']] = $md;
                            }
                            $result[$row['parentID']]['childs'][$row['ID']]['metatags'] = $metaArray;
                        }
                        if ($row['iconID']) {
                            $result[$row['parentID']]['childs'][$row['ID']]['icon'] = $icons[$row['iconID']];
                        }
                        if ($row['discountGroupID']) {
                            $result[$row['parentID']]['childs'][$row['ID']]['discountGroupNames'] = $discountGroupNames[$row['discountGroupID']];
                        }
                    }
                }

                foreach ($result as $key => $row) {
                    sort($result[$key]['childs']);
                }

                foreach ($result as $key => $r) {
                    $metaData = $this->MetaTag->getByElemID('catID', $r['ID']);
                    if (!empty($metaData)) {
                        $metaArray = array();
                        foreach ($metaData as $md) {
                            $metaArray[$md['lang']] = $md;
                        }

                        $result[$key]['metatags'] = $metaArray;
                    }
                }

                $result = $this->Standard->sortData($result, 'sort');
            }
        }

        if (empty($result)) {
            $result = array();
        }
        return $result;
    }

    /**
     * @param $item
     * @return mixed
     */
    private function prepareLanguages($item)
    {
        $languages = $this->CategoryLang->get('categoryID', $item['ID'], true);

        $item['names'] = NULL;

        if (!$languages) {
            return $item;
        }

        foreach ($languages as $language) {
            $item['names'][$language['lang']] = $language['name'];
        }

        return $item;
    }

    /**
     * @return array
     */
    public function post_index()
    {
        $active = $this->Data->getPost('active');
        $post = $this->Data->getAllPost();
        $created = date('Y-m-d H:i:s');
        $parentID = $this->Data->getPost('parentID');
        $metaTags = $this->Data->getPost('metatags');
        $discountGroupID = $this->Data->getPost('discountGroupID');
        $onMainPage = $this->Data->getPost('onMainPage');

        if (!$discountGroupID) {
            $discountGroupID = NULL;
        }

        if ($onMainPage == NULL) {
            $onMainPage = 0;
        }

        $iconID = $this->Data->getPost('iconID');
        if (!$parentID) {
            $parentID = 0;
        }

        $sort = intval($this->Category->getMaxSort($parentID)) + 1;

        $response = false;

        if ($active === NULL) {
            $active = 1;
        }

        $domainID = $this->Category->getDomainID();

        $exist = false;
        $invalidSlugs = array();

        if (!empty($post['langs'])) {
            foreach ($post['langs'] as $lang => $value) {
                $checkUrl = $value['url'];
                if (empty($value['url'])) {
                    $checkUrl = $value['name'];
                }
                $exist = $this->CategoryLang->existOne($checkUrl, $domainID, $lang);
                if ($exist['categoryID'] > 0) {
                    $invalidSlugs[] = $exist['slug'];
                }
            }

            if (!empty($invalidSlugs)) {
                return array('invalidSlugs' => $invalidSlugs, 'response' => false);
            }
        }

        $lastID = $this->Category->create(compact('domainID', 'active', 'created', 'parentID', 'sort', 'iconID', 'discountGroupID', 'onMainPage'));

        $countSaved = 0;
        if ($lastID) {

            if (!empty($post['langs'])) {
                foreach ($post['langs'] as $lang => $value) {
                    $countSaved += intval($this->CategoryLang->set($lastID, $lang, $value['name'], $value['url']));
                }
            }
            if (!empty($post['icons'])) {
                foreach ($post['icons'] as $lang => $value) {
                    $res = intval($this->CategoryLang->set($lastID, $lang, NULL, NULL, $value));
                    if (!$res) {
                        $return = $this->sendFailResponse('09');
                        return $return;
                    }
                }
            }

            if (!empty($metaTags)) {
                $return['metatags'] = array();
                foreach ($metaTags as $lang => $meta) {
                    if ($parentID > 0) {
                        $elem = 'subcatID';
                    } else {
                        $elem = 'catID';
                    }
                    $title = $meta['title'];
                    $keywords = $meta['keywords'];
                    $description = $meta['description'];

                    $metaData = $this->MetaTag->set($lang, $elem, $lastID, $title, $keywords, $description);
                    $metaLast = $this->MetaTag->getByID($metaData);
                    $return['metatags'][$metaLast[0]['lang']] = $metaLast[0];
                }
            }

            $response = true;
        }

        $return = $this->Category->get('ID', $lastID);

        if ($iconID) {
            $return['icon'] = $this->UploadFile->getFileByID($iconID);
        }

        if (!$return) {
            return $this->sendFailResponse('03');
        } else {
            $return['langs'] = $this->CategoryLang->getForCategory($lastID);
            $return['icons'] = $this->CategoryLang->getIconForCategory($lastID);
            $return['discountGroupNames'] = $this->DiscountGroupLang->getNamesForOne($return['discountGroupID']);
            if ($return['parentID'] == 0) {
                $return['childs'] = array();
            }
        }
        return array('item' => $return, 'response' => $response, 'langSaved' => $countSaved);
    }

    /**
     * @return mixed
     */
    public function put_index()
    {
        $post = $this->Data->getAllPost();
        $metatags = $post['metatags'];
        $goodKeys = array(
            'name',
            'active',
            'langs',
            'parentID',
            'metatags',
            'icons',
            'discountGroupID',
            'onMainPage'
        );

        if ($post['parentID'] > 0) {
            $elem = 'subcatID';
        } else {
            $elem = 'catID';
        }
        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }

        $langsUpdated = 0;

        $domainID = $this->Category->getDomainID();

        $exist = false;
        $invalidSlugs = array();
        if (!empty($post['langs'])) {
            foreach ($post['langs'] as $lang => $value) {
                $exist = $this->CategoryLang->existOne($value['url'], $domainID, $lang);
                if ($exist && $exist['categoryID'] > 0 && $exist['categoryID'] != $ID) {
                    $invalidSlugs[] = $exist['slug'];
                }
            }

            if (!empty($invalidSlugs)) {
                return array('invalidSlugs' => $invalidSlugs, 'response' => false);
            }
        }

        foreach ($post as $key => $value) {
            if (!in_array($key, $goodKeys)) {
                continue;
            }
            if ($key == 'langs') {
                foreach ($value as $lang => $val) {
                    $langsUpdated += intval($this->CategoryLang->set($ID, $lang, $val['name'], $val['url'], NULL));
                }
            } elseif ($key == 'metatags') {
                if (!empty($metatags)) {

                    $clear = $this->MetaTag->removeByElemID($elem, $ID);
                    foreach ($metatags as $lang => $m) {
                        $res = $this->MetaTag->set($lang, $elem, $ID, $m['title'], $m['keywords'], $m['description']);
                        if (!$res) {
                            $return = $this->sendFailResponse('09');
                            return $return;
                        }
                    }
                }
            } elseif ($key == 'icons') {
                foreach ($value as $lang => $val) {
                    if (!empty($post['icons'])) {
                        $res = $this->CategoryLang->set($ID, $lang, NULL, NULL, $val);
                        if (!$res) {
                            $return = $this->sendFailResponse('09');
                            return $return;
                        }
                    }
                }
            } else {
                if($key == 'onMainPage') {
                    $value = intval($value);
                }
                $this->Category->update($ID, $key, $value);
            }
        }
        $return['response'] = true;
        $return['langsUpdated'] = $langsUpdated;
        $item = $this->Category->get('ID', $ID);

        $metaAct = $this->MetaTag->getByElemID($elem, $ID);
        if (!empty($metaAct)) {
            $metaArray = array();
            foreach ($metaAct as $md) {
                $metaArray[$md['lang']] = $md;
            }
            $data[$key]['metatags'] = $metaArray;
        }
        $item['metatags'] = $metaArray;
        if (!empty($item)) {
            $item['langs'] = $this->CategoryLang->getForCategory($ID);
            $item['icons'] = $this->CategoryLang->getIconForCategory($ID);
            $item['discountGroupNames'] = $this->DiscountGroupLang->getNamesForOne($item['discountGroupID']);
            $return['item'] = $item;
        }
        return $return;
    }

    /**
     * @param $params
     * @return mixed
     */
    public function delete_index($params)
    {
        $ID = $params['ID'];
        $data['response'] = false;
        $data['ID'] = $ID;
        $parentID = $params['parentID'];
        if ($parentID > 0) {
            $elem = 'subcatID';
        } else {
            $elem = 'catID';
        }
        if (intval($ID) > 0) {
            if ($this->Category->delete('ID', $ID)) {

                $this->ProductCategory->deleteByCategory($ID, NULL);
                $this->CategoryLang->deleteByCategory($ID);
                $childs = $this->Category->getChilds($ID);

                if (!empty($childs)) {
                    foreach ($childs as $row) {
                        $this->ProductCategory->deleteByCategory($row['ID'], NULL);
                        $this->CategoryLang->deleteByCategory($row['ID']);
                        $this->MetaTag->removeByElemID('subcatID', $row['ID']);
                    }
                }
                $this->Category->delete('parentID', $ID);
                $this->MetaTag->removeByElemID($elem, $ID);
                $data['response'] = true;
            } else {
                $data = $this->sendFailResponse('05');
            }
            return $data;
        } else {
            $data = $this->sendFailResponse('04');
            return $data;
        }
    }

    /**
     * @param $typeID
     * @return array
     */
    public function patch_typeToCategory($typeID)
    {
        $post = $this->Data->getAllPost();
        if (!is_array($post['categories'])) {
            $categories = json_decode($post['categories'], true);
        } else {
            $categories = $post['categories'];
        }

        $this->ProductCategory->deleteByItem($typeID, 2);
        if (empty($categories)) {
            return array('response' => true);
        }
        foreach ($categories as $key => $c) {
            $itemID = $typeID;
            $categoryID = $c;
            $relType = 2;
            $lastID = $this->ProductCategory->create(compact('itemID', 'categoryID', 'relType'));
        }
    }

    /**
     * @param $itemID
     * @param $relType
     */
    public function patch_categoriesToItem($itemID, $relType)
    {
        $post = $this->Data->getAllPost();
        if (!is_array($post['selected'])) {
            $selected = json_decode($post['selected'], true);
        } else {
            $selected = $post['selected'];
        }

        $this->ProductCategory->selectCategories($itemID, $relType, $selected);
    }

    /**
     * @param $groupID
     * @return array|mixed|null
     */
    public function patch_setSelectedToGroup($groupID)
    {
        $post = $this->Data->getAllPost();
        if (!is_array($post)) {
            $post = json_decode($post, true);
        }

        $this->ProductCategory->deleteByItem($groupID, CATEGORY_RELATION_TO_GROUP);

        if (!empty($post)) {
            if (!$this->ProductCategory->selectCategories($groupID, CATEGORY_RELATION_TO_GROUP, $post)) {
                return $this->sendFailResponse('10');
            }
        }

        return $post;
    }

    /**
     * @param $groupID
     * @return array|bool
     */
    public function selectedToGroup($groupID)
    {
        $selected = $this->ProductCategory->getSelected($groupID, CATEGORY_RELATION_TO_GROUP);

        if (!$selected) {
            return array();
        }

        return $selected;
    }

    /**
     * @param $typeID
     * @return array|mixed|null
     */
    public function patch_setSelectedToType($typeID)
    {
        $post = $this->Data->getAllPost();
        if (!is_array($post)) {
            $post = json_decode($post, true);
        }

        $this->ProductCategory->deleteByItem($typeID, CATEGORY_RELATION_TO_TYPE);

        if (!empty($post)) {
            if (!$this->ProductCategory->selectCategories($typeID, CATEGORY_RELATION_TO_TYPE, $post)) {
                return $this->sendFailResponse('10');
            }
        }
        return $post;
    }

    /**
     * @param $typeID
     * @return array|bool
     */
    public function selectedToType($typeID)
    {
        $selected = $this->ProductCategory->getSelected($typeID, CATEGORY_RELATION_TO_TYPE);

        if (!$selected) {
            return array();
        }

        return $selected;
    }

    /**
     * @param null $category
     * @return array
     */
    public function getContains($category = NULL)
    {
        $result = array();

        $categoryID = $this->CategoryLang->getByUrl($category, lang);

        if ($categoryID) {

            $list = $this->ProductCategory->get('categoryID', $categoryID, true);

            if (!$list) {
                return array();
            }
            $aggregateGroups = array();
            $aggregateTypes = array();
            foreach ($list as $key => $value) {
                if ($value['relType'] == 1) {
                    $aggregateGroups[] = $value['itemID'];
                } elseif ($value['relType'] == 2) {
                    $aggregateTypes[] = $value['itemID'];
                }
            }
            $typesRes = $this->PrintShopType->customGetByList($aggregateTypes, true);

            $types = array();
            $iconsIDs = array();
            foreach ($typesRes as $key => $value) {
                if ($value['iconID']) {
                    $iconsIDs[] = $value['iconID'];
                }
                $types[$value['ID']] = $value;
                if ($value['groupID'] && !in_array($value['groupID'], $aggregateGroups)) {
                    $aggregateGroups[] = $value['groupID'];
                }
            }
            $groupsRes = $this->PrintShopGroup->customGetByList($aggregateGroups);
            $groups = array();
            foreach ($groupsRes as $key => $value) {
                if ($value['iconID']) {
                    $iconsIDs[] = $value['iconID'];
                }
                $groups[$value['ID']] = $value;
            }

            $icons = $this->UploadFile->getFileByList($iconsIDs);

            if ($icons) {
                foreach ($icons as $key => $icon) {
                    $icons[$key]['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
                }
            }

            $typePromotions = $this->Promotion->getByTypes($aggregateTypes);
            $typePromotions = $this->PromotionCalculation->filterByTimeGlobal($typePromotions);
            $typePromotions = $this->PromotionCalculation->fillIcons($typePromotions);

            $groupPromotions = $this->Promotion->getByGroups($aggregateGroups);
            $groupPromotions = $this->PromotionCalculation->filterByTimeGlobal($groupPromotions);
            $groupPromotions = $this->PromotionCalculation->fillIcons($groupPromotions);

            foreach ($list as $key => $value) {

                if (!isset($types[$value['itemID']]) && $value['relType'] == 2) {
                    unset($list[$key]);
                    continue;
                }

                if ($groups && array_key_exists($value['itemID'], $groups) && array_key_exists('iconID', $groups[$value['itemID']])
                    && $value['relType'] == 1) {
                    if ($groups[$value['itemID']]['iconID']) {
                        $list[$key]['icon'] = $icons[$groups[$value['itemID']]['iconID']];
                    }
                }


                if ($types && array_key_exists($value['itemID'], $types) && array_key_exists('iconID', $types[$value['itemID']])
                    && $value['relType'] == 2) {
                    if ($types[$value['itemID']]['iconID']) {
                        $list[$key]['icon'] = $icons[$types[$value['itemID']]['iconID']];
                    }
                }

                if ($value['relType'] == 1) {
                    $list[$key]['names'] = $groups[$value['itemID']]['names'];
                    $list[$key]['icons'] = $groups[$value['itemID']]['icons'];
                    $list[$key]['slugs'] = $groups[$value['itemID']]['slugs'];
                    if (array_key_exists($value['itemID'], $groupPromotions) && $groupPromotions[$value['itemID']]) {
                        $list[$key]['promotion'] = $groupPromotions[$value['itemID']];
                    }
                } elseif ($value['relType'] == 2) {
                    $list[$key]['names'] = $types[$value['itemID']]['names'];
                    $list[$key]['slugs'] = $types[$value['itemID']]['slugs'];
                    $list[$key]['icons'] = $types[$value['itemID']]['icons'];
                    $list[$key]['groupID'] = $types[$value['itemID']]['groupID'];
                    $list[$key]['isEditor'] = $types[$value['itemID']]['isEditor'];
                    $list[$key]['isCustomProduct'] = $types[$value['itemID']]['isCustomProduct'];
                    if ($types[$value['itemID']]['groupID']) {
                        $list[$key]['group']['slugs'] = $groups[$types[$value['itemID']]['groupID']]['slugs'];
                    }
                    if (array_key_exists($value['itemID'], $typePromotions) && $typePromotions[$value['itemID']]) {
                        $list[$key]['promotion'] = $typePromotions[$value['itemID']];
                    }
                    if (!array_key_exists('promotion', $list[$key])) {
                        if (array_key_exists($list[$key]['groupID'], $groupPromotions) &&
                            $groupPromotions[$list[$key]['groupID']] &&
                            $groupPromotions[$list[$key]['groupID']]['productTypeID'] == NULL) {
                            $list[$key]['promotion'] = $groupPromotions[$list[$key]['groupID']];
                        }
                    }
                }
            }

            sort($list);

            $result = $list;
        }
        return $result;
    }

    /**
     * @param null $categoryID
     * @return array
     */
    public function getContainsAdmin($categoryID = NULL)
    {
        $result = array();

        if ($categoryID) {

            $list = $this->ProductCategory->get('categoryID', $categoryID, true);

            if (!$list) {
                return array();
            }
            $groupArr = array();
            $typeArr = array();
            foreach ($list as $key => $value) {
                if ($value['relType'] == 1) {
                    $groupArr[] = $value['itemID'];
                } elseif ($value['relType'] == 2) {
                    $typeArr[] = $value['itemID'];
                }
            }
            $typesRes = $this->PrintShopType->customGetByList($typeArr);
            $types = array();
            foreach ($typesRes as $key => $value) {
                $types[$value['ID']] = $value;
            }
            $groupsRes = $this->PrintShopGroup->customGetByList($groupArr);
            $groups = array();
            foreach ($groupsRes as $key => $value) {
                $groups[$value['ID']] = $value;
            }

            $removeNotActive = array();

            foreach ($list as $key => $value) {

                if ($value['relType'] == 1) {
                    if ($groups[$value['itemID']]['active'] == 0) {
                        $removeNotActive[] = $key;
                        continue;
                    }
                    $list[$key]['names'] = $groups[$value['itemID']]['names'];
                    $list[$key]['description'] = $groups[$value['itemID']]['description'];
                } elseif ($value['relType'] == 2) {
                    if ($types[$value['itemID']]['active'] == 0) {
                        $removeNotActive[] = $key;
                        continue;
                    }
                    $list[$key]['names'] = $types[$value['itemID']]['names'];
                    $list[$key]['description'] = $types[$value['itemID']]['description'];
                }
            }

            if ($removeNotActive) {
                foreach ($removeNotActive as $keyToRemove) {
                    unset($list[$keyToRemove]);
                }
            }

            $result = $this->Standard->sortData($list, 'sort');
        }
        return $result;
    }

    /**
     * @return bool
     */
    public function getParents()
    {

        $result = $this->Category->getParents();

        $data = array();
        if ($result) {
            foreach ($result as $key => $row) {
                if (strlen($row['langs'])) {
                    unset($result[$key]['langs']);
                    $exp1 = explode("||", $row['langs']);
                    foreach ($exp1 as $oneLang) {
                        $exp2 = explode("::", $oneLang);
                        $result[$key]['langs'][$exp2[0]]['url'] = $exp2[1];
                        $result[$key]['langs'][$exp2[0]]['name'] = $exp2[2];
                    }
                } else {
                    unset($result[$key]['langs']);
                }
            }
            foreach ($result as $row) {
                $data[$row['ID']] = $row;
            }
        }

        return $result;
    }

    /**
     * @param null $active
     * @return array
     */
    public function forView($active = NULL)
    {
        return $this->prepareForView($active, 'all');
    }

    public function forViewPublic($active = NULL)
    {
        $loggedUser = $this->Auth->getLoggedUser();
        $discountGroups = $this->UserDiscountGroup->get('userID', $loggedUser['ID'], true);

        $aggregateDiscountGroups = array();

        foreach ($discountGroups as $discountGroup) {
            $aggregateDiscountGroups[] = $discountGroup['discountGroupID'];
        }

        return $this->prepareForView($active, $aggregateDiscountGroups);
    }

    /**
     * @param $active
     * @param $discountGroups
     * @return array
     */
    private function prepareForView($active, $discountGroups)
    {
        $data = $this->Category->getAll($active, $discountGroups);
        $result = array();
        $iconsIDs = array();
        if ($data) {
            foreach ($data as $key => $row) {
                if ($row['iconID']) {
                    $iconsIDs[] = $row['iconID'];
                }
                if (strlen($row['langs'])) {
                    unset($data[$key]['langs']);
                    $exp1 = explode("||", $row['langs']);
                    foreach ($exp1 as $oneLang) {
                        $exp2 = explode("::", $oneLang);
                        $data[$key]['langs'][$exp2[0]]['url'] = $exp2[1];
                        $data[$key]['langs'][$exp2[0]]['name'] = $exp2[2];
                        if (array_key_exists(3, $exp2)) {
                            $data[$key]['icons'][$exp2[0]] = $exp2[3];
                        }
                    }
                } else {
                    unset($data[$key]['langs']);
                }
            }

            $icons = $this->UploadFile->getFileByList($iconsIDs);

            if ($icons) {
                foreach ($icons as $key => $icon) {
                    $icons[$key]['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
                }
            }

            foreach ($data as $key => $val) {
                if ($val['iconID']) {
                    $val['icon'] = $icons[$val['iconID']];
                }
                if ($val['parentID'] == 0) {
                    $result[$val['ID']] = $val;
                }
            }

            foreach ($data as $key => $val) {
                if ($val['iconID']) {
                    $val['icon'] = $icons[$val['iconID']];
                }
                if ($val['parentID'] > 0 && isset($result[$val['parentID']]['active'])
                    && intval($result[$val['parentID']]['active']) > 0
                ) {
                    $result[$val['parentID']]['childs'][$val['ID']] = $val;
                }
            }
        }
        sort($result);
        return $result;
    }

    /**
     * @param $categoryURL
     * @return mixed
     */
    public function oneForView($categoryURL)
    {
        $categoryID = $this->CategoryLang->getByUrl($categoryURL, lang);

        return  $this->prepareCategoryForView($categoryID);
    }

    /**
     * @param string $list
     * @return array
     */
    public function manyForView($list = '')
    {
        if (strlen($list) == 0) {
            return array();
        }

        $products = $this->ProductCategory->getFromList(explode(',', $list));

        if (empty($products)) {
            return array();
        }

        if (!$products) {
            return array();
        }
        $aggregateGroups = array();
        $aggregateTypes = array();
        foreach ($products as $key => $value) {
            if ($value['relType'] == 1) {
                $aggregateGroups[] = $value['itemID'];
            } elseif ($value['relType'] == 2) {
                $aggregateTypes[] = $value['itemID'];
            }
        }

        $typesRes = $this->PrintShopType->customGetByList($aggregateTypes, true);
        $types = array();
        $iconsIDs = array();
        foreach ($typesRes as $key => $value) {
            if ($value['iconID']) {
                $iconsIDs[] = $value['iconID'];
            }
            $types[$value['ID']] = $value;
            if ($value['groupID'] && !in_array($value['groupID'], $aggregateGroups)) {
                $aggregateGroups[] = $value['groupID'];
            }
        }
        $groupsRes = $this->PrintShopGroup->customGetByList($aggregateGroups);
        $groups = array();
        foreach ($groupsRes as $key => $value) {
            if ($value['iconID']) {
                $iconsIDs[] = $value['iconID'];
            }
            $groups[$value['ID']] = $value;
        }

        $icons = $this->UploadFile->getFileByList($iconsIDs);

        if ($icons) {
            foreach ($icons as $key => $icon) {
                $icons[$key]['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
            }
        }

        $groupPromotions = $this->Promotion->getByGroups($aggregateGroups);
        $groupPromotions = $this->PromotionCalculation->filterByTimeGlobal($groupPromotions);
        $groupPromotions = $this->PromotionCalculation->fillIcons($groupPromotions);

        $typePromotions = $this->Promotion->getByTypes($aggregateTypes);
        $typePromotions = $this->PromotionCalculation->filterByTimeGlobal($typePromotions);
        $typePromotions = $this->PromotionCalculation->fillIcons($typePromotions);

        $result = array();

        foreach ($products as $key => $value) {

            if ($value['relType'] == 1) {
                if (isset($groups[$value['itemID']])) {
                    $one = $groups[$value['itemID']];
                    if ($one['iconID'] && array_key_exists($one['iconID'], $icons) ) {
                        $one['icon'] = $icons[$one['iconID']];
                    }
                    $one['sort'] = $value['sort'];
                    $one['relType'] = $value['relType'];
                    if (array_key_exists($value['itemID'], $groupPromotions)) {
                        $one['promotion'] = $groupPromotions[$value['itemID']];
                    }
                    $result[$value['categoryID']][] = $one;
                }

            } elseif ($value['relType'] == 2) {
                if (isset($types[$value['itemID']])) {
                    $one = $types[$value['itemID']];
                    if ($one['iconID']) {
                        $one['icon'] = $icons[$one['iconID']];
                    }
                    if ($one['groupID']) {
                        $one['group'] = $groups[$one['groupID']];
                    }
                    $one['sort'] = $value['sort'];
                    $one['relType'] = $value['relType'];
                    if (array_key_exists($value['itemID'], $typePromotions)) {
                        $one['promotion'] = $typePromotions[$value['itemID']];
                    }
                    if (!isset($one['promotion'])) {
                        if (array_key_exists($one['groupID'], $groupPromotions) &&
                            $groupPromotions[$one['groupID']]['productTypeID'] == NULL) {
                            $one['promotion'] = $groupPromotions[$one['groupID']];
                        }
                    }
                    $result[$value['categoryID']][] = $one;
                }

            }
        }

        return $result;
    }

    /**
     * @return mixed
     */
    public function patch_sort()
    {
        $post = $this->Data->getAllPost();
        try {
            $response = $this->Category->sort($post);
        } catch (Exception $ex) {
            $response = false;
            $return['error'] = $ex->getMessage();
        }

        $return['response'] = $response;
        return $return;
    }

    /**
     * @return mixed
     */
    public function patch_sortItems()
    {
        $post = $this->Data->getAllPost();
        try {
            $response = $this->ProductCategory->sort($post);
        } catch (Exception $ex) {
            $response = false;
            $return['error'] = $ex->getMessage();
        }

        $return['response'] = $response;
        return $return;
    }

    /**
     * @param $relType
     * @return array|bool
     */
    public function categoryContains($relType)
    {
        $result = $this->ProductCategory->contains($relType);
        if ($result) {
            foreach ($result as $key => $row) {
                if (strlen($row['langs'])) {
                    unset($result[$key]['langs']);
                    $exp1 = explode("||", $row['langs']);
                    foreach ($exp1 as $oneLang) {
                        $exp2 = explode("::", $oneLang);
                        $result[$key]['langs'][$exp2[0]]['url'] = $exp2[1];
                        $result[$key]['langs'][$exp2[0]]['name'] = $exp2[2];
                    }
                } else {
                    unset($result[$key]['langs']);
                }
            }
        }

        if (!$result) {
            return array();
        }

        return $result;
    }

    /**
     * @return array
     */
    public function getCategoryTree()
    {
        $visible = $this->Setting->getValue('menuLeft');

        $menuType = $this->Setting->getValue('menuType');

        if (!$menuType) {
            $menuType = 1;
        }

        $data = $this->CategoriesAssistant->getCategoryByUserDiscount();

        $result = array();

        if ($data) {

            $categoriesBox = array();
            $iconsIDs = array();
            foreach ($data as $key => $row) {
                if ($row['iconID']) {
                    $iconsIDs[] = $row['iconID'];
                }
                $categoriesBox[] = $row['ID'];
                unset($data[$key]['langs']);
                $data = $this->CategoriesAssistant->parseLang($data, $key, $row['langs']);
            }

            $icons = $this->UploadFile->getFileByList($iconsIDs);

            if ($icons) {
                foreach ($icons as $key => $icon) {
                    $icons[$key]['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
                }
            }

            $result = $this->CategoriesAssistant->setParentItemsWithIcons($data, $result, $icons);
            foreach ($data as $key => $row) {
                if ($row['parentID'] == 0) {
                    unset($data[$key]);
                }
            }

            $itemsInRelationBox = $this->CategoriesAssistant->getItemsInRelation($categoriesBox);
            $types = $itemsInRelationBox['types'];
            $groups = $itemsInRelationBox['groups'];
            $itemsInRelation = $itemsInRelationBox['itemsInRelation'];

            $aggregateGroupsForTypes = $this->CategoriesAssistant->getAggregateGroupsForTypes($types);

            $typesForGroup = $this->CategoriesAssistant->getTypesForGroup($groups);

            $typesForGroupWithKey = array();
            if ($typesForGroup) {
                foreach ($typesForGroup as $type) {
                    $typesForGroupWithKey[$type['groupID']][] = $type;
                    if (!in_array($type['groupID'], $aggregateGroupsForTypes)) {
                        $aggregateGroupsForTypes[] = $type['groupID'];
                    }
                }
            }

            $groupsForTypes = $this->CategoriesAssistant->getGroupForTypes($aggregateGroupsForTypes);

            $types = $this->CategoriesAssistant->addSlugToTypes($types, $groupsForTypes);

            if ($typesForGroup) {
                foreach ($typesForGroupWithKey as $groupID => $groupTypes) {
                    foreach ($groupTypes as $keyType => $type) {
                        if ($groupsForTypes[$type['groupID']]) {
                            $typesForGroupWithKey[$groupID][$keyType]['group']['slugs'] = $groupsForTypes[$type['groupID']]['slugs'];
                        }
                    }
                }
            }

            foreach ($groups as $key => $group) {
                $groups[$key]['types'] = $typesForGroupWithKey[$group['ID']];
            }

            $result = $this->CategoriesAssistant->doAggregateGroups($itemsInRelation, $result, $data, $groups);
            $result = $this->CategoriesAssistant->doAggregateTypes($itemsInRelation, $result, $data, $types);
        }

        sort($result);
        return array(
            'items' => $result,
            'visible' => $visible,
            'menuType' => $menuType
        );
    }

    /**
     * @param $categoryURL
     * @return array|bool
     */
    public function getChilds($categoryURL)
    {
        $categoryID = $this->CategoryLang->getByUrl($categoryURL, lang);

        $one = $this->Category->getOne($categoryID);

        if (!$one) {
            return array();
        }

        $loggedUser = $this->Auth->getLoggedUser();
        $discountGroups = $this->UserDiscountGroup->get('userID', $loggedUser['ID'], true);

        $aggregateDiscountGroups = array();

        if ($discountGroups) {
            foreach ($discountGroups as $discountGroup) {
                $aggregateDiscountGroups[] = $discountGroup['discountGroupID'];
            }
        }

        $children = $this->Category->getInfoChilds($one['ID'], $aggregateDiscountGroups);
        if (empty($children)) {
            return array();
        }

        foreach ($children as $key => $child) {
            if (strlen($child['langs'])) {
                unset($children[$key]['langs']);
                $children = $this->CategoriesAssistant->parseLang($children, $key, $child);
            } else {
                unset($children[$key]['langs']);
            }
        }

        return $children;
    }

    /**
     * @return mixed
     */
    public function post_uploadIcon()
    {
        $response['response'] = false;
        $categoryID = $this->Data->getPost('categoryID');

        $maxID = $this->UploadFile->getMaxID();
        $dirNumber = floor($maxID / 100);
        $filename = $_FILES['file']['name'];
        $destFolder = $this->iconFolder . '/' . $dirNumber . '/';

        $category = $this->Category->get('ID', $categoryID);

        $one = $this->UploadFile->get('ID', $category['iconID']);

        if ($this->Uploader->remove($this->iconFolder, $one['path'])) {
            $this->UploadFile->delete('ID', $one['ID']);
        }

        $destIconPath = MAIN_UPLOAD . $destFolder;

        if (!is_dir($destIconPath)) {
            mkdir($destIconPath, 0755, true);
            chmod($destIconPath, 0755);
        }

        if (is_file($destIconPath . $filename)) {
            $nameParts = explode('.', $filename);
            for ($i = 1; ; $i++) {
                $newFileName = $nameParts[0] . '_' . $i . '.' . $nameParts[1];
                if (!is_file($destIconPath . $newFileName)) {
                    $filename = $newFileName;
                    break;
                }
            }
        }

        $res = $this->Uploader->upload($_FILES, 'file', $destFolder, $filename);

        if ($res) {
            $lastID = $this->UploadFile->setUpload($filename, 'categoryIcon', $dirNumber . '/' . $filename);

            $this->Category->update($category['ID'], 'iconID', $lastID);

            $icon = $this->UploadFile->get('ID', $lastID);

            if ($icon) {
                $icon['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
                $response['icon'] = $icon;
                $response['item'] = $category;
                $response['response'] = true;
            }

        }
        return $response;
    }

    /**
     * @param $categoryID
     * @return mixed
     */
    public function delete_uploadIcon($categoryID)
    {
        $data['response'] = false;
        $category = $this->Category->get('ID', $categoryID);

        $one = $this->UploadFile->get('ID', $category['iconID']);

        if ($this->Uploader->remove($this->iconFolder, $one['path'])) {
            $data['response'] = $this->UploadFile->delete('ID', $one['ID']);
            $this->Category->update($category['ID'], 'iconID', NULL);
        }

        return $data;
    }

    /**
     *
     */
    public function getGroups()
    {
        $allGroups = $this->ProductCategory->getGroups();

        $aggregateGroups = array();
        $groupInCategory = array();
        foreach ($allGroups as $ag) {
            if (isset($groupInCategory[$ag['categoryID']])) {
                $groupInCategory[$ag['categoryID']][] = $ag['itemID'];
            } else {
                $groupInCategory[$ag['categoryID']] = array();
                $groupInCategory[$ag['categoryID']][] = $ag['itemID'];
            }
            $aggregateGroups[] = $ag['itemID'];
        }

        $allTypes = $this->PrintShopType->getTypesByGroupList($aggregateGroups);
        $aggregateTypes = array();
        foreach ($allTypes as $groupID => $groupTypes) {
            foreach ($groupTypes as $typeID) {
                $aggregateTypes[] = $typeID;
            }
        }

        $groups = $this->PrintShopGroup->customGetByList($aggregateGroups);
        $types = $this->PrintShopType->customGetByList($aggregateTypes);

        foreach ($groups as $keyGroup => $oneGroup) {
            $groups[$keyGroup]['types'] = array();
            foreach ($allTypes[$oneGroup['ID']] as $typeID) {
                if ( array_key_exists($typeID, $types) ) {
                    $groups[$keyGroup]['types'][] = $types[$typeID];
                }
            }
        }

        $results = array();
        foreach ($groupInCategory as $categoryID => $categoryGroups) {
            foreach ($categoryGroups as $groupID) {
                if ( array_key_exists($groupID, $groups) ) {
                    $results[$categoryID] = $groups[intval($groupID)];
                }
            }
        }

        return $results;
    }

    /**
     * @param $typeID
     * @return array|bool
     */
    public function getFirstByType($typeID)
    {
        $aggregateCategories = $this->ProductCategory->getSelected($typeID, REL_TYPE_TYPE);

        if( !empty($aggregateCategories) ) {
            $firstCategoryID = current($aggregateCategories);
        } else {

            $typeEntity = $this->PrintShopType->get('ID', $typeID);

            if( !$typeEntity ) {
                return $this->sendFailResponse('06');
            }

            $aggregateCategories = $this->ProductCategory->getSelected($typeEntity['groupID'], REL_TYPE_GROUP);

            $firstCategoryID = current($aggregateCategories);

        }

        return  $this->prepareCategoryForView($firstCategoryID);
    }

    private function prepareCategoryForView($categoryID)
    {
        $data = $this->Category->getOne($categoryID);

        if (intval($data['discountGroupID']) > 0) {
            $loggedUser = $this->Auth->getLoggedUser();
            $discountGroups = $this->UserDiscountGroup->get('userID', $loggedUser['ID'], true);

            $aggregateDiscountGroups = array();

            foreach ($discountGroups as $discountGroup) {
                $aggregateDiscountGroups[] = $discountGroup['discountGroupID'];
            }

            if (!in_array($data['discountGroupID'], $aggregateDiscountGroups)) {
                $data = $this->sendFailResponse('12');
                return $data;
            }
        }

        if (!$data) {
            $data = $this->sendFailResponse('06');
        } else {

            if ($data['iconID']) {
                $data['icon'] = $this->UploadFile->get('ID', $data['iconID']);
                $data['icon']['url'] = STATIC_URL . $this->iconFolder . $data['icon']['path'];
            }

            if (strlen($data['langs'])) {
                $exp1 = explode("||", $data['langs']);
                unset($data['langs']);
                foreach ($exp1 as $oneLang) {
                    $exp2 = explode("::", $oneLang);
                    $data['langs'][$exp2[0]]['url'] = $exp2[1];
                    $data['langs'][$exp2[0]]['name'] = $exp2[2];
                }
            }
        }
        return $data;
    }

}
