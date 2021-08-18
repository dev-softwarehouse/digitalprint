<?php
/**
 * Created by PhpStorm.
 * User: lenovo
 * Date: 22.03.19
 * Time: 11:34
 */

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;
use DreamSoft\Models\PrintShopProduct\PrintShopVolume;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\Tax\Tax;
use DreamSoft\Models\Currency\Currency;
use DreamSoft\Libs\Auth;
use DreamSoft\Models\PrintShopProduct\PrintShopGroup;
use DreamSoft\Models\Setting\Setting;

/**
 * Class CalculateAssistant
 * @package DreamSoft\Controllers\Components
 */
class CalculateAssistant extends Component
{
    public $useModels = array();

    /**
     * @var PrintShopVolume
     */
    private $PrintShopVolume;
    /**
     * @var PrintShopType
     */
    private $PrintShopType;
    /**
     * @var CalculatorCore
     */
    private $CalculatorCore;
    /**
     * @var Tax
     */
    private $Tax;
    /**
     * @var Currency
     */
    private $Currency;
    /**
     * @var DiscountCalculation
     */
    private $DiscountCalculation;
    /**
     * @var Auth
     */
    private $Auth;
    /**
     * @var PromotionCalculation
     */
    private $PromotionCalculation;
    /**
     * @var PrintShopGroup
     */
    private $PrintShopGroup;
    /**
     * @var Price
     */
    private $Price;
    /**
     * @var Setting
     */
    private $Setting;


