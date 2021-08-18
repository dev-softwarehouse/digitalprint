<?php

use DreamSoft\Controllers\Components\Delete;
use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\PrintShopProduct\PrintShopAttributeName;
use DreamSoft\Models\PrintShopProduct\PrintShopProductAttributeSetting;
use DreamSoft\Models\PrintShopProduct\PrintShopFormatName;
use DreamSoft\Models\PrintShopProduct\PrintShopPageName;
use DreamSoft\Models\Discount\UserDiscountGroup;
use DreamSoft\Models\PrintShopProduct\PrintShopTooltip;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeLanguage;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeTax;
use DreamSoft\Controllers\Components\ProductTypeCopy;
use DreamSoft\Models\Promotion\Promotion;
use DreamSoft\Controllers\Components\PromotionCalculation;
use DreamSoft\Models\PrintShopProduct\PrintShopOptionDelivery;
use DreamSoft\Models\PrintShopProduct\PrintShopGroup;
use DreamSoft\Models\Product\ProductCategory;
use DreamSoft\Models\Product\Category;
use DreamSoft\Models\Behaviours\ProductManipulation;
use DreamSoft\Models\Seo\MetaTag;
use DreamSoft\Models\Tax\Tax;
use DreamSoft\Models\Upload\UploadFile;
use DreamSoft\Models\PrintShopProduct\PrintShopGroupLanguage;
use DreamSoft\Models\PrintShopProduct\PrintShopStaticPrice;
use DreamSoft\Core\Controller;


/**
 * Description of TypesController
 *
 * @author Rafał
 */
class TypesController extends Controller
{

    public $useModels = array();

    /**
     * @var PrintShopType
     */
    protected $PrintShopType;
    /**
     * @var PrintShopGroupLanguage
     */
    protected $PrintShopGroupLanguage;
    /**
     * @var PrintShopTypeLanguage
     */
    protected $PrintShopTypeLanguage;
    /**
     * @var PrintShopTooltip
     */
    protected $PrintShopTooltip;
    /**
     * @var Tax
     */
    protected $Tax;
    /**
     * @var PrintShopTypeTax
     */
    protected $PrintShopTypeTax;
    /**
     * @var MetaTag
     */
    protected $MetaTag;
    /**
     * @var UploadFile
     */
    protected $UploadFile;
    /**
     * @var Uploader
     */
    protected $Uploader;
    /**
     * @var ProductCategory
     */
    protected $ProductCategory;
    /**
     * @var LangSetting
     */
    protected $LangSetting;
    /**
     * @var PrintShopAttributeName
     */
    protected $PrintShopAttributeName;
    /**
     * @var PrintShopFormatName
     */
    protected $PrintShopFormatName;
    /**
     * @var PrintShopPageName
     */
    protected $PrintShopPageName;
    /**
     * @var Category
     */
    protected $Category;
    /**
     * @var PrintShopProductAttributeSetting
     */
    protected $PrintShopProductAttributeSetting;
    /**
     * @var PrintShopGroup
     */
    protected $PrintShopGroup;
    /**
     * @var UserDiscountGroup
     */
    protected $UserDiscountGroup;
    /**
     * @var ProductTypeCopy
     */
    protected $ProductTypeCopy;
    /**
     * @var Promotion
     */
    private $Promotion;
    /**
     * @var PromotionCalculation
     */
    private $PromotionCalculation;
    /**
     * @var PrintShopOptionDelivery
     */
    private $PrintShopOptionDelivery;
    /**
     * @var string
     */
    protected $iconFolder;
    /**
     * @var ProductManipulation
     */
    private $ProductManipulation;
    /**
     * @var PrintShopStaticPrice
     */
    private $PrintShopStaticPrice;
    /**
     * @var Delete
     */
    private $Delete;

