<?php
/**
 * Programista Rafał Leśniak - 13.7.2017
 */

/**
 * Programista Rafał Leśniak - 13.7.2017
 */

use DreamSoft\Controllers\Components\Calculation;
use DreamSoft\Controllers\Components\Filter;
use DreamSoft\Controllers\Components\InvoiceComponent;
use DreamSoft\Controllers\Components\Price;
use \DreamSoft\Libs\TwigExtensions\TranslateExtension;
use DreamSoft\Models\Address\Address;
use DreamSoft\Models\Delivery\Delivery;
use DreamSoft\Models\Delivery\DeliveryName;
use DreamSoft\Models\Order\DpOrderAddress;
use DreamSoft\Models\Order\DpOrderAddressProduct;
use DreamSoft\Models\Order\DpProductFile;
use DreamSoft\Models\Price\ConfPrice;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeLanguage;
use DreamSoft\Models\PrintShopUser\UserCalc;
use DreamSoft\Models\PrintShopUser\UserCalcProduct;
use DreamSoft\Models\Payment\Payment;
use DreamSoft\Models\Currency\Currency;
use DreamSoft\Models\PrintShopUser\UserCalcProductAttribute;
use DreamSoft\Models\PrintShopUser\UserDeliveryPrice;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\Order\DpOrder;
use DreamSoft\Models\Order\DpProduct;
use DreamSoft\Models\Order\DpInvoice;
use DreamSoft\Models\Tax\Tax;
use DreamSoft\Models\Price\BasePrice;
use DreamSoft\Models\Template\TemplateSetting;
use Twig\Loader\FilesystemLoader;
use Twig\Environment as Twig_Environment;
use DreamSoft\Models\Setting\Content;
use DreamSoft\Models\User\User;
use DreamSoft\Core\Controller;
use DreamSoft\Models\User\UserOption;

use Spipu\Html2Pdf\Html2Pdf;

include_once(BASE_DIR . 'libs/PolishNumbers/Kwota.php');

/**
 * Class InvoicesController
 */
class InvoicesController extends Controller
{
    public $useModels = array(
        'DpOrderAddress' => array('package' => 'Order'),
        'DpOrderAddressProduct' => array('package' => 'Order'),
        'UserCalcProductAttribute' => array('package' => 'PrintShopUser'),
        'UserCalc' => array('package' => 'PrintShopUser'),
        'UserDeliveryPrice' => array('package' => 'PrintShopUser'),
        'DpProductFile' => array('package' => 'Order'),
        'DeliveryName',
        'Delivery',
        'ConfPrice',
        'Address',
        'TemplateSetting' => array('package' => 'Template')
    );

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
     * @var PrintShopType
     */
    protected $PrintShopType;
    /**
     * @var UserCalcProduct
     */
    protected $UserCalcProduct;
    /**
     * @var UserCalcProductAttribute
     */
    protected $UserCalcProductAttribute;
    /**
     * @var DpProductFile
     */
    protected $DpProductFile;
    /**
     * @var Price
     */
    protected $Price;
    /**
     * @var Filter
     */
    protected $Filter;
    /**
     * @var User
     */
    protected $User;
    /**
     * @var DeliveryName
     */
    protected $DeliveryName;
    /**
     * @var Delivery
     */
    protected $Delivery;
    /**
     * @var ConfPrice
     */
    protected $ConfPrice;
    /**
     * @var Setting
     */
    protected $Setting;
    /**
     * @var Content
     */
    protected $Content;
    /**
     * @var Currency
     */
    protected $Currency;
    /**
     * @var UserCalc
     */
    protected $UserCalc;
    /**
     * @var UserDeliveryPrice
     */
    protected $UserDeliveryPrice;
    /**
     * @var BasePrice
     */
    protected $BasePrice;
    /**
     * @var Address
     */
    protected $Address;
    /**
     * @var PrintShopTypeLanguage
     */
    protected $PrintShopTypeLanguage;
    /**
     * @var Calculation
     */
    protected $Calculation;
    /**
     * @var Tax
     */
    protected $Tax;
    /**
     * @var Payment
     */
    protected $Payment;
    /**
     * @var DpInvoice
     */
    protected $DpInvoice;
    /**
     * @var InvoiceComponent
     */
    protected $InvoiceComponent;
    /**
     * @var TemplateSetting
     */
    protected $TemplateSetting;
    /**
     * @var UserOption
     */
    protected $UserOption;