    /**
     * CalculateAssistant constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->PrintShopVolume = PrintShopVolume::getInstance();
        $this->PrintShopGroup = PrintShopGroup::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->CalculatorCore = Calculator::getInstance();
        $this->DiscountCalculation = new DiscountCalculation();
        $this->Currency = Currency::getInstance();
        $this->PromotionCalculation = new PromotionCalculation();
        $this->Auth = new Auth();
        $this->Price = Price::getInstance();
        $this->Setting = Setting::getInstance();
        $this->Tax = Tax::getInstance();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->CalculatorCore->setDomainID($domainID);
        $this->Tax->setDomainID($domainID);
        $this->DiscountCalculation->setDomainID($domainID);
        $this->Currency->setDomainID($domainID);
        $this->PromotionCalculation->setDomainID($domainID);
        $this->Setting->setDomainID($domainID);
    }

    /**
     * @param $post
     * @return array
     */
    public function prepareRealizationTimes($post)
    {
        $amount = $post['amount'];
        $groupID = $post['groupID'];
        $typeID = $post['typeID'];
        $products = $post['products'];
        $customVolumes = array();
        if( array_key_exists('customVolumes', $post) ) {
            $customVolumes = $post['customVolumes'];
        }

        $taxID = false;
        if(  array_key_exists('taxID', $post)) {
            $taxID = $post['taxID'];
        }

        $currencyCode = $post['currency'];

        $orderUserID = false;
        if( array_key_exists('userID', $post) ) {
            $orderUserID = $post['userID'];
        }
        $selectedTechnology = false;
        if( array_key_exists('selectedTechnology', $post) ) {
            $selectedTechnology = $post['selectedTechnology'];
        }

        $limitedVolumes = 0;
        if( array_key_exists('limitedVolumes', $post) ) {
            $limitedVolumes = $post['limitedVolumes'];
        }

        $tax = $this->selectActualTax($taxID);

        $this->PrintShopVolume->setGroupID($groupID);
        $this->PrintShopVolume->setTypeID($typeID);

        $volumes = $this->PrintShopVolume->getAll(true);

        $minVolume = current($volumes);

        $customVolumesArr = array();
        if (!empty($customVolumes)) {
            foreach ($customVolumes as $row) {

                if ($row['volume'] < $minVolume['volume']) {
                    continue;
                }

                $customVolumesArr[] = $row['volume'];
            }
        }

        $volumesArr = array();
        foreach ($volumes as $each) {
            $cKey = array_search($each['volume'], $customVolumesArr);
            if ($cKey) {
                unset($customVolumesArr[$cKey]);
            }
            $volumesArr[] = $each['ID'];
        }

        if (!empty($customVolumesArr)) {
            foreach ($customVolumesArr as $value) {
                $volumes[] = array('volume' => $value, 'active' => true, 'custom' => true);
            }
        }

        $volumesToFormats = array();

        if( !empty($volumesArr) ) {
            $volumesToFormats = $this->PrintShopVolume->volumesHasFormats($volumesArr);
        }

        if($volumesToFormats === false) {
            $volumesToFormats = array();
        }

        $formats = array();

        if (!empty($products)) {

            if (count($products) == 1) {
                $product = current($products);
                $formats[] = $product['formatID'];
            } elseif (count($products) > 1) {

                foreach ($products as $p) {
                    $formats[] = $p['formatID'];
                }

            }

        }

        $volumes = $this->filterVolumesByFormats($volumes, $formats, $volumesToFormats);

        $volumesManipulator = array();
        if( $limitedVolumes ) {
            $volumesManipulator = $this->limitNumberOfVolumes($volumes, $post['activeVolume']);
            $volumes = $volumesManipulator['volumes'];
        }

        $result = array(
            'volumes' => array(),
            'realisationTimes' => array(),
            'response' => false
        );

        $type = $this->PrintShopType->get('ID', $typeID);
        $customVolume = $this->PrintShopVolume->getCustom();
        $result['customVolume'] = array('custom' => false);
        if ($customVolume != false) {
            $result['volumeInfo'] = array('custom' => true, 'maxVolume' => $type['maxVolume']);
        }

        $this->CalculatorCore->setCustomVolumes($customVolumesArr);

        $currency = $this->selectActualCurrency($currencyCode);

        $this->CalculatorCore->setCurrencyCourse($currency['course']);

        $loggedUser = $this->Auth->getLoggedUser();

        $firstProductFormatID = NULL;
        if (count($products) == 1) {
            $firstProductFormatID = $products[0]['formatID'];
        }

        if ($orderUserID && sourceApp === 'manager') {
            $this->DiscountCalculation->searchBestDiscounts($orderUserID, $groupID, $typeID, $firstProductFormatID);
            $this->CalculatorCore->setOrderUserID($orderUserID);
        } else if ($loggedUser) {
            $this->DiscountCalculation->searchBestDiscounts($loggedUser['ID'], $groupID, $typeID, $firstProductFormatID);
        }

        $this->PromotionCalculation->searchBestPromotions($groupID, $typeID, $firstProductFormatID);
        $selectedPromotions = $this->PromotionCalculation->getSelectedPromotions();

        $selectedDiscount = $this->DiscountCalculation->getSelectedDiscount();
        $this->CalculatorCore->setSelectedDiscount($selectedDiscount);
        $this->CalculatorCore->setSelectedPromotions($selectedPromotions);

        $group = $this->PrintShopGroup->customGet($groupID);

        $result['technologies'] = array();

        $this->CalculatorCore->setSelectedTechnology($selectedTechnology);

        $preparedVolumes = $this->filterVolumes($volumes, $formats, $volumesToFormats);
        $this->CalculatorCore->setVolumesContainer($preparedVolumes);

        $calculations = array();

        $additionalVolumes = array();

        foreach ($volumes as $each) {

            $calculation = $this->CalculatorCore->calculate($groupID, $typeID, $amount, $each['volume'], $products, $tax);

            $calculation['volume'] = $each['volume'];

            $inactive = array();
            foreach ($calculation['realisationTimes'][$typeID] as $realisationTime) {
                foreach( $realisationTime['volumes'] as $realisationTimeVolume ) {
                    if( $realisationTimeVolume['active'] == false ) {
                        if( array_key_exists($realisationTimeVolume['volume'], $inactive) ) {
                            $inactive[$realisationTimeVolume['volume']]++;
                        } else {
                            $inactive[$realisationTimeVolume['volume']] = 1;
                        }
                    }
                }
            }

            $excludeCalculation = false;

            if( array_key_exists($each['volume'], $inactive) ) {
                if( $inactive[$each['volume']] == count($calculation['realisationTimes'][$typeID]) ) {
                    $lastIndex = $volumesManipulator['lastIndex']+1;
                    if( array_key_exists($lastIndex, $volumesManipulator['oldVolumes']) ){
                        $additionalVolumes[] = $volumesManipulator['oldVolumes'][$lastIndex];
                        $excludeCalculation = true;
                    }
                }
            }

            if( !$excludeCalculation ) {
                $calculations[] = $calculation;
            }

        }

        foreach ($additionalVolumes as $each) {

            $calculation = $this->CalculatorCore->calculate($groupID, $typeID, $amount, $each['volume'], $products, $tax);
            $calculation['volume'] = $each['volume'];
            $calculations[] = $calculation;

        }

        foreach ($calculations as $calculation) {

            if ($calculation['correctCalculation'] === true) {

                $calculation['calculation'] = $this->discountChangePrice($calculation['calculation'], $tax);

                $price = $this->Price->getPriceToView($calculation['calculation']['price']);
                $calculation['calculation']['price'] = $price;

                $priceBrutto = $this->Price->getPriceToView($calculation['calculation']['priceBrutto']);
                $calculation['calculation']['priceBrutto'] = $priceBrutto;

                if (in_array($calculation['volume'], $this->CalculatorCore->getCustomVolumes())) {
                    $custom = true;
                } else {
                    $custom = false;
                }

                $calculation = $this->roundRealisationTimePrices($calculation, $typeID, $group['round'], $tax);
                $calculation = $this->checkAmountForBasePrices($calculation, $typeID, $amount);
                sort($calculation['realisationTimes'][$typeID]);

                $result['realisationTimes'] = $calculation['realisationTimes'][$typeID];

                $result['volumes'][] = array(
                    'calculation' => $calculation['calculation'],
                    'volume' => $calculation['volume'],
                    'custom' => $custom
                );

                $result['technologies'] = $this->searchUsedTechnologies(
                    $selectedTechnology,
                    $calculation['calculation'],
                    $result['technologies']
                );

            }
        }

        $result['technologies'] = array_values($result['technologies']);

        $round = 0;
        if( array_key_exists('round', $group) ) {
            $round = $group['round'];
        }

        $result['volumes'] = $this->roundRealisationVolumes($result['volumes'], $tax, $round);

        $result['tax'] = $tax;
        $result['currency'] = $currency['code'];

        $result['response'] = false;
        if (!empty($result['volumes'])) {
            $result['response'] = true;
        }

        return $result;
    }

