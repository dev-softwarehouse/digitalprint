<?php
/**
 * Programista Rafał Leśniak - 20.7.2017
 */

use DreamSoft\Controllers\Components\DpdDelivery;
use DreamSoft\Controllers\Components\Price;
use DreamSoft\Controllers\Components\UpsDelivery;
use DreamSoft\Libs\DHLClient\Label;
use DreamSoft\Libs\DHLClient\Piece;
use DreamSoft\Libs\DHLClient\Shipment;
use DreamSoft\Libs\DHLClient\Shipper;
use DreamSoft\Libs\DHLClient\Credentials;
use DreamSoft\Libs\DHLClient\Receiver;
use DreamSoft\Libs\DHLClient\Payment;
use DreamSoft\Libs\DHLClient\Service;
use DreamSoft\Models\Address\Address;
use DreamSoft\Models\Delivery\Delivery;
use DreamSoft\Models\Module\Module;
use DreamSoft\Models\Module\ModuleKey;
use DreamSoft\Models\Module\ModuleValue;
use DreamSoft\Models\Order\DpOrderAddress;
use DreamSoft\Models\Price\ConfPrice;
use DreamSoft\Models\PrintShopUser\UserCalc;
use DreamSoft\Models\PrintShopUser\UserDeliveryPrice;
use DreamSoft\Models\RealizationTime\Holiday;
use DreamSoft\Models\Shipment\UpsShipment;
use DreamSoft\Models\Shipment\DpdShipment;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Controllers\Components\DpdRussiaDelivery;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\Order\DpOrder;
use DreamSoft\Models\Order\DpProduct;
use DreamSoft\Models\Price\BasePrice;
use DreamSoft\Models\User\User;
use DreamSoft\Core\Controller;

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 20-07-2017
 * Time: 12:35
 */
class ShipmentController extends Controller
{
    /**
     * @var DpOrder
     */
    protected $DpOrder;
    /**
     * @var DpOrderAddress
     */
    protected $DpOrderAddress;
    /**
     * @var Address
     */
    protected $Address;
    /**
     * @var Delivery
     */
    protected $Delivery;
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
     * @var Setting
     */
    protected $Setting;
    /**
     * @var User
     */
    protected $User;
    /**
     * @var UserCalc
     */
    protected $UserCalc;
    /**
     * @var ConfPrice
     */
    protected $ConfPrice;
    /**
     * @var DpProduct
     */
    protected $DpProduct;
    /**
     * @var Price
     */
    protected $Price;
    /**
     * @var BasePrice
     */
    protected $BasePrice;
    /**
     * @var UserDeliveryPrice
     */
    protected $UserDeliveryPrice;
    /**
     * @var Holiday
     */
    protected $Holiday;
    /**
     * @var DpdDelivery
     */
    protected $DpdDelivery;
    /**
     * @var dpdShipment
     */
    protected $DpdShipment;
    /**
     * @var UpsDelivery
     */
    protected $UpsDelivery;
    /**
     * @var UpsShipment
     */
    protected $UpsShipment;
    /**
     * @var DpdRussiaDelivery
     */
    private $DpdRussiaDelivery;

    /**
     * @var array
     */
    private $orderUser = array();
    /**
     * @var array
     */
    private $order = array();
    /**
     * @var PrintShopType
     */
    private $PrintShopType;

    /**
     * @var array
     */
    public $useModels = array();

    /**
     * ShipmentController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Price = Price::getInstance();
        $this->DpOrder = DpOrder::getInstance();
        $this->DpOrderAddress = DpOrderAddress::getInstance();
        $this->Address = Address::getInstance();
        $this->Delivery = Delivery::getInstance();
        $this->Module = Module::getInstance();
        $this->ModuleKey = ModuleKey::getInstance();
        $this->ModuleValue = ModuleValue::getInstance();
        $this->Setting = Setting::getInstance();
        $this->User = User::getInstance();
        $this->ConfPrice = ConfPrice::getInstance();
        $this->DpProduct = DpProduct::getInstance();
        $this->UserCalc = UserCalc::getInstance();
        $this->BasePrice = BasePrice::getInstance();
        $this->UserDeliveryPrice = UserDeliveryPrice::getInstance();
        $this->Holiday = Holiday::getInstance();
        $this->UpsDelivery = UpsDelivery::getInstance();
        $this->DpdDelivery = DpdDelivery::getInstance();
        $this->UpsShipment = UpsShipment::getInstance();
        $this->DpdShipment = DpdShipment::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->DpdRussiaDelivery = DpdRussiaDelivery::getInstance();
    }

    public function setDomainID($domainID)
    {
        $this->Delivery->setDomainID($domainID);
        $this->ModuleValue->setDomainID($domainID);
        $this->Setting->setDomainID($domainID);
        $this->DpdRussiaDelivery->setDomainID($domainID);
        $this->UpsDelivery->setDomainID($domainID);
    }

    /**
     * @return array
     */
    public function getOrderUser()
    {
        return $this->orderUser;
    }

    /**
     * @param array $orderUser
     */
    public function setOrderUser($orderUser)
    {
        $this->orderUser = $orderUser;
    }

    /**
     * @return array
     */
    public function getOrder()
    {
        return $this->order;
    }

    /**
     * @param array $order
     */
    public function setOrder($order)
    {
        $this->order = $order;
    }

