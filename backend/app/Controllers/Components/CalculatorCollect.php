<?php

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigDetailPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigDiscountPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigIncrease;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPaperPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrice;
use DreamSoft\Models\PrintShopProduct\PrintShopStaticPrice;
use DreamSoft\Models\Order\DpOrder;
use DreamSoft\Models\PrintShopUser\UserCalc;
use DreamSoft\Models\Tax\Tax;
use DreamSoft\Models\Price\BasePrice;
use Exception;

/**
 * Class CalculatorCollect
 * @package DreamSoft\Controllers\components
 */
class CalculatorCollect extends Component
{
    public $useModels = array();

    /**
     * @var CalculateStorage
     */
    protected $CalculateStorage;
    /**
     * @var PrintShopConfigIncrease
     */
    protected $PrintShopConfigIncrease;
    /**
     * @var PrintShopConfigDetailPrice
     */
    protected $PrintShopConfigDetailPrice;
    /**
     * @var PrintShopConfigPaperPrice
     */
    protected $PrintShopConfigPaperPrice;
    /**
     * @var PrintShopConfigDiscountPrice
     */
    protected $PrintShopConfigDiscountPrice;
    /**
     * @var PrintShopConfigPrice
     */
    protected $PrintShopConfigPrice;
    /**
     * @var PrintShopStaticPrice
     */
    protected $PrintShopStaticPrice;
    /**
     * @var DpOrder
     */
    protected $DpOrder;
    /**
     * @var UserCalc
     */
    protected $UserCalc;
    /**
     * @var BasePrice
     */
    protected $BasePrice;
    /**
     * @var Tax
     */
    protected $Tax;
    /**
     * @var CalculateAdapter
     */
    private $CalculateAdapter;
    /**
     * @var int
     */
    private $userID;
    /**
     * @var array
     */
    private $priceTypes = array();
    /**
     * @var bool
     */
    private $countBasePrice = false;
    /**
     * @var array
     */
    private $selectedTechnology;
    /**
     * @var array
     */
    private $commonOptions = array();
    /**
     * @var array
     */
    private $attributeFactories = array();

    /**
     * CalculatorCollect constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->CalculateStorage = CalculateStorage::getInstance();
        $this->PrintShopConfigIncrease = PrintShopConfigIncrease::getInstance();
        $this->PrintShopConfigDetailPrice = PrintShopConfigDetailPrice::getInstance();
        $this->PrintShopConfigPaperPrice = PrintShopConfigPaperPrice::getInstance();
        $this->PrintShopConfigDiscountPrice = PrintShopConfigDiscountPrice::getInstance();
        $this->PrintShopConfigPrice = PrintShopConfigPrice::getInstance();
        $this->PrintShopStaticPrice = PrintShopStaticPrice::getInstance();
        $this->DpOrder = DpOrder::getInstance();
        $this->UserCalc = UserCalc::getInstance();
        $this->BasePrice = BasePrice::getInstance();
        $this->CalculateAdapter = CalculateAdapter::getInstance();
        $this->Tax = Tax::getInstance();
    }

    /**
     * @return int
     */
    public function getUserID()
    {
        return $this->userID;
    }

    /**
     * @param int $userID
     */
    public function setUserID($userID)
    {
        $this->userID = $userID;
    }

    /**
     * @return array
     */
    public function getPriceTypes()
    {
        return $this->priceTypes;
    }

    /**
     * @param array $priceTypes
     */
    public function setPriceTypes($priceTypes)
    {
        $this->priceTypes = $priceTypes;
    }

    /**
     * @return bool
     */
    public function isCountBasePrice()
    {
        return $this->countBasePrice;
    }

    /**
     * @param bool $countBasePrice
     */
    public function setCountBasePrice($countBasePrice)
    {
        $this->countBasePrice = $countBasePrice;
    }

    /**
     * @return array
     */
    public function getSelectedTechnology()
    {
        return $this->selectedTechnology;
    }

    /**
     * @param array $selectedTechnology
     */
    public function setSelectedTechnology($selectedTechnology)
    {
        $this->selectedTechnology = $selectedTechnology;
    }

    /**
     * @return array
     */
    public function getCommonOptions()
    {
        return $this->commonOptions;
    }

    /**
     * @param array $commonOptions
     */
    public function setCommonOptions($commonOptions)
    {
        $this->commonOptions = $commonOptions;
    }

    /**
     * @return array
     */
    public function getAttributeFactories()
    {
        return $this->attributeFactories;
    }

    /**
     * @param array $attributeFactories
     */
    public function setAttributeFactories($attributeFactories)
    {
        $this->attributeFactories = $attributeFactories;
    }

    /**
     * @param $products
     * @return bool
     */
    public function calculate($products)
    {
        $this->setCommonOptions($this->searchCommonOptions($products));

        foreach ($products as $product) {

            $calculations[$product['calcID']] = array();

            foreach ($product['calcProducts'] as $calcProduct) {

                $calculations[$product['calcID']][] = $this->calcPrice(
                    $calcProduct['groupID'],
                    $calcProduct['typeID'],
                    $calcProduct['formatID'],
                    $calcProduct['formatWidth'],
                    $calcProduct['formatHeight'],
                    $calcProduct['pages'],
                    $product['volume'],
                    $calcProduct['attributes'],
                    $product['orderID'],
                    $product['calcID'],
                    $calcProduct['printTypeID'],
                    $calcProduct['workspaceID']
                );

            }

        }

        return $this->sumAttributeFactories();
    }

    /**
     * @param $products
     * @return bool
     */
    public function restorePrices($products)
    {
        $this->setCommonOptions($this->searchCommonOptions($products));

        $updated = 0;

        foreach ($products as $product) {

            if( $product['beforeReCountPriceID'] ) {
                $priceID = $product['beforeReCountPriceID'];
                if(
                    $this->UserCalc->update($product['calcID'], 'priceID', $priceID) &&
                    $this->UserCalc->update($product['calcID'], 'beforeReCountPriceID', NULL)
                ) {
                    $updated++;
                }
            }

        }

        if( $updated > 0 ) {
            return true;
        }
        return false;
    }