    /**
     * @param $volumes
     * @param $formats
     * @param $volumesToFormats
     * @return array
     */
    private function filterVolumesByFormats($volumes, $formats, $volumesToFormats)
    {
        $filteredVolumes = array();
        foreach ($volumes as $each) {
            foreach ($formats as $formatID) {
                if ( array_key_exists($each['ID'], $volumesToFormats) && is_array($volumesToFormats[$each['ID']]) &&
                    !in_array($formatID, $volumesToFormats[$each['ID']])) {
                    continue 2;
                }
            }
            $filteredVolumes[] = $each;
        }

        return $filteredVolumes;
    }

    /**
     * @param $volumes
     * @param $activeVolume
     * @return array
     */
    private function limitNumberOfVolumes($volumes, $activeVolume)
    {
        $this->Setting->setModule('general');
        $numberOfVolumes = $this->Setting->getValue('numberOfVolumesInOffer');

        $actualVolumeIndex = 0;

        foreach ($volumes as $key => $volume) {
            if ($volume['volume'] == $activeVolume) {
                $actualVolumeIndex = $key;
                break;
            }
        }

        if ($numberOfVolumes >= (count($volumes) - 1)) {
            $firstIndex = 0;
            $lastIndex = count($volumes) - 1;
        } else {

            $halfOfVolumes = (intval($numberOfVolumes) / 2);
            $firstIndex = $actualVolumeIndex - $halfOfVolumes;
            $lastIndex = $firstIndex + ($numberOfVolumes - 1);

            if ($firstIndex < 0) {
                $firstIndex = 0;
                $lastIndex = $firstIndex + ($numberOfVolumes - 1);
            }

            if ($lastIndex > (count($volumes) - 1)) {
                $lastIndex = count($volumes) - 1;
                $firstIndex = $lastIndex - ($numberOfVolumes - 1);
            }

        }

        $filteredVolumes = array();

        foreach ($volumes as $key => $volume) {
            if ($key >= $firstIndex && $key <= $lastIndex) {
                $filteredVolumes[] = $volume;
            }
        }

        return array(
            'volumes' => $filteredVolumes,
            'oldVolumes' => $volumes,
            'firstIndex' => $firstIndex,
            'lastIndex' => $lastIndex
        );
    }

