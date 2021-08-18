<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-04-2018
 * Time: 10:07
 */

namespace DreamSoft\Controllers\Components;

use DreamSoft\Models\PrintShopProduct\PrintShopAttributeName;
use DreamSoft\Models\PrintShopProduct\PrintShopProductAttributeSetting;
use DreamSoft\Models\PrintShopProduct\PrintShopCustomFormat;
use DreamSoft\Models\PrintShopProduct\PrintShopFormatLanguage;
use DreamSoft\Models\PrintShopProduct\PrintShopFormatName;
use DreamSoft\Models\PrintShopProduct\PrintShopFormat;
use DreamSoft\Models\PrintShopProduct\PrintShopFormatVolume;
use DreamSoft\Models\PrintShopProduct\PrintShopIncrease;
use DreamSoft\Models\PrintShopProduct\PrintShopOptionFormat;
use DreamSoft\Models\PrintShopProduct\PrintShopOption;
use DreamSoft\Models\PrintShopProduct\PrintShopPageName;
use DreamSoft\Models\PrintShopProduct\PrintShopPage;
use DreamSoft\Models\PrintShopProduct\PrintShopPrintType;
use DreamSoft\Models\PrintShop\PrintShopRealizationTimeDetail;
use DreamSoft\Models\PrintShopProduct\PrintShopStaticPrice;
use DreamSoft\Models\PrintShopProduct\PrintShopTooltip;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeLanguage;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeTax;
use DreamSoft\Models\PrintShopProduct\PrintShopVolume;
use DreamSoft\Core\Component;

class ProductTypeCopy extends Component
{
    /**
     * @var PrintShopType
     */
    private $PrintShopType;
    /**
     * @var PrintShopAttributeName
     */
    private $PrintShopAttributeName;
    /**
     * @var PrintShopProductAttributeSetting
     */
    private $PrintShopProductAttributeSetting;
    /**
     * @var PrintShopFormat
     */
    private $PrintShopFormat;
    /**
     * @var PrintShopFormatLanguage
     */
    private $PrintShopFormatLanguage;
    /**
     * @var PrintShopFormatName
     */
    private $PrintShopFormatName;
    /**
     * @var PrintShopFormatVolume
     */
    private $PrintShopFormatVolume;
    /**
     * @var PrintShopIncrease
     */
    private $PrintShopIncrease;
    /**
     * @var PrintShopOption
     */
    private $PrintShopOption;
    /**
     * @var PrintShopOptionFormat
     */
    private $PrintShopOptionFormat;
    /**
     * @var PrintShopCustomFormat
     */
    private $PrintShopCustomFormat;
    /**
     * @var PrintShopPageName
     */
    private $PrintShopPageName;
    /**
     * @var PrintShopPage
     */
    private $PrintShopPage;
    /**
     * @var PrintShopPrintType
     */
    private $PrintShopPrintType;
    /**
     * @var PrintShopRealizationTimeDetail
     */
    private $PrintShopRealizationTimeDetail;
    /**
     * @var PrintShopStaticPrice
     */
    private $PrintShopStaticPrice;
    /**
     * @var PrintShopTooltip
     */
    private $PrintShopTooltip;
    /**
     * @var PrintShopTypeLanguage
     */
    private $PrintShopTypeLanguage;
    /**
     * @var PrintShopTypeTax
     */
    private $PrintShopTypeTax;
    /**
     * @var PrintShopVolume
     */
    private $PrintShopVolume;


    private $formatsConversion = array();
    private $volumesConversion = array();