    public function __construct($params)
    {
        parent::__construct($params);

        $this->Price = Price::getInstance();
        $this->Filter = Filter::getInstance();
        $this->Calculation = Calculation::getInstance();
        $this->InvoiceComponent = InvoiceComponent::getInstance();

        $this->User = User::getInstance();
        $this->DpOrder = DpOrder::getInstance();
        $this->DpProduct = DpProduct::getInstance();
        $this->DpOrderAddress = DpOrderAddress::getInstance();
        $this->DpOrderAddressProduct = DpOrderAddressProduct::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->UserCalcProduct = UserCalcProduct::getInstance();
        $this->UserCalcProductAttribute = UserCalcProductAttribute::getInstance();
        $this->DpProductFile = DpProductFile::getInstance();
        $this->DeliveryName = DeliveryName::getInstance();
        $this->Delivery = Delivery::getInstance();
        $this->ConfPrice = ConfPrice::getInstance();
        $this->Currency = Currency::getInstance();
        $this->UserCalc = UserCalc::getInstance();
        $this->Setting = Setting::getInstance();
        $this->Content = Content::getInstance();
        $this->Setting->setModule('general');
        $this->UserDeliveryPrice = UserDeliveryPrice::getInstance();
        $this->BasePrice = BasePrice::getInstance();
        $this->Address = Address::getInstance();
        $this->PrintShopTypeLanguage = PrintShopTypeLanguage::getInstance();
        $this->Tax = Tax::getInstance();
        $this->Payment = Payment::getInstance();
        $this->DpInvoice = DpInvoice::getInstance();
        $this->TemplateSetting = TemplateSetting::getInstance();
        $this->UserOption = UserOption::getInstance();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        parent::setDomainID($domainID);
        $this->Setting->setDomainID($domainID);
        $this->Currency->setDomainID($domainID);
        $this->Tax->setDomainID($domainID);
        $this->InvoiceComponent->setDomainID($domainID);
        $this->Content->setDomainID($domainID);
        $this->TemplateSetting->setDomainID($domainID);
    }

