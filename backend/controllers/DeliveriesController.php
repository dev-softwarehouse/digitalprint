<?php

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Address\Address;
use DreamSoft\Models\Delivery\Delivery;
use DreamSoft\Models\Delivery\DeliveryName;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\Currency\Currency;
use DreamSoft\Controllers\Components\DpdRussiaDelivery;
use DreamSoft\Controllers\Components\DeliveryAssistant;
use DreamSoft\Models\Module\Module;
use DreamSoft\Models\Module\ModuleKey;
use DreamSoft\Models\Module\ModuleOption;
use DreamSoft\Models\Module\ModuleValue;
use DreamSoft\Models\Price\ConfPrice;
use DreamSoft\Models\Tax\Tax;
use DreamSoft\Controllers\Components\Standard;

/**
 * Class DeliveriesController
 */
class DeliveriesController extends Controller
{

    public $useModels = array();

    /**
     * @var Price
     */
    protected $Price;
    /**
     * @var Delivery
     */
    protected $Delivery;
    /**
     * @var DeliveryName
     */
    protected $DeliveryName;
    /**
     * @var LangSetting
     */
    protected $LangSetting;
    /**
     * @var ConfPrice
     */
    protected $ConfPrice;
    /**
     * @var Tax
     */
    protected $Tax;
    /**
     * @var Module
     */
    protected $Module;
    /**
     * @var ModuleKey
     */
    protected $ModuleKey;
    /**
     * @var ModuleValue
     */
    protected $ModuleValue;
    /**
     * @var Currency
     */
    protected $Currency;
    /**
     * @var DpdRussiaDelivery
     */
    private $DpdRussiaDelivery;
    /**
     * @var DeliveryAssistant
     */
    private $DeliveryAssistant;
    /**
     * @var Address
     */
    private $Address;
    /**
     * @var ModuleOption
     */
    private $ModuleOption;
    /**
     * @var Standard
     */
    private $Standard;

    /**
     * @method
     * @param {Integer} $domainID
     */
    public function setDomainID($domainID)
    {
        $this->Delivery->setDomainID($domainID);
        $this->LangSetting->setDomainID($domainID);
        $this->Currency->setDomainID($domainID);
        $this->Price->setDomainID($domainID);
        $this->Tax->setDomainID($domainID);
        $this->ModuleValue->setDomainID($domainID);
        $this->DpdRussiaDelivery->setDomainID($domainID);
        $this->DeliveryAssistant->setDomainID($domainID);
        parent::setDomainID($domainID);
    }

    /**
     * DeliveriesController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Standard = Standard::getInstance();
        $this->Delivery = Delivery::getInstance();
        $this->DeliveryName = DeliveryName::getInstance();
        $this->LangSetting = LangSetting::getInstance();
        $this->Price = Price::getInstance();
        $this->ConfPrice = ConfPrice::getInstance();
        $this->Tax = Tax::getInstance();
        $this->Module = Module::getInstance();
        $this->ModuleKey = ModuleKey::getInstance();
        $this->ModuleValue = ModuleValue::getInstance();
        $this->ModuleOption = ModuleOption::getInstance();
        $this->Currency = Currency::getInstance();
        $this->DpdRussiaDelivery = DpdRussiaDelivery::getInstance();
        $this->DeliveryAssistant = DeliveryAssistant::getInstance();
        $this->Address = Address::getInstance();
    }

    /**
     * @param null $params
     * @return array
     */
    public function deliveries($params = NULL)
    {
        return $this->_deliveries($params);
    }

    /**
     * @param $currencyCode
     * @param null $params
     * @return array
     */
    public function deliveriesPublic($currencyCode, $params = NULL)
    {
        return $this->_deliveries($params, $currencyCode);
    }

    /**
     * @param $params
     * @param null $currencyCode
     * @return array|bool
     */
    private function _deliveries($params, $currencyCode = NULL)
    {

        $data = $this->Delivery->getAll($params);

        $course = DEFAULT_COURSE;

        if ($currencyCode) {
            $currency = $this->Currency->getByCode($currencyCode);
            if ($currency['course']) {
                $course = $currency['course'];
            }
        }

        $modules = $this->Module->getAll('couriers');

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
            $keysArr[] = $one['ID'];
        }

