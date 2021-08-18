<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 11-04-2018
 * Time: 11:15
 */

namespace DreamSoft\Controllers\Components;

use DreamSoft\Models\Discount\UserDiscountGroup;
use DreamSoft\Models\PrintShop\PrintShopFormatPrintType;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigAttribute;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigAttributeRange;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigConnectOption;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigConnectPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigDetailPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigDiscountPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigIncrease;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigOption;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPaperPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPriceList;
use DreamSoft\Models\PrintShopProduct\PrintShopFormat;
use DreamSoft\Models\PrintShopProduct\PrintShopIncrease;
use DreamSoft\Models\PrintShopProduct\PrintShopPage;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigWorkspace;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrintTypeWorkspace;
use DreamSoft\Models\PrintShopProduct\PrintShopPrintTypeWorkspace;
use DreamSoft\Core\Component;
use DreamSoft\Models\Upload\UploadFile;

class CalculateStorage extends Component
{
    public $useModels = array(
        'PrintShopConfigAttribute',
        'PrintShopConfigAttributeRange',
        'PrintShopConfigOption',
        'PrintShopFormatPrintType',
        'PrintShopConfigPriceList',
        'PrintShopConfigPrice',
        'PrintShopConfigDetailPrice',
        'PrintShopConfigIncrease',
        'PrintShopConfigConnectOption',
        'PrintShopConfigPaperPrice',
        'PrintShopConfigConnectPrice',
        'PrintShopConfigDiscountPrice',
    );

    /**
     * @var PrintShopType
     */
    protected $PrintShopType;
    /**
     * @var PrintShopPage
     */
    protected $PrintShopPage;
    /**
     * @var PrintShopConfigAttribute
     */
    protected $PrintShopConfigAttribute;
    /**
     * @var PrintShopConfigAttributeRange
     */
    protected $PrintShopConfigAttributeRange;
    /**
     * @var PrintShopConfigOption
     */
    protected $PrintShopConfigOption;
    /**
     * @var PrintShopFormatPrintType
     */
    protected $PrintShopFormatPrintType;
    /**
     * @var PrintShopFormat
     */
    protected $PrintShopFormat;
    /**
     * @var PrintShopConfigPriceList
     */
    protected $PrintShopConfigPriceList;
    /**
     * @var PrintShopConfigWorkspace
     */
    protected $PrintShopConfigWorkspace;
    /**
     * @var PrintShopConfigPrintTypeWorkspace
     */
    protected $PrintShopConfigPrintTypeWorkspace;
    /**
     * @var PrintShopConfigDetailPrice
     */
    protected $PrintShopConfigDetailPrice;
    /**
     * @var PrintShopIncrease
     */
    protected $PrintShopIncrease;
    /**
     * @var PrintShopConfigIncrease
     */
    protected $PrintShopConfigIncrease;
    /**
     * @var PrintShopConfigConnectOption
     */
    protected $PrintShopConfigConnectOption;
    /**
     * @var PrintShopConfigPaperPrice
     */
    protected $PrintShopConfigPaperPrice;
    /**
     * @var PrintShopConfigConnectPrice
     */
    protected $PrintShopConfigConnectPrice;
    /**
     * @var PrintShopConfigDiscountPrice
     */
    protected $PrintShopConfigDiscountPrice;
    /**
     * @var PrintShopConfigPrice
     */
    protected $PrintShopConfigPrice;
    /**
     * @var UploadFile
     */
    protected $UploadFile;
    /**
     * @var UserDiscountGroup
     */
    protected $UserDiscountGroup;
    /**
     * @var PrintShopPrintTypeWorkspace
     */
    private $PrintShopPrintTypeWorkspace;

    private $types = array();
    private $formats = array();
    private $options = array();
    private $attributes = array();
    private $workspaces = array();
    private $pagesRanges = array();
    private $attributesCluster = array();
    private $optionsCluster = array();
    private $attributeRangesCluster = array();
    private $doublePages = array();
    private $similarPages = array();
    private $printTypesCluster = array();
    private $priceListCluster = array();
    private $iconsCluster = array();
    private $workspacesCluster = array();
    private $printRotatedEntities = array();
    private $increases = array();
    private $configIncreases = array();
    private $configIncreasesCluster = array();
    private $connectOptions = array();
    private $paperPrices = array();
    private $detailPrices = array();
    private $userDiscountGroupsCluster = array();
    private $discountPriceTypesCluster = array();
    private $priceTypesCluster = array();
    private $priceLists = array();
    private $printTypeWorkspaceCluster = array();