    /**
     * TypesController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopTypeLanguage = PrintShopTypeLanguage::getInstance();
        $this->PrintShopGroupLanguage = PrintShopGroupLanguage::getInstance();
        $this->PrintShopTooltip = PrintShopTooltip::getInstance();
        $this->Tax = Tax::getInstance();
        $this->PrintShopTypeTax = PrintShopTypeTax::getInstance();
        $this->MetaTag = MetaTag::getInstance();
        $this->UploadFile = UploadFile::getInstance();
        $this->ProductCategory = ProductCategory::getInstance();
        $this->LangSetting = LangSetting::getInstance();
        $this->PrintShopAttributeName = PrintShopAttributeName::getInstance();
        $this->PrintShopFormatName = PrintShopFormatName::getInstance();
        $this->PrintShopPageName = PrintShopPageName::getInstance();
        $this->Category = Category::getInstance();
        $this->PrintShopProductAttributeSetting = PrintShopProductAttributeSetting::getInstance();
        $this->UserDiscountGroup = UserDiscountGroup::getInstance();
        $this->PrintShopGroup = PrintShopGroup::getInstance();
        $this->ProductTypeCopy = new ProductTypeCopy();
        $this->PromotionCalculation = new PromotionCalculation();
        $this->Promotion = Promotion::getInstance();
        $this->PrintShopOptionDelivery = PrintShopOptionDelivery::getInstance();
        $this->ProductManipulation = ProductManipulation::getInstance();
        $this->PrintShopStaticPrice = PrintShopStaticPrice::getInstance();
        $this->Delete = Delete::getInstance();

        $this->Uploader = Uploader::getInstance();
        $this->iconFolder = 'uploadedFiles/' . companyID . '/icons/';
    }

    public function setDomainID($domainID)
    {
        $this->LangSetting->setDomainID($domainID);
        $this->ProductCategory->setDomainID($domainID);
        $this->PrintShopTypeTax->setDomainID($domainID);
        $this->ProductManipulation->setDomainID($domainID);
    }

    /**
     * @param $groupID
     * @param null $ID
     * @return array
     */
    public function types($groupID, $ID = NULL)
    {

        $this->PrintShopType->setGroupID($groupID);

        if (intval($ID) > 0) {
            $data = $this->PrintShopType->get('ID', $ID);
        } else {
            $data = $this->PrintShopType->getAll();

            if (!$data) {
                return array();
            }

            if (!empty($data)) {

                $data = $this->fillTax($data);
                $data = $this->fillIcons($data);
                $data = $this->fillMetaTags($data);
            }
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $types
     * @return mixed
     */
    private function fillTax($types)
    {
        $aggregateTaxes = array();
        foreach ($types as $key => $type) {
            if ($type['taxID'] && !in_array($type['taxID'], $aggregateTaxes)) {
                $aggregateTaxes[] = $type['taxID'];
            }
        }

        if (empty($aggregateTaxes)) {
            return $types;
        }

        $taxes = $this->Tax->customGetByList($aggregateTaxes);
        if (!empty($taxes)) {
            foreach ($types as $key => $type) {
                if ($type['taxID'] && !empty($taxes[$type['taxID']])) {
                    $types[$key]['tax'] = $taxes[$type['taxID']];
                } else {
                    $types[$key]['tax'] = NULL;
                }
            }
        }

        return $types;
    }

    /**
     * @param $types
     * @return mixed
     */
    private function fillMetaTags($types)
    {
        foreach ($types as $key => $type) {
            $metaData = $this->MetaTag->getByElemID('typeID', $type['ID']);
            if (!empty($metaData)) {
                $metaArray = array();
                foreach ($metaData as $md) {
                    $metaArray[$md['lang']] = $md;
                }
                $types[$key]['metaTags'] = $metaArray;
            }
        }

        return $types;
    }

    /**
     * @param $types
     * @return mixed
     */
    private function fillIcons($types)
    {
        $aggregateIcons = array();
        foreach ($types as $key => $type) {
            if ($type['iconID']) {
                $aggregateIcons[] = $type['iconID'];
            }
        }

        $icons = $this->UploadFile->getFileByList($aggregateIcons);

        if ($icons) {
            foreach ($icons as $key => $icon) {
                $icons[$key]['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
            }
        }

        foreach ($types as $key => $type) {
            if ($type['iconID']) {
                $types[$key]['icon'] = $icons[$type['iconID']];
            }
        }

        return $types;
    }

    /**
     * @param $groupID
     * @return mixed
     */
    public function post_types($groupID)
    {
        $this->PrintShopType->setGroupID($groupID);
        $metaTags = $this->Data->getPost('metaTags');
        $name = $this->Data->getPost('name');
        $names = $this->Data->getPost('names');
        $icons = $this->Data->getPost('icons');
        $slugs = $this->Data->getPost('slugs');
        $isEditor = $this->Data->getPost('isEditor');
        $isCustomProduct = $this->Data->getPost('isCustomProduct');
        $changeTechnology = $this->Data->getPost('changeTechnology');
        $turnOnNumberOfSets = $this->Data->getPost('turnOnNumberOfSets');

        $options = array();
        $options['skipUpload'] = $this->Data->getPost('skipUpload');
        $options['complex'] = $this->Data->getPost('complex');

        if ($name || $names) {
            $lastID = $this->PrintShopType->create($name);
            if ($lastID) {
                foreach ($options as $key => $value) {
                    if ($value) {
                        $res = $this->PrintShopType->update($lastID, $key, $value);
                        if (!$res) {
                            $return = $this->sendFailResponse('10');
                            return $return;
                        }
                    }
                }
                if ($isEditor) {
                    $this->PrintShopType->update($lastID, 'isEditor', $isEditor);
                }
                if ($isCustomProduct) {
                    $this->PrintShopType->update($lastID, 'isCustomProduct', $isCustomProduct);
                }
                if ($changeTechnology) {
                    $this->PrintShopType->update($lastID, 'changeTechnology', $changeTechnology);
                }
                if ($turnOnNumberOfSets) {
                    $this->PrintShopType->update($lastID, 'turnOnNumberOfSets', $turnOnNumberOfSets);
                }
            }
            $return = $this->PrintShopType->get('ID', $lastID);
            if (!$return) {
                $return['response'] = false;
                return $return;
            }
            if (!empty($names)) {
                foreach ($names as $lang => $name) {
                    $slug = NULL;
                    if (isset($slugs[$lang]) && !empty($slugs[$lang])) {
                        $slug = $slugs[$lang];
                    }
                    $res = $this->PrintShopTypeLanguage->set($lang, $name, $lastID, $slug);
                    if (!$res) {
                        $return = $this->sendFailResponse('09');
                        return $return;
                    }
                }
            }
            if (!empty($icons)) {
                foreach ($icons as $lang => $desc) {
                    $res = $this->PrintShopTypeLanguage->setDescription($lang, $desc, $lastID);
                    if (!$res) {
                        $return = $this->sendFailResponse('09');
                        return $return;
                    }
                }
            }

            $metaTagsSaved = NULL;
            if (!empty($metaTags)) {
                foreach ($metaTags as $lang => $meta) {
                    $elem = 'typeID';
                    $title = $meta['title'];
                    $keywords = $meta['keywords'];
                    $description = $meta['description'];

                    if ($this->MetaTag->set($lang, $elem, $lastID, $title, $keywords, $description)) {
                        $metaTagsSaved[$lang] = compact('title', 'keywords', 'description');
                    }

                }
            }

            $items = $this->PrintShopType->customGetByList(array($lastID));
            $item = current($items);
            $item['metaTags'] = $metaTagsSaved;
            $return['item'] = $item;
            $return['response'] = true;
            return $return;
        } else {
            $return = $this->sendFailResponse('01');
            return $return;
        }
    }

    /**
     * @param $groupID
     * @return mixed
     */
    public function put_types($groupID)
    {

        $this->PrintShopType->setGroupID($groupID);

        $post = $this->Data->getAllPost();
        $metaTags = $this->Data->getPost('metaTags');
        $names = $post['names'];
        $icons = $post['icons'];
        $slugs = $post['slugs'];
        $post['active'] = intval($post['active']);
        unset($post['names']);
        unset($post['icons']);

        $goodKeys = array('name',
            'active',
            'order',
            'sizePageActive',
            'fotoliaDPI',
            'skipUpload',
            'complex',
            'taxID',
            'cardGuide',
            'icons',
            'isEditor',
            'isCustomProduct',
            'changeTechnology',
            'turnOnNumberOfSets'
        );

        $flagFields = array(
            'active',
            'sizePageActive',
            'skipUpload',
            'complex',
            'isEditor',
            'isCustomProduct',
            'changeTechnology',
            'turnOnNumberOfSets'
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
                $this->PrintShopTypeTax->createFromList($taxesList, $groupID, $ID);
            }

            if (in_array($key, $goodKeys)) {
                if( in_array($key, $flagFields) ) {
                    $value = intval($value);
                }
                $res = $this->PrintShopType->update($ID, $key, $value);
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
                if (isset($slugs[$lang]) && !empty($slugs[$lang])) {
                    $slug = $slugs[$lang];
                }
                $res = $this->PrintShopTypeLanguage->set($lang, $name, $ID, $slug);
                if (!$res) {
                    $return = $this->sendFailResponse('09');
                    return $return;
                }
            }
        }
        if (!empty($icons)) {
            foreach ($icons as $lang => $desc) {
                if ($desc == NULL || strlen($desc) == 0) {
                    $this->PrintShopTypeLanguage->setDescription($lang, NULL, $ID);
                    continue;
                }
                $res = $this->PrintShopTypeLanguage->setDescription($lang, $desc, $ID);
                if (!$res) {
                    $return = $this->sendFailResponse('09');
                    return $return;
                }
            }
        }

        $updatedMetaTags = array();
        if (!empty($metaTags)) {
            $elem = 'typeID';
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
        }

        $items = $this->PrintShopType->customGetByList(array($ID));
        $item = current($items);
        $item['metaTags'] = $updatedMetaTags;
        if (intval($item['iconID']) > 0) {
            $icon = $this->UploadFile->get('ID', $item['iconID']);
            $icon['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
            $item['icon'] = $icon;
        }
        $return['item'] = $item;
        return $return;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return mixed
     */
    public function delete_types($groupID, $typeID)
    {
        if (intval($typeID) > 0) {
            $data = $this->Delete->deleteType($groupID, $typeID);

            if ($data['response'] == true) {
                $this->PrintShopTypeTax->removeByType($typeID);
                $this->MetaTag->removeByElemID('typeID', $typeID);
                $this->ProductCategory->deleteByItem($typeID, 2);
                $this->PrintShopAttributeName->delete('typeID', $typeID);
                $this->PrintShopStaticPrice->delete('typeID', $typeID);
                if (!$this->PrintShopTypeLanguage->delete('typeID', $typeID)) {
                    // @TODO rekursywne usuwanie opisów/plików/makiet
                    $data = $this->sendFailResponse('09');
                    return $data;
                }
            }
            return $data;
        } else {
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @param $groupID
     * @return mixed
     */
    public function patch_sort($groupID)
    {
        $post = $this->Data->getAllPost();
        try {
            $response = $this->PrintShopType->sort($post);
        } catch (Exception $ex) {
            $response = false;
            $return['error'] = $ex->getMessage();
        }

        $return['response'] = $response;
        return $return;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return array
     */
    private function _selectOptions($groupID, $typeID)
    {
        $list = $this->PrintShopType->getAttributes($typeID);

        if (empty($list)) {
            return array();
        }
        $attrArr = array();
        $options = $this->PrintShopType->getOptions($typeID);

        $aggregateOptions = array();
        if( $options ) {

            foreach ($options as $attrID => $attrOptions) {
                foreach ($attrOptions as $keyOption => $option) {
                    $aggregateOptions[] = $option['productOptionID'];
                }
            }

        }

        foreach ($list as $key => $val) {
            $attrArr[] = $val['attrID'];
        }

        $attributeSettings = $this->getAttributeSettings($typeID);
        $optionDeliveries = $this->PrintShopOptionDelivery->getByListOptions($typeID, $aggregateOptions);

        $attrArr[] = -1;
        $attrArr[] = -2;
        $tooltips = $this->PrintShopTooltip->getByAttributes($typeID, $attrArr);

        $customAttributeNames = $this->PrintShopAttributeName->customGetByList($attrArr, $typeID);

        if ($customAttributeNames) {
            foreach ($list as $keyAttr => $attr) {
                if (isset($customAttributeNames[$attr['attrID']]) && !empty($customAttributeNames[$attr['attrID']])) {
                    foreach ($customAttributeNames[$attr['attrID']] as $cLang => $customName) {
                        $list[$keyAttr]['langs'][$cLang]['name'] = $customName;
                    }
                }
            }
        }

        $languages = $this->LangSetting->getAll();

        $exclusionAggregate = array();

        if( $options ) {

            foreach ($options as $attrID => $attrOptions) {
                foreach ($attrOptions as $keyOption => $option) {
                    if( array_key_exists('exclusions', $option) && is_array($option['exclusions'])
                    && !empty($option['exclusions']) ) {
                        $exclusionAggregate = $this->assignExclusions($option['ID'], $option['exclusions'], $exclusionAggregate);
                    }
                    $options[$attrID][$keyOption]['deliveries'] = NULL;
                    if( array_key_exists($option['productOptionID'], $optionDeliveries) ) {
                        $options[$attrID][$keyOption]['deliveries'] = $optionDeliveries[$option['productOptionID']];
                    }
                }
            }

        }

        if ($languages) {
            $activeLanguages = array();
            foreach ($languages as $lang) {
                if ($lang['active'] == 1) {
                    $activeLanguages[] = $lang;
                }
            }

            if (!empty($activeLanguages)) {

                foreach ($list as $keyAttr => $attribute) {
                    foreach ($activeLanguages as $al) {
                        if (!isset($attribute['langs'][$al['code']]) || empty($attribute['langs'][$al['code']])) {
                            $list[$keyAttr]['langs'][$al['code']]['name'] = $attribute['attrName'];
                        }
                    }
                }

                foreach ($options as $attrID => $attrOptions) {
                    foreach ($attrOptions as $keyOption => $option) {
                        foreach ($activeLanguages as $al) {
                            if (!isset($option['names'][$al['code']]) || empty($option['names'][$al['code']])) {
                                $options[$attrID][$keyOption]['names'][$al['code']]['name'] = $option['name'];
                            }
                        }
                    }
                }
            }
        }

        if ($attributeSettings) {

            $aggregateIcons = array();
            foreach ($options as $attrID => $attrOptions) {

                if (isset($attributeSettings[$attrID]) && intval($attributeSettings[$attrID]['selectByPicture']) === 1) {

                    foreach ($attrOptions as $keyOption => $option) {
                        if ($option['iconID']) {
                            $aggregateIcons[] = $option['iconID'];
                        }
                    }

                }
            }

            $optionIconsUnsorted = $this->UploadFile->getFileByList($aggregateIcons);

            $icons = array();
            if ($optionIconsUnsorted) {
                foreach ($optionIconsUnsorted as $icon) {
                    $minFolder = current(explode('/', $icon['path']));
                    $icons[$icon['ID']] = array(
                        'url' => STATIC_URL . $this->iconFolder . $icon['path'],
                        'minUrl' => STATIC_URL . $this->iconFolder . $minFolder . '/' . THUMB_IMAGE_PREFIX . $icon['name']
                    );
                }
            }

            foreach ($options as $attrID => $attrOptions) {
                foreach ($attrOptions as $keyOption => $option) {
                    if (intval($option['iconID']) > 0) {
                        $options[$attrID][$keyOption]['icon'] = $icons[$option['iconID']];
                    }
                }
            }

        }

        $customFormatName = $this->prepareCustomNames(
            $this->PrintShopFormatName->getByType($typeID)
        );
        $customPageName = $this->prepareCustomNames(
            $this->PrintShopPageName->getByType($typeID)
        );

        $attributes = array();

        $pageTooltips = NULL;
        if( is_array($tooltips) && array_key_exists(-2, $tooltips) ) {
            $pageTooltips = $tooltips[-2];
        }

        $attributes[] = array(
            'attrID' => -2,
            'tooltip' => $pageTooltips,
            'customName' => $customPageName
        );

        $formatTooltips = NULL;
        if( is_array($tooltips) && array_key_exists(-1, $tooltips) ) {
            $formatTooltips = $tooltips[-1];
        }

        $attributes[] = array(
            'attrID' => -1,
            'tooltip' => $formatTooltips,
            'customName' => $customFormatName
        );

        $options = $this->filterAggregateExclusions($options, $exclusionAggregate);

        foreach ($list as $key => $val) {

            $prepareAttribute = array(
                'attrID' => $val['attrID'],
                'attrName' => $val['attrName'],
                'attrSort' => $val['attrSort'],
                'minPages' => $val['minPages'],
                'step' => $val['step'],
                'maxPages' => $val['maxPages'],
                'names' => $val['langs']
            );

            $prepareAttribute['tooltip'] = NULL;
            if( is_array($tooltips) && array_key_exists($val['attrID'], $tooltips) ) {
                $prepareAttribute['tooltip'] = $tooltips[$val['attrID']];
            }

            $prepareAttribute['options'] = NULL;
            if( is_array($options) && array_key_exists($val['attrID'], $options) ) {
                $prepareAttribute['options'] = $options[$val['attrID']];
            }

            $prepareAttribute['selectByPicture'] = 0;
            if( $attributeSettings && array_key_exists($val['attrID'], $attributeSettings) &&
            array_key_exists('selectByPicture', $attributeSettings[$val['attrID']]) ) {
                $prepareAttribute['selectByPicture'] = intval($attributeSettings[$val['attrID']]['selectByPicture']);
            }

            $attributes[] = $prepareAttribute;
        }
        return $attributes;
    }

    /**
     * @param $optionID
     * @param $exclusions
     * @param $aggregateExclusions
     * @return mixed
     */
    private function assignExclusions($optionID, $exclusions, $aggregateExclusions)
    {
        if( is_array($exclusions) ) {
            if( array_key_exists($optionID, $aggregateExclusions) ) {
                $aggregateExclusions[$optionID] = array_merge($aggregateExclusions[$optionID], $exclusions);
            } else {
                $aggregateExclusions[$optionID] = $exclusions;
            }
        }

        return $aggregateExclusions;
    }

    /**
     * @param $options
     * @param $exclusionAggregate
     * @return mixed
     */
    private function filterAggregateExclusions($options, $exclusionAggregate)
    {
        foreach ($options as $attrID => $attrOptions) {
            foreach ($attrOptions as $keyOption => $option) {

                if( array_key_exists('excludesOptions', $option) ) {
                    $excludesOptions = $option['excludesOptions'];
                } else {
                    $excludesOptions = array();
                }

                $excludesOptionsMerge = $this->searchOptionInExclusions($option['ID'], $exclusionAggregate);

                $options[$attrID][$keyOption]['excludesOptions'] = array_merge($excludesOptions, $excludesOptionsMerge);
            }
        }

        return $options;
    }

    /**
     * @param $optionID
     * @param $exclusionAggregate
     * @return array
     */
    private function searchOptionInExclusions($optionID, $exclusionAggregate)
    {
        $allExcludesOption = array();
        if( is_array($exclusionAggregate) && !empty($exclusionAggregate)  ) {

            foreach ($exclusionAggregate as $excludesOptionID => $exclusions) {
                foreach ($exclusions as $excludedAttributeID => $optionExclusions) {

                    if( in_array($optionID, $optionExclusions) ) {
                        $allExcludesOption[] = $excludesOptionID;
                    }
                }
            }

            return $allExcludesOption;

        }

        return array();
    }

    /**
     * @param $typeID
     * @return array
     */
    private function getAttributeSettings($typeID)
    {
        $attributeSettingsUnsorted = $this->PrintShopProductAttributeSetting->get('typeID', $typeID, true);
        $attributeSettings = array();
        if ($attributeSettingsUnsorted) {
            foreach ($attributeSettingsUnsorted as $item) {
                $attributeSettings[$item['attrID']] = $item;
            }
        }

        return $attributeSettings;
    }

    /**
     * @param $data
     * @return array
     */
    private function prepareCustomNames($data)
    {
        if (!$data) {
            return array();
        }
        $list = array();
        foreach ($data as $row) {
            $list[$row['lang']] = $row['name'];
        }

        return $list;

    }

    /**
     * @param $groupID
     * @param $typeID
     * @return array
     */
    public function selectedOptions($groupID, $typeID)
    {
        return $this->_selectOptions($groupID, $typeID);
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return array
     */
    public function selectedOptionsPublic($groupID, $typeID)
    {
        return $this->_selectOptions($groupID, $typeID);
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return mixed
     */
    public function patch_typeDescriptions($groupID, $typeID)
    {

        $langs = $this->Data->getPost('langs');
        $return['response'] = false;

        $updated = 0;
        if (!empty($langs)) {
            foreach ($langs as $lang => $desc) {
                $updated += intval($this->PrintShopTypeLanguage->setDesc($lang, $desc, $typeID));
            }
        } else {
            return $this->sendFailResponse('01');
        }

        if ($updated > 0) {
            $return['response'] = true;
        } else {
            return $this->sendFailResponse('10');
        }


        return $return;
    }

    /**
     * @param $groupUrl
     * @return array|bool
     */
    public function forView($groupUrl)
    {

        $groupLangEntity = $this->PrintShopGroupLanguage->getByUrl($groupUrl);

        $groupID = $groupLangEntity['groupID'];

        $this->PrintShopType->setGroupID($groupID);
        $types = $this->PrintShopType->getAll();

        $iconsIDs = array();
        $aggregateTypes = array();
        foreach ($types as $key => $value) {
            if ($value['active'] == 0) {
                unset($types[$key]);
                continue;
            }
            $aggregateTypes[] = $value['ID'];
            if ($value['iconID']) {
                $iconsIDs[] = $value['iconID'];
            }
        }


        $typePromotions = $this->Promotion->getByTypes($aggregateTypes);
        $typePromotions = $this->PromotionCalculation->filterByTimeGlobal($typePromotions);
        $typePromotions = $this->PromotionCalculation->fillIcons($typePromotions);

        $groupPromotions = array();
        if( !$typePromotions ) {
            $groupPromotions = $this->Promotion->getByGroups(array($groupID));
            $groupPromotions = $this->PromotionCalculation->filterByTimeGlobal($groupPromotions);
            $groupPromotions = $this->PromotionCalculation->fillIcons($groupPromotions);
        }

        $icons = $this->UploadFile->getFileByList($iconsIDs);

        if ($icons) {
            foreach ($icons as $key => $icon) {
                $icons[$key]['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
            }
        }

        foreach ($types as $key => $value) {
            if ($value['iconID']) {
                $types[$key]['icon'] = $icons[$value['iconID']];
            }
            if( array_key_exists($value['ID'], $typePromotions) && $typePromotions[$value['ID']] ) {
                $types[$key]['promotion'] = $typePromotions[$value['ID']];
            }
            if( array_key_exists($groupID, $groupPromotions) && $groupPromotions[$groupID] ) {
                $types[$key]['promotion'] = $groupPromotions[$groupID];
            }
        }

        sort($types);
        return $types;
    }

    /**
     * @param $groupUrl
     * @param $typeUrl
     * @return mixed
     */
    public function oneForView($groupUrl, $typeUrl)
    {
        $typeLanguageEntity = $this->PrintShopTypeLanguage->getByUrl($typeUrl);

        if (!$typeLanguageEntity) {
            return $this->sendFailResponse('06');
        }

        $typeEntity = $this->PrintShopType->get('ID', $typeLanguageEntity['typeID']);

        if (!$typeEntity) {
            return $this->sendFailResponse('06');
        }

        $ID = $typeEntity['ID'];

        $this->PrintShopType->setGroupID($typeEntity['groupID']);
        $data = $this->PrintShopType->get('ID', $ID);
        $languages = $this->PrintShopTypeLanguage->get('typeID', $ID, true);

        $category = $this->ProductManipulation->selectCategory($typeEntity['groupID'], $ID);
        $group = $this->PrintShopGroup->customGet($typeEntity['groupID']);

        if (!$data) {
            return $this->sendFailResponse('06');
        } else {
            if (!empty($languages)) {

                foreach ($languages as $key => $value) {
                    $data['names'][$value['lang']] = $value['name'];
                    $data['icons'][$value['lang']] = $value['icon'];
                    $data['slugs'][$value['lang']] = $value['slug'];
                }
            }
            $data['category'] = $category;
            $data['group']['slugs'] = $group['slugs'];
        }
        return $data;
    }

    /**
     * @return mixed
     */
    public function post_uploadIcon()
    {
        $response['response'] = false;
        $typeID = $this->Data->getPost('typeID');

        $maxID = $this->UploadFile->getMaxID();
        $dirNumber = floor($maxID / 100);
        $filename = $_FILES['file']['name'];
        $destFolder = $this->iconFolder . '/' . $dirNumber . '/';

        $type = $this->PrintShopType->get('ID', $typeID);

        $one = $this->UploadFile->get('ID', $type['iconID']);

        if ($this->Uploader->remove($this->iconFolder, $one['path'])) {
            // remove true
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
            $lastID = $this->UploadFile->setUpload($filename, 'groupIcon', $dirNumber . '/' . $filename);

            $this->PrintShopType->update($type['ID'], 'iconID', $lastID);

            $icon = $this->UploadFile->get('ID', $lastID);

            if ($icon) {
                $icon['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
                $response['icon'] = $icon;
                $response['item'] = $type;
                $response['response'] = true;
            }

        }
        return $response;
    }

    /**
     * @param $typeID
     * @return mixed
     */
    public function delete_uploadIcon($typeID)
    {
        $data['response'] = false;
        $group = $this->PrintShopType->get('ID', $typeID);

        $one = $this->UploadFile->get('ID', $group['iconID']);

        if ($this->Uploader->remove($this->iconFolder, $one['path'])) {
            $data['response'] = $this->UploadFile->delete('ID', $one['ID']);
            $this->PrintShopType->update($group['ID'], 'iconID', NULL);
            $data['removed'] = true;
        }

        return $data;
    }

    /**
     * @return array
     */
    public function patch_getTypesData()
    {
        $post = $this->Data->getAllPost();
        $postTypes = $post['types'];

        $types = $this->PrintShopType->customGetByList($postTypes);

        if (!$types) {
            return array();
        }

        $result = array();

        foreach ($types as $type) {
            $result[$type['ID']] = $type;
        }

        return $result;
    }

    /**
     * @param $text
     * @return array|bool
     */
    public function search($text)
    {
        $searchResult = $this->PrintShopType->searchByText(urldecode($text), true);

        if (!$searchResult) {
            return array();
        }

        $aggregateTypes = array();
        foreach ($searchResult as $item) {
            $aggregateTypes[] = $item['ID'];
        }

        $searchResult = $this->fillIcons($searchResult);

        $userDiscountGroups = $this->getUsersDiscountGroups();

        $categories = $this->ProductCategory->getByItemList($aggregateTypes, 2);

        $searchResult = $this->filterTypesByDiscount($userDiscountGroups, $categories, $searchResult);

        $searchResult = $this->filterGroupsByDiscount($userDiscountGroups, $searchResult);

        return $searchResult;
    }

    /**
     * @param $userDiscountGroups
     * @param $categories
     * @param $searchResult
     * @return array
     */
    private function filterTypesByDiscount($userDiscountGroups, $categories, $searchResult)
    {
        $aggregateGroups = array();

        foreach ($searchResult as $item) {
            $aggregateGroups[] = $item['groupID'];
        }

        $groupsRes = $this->PrintShopGroup->customGetByList($aggregateGroups);
        $groups = array();
        foreach ($groupsRes as $key => $value) {
            $groups[$value['ID']] = $value;
        }

        $aggregateKeysToRemove = array();
        foreach ($searchResult as $key => &$item) {

            if ($item['type'] == 1) {
                continue;
            }

            $item['category'] = $categories[$item['ID']];
            if ($item['category']['discountGroupID'] && !in_array($item['category']['discountGroupID'], $userDiscountGroups)) {
                $aggregateKeysToRemove[] = $key;
            }
            $item['group'] = $groups[$item['groupID']];
        }

        foreach ($aggregateKeysToRemove as $keyToRemove) {
            unset($searchResult[$keyToRemove]);
        }

        $searchResult = array_values($searchResult);

        return $searchResult;
    }

    /**
     * @param $userDiscountGroups
     * @param $searchResult
     * @return array
     */
    private function filterGroupsByDiscount($userDiscountGroups, $searchResult)
    {
        $aggregateGroups = array();

        foreach ($searchResult as $item) {
            if ($item['category'] == NULL) {
                $aggregateGroups[] = $item['groupID'];
            }
        }

        $categories = $this->ProductCategory->getByItemList($aggregateGroups, 1);

        $aggregateKeysToRemove = array();
        foreach ($searchResult as $key => &$item) {

            if ($item['type'] == 2) {
                continue;
            }

            if( $categories && !$item['category'] ) {
                $item['category'] = $categories[$item['groupID']];
            }

            if ($item['category']['discountGroupID'] && !in_array($item['category']['discountGroupID'], $userDiscountGroups)) {
                $aggregateKeysToRemove[] = $key;
            }
        }

        foreach ($aggregateKeysToRemove as $keyToRemove) {
            unset($searchResult[$keyToRemove]);
        }

        $searchResult = array_values($searchResult);

        return $searchResult;
    }

    /**
     * @return array
     */
    private function getUsersDiscountGroups()
    {
        $loggedUser = $this->Auth->getLoggedUser();

        $discountGroups = $this->UserDiscountGroup->get('userID', $loggedUser['ID'], true);

        $aggregateDiscountGroups = array();

        foreach ($discountGroups as $discountGroup) {
            $aggregateDiscountGroups[] = $discountGroup['discountGroupID'];
        }

        return $aggregateDiscountGroups;
    }

    /**
     * @param $groupID
     * @return array|bool|mixed
     */
    public function getActiveTypes($groupID)
    {

        $this->PrintShopType->setGroupID($groupID);

        $data = $this->PrintShopType->getAll(true);

        if (!$data) {
            return array();
        }

        $data = $this->fillTax($data);
        $data = $this->fillIcons($data);
        $data = $this->fillMetaTags($data);

        return $data;
    }

    /**
     * @param $typeID
     * @return array|bool
     */
    public function copy($typeID)
    {
        $copyInfo = $this->ProductTypeCopy->copy($typeID);
        if (!$copyInfo) {
            return array('response' => false);
        }

        return $copyInfo;
    }

    /**
     * @param $params
     * @return array|bool
     */
    public function searchAll($params)
    {
        $active = NULL;
        if( array_key_exists('active', $params) ) {
            $active = $params['active'];
        }

        $result = $this->PrintShopType->searchAdmin($params['search'], $params['limit'], $active);

        if( !$result ) {
            return array();
        }

        $result = $this->filterBySelectedLanguage($result);

        return $result;
    }

    /**
     * @param $data
     * @return array
     */
    private function filterBySelectedLanguage($data)
    {

        if( !$data ) {
            return array();
        }

        foreach ($data as $key => $item) {

            $mainLanguages = array();
            foreach ($item['langs'] as $lang => $name) {
                if( $lang == lang ) {
                    $mainLanguages[$lang] = $name;
                }
            }

            $data[$key]['langs'] = $mainLanguages;

        }

        return $data;

    }

    /**
     * @param $groupID
     * @return array|bool
     */
    public function getActiveTypesPublic($groupID)
    {
        return $this->getActiveTypes($groupID);
    }

}
