<?php

namespace DreamSoft\Controllers\Components;
/**
 * Description of Price
 *
 * @author Rafał
 */

use DreamSoft\Core\Component;
use DreamSoft\Models\Currency\Currency;
use DreamSoft\Models\Price\ConfPrice;
use DreamSoft\Models\Tax\Tax;
use DreamSoft\Models\Price\BasePrice;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\PrintShopUser\UserDeliveryPrice;
use Exception;

class Price extends Component
{

    public $useModels = array();

    /**
     * @var BasePrice
     */
    private $BasePrice;
    /**
     * @var int
     */
    private $domainID;
    /**
     * @var UserDeliveryPrice
     */
    private $UserDeliveryPrice;
    /**
     * @var array
     */
    private $errors = [];

    /**
     * Price constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->BasePrice = BasePrice::getInstance();
        $this->UserDeliveryPrice = UserDeliveryPrice::getInstance();
    }

    /**
     * @return array
     */
    public function getErrors()
    {
        return $this->errors;
    }

    /**
     * @param array $errors
     */
    public function setErrors($errors)
    {
        $this->errors = $errors;
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * @return mixed
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param $model
     * @throws Exception
     */
    public function setModel($model)
    {
        $this->useModels = array($model);
        try {
            $this->useModels();
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }
    }

    /**
     * @param $models
     */
    public function setModels($models)
    {
        $this->useModels = $models;
        try {
            $this->useModels();
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }
    }

    /**
     * @param $price
     * @return int
     */
    public function getPriceToDb($price)
    {
        $price = trim($price);
        $mask = "/[^0-9.,]/";
        $price = preg_replace($mask, "", $price);
        $price = floatval(str_replace(',', '.', $price));
        return $price *= 100;
    }

    /**
     * @param $price
     * @param string $dot
     * @return string
     */
    public function getPriceToView($price, $dot = ',')
    {
        $price = trim($price);
        if( intval($price) == 0 ) {
            return 0;
        }

        if ($price % 100)
            $decimals = 2;
        else
            $decimals = 0;

        return number_format($price / 100, $decimals, $dot, '');
    }

    /**
     * @param $price
     * @param string $dot
     * @return float|int|mixed
     */
    public function getNumberToView($price, $dot = ',')
    {
        $price = $price / 100;
        if ($dot == ',') {
            $price = str_replace('.', $dot, $price);
        }
        return $price;
    }

    /**
     * @param $price
     * @param null $taxID
     * @param null $currencyEntity
     * @param int $roundType
     * @param bool $ownPrice
     * @return bool|string
     * @throws Exception
     */
    public function setBasePrice($price, $taxID = NULL, $currencyEntity = NULL, $roundType = 0,
                                 $ownPrice = false)
    {
        /**
         * @var $BasePrice BasePrice
         */
        $BasePrice = BasePrice::getInstance();
        /**
         * @var Tax
         */
        $Tax = Tax::getInstance();
        $Tax->setDomainID($this->getDomainID());
        /**
         * @var $Setting Setting
         */
        $Setting = Setting::getInstance();
        $Setting->setModule('general');
        $Setting->setDomainID($this->getDomainID());
        /**
         * @var Currency
         */
        $Currency = Currency::getInstance();
        $Currency->setDomainID($this->getDomainID());

        $actTax = $Tax->customGet($taxID, 1);

        if ($actTax) {
            $taxValue = 1 + (intval($actTax['value']) / 100);
        } elseif (intval($Setting->getValue('defaultTax')) > 0) {
            $actTax = $Tax->customGet($Setting->getValue('defaultTax'), 1);
            $taxID = $actTax['ID'];
            $taxValue = 1 + (intval($actTax['value']) / 100);
        } else {
            $taxValue = MAIN_TAX;
        }

        $defaultCurrency = $Setting->getValue('defaultCurrency');
        $one = $Currency->getOne($defaultCurrency);

        if ($currencyEntity) {
            $currency = $currencyEntity['code'];
            $exchangeRate = $currencyEntity['course'];
        } else {
            $exchangeRate = DEFAULT_COURSE;
        }

        if (!$ownPrice) {
            $price = $price / ($exchangeRate / 100);
        }

        $grossPrice = round($price * $taxValue, 0);

        if (intval($roundType) == 1) {
            $price = $this->priceRound($price, 0);
            $grossPrice = round($price * $taxValue);
        } else if (intval($roundType) == 2) {
            $grossPrice = $this->priceRound($grossPrice, 0);
            $price = $grossPrice / $taxValue;
        }

        if ($defaultCurrency) {
            if ($one) {
                $baseCurrency = $one['code'];
            } else {
                $baseCurrency = 'PLN';
            }
        } else {
            $baseCurrency = 'PLN';
        }

        if ($currencyEntity) {
            $currency = $currencyEntity['code'];
            $exchangeRate = $currencyEntity['course'];
        } else {
            $exchangeRate = DEFAULT_COURSE;
            $currency = $baseCurrency;
        }

        $date = date('Y-m-d H:i:s');

        $lastPriceID = $BasePrice->create(compact('price', 'grossPrice', 'currency', 'baseCurrency', 'exchangeRate', 'taxID', 'date'));
        if ($lastPriceID > 0) {
            return $lastPriceID;
        } else {
            return false;
        }
    }

    /**
     * @param $price
     * @param null $taxID
     * @return bool
     * @throws Exception
     */
    public function setConfPrice($price, $taxID = NULL)
    {
        $ConfPrice = ConfPrice::getInstance();
        $Tax = Tax::getInstance();
        $Tax->setDomainID($this->getDomainID());
        $Setting = Setting::getInstance();
        $Setting->setModule('general');
        $Setting->setDomainID($this->getDomainID());

        $Currency = Currency::getInstance();
        $Currency->setDomainID($this->getDomainID());

        $date = 'Y-m-d H:i:s';

        $lastPriceID = $ConfPrice->create(compact('price', 'taxID', 'date'));
        if ($lastPriceID > 0) {
            return $lastPriceID;
        } else {
            return false;
        }
    }

    /**
     * @param $price
     * @param null $taxID
     * @param null $weight
     * @param null $UnitQty
     * @param null $FS_WeightStart
     * @param null $FS_WeightEnd
     * @param null $FS_ValStart
     * @param null $FS_ValEnd
     * @param null $EX_WeightStart
     * @param null $EX_WeightEnd
     * @param null $EX_ValStart
     * @param null $EX_ValEnd
     * @param null $EX_DimL
     * @param null $EX_DimW
     * @param null $EX_DimH
     * @return bool
     * @throws Exception
     */
    public function setConfPrice_full($price, $taxID = NULL, $weight = NULL, $UnitQty = NULL, $FS_WeightStart = NULL,
                                      $FS_WeightEnd = NULL, $FS_ValStart = NULL, $FS_ValEnd = NULL,
                                      $EX_WeightStart = NULL, $EX_WeightEnd = NULL, $EX_ValStart = NULL,
                                      $EX_ValEnd = NULL, $EX_DimL = NULL, $EX_DimW = NULL, $EX_DimH = NULL)
    {

        /**
         * @var ConfPrice
         */
        $ConfPrice = ConfPrice::getInstance();
        $Tax = Tax::getInstance();
        $Tax->setDomainID($this->getDomainID());
        $Setting = Setting::getInstance();
        $Setting->setModule('general');
        $Setting->setDomainID($this->getDomainID());
        $Currency = Currency::getInstance();
        $Currency->setDomainID($this->getDomainID());

        $date = date('Y-m-d H:i:s');

        $lastPriceID = $ConfPrice->create(
            compact(
                'price',
                'taxID',
                'date',
                'weight',
                'UnitQty',
                'FS_WeightStart',
                'FS_WeightEnd',
                'FS_ValStart',
                'FS_ValEnd',
                'EX_WeightStart',
                'EX_WeightEnd',
                'EX_ValStart',
                'EX_ValEnd',
                'EX_DimL',
                'EX_DimW',
                'EX_DimH'
            )
        );

        if ($lastPriceID > 0) {
            return $lastPriceID;
        } else {
            $errors = [];
            $errors['errors'] = $ConfPrice->getErrors();
            $errors['dbError'] = $ConfPrice->getDbError();
            $this->setErrors($errors);
            return false;
        }
    }

    /**
     * @param $price
     * @param int $precision
     * @return float|int
     */
    public function priceRound($price, $precision = 0)
    {
        if ($price <= 0) {
            return 0;
        }
        $price = round($price / 100, $precision);
        return $price * 100;
    }

    /**
     * @param array $calculations
     * @return int
     */
    public function getTotalDeliveryPrice(array $calculations)
    {
        if (empty($calculations)) {
            return 0;
        }

        $totalPrice = 0;

        $aggregateCalculations = array();
        foreach ($calculations as $calculation) {
            $aggregateCalculations[] = $calculation['ID'];
        }

        $deliveryPrices = $this->UserDeliveryPrice->getByCalcList($aggregateCalculations, NULL, 1);

        $aggregatePrices = array();
        foreach ($calculations as $calculation) {
            if( array_key_exists($calculation['ID'], $deliveryPrices) ) {
                $currentDeliveryPrice = $deliveryPrices[$calculation['ID']];
                $aggregatePrices[] = $currentDeliveryPrice['priceID'];
            }
        }

        $prices = $this->BasePrice->getByList($aggregatePrices);

        foreach ($calculations as $calculation) {

            if( array_key_exists($calculation['ID'], $deliveryPrices) ) {

                $currentDeliveryPrice = $prices[$deliveryPrices[$calculation['ID']]['priceID']];

                if( $currentDeliveryPrice['currency'] != $currentDeliveryPrice['baseCurrency'] ) {
                    $totalPrice += $currentDeliveryPrice['price'] * ($currentDeliveryPrice['exchangeRate']/100);
                } else {
                    $totalPrice += $currentDeliveryPrice['price'];
                }
            }
        }

        return $totalPrice;

    }

    /**
     * @param array $calculations
     * @return int
     */
    public function getTotalBasePrice($calculations)
    {
        if ( !$calculations ) {
            return 0;
        }

        $totalPrice = 0;

        $aggregatePrices = array();
        foreach ($calculations as $calculation) {
            $aggregatePrices[] = $calculation['priceID'];
        }

        $prices = $this->BasePrice->getByList($aggregatePrices);

        foreach ($calculations as $calculation) {
            $currentProductPrice = $prices[$calculation['priceID']];

            if( $currentProductPrice['currency'] != $currentProductPrice['baseCurrency'] ) {
                $totalPrice += $currentProductPrice['price'] * ($currentProductPrice['exchangeRate']/100);
            } else {
                $totalPrice += $currentProductPrice['price'];
            }

        }

        return $totalPrice;
    }

}