    public function invoiceData($orderID)
    {

        $res = $this->DpProduct->getOrdersProducts(array($orderID));

        $aggregateTaxes = array();
        if (!empty($res)) {
            foreach ($res as $pKey => $row) {
                $aggregateTaxes[] = $row['taxID'];
                $languages = $this->PrintShopTypeLanguage->get('typeID', $row['typeID'], true);
                if ($languages) {
                    foreach ($languages as $language) {
                        $res[$pKey]['names'][$language['lang']] = $language['name'];
                    }
                }
            }
        }


        $addressesResult = $this->DpOrderAddress->getOrdersAddresses(array($orderID));

        $order = $this->DpOrder->get('ID', $orderID);

        if( $order['domainID'] ) {
            $this->Tax->setDomainID($order['domainID']);
        }

        $allTaxes = $this->Tax->getAll(1);

        usort ( $allTaxes, array($this, 'sortVat') );

        $indexedTaxes = array();
        foreach($allTaxes as $oneTax) {
            $oneTax['sumPrice'] = 0;
            $oneTax['sumVat'] = 0;
            $oneTax['sumGrossPrice'] = 0;
            $indexedTaxes[$oneTax['ID']] = $oneTax;
        }

        $paymentInfo = $this->Payment->getByList(array($order['paymentID']));
        $payment = $paymentInfo[$order['paymentID']];

        $addresses = array();
        if ($addressesResult) {
            foreach ($addressesResult as $each) {
                if ($each['type'] == 2) {
                    continue;
                }
                if (!isset($addresses[$order['ID']])) {
                    $addresses[$order['ID']] = array();
                }
                $addresses[$order['ID']][] = $each;
            }
        }

        $taxes = $this->Tax->getByList($aggregateTaxes);

        $deliveries = array();
        $overallGrossPrice = 0;
        $overallPrice = 0;
        $mainCurrency = null;
        $sumTaxes = 0;

        $deliveryIndexes = array();

        foreach ($res as $key => $row) {

            $overallGrossPrice += $row['grossPrice'];
            $overallPrice += $row['price'];
            $mainCurrency = $row['currency'];

            if (isset($taxes[$row['taxID']])) {
                $res[$key]['tax'] = $taxes[$row['taxID']];
                $res[$key]['tax']['onlyTaxValue'] = $row['grossPrice'] - $row['price'];
                if( isset($indexedTaxes[$row['taxID']]['sumVat']) ) {
                    $indexedTaxes[$row['taxID']]['sumVat'] += $row['tax']['onlyTaxValue'];
                } else {
                    $indexedTaxes[$row['taxID']]['sumVat'] = $row['tax']['onlyTaxValue'];
                }
                $sumTaxes += $row['tax']['onlyTaxValue'];
                $res[$key]['tax']['onlyTaxValue'] = $this->Price->getPriceToView($row['tax']['onlyTaxValue']);
                if( isset($indexedTaxes[$row['taxID']]['sumPrice']) ) {
                    $indexedTaxes[$row['taxID']]['sumPrice'] += $row['price'];
                } else {
                    $indexedTaxes[$row['taxID']]['sumPrice'] = $row['price'];
                }
                if( isset($indexedTaxes[$row['taxID']]['sumGrossPrice']) ) {
                    $indexedTaxes[$row['taxID']]['sumGrossPrice'] += $row['grossPrice'];
                } else {
                    $indexedTaxes[$row['taxID']]['sumGrossPrice'] = $row['grossPrice'];
                }
                $res[$key]['tax']['onlyTaxValueCounted'] = $this->Price->getPriceToView(($row['price'] * ($row['tax']['value'] / 100)));
                if ($row['tax']['onlyTaxValue'] != $row['tax']['onlyTaxValueCounted']) {
                    $this->debug('Problem with price!!!');
                }
            }
            $res[$key]['pricePerUnit'] = $this->Price->getPriceToView($row['price'] / $row['volume']);

            $deliveryPrices = $this->UserDeliveryPrice->get('calcID', $row['calcID'], true);

            $deliveryPrice = 0;
            $deliveryPriceGross = 0;
            if (!empty($deliveryPrices)) {
                foreach ($deliveryPrices as $dp) {
                    if ($dp['active'] == 0) {
                        continue;
                    }
                    $actDeliveryPrice = $this->BasePrice->get('ID', $dp['priceID']);
                    $deliveryTaxID = $actDeliveryPrice['taxID'];
                    $deliveryCurrency = $actDeliveryPrice['currency'];
                    $deliveryPrice += $actDeliveryPrice['price'];
                    $deliveryPriceGross += $actDeliveryPrice['grossPrice'];
                }
            }

            $res[$key]['deliveryJoined'] = $this->searchJoinedAddress($addresses[$row['orderID']], $row['productID']);

            if (!isset($deliveryIndexes[$row['orderID']][$row['deliveryJoined']]) && $row['deliveryJoined'] > 0) {
                $deliveryIndexes[$row['orderID']][$row['deliveryJoined']] = count($deliveryIndexes[$row['orderID']]) + 1;
            }
            if ($row['deliveryJoined'] > 0) {
                $res[$key]['deliveryJoinedIndex'] = $deliveryIndexes[$row['orderID']][$row['deliveryJoined']];
                $res[$key]['productsJoined'] = $this->searchProductJoined($res, $row['productID'], $row['deliveryJoined']);
            }

            $res[$key]['deliveryPrice'] = $deliveryPrice;
            $res[$key]['deliveryPriceGross'] = $deliveryPriceGross;

            if ($deliveryPrice > 0) {
                $overallGrossPrice += $deliveryPriceGross;
                $overallPrice += $deliveryPrice;

                $deliveryTax = $this->Tax->customGet($deliveryTaxID);

                $oneDelivery = array();
                if (isset($row['productsJoined'])) {
                    array_push($row['productsJoined'], $row['productID']);
                    $oneDelivery['forProducts'] = implode(',', $row['productsJoined']);
                } else {
                    $oneDelivery['forProducts'] = $row['productID'];
                }
                $oneDelivery['deliveryPrice'] = $this->Price->getPriceToView($deliveryPrice);
                $oneDelivery['deliveryPriceGross'] = $this->Price->getPriceToView($deliveryPriceGross);
                $oneDelivery['tax'] = $deliveryTax;
                $oneDelivery['tax']['onlyTaxValue'] = $deliveryPriceGross - $deliveryPrice;
                if( isset($indexedTaxes[$row['taxID']]['sumVat']) ) {
                    $indexedTaxes[$row['taxID']]['sumVat'] += $oneDelivery['tax']['onlyTaxValue'];
                } else {
                    $indexedTaxes[$row['taxID']]['sumVat'] = $oneDelivery['tax']['onlyTaxValue'];
                }
                $sumTaxes += $oneDelivery['tax']['onlyTaxValue'];
                $oneDelivery['tax']['onlyTaxValue'] = $this->Price->getPriceToView($oneDelivery['tax']['onlyTaxValue']);
                if( isset($indexedTaxes[$row['taxID']]['sumPrice']) ) {
                    $indexedTaxes[$row['taxID']]['sumPrice'] += $deliveryPrice;
                } else {
                    $indexedTaxes[$row['taxID']]['sumPrice'] = $deliveryPrice;
                }
                if( isset($indexedTaxes[$row['taxID']]['sumGrossPrice']) ) {
                    $indexedTaxes[$row['taxID']]['sumGrossPrice'] += $deliveryPriceGross;
                } else {
                    $indexedTaxes[$row['taxID']]['sumGrossPrice'] = $deliveryPriceGross;
                }
                $oneDelivery['tax']['onlyTaxValueCounted'] = $this->Price->getPriceToView(($deliveryPrice * ($deliveryTax['value'] / 100)));
                $oneDelivery['currency'] = $deliveryCurrency;

                $deliveries[] = $oneDelivery;
            }

        }

        $res = $this->Calculation->getCalcData($res);

        foreach ($res as $pKey => $product) {

            if (!empty($product['calcProducts'])) {
                foreach ($product['calcProducts'] as $cpKey => $calcProduct) {
                    $languages = $this->PrintShopTypeLanguage->get('typeID', $calcProduct['typeID'], true);
                    if ($languages) {
                        foreach ($languages as $language) {
                            $res[$pKey]['calcProducts'][$cpKey]['names'][$language['lang']] = $language['name'];
                        }
                    }
                }
            }
        }

        $userDefaultAddress = $this->Address->getDefault($order['userID'], 1);

        $user = $this->User->get('ID', $order['userID']);
        $userDefaultAddress['login'] = $user['login'];

        $user['options'] = $this->UserOption->get('uID', $user['ID']);

        $lang = lang;
        if( $user['options'] && $user['options']['lang'] ) {
            $lang = $user['options']['lang'];
        }

        $invoiceEntity = $this->DpInvoice->getOne($orderID, VAT_INVOICE_TYPE);
        if (!$invoiceEntity) {
            $invoiceEntity = $this->DpInvoice->getOne($orderID, PROFORMA_INVOICE_TYPE);
        }
        $invoiceNumber = $this->InvoiceComponent->prepareInvoiceNumber($invoiceEntity);

        $invoiceAddress = null;
        if ($invoiceEntity) {
            $invoiceAddress = $this->Address->get('ID', $invoiceEntity['addressID']);
        }

        $this->Setting->setModule('invoiceData');
        $this->Setting->setLang(NULL);

        $companyData = $this->Setting->getAllByModule();

        $this->Content->setLang($lang);
        $this->Content->setModule('invoice');
        $invoiceText = $this->Content->getValue('invoiceText');

        if ( $invoiceText ) {
            $invoiceText = str_replace('{ORDER_ID}', $orderID, $invoiceText);
            $invoiceText = str_replace('{INVOICE_DATE}', $invoiceEntity['documentDate'], $invoiceText);
            $invoiceText = str_replace('{BANK_ACCOUNT}', $companyData['bankAccount']['value'], $invoiceText);
        }

        foreach ($indexedTaxes as $key => $oneTax) {
            $indexedTaxes[$key]['sumGrossPrice'] = $this->Price->getPriceToView($oneTax['sumGrossPrice']);
            $indexedTaxes[$key]['sumPrice'] = $this->Price->getPriceToView($oneTax['sumPrice']);
            $indexedTaxes[$key]['sumVat'] = $this->Price->getPriceToView($oneTax['sumVat']);
        }

        $data = array();

        $data['products'] = $res;
        $data['deliveries'] = $deliveries;
        $data['overallGrossPrice'] = $this->Price->getPriceToView($overallGrossPrice);
        $data['overallPrice'] = $this->Price->getPriceToView($overallPrice);
        $data['currency'] = $mainCurrency;
        $data['amountInWords'] = Kwota::getInstance()->slownie($overallGrossPrice / 100);
        $data['payment'] = $payment;
        $data['invoiceNumber'] = $invoiceNumber;
        $data['invoice'] = $invoiceEntity;
        $data['invoiceAddress'] = $invoiceAddress;
        $data['companyData'] = $companyData;
        $data['sumTaxes'] = $this->Price->getPriceToView($sumTaxes);
        $data['indexedTaxes'] = $indexedTaxes;
        $data['invoiceText'] = $invoiceText;
        $data['userData'] = $user;

        return $data;
    }