    /**
     * @param $orderID
     * @return array|bool
     */
    public function index($orderID)
    {
        $post = $this->Data->getAllPost();

        $params = array();
        $params['width'] = $post['width'];
        $params['height'] = $post['height'];
        $params['length'] = $post['length'];

        $order = $this->DpOrder->get('ID', $orderID);
        if (!$order) {
            return $this->sendFailResponse('06');
        }
        $this->setOrder($order);
        $user = $this->User->get('ID', $order['userID']);
        $this->setOrderUser($user);
        $orderAddresses = $this->DpOrderAddress->getByOrder($orderID);

        if (empty($orderAddresses)) {
            return $this->sendFailResponse('01');
        }

        try {
            $orderAddresses = $this->fillAddresses($orderAddresses);
            $orderAddresses = $this->fillDelivery($orderAddresses);
            $orderAddresses = $this->fillModules($orderAddresses);
            $orderAddresses = $this->fillProduct($orderAddresses);
            $orderAddresses = $this->fillCalc($orderAddresses);
            $orderAddresses = $this->fillBasePrice($orderAddresses);
            $orderAddresses = $this->fillConfPrice($orderAddresses);
            $orderAddresses = $this->getJoinedDeliveries($orderAddresses);
            $orderAddresses = $this->fillShipmentLabel($orderAddresses);
            return $orderAddresses;

        } catch (Exception $e) {
            return $this->sendFailResponse('07', $e->getMessage());
        }


    }

