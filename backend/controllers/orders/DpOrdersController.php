<?php

/**
 * Description of DpOrdersController
 *
 * @author Rafał
 */

use DreamSoft\Controllers\Components\CalcDelivery;
use DreamSoft\Controllers\Components\Calculation;
use DreamSoft\Controllers\Components\Filter;
use DreamSoft\Controllers\Components\InvoiceComponent;
use DreamSoft\Controllers\Components\LangComponent;
use DreamSoft\Controllers\Components\Mail;
use DreamSoft\Controllers\Components\Payu;
use DreamSoft\Controllers\Components\Price;
use DreamSoft\Controllers\Components\RealizationTimeComponent;
use DreamSoft\Models\Address\Address;
use DreamSoft\Models\Address\AddressUser;
use DreamSoft\Models\Coupon\Coupon;
use DreamSoft\Models\Coupon\CouponOrder;
use DreamSoft\Models\Currency\CurrencyRoot;
use DreamSoft\Models\CustomProduct\CustomProduct;
use DreamSoft\Models\Delivery\Delivery;
use DreamSoft\Models\Delivery\DeliveryName;
use DreamSoft\Models\Domain\Domain;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\Module\Module;
use DreamSoft\Models\Order\DpOrderAddress;
use DreamSoft\Models\Order\DpOrderAddressProduct;
use DreamSoft\Models\Order\DpPaymentRemind;
use DreamSoft\Models\Order\DpProductFile;
use DreamSoft\Models\Order\OrderMessage;
use DreamSoft\Models\Order\OrderStatus;
use DreamSoft\Models\Order\OrderStatusLang;
use DreamSoft\Models\PrintShop\PrintShopRealizationTime;
use DreamSoft\Models\PrintShopUser\UserCalc;
use DreamSoft\Models\PrintShopUser\UserDeliveryPrice;
use DreamSoft\Models\Reclamation\Reclamation;
use DreamSoft\Models\Order\FileReminder;
use DreamSoft\Libs\TwigExtensions\TranslateExtension;
use DreamSoft\Libs\Tinkoff\TinkoffMerchantAPI;
use DreamSoft\Controllers\Components\PaymentAssistant;
use DreamSoft\Controllers\Components\Acl;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeLanguage;
use DreamSoft\Models\PrintShopUser\UserCalcProduct;
use DreamSoft\Models\Payment\Payment;
use DreamSoft\Controllers\Components\ProductionPath;
use DreamSoft\Controllers\Components\RouteAssistant;
use DreamSoft\Models\Currency\Currency;
use DreamSoft\Models\Template\TemplateSetting;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;
use Voronkovich\SberbankAcquiring\Client as SberbankClient;
use Voronkovich\SberbankAcquiring\Currency as SberbankCurrency;
use Voronkovich\SberbankAcquiring\OrderStatus as SberbankOrderStatus;
use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Core\ProductionEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;
use PayPalCheckoutSdk\Orders\OrdersGetRequest;
use DreamSoft\Models\Mongo\MgSession;
use DreamSoft\Models\Mongo\MgCart;
use MongoDB\BSON\ObjectId as ObjectId;
use DreamSoft\Models\Order\DpOrder;
use DreamSoft\Models\Order\DpProduct;
use DreamSoft\Models\Order\DpInvoice;
use DreamSoft\Models\Product\ProductCategory;
use DreamSoft\Models\Tax\Tax;
use DreamSoft\Models\PrintShop\PrintShopComplex;
use DreamSoft\Models\Price\BasePrice;
use Twig\Loader\FilesystemLoader;
use Twig\Environment as Twig_Environment;
use DreamSoft\Controllers\Components\DeliveryAssistant;
use DreamSoft\Models\Payment\PaymentContent;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Core\Controller;
use DreamSoft\Models\User\User;
use DreamSoft\Models\User\UserOption;

class DpOrdersController extends Controller
{

    public $useModels = array();
    /**
     * @var Domain
     */
    private $Domain;
    /**
     * @var DpOrder
     */
    protected $DpOrder;

    /**
     * @var DpProduct
     */
    protected $DpProduct;

    /**
     * @var DpOrderAddress
     */
    protected $DpOrderAddress;

    /**
     * @var DpOrderAddressProduct
     */
    protected $DpOrderAddressProduct;

    /**
     * @var DpPaymentRemind
     */
    protected $DpPaymentRemind;

    /**
     * @var BasePrice
     */
    protected $BasePrice;

    /**
     * @var User
     */
    protected $User;

    /**
     * @var Address
     */
    protected $Address;

    /**
     * @var UserCalc
     */
    protected $UserCalc;
    /**
     * @var UserCalcProduct
     */
    protected $UserCalcProduct;
    /**
     * @var PrintShopType
     */
    protected $PrintShopType;

    /**
     * @var PrintShopTypeLanguage
     */
    protected $PrintShopTypeLanguage;

    /**
     * @var MgSession
     */
    protected $MgSession;

    /**
     * @var MgCart
     */
    protected $MgCart;

    /**
     * @var ProductCategory
     */
    protected $ProductCategory;

    /**
     * @var PrintShopRealizationTime
     */
    protected $PrintShopRealizationTime;

    /**
     * @var DeliveryName
     */
    protected $DeliveryName;

    /**
     * @var Payment
     */
    protected $Payment;

    /**
     * @var Module
     */
    protected $Module;

    /**
     * @var OrderStatus
     */
    protected $OrderStatus;

    /**
     * @var OrderStatusLang
     */
    protected $OrderStatusLang;

    /**
     * @var UserDeliveryPrice
     */
    protected $UserDeliveryPrice;

    /**
     * @var Currency
     */
    protected $Currency;

    /**
     * @var CurrencyRoot
     */
    protected $CurrencyRoot;

    /**
     * @var Setting
     */
    protected $Setting;

    /**
     * @var Calculation
     */
    protected $Calculation;

    /**
     * @var Acl
     */
    protected $Acl;

    /**
     * @var Price
     */
    protected $Price;

    /**
     * @var Mail
     */
    protected $Mail;

    /**
     * @var Filter
     */
    protected $Filter;

    /**
     * @var CalcDelivery
     */
    protected $CalcDelivery;

    /**
     * @var ProductionPath
     */
    protected $ProductionPath;
    /**
     * @var RealizationTimeComponent
     */
    protected $RealizationTimeComponent;

    /**
     * @var PayU
     */
    protected $PayU;

    /**
     * @var CouponOrder
     */
    protected $CouponOrder;

    /**
     * @var Coupon
     */
    protected $Coupon;

    /**
     * @var Tax
     */
    protected $Tax;

    /**
     * @var DpInvoice
     */
    protected $DpInvoice;

    /**
     * @var AddressUser
     */
    protected $AddressUser;

    /**
     * @var InvoiceComponent
     */
    protected $InvoiceComponent;

    /**
     * @var UserOption
     */
    protected $UserOption;

    /**
     * @var Reclamation
     */
    protected $Reclamation;

    /**
     * @var OrderMessage
     */
    protected $OrderMessage;

    /**
     * @var Delivery
     */
    protected $Delivery;
    /**
     * @var TemplateSetting
     */
    protected $TemplateSetting;
    /**
     * @var FileReminder
     */
    protected $FileReminder;
    /**
     * @var DpProductFile
     */
    protected $DpProductFile;
    /**
     * @var CustomProduct
     */
    protected $CustomProduct;
    /**
     * @var PaymentAssistant
     */
    protected $PaymentAssistant;
    /**
     * @var LangComponent
     */
    protected $LangComponent;
    /**
     * @var PrintShopComplex
     */
    protected $PrintShopComplex;
    /**
     * @var RouteAssistant
     */
    private $RouteAssistant;
    /**
     * @var LangSetting
     */
    private $LangSetting;
    /**
     * @var DeliveryAssistant
     */
    private $DeliveryAssistant;
    /**
     * @var PaymentContent
     */
    private $PaymentContent;

    protected $calculations;
    protected $basePrices;
    protected $orderCurrency;
    protected $deliveryPrices;
    protected $langNames;
    protected $formatNames;
    protected $configs = array();