    public function __construct()
    {
        parent::__construct();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopAttributeName = PrintShopAttributeName::getInstance();
        $this->PrintShopProductAttributeSetting = PrintShopProductAttributeSetting::getInstance();
        $this->PrintShopFormat = PrintShopFormat::getInstance();
        $this->PrintShopFormatLanguage = PrintShopFormatLanguage::getInstance();
        $this->PrintShopFormatName = PrintShopFormatName::getInstance();
        $this->PrintShopIncrease = PrintShopIncrease::getInstance();
        $this->PrintShopOption = PrintShopOption::getInstance();
        $this->PrintShopOptionFormat = PrintShopOptionFormat::getInstance();
        $this->PrintShopCustomFormat = PrintShopCustomFormat::getInstance();
        $this->PrintShopPageName = PrintShopPageName::getInstance();
        $this->PrintShopPage = PrintShopPage::getInstance();
        $this->PrintShopPrintType = PrintShopPrintType::getInstance();
        $this->PrintShopRealizationTimeDetail = PrintShopRealizationTimeDetail::getInstance();
        $this->PrintShopStaticPrice = PrintShopStaticPrice::getInstance();
        $this->PrintShopTooltip = PrintShopTooltip::getInstance();
        $this->PrintShopTypeLanguage = PrintShopTypeLanguage::getInstance();
        $this->PrintShopTypeTax = PrintShopTypeTax::getInstance();
        $this->PrintShopVolume = PrintShopVolume::getInstance();
        $this->PrintShopFormatVolume = PrintShopFormatVolume::getInstance();
    }

    /**
     * @param $oldFormatID
     * @param $newFormatID
     */
    public function setFormatConversion($oldFormatID, $newFormatID)
    {
        $this->formatsConversion[] = array(
            'oldFormatID' => $oldFormatID,
            'newFormatID' => $newFormatID
        );
    }

    /**
     * @return array
     */
    public function getFormatsConversion()
    {
        return $this->formatsConversion;
    }

    /**
     * @param $oldFormatID
     * @return bool|array
     */
    public function searchFormatConversion($oldFormatID)
    {
        if (!$this->formatsConversion) {
            return false;
        }

        foreach ($this->formatsConversion as $key => $conversion) {
            if ($conversion['oldFormatID'] == $oldFormatID) {
                return $this->formatsConversion[$key];
            }
        }

        return false;
    }

    /**
     * @param $oldVolumeID
     * @param $newVolumeID
     */
    public function setVolumeConversion($oldVolumeID, $newVolumeID)
    {
        $this->volumesConversion[] = compact(
            'oldVolumeID',
            'newVolumeID'
        );
    }

    /**
     * @return array
     */
    public function getVolumesConversion()
    {
        return $this->volumesConversion;
    }

    /**
     * @param $oldVolumeID
     * @return bool|mixed
     */
    public function searchVolumeConversion($oldVolumeID)
    {
        if (!$this->volumesConversion) {
            return false;
        }

        foreach ($this->volumesConversion as $key => $conversion) {
            if ($conversion['oldVolumeID'] == $oldVolumeID) {
                return $this->volumesConversion[$key];
            }
        }

        return false;
    }

    public function copy($typeID)
    {
        $originalType = $this->PrintShopType->get('ID', $typeID);

        if( $originalType['complex'] == 1 ) {
            $this->debug('Cant copy complex product');
            return false;
        }

        $copiedType = $this->typeCopy($originalType);

        if (!$copiedType) {
            $this->debug('Copy type problem');
            return false;
        }

        $data = array(
            'response' => true
        );

        $data['attributeNamesCopied'] = $this->attributeNamesCopy($typeID, $copiedType['ID']);
        $data['attributeSettingsCopied'] = $this->attributeSettingsCopy($typeID, $copiedType['ID']);
        $data['formats'] = $this->formatsCopy($originalType, $copiedType);
        $data['pagesCopied'] = $this->pagesCopy($originalType, $copiedType['ID']);
        $data['optionsCopied'] = $this->optionsCopy($originalType, $copiedType);
        $data['formatNamesCopied'] = $this->formatNamesCopy($typeID, $copiedType['ID']);
        $data['volumesCopied'] = $this->volumesCopy($originalType, $copiedType);
        $data['formatVolumesCopied'] = $this->formatVolumesCopy($originalType);
        $data['increasesCopied'] = $this->increasesCopy($originalType, $copiedType);
        $data['pageNameCopiedID'] = $this->pageNameCopy($originalType, $copiedType['ID']);
        $data['realizationTimeDetailsCopied'] = $this->realizationTimeDetailsCopy($originalType, $copiedType['ID']);
        $data['tooltipsCopied'] = $this->tooltipsCopy($originalType, $copiedType['ID']);
        $data['languagesCopied'] = $this->languagesCopy($originalType, $copiedType['ID']);
        $data['taxesCopied'] = $this->taxesCopy($originalType, $copiedType['ID']);

        return $data;
    }

