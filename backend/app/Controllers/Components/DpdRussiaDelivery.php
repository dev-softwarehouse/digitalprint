<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 11-12-2018
 * Time: 14:31
 */

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;
use SoapFault;
use SoapClient;
use Exception;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\Delivery\DeliveryParcelShop;

/**
 * Class DpdRussiaDelivery
 * @package DreamSoft\Controllers\Components
 */
class DpdRussiaDelivery extends Component
{

    /**
     * @var string
     */
    private $clientNumber;
    /**
     * @var string
     */
    private $clientKey;

    private $limits = array(
        'maxShipmentWeight' => 30.5,
        'maxWeight' => 5.5,
        'maxLength' => 70,
        'maxWidth' => 70,
        'maxHeight' => 50,
        'dimensionSum' => 200
    );

    /**
     * @var array
     */
    private $servers = array(
        'MAIN' => 'http://ws.dpd.ru/services/',
        'TEST' => 'http://wstest.dpd.ru/services/'
    );

    /**
     * @var string
     */
    private $server;
    /**
     * @var Setting
     */
    private $Setting;
    /**
     * @var DeliveryParcelShop
     */
    private $DeliveryParcelShop;

    /**
     * DpdRussiaDelivery constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->server = $this->servers['MAIN'];
        $this->Setting = Setting::getInstance();
        $this->DeliveryParcelShop = DeliveryParcelShop::getInstance();
    }

    /**
     * @param $sandbox
     */
    public function setServerAddress($sandbox)
    {
        if( $sandbox == 1 ) {
            $this->server = $this->servers['TEST'];
        } else {
            $this->server = $this->servers['MAIN'];
        }
    }

    /**
     * @param $clientNumber
     * @param $clientKey
     */
    public function setAuthData($clientNumber, $clientKey)
    {
        $this->setClientNumber($clientNumber);
        $this->setClientKey($clientKey);
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->Setting->setDomainID($domainID);
    }

    /**
     * @return string
     */
    public function getClientNumber()
    {
        return $this->clientNumber;
    }

    /**
     * @param string $clientNumber
     */
    public function setClientNumber($clientNumber)
    {
        $this->clientNumber = $clientNumber;
    }

    /**
     * @return string
     */
    public function getClientKey()
    {
        return $this->clientKey;
    }

    /**
     * @param string $clientKey
     */
    public function setClientKey($clientKey)
    {
        $this->clientKey = $clientKey;
    }

    /**
     * @return string
     */
    public function getServer()
    {
        return $this->server;
    }

    /**
     * @param string $server
     */
    public function setServer($server)
    {
        $this->server = $server;
    }

    /**
     * @param $key
     * @return int|float
     */
    public function getLimitValue($key)
    {
        return $this->limits[$key];
    }

    /**
     * @param $obj
     * @return array|bool
     */
    private function citiesToArray($obj)
    {
        if( !is_object($obj) ) {
            return false;
        }

        $root = get_object_vars($obj);
        $result = array();
        if( is_array($root) && array_key_exists('return', $root) ) {
            foreach ($root['return'] as $row) {
                $result[] = get_object_vars($row);
            }
        }

        return $result;
    }

    public function getSenderData()
    {
        $this->Setting->setModule('senderData');
        $senderData = $this->Setting->getAllByModule();

        return $senderData;
    }

    /**
     * @param $cityName
     * @return bool|array
     * @throws Exception
     */
    public function findCity($cityName)
    {

        try {

            $client = new SoapClient ($this->getServer() . 'geography2?wsdl');

            $authorizationData['auth'] = array(
                'clientNumber' => $this->getClientNumber(),
                'clientKey' => $this->getClientKey()
            );
            $authorizationRequest['request'] = $authorizationData;
            $cities = $client->getCitiesCashPay($authorizationRequest);

            if( !$cities ) {
                throw new Exception('No cities from soap');
            }

            $cities = $this->citiesToArray($cities);

            foreach ($cities as $city) {
                if( $cityName == $city['cityName'] ) {
                    return $city;
                }
            }

            return false;

        } catch ( SoapFault $fault ) {
            throw new Exception($fault->getMessage());
        }

    }