    /**
     * @param $taxID
     * @return array|bool|null
     */
    private function selectActualTax($taxID)
    {
        $this->Setting->setModule('general');
        $tax = NULL;

        if (!$taxID) {
            if ($this->Setting->getValue('defaultTax') > 0) {
                $tax = $this->Tax->customGet($this->Setting->getValue('defaultTax'), 1);
            } else {
                $tax = array('name' => 'empty', 'value' => 0);
            }
        } else {
            $tax = $this->Tax->customGet($taxID, 1);
        }

        return $tax;
    }

    /**
     * @param $currencyCode
     * @return array|bool|mixed|null
     */
    private function selectActualCurrency($currencyCode)
    {
        $this->Setting->setModule('general');
        $currency = NULL;

        if (!$currencyCode) {
            if ($this->Setting->getValue('defaultCurrency') > 0) {
                $currency = $this->Currency->get('ID', $this->Setting->getValue('defaultCurrency'));
            } else {
                $currency = array('code' => DEFAULT_CURRENCY, 'course' => 100);
            }
        } else {
            $currency = $this->Currency->getByCode($currencyCode);
        }

        return $currency;
    }

    /**
     * @param $volumes
     * @param $formats
     * @param $volumesToFormats
     * @return array
     */
    private function filterVolumes($volumes, $formats, $volumesToFormats) {

        $filteredVolumes = array();
        foreach ($volumes as $each) {
            foreach ($formats as $formatID) {
                if (array_key_exists($each['ID'], $volumesToFormats) && is_array($volumesToFormats[$each['ID']]) &&
                    !in_array($formatID, $volumesToFormats[$each['ID']])) {
                    continue 2;
                }

                $filteredVolumes[] = $each;
            }
        }

        return $filteredVolumes;

    }

    /**
     * @param $calculation
     * @param $tax
     * @return mixed
     */
    private function discountChangePrice($calculation, $tax)
    {
        if ($calculation['percentageDiscount'] > 0) {
            $discount = ($calculation['price'] * $calculation['percentageDiscount']) / 100;
            if ($discount > $calculation['attrDiscount']) {
                $calculation['price'] = $calculation['price'] - $discount;
                $calculation['priceBrutto'] = $calculation['price'] * (1 + ($tax['value'] / 100));
            }
        }

        return $calculation;
    }

    /**
     * @param $calculation
     * @param $typeID
     * @param $roundType
     * @param $tax
     * @return mixed
     */
    private function roundRealisationTimePrices($calculation, $typeID, $roundType, $tax)
    {
        if ($roundType == 0) {
            return $calculation;
        }

        if (!$tax) {
            return $calculation;
        }

        foreach ($calculation['realisationTimes'][$typeID] as $key => $realisationTime) {

            if (empty($realisationTime['volumes'])) {
                continue;
            }
            foreach ($realisationTime['volumes'] as $volumeKey => $volume) {

                if ($roundType == 1) {
                    $price = $this->Price->getPriceToDb($volume['price']);
                    $price = $this->Price->priceRound($price, 0);
                    $grossPrice = $price * (1 + ($tax['value'] / 100));
                    $calculation['realisationTimes'][$typeID][$key]['volumes'][$volumeKey]['price'] = $this->Price->getPriceToView($price);
                    $calculation['realisationTimes'][$typeID][$key]['volumes'][$volumeKey]['priceBrutto'] = $this->Price->getPriceToView($grossPrice);
                } else if ($roundType == 2) {
                    $grossPrice = $this->Price->getPriceToDb($volume['priceBrutto']);
                    $grossPrice = $this->Price->priceRound($grossPrice, 0);
                    $price = $grossPrice / (1 + ($tax['value'] / 100));
                    $calculation['realisationTimes'][$typeID][$key]['volumes'][$volumeKey]['priceBrutto'] = $this->Price->getPriceToView($grossPrice);
                    $calculation['realisationTimes'][$typeID][$key]['volumes'][$volumeKey]['price'] = $this->Price->getPriceToView($price);
                }
            }
        }

        return $calculation;

    }