    /**
     * @return array
     * @throws Exception
     */
    public function patch_generateLabels()
    {
        $post = $this->Data->getAllPost();

        $packages = $post['packages'];
        $orderID = $post['orderID'];

        ini_set('max_execution_time', 600);

        $order = $this->DpOrder->get('ID', $orderID);
        if (!$order) {
            return $this->sendFailResponse('06');
        }
        $this->setOrder($order);
        $user = $this->User->get('ID', $order['userID']);
        $this->setOrderUser($user);
        $orderAddresses = $this->DpOrderAddress->getByOrder($orderID);
        $orderAddresses = $this->selectOrderAddress($orderAddresses, $packages);

        $allResults = array();

        try {

            $orderAddresses = $this->fillAddresses($orderAddresses);
            $orderAddresses = $this->fillDelivery($orderAddresses);
            $orderAddresses = $this->fillModules($orderAddresses);
            $orderAddresses = $this->fillProduct($orderAddresses);
            $orderAddresses = $this->fillCalc($orderAddresses);
            $orderAddresses = $this->fillBasePrice($orderAddresses);
            $orderAddresses = $this->fillConfPrice($orderAddresses);
            $orderAddresses = $this->fillUserDefaultAddress($orderAddresses, $user);
            $orderAddresses = $this->fillUser($orderAddresses, $user);
            $orderAddresses = $this->fillUserDeliveryPrice($orderAddresses);
            $orderAddresses = $this->getPartedDeliveries($orderAddresses);

            $errors = array();
            foreach ($orderAddresses as $orderAddress) {
                $courierKey = $orderAddress['courier']['key'];
                switch ($courierKey) {
                    case 'dhl':
                        try {
                            $actualResult = $this->generateDhl($orderAddress);
                        } catch (Exception $e) {
                            $errors[] = $e->getMessage();
                            $actualResult = null;
                        }

                        $this->DpOrderAddress->update($orderAddress['ID'], 'shipmentID', $actualResult->shipmentId);
                        $allResults[] = $actualResult;
                        break;
                    case 'dpd':
                        try {
                            $actualResult = $this->generateDPD($orderAddress);

                            $maxShipmentID = false;
                            $dpdSaved = 0;

                            if (is_array($actualResult)) {
                                foreach ($actualResult as $dpdResult) {
                                    if (!$maxShipmentID) {
                                        $maxShipmentID = $this->DpdShipment->getMaxShipmentID() + 1;
                                    }
                                    if (isset($dpdResult['Fault'])) {
                                        $this->debug($dpdResult['Fault']);
                                        continue;
                                    }
                                    $params = array();
                                    $params['shipmentID'] = $maxShipmentID;
                                    $params['trackingNumber'] = $dpdResult['ShipmentResponse']['ShipmentResults']['PackageResults']['TrackingNumber'];
                                    $params['created'] = date('Y-m-d H:i:s');
                                    $lastID = $this->DpdShipment->create($params);
                                    if ($lastID > 0) {
                                        $dpdSaved++;
                                        $this->DpdDelivery->printLabel(
                                            $dpdResult['ShipmentResponse']['ShipmentResults']['PackageResults']['ShippingLabel']['GraphicImage'],
                                            MAIN_UPLOAD . companyID . '/' . DPD_LABELS_DIR . '/' . $params['trackingNumber'] . '_' . $maxShipmentID . '_' . $lastID . '.gif'
                                        );
                                        $dpdResult['labels'][] = STATIC_URL . companyID . '/' . DPD_LABELS_DIR . '/' . $params['trackingNumber'] . '_' . $maxShipmentID . '_' . $lastID . '.gif';
                                    }
                                };
                            }

                            if ($dpdSaved > 0) {
                                $this->DpOrderAddress->update($orderAddress['ID'], 'shipmentID', $maxShipmentID);
                            }

                        } catch (Exception $e) {
                            $errors[] = $e->getMessage();
                            $actualResult = null;
                        }

                        if (is_array($actualResult)) {
                            $allResults = array_merge($allResults, $actualResult);
                        }
                        break;
                    case 'dpd-russia':
                        try {

                            if( floatval($orderAddress['length']) > $this->DpdRussiaDelivery->getLimitValue('maxLength') ) {
                                throw new Exception('package_length_exceeded');
                            }

                            if( floatval($orderAddress['width']) > $this->DpdRussiaDelivery->getLimitValue('maxWidth') ) {
                                throw new Exception('package_width_exceeded');
                            }

                            if( floatval($orderAddress['height']) > $this->DpdRussiaDelivery->getLimitValue('maxHeight') ) {
                                throw new Exception('package_height_exceeded');
                            }

                            $allDimensions = floatval($orderAddress['length']) +
                                floatval($orderAddress['width']) +
                                floatval($orderAddress['height']);

                            if( $allDimensions > $this->DpdRussiaDelivery->getLimitValue('dimensionSum') ) {
                                throw new Exception('package_dimensions_exceeded');
                            }

                            $this->DpdRussiaDelivery->setServerAddress(
                                intval($orderAddress['courier']['settings']['sandbox'])
                            );

                            $this->DpdRussiaDelivery->setAuthData(
                                $orderAddress['courier']['settings']['client-number'],
                                $orderAddress['courier']['settings']['client-key']
                            );

                            $senderData = $this->DpdRussiaDelivery->getSenderData();

                            $selectedCity = $this->DpdRussiaDelivery->findCity($orderAddress['address']['city']);

                            $this->Setting = new Setting();

                            $createdOrder = $this->DpdRussiaDelivery->createOrder(
                                $orderAddress,
                                $senderData,
                                $selectedCity
                            );

                            if( $createdOrder['status'] == 'OK' ) {
                                $maxShipmentID = $this->DpdShipment->getMaxShipmentID() + 1;
                                $params = array();
                                $params['shipmentID'] = $maxShipmentID;
                                $params['trackingNumber'] = $createdOrder['orderNum'];
                                $params['created'] = date('Y-m-d H:i:s');
                                $lastID = $this->DpdShipment->create($params);
                                if ($lastID > 0) {
                                    $createdLabel = $this->DpdRussiaDelivery->createLabel($createdOrder['orderNum']);

                                    if( strlen($createdLabel) > 0 ) {
                                        $this->DpdRussiaDelivery->printLabel(
                                            $createdLabel,
                                            MAIN_UPLOAD . companyID . '/' . DPD_LABELS_DIR . '/',
                                            $createdOrder['orderNum'] . '_' . $maxShipmentID . '_' . $lastID . '.pdf'
                                        );
                                        $createdOrder['labels'][] = STATIC_URL . companyID . '/' . DPD_LABELS_DIR . '/' . $createdOrder['orderNum'] . '_' . $maxShipmentID . '_' . $lastID . '.pdf';
                                    }

                                    $this->DpOrderAddress->update($orderAddress['ID'], 'shipmentID', $maxShipmentID);
                                    $createdOrder['shipmentID'] = $maxShipmentID;
                                }

                                $actualResult = $createdOrder;
                            } else {
                                $errors[] = $createdOrder['info'];
                                $actualResult = null;
                            }

                        } catch( Exception $e ) {
                            $actualResult = null;
                            $errors[] = $e->getMessage();
                        }

                        if (is_array($actualResult)) {
                            $allResults = array_merge($allResults, $actualResult);
                        }

                        break;
                    case 'ups':
                        try {
                            $actualResult = $this->generateUps($orderAddress);

                            $maxShipmentID = false;
                            $upsSaved = 0;
                            if (is_array($actualResult)) {
                                foreach ($actualResult as $upsResult) {
                                    if (!$maxShipmentID) {
                                        $maxShipmentID = $this->UpsShipment->getMaxShipmentID() + 1;
                                    }
                                    if (isset($upsResult['Fault'])) {
                                        $this->debug($upsResult['Fault']);
                                        continue;
                                    }
                                    $params = array();
                                    $params['shipmentID'] = $maxShipmentID;
                                    $params['trackingNumber'] = $upsResult['ShipmentResponse']['ShipmentResults']['PackageResults']['TrackingNumber'];
                                    $params['created'] = date('Y-m-d H:i:s');
                                    $lastID = $this->UpsShipment->create($params);

                                    if ($lastID > 0) {
                                        $upsSaved++;
                                        $this->UpsDelivery->printLabel(
                                            $upsResult['ShipmentResponse']['ShipmentResults']['PackageResults']['ShippingLabel']['GraphicImage'],
                                            MAIN_UPLOAD . companyID . '/' . UPS_LABELS_DIR . '/' . $params['trackingNumber'] . '_' . $maxShipmentID . '_' . $lastID . '.gif'
                                        );
                                        $upsResult['labels'][] = STATIC_URL . companyID . '/' . UPS_LABELS_DIR . '/' . $params['trackingNumber'] . '_' . $maxShipmentID . '_' . $lastID . '.gif';
                                    }
                                };
                            }

                            if ($upsSaved > 0) {
                                $this->DpOrderAddress->update($orderAddress['ID'], 'shipmentID', $maxShipmentID);
                            }

                        } catch (Exception $e) {
                            $actualResult = null;
                            $errors[] = $e->getMessage();
                        }
                        if (is_array($actualResult)) {
                            $allResults = array_merge($allResults, $actualResult);
                        }
                        break;
                    default:
                        break;
                }
            }

            $response = false;
            if( empty($errors) ) {
                $response = true;
            }

            return array('results' => $allResults, 'errors' => $errors, 'response' => $response);

        } catch (Exception $e) {
            return $this->sendFailResponse('07', $e->getMessage());
        }
    }