    /**
     * @param $parcelShopObjects
     * @return array
     */
    private function getParcelShopsFromObjects($parcelShopObjects)
    {
        $parcelShopObjects = get_object_vars($parcelShopObjects);
        $parcelShopObjects = get_object_vars($parcelShopObjects['return']);

        if( !is_array($parcelShopObjects['parcelShop']) ) {
            return array();
        }
        $result = array();
        foreach ($parcelShopObjects['parcelShop'] as $oneObject) {
            $oneParcelShop = get_object_vars($oneObject);
            if( $oneParcelShop['state'] == 'Open' ) {
                $tempResult['code'] = $oneParcelShop['code'];
                $tempResult['address'] = get_object_vars($oneParcelShop['address']);
                $tempResult['limits'] = get_object_vars($oneParcelShop['limits']);
                $tempResult['label'] = $tempResult['code'] . ' - ' . $tempResult['address']['cityName'] . ', ' .
                    $tempResult['address']['streetAbbr']  . ' ' . $tempResult['address']['street'] . ' ' .
                    $tempResult['address']['houseNo'];

                $saveParams = array();
                $saveParams['terminalCode'] = $oneParcelShop['code'];
                $saveParams['regionName'] = $tempResult['address']['regionName'];
                $saveParams['cityName'] = $tempResult['address']['cityName'];
                $saveParams['street'] = $tempResult['address']['street'];
                $saveParams['streetAbbr'] = $tempResult['address']['streetAbbr'];
                $saveParams['houseNo'] = $tempResult['address']['houseNo'];
                $savedInfo = $this->saveParcel($saveParams);

                $result[] = $tempResult;
            }

        }

        return $result;
    }

    /**
     * @param $params
     * @return array
     */
    private function saveParcel($params)
    {

        $parcelShop = $this->DeliveryParcelShop->get('terminalCode', $params['terminalCode']);

        $checkString = $params['regionName'] . $params['cityName'] . $params['street'] . $params['streetAbbr'] . $params['houseNo'];
        $params['checksum'] =  sha1($checkString);

        $updated = $lastID = 0;
        $saved = false;

        if( $parcelShop ) {


            if( $parcelShop['checksum'] != $params['checksum'] ) {
                $updated += intval($this->DeliveryParcelShop->update($parcelShop['ID'], 'regionName', $params['regionName']));
                $this->DeliveryParcelShop->update($parcelShop['ID'], 'cityName', $params['cityName']);
                $this->DeliveryParcelShop->update($parcelShop['ID'], 'street', $params['street']);
                $this->DeliveryParcelShop->update($parcelShop['ID'], 'streetAbbr', $params['streetAbbr']);
                $this->DeliveryParcelShop->update($parcelShop['ID'], 'houseNo', $params['houseNo']);
                $this->DeliveryParcelShop->update($parcelShop['ID'], 'checksum', $params['checksum']);
                $this->DeliveryParcelShop->update($parcelShop['ID'], 'modified', date(DATE_FORMAT));
            }

        } else {

            $params['created'] = $params['modified'] = date(DATE_FORMAT);

            $lastID = $this->DeliveryParcelShop->create($params);
            if( $lastID > 0 ) {
                $saved = true;
            }

        }

        return compact(
            'saved',
            'updated',
            'lastID'
        );
    }

    /**
     * @param $address
     * @param null $cityEntity
     * @return bool
     * @throws Exception
     */
    public function findParcelShops( $address, $cityEntity = NULL )
    {
        ini_set('max_execution_time', 600);

        try {

            $client = new SoapClient ($this->getServer() . 'geography2?wsdl');

            $parcelData['auth'] = array(
                'clientNumber' => $this->getClientNumber(),
                'clientKey' => $this->getClientKey()
            );
            $parcelData['countryCode'] = $address['countryCode'];
            if( $cityEntity ) {
                $parcelData['cityCode'] = $cityEntity['cityCode'];
                $parcelData['cityName'] = $cityEntity['cityName'];
            }

            $parcelRequest['request'] = $parcelData;
            $parcelShops = $client->getParcelShops($parcelRequest);

            $parcelShops = $this->getParcelShopsFromObjects($parcelShops);

            return $parcelShops;

        } catch ( SoapFault $fault ) {
            throw new Exception($fault->getMessage());
        }
    }

    /**
     * @param $countryCode
     * @return bool
     */
    private function findCountryName($countryCode)
    {
        $countries = json_decode(json_decode(COUNTRIES, true), true);

        foreach($countries as $country) {
            if( $country['code'] == strtoupper($countryCode) ) {
                if( array_key_exists('name_' . strtolower($countryCode), $country) ) {
                    return $country['name_' . strtolower($countryCode)];
                }
            }

        }
        return false;
    }