    /**
     * @param int $a
     * @param int $b
     * @return bool
     */
    private function sortVat($a, $b)
    {
        if($a['value'] == $b['value']) {
            return 0;
        }
        return ($a['value'] < $b['value']) ? -1 : 1;
    }

    /**
     * @param $addresses
     * @param $productID
     * @return bool
     */
    private function searchJoinedAddress($addresses, $productID)
    {

        foreach ($addresses as $address) {
            if ($address['joined'] == 1 && count($address['separateProducts']) == 1) {
                if ($address['separateProducts'][0]['productID'] == $productID) {
                    return $address['copyFromID'];
                }
            }
        }

        return false;
    }

    /**
     * @param $products
     * @param $productID
     * @param $addressID
     * @return array
     */
    private function searchProductJoined($products, $productID, $addressID)
    {

        $foundProducts = array();
        foreach ($products as $product) {
            if ($product['deliveryJoined'] == $addressID && $product['productID'] != $productID) {
                $foundProducts[] = $product['productID'];
            }
        }

        return $foundProducts;
    }

    /**
     * @param $orderID
     * @return array
     */
    public function generate($orderID)
    {
        $html2pdf = new Html2Pdf('P', 'A4', 'en');
        $html2pdf->addFont('freesans', 'regular', BASE_DIR.'libs/tcpdf/fonts/freesans.php');
        $html2pdf->setDefaultFont('freesans');

        $invoiceData = $this->invoiceData($orderID);

        $content = '';

        try {
            $content .= $this->getInvoiceHTML($invoiceData);
        } catch ( Exception $exception ) {
            $res['success'] = false;
            $res['info'] = $exception->getMessage();
            return $res;
        }


        $html2pdf->writeHTML($content);

        if (!is_dir(MAIN_UPLOAD . companyID . '/' . 'orderInvoices/' . $orderID)) {
            mkdir(MAIN_UPLOAD . companyID . '/' . 'orderInvoices/' . $orderID, 0777);
        }
        $path = MAIN_UPLOAD . companyID . '/' . 'orderInvoices/' . $orderID . '/faktura_' . $orderID . '.pdf';

        $res = array();

        try {

            $html2pdf->Output($path, 'F');
            $link = STATIC_URL . companyID . '/orderInvoices/' . $orderID . '/faktura_' . $orderID . '.pdf';
            $res['path'] = $path;
            $res['invoiceData'] = $invoiceData;
            $res['link'] = $link;
            $res['success'] = true;
            return $res;

        } catch (Exception $exception) {

            $res['success'] = false;
            $res['info'] = $exception->getMessage();
            return $res;

        }

    }