    /**
     * @param $originalType
     * @return bool|string
     */
    private function typeCopy($originalType)
    {
        $paramsToCopy = $originalType;
        unset($paramsToCopy['ID']);
        $paramsToCopy['name'] = $paramsToCopy['name'] . ' COPY';

        $copyID = $this->PrintShopType->parentCreate($paramsToCopy);
        if (!$copyID) {
            return false;
        }

        return $this->PrintShopType->get('ID', $copyID);
    }

    /**
     * @param $typeID
     * @param $newTypeID
     * @return int
     */
    private function attributeNamesCopy($typeID, $newTypeID)
    {
        $attributeNames = $this->PrintShopAttributeName->getByType($typeID);

        $attributeNamesCopied = 0;
        if($attributeNames){
            foreach ($attributeNames as $attributeName) {
                $paramsToCopy = $attributeName;
                unset($paramsToCopy['ID']);
                $paramsToCopy['typeID'] = $newTypeID;
                $lastID = $this->PrintShopAttributeName->create($paramsToCopy);
                if ($lastID > 0) {
                    $attributeNamesCopied++;
                }
            }
        }
        return $attributeNamesCopied;
    }

    /**
     * @param $typeID
     * @param $newTypeID
     * @return int
     */
    private function attributeSettingsCopy($typeID, $newTypeID)
    {
        $attributeSettings = $this->PrintShopProductAttributeSetting->get('typeID', $typeID, true);
        $attributeSettingCopied = 0;
        foreach ($attributeSettings as $attributeSetting) {
            $paramsToCopy = $attributeSetting;
            unset($paramsToCopy['ID']);
            $paramsToCopy['typeID'] = $newTypeID;
            $lastID = $this->PrintShopProductAttributeSetting->create($paramsToCopy);
            if ($lastID > 0) {
                $attributeSettingCopied++;
            }
        }

        return $attributeSettingCopied;
    }

    /**
     * @param $originalType
     * @param $newType
     * @return array
     */
    private function formatsCopy($originalType, $newType)
    {
        $this->PrintShopFormat->setGroupID($originalType['groupID']);
        $this->PrintShopFormat->setTypeID($originalType['ID']);
        $formats = $this->PrintShopFormat->getAll();

        $formatsCopied = 0;
        $formatLanguagesCopied = 0;
        $formatIncreasesCopied = 0;
        $customFormatsCopied = 0;
        $printTypesCopied = 0;
        $staticPricesCopied = 0;
        foreach ($formats as $format) {
            $paramsToCopy = $this->PrintShopFormat->parentGet('ID' ,$format['ID']);
            unset($paramsToCopy['ID']);
            $paramsToCopy['typeID'] = $newType['ID'];
            $paramsToCopy['groupID'] = $newType['groupID'];
            $lastID = $this->PrintShopFormat->parentCreate($paramsToCopy);
            if ($lastID > 0) {
                $newFormat = $this->PrintShopFormat->customGet($lastID);
                $formatLanguagesCopied = $this->formatLanguagesCopy($format, $lastID);

                $formatIncreasesCopied = $this->formatIncreasesCopy($format, $newFormat);
                $this->setFormatConversion($format['ID'], $newFormat['ID']);
                $customFormatsCopied = $this->customFormatsCopy($format, $lastID);
                $printTypesCopied = $this->printTypeCopy($format, $lastID);
                $staticPricesCopied = $this->staticPricesCopy($format, $newFormat);
                $formatsCopied++;
            }
        }

        return compact(
            'formatsCopied',
            'formatLanguagesCopied',
            'formatIncreasesCopied',
            'customFormatsCopied',
            'printTypesCopied',
            'staticPricesCopied'
        );

    }

    /**
     * @param $originalFormat
     * @param $newFormatID
     * @return int
     */
    private function formatLanguagesCopy($originalFormat, $newFormatID)
    {
        $formatLanguages = $this->PrintShopFormatLanguage->get('formatID', $originalFormat['ID'], true);

        $formatLanguagesCopied = 0;
        foreach ($formatLanguages as $formatLanguage) {
            $paramsToCopy = $formatLanguage;
            unset($paramsToCopy['ID']);
            $paramsToCopy['formatID'] = $newFormatID;
            $lastID = $this->PrintShopFormatLanguage->create($paramsToCopy);
            if ($lastID > 0) {
                $formatLanguagesCopied++;
            }
        }

        return $formatLanguagesCopied;
    }

