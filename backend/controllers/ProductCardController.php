<?php

use DreamSoft\Controllers\Components\Calculation;
use DreamSoft\Controllers\Components\Filter;
use DreamSoft\Controllers\Components\Price;
use DreamSoft\Models\Address\Address;
use DreamSoft\Models\Delivery\Delivery;
use DreamSoft\Models\Delivery\DeliveryName;
use DreamSoft\Models\Order\DpOrderAddress;
use DreamSoft\Models\Order\DpOrderAddressProduct;
use DreamSoft\Models\Order\DpProductFile;
use DreamSoft\Models\Order\OrderMessage;
use DreamSoft\Models\Coupon\CouponOrder;
use DreamSoft\Models\Price\ConfPrice;
use DreamSoft\Models\PrintShopUser\UserCalc;
use DreamSoft\Models\PrintShopUser\UserCalcProductAttribute;
use DreamSoft\Models\PrintShopUser\UserDeliveryPrice;
use DreamSoft\Models\Template\TemplateSetting;
use \Milon\Barcode\DNS1D;
use DreamSoft\Libs\TwigExtensions\TranslateExtension;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeLanguage;
use DreamSoft\Models\PrintShopUser\UserCalcProduct;
use DreamSoft\Models\Currency\Currency;
use DreamSoft\Models\Order\DpOrder;
use DreamSoft\Models\Order\DpProduct;
use DreamSoft\Models\PrintShopProduct\PrintShopGroup;
use DreamSoft\Models\Price\BasePrice;
use Twig\Loader\FilesystemLoader;
use Twig\Environment as Twig_Environment;
use Spipu\Html2Pdf\Html2Pdf;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Core\Controller;
use DreamSoft\Models\User\User;
use DreamSoft\Models\User\UserOption;

class ProductCardController extends Controller
{

    public $useModels = array();

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
     * @var PrintShopGroup
     */
    protected $PrintShopGroup;
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
     * @var OrderMessage
     */
    protected $OrderMessage;
    /**
     * @var CouponOrder
     */
    protected $CouponOrder;
    /**
     * @var TemplateSetting
     */
    protected $TemplateSetting;
    /**
     * @var UserOption
     */
    protected $UserOption;