        if (!empty($data)) {
            foreach ($data as $key => &$row) {

                if (isset($modules[$row['courierID']])) {
                    $row['module'] = $modules[$row['courierID']];
                }

                if( array_key_exists($row['courierID'], $collectionPoints) && count($collectionPoints[$row['courierID']]) > 0 ) {
                    $row['collectionPoints'] = array_values($collectionPoints[$row['courierID']]);
                    $row['module']['func'] = 'collectionAttributes';
                }

                if( $row['module']['key'] == 'dpd-russia' ) {

                    $courierSettings = $this->DeliveryAssistant->getModuleValues($row['courierID'], $row['ID']);

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
     * @return array
     * @throws Exception
     */
    public function post_deliveries()
    {
        $names = $this->Data->getPost('names');
        $courierID = $this->Data->getPost('courierID');
        $price = $this->Data->getPost('price');
        $taxID = $this->Data->getPost('taxID');

        $weight = $this->Data->getPost('weight');
        $UnitQty = $this->Data->getPost('UnitQty');
        $FS_WeightStart = $this->Data->getPost('FS_WeightStart');
        $FS_WeightEnd = $this->Data->getPost('FS_WeightEnd');
        $FS_ValStart = $this->Data->getPost('FS_ValStart');
        $FS_ValEnd = $this->Data->getPost('FS_ValEnd');
        $EX_WeightStart = $this->Data->getPost('EX_WeightStart');
        $EX_WeightEnd = $this->Data->getPost('EX_WeightEnd');
        $EX_ValStart = $this->Data->getPost('EX_ValStart');
        $EX_ValEnd = $this->Data->getPost('EX_ValEnd');
        $EX_DimL = $this->Data->getPost('EX_DimL');
        $EX_DimW = $this->Data->getPost('EX_DimW');
        $EX_DimH = $this->Data->getPost('EX_DimH');

        $EX_WeightStart = $this->Standard->floatToDb($EX_WeightStart);
        $EX_WeightEnd = $this->Standard->floatToDb($EX_WeightEnd);
        $FS_WeightStart = $this->Standard->floatToDb($FS_WeightStart);
        $FS_WeightEnd = $this->Standard->floatToDb($FS_WeightEnd);

        $EX_ValStart = $this->Price->getPriceToDb($EX_ValStart);
        $EX_ValEnd = $this->Price->getPriceToDb($EX_ValEnd);
        $FS_ValStart = $this->Price->getPriceToDb($FS_ValStart);
        $FS_ValEnd = $this->Price->getPriceToDb($FS_ValEnd);

        $data['response'] = false;

        $domainID = $this->Delivery->getDomainID();

        if ($price != NULL) {
            $price = $this->Price->getPriceToDb($price);

            $priceID = $this->Price->setConfPrice_full($price, $taxID, $weight, $UnitQty, $FS_WeightStart, $FS_WeightEnd, $FS_ValStart, $FS_ValEnd, $EX_WeightStart, $EX_WeightEnd, $EX_ValStart, $EX_ValEnd, $EX_DimL, $EX_DimW, $EX_DimH);

            if (!$priceID) {
                $data = $this->sendFailResponse('02', 'Problem z ceną');
                $data['errors'] = $this->Price->getErrors();
                return $data;
            }

        } else {
            $priceID = null;
        }

        if (!empty($names) && $domainID) {

            $params['priceID'] = $priceID;
            $params['domainID'] = $domainID;
            $params['courierID'] = $courierID;

            $deliveryID = $this->Delivery->createObj($params);
            if (!$deliveryID) {
                $data = $this->sendFailResponse('03');
                return $data;
            }
            $item = $params;
            $item['ID'] = $deliveryID;
            $data['item'] = $item;
            unset($params);
        } else {
            $data = $this->sendFailResponse('02', $domainID);
            return $data;
        }

        if (!empty($names) && $deliveryID > 0) {

            foreach ($names as $lang => $name) {
                $params['name'] = $name;
                $params['lang'] = $lang;
                $params['deliveryID'] = $deliveryID;
                $lastID = $this->Delivery->createName($params);
                if ($lastID > 0) {
                    $data['response'] = true;
                }
            }
        }
        return $data;
    }

    /**
     * @param $deliveryID
     * @return array
     * @throws Exception
     */
    public function put_deliveries($deliveryID = NULL)
    {
        if (!$deliveryID) {
            $deliveryID = $this->Data->getPost('ID');
        }
        $res = false;

        if (!$deliveryID) {
            $data = $this->sendFailResponse('07', 'Nie ma ID sposobu dostawy ');
            return $data;
        }

        $post = $this->Data->getAllPost();

        $price = $post['price']['price'];
        $taxID = $post['price']['taxID'];

        $weight = $post['price']['weight'];
        $UnitQty = $post['price']['UnitQty'];
        $FS_WeightStart = $post['price']['FS_WeightStart'];
        $FS_WeightEnd = $post['price']['FS_WeightEnd'];
        $FS_ValStart = $post['price']['FS_ValStart'];
        $FS_ValEnd = $post['price']['FS_ValEnd'];
        $EX_WeightStart = $post['price']['EX_WeightStart'];
        $EX_WeightEnd = $post['price']['EX_WeightEnd'];
        $EX_ValStart = $post['price']['EX_ValStart'];
        $EX_ValEnd = $post['price']['EX_ValEnd'];
        $EX_DimL = $post['price']['EX_DimL'];
        $EX_DimW = $post['price']['EX_DimW'];
        $EX_DimH = $post['price']['EX_DimH'];

        $EX_WeightStart = $this->Standard->floatToDb($EX_WeightStart);
        $EX_WeightEnd = $this->Standard->floatToDb($EX_WeightEnd);
        $FS_WeightStart = $this->Standard->floatToDb($FS_WeightStart);
        $FS_WeightEnd = $this->Standard->floatToDb($FS_WeightEnd);

        $EX_ValStart = $this->Price->getPriceToDb($EX_ValStart);
        $EX_ValEnd = $this->Price->getPriceToDb($EX_ValEnd);
        $FS_ValStart = $this->Price->getPriceToDb($FS_ValStart);
        $FS_ValEnd = $this->Price->getPriceToDb($FS_ValEnd);

        $collectionOption = $post['collectionOption'];

        $savedModuleValues = 0;

        if( $collectionOption && is_array($collectionOption) ) {
            $keyID = key($collectionOption);
            if( $this->ModuleValue->deleteByKeyID($keyID) ) {
                foreach ($collectionOption[$keyID] as $item) {
                    $params = array();
                    $params['moduleKeyID'] = $keyID;
                    $params['value'] = $item;
                    $params['domainID'] = $this->getDomainID();
                    if( $this->ModuleValue->create($params) ) {
                        $savedModuleValues++;
                    }
                }
            }

        }

        if ($price !== NULL && $taxID) {
            $delivery = $this->Delivery->get('ID', $deliveryID);
            $priceID = $delivery['priceID'];
            $exist = $this->ConfPrice->exist('ID', $priceID);
            if ($exist > 0) {
                $price = $this->Price->getPriceToDb($price);
                $this->ConfPrice->update($priceID, 'price', $price);
                $this->ConfPrice->update($priceID, 'taxID', $taxID);
                $this->ConfPrice->update($priceID, 'weight', $weight);
                $this->ConfPrice->update($priceID, 'UnitQty', $UnitQty);
                $this->ConfPrice->update($priceID, 'FS_WeightStart', $FS_WeightStart);
                $this->ConfPrice->update($priceID, 'FS_WeightEnd', $FS_WeightEnd);
                $this->ConfPrice->update($priceID, 'FS_ValStart', $FS_ValStart);
                $this->ConfPrice->update($priceID, 'FS_ValEnd', $FS_ValEnd);
                $this->ConfPrice->update($priceID, 'EX_WeightStart', $EX_WeightStart);
                $this->ConfPrice->update($priceID, 'EX_WeightEnd', $EX_WeightEnd);
                $this->ConfPrice->update($priceID, 'EX_ValStart', $EX_ValStart);
                $this->ConfPrice->update($priceID, 'EX_ValEnd', $EX_ValEnd);
                $this->ConfPrice->update($priceID, 'EX_DimL', $EX_DimL);
                $this->ConfPrice->update($priceID, 'EX_DimW', $EX_DimW);
                $this->ConfPrice->update($priceID, 'EX_DimH', $EX_DimH);

            } else {
                $priceID = $this->Price->setConfPrice_full(
                    $price,
                    $taxID,
                    $weight,
                    $UnitQty,
                    $FS_WeightStart,
                    $FS_WeightEnd,
                    $FS_ValStart,
                    $FS_ValEnd,
                    $EX_WeightStart,
                    $EX_WeightEnd,
                    $EX_ValStart,
                    $EX_ValEnd,
                    $EX_DimL,
                    $EX_DimW,
                    $EX_DimH
                );
                $this->Delivery->update($deliveryID, 'priceID', $priceID);
            }
        }

        $courierID = $this->Data->getPost('courierID');
        if ($courierID) {
            $res = $this->Delivery->update($deliveryID, 'courierID', $courierID);
        }

        $names = $this->Data->getPost('names');

        if (!empty($names)) {
            foreach ($names as $lang => $name) {
                $nameID = $this->Delivery->existName($deliveryID, $lang);
                if ($nameID > 0) {
                    $this->Delivery->updateName($nameID, 'name', $name);
                    unset($nameID);
                } else {
                    $paramNames['name'] = $name;
                    $paramNames['lang'] = $lang;
                    $paramNames['deliveryID'] = $deliveryID;
                    $this->Delivery->createName($paramNames);
                    unset($paramNames);
                }
            }
        }
        if (!$res) {
            $data = $this->sendFailResponse('03', 'Problem z zapisem');
            return $data;
        }
        $data['response'] = $res;
        $data['savedModuleValues'] = $savedModuleValues;
        return $data;

    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_deliveries($ID)
    {
        $data['response'] = false;
        if ($ID) {
            if ($this->Delivery->delete('ID', $ID)) {
                if ($this->DeliveryName->delete('deliveryID', $ID)) {
                    $data['response'] = true;
                }
                return $data;
            } else {
                return $data;
            }
        } else {
            $data = $this->sendFailResponse('04');
            return $data;
        }
    }

    /**
     * @param $params
     * @return array|bool
     */
    public function findParcelsPublic($params)
    {
        $courierID = $params['courierID'];
        $deliveryID = $params['deliveryID'];
        $addressID = $params['addressID'];

        $courierModules = $this->DeliveryAssistant->getCourierModules();

        $courier = $this->DeliveryAssistant->searchCourierByID($courierModules, $courierID);

        if( $courier['key'] !== 'dpd-russia' ) {
            return $this->sendFailResponse('11');
        }

        $courierSettings = $this->DeliveryAssistant->getModuleValues($courierID, $deliveryID);

        $address = $this->Address->get('ID', $addressID);

        try {

            $this->DpdRussiaDelivery->setAuthData(
                $courierSettings['client-number'],
                $courierSettings['client-key']
            );
            $this->DpdRussiaDelivery->setServerAddress(
                intval($courierSettings['sandbox'])
            );

            $cityEntity = $this->DpdRussiaDelivery->findCity($address['city']);
            $parcelShops = $this->DpdRussiaDelivery->findParcelShops($address, $cityEntity);

            return $parcelShops;

        } catch (Exception $exception) {
            return array(
                'response' => false,
                'info' => $exception->getMessage()
            );
        }
    }

    /**
    public function parcelCron()
    {
        $deliveries = $this->Delivery->getAll();
        $courierModules = $this->DeliveryAssistant->getCourierModules();

        $courierSettings = NULL;
        foreach ($deliveries as $delivery) {
            $courier = $this->DeliveryAssistant->searchCourierByID($courierModules, $delivery['courierID']);
            if( $courier['key'] == 'dpd-russia' ) {
                $courierSettings = $this->DeliveryAssistant->getModuleValues($delivery['courierID'], $delivery['ID']);
                continue;
            }
        }

        try {

            $this->DpdRussiaDelivery->setAuthData(
                $courierSettings['client-number'],
                $courierSettings['client-key']
            );
            $this->DpdRussiaDelivery->setServerAddress(
                intval($courierSettings['sandbox'])
            );

            $address['countryCode'] = 'RU';

            $parcelShops = $this->DpdRussiaDelivery->findParcelShops($address);

            return $parcelShops;

        } catch (Exception $exception) {
            return array(
                'response' => false,
                'info' => $exception->getMessage()
            );
        }
    }
    **/

}