    /**
     * @param $typeID
     * @param $newTypeID
     * @return int
     */
    private function formatNamesCopy($typeID, $newTypeID)
    {
        $formatNames = $this->PrintShopFormatName->getByType($typeID);

        $formatNamesCopied = 0;
        foreach ($formatNames as $formatName) {
            $paramsToCopy = $formatName;
            unset($paramsToCopy['ID']);
            $paramsToCopy['typeID'] = $newTypeID;
            $lastID = $this->PrintShopFormatName->create($paramsToCopy);
            if ($lastID > 0) {
                $formatNamesCopied++;
            }
        }

        return $formatNamesCopied;
    }

    /**
     * @param $originalType
     * @return int
     */
    private function formatVolumesCopy($originalType)
    {
        $oldFormats = $this->PrintShopFormat->parentGet('typeID', $originalType['ID'], true);
        $aggregateFormats = array();

        foreach ($oldFormats as $oldFormat) {
            $aggregateFormats[] = $oldFormat['ID'];
        }

        $formatVolumes = $this->PrintShopFormatVolume->getByFormatList($aggregateFormats);

        $formatVolumesCopied = 0;
        foreach ($formatVolumes as $formatVolume) {
            $formatConversion = $this->searchFormatConversion($formatVolume['formatID']);
            $params['formatID'] = $formatConversion['newFormatID'];
            $volumeConversion = $this->searchVolumeConversion($formatVolume['volumeID']);
            $params['volumeID'] = $volumeConversion['newVolumeID'];
            $lastID = $this->PrintShopFormatVolume->create($params);
            if( $lastID > 0 ) {
                $formatVolumesCopied++;
            }
        }

        return $formatVolumesCopied;
    }

    /**
     * @param $originalFormat
     * @param $newFormat
     * @return int
     */
    private function formatIncreasesCopy($originalFormat, $newFormat)
    {
        $formatIncreases = $this->PrintShopIncrease->get('formatID', $originalFormat['ID'], true);
        $formatIncreasesCopied = 0;
        foreach ($formatIncreases as $formatIncrease) {
            $this->PrintShopIncrease->setGroupID($formatIncrease['groupID']);
            $this->PrintShopIncrease->setTypeID($newFormat['typeID']);
            $lastID = $this->PrintShopIncrease->customCreate(
                $formatIncrease['amount'],
                $formatIncrease['value'],
                $formatIncrease['type'],
                $newFormat['ID']
            );
            if ($lastID > 0) {
                $formatIncreasesCopied++;
            }
        }

        return $formatIncreasesCopied;
    }

    /**
     * @param $originalType
     * @param $newType
     * @return int
     */
    private function increasesCopy($originalType, $newType)
    {
        $increases = $this->PrintShopIncrease->get('typeID', $originalType['ID'], true);
        $increasesCopied = 0;
        foreach ($increases as $increase) {
            if( $increase['formatID'] !== NULL ) {
                continue;
            }
            $this->PrintShopIncrease->setGroupID($newType['groupID']);
            $this->PrintShopIncrease->setTypeID($newType['ID']);
            $lastID = $this->PrintShopIncrease->customCreate(
                $increase['amount'],
                $increase['value'],
                $increase['type']
            );
            if ($lastID > 0) {
                $increasesCopied++;
            }
        }

        return $increasesCopied;
    }

    /**
     * @param $optionID
     * @param $newOptionID
     * @return int
     */
    private function formatOptionsCopy($optionID, $newOptionID)
    {
        $formatOptions = $this->PrintShopOptionFormat->get('productOptionID', $optionID, true);

        $formatOptionsCopied = 0;

        foreach ($formatOptions as $formatOption) {
            $params['productOptionID'] = $newOptionID;
            $formatConversion = $this->searchFormatConversion($formatOption['formatID']);
            $params['formatID'] = $formatConversion['newFormatID'];
            $lastID = $this->PrintShopOptionFormat->create($params);
            if ($lastID > 0) {
                $formatOptionsCopied++;
            }
        }

        return $formatOptionsCopied;
    }