    /**
     * ProductCardController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);

        $this->Price = Price::getInstance();
        $this->Filter = Filter::getInstance();
        $this->Calculation = Calculation::getInstance();

        $this->User = User::getInstance();
        $this->DpOrder = DpOrder::getInstance();
        $this->DpProduct = DpProduct::getInstance();
        $this->DpOrderAddress = DpOrderAddress::getInstance();
        $this->DpOrderAddressProduct = DpOrderAddressProduct::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopGroup = PrintShopGroup::getInstance();
        $this->UserCalcProduct = UserCalcProduct::getInstance();
        $this->UserCalcProductAttribute = UserCalcProductAttribute::getInstance();
        $this->DpProductFile = DpProductFile::getInstance();
        $this->DeliveryName = DeliveryName::getInstance();
        $this->Delivery = Delivery::getInstance();
        $this->ConfPrice = ConfPrice::getInstance();
        $this->Currency = Currency::getInstance();
        $this->UserCalc = UserCalc::getInstance();
        $this->Setting = Setting::getInstance();
        $this->Setting->setModule('general');
        $this->UserDeliveryPrice = UserDeliveryPrice::getInstance();
        $this->BasePrice = BasePrice::getInstance();
        $this->Address = Address::getInstance();
        $this->PrintShopTypeLanguage = PrintShopTypeLanguage::getInstance();
        $this->TemplateSetting = TemplateSetting::getInstance();
        $this->UserOption = UserOption::getInstance();
        $this->OrderMessage = OrderMessage::getInstance();
        $this->CouponOrder = CouponOrder::getInstance();

        $this->setConfigs();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        parent::setDomainID($domainID);
        $this->Setting->setDomainID($domainID);
        $this->Currency->setDomainID($domainID);
        $this->TemplateSetting->setDomainID($domainID);
    }

    public function setConfigs()
    {
        $this->configs = array(
            'ID' => array('type' => 'string', 'table' => 'dp_products', 'field' => 'ID', 'sign' => $this->Filter->signs['e']),
            'orderID' => array('type' => 'string', 'table' => 'dp_products', 'field' => 'orderID', 'sign' => $this->Filter->signs['e']),
            'dateFrom' => array('type' => 'timestamp', 'table' => 'dp_products', 'field' => 'created', 'sign' => $this->Filter->signs['gt']),
            'dateTo' => array('type' => 'timestamp', 'table' => 'dp_products', 'field' => 'created', 'sign' => $this->Filter->signs['lt']),
            'production' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'production', 'sign' => $this->Filter->signs['e']),
            'isOrder' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'isOrder', 'sign' => $this->Filter->signs['e']),
            'ready' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'ready', 'sign' => $this->Filter->signs['e']),
            'accept' => array('type' => 'string', 'table' => 'dp_products', 'field' => 'accept', 'sign' => $this->Filter->signs['e'], 'default' => 0),
            'userID' => array('type' => 'string', 'table' => 'dp_orders', 'field' => 'userID', 'sign' => $this->Filter->signs['e']),
        );
    }

    /**
     * @param $productID
     * @return array
     */
    public function productCard($productID)
    {

        $product = $this->DpProduct->get('ID', $productID);
        if (!$product) {
            $this->sendFailResponse('06');
        }

        $orderID = $product['orderID'];


        $res = $this->DpProduct->getOrdersProducts(array($orderID));

        if( !empty($res) ){
            foreach ($res as $pKey => $prod) {
                $languages = $this->PrintShopTypeLanguage->get('typeID', $prod['typeID'], true);
                if( $languages ){
                    foreach($languages as $ln){
                        $res[$pKey]['names'][$ln['lang']] = $ln['name'];
                    }
                }
            }
        }

        $res = $this->Calculation->getCalcData($res);

        foreach ($res as $pKey => $product) {

            if (!empty($product['calcProducts'])) {
                foreach ($product['calcProducts'] as $cpKey => $calcProduct) {
                    $languages = $this->PrintShopTypeLanguage->get('typeID', $calcProduct['typeID'], true);
                    if ($languages) {
                        foreach ($languages as $ln) {
                            $res[$pKey]['calcProducts'][$cpKey]['names'][$ln['lang']] = $ln['name'];
                        }
                    }
                }
            }
        }

        $addressesResult = $this->DpOrderAddress->getOrdersAddresses(array($orderID));

        $order = $this->DpOrder->get('ID', $orderID);

        $addresses = array();
        $invoiceAddress = array();
        if($addressesResult) {
            foreach($addressesResult as $each) {
                if($each['type'] == 2) {
                    $invoiceAddress[$order['ID']] = $each;
                    continue;
                }
                if(!isset($addresses[$order['ID']])) {
                    $addresses[$order['ID']] = array();
                }
                $addresses[$order['ID']][] = $each;
            }
        }

        $deliveryAddresses = $this->prepareAddresses($addresses, $productID);

        $countProductFiles = $this->DpProductFile->countByProduct($productID);
        $productFiles = $this->DpProductFile->getByProduct($productID);
        $productFile = NULL;
        if( $productFiles ) {
            $productFile = current($productFiles);
            $explodeName = explode('.', $productFile['name']);
            $ext = end($explodeName);
            if( $ext == 'pdf' ) {
                array_pop($explodeName);
                $minImageName = implode('.', $explodeName).'.jpg';
            } else {
                $minImageName = $productFile['name'];
            }
            $date = date( 'Y-m-d', strtotime($productFile['created']) );
            $productFile['minUrl'] = STATIC_URL.companyID.'/'.'productFiles/'. $date .'/'. $productFile['folder'] .'/'.$productFile['productID'].'/'.$productFile['ID'].'/'.THUMB_IMAGE_PREFIX.$minImageName;
        }

        $userDefaultAddress = $this->Address->getDefault($order['userID'], 1);

        $user = $this->User->get('ID', $order['userID']);
        $userDefaultAddress['login'] = $user['login'];

        $userOption = $this->UserOption->get('uID', $user['ID']);
        $user['options'] = $userOption;

        $data = array();

        $lang = lang;
        if( $user['options'] && $user['options']['lang'] ) {
            $lang = $user['options']['lang'];
        }

        $data['productsInfo'] = array();
        $data['product'] = array();
        foreach ($res as $calc) {
            if( $productID == $calc['productID']) {
                $data['product'] = $calc;
                $data['productsInfo'][] = array(
                    'name' => $calc['names'][$lang],
                    'ID' => $calc['productID'],
                    'selected' => true
                );
            } else {
                $data['productsInfo'][] = array(
                    'name' => $calc['names'][$lang],
                    'ID' => $calc['productID']
                );
            }
        }

        $orderMessage = $this->OrderMessage->getOne($orderID, 1);

        $coupons = $this->CouponOrder->getByProducts(array($productID));

        $coupon = false;
        if( $coupons[$productID] ) {
            $coupon = current($coupons[$productID]);
        }

        $types = $this->prepareTypes($data['product']);
        $groups = $this->prepareGroups($data['product']);
        $data['countSubProducts'] = count($data['product']['calcProducts']);
        $data['productID'] = $productID;
        $data['countProductFiles'] = $countProductFiles;
        $data['productFile'] = $productFile;
        $data['userData'] = $userDefaultAddress;
        $data['user'] = $user;
        $data['deliveryAddresses'] = $deliveryAddresses;
        $data['types'] = $types;
        $data['groups'] = $groups;
        $data['orderMessage'] = $orderMessage;
        $data['coupon'] = $coupon;

        return $data;
    }