    /**
     * @param $invoiceData
     * @return string
     * @throws ImagickException
     * @throws Twig\Error\LoaderError
     * @throws Twig\Error\RuntimeError
     * @throws Twig\Error\SyntaxError
     */
    public function getInvoiceHTML($invoiceData)
    {

        $products = $invoiceData['products'];

        $loader = new FilesystemLoader(STATIC_PATH . 'templates');

        $twig = new Twig_Environment($loader, array());
        $twig->addExtension(new TranslateExtension());

        $templateID = 110;
        $templateName = 'invoice-print';

        $templateSetting = $this->TemplateSetting->getOne($templateID, 1);

        $templatePath = 'default/'. $templateID .'/'. $templateName .'.html';

        if( $templateSetting && $templateSetting['source'] == 1 ) {
            $templatePath = companyID . '/'. $templateID .'/'. $templateName .'.html';
        } elseif( $templateSetting && $templateSetting['source'] == 2 ) {
            $templatePath = companyID . '/'. $templateID .'/'. $this->getDomainID() .'/'. $templateName .'.html';
        }

        $template = $twig->load($templatePath);

        $logoFile = MAIN_UPLOAD . 'uploadedFiles' . '/' . companyID . '/' . 'logo';

        if ( is_file($logoFile) ) {
            $imagickLogo = new Imagick($logoFile);
            $imagickLogo->setImageFormat('png');
            $companyLogo = base64_encode($imagickLogo->getImageBlob());
        } else {
            $companyLogo = NULL;
        }

        $lang = lang;
        if( isset($invoiceData['userData']['options']['lang']) &&
           strlen($invoiceData['userData']['options']['lang']) > 0 ) {
            $lang = $invoiceData['userData']['options']['lang'];
        }

        $content = $template->render(
            array(
                'lang' => $lang,
                'userData' => $invoiceData['userData'],
                'deliveryAddresses' => $invoiceData['deliveryAddresses'],
                'logo' => $companyLogo,
                'types' => $invoiceData['types'],
                'products' => $products,
                'base_dir' => BASE_DIR,
                'deliveries' => $invoiceData['deliveries'],
                'overallGrossPrice' => $invoiceData['overallGrossPrice'],
                'overallPrice' => $invoiceData['overallPrice'],
                'currency' => $invoiceData['currency'],
                'amountInWords' => $invoiceData['amountInWords'],
                'payment' => $invoiceData['payment'],
                'invoice' => $invoiceData['invoice'],
                'invoiceNumber' => $invoiceData['invoiceNumber'],
                'invoiceAddress' => $invoiceData['invoiceAddress'],
                'companyData' => $invoiceData['companyData'],
                'sumTaxes' => $invoiceData['sumTaxes'],
                'indexedTaxes' => $invoiceData['indexedTaxes'],
                'invoiceText' => $invoiceData['invoiceText']
            )
        );

        return $content;
    }

