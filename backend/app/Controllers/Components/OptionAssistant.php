<?php

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopProductAttributeSetting;
use DreamSoft\Models\PrintShopProduct\PrintShopOptionDelivery;
use DreamSoft\Models\PrintShopProduct\PrintShopTooltip;
use DreamSoft\Models\PrintShopProduct\PrintShopAttributeName;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\Upload\UploadFile;
use DreamSoft\Models\PrintShopProduct\PrintShopFormatName;
use DreamSoft\Models\PrintShopProduct\PrintShopPageName;

/**
 * Class OptionAssistant
 * @package DreamSoft\Controllers\Components
 */
class OptionAssistant extends Component
{
    /**
     * @var PrintShopType
     */
    private $PrintShopType;
    /**
     * @var PrintShopProductAttributeSetting
     */
    private $PrintShopProductAttributeSetting;
    /**
     * @var PrintShopOptionDelivery
     */
    private $PrintShopOptionDelivery;
    /**
     * @var PrintShopTooltip
     */
    private $PrintShopTooltip;
    /**
     * @var PrintShopAttributeName
     */
    private $PrintShopAttributeName;
    /**
     * @var LangSetting
     */
    private $LangSetting;
    /**
     * @var UploadFile
     */
    private $UploadFile;
    /**
     * @var PrintShopFormatName
     */
    private $PrintShopFormatName;
    /**
     * @var PrintShopPageName
     */
    private $PrintShopPageName;
    /**
     * @var string
     */
    private $iconFolder;

    /**
     * OptionAssistant constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopProductAttributeSetting = PrintShopProductAttributeSetting::getInstance();
        $this->PrintShopOptionDelivery = PrintShopOptionDelivery::getInstance();
        $this->PrintShopTooltip = PrintShopTooltip::getInstance();
        $this->PrintShopAttributeName = PrintShopAttributeName::getInstance();
        $this->LangSetting = LangSetting::getInstance();
        $this->UploadFile = UploadFile::getInstance();
        $this->PrintShopFormatName = PrintShopFormatName::getInstance();
        $this->PrintShopPageName = PrintShopPageName::getInstance();
        $this->iconFolder = 'uploadedFiles/' . companyID . '/icons/';
    }

    public function setDomainID($domainID)
    {
        $this->LangSetting->setDomainID($domainID);
    }

    /**
     * @param $typeID
     * @return array
     */
    public function getSelectOptions($typeID)
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

        if( $options ) {

            foreach ($options as $attrID => $attrOptions) {
                foreach ($attrOptions as $keyOption => $option) {
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

        $pageTooltip = NULL;
        if( array_key_exists(-2, $tooltips) ) {
            $pageTooltip = $tooltips[-2];
        }

        $attributes[] = array(
            'attrID' => -2,
            'tooltip' => $pageTooltip,
            'customName' => $customPageName
        );

        $formatTooltip = NULL;
        if(array_key_exists(-1, $tooltips)) {
            $formatTooltip = $tooltips[-1];
        }
        $attributes[] = array(
            'attrID' => -1,
            'tooltip' => $formatTooltip,
            'customName' => $customFormatName
        );

        foreach ($list as $key => $val) {
            $attributeTooltip = NULL;
            if( array_key_exists($val['attrID'], $tooltips) ) {
                $attributeTooltip = $tooltips[$val['attrID']];
            }
            $attributeOptions = NULL;
            if( array_key_exists($val['attrID'], $options) ) {
                $attributeOptions = $options[$val['attrID']];
            }
            $oneAttributeSettings = NULL;
            if( array_key_exists($val['attrID'], $attributeSettings) ) {
                $oneAttributeSettings = $attributeSettings[$val['attrID']];
            }
            $attributes[] = array(
                'attrID' => $val['attrID'],
                'attrName' => $val['attrName'],
                'attrSort' => $val['attrSort'],
                'minPages' => $val['minPages'],
                'step' => $val['step'],
                'maxPages' => $val['maxPages'],
                'tooltip' => $attributeTooltip,
                'options' => $attributeOptions,
                'names' => $val['langs'],
                'selectByPicture' => intval($oneAttributeSettings['selectByPicture'])
            );
        }
        return $attributes;
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


}