    /**
     * @param $products
     * @return array|bool
     */
    private function prepareTypes($products)
    {
        $aggregateTypes = array();
        foreach ($products['calcProducts'] as $subProduct) {
            $aggregateTypes[] = $subProduct['typeID'];
        }

        $types = $this->PrintShopType->getByList2($aggregateTypes);

        return $types;
    }

    private function prepareGroups($products)
    {
        $aggregateGroups = array();
        foreach ($products['calcProducts'] as $subProduct) {
            $aggregateGroups[] = $subProduct['groupID'];
        }

        $groups = $this->PrintShopGroup->customGetByList($aggregateGroups);

        return $groups;
    }

    /**
     * @param $addresses
     * @param $productID
     * @return array
     */
    private function prepareAddresses($addresses, $productID)
    {
        $addresses = current($addresses);
        $allProductAddress = array();
        $aggregateAddress = array();
        $deliveriesAggregate = array();
        foreach($addresses as $address) {
            $aggregateAddress[$address['orderAddressID']] = $address;
            $deliveriesAggregate[] = $address['deliveryID'];
            foreach($address['separateProducts'] as $separateProduct) {
                if( $separateProduct['productID'] == $productID ) {
                    $allProductAddress[] = array(
                        'orderAddressID' => $separateProduct['orderAddressID'],
                        'volume' => $separateProduct['volume'],
                        'deliveryID' => $address['deliveryID']
                    );
                }
            }
        }

        $deliveries = $this->Delivery->customGetByList($deliveriesAggregate);

        $dNames = $this->DeliveryName->getNames($deliveriesAggregate);
        foreach ($deliveries as $key => $delivery) {
            $deliveries[$key]['deliveryNames'] = $dNames[$delivery['ID']];
        }

        foreach($allProductAddress as $key => $oneAddress) {
            $allProductAddress[$key]['address'] = $aggregateAddress[$oneAddress['orderAddressID']];
            $allProductAddress[$key]['delivery'] = $deliveries[$oneAddress['deliveryID']];
        }

        return $allProductAddress;
    }

    /**
     * @param $productID
     * @return array
     */
    public function generateCard($productID)
    {

        //include_once(BASE_DIR . '/libs/html2pdf/html2pdf.class.php');

        $html2pdf = new Html2Pdf('P', 'A4', 'en');
        $html2pdf->setTestTdInOnePage(false);

        $productData = $this->productCard($productID);

        $pages = intval($productData['countSubProducts']) > 0 ? $productData['countSubProducts'] : 1;

        $content = '';
        for($i=1;$i<=$pages;$i++) {
            $content .= $this->getCardHTML($productData, $i);
        }

        $html2pdf->writeHTML($content);
        if (!is_dir(MAIN_UPLOAD . companyID . '/' . 'productCards/' . $productID)) {
            mkdir(MAIN_UPLOAD . companyID . '/' . 'productCards/' . $productID, 0777);
        }
        $path = MAIN_UPLOAD . companyID . '/' . 'productCards/' . $productID . '/karta_' . $productID . '.pdf';
        try {
            $newPDF = $html2pdf->Output($path, 'F');
        } catch (Exception $exception) {
            $this->debug('Html2Pdf exception: ' . $exception->getMessage());
        }

        $link = STATIC_URL . companyID . '/productCards/' . $productID . '/karta_' . $productID . '.pdf';
        $res = array();
        $res['productData'] = $productData;
        $res['link'] = $link;
        $res['success'] = true;
        return $res;
    }