    public function __construct()
    {
        parent::__construct();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopPage = PrintShopPage::getInstance();
        $this->PrintShopConfigAttribute = PrintShopConfigAttribute::getInstance();
        $this->PrintShopConfigAttributeRange = PrintShopConfigAttributeRange::getInstance();
        $this->PrintShopConfigOption = PrintShopConfigOption::getInstance();
        $this->PrintShopFormatPrintType = PrintShopFormatPrintType::getInstance();
        $this->PrintShopFormat = PrintShopFormat::getInstance();
        $this->PrintShopConfigPriceList = PrintShopConfigPriceList::getInstance();
        $this->PrintShopConfigPrice = PrintShopConfigPrice::getInstance();
        $this->PrintShopConfigWorkspace = PrintShopConfigWorkspace::getInstance();
        $this->PrintShopConfigPrintTypeWorkspace = PrintShopConfigPrintTypeWorkspace::getInstance();
        $this->PrintShopConfigDetailPrice = PrintShopConfigDetailPrice::getInstance();
        $this->PrintShopIncrease = PrintShopIncrease::getInstance();
        $this->PrintShopConfigIncrease = PrintShopConfigIncrease::getInstance();
        $this->PrintShopConfigConnectOption = PrintShopConfigConnectOption::getInstance();
        $this->PrintShopConfigPaperPrice = PrintShopConfigPaperPrice::getInstance();
        $this->PrintShopConfigConnectPrice = PrintShopConfigConnectPrice::getInstance();
        $this->UploadFile = UploadFile::getInstance();
        $this->UserDiscountGroup = UserDiscountGroup::getInstance();
        $this->PrintShopConfigDiscountPrice = PrintShopConfigDiscountPrice::getInstance();
        $this->PrintShopPrintTypeWorkspace = PrintShopPrintTypeWorkspace::getInstance();
    }

    /**
     * @param $typeID
     * @return bool|array
     */
    public function getType($typeID)
    {
        if (array_key_exists($typeID, $this->types)) {
            return $this->types[$typeID];
        } else {
            $type = $this->PrintShopType->get('ID', $typeID);
            if ($type) {
                $this->types[$typeID] = $type;
                return $type;
            } else {
                $this->debug('Type Not found!', $typeID);
                return false;
            }
        }
    }

    /**
     * @param $formatID
     * @return bool|array
     */
    public function getFormat($formatID)
    {
        if (array_key_exists($formatID, $this->formats)) {
            return $this->formats[$formatID];
        } else {
            $format = $this->PrintShopFormat->customGet($formatID);
            if ($format) {
                $this->formats[$formatID] = $format;
                return $format;
            } else {
                $this->debug('Format Not found!', $formatID);
                return false;
            }
        }
    }

    /**
     * @param $priceListID
     * @return bool|array
     */
    public function getPriceList($priceListID)
    {
        if (array_key_exists($priceListID, $this->priceLists)) {
            return $this->priceLists[$priceListID];
        } else {
            $priceList = $this->PrintShopConfigPriceList->get('ID', $priceListID);
            if ($priceList) {
                $this->priceLists[$priceListID] = $priceList;
                return $priceList;
            } else {
                $this->debug('Price list Not found!', $priceListID);
                return false;
            }
        }
    }

    /**
     * @param $optionID
     * @return array|bool|mixed
     */
    public function getOption($optionID)
    {
        if (array_key_exists($optionID, $this->options)) {
            return $this->options[$optionID];
        } else {
            $option = $this->PrintShopConfigOption->customGet($optionID);
            if ($option) {
                $this->options[$optionID] = $option;
                return $option;
            } else {
                $this->debug('Option Not found!', $optionID);
                return false;
            }
        }
    }