    public function patch_printLabel()
    {
        $post = $this->Data->getAllPost();
        $shipmentID = $post['shipmentID'];
        $orderAddressID = $post['orderAddressID'];

        $orderAddress = $this->DpOrderAddress->get('ID', $orderAddressID);

        $orderAddresses = array(0 => $orderAddress);

        $orderAddresses = $this->fillDelivery($orderAddresses);
        $orderAddresses = $this->fillModules($orderAddresses);

        $orderAddress = reset($orderAddresses);

        $courierKey = $orderAddress['courier']['key'];
        $result = array();
        switch ($courierKey) {
            case 'dhl':
                $result = $this->printDhlLabel($orderAddress, $shipmentID);
                break;
            case 'ups':
                $result = $this->printUpsLabel($orderAddress, $shipmentID);
                break;
        }

        return $result;

    }

    public function delete_labels($orderAddressID)
    {
        $post = $this->Data->getAllPost();

        $orderAddress = $this->DpOrderAddress->get('ID', $orderAddressID);
        $orderAddresses = array(0 => $orderAddress);

        $orderAddresses = $this->fillDelivery($orderAddresses);
        $orderAddresses = $this->fillModules($orderAddresses);

        $orderAddress = reset($orderAddresses);

        $courierKey = $orderAddress['courier']['key'];

        $result = array();
        switch ($courierKey) {
            case 'ups':
                $shipment = $this->UpsShipment->get('shipmentID', $orderAddress['shipmentID']);
                $result = $this->UpsDelivery->cancelShipment($orderAddress, $shipment);
                // @TODO remove upsShipment entity
                // @TODO remove shipmentID from orderAddress entity
                break;
            default:
                $result['response'] = false;
                $result['info'] = 'courier_not_allow_cancel_shipment';
                break;
        }

        return $result;

    }