    /**
     * @param $orderAddress
     * @param $senderData
     * @param $cityEntity
     * @return array
     * @throws Exception
     */
    public function createOrder( $orderAddress, $senderData, $cityEntity )
    {
        try {

            $city = $cityEntity['cityName'];
            $region = $cityEntity['regionName'];

            $courierSettings = $orderAddress['courier']['settings'];

            $serviceVariant = $courierSettings['service-variant'];

            $client = new SoapClient ($this->getServer() . 'order2?wsdl');
            $orderData = array();

            $orderData['auth'] = array(
                'clientNumber' => $this->getClientNumber(),
                'clientKey' => $this->getClientKey()
            );

            $countryName = $this->findCountryName($senderData['country']['value']);
            if( !$countryName ) {
                $countryName = $senderData['country']['value'];
            }


            $datePickup = date('Y-m-d');

            $datePickup = $this->checkPickupDate($datePickup);

            $orderData['header'] = array(
                'datePickup' => $datePickup,
                'senderAddress' => array(
                    'name' => $senderData['companyName']['value'],
                    'countryName' => $countryName,
                    'region' => $senderData['province']['value'],
                    'city' => $senderData['city']['value'],
                    'street' => $senderData['street']['value'],
                    'house' => $senderData['houseNumber']['value'],
                    'contactFio' => $senderData['contactPerson']['value'],
                    'contactPhone' => $senderData['phone']['value'],
                    'index' => $senderData['postalCode']['value']
                )
            );

            if( $serviceVariant == 'ТД' || $serviceVariant == 'ТТ' ) {
                $orderData['header']['senderAddress']['terminalCode'] = $courierSettings['posting-terminal'];
            }

            if( intval($courierSettings['pickup-from']) > 0 && intval($courierSettings['pickup-from']) <= 24 &&
                intval($courierSettings['pickup-to']) > 0 && intval($courierSettings['pickup-to']) <= 24 &&
                intval($courierSettings['pickup-from']) < intval($courierSettings['pickup-to']) ) {
                $orderData['header']['pickupTimePeriod'] = $courierSettings['pickup-from'] . '-' . intval($courierSettings['pickup-to']);
            } else {
                $orderData['header']['pickupTimePeriod'] = '9-18';
            }

            $calc = $orderAddress['calculation'];

            $inputWeight = floatval( str_replace(',', '.', $orderAddress['input']['weight']));

            if (isset($orderAddress['input']['joinedWeight']) && $orderAddress['input']['joinedWeight'] > 0) {
                $overallWeight = $orderAddress['input']['joinedWeight'];
            } else if( $calc['weight'] > 0 ) {
                $overallWeight = $calc['weight'];
            } else if( $inputWeight > 0 ) {
                $overallWeight = $inputWeight;
            } else {
                throw new Exception('Weight not set!');
            }

            if( $overallWeight > $this->getLimitValue('maxShipmentWeight') ) {
                throw new Exception('package_weight_exceeded');
            }

            $division = 1;
            if ($calc['volume'] > $orderAddress['volume']) {
                $division = $orderAddress['volume'] / $calc['volume'];
            }

            $overallWeight *= $division;

            if (strlen($orderAddress['address']['companyName']) > 0) {
                $mainName = $orderAddress['address']['companyName'];
            } else {
                $mainName = $orderAddress['address']['name'] . ' ' . $orderAddress['address']['lastname'];
            }

            $cargoNumPack = ceil($overallWeight / $this->getLimitValue('maxWeight'));

            $serviceCode = 'ECN';

            if( $courierSettings['service'] ) {
                $serviceCode = $courierSettings['service'];
            }

            $receiverCountryName = $this->findCountryName($orderAddress['address']['countryCode']);
            if( !$countryName ) {
                $receiverCountryName = $orderAddress['address']['countryCode'];
            }

            $orderData['order'] = array(
                'orderNumberInternal' => $orderAddress['orderID'] . '-' . $orderAddress['ID'],
                'serviceCode' => $serviceCode,
                'serviceVariant' => $serviceVariant,
                'cargoNumPack' => $cargoNumPack,
                'cargoWeight' => $overallWeight,
                'cargoVolume' => $orderAddress['volume'],
                'cargoCategory' => $orderAddress['product']['type']['name'],
                'receiverAddress' => array(
                    'name' => $mainName,
                    'countryName' => $receiverCountryName,
                    'city' => $city,
                    'region' => $region,
                    'street' => $orderAddress['address']['street'],
                    'house' => $orderAddress['address']['house'],
                    'contactFio' => $orderAddress['address']['name'] . ' ' . $orderAddress['address']['lastname'],
                    'contactPhone' => $orderAddress['address']['telephone'],
                    'index' => $orderAddress['address']['zipcode']
                ),
                'cargoRegistered' => false
            );
            if( $orderAddress['address']['apartment'] ){
                $orderData['order']['receiverAddress']['flat'] = $orderAddress['address']['apartment'];
            }

            $terminal = $orderAddress['userDeliveryPrice']['parcelShopID'];

            if ($serviceVariant == 'ТТ' || $serviceVariant == 'ДТ'){
                $orderData['order']['receiverAddress']['terminalCode'] = $terminal;
            }
            $orderData['order']['extraService'][0] = array(
                'esCode' => 'EML',
                'param' => array(
                    'name' => 'email',
                    'value' => $orderAddress['user']['login']
                )
            );

            $orderRequest['orders'] = $orderData;

            $resultObject = $client->createOrder($orderRequest);

            $resultArray = (array) $resultObject;
            unset($resultObject);
            $objectStatus = $resultArray['return'];
            unset($resultArray);
            $statusArray = (array) $objectStatus;
            unset($objectStatus);

            if( $statusArray['status'] == 'OK' ) {
                return $statusArray;
            }

            return array(
                'status' => 'NOT_OK',
                'info' => $statusArray['errorMessage']
            );

        } catch (SoapFault $fault) {
            $this->debug($fault->getMessage());
            throw new Exception($fault->getMessage());
        }
    }