    /**
     * @return array
     */
    public function patch_changeInvoiceType()
    {
        $post = $this->Data->getAllPost();

        $orderID = $post['orderID'];
        $type = $post['type'];

        $invoiceExist = $this->DpInvoice->getOne($orderID, $type);
        if ($invoiceExist) {
            return $this->sendFailResponse('08');
        }

        if ($type == VAT_INVOICE_TYPE) {

            $lastID = $this->InvoiceComponent->changeInvoiceToVat($orderID);
        }

        if ($lastID > 0) {
            return array('response' => true, 'invoiceID' => $lastID);
        }

        return $this->sendFailResponse('03');
    }

    public function getForUser( $orderID )
    {
        $loggedUser = $this->Auth->getLoggedUser();

        $order = $this->DpOrder->get('ID', $orderID);

        if( $loggedUser['ID'] != $order['userID'] ) {
            return $this->sendFailResponse('12');
        }

        $generated = $this->generate( $orderID );
        if( $generated['success'] == true ) {
            $file = $generated['path'];
            header("Content-Length: " . filesize ( $file ) );
            header("Content-type: application/octet-stream");
            header("Content-disposition: attachment; filename=".basename($file));
            header('Expires: 0');
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            ob_clean();
            flush();
            readfile($file);
            exit;
        }

        return $this->sendFailResponse('13');
    }
}