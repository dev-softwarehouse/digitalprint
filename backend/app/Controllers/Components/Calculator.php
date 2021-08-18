<?php

namespace DreamSoft\Controllers\Components;


use DreamSoft\Models\Discount\DiscountGroup;
use DreamSoft\Models\Discount\DiscountGroupLang;
use DreamSoft\Models\Discount\UserDiscountGroup;
use DreamSoft\Models\PrintShop\PrintShopRealizationTime;
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
use DreamSoft\Models\PrintShopConfig\PrintShopConfigRealizationTime;
use DreamSoft\Models\PrintShopProduct\PrintShopFormat;
use DreamSoft\Models\PrintShopProduct\PrintShopIncrease;
use DreamSoft\Models\PrintShopProduct\PrintShopPage;
use DreamSoft\Models\PrintShopProduct\PrintShopStaticPrice;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeTax;
use DreamSoft\Models\PrintShopProduct\PrintShopVolume;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigWorkspace;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrintTypeWorkspace;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrintType;
use DreamSoft\Models\Upload\UploadFile;
use DreamSoft\Libs\Auth;
use DreamSoft\Core\Component;
use DreamSoft\Models\User\UserOption;
use DreamSoft\Models\PrintShop\PrintShopFormatPrintType;
use Exception;


/**
 * Class Calculator
 */
class Calculator extends Component
{

    public $useModels = array();

    /**
     * @var PrintShopFormatPrintType
     */
    protected $PrintShopFormatPrintType;
    /**
     * @var PrintShopConfigPrintTypeWorkspace
     */
    protected $PrintShopConfigPrintTypeWorkspace;
    /**
     * @var PrintShopConfigWorkspace
     */
    protected $PrintShopConfigWorkspace;
    /**
     * @var PrintShopFormat
     */
    protected $PrintShopFormat;
    /**
     * @var PrintShopConfigDetailPrice
     */
    protected $PrintShopConfigDetailPrice;
    /**
     * @var PrintShopConfigOption
     */
    protected $PrintShopConfigOption;
    /**
     * @var PrintShopPage
     */
    protected $PrintShopPage;
    /**
     * @var PrintShopIncrease
     */
    protected $PrintShopIncrease;
    /**
     * @var PrintShopConfigAttribute
     */
    protected $PrintShopConfigAttribute;
    /**
     * @var PrintShopConfigIncrease
     */
    protected $PrintShopConfigIncrease;
    /**
     * @var PrintShopConfigPrice
     */
    protected $PrintShopConfigPrice;
    /**
     * @var PrintShopConfigPaperPrice
     */
    protected $PrintShopConfigPaperPrice;
    /**
     * @var PrintShopConfigRealizationTime
     */
    protected $PrintShopConfigRealizationTime;
    /**
     * @var PrintShopStaticPrice
     */
    protected $PrintShopStaticPrice;
    /**
     * @var RealizationTimeComponent
     */
    protected $RealizationTimeComponent;
    /**
     * @var PrintShopVolume
     */
    protected $PrintShopVolume;
    /**
     * @var PrintShopType
     */
    protected $PrintShopType;
    /**
     * @var PrintShopRealizationTime
     */
    protected $PrintShopRealizationTime;
    /**
     * @var PrintShopTypeTax
     */
    protected $PrintShopTypeTax;
    /**
     * @var PrintShopConfigConnectOption
     */
    protected $PrintShopConfigConnectOption;
    /**
     * @var UserDiscountGroup
     */
    protected $UserDiscountGroup;
    /**
     * @var DiscountGroupLang
     */
    protected $DiscountGroupLang;
    /**
     * @var PrintShopConfigConnectPrice
     */
    protected $PrintShopConfigConnectPrice;
    /**
     * @var PrintShopConfigPrintType
     */
    protected $PrintShopConfigPrintType;

    /**
     * @var DiscountCalculation
     */
    protected $DiscountCalculation;
    /**
     * @var PromotionCalculation
     */
    private $PromotionCalculation;
    /**
     * @var Auth
     */
    protected $Auth;
    /**
     * @var Price
     */
    protected $Price;
    /**
     * @var PrintShopConfigDiscountPrice
     */
    protected $PrintShopConfigDiscountPrice;
    /**
     * @var DiscountGroup
     */
    protected $DiscountGroup;
    /**
     * @var UserOption
     */
    protected $UserOption;
    /**
     * @var PrintShopConfigAttributeRange
     */
    protected $PrintShopConfigAttributeRange;
    /**
     * @var UploadFile
     */
    protected $UploadFile;
    /**
     * @var PrintShopConfigPriceList
     */
    protected $PrintShopConfigPriceList;
    /**
     * @var CalculateStorage
     */
    protected $CalculateStorage;
    /**
     * @var LangComponent
     */
    protected $LangComponent;
    /**
     * @var CalculateAdapter
     */
    private $CalculateAdapter;
    /**
     * @var Standard
     */
    private $Standard;

    /**
     * @var int
     */
    private $formatSlope;
    private $maxFolds;

    public $adminInfo = array();
    public $attributesInfo = array();
    public $productsInfo = array();
    public $realisationTimes = array();
    public $volumes = array();

    protected $customVolumes = array();

    private $selectedDiscount;
    private $selectedPromotions;
    private $optionsRealisationTimes = array();

    /**
     * @var array
     */
    private $priceTypes = array();

    /**
     * @var int
     */
    private $currencyCourse = DEFAULT_COURSE;
    /**
     * @var bool
     */
    private $countBasePrice = false;
    /**
     * @var array
     */
    private $specialAttributes = array();

    /**
     * @var
     */
    private $orderUserID = null;

    /**
     * @var
     */
    protected $selectedTechnology;
    private $activePrintTypes = array();
    /**
     * @var int
     */
    private $userSelectedPrintTypeID = 0;
    /**
     * @var int
     */
    private $userSelectedWorkspaceID = 0;
    /**
     * @var null|int
     */
    private $userSelectedUseForSheet = NULL;

    /**
     * @var int
     */
    private $lastUsedDiscountGroup;

    /**
     * @var array
     */
    private $volumesContainer;
    /**
     * @var array
     */
    private $perimeterContainer;
    /**
     * @var int
     */
    private $fullProjectsSheets;
    /**
     * @var int
     */
    private $ridgeThickness;


    public function __construct()
    {
        parent::__construct();

        $this->Price = Price::getInstance();
        $this->RealizationTimeComponent = RealizationTimeComponent::getInstance();

        $this->PrintShopFormatPrintType = PrintShopFormatPrintType::getInstance();
        $this->PrintShopConfigPrintTypeWorkspace = PrintShopConfigPrintTypeWorkspace::getInstance();
        $this->PrintShopConfigWorkspace = PrintShopConfigWorkspace::getInstance();
        $this->PrintShopFormat = PrintShopFormat::getInstance();
        $this->PrintShopConfigDetailPrice = PrintShopConfigDetailPrice::getInstance();
        $this->PrintShopConfigOption = PrintShopConfigOption::getInstance();
        $this->PrintShopPage = PrintShopPage::getInstance();
        $this->PrintShopIncrease = PrintShopIncrease::getInstance();
        $this->PrintShopConfigAttribute = PrintShopConfigAttribute::getInstance();
        $this->PrintShopConfigIncrease = PrintShopConfigIncrease::getInstance();
        $this->PrintShopConfigPrice = PrintShopConfigPrice::getInstance();
        $this->PrintShopConfigPaperPrice = PrintShopConfigPaperPrice::getInstance();
        $this->PrintShopConfigRealizationTime = PrintShopConfigRealizationTime::getInstance();
        $this->PrintShopStaticPrice = PrintShopStaticPrice::getInstance();
        $this->PrintShopVolume = PrintShopVolume::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopRealizationTime = PrintShopRealizationTime::getInstance();
        $this->PrintShopTypeTax = PrintShopTypeTax::getInstance();
        $this->PrintShopConfigConnectOption = PrintShopConfigConnectOption::getInstance();
        $this->PrintShopConfigConnectPrice = PrintShopConfigConnectPrice::getInstance();
        $this->PrintShopConfigPrintType = PrintShopConfigPrintType::getInstance();
        $this->PrintShopConfigDiscountPrice = PrintShopConfigDiscountPrice::getInstance();
        $this->UserOption = UserOption::getInstance();
        $this->PrintShopConfigAttributeRange = PrintShopConfigAttributeRange::getInstance();
        $this->PrintShopConfigPriceList = PrintShopConfigPriceList::getInstance();
        $this->DiscountCalculation = DiscountCalculation::getInstance();
        $this->PromotionCalculation = PromotionCalculation::getInstance();
        $this->DiscountGroup = DiscountGroup::getInstance();
        $this->UserDiscountGroup = UserDiscountGroup::getInstance();
        $this->DiscountGroupLang = DiscountGroupLang::getInstance();
        $this->UploadFile = UploadFile::getInstance();
        $this->CalculateStorage = CalculateStorage::getInstance();
        $this->LangComponent = LangComponent::getInstance();
        $this->CalculateAdapter = CalculateAdapter::getInstance();
        $this->Standard = Standard::getInstance();
        $this->Auth = new Auth();
    }

    /**
     * @return array
     */
    public function getVolumesContainer()
    {
        return $this->volumesContainer;
    }

    /**
     * @param array $volumesContainer
     */
    public function setVolumesContainer($volumesContainer)
    {
        $this->volumesContainer = $volumesContainer;
    }

    /**
     * @return int
     */
    public function getUserSelectedPrintTypeID()
    {
        return $this->userSelectedPrintTypeID;
    }

    /**
     * @param int $userSelectedPrintTypeID
     */
    public function setUserSelectedPrintTypeID($userSelectedPrintTypeID)
    {
        $this->userSelectedPrintTypeID = $userSelectedPrintTypeID;
    }

    /**
     * @return int
     */
    public function getUserSelectedWorkspaceID()
    {
        return $this->userSelectedWorkspaceID;
    }

    /**
     * @param int $userSelectedWorkspaceID
     */
    public function setUserSelectedWorkspaceID($userSelectedWorkspaceID)
    {
        $this->userSelectedWorkspaceID = $userSelectedWorkspaceID;
    }

    /**
     * @return int|null
     */
    public function getUserSelectedUseForSheet()
    {
        return $this->userSelectedUseForSheet;
    }

    /**
     * @param int|null $userSelectedUseForSheet
     */
    public function setUserSelectedUseForSheet($userSelectedUseForSheet)
    {
        $this->userSelectedUseForSheet = $userSelectedUseForSheet;
    }

    /**
     * @return array
     */
    public function getActivePrintTypes()
    {
        return $this->activePrintTypes;
    }

    /**
     * @param array $activePrintTypes
     */
    public function setActivePrintTypes($activePrintTypes)
    {
        $this->activePrintTypes = $activePrintTypes;
    }

    public function resetActivePrintTypes()
    {
        $this->activePrintTypes = array();
    }

    public function addActivePrintType($typeID, $activePrintType)
    {
        $this->activePrintTypes[$typeID][] = $activePrintType;
    }

    public function getAdminInfo()
    {
        return $this->adminInfo;
    }

    /**
     * @return mixed
     */
    public function getSelectedTechnology()
    {
        return $this->selectedTechnology;
    }

    /**
     * @param mixed $selectedTechnology
     */
    public function setSelectedTechnology($selectedTechnology)
    {
        $this->selectedTechnology = $selectedTechnology;
    }

    /**
     * @return int
     */
    public function getLastUsedDiscountGroup()
    {
        return $this->lastUsedDiscountGroup;
    }

    /**
     * @param int $lastUsedDiscountGroup
     */
    public function setLastUsedDiscountGroup($lastUsedDiscountGroup)
    {
        $this->lastUsedDiscountGroup = $lastUsedDiscountGroup;
    }

    /**
     * @return array
     */
    public function getSpecialAttributes()
    {
        return $this->specialAttributes;
    }