    /**
     * @param $datePickup
     * @return false|string
     */
    private function checkPickupDate($datePickup)
    {
        $actualHour = date('H', strtotime($datePickup));

        $publicHolidays = array(
            '2019-01-01',
            '2019-01-02',
            '2019-01-03',
            '2019-01-04',
            '2019-01-05',
            '2019-01-07',
            '2019-01-08',
            '2019-02-23',
            '2019-03-08',
            '2019-05-01',
            '2019-05-09',
            '2019-06-12',
            '2019-11-04',
            '2019-11-24',
        );

        $dayOfWeek = date('N', strtotime($datePickup));

        if( $dayOfWeek == '7' || in_array($datePickup, $publicHolidays) || $actualHour >= DPD_END_PICKUP_HOUR ) {
            $datePickup = date('Y-m-d', strtotime($datePickup.' +1 days'));
            return $this->checkPickupDate($datePickup);
        } else {
            return $datePickup;
        }
    }

    /**
     * @param $orderNumber
     * @return string
     * @throws Exception
     */
    public function createLabel($orderNumber)
    {
        try {
            $client = new SoapClient ($this->getServer() . 'label-print?wsdl');
            $printLabelData = array();

            $printLabelData['auth'] = array(
                'clientNumber' => $this->getClientNumber(),
                'clientKey' => $this->getClientKey()
            );
            $printLabelData['fileFormat'] = 'PDF';
            $printLabelData['pageSize'] = 'A5';

            $printLabelData['order'][] = array(
                'orderNum' => $orderNumber,
                'parcelsNumber' => 2
            );

            $printLabelRequest['getLabelFile'] = $printLabelData;
            $resultObject = $client->createLabelFile($printLabelRequest);

            $resultArray = (array) $resultObject;
            unset($resultObject);
            $objectFile = $resultArray['return'];
            unset($resultArray);
            $fileArray = (array) $objectFile;
            unset($objectFile);
            $file = $fileArray['file'];
            unset($fileArray);

            return $file;

        } catch (SoapFault $fault) {
            throw new Exception($fault->getMessage());
        }
    }

    /**
     * @param $pdfContent
     * @param $dir
     * @param $file
     * @return bool
     */
    public function printLabel($pdfContent, $dir, $file) {

        try {

            if( !is_dir($dir) ) {
                mkdir( $dir, 0755, true );
            }

            $output = $dir . $file;

            if( !($ifp = fopen( $output, 'a' )) ) {
                throw new Exception('The file could not be created');
            }

            fwrite( $ifp, $pdfContent);

            fclose( $ifp );

            return $output;

        } catch (Exception $e) {
            $this->debug('printLabel ERROR: ' . $e->getMessage());
            return false;
        }

    }
}