    public function getCardHTML($productData, $page = 1)
    {

        $this->setDebugFile('card');

        $subProduct = $productData['product']['calcProducts'][$page-1];
        $calc = $productData['product'];

        $attributes = $subProduct['attributes'];

        $invoiceData = current($productData['invoiceAddress']);

        $complexProduct = NULL;
        if( intval($productData['countSubProducts']) > 1 ) {
            $complexProduct['names'] = $calc['names'];
            $complexProduct['pages'] = intval($productData['countSubProducts']);
        }

        $templateID = 111;
        $templateName = 'card-product-print';

        $templateSetting = $this->TemplateSetting->getOne($templateID, 1);

        $templatePath = 'default/'. $templateID .'/'. $templateName .'.html';

        if( $templateSetting && $templateSetting['source'] == 1 ) {
            $templatePath = companyID . '/'. $templateID .'/'. $templateName .'.html';
        } elseif( $templateSetting && $templateSetting['source'] == 2 ) {
            $templatePath = companyID . '/'. $templateID .'/'. $this->getDomainID() .'/'. $templateName .'.html';
        }

        $loader = new FilesystemLoader(STATIC_PATH . 'templates');

        $twig = new Twig_Environment($loader, array(
            //'cache' => '/path/to/compilation_cache',
        ));
        $twig->addExtension(new TranslateExtension());

        $template = $twig->load($templatePath);

        $productFile = NULL;
        if($productData['productFile']['minUrl']) {
            if( is_file($productData['productFile']['minUrl']) ) {
                try {
                    $imagick = new Imagick($productData['productFile']['minUrl']);
                } catch (ImagickException $e) {
                    $this->debug('Imagick error: ' . $e->getMessage());
                }
                $productFile = base64_encode($imagick->getImageBlob());
            }
        }

        $logoUrl = STATIC_URL.'uploadedFiles'.'/'.companyID.'/'.'logos/' . $this->getDomainID() . '/logo';
        $logoPath = STATIC_PATH .'uploadedFiles'.'/'.companyID.'/'.'logos/' . $this->getDomainID() . '/logo';

        if (!filter_var($logoUrl, FILTER_VALIDATE_URL) === false) {
            $imagickLogo = false;
            $ext = false;
            try {

                $contentType =mime_content_type($logoPath);
                switch( $contentType ) {
                    case "image/jpeg":
                        $ext = 'jpg';
                        break;
                    case "image/gif":
                        $ext = 'gif';
                        break;
                    case "image/png":
                        $ext = 'png';
                        break;
                    case "image/svg+xml":
                        $ext = 'svg';
                        break;
                }
                if( $ext ) {
                    $imagickLogo = new Imagick($ext . ':' . $logoPath);
                } else {
                    $imagickLogo = new Imagick($logoUrl);
                }
            } catch (ImagickException $e) {
                $this->debug('Imagick error: ' . $e->getMessage());
            }
            if( $imagickLogo ) {
                if($ext) {
                    $imagickLogo->setImageFormat($ext);
                } else {
                    $imagickLogo->setImageFormat('png');
                }
                $companyLogo = base64_encode($imagickLogo->getImageBlob());
            } else {
                $companyLogo = NULL;
            }
        } else {
            $companyLogo = NULL;
        }

        $cardID = $calc['productID'];
        if( $complexProduct) {
            $cardID .= 'c';
        } else {
            $cardID .= 'p';
        }
        $cardID .= $subProduct['ID'];

        $d = new DNS1D();
        $d->setStorPath(BASE_DIR."cache/");
        $barCode = $d->getBarcodeHTML($cardID, "C128");

        $lang = lang;
        if( $productData['user']['options'] && $productData['user']['options']['lang'] ) {
            $lang = $productData['user']['options']['lang'];
        }

        $content = $template->render(
            array(
                'invoice' => $invoiceData,
                'attributes' => $attributes,
                'lang' => $lang,
                'subProduct' => $subProduct,
                'calc' => $calc,
                'countFiles' => $productData['countProductFiles'],
                'productFile' => $productFile,
                'complexProduct' => $complexProduct,
                'page' => $page,
                'userData' => $productData['userData'],
                'deliveryAddresses' => $productData['deliveryAddresses'],
                'logo' => $companyLogo,
                'types' => $productData['types'],
                'groups' => $productData['groups'],
                'cardID' => $cardID,
                'barCode' => $barCode,
                'orderMessage' => $productData['orderMessage'],
                'coupon' => $productData['coupon'],
                'productsInfo' => $productData['productsInfo']
            )
        );

        return $content;
    }