    /**
     * @param $calculation
     * @param $typeID
     * @param $amount
     * @return mixed
     */
    private function checkAmountForBasePrices($calculation, $typeID, $amount)
    {
        foreach ($calculation['realisationTimes'][$typeID] as $key => $realisationTime) {

            if (empty($realisationTime['volumes'])) {
                continue;
            }

            foreach ($realisationTime['volumes'] as $volumeKey => $volume) {

                if( array_key_exists('oldPrice', $volume) ) {
                    $oldPrice = $this->Price->getPriceToDb($volume['oldPrice']);
                } else {
                    $oldPrice = $this->Price->getPriceToDb($volume['price']);
                }

                if( array_key_exists('oldPriceBrutto', $volume) ) {
                    $oldPriceBrutto = $this->Price->getPriceToDb($volume['oldPriceBrutto']);
                } else {
                    $oldPriceBrutto = $this->Price->getPriceToDb($volume['priceBrutto']);
                }

                if( $amount > 1 ) {
                    $oldPrice *= $amount;
                    $oldPriceBrutto *= $amount;
                }
                $calculation['realisationTimes'][$typeID][$key]['volumes'][$volumeKey]['oldPrice'] = $this->Price->getPriceToView($oldPrice);
                $calculation['realisationTimes'][$typeID][$key]['volumes'][$volumeKey]['oldPriceBrutto'] = $this->Price->getPriceToView($oldPriceBrutto);
            }

        }

        return $calculation;
    }

    /**
     * @param $selectedTechnology
     * @param $calculation
     * @param $technologies
     * @return array
     */
    private function searchUsedTechnologies($selectedTechnology, $calculation, $technologies)
    {
        if (!array_key_exists($calculation['priceLists']['ID'], $technologies)) {
            $technologies[$calculation['priceLists']['ID']] = $calculation['priceLists'];
            if ($selectedTechnology) {
                $technologies[$calculation['priceLists']['ID']]['selected'] = true;
            }
        }

        if ( array_key_exists('notSelectedPrintTypes', $calculation) && $calculation['notSelectedPrintTypes']) {
            foreach ($calculation['notSelectedPrintTypes'] as $notSelected) {
                if (!array_key_exists($notSelected['ID'], $technologies)) {
                    $technologies[$notSelected['ID']] = $notSelected;
                    if ($selectedTechnology) {
                        $technologies[$notSelected['ID']]['selected'] = false;
                    }
                }
            }
        }

        return $technologies;
    }

    /**
     * @param $volumes
     * @param $roundType
     * @param $tax
     * @return mixed
     */
    private function roundRealisationVolumes($volumes, $tax, $roundType = 0)
    {
        if ($roundType == 0) {
            return $volumes;
        }

        foreach ($volumes as $key => $volume) {
            if (intval($roundType) == 1) {
                $price = $this->Price->getPriceToDb($volume['calculation']['price']);
                $price = $this->Price->priceRound($price, 0);
                $grossPrice = $price * (1 + ($tax['value'] / 100));
                $volumes[$key]['calculation']['price'] = $this->Price->getPriceToView($price);
                $volumes[$key]['calculation']['priceBrutto'] = $this->Price->getPriceToView($grossPrice);
            } else if (intval($roundType) == 2) {
                $grossPrice = $this->Price->getPriceToDb($volume['calculation']['priceBrutto']);
                $grossPrice = $this->Price->priceRound($grossPrice, 0);
                $price = $grossPrice / (1 + ($tax['value'] / 100));
                $volumes[$key]['calculation']['price'] = $this->Price->getPriceToView($price);
                $volumes[$key]['calculation']['priceBrutto'] = $this->Price->getPriceToView($grossPrice);
            }
        }

        return $volumes;

    }
}