    /**
     * @param $originalType
     * @param $newType
     * @return int
     */
    private function optionsCopy($originalType, $newType)
    {
        $options = $this->PrintShopOption->getByParams(
            $originalType['groupID'],
            $originalType['ID']
        );
        $optionsCopied = 0;
        $formatOptionsCopied = 0;

        foreach ($options as $option) {

            $this->PrintShopOption->setGroupID($newType['groupID']);
            $this->PrintShopOption->setTypeID($newType['ID']);

            $lastID = $this->PrintShopOption->customCreate(
                $option['attrID'],
                $option['optID']
            );

            if ($lastID > 0) {
                $this->PrintShopOption->update($lastID, 'invisible', $option['invisible']);
                $this->PrintShopOption->update($lastID, 'default', $option['default']);
                $optionsCopied++;
                $formatOptionsCopied = $this->formatOptionsCopy($option['ID'], $lastID);
            }
        }

        return compact(
            'optionsCopied',
            'formatOptionsCopied'
        );

    }

    /**
     * @param $oldFormat
     * @param $newFormatID
     * @return int
     */
    private function customFormatsCopy($oldFormat, $newFormatID)
    {
        $customFormats = $this->PrintShopCustomFormat->get('formatID', $oldFormat['ID'], true);

        $customFormatsCopied = 0;
        foreach ($customFormats as $customFormat) {
            $paramsToCopy = $customFormat;
            unset($paramsToCopy['ID']);
            $paramsToCopy['formatID'] = $newFormatID;
            $lastID = $this->PrintShopCustomFormat->create($paramsToCopy);
            if ($lastID > 0) {
                $customFormatsCopied++;
            }
        }

        return $customFormatsCopied;
    }

    /**
     * @param $oldType
     * @param $newTypeID
     * @return int
     */
    private function pagesCopy($oldType, $newTypeID)
    {
        $this->PrintShopPage->setGroupID($oldType['groupID']);
        $this->PrintShopPage->setTypeID($oldType['ID']);
        $pages = $this->PrintShopPage->getAll();

        $pagesCopied = 0;

        foreach ($pages as $page) {
            $paramsToCopy = $page;
            unset($paramsToCopy['ID']);
            $paramsToCopy['typeID'] = $newTypeID;
            $lastID = $this->PrintShopPage->parentCreate($paramsToCopy);
            if ($lastID > 0) {
                $pagesCopied++;
            }
        }

        return $pagesCopied;
    }

    /**
     * @param $oldType
     * @param $newTypeID
     * @return bool|string
     */
    private function pageNameCopy($oldType, $newTypeID)
    {
        $pageName = $this->PrintShopPageName->get('typeID', $oldType['ID']);
        if ($pageName) {
            $paramsToCopy = $pageName;
            unset($paramsToCopy['ID']);
            $paramsToCopy['typeID'] = $newTypeID;
            $lastID = $this->PrintShopPageName->create($paramsToCopy);
            if ($lastID > 0) {
                return $lastID;
            }
        }

        return false;
    }

    /**
     * @param $oldFormat
     * @param $newFormatID
     * @return int
     */
    private function printTypeCopy($oldFormat, $newFormatID)
    {
        $printTypes = $this->PrintShopPrintType->get('formatID', $oldFormat['ID'], true);

        $printTypesCopied = 0;

        foreach ($printTypes as $printType) {
            $paramsToCopy = $printType;
            unset($paramsToCopy['ID']);
            $paramsToCopy['formatID'] = $newFormatID;
            $lastID = $this->PrintShopPrintType->create($paramsToCopy);
            if ($lastID > 0) {
                $printTypesCopied++;
            }
        }

        return $printTypesCopied;
    }

    /**
     * @param $oldType
     * @param $newTypeID
     * @return int
     */
    private function realizationTimeDetailsCopy($oldType, $newTypeID)
    {
        $realizationTimeDetails = $this->PrintShopRealizationTimeDetail->get('typeID', $oldType['ID'], true);

        $realizationTimeDetailsCopied = 0;
        foreach ($realizationTimeDetails as $realizationTimeDetail) {
            $paramsToCopy = $realizationTimeDetail;
            unset($paramsToCopy['ID']);
            $paramsToCopy['typeID'] = $newTypeID;
            $lastID = $this->PrintShopRealizationTimeDetail->create($paramsToCopy);
            if ($lastID > 0) {
                $realizationTimeDetailsCopied++;
            }
        }

        return $realizationTimeDetailsCopied;
    }