    /**
     * @param $productID
     * @return array
     */
    public function generateXML( $productID )
    {
        $doc = new DOMDocument('1.0', 'UTF-8');

        $doc->formatOutput = true;

        $root = $doc->createElement('products');
        $root = $doc->appendChild($root);

        $name = $doc->createElement('name');
        $name = $root->appendChild($name);

        try {
            $product = $this->getProductData($productID);
        } catch ( Exception $e ) {
            $this->debug($e->getMessage());
            return $this->sendFailResponse('06');
        }

        $productName = $doc->createTextNode($product['calcProduct']['typeName']);
        $productName = $name->appendChild($productName);

        $attributes = $doc->createElement('attributes');
        $attributes = $root->appendChild($attributes);

        foreach($product['attributes'] as $attribute) {
            $actualAttribute = $doc->createElement(str_replace(' ', '_', $attribute['attribute']));
            $actualAttribute = $attributes->appendChild($actualAttribute);
            $actualOption = $doc->createTextNode($attribute['option']);
            $actualAttribute = $actualAttribute->appendChild($actualOption);
        }

        $format = $doc->createElement('format');
        $format = $root->appendChild($format);


        $this->addChildElement($doc, $format, 'name', $product['calcProduct']['formatName']);
        $this->addChildElement($doc, $format, 'width', $product['calcProduct']['formatWidth']);
        $this->addChildElement($doc, $format, 'height', $product['calcProduct']['formatHeight']);
        $this->addChildElement($doc, $format, 'slope', $product['calcProduct']['formatSlope']);

        $pages = $doc->createElement('pages');
        $pages = $root->appendChild($pages);

        $pagesNumber = $doc->createTextNode($product['calcProduct']['pages']);
        $pagesNumber = $pages->appendChild($pagesNumber);

        $volume = $doc->createElement('volume');
        $volume = $root->appendChild($volume);

        $volumeValue = $doc->createTextNode($product['userCalc']['volume']);
        $volumeValue = $volume->appendChild($volumeValue);

        $purchaser = $doc->createElement('purchaser');
        $purchaser = $root->appendChild($purchaser);

        $purchaserValue = $doc->createTextNode($product['userData']['name'].' '.$product['userData']['lastname']);
        $purchaserValue = $purchaser->appendChild($purchaserValue);

        $invoice = $doc->createElement('invoice');
        $invoice = $root->appendChild($invoice);

        $this->addChildElement($doc, $invoice, 'firstname', $product['invoiceAddress']['name']);
        $this->addChildElement($doc, $invoice, 'lastname', $product['invoiceAddress']['lastname']);
        $this->addChildElement($doc, $invoice, 'zipcode', $product['invoiceAddress']['zipcode']);
        $this->addChildElement($doc, $invoice, 'city', $product['invoiceAddress']['city']);
        $this->addChildElement($doc, $invoice, 'street', $product['invoiceAddress']['street']);
        $this->addChildElement($doc, $invoice, 'house', $product['invoiceAddress']['house']);
        $this->addChildElement($doc, $invoice, 'apartment', $product['invoiceAddress']['apartment']);
        $this->addChildElement($doc, $invoice, 'telephone', $product['invoiceAddress']['telephone']);

        $deliveryAddresses = $doc->createElement('deliveryAddresses');
        $deliveryAddresses = $root->appendChild($deliveryAddresses);

        foreach( $product['sendAddresses'] as $sendAddress ) {

            $addressElement = $doc->createElement('address');
            $addressElement = $deliveryAddresses->appendChild($addressElement);

            $this->addChildElement($doc, $addressElement, 'delivery', $sendAddress['delivery']['deliveryNames'][lang]);
            $this->addChildElement($doc, $addressElement, 'volume', $sendAddress['volume']);
            $this->addChildElement($doc, $addressElement, 'name', $sendAddress['address']['name']);
            $this->addChildElement($doc, $addressElement, 'lastname', $sendAddress['address']['lastname']);
            $this->addChildElement($doc, $addressElement, 'zipcode', $sendAddress['address']['zipcode']);
            $this->addChildElement($doc, $addressElement, 'city', $sendAddress['address']['city']);
            $this->addChildElement($doc, $addressElement, 'street', $sendAddress['address']['street']);
            $this->addChildElement($doc, $addressElement, 'house', $sendAddress['address']['house']);
            $this->addChildElement($doc, $addressElement, 'apartment', $sendAddress['address']['apartment']);
            $this->addChildElement($doc, $addressElement, 'telephone', $sendAddress['address']['telephone']);

            unset($addressElement);
        }

        if (!is_dir(MAIN_UPLOAD . companyID . '/' . 'productXml/' . $productID)) {
            mkdir(MAIN_UPLOAD . companyID . '/' . 'productXml/' . $productID, 0777);
        }
        $path = MAIN_UPLOAD . companyID . '/' . 'productXml/' . $productID . '/opis_pracy_' . $productID . '.xml';

        $xmlData = $doc->saveXML();

        file_put_contents($path, $xmlData);

        $link = STATIC_URL . companyID . '/productXml/' . $productID . '/opis_pracy_' . $productID . '.xml';

        $response = array();
        $response['xml'] = $xmlData;
        $response['link'] = $link;
        $response['success'] = true;
        return $response;
    }