    /**
     * DpOrdersController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);

        $this->Price = Price::getInstance();
        $this->Filter = Filter::getInstance();
        $this->Calculation = Calculation::getInstance();
        $this->Acl = new Acl();
        $this->ProductionPath = new ProductionPath();
        $this->Mail = Mail::getInstance();
        $this->RealizationTimeComponent = RealizationTimeComponent::getInstance();
        $this->PayU = Payu::getInstance();
        $this->CalcDelivery = CalcDelivery::getInstance();
        $this->InvoiceComponent = InvoiceComponent::getInstance();

        $this->DpOrder = DpOrder::getInstance();
        $this->DpProduct = DpProduct::getInstance();
        $this->DpOrderAddress = DpOrderAddress::getInstance();
        $this->DpOrderAddressProduct = DpOrderAddressProduct::getInstance();
        $this->DpPaymentRemind = DpPaymentRemind::getInstance();
        $this->BasePrice = BasePrice::getInstance();
        $this->Address = Address::getInstance();
        $this->User = User::getInstance();
        $this->UserCalc = UserCalc::getInstance();
        $this->UserCalcProduct = UserCalcProduct::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->MgSession = MgSession::getInstance();
        $this->MgCart = MgCart::getInstance();
        $this->PrintShopTypeLanguage = PrintShopTypeLanguage::getInstance();
        $this->ProductCategory = ProductCategory::getInstance();
        $this->PrintShopRealizationTime = PrintShopRealizationTime::getInstance();
        $this->DeliveryName = DeliveryName::getInstance();
        $this->Payment = Payment::getInstance();
        $this->UserDeliveryPrice = UserDeliveryPrice::getInstance();
        $this->Module = Module::getInstance();
        $this->OrderStatus = OrderStatus::getInstance();
        $this->OrderStatusLang = OrderStatusLang::getInstance();
        $this->Currency = Currency::getInstance();
        $this->CurrencyRoot = CurrencyRoot::getInstance();
        $this->Setting = Setting::getInstance();
        $this->Setting->setModule('general');
        $this->CouponOrder = CouponOrder::getInstance();
        $this->Coupon = Coupon::getInstance();
        $this->Reclamation = Reclamation::getInstance();
        $this->OrderMessage = OrderMessage::getInstance();
        $this->Tax = Tax::getInstance();
        $this->DpInvoice = DpInvoice::getInstance();
        $this->AddressUser = AddressUser::getInstance();
        $this->UserOption = UserOption::getInstance();
        $this->Delivery = Delivery::getInstance();
        $this->TemplateSetting = TemplateSetting::getInstance();
        $this->FileReminder = FileReminder::getInstance();
        $this->DpProductFile = DpProductFile::getInstance();
        $this->CustomProduct = CustomProduct::getInstance();
        $this->PaymentAssistant = PaymentAssistant::getInstance();
        $this->LangComponent = LangComponent::getInstance();
        $this->PrintShopComplex = PrintShopComplex::getInstance();
        $this->RouteAssistant = RouteAssistant::getInstance();
        $this->LangSetting = LangSetting::getInstance();
        $this->DeliveryAssistant = DeliveryAssistant::getInstance();
        $this->PaymentContent = PaymentContent::getInstance();
        $this->Domain = Domain::getInstance();
        $this->setConfigs();
    }

    /**
     *
     */
    public function setConfigs()
    {
        $this->configs = array(
            'ID' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'ID', 'sign' => $this->Filter->signs['li']),
            'ready' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'ready', 'sign' => $this->Filter->signs['e']),
            'isOffer' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'isOffer', 'sign' => $this->Filter->signs['e']),
            'isOrder' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'isOrder', 'sign' => $this->Filter->signs['e']),
            'sellerID' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'sellerID', 'sign' => $this->Filter->signs['e']),
            'dateFrom' => array('type' => 'timestamp', 'table' => 'dp_orders', 'field' => 'created', 'sign' => $this->Filter->signs['gt']),
            'dateTo' => array('type' => 'timestamp', 'table' => 'dp_orders', 'field' => 'created', 'sign' => $this->Filter->signs['lt']),
            'production' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'production', 'sign' => $this->Filter->signs['e']),
            'userID' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'userID', 'sign' => $this->Filter->signs['e']),
            'user' => array('type' => 'string', 'table' => 'user', 'field' => 'user', 'sign' => $this->Filter->signs['li']),
            'paid' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'paid', 'sign' => $this->Filter->signs['e']),
            'status' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'status', 'sign' => $this->Filter->signs['e']),
            'notStatus' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'status', 'sign' => $this->Filter->signs['not']),
            'statusType' => array('type' => 'string', 'table' => 'orderStatuses', 'field' => 'type', 'sign' => $this->Filter->signs['e']),
            'invoiceType' => array('type' => 'string', 'table' => 'invoices', 'field' => 'type', 'sign' => $this->Filter->signs['e']),
            'domainID' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'domainID', 'sign' => $this->Filter->signs['e']),
            'name' => array('type' => 'string', 'table' => 'user', 'join' => 'lastname', 'field' => 'name', 'sign' => $this->Filter->signs['li']),
            'lastname' => array('type' => 'string', 'table' => 'user', 'join' => 'name', 'field' => 'lastname', 'sign' => $this->Filter->signs['li']),
            'telephone' => array('type' => 'string', 'table' => 'address', 'join' => 'nip', 'field' => 'telephone', 'sign' => $this->Filter->signs['li']),
            'nip' => array('type' => 'string', 'table' => 'invoiceAddress', 'join' => 'telephone', 'field' => 'nip', 'sign' => $this->Filter->signs['li']),
            'companyName' => array('type' => 'string', 'table' => 'invoiceAddress', 'field' => 'companyName', 'sign' => $this->Filter->signs['li']),
            'statusTypeList' => array('type' => 'string', 'table' => 'orderStatuses', 'field' => 'type', 'sign' => $this->Filter->signs['in']),
            'customProductExist' => array('type' => 'string', 'table' => 'customProducts', 'field' => 'ID', 'sign' => $this->Filter->signs['gt']),
            'orderFromOffer' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'offerStatus', 'sign' => $this->Filter->signs['e']),
            'expireDateFrom' => array('type' => 'timestamp', 'table' => 'dp_orders', 'field' => 'expires', 'sign' => $this->Filter->signs['gt']),
            'expireDateTo' => array('type' => 'timestamp', 'table' => 'dp_orders', 'field' => 'expires', 'sign' => $this->Filter->signs['lt']),
            'sellerMail' => array('type' => 'string', 'table' => 'seller', 'field' => 'user', 'sign' => $this->Filter->signs['li']),
        );
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        parent::setDomainID($domainID);
        $this->User->setDomainID($domainID);
        $this->Mail->setDomainID($domainID);
        $this->Payment->setDomainID($domainID);
        $this->PayU->setDomainID($domainID);
        $this->Setting->setDomainID($domainID);
        $this->Currency->setDomainID($domainID);
        $this->InvoiceComponent->setDomainID($domainID);
        $this->TemplateSetting->setDomainID($domainID);
        $this->OrderStatus->setDomainID($domainID);
        $this->PaymentAssistant->setDomainID($domainID);
        $this->RouteAssistant->setDomainID($domainID);
        $this->LangSetting->setDomainID($domainID);
        $this->DeliveryAssistant->setDomainID($domainID);
        $this->PaymentContent->setDomainID($domainID);
    }

    /**
     * @return array
     */
    public function getConfigs()
    {
        return $this->configs;
    }

    /**
     * @param $params
     * @return bool
     */
    public function index($params)
    {

        $limit = 30;
        if (isset($params['limit'])) {
            $limit = $params['limit'];
        }
        $offset = 0;
        if (isset($params['offset'])) {
            $offset = $params['offset'];
        }

        $sortBy[0] = '-ID';
        if (isset($params['sort'])) {
            $sortBy = explode('|', $params['sort']);
        }

        if (array_key_exists('customProductExist', $params) && $params['customProductExist'] == 0) {
            unset($params['customProductExist']);
        }

        $loggedUser = $this->Auth->getLoggedUser();

        if ($loggedUser && $this->Acl->isSeller($loggedUser) &&
            !$this->Acl->isSuperUser($loggedUser) && !$this->Acl->isBok($loggedUser)) {
            $params['sellerID'] = $loggedUser['ID'];
        }

        $configs = $this->getConfigs();

        $filters = $this->Filter->prepare($configs, $params);
        $list = $this->DpOrder->getList($filters, $offset, $limit, $sortBy);

        $orderIDs = array();
        $paymentArr = array();
        $aggregateUsers = array();
        $aggregateCustomProducts = array();
        foreach ($list as $key => $value) {
            $orderIDs[] = $value['ID'];
            $aggregateUsers[] = $value['userID'];
            if (isset($value['paymentID']) && $value['paymentID'] > 0) {
                $paymentArr[] = $value['paymentID'];
            }
            if ($value['customProductID']) {
                $aggregateCustomProducts[] = $value['customProductID'];
            }
        }

        $unreadMessages = $this->OrderMessage->countUnread($orderIDs, 0);
        $allMessages = $this->OrderMessage->countAll($orderIDs);

        $payments = $this->Payment->getByList($paymentArr);

        $res = $this->DpProduct->getOrdersProducts($orderIDs);

        $res = $this->Calculation->getCalcData($res);

        $invoices = $this->DpInvoice->getByOrderList($orderIDs);

        $customProducts = $this->CustomProduct->getByList($aggregateCustomProducts);

        $aggregateAddresses = array();
        if ($invoices) {
            foreach ($invoices as $invoice) {
                $aggregateAddresses[$invoice['addressID']] = $invoice['orderID'];
            }
        }

        $products = array();
        $aggregateProducts = array();
        foreach ($res as $each) {
            $aggregateProducts[] = $each['productID'];
            if (!isset($products[$each['orderID']])) {
                $products[$each['orderID']] = array();
            }
            $products[$each['orderID']][] = $each;
        }

        $orderFiles = $this->DpProductFile->getByList($aggregateProducts);

        $orderCoupons = $this->CouponOrder->getByProducts($aggregateProducts);

        $aggregateUsers = array_filter($aggregateUsers);

        $defaultAddresses = $this->Address->getDefaultByList($aggregateUsers, 1);
        $defaultInvoiceAddresses = $this->Address->getDefaultByList($aggregateUsers, 2);

        $currency = DEFAULT_CURRENCY;

        $addressesResult = $this->DpOrderAddress->getOrdersAddresses($orderIDs);

        $orderInvoiceAddresses = $this->DpOrderAddress->getOrdersInvoiceAddresses($orderIDs);

        $aggregateInvoiceAddresses = array();
        if ($orderInvoiceAddresses && is_array($orderInvoiceAddresses)) {
            foreach ($orderInvoiceAddresses as $orderInvoiceAddress) {
                $aggregateInvoiceAddresses[] = $orderInvoiceAddress['addressID'];
            }
        }

        $invoiceAddressesUnsorted = $this->Address->getByList($aggregateInvoiceAddresses);

        $invoiceAddresses = array();
        if ($orderInvoiceAddresses) {
            foreach ($orderInvoiceAddresses as $orderInvoiceAddress) {
                $invoiceAddresses[$orderInvoiceAddress['orderID']] = $invoiceAddressesUnsorted[$orderInvoiceAddress['addressID']];
            }
        }

        $allStatuses = $this->OrderStatus->getAll();

        $sortedStatuses = array();
        if ($allStatuses) {
            foreach ($allStatuses as $status) {
                $sortedStatuses[$status['ID']] = $status;
            }
        }

        $addresses = array();
        $aggregateSenders = array();
        $aggregateDeliveries = array();
        if ($addressesResult) {
            foreach ($addressesResult as $key => $each) {
                if ($each['type'] == 2) {
                    continue;
                }
                if ($each['senderID'] == 2) {
                    $aggregateSenders[] = $each['userID'];
                }
                if ($each['deliveryID']) {
                    $aggregateDeliveries[] = $each['deliveryID'];
                }
                if (!isset($addresses[$each['orderID']])) {
                    $addresses[$each['orderID']] = array();
                }

                if ($each['volume'] > 0 && $each['deliveryID'] > 0) {
                    $addressesResult[$key]['deliveryPrice'] = $this->UserDeliveryPrice->getByOrderAddress($each['volume'], $each['deliveryID'], $each['productID']);
                    if (array_key_exists('deliveryPrice', $addressesResult[$key])) {
                        $each['deliveryPrice']['price'] = $this->Price->getPriceToView($addressesResult[$key]['deliveryPrice']['price']);
                        $each['deliveryPrice']['grossPrice'] = $this->Price->getPriceToView($addressesResult[$key]['deliveryPrice']['grossPrice']);
                    }
                }

                if (array_key_exists($each['orderID'], $products)) {
                    $oneProduct = $this->findProduct($products[$each['orderID']], $each['productID']);
                    $addressesResult[$key]['product'] = array(
                        'productID' => $oneProduct['productID'],
                        'userName' => $oneProduct['name'],
                        'productName' => $oneProduct['calcProducts'][0]['typeName']
                    );
                }

                $addresses[$each['orderID']][] = $each;
            }

            $aggregateSenders = array_filter($aggregateSenders);
            $addressSenders = $this->Address->getDefaultByList($aggregateSenders, 1);

            $deliveries = $this->Delivery->customGetByList($aggregateDeliveries);

            $modules = $this->DeliveryAssistant->getModules();

            foreach ($deliveries as $key => $oneDelivery) {
                if (isset($modules[$oneDelivery['courierID']])) {
                    $deliveries[$key]['module'] = $modules[$oneDelivery['courierID']];
                }
            }

            foreach ($addresses as $orderID => $orderAddress) {
                foreach ($orderAddress as $keyAddress => $address) {
                    if ($address['senderID'] == 2 && isset($addressSenders[$address['userID']])) {
                        $addresses[$orderID][$keyAddress]['sender'] = $addressSenders[$address['userID']];
                    }
                    $addresses[$orderID][$keyAddress]['delivery'] = $deliveries[$address['deliveryID']];
                    if (array_key_exists('collectionPointID', $address) && $address['collectionPointID'] > 0) {
                        $addresses[$orderID][$keyAddress]['collectionPoint'] = $this->selectCollectionPoint(
                            $deliveries[$address['deliveryID']]['module']['collectionPoints'],
                            $address['collectionPointID']
                        );
                    }
                }
            }
        }

        $reclamations = $this->Reclamation->getByOrderList($orderIDs);

        $deliveryIndexes = array();
        foreach ($list as $key => $each) {

            $sumPrice = 0;
            $sumGrossPrice = 0;
            $sumOrderFiles = 0;
            $totalPrice = 0;
            $totalGrossPrice = 0;
            $totalDeliveryPrice = 0;
            $totalDeliveryPriceGross = 0;

            $productWithoutFile = false;

            if (array_key_exists($each['ID'], $products) && is_array($products[$each['ID']])) {

                foreach ($products[$each['ID']] as $pKey => $pValue) {

                    $totalPrice += $this->Price->getPriceToDb($pValue['price']);
                    $totalGrossPrice += $this->Price->getPriceToDb($pValue['grossPrice']);

                    if ($addresses[$each['ID']]) {

                        $deliveryAddress=array_pop(array_filter($addresses[$each['ID']],function($item)use($pValue){
                            return $item['productID']==$pValue['productID'];
                        }));

                            if (array_key_exists('deliveryPrice', $deliveryAddress)) {
                                $totalPrice += $this->Price->getPriceToDb($deliveryAddress['deliveryPrice']['price']);
                                $totalGrossPrice += $this->Price->getPriceToDb($deliveryAddress['deliveryPrice']['grossPrice']);

                                $totalDeliveryPrice += $this->Price->getPriceToDb(
                                    $deliveryAddress['deliveryPrice']['price']
                                );
                                $totalDeliveryPriceGross += $this->Price->getPriceToDb(
                                    $deliveryAddress['deliveryPrice']['grossPrice']
                                );
                            }


                    }

                    $sumPrice += $this->Price->getPriceToDb($pValue['price']);
                    $sumGrossPrice += $this->Price->getPriceToDb($pValue['grossPrice']);
                    $currency = $pValue['currency'];

                    $products[$each['ID']][$pKey]['deliveryJoined'] = $pValue['deliveryJoined'] = $this->searchJoinedAddress($addresses[$each['ID']], $pValue['productID']);
                    $products[$each['ID']][$pKey]['coupon'] = NULL;
                    if (array_key_exists($pValue['productID'], $orderCoupons) && is_array($orderCoupons[$pValue['productID']])) {
                        $products[$each['ID']][$pKey]['coupon'] = current($orderCoupons[$pValue['productID']]);
                    }

                    if ($deliveryIndexes) {
                        if (!isset($deliveryIndexes[$each['oID']][$pValue['deliveryJoined']]) && $pValue['deliveryJoined'] > 0) {
                            $deliveryIndexes[$each['ID']][$pValue['deliveryJoined']] = count($deliveryIndexes[$each['ID']]) + 1;
                        }
                    }

                    if ($pValue['deliveryJoined'] > 0) {
                        $products[$each['ID']][$pKey]['deliveryJoined'] = $pValue['deliveryJoined'];
                        $products[$each['ID']][$pKey]['deliveryJoinedIndex'] = $deliveryIndexes[$each['orderID']][$pValue['deliveryJoined']];
                    }

                    if (!empty($orderFiles[$pValue['productID']])) {
                        $sumOrderFiles += count($orderFiles[$pValue['productID']]);
                        $products[$each['ID']][$pKey]['files'] = $orderFiles[$pValue['productID']];
                    } else {
                        $products[$each['ID']][$pKey]['files'] = null;
                        $productWithoutFile = true;
                    }
                }

            }

            $list[$key]['sumPrice'] = $this->Price->getPriceToView($sumPrice);
            $list[$key]['sumGrossPrice'] = $this->Price->getPriceToView($sumGrossPrice);

            $list[$key]['totalPrice'] = $this->Price->getPriceToView($totalPrice);
            $list[$key]['totalGrossPrice'] = $this->Price->getPriceToView($totalGrossPrice);

            $list[$key]['totalDeliveryPrice'] = $this->Price->getPriceToView($totalDeliveryPrice);
            $list[$key]['totalDeliveryPriceGross'] = $this->Price->getPriceToView($totalDeliveryPriceGross);

            $list[$key]['currency'] = $currency;

            if (array_key_exists($each['ID'], $products)) {
                $list[$key]['products'] = $products[$each['ID']];
            }

            if (isset($addresses[$each['ID']])) {
                $list[$key]['addresses'] = $addresses[$each['ID']];
            } else {
                $list[$key]['addresses'] = NULL;
            }
            if ($each['paymentID'] > 0) {
                $list[$key]['payment'] = $payments[$each['paymentID']];
            }
            if (isset($defaultAddresses[$each['userID']])) {
                $list[$key]['defaultAddress'] = $defaultAddresses[$each['userID']];
            }
            if (isset($defaultInvoiceAddresses[$each['userID']])) {
                $list[$key]['defaultInvoiceAddress'] = $defaultInvoiceAddresses[$each['userID']];
            }
            if (isset($invoiceAddresses[$each['ID']])) {
                $list[$key]['invoiceAddress'] = $invoiceAddresses[$each['ID']];
            } else {
                $list[$key]['invoiceAddress'] = false;
            }

            $list[$key]['remindDatesCount'] = 0;

            $remindAttempts = array(0, 1, 2);

            foreach ($remindAttempts as $remindAttempt) {
                $numberOfAttempt = $remindAttempt + 1;
                if ($each['remindDate' . $numberOfAttempt]) {
                    $list[$key]['remindDates'][$remindAttempt] = $each['remindDate' . $numberOfAttempt];
                    $list[$key]['remindDatesCount'] = $numberOfAttempt;
                    unset($list[$key]['remindDate' . $numberOfAttempt]);
                } else {
                    unset($list[$key]['remindDate' . $numberOfAttempt]);
                }
            }

            $list[$key]['fileRemind']['datesCount'] = 0;

            $fileRemindAttempts = array(0, 1, 2);

            foreach ($fileRemindAttempts as $fileRemindAttempt) {
                $numberOfAttempt = $fileRemindAttempt + 1;
                if ($each['fileRemindDate' . $numberOfAttempt]) {
                    $list[$key]['fileRemind']['dates'][$fileRemindAttempt] = $each['fileRemindDate' . $numberOfAttempt];
                    $list[$key]['fileRemind']['datesCount'] = $numberOfAttempt;
                    unset($list[$key]['fileRemindDate' . $numberOfAttempt]);
                } else {
                    unset($list[$key]['fileRemindDate' . $numberOfAttempt]);
                }
            }

            if (isset($unreadMessages[$each['ID']])) {
                $list[$key]['unreadMessages'] = $unreadMessages[$each['ID']];
            }
            if (isset($allMessages[$each['ID']])) {
                $list[$key]['countMessages'] = $allMessages[$each['ID']];
            }
            if (isset($reclamations[$each['ID']])) {
                $list[$key]['reclamation'] = $reclamations[$each['ID']];
            } else {
                $list[$key]['reclamation'] = false;
            }

            if (isset($sortedStatuses[$each['status']])) {
                $list[$key]['status'] = $sortedStatuses[$each['status']];
            } else {
                $list[$key]['status'] = false;
            }

            if (isset($customProducts[$each['customProductID']])) {
                $list[$key]['customProduct'] = $customProducts[$each['customProductID']];
            } else {
                $list[$key]['customProduct'] = false;
            }

            $list[$key]['sumOrderFiles'] = $sumOrderFiles;
            $list[$key]['productWithoutFile'] = $productWithoutFile;
        }

        return $list;
    }

    /**
     * @param $orderID
     * @return mixed
     * @throws Twig\Error\LoaderError
     * @throws Twig\Error\RuntimeError
     * @throws Twig\Error\SyntaxError
     */
    public function patch_index($orderID)
    {
        $goodFields = array('status');
        $post = $this->Data->getAllPost();
        $data['response'] = false;

        $order = $this->DpOrder->get('ID', $orderID);

        if (!$order) {
            $data['info'] = 'Order not find!';
            return $data;
        }

        $user = $this->User->get('ID', $order['userID']);

        $count = count($post);
        if (!empty($post)) {
            $saved = 0;
            foreach ($post as $key => $value) {
                if (in_array($key, $goodFields)) {
                    $saved = intval($this->DpOrder->update($orderID, $key, $value));
                    if ($key == 'status' && $saved) {

                        $editedStatus = $this->OrderStatus->get('ID', $value);
                        if ($editedStatus['type'] == STATUS_TYPE_ENDED) {
                            $this->DpOrder->update($orderID, 'ended', date('Y-m-d H:i:s'));
                        }

                        $this->Setting->setModule('invoice');
                        $this->Setting->setLang(NULL);
                        $invoiceVatStatuses = $this->Setting->getValue('invoiceVatStatuses');
                        $invoiceVatStatuses = explode(',', $invoiceVatStatuses);

                        $lastID = false;
                        if (in_array($value, $invoiceVatStatuses)) {
                            $lastID = $this->InvoiceComponent->changeInvoiceToVat($orderID);
                        }
                        if ($lastID) {
                            $data['changeInvoiceType'] = $orderID;
                        }

                        $products = $this->DpProduct->getOrdersProducts(array($orderID));

                        if (!empty($products)) {
                            foreach ($products as $pKey => $prod) {
                                $languages = $this->PrintShopTypeLanguage->get('typeID', $prod['typeID'], true);
                                if ($languages) {
                                    foreach ($languages as $lang) {
                                        $products[$pKey]['names'][$lang['lang']] = $lang['name'];
                                    }
                                }
                            }
                        }

                        $products = $this->Calculation->getCalcData($products);

                        $templateID = 105;
                        $templateName = 'products-list-mail';

                        $templateSetting = $this->TemplateSetting->getOne($templateID, 1);

                        $templatePath = 'default/' . $templateID . '/' . $templateName . '.html';

                        if ($templateSetting && $templateSetting['source'] == 1) {
                            $templatePath = companyID . '/' . $templateID . '/' . $templateName . '.html';
                        } elseif ($templateSetting && $templateSetting['source'] == 2) {
                            $templatePath = companyID . '/' . $templateID . '/' . $this->getDomainID() . '/' . $templateName . '.html';
                        }

                        $loader = new FilesystemLoader(STATIC_PATH . 'templates');
                        $twig = new Twig_Environment($loader, array());
                        $twig->addExtension(new TranslateExtension());
                        $template = $twig->load($templatePath);

                        $lang = $this->prepareUserLanguage($user['ID']);

                        $productsContent = $template->render(
                            array(
                                'products' => $products,
                                'lang' => $lang
                            )
                        );

                        if (filter_var($user['user'], FILTER_VALIDATE_EMAIL) !== false) {
                            $this->Mail->setBind('old_status', $this->OrderStatusLang->getName($order['status'], $lang));
                            $this->Mail->setBind('status', $this->OrderStatusLang->getName($value, $lang));
                            $this->Mail->setBind('order_id', $order['ID']);
                            $this->Mail->setBind('firstname', $user['name']);
                            $this->Mail->setBind('products_list', $productsContent);

                            $send = false;
                            try {
                                $send = $this->Mail->sendMail($user['user'], $user['name'], 'changeStatus', $lang);
                            } catch (Exception $exception) {
                                $this->debug('error with mail: ', $exception->getMessage());
                            }

                            if ($send) {
                                $data['mailSend'] = $send;
                            } else {
                                $this->debug('error with mail', $send);
                            }
                        } else {
                            $this->debug('Problem with email: ' . $user['user']);
                        }

                        $currentStatus = $this->OrderStatus->getOne($value);
                        $currentStatus['langs'] = $this->parseLang($currentStatus['langs']);
                        $data['currentStatus'] = $currentStatus;
                    }
                }
            }
            if ($saved == $count) {
                $data['response'] = true;
                $data['info'] = 'Saved: ' . $count . ' fields.';
            } else {
                $data = $this->sendFailResponse('03');
            }
        } else {
            $data = $this->sendFailResponse('01');
        }
        return $data;
    }

    /**
     * @param $langExpression
     * @return array
     */
    private function parseLang($langExpression)
    {
        $exp1 = explode(',', $langExpression);
        $actLangs = array();
        if (empty($exp1)) {
            return array();
        }
        foreach ($exp1 as $e1) {
            $exp2 = explode('::', $e1);
            $actLangs[$exp2[0]] = $exp2[1];
        }
        return $actLangs;
    }

    /**
     * @param $params
     * @return mixed
     */
    public function myZone($params)
    {
        $user = $this->Auth->getLoggedUser();

        if (!$user) {
            return array('response' => false);
        }

        $params['userID'] = $user['ID'];
        $params['ready'] = 1;
        $params['production'] = 1;
        $params['isOrder'] = 1;

        $limit = 30;
        if (isset($params['limit'])) {
            $limit = $params['limit'];
        }
        $offset = 0;
        if (isset($params['offset'])) {
            $offset = $params['offset'];
        }

        $sortBy[0] = '-ID';
        if (isset($params['sort'])) {
            $sortBy = explode('|', $params['sort']);
        }

        $configs = $this->getConfigs();

        $filters = $this->Filter->prepare($configs, $params);
        $list = $this->DpOrder->getList($filters, $offset, $limit, $sortBy);

        $orderIDs = array();
        $paymentArr = array();
        foreach ($list as $key => $value) {
            $orderIDs[] = $value['ID'];
            if (isset($value['paymentID']) && $value['paymentID'] > 0) {
                $paymentArr[] = $value['paymentID'];
            }
        }

        $unreadMessages = $this->OrderMessage->countUnread($orderIDs, 1);

        $payments = $this->Payment->getByList($paymentArr);

        $res = $this->DpProduct->getOrdersProducts($orderIDs);

        $calcs = array();
        if (!empty($res)) {
            foreach ($res as $pKey => $prod) {
                $calcs[] = $prod['ID'];
                $languages = $this->PrintShopTypeLanguage->get('typeID', $prod['typeID'], true);
                if ($languages) {
                    foreach ($languages as $language) {
                        if (is_array($language) &&
                            array_key_exists('lang', $language) &&
                            array_key_exists('name', $language)) {
                            $res[$pKey]['names'][$language['lang']] = $language['name'];
                        }
                    }
                }
            }
        }

        if ($res) {
            foreach ($res as $pKey => $product) {
                $complex = $this->PrintShopComplex->getBase($product['typeID']);
                $res[$pKey]['complex'] = false;
                if ($complex) {
                    $res[$pKey]['complex'] = true;
                    $baseType = $this->PrintShopType->get('ID', $product['typeID']);
                    $res[$pKey]['skipUpload'] = $baseType['skipUpload'];
                }
            }
        }

        $res = $this->Calculation->getMyZoneData($res);

        $addressesResult = $this->DpOrderAddress->getOrdersAddresses($orderIDs);

        $addresses = array();
        $aggregateSenders = array();
        $invoiceAddress = array();
        $aggregateDeliveries = array();
        $aggregateJoined = array();

        if ($addressesResult) {

            foreach ($addressesResult as $each) {

                if (intval($each['joined']) === 1) {
                    $aggregateJoined[$each['orderID']]['aggregateProducts'][] = $each['productID'];
                }

            }

            foreach ($addressesResult as $key => $each) {
                if ($each['type'] == 2) {
                    $invoiceAddress[$each['orderID']] = $each;
                    continue;
                }
                if ($each['senderID'] == 2) {
                    $aggregateSenders[] = $each['userID'];
                }

                if ($each['deliveryID']) {
                    $aggregateDeliveries[] = $each['deliveryID'];
                }

                if (!isset($addresses[$each['orderID']])) {
                    $addresses[$each['orderID']] = array();
                }

                if (intval($each['joined']) === 1 && isset($aggregateJoined[$each['orderID']])) {

                    $each['deliveryPrice'] = $this->UserDeliveryPrice->getByJoinDelivery(
                        $each['deliveryID'],
                        $aggregateJoined[$each['orderID']]['aggregateProducts']
                    );

                    $each['deliveryPrice']['price'] = $this->Price->getPriceToView($each['deliveryPrice']['price']);
                    $each['deliveryPrice']['grossPrice'] = $this->Price->getPriceToView($each['deliveryPrice']['grossPrice']);

                } else if ($each['volume'] > 0 && $each['deliveryID'] > 0) {

                    $each['deliveryPrice'] = $this->UserDeliveryPrice->getByOrderAddress(
                        $each['volume'],
                        $each['deliveryID'],
                        $each['productID']
                    );

                    if ($each['deliveryPrice'] && array_key_exists('price', $each['deliveryPrice'])) {
                        $each['deliveryPrice']['price'] = $this->Price->getPriceToView($each['deliveryPrice']['price']);
                    }
                    if ($each['deliveryPrice'] && array_key_exists('grossPrice', $each['deliveryPrice'])) {
                        $each['deliveryPrice']['grossPrice'] = $this->Price->getPriceToView($each['deliveryPrice']['grossPrice']);
                    }

                }

                $addresses[$each['orderID']][] = $each;
            }
        }

        if ($addresses) {
            $aggregateSenders = array_filter($aggregateSenders);
            $addressSenders = $this->Address->getDefaultByList($aggregateSenders, 1);

            $deliveries = $this->Delivery->customGetByList($aggregateDeliveries);

            $modules = $this->DeliveryAssistant->getModules();

            foreach ($deliveries as $key => $oneDelivery) {
                if (isset($modules[$oneDelivery['courierID']])) {
                    $deliveries[$key]['module'] = $modules[$oneDelivery['courierID']];
                }
            }

            foreach ($addresses as $orderID => $orderAddress) {
                foreach ($orderAddress as $keyAddress => $address) {
                    if ($address['senderID'] == 2 && isset($addressSenders[$address['userID']])) {
                        $addresses[$orderID][$keyAddress]['sender'] = $addressSenders[$address['userID']];
                    }
                    $addresses[$orderID][$keyAddress]['delivery'] = $deliveries[$address['deliveryID']];

                    if (array_key_exists('collectionPointID', $address) && $address['collectionPointID'] > 0) {
                        $addresses[$orderID][$keyAddress]['collectionPoint'] =
                            $this->selectCollectionPoint(
                                $deliveries[$address['deliveryID']]['module']['collectionPoints'],
                                $address['collectionPointID']
                            );
                    }

                }
            }

        }

        $deliveryIndexes = array();
        $products = array();
        $aggregateProducts = array();

        foreach ($res as $key => $each) {
            if (!isset($products[$each['orderID']])) {
                $products[$each['orderID']] = array();
            }

            $deliveryPrices = $this->UserDeliveryPrice->get('calcID', $each['calcID'], true);

            $deliveryPrice = 0;
            $deliveryPriceGross = 0;
            if (!empty($deliveryPrices)) {
                foreach ($deliveryPrices as $dp) {
                    if ($dp['active'] == 0) {
                        continue;
                    }
                    $actDeliveryPrice = $this->BasePrice->get('ID', $dp['priceID']);
                    $deliveryPrice += $actDeliveryPrice['price'];
                    $deliveryPriceGross += $actDeliveryPrice['grossPrice'];
                }
            }

            $each['deliveryJoined'] = false;
            if (array_key_exists($each['orderID'], $addresses)) {
                $each['deliveryJoined'] = $this->searchJoinedAddress($addresses[$each['orderID']], $each['productID']);
            }

            if (!isset($deliveryIndexes[$each['orderID']][$each['deliveryJoined']]) && $each['deliveryJoined'] > 0) {
                $deliveryIndexes[$each['orderID']][$each['deliveryJoined']] = count($deliveryIndexes[$each['orderID']]) + 1;
            }
            if ($each['deliveryJoined'] > 0) {
                $each['deliveryJoinedIndex'] = $deliveryIndexes[$each['orderID']][$each['deliveryJoined']];
            }

            $each['deliveryPrice'] = $deliveryPrice;
            $each['deliveryPriceGross'] = $deliveryPriceGross;

            $products[$each['orderID']][] = $each;

            $aggregateProducts[] = $each['productID'];
        }

        $orderCoupons = $this->CouponOrder->getByProducts($aggregateProducts);

        $currencyCode = DEFAULT_CURRENCY;

        $reclamations = $this->Reclamation->getByOrderList($orderIDs);

        $allStatuses = $this->OrderStatus->getAll();

        $sortedStatuses = array();
        if ($allStatuses) {
            foreach ($allStatuses as $status) {
                $sortedStatuses[$status['ID']] = $status;
            }
        }

        foreach ($list as $key => $each) {

            $sumPrice = 0;
            $sumPriceGross = 0;
            $totalPrice = 0;
            $totalPriceGross = 0;
            $totalDeliveryPrice = 0;
            $totalDeliveryPriceGross = 0;

            if (array_key_exists($each['ID'], $products)) {
                foreach ($products[$each['ID']] as $pKey => $pValue) {

                    $sumPrice += $pValue['price'];
                    $sumPriceGross += $pValue['grossPrice'];
                    $currencyCode = $pValue['currency'];

                    $totalPrice += ($pValue['price'] + $pValue['deliveryPrice']);
                    $totalPriceGross += ($pValue['grossPrice'] + $pValue['deliveryPriceGross']);

                    $totalDeliveryPrice += $pValue['deliveryPrice'];
                    $totalDeliveryPriceGross += $pValue['deliveryPriceGross'];

                    $products[$each['ID']][$pKey]['deliveryPrice'] = $this->Price->getPriceToView($pValue['deliveryPrice']);
                    $products[$each['ID']][$pKey]['deliveryPriceGross'] = $this->Price->getPriceToView($pValue['deliveryPriceGross']);
                    $products[$each['ID']][$pKey]['price'] = $this->Price->getPriceToView($pValue['price']);
                    $products[$each['ID']][$pKey]['grossPrice'] = $this->Price->getPriceToView($pValue['grossPrice']);
                    if ($orderCoupons && array_key_exists($pValue['productID'], $orderCoupons)
                        && is_array($orderCoupons[$pValue['productID']])) {
                        $products[$each['ID']][$pKey]['coupon'] = current($orderCoupons[$pValue['productID']]);
                    } else {
                        $products[$each['ID']][$pKey]['coupon'] = NULL;
                    }

                }
            }

            $list[$key]['sumPrice'] = $this->Price->getPriceToView($sumPrice);
            $list[$key]['sumGrossPrice'] = $this->Price->getPriceToView($sumPriceGross);
            $list[$key]['totalPrice'] = $this->Price->getPriceToView($totalPrice);
            $list[$key]['totalPriceGross'] = $this->Price->getPriceToView($totalPriceGross);
            $list[$key]['totalDeliveryPrice'] = $this->Price->getPriceToView($totalDeliveryPrice);
            $list[$key]['totalDeliveryPriceGross'] = $this->Price->getPriceToView($totalDeliveryPriceGross);

            $currencyRootEntity = $this->CurrencyRoot->get('code', $currencyCode);
            $list[$key]['currency'] = $currencyCode;
            $list[$key]['currencySymbol'] = $currencyRootEntity['symbol'];

            $list[$key]['products'] = NULL;
            if (array_key_exists($each['ID'], $products)) {
                $list[$key]['products'] = $products[$each['ID']];
            }

            if (isset($addresses[$each['ID']])) {
                $list[$key]['addresses'] = $addresses[$each['ID']];
            }
            if (isset($invoiceAddress[$each['ID']])) {
                $list[$key]['invoiceAddress'] = $invoiceAddress[$each['ID']];
            }
            if ($each['paymentID'] > 0) {
                $list[$key]['payment'] = $payments[$each['paymentID']];
            }

            if (array_key_exists($each['ID'], $reclamations) && $reclamations[$each['ID']]) {
                $list[$key]['reclamation'] = $reclamations[$each['ID']];
            } else {
                $list[$key]['reclamation'] = NULL;
            }

            if (isset($unreadMessages[$each['ID']])) {
                $list[$key]['unreadMessages'] = $unreadMessages[$each['ID']];
            }

            if (isset($sortedStatuses[$each['status']])) {
                $list[$key]['status'] = $sortedStatuses[$each['status']];
            }
        }

        return $list;
    }

    /**
     * @param $params
     * @return array|bool
     */
    public function myZoneOffers($params)
    {
        $user = $this->Auth->getLoggedUser();

        if (!$user) {
            return array('response' => false);
        }

        $params['userID'] = $user['ID'];

        $limit = 30;
        if (isset($params['limit'])) {
            $limit = $params['limit'];
        }
        $offset = 0;
        if (isset($params['offset'])) {
            $offset = $params['offset'];
        }

        $sortBy[0] = '-ID';
        if (isset($params['sort'])) {
            $sortBy = explode('|', $params['sort']);
        }

        $configs = $this->getConfigs();

        $filters = $this->Filter->prepare($configs, $params);
        $list = $this->DpOrder->getList($filters, $offset, $limit, $sortBy);

        $orderIDs = array();
        $paymentArr = array();
        foreach ($list as $key => $value) {
            $orderIDs[] = $value['ID'];
            if (isset($value['paymentID']) && $value['paymentID'] > 0) {
                $paymentArr[] = $value['paymentID'];
            }
        }

        $payments = $this->Payment->getByList($paymentArr);

        $res = $this->DpProduct->getOrdersProducts($orderIDs);

        $unreadMessages = $this->OrderMessage->countUnread($orderIDs, 1);

        $calcs = array();
        if (!empty($res)) {
            foreach ($res as $pKey => $prod) {
                $calcs[] = $prod['ID'];
                $languages = $this->PrintShopTypeLanguage->get('typeID', $prod['typeID'], true);
                if ($languages) {
                    foreach ($languages as $language) {
                        $res[$pKey]['names'][$language['lang']] = $language['name'];
                    }
                }
            }
        }

        foreach ($res as $pKey => $product) {
            $complex = $this->PrintShopComplex->getBase($product['typeID']);
            $res[$pKey]['complex'] = false;
            if ($complex) {
                $res[$pKey]['complex'] = true;
                $baseType = $this->PrintShopType->get('ID', $product['typeID']);
                $res[$pKey]['skipUpload'] = $baseType['skipUpload'];
            }
        }

        $res = $this->Calculation->getMyZoneData($res);

        $products = array();
        $aggregateProducts = array();
        foreach ($res as $key => $each) {
            if (!isset($products[$each['orderID']])) {
                $products[$each['orderID']] = array();
            }

            $products[$each['orderID']][] = $each;

            $aggregateProducts[] = $each['productID'];
        }

        $files = $this->DpProductFile->getByList($aggregateProducts);
        $files = $this->prepareProductFiles($files);

        $this->Setting->setModule('general');
        $this->Setting->setLang(NULL);
        $defaultCurrencyID = $this->Setting->getValue('defaultCurrency');
        $defaultCurrencyEntity = $this->Currency->getOne($defaultCurrencyID);
        $defaultCurrencyCode = $defaultCurrencyEntity['code'];
        $currencyRootEntity = $this->CurrencyRoot->get('code', $defaultCurrencyCode);
        $currencyCode = $defaultCurrencyCode;

        foreach ($list as $key => $each) {

            $sumPrice = 0;
            $sumPriceGross = 0;
            $totalPrice = 0;
            $totalPriceGross = 0;

            foreach ($products[$each['ID']] as $pKey => $pValue) {

                $sumPrice += $pValue['price'];
                $sumPriceGross += $pValue['grossPrice'];
                $currencyCode = $pValue['currency'];

                $totalPrice += $pValue['price'];
                $totalPriceGross += $pValue['grossPrice'];

                if (array_key_exists('deliveryPrice', $pValue)) {
                    $products[$each['ID']][$pKey]['deliveryPrice'] = $this->Price->getPriceToView($pValue['deliveryPrice']);
                }
                if (array_key_exists('deliveryPriceGross', $pValue)) {
                    $products[$each['ID']][$pKey]['deliveryPriceGross'] = $this->Price->getPriceToView($pValue['deliveryPriceGross']);
                }

                $products[$each['ID']][$pKey]['price'] = $this->Price->getPriceToView($pValue['price']);
                $products[$each['ID']][$pKey]['grossPrice'] = $this->Price->getPriceToView($pValue['grossPrice']);
                $products[$each['ID']][$pKey]['addresses'][] = array(
                    'index' => 0
                );

                $products[$each['ID']][$pKey]['fileList'] = array();
                if (array_key_exists($products[$each['ID']][$pKey]['productID'], $files)) {
                    $products[$each['ID']][$pKey]['fileList'] = $files[$products[$each['ID']][$pKey]['productID']];
                }

            }

            $list[$key]['sumPrice'] = $this->Price->getPriceToView($sumPrice);
            $list[$key]['sumGrossPrice'] = $this->Price->getPriceToView($sumPriceGross);
            $list[$key]['totalPrice'] = $this->Price->getPriceToView($totalPrice);
            $list[$key]['totalPriceGross'] = $this->Price->getPriceToView($totalPriceGross);

            if ($defaultCurrencyCode != $currencyCode) {
                $currencyRootEntity = $this->CurrencyRoot->get('code', $currencyCode);
                $list[$key]['currency'] = $currencyCode;
                $list[$key]['currencySymbol'] = $currencyRootEntity['symbol'];
            } else {
                $list[$key]['currency'] = $defaultCurrencyCode;
                $list[$key]['currencySymbol'] = $currencyRootEntity['symbol'];
            }

            $list[$key]['products'] = $products[$each['ID']];

            $list[$key]['unreadMessages'] = 0;
            if (array_key_exists($each['ID'], $unreadMessages)) {
                $list[$key]['unreadMessages'] = $unreadMessages[$each['ID']];
            }

            if ($each['paymentID'] > 0) {
                $list[$key]['payment'] = $payments[$each['paymentID']];
            }
        }

        return $list;
    }

    /**
     * @return array
     */
    public function post_rejectOffer()
    {
        $post = $this->Data->getAllPost();

        $orderID = $post['orderID'];

        $order = $this->DpOrder->get('ID', $orderID);

        $response = false;

        if ($orderID && $order) {

            if ($this->DpOrder->update($orderID, 'offerStatus', -1)) {
                $response = true;
            }

        }

        return array(
            'response' => $response
        );
    }

    /**
     * @return array
     * @throws Exception
     */
    public function post_acceptOffer()
    {
        $post = $this->Data->getAllPost();

        $orderID = $post['orderID'];
        $products = $post['products'];

        if (!$products) {
            return $this->sendFailResponse('01');
        }

        $user = $this->Auth->getLoggedUser();

        if (!$user) {
            return $this->sendFailResponse('12');
        }

        $order = $this->DpOrder->get('ID', $orderID);

        if ($order['expires'] <= date('Y-m-d H:i:s')) {
            return $this->sendFailResponse('20', 'offer_date_expires');
        }

        $payment = array();

        $paymentMethod = $this->Payment->get('ID', $post['paymentID']);
        $paymentModule = $this->Module->get('ID', $paymentMethod['componentID']);

        $deferredPayment = $this->checkDeferredPayment($paymentModule, $user, $orderID);

        if ($deferredPayment['response'] === false) {
            return $deferredPayment;
        }

        $createdJoins = 0;
        $savedDeliveryPrices = 0;
        $createdAddressProducts = 0;

        foreach ($products as $product) {

            if (!$product['addresses']) {
                continue;
            }

            foreach ($product['addresses'] as $address) {
                $params = array();
                $params['orderID'] = $orderID;
                $copiedID = $this->Address->copy($address['addressID']);
                $params['senderID'] = $address['senderID'];
                $params['addressID'] = $copiedID;

                $params['deliveryID'] = $address['deliveryID'];
                if ($address['commonDeliveryID']) {
                    $params['deliveryID'] = $address['commonDeliveryID'];
                }

                if ($address['commonDeliveryID'] && $address['join'] == true) {
                    $params['joined'] = 1;
                }

                $params['type'] = 1;

                $lastID = $this->DpOrderAddress->create($params);
                if ($lastID > 0) {
                    $params = array();
                    $params['orderAddressID'] = $lastID;
                    $params['productID'] = $product['productID'];
                    if (!empty($address['allVolume'])) {
                        $params['volume'] = $address['allVolume'];
                    }
                    $added = $this->DpOrderAddressProduct->create($params);
                    if (!$added) {
                        $createdAddressProducts++;
                    }
                }
                $createdJoins++;
                unset($lastID);
            }

            $calculation = $this->UserCalc->getOne($product['calcID']);
            $calculation['price'] = $this->BasePrice->get('ID', $calculation['priceID']);

            foreach ($product['addresses'] as $address) {

                $deliveryPrice = $this->CalcDelivery->countDeliveryPrice(
                    $address['deliveryID'],
                    $address['allVolume'],
                    $calculation['volume'],
                    $calculation['weight'],
                    $calculation['amount'],
                    $calculation
                );

                $currencyEntity = $this->Currency->getByCode($calculation['price']['currency']);

                $params = array();
                $params['priceID'] = $this->Price->setBasePrice(
                    $deliveryPrice['price'],
                    $deliveryPrice['taxID'],
                    $currencyEntity
                );
                $params['calcID'] = $product['calcID'];
                $params['joined'] = intval($address['joined']);
                $params['active'] = 1;
                $params['productID'] = $product['productID'];
                $params['volume'] = $address['allVolume'];
                $params['deliveryID'] = $address['deliveryID'];
                $lastDeliveryPriceID = $this->UserDeliveryPrice->create($params);
                if ($lastDeliveryPriceID > 0) {
                    $savedDeliveryPrices++;
                }
            }

        }

        if ($orderID) {

            $products = $this->DpProduct->getOrdersProducts(array($orderID));

            $aggregateCalculations = array();
            foreach ($products as $product) {
                $aggregateCalculations[] = $product['calcID'];
            }

            $unusedPrices = $this->UserDeliveryPrice->getByCalcList($aggregateCalculations, NULL, 0);
            foreach ($unusedPrices as $price) {
                $this->UserDeliveryPrice->delete('ID', $price['ID']);
            }

            try {
                $totalPriceResult = $this->getTotalPrice($products);
                $totalPrice = $totalPriceResult['totalPrice'];
                $deliveryPriceGross = $this->getDeliveryPrice($products, true);
            } catch (Exception $e) {
                $this->debug($e->getMessage());
            }

            if ($paymentMethod) {

                if ($paymentMethod['sellerID'] > 0) {
                    $this->DpOrder->update($orderID, 'sellerID', $paymentMethod['sellerID']);
                }

                switch ($paymentModule['key']) {
                    case PAYU_NAME_IN_MODULES:

                        $data['products'] = $this->getProductsForPayment($products);
                        $data['products'][] = array(
                            'name' => 'delivery',
                            'unitPrice' => $deliveryPriceGross,
                            'quantity' => 1
                        );
                        $data['totalAmount'] = ($totalPrice + $deliveryPriceGross);
                        $data['currencyCode'] = $this->getOrderCurrency();
                        $data['extOrderId'] = $data['orderID'] = $orderID;
                        $data['buyer'] = array(
                            'email' => $user['login'],
                            'firstName' => $user['firstname'],
                            'lastName' => $user['lastname'],
                        );
                        try {
                            $payment = $this->PayU->doPayment($data);
                        } catch (Exception $e) {
                            $this->debug($e->getMessage());
                        }


                        if (strlen($payment->orderId) > 0) {
                            $this->DpOrder->update($orderID, 'paymentOrderID', $payment->orderId);
                        }

                        if ($payment) {
                            $payment = json_decode(json_encode($payment), true);
                            $payment['operator'] = PAYU_NAME_IN_MODULES;
                        }

                        break;
                    case TINKOFF_NAME_IN_MODULES:

                        $payment = $this->tinkoffPayment($orderID, $user, $products, $totalPrice, $deliveryPriceGross);

                        break;
                    default:

                        break;
                }
            }

            $this->DpOrder->update($orderID, 'isOffer', 0);
            $this->DpOrder->update($orderID, 'isOrder', 1);
            $this->DpOrder->update($orderID, 'production', 1);
            $this->DpOrder->update($orderID, 'ready', 1);
            $this->DpOrder->update($orderID, 'offerStatus', 2);

            $this->DpOrder->update($orderID, 'status', $this->OrderStatus->getFirstStatus());

        }

        return array(
            'response' => true,
            'savedDeliveryPrices' => $savedDeliveryPrices,
            'createdAddressProducts' => $createdAddressProducts,
            'createdJoins' => $createdJoins,
            'payment' => $payment
        );
    }

    /**
     * @param $productFiles
     * @return array
     */
    private function prepareProductFiles($productFiles)
    {
        if (empty($productFiles)) {
            return array();
        } else {

            $allowedThumbExtension = explode(',', THUMB_IMAGE_ALLOWED_EXTENSION);

            foreach ($productFiles as $productID => $files) {

                foreach ($files as $fileKey => $file) {

                    $explodeName = explode('.', $file['name']);
                    $ext = end($explodeName);

                    $minImageName = false;

                    if ($ext == THUMB_PDF_ALLOWED_EXTENSION) {
                        array_pop($explodeName);
                        $minImageName = implode('.', $explodeName) . '.jpg';
                    } else if (in_array($ext, $allowedThumbExtension)) {
                        $minImageName = $file['name'];
                    }

                    $date = date('Y-m-d', strtotime($file['created']));

                    $productFiles[$productID][$fileKey]['size'] = filesize(MAIN_UPLOAD . companyID . '/' . '/' .
                        'productFiles/' . $date . '/' . $file['folder'] . '/' . $file['productID'] . '/' .
                        $file['ID'] . '/' . $file['name']);

                    $productFiles[$productID][$fileKey]['url'] = STATIC_URL . companyID . '/' . 'productFiles/' .
                        $date . '/' . $file['folder'] . '/' . $file['productID'] . '/' . $file['ID'] . '/' .
                        $file['name'];

                    if ($minImageName) {
                        $productFiles[$productID][$fileKey]['minUrl'] = STATIC_URL . companyID . '/' . 'productFiles/' . $date . '/' . $file['folder'] . '/' . $file['productID'] . '/' . $file['ID'] . '/' . THUMB_IMAGE_PREFIX . $minImageName;
                    } else {
                        $productFiles[$productID][$fileKey]['minUrl'] = STATIC_URL . companyID . '/' . 'images' . '/' . THUMB_IMAGE_DEFAULT;
                    }
                }
            }

        }

        return $productFiles;
    }

    /**
     * @param $addresses
     * @param $productID
     * @return bool
     */
    private function searchJoinedAddress($addresses, $productID)
    {

        foreach ($addresses as $address) {
            if ($address['joined'] == 1 && $address['separateProducts'] && count($address['separateProducts']) == 1) {
                if ($address['separateProducts'][0]['productID'] == $productID) {
                    return $address['copyFromID'];
                }
            }
        }

        return false;
    }

    /**
     * @param $params
     * @return mixed
     */
    public function myZoneCount($params)
    {

        $user = $this->Auth->getLoggedUser();

        if (!$user) {
            return array('response' => false);
        }

        $params['userID'] = $user['ID'];

        $configs = $this->getConfigs();

        $filters = $this->Filter->prepare($configs, $params);

        $count = $this->DpOrder->count($filters);
        return array('count' => $count);
    }

    /**
     * @param null $params
     * @return array
     */
    public function count($params = NULL)
    {
        $loggedUser = $this->Auth->getLoggedUser();

        if ($loggedUser && $this->Acl->isSeller($loggedUser) && !$this->Acl->isSuperUser($loggedUser)) {
            $params['sellerID'] = $loggedUser['ID'];
        }

        if (array_key_exists('customProductExist', $params) && $params['customProductExist'] == 0) {
            unset($params['customProductExist']);
        }

        $configs = $this->getConfigs();

        $filters = $this->Filter->prepare($configs, $params);

        $count = $this->DpOrder->count($filters);
        return array('count' => $count);
    }

    /**
     * @param $id
     * @return array
     */
    public function put_index($id)
    {
        if (!$id) {
            $result = $this->sendFailResponse('04');
            return $result;
        }
        $post = $this->Data->getAllPost();
        $post['modified'] = date('Y-m-d H:i:s');

        $goodKeys = array('paid', 'production', 'isOrder', 'isOffer', 'expires', 'ready', 'userID', 'sellerID', 'modified');

        $result = array();

        foreach ($post as $key => $p) {
            if (!in_array($key, $goodKeys)) {
                unset($post[$key]);
            }
            if ($key === 'paid' && $p == true) {
                $proformaInvoice = $this->DpInvoice->getOne($id, PROFORMA_INVOICE_TYPE);
                if ($proformaInvoice) {
                    $this->DpInvoice->update($proformaInvoice['ID'], 'paymentDate', date('Y-m-d'));
                }
                $vatInvoice = $this->DpInvoice->getOne($id, VAT_INVOICE_TYPE);
                if ($vatInvoice) {
                    $this->DpInvoice->update($vatInvoice['ID'], 'paymentDate', date('Y-m-d'));
                }
            }
        }
        $result['response'] = $this->DpOrder->updateAll($id, $post);
        return $result;
    }

    /**
     * @param $params
     * @return array|bool
     */
    public function offerList($params)
    {
        $user = $this->Auth->getLoggedUser();
        if (!$user) {
            return array('response' => 'false');
        }
        if ($this->Acl->isAdmin($user)) {

        } elseif ($this->Acl->isSeller($user)) {
            $params['sellerID'] = $user['ID'];
        } else {
            $params['userID'] = $user['ID'];
        }
        $params['ready'] = 1;
        $params['isOffer'] = 1;
        $params['isOrder'] = 0;
        return $this->index($params);
    }

    /**
     * @param $params
     * @return array
     */
    public function offerListCount($params)
    {
        $user = $this->Auth->getLoggedUser();
        if (!$user) {
            return array('response' => 'false');
        }
        if ($this->Acl->isAdmin($user)) {

        } elseif ($this->Acl->isSeller($user)) {
            $params['sellerID'] = $user['ID'];
        } else {
            $params['userID'] = $user['ID'];
        }
        $params['ready'] = 1;
        $params['isOffer'] = 1;
        $params['isOrder'] = 0;

        return $this->count($params);
    }

    /**
     * @param $params
     * @return array|bool
     */
    public function orderList($params)
    {
        $user = $this->Auth->getLoggedUser();
        if (!$user) {
            return array('response' => 'false');
        }
        if ($this->Acl->isAdmin($user)) {

        } elseif ($this->Acl->isSeller($user)) {
            $params['sellerID'] = $user['ID'];
        } else {
            $params['userID'] = $user['ID'];
        }
        $params['isOrder'] = 1;
        return $this->index($params);
    }

    /**
     * @param $params
     * @return array
     */
    public function orderListCount($params)
    {
        $user = $this->Auth->getLoggedUser();
        if (!$user) {
            return array('response' => 'false');
        }
        if ($this->Acl->isAdmin($user)) {

        } elseif ($this->Acl->isSeller($user)) {
            $params['sellerID'] = $user['ID'];
        } else {
            $params['userID'] = $user['ID'];
        }
        $params['isOrder'] = 1;
        return $this->count($params);
    }

    /**
     * @param $orderID
     * @return array
     * @throws LoaderError
     * @throws RuntimeError
     * @throws SyntaxError
     */
    public function post_saveOffer($orderID)
    {
        if (!$orderID) {
            $result = $this->sendFailResponse('04');
            return $result;
        }
        $result = array();

        $orderMessage = $this->Data->getPost('orderMessage');

        $expires = $this->Data->getPost('expires');
        if ($expires) {
            $expires = date('Y-m-d H:i:s', $expires);
        }
        $modified = date('Y-m-d H:i:s');
        $userID = $this->Data->getPost('userID');

        $user = $this->User->getUserByID($userID);

        if ($user['super'] == 1) {
            return $this->sendFailResponse('11');
        }

        if ($user['domainID']) {
            $domainID = $user['domainID'];
        } else {
            $domainID = $this->getDomainID();
        }

        if (empty($domainID)) {
            $domainID = parent::getDomainID();
        }
        $ready = 1;
        $isOffer = 1;
        $isOrder = 0;

        $params = compact(
            'expires',
            'isOrder',
            'isOffer',
            'userID',
            'ready',
            'modified',
            'domainID'
        );

        $result['response'] = $this->DpOrder->updateAll($orderID, $params);

        if ($result['response'] === true && $this->Data->getPost('sendInfoToUser')) {

            $order = $this->DpOrder->get('ID', $orderID);

            $user = $this->User->get('ID', $order['userID']);

            $products = $this->DpProduct->getOrdersProducts(array($orderID));
            $products = $this->Calculation->getCalcData($products);

            $templateID = 105;
            $templateName = 'products-list-mail';

            $templateSetting = $this->TemplateSetting->getOne($templateID, 1);

            $templatePath = 'default/' . $templateID . '/' . $templateName . '.html';

            if ($templateSetting && $templateSetting['source'] == 1) {
                $templatePath = companyID . '/' . $templateID . '/' . $templateName . '.html';
            } elseif ($templateSetting && $templateSetting['source'] == 2) {
                $templatePath = companyID . '/' . $templateID . '/' . $this->getDomainID() . '/' . $templateName . '.html';
            }

            $loader = new FilesystemLoader(STATIC_PATH . 'templates');
            $twig = new Twig_Environment($loader, array());
            $twig->addExtension(new TranslateExtension());
            $template = $twig->load($templatePath);

            $productsContent = $template->render(
                array(
                    'products' => $products,
                    'lang' => lang
                )
            );

            $sumPrice = 0;
            $sumGrossPrice = 0;
            $currency = DEFAULT_CURRENCY;
            foreach ($products as $attributes) {
                $sumPrice += $this->Price->getPriceToDb($attributes['price']);
                $sumGrossPrice += $this->Price->getPriceToDb($attributes['grossPrice']);
                $currency = $attributes['currency'];
            }

            $order['sumPrice'] = $this->Price->getPriceToView($sumPrice);
            $order['sumGrossPrice'] = $this->Price->getPriceToView($sumGrossPrice);
            $order['currency'] = $currency;

            $lang = $this->prepareUserLanguage($user['ID']);

            $myZoneOffersUrl = $this->RouteAssistant->getStateUrl('client-zone-offers', $lang);
            $myZoneOffersUrl = str_replace(':offerID', $order['ID'], $myZoneOffersUrl);

            if (filter_var($user['user'], FILTER_VALIDATE_EMAIL) !== false) {
                $this->Mail->setBind('created', $order['created']);
                $this->Mail->setBind('expires_date', $order['expires']);
                $this->Mail->setBind('price', $order['sumPrice']);
                $this->Mail->setBind('grossPrice', $order['sumGrossPrice']);
                $this->Mail->setBind('currency', $order['currency']);
                $this->Mail->setBind('username', $user['name']);
                $this->Mail->setBind('products', $productsContent);
                $this->Mail->setBind('offers_url', $myZoneOffersUrl);
                $this->Mail->setBind('offer_message', $orderMessage);

                $result['mailSent'] = $this->Mail->sendMail($user['user'], $user['name'], 'offer', $lang);
            } else {
                $this->debug('Problem with email: ' . $user['user']);
            }
        }

        if ($orderMessage) {

            $loggedUser = $this->Auth->getLoggedUser();

            $lastOrderMessage = $this->OrderMessage->getOne($orderID);

            $messageParams['senderID'] = $loggedUser['ID'];
            $messageParams['orderID'] = $orderID;
            $messageParams['isFirst'] = 0;
            if (!$lastOrderMessage) {
                $messageParams['isFirst'] = 1;
            }
            $messageParams['created'] = date('Y-m-d H:i:s');
            $messageParams['content'] = $orderMessage;
            $messageParams['isAdmin'] = 0;

            $messageID = $this->OrderMessage->create($messageParams);
            if ($messageID > 0) {
                $result['messageSaved'] = true;
            }
        }

        return $result;
    }

    /**
     * @return array|bool
     */
    public function sellerNotReady($params)
    {
        $type = 'order';
        if (array_key_exists('type', $params)) {
            $type = $params['type'];
        }

        $user = $this->Auth->getLoggedUser();
        if (!$user) {
            return false;
        }
        $sellerID = $user['ID'];

        $result = $this->DpOrder->getAllForSeller($sellerID, 0, $type);
        if (empty($result)) {
            return array();
        }
        $orderIDs = array();
        $aggregateUsers = array();
        foreach ($result as $key => $value) {
            $orderIDs[] = $value['ID'];
            if (intval($value['userID']) > 0) {
                $aggregateUsers[] = $value['userID'];
            }
        }

        $res = $this->DpProduct->getOrdersProducts($orderIDs);
        $res = $this->Calculation->getCalcData($res);
        $users = $this->User->getByList($aggregateUsers);

        $products = array();
        foreach ($res as $each) {
            if (!isset($products[$each['orderID']])) {
                $products[$each['orderID']] = array();
            }
            $products[$each['orderID']][] = $each;
        }

        foreach ($result as $key => $each) {
            $result[$key]['products'] = $products[$each['ID']];
            if (intval($each['userID']) > 0) {
                $result[$key]['user'] = $users[$each['userID']];
            }
        }

        return $result;
    }

    /**
     * @return array
     */
    public function isAdmin()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->isAdmin($user));
    }

    /**
     * @return array
     */
    public function isSeller()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->isSeller($user));
    }

    /**
     * @return array
     */
    public function isBok()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->isBok($user));
    }

    public function canEditPrice()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->canEditPrice($user));
    }

    /**
     * @param $orderID
     * @return array
     * @throws Exception
     */
    public function post_order($orderID)
    {

        if (!$orderID) {
            $orderID = $this->Data->getPost('orderID');
        }

        $post = $this->Data->getAllPost();

        $sendMailToUser = $this->Data->getPost('sendMailToUser');

        $orderAddresses = $this->Data->getPost('orderAddresses');
        if (!is_array($orderAddresses)) {
            $orderAddresses = json_decode($orderAddresses);
        }
        $invoiceAddressID = $this->Data->getPost('invoiceAddressID');

        $response = false;

        $products = $this->DpProduct->getOrdersProducts(array($orderID));
        $volumeArr = array();
        if (!empty($products)) {
            foreach ($products as $p) {
                $volumeArr[$p['ID']] = intval($p['volume']);
            }
        }

        $allProducts = true;

        if (!$allProducts && array_sum($volumeArr) != 0) {
            return array('response' => $response, 'products' => $products, 'warning' => $volumeArr);
        }

        $one = $this->DpOrder->get('ID', $orderID);
        if ($one['production']) {
            return array(
                'response' => false,
                'info' => 'Order is already in production'
            );
        }

        $now = date('Y-m-d H:i:s');

        $user = $this->User->get('ID', $one['userID']);

        if ($one) {
            if ($this->DpOrder->update($orderID, 'production', 1) && $this->DpOrder->update($orderID, 'isOrder', 1)
                && $this->DpOrder->update($orderID, 'modified', $now)) {

                $this->DpOrder->update($orderID, 'status', $this->OrderStatus->getFirstStatus());

                $response = true;
            }

            if (intval($post['paymentID']) > 0) {
                $this->DpOrder->update($orderID, 'paymentID', $post['paymentID']);
            }

            $createdJoins = 0;

            $orderAddresses = $post['addresses'];

            $savedDeliveryPrices = 0;

            if (!empty($orderAddresses)) {

                foreach ($orderAddresses as $calcID => $productAddresses) {

                    foreach ($productAddresses as $address) {
                        $params = array();
                        $params['orderID'] = $orderID;
                        $copiedID = $this->Address->copy($address['addressID']);
                        $params['senderID'] = $address['senderID'];
                        $params['addressID'] = $copiedID;

                        $params['deliveryID'] = $address['deliveryID'];
                        if ($address['commonDeliveryID']) {
                            $params['deliveryID'] = $address['commonDeliveryID'];
                        }

                        if ($address['commonDeliveryID'] && $address['join'] == true) {
                            $params['joined'] = 1;
                        }

                        $params['type'] = 1;

                        $lastID = $this->DpOrderAddress->create($params);

                        if ($lastID > 0) {
                            $params = array();
                            $params['orderAddressID'] = $lastID;
                            $oneProduct = $this->DpProduct->get('calcID', $calcID);
                            $params['productID'] = $oneProduct['ID'];
                            if (!empty($address['allVolume'])) {
                                $params['volume'] = $address['allVolume'];
                            }
                            $added = $this->DpOrderAddressProduct->create($params);
                            if (!$added) {
                                $response = false;
                            }
                        }
                        $createdJoins++;
                        unset($lastID);
                    }
                }

                foreach ($orderAddresses as $calcID => $productAddresses) {

                    $calculation = $this->UserCalc->getOne($calcID);
                    $calculation['price'] = $this->BasePrice->get('ID', $calculation['priceID']);

                    $product = $this->DpProduct->get('calcID', $calculation['ID']);

                    foreach ($productAddresses as $partAddress) {

                        $deliveryPrice = $this->CalcDelivery->countDeliveryPrice(
                            $partAddress['deliveryID'],
                            $partAddress['allVolume'],
                            $calculation['volume'],
                            $calculation['weight'],
                            $calculation['amount'],
                            $calculation
                        );

                        $currencyEntity = $this->Currency->getByCode($calculation['price']['currency']);

                        $params = array();
                        $params['priceID'] = $this->Price->setBasePrice(
                            $deliveryPrice['price'],
                            $deliveryPrice['taxID'],
                            $currencyEntity
                        );
                        $params['calcID'] = $calcID;
                        $params['joined'] = intval($productAddresses['joined']);
                        $params['active'] = 1;
                        $params['productID'] = $product['ID'];
                        $params['volume'] = $partAddress['volume'];
                        $params['deliveryID'] = $partAddress['deliveryID'];
                        $lastDeliveryPriceID = $this->UserDeliveryPrice->create($params);
                        if ($lastDeliveryPriceID > 0) {
                            $savedDeliveryPrices++;
                        }
                    }
                }

            }

            $copiedInvoiceAddressID = null;
            if ($invoiceAddressID > 0) {
                $copiedInvoiceAddressID = $this->Address->copy($invoiceAddressID);
                $addressParams = array();
                $addressParams['orderID'] = $orderID;
                $addressParams['addressID'] = $copiedInvoiceAddressID;
                $addressParams['type'] = 2;
                $this->DpOrderAddress->create($addressParams);
            }

            $this->Setting->setModule('invoice');
            $this->Setting->setLang(NULL);
            $invoiceOn = $this->Setting->getValue('invoiceOn');

            if ($invoiceOn && $copiedInvoiceAddressID) {
                $typeNumeration = $this->Setting->getValue('numerationInvoices');
                $invoiceParams = array();
                $month = NULL;
                if ($typeNumeration == 1) {
                    $month = date('m');
                }
                $year = date('Y');
                $maxInvoiceID = $this->DpInvoice->getMaxID($year, $month, PROFORMA_INVOICE_TYPE);
                if (!$maxInvoiceID) {
                    $maxInvoiceID = 1;
                } else {
                    $maxInvoiceID++;
                }
                $invoiceParams['invoiceID'] = $maxInvoiceID;
                $invoiceParams['type'] = PROFORMA_INVOICE_TYPE;
                $invoiceParams['documentDate'] = date('Y-m-d');
                $invoiceParams['orderID'] = $orderID;
                $invoiceParams['addressID'] = $copiedInvoiceAddressID;
                $invoiceParams['sellDate'] = date('Y-m-d');
                $this->DpInvoice->create($invoiceParams);
            }
            $this->Setting->setModule('general');

            $errorInfo = '';
            if ($createdJoins == 0) {
                $errorInfo = 'empty_addresses';
            }

        } else {
            return $this->sendFailResponse('06');
        }

        if ($response === true) {

            $this->DpOrder->update($orderID, 'status', $this->OrderStatus->getFirstStatus());

            $this->ProductionPath->doPath(array(
                'itemID' => $orderID,
                'appVersion' => 1
            ));

            if ($sendMailToUser == 1) {

                $deliveryPriceGross = 0;
                $totalPrice = 0;

                $products = $this->DpProduct->getOrdersProducts(array($orderID));

                foreach ($products as $product) {

                    $actCalc = $this->getCalculation($product['calcID']);
                    $actProductPrice = $this->getBasePrice($actCalc['priceID']);

                    $this->setOrderCurrency($actProductPrice['currency']);
                }

                try {
                    $totalPriceResult = $this->getTotalPrice($products);
                    $totalPrice = $totalPriceResult['totalPrice'];
                    $deliveryPriceGross = $this->getDeliveryPrice($products, true);
                } catch (Exception $e) {
                    $this->debug($e->getMessage());
                }

                if (!empty($products)) {
                    foreach ($products as $pKey => $prod) {
                        $languages = $this->PrintShopTypeLanguage->get('typeID', $prod['typeID'], true);
                        if ($languages) {
                            foreach ($languages as $language) {
                                $products[$pKey]['names'][$language['lang']] = $language['name'];
                            }
                        }
                    }
                }

                $products = $this->Calculation->getCalcData($products);

                $templateID = 105;
                $templateName = 'products-list-mail';

                $templateSetting = $this->TemplateSetting->getOne($templateID, 1);

                $templatePath = 'default/' . $templateID . '/' . $templateName . '.html';

                if ($templateSetting && $templateSetting['source'] == 1) {
                    $templatePath = companyID . '/' . $templateID . '/' . $templateName . '.html';
                } elseif ($templateSetting && $templateSetting['source'] == 2) {
                    $templatePath = companyID . '/' . $templateID . '/' . $this->getDomainID() . '/' . $templateName . '.html';
                }

                $loader = new FilesystemLoader(STATIC_PATH . 'templates');
                $twig = new Twig_Environment($loader, array());
                $twig->addExtension(new TranslateExtension());
                $template = $twig->load($templatePath);

                $lang = $this->prepareUserLanguage($user['ID']);

                $productsContent = $template->render(
                    array(
                        'products' => $products,
                        'lang' => $lang
                    )
                );

                $this->Mail->setBind('firstname', $user['firstname']);
                $this->Mail->setBind('order_id', $orderID);
                $this->Mail->setBind('deliveryPrice', $this->Price->getPriceToView($deliveryPriceGross) . ' ' . $this->getOrderCurrency());
                $this->Mail->setBind('price', $this->Price->getPriceToView($totalPrice) . ' ' . $this->getOrderCurrency());
                $this->Mail->setBind('totalPrice', $this->Price->getPriceToView(($deliveryPriceGross + $totalPrice)) . ' ' . $this->getOrderCurrency());
                $this->Mail->setBind('products_list', $productsContent);

                $mailPaymentInfo = $this->PaymentContent->customGet($post['paymentID'], lang);
                if ($mailPaymentInfo) {
                    $this->Mail->setBind('payment_info', $mailPaymentInfo['content']);
                } else {
                    $this->Mail->setBind('payment_info', '');
                }

                $this->Mail->sendMail($user['login'], $user['name'], 'orderConfirm', $lang);

            }

        }

        unset($params);

        return array('response' => $response, 'createdJoins' => $createdJoins, 'errorInfo' => $errorInfo);
    }

    /**
     * @param $orderID
     * @return array
     */
    public function post_placeOrder($orderID)
    {

        if (!$orderID) {
            $orderID = $this->Data->getPost('orderID');
        }

        $response = false;

        $one = $this->DpOrder->get('ID', $orderID);
        if ($one['production']) {
            return array(
                'response' => false,
                'info' => 'Order is already in production'
            );
        }

        $now = date('Y-m-d H:i:s');

        $userID = $this->Data->getPost('userID');

        if (!$userID) {
            return array(
                'response' => false,
                'info' => 'Order need user to be ready to production.'
            );
        }

        if ($one) {
            if ($this->DpOrder->update($orderID, 'production', 1) && $this->DpOrder->update($orderID, 'isOrder', 1) && $this->DpOrder->update($orderID, 'modified', $now) && $this->DpOrder->update($orderID, 'userID', $userID) && $this->DpOrder->update($orderID, 'ready', 1)
            ) {
                $response = true;
            }
        } else {
            return $this->sendFailResponse('06');
        }


        $createdJoins = 0;

        return array('response' => $response, 'createdJoins' => $createdJoins);
    }

    /**
     * @return mixed
     */
    public function patch_updateAddress()
    {

        $post = $this->Data->getAllPost();

        if (!isset($post['orderAddresses']) || empty($post['orderAddresses'])) {
            return $this->sendFailResponse('02');
        }

        $orderID = $post['orderID'];

        if (!$orderID) {
            return $this->sendFailResponse('02');
        }

        $products = $this->DpProduct->getOrdersProducts(array($orderID));
        $productArr = array();
        foreach ($products as $key => $value) {
            $productArr[$value['ID']]['volume'] = $value['volume'];
        }

        $addresses = $this->DpOrderAddress->getOrdersAddresses(array($orderID), 1);

        foreach ($addresses as $a) {
            foreach ($a['products'] as $p) {
                $this->DpOrderAddressProduct->delete('ID', $p['ID']);
            }
        }

        $this->DpOrderAddress->deleteByOrder($orderID);

        $savedAddress = 0;
        $savedProductAddress = 0;
        $newAddresses = array();
        foreach ($post['orderAddresses'] as $oa) {

            $copiedID = $this->Address->copy($oa['addressID']);

            $this->Address->delete('ID', $oa['copyFromID']);

            $newAddress = $this->Address->get('ID', $copiedID);

            $params['orderID'] = $orderID;
            $params['addressID'] = $copiedID;
            $params['deliveryID'] = $newAddress['deliveryID'] = $oa['deliveryID'];

            $params['type'] = 1;
            $lastID = $this->DpOrderAddress->create($params);
            unset($params);
            if ($lastID > 0) {
                $savedAddress++;
                if (!empty($oa['products'])) {
                    foreach ($oa['products'] as $prd) {
                        if (!isset($productArr[$prd['ID']]['newVolume'])) {
                            $productArr[$prd['ID']]['newVolume'] = 0;
                        }
                        $prdParams['orderAddressID'] = $lastID;
                        $prdParams['productID'] = $prd['ID'];
                        $prdParams['volume'] = $prd['allVolume'];
                        $productArr[$prd['ID']]['newVolume'] += intval($prd['allVolume']);
                        if ($productArr[$prd['ID']]['newVolume'] > $productArr[$prd['ID']]['volume']) {
                            $exceededVal = $productArr[$prd['ID']]['newVolume'] - $productArr[$prd['ID']]['volume'];
                            $data['warning'][$prd['ID']]['info'] = 'volume_exceeded_by';
                            $data['warning'][$prd['ID']]['value'] = $exceededVal;
                        }
                        $lastProductAddressID = $this->DpOrderAddressProduct->create($prdParams);
                        $newAddress['products'][] = array(
                            'ID' => $prd['ID'],
                            'orderAddressID' => $lastID,
                            'volume' => $prd['volume'],
                            'allVolume' => $prd['allVolume']
                        );
                        if ($lastProductAddressID > 0) {
                            $savedProductAddress++;
                        }
                        unset($prdParams);
                    }
                }
            }
            $newAddresses[] = $newAddress;
        }

        if ($savedAddress > 0) {
            $data['response'] = true;
            $data['savedAddress'] = $savedAddress;
            $data['savedProductAddress'] = $savedProductAddress;
            $data['addresses'] = $newAddresses;
        } else {
            $data['response'] = false;
        }
        $data['products'] = $products;
        return $data;
    }

    /**
     * @return mixed
     */
    public function patch_updateVatAddress()
    {
        $data['response'] = true;

        return $data;
    }

    /**
     * @param $orderID
     * @return array
     */
    public function orderAddresses($orderID)
    {

        $addressesResult = $this->DpOrderAddress->getOrdersAddresses(array($orderID));

        $addresses = array();
        $invoiceAddress = array();
        if ($addressesResult) {
            foreach ($addressesResult as $each) {
                if ($each['type'] == 2) {
                    $invoiceAddress[$each['orderID']] = $each;
                    continue;
                }
                if (!isset($addresses[$each['orderID']])) {
                    $addresses[$each['orderID']] = array();
                }
                $addresses[$each['orderID']][] = $each;
            }
        }

        return array('invoiceAddress' => $invoiceAddress[$orderID], 'addresses' => $addresses[$orderID]);
    }

    /**
     * @return array
     * @throws Exception
     */
    public function getCart()
    {
        $tokenInfo = $this->Auth->getTokenInfo();

        $productsInCart = array();

        $mongoSession = $this->MgSession->getAdapter()->findOne(array(
            'sid' => $tokenInfo->sessionID
        ));

        if ($mongoSession->orderID > 0) {
            $order = $this->DpOrder->getOne($mongoSession->orderID);
        } else {
            return array('response' => false, 'info' => 'no order in session');
        }

        $res = $this->DpProduct->getOrdersProducts(array($order['ID']));

        if (!empty($res)) {
            foreach ($res as $pKey => $prod) {
                $languages = $this->PrintShopTypeLanguage->get('typeID', $prod['typeID'], true);
                if ($languages) {
                    foreach ($languages as $language) {
                        if (is_array($language) &&
                            array_key_exists('lang', $language) &&
                            array_key_exists('name', $language)) {
                            $res[$pKey]['names'][$language['lang']] = $language['name'];
                        }
                    }
                }
            }
        }

        foreach ($res as $pKey => $product) {
            $complex = $this->PrintShopComplex->getBase($product['typeID']);
            $res[$pKey]['complex'] = false;
            if ($complex) {
                $res[$pKey]['complex'] = true;
                $baseType = $this->PrintShopType->get('ID', $product['typeID']);
                $res[$pKey]['skipUpload'] = $baseType['skipUpload'];
            }
        }

        $res = $this->Calculation->getCalcData($res);

        foreach ($res as $pKey => $product) {

            if (!empty($product['calcProducts'])) {
                foreach ($product['calcProducts'] as $cpKey => $calcProduct) {
                    $languages = $this->PrintShopTypeLanguage->get('typeID', $calcProduct['typeID'], true);
                    if ($languages) {
                        foreach ($languages as $language) {
                            if (is_array($language) &&
                                array_key_exists('lang', $language) &&
                                array_key_exists('name', $language)) {
                                $res[$pKey]['calcProducts'][$cpKey]['names'][$language['lang']] = $language['name'];
                            }
                        }
                    }
                }
            }
        }

        $addressesResult = $this->DpOrderAddress->getOrdersAddresses(array($order['ID']));

        $addresses = array();
        $invoiceAddress = array();
        if ($addressesResult) {
            foreach ($addressesResult as $each) {
                if ($each['type'] == 2) {
                    $invoiceAddress[$order['ID']] = $each;
                    continue;
                }
                if (!isset($addresses[$order['ID']])) {
                    $addresses[$order['ID']] = array();
                }
                $addresses[$order['ID']][] = $each;
            }
        }

        $products = array();
        $aggregateProducts = array();

        if (!empty($mongoSession->Carts)) {
            foreach ($mongoSession->Carts as $ca) {
                $ca = (array)$ca;
                $cartObjectID = current($ca);

                $oneCart = $this->MgCart->getAdapter()->findOne(array(
                    '_id' => new ObjectId($cartObjectID)
                ));

                $productsInCart[] = array(
                    'calcID' => $oneCart->calcID,
                    'orderID' => $oneCart->orderID,
                    'productID' => $oneCart->productID,
                    'ProductAddresses' => $oneCart->ProductAddresses,
                );
            }
        }

        foreach ($res as $each) {

            $aggregateProducts[] = $each['productID'];

            if (!isset($products[$order['ID']])) {
                $products[$order['ID']] = array();
            }

            $deliveryPrices = $this->UserDeliveryPrice->getOneByCalc($each['calcID'], 1);

            $deliveryPrice = 0;
            $deliveryPriceGross = 0;
            if (!empty($deliveryPrices)) {
                foreach ($deliveryPrices as $dp) {
                    $actDeliveryPrice = $this->BasePrice->get('ID', $dp['priceID']);
                    $deliveryPrice += $actDeliveryPrice['price'];
                    $deliveryPriceGross += $actDeliveryPrice['grossPrice'];
                    $productsInCart = $this->productAddressesFindIndex($productsInCart, $dp);
                }
            }

            $each['deliveryPrice'] = $this->Price->getPriceToView($deliveryPrice);
            $each['deliveryPriceGross'] = $this->Price->getPriceToView($deliveryPriceGross);

            $each['calcPrice'] = $this->Price->getPriceToView($each['calcPrice']);
            $each['calcGrossPrice'] = $this->Price->getPriceToView($each['calcGrossPrice']);

            $oldDeliveryPrices = $this->UserDeliveryPrice->getOneByCalc($each['calcID'], 0, 0);

            $olDDeliveryPrice = 0;
            $oldDeliveryPriceGross = 0;
            if (!empty($oldDeliveryPrices)) {
                foreach ($oldDeliveryPrices as $dp) {
                    $actDeliveryPrice = $this->BasePrice->get('ID', $dp['priceID']);
                    $olDDeliveryPrice += $actDeliveryPrice['price'];
                    $oldDeliveryPriceGross += $actDeliveryPrice['grossPrice'];
                }
                $each['oldDeliveryPrice'] = $this->Price->getPriceToView($olDDeliveryPrice);
                $each['oldDeliveryPriceGross'] = $this->Price->getPriceToView($oldDeliveryPriceGross);
            }

            $products[$order['ID']][] = $each;
        }

        $orderCoupons = $this->CouponOrder->getByProducts($aggregateProducts);

        foreach ($products[$order['ID']] as $key => $each) {
            if (array_key_exists($each['productID'], $orderCoupons)) {
                $products[$order['ID']][$key]['coupons'] = $orderCoupons[$each['productID']];
            }
        }

        $sumPrice = 0;
        $sumPriceGross = 0;
        $sumCalcPrice = 0;
        $sumCalcPriceGross = 0;
        foreach ($products[$order['ID']] as $pKey => $pValue) {
            $sumPrice += floatval(str_replace(',', '.', $pValue['price']));
            $sumPriceGross += floatval(str_replace(',', '.', $pValue['grossPrice']));

            if (intval($pValue['amount']) > 1) {
                $sumCalcPrice += floatval(str_replace(',', '.', $pValue['calcPrice'])) * intval($pValue['amount']);
                $sumCalcPriceGross += floatval(str_replace(',', '.', $pValue['calcGrossPrice'])) * intval($pValue['amount']);

                $products[$order['ID']][$pKey]['calcPrice'] *= intval($pValue['amount']);
                $products[$order['ID']][$pKey]['calcGrossPrice'] *= intval($pValue['amount']);
            } else {
                $sumCalcPrice += floatval(str_replace(',', '.', $pValue['calcPrice']));
                $sumCalcPriceGross += floatval(str_replace(',', '.', $pValue['calcGrossPrice']));
            }

            $currencyCode = $pValue['currency'];
        }

        $order['sumPrice'] = $this->Price->getPriceToView($sumPrice * 100);
        $order['sumGrossPrice'] = $this->Price->getPriceToView($sumPriceGross * 100);

        $order['sumCalcPrice'] = $this->Price->getPriceToView($sumCalcPrice * 100);
        $order['sumCalcGrossPrice'] = $this->Price->getPriceToView($sumCalcPriceGross * 100);

        $currencyRootEntity = $this->CurrencyRoot->get('code', $currencyCode);
        $order['currency'] = $currencyCode;
        $order['currencySymbol'] = $currencyRootEntity['symbol'];

        $order['products'] = $products[$order['ID']];

        if (isset($addresses[$order['ID']])) {
            $order['addresses'] = $addresses[$order['ID']];
        }
        if (isset($invoiceAddress[$order['ID']])) {
            $order['invoiceAddress'] = $invoiceAddress[$order['ID']];
        }

        $order['defaultAddress'] = $this->Address->getDefault($order['userID'], 1);

        return array('order' => $order, 'carts' => $productsInCart, 'sessionID' => $tokenInfo->sessionID);
    }

    /**
     * @param $productsInCart
     * @param $deliveryPrice
     * @return mixed
     */
    private function productAddressesFindIndex($productsInCart, $deliveryPrice)
    {
        foreach ($productsInCart as $productCartIndex => $productCart) {
            foreach ($productCart['ProductAddresses'] as $productAddressIndex => $productAddress) {
                if ($productAddress->deliveryID == $deliveryPrice['deliveryID'] &&
                    $productAddress->volume == $deliveryPrice['volume'] &&
                    $productCart['productID'] == $deliveryPrice['productID'] &&
                    $productCart['calcID'] == $deliveryPrice['calcID']) {
                    $productsInCart[$productCartIndex]['ProductAddresses'][$productAddressIndex]['deliveryPrice'] = $deliveryPrice;
                }
            }
        }
        return $productsInCart;
    }

    /**
     * @param $orderID
     * @return array
     */
    public function patch_setUser($orderID)
    {
        $user = $this->Auth->getLoggedUser();
        if (!$user) {
            return array('response' => 'false');
        }
        $one = $this->DpOrder->get('ID', $orderID);
        if ($one['userID'] != NULL) {
            return array('response' => 'false');
        }
        $res = $this->DpOrder->update($orderID, 'userID', $user['ID']);
        return array('response' => $res, 'orderID' => $orderID, 'userID' => $user['ID']);
    }

    /**
     * @param $orderID
     * @return array
     * @throws Exception
     */
    public function patch_saveCart($orderID)
    {
        ini_set('max_execution_time', 70);

        $post = $this->Data->getAllPost();

        $response = false;

        $user = $this->Auth->getLoggedUser();

        if (!$user) {
            return array('response' => 'false', 'info' => 'not user');
        }

        $one = $this->DpOrder->get('ID', $orderID);
        if ($one['userID'] != $user['ID']) {
            return array('response' => 'false', 'info' => 'no order: ' . $orderID);
        }

        if ($one['production']) {
            return array(
                'response' => false,
                'info' => 'Order is already in production'
            );
        }

        $this->debug('START save cart!!!');

        $now = date('Y-m-d H:i:s');
        $payment = array();

        $paymentMethod = $this->Payment->get('ID', $post['paymentID']);
        $paymentModule = $this->Module->get('ID', $paymentMethod['componentID']);

        $deferredPayment = $this->checkDeferredPayment($paymentModule, $user, $orderID);

        if ($deferredPayment['response'] === false) {
            return $deferredPayment;
        }

        if ($one) {
            $products = $this->DpProduct->getOrdersProducts(array($orderID));

            $aggregateCalculations = array();
            foreach ($products as $product) {
                $aggregateCalculations[] = $product['calcID'];
            }

            $unusedPrices = $this->UserDeliveryPrice->getByCalcList($aggregateCalculations, NULL, 0);
            foreach ($unusedPrices as $price) {
                $this->UserDeliveryPrice->delete('ID', $price['ID']);
            }

            try {
                $totalPriceResult = $this->getTotalPrice($products);
                $totalPrice = $totalPriceResult['totalPrice'];
                $deliveryPriceGross = $this->getDeliveryPrice($products, true);
            } catch (Exception $e) {
                $this->debug($e->getMessage());
            }

            if ($paymentMethod) {

                if ($paymentMethod['sellerID'] > 0) {
                    $this->DpOrder->update($orderID, 'sellerID', $paymentMethod['sellerID']);
                }

                switch ($paymentModule['key']) {
                    case PAYU_NAME_IN_MODULES:

                        $data['products'] = $this->getProductsForPayment($products);
                        $data['products'][] = array(
                            'name' => 'delivery',
                            'unitPrice' => $deliveryPriceGross,
                            'quantity' => 1
                        );
                        $data['totalAmount'] = ($totalPrice + $deliveryPriceGross);
                        $data['currencyCode'] = $this->getOrderCurrency();
                        $data['extOrderId'] = $data['orderID'] = $orderID;
                        $data['buyer'] = array(
                            'email' => $user['login'],
                            'firstName' => $user['firstname'],
                            'lastName' => $user['lastname'],
                        );
                        try {
                            $payment = $this->PayU->doPayment($data);
                        } catch (Exception $e) {
                            $this->debug($e->getMessage());
                        }


                        if (strlen($payment->orderId) > 0) {
                            $this->DpOrder->update($orderID, 'paymentOrderID', $payment->orderId);
                        }

                        if ($payment) {
                            $payment = json_decode(json_encode($payment), true);
                            $payment['operator'] = PAYU_NAME_IN_MODULES;
                        }

                        break;
                    case TINKOFF_NAME_IN_MODULES:

                        $payment = $this->tinkoffPayment($orderID, $user, $products, $totalPrice, $deliveryPriceGross);

                        break;
                    case SBERBANK_NAME_IN_MODULES:

                        $payment = $this->sberbankPayment($orderID, $totalPrice, $deliveryPriceGross);

                        break;
                    case PAYPAL_NAME_IN_MODULES:

                        $payment = $this->paypalPayment($orderID, $totalPrice, $deliveryPriceGross);

                        break;
                    default:

                        break;
                }
            }

            if ($this->DpOrder->update($orderID, 'isOrder', 1) && $this->DpOrder->update($orderID, 'modified', $now)) {

                $userOption = $this->UserOption->get('uID', $user['ID']);
                if ($userOption && intval($userOption['sellerID']) > 0) {
                    $this->DpOrder->update($orderID, 'sellerID', $userOption['sellerID']);
                }

                if (!empty($payment)) {

                    switch ($payment['operator']) {
                        case PAYU_NAME_IN_MODULES:

                            if ($payment['status']['statusCode'] == 'SUCCESS') {
                                $this->DpOrder->update($orderID, 'production', 1);
                                $this->DpOrder->update($orderID, 'ready', 1);
                            }

                            break;
                        case TINKOFF_NAME_IN_MODULES:

                            if ($payment['status'] == 'NEW') {
                                $this->DpOrder->update($orderID, 'production', 1);
                                $this->DpOrder->update($orderID, 'ready', 1);
                            }

                            break;
                        case SBERBANK_NAME_IN_MODULES:

                            if ($payment['status'] == 'NEW') {
                                $this->DpOrder->update($orderID, 'production', 1);
                                $this->DpOrder->update($orderID, 'ready', 1);
                            }

                            break;
                    }


                } else {
                    $this->DpOrder->update($orderID, 'production', 1);
                    $this->DpOrder->update($orderID, 'ready', 1);
                }

                if (isset($post['paymentID'])) {
                    $this->DpOrder->update($orderID, 'paymentID', $post['paymentID']);
                }

                $this->DpOrder->update($orderID, 'status', $this->OrderStatus->getFirstStatus());

                $this->DpOrder->update($orderID, 'domainID', $this->getDomainID());

                $response = true;
            }
        } else {
            return $this->sendFailResponse('06');
        }

        $createdJoins = 0;

        $orderAddresses = $post['addresses'];

        if (!empty($orderAddresses)) {

            foreach ($orderAddresses as $calcID => $productAddresses) {

                foreach ($productAddresses as $address) {
                    $params = array();
                    $params['orderID'] = $orderID;

                    $params['senderID'] = $address['senderID'];

                    if (array_key_exists('collectionPointID', $address) && $address['collectionPointID'] > 0) {
                        $params['collectionPointID'] = $address['collectionPointID'];
                        $params['addressID'] = 0;
                    } else {
                        $copiedID = $this->Address->copy($address['addressID']);
                        $params['addressID'] = $copiedID;
                    }


                    $params['deliveryID'] = $address['deliveryID'];
                    if (array_key_exists('commonDeliveryID', $address) && $address['commonDeliveryID']) {
                        $params['deliveryID'] = $address['commonDeliveryID'];
                    }

                    if (array_key_exists('commonDeliveryID', $address) && $address['commonDeliveryID'] &&
                        $address['join'] == true) {
                        $params['joined'] = 1;
                    }

                    $params['type'] = 1;
                    $lastID = $this->DpOrderAddress->create($params);
                    if ($lastID > 0) {
                        $params = array();
                        $params['orderAddressID'] = $lastID;
                        $oneProduct = $this->DpProduct->get('calcID', $calcID);
                        $params['productID'] = $oneProduct['ID'];
                        if (!empty($address['allVolume'])) {
                            $params['volume'] = $address['allVolume'];
                        }
                        $added = $this->DpOrderAddressProduct->create($params);
                        if (!$added) {
                            $response = false;
                        }
                    }
                    $createdJoins++;
                    unset($lastID);
                }
            }
        }

        $userInvoiceAddress = $this->AddressUser->getOne($user['ID'], 2);
        $copiedInvoiceAddressID = null;
        if ($userInvoiceAddress) {
            $copiedInvoiceAddressID = $this->Address->copy($userInvoiceAddress['addressID']);
            $addressParams = array();
            $addressParams['orderID'] = $orderID;
            $addressParams['addressID'] = $copiedInvoiceAddressID;
            $addressParams['type'] = 2;
            $this->DpOrderAddress->create($addressParams);
        }

        $this->Setting->setModule('invoice');
        $this->Setting->setLang(NULL);
        $invoiceOn = $this->Setting->getValue('invoiceOn');

        if ($invoiceOn && $copiedInvoiceAddressID) {
            $typeNumeration = $this->Setting->getValue('numerationInvoices');
            $invoiceParams = array();
            $month = NULL;
            if ($typeNumeration == 1) {
                $month = date('m');
            }
            $year = date('Y');
            $maxInvoiceID = $this->DpInvoice->getMaxID($year, $month, PROFORMA_INVOICE_TYPE);
            if (!$maxInvoiceID) {
                $maxInvoiceID = 1;
            } else {
                $maxInvoiceID++;
            }
            $invoiceParams['invoiceID'] = $maxInvoiceID;
            $invoiceParams['type'] = PROFORMA_INVOICE_TYPE;
            $invoiceParams['documentDate'] = date('Y-m-d');
            $invoiceParams['orderID'] = $orderID;
            $invoiceParams['addressID'] = $copiedInvoiceAddressID;
            $invoiceParams['sellDate'] = date('Y-m-d');
            $this->DpInvoice->create($invoiceParams);
        }
        $this->Setting->setModule('general');

        $info = '';
        $return = false;
        if ($createdJoins > 0) {
            $return = true;
        } else {
            $info = 'Brak powiązań adresów z produktem';
        }

        if (!empty($products)) {
            foreach ($products as $pKey => $prod) {
                $languages = $this->PrintShopTypeLanguage->get('typeID', $prod['typeID'], true);
                if ($languages) {
                    foreach ($languages as $language) {
                        $products[$pKey]['names'][$language['lang']] = $language['name'];
                    }
                }
            }
        }

        $products = $this->Calculation->getCalcData($products);

        $templateID = 105;
        $templateName = 'products-list-mail';

        $templateSetting = $this->TemplateSetting->getOne($templateID, 1);

        $templatePath = 'default/' . $templateID . '/' . $templateName . '.html';

        if ($templateSetting && $templateSetting['source'] == 1) {
            $templatePath = companyID . '/' . $templateID . '/' . $templateName . '.html';
        } elseif ($templateSetting && $templateSetting['source'] == 2) {
            $templatePath = companyID . '/' . $templateID . '/' . $this->getDomainID() . '/' . $templateName . '.html';
        }

        $loader = new FilesystemLoader(STATIC_PATH . 'templates');
        $twig = new Twig_Environment($loader, array());
        $twig->addExtension(new TranslateExtension());
        $template = $twig->load($templatePath);

        $lang = $this->prepareUserLanguage($user['ID']);

        $productsContent = $template->render(
            array(
                'products' => $products,
                'lang' => $lang
            )
        );

        try {
            $totalPrice = $totalPriceResult['totalPrice'];
            $deliveryPriceGross = $this->getDeliveryPrice($products, true);
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }

        $messageID = NULL;

        if ($response) {

            $usedCoupons = $this->CouponOrder->get('orderID', $orderID, true);

            $usedCouponsUpdated = 0;

            if ($usedCoupons) {
                foreach ($usedCoupons as $coupon) {
                    $couponEntity = $this->Coupon->get('ID', $coupon['couponID']);
                    $countUsed = 1;
                    if ($couponEntity['used'] > 0) {
                        $countUsed = $couponEntity['used'] + 1;
                    }
                    if ($this->Coupon->update($coupon['couponID'], 'used', $countUsed)) {
                        $usedCouponsUpdated++;
                    }
                }
            }

            $this->ProductionPath->doPath(array(
                'itemID' => $orderID,
                'appVersion' => 1
            ));

            $this->Mail->setBind('firstname', $user['firstname']);
            $this->Mail->setBind('order_id', $orderID);
            $this->Mail->setBind('deliveryPrice', $this->Price->getPriceToView($deliveryPriceGross) . ' ' . $this->getOrderCurrency());
            $this->Mail->setBind('price', $this->Price->getPriceToView($totalPrice) . ' ' . $this->getOrderCurrency());
            $this->Mail->setBind('totalPrice', $this->Price->getPriceToView(($deliveryPriceGross + $totalPrice)) . ' ' . $this->getOrderCurrency());
            $this->Mail->setBind('products_list', $productsContent);

            $mailPaymentInfo = $this->PaymentContent->customGet($post['paymentID'], lang);
            if ($mailPaymentInfo) {
                $this->Mail->setBind('payment_info', $mailPaymentInfo['content']);
            } else {
                $this->Mail->setBind('payment_info', '');
            }

            if (array_key_exists('name', $user)) {
                $this->Mail->sendMail($user['login'], $user['name'], 'orderConfirm', $lang);
            } else {
                $this->Mail->sendMail($user['login'], $user['firstname'], 'orderConfirm', $lang);
            }

            $this->Setting->setModule('additionalSettings');
            $this->Setting->setLang(NULL);
            $this->Setting->setDomainID($this->getDomainID());
            $adminMailRecipients = $this->Setting->getValue('adminMailRecipients');

            if ($adminMailRecipients) {
                $this->Mail->clearBinds();
                $this->Mail->setBind('orderID', $orderID);
                $this->Mail->setBind('price', $this->Price->getPriceToView($totalPrice) . ' ' . $this->getOrderCurrency());
                $this->Mail->setBind('user_email', $user['login']);

                $adminMailRecipients = explode(',', $adminMailRecipients);
                foreach ($adminMailRecipients as $adminMailRecipient) {
                    if (filter_var($adminMailRecipient, FILTER_VALIDATE_EMAIL) !== false) {
                        $this->Mail->sendMail($adminMailRecipient, 'admin', 'newOrderMailToAdmin');
                    }
                }
            }

            if (array_key_exists('orderMessage', $post) && $post['orderMessage']) {
                $messageParams['senderID'] = $user['ID'];
                $messageParams['orderID'] = $orderID;
                $messageParams['isFirst'] = 1;
                $messageParams['created'] = date('Y-m-d H:i:s');
                $messageParams['content'] = $post['orderMessage'];
                $messageParams['isAdmin'] = 0;

                $messageID = $this->OrderMessage->create($messageParams);
            }
        }

        $this->debug('END save cart');

        return array(
            'response' => $return,
            'createdJoins' => $createdJoins,
            'info' => $info,
            'payment' => $payment,
            'messageID' => $messageID,
            'updatedCoupons' => $usedCouponsUpdated
        );
    }

    /**
     * @param $paymentModule
     * @param $user
     * @param $orderID
     * @return array
     */
    private function checkDeferredPayment($paymentModule, $user, $orderID = NULL)
    {
        if ($paymentModule['key'] === 'deferred_payment') {
            $userEntity = $this->User->get('ID', $user['ID']);
            if (intval($userEntity['deferredPayment']) == 0) {
                return array(
                    'response' => false,
                    'info' => 'no_deferred_payment'
                );
            } else if (intval($userEntity['deferredPayment']) > 0) {

                $userOptionEntity = $this->UserOption->get('uID', $user['ID']);

                if (intval($userOptionEntity['creditLimit']) == 0) {
                    return array(
                        'response' => false,
                        'info' => 'no_credit_limit'
                    );
                }

                $aggregateOrderCalculations = array();
                if ($orderID) {
                    $aggregateOrderCalculations = $this->DpOrder->getOrderCalculations($orderID);
                }

                $aggregateCalculations = $this->DpOrder->getNotPaidCalculations($user['ID']);
                $aggregateCalculations = array_merge($aggregateCalculations, $aggregateOrderCalculations);

                $notPaidCalculations = $this->UserCalc->getByList($aggregateCalculations);

                $totalUnpaidValue = $this->Price->getTotalBasePrice($notPaidCalculations);
                $totalUnpaidDeliveryValue = $this->Price->getTotalDeliveryPrice($notPaidCalculations);

                $unpaidPayments = ($totalUnpaidValue + $totalUnpaidDeliveryValue);

                if ($unpaidPayments >= (intval($userOptionEntity['creditLimit']) * 100)) {
                    return array(
                        'response' => false,
                        'info' => 'credit_limit_exceeded'
                    );
                }

            }
        }

        return array(
            'response' => true
        );
    }

    /**
     * @param $orderID
     * @return array
     * @deprecated since 09.03.2017
     */
    public function patch_paymentSuccess($orderID)
    {

        $post = $this->Data->getAllPost();
        $user = $this->Auth->getLoggedUser();

        if (!$user) {
            return array('response' => 'false', 'info' => 'not user');
        }

        $one = $this->DpOrder->get('ID', $orderID);
        if ($one['userID'] != $user['ID']) {
            return array('response' => 'false', 'info' => 'no order: ' . $orderID);
        }

        return array('response' => true);
    }

    public function paymentStatus($orderID, $params = array())
    {

        $loggedUser = $this->Auth->getLoggedUser();

        if ($orderID === TINKOFF_NAME_IN_MODULES) {

            if ($params['OrderId'] > 0) {
                $one = $this->DpOrder->get('ID', $params['OrderId']);
                $orderID = $params['OrderId'];
            } else {
                $one = $this->DpOrder->getLastUserOrder($loggedUser['ID']);
                $orderID = $one['ID'];
            }

            if ($params['OrderId'] != $orderID) {
                $this->debug('tinkoff orderID problem: ', $params, $orderID);
            }
        } else {
            $one = $this->DpOrder->get('ID', $orderID);
        }

        if ($one['userID'] != $loggedUser['ID']) {
            return $this->sendFailResponse('12');
        }

        $response = array('response' => false, 'paymentStatus' => false, 'paymentOnline' => false);

        if (!$one) {
            return $response;
        }

        $response['order'] = $one;

        $paymentMethod = $this->Payment->get('ID', $one['paymentID']);
        $paymentModule = $this->Module->get('ID', $paymentMethod['componentID']);

        $paymentStatusTinkoff = false;
        $paymentStatusSberbank = false;
        $paymentStatusPaypal = false;

        if ($paymentMethod) {
            if ($paymentModule['key'] == PAYU_NAME_IN_MODULES) {
                $response['paymentOnline'] = true;
                try {
                    $paymentStatus = $this->PayU->checkStatus($one['paymentOrderID']);
                } catch (Exception $e) {
                    $info = $e->getMessage();
                }
            }
            else if ($paymentModule['key'] == TINKOFF_NAME_IN_MODULES) {

                $response['paymentOnline'] = true;
                try {
                    $paymentOptions = $this->PaymentAssistant->getPaymentOptions();

                    $TinkoffMerchantAPI = new TinkoffMerchantAPI(
                        $paymentOptions['terminalKey'],
                        $paymentOptions['secretKey'],
                        $paymentOptions['apiUrl']
                    );

                    $params = array(
                        'PaymentId' => $one['paymentOrderID'],
                    );

                    $paymentStatusTinkoff = $TinkoffMerchantAPI->getState($params);

                    $paymentStatusTinkoff = json_decode($paymentStatusTinkoff, true);

                } catch (Exception $e) {
                    $info = $e->getMessage();
                }
            }

            else if ($paymentModule['key'] == SBERBANK_NAME_IN_MODULES) {

                $response['paymentOnline'] = true;
                try {

                    $paymentOptions = $this->PaymentAssistant->getPaymentOptions(SBERBANK_NAME_IN_MODULES);

                    $apiUrl = SberbankClient::API_URI;
                    if ($paymentOptions['testMode'] == 'yes') {
                        $apiUrl = SberbankClient::API_URI_TEST;
                    }

                    $options = array(
                        'userName' => $paymentOptions['userName'],
                        'password' => $paymentOptions['password'],
                        'apiUri' => $apiUrl,
                        'language' => 'en',
                    );
                    $client = new SberbankClient($options);

                    $paymentStatusSberbank = $client->getOrderStatus($params['orderId']);

                } catch (Exception $e) {
                    $info = $e->getMessage();
                }

            }
            else if ($paymentModule['key'] == PAYPAL_NAME_IN_MODULES) {

                $response['paymentOnline'] = true;
                try {

                    $paymentOptions = $this->PaymentAssistant->getPaymentOptions(PAYPAL_NAME_IN_MODULES);

                    try {
                        $clientId = $paymentOptions['PAYPAL-CLIENT-ID'];
                        $clientSecret = $paymentOptions['PAYPAL-CLIENT-SECRET'];

                        $environment = $paymentOptions['testMode'] === '1'? new SandboxEnvironment($clientId, $clientSecret): new ProductionEnvironment($clientId, $clientSecret);
                        $client = new PayPalHttpClient($environment);
                        $request=new OrdersGetRequest($params['token']);
                        $paypalResponse = $client->execute($request);

                        if($paypalResponse->statusCode===200){
                            $paymentStatusPaypal=$paypalResponse->result->status;
                        }else{
                            $paymentStatusPaypal='FAIL';
                        }
                    }catch (HttpException $ex) {
                        echo $ex->statusCode;
                        print_r($ex->getMessage());
                    }

                } catch (Exception $e) {
                    $info = $e->getMessage();
                }

            }
        }

        $products = $this->DpProduct->getOrdersProducts(array($orderID));
        $products = $this->getLangNames($products);

        try {
            $totalPriceResult = $this->getTotalPrice($products);
            $totalProductsPrice = $totalPriceResult['totalPrice'];
            $deliveryPriceGross = $this->getDeliveryPrice($products, true);
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }

        $finalPrice = $totalProductsPrice + $deliveryPriceGross;

        $orderInfo = array();

        $orderInfo['finalPrice'] = $this->Price->getPriceToView($finalPrice);
        $orderInfo['currency'] = $this->getOrderCurrency();
        $orderInfo['orderID'] = $orderID;
        $response['products'] = $products;
        $response['orderInfo'] = $orderInfo;


        if ($paymentStatus && is_array($paymentStatus['orders'])) {
            $paymentOrder = current($paymentStatus['orders']);

            if ($paymentOrder['status'] == PAYU_COMPLETED) {
                $this->DpOrder->update($orderID, 'paid', 1);
                $proformaInvoice = $this->DpInvoice->getOne($orderID, PROFORMA_INVOICE_TYPE);
                if ($proformaInvoice) {
                    $this->DpInvoice->update($proformaInvoice['ID'], 'paymentDate', date('Y-m-d'));
                }
                $vatInvoice = $this->DpInvoice->getOne($orderID, VAT_INVOICE_TYPE);
                if ($vatInvoice) {
                    $this->DpInvoice->update($vatInvoice['ID'], 'paymentDate', date('Y-m-d'));
                }
                $response['order'] = $one;
                $response['paymentStatus'] = true;
                return $response;
            } else {
                $response['info'] = 'Payment not completed';
                return $response;
            }
        }

        if ($paymentStatusSberbank) {
            if ($paymentStatusSberbank['OrderStatus'] == SberbankOrderStatus::DEPOSITED) {
                $this->DpOrder->update($orderID, 'paid', 1);
                $proformaInvoice = $this->DpInvoice->getOne($orderID, PROFORMA_INVOICE_TYPE);
                if ($proformaInvoice) {
                    $this->DpInvoice->update($proformaInvoice['ID'], 'paymentDate', date('Y-m-d'));
                }
                $vatInvoice = $this->DpInvoice->getOne($orderID, VAT_INVOICE_TYPE);
                if ($vatInvoice) {
                    $this->DpInvoice->update($vatInvoice['ID'], 'paymentDate', date('Y-m-d'));
                }
                $response['order'] = $one;
                $response['paymentStatus'] = true;
                return $response;
            } else {
                $response['info'] = 'Payment not completed';
                return $response;
            }
        }

        if ($paymentStatusTinkoff) {

            if ($paymentStatusTinkoff['Status'] == 'CONFIRMED') {
                $this->DpOrder->update($orderID, 'paid', 1);
                $proformaInvoice = $this->DpInvoice->getOne($orderID, PROFORMA_INVOICE_TYPE);
                if ($proformaInvoice) {
                    $this->DpInvoice->update($proformaInvoice['ID'], 'paymentDate', date('Y-m-d'));
                }
                $vatInvoice = $this->DpInvoice->getOne($orderID, VAT_INVOICE_TYPE);
                if ($vatInvoice) {
                    $this->DpInvoice->update($vatInvoice['ID'], 'paymentDate', date('Y-m-d'));
                }
                $response['order'] = $one;
                $response['paymentStatus'] = true;
                return $response;
            } else {
                $response['info'] = 'Payment not completed';
                return $response;
            }
        }
        if ($paymentStatusPaypal) {
            if ($paymentStatusPaypal === 'APPROVED') {
                $this->DpOrder->update($orderID, 'paid', 1);
                $proformaInvoice = $this->DpInvoice->getOne($orderID, PROFORMA_INVOICE_TYPE);
                if ($proformaInvoice) {
                    $this->DpInvoice->update($proformaInvoice['ID'], 'paymentDate', date('Y-m-d'));
                }
                $vatInvoice = $this->DpInvoice->getOne($orderID, VAT_INVOICE_TYPE);
                if ($vatInvoice) {
                    $this->DpInvoice->update($vatInvoice['ID'], 'paymentDate', date('Y-m-d'));
                }
                $response['order'] = $one;
                $response['paymentStatus'] = true;
                return $response;
            } else {
                $response['info'] = 'Payment not completed';
                return $response;
            }
        }

        $response['info'] = $info;
        return $response;
    }

    /**
     * @param $orderID
     * @param $user
     * @param $products
     * @param $totalPrice
     * @param $deliveryPrice
     * @return array
     */
    private function tinkoffPayment($orderID, $user, $products, $totalPrice, $deliveryPrice)
    {
        $paymentOptions = $this->PaymentAssistant->getPaymentOptions();

        $payment = array();

        $TinkoffMerchantAPI = new TinkoffMerchantAPI(
            $paymentOptions['terminalKey'],
            $paymentOptions['secretKey'],
            $paymentOptions['apiUrl']
        );

        $receipt = array(
            'Email' => $user['login'],
            'Taxation' => 'usn_income',
            'Items' => array()
        );

        $sumOfVolumes = 0;
        foreach ($products as $product) {
            $sumOfVolumes += $product['volume'];
        }

        $priceForTinkoff = $totalPrice;
        if ($deliveryPrice > 0) {
            $priceForTinkoff += $deliveryPrice;
        }

        $deliveryPriceWithCommission = 0;
        if (intval($paymentOptions['commission'])) {
            $percentageCommission = 1 + ($paymentOptions['commission'] / 100);
            $priceForTinkoff = round($priceForTinkoff * $percentageCommission, 0);
            if ($deliveryPrice > 0) {
                $deliveryPriceWithCommission = round($deliveryPrice * $percentageCommission, 0);
            }
        }

        try {
            $receipt['Items'] = $this->getTinkoffSummaryReceipt(
                $products,
                $deliveryPriceWithCommission,
                $paymentOptions['commission']
            );

        } catch (Exception $exception) {
            $this->debug($exception->getMessage());
        }

        $params = array(
            'OrderId' => $orderID,
            'Amount' => $priceForTinkoff,
            'DATA' => array(
                'Email' => $user['login'],
                'Connection_type' => 'example'
            ),
            'Receipt' => $receipt
        );

        try {

            $TinkoffMerchantAPI->init($params);

            if ($TinkoffMerchantAPI->__get('error')) {
                $this->debug(
                    'msg: ',
                    print_r($TinkoffMerchantAPI->__get('error'), true)
                );
            }

            if ($TinkoffMerchantAPI->__get('paymentId')) {
                $this->DpOrder->update($orderID, 'paymentOrderID', $TinkoffMerchantAPI->__get('paymentId'));
            }


            $payment['status'] = $TinkoffMerchantAPI->__get('status');
            $payment['url'] = $TinkoffMerchantAPI->__get('paymentUrl');
            $payment['paymentId'] = $TinkoffMerchantAPI->__get('paymentId');
            $payment['response'] = $TinkoffMerchantAPI->__get('response');
            $payment['operator'] = TINKOFF_NAME_IN_MODULES;

        } catch (Exception $exception) {
            $this->debug('receipt: ', $receipt);
            $this->debug('msg: ', $exception->getMessage());
        }

        return $payment;
    }

    /**
     * @param $orderID
     * @param $totalPrice
     * @param $deliveryPrice
     * @return array
     */
    private function sberbankPayment($orderID, $totalPrice, $deliveryPrice)
    {
        $paymentOptions = $this->PaymentAssistant->getPaymentOptions(SBERBANK_NAME_IN_MODULES);

        $apiUrl = SberbankClient::API_URI;
        if ($paymentOptions['testMode'] == 'yes') {
            $apiUrl = SberbankClient::API_URI_TEST;
        }

        $currencyCode = $this->getOrderCurrency();
        if (!$currencyCode) {
            $defaultCurrency = $this->Setting->getValue('defaultCurrency');
            $currencyEntity = $this->Currency->getOne($defaultCurrency);
            $currencyCode = $currencyEntity['code'];
        }

        $options = array(
            'userName' => $paymentOptions['userName'],
            'password' => $paymentOptions['password'],
            'apiUri' => $apiUrl,
            'language' => 'en',
            'currency' => $this->PaymentAssistant->getSberbankCurrency($currencyCode)
        );

        $client = new SberbankClient($options);

        $url = $this->RouteAssistant->getStateUrl('cartVerify', lang);
        $url = str_replace(':orderid', $orderID, $url);

        $priceOverall = $totalPrice;
        if ($deliveryPrice > 0) {
            $priceOverall += $deliveryPrice;
        }

        $orderAmount = $priceOverall;
        $returnUrl = $url;

        $this->Setting->setDomainID($this->getDomainID());
        $this->Setting->setModule('general');

        $params['failUrl'] = $url;
        $params['currency'] = $this->PaymentAssistant->getSberbankCurrency($currencyCode);

        $paymentOrderId = false;

        try {
            $result = $client->registerOrder($orderID, $orderAmount, $returnUrl, $params);
            $paymentOrderId = $result['orderId'];
        } catch (Exception $e) {
            $payment['info'] = $e->getMessage();
        }


        if ($paymentOrderId) {
            $this->DpOrder->update($orderID, 'paymentOrderID', $paymentOrderId);
        }

        $payment['operator'] = SBERBANK_NAME_IN_MODULES;
        $payment['status'] = false;
        $payment['response'] = false;
        if ($paymentOrderId) {
            $payment['status'] = 'NEW';
            $payment['response'] = true;
        }

        if (array_key_exists('formUrl', $result)) {
            $payment['url'] = $result['formUrl'];
        }


        return $payment;
    }

    private function paypalPayment($orderID, $totalPrice, $deliveryPrice)
    {
        $payment['operator'] = PAYPAL_NAME_IN_MODULES;
        $payment['status'] = false;
        $payment['response'] = false;
        $paymentOptions = $this->PaymentAssistant->getPaymentOptions(PAYPAL_NAME_IN_MODULES);
        $currencyCode = $this->getOrderCurrency();
        if (!$currencyCode) {
            $defaultCurrency = $this->Setting->getValue('defaultCurrency');
            $currencyEntity = $this->Currency->getOne($defaultCurrency);
            $currencyCode = $currencyEntity['code'];
        }

        $priceOverall = $totalPrice;
        if ($deliveryPrice > 0) {
            $priceOverall += $deliveryPrice;
        }
        $domain = $this->Domain->get('ID', $this->getDomainID());
        $host = $domain['host'];

        if ($host == 'localhost') {
            $host .= ':9001';
        }
        $url = $this->RouteAssistant->getStateUrl('cartVerify', lang).'?provider=paypal';
        $url = str_replace(':orderid', $orderID, $url);

        $request = new OrdersCreateRequest();
        $request->prefer('return=representation');
        $request->body = [
            "intent" => "CAPTURE",
            "purchase_units" => [[
                "reference_id" => $orderID,
                "amount" => [
                    "value" => $priceOverall,
                    "currency_code" => $currencyCode
                ]
            ]],
            "application_context" => [
                "cancel_url" => $url,
                "return_url" => $url
            ]
        ];

        try {
            $clientId = $paymentOptions['PAYPAL-CLIENT-ID'];
            $clientSecret = $paymentOptions['PAYPAL-CLIENT-SECRET'];

            $environment = $paymentOptions['testMode'] === '1'? new SandboxEnvironment($clientId, $clientSecret): new ProductionEnvironment($clientId, $clientSecret);
            $client = new PayPalHttpClient($environment);
            $response = $client->execute($request);

            if($response->statusCode===201){
                foreach ($response->result->links as $link){
                    if($link->rel==='approve'){
                        $payment['url']= $link->href;
                        $payment['status'] ='CREATED';
                    }
                }
            }
        }catch (HttpException $ex) {
            echo $ex->statusCode;
            print_r($ex->getMessage());
        }
        return $payment;
    }

    /**
     * @param array $products
     * @return array
     * @throws Exception
     */
    private function getProductsForPayment(array $products)
    {
        if (empty($products)) {
            return array();
        }
        $products = $this->getLangNames($products);

        $result = array();

        foreach ($products as $product) {
            $oneProduct = array();
            $oneProduct['name'] = $product['names'][lang];

            $actCalc = $this->getCalculation($product['calcID']);
            $actProductPrice = $this->getBasePrice($actCalc['priceID']);

            if (empty($actProductPrice['currency'])) {
                $actProductPrice['currency'] = DEFAULT_CURRENCY;
            }

            $this->setOrderCurrency($actProductPrice['currency']);

            $unitPrice = (int)round($this->Price->getPriceToDb(round($actProductPrice['grossPrice'] / $product['volume'], 2)) / 100);

            $oneProduct['unitPrice'] = $unitPrice;
            $oneProduct['quantity'] = $product['volume'];
            $result[] = $oneProduct;
        }

        return $result;
    }

    /**
     * @param array $products
     * @param int $commission
     * @return array
     * @throws Exception
     */
    private function getProductsForTinkoff(array $products, $commission = 0)
    {
        if (empty($products)) {
            return array();
        }
        $products = $this->getLangNames($products);

        $result = array();

        foreach ($products as $product) {
            $oneProduct = array();
            $oneProduct['Name'] = $product['names'][lang];

            $actCalc = $this->getCalculation($product['calcID']);
            $actProductPrice = $this->getBasePrice($actCalc['priceID']);

            if (empty($actProductPrice['currency'])) {
                $actProductPrice['currency'] = DEFAULT_CURRENCY;
            }

            $this->setOrderCurrency($actProductPrice['currency']);

            $currentPrice = $actProductPrice['grossPrice'];
            $unitPrice = round($actProductPrice['grossPrice'] / $product['volume'], 0);

            if ($commission > 0) {
                $percentageCommission = 1 + ($commission / 100);
                $currentPrice = round($currentPrice * $percentageCommission, 0);
                $unitPrice = round($currentPrice / $product['volume'], 0);
            }

            $oneProduct['Price'] = $unitPrice;
            $oneProduct['Quantity'] = $product['volume'];
            $oneProduct['Amount'] = $currentPrice;
            $oneProduct['Tax'] = 'vat18';
            $result[] = $oneProduct;
        }

        return $result;
    }

    /**
     * @param array $products
     * @param $deliveryPriceWithCommission
     * @param int $commission
     * @return array
     * @throws Exception
     */
    private function getTinkoffSummaryReceipt(array $products, $deliveryPriceWithCommission, $commission = 0)
    {
        $sumTinkoffPrice = 0;
        $sumVolumes = 0;
        foreach ($products as $product) {
            $oneProduct = array();
            $oneProduct['Name'] = $product['names'][lang];

            $actCalc = $this->getCalculation($product['calcID']);
            $actProductPrice = $this->getBasePrice($actCalc['priceID']);

            if (empty($actProductPrice['currency'])) {
                $actProductPrice['currency'] = DEFAULT_CURRENCY;
            }

            $this->setOrderCurrency($actProductPrice['currency']);

            $currentPrice = $actProductPrice['grossPrice'];

            if ($commission > 0) {
                $percentageCommission = 1 + ($commission / 100);
                $currentPrice = round($currentPrice * $percentageCommission, 0);
            }

            $sumVolumes += $product['volume'];

            $sumTinkoffPrice += $currentPrice;
        }

        if ($deliveryPriceWithCommission > 0) {
            $sumTinkoffPrice += $deliveryPriceWithCommission;
        }

        $translateName = $this->LangComponent->translate('poligraphic_products');

        $oneProduct['Name'] = $translateName[lang];
        $oneProduct['Price'] = $sumTinkoffPrice;
        $oneProduct['Quantity'] = 1;
        $oneProduct['Amount'] = $sumTinkoffPrice;
        $oneProduct['Tax'] = 'none';
        $result[] = $oneProduct;

        return $result;
    }

    /**
     * @param array $products
     * @return array
     */
    private function getLangNames(array $products)
    {
        if (empty($products)) {
            return array();
        }

        foreach ($products as $key => $product) {
            if (isset($this->langNames[$product['typeID']]) && is_array($this->langNames[$product['typeID']])) {
                $languages = $this->langNames[$product['typeID']];
            } else {
                $this->langNames[$product['typeID']] = $languages = $this->PrintShopTypeLanguage->get(
                    'typeID',
                    $product['typeID'],
                    true
                );
            }

            if ($languages) {
                foreach ($languages as $language) {
                    $products[$key]['names'][$language['lang']] = $language['name'];
                }
            }
        }

        return $products;
    }

    /**
     * @param array $products
     * @return array|void
     */
    private function setFormatNames(array $products)
    {
        if (empty($products)) {
            return array();
        }

        $calcIds = array();
        foreach ($products as $product) {
            $calcIds[] = $product['calcID'];
        }
        $calculations = $this->UserCalcProduct->getByCalcIds($calcIds);
        if (!$calculations) {
            return;
        }
        foreach ($calculations as $calc) {
            $calc = current($calc);
            if (!isset($this->formatNames[$calc['calcID']])) {
                $this->formatNames[$calc['calcID']] = $calc['formatName'];
            }
        }
    }

    /**
     * @param array $products
     * @param bool $gross
     * @return int
     * @throws Exception
     */
    private function getDeliveryPrice(array $products, $gross = true)
    {
        if (empty($products)) {
            return 0;
        }

        $deliveryPrice = 0;
        $deliveryPriceGross = 0;

        foreach ($products as $p) {
            $deliveryPrices = $this->getDeliveryPrices($p['calcID']);
            if (!empty($deliveryPrices)) {
                foreach ($deliveryPrices as $dp) {
                    $actDeliveryPrice = $this->getBasePrice($dp['priceID']);
                    $deliveryPrice += $actDeliveryPrice['price'];
                    $deliveryPriceGross += $actDeliveryPrice['grossPrice'];
                }
            }
        }
        if ($gross) {
            return $deliveryPriceGross;
        } else {
            return $deliveryPrice;
        }
    }

    /**
     * @param array $products
     * @return array
     * @throws Exception
     */
    private function getTotalPrice(array $products)
    {
        if (empty($products)) {
            return array('totalPrice' => 0, 'oldTotalPrice' => 0);
        }

        $totalPrice = 0;
        $oldTotalPrice = 0;

        foreach ($products as $p) {
            $actCalc = $this->getCalculation($p['calcID']);
            $actProductPrice = $this->getBasePrice($actCalc['priceID']);
            $actCalcProductPrice = $this->getBasePrice($actCalc['calcPriceID']);
            $this->setOrderCurrency($actProductPrice['currency']);
            $totalPrice += $actProductPrice['grossPrice'];
            $oldTotalPrice += $actCalcProductPrice['grossPrice'];
        }

        return array('totalPrice' => $totalPrice, 'oldTotalPrice' => $oldTotalPrice);
    }

    /**
     * @param $currency
     */
    private function setOrderCurrency($currency)
    {
        $this->orderCurrency = $currency;
    }

    /**
     * @return mixed
     */
    private function getOrderCurrency()
    {
        return $this->orderCurrency;
    }

    /**
     * @param $calcId
     * @return mixed
     * @throws Exception
     */
    private function getCalculation($calcId)
    {
        if (!$calcId) {
            throw new Exception('caclId not set check database');
        }
        if (isset($this->calculations[$calcId]) && is_array($this->calculations[$calcId])) {
            return $this->calculations[$calcId];
        }
        $this->calculations[$calcId] = $this->UserCalc->getOne($calcId);
        if ($this->calculations[$calcId]) {
            return $this->calculations[$calcId];
        }
        throw new Exception('Price array not fetched from database');
    }

    /**
     * @param $priceId
     * @return mixed
     * @throws Exception
     */
    private function getBasePrice($priceId)
    {
        if (!$priceId) {
            throw new Exception('priceId not set check database');
        }
        if (isset($this->basePrices[$priceId]) && is_array($this->basePrices[$priceId])) {
            return $this->basePrices[$priceId];
        }
        $this->basePrices[$priceId] = $this->BasePrice->get('ID', $priceId);
        if ($this->basePrices[$priceId]) {
            return $this->basePrices[$priceId];
        }
        throw new Exception('Price array not fetched from database');
    }

    /**
     * @param $calcId
     * @return mixed
     * @throws Exception
     */
    private function getDeliveryPrices($calcId)
    {
        if (!$calcId) {
            throw new Exception('caclId not set check database');
        }
        if (isset($this->deliveryPrices[$calcId]) && is_array($this->deliveryPrices[$calcId])) {
            return $this->deliveryPrices[$calcId];
        }
        $this->deliveryPrices[$calcId] = $this->UserDeliveryPrice->get('calcID', $calcId, true);
        if ($this->deliveryPrices[$calcId]) {
            return $this->deliveryPrices[$calcId];
        }
        throw new Exception('DeliveryPrices array not fetched from database');
    }

    /**
     * @param $orderID
     * @return array
     */
    public function getAddresses($orderID)
    {

        $addresses = $this->DpOrderAddress->getOrdersAddresses(array($orderID), 1);
        $deliveryArr = array();
        foreach ($addresses as $address) {
            $deliveryArr[] = $address['deliveryID'];
        }
        $dNames = $this->DeliveryName->getNames($deliveryArr);
        foreach ($addresses as $key => $address) {
            $addresses[$key]['deliveryNames'] = $dNames[$address['deliveryID']];
        }

        return array('response' => true, 'addresses' => $addresses);
    }

    /**
     * @param $orderID
     * @return array
     * @throws Exception
     */
    public function patch_payment($orderID)
    {
        $post = $this->Data->getAllPost();

        $user = $this->Auth->getLoggedUser();

        if (!$user) {
            return array('response' => 'false', 'info' => 'not user');
        }

        $one = $this->DpOrder->get('ID', $orderID);
        if ($one['userID'] != $user['ID']) {
            return array('response' => 'false', 'info' => 'no order: ' . $orderID);
        }

        if ($one['paid']) {
            return array('response' => false, 'info' => 'order: ' . $orderID . ' already paid.', 'paid' => true);
        }

        $payment = array();
        $cancelOrder = array();

        $paymentChanged = false;
        $errorCode = false;

        $paymentMethod = $this->Payment->get('ID', $post['paymentID']);
        $paymentModule = $this->Module->get('ID', $paymentMethod['componentID']);

        $deferredPayment = $this->checkDeferredPayment($paymentModule, $user);

        if ($deferredPayment['response'] === false) {
            return $deferredPayment;
        }

        if ($one) {

            if ($paymentMethod && $one['paymentID'] != $post['paymentID']) {
                $paymentChanged = true;
                $this->DpOrder->update($orderID, 'paymentID', $paymentMethod['ID']);
            }

            if ($paymentMethod) {
                switch ($paymentModule['key']) {
                    case PAYU_NAME_IN_MODULES:

                        if (!$one['paymentOrderID']) {
                            $paymentInfo = false;
                        } else {
                            $paymentInfo = $this->PayU->statusOrder($one['paymentOrderID']);
                            $paymentInfo = current($paymentInfo['orders']);
                        }

                        if ($paymentInfo['status'] == PAYU_COMPLETED) {
                            $this->DpOrder->update($orderID, 'paid', 1);
                            return array('response' => true, 'info' => 'Order already paid.', 'paid' => true);
                        } else {
                            if (intval($one['paymentOrderID']) > 0) {

                                $cancelOrder = $this->PayU->cancelOrder($one['paymentOrderID']);

                                if ($cancelOrder['status']['statusCode'] == PAYU_SUCCESS) {
                                    if ($one['extOrderID'] == NULL) {
                                        $extOrderID = $this->increaseOrderID($orderID);
                                    } else {
                                        $extOrderID = $this->increaseOrderID($one['extOrderID']);
                                    }

                                    $this->DpOrder->update($orderID, 'extOrderID', $extOrderID);

                                    $payment = $this->newPayuOrder($one, $extOrderID);

                                    if (strlen($payment->orderId) > 0) {
                                        $this->DpOrder->update($orderID, 'paymentOrderID', $payment->orderId);
                                    }
                                }
                            } else {

                                if ($one['extOrderID'] == NULL) {
                                    $extOrderID = $this->increaseOrderID($orderID);
                                } else {
                                    $extOrderID = $this->increaseOrderID($one['extOrderID']);
                                }

                                $this->DpOrder->update($orderID, 'extOrderID', $extOrderID);

                                $payment = $this->newPayuOrder($one, $extOrderID);

                                if (strlen($payment->orderId) > 0) {
                                    $this->DpOrder->update($orderID, 'paymentOrderID', $payment->orderId);
                                }
                            }
                        }

                        break;
                    case TINKOFF_NAME_IN_MODULES:

                        $paymentOptions = $this->PaymentAssistant->getPaymentOptions();

                        $TinkoffMerchantAPI = new TinkoffMerchantAPI(
                            $paymentOptions['terminalKey'],
                            $paymentOptions['secretKey'],
                            $paymentOptions['apiUrl']
                        );

                        if (!$one['paymentOrderID']) {
                            $paymentInfo = false;
                        } else {
                            $params = array(
                                'PaymentId' => $one['paymentOrderID'],
                            );

                            $paymentInfo = $TinkoffMerchantAPI->getState($params);
                            $paymentInfo = json_decode($paymentInfo, true);

                            if ($paymentInfo['Status'] == 'CONFIRMED') {
                                $this->DpOrder->update($orderID, 'paid', 1);
                                return array('response' => true, 'info' => 'Order already paid.', 'paid' => true);
                            } else {
                                $paymentInfo = false;
                            }
                        }

                        if ($paymentInfo) {
                            $params = array(
                                'PaymentId' => $one['paymentOrderID'],
                            );
                            $cancelInfo = $TinkoffMerchantAPI->cancelOrder($params);
                        }

                        $products = $this->DpProduct->getOrdersProducts(array($one['ID']));
                        $deliveryPriceGross = $this->getDeliveryPrice($products, true);

                        $totalPrice = $this->getTotalPrice($products);

                        $payment = $this->tinkoffPayment(
                            $orderID,
                            $user,
                            $products,
                            $totalPrice['totalPrice'],
                            $deliveryPriceGross
                        );

                        break;
                    case SBERBANK_NAME_IN_MODULES:

                        $paymentOptions = $this->PaymentAssistant->getPaymentOptions(SBERBANK_NAME_IN_MODULES);

                        $apiUrl = SberbankClient::API_URI;
                        if ($paymentOptions['testMode'] == 'yes') {
                            $apiUrl = SberbankClient::API_URI_TEST;
                        }

                        $currencyCode = $this->getOrderCurrency();
                        if (!$currencyCode) {
                            $defaultCurrency = $this->Setting->getValue('defaultCurrency');
                            $currencyEntity = $this->Currency->getOne($defaultCurrency);
                            $currencyCode = $currencyEntity['code'];
                        }

                        $options = array(
                            'userName' => $paymentOptions['userName'],
                            'password' => $paymentOptions['password'],
                            'apiUri' => $apiUrl,
                            'language' => 'en',
                            'currency' => $this->PaymentAssistant->getSberbankCurrency($currencyCode),
                        );
                        $client = new SberbankClient($options);

                        if (!$one['paymentOrderID']) {
                            $paymentInfo = false;

                            try {
                                $payment = $this->createOrderSberbank($orderID, $client, $one);
                            } catch (Exception $e) {
                                $paymentError = $e->getMessage();
                            }

                        } else {
                            $paymentOrderID = $one['paymentOrderID'];

                            try {
                                $paymentInfo = $client->getOrderStatusExtended($paymentOrderID);
                            } catch (Exception $e) {
                                $paymentInfo = $e->getMessage();
                            }

                            if (SberbankOrderStatus::statusToString($paymentInfo['orderStatus']) === 'CREATED') {

                                $payment['status'] = SberbankOrderStatus::statusToString($paymentInfo['orderStatus']);
                                $payment['operator'] = SBERBANK_NAME_IN_MODULES;
                                $paymentInfo = 'payment_processed';

                            } else if (SberbankOrderStatus::isDeclined($paymentInfo['orderStatus'])) {

                                try {
                                    $payment = $this->createOrderSberbank($orderID, $client, $one);
                                } catch (Exception $e) {
                                    $paymentError = $e->getMessage();
                                }

                            }

                        }

                        break;
                    default:

                        break;
                }
            }
        } else {
            return $this->sendFailResponse('06');
        }

        $result = array(
            'response' => true,
            'paymentInfo' => isset($paymentInfo) ? $paymentInfo : NULL,
            'payment' => $payment,
            'order' => $one,
            'cancelOrder' => $cancelOrder,
            'paymentChanged' => $paymentChanged,
            'paymentError' => isset($paymentError) ? $paymentError : NULL
        );

        return $result;
    }

    /**
     * @param $orderID
     * @param $sberbankClient SberbankClient
     * @param $order
     * @return mixed
     * @throws Exception
     */
    private function createOrderSberbank($orderID, $sberbankClient, $order)
    {
        $products = $this->DpProduct->getOrdersProducts(array($orderID));

        $totalPriceResult = $this->getTotalPrice($products);
        $totalPrice = $totalPriceResult['totalPrice'];
        $deliveryPriceGross = $this->getDeliveryPrice($products, true);

        $totalAmount = ($totalPrice + $deliveryPriceGross);

        $url = $this->RouteAssistant->getStateUrl('cartVerify', lang);
        $url = str_replace(':orderid', $orderID, $url);

        $params['failUrl'] = $url;

        if ($order['extOrderID'] == NULL) {
            $extOrderID = $this->increaseOrderID($orderID);
        } else {
            $extOrderID = $this->increaseOrderID($order['extOrderID']);
        }

        $payment = $sberbankClient->registerOrder($extOrderID, $totalAmount, $url, $params);

        $this->DpOrder->update($orderID, 'extOrderID', $extOrderID);

        if (array_key_exists('orderId', $payment)) {
            $this->DpOrder->update($orderID, 'paymentOrderID', $payment['orderId']);
        }

        $this->DpOrder->update($orderID, 'extOrderID', $extOrderID);

        $payment['status'] = 'NEW';
        $payment['operator'] = SBERBANK_NAME_IN_MODULES;

        $this->DpOrder->update($orderID, 'extOrderID', $extOrderID);

        if (array_key_exists('orderId', $payment)) {
            $this->DpOrder->update($orderID, 'paymentOrderID', $payment['orderId']);
        }

        $this->DpOrder->update($orderID, 'extOrderID', $extOrderID);

        $payment['status'] = 'NEW';
        $payment['operator'] = SBERBANK_NAME_IN_MODULES;

        return $payment;
    }

    /**
     * @param $order
     * @param $extOrderID
     * @return bool|mixed
     * @throws Exception
     */
    private function newPayuOrder($order, $extOrderID)
    {
        $user = $this->Auth->getLoggedUser();

        $products = $this->DpProduct->getOrdersProducts(array($order['ID']));

        try {
            $totalPriceResult = $this->getTotalPrice($products);
            $totalPrice = $totalPriceResult['totalPrice'];
            $deliveryPriceGross = $this->getDeliveryPrice($products, true);
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }

        $data['products'] = $this->getProductsForPayment($products);
        $data['products'][] = array(
            'name' => 'delivery',
            'unitPrice' => $deliveryPriceGross,
            'quantity' => 1
        );
        $data['totalAmount'] = ($totalPrice + $deliveryPriceGross);
        $data['currencyCode'] = $this->getOrderCurrency();
        $data['extOrderId'] = $extOrderID;
        $data['orderID'] = $order['ID'];
        $data['buyer'] = array(
            'email' => $user['login'],
            'firstName' => $user['firstname'],
            'lastName' => $user['lastname'],
        );
        $payment = $this->PayU->doPayment($data);

        return $payment;
    }

    /**
     * @param $orderID
     * @return string
     */
    private function increaseOrderID($orderID)
    {
        $exp = explode('_', $orderID);
        $number = intval($exp[0]);

        if (intval($exp[1]) == 0) {
            $ver = 1;
        } else {
            $ver = intval($exp[1]) + 1;
        }

        return $number . '_' . $ver;
    }

    /**
     * @return mixed
     * @throws Exception
     */
    public function patch_updatePrice()
    {
        $tokenInfo = $this->Auth->getTokenInfo();

        $data['response'] = false;

        $this->Setting->setLang(NULL);
        $defaultCurrencyID = $this->Setting->getValue('defaultCurrency');
        $defaultCurrencyEntity = $this->Currency->getOne($defaultCurrencyID);

        $mongoSession = $this->MgSession->getAdapter()->findOne(array(
            'sid' => $tokenInfo->sessionID
        ));

        if ($mongoSession->orderID > 0) {
            $order = $this->DpOrder->getOne($mongoSession->orderID);
        } else {
            return array('response' => false, 'info' => 'no order in session');
        }

        $res = $this->DpProduct->getOrdersProducts(array($order['ID']));

        $aggregateCoupons = array();
        $sortedOrderCoupons = array();

        $couponOrders = $this->CouponOrder->get('orderID', $order['ID'], true);
        foreach ($couponOrders as $couponOrder) {
            $aggregateCoupons[] = $couponOrder['couponID'];
            $sortedOrderCoupons[$couponOrder['productID']] = $couponOrder;
        }

        foreach ($res as $key => $product) {
            $res[$key]['coupon'] = $sortedOrderCoupons[$product['productID']];
        }

        $coupons = $this->Coupon->getByList($aggregateCoupons);

        $productUpdated = array();
        $messages = array();

        $removedWorstCoupon = 0;

        foreach ($res as $product) {

            $updateRecords = 0;

            $discount = null;
            $discountedPrice = null;
            $couponInfo = $coupons[$product['coupon']['couponID']];

            if ($product['coupon']['priceUpdated']) {
                continue;
            }

            $calcPrice = $this->BasePrice->get('ID', $product['calcPriceID']);
            $price = $this->BasePrice->get('ID', $product['priceID']);
            $tax = $this->Tax->customGet($price['taxID']);

            $basePrice = $calcPrice['price'];
            if (intval($product['amount']) > 1) {
                $basePrice *= intval($product['amount']);
            }

            if ($couponInfo['percent']) {
                $discount = ($basePrice * $couponInfo['value']) / 100;

                $discountedPrice = $basePrice - $discount;
            } else {
                if ($defaultCurrencyEntity['code'] == $price['currency']) {
                    $discountedPrice = $basePrice - ($couponInfo['value'] * 100);
                }
            }

            if ($discountedPrice && $discountedPrice <= $price['price']) {

                $worstCoupon = $this->CouponOrder->getByProduct($product['productID'], $couponInfo['ID']);

                if ($worstCoupon) {
                    if ($this->CouponOrder->delete('ID', $worstCoupon['ID'])) {
                        $removedWorstCoupon++;
                    }
                }

                if ($this->BasePrice->update($price['ID'], 'price', $discountedPrice)) {
                    $updateRecords++;
                }
                $discountedPriceGross = $discountedPrice * (1 + ($tax['value'] / 100));
                if ($this->BasePrice->update($price['ID'], 'grossPrice', $discountedPriceGross)) {
                    $updateRecords++;
                }

                if ($updateRecords === 2) {
                    $this->CouponOrder->update($product['coupon']['ID'], 'priceUpdated', 1);
                }
                $productUpdated[] = $product['productID'];
                $messages[] = 'coupon_correct_price_updated';
            } else {
                $messages[] = 'coupon_worse_than_discount';
            }
        }

        $data['messages'] = $messages;
        $data['removedWorstCoupon'] = $removedWorstCoupon;

        if (!empty($productUpdated)) {
            $data['response'] = true;
            return $data;
        }

        return $data;
    }

    /**
     * @return array
     * @throws Exception
     */
    public function patch_recalculateDelivery()
    {
        $post = $this->Data->getAllPost();

        $productAddresses = $post['productAddresses'];
        $active = $post['active'];

        $currencyCode = false;
        if (array_key_exists('currency', $post)) {
            $currencyCode = $post['currency'];
        }
        $commonDeliveryID = false;
        if (array_key_exists('commonDeliveryID', $post)) {
            $commonDeliveryID = $post['commonDeliveryID'];
        }

        if (!$productAddresses) {
            return $this->sendFailResponse('01');
        }

        $currencyEntity = $this->Currency->getByCode($currencyCode);

        $aggregateCalc = array();
        foreach ($productAddresses as $productAddress) {
            $aggregateCalc[] = $productAddress['calcID'];
        }

        $calculations = $this->UserCalc->getByList($aggregateCalc);

        $deletedPrices = 0;
        $updatedPrices = 0;

        if ($active) {

            $overallCalculateVolume = 0;
            $overallProductsVolume = 0;
            $overallWeight = 0;

            $firstProductAddress = current($productAddresses);

            foreach ($productAddresses as $productAddress) {

                $actCalculation = $calculations[$productAddress['calcID']];

                $overallCalculateVolume += ($actCalculation['volume'] * $actCalculation['amount']);
                $overallProductsVolume += $productAddress['allVolume'];
                $overallWeight += floatval($actCalculation['weight']);
            }

            $prices = $this->UserDeliveryPrice->getByCalcList($aggregateCalc, 0, 1);

            $deliveryPrice = $this->CalcDelivery->countDeliveryPrice(
                $commonDeliveryID,
                $overallCalculateVolume,
                $overallProductsVolume,
                $overallWeight
            );

            $params['priceID'] = $this->Price->setBasePrice(
                $deliveryPrice['price'],
                $deliveryPrice['taxID'],
                $currencyEntity
            );
            $params['calcID'] = $firstProductAddress['calcID'];
            $params['joined'] = 1;
            $params['active'] = 1;
            $params['productID'] = $firstProductAddress['productID'];
            $params['deliveryID'] = $commonDeliveryID;
            $params['volume'] = $overallProductsVolume;
            $lastDeliveryPriceID = $this->UserDeliveryPrice->create($params);

            if ($lastDeliveryPriceID > 0) {
                foreach ($prices as $price) {
                    $updatedPrices += intval($this->UserDeliveryPrice->update($price['ID'], 'active', 0));
                }
            }
        } else {

            $pricesJoined = $this->UserDeliveryPrice->getByCalcList($aggregateCalc, 1, 1);
            foreach ($pricesJoined as $price) {
                $deletedPrices += intval($this->UserDeliveryPrice->delete('ID', $price['ID']));
            }

            $prices = $this->UserDeliveryPrice->getByCalcList($aggregateCalc, 0, 0);
            foreach ($prices as $price) {
                $updatedPrices += intval($this->UserDeliveryPrice->update($price['ID'], 'active', 1));
            }
        }

        if ($updatedPrices > 0) {
            return array('response' => true, 'updatedPrices' => $updatedPrices, 'deletedPrices' => $deletedPrices);
        } else {
            return array('response' => false);
        }
    }

    /**
     * @return array
     * @throws Exception
     */
    public function patch_addToJoinedDelivery()
    {
        $post = $this->Data->getAllPost();

        $addressID = $post['addressID'];
        $currencyCode = $post['currency'];

        $tokenInfo = $this->Auth->getTokenInfo();

        $mongoSession = $this->MgSession->getAdapter()->findOne(array(
            'sid' => $tokenInfo->sessionID
        ));

        $productsInCart = array();
        if (!empty($mongoSession->Carts)) {
            foreach ($mongoSession->Carts as $ca) {
                $ca = (array)$ca;
                $cartObjectID = current($ca);

                $oneCart = $this->MgCart->getAdapter()->findOne(array(
                    '_id' => new MongoId($cartObjectID)
                ));

                $productsInCart[] = array(
                    'calcID' => $oneCart->calcID,
                    'orderID' => $oneCart->orderID,
                    'productID' => $oneCart->productID,
                    'ProductAddresses' => $oneCart->ProductAddresses,
                );
            }
        }

        $aggregateCalc = array();
        $lastCalc = 0;
        $paramsToCopy = array();
        foreach ($productsInCart as $product) {
            if (count($product['ProductAddresses']) == 1) {
                if ($product['ProductAddresses'][0]['addressID'] == $addressID &&
                    $product['ProductAddresses'][0]['join'] == true
                ) {
                    $aggregateCalc[] = $product['calcID'];
                    $paramsToCopy = $product['ProductAddresses'][0];
                }
                if ($product['calcID'] > $lastCalc) {
                    $lastCalc = $product['calcID'];
                }
            }
        }

        if (!empty($aggregateCalc)) {

            $currencyEntity = $this->Currency->getByCode($currencyCode);

            $deletedPrices = 0;
            $pricesJoined = $this->UserDeliveryPrice->getByCalcList($aggregateCalc, 1, 1);
            foreach ($pricesJoined as $price) {
                $deletedPrices += intval($this->UserDeliveryPrice->delete('ID', $price['ID']));
            }

            $aggregateCalc[] = $lastCalc;

            $calculations = $this->UserCalc->getByList($aggregateCalc);

            $overallCalculateVolume = 0;
            $overallWeight = 0;

            foreach ($aggregateCalc as $calcID) {

                $actCalculation = $calculations[$calcID];

                $overallCalculateVolume += ($actCalculation['volume'] * $actCalculation['amount']);
                $overallWeight += floatval($actCalculation['weight']);
            }

            $prices = $this->UserDeliveryPrice->getByCalcList($aggregateCalc, 0, 1);

            $deliveryPrice = $this->CalcDelivery->countDeliveryPrice(
                $paramsToCopy['commonDeliveryID'],
                $overallCalculateVolume,
                $overallCalculateVolume,
                $overallWeight
            );

            $params['priceID'] = $this->Price->setBasePrice(
                $deliveryPrice['price'],
                $deliveryPrice['taxID'],
                $currencyEntity
            );
            $params['calcID'] = $aggregateCalc[0];
            $params['joined'] = 1;
            $params['active'] = 1;
            $product = $this->DpProduct->getProductByCalcID($aggregateCalc[0]);
            $params['productID'] = $product['ID'];
            $params['deliveryID'] = $paramsToCopy['commonDeliveryID'];
            $lastDeliveryPriceID = $this->UserDeliveryPrice->create($params);

            $updatedPrices = 0;
            if ($lastDeliveryPriceID > 0) {
                foreach ($prices as $price) {
                    $updatedPrices += intval($this->UserDeliveryPrice->update($price['ID'], 'active', 0));
                }
            }
        } else {
            return array('response' => false);
        }

        return array(
            'response' => true,
            'deletedPrices' => $deletedPrices,
            'updatedPrices' => $updatedPrices,
            'paramsToCopy' => $paramsToCopy
        );
    }

    /**
     * @param null $orderID
     * @return bool
     */
    public function paymentRemind($orderID = NULL)
    {
        $paymentRemindData = $this->DpPaymentRemind->getForOrderID($orderID);

        return $paymentRemindData;
    }

    /**
     * @param $orderID
     * @return array
     * @throws Twig\Error\LoaderError
     * @throws Twig\Error\RuntimeError
     * @throws Twig\Error\SyntaxError
     */
    public function post_paymentRemind($orderID)
    {
        $post = $this->Data->getAllPost();
        $mailNum = $post['mailNum'];

        $order = $this->DpOrder->getOne($orderID);

        $existPaymentRemind = $this->DpPaymentRemind->getForOrderID($orderID);

        if ($existPaymentRemind['remindDate3'] != NULL) {
            return array(
                'response' => false,
                'mailNumber' => 3,
                'remindDate' => $existPaymentRemind['remindDate3'],
                'info' => 'remind_limit_has_reached'
            );
        }

        $user = $this->User->get('ID', $order['userID']);

        $products = $this->DpProduct->getOrdersProducts(array($orderID));

        if (!empty($products)) {
            foreach ($products as $pKey => $prod) {
                $languages = $this->PrintShopTypeLanguage->get('typeID', $prod['typeID'], true);
                if ($languages) {
                    foreach ($languages as $language) {
                        $products[$pKey]['names'][$language['lang']] = $language['name'];
                    }
                }
            }
        }

        $products = $this->Calculation->getCalcData($products);

        $sumPrice = 0;
        $sumGrossPrice = 0;
        $currency = DEFAULT_CURRENCY;
        foreach ($products as $attributes) {
            $sumPrice += $this->Price->getPriceToDb($attributes['price']);
            $sumGrossPrice += $this->Price->getPriceToDb($attributes['grossPrice']);
            $currency = $attributes['currency'];
        }

        $sumGrossPrice = $this->Price->getPriceToView($sumGrossPrice);

        $templateID = 105;
        $templateName = 'products-list-mail';

        $templateSetting = $this->TemplateSetting->getOne($templateID, 1);

        $templatePath = 'default/' . $templateID . '/' . $templateName . '.html';

        if ($templateSetting && $templateSetting['source'] == 1) {
            $templatePath = companyID . '/' . $templateID . '/' . $templateName . '.html';
        } elseif ($templateSetting && $templateSetting['source'] == 2) {
            $templatePath = companyID . '/' . $templateID . '/' . $this->getDomainID() . '/' . $templateName . '.html';
        }

        $loader = new FilesystemLoader(STATIC_PATH . 'templates');
        $twig = new Twig_Environment($loader, array());
        $twig->addExtension(new TranslateExtension());
        $template = $twig->load($templatePath);

        $lang = $this->prepareUserLanguage($user['ID']);

        $productsContent = $template->render(
            array(
                'products' => $products,
                'lang' => $lang
            )
        );

        if (filter_var($user['user'], FILTER_VALIDATE_EMAIL) !== false) {
            $this->Mail->setBind('orderID', $orderID);
            $this->Mail->setBind('order_date', date('Y-m-d', strtotime($order['created'])));
            $this->Mail->setBind('order_price', $sumGrossPrice . ' ' . $currency);
            $this->Mail->setBind('products_list', $productsContent);

            $send = $this->Mail->sendMail($user['login'], $user['name'], 'paymentReminder', $lang);
            if ($send) {
                $data['send'] = true;
                $this->DpPaymentRemind->addRemind($orderID, $mailNum);
            }
        } else {
            $this->debug('Problem with email: ' . $user['user']);
            $data['send'] = FALSE;
        }

        $data['response'] = true;
        $data['mailNumber'] = $mailNum;
        $data['remindDate'] = date('Y-m-d H:i:s');
        return $data;
    }

    /**
     * @param $orderID
     * @return array
     */
    public function getOrderInvoiceAddress($orderID)
    {
        $invoiceOrderAddress = $this->DpOrderAddress->getByOrder($orderID, 2);

        if (!$invoiceOrderAddress) {
            return array();
        }

        $invoiceAddress = $this->Address->get('ID', $invoiceOrderAddress['addressID']);

        return $invoiceAddress;
    }

    /**
     * @param $orderID
     * @return array
     */
    public function patch_changeOrderPrice($orderID)
    {
        $post = $this->Data->getAllPost();
        $loggedUser = $this->Auth->getLoggedUser();

        $result = array();
        $saved = 0;
        $percentEmpty = $valueEmpty = false;

        $reclamation = $this->Reclamation->get('orderID', $orderID);

        if ($reclamation['pricesChanged'] == 1) {
            return array('response' => false, 'info' => 'prices_have_already_changed');
        }

        if (isset($post['pricesPercent']) && !empty($post['pricesPercent'])) {

            $pricesPercent = $post['pricesPercent'];

            foreach ($pricesPercent as $productID => $percent) {

                $percent = intval($percent);

                if ($percent == 0) {
                    continue;
                }

                if ($percent < 1 || $percent > 100) {
                    $result['info'] = 'enter_percentage_value';
                    continue;
                }

                $percentMath = $percent / 100;

                $newGrossPrice = NULL;

                $product = $this->DpProduct->get('ID', $productID);

                if ($product['orderID'] != $orderID) {
                    continue;
                }

                $order = $this->DpOrder->get('ID', $product['orderID']);
                $calc = $this->UserCalc->getOne($product['calcID']);
                $price = $this->BasePrice->get('ID', $calc['priceID']);
                $newPrice = round($price['price'] - ($price['price'] * $percentMath), 0);
                $copyID = $this->BasePrice->copy($calc['priceID']);


                if ($copyID > 0) {
                    $this->BasePrice->update($copyID, 'date', date('Y-m-d H:i:s'));
                    $this->BasePrice->update($copyID, 'price', $newPrice);
                    if ($order['domainID'] > 0) {
                        $this->Tax->setDomainID($order['domainID']);
                    } else {
                        $this->Tax->setDomainID($this->getDomainID());
                    }
                    $tax = $this->Tax->customGet($price['taxID']);
                    $newGrossPrice = round($newPrice * (1 + ($tax['value'] / 100)), 0);
                    $this->BasePrice->update($copyID, 'grossPrice', $newGrossPrice);
                    $this->BasePrice->update($copyID, 'copyFromID', $price['ID']);
                    $this->UserCalc->update($calc['ID'], 'operatorID', $loggedUser['ID']);
                    $this->UserCalc->update($calc['ID'], 'modified', date('Y-m-d H:i:s'));
                    $this->UserCalc->update($calc['ID'], 'priceID', $copyID);

                    if ($this->Reclamation->update($reclamation['ID'], 'pricesChanged', 1)) {
                        $saved++;
                    }
                }

                $result['discountPercent'][$productID] = array(
                    'oldPrice' => $price['price'],
                    'newPrice' => $newPrice,
                    'newGrossPrice' => $newGrossPrice
                );
            }

        } else {
            $percentEmpty = true;
        }

        if (isset($post['prices']) && !empty($post['prices'])) {

            $prices = $post['prices'];

            foreach ($prices as $productID => $newPrice) {

                if ($newPrice <= 0) {
                    continue;
                }

                $product = $this->DpProduct->get('ID', $productID);

                if ($product['orderID'] != $orderID) {
                    continue;
                }

                $order = $this->DpOrder->get('ID', $product['orderID']);
                $calc = $this->UserCalc->getOne($product['calcID']);
                $price = $this->BasePrice->get('ID', $calc['priceID']);

                $newPrice = $this->Price->getPriceToDb($newPrice);

                if ($newPrice > $price['price']) {
                    $result['info'] = 'value_cant_be_higher_than_current_price';
                    continue;
                }
                $copyID = $this->BasePrice->copy($calc['priceID']);

                if ($copyID > 0) {
                    $this->BasePrice->update($copyID, 'date', date('Y-m-d H:i:s'));
                    $this->BasePrice->update($copyID, 'price', $newPrice);
                    if ($order['domainID'] > 0) {
                        $this->Tax->setDomainID($order['domainID']);
                    } else {
                        $this->Tax->setDomainID($this->getDomainID());
                    }
                    $tax = $this->Tax->customGet($price['taxID']);
                    $newGrossPrice = round($newPrice * (1 + ($tax['value'] / 100)), 0);
                    $this->BasePrice->update($copyID, 'grossPrice', $newGrossPrice);
                    $this->BasePrice->update($copyID, 'copyFromID', $price['ID']);
                    $this->UserCalc->update($calc['ID'], 'operatorID', $loggedUser['ID']);
                    $this->UserCalc->update($calc['ID'], 'modified', date('Y-m-d H:i:s'));
                    $this->UserCalc->update($calc['ID'], 'priceID', $copyID);

                    $reclamation = $this->Reclamation->get('orderID', $order['ID']);
                    if ($this->Reclamation->update($reclamation['ID'], 'pricesChanged', 1)) {
                        $saved++;
                    }

                    $result['discountPercent'][$productID] = array(
                        'oldPrice' => $price['price'],
                        'newPrice' => $newPrice,
                        'newGrossPrice' => $newGrossPrice
                    );
                }
            }

        } else {
            $valueEmpty = true;
        }

        if ($percentEmpty && $valueEmpty) {
            $result['info'] = 'must_set_price_percent_or_value';
        }

        if ($saved > 0) {
            $result['saved'] = true;
        } else {
            $result['saved'] = false;
        }

        return $result;
    }

    /**
     * @param $orderID
     * @return array
     */
    public function patch_restoreOrderPrice($orderID)
    {
        $loggedUser = $this->Auth->getLoggedUser();

        $reclamation = $this->Reclamation->get('orderID', $orderID);
        $productsAggregate = explode(',', $reclamation['products']);

        $products = $this->DpProduct->getByList($productsAggregate);

        $restored = 0;
        foreach ($products as $product) {
            $calc = $this->UserCalc->getOne($product['ID']);
            $price = $this->BasePrice->get('ID', $calc['priceID']);
            $this->UserCalc->update($calc['ID'], 'operatorID', $loggedUser['ID']);
            $this->UserCalc->update($calc['ID'], 'modified', date('Y-m-d H:i:s'));

            if ($price['copyFromID'] > 0) {
                if ($this->UserCalc->update($calc['ID'], 'priceID', $price['copyFromID'])) {
                    $restored++;
                    $this->BasePrice->delete('ID', $price['ID']);
                    $this->Reclamation->update($reclamation['ID'], 'pricesChanged', 0);
                }
            }
        }

        if ($restored > 0) {
            return array('response' => true);
        } else {
            return $this->sendFailResponse('13');
        }
    }

    /**
     * @param $orderID
     * @return array
     */
    public function patch_addAddress($orderID)
    {

        $post = $this->Data->getAllPost();
        $createdJoins = 0;

        $orderAddresses = $post['addresses'];

        $response = false;

        if (!empty($orderAddresses)) {

            foreach ($orderAddresses as $calcID => $productAddresses) {

                foreach ($productAddresses as $address) {
                    $params = array();
                    $params['orderID'] = $orderID;
                    $copiedID = $this->Address->copy($address['addressID']);
                    $params['senderID'] = $address['senderID'];
                    $params['addressID'] = $copiedID;

                    $params['deliveryID'] = $address['deliveryID'];
                    if ($address['commonDeliveryID']) {
                        $params['deliveryID'] = $address['commonDeliveryID'];
                    }

                    if ($address['commonDeliveryID'] && $address['join'] == true) {
                        $params['joined'] = 1;
                    }

                    $params['type'] = 1;
                    $lastID = $this->DpOrderAddress->create($params);
                    if ($lastID > 0) {
                        $params = array();
                        $params['orderAddressID'] = $lastID;
                        $oneProduct = $this->DpProduct->get('calcID', $calcID);
                        $params['productID'] = $oneProduct['ID'];
                        if (!empty($address['allVolume'])) {
                            $params['volume'] = $address['allVolume'];
                        }
                        $added = $this->DpOrderAddressProduct->create($params);
                        if (!$added) {
                            $response = false;
                        }
                    }
                    $createdJoins++;
                    unset($lastID);
                }
            }
        }

        if ($createdJoins > 0) {
            $response = true;
        }

        return array('response' => $response);
    }

    /**
     * @param $orderID
     * @return array
     * @throws Exception
     */
    public function patch_changeAddresses($orderID)
    {
        $productID = $this->Data->getPost('productID');
        $post = $this->Data->getAllPost();

        $product = $this->DpProduct->get('ID', $productID);

        $productAddresses = $post['productAddresses'];

        $data['response'] = false;

        $deliveryPrices = $this->UserDeliveryPrice->get('calcID', $product['calcID'], true);

        foreach ($deliveryPrices as $deliveryPrice) {
            if ($deliveryPrice['joined'] == 1) {
                return $this->sendFailResponse('11');
            }
        }

        $calc = $this->UserCalc->getOne($product['calcID']);
        $price = $this->BasePrice->get('ID', $calc['priceID']);

        $currencyEntity = $this->Currency->getByCode($price['currency']);

        $calculations = $this->UserCalc->getByList(array($product['calcID']));
        $calculation = current($calculations);

        $data['deletedOldPrices'] = $this->UserDeliveryPrice->delete('calcID', $product['calcID']);

        $saved = 0;

        if (!empty($productAddresses)) {

            foreach ($productAddresses as $partAddress) {

                $deliveryPrice = $this->CalcDelivery->countDeliveryPrice(
                    $partAddress['deliveryID'],
                    $partAddress['allVolume'],
                    $calculation['volume'],
                    $calculation['weight'],
                    $calculation['amount'],
                    $calculation
                );

                $params['priceID'] = $this->Price->setBasePrice(
                    $deliveryPrice['price'],
                    $deliveryPrice['taxID'],
                    $currencyEntity
                );
                $params['calcID'] = $product['calcID'];
                $params['joined'] = 0;
                $params['active'] = 1;
                $params['productID'] = $productID;
                $params['volume'] = $partAddress['allVolume'];
                $params['deliveryID'] = $partAddress['deliveryID'];
                if (array_key_exists('parcelShopID', $partAddress)) {
                    $params['parcelShopID'] = $partAddress['parcelShopID'];
                }
                $lastDeliveryPriceID = $this->UserDeliveryPrice->create($params);
                if ($lastDeliveryPriceID > 0) {
                    $saved++;
                }
            }

        }

        if ($saved > 0) {
            $data['response'] = true;
            $data['saved'] = $saved;
        }

        return $data;
    }

    /**
     * @param $orderID
     * @return bool
     */
    public function fileReminder($orderID)
    {
        $fileRemindData = $this->FileReminder->getForOrderID($orderID);

        return $fileRemindData;
    }

    /**
     * @param $orderID
     * @return array
     * @throws Twig\Error\LoaderError
     * @throws Twig\Error\RuntimeError
     * @throws Twig\Error\SyntaxError
     */
    public function post_fileReminder($orderID)
    {
        $post = $this->Data->getAllPost();
        $mailNum = $post['mailNum'];

        $order = $this->DpOrder->getOne($orderID);

        $existFileReminder = $this->FileReminder->getForOrderID($orderID);

        if ($existFileReminder['remindDate3'] != NULL) {
            return array(
                'response' => false,
                'mailNumber' => 3,
                'remindDate' => $existFileReminder['remindDate3'],
                'info' => 'remind_limit_has_reached'
            );
        }

        $user = $this->User->get('ID', $order['userID']);

        $products = $this->DpProduct->getOrdersProducts(array($orderID));

        if (!empty($products)) {
            foreach ($products as $pKey => $prod) {
                $languages = $this->PrintShopTypeLanguage->get('typeID', $prod['typeID'], true);
                if ($languages) {
                    foreach ($languages as $language) {
                        $products[$pKey]['names'][$language['lang']] = $language['name'];
                    }
                }
            }
        }

        $products = $this->Calculation->getCalcData($products);

        $sumPrice = 0;
        $sumGrossPrice = 0;
        $currency = DEFAULT_CURRENCY;
        foreach ($products as $attributes) {
            $sumPrice += $this->Price->getPriceToDb($attributes['price']);
            $sumGrossPrice += $this->Price->getPriceToDb($attributes['grossPrice']);
            $currency = $attributes['currency'];
        }

        $sumGrossPrice = $this->Price->getPriceToView($sumGrossPrice);

        $templateID = 105;
        $templateName = 'products-list-mail';

        $templateSetting = $this->TemplateSetting->getOne($templateID, 1);

        $templatePath = 'default/' . $templateID . '/' . $templateName . '.html';

        if ($templateSetting && $templateSetting['source'] == 1) {
            $templatePath = companyID . '/' . $templateID . '/' . $templateName . '.html';
        } elseif ($templateSetting && $templateSetting['source'] == 2) {
            $templatePath = companyID . '/' . $templateID . '/' . $this->getDomainID() . '/' . $templateName . '.html';
        }

        $loader = new FilesystemLoader(STATIC_PATH . 'templates');
        $twig = new Twig_Environment($loader, array());
        $twig->addExtension(new TranslateExtension());
        $template = $twig->load($templatePath);

        $lang = $this->prepareUserLanguage($user['ID']);

        $productsContent = $template->render(
            array(
                'products' => $products,
                'lang' => $lang
            )
        );

        if (filter_var($user['user'], FILTER_VALIDATE_EMAIL) !== false) {
            $this->Mail->setBind('orderID', $orderID);
            $this->Mail->setBind('order_date', date('Y-m-d', strtotime($order['created'])));
            $this->Mail->setBind('order_price', $sumGrossPrice . ' ' . $currency);
            $this->Mail->setBind('products_list', $productsContent);

            $send = $this->Mail->sendMail($user['login'], $user['name'], 'fileReminder', $lang);
            if ($send) {
                $data['send'] = true;
                $this->FileReminder->addRemind($orderID, $mailNum);
            }
        } else {
            $this->debug('Problem with email: ' . $user['user']);
            $data['send'] = FALSE;
        }

        $data['response'] = true;
        $data['mailNumber'] = $mailNum;
        $data['remindDate'] = date('Y-m-d H:i:s');
        return $data;
    }

    /**
     * @param $products
     * @param $ID
     * @return array|null
     */
    private function findProduct($products, $ID)
    {

        if (!$products) {
            return null;
        }

        foreach ($products as $product) {
            if ($product['productID'] == $ID) {
                return $product;
            }
        }

        return null;

    }

    /**
     * @param $userID
     * @return array|bool
     */
    private function prepareUserLanguage($userID)
    {
        $lang = false;
        $userOption = $this->UserOption->get('uID', $userID);

        if ($userOption && $userOption['lang']) {
            $lang = $userOption['lang'];
        }

        if (!$lang) {
            $this->Setting->setModule('general');
            $this->Setting->setLang(NULL);
            $defaultLangID = $this->Setting->getValue('defaultLang');
            $defaultLangEntity = $this->LangSetting->getByID($defaultLangID);
            $lang = $defaultLangEntity['code'];
        }

        return $lang;
    }

    /**
     * @param $collectionPoints
     * @param $ID
     * @return bool|array
     */
    private function selectCollectionPoint($collectionPoints, $ID)
    {
        foreach ($collectionPoints as $row) {
            if( $row['ID'] == $ID ) {
                return $row;
            }
        }
        return false;
    }

}