    /**
     * @param $oldFormat
     * @param $newFormat
     * @return int
     */
    private function staticPricesCopy($oldFormat, $newFormat)
    {
        $this->PrintShopStaticPrice->setGroupID($oldFormat['groupID']);
        $this->PrintShopStaticPrice->setTypeID($oldFormat['typeID']);
        $this->PrintShopStaticPrice->setFormatID($oldFormat['ID']);
        $staticPrices = $this->PrintShopStaticPrice->getAll();
        $staticPricesCopied = 0;
        foreach ($staticPrices as $staticPrice) {
            $this->PrintShopStaticPrice->setGroupID($newFormat['groupID']);
            $this->PrintShopStaticPrice->setTypeID($newFormat['typeID']);
            $this->PrintShopStaticPrice->setFormatID($newFormat['ID']);
            $lastID = $this->PrintShopStaticPrice->create(
                $staticPrice['options'],
                $staticPrices['price'],
                $staticPrices['expense']
            );
            if ($lastID > 0) {
                $staticPricesCopied++;
            }
        }

        return $staticPricesCopied;
    }

    /**
     * @param $oldType
     * @param $newTypeID
     * @return int
     */
    private function tooltipsCopy($oldType, $newTypeID)
    {
        $tooltips = $this->PrintShopTooltip->get('typeID', $oldType['ID'], true);

        $tooltipsCopied = 0;

        foreach ($tooltips as $tooltip) {
            $paramsToCopy = $tooltip;
            unset($paramsToCopy['ID']);
            $paramsToCopy['typeID'] = $newTypeID;
            $lastID = $this->PrintShopTooltip->create($paramsToCopy);
            if ($lastID > 0) {
                $tooltipsCopied++;
            }
        }

        return $tooltipsCopied;
    }

    /**
     * @param $oldType
     * @param $newTypeID
     * @return int
     */
    private function languagesCopy($oldType, $newTypeID)
    {
        $languages = $this->PrintShopTypeLanguage->get('typeID', $oldType['ID'], true);
        $languagesCopied = 0;

        foreach ($languages as $language) {
            $paramsToCopy = $language;
            unset($paramsToCopy['ID']);
            $paramsToCopy['typeID'] = $newTypeID;
            $paramsToCopy['name'] .=' COPY';
            $paramsToCopy['slug'] .='-COPY';
            $lastID = $this->PrintShopTypeLanguage->create($paramsToCopy);
            if ($lastID > 0) {
                $languagesCopied++;
            }
        }

        return $languagesCopied;
    }

    /**
     * @param $oldType
     * @param $newTypeID
     * @return int
     */
    private function taxesCopy($oldType, $newTypeID)
    {
        $taxes = $this->PrintShopTypeTax->get('typeID', $oldType['ID'], true);
        $taxesCopied = 0;
        foreach ($taxes as $tax) {
            $paramsToCopy = $tax;
            unset($paramsToCopy['ID']);
            $paramsToCopy['typeID'] = $newTypeID;
            $lastID = $this->PrintShopTypeTax->create($paramsToCopy);
            if ($lastID > 0) {
                $taxesCopied++;
            }
        }

        return $taxesCopied;
    }

    /**
     * @param $oldType
     * @param $newType
     * @return int
     */
    private function volumesCopy($oldType, $newType) {
        $volumes = $this->PrintShopVolume->get('typeID', $oldType['ID'], true);
        $volumesCopied = 0;

        foreach ($volumes as $volume) {
            if( $volume['format'] !== NULL ) {
                continue;
            }
            $this->PrintShopVolume->setGroupID($newType['groupID']);
            $this->PrintShopVolume->setTypeID($newType['ID']);
            $this->PrintShopVolume->setFormatID(NULL);
            $lastID = $this->PrintShopVolume->create($volume['volume']);
            if( $lastID > 0 ) {
                $this->setVolumeConversion($volume['ID'], $lastID);
                $this->PrintShopVolume->update($lastID, 'invisible', $volume['invisible']);
                $volumesCopied++;
            }
        }

        return $volumesCopied;
    }
}