    /**
     * @param $productID
     * @param $specialAttributes
     */
    public function setSpecialAttributes($productID, $specialAttributes)
    {
        $this->specialAttributes[$productID] = $specialAttributes;
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
     * @param mixed $selectedDiscount
     */
    public function setSelectedDiscount($selectedDiscount)
    {
        $this->selectedDiscount = $selectedDiscount;
    }

    /**
     * @return mixed
     */
    public function getSelectedDiscount()
    {
        return $this->selectedDiscount;
    }

    /**
     * @return mixed
     */
    public function getSelectedPromotions()
    {
        return $this->selectedPromotions;
    }

    /**
     * @param mixed $selectedPromotions
     */
    public function setSelectedPromotions($selectedPromotions)
    {
        $this->selectedPromotions = $selectedPromotions;
    }

    /**
     * @param array $optionsRealisationTimes
     */
    public function setOptionsRealisationTimes($optionsRealisationTimes)
    {
        $this->optionsRealisationTimes = $optionsRealisationTimes;
    }

    /**
     * @return array
     */
    public function getOptionsRealisationTimes()
    {
        return $this->optionsRealisationTimes;
    }

    /**
     * @param $customVolumes
     */
    public function setCustomVolumes($customVolumes)
    {
        $this->customVolumes = $customVolumes;
    }

    /**
     * @return array
     */
    public function getCustomVolumes()
    {
        return $this->customVolumes;
    }

    /**
     * @return int
     */
    public function getCurrencyCourse()
    {
        return $this->currencyCourse;
    }

    /**
     * @param int $currencyCourse
     */
    public function setCurrencyCourse($currencyCourse)
    {
        $this->currencyCourse = $currencyCourse;
    }

    /**
     * @return int
     */
    public function getFormatSlope(): int
    {
        return $this->formatSlope;
    }

    /**
     * @param int $formatSlope
     */
    public function setFormatSlope(int $formatSlope): void
    {
        $this->formatSlope = $formatSlope;
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->PrintShopRealizationTime->setDomainID($domainID);
        $this->DiscountCalculation->setDomainID($domainID);
        $this->UserDiscountGroup->setDomainID($domainID);
        $this->PrintShopTypeTax->setDomainID($domainID);
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
     * @return mixed
     */
    public function getOrderUserID()
    {
        return $this->orderUserID;
    }

    /**
     * @param mixed $orderUserID
     */
    public function setOrderUserID($orderUserID)
    {
        $this->orderUserID = $orderUserID;
    }

    /**
     * @return array
     */
    public function getPerimeterContainer()
    {
        return $this->perimeterContainer;
    }

    /**
     * @param array $perimeterContainer
     */
    public function setPerimeterContainer($perimeterContainer)
    {
        $this->perimeterContainer = $perimeterContainer;
    }

    /**
     * @return int
     */
    public function getFullProjectsSheets()
    {
        return $this->fullProjectsSheets;
    }

    /**
     * @param int $fullProjectsSheets
     */
    public function setFullProjectsSheets($fullProjectsSheets)
    {
        $this->fullProjectsSheets = $fullProjectsSheets;
    }

    /**
     * @param $products
     * @return array|bool
     */
    public function searchOptionsRealisationTimes($products)
    {

        $optionsRealisationTimes = $this->getOptionsRealisationTimes();

        if (empty($optionsRealisationTimes)) {
            $optionsList = array();
            if (!empty($products)) {
                foreach ($products as $product) {
                    if (!empty($product['options'])) {
                        foreach ($product['options'] as $row) {
                            $optionsList[] = $row['optID'];
                        }
                    }
                    $optionsRealisationTimes = $this->PrintShopConfigRealizationTime->getByList($optionsList, 'DESC');
                    $this->setOptionsRealisationTimes($optionsRealisationTimes);
                }
            }
        }

        return $optionsRealisationTimes;

    }

    /**
     * @param array $adminInfo
     * @return int
     */
    private function getSelectedPrintTypeID($adminInfo)
    {
        $selectedPrintTypeID = $adminInfo['selectedPrintType']['printTypeID'];
        return $selectedPrintTypeID;
    }

    /**
     * @param $adminInfo
     * @return array|bool
     */
    private function getNotSelectedPrintTypes($adminInfo)
    {
        $notSelectedPrintTypes = false;
        if(array_key_exists('notSelectedPrintTypes', $adminInfo)) {
            $notSelectedPrintTypes = $adminInfo['notSelectedPrintTypes'];
        }

        if (!$notSelectedPrintTypes) {
            return false;
        }

        $aggregatePrintTypes = array();
        foreach ($notSelectedPrintTypes as $notSelectedPrintType) {
            $aggregatePrintTypes[] = $notSelectedPrintType['printTypeID'];
        }

        return $aggregatePrintTypes;
    }

    /**
     * @param array $adminInfo
     * @param int $ID
     * @return int|bool
     */
    private function getSelectedPrintTypeIndex($adminInfo, $ID)
    {
        foreach ($adminInfo['printTypes'] as $index => $printType) {
            if ($printType['printTypeID'] == $ID) {
                return $index;
            }
        }
        return false;
    }

    /**
     * @param array $adminInfo
     * @return int
     */
    private function getSelectedWorkspaceID($adminInfo)
    {
        $workspaceID = $adminInfo['selectedPrintType']['workspaceID'];
        return $workspaceID;
    }

    /**
     * @param array $adminInfo
     * @param int $printTypeIndex
     * @param int $ID
     * @return bool|int
     */
    private function getSelectedWorkspaceIndex($adminInfo, $printTypeIndex, $ID)
    {
        foreach ($adminInfo['printTypes'][$printTypeIndex]['workspaces'] as $index => $printType) {
            if ($printType['workspaceID'] == $ID) {
                return $index;
            }
        }
        return false;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $amount
     * @param $volume
     * @param $products
     * @param $tax
     * @return mixed
     * @throws Exception
     */
    public function calculate($groupID, $typeID, $amount, $volume, $products, $tax)
    {

        $calcInfo = array();
        $calculations = array();
        $this->productsInfo = array();
        $errorsInfo = array();

        $additionalPrice = 0;
        $additionalWeight = 0;

        foreach ($products as $prodIdx => $product) {

            if ( array_key_exists('printTypeID', $product) ) {
                $this->setUserSelectedPrintTypeID($product['printTypeID']);
            }

            if ( array_key_exists('workspaceID', $product) ) {
                $this->setUserSelectedWorkspaceID($product['workspaceID']);
            }

            if( array_key_exists('useForSheet', $product) ) {
                $this->setUserSelectedUseForSheet($product['useForSheet']);
            } else {
                $this->setUserSelectedUseForSheet(NULL);
            }

            $this->adminInfo = array();

            if (!$product['groupID']) {
                $type = $this->CalculateStorage->getType($product['typeID']);
                $product['groupID'] = $type['groupID'];
            }

            $pagesRange = $this->CalculateStorage->getPagesRange($product['groupID'], $product['typeID']);

            if ($pagesRange) {

                if ($pagesRange['minPages'] > 0 && $product['pages'] < $pagesRange['minPages']) {
                    $errorsInfo[] = array(
                        'translate' => $this->LangComponent->translate('minimum_number_of_pages'),
                        'text' => 'Minimal number of pages not achieved. Minimal pages is: ' . $pagesRange['minPages'],
                        'minimumPages' => $pagesRange['minPages'],
                        'maximumPages' => $pagesRange['maxPages']
                    );
                    continue;
                }

                if ($pagesRange['maxPages'] > 0 && $product['pages'] > $pagesRange['maxPages']) {
                    $errorsInfo[] = array(
                        'translate' => $this->LangComponent->translate('maximum_number_of_pages'),
                        'text' => 'Maximum number of pages exceeded. Max number of pages is: ' . $pagesRange['maxPages'],
                        'maximumPages' => $pagesRange['maxPages'],
                        'minimumPages' => $pagesRange['minPages']
                    );
                    continue;
                }

            }

            $errorAttributesPages = $this->checkAttributesPages($product['attrPages']);

            if ($errorAttributesPages) {
                $errorsInfo = array_merge($errorsInfo, $errorAttributesPages);
                continue;
            }

            $doublePage = $this->CalculateStorage->getDoublePage($product['groupID'], $product['typeID']);

            $errorThickness = $this->checkProductThickness($product['options'], $product['pages'], $doublePage);

            if ($errorThickness) {
                $errorsInfo = array_merge($errorsInfo, $errorThickness);
                continue;
            }

            $format = $this->CalculateStorage->getFormat($product['formatID']);
            if ($format['custom']) {
                $format['width'] = $product['width'];
                $format['height'] = $product['height'];
            }

            $calcResult = $this->_calcPrice(
                $product['groupID'],
                $product['typeID'],
                $product['formatID'],
                $format,
                $product['width'],
                $product['height'],
                $product['pages'],
                $volume,
                $product['options'],
                $product['attrPages'],
                $prodIdx==(count($products)-1)
            );

            $productInfoIdx = count($this->productsInfo) - 1;
            if ($pagesRange) {
                $this->productsInfo[$productInfoIdx]['pageRanges'] = array(
                    'minimumPages' => $pagesRange['minPages'],
                    'maximumPages' => $pagesRange['maxPages'],
                    'minimumWarning' => $this->LangComponent->translate('minimum_number_of_pages'),
                    'maximumWarning' => $this->LangComponent->translate('maximum_number_of_pages'),
                );
            }
            $calculations[] = $calcResult;

            $selectedPrintTypeID = $this->getSelectedPrintTypeID($this->adminInfo);
            $selectedPrintTypeIndex = $this->getSelectedPrintTypeIndex($this->adminInfo, $selectedPrintTypeID);

            $selectedWorkspaceID = $this->getSelectedWorkspaceID($this->adminInfo);
            $selectedWorkspaceIndex = $this->getSelectedWorkspaceIndex($this->adminInfo, $selectedPrintTypeIndex, $selectedWorkspaceID);

            $selectedWorkspacePrice = $this->adminInfo['printTypes'][$selectedPrintTypeIndex]['workspaces'][$selectedWorkspaceIndex]['price'];
            $selectedWorkspaceExpense = $this->adminInfo['printTypes'][$selectedPrintTypeIndex]['workspaces'][$selectedWorkspaceIndex]['expense'];

            $specialAttributes = array();
            $totalSelectedPrice = 0;
            $totalSelectedExpense = 0;
            if (!empty($product['specialAttributes'])) {
                foreach ($product['specialAttributes'] as $specialAttribute) {
                    $sumPrice = 0;
                    $sumExpense = 0;
                    $sumWeight = 0;
                    $specialAttribute['price'] = $this->Price->getPriceToDb($specialAttribute['price']);
                    $specialAttribute['expense'] = $this->Price->getPriceToDb($specialAttribute['expense']);

                    if ($specialAttribute['type'] == SPECIAL_ATTRIBUTE_TYPE_AMOUNT) {
                        $sumPrice = $specialAttribute['price'] * $volume;
                        $sumExpense = $specialAttribute['expense'] * $volume;
                        $sumWeight += ($specialAttribute['weight'] / 1000) * $volume;
                    } else if ($specialAttribute['type'] == SPECIAL_ATTRIBUTE_TYPE_METERS) {
                        $sumPrice = $specialAttribute['price'] * $calcResult['area'];
                        $sumExpense = $specialAttribute['expense'] * $calcResult['area'];
                        $sumWeight += ($specialAttribute['weight'] / 1000) * $calcResult['area'];
                    }

                    $totalSelectedPrice = intval($selectedWorkspacePrice) + intval($sumPrice);
                    $totalSelectedExpense = intval($selectedWorkspaceExpense) + intval($sumExpense);

                    $additionalPrice += $sumPrice;
                    $additionalWeight += $sumWeight;
                    $specialAttribute['price'] = $this->Price->getPriceToView($specialAttribute['price']);
                    $specialAttribute['expense'] = $this->Price->getPriceToView($specialAttribute['expense']);
                    $specialAttribute['sumPrice'] = $this->Price->getPriceToView($sumPrice);
                    $specialAttribute['sumExpense'] = $this->Price->getPriceToView($sumExpense);
                    $specialAttribute['sumWeight'] = str_replace('.', MATH_DIVIDE_SYMBOL, round($sumWeight, 2));
                    $specialAttributes[] = $specialAttribute;
                }
            }

            if ($totalSelectedPrice > 0) {
                $this->adminInfo['printTypes'][$selectedPrintTypeIndex]['workspaces'][$selectedWorkspaceIndex]['totalPrice'] = $this->Price->getPriceToView(
                    $totalSelectedPrice
                );
            }

            if ($totalSelectedExpense) {
                $this->adminInfo['printTypes'][$selectedPrintTypeIndex]['workspaces'][$selectedWorkspaceIndex]['totalExpense'] = $this->Price->getPriceToView(
                    $totalSelectedExpense
                );
            }

            $this->setSpecialAttributes($product['typeID'], $specialAttributes);

            $productName = NULL;
            if( array_key_exists('name', $product) ) {
                $productName = $product['name'];
            }

            $this->adminInfo['product'] = array(
                'name' => $productName,
                'typeID' => $product['typeID'],
                'taxName' => $tax['name'],
                'taxValue' => $tax['value'],
                'specialAttributes' => $specialAttributes
            );
            $calcInfo[] = $this->adminInfo;
        }

        if (empty($calculations)) {
            return array(
                'correctCalculate' => false,
                'errors' => $errorsInfo
            );
        }

        if (!isset($this->realisationTimes[$typeID])) {
            $this->PrintShopRealizationTime->setGroupID($groupID);
            $this->PrintShopRealizationTime->setTypeID($typeID);

            $realisationTimes = $this->PrintShopRealizationTime->getRealizationTimes(NULL);
            $realisationTimesDetails = $this->PrintShopRealizationTime->getRealizationTimeDetailsAll();

            if ($realisationTimes && $realisationTimesDetails) {

                foreach ($realisationTimes as $rtKey => $rt) {

                    if ( !array_key_exists($rt['ID'], $realisationTimesDetails)) {

                        if ($rt['active'] == 0) {
                            unset($realisationTimes[$rtKey]);
                            continue;
                        }
                    }

                    if (isset($realisationTimesDetails[$rt['ID']])) {

                        foreach ($realisationTimesDetails[$rt['ID']] as $row) {

                            $row = $this->identifyRealizationTimeDetail($row);

                            switch ($row['type']) {
                                case 'volume':

                                    if( $row['active'] == 0 ) {
                                        $this->volumes[$row['realizationID']][$row['volume']] = array(
                                            'active' => false,
                                            'volume' => $row['volume']
                                        );
                                    } else {
                                        $this->volumes[$row['realizationID']][$row['volume']] = array(
                                            'days' => $row['days'],
                                            'pricePercentage' => $row['pricePercentage'],
                                            'active' => true,
                                            'replaced' => true
                                        );
                                    }

                                    break;
                                case 'type':

                                    $realisationTimes[$rtKey]['days'] = $row['days'];
                                    $realisationTimes[$rtKey]['pricePercentage'] = $row['pricePercentage'];
                                    $realisationTimes[$rtKey]['replaced'] = 2;
                                    $realisationTimes[$rtKey]['active'] = $row['active'];

                                    break;
                                case 'group':

                                    $replaced = false;
                                    if( array_key_exists($rtKey, $realisationTimes) &&
                                        array_key_exists('replaced', $realisationTimes[$rtKey])
                                    && $realisationTimes[$rtKey]['replaced'] > 1 ) {
                                        $replaced = true;
                                    }

                                    if(!$replaced) {
                                        $realisationTimes[$rtKey]['days'] = $row['days'];
                                        $realisationTimes[$rtKey]['pricePercentage'] = $row['pricePercentage'];
                                        $realisationTimes[$rtKey]['replaced'] = 1;
                                        $realisationTimes[$rtKey]['active'] = $row['active'];
                                    }
                                    break;
                            }

                        }
                    }

                }
            }

            foreach ($realisationTimes as $key => $row) {
                if( intval($row['active']) == 0 ) {
                    unset($realisationTimes[$key]);
                }
            }

            $realisationTimesResult = array();
            if ($realisationTimes) {
                foreach ($realisationTimes as $key => $row) {
                    $row['date'] = $this->RealizationTimeComponent->calcRealizationDate($row['days']);
                    $realisationTimesResult[$row['ID']] = $row;
                }
            }
            $this->realisationTimes[$typeID] = $realisationTimesResult;
        }

        $result['products'] = $this->productsInfo;

        if (sourceApp === 'manager') {
            $result['info'] = $calcInfo;
            $result['specialAttributes'] = $specialAttributes;
        } else {
            $result['info'] = null;
        }

        $result['response'] = true;

        $course = $this->getCurrencyCourse();
        if (!$course) {
            $course = DEFAULT_COURSE;
        }

        $endCalculation = compact('amount', 'groupID', 'typeID', 'volume');
        $endCalculation['price'] = 0;
        $endCalculation['basePrice'] = 0;
        $endCalculation['weight'] = 0;
        $endCalculation['expense'] = null;

        $increaseRealizationTime = 0;

        $allProcessDiscount = 0;
        foreach ($calculations as $calculation) {

            $allProcessDiscount += $calculation['attrDiscount'];

            $endCalculation['basePrice'] += $calculation['basePrice'];
            $endCalculation['price'] += $calculation['price'];

            $endCalculation['attrDiscount'] = $calculation['attrDiscount'];
            if ($calculation['expense']) $endCalculation['expense'] += $calculation['expense'];
            $endCalculation['weight'] += $calculation['weight'];

            if ($calculation['increaseRealizationTime'] > $increaseRealizationTime) {
                $increaseRealizationTime = $calculation['increaseRealizationTime'];
            }
        }

        $loggedUser = $this->Auth->getLoggedUser();

        $areaInMeters = NULL;
        $percentageDiscount = 0;

        if (count($calculations) == 1) {
            $areaInMeters = $calculations[0]['area'];
        }

        if ((sourceApp === 'manager' && $this->getOrderUserID() > 0) || $loggedUser) {

            $this->DiscountCalculation->setSelectedDiscount($this->getSelectedDiscount());

            $percentageDiscount = $this->DiscountCalculation->calculate($volume, $areaInMeters);

        }

        $this->PromotionCalculation->setSelectedPromotions($this->getSelectedPromotions());

        $percentagePromotion = $this->PromotionCalculation->calculate($volume, $areaInMeters);

        if (($percentagePromotion || $percentageDiscount) && $percentagePromotion > $percentageDiscount) {
            $endCalculation['percentageDiscount'] = $percentagePromotion;
        } else {
            $endCalculation['percentageDiscount'] = $percentageDiscount;
        }

        if ($amount < 1) {
            $amount = 1;
        }

        if ($course > 0) {
            $endCalculation['price'] = $endCalculation['price'] / ($course / 100);
            $endCalculation['basePrice'] = $endCalculation['basePrice'] / ($course / 100);
            $allProcessDiscount = $allProcessDiscount / ($course / 100);
        }

        $endCalculation['price'] *= $amount;
        $additionalPrice *= $amount;
        $additionalWeight *= $amount;
        $endCalculation['expense'] *= $amount;
        $endCalculation['weight'] *= $amount;

        if ($additionalPrice > 0) {
            $endCalculation['price'] += $additionalPrice;
        }

        if ($additionalWeight > 0) {
            $endCalculation['weight'] += $additionalWeight;
        }

        if ($tax) {
            $endCalculation['priceBrutto'] = $endCalculation['price'] * (1 + ($tax['value'] / 100));
        } else {
            $endCalculation['priceBrutto'] = $endCalculation['price'];
        }

        if ($tax) {
            $endCalculation['baseGrossPrice'] = $endCalculation['basePrice'] * (1 + ($tax['value'] / 100));
        } else {
            $endCalculation['baseGrossPrice'] = $endCalculation['basePrice'];
        }

        $realisationTimeDiscounts = array();

        if (!empty($this->realisationTimes[$typeID])) {
            foreach ($this->realisationTimes[$typeID] as $key => $row) {

                $oldPrice = false;
                $oldPriceGross = false;

                $tmpPrice = $endCalculation['basePrice'];

                $preparedPrice = $this->preparePrice($tmpPrice, $row['pricePercentage'], $tax['value']);
                $tmpPrice = $preparedPrice['price'];

                $discount = false;
                if ($percentageDiscount > 0) {
                    $discount = ($tmpPrice * $percentageDiscount) / 100;
                }

                $promotionDiscount = false;
                if ($percentagePromotion > 0) {
                    $promotionDiscount = ($tmpPrice * $percentagePromotion) / 100;
                }

                $discountAggregation = array(
                    'processDiscount' => $allProcessDiscount,
                    'discount' => $discount,
                    'promotionDiscount' => $promotionDiscount
                );

                $bestDiscountKey = array_search(max($discountAggregation), $discountAggregation);

                if ($discountAggregation[$bestDiscountKey] > 0) {
                    $oldPrice = $tmpPrice;
                    $oldPriceGross = $tmpPrice * (1 + ($tax['value'] / 100));


                    switch ($bestDiscountKey) {
                        case 'processDiscount':

                            $realisationTimeDiscounts[$row['ID']] = $allProcessDiscount;
                            $tmpPrice -= $allProcessDiscount;

                            break;
                        case 'discount':

                            $realisationTimeDiscounts[$row['ID']] = $discount;
                            $tmpPrice = $tmpPrice - $discount;

                            break;
                        case 'promotionDiscount':

                            $realisationTimeDiscounts[$row['ID']] = $promotionDiscount;
                            $tmpPrice = $tmpPrice - $promotionDiscount;

                            break;
                        default:


                            break;
                    }

                } else {
                    $bestDiscountKey = null;
                }

                if ($additionalPrice > 0) {
                    $tmpPrice += $additionalPrice;
                }

                if( $amount > 1 ) {
                    $tmpPrice *= $amount;
                }

                $tmpPriceGross = $tmpPrice * (1 + ($tax['value'] / 100));

                $newDate = NULL;
                $active = true;
                $actDays = false;

                if( array_key_exists($row['ID'], $this->volumes) ) {

                    if( array_key_exists($volume, $this->volumes[$row['ID']]) ) {
                        if ($this->volumes[$row['ID']][$volume]) {
                            if(array_key_exists('active', $this->volumes[$row['ID']][$volume])) {
                                $active = $this->volumes[$row['ID']][$volume]['active'];
                            }
                            if(array_key_exists('days', $this->volumes[$row['ID']][$volume])) {
                                $actDays = $this->volumes[$row['ID']][$volume]['days'];
                            }
                        }
                    }

                    if (!empty($this->volumes[$row['ID']])) {
                        foreach ($this->volumes[$row['ID']] as $keyVolume => $rowVolume) {
                            if(!array_key_exists('days', $rowVolume)) {
                                $rowVolume['days'] = 0;
                            }
                            if ($keyVolume <= $volume && ($actDays > $rowVolume['days'] || !$actDays)) {
                                $actDays = $rowVolume['days'];
                            }
                        }
                    }

                }

                $moreDayForVolume = $this->getMoreDaysForVolume($products, $volume);

                if ($moreDayForVolume > 0) {
                    $actDays += $moreDayForVolume;
                } else if ($moreDayForVolume < 0) {
                    $actDays -= abs($moreDayForVolume);
                }

                if ($active && $actDays) {
                    $actDays = intval($row['days']) + $actDays;
                    if( $actDays < 0 ) {
                        $actDays = 0;
                    }
                    $newDate = $this->RealizationTimeComponent->calcRealizationDate($actDays);
                }

                $addItem = array(
                    'price' => $this->Price->getPriceToView($tmpPrice),
                    'priceBrutto' => $this->Price->getPriceToView($tmpPriceGross),
                    'volume' => $volume,
                    'date' => $newDate,
                    'active' => $active,
                    'weight' => $endCalculation['weight']
                );

                if (in_array($volume, $this->getCustomVolumes())) {
                    $addItem['custom'] = true;
                } else {
                    $addItem['custom'] = false;
                }

                if ($oldPrice) {
                    $addItem['oldPrice'] = $this->Price->getPriceToView($oldPrice);
                    $addItem['oldPriceBrutto'] = $this->Price->getPriceToView($oldPriceGross);
                    $addItem['price'] = $this->Price->getPriceToView($tmpPrice);
                    $addItem['priceBrutto'] = $this->Price->getPriceToView($tmpPriceGross);
                    if ($percentageDiscount) {
                        $addItem['percentageDiscount'] = $percentageDiscount;
                    }

                    if ($percentagePromotion && $percentagePromotion > $percentageDiscount) {
                        $addItem['percentageDiscount'] = $percentagePromotion;
                    }
                    $addItem['promotionType'] = $bestDiscountKey;
                }

                $this->realisationTimes[$typeID][$key]['volumes'][] = $addItem;
                unset($addItem);
            }
        }

        $endCalculation['oldPrice'] = $endCalculation['basePrice'];
        $endCalculation['basePrice'] = $this->Price->getPriceToView($endCalculation['basePrice']);
        $endCalculation['baseGrossPrice'] = $this->Price->getPriceToView($endCalculation['baseGrossPrice']);
        $endCalculation['tax'] = $tax;

        $result['calculation'] = $endCalculation;

        $result['realisationTimes'] = $this->realisationTimes;
        $result['calculation']['realisationTimeDiscounts'] = $realisationTimeDiscounts;
        $result['correctCalculation'] = true;
        $result['errors'] = $errorsInfo;


        $selectedPrintTypeID = $this->getSelectedPrintTypeID($this->adminInfo);
        $selectedIndex = $this->getSelectedPrintTypeIndex($this->adminInfo, $selectedPrintTypeID);
        $result['calculation']['priceListIcon'] = $this->adminInfo['printTypes'][$selectedIndex]['priceListIcon'];
        $result['calculation']['priceLists'] = $this->adminInfo['printTypes'][$selectedIndex]['priceLists'];

        $notSelectedPrintTypes = $this->getNotSelectedPrintTypes($this->adminInfo);
        if ($notSelectedPrintTypes) {
            foreach ($notSelectedPrintTypes as $notSelectedPrintTypeID) {
                $selectedIndex = $this->getSelectedPrintTypeIndex($this->adminInfo, $notSelectedPrintTypeID);
                $result['calculation']['notSelectedPrintTypes'][] = $this->adminInfo['printTypes'][$selectedIndex]['priceLists'];
            }
        }


        return $result;

    }

    /**
     * @param $realizationTimeDetailEntity
     * @return mixed
     */
    private function identifyRealizationTimeDetail($realizationTimeDetailEntity)
    {
        if( intval($realizationTimeDetailEntity['volume']) > 0 && intval($realizationTimeDetailEntity['typeID']) > 0 &&
        intval($realizationTimeDetailEntity['groupID']) > 0)  {
            $realizationTimeDetailEntity['type'] = 'volume';
            return $realizationTimeDetailEntity;
        }

        if( intval($realizationTimeDetailEntity['volume']) == 0 && intval($realizationTimeDetailEntity['typeID']) > 0 &&
            intval($realizationTimeDetailEntity['groupID']) > 0 ) {
            $realizationTimeDetailEntity['type'] = 'type';
            return $realizationTimeDetailEntity;
        }

        if( intval($realizationTimeDetailEntity['volume']) == 0 && intval($realizationTimeDetailEntity['typeID']) == 0 &&
            intval($realizationTimeDetailEntity['groupID']) > 0 ) {
            $realizationTimeDetailEntity['type'] = 'group';
            return $realizationTimeDetailEntity;
        }

        return $realizationTimeDetailEntity;
    }

    /**
     * @param $price
     * @param $pricePercentage
     * @param $taxValue
     * @return array
     */
    private function preparePrice($price, $pricePercentage, $taxValue)
    {
        $result = array();
        $price = $price * (1 + ($pricePercentage / 100));
        $priceGross = $price * (1 + ($taxValue / 100));
        $result['price'] = $price;
        $result['priceGross'] = $priceGross;
        return $result;
    }

    /**
     * @param $products
     * @param $volume
     * @return int
     */
    private function getMoreDaysForVolume($products, $volume)
    {
        $optionsRealizationTimes = $this->searchOptionsRealisationTimes($products);

        $sumDaysToAdded = 0;
        $excludedOptions = array();

        $foundToAdded = $this->searchByVolume($optionsRealizationTimes, $volume);

        if( $foundToAdded['daysToAdd'] > 0 ) {
            $sumDaysToAdded += $foundToAdded['daysToAdd'];
        } else if ( $foundToAdded['daysToAdd'] < 0 ) {
            $sumDaysToAdded -= abs($foundToAdded['daysToAdd']);
        }

        if( is_array( $foundToAdded['optionToExclude'] ) ) {
            $excludedOptions = array_merge($excludedOptions, $foundToAdded['optionToExclude']);
        }

        $previousVolume = $this->getPreviousVolume($volume);

        while($previousVolume) {

            $foundToAdded = $this->searchByVolume($optionsRealizationTimes, $previousVolume, $excludedOptions, true);

            if( $foundToAdded['daysToAdd'] > 0 ) {
                $sumDaysToAdded += $foundToAdded['daysToAdd'];
            } else if ( $foundToAdded['daysToAdd'] < 0 ) {
                $sumDaysToAdded -= abs($foundToAdded['daysToAdd']);
            }
            if ( is_array($foundToAdded['optionToExclude']) ) {
                $excludedOptions = array_merge($excludedOptions, $foundToAdded['optionToExclude']);
            } else {
                $excludedOptions = array();
            }

            $previousVolume = $this->getPreviousVolume($previousVolume);

        }

        return $sumDaysToAdded;

    }

    /**
     * @param $currentVolume
     * @return bool|mixed
     */
    private function getPreviousVolume($currentVolume)
    {
        $volumesList = $this->getVolumesContainer();

        $currentKey = $this->getVolumeKey($volumesList, $currentVolume);

        if( isset($volumesList[$currentKey-1]) ) {
            return $volumesList[$currentKey-1]['volume'];
        }

        return false;
    }

    /**
     * @param $volumesList
     * @param $volume
     * @return bool|int|string
     */
    private function getVolumeKey($volumesList, $volume)
    {

        if (!$volumesList) {
            return false;
        }

        foreach ($volumesList as $key => $row) {

            if ($row['volume'] == $volume) {
                return $key;
            }

        }

        return false;

    }

    /**
     * @param $optionsRealizationTimes
     * @param $volume
     * @param array $excludedOptions
     * @param bool $checkSmallerVolume
     * @return array|bool
     */
    private function searchByVolume($optionsRealizationTimes, $volume, $excludedOptions = array(), $checkSmallerVolume = false)
    {
        if (!$optionsRealizationTimes) {
            return false;
        }

        $daysToAdd = 0;
        $optionToExclude = array();

        foreach ($optionsRealizationTimes as $optID => $optionVolumes) {

            if( in_array($optID, $excludedOptions) ) {
                continue;
            }

            foreach ($optionVolumes as $ovValue) {

                if( in_array($optID, $optionToExclude) ) {
                    continue;
                }

                if( $checkSmallerVolume ) {

                    if ($ovValue['volume'] <= $volume) {
                        $optionToExclude[] = $optID;
                        if ($ovValue['days'] > 0) {
                            $daysToAdd += intval($ovValue['days']);
                        } else {
                            $daysToAdd -= abs($ovValue['days']);
                        }
                    }

                } else {

                    if ($ovValue['volume'] == $volume) {
                        $optionToExclude[] = $optID;
                        if ($ovValue['days'] > 0) {
                            $daysToAdd += intval($ovValue['days']);
                        } else {
                            $daysToAdd -= abs($ovValue['days']);
                        }
                    } else if ($ovValue['volume'] <= $volume) {
                        $optionToExclude[] = $optID;
                        if ($ovValue['days'] > 0) {
                            $daysToAdd += intval($ovValue['days']);
                        } else {
                            $daysToAdd -= abs($ovValue['days']);
                        }
                    }

                }

            }
        }

        return compact(
            'daysToAdd',
            'optionToExclude'
        );
    }

    /**
     * @param $maxFolds
     */
    private function setMaxFolds($maxFolds)
    {
        $this->maxFolds = $maxFolds;
    }

    /**
     * @return mixed
     */
    private function getMaxFolds()
    {
        return $this->maxFolds;
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
     * @param $attributeAmount
     * @return array
     * @throws Exception
     */
    private function _calcPrice($groupID, $typeID, $formatID, $format, $formatWidth, $formatHeight, $pages, $volume, $attributes, $attributeAmount, $addRidgeThickness)
    {
        $this->addRidgeThickness=$addRidgeThickness;
        $adminInfo = array();
        $calcPrices = array();
        $weight = null;

        $this->productsInfo[] = array(
            'groupID' => $groupID,
            'typeID' => $typeID,
            'formatID' => $formatID,
            'formatWidth' => $formatWidth,
            'formatHeight' => $formatHeight,
            'pages' => $pages,
            'attributes' => array()
        );

        $this->PrintShopIncrease->setGroupID($groupID);
        $this->PrintShopIncrease->setTypeID($typeID);

        $printTypes = $this->_printTypes($formatID, $volume);
        if (empty($printTypes)) {
            return array('error' => 'No print types');
        }

        $size = null;
        $oneSide = null;
        $rollLength = null;
        $printRotated = 0;
        $maxFolds = null;

        $doublePage = $this->CalculateStorage->getDoublePage($groupID, $typeID);
        $similarPages = $this->CalculateStorage->getSimilarPages($groupID, $typeID);

        $setIncrease = $this->CalculateStorage->getIncrease('set', $volume, $formatID);

        $optionsArray = array();

        $aggregateOptions = array();
        foreach ($attributes as $attribute) {
            if ($attribute['optID'] && !in_array($attribute['optID'], $aggregateOptions)) {
                $aggregateOptions[] = $attribute['optID'];
            }
        }
        $this->CalculateStorage->setOptionsByList($aggregateOptions);

        foreach ($attributes as $attr) {
            $optionsArray[] = $attr['optID'];

            $option = $this->CalculateStorage->getOption($attr['optID']);

            if ($option['oneSide'] == 1) {
                $oneSide = true;
            }

            if (doubleval($option['sizePage']) > 0) {
                $size += $this->calculateProductThickness($pages, $option['sizePage'], $doublePage);
                $this->ridgeThickness+=$size;
            }
            if ($option['rollLength'] > 0) {
                $rollLength = $option['rollLength'];
            }

            if (isset($option['maxFolds']) && $option['maxFolds'] !== null) {
                $maxFolds = $option['maxFolds'];
            }

            $this->setMaxFolds($maxFolds);

        }

        $adminInfo['printTypes'] = array();

        $aggregatePriceLists = array();
        $aggregateWorkspaces = array();
        $aggregatePrintTypes = array();

        foreach ($printTypes as $printType) {
            if (!in_array($printType['pricelistID'], $aggregatePriceLists)) {
                $aggregatePriceLists[] = $printType['pricelistID'];
            }
            if ($printType['workspaceID'] && !in_array($printType['workspaceID'], $aggregateWorkspaces)) {
                $aggregateWorkspaces[] = $printType['workspaceID'];
            }
            if ($printType['printTypeID'] && !in_array($printType['printTypeID'], $aggregatePrintTypes)) {
                $aggregatePrintTypes[] = $printType['printTypeID'];
            }
        }

        $printTypeWorkspaces = $this->CalculateStorage->getPrintTypeWorkspaces($formatID, $aggregatePrintTypes);

        $this->CalculateStorage->setWorkSpaceByList($aggregateWorkspaces);

        $iconFolder = 'uploadedFiles/' . companyID . '/priceListIcons/';

        $priceLists = $this->CalculateStorage->getPriceListCluster($aggregatePriceLists);

        $icons = false;
        $aggregateIcons = array();

        if ($priceLists) {
            foreach ($priceLists as $priceList) {
                if (!in_array($priceList['iconID'], $aggregateIcons) && intval($priceList['iconID']) > 0) {
                    $aggregateIcons[] = $priceList['iconID'];
                }
            }
            $icons = $this->CalculateStorage->getIconsCluster($aggregateIcons);
        }

        if ($icons) {
            foreach ($icons as $key => $icon) {
                $icons[$key]['url'] = STATIC_URL . $iconFolder . $icon['path'];
            }
        }

        foreach ($printTypes as $printType) {

            $selectedTechnology = $this->getSelectedTechnology();

            $noCounting = false;
            if ($selectedTechnology) {

                if ($selectedTechnology['ID'] != $printType['pricelistID']) {
                    $noCounting = true;
                }

            }

            if ($printType['workspaceID']) {
                $workspaces = array();
                $tmp = $this->CalculateStorage->getWorkspace($printType['workspaceID']);
                $tmp['workspaceID'] = $tmp['ID'];
                $workspaces[] = $tmp;
            } else {
                $workspaces = $this->CalculateStorage->getWorkspacesCluster($printType['printTypeID']);
            }

            $iconDir = null;
            $increaseRealizationTime = 0;

            $printTypeInfo = array();
            $printTypeInfo['name'] = $printType['name'];
            $printTypeInfo['printTypeID'] = $printType['printTypeID'];
            $printTypeInfo['priceListIcon'] = null;
            $printTypeInfo['priceLists'] = null;

            if ($priceLists[$printType['pricelistID']]) {
                $selectedPriceList = $priceLists[$printType['pricelistID']];
                if ($icons[$selectedPriceList['iconID']]) {
                    $selectedPriceList['icon'] = $icons[$selectedPriceList['iconID']];
                }
                $printTypeInfo['priceLists'] = $selectedPriceList;
            }
            if ($icons[$printType['priceListIconID']]) {
                $printTypeInfo['priceListIcon'] = $icons[$printType['priceListIconID']];
            }

            $printTypeInfo['size'] = $size;
            $printTypeInfo['printRotated'] = $printRotated;
            $printTypeInfo['volume'] = $volume;

            $rows = 1;
            $volumeTMP = $volume;
            if ($format['rows'] > 1) {
                $rows = intval($format['rows']);
                $volume = ceil($volume / $rows);
            }
            $printTypeInfo['rows'] = $rows;

            $rollWidth = intval($format['width']);

            if (!$printRotated) {
                if ($this->CalculateStorage->getPrintRotated($printType['printTypeID'], $optionsArray)) {
                    $printRotated = 1;
                }
                $printTypeInfo['printRotated'] = $printRotated;
            }

            $printTypeInfo['workspaces'] = array();
            foreach ($workspaces as $workspace) {

                $selectedUseForSheet = false;

                $workspace['printTypeWorkspaceSettings'] = $this->CalculateAdapter->getPrintTypeWorkspaceSettings(
                    $formatID,
                    $printType['printTypeID'],
                    $workspace['ID'],
                    $printTypeWorkspaces
                );

                $workspaceID = $workspace['workspaceID'];
                $workspace['ID'] = $workspace['workspaceID'];

                $sheetCuts = 0;
                $excludedPrintType = false;
                $workspaceInfo = array(
                    'name' => $workspace['name'],
                    'workspaceID' => $workspaceID
                );

                if( $this->getUserSelectedUseForSheet() && $this->getUserSelectedUseForSheet() % 2 != 0
                    && $printRotated ) {
                    $perSheetOdd = $this->getUserSelectedUseForSheet();
                    if($perSheetOdd < 2) {
                        $this->setUserSelectedUseForSheet(2);
                    } else {
                        $this->setUserSelectedUseForSheet($perSheetOdd-1);
                    }
                    $workspaceInfo['perSheetOddInRotatedPrinting'] = $perSheetOdd;
                }

                if( $workspace['printTypeWorkspaceSettings']['usePerSheet'] &&
                    $workspace['printTypeWorkspaceSettings']['usePerSheet'] > 0 ) {
                    $selectedUseForSheet = $workspace['printTypeWorkspaceSettings']['usePerSheet'];
                }

                if( $this->getUserSelectedUseForSheet() &&
                    $this->getUserSelectedUseForSheet() > 0  ) {
                    $selectedUseForSheet = $this->getUserSelectedUseForSheet();
                }

                $calcAllSheets = $this->getAllSheets(
                    $workspace,
                    $pages,
                    $volume,
                    $oneSide,
                    $printRotated,
                    $doublePage,
                    $selectedUseForSheet,
                    $format
                );

                $sheets = $calcAllSheets['sheets'];

                $uzytkipersheet = $calcAllSheets['perSheet'];

                $originalUsePerSheet = false;

                if($selectedUseForSheet &&
                    $selectedUseForSheet < $calcAllSheets['originalPerSheet'] ) {
                    $originalUsePerSheet = $calcAllSheets['originalPerSheet'];
                    $uzytkipersheet = $selectedUseForSheet;
                }

                $workspaceInfo['sheets'] = $sheets;

                if ($sheets === null) {
                    continue;
                }

                $projectSheetsInfo = $this->getProjectSheets(
                    $workspace,
                    $pages,
                    $oneSide,
                    $printRotated,
                    $doublePage,
                    $selectedUseForSheet,
                    $format
                );

                $projectSheets = $projectSheetsInfo['sheets'];

                if ($similarPages) {
                    $workspaceInfo['projectSheetsSimilar'] = true;
                    $projectSheets = 1;
                }

                $area = $this->getArea($volume, $rows, $rollLength, $setIncrease, $format);

                $totalArea = $this->getTotalArea($workspace, $volume, $rollLength, $setIncrease, $format);

                $perimeter = $this->_perimeter($volume, $format);
                $netPerimeter = $this->netPerimeter($volume, $format);
                $this->setPerimeterContainer(compact('perimeter', 'netPerimeter'));

                $uzytki = $this->_uzytki($pages, $volume, $oneSide, $doublePage);

                $folds = ceil(log($uzytkipersheet, 2));

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

                $workspaceInfo['projectSheets'] = $projectSheets;

                $sheetsRatio = null;
                $perSheetRatio = null;

                $workspaceInfo['partProjectSheetsAmount'] = $this->CalculateAdapter->getInfoForPartProjectSheetsAmount(
                    $projectSheets,
                    $projectSheetsInfo['noRoundSheets']
                );

                $workspaceInfo['partProjectSheets'] = $this->CalculateAdapter->getInfoForPartProjectSheets(
                    $projectSheetsInfo['noRoundSheets'],
                    $calcAllSheets['sheets']
                );

                $workspaceInfo['fullProjectSheets'] = $this->CalculateAdapter->getInfoForFullProjectSheets(
                    $projectSheetsInfo['noRoundSheets'],
                    $calcAllSheets['sheets'],
                    $projectSheets
                );
                $this->setFullProjectsSheets($workspaceInfo['fullProjectSheets']);

                $workspaceInfo['noRoundedProjectSheets'] = $this->CalculateAdapter->getInfoNoRoundedProjectSheets(
                    $projectSheetsInfo['noRoundSheets'],
                    $projectSheets
                );

                $workspaceInfo['valueOfPartInProjectSheets'] = $this->CalculateAdapter->getInfoForValueOfPartInProjectSheets(
                    $projectSheetsInfo['noRoundSheets']
                );

                $useSheets = $sheets;
                if( $pages > 4 ) {
                    $useSheets = $calcAllSheets['sheets'];
                }
                $workspaceInfo['sheets'] = $sheets = $useSheets;

                $workspaceInfo['area'] = $area['size'];
                $workspaceInfo['totalArea'] = $totalArea;
                $workspaceInfo['cylinderPerimeter'] = '';
                $workspaceInfo['rollWidth'] = $rollWidth;
                $workspaceInfo['generalLenght'] = '';
                $workspaceInfo['perimeter'] = $perimeter;
                $workspaceInfo['uzytki'] = $uzytki;
                $workspaceInfo['uzytkipersheet'] = $uzytkipersheet;
                $workspaceInfo['folds'] = $folds;
                $workspaceInfo['sheetCuts'] = $sheetCuts;
                $workspaceInfo['totalSheetFolds'] = $totalSheetFolds;

                $sheetIncrease = $this->CalculateStorage->getIncrease('sheet', $sheets, $formatID);

                $sheetsWithIncrease = $sheets;
                $volumeWithIncrease = $volume;

                if ($sheetIncrease != false) {
                    $sheetsWithIncrease += intval($sheetIncrease);
                }
                if ($setIncrease != false) {
                    $volumeWithIncrease += intval($setIncrease);
                    $sheetsWithIncrease += intval($setIncrease) * $projectSheets;
                }

                $workspaceInfo['increase']['sheets'] = $sheetsWithIncrease;

                $workspaceInfo['increase']['volume'] = $volumeWithIncrease;

                if ($workspace['type'] != 3) {
                    $sheetsArea = ($workspace['width'] / 1000 * $workspace['height'] / 1000) * $sheets;
                } else {
                    extract($this->getSizeExternal( $format));
                    $sheetsArea = $formatWidth / 1000 * $formatHeight / 1000;
                    $sheetsArea *= $volume;
                }

                $price = 0;
                $basePrice = 0;
                $expense = 0;
                $options = array();
                $options['pages'] = intval($pages);
                $optionsControllers = array();
                $attrsWeight = null;
                $sortAttr = array();
                $itemWeight = null;
                $weightPerMeter = null;

                $this->attributesInfo = array();
                $workspaceInfo['attrs'] = array();

                $discountGroups = false;

                foreach ($attributes as $attr) {

                    $attrID = $attr['attrID'];
                    $optID = $attr['optID'];

                    if (isset($attributeAmount[$attrID])) {
                        $selectedAmount = $attributeAmount[$attrID];
                    } else {
                        $selectedAmount = null;
                    }

                    $loggedUser = $this->Auth->getLoggedUser();

                    if (sourceApp === 'manager' && $this->getOrderUserID() > 0) {
                        $discountGroups = $this->UserDiscountGroup->getByUser($this->getOrderUserID());
                    } else if ($loggedUser) {
                        $discountGroups = $this->UserDiscountGroup->getByUser($loggedUser['ID']);
                    }

                    $attrPriceBase = false;

                    $attrPrice = $this->_attrPrice(
                        $attrID,
                        $optID,
                        $printType['printTypeID'],
                        $workspace,
                        $printType['pricelistID'],
                        $sheets,
                        $projectSheets,
                        $area,
                        $perimeter,
                        $volume,
                        $selectedAmount,
                        $pages,
                        $size,
                        $uzytki,
                        $totalArea,
                        $totalSheetFolds,
                        $sheetIncrease,
                        $setIncrease,
                        false,
                        $groupID,
                        $typeID,
                        $format,
                        $sheetCuts
                    );

                    if ($discountGroups) {

                        $this->setCountBasePrice(true);
                        $attrPriceBase = $this->_attrPrice(
                            $attrID,
                            $optID,
                            $printType['printTypeID'],
                            $workspace,
                            $printType['pricelistID'],
                            $sheets,
                            $projectSheets,
                            $area,
                            $perimeter,
                            $volume,
                            $selectedAmount,
                            $pages,
                            $size,
                            $uzytki,
                            $totalArea,
                            $totalSheetFolds,
                            $sheetIncrease,
                            $setIncrease,false,
                            $groupID,
                            $typeID,
                            $format,
                            $sheetCuts
                        );
                        $this->setCountBasePrice(false);

                        $basePrice += $attrPriceBase;

                    } else {
                        $basePrice += $attrPrice;
                    }

                    $optionsControllers[$optID] = $this->attributesInfo[$attrID]['controllerID'];

                    $price += $attrPrice;

                    $attrExpense = $this->_attrPrice(
                        $attrID,
                        $optID,
                        $printType['printTypeID'],
                        $workspace,
                        $printType['pricelistID'],
                        $sheets,
                        $projectSheets,
                        $area,
                        $perimeter,
                        $volume,
                        $selectedAmount,
                        $pages,
                        $size,
                        $uzytki,
                        $totalArea,
                        $totalSheetFolds,
                        $sheetIncrease,
                        $setIncrease,
                        true,
                        $groupID,
                        $typeID,
                        $format,
                        $sheetCuts
                    );
                    $expense += $attrExpense;

                    if (sourceApp === 'manager') {
                        $optionInfo = $this->CalculateStorage->getOption($optID);

                        $attrInfo = $this->CalculateStorage->getAttribute($attrID);

                        $info = array(
                            'optionName' => $optionInfo['name'],
                            'attrName' => $attrInfo['name'],
                            'info' => ' attr[' . $attrID . '][' . $optID . ']',
                            'attrPrice' => $attrPrice,
                            'attrExpense' => $attrExpense,
                            'attrID' => $attrID,
                            'optID' => $optID,
                            'optionController' => $optionsControllers[$optID],
                            'calcInfo' => $this->attributesInfo[$attrID]
                        );
                        if ($attrPriceBase) {

                            if ($attrPrice < $attrPriceBase) {
                                $info['oldAttrPrice'] = $attrPriceBase;
                            }

                            $lastDiscountGroup = $this->getLastUsedDiscountGroup();
                            if ($lastDiscountGroup) {
                                $discountGroupName = $this->DiscountGroupLang->getNamesForOne($lastDiscountGroup);
                                $info['discountGroup'] = $discountGroupName;
                                $this->setLastUsedDiscountGroup(NULL);
                            }

                        }

                        if ($excludedPrintType) {
                            $info['excluded'] = true;
                        }
                        $workspaceInfo['attrs'][] = $info;
                    } else {
                        $info = null;
                    }

                    if ($attrPrice === null) {
                        $excludedPrintType = true;
                        break;
                    }

                    $options[$attrID] = intval($optID);

                    $attr = $this->CalculateStorage->getAttribute($attrID);
                    $sortAttr[$attrID] = $attr['sort'];
                    $activeAttr[$attrID] = $attr;
                    $activeOption[$optID] = $this->CalculateStorage->getOption($optID);
                    if ($attr['type'] == 3) {
                        $option = $activeOption[$optID];
                        if ($option['weight'] !== null) {
                            $attrsWeight += $option['weight'];
                        }
                    }

                    if ($activeOption[$optID]['itemWeight'] !== null) {
                        $itemWeight += $activeOption[$optID]['itemWeight'];
                    }

                    if ($activeOption[$optID]['weightPerMeter'] !== null) {
                        $priceTypes = $this->getPriceTypes();
                        $amountOfKilograms = $activeOption[$optID]['weightPerMeter'] / 1000;

                        $netWidth = $format['width'] - ($format['slope'] * 2);
                        $netHeight = $format['height'] - ($format['slope'] * 2);

                        if ($netHeight > $netWidth) {
                            $longSide = $netHeight;
                            $shortSide = $netWidth;
                        } else {
                            $longSide = $netWidth;
                            $shortSide = $netHeight;
                        }

                        foreach ($priceTypes as $priceType) {
                            switch ($priceType['function']) {
                                case 'perimeter':
                                    $amountOfMeters = $perimeter;
                                    $weightPerMeter += $amountOfKilograms * $amountOfMeters;
                                    break;
                                case 'net_perimeter':
                                    $amountOfMeters = $netPerimeter;
                                    $weightPerMeter += $amountOfKilograms * $amountOfMeters;
                                    break;
                                case 'lengthForWidth':
                                    $amountOfMeters = $netWidth / 1000;
                                    $weightPerMeter += $this->CalculateAdapter->multiplicationByVolume($amountOfKilograms * $amountOfMeters, $volume);
                                    break;
                                case 'lengthForHeight':
                                    $amountOfMeters = $netHeight / 1000;
                                    $weightPerMeter += $this->CalculateAdapter->multiplicationByVolume($amountOfKilograms * $amountOfMeters, $volume);
                                    break;
                                case 'longSide':
                                    $amountOfMeters = $longSide / 1000;
                                    $weightPerMeter += $this->CalculateAdapter->multiplicationByVolume($amountOfKilograms * $amountOfMeters, $volume);
                                    break;
                                case 'shortSide':
                                    $amountOfMeters = $shortSide / 1000;
                                    $weightPerMeter += $this->CalculateAdapter->multiplicationByVolume($amountOfKilograms * $amountOfMeters, $volume);;
                                    break;
                            }
                        }
                    }

                    $optionRealizationTime = $this->PrintShopConfigRealizationTime->getSpecify($optID, $volume);
                    if ($optionRealizationTime) {
                        $increaseRealizationTime += $optionRealizationTime;
                    }

                }

                $volume = $volumeTMP;

                if ($excludedPrintType) {
                    if (true) {
                        $workspaceInfo['excluded'] = true;
                    }
                    $printTypeInfo['workspaces'][] = $workspaceInfo;
                    continue;
                }

                if ($attrsWeight !== null) {
                    $weight = round($sheetsArea * $attrsWeight / 1000, 2);
                }

                if ($itemWeight !== null) {
                    $weight += round($volume * $itemWeight / 1000, 2);
                }

                if ($weightPerMeter !== null) {
                    $weight += $weightPerMeter;
                }

                $options['volumes'] = intval($volume);

                $staticOptions = $options;
                uksort($staticOptions, array($this->Standard, 'sortLikeJs'));
                $staticOptions = json_encode($staticOptions);
                $workspaceInfo['staticPriceOptions'] = $staticOptions;

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

                $workspaceInfo['price'] = $price;
                $workspaceInfo['expense'] = $expense;

                unset($options['volumes']);
                unset($options['pages']);

                $calcPrices[] = array(
                    'price' => $price,
                    'basePrice' => $basePrice,
                    'expense' => $expense,
                    'options' => $options,
                    'optionsControllers' => $optionsControllers,
                    'printTypeID' => $printType['printTypeID'],
                    'printTypeTrueID' => $printType['ID'],
                    'workspaceID' => $workspace['ID'],
                    'iconDir' => $iconDir,
                    'attributesInfo' => $this->attributesInfo,
                    'noCounting' => $noCounting
                );

                $printTypeInfo['workspaces'][] = $workspaceInfo;

            }

            $adminInfo['printTypes'][] = $printTypeInfo;

            $this->addActivePrintType($typeID, $printTypeInfo);

        }

        $price = null;
        $basePrice = null;
        $printTypeID = null;
        $expense = null;
        $options = array();
        $optionsControllers = array();
        $iconDir = null;

        foreach ($calcPrices as $eachPrice) {

            $userSelectedWorkspaceID = $this->getUserSelectedWorkspaceID();
            $userSelectedPrintTypeID = $this->getUserSelectedPrintTypeID();

            if ($userSelectedPrintTypeID && $userSelectedPrintTypeID != $eachPrice['printTypeTrueID']) {
                $eachPrice['noCounting'] = true;
            }

            if ($userSelectedWorkspaceID && $userSelectedWorkspaceID != $eachPrice['workspaceID']) {
                $eachPrice['noCounting'] = true;
            }

            if ($eachPrice['noCounting']) {

                if ($eachPrice['price'] < $price || $price === null) {
                    $adminInfo['notSelectedPrintTypes'][] = array(
                        'price' => $price,
                        'printTypeID' => $eachPrice['printTypeID'],
                        'workspaceID' => $eachPrice['workspaceID'],
                        'expense' => $expense
                    );
                }

                continue;
            }

            if ($eachPrice['price'] < $price || $price === null) {
                $price = $eachPrice['price'];
                $basePrice = $eachPrice['basePrice'];
                $adminInfo['selectedPrintType'] = array(
                    'price' => $price,
                    'printTypeID' => $eachPrice['printTypeID'],
                    'workspaceID' => $eachPrice['workspaceID'],
                    'expense' => $expense
                );
                $printTypeID = $eachPrice['printTypeID'];
                $workspaceID = $eachPrice['workspaceID'];
                $expense = $eachPrice['expense'];
                $options = $eachPrice['options'];
                $iconDir = $eachPrice['iconDir'];
                $optionsControllers = $eachPrice['optionsControllers'];
                $attributesInfo = $eachPrice['attributesInfo'];
            } else {
                $adminInfo['notSelectedPrintTypes'][] = array(
                    'price' => $price,
                    'printTypeID' => $eachPrice['printTypeID'],
                    'workspaceID' => $eachPrice['workspaceID'],
                    'expense' => $expense
                );
            }
        }

        $idx = count($this->productsInfo) - 1;
        $this->productsInfo[$idx]['attributes'] = $attributesInfo;
        $this->productsInfo[$idx]['printTypeID'] = $printTypeID;
        $this->productsInfo[$idx]['workspaceID'] = $workspaceID;
        $this->productsInfo[$idx]['thickness'] = $size;

        $activeWorkspaceInfo = $this->getSelectedWorkspaceById($typeID, $printTypeID, $workspaceID);
        $this->productsInfo[$idx]['usePerSheet'] = $activeWorkspaceInfo['uzytkipersheet'];

        $this->adminInfo = $adminInfo;

        $attrDiscount = $basePrice - $price;

        return array(
            'price' => $price,
            'basePrice' => $basePrice,
            'attrDiscount' => $attrDiscount,
            'expense' => $expense,
            'printTypeID' => $printTypeID,
            'workspaceID' => $workspaceID,
            'weight' => $weight,
            'options' => $options,
            'attrPages' => $attributeAmount,
            'volume' => $volume,
            'iconDir' => $iconDir,
            'increaseRealizationTime' => $increaseRealizationTime,
            'oneSide' => $oneSide,
            'optionsControllers' => $optionsControllers,
            'area' => $area['size'],
            'areaNet' => $area['sizeNet']
        );

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
     * @param $formatID
     * @param $volume
     * @return array
     */
    private function _printTypes($formatID, $volume)
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
     * @param $formatID
     * @return array|bool
     */
    public function getPrintTypes($formatID)
    {
        return $this->CalculateStorage->getPrintTypes($formatID);
    }

    /**
     * @param $workspace
     * @param $pages
     * @param $volume
     * @param $oneSide
     * @param $printRotated
     * @param $doublePage
     * @param bool $userSelectedUseForSheet
     * @return array|null
     */
    private function getAllSheets($workspace, $pages, $volume, $oneSide, $printRotated, $doublePage,
                                  $userSelectedUseForSheet = false, $format)
    {
        $pages = $this->CalculateAdapter->getAmountPages($pages, $oneSide, $doublePage);

        $perSheet = null;
        $noRoundSheets = false;
        $formatWidth=0; $formatHeight=0;
        extract($this->getSizeExternal($format));
        switch ($workspace['type']) {
            case 3:
                $sheets = 1;
                break;
            case 2:

                $area = $this->CalculateAdapter->getAreaForRolled($pages, $volume);
                $usedHeight = $this->CalculateAdapter->getUsedHeight(
                    $area,
                    $workspace['width'],
                    $formatWidth,
                    $formatHeight
                );

                $sheets = $this->CalculateAdapter->getSheetsForRolled($usedHeight, $workspace['height']);

                break;
            default:

                $perSheet = $originalPerSheet = $this->CalculateAdapter->getAreaPerSheetForStandard(
                    $workspace['width'],
                    $workspace['height'],
                    $formatWidth,
                    $formatHeight
                );

                if( $userSelectedUseForSheet &&
                    $userSelectedUseForSheet < $perSheet ) {
                    $perSheet = $userSelectedUseForSheet;
                }

                if ($perSheet == 0) {
                    return null;
                }

                if (!$printRotated) {

                    $originalSheets = $this->CalculateAdapter->getSheetsForStandard($pages, $originalPerSheet, $volume);
                    $sheets = $this->CalculateAdapter->getSheetsForStandard($pages, $perSheet, $volume);

                    $noRoundSheets = $sheets;
                    $sheets = ceil($sheets);
                    $originalSheets = ceil($originalSheets);

                } else {

                    $originalSheets = $this->CalculateAdapter->getSheetsForStandardPrintRotated($pages, $originalPerSheet, $volume);
                    $sheets = $this->CalculateAdapter->getSheetsForStandardPrintRotated($pages, $perSheet, $volume);

                    $noRoundSheets = ($sheets * 2) / 2;
                    $sheets = ceil($sheets * 2) / 2;
                    $originalSheets = ceil($originalSheets * 2) / 2;
                }

                break;
        }

        if( $volume > 1 && $sheets < 1 ) {
            $sheets = 1;
        }

        return compact(
            'sheets',
            'perSheet',
            'noRoundSheets',
            'originalPerSheet',
            'originalSheets'
        );

    }

    /**
     * @param $workspace
     * @param $pages
     * @param $oneSide
     * @param $printRotated
     * @param $doublePage
     * @param bool $userSelectedUseForSheet
     * @return array|null
     */
    private function getProjectSheets($workspace, $pages, $oneSide, $printRotated, $doublePage,
                                      $userSelectedUseForSheet = false, $format)
    {
        $result = $this->getAllSheets(
            $workspace,
            $pages,
            1,
            $oneSide,
            $printRotated,
            $doublePage,
            $userSelectedUseForSheet,
            $format
        );
        return $result;
    }

    /**
     * @param $volume
     * @param $rows
     * @param $maxRollLength
     * @param $setIncrease
     * @param $slope
     * @return array
     */
    private function getArea($volume, $rows, $maxRollLength, $setIncrease, $format)
    {
        $slope = $format['slope'];
        $volume = $this->CalculateAdapter->addSetIncreaseToVolume($volume, $setIncrease, $rows);
        $formatWidth=0; $formatHeight=0;
        extract($this->getSizeExternal($format));
        $size = $this->CalculateAdapter->calculateSize($formatWidth, $formatHeight);
        $sizeNet = $this->CalculateAdapter->calculateSizeNet($formatWidth, $formatHeight, $slope);

        $size *= $volume;
        $sizeNet *= $volume;

        if ($maxRollLength !== null) {
            $length = $this->CalculateAdapter->getLengthForRoll($size, $formatWidth);

            $numberOfRolls = $this->CalculateAdapter->getNumberOfRolls($length, $maxRollLength);

            $rollSlipIncrease = $this->CalculateStorage->getIncrease('rollSlip', $numberOfRolls);

            $size = $this->CalculateAdapter->calculateSizeForRollPrint(
                $size,
                $maxRollLength,
                $formatWidth,
                $rollSlipIncrease
            );

        }
        return array('size' => $size, 'sizeNet' => $sizeNet);
    }

    /**
     * @param $workspace
     * @param $sheets
     * @return float|int
     */
    private function _totalSheetsArea($workspace, $sheets)
    {
        return ($workspace['paperWidth'] / 1000) * ($workspace['paperHeight'] / 1000) * $sheets;

    }

    /**
     * @param $workspace
     * @param $volume
     * @param $maxRollLength
     * @param $setIncrease
     * @return float|int
     */
    private function getTotalArea($workspace, $volume, $maxRollLength, $setIncrease, $format)
    {
        $volume = $this->CalculateAdapter->addSetIncreaseToVolumeTotal($volume, $setIncrease);
        $formatWidth=0; $formatHeight=0;
        extract($this->getSizeExternal($format));
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
     * @param $volume
     * @return float|int
     */
    private function _perimeter($volume, $format)
    {
        $formatWidth=0; $formatHeight=0;
        extract($this->getSizeExternal( $format));

        $formatWidth /= 1000;
        $formatHeight /= 1000;

        $perimeter = $formatWidth * 2 + $formatHeight * 2;
        $perimeter *= $volume;

        return $perimeter;

    }

    /**
     * @param $volume
     * @param $formatSlope
     * @return float|int
     */
    private function netPerimeter($volume, $format)
    {
        $formatSlope=$format['slope'];
        $formatWidth=0; $formatHeight=0;
        extract($this->getSizeExternal( $format));
        $width = $formatWidth - ($formatSlope * 2);
        $height = $formatHeight - ($formatSlope * 2);

        $width /= 1000;
        $height /= 1000;

        $perimeter = $width * 2 + $height * 2;
        $perimeter *= $volume;

        return $perimeter;
    }

    /**
     * @param $pages
     * @param $volume
     * @param $oneSide
     * @param $doublePage
     * @return float|int
     */
    private function _uzytki($pages, $volume, $oneSide, $doublePage)
    {
        if ($oneSide && $pages > 2) {
            $uzytki = $pages;
        } else {
            $uzytki = $pages / 2;
        }

        if ($doublePage) {
            $uzytki /= 2;
        }

        return $uzytki * $volume;
    }

    /**
     * @param $attrID
     * @param $optID
     * @param $printTypeID
     * @param $workspace
     * @param $pricelistID
     * @param $sheets
     * @param $projectSheets
     * @param $area
     * @param $perimeter
     * @param $volume
     * @param $attributeAmount
     * @param $pages
     * @param $size
     * @param $uzytki
     * @param $totalArea
     * @param $totalSheetFolds
     * @param $sheetIncrease
     * @param $setIncrease
     * @param bool $expense
     * @return mixed
     * @throws Exception
     */
    private function _attrPrice($attrID, $optID, $printTypeID, $workspace, $pricelistID, $sheets, $projectSheets,
                                $area, $perimeter, $volume, $attributeAmount, $pages, $size, $uzytki, $totalArea,
                                $totalSheetFolds, $sheetIncrease, $setIncrease, $expense = false, $groupID, $typeID, $format, $sheetCuts=0)
    {

        $workspaceID = $workspace['ID'];
        if ($sheetIncrease != false) {
            $sheets += intval($sheetIncrease);
        }

        if ($setIncrease != false) {
            $volume += intval($setIncrease);
            $sheets += intval($setIncrease) * $projectSheets;
        }
        $formatWidth=0; $formatHeight=0;
        extract($this->getSizeExternal( $format));
        if ($formatWidth > $formatHeight) {
            $longSide = $formatWidth;
            $shortSide = $formatHeight;
        } else {
            $longSide = $formatHeight;
            $shortSide = $formatWidth;
        }

        $attr = $this->CalculateStorage->getAttribute($attrID);

        if ($attr['function'] == 'standard') {
            $controllerID = $pricelistID;
        } elseif ($attr['function'] == 'print') {
            $controllerID = $printTypeID;
        } elseif ($attr['function'] == 'paper') {
            $controllerID = $workspaceID;
        } else {
            return array('error' => 'Undefined attrType function');
        }

        $this->PrintShopConfigIncrease->setAttrID($attrID);
        $this->PrintShopConfigIncrease->setOptID($optID);
        $this->PrintShopConfigIncrease->setControllerID($controllerID);


        $increases = $this->_attrIncreases($controllerID, $sheets, $projectSheets, $groupID, $typeID, $attr,$printTypeID, $workspace, $pricelistID);

        $sheets = $increases['sheets'];
        $this->PrintShopConfigPrice->setAttrID($attrID);
        $this->PrintShopConfigPrice->setOptID($optID);
        $this->PrintShopConfigPrice->setControllerID($controllerID);

        $priceTypes = $this->CalculateStorage->getPriceTypes();
        $sheetsAfterCut=0;
        if ($priceTypes && $sheetCuts > 0) {
            foreach ($priceTypes as $priceType) {
                if ($priceType['function'] == 'folds' || $priceType['function'] == 'collectingFolds') {
                    $sheetsAfterCut = $sheets * (2 * $sheetCuts);
                }
            }
        }
        $totalFolds = $sheets * $totalSheetFolds;

        $totalSheetsArea = $this->_totalSheetsArea($workspace, $sheets);
        if ($sheetsAfterCut) {
            $sheets = $sheetsAfterCut;
        }
        if (!isset($this->attributesInfo[$attr['ID']])) {
            $this->attributesInfo[$attr['ID']] = array();
        }


        $attrPages = $attributeAmount;
        $this->attributesInfo[$attr['ID']]['all'] = compact(
            'volume',
            'sheets',
            'sheetsAfterCut',
            'projectSheets',
            'area',
            'perimeter',
            'attrPages',
            'pages',
            'size',
            'longSide',
            'shortSide',
            'uzytki'
        );
        $this->attributesInfo[$attr['ID']]['controllerID'] = $controllerID;
        $this->attributesInfo[$attr['ID']]['attrPages'] = $attributeAmount;
        $this->attributesInfo[$attr['ID']]['attrID'] = $attr['ID'];
        $this->attributesInfo[$attr['ID']]['optID'] = $optID;

        $finalPrice = 0;

        $this->PrintShopConfigDetailPrice->setAttrID($attrID);
        $this->PrintShopConfigDetailPrice->setOptID($optID);
        $this->PrintShopConfigDetailPrice->setControllerID($controllerID);

        if ($attr['function'] == 'standard') {
            $this->PrintShopConfigDetailPrice->setControllerID($pricelistID);
        }

        $detailPrice = $this->CalculateStorage->getDetailPrice();

        if ($detailPrice['excluded']) {
            $this->attributesInfo[$attr['ID']]['excluded'] = true;
            return null;
        }

        $paperPrice = $this->_paperPrice($attr, $optID, $workspace, $sheets, $expense);

        if ($paperPrice) {
            $finalPrice += $paperPrice;
        }

        $loggedUser = $this->Auth->getLoggedUser();
        $discountGroups = false;

        if (sourceApp === 'manager' && $this->getOrderUserID() > 0) {
            $discountGroups = $this->CalculateStorage->getUserDiscountGroups($this->getOrderUserID());
        } else if ($loggedUser) {
            $discountGroups = $this->CalculateStorage->getUserDiscountGroups($loggedUser['ID']);
        }

        $discountPriceTypes = null;

        if ($discountGroups) {
            $this->PrintShopConfigDiscountPrice->setAttrID($attrID);
            $this->PrintShopConfigDiscountPrice->setOptID($optID);
            $this->PrintShopConfigDiscountPrice->setControllerID($controllerID);
            $this->PrintShopConfigDiscountPrice->setDiscountGroups($discountGroups);

            $discountPriceTypes = $this->CalculateStorage->getDiscountPriceTypes();

            if( $discountPriceTypes ) {
                foreach ($discountPriceTypes as $key => $discountPriceType) {
                    $discountPriceTypes[$key]['discounted'] = true;
                }
            }
        }

        if ($discountPriceTypes && !$this->isCountBasePrice()) {
            $priceTypes = $discountPriceTypes;
        }

        $this->setPriceTypes($priceTypes);

        $percentagePrice = array();

        $percentageType = null;

        $option = $this->CalculateStorage->getOption($optID);

        $repeatedOperationsNumber = $this->CalculateAdapter->getRepeatedOperationsNumber($workspace, $option);
        $formatWidth=0; $formatHeight=0;
        extract($this->getSizeExternal( $format));
        if( $priceTypes ) {
            foreach ($priceTypes as $priceType) {

                if( in_array($priceType['function'], array('sheet')) && $repeatedOperationsNumber ) {
                    $this->attributesInfo[$attr['ID']]['all']['repeatedOperationsNumber'] = $repeatedOperationsNumber;
                }

                $percentage = false;
                switch ($priceType['function']) {
                    case 'sheet':
                        $resultCalculateSheet = $this->calculateSheet(
                            $sheets,
                            $volume,
                            $attributeAmount,
                            $repeatedOperationsNumber
                        );
                        $range = $resultCalculateSheet['range'];
                        $amount = $resultCalculateSheet['amount'];
                        break;
                    case 'set':
                        $resultSet = $this->calculateSet($volume, $attributeAmount);
                        $range = $resultSet['range'];
                        $amount = $resultSet['amount'];
                        break;
                    case 'projectSheets':
                        $range = $amount = $projectSheets;
                        break;
                    case 'squareMeter':
                        $range = $amount = $area['size'];
                        break;
                    case 'perimeter':
                        if ($attributeAmount > 1) {
                            $range = $amount = $perimeter * $attributeAmount;
                        } else {
                            $range = $amount = $perimeter;
                        }
                        break;
                    case 'allSheetsRangeVolume':
                        $range = $volume;
                        $amount = $sheets;
                        break;
                    case 'allPages':
                        $allPagesResult = $this->calculateAllPages($pages, $volume, $attributeAmount);
                        $range = $allPagesResult['range'];
                        $amount = $allPagesResult['amount'];
                        break;
                    case 'allPagesRangeVolume':
                        $allPagesRangeVolumeResult = $this->calculateAllPagesRangeVolume($pages, $volume, $attributeAmount);
                        $range = $allPagesRangeVolumeResult['range'];
                        $amount = $allPagesRangeVolumeResult['amount'];
                        break;
                    case 'setRangeSheet':
                        $range = $sheets;
                        $amount = $volume;
                        break;
                    case 'setRangeSize':
                        $range = $size;
                        $amount = $volume;
                        break;
                    case 'setMultiplication':
                        $range = $volume;
                        $amount = null;
                        $percentage = true;
                        $percentageType = 1;
                        break;
                    case 'longSide':
                        if ($attributeAmount > 1) {
                            $range = ($longSide * $attributeAmount) / 1000;
                            $amount = ($longSide * $attributeAmount) / 1000 * $volume;
                        } else {
                            $range = $longSide / 1000;
                            $amount = $longSide / 1000 * $volume;
                        }
                        break;
                    case 'shortSide':
                        if ($attributeAmount > 1) {
                            $range = ($shortSide * $attributeAmount) / 1000;
                            $amount = ($shortSide * $attributeAmount) / 1000 * $volume;
                        } else {
                            $range = $shortSide / 1000;
                            $amount = $shortSide / 1000 * $volume;
                        }
                        break;
                    case 'allAreasLength':

                        $length = (($formatWidth * 2) + ($formatHeight * 2)) / 1000 * ceil($uzytki);

                        if ($attributeAmount > 1) {
                            $length *= $attributeAmount;
                        }
                        $amount = $range = $length;
                        break;
                    case 'alluzytki':
                        $allUzytkiResult = $this->callculateAllUzytki($uzytki, $attributeAmount);
                        $range = $allUzytkiResult['range'];
                        $amount = $allUzytkiResult['amount'];
                        break;
                    case 'paintRangeVolume':
                        $inkVolumePl = 0;

                        // @TODO check file ink volume

                        $range = $volume;
                        $amount = $inkVolumePl;
                        break;
                    case 'setRangePages':
                        $range = $pages;
                        $amount = $volume;
                        break;
                    case 'totalArea':
                        $range = $amount = $totalArea;
                        break;
                    case 'folds':
                        $range = $amount = $totalFolds;
                        break;
                    case 'totalSheetsArea':
                        $range = $amount = $totalSheetsArea;
                        break;
                    case 'totalSheetsAreaRangeSheets':
                        $range = $sheets;
                        $amount = $totalSheetsArea;
                        break;
                    case 'collectingFolds':
                        $maxFolds = $this->getMaxFolds();
                        if ($maxFolds == 3) {
                            $range = intval($sheets);
                        } elseif ($maxFolds == 2) {
                            $range = intval($sheets) * 2;
                        } elseif ($maxFolds == 1) {
                            $range = intval($sheets) * 4;
                        }
                        $amount = $range;
                        break;
                    case 'lengthForWidth':
                        if ($attributeAmount > 1) {
                            $range = ($formatWidth * $attributeAmount) / 1000;
                            $amount = ($formatWidth * $attributeAmount) / 1000 * $volume;
                        } else {
                            $range = $formatWidth / 1000;
                            $amount = $formatWidth / 1000 * $volume;
                        }
                        break;
                    case 'lengthForHeight':
                        if ($attributeAmount > 1) {
                            $range = ($formatHeight * $attributeAmount) / 1000;
                            $amount = ($formatHeight * $attributeAmount) / 1000 * $volume;
                        } else {
                            $range = $formatHeight / 1000;
                            $amount = $formatHeight / 1000 * $volume;
                        }
                        break;
                    case 'squareMeterNet':
                        $range = $amount = $area['sizeNet'];
                        break;
                    case 'squareMetersForPages':
                        $range = $amount = $this->calculateSquareForPages($area, $pages);
                        break;
                    case 'setPercentage':
                        $range = $volume;
                        $amount = null;
                        $percentage = true;
                        $percentageType = 2;
                        break;
                    case 'bundle':
                        $resultCalculateBundle = $this->calculateBundle($volume, $attributeAmount);
                        $range = $resultCalculateBundle['range'];
                        $amount = $resultCalculateBundle['amount'];
                        break;
                    case 'package':
                        $resultCalculatePackage = $this->calculatePackage($attributeAmount);
                        $range = $resultCalculatePackage['range'];
                        $amount = $resultCalculatePackage['amount'];
                        break;
                    case 'setVolumes':
                        $resultCalculateSetVolumes = $this->calculateSetVolumes($volume);
                        $range = $resultCalculateSetVolumes['range'];
                        $amount = $resultCalculateSetVolumes['amount'];
                        break;
                    case 'allSheetsVolumes':
                        $range = $volume;
                        $amount = 1;
                        break;
                    case 'net_perimeter':

                        $perimeterContainer = $this->getPerimeterContainer();
                        $netPerimeter = $perimeterContainer['netPerimeter'];

                        if ($attributeAmount > 1) {
                            $range = $amount = $netPerimeter * $attributeAmount;
                        } else {
                            $range = $amount = $netPerimeter;
                        }
                        break;
                    case 'amount_patterns_sum':

                        $resultCalculateAmountOfPattern = $this->calculateAmountOfPattern($attributeAmount);
                        $range = $resultCalculateAmountOfPattern['range'];
                        $amount = $resultCalculateAmountOfPattern['amount'];

                        break;
                    case 'every_sheet_separate':
                        $range = $this->getFullProjectsSheets();
                        $amount = $sheets;
                        break;
                    case 'amount_patterns_value':
                        $resultCalculateAmountOfPattern = $this->calculateAmountOfPattern($attributeAmount);
                        $range = $resultCalculateAmountOfPattern['range'];
                        $amount = 1;
                        break;
                    default:
                        throw new Exception('Price type function not set!');
                        break;
                }

                if ($expense) {
                    $price = $this->searchMatchingExpense($range, $priceType);

                    if (!$percentage) {
                        if( $priceType['function'] === 'amount_patterns_sum' ) {
                            $finalPrice += $price['expense'];
                        } else {
                            $finalPrice += $price['expense'] * $amount;
                        }

                    } else {
                        $percentagePrice[] = array(
                            'value' => $price['expense'],
                            'type' => $percentageType
                        );
                    }
                } else {

                    $price = $this->searchMatchingPrice($range, $volume, $priceType);

                    if (!$percentage) {
                        if( $priceType['function'] === 'amount_patterns_sum' ) {
                            $finalPrice += $price['value'];
                        } else {
                            $finalPrice += $price['value'] * $amount;
                        }
                    } else {
                        $percentagePrice[] = array(
                            'value' => $price['value'],
                            'type' => $percentageType
                        );
                    }
                }

            }
        }

        if ($expense) {
            if ($detailPrice['startUp'] !== null) {
                $finalPrice += $detailPrice['startUp'];
            }

        } else {
            if ($detailPrice['basePrice'] !== null && !$expense) {
                $finalPrice += $detailPrice['basePrice'];
            }

            if ($detailPrice['minPrice'] !== null && $detailPrice['minPrice'] > $finalPrice) {
                $finalPrice = $detailPrice['minPrice'];
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

        return $finalPrice;

    }

    /**
     * @param $range
     * @param $volume
     * @param $priceType
     * @return bool|mixed
     */
    private function searchMatchingPrice($range, $volume, $priceType)
    {

        if($priceType['function'] == 'amount_patterns_sum' ) {

            if ( array_key_exists('discounted', $priceType) ) {
                $price = $this->PrintShopConfigDiscountPrice->getForAmountPatterns($priceType['priceType'], $range);
            } else {
                $price = $this->PrintShopConfigPrice->getForAmountPatterns($priceType['priceType'], $range);
            }

        } else {

            if ( array_key_exists('discounted', $priceType) ) {
                $price = $this->PrintShopConfigDiscountPrice->customGet($priceType['priceType'], $range);
            } else {
                $price = $this->PrintShopConfigPrice->customGet($priceType['priceType'], $range);
            }

        }


        if ($price && isset($price['discountGroupID'])) {
            $this->setLastUsedDiscountGroup($price['discountGroupID']);
        }

        if ($priceType['function'] == 'setVolumes') {
            if (isset($price['lastRangePrice']) && $price['amount'] < $volume) {
                $price['value'] = $volume * $price['lastRangePrice'];
            }
        } else if ($priceType['function'] == 'allSheetsVolumes') {
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

        if($priceType['function'] == 'amount_patterns_sum' ) {

            if ( array_key_exists('discounted', $priceType) ) {
                $price = $this->PrintShopConfigDiscountPrice->getExpenseForAmountPatterns($priceType['priceType'], $range);
            } else {
                $price = $this->PrintShopConfigPrice->getExpenseForAmountPatterns($priceType['priceType'], $range);
            }

        } else {
            if ( array_key_exists('discounted', $priceType) ) {
                $price = $this->PrintShopConfigDiscountPrice->getExpense($priceType['priceType'], $range);
            } else {
                $price = $this->PrintShopConfigPrice->getExpense($priceType['priceType'], $range);
            }
        }



        return $price;
    }

    /**
     * @param $controllerID
     * @param $sheets
     * @param $projectSheets
     * @param $groupID
     * @param $typeID
     * @return array
     */
    private function _attrIncreases($controllerID, $sheets, $projectSheets, $groupID, $typeID, $attr, $printTypeID, $workspace, $pricelistID)
    {

        $increases = $this->CalculateStorage->getConfigIncreaseCluster();

        $relatedIncreases=$this->CalculateStorage->getRelatedConfigIncreases($controllerID,$groupID, $typeID, $attr, $printTypeID, $workspace, $pricelistID);

        if($relatedIncreases && count($relatedIncreases)>0){
            if(!$increases){
                $increases=[];
            }
            $increases=array_merge_recursive($increases, $relatedIncreases);
        }

        if (!$increases || !is_array($increases)) {
            return compact('sheets');
        }

        foreach ($increases as $increase) {
            if ($increase['function'] == 'sheet') {
                $range = $sheets;
                $amount = 1;
            } elseif ($increase['function'] == 'sheetForProjectSheet') {
                $range = ceil($sheets);
                $amount = ceil($projectSheets);
            }
            if(isset($increase['isAdditional'])){
                $configIncrease = $this->PrintShopConfigIncrease->oneForOption($increase['attrID'],$increase['optID'],$increase['controllerID'],$increase['increaseType'], $range);
                $sheets += floatval($configIncrease['value']) * $amount;
            }else{
                $configIncrease = $this->CalculateStorage->getConfigIncrease($increase['increaseType'], $range);
                $sheets += floatval($configIncrease['value']) * $amount;
            }
        }

        return compact(
            'sheets'
        );
    }

    private function _paperPrice($attr, $optID, $workspace, $sheets, $expense = false)
    {

        if ($attr['function'] !== 'paper') {
            return false;
        }

        $sheetArea = $workspace['paperWidth'] * $workspace['paperHeight'] / 1000000;

        $allSheetsArea = $sheetArea * $sheets;

        $option = $this->CalculateStorage->getOption($optID);

        $weight = ($option['weight'] / 1000) * $allSheetsArea; //kg

        $this->attributesInfo[$attr['ID']]['paperPriceKG']['weightKg'] = $weight;

        $this->PrintShopConfigPaperPrice->setOptID($optID);

        $connect = $this->CalculateStorage->getConnectOption($optID);

        if ($expense) {
            if (!$connect) {
                $result = $this->CalculateStorage->getPaperPrice('expense', $weight);
                $this->attributesInfo[$attr['ID']]['paperPriceKG']['expenseForKg'] = $result['expense'];
                $price = $result['expense'] * $weight;
                $this->attributesInfo[$attr['ID']]['paperPriceKG']['expense'] = $price;
            } else {
                $result = $this->CalculateStorage->getPaperPrice('connectExpense', $weight, $connect['connectOptionID']);
                $this->attributesInfo[$attr['ID']]['paperPriceKG']['expenseForKg'] = $result['expense'];
                $price = $result['expense'] * $weight;
                $this->attributesInfo[$attr['ID']]['paperPriceKG']['expense'] = $price;
            }

        } else {
            if (!$connect) {
                $result = $this->CalculateStorage->getPaperPrice('price', $weight);
                $this->attributesInfo[$attr['ID']]['paperPriceKG']['priceForKg'] = $result['price'];
                $price = $result['price'] * $weight;
                $this->attributesInfo[$attr['ID']]['paperPriceKG']['price'] = $price;
            } else {
                $result = $this->CalculateStorage->getPaperPrice('connectPrice', $weight, $connect['connectOptionID']);
                $this->attributesInfo[$attr['ID']]['paperPriceKG']['priceForKg'] = $result['value'];
                $price = $result['value'] * $weight;
                $this->attributesInfo[$attr['ID']]['paperPriceKG']['price'] = $price;
            }

        }

        return $price;
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
     * @param $sheets
     * @param $volume
     * @param null $attributeAmount
     * @param null $repeatedOperationsNumber
     * @return array
     */
    private function calculateSheet($sheets, $volume, $attributeAmount = NULL, $repeatedOperationsNumber = NULL)
    {
        $result = array();

        if ($attributeAmount !== NULL) {
            $result['range'] = $attributeAmount;
            $result['amount'] = $volume * $attributeAmount;
        } else {
            $result['range'] = $sheets;
            $result['amount'] = $sheets;
        }

        if($repeatedOperationsNumber !== NULL && $repeatedOperationsNumber > 0) {
            $result['amount'] *= $repeatedOperationsNumber;
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
    private function callculateAllUzytki($uzytki, $attributeAmount = NULL)
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
     * @return mixed
     */
    private function calculateAmountOfPattern($attributeAmount)
    {
        if ($attributeAmount > 0) {
            $result['range'] = $result['amount'] = $attributeAmount;
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
     * @param $attributePages
     * @return array|bool
     */
    private function checkAttributesPages($attributePages)
    {

        $aggregateAttributes = array();
        foreach ($attributePages as $tmpAttrID => $tmpAttrPage) {
            $aggregateAttributes[] = $tmpAttrID;
        }

        $attributes = $this->CalculateStorage->getAttributesCluster($aggregateAttributes);

        $aggregateRange = array();

        if ($attributes && is_array($attributes)) {
            foreach ($attributes as $attribute) {
                if ($attribute['rangeID'] > 0) {
                    $aggregateRange[] = $attribute['rangeID'];
                }
            }
        }

        $attributeRanges = $this->CalculateStorage->getAttributeRangesCluster($aggregateRange);

        if (!$attributeRanges || !is_array($attributeRanges)) {
            return false;
        }

        $errors = array();
        foreach ($attributePages as $tmpAttrID => $tmpAttrPage) {

            if ($tmpAttrPage === NULL) {
                continue;
            }

            if (!$attributes[$tmpAttrID]['rangeID']) {
                continue;
            }

            $maxPages = $attributeRanges[$attributes[$tmpAttrID]['rangeID']]['maxPages'];
            $minPages = $attributeRanges[$attributes[$tmpAttrID]['rangeID']]['minPages'];

            if ($tmpAttrPage > $maxPages && $maxPages !== NULL) {
                $errors[] = array(
                    'translate' => $this->LangComponent->translate('maximum_number_of_pages'),
                    'text' => 'Maximum number to attribute exceeded. Max number is: ' . $maxPages,
                    'maximumPages' => $maxPages,
                    'minimumPages' => $minPages
                );
            }
            if ($tmpAttrPage < $minPages && $minPages !== NULL) {
                $errors[] = array(
                    'translate' => $this->LangComponent->translate('minimum_number_of_pages'),
                    'text' => 'Minimal number not achieved. Minimal is: ' . $minPages,
                    'maximumPages' => $maxPages,
                    'minimumPages' => $minPages
                );
            }
        }

        if (empty($errors)) {
            return false;
        }
        return $errors;
    }

    /**
     * @param $productOptions
     * @param $pages
     * @param $doublePage
     * @return array|bool
     */
    private function checkProductThickness($productOptions, $pages, $doublePage)
    {
        $aggregateOptions = array();
        foreach ($productOptions as $productOption) {
            $aggregateOptions[] = $productOption['optID'];
        }

        $productSize = 0;
        $options = $this->CalculateStorage->getOptionsCluster($aggregateOptions);

        if( is_array($options) ) {
            foreach ($options as $option) {
                if (doubleval($option['sizePage']) > 0) {
                    $productSize += $this->calculateProductThickness($pages, $option['sizePage'], $doublePage);
                }
            }
        }

        if ($productSize <= 0) {
            return false;
        }

        $errors = array();

        foreach ($options as $option) {
            if ($option['minThickness'] > 0 && $productSize < $option['minThickness']) {
                $errors[] = array(
                    'key' => 'minimum_thickness',
                    'text' => 'Thickness: ' . $productSize . '. Minimal thickness not achieved for option ' .
                        $option['ID'] . '. Minimal is: ' . $option['minThickness']
                );
            }
            if ($option['maxThickness'] > 0 && $productSize > $option['maxThickness']) {
                $errors[] = array(
                    'key' => 'maximum_thickness',
                    'text' => 'Thickness: ' . $productSize . '. Maximum thickness exceeded for option ' .
                        $option['ID'] . '. Maximal is: ' . $option['maxThickness']
                );
            }
        }

        if (empty($errors)) {
            return false;
        }

        return $errors;

    }

    /**
     * @return mixed
     */
    public function getSelectedWorkspace()
    {
        $selectedPrintTypeID = $this->getSelectedPrintTypeID($this->adminInfo);
        $selectedPrintTypeIndex = $this->getSelectedPrintTypeIndex($this->adminInfo, $selectedPrintTypeID);

        $selectedWorkspaceID = $this->getSelectedWorkspaceID($this->adminInfo);
        $selectedWorkspaceIndex = $this->getSelectedWorkspaceIndex($this->adminInfo, $selectedPrintTypeIndex, $selectedWorkspaceID);

        return $this->adminInfo['printTypes'][$selectedPrintTypeIndex]['workspaces'][$selectedWorkspaceIndex];
    }

    /**
     * @param $typeID
     * @param $printTypeID
     * @param $workspaceID
     * @return mixed
     */
    public function getSelectedWorkspaceById($typeID, $printTypeID, $workspaceID)
    {
        $selectedPrintTypeIndex = $this->getActivePrintTypeIndex($typeID, $printTypeID);
        $selectedWorkspaceIndex = $this->getActiveWorkspaceIndex($typeID, $selectedPrintTypeIndex, $workspaceID);

        $activePrintTypes = $this->getActivePrintTypes();

        return $activePrintTypes[$typeID][$selectedPrintTypeIndex]['workspaces'][$selectedWorkspaceIndex];
    }

    public function addFlagToChangeAttributePrice($data)
    {

        if( !$data || !isset($data['info']) ) {
            return $data;
        }

        foreach ($data['info'] as $infoKey => $info) {
            foreach ($info['printTypes'] as $printTypeKey => $printType) {
                foreach ($printType['workspaces'] as $workspaceKey => $workspace) {
                    foreach ($workspace['attrs'] as $attributeKey => $attribute) {

                        $data['info'][$infoKey]['printTypes'][$printTypeKey]['workspaces']
                        [$workspaceKey]['attrs'][$attributeKey]['changePrice'] = true;
                        $attributePrice = $data['info'][$infoKey]['printTypes'][$printTypeKey]['workspaces']
                        [$workspaceKey]['attrs'][$attributeKey]['attrPrice'];
                        $data['info'][$infoKey]['printTypes'][$printTypeKey]['workspaces']
                        [$workspaceKey]['attrs'][$attributeKey]['attrPriceFormatted'] = $this->Price->getPriceToView($attributePrice);

                    }
                }
            }
        }

        return $data;

    }

    /**
     * @param $typeID
     * @param $ID
     * @return bool|int|string
     */
    private function getActivePrintTypeIndex($typeID, $ID)
    {
        $activePrintTypes = $this->getActivePrintTypes();
        foreach ($activePrintTypes[$typeID] as $index => $printType) {
            if ($printType['printTypeID'] == $ID) {
                return $index;
            }
        }
        return false;
    }

    /**
     * @param $typeID
     * @param $printTypeIndex
     * @param $ID
     * @return bool|int|string
     */
    private function getActiveWorkspaceIndex($typeID, $printTypeIndex, $ID)
    {
        $activePrintTypes = $this->getActivePrintTypes();
        foreach ($activePrintTypes[$typeID][$printTypeIndex]['workspaces'] as $index => $workspace) {
            if ($workspace['workspaceID'] == $ID) {
                return $index;
            }
        }
        return false;
    }

    private function getSizeExternal($format)
    {
        $formatWidth=$format['width'];
        $formatWidth += $format['slopeExternalFront'] + $format['slopeExternalBack'] + $format['wingtipFront']  + $format['wingtipBack'] ;
        if($format['addRidgeThickness'] && $this->addRidgeThickness){
            $formatWidth+=$this->ridgeThickness;
        }
        $formatHeight=$format['height'];
        $formatHeight += $format['slopeExternalTop'] + $format['slopeExternalBottom'];
        if ($format['unit'] == 2) {
            $formatWidth *= 10;
            $formatHeight *= 10;
        }
        return ['formatWidth' => $formatWidth, 'formatHeight' => $formatHeight];
    }

}
