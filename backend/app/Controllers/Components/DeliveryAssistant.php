<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 18-12-2018
 * Time: 17:24
 */

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;
use DreamSoft\Models\Currency\Currency;
use DreamSoft\Models\Delivery\Delivery;
use DreamSoft\Models\Module\Module;
use DreamSoft\Models\Module\ModuleKey;
use DreamSoft\Models\Module\ModuleOption;
use DreamSoft\Models\Module\ModuleValue;
use DreamSoft\Models\Price\ConfPrice;
use DreamSoft\Models\Tax\Tax;

class DeliveryAssistant extends Component
{
    public $useModels = array();

    /**
     * @var Module
     */
    private $Module;
    /**
     * @var ModuleKey
     */
    private $ModuleKey;

    private $domainID;
    /**
     * @var ModuleValue
     */
    private $ModuleValue;
    /**
     * @var Delivery
     */
    private $Delivery;
    /**
     * @var Currency
     */
    private $Currency;
    /**
     * @var Tax
     */
    private $Tax;
    /**
     * @var ConfPrice
     */
    private $ConfPrice;
    /**
     * @var Price
     */
    private $Price;
    /**
     * @var ModuleOption
     */
    private $ModuleOption;

    /**
     * PaymentAssistant constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->Module = Module::getInstance();
        $this->ModuleKey = ModuleKey::getInstance();
        $this->ModuleValue = ModuleValue::getInstance();
        $this->Delivery = Delivery::getInstance();
        $this->ConfPrice = ConfPrice::getInstance();
        $this->Currency = Currency::getInstance();
        $this->Tax = Tax::getInstance();
        $this->Price = Price::getInstance();
        $this->ModuleOption = ModuleOption::getInstance();

    }

    public function setDomainID($domainID)
    {
        $this->ModuleValue->setDomainID($domainID);
        $this->Currency->setDomainID($domainID);
    }

    /**
     * @param $courierModules
     * @param $courierID
     * @return bool
     */
    public function searchCourierByID($courierModules, $courierID)
    {
        foreach ($courierModules as $courierModule) {
            if ($courierModule['ID'] == $courierID) {
                return $courierModule;
            }
        }
        return false;
    }

    public function getModuleValues($moduleID, $deliveryID)
    {
        $this->ModuleKey->setModuleID($moduleID);
        $keys = $this->ModuleKey->getAllByModule();
        $resultValues = array();
        if (!$keys) {
            return false;
        }
        foreach ($keys as $key) {
            $value = $this->ModuleValue->getByComponent($key['ID'], $deliveryID);
            $resultValues[$key['key']] = $value['value'];
        }

        return $resultValues;
    }

    /**
     * @return array|bool
     */
    public function getCourierModules()
    {
        $courierModules = $this->Module->getAll('couriers');
        if( !$courierModules ) {
            return false;
        }
        return $courierModules;
    }

    /**
     * @param $params
     * @param null $currencyCode
     * @return array|bool
     */
    public function getDeliveries($params, $currencyCode = NULL)
    {

        $data = $this->Delivery->getAll($params);

        $course = DEFAULT_COURSE;

        if ($currencyCode) {
            $currency = $this->Currency->getByCode($currencyCode);
            if ($currency['course']) {
                $course = $currency['course'];
            }
        }

        $modules = $this->getModules();

        if (!empty($data)) {
            foreach ($data as $key => &$row) {

                if (isset($modules[$row['courierID']])) {
                    $row['module'] = $modules[$row['courierID']];
                }

                if( $row['module']['key'] == 'dpd-russia' ) {

                    $courierSettings = $this->getModuleValues($row['courierID'], $row['ID']);

                    if( $courierSettings['service-variant'] == 'ДТ' || $courierSettings['service-variant'] == 'ТТ' ) {
                        $row['hasParcelShops'] = true;
                    }
                }

                if (isset($row['priceID'])) {
                    $price = $this->ConfPrice->get('ID', $row['priceID']);

                    $price['price'] = $price['price'] / ($course / 100);

                    $tax = $this->Tax->customGet($price['taxID']);
                    if ($tax) {
                        $priceBrutto = $price['price'] * (1 + ($tax['value'] / 100));
                        $priceTmp = $this->Price->getPriceToView($priceBrutto, '.');
                    } else {
                        $priceTmp = $this->Price->getPriceToView($price['price'], '.');
                    }

                    $price['price'] = $this->Price->getPriceToView($price['price'], '.');
                    $price['priceGross'] = $priceTmp;
                    $price['tax'] = $tax['value'];
                    $data[$key]['price'] = $price;
                }
            }
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @return array|bool
     */
    public function getModules()
    {
        $modules = $this->Module->getAll();

        $moduleArr = array();
        foreach ($modules as $m) {
            $modules[$m['ID']] = $m;
            $moduleArr[] = $m['ID'];
        }

        $collectionPoints = array();

        $keys = $this->ModuleKey->getByList($moduleArr, 'collectionAttributes');
        $keysArr = array();

        foreach ($keys as $k) {
            $one = current($k);

            if( $one['func'] === 'collectionAttributes' ) {
                $values = $this->ModuleValue->getByKeyID($one['ID'], true);
                if( $values ) {
                    foreach ($values as $vKey => $value) {
                        $value['langs'][lang]['name'] = $value['value'];
                        $collectionPoints[$one['moduleID']][] = $value;
                    }
                }
            }

            $modules[$one['moduleID']]['keys'][] = $one;
            $modules[$one['moduleID']]['collectionPoints'] = $collectionPoints[$one['moduleID']];
            $keysArr[] = $one['ID'];
        }

        return $modules;
    }
}