    private function getProductData( $productID )
    {
        $result = array();

        $product = $this->DpProduct->get('ID', $productID);
        if( !$product ) {
            throw new Exception('Product not exist');
        }

        $calc = $this->UserCalc->customGet($product['calcID']);

        $result['userCalc'] = $calc;

        $attributes = $this->UserCalcProductAttribute->getByCalcProductIds(array('1' => $product['calcID']));

        $result['attributes'] = $this->getAttributeNames($attributes);

        $calcProduct = current($this->UserCalcProduct->getByCalcIds(array('1' => $product['calcID'])));

        $result['calcProduct'] = current($calcProduct);

        $orderID = $product['orderID'];
        $order = $this->DpOrder->get('ID', $orderID);

        $userData = $this->User->get('ID', $order['userID']);
        unset($userData['pass']);

        $result['userData'] = $userData;

        $result['invoiceAddress'] = current($this->DpOrderAddress->getOrdersAddresses(array($orderID)));

        $productAddresses = $this->DpOrderAddressProduct->getByProduct($productID, 1);

        $addressesAggregate = array();
        $deliveriesAggregate = array();
        foreach($productAddresses as $productAddress) {
            $addressesAggregate[] = $productAddress['addressID'];
            $deliveriesAggregate[] = $productAddress['deliveryID'];
        }

        $addresses = $this->Address->getByList($addressesAggregate);

        $deliveries = $this->Delivery->customGetByList($deliveriesAggregate);

        $deliveryPriceArr = array();
        foreach ($deliveries as $delivery) {
            $deliveryPriceArr[] = $delivery['priceID'];
        }
        $deliveryPrices = $this->ConfPrice->customGetByList($deliveryPriceArr);

        $dNames = $this->DeliveryName->getNames($deliveriesAggregate);
        foreach ($deliveries as $key => $delivery) {
            $deliveries[$key]['deliveryNames'] = $dNames[$delivery['ID']];
            $deliveries[$key]['deliveryPrice'] = $deliveryPrices[$delivery['priceID']];
        }

        foreach($productAddresses as $key => $productAddress) {
            $productAddresses[$key]['address'] = $addresses[$productAddress['addressID']];
            $productAddresses[$key]['delivery'] = $deliveries[$productAddress['deliveryID']];
        }

        $result['sendAddresses'] = $productAddresses;

        return $result;
    }

    /**
     * @param array $attributes
     * @return array
     */
    private function getAttributeNames(array $attributes)
    {
        $result = array();
        $attributes = current($attributes);
        foreach($attributes as $attribute) {
            $result[] = array(
                'attribute' => $attribute['langs'][lang]['name'],
                'option' => $attribute['optLangs'][lang]['name']
            );
        }

        return $result;
    }

    /**
     * @param $doc
     * @param $parentElement
     * @param $name
     * @param $value
     * @return mixed
     */
    private function addChildElement($doc, $parentElement, $name, $value)
    {
        $element = $doc->createElement($name);
        $element = $parentElement->appendChild($element);

        $elementValue = $doc->createTextNode($value);
        $elementValue = $element->appendChild($elementValue);

        return $doc;
    }

}