    /**
     * @param $orderAddress
     * @param $shipmentID
     * @return array
     */
    private function printDhlLabel($orderAddress, $shipmentID)
    {
        try {
            $credentials = new Credentials(true);
            $credentials->setUser($orderAddress['courier']['settings']['api_login']);
            $credentials->setPassword($orderAddress['courier']['settings']['api_password']);

            $Label = new Label(true);
            $Label->setAuthData($credentials);
            $result = $Label->getLabel($shipmentID);

            $dir = MAIN_UPLOAD . companyID . '/' . 'dhl_labels/';
            $fileUrl = STATIC_URL . companyID . '/dhl_labels/' . 'label_' . $result->shipmentId . '.pdf';
            $filePath = $dir . 'label_' . $result->shipmentId . '.pdf';

            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
                chmod($dir, 0777);
            }

            if (is_file($filePath)) {
                return array('response' => true, 'file' => $fileUrl, 'exist' => true);
            }

            $data = base64_decode($result->labelData);
            if (file_put_contents($filePath, $data)) {
                return array('response' => true, 'file' => $fileUrl, 'provider' => 'dhl');
            } else {
                return array('response' => false, 'info' => 'file not saved! Check dir on server.');
            }

        } catch (Exception $e) {
            return array('response' => false, 'info' => $e->getMessage());
        }
    }

    private function printUpsLabel($orderAddress, $shipmentID)
    {
        $packages = $this->UpsShipment->get('shipmentID', $shipmentID, true);

        if (!$packages) {
            return array('response' => false, 'info' => 'No packages!');
        }

        $results = array();
        foreach ($packages as $package) {
            $results['labels'][] = STATIC_URL . companyID . '/' . UPS_LABELS_DIR . '/' . $package['trackingNumber'] . '_' . $package['shipmentID'] . '_' . $package['ID'] . '.gif';
        }

        if (!empty($results['labels'])) {
            $results['response'] = true;
            $results['provider'] = 'ups';
            return $results;
        }

        return array('response' => false, 'info' => 'error!');
    }

    /**
     * @param array $orderAddresses
     * @param $packages
     * @return array
     * @throws Exception
     */
    private function selectOrderAddress(array $orderAddresses, $packages)
    {
        if (empty($orderAddresses)) {
            throw new Exception('problem_with_order_addresses');
        }

        $aggregatePackages = array();
        foreach ($packages as $package) {
            $aggregatePackages[$package['ID']] = $package;
        }

        $cutOrderAddress = array();
        foreach ($orderAddresses as $orderAddress) {
            if (array_key_exists($orderAddress['ID'], $aggregatePackages)) {
                $orderAddress['input'] = $aggregatePackages[$orderAddress['ID']];
                $cutOrderAddress[] = $orderAddress;
            }
        }
        return $cutOrderAddress;
    }

    /**
     * @param array $orderAddresses
     * @return array
     * @throws Exception
     */
    private function fillAddresses(array $orderAddresses)
    {
        if (empty($orderAddresses)) {
            throw new Exception('problem_with_order_addresses');
        }
        $aggregateAddresses = array();
        foreach ($orderAddresses as $orderAddress) {
            $aggregateAddresses[] = $orderAddress['addressID'];
        }
        $addresses = $this->Address->getByList($aggregateAddresses);
        foreach ($orderAddresses as $key => $orderAddress) {
            $orderAddresses[$key]['address'] = $addresses[$orderAddress['addressID']];
        }
        return $orderAddresses;
    }

    /**
     * @param array $orderAddresses
     * @return array
     * @throws Exception
     */
    private function fillDelivery(array $orderAddresses)
    {
        if (empty($orderAddresses)) {
            throw new Exception('problem_with_order_addresses');
        }
        $aggregateDeliveries = array();
        foreach ($orderAddresses as $orderAddress) {
            $aggregateDeliveries[] = $orderAddress['deliveryID'];
        }
        $deliveries = $this->Delivery->customGetByList($aggregateDeliveries);
        foreach ($orderAddresses as $key => $orderAddress) {
            $orderAddresses[$key]['delivery'] = $deliveries[$orderAddress['deliveryID']];
        }
        return $orderAddresses;
    }

    /**
     * @param array $orderAddresses
     * @return array
     * @throws Exception
     */
    private function fillModules(array $orderAddresses)
    {
        if (empty($orderAddresses)) {
            throw new Exception('problem_with_order_addresses');
        }

        $courierModules = $this->Module->getAll('couriers');

        foreach ($orderAddresses as $key => $orderAddress) {
            $orderAddresses[$key]['courier'] = $this->searchCourierByID($courierModules, $orderAddress['delivery']['courierID']);
            $orderAddresses[$key]['courier']['settings'] = $this->getModuleValues($orderAddress['delivery']['courierID'], $orderAddress['delivery']['ID']);
        }

        return $orderAddresses;
    }

    /**
     * @param array $orderAddresses
     * @return array
     * @throws Exception
     */
    private function fillProduct(array $orderAddresses)
    {
        if (empty($orderAddresses)) {
            throw new Exception('problem_with_order_addresses');
        }

        $aggregateProducts = array();
        foreach ($orderAddresses as $orderAddress) {
            $aggregateProducts[] = $orderAddress['productID'];
        }

        $productsUnsorted = $this->DpProduct->getByList($aggregateProducts);

        $products = array();
        $aggregateTypes = array();
        foreach ($productsUnsorted as $each) {
            $products[$each['productID']] = $each;
            $aggregateTypes[] = $each['typeID'];
        }

        $typesUnsorted = $this->PrintShopType->getByList($aggregateTypes);

        $types = array();
        if ($typesUnsorted) {
            foreach ($typesUnsorted as $item) {
                $types[$item['ID']] = $item;
            }
        }

        foreach ($products as $key => $product) {
            if (isset($types[$product['typeID']])) {
                $products[$key]['type'] = $types[$product['typeID']];
            } else {
                $products[$key]['type'] = null;
            }
        }

        foreach ($orderAddresses as $key => $orderAddress) {
            $orderAddresses[$key]['product'] = $products[$orderAddress['productID']];
        }

        return $orderAddresses;
    }

    /**
     * @param array $orderAddresses
     * @return array
     */
    private function fillCalc(array $orderAddresses)
    {
        $aggregateCalculations = array();
        foreach ($orderAddresses as $orderAddress) {
            if (empty($orderAddress['product'])) {
                continue;
            }
            $aggregateCalculations[] = $orderAddress['product']['calcID'];
        }

        $calculations = $this->UserCalc->getByList($aggregateCalculations);

        foreach ($orderAddresses as $key => $orderAddress) {
            $orderAddresses[$key]['calculation'] = $calculations[$orderAddress['product']['calcID']];
        }

        return $orderAddresses;
    }

    /**
     * @param array $orderAddresses
     * @return array
     */
    private function fillBasePrice(array $orderAddresses)
    {
        $aggregatePrices = array();
        foreach ($orderAddresses as $orderAddress) {
            if (empty($orderAddress['calculation'])) {
                continue;
            }
            $aggregatePrices[] = $orderAddress['calculation']['priceID'];
        }

        $calculations = $this->BasePrice->getByList($aggregatePrices);

        foreach ($orderAddresses as $key => $orderAddress) {
            $newBasePrice = $calculations[$orderAddress['calculation']['priceID']];
            $newBasePrice['price'] = $this->Price->getPriceToView($newBasePrice['price']);
            $newBasePrice['grossPrice'] = $this->Price->getPriceToView($newBasePrice['grossPrice']);

            $orderAddresses[$key]['basePrice'] = $newBasePrice;
        }

        return $orderAddresses;
    }

    /**
     * @param array $orderAddresses
     * @return array
     */
    private function fillConfPrice(array $orderAddresses)
    {
        $aggregatePrices = array();
        foreach ($orderAddresses as $orderAddress) {
            if (empty($orderAddress['delivery'])) {
                continue;
            }
            $aggregatePrices[] = $orderAddress['delivery']['priceID'];
        }

        $calculations = $this->ConfPrice->getByList($aggregatePrices);

        foreach ($orderAddresses as $key => $orderAddress) {
            $newConfPrice = $calculations[$orderAddress['delivery']['priceID']];
            $newConfPrice['price'] = $this->Price->getPriceToView($newConfPrice['price']);

            $orderAddresses[$key]['delivery']['confPrice'] = $newConfPrice;
        }

        return $orderAddresses;
    }

    /**
     * @param array $orderAddresses
     * @param $user
     * @return array
     */
    private function fillUserDefaultAddress(array $orderAddresses, $user)
    {

        $defaultAddress = $this->Address->getDefault($user['ID'], 1);

        foreach ($orderAddresses as $key => $orderAddress) {
            if ($orderAddress['senderID'] == SENDER_CLIENT) {
                $orderAddresses[$key]['shipFromAddress'] = $defaultAddress;
            } else {
                $orderAddresses[$key]['shipFromAddress'] = NULL;
            }

        }

        return $orderAddresses;

    }

    /**
     * @param array $orderAddresses
     * @param $user
     * @return array
     */
    private function fillUser(array $orderAddresses, $user)
    {
        foreach ($orderAddresses as $key => $orderAddress) {
            $orderAddresses[$key]['user'] = $user;
        }

        return $orderAddresses;
    }

    /**
     * @param $courierModules
     * @param $courierID
     * @return bool
     */
    private function searchCourierByID($courierModules, $courierID)
    {
        foreach ($courierModules as $courierModule) {
            if ($courierModule['ID'] == $courierID) {
                return $courierModule;
            }
        }
        return false;
    }

    /**
     * @param $moduleID
     * @param $deliveryID
     * @return array|bool
     */
    private function getModuleValues($moduleID, $deliveryID)
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
     * @param array $orderAddress
     * @return null|SimpleXMLElement
     * @throws Exception
     */
    private function generateDhl(array $orderAddress)
    {
        $credentials = new Credentials(true);
        $credentials->setUser($orderAddress['courier']['settings']['api_login']);
        $credentials->setPassword($orderAddress['courier']['settings']['api_password']);

        $product = $orderAddress['product'];
        $calc = $orderAddress['calculation'];

        $price = $this->BasePrice->get('ID', $calc['priceID']);

        $blockOnCollect = false;
        if ($orderAddress['overallVolume'] > $orderAddress['volume']) {
            $blockOnCollect = true;
        }
        if (isset($orderAddress['input']['joinedWeight']) && $orderAddress['input']['joinedWeight'] > 0) {
            $overallWeight = $orderAddress['input']['joinedWeight'];
        } else {
            $overallWeight = $calc['weight'];
        }

        $division = 1;
        if ($calc['volume'] > $orderAddress['volume']) {
            $division = $orderAddress['volume'] / $calc['volume'];
        }

        $overallWeight *= $division;

        $confPriceEntity = $orderAddress['delivery']['confPrice'];

        $singlePackageWeight = $confPriceEntity['weight'];

        $shipper = $this->prepareShipper();
        $receiver = $this->prepareReceiver($orderAddress);

        $iterableWeight = $overallWeight;
        $packagesQuantity = 0;

        while ($iterableWeight > 0) {
            if ($iterableWeight > $singlePackageWeight) {
                $iterableWeight -= $singlePackageWeight;
                $packagesQuantity++;
            } else {
                $packagesQuantity++;
                $iterableWeight = 0;
            }
        }

        $piece = new Piece();
        $piece->setType($orderAddress['courier']['settings']['package_type']);
        $piece->setWidth($orderAddress['input']['width']);
        $piece->setHeight($orderAddress['input']['height']);
        $piece->setLength($orderAddress['input']['length']);

        if ($packagesQuantity === 1) {
            $piece->setWeight($overallWeight);
        } else {
            $piece->setWeight($orderAddress['delivery']['confPrice']['weight']);
        }

        $piece->setQuantity($packagesQuantity);
        $piece->setNonStandard(false);

        $payment = new Payment();

        $payment->setPayerType(DHL_PAYMENT_METHOD_SHIPPER);
        $payment->setPaymentMethod(DHL_PAYMENT_TYPE_BANK_TRANSFER);

        if ($credentials->isTestMode()) {
            $payment->setAccountNumber(DHL_SAP_TEST_MODE);
        } else {
            $payment->setAccountNumber($orderAddress['courier']['settings']['sap_number']);
        }

        $userPriceEntity = $this->UserDeliveryPrice->getByParams($product['calcID'], $product['ID'], $orderAddress['volume'], 1);
        $deliveryPriceEntity = $this->BasePrice->get('ID', $userPriceEntity['priceID']);

        $service = new Service();
        $service->setProduct($orderAddress['courier']['settings']['product_type']);
        if ($orderAddress['courier']['settings']['collect_on_delivery'] == 'receiver_payment' && !$blockOnCollect) {
            $service->setCollectOnDelivery(true);
            $service->setCollectOnDeliveryForm(DHL_PAYMENT_TYPE_BANK_TRANSFER);
            $productPrice = $price['price'];
            $deliveryPrice = $deliveryPriceEntity['price'];
            $sumPrice = $productPrice + $deliveryPrice;
            $service->setCollectOnDeliveryValue($this->Price->getPriceToView($sumPrice, '.'));
        } else {
            $service->setCollectOnDelivery(false);
        }

        $shipment = new Shipment(true);
        $shipment->setAuthData($credentials);
        $shipment->setShipper($shipper);
        $shipment->setReceiver($receiver);
        $shipment->setPiece($piece);
        $shipment->setPayment($payment);
        $shipment->setService($service);

        $date = $this->checkDate(date('Y-m-d H:i:s'));
        $date = date('Y-m-d', strtotime($date));
        $shipment->setShipmentDate($date);
        $shipment->setContent('productID: ' . $orderAddress['productID']);
        return $shipment->createShipment();
    }

    /**
     * @param $date
     * @return false|int
     */
    private function checkDate($date)
    {
        if ($this->isToLate($date)) {
            $date = date('Y-m-d H:i:s', strtotime($date . ' + 1 days'));
        }
        while ($this->isHoliday($date)) {
            $date = date('Y-m-d H:i:s', strtotime($date . ' + 1 days'));
        }
        return $date;
    }

    /**
     * @param $date
     * @return bool
     */
    private function isHoliday($date)
    {
        $holidays = $this->Holiday->getHolidays('nationalholiday');
        foreach ($holidays as $holiday) {
            if ($holiday['active'] == 0) {
                continue;
            }
            if ($holiday['day'] == date('j', strtotime($date)) && $holiday['month'] == date('n', strtotime($date))) {
                return true;
            }
        }

        $nonWorkingDay = array(6, 7);

        if (in_array(date('N', strtotime($date)), $nonWorkingDay)) {
            return true;
        }

        if (date('N', strtotime($date)) == 5 && date('H', strtotime($date)) >= 12) {
            return true;
        }

        return false;
    }

    private function isToLate($date)
    {
        $normalDays = array(1, 2, 3, 4, 5);
        if (in_array(date('N', strtotime($date)), $normalDays) && date('H', strtotime($date)) >= 12) {
            return true;
        }
        return false;
    }

    /**
     * @param $countries
     * @param $code
     * @return bool|array
     */
    private function searchCountry($countries, $code)
    {
        foreach ($countries as $country) {
            if ($country['code'] == $code) {
                return $country;
            }
        }
        return false;
    }

    private function prepareShipper()
    {
        $this->Setting->setModule('senderData');
        $senderData = $this->Setting->getAllByModule();

        $postalCode = str_replace('-', '', $senderData['postalCode']['value']);

        $shipper = new Shipper();
        $shipper->setName($senderData['companyName']['value']);
        $shipper->setStreet($senderData['street']['value']);
        $shipper->setCity($senderData['city']['value']);
        $shipper->setPostalCode($postalCode);
        $shipper->setHouseNumber($senderData['houseNumber']['value']);
        if (strlen($senderData['flatNumber']['value']) > 0) {
            $shipper->setApartmentNumber($senderData['flatNumber']['value']);
        }
        if (strlen($senderData['contactPerson']['value']) > 0) {
            $shipper->setContactPerson($senderData['contactPerson']['value']);
        }
        if (strlen($senderData['phone']['value']) > 0) {
            $shipper->setContactPhone($senderData['phone']['value']);
        }
        if (strlen($senderData['email']['value']) > 0) {
            $shipper->setContactEmail($senderData['email']['value']);
        }

        return $shipper;
    }

    /**
     * @param array $orderAddress
     * @return Receiver
     */
    private function prepareReceiver(array $orderAddress)
    {
        if (strlen($orderAddress['address']['companyName']) > 0) {
            $fullName = $orderAddress['address']['companyName'];
        } else {
            $fullName = $orderAddress['address']['name'] . ' ' . $orderAddress['address']['lastname'];
        }

        $contactPerson = $orderAddress['address']['name'] . ' ' . $orderAddress['address']['lastname'];

        $postalCode = str_replace('-', '', $orderAddress['address']['zipcode']);

        $orderUser = $this->getOrderUser();

        $receiver = new Receiver();
        $receiver->setName($fullName);
        $receiver->setStreet($orderAddress['address']['street']);
        $receiver->setHouseNumber($orderAddress['address']['house']);
        if ($orderAddress['address']['apartment']) {
            $receiver->setApartmentNumber($orderAddress['address']['apartment']);
        }
        $receiver->setPostalCode($postalCode);
        $receiver->setCity($orderAddress['address']['city']);
        $receiver->setCountry($orderAddress['address']['countryCode']);
        $receiver->setContactPhone($orderAddress['address']['telephone']);
        $receiver->setContactPerson($contactPerson);
        $receiver->setContactEmail($orderUser['user']);

        return $receiver;
    }

    /**
     * @param array $orderAddresses
     * @return array
     */
    private function getJoinedDeliveries(array $orderAddresses)
    {
        $joinMatrix = array();

        foreach ($orderAddresses as $key => $orderAddress) {
            if ($orderAddress['joined'] == 1) {
                if (isset($joinMatrix[$orderAddress['address']['copyFromID']])) {
                    $orderAddresses[$key]['joinID'] = $joinMatrix[$orderAddress['address']['copyFromID']];
                } else {
                    $joinMatrix[$orderAddress['address']['copyFromID']] = $orderAddress['joinID'] = count($joinMatrix) + 1;
                }
            }
        }
        $counter = array();
        $joinedWeight = array();
        foreach ($orderAddresses as $key => $orderAddress) {
            if ($orderAddress['joined'] == 1) {
                if (isset($counter[$orderAddress['address']['copyFromID']])) {
                    $counter[$orderAddress['address']['copyFromID']]++;
                } else {
                    $counter[$orderAddress['address']['copyFromID']] = 1;
                }
                if (isset($joinedWeight[$orderAddress['address']['copyFromID']])) {
                    $joinedWeight[$orderAddress['address']['copyFromID']] += $orderAddress['calculation']['weight'];
                } else {
                    $joinedWeight[$orderAddress['address']['copyFromID']] = $orderAddress['calculation']['weight'];
                }
                $orderAddresses[$key]['joinedCounter'] = $counter[$orderAddress['address']['copyFromID']];
            }
        }
        foreach ($orderAddresses as $key => $orderAddress) {
            if ($orderAddress['joined'] == 1) {
                if (isset($counter[$orderAddress['address']['copyFromID']])) {
                    if (ceil($counter[$orderAddress['address']['copyFromID']] / 2) == $orderAddress['joinedCounter']) {
                        $orderAddresses[$key]['joinedMiddle'] = true;
                        $orderAddresses[$key]['joinedWeight'] = $joinedWeight[$orderAddress['address']['copyFromID']];
                    }
                }
            }
        }

        return $orderAddresses;
    }

    /**
     * @param array $orderAddresses
     * @return array
     */
    private function getPartedDeliveries(array $orderAddresses)
    {

        $products = array();
        foreach ($orderAddresses as $orderAddress) {
            $products[$orderAddress['productID']][] = $orderAddress['volume'];
        }

        foreach ($orderAddresses as $key => $orderAddress) {
            $orderAddresses[$key]['overallVolume'] = array_sum($products[$orderAddress['productID']]);
        }

        return $orderAddresses;
    }

    /**
     * @param array $orderAddress
     * @return bool|mixed
     */
    private function generateUps(array $orderAddress)
    {
        $calc = $orderAddress['calculation'];

        if (isset($orderAddress['input']['joinedWeight']) && $orderAddress['input']['joinedWeight'] > 0) {
            $overallWeight = $orderAddress['input']['joinedWeight'];
        } else {
            $overallWeight = $calc['weight'];
        }

        $division = 1;
        if ($calc['volume'] > $orderAddress['volume']) {
            $division = $orderAddress['volume'] / $calc['volume'];
        }

        $overallWeight *= $division;

        $confPriceEntity = $orderAddress['delivery']['confPrice'];

        $singlePackageWeight = $confPriceEntity['weight'];

        $iterableWeight = $overallWeight;
        $packagesQuantity = 0;

        $packagesWeights = array();
        while ($iterableWeight > 0) {
            if ($iterableWeight > $singlePackageWeight) {
                $iterableWeight -= $singlePackageWeight;
                $packagesWeights[] = $singlePackageWeight + 0;
            } else {
                $packagesQuantity++;
                $packagesWeights[] = $iterableWeight;
                $iterableWeight = 0;
            }
        }

        $results = array();
        foreach ($packagesWeights as $packagesWeight) {
            $results[] = $this->generatePackageUps($orderAddress, $packagesWeight);
        }

        return $results;
    }


    /**
     * @param $orderAddress
     * @param $packageWeight
     * @return bool|mixed
     */
    private function generatePackageUps($orderAddress, $packageWeight)
    {
        $response = false;
        try {
            $response = $this->UpsDelivery->shipment($orderAddress, $packageWeight);
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }

        return $response;
    }

    private function generateDPD(array $orderAddress)
    {
        $calc = $orderAddress['calculation'];

        if (isset($orderAddress['input']['joinedWeight']) && $orderAddress['input']['joinedWeight'] > 0) {
            $overallWeight = $orderAddress['input']['joinedWeight'];
        } else {
            $overallWeight = $calc['weight'];
        }

        $division = 1;
        if ($calc['volume'] > $orderAddress['volume']) {
            $division = $orderAddress['volume'] / $calc['volume'];
        }

        $overallWeight *= $division;
        $confPriceEntity = $orderAddress['delivery']['confPrice'];
        $singlePackageWeight = $confPriceEntity['weight'];
        $iterableWeight = $overallWeight;
        $packagesQuantity = 0;
        $packagesWeights = array();

        while ($iterableWeight > 0) {
            if ($iterableWeight > $singlePackageWeight) {
                $iterableWeight -= $singlePackageWeight;
                $packagesWeights[] = $singlePackageWeight + 0;
            } else {
                $packagesQuantity++;
                $packagesWeights[] = $iterableWeight;
                $iterableWeight = 0;
            }
        }

        $results = array();
        foreach ($packagesWeights as $packagesWeight) {
            $results[] = $this->generatePackageDPD($orderAddress, $packagesWeight);
        }

        return $results;
    }


    private function generatePackageDPD($orderAddress, $packageWeight)
    {
        $response = false;
        try {
            $response = $this->DpdDelivery->shipment($orderAddress, $packageWeight);
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }

        return $response;
    }

    /**
     * @param array $orderAddresses
     * @return array
     */
    private function fillShipmentLabel(array $orderAddresses)
    {

        foreach ($orderAddresses as $key => $orderAddress) {

            switch ($orderAddress['courier']['key']) {
                case 'dpd-russia':
                    if( $orderAddress['shipmentID'] ) {
                        $shipment = $this->DpdShipment->get('shipmentID', $orderAddress['shipmentID']);
                        $orderAddresses[$key]['labels'][] = STATIC_URL . companyID . '/' . DPD_LABELS_DIR . '/' . $shipment['trackingNumber'] . '_' . $shipment['shipmentID'] . '_' . $shipment['ID'] . '.pdf';
                    }
                    break;
                case 'ups':
                    if($orderAddress['shipmentID']) {
                        $shipments = $this->UpsShipment->get('shipmentID', $orderAddress['shipmentID'], true);

                        if( $shipments && is_array($shipments) ) {
                            foreach($shipments as $shipment) {
                                $orderAddresses[$key]['labels'][] = STATIC_URL . companyID . '/' . UPS_LABELS_DIR . '/' . $shipment['trackingNumber'] . '_' . $shipment['shipmentID'] . '_' . $shipment['ID'] . '.gif';
                            }
                        }
                    }
                    break;
                default:
                    break;
            }

        }

        return $orderAddresses;
    }

    /**
     * @param $orderAddresses
     * @return array
     */
    private function fillUserDeliveryPrice($orderAddresses)
    {
        foreach ($orderAddresses as $key => $orderAddress) {
            $userPriceEntity = $this->UserDeliveryPrice->getByParams(
                $orderAddress['product']['calcID'],
                $orderAddress['product']['productID'],
                $orderAddress['volume'],
                1
            );
            $orderAddresses[$key]['userDeliveryPrice'] = $userPriceEntity;
        }

        return $orderAddresses;
    }


}