    /**
     * @param $attributeID
     * @return array|bool|mixed
     */
    public function getAttribute($attributeID)
    {
        if (array_key_exists($attributeID, $this->attributes)) {
            return $this->attributes[$attributeID];
        } else {
            $attribute = $this->PrintShopConfigAttribute->customGet($attributeID);
            if ($attribute) {
                $this->attributes[$attributeID] = $attribute;
                return $attribute;
            } else {
                $this->debug('Attribute Not found!', $attributeID);
                return false;
            }
        }
    }

    /**
     * @param $aggregateOptions
     * @return bool
     */
    public function setOptionsByList($aggregateOptions)
    {
        if (!$aggregateOptions) {
            return false;
        }

        $filteredOptions = array();

        foreach ($aggregateOptions as $optionID) {
            if (!array_key_exists($optionID, $this->options)) {
                $filteredOptions[] = $optionID;
            }
        }

        $options = $this->PrintShopConfigOption->customGetByList($filteredOptions);
        if (!$options) {
            return false;
        }

        foreach ($options as $option) {
            $this->options[$option['ID']] = $option;
        }

        return true;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return bool|array
     */
    public function getPagesRange($groupID, $typeID)
    {
        $key = $groupID . ' ' . $typeID;

        if (array_key_exists($key, $this->pagesRanges)) {
            return $this->pagesRanges[$key];
        } else {
            $pageRange = $this->PrintShopPage->getPagesRange($groupID, $typeID);
            if ($pageRange) {
                $this->pagesRanges[$key] = $pageRange;
                return $pageRange;
            } else {
                return false;
            }
        }
    }

    /**
     * @param $aggregateAttributes
     * @return array|bool
     */
    public function getAttributesCluster($aggregateAttributes)
    {
        $key = md5(json_encode($aggregateAttributes));

        if (array_key_exists($key, $this->attributesCluster)) {
            return $this->attributesCluster[$key];
        } else {
            $attributes = $this->PrintShopConfigAttribute->getByList($aggregateAttributes);
            if ($attributes) {
                $this->attributesCluster[$key] = $attributes;
                return $attributes;
            } else {
                return false;
            }
        }
    }

    /**
     * @param $aggregateRange
     * @return array|bool
     */
    public function getAttributeRangesCluster($aggregateRange)
    {
        $key = md5(json_encode($aggregateRange));

        if (array_key_exists($key, $this->attributeRangesCluster)) {
            return $this->attributeRangesCluster[$key];
        } else {
            $attributeRanges = $this->PrintShopConfigAttributeRange->getByList($aggregateRange);
            if ($attributeRanges) {
                $this->attributeRangesCluster[$key] = $attributeRanges;
                return $attributeRanges;
            } else {
                return false;
            }
        }
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return bool|array
     */
    public function getDoublePage($groupID, $typeID)
    {
        $key = $groupID . ' ' . $typeID;

        if (array_key_exists($key, $this->doublePages)) {
            return $this->doublePages[$key];
        } else {
            $doublePages = $this->PrintShopPage->getDoublePage($groupID, $typeID);
            if ($doublePages) {
                $this->doublePages[$key] = $doublePages;
                return $doublePages;
            } else {
                return false;
            }
        }
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return bool|array
     */
    public function getSimilarPages($groupID, $typeID)
    {
        $key = $groupID . ' ' . $typeID;

        if (array_key_exists($key, $this->similarPages)) {
            return $this->similarPages[$key];
        } else {
            $similarPages = $this->PrintShopPage->getPagesSimilar($groupID, $typeID);
            if ($similarPages) {
                $this->similarPages[$key] = $similarPages;
                return $similarPages;
            } else {
                return false;
            }
        }
    }

    /**
     * @param $aggregateOptions
     * @return array|bool
     */
    public function getOptionsCluster($aggregateOptions)
    {
        $key = md5(json_encode($aggregateOptions));

        if (array_key_exists($key, $this->optionsCluster)) {
            return $this->optionsCluster[$key];
        } else {
            $options = $this->PrintShopConfigOption->customGetByList($aggregateOptions);
            if ($options) {
                $this->optionsCluster[$key] = $options;
                return $options;
            } else {
                return false;
            }
        }
    }

    /**
     * @param $formatID
     * @return bool|array
     */
    public function getPrintTypes($formatID)
    {
        if (array_key_exists($formatID, $this->printTypesCluster)) {
            return $this->printTypesCluster[$formatID];
        } else {
            $printTypes = $this->PrintShopFormatPrintType->getByFormatID($formatID);
            if ($printTypes) {
                $this->printTypesCluster[$formatID] = $printTypes;
                return $printTypes;
            } else {
                return false;
            }
        }
    }

    /**
     * @param $aggregatePriceLists
     * @return array|bool
     */
    public function getPriceListCluster($aggregatePriceLists)
    {
        $key = md5(json_encode($aggregatePriceLists));

        if (array_key_exists($key, $this->priceListCluster)) {
            return $this->priceListCluster[$key];
        } else {
            $priceLists = $this->PrintShopConfigPriceList->getByList($aggregatePriceLists);
            if( $priceLists ) {
                $this->priceListCluster[$key] = $priceLists;
                return $priceLists;
            } else {
                return false;
            }
        }
    }

    /**
     * @param $aggregateIcons
     * @return array|bool
     */
    public function getIconsCluster($aggregateIcons)
    {
        $key = md5(json_encode($aggregateIcons));

        if (array_key_exists($key, $this->iconsCluster)) {
            return $this->iconsCluster[$key];
        } else {
            $icons = $this->UploadFile->getFileByList($aggregateIcons);
            if( $icons ) {
                $this->iconsCluster[$key] = $icons;
                return $icons;
            } else {
                return false;
            }
        }
    }

    /**
     * @param $workspaceID
     * @return bool|array
     */
    public function getWorkspace($workspaceID)
    {
        if (array_key_exists($workspaceID, $this->workspaces)) {
            return $this->workspaces[$workspaceID];
        } else {
            $workspace = $this->PrintShopConfigWorkspace->get('ID', $workspaceID);
            if ($workspace) {
                $this->workspaces[$workspaceID] = $workspace;
                return $workspace;
            } else {
                $this->debug('Workspace Not found!', $workspaceID);
                return false;
            }
        }
    }

    /**
     * @param $aggregateWorkspaces
     * @return bool
     */
    public function setWorkSpaceByList($aggregateWorkspaces)
    {
        if (!$aggregateWorkspaces) {
            return false;
        }

        $filteredWorkspaces = array();

        foreach ($aggregateWorkspaces as $workspaceID) {
            if (!array_key_exists($workspaceID, $this->workspaces)) {
                $filteredWorkspaces[] = $workspaceID;
            }
        }

        $workspaces = $this->PrintShopConfigWorkspace->getByList($filteredWorkspaces);
        if (!$workspaces) {
            return false;
        }

        foreach ($workspaces as $workspace) {
            $this->workspaces[$workspace['ID']] = $workspace;
        }

        return true;
    }

    /**
     * @param $printTypeID
     * @return bool|array
     */
    public function getWorkspacesCluster($printTypeID)
    {
        if (array_key_exists($printTypeID, $this->workspacesCluster)) {
            return $this->workspacesCluster[$printTypeID];
        } else {
            $workspaces = $this->PrintShopConfigPrintTypeWorkspace->getByPrintTypeID($printTypeID);
            if ($workspaces) {
                $this->workspacesCluster[$printTypeID] = $workspaces;
                return $workspaces;
            } else {
                return false;
            }
        }
    }

    /**
     * @param $printTypeID
     * @param $optionsArray
     * @return bool|array
     */
    public function getPrintRotated($printTypeID, $optionsArray)
    {
        $key = $printTypeID . '-' . md5(json_encode($optionsArray));

        if (array_key_exists($key, $this->printRotatedEntities)) {
            return $this->printRotatedEntities[$key];
        } else {
            $printRotated = $this->PrintShopConfigDetailPrice->getControllerPrintRotated($printTypeID, $optionsArray);
            if( $printRotated ) {
                $this->printRotatedEntities[$key] = $printRotated;
                return $printRotated;
            } else {
                return false;
            }
        }
    }

    /**
     * @param $type
     * @param $amount int volume|sheet
     * @param $formatID
     * @return bool|array
     */
    public function getIncrease($type, $amount, $formatID = NULL)
    {
        if(empty($this->increases)){
            foreach($this->PrintShopIncrease->getAll() as $row){
                $key = $row['type'] . '-' . $row['amount'] . '-' . $row['formatID'];
                $this->increases[$key]=$row;
            }
        }
        $key = $type . '-' . $amount . '-' . $formatID;
        return array_key_exists($key, $this->increases)?$this->increases[$key]:false;
    }

    /**
     * @return bool|array
     */
    public function getConfigIncreaseCluster()
    {
        $controllerID = $this->PrintShopConfigIncrease->getControllerID();
        $attributeID = $this->PrintShopConfigIncrease->getAttrID();
        $optionID = $this->PrintShopConfigIncrease->getOptID();
        $key = $controllerID . '-' . $attributeID . '-' . $optionID;

        if( array_key_exists($key, $this->configIncreasesCluster) ) {
            return $this->configIncreasesCluster[$key];
        } else {
            $increases = $this->PrintShopConfigIncrease->getUsingIncreaseTypes();
            if( $increases ) {
                $this->configIncreasesCluster[$key] = $increases;
                return $increases;
            } else {
                return false;
            }
        }

    }

    /**
     * @param $increaseType
     * @param $amount
     * @return bool|array
     */
    public function getConfigIncrease($increaseType, $amount)
    {
        $controllerID = $this->PrintShopConfigIncrease->getControllerID();
        $optionID = $this->PrintShopConfigIncrease->getOptID();
        $key = $controllerID . '-' . $optionID . '-' . $increaseType . '-' . $amount;

        if (array_key_exists($key, $this->configIncreases)) {
            return $this->configIncreases[$key];
        } else {
            $increase = $this->PrintShopConfigIncrease->customGet($increaseType, $amount);
            if( $increase ) {
                $this->configIncreases[$key] = $increase;
                return $increase;
            } else {
                return false;
            }
        }
    }

    public function getRelatedConfigIncreases($controllerID, $groupID, $typeID, $attr,$printTypeID, $workspace, $pricelistID)
    {
        $related=$this->PrintShopConfigIncrease->getRelatedIncreases($controllerID, $groupID, $typeID, $attr,$printTypeID, $workspace, $pricelistID);
        return $related && count($related)>0 ? $related : false;
    }

    /**
     * @param $optionID
     * @return bool|array
     */
    public function getConnectOption($optionID)
    {
        if (array_key_exists($optionID, $this->connectOptions)) {
            return $this->connectOptions[$optionID];
        } else {
            $connectOption = $this->PrintShopConfigConnectOption->get('optionID', $optionID);
            if ($connectOption) {
                $this->connectOptions[$optionID] = $connectOption;
                return $connectOption;
            } else {
                return false;
            }
        }
    }

    /**
     * @param $type
     * @param $weight
     * @param null $connectOptionID
     * @return bool|mixed
     */
    public function getPaperPrice($type, $weight, $connectOptionID = NULL)
    {
        $optionID = $this->PrintShopConfigPaperPrice->getOptID();

        if($connectOptionID) {
            $key = $type . '-' . md5($weight) . '-' . $connectOptionID;
        } else {
            $key = $type . '-' . md5($weight) . '-' . $optionID;
        }

        if (array_key_exists($key, $this->paperPrices)) {
            return $this->paperPrices[$key];
        } else {
            switch ($type) {
                case 'expense':
                    $paperPrice = $this->PrintShopConfigPaperPrice->getExpenseFromWeight($weight);
                    break;
                case 'connectExpense':
                    $paperPrice = $this->PrintShopConfigConnectPrice->getExpenseFromWeight($connectOptionID, $weight);
                    break;
                case 'price':
                    $paperPrice = $this->PrintShopConfigPaperPrice->getPriceFromWeight($weight);
                    break;
                case 'connectPrice':
                    $paperPrice = $this->PrintShopConfigConnectPrice->getPriceFromWeight($connectOptionID, $weight);
                    break;
                default:
                    $paperPrice = false;
                    break;
            }

            if($paperPrice) {
                $this->paperPrices[$key] = $paperPrice;
                return $paperPrice;
            } else {
                return false;
            }
        }
    }

    /**
     * @return bool|array
     */
    public function getDetailPrice()
    {
        $attributeID = $this->PrintShopConfigDetailPrice->getAttrID();
        $optionID = $this->PrintShopConfigDetailPrice->getOptID();
        $controllerID = $this->PrintShopConfigDetailPrice->getControllerID();

        $key = $attributeID . '-' . $optionID;
        if( $controllerID ) {
            $key .= '-' . $controllerID;
        }

        if (array_key_exists($key, $this->detailPrices)) {
            return $this->detailPrices[$key];
        } else {
            $detailPrice = $this->PrintShopConfigDetailPrice->customGet();
            if( $detailPrice ) {
                $this->detailPrices[$key] = $detailPrice;
                return $detailPrice;
            } else {
                return false;
            }
        }

    }

    /**
     * @param $userID
     * @return array|bool
     */
    public function getUserDiscountGroups($userID)
    {
        $domainID = $this->UserDiscountGroup->getDomainID();
        $key = $userID . '-' .$domainID;

        if (array_key_exists($key, $this->userDiscountGroupsCluster)) {
            return $this->userDiscountGroupsCluster[$key];
        } else {
            $discountGroups = $this->UserDiscountGroup->getByUser($userID);
            if( $discountGroups ) {
                $this->userDiscountGroupsCluster[$key] = $discountGroups;
                return $discountGroups;
            } else {
                return false;
            }
        }
    }

    /**
     * @return array|bool
     */
    public function getDiscountPriceTypes()
    {
        $attributeID = $this->PrintShopConfigDiscountPrice->getAttrID();
        $optionID = $this->PrintShopConfigDiscountPrice->getOptID();
        $controllerID = $this->PrintShopConfigDiscountPrice->getControllerID();

        $key = $attributeID . '-' . $optionID;
        if( $controllerID ) {
            $key .= '-' . $controllerID;
        }

        $discountGroups = $this->PrintShopConfigDiscountPrice->getDiscountGroups();

        $aggregateDiscountGroup = array();
        if ($discountGroups) {
            $aggregateDiscountGroup = array();
            foreach ($discountGroups as $discountGroup) {
                $aggregateDiscountGroup[] = $discountGroup['discountGroupID'];
            }
        }

        $key .= '-' . md5(json_encode($aggregateDiscountGroup));

        if (array_key_exists($key, $this->discountPriceTypesCluster)) {
            return $this->discountPriceTypesCluster[$key];
        } else {
            $discountPriceTypes = $this->PrintShopConfigDiscountPrice->getUsingPriceTypes();
            if($discountPriceTypes) {
                $this->discountPriceTypesCluster[$key] = $discountPriceTypes;
                return $discountPriceTypes;
            } else {
                return false;
            }
        }
    }

    /**
     * @return array|bool
     */
    public function getPriceTypes()
    {
        $attributeID = $this->PrintShopConfigPrice->getAttrID();
        $optionID = $this->PrintShopConfigPrice->getOptID();
        $controllerID = $this->PrintShopConfigPrice->getControllerID();

        $key = $attributeID . '-' . $optionID;
        if( $controllerID ) {
            $key .= '-' . $controllerID;
        }

        if (array_key_exists($key, $this->priceTypesCluster)) {
            return $this->priceTypesCluster[$key];
        } else {
            $priceTypes = $this->PrintShopConfigPrice->getUsingPriceTypes();
            if( $priceTypes ) {
                $this->priceTypesCluster[$key] = $priceTypes;
                return $priceTypes;
            } else {
                return false;
            }
        }
    }

    /**
     * @param $formatID
     * @param $aggregatePrintTypes
     * @return array|bool
     */
    public function getPrintTypeWorkspaces($formatID, $aggregatePrintTypes)
    {
        $key = $formatID . '-' . md5(json_encode($aggregatePrintTypes));

        if (array_key_exists($key, $this->printTypeWorkspaceCluster)) {
            return $this->printTypeWorkspaceCluster[$key];
        } else {
            $printTypeWorkspaces = $this->PrintShopPrintTypeWorkspace->getByAggregateData(
                $aggregatePrintTypes,
                array($formatID)
            );

            if( $printTypeWorkspaces ) {
                $this->printTypeWorkspaceCluster[$key] = $printTypeWorkspaces;
                return $printTypeWorkspaces;
            } else {
                return false;
            }

        }
    }
}