    /**
     * @param $products
     * @return array
     */
    private function searchCommonOptions($products)
    {
        if (!$products) {
            return array();
        }
        $commonOptions = array();
        $allUsedOptions = array();

        foreach ($products as $product) {

            foreach ($product['calcProducts'] as $calcProduct) {

                foreach ($calcProduct['attributes'] as $attribute) {

                    if (in_array($attribute['optID'], $allUsedOptions)) {
                        $commonOptions[] = $attribute['optID'];
                    } else {
                        $allUsedOptions[] = $attribute['optID'];
                    }

                }
            }
        }

        return $commonOptions;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $formatID
     * @param $formatWidth
     * @param $formatHeight
     * @param $pages
     * @param $volume
     * @param $attributes
     * @param $orderID
     * @param $calculateID
     * @param $printTypeID
     * @param $workspaceID
     * @return array
     */
    private function calcPrice($groupID, $typeID, $formatID, $formatWidth, $formatHeight, $pages, $volume, $attributes,
                               $orderID, $calculateID, $printTypeID, $workspaceID)
    {
        $printTypes = $this->getPrintTypes($formatID, $volume);

        $doublePage = $this->CalculateStorage->getDoublePage($groupID, $typeID);
        $similarPages = $this->CalculateStorage->getSimilarPages($groupID, $typeID);
        $setIncrease = $this->CalculateStorage->getIncrease('set', $volume, $formatID);

        $optionProperties = $this->getOptionsProperties($attributes, $pages, $doublePage);

        $format = $this->CalculateStorage->getFormat($formatID);

        $order = $this->DpOrder->get('ID', $orderID);

        if ($order['userID']) {
            $this->setUserID($order['userID']);
        }

        $calcPrices = array();
        $discountGroups = false;

        foreach ($printTypes as $printType) {

            if ($printType['printTypeID'] != $printTypeID) {
                continue;
            }

            $selectedTechnology = $this->getSelectedTechnology();

            $noCounting = false;
            if ($selectedTechnology) {

                if ($selectedTechnology['ID'] != $printType['pricelistID']) {
                    $noCounting = true;
                }

            }

            $rows = $this->getFormatRows($format);

            $workspaces = $this->getWorkspaces($printType['workspaceID'], $printType['printTypeID']);

            foreach ($workspaces as $workspace) {

                if (intval($workspace['ID']) != $workspaceID) {
                    continue;
                }

                $excludedPrintType = false;

                $calcAllSheets = $this->getAllSheets(
                    $workspace,
                    $pages,
                    $volume,
                    $optionProperties['oneSide'],
                    $optionProperties['printRotated'],
                    $doublePage,
                    $formatWidth,
                    $formatHeight
                );
                $sheets = $calcAllSheets['sheets'];

                if ($sheets === null) {
                    continue;
                }

                $projectSheet = $this->getProjectSheets(
                    $workspace,
                    $pages,
                    $similarPages,
                    $doublePage,
                    $optionProperties,
                    $formatWidth,
                    $formatHeight
                );

                $area = $this->getArea(
                    $volume,
                    $rows,
                    $optionProperties['rollLength'],
                    $setIncrease,
                    $format['slope'],
                    $formatWidth,
                    $formatHeight
                );

                $perimeter = $this->getPerimeter(
                    $volume,
                    $formatWidth,
                    $formatHeight
                );

                $copiesOnAllSheets = $this->getCopiesOnAllSheets($volume, $pages, $optionProperties['oneSide'], $doublePage);

                $totalArea = $this->getTotalArea(
                    $workspace,
                    $volume,
                    $optionProperties['rollLength'],
                    $setIncrease,
                    $formatWidth,
                    $formatHeight
                );

                $totalSheetFolds = $this->getTotalSheetFolds(
                    $calcAllSheets['perSheet'],
                    $optionProperties['oneSide']
                );

                $sheetIncrease = $this->CalculateStorage->getIncrease('sheet', $sheets, $formatID);

                $price = 0;
                $expense = 0;
                $basePrice = 0;
                $options = array();
                $options['pages'] = intval($pages);

                foreach ($attributes as $attribute) {

                    if ($order['userID']) {
                        $discountGroups = $this->getDiscountGroups($order['userID']);
                    }

                    $AttributeProcessFactory = new AttributeProcessFactory();
                    $AttributeProcessFactory->setVolume($volume);
                    $AttributeProcessFactory->setAttributeID($attribute['attrID']);
                    $AttributeProcessFactory->setOptionID($attribute['optID']);
                    $AttributeProcessFactory->setPrintTypeID($printType['printTypeID']);
                    $AttributeProcessFactory->setPriceListID($printType['pricelistID']);
                    $AttributeProcessFactory->setWorkspace($workspace);
                    $AttributeProcessFactory->setSheets($sheets);
                    $AttributeProcessFactory->setProjectSheet($projectSheet);
                    $AttributeProcessFactory->setArea($area);
                    $AttributeProcessFactory->setPerimeter($perimeter);
                    $AttributeProcessFactory->setAttributePages($attribute['attrPages']);
                    $AttributeProcessFactory->setPages($pages);
                    $AttributeProcessFactory->setSize($optionProperties['size']);
                    $AttributeProcessFactory->setCopiesOnAllSheets($copiesOnAllSheets);
                    $AttributeProcessFactory->setTotalArea($totalArea);
                    $AttributeProcessFactory->setTotalSheetFolds($totalSheetFolds);
                    $AttributeProcessFactory->setSheetIncrease($sheetIncrease);
                    $AttributeProcessFactory->setSetIncrease($setIncrease);
                    $AttributeProcessFactory->setFormatWidth($formatWidth);
                    $AttributeProcessFactory->setFormatHeight($formatHeight);
                    $AttributeProcessFactory->setMaxFolds($optionProperties['maxFolds']);
                    $AttributeProcessFactory->setExpense(false);
                    $AttributeProcessFactory->setCalculateID($calculateID);

                    $attributePrice = $this->attributePrice(
                        $AttributeProcessFactory
                    );

                    if (in_array($attribute['optID'], $this->getCommonOptions())) {
                        $this->addToAttributeFactories(
                            $AttributeProcessFactory,
                            $attributePrice
                        );
                    }

                    if ($discountGroups) {

                        $this->setCountBasePrice(true);
                        $attributePriceBase = $this->attributePrice(
                            $AttributeProcessFactory
                        );
                        $this->setCountBasePrice(false);
                        $basePrice += $attributePriceBase['finalPrice'];

                    } else {
                        $basePrice += $attributePrice['finalPrice'];
                    }

                    $price += $attributePrice['finalPrice'];

                    $AttributeProcessFactory->setExpense(true);

                    $attributeExpense = $this->attributePrice(
                        $AttributeProcessFactory
                    );

                    $expense += $attributeExpense['finalPrice'];

                    $options[$attribute['attrID']] = intval($attribute['optID']);

                    $options['volumes'] = intval($volume);

                    if ($attributePrice['finalPrice'] === null) {
                        $excludedPrintType = true;
                        break;
                    }

                }

                if ($excludedPrintType) {
                    continue;
                }

                $this->PrintShopStaticPrice->setGroupID($groupID);
                $this->PrintShopStaticPrice->setTypeID($typeID);
                $this->PrintShopStaticPrice->setFormatID($formatID);

                if ($staticPrice = $this->PrintShopStaticPrice->getStaticPrice($options)) {

                    $price = $staticPrice;
                    $basePrice = $staticPrice;
                    $staticExpense = $this->PrintShopStaticPrice->getStaticExpense($options);
                    if ($staticExpense) {
                        $expense = $staticExpense;
                    }
                }

                $setPriceIncrease = $this->CalculateStorage->getIncrease('setPrice', $volume, $formatID);
                if ($setPriceIncrease) {
                    $price += floatval($setPriceIncrease) * $volume;
                    $basePrice += floatval($setPriceIncrease) * $volume;
                }

                $pricePercentageIncrease = $this->CalculateStorage->getIncrease('ptcPrice', $volume, $formatID);

                if ($pricePercentageIncrease) {
                    $price *= 1 + floatval($pricePercentageIncrease / 100);
                    $basePrice *= 1 + floatval($pricePercentageIncrease / 100);
                }

                $calcPrices[] = array(
                    'price' => $price,
                    'expense' => $expense,
                    'basePrice' => $basePrice,
                    'noCounting' => $noCounting,
                    'printType' => $printType,
                    'workspace' => $workspace
                );

            }

        }

        $price = null;
        $expense = null;
        $basePrice = null;
        $printType = null;
        $workspace = null;

        foreach ($calcPrices as $eachPrice) {

            if ($eachPrice['noCounting']) {
                continue;
            }

            if ($eachPrice['price'] < $price || $price === null) {
                $price = $eachPrice['price'];
                $basePrice = $eachPrice['basePrice'];
                $expense = $eachPrice['expense'];
                $printType = $eachPrice['printType'];
                $workspace = $eachPrice['workspace'];
            }
        }

        $attributeDiscount = $basePrice - $price;

        return array(
            'price' => $price,
            'expense' => $expense,
            'basePrice' => $basePrice,
            'attributeDiscount' => $attributeDiscount,
            'printType' => $printType,
            'workspace' => $workspace
        );
    }

    /**
     * @return bool
     */
    private function sumAttributeFactories()
    {
        $attributeFactories = $this->getAttributeFactories();

        $updated = 0;

        if ($attributeFactories) {
            foreach ($attributeFactories as $key => $factories) {

                if (count($factories) > 1) {
                    $SumAttributeProcessFactory = new AttributeProcessFactory();

                    $sumRegularPrice = 0;
                    $aggregateCalculations = array();
                    $aggregateAttributePrices = array();

                    foreach ($factories as $factory) {

                        /**
                         * @var $currentFactory AttributeProcessFactory
                         */
                        $currentFactory = $factory['factory'];
                        $sumRegularPrice += $factory['regularPrice'];
                        $aggregateCalculations[] = $factory['calculationID'];
                        $aggregateAttributePrices[$factory['calculationID']] = $factory['regularPrice'];

                        if ($currentFactory->getAttributePages() > 0) {
                            continue;
                        }

                        $SumAttributeProcessFactory->setOptionID($currentFactory->getOptionID());
                        $SumAttributeProcessFactory->setAttributeID($currentFactory->getAttributeID());
                        $SumAttributeProcessFactory->setVolume(
                            intval($SumAttributeProcessFactory->getVolume()) + $currentFactory->getVolume()
                        );
                        $SumAttributeProcessFactory->setPrintTypeID(
                            $currentFactory->getPrintTypeID()
                        );
                        $SumAttributeProcessFactory->setPriceListID(
                            $currentFactory->getPriceListID()
                        );
                        $SumAttributeProcessFactory->setWorkspace(
                            $currentFactory->getWorkspace()
                        );
                        $sheets = 0;
                        if ($SumAttributeProcessFactory->getSheets()) {
                            $sheets = $SumAttributeProcessFactory->getSheets();
                        }
                        $SumAttributeProcessFactory->setSheets(
                            floatval($sheets) + $currentFactory->getSheets()
                        );
                        $projectSheet = 0;
                        if ($SumAttributeProcessFactory->getProjectSheet()) {
                            $projectSheet = $SumAttributeProcessFactory->getProjectSheet();
                        }
                        $SumAttributeProcessFactory->setProjectSheet(
                            floatval($projectSheet) + $currentFactory->getProjectSheet()
                        );
                        $area = 0;
                        if ($SumAttributeProcessFactory->getArea()) {
                            $area = $SumAttributeProcessFactory->getArea();
                        }
                        $currentArea = $currentFactory->getArea();
                        $newArea = array(
                            'size' => floatval($area['size']) + $currentArea['size'],
                            'sizeNet' => floatval($area['sizeNet']) + $currentArea['sizeNet'],
                        );
                        $SumAttributeProcessFactory->setArea(
                            $newArea
                        );
                        $perimeter = 0;
                        if ($SumAttributeProcessFactory->getPerimeter()) {
                            $perimeter = $SumAttributeProcessFactory->getPerimeter();
                        }
                        $SumAttributeProcessFactory->setPerimeter(
                            floatval($perimeter) + $currentFactory->getPerimeter()
                        );

                        $SumAttributeProcessFactory->setPages(
                            intval($SumAttributeProcessFactory->getPages()) + $currentFactory->getPages()
                        );
                        $SumAttributeProcessFactory->setSize(
                            floatval($SumAttributeProcessFactory->getSize()) + $currentFactory->getSize()
                        );
                        $SumAttributeProcessFactory->setCopiesOnAllSheets(
                            intval($SumAttributeProcessFactory->getCopiesOnAllSheets()) + $currentFactory->getCopiesOnAllSheets()
                        );
                        $SumAttributeProcessFactory->setTotalArea(
                            $SumAttributeProcessFactory->getTotalArea() + $currentFactory->getTotalArea()
                        );
                        $SumAttributeProcessFactory->setTotalSheetFolds(
                            floatval($SumAttributeProcessFactory->getTotalSheetFolds()) + $currentFactory->getTotalSheetFolds()
                        );
                        $SumAttributeProcessFactory->setSheetIncrease(
                            $currentFactory->getSheetIncrease()
                        );
                        $SumAttributeProcessFactory->setSetIncrease(
                            $currentFactory->getSetIncrease()
                        );
                        $SumAttributeProcessFactory->setFormatWidth(
                            intval($currentFactory->getFormatWidth())
                        );
                        $SumAttributeProcessFactory->setFormatHeight(
                            intval($currentFactory->getFormatHeight())
                        );
                        $SumAttributeProcessFactory->setMaxFolds(
                            intval($SumAttributeProcessFactory->getMaxFolds()) + $currentFactory->getMaxFolds()
                        );

                    }

                    $sumAttrPrice = $this->attributePrice(
                        $SumAttributeProcessFactory
                    );

                    $calculations = $this->UserCalc->customGetByList($aggregateCalculations);

                    foreach ($calculations as $calculation) {

                        $volumeRatio =  $SumAttributeProcessFactory->getVolume() / $calculation['volume'];

                        $newAttributePrice = 0;
                        foreach($sumAttrPrice['priceComponents'] as $priceComponent) {
                            $newAttributePrice += $priceComponent['partialPrice']/$volumeRatio;
                        }

                        $calcPrice = $this->BasePrice->get('ID', $calculation['calcPriceID']);

                        $calculationPriceWithoutAttribute = $calcPrice['price'] - round($aggregateAttributePrices[$calculation['ID']], 0);

                        $newCalculatePrice = $calculationPriceWithoutAttribute + $newAttributePrice;

                        if ($this->updatePrice($calculation['priceID'], $calculation['ID'], $newCalculatePrice)) {
                            $updated++;
                        }
                    }

                }
            }
        }

        if ($updated > 0) {
            return true;
        }

        return false;
    }

    /**
     * @param $priceID
     * @param $calculationID
     * @param $newValue
     * @return bool
     */
    private function updatePrice($priceID, $calculationID, $newValue)
    {
        $price = $this->BasePrice->get('ID', $priceID);

        if ($price['price'] <= $newValue) {
            return false;
        }

        $calculation = $this->UserCalc->customGet($calculationID);

        if( !$calculation['beforeReCountPriceID'] ) {
            $newPriceID = $this->BasePrice->copy($priceID);
            $this->UserCalc->update($calculation['ID'], 'beforeReCountPriceID', $priceID);
            $this->UserCalc->update($calculation['ID'], 'priceID', $newPriceID);
        } else {
            $newPriceID = $priceID;
        }

        $tax = $this->Tax->customGet($price['taxID']);

        $taxValue = 1 + (intval($tax['value']) / 100);

        $grossPrice = $newValue * $taxValue;

        $saved = 0;

        if ($this->BasePrice->update($newPriceID, 'price', $newValue)) {
            $saved++;
        }
        if ($this->BasePrice->update($newPriceID, 'grossPrice', $grossPrice)) {
            $saved++;
        }

        if ($saved > 0) {
            return true;
        }

        return false;

    }

    /**
     * @param $AttributeProcessFactory AttributeProcessFactory
     * @param $price
     */
    private function addToAttributeFactories($AttributeProcessFactory, $price)
    {

        if ($price['finalPrice'] === null || $price['finalPrice'] <= 0) {
            return;
        }

        $attributeFactories = $this->getAttributeFactories();
        $workspace = $AttributeProcessFactory->getWorkspace();

        $key = $AttributeProcessFactory->getOptionID() . '-' . $AttributeProcessFactory->getPrintTypeID() . '-' . $workspace['ID'];

        if (isset($attributeFactories[$key])) {
            $firstFactoryArray = current($attributeFactories[$key]);
            /**
             * @var $firstFactory AttributeProcessFactory
             */
            $firstFactory = $firstFactoryArray['factory'];

            if ($firstFactory->getPriceListID() !== $AttributeProcessFactory->getPriceListID()) {
                return;
            }

            $priceList = $this->CalculateStorage->getPriceList($firstFactory->getPriceListID());

            if (!$priceList['allowJoinProcess']) {
                return;
            }

        }
        $attributeFactories[$key][] = array(
            'factory' => $AttributeProcessFactory,
            'regularPrice' => $price['finalPrice'],
            'priceComponents' => $price['priceComponents'],
            'calculationID' => $AttributeProcessFactory->getCalculateID()
        );
        $this->setAttributeFactories($attributeFactories);
    }

    /**
     * @param $formatID
     * @param $volume
     * @return array|bool
     */
    private function getPrintTypes($formatID, $volume)
    {
        $printTypes = $this->CalculateStorage->getPrintTypes($formatID);

        foreach ($printTypes as $key => $printType) {
            if ($printType['minVolume'] !== null && $volume < $printType['minVolume']) {
                unset($printTypes[$key]);
            } elseif ($printType['maxVolume'] !== null && $volume > $printType['maxVolume']) {
                unset($printTypes[$key]);
            }

        }

        return $printTypes;

    }

    /**
     * @param $workspaceID
     * @param $printTypeID
     * @return array|bool
     */
    private function getWorkspaces($workspaceID, $printTypeID)
    {
        if ($workspaceID) {
            $workspaces = array();
            $tmp = $this->CalculateStorage->getWorkspace($workspaceID);
            $tmp['workspaceID'] = $tmp['ID'];
            $workspaces[] = $tmp;
        } else {
            $workspaces = $this->CalculateStorage->getWorkspacesCluster($printTypeID);
        }

        return $workspaces;
    }

    /**
     * @param $attributes
     * @param $pages
     * @param $doublePage
     * @return array
     */
    private function getOptionsProperties($attributes, $pages, $doublePage)
    {

        $optionsProperties = array(
            'oneSide' => null,
            'size' => null,
            'maxFolds' => null,
            'printRotated' => 0,
            'rollLength' => null
        );
        foreach ($attributes as $attr) {

            $option = $this->CalculateStorage->getOption($attr['optID']);

            if ($option['oneSide'] == 1) {
                $optionsProperties['oneSide'] = true;
            }

            if (doubleval($option['sizePage']) > 0) {
                $optionsProperties['size'] += $this->calculateProductThickness($pages, $option['sizePage'], $doublePage);
            }
            if ($option['rollLength'] > 0) {
                $optionsProperties['rollLength'] = $option['rollLength'];
            }
            if (isset($option['printRotated']) && $option['printRotated'] == 1) {
                $optionsProperties['printRotated'] = 1;
            }

            if (isset($option['maxFolds']) && $option['maxFolds'] !== null) {
                $optionsProperties['maxFolds'] = $option['maxFolds'];
            }

        }

        return $optionsProperties;
    }

    /**
     * @param $pages
     * @param $pageSize
     * @param $doublePage
     * @return float|int
     */
    private function calculateProductThickness($pages, $pageSize, $doublePage)
    {
        $pageSize = doubleval($pageSize);

        $sheets = $pages / 2;
        if ($doublePage) {
            $sheets /= 2;
        }

        return $sheets * $pageSize;
    }

    /**
     * @param $workspace
     * @param $pages
     * @param $volume
     * @param $oneSide
     * @param $printRotated
     * @param $doublePage
     * @param $formatWidth
     * @param $formatHeight
     * @return array|null
     */
    private function getAllSheets($workspace, $pages, $volume, $oneSide, $printRotated, $doublePage,
                                  $formatWidth, $formatHeight)
    {
        $pages = $this->CalculateAdapter->getAmountPages($pages, $oneSide, $doublePage);

        $perSheet = null;

        switch ($workspace['type']) {
            case 3:
                $sheets = 1;
                break;
            case 2:

                $area = $area = $this->CalculateAdapter->getAreaForRolled($pages, $volume);

                $usedHeight = $this->CalculateAdapter->getUsedHeight(
                    $area,
                    $workspace['width'],
                    $formatWidth,
                    $formatHeight
                );

                $sheets = ceil($usedHeight / $workspace['height']);

                break;
            default:

                $perSheet = $this->CalculateAdapter->getAreaPerSheetForStandard(
                    $workspace['width'],
                    $workspace['height'],
                    $formatWidth,
                    $formatHeight
                );

                if ($perSheet == 0) {
                    return null;
                }

                if (!$printRotated) {

                    $sheets = $this->CalculateAdapter->getSheetsForStandard($pages, $perSheet, $volume);
                    $sheets = ceil($sheets);

                } else {

                    $sheets = $this->CalculateAdapter->getSheetsForStandardPrintRotated($pages, $perSheet, $volume);
                    $sheets = ceil($sheets * 2) / 2;
                }

                break;
        }

        return array('sheets' => $sheets, 'perSheet' => $perSheet);

    }

    /**
     * @param $format
     * @return int
     */
    private function getFormatRows($format)
    {
        $rows = 1;
        if ($format['rows'] > 1) {
            $rows = intval($format['rows']);
        }

        return $rows;
    }

    /**
     * @param $workspace
     * @param $pages
     * @param $similarPages
     * @param $doublePage
     * @param $optionProperties
     * @param $formatWidth
     * @param $formatHeight
     * @return int|mixed
     */
    private function getProjectSheets($workspace, $pages, $similarPages, $doublePage, $optionProperties,
                                      $formatWidth, $formatHeight)
    {
        if ($similarPages) {
            return 1;
        }

        $sheetsInfo = $this->getAllSheets(
            $workspace,
            $pages,
            1,
            $optionProperties['oneSide'],
            $optionProperties['printRotated'],
            $doublePage,
            $formatWidth,
            $formatHeight
        );

        return $sheetsInfo['sheets'];
    }

    /**
     * @param $volume
     * @param $rows
     * @param $maxRollLength
     * @param $setIncrease
     * @param $slope
     * @param $formatWidth
     * @param $formatHeight
     * @return array
     */
    private function getArea($volume, $rows, $maxRollLength, $setIncrease, $slope, $formatWidth, $formatHeight)
    {
        $volume = $this->CalculateAdapter->addSetIncreaseToVolume($volume, $setIncrease, $rows);

        $size = $this->CalculateAdapter->calculateSize($formatWidth, $formatHeight);
        $sizeNet = $this->CalculateAdapter->calculateSizeNet($formatWidth, $formatHeight, $slope);

        $size *= $volume;
        $sizeNet *= $volume;

        if ($maxRollLength !== null) {

            $length = $this->CalculateAdapter->getLengthForRoll($size, $formatWidth);
            $numberOfRolls = $this->CalculateAdapter->getNumberOfRolls($length, $maxRollLength);

            $rollSlipIncrease = $this->CalculateStorage->getIncrease('rollSlip', $numberOfRolls);

            $size = $this->CalculateAdapter->calculateSizeForRollPrint($size, $maxRollLength, $formatWidth, $rollSlipIncrease);

        }
        return array('size' => $size, 'sizeNet' => $sizeNet);
    }

    /**
     * @param $volume
     * @param $formatWidth
     * @param $formatHeight
     * @return float|int
     */
    private function getPerimeter($volume, $formatWidth, $formatHeight)
    {
        $width = $formatWidth;
        $height = $formatHeight;
        $width /= 1000;
        $height /= 1000;

        $perimeter = $width * 2 + $height * 2;
        $perimeter *= $volume;

        return $perimeter;
    }

    /**
     * @param $volume
     * @param $pages
     * @param $oneSide
     * @param $doublePage
     * @return float|int
     */
    private function getCopiesOnAllSheets($volume, $pages, $oneSide, $doublePage)
    {
        if ($oneSide && $pages > 2) {
            $copiesOnAllSheets = $pages;
        } else {
            $copiesOnAllSheets = $pages / 2;
        }

        if ($doublePage) {
            $copiesOnAllSheets /= 2;
        }

        return $copiesOnAllSheets * $volume;
    }

    private function getTotalArea($workspace, $volume, $maxRollLength, $setIncrease, $formatWidth, $formatHeight)
    {
        $volume = $this->CalculateAdapter->addSetIncreaseToVolumeTotal($volume, $setIncrease);

        $length = $this->CalculateAdapter->getLengthForTotalArea(
            $formatWidth,
            $formatHeight,
            $workspace['width'],
            $volume
        );

        $length = $this->CalculateAdapter->addPaperHeightForTotalArea($length, $workspace);

        if ($maxRollLength !== null) {
            $numberOfRolls = $this->CalculateAdapter->getNumberOfRollsForTotalArea($length, $maxRollLength);

            $rollSlipIncrease = $this->CalculateStorage->getIncrease('rollSlip', $numberOfRolls);
            $length = $this->CalculateAdapter->addRollSlipIncrease($length, $rollSlipIncrease, $numberOfRolls);

        }

        $totalArea = $this->CalculateAdapter->calculateTotalArea($length, $workspace);

        return $totalArea;

    }

    /**
     * @param $copiesOnSheet
     * @param $maxFolds
     * @return float|int
     */
    private function getTotalSheetFolds($copiesOnSheet, $maxFolds)
    {
        $sheetCuts = 0;

        $folds = log($copiesOnSheet, 2);

        if ($maxFolds !== null && $maxFolds > 0) {
            while ($folds > $maxFolds) {
                $folds--;
                $sheetCuts++;
            }
        }

        $totalSheetFolds = $folds;
        if ($sheetCuts > 0) {
            $totalSheetFolds *= $sheetCuts * 2;
        }

        return $totalSheetFolds;
    }

    /**
     * @param AttributeProcessFactory
     * @return array|bool
     */
    private function attributePrice($AttributeProcessFactory)
    {
        /**
         * @var AttributeProcessFactory
         */
        $AttributeProcessFactoryCopy = clone $AttributeProcessFactory;
        $workspace = $AttributeProcessFactoryCopy->getWorkspace();
        $workspaceID = $workspace['ID'];

        $valuesWithIncreases = $this->addIncreases(
            $AttributeProcessFactoryCopy->getSheets(),
            $AttributeProcessFactoryCopy->getVolume(),
            $AttributeProcessFactoryCopy->getSheetIncrease(),
            $AttributeProcessFactoryCopy->getSetIncrease(),
            $AttributeProcessFactoryCopy->getProjectSheet()
        );

        $AttributeProcessFactoryCopy->setSheets($valuesWithIncreases['sheets']);
        $AttributeProcessFactoryCopy->setVolume($valuesWithIncreases['volume']);

        $attribute = $this->CalculateStorage->getAttribute($AttributeProcessFactoryCopy->getAttributeID());

        $controllerID = $this->getControllerID(
            $attribute,
            $AttributeProcessFactoryCopy->getPriceListID(),
            $AttributeProcessFactoryCopy->getPrintTypeID(),
            $workspaceID
        );

        if (!$controllerID) {
            return false;
        }

        $this->PrintShopConfigIncrease->setAttrID($AttributeProcessFactoryCopy->getAttributeID());
        $this->PrintShopConfigIncrease->setOptID($AttributeProcessFactoryCopy->getOptionID());
        $this->PrintShopConfigIncrease->setControllerID($controllerID);

        $increases = $this->getAttributeIncreases(
            $AttributeProcessFactoryCopy->getSheets(),
            $AttributeProcessFactoryCopy->getProjectSheet()
        );
        $AttributeProcessFactoryCopy->setSheets($increases['sheets']);

        $finalPrice = 0;

        $this->PrintShopConfigDetailPrice->setAttrID($AttributeProcessFactoryCopy->getAttributeID());
        $this->PrintShopConfigDetailPrice->setOptID($AttributeProcessFactoryCopy->getOptionID());
        $this->PrintShopConfigDetailPrice->setControllerID($controllerID);

        if ($attribute['function'] == 'standard') {
            $this->PrintShopConfigDetailPrice->setControllerID($AttributeProcessFactoryCopy->getPriceListID());
        }

        $detailPrice = $this->CalculateStorage->getDetailPrice();

        if ($detailPrice['excluded']) {
            return null;
        }

        $priceComponents = array();

        $option = $this->CalculateStorage->getOption($AttributeProcessFactoryCopy->getOptionID());

        $weight = false;
        if( $attribute['type'] == ATTRIBUTE_TYPE_PAPER ) {
            $weight = $this->getWeightOfPaper($option, $workspace, $AttributeProcessFactoryCopy->getSheets());
        }

        $paperPrice = $this->getPaperPrice(
            $attribute,
            $AttributeProcessFactoryCopy->getOptionID(),
            $weight,
            $AttributeProcessFactoryCopy->isExpense()
        );

        if ($paperPrice) {
            $priceComponents[] = array(
                'range' => $weight,
                'amount' => 1,
                'percentage' => false,
                'function' => 'paper',
                'partialPrice' => round($paperPrice, 0)
            );
            $finalPrice += $paperPrice;
        }

        $discountGroups = $this->getDiscountGroups($this->getUserID());

        $discountPriceTypes = null;

        if ($discountGroups) {
            $this->PrintShopConfigDiscountPrice->setAttrID($AttributeProcessFactoryCopy->getAttributeID());
            $this->PrintShopConfigDiscountPrice->setOptID($AttributeProcessFactoryCopy->getOptionID());
            $this->PrintShopConfigDiscountPrice->setControllerID($controllerID);
            $this->PrintShopConfigDiscountPrice->setDiscountGroups($discountGroups);

            $discountPriceTypes = $this->CalculateStorage->getDiscountPriceTypes();


            foreach ($discountPriceTypes as $key => $discountPriceType) {
                $discountPriceTypes[$key]['discounted'] = true;
            }
        }

        $this->PrintShopConfigPrice->setAttrID($AttributeProcessFactoryCopy->getAttributeID());
        $this->PrintShopConfigPrice->setOptID($AttributeProcessFactoryCopy->getOptionID());
        $this->PrintShopConfigPrice->setControllerID($controllerID);

        $priceTypes = $this->CalculateStorage->getPriceTypes();

        if ($discountPriceTypes && !$this->isCountBasePrice()) {
            $priceTypes = $discountPriceTypes;
        }

        $this->setPriceTypes($priceTypes);

        $percentagePrice = array();
        $percentageType = null;

        foreach ($priceTypes as $priceType) {

            $priceComponent = array();
            $partialPrice = 0;

            $priceRanges = $this->prepareValuesForPrice($priceType['function'], $AttributeProcessFactoryCopy);
            $priceComponent = $priceRanges;
            $priceComponent['function'] = $priceType['function'];


            if ($AttributeProcessFactoryCopy->isExpense()) {
                $price = $this->searchMatchingExpense($priceRanges['range'], $priceType);

                if (!$priceRanges['percentage']) {
                    $finalPrice += $price['expense'] * $priceRanges['amount'];
                } else {
                    $percentagePrice[] = array(
                        'value' => $price['expense'],
                        'type' => $percentageType
                    );
                }
            } else {

                $price = $this->searchMatchingPrice($priceRanges['range'], $priceRanges['volume'], $priceType);

                if (!$priceRanges['percentage']) {
                    $partialPrice = $price['value'] * $priceRanges['amount'];
                    $priceComponent['partialPrice'] = $partialPrice;
                    $finalPrice += $partialPrice;
                } else {
                    $percentagePrice[] = array(
                        'value' => $price['value'],
                        'type' => $percentageType
                    );
                }

                $priceComponents[] = $priceComponent;
            }

        }

        if ($AttributeProcessFactoryCopy->isExpense()) {
            if ($detailPrice['startUp'] !== null) {
                $finalPrice += $detailPrice['startUp'];
            }

        } else {
            if ($detailPrice['basePrice'] !== null && !$AttributeProcessFactoryCopy->isExpense()) {
                $finalPrice += $detailPrice['basePrice'];
                $priceComponents[] = array(
                    'function' => 'basePrice',
                    'partialPrice' => $detailPrice['basePrice']
                );
            }

            if ($detailPrice['minPrice'] !== null && $detailPrice['minPrice'] > $finalPrice) {
                $finalPrice = $detailPrice['minPrice'];
                $priceComponents = array();
                $priceComponents[] = array(
                    'function' => 'basePrice',
                    'partialPrice' => $detailPrice['minPrice']
                );
            }
        }

        if (!empty($percentagePrice)) {
            foreach ($percentagePrice as $each) {
                if ($each['type'] == 1) {
                    $finalPrice = $finalPrice * (1 + (doubleval($each['value']) / 100));
                } elseif ($each['type'] == 2) {
                    $finalPrice = $finalPrice * (doubleval($each['value']) / 100);
                }
            }
        }

        return array(
            'finalPrice' => $finalPrice,
            'priceComponents' => $priceComponents
        );

    }

    /**
     * @param $priceTypeFunction
     * @param $AttributeProcessFactory AttributeProcessFactory
     * @return array
     */
    private function prepareValuesForPrice($priceTypeFunction, $AttributeProcessFactory)
    {
        $result = array('percentage' => false);

        $totalFolds = $AttributeProcessFactory->getSheets() * $AttributeProcessFactory->getTotalSheetFolds();

        $lengthOfSides = $this->getLengthOfSides(
            $AttributeProcessFactory->getFormatWidth(),
            $AttributeProcessFactory->getFormatHeight()
        );

        $totalSheetsArea = $this->getTotalSheetsArea(
            $AttributeProcessFactory->getWorkspace(),
            $AttributeProcessFactory->getSheets()
        );

        $area = $AttributeProcessFactory->getArea();

        switch ($priceTypeFunction) {
            case 'sheet':
                $resultCalculateSheet = $this->calculateSheet(
                    $AttributeProcessFactory->getSheets(),
                    $AttributeProcessFactory->getVolume(),
                    $AttributeProcessFactory->getAttributePages()
                );
                $result['range'] = $resultCalculateSheet['range'];
                $result['amount'] = $resultCalculateSheet['amount'];
                break;
            case 'set':
                $resultSet = $this->calculateSet(
                    $AttributeProcessFactory->getVolume(),
                    $AttributeProcessFactory->getAttributePages()
                );
                $result['range'] = $resultSet['range'];
                $result['amount'] = $resultSet['amount'];
                break;
            case 'projectSheets':
                $range = $amount = $AttributeProcessFactory->getProjectSheet();
                break;
            case 'squareMeter':
                $area = $AttributeProcessFactory->getArea();
                $result['range'] = $result['amount'] = $area['size'];
                break;
            case 'perimeter':
                if ($AttributeProcessFactory->getAttributePages() > 1) {
                    $perimeter = $AttributeProcessFactory->getPerimeter() * $AttributeProcessFactory->getAttributePages();
                } else {
                    $perimeter = $AttributeProcessFactory->getPerimeter();
                }
                $result['range'] = $result['amount'] = $perimeter;
                break;
            case 'allSheetsRangeVolume':
                $result['range'] = $AttributeProcessFactory->getVolume();
                $result['amount'] = $AttributeProcessFactory->getSheets();
                break;
            case 'allPages':
                $allPagesResult = $this->calculateAllPages(
                    $AttributeProcessFactory->getPages(),
                    $AttributeProcessFactory->getVolume(),
                    $AttributeProcessFactory->getAttributePages()
                );
                $result['range'] = $allPagesResult['range'];
                $result['amount'] = $allPagesResult['amount'];
                break;
            case 'allPagesRangeVolume':
                $allPagesRangeVolumeResult = $this->calculateAllPagesRangeVolume(
                    $AttributeProcessFactory->getPages(),
                    $AttributeProcessFactory->getVolume(),
                    $AttributeProcessFactory->getAttributePages()
                );
                $result['range'] = $allPagesRangeVolumeResult['range'];
                $result['amount'] = $allPagesRangeVolumeResult['amount'];
                break;
            case 'setRangeSheet':
                $result['range'] = $AttributeProcessFactory->getSheets();
                $result['amount'] = $AttributeProcessFactory->getVolume();
                break;
            case 'setRangeSize':
                $result['range'] = $AttributeProcessFactory->getSize();
                $result['amount'] = $AttributeProcessFactory->getVolume();
                break;
            case 'setMultiplication':
                $result['range'] = $AttributeProcessFactory->getVolume();
                $result['amount'] = null;
                $result['percentage'] = true;
                $result['percentageType'] = 1;
                break;
            case 'longSide':

                if ($AttributeProcessFactory->getAttributePages() > 1) {
                    $longSide = $lengthOfSides['longSide'] * $AttributeProcessFactory->getAttributePages();
                } else {
                    $longSide = $lengthOfSides['longSide'];
                }

                $result['range'] = $longSide / 1000;
                $result['amount'] = $longSide / 1000 * $AttributeProcessFactory->getVolume();
                break;
            case 'shortSide':

                if ($AttributeProcessFactory->getAttributePages() > 1) {
                    $shortSide = $lengthOfSides['shortSide'] * $AttributeProcessFactory->getAttributePages();
                } else {
                    $shortSide = $lengthOfSides['shortSide'];
                }

                $result['range'] = $shortSide / 1000;
                $result['amount'] = $shortSide / 1000 * $AttributeProcessFactory->getVolume();
                break;
            case 'allAreasLength':

                $length = (($AttributeProcessFactory->getFormatWidth() * 2) +
                        ($AttributeProcessFactory->getFormatHeight() * 2)) / 1000 *
                    ceil($AttributeProcessFactory->getCopiesOnAllSheets());

                if ($AttributeProcessFactory->getAttributePages() > 1) {
                    $length *= $AttributeProcessFactory->getAttributePages();
                }
                $result['amount'] = $result['range'] = $length;
                break;
            case 'alluzytki':
                $allUzytkiResult = $this->calculateAllCopiesOnAllSheets(
                    $AttributeProcessFactory->getCopiesOnAllSheets(),
                    $AttributeProcessFactory->getAttributePages()
                );
                $result['range'] = $allUzytkiResult['range'];
                $result['amount'] = $allUzytkiResult['amount'];
                break;
            case 'paintRangeVolume':
                $inkVolumePl = 0;

                // @TODO check file ink volume

                $result['range'] = $AttributeProcessFactory->getVolume();
                $result['amount'] = $inkVolumePl;
                break;
            case 'setRangePages':
                $result['range'] = $AttributeProcessFactory->getPages();
                $result['amount'] = $AttributeProcessFactory->getVolume();
                break;
            case 'totalArea':
                $result['range'] = $result['amount'] = $AttributeProcessFactory->getTotalArea();
                break;
            case 'folds':
                $result['range'] = $result['amount'] = $totalFolds;
                break;
            case 'totalSheetsArea':
                $result['range'] = $result['amount'] = $totalSheetsArea;
                break;
            case 'totalSheetsAreaRangeSheets':
                $result['range'] = $AttributeProcessFactory->getSheets();
                $result['amount'] = $totalSheetsArea;
                break;
            case 'collectingFolds':
                $maxFolds = $AttributeProcessFactory->getMaxFolds();
                $range = 0;
                if ($maxFolds == 3) {
                    $range = intval($AttributeProcessFactory->getSheets());
                } elseif ($maxFolds == 2) {
                    $range = intval($AttributeProcessFactory->getSheets()) * 2;
                } elseif ($maxFolds == 1) {
                    $range = intval($AttributeProcessFactory->getSheets()) * 4;
                }
                $result['amount'] = $result['range'] = $range;
                break;
            case 'lengthForWidth':
                if ($AttributeProcessFactory->getAttributePages() > 1) {
                    $result['range'] = ($AttributeProcessFactory->getFormatHeight() * $AttributeProcessFactory->getAttributePages()) / 1000;
                    $result['amount'] = ($AttributeProcessFactory->getFormatHeight() * $AttributeProcessFactory->getAttributePages()) / 1000 * $AttributeProcessFactory->getVolume();
                } else {
                    $result['range'] = $AttributeProcessFactory->getFormatHeight() / 1000;
                    $result['amount'] = $AttributeProcessFactory->getFormatHeight() / 1000 * $AttributeProcessFactory->getVolume();
                }
                break;
            case 'lengthForHeight':
                if ($AttributeProcessFactory->getAttributePages() > 1) {
                    $result['range'] = ($AttributeProcessFactory->getFormatHeight() * $AttributeProcessFactory->getAttributePages()) / 1000;
                    $result['amount'] = ($AttributeProcessFactory->getFormatHeight() * $AttributeProcessFactory->getAttributePages()) / 1000 * $AttributeProcessFactory->getVolume();
                } else {
                    $result['range'] = $AttributeProcessFactory->getFormatHeight() / 1000;
                    $result['amount'] = $AttributeProcessFactory->getFormatHeight() / 1000 * $AttributeProcessFactory->getVolume();
                }
                break;
            case 'squareMeterNet':
                $result['range'] = $result['amount'] = $area['sizeNet'];
                break;
            case 'squareMetersForPages':
                $result['range'] = $result['amount'] = $this->calculateSquareForPages($area, $AttributeProcessFactory->getPages());
                break;
            case 'setPercentage':
                $result['range'] = $AttributeProcessFactory->getVolume();
                $result['amount'] = null;
                $result['percentage'] = true;
                $result['percentageType'] = 2;
                break;
            case 'bundle':
                $resultCalculateBundle = $this->calculateBundle(
                    $AttributeProcessFactory->getVolume(),
                    $AttributeProcessFactory->getAttributePages()
                );
                $result['range'] = $resultCalculateBundle['range'];
                $result['amount'] = $resultCalculateBundle['amount'];
                break;
            case 'package':
                $resultCalculatePackage = $this->calculatePackage($AttributeProcessFactory->getAttributePages());
                $result['range'] = $resultCalculatePackage['range'];
                $result['amount'] = $resultCalculatePackage['amount'];
                break;
            case 'setVolumes':
                $resultCalculateSetVolumes = $this->calculateSetVolumes($AttributeProcessFactory->getVolume());
                $result['range'] = $resultCalculateSetVolumes['range'];
                $result['amount'] = $resultCalculateSetVolumes['amount'];
                break;
			case 'allSheetsVolumes':
                $result['range'] = $AttributeProcessFactory->getVolume();
                $result['amount'] = 1;
                break;
            default:
                throw new Exception('Price type function not set!');
                break;
        }

        return $result;
    }

    /**
     * @param int $pages
     * @param int $volume
     * @param int|null $attributeAmount
     * @return array
     */
    private function calculateAllPages($pages, $volume, $attributeAmount = NULL)
    {
        $result = array();
        if ($attributeAmount !== NULL) {
            $result['range'] = $result['amount'] = $attributeAmount * $volume;
        } else {
            $result['range'] = $result['amount'] = $pages * $volume;
        }

        return $result;
    }

    /**
     * @param int $pages
     * @param int $volume
     * @param int|null $attributeAmount
     * @return array
     */
    private function calculateAllPagesRangeVolume($pages, $volume, $attributeAmount = NULL)
    {
        $result = array();
        $result['range'] = $volume;
        if ($attributeAmount !== NULL) {
            $result['amount'] = $attributeAmount * $volume;
        } else {
            $result['amount'] = $pages * $volume;
        }

        return $result;
    }

    /**
     * @param int|$sheets
     * @param int $volume
     * @param int|null $attributeAmount
     * @return array
     */
    private function calculateSheet($sheets, $volume, $attributeAmount = NULL)
    {
        $result = array();

        if ($attributeAmount !== NULL) {
            $result['range'] = $attributeAmount;
            $result['amount'] = $volume * $attributeAmount;
        } else {
            $result['range'] = $sheets;
            $result['amount'] = $sheets;
        }

        return $result;
    }

    /**
     * @param int $volume
     * @param int|null $attributeAmount
     * @return array
     */
    private function calculateSet($volume, $attributeAmount = NULL)
    {
        $result = array();

        if ($attributeAmount !== NULL) {
            $result['range'] = $result['amount'] = $volume * $attributeAmount;
        } else {
            $result['range'] = $result['amount'] = $volume;
        }

        return $result;
    }

    /**
     * @param $area
     * @param $pages
     * @return mixed
     */
    private function calculateSquareForPages($area, $pages)
    {
        return $area['size'] * $pages;
    }

    /**
     * @param $uzytki
     * @param null $attributeAmount
     * @return array
     */
    private function calculateAllCopiesOnAllSheets($uzytki, $attributeAmount = NULL)
    {
        $result = array();

        if (!$attributeAmount) {
            $result['range'] = $result['amount'] = $uzytki;
        } else {
            $result['range'] = $result['amount'] = $uzytki * $attributeAmount;
        }

        return $result;
    }

    /**
     * @param $volume
     * @param $attributeAmount
     * @return array
     */
    private function calculateBundle($volume, $attributeAmount)
    {
        $result = array();

        if ($attributeAmount > 0) {
            $bundleValue = ceil($volume / $attributeAmount);
            if ($bundleValue < 1) {
                $bundleValue = 1;
            }
            $result['range'] = $result['amount'] = $bundleValue;
        } else {
            $result['range'] = $result['amount'] = 1;
        }
        return $result;
    }

    /**
     * @param $attributeAmount
     * @return array
     */
    private function calculatePackage($attributeAmount)
    {
        $result = array();

        if ($attributeAmount > 0) {
            $result['range'] = $result['amount'] = $attributeAmount;
        } else {
            $result['range'] = $result['amount'] = 1;
        }
        return $result;
    }

    /**
     * @param $volume
     * @return mixed
     */
    private function calculateSetVolumes($volume)
    {
        $result['amount'] = 1;
        $result['range'] = $volume;

        return $result;
    }

    /**
     * @param $range
     * @param $volume
     * @param $priceType
     * @return bool|mixed
     */
    private function searchMatchingPrice($range, $volume, $priceType)
    {
        if ($priceType['discounted']) {
            $price = $this->PrintShopConfigDiscountPrice->customGet($priceType['priceType'], $range);
        } else {
            $price = $this->PrintShopConfigPrice->customGet($priceType['priceType'], $range);
        }

        if ($priceType['function'] == 'setVolumes') {
            if (isset($price['lastRangePrice']) && $price['amount'] < $volume) {
                $price['value'] = $volume * $price['lastRangePrice'];
            }
        }else if ($priceType['function'] == 'allSheetsVolumes') {
            if (isset($price['lastRangePrice']) && $price['amount'] < $volume) {
                $price['value'] = $volume * $price['lastRangePrice'];
            }
        }

        return $price;
    }

    /**
     * @param $range
     * @param $priceType
     * @return bool
     */
    private function searchMatchingExpense($range, $priceType)
    {
        if ($priceType['discounted']) {
            $price = $this->PrintShopConfigDiscountPrice->getExpense($priceType['priceType'], $range);
        } else {
            $price = $this->PrintShopConfigPrice->getExpense($priceType['priceType'], $range);
        }

        return $price;
    }

    /**
     * @param $sheets
     * @param $volume
     * @param $sheetIncrease
     * @param $setIncrease
     * @param $projectSheets
     * @return array
     */
    private function addIncreases($sheets, $volume, $sheetIncrease, $setIncrease, $projectSheets)
    {
        if ($sheetIncrease != false) {
            $sheets += intval($sheetIncrease);
        }

        if ($setIncrease != false) {
            $volume += intval($setIncrease);
            $sheets += intval($setIncrease) * $projectSheets;
        }

        return compact('volume', 'sheets');
    }

    /**
     * @param $formatWidth
     * @param $formatHeight
     * @return array
     */
    private function getLengthOfSides($formatWidth, $formatHeight)
    {
        if ($formatWidth > $formatHeight) {
            $longSide = $formatWidth;
            $shortSide = $formatHeight;
        } else {
            $longSide = $formatHeight;
            $shortSide = $formatWidth;
        }

        return compact('longSide', 'shortSide');
    }

    /**
     * @param $attribute
     * @param $priceListID
     * @param $printTypeID
     * @param $workspaceID
     * @return array|bool
     */
    private function getControllerID($attribute, $priceListID, $printTypeID, $workspaceID)
    {
        if ($attribute['function'] == 'standard') {
            $controllerID = $priceListID;
        } elseif ($attribute['function'] == 'print') {
            $controllerID = $printTypeID;
        } elseif ($attribute['function'] == 'paper') {
            $controllerID = $workspaceID;
        } else {
            $this->debug('Undefined attrType function');
            return false;
        }

        return $controllerID;
    }

    /**
     * @param $sheets
     * @param $projectSheets
     * @return array
     */
    private function getAttributeIncreases($sheets, $projectSheets)
    {

        $increases = $this->CalculateStorage->getConfigIncreaseCluster();

        foreach ($increases as $increase) {
            $range = 0;
            $amount = 0;
            if ($increase['function'] == 'sheet') {
                $range = $sheets;
                $amount = 1;
            } elseif ($increase['function'] == 'sheetForProjectSheet') {
                $range = ceil($projectSheets);
                $amount = ceil($projectSheets);
            }

            $increase = $this->CalculateStorage->getConfigIncrease($increase['increaseType'], $range);

            $sheets += floatval($increase['value']) * $amount;

        }

        return compact(
            'sheets'
        );
    }

    /**
     * @param $workspace
     * @param $sheets
     * @return float|int
     */
    private function getTotalSheetsArea($workspace, $sheets)
    {
        return ($workspace['paperWidth'] / 1000) * ($workspace['paperHeight'] / 1000) * $sheets;
    }

    /**
     * @param $attribute
     * @param $optionID
     * @param $weight
     * @param bool $expense
     * @return bool|float|int
     */
    private function getPaperPrice($attribute, $optionID, $weight, $expense = false)
    {
        if( !$weight ) {
            return false;
        }

        if ($attribute['function'] !== 'paper') {
            return false;
        }

        $this->PrintShopConfigPaperPrice->setOptID($optionID);

        $connect = $this->CalculateStorage->getConnectOption($optionID);

        if ($expense) {
            if (!$connect) {
                $result = $this->CalculateStorage->getPaperPrice('expense', $weight);
                $price = $result['expense'] * $weight;
            } else {
                $result = $this->CalculateStorage->getPaperPrice('connectExpense', $weight, $connect['connectOptionID']);
                $price = $result['expense'] * $weight;
            }

        } else {
            if (!$connect) {
                $result = $this->CalculateStorage->getPaperPrice('price', $weight);
                $price = $result['price'] * $weight;
            } else {
                $result = $this->CalculateStorage->getPaperPrice('connectPrice', $weight, $connect['connectOptionID']);
                $price = $result['value'] * $weight;
            }

        }

        return $price;
    }

    /**
     * @param $option
     * @param $workspace
     * @param $sheets
     * @return float|int
     */
    private function getWeightOfPaper($option, $workspace, $sheets)
    {
        $sheetArea = $workspace['paperWidth'] * $workspace['paperHeight'] / 1000000;

        $allSheetsArea = $sheetArea * $sheets;

        $weight = ($option['weight'] / 1000) * $allSheetsArea;

        return $weight;
    }

    /**
     * @param $userID
     * @return array|bool
     */
    private function getDiscountGroups($userID)
    {
        $discountGroups = $this->CalculateStorage->getUserDiscountGroups($userID);
        return $discountGroups;
    }
}