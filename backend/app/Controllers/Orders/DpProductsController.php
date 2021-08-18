<?php

namespace DreamSoft\Controllers\Orders;

use DreamSoft\Controllers\Components\Filter;
use DreamSoft\Controllers\Components\Mail;
use DreamSoft\Controllers\Components\Price;
use DreamSoft\Models\Address\Address;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\Order\DpOrderAddress;
use DreamSoft\Models\Order\DpOrderAddressProduct;
use DreamSoft\Models\Order\DpProductFile;
use DreamSoft\Models\PrintShopUser\UserCalc;
use DreamSoft\Models\PrintShopUser\UserCalcProductAttribute;
use DreamSoft\Models\PrintShopUser\UserCalcProductSpecialAttribute;
use DreamSoft\Libs\TwigExtensions\TranslateExtension;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopUser\UserCalcProduct;
use DreamSoft\Controllers\Components\ProductionPath;
use DreamSoft\Models\ProductionPath\Ongoing;
use DreamSoft\Models\Mongo\MgSession;
use DreamSoft\Models\Order\DpOrder;
use DreamSoft\Models\Order\DpProduct;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Price\BasePrice;
use DreamSoft\Models\Template\TemplateSetting;
use Exception;
use DreamSoft\Models\Setting\Setting;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;
use Twig\Loader\FilesystemLoader;
use Twig\Environment as Twig_Environment;
use DreamSoft\Models\User\User;
use DreamSoft\Models\User\UserOption;

/**
 * Description of DpProductsController
 *
 * @author Rafał
 */
class DpProductsController extends Controller
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
     * @var BasePrice
     */
    protected $BasePrice;
    /**
     * @var MgSession
     */
    protected $MgSession;
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
     * @var Address
     */
    protected $Address;
    /**
     * @var Mail
     */
    protected $Mail;
    /**
     * @var UserCalc
     */
    protected $UserCalc;
    /**
     * @var User
     */
    protected $User;
    /**
     * @var TemplateSetting
     */
    protected $TemplateSetting;
    /**
     * @var UserCalcProductSpecialAttribute
     */
    protected $UserCalcProductSpecialAttribute;
    /**
     * @var UserOption
     */
    protected $UserOption;
    /**
     * @var ProductionPath
     */
    private $ProductionPath;
    /**
     * @var Ongoing
     */
    private $Ongoing;
    /**
     * @var Setting
     */
    private $Setting;
    /**
     * @var LangSetting
     */
    private $LangSetting;
    /**
     * @var array
     */
    private $configs;

    public function __construct($params)
    {

        parent::__construct($params);

        $this->Price = Price::getInstance();
        $this->Filter = Filter::getInstance();

        $this->DpOrder = DpOrder::getInstance();
        $this->DpProduct = DpProduct::getInstance();
        $this->DpOrderAddress = DpOrderAddress::getInstance();
        $this->BasePrice = BasePrice::getInstance();
        $this->MgSession = MgSession::getInstance();
        $this->DpOrderAddressProduct = DpOrderAddressProduct::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->UserCalcProduct = UserCalcProduct::getInstance();
        $this->UserCalcProductAttribute = UserCalcProductAttribute::getInstance();
        $this->DpProductFile = DpProductFile::getInstance();
        $this->Address = Address::getInstance();
        $this->Mail = Mail::getInstance();
        $this->UserCalc = UserCalc::getInstance();
        $this->User = User::getInstance();
        $this->TemplateSetting = TemplateSetting::getInstance();
        $this->UserCalcProductSpecialAttribute = UserCalcProductSpecialAttribute::getInstance();
        $this->UserOption = UserOption::getInstance();
        $this->ProductionPath = new ProductionPath();
        $this->Ongoing = Ongoing::getInstance();
        $this->Setting = Setting::getInstance();
        $this->LangSetting = LangSetting::getInstance();

        $this->setConfigs();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        parent::setDomainID($domainID);
        $this->Mail->setDomainID($domainID);
        $this->TemplateSetting->setDomainID($domainID);
        $this->LangSetting->setDomainID($domainID);
    }

    public function setConfigs()
    {
        $this->configs = array(
            'ID' => array('type' => 'string', 'table' => 'dp_products', 'field' => 'ID', 'sign' => $this->Filter->signs['e']),
            'orderID' => array('type' => 'string', 'table' => 'dp_products', 'field' => 'orderID', 'sign' => $this->Filter->signs['e']),
            'dateFrom' => array('type' => 'timestamp', 'table' => 'dp_products', 'field' => 'created', 'sign' => $this->Filter->signs['gt']),
            'dateTo' => array('type' => 'timestamp', 'table' => 'dp_products', 'field' => 'created', 'sign' => $this->Filter->signs['lt']),
            'production' => array('type' => 'string', 'table' => 'orders', 'alias' => true, 'field' => 'production', 'sign' => $this->Filter->signs['e']),
            'isOrder' => array('type' => 'string', 'table' => 'orders', 'alias' => true, 'field' => 'isOrder', 'sign' => $this->Filter->signs['e']),
            'ready' => array('type' => 'string', 'table' => 'orders', 'alias' => true, 'field' => 'ready', 'sign' => $this->Filter->signs['e']),
            'accept' => array('type' => 'string', 'table' => 'dp_products', 'field' => 'accept', 'sign' => $this->Filter->signs['e'], 'default' => 0),
            'userID' => array('type' => 'string', 'table' => 'orders', 'alias' => true, 'field' => 'userID', 'sign' => $this->Filter->signs['li']),
            'name' => array('type' => 'string', 'table' => 'typeLanguages', 'alias' => true, 'field' => 'name', 'sign' => $this->Filter->signs['li']),
            'volumeFrom' => array('type' => 'string', 'table' => 'calculate', 'alias' => true, 'field' => 'volume', 'sign' => $this->Filter->signs['gt']),
            'volumeTo' => array('type' => 'string', 'table' => 'calculate', 'alias' => true, 'field' => 'volume', 'sign' => $this->Filter->signs['lt']),
            'realizationDateFrom' => array('type' => 'string', 'table' => 'calculate', 'alias' => true, 'field' => 'realisationDate', 'sign' => $this->Filter->signs['gt']),
            'realizationDateTo' => array('type' => 'string', 'table' => 'calculate', 'alias' => true, 'field' => 'realisationDate', 'sign' => $this->Filter->signs['lt']),
        );
    }

    /**
     * @return array
     */
    public function getConfigs()
    {
        return $this->configs;
    }

    /**
     * product list
     * @method index
     *
     * @param array
     * @return array
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

        $configs = $this->getConfigs();

        $filters = $this->Filter->prepare($configs, $params);

        $list = $this->DpProduct->getList($filters, $offset, $limit, $sortBy);

        if (!empty($list)) {
            $typeArr = array();
            $calcArr = array();
            $aggregateProducts = array();
            $aggregateUsers = array();
            foreach ($list as $row) {
                $calcArr[] = $row['calcID'];
                $typeArr[] = $row['typeID'];
                $aggregateProducts[] = $row['ID'];
                if( $row['userID'] ) {
                    $aggregateUsers[] = $row['userID'];
                }

            }
            $types = $this->PrintShopType->getByList2($typeArr);
            $calcProducts = $this->UserCalcProduct->getByCalcIds($calcArr);

            $calcProductsIds = array();
            foreach ($calcProducts as $products) {
                foreach ($products as $each) {
                    $calcProductsIds[] = $each['ID'];
                }
            }

            $ongoings = $this->Ongoing->getByItemList($calcProductsIds);
            $ongoings = $this->prepareOngoings($ongoings);

            $files = $this->DpProductFile->getByList($aggregateProducts);

            $attributes = $this->UserCalcProductAttribute->getByCalcProductIds($calcProductsIds);
            $specialAttributes = $this->UserCalcProductSpecialAttribute->getByCalcProductIds($calcProductsIds);

            foreach ($calcProducts as $calcProductKey => $products) {
                foreach ($products as $productKey => $product) {

                    if( $product['formatUnit'] == 2 ) {
                        $calcProducts[$calcProductKey][$productKey]['formatWidth'] /= 10;
                        $calcProducts[$calcProductKey][$productKey]['formatHeight'] /= 10;
                    }

                    if( array_key_exists($product['ID'], $attributes) ) {
                        $calcProducts[$calcProductKey][$productKey]['attributes'] = $attributes[$product['ID']];
                    }
                    if(array_key_exists($product['ID'], $specialAttributes)) {
                        $calcProducts[$calcProductKey][$productKey]['specialAttributes'] = $specialAttributes[$product['ID']];
                    }
                    if(array_key_exists($product['ID'], $ongoings)) {
                        $calcProducts[$calcProductKey][$productKey]['ongoings'] = $ongoings[$product['ID']];
                    }

                }
            }

            $aggregateUsers = array_unique($aggregateUsers);
            $defaultAddresses = $this->Address->getDefaultByList($aggregateUsers);

            foreach ($list as $key => $row) {
                $list[$key]['type'] = $types[$row['typeID']];
                $list[$key]['products'] = $calcProducts[$row['calcID']];
                $list[$key]['fileList'] = $files[$row['ID']];
                if (isset($files[$row['ID']])) {
                    $list[$key]['filesCount'] = count($files[$row['ID']]);
                } else {
                    $list[$key]['filesCount'] = 0;
                }
                if( isset($defaultAddresses[$row['userID']]) ) {
                    $list[$key]['defaultAddress'] = $defaultAddresses[$row['userID']];
                }
            }
        }

        return $list;
    }

    /**
     * @param $ongoings
     * @return array
     */
    private function prepareOngoings($ongoings)
    {
        $result = array();
        if( !$ongoings ) {
            return $result;
        }

        foreach ($ongoings as $calcProductID => $calculationOngoings) {

            $result[$calcProductID]['count'] = 0;
            $result[$calcProductID]['finished'] = 0;
            $result[$calcProductID]['endProduction'] = false;

            foreach ($calculationOngoings as $ongoing) {
                $result[$calcProductID]['count']++;
                if($ongoing['finished']) {
                    $result[$calcProductID]['finished']++;
                }
                if($ongoing['inProgress']) {
                    $result[$calcProductID]['currentStage'] = $result[$calcProductID]['finished'] + 1;
                    $result[$calcProductID]['currentOperation'] = $ongoing['operationName'];
                    $result[$calcProductID]['currentDate'] = $ongoing['currentDate'];
                }
                if( count($calculationOngoings) == $ongoing['order'] ) {
                    $ongoing['widthPercent'] = 0;
                } else {
                    $ongoing['widthPercent'] = round(100/(count($calculationOngoings)-1), 0);
                }

                $result[$calcProductID]['list'][] = $ongoing;
            }

            if( !array_key_exists('currentStage', $result[$calcProductID]) ) {
                $lastOngoing = end($calculationOngoings);
                $result[$calcProductID]['currentStage'] = $lastOngoing['order'];
                $result[$calcProductID]['currentOperation'] = $lastOngoing['operationName'];
                $result[$calcProductID]['currentDate'] = $lastOngoing['currentDate'];
                $result[$calcProductID]['endProduction'] = true;
            }

        }

        return $result;
    }

    /**
     * @param $params
     * @return array
     */
    public function count($params)
    {
        $configs = $this->getConfigs();

        $filters = $this->Filter->prepare($configs, $params);

        $count = $this->DpProduct->count($filters);
        return array('count' => $count);
    }

    /**
     * @param $id
     * @return bool
     */
    public function baseInfo($id)
    {
        if (!$id) {
            return false;
        }
        $result = $this->DpProduct->getBaseInfo($id);
        return $result;
    }

    /**
     * @param $ID
     * @return array
     */
    private function _delete($ID)
    {
        $one = $this->DpProduct->get('ID', $ID);

        $data['response'] = false;
        if (!$one) {
            return $this->sendFailResponse('06');
        }

        if ($this->DpProduct->delete('ID', $one['ID'])) {

            $data['response'] = true;


            $allProductAddress = $this->DpOrderAddressProduct->getAllByProduct($ID);

            $orderAddressArr = array();
            if ($allProductAddress) {
                foreach ($allProductAddress as $productAddress) {
                    $orderAddressArr[] = $productAddress['orderAddressID'];
                }
            }

            $orderAddresses = $this->DpOrderAddress->getByList($orderAddressArr);

            $removedAddresses = 0;
            $removedOrderAddresses = 0;
            if ($orderAddresses) {
                foreach ($orderAddresses as $orderAddress) {
                    $removedOrderAddresses += intval($this->DpOrderAddress->delete('ID', $orderAddress['ID']));
                    $removedAddresses += intval($this->Address->delete('ID', $orderAddress['addressID']));
                }
            }
            $data['removedOrderAddresses'] = $removedOrderAddresses;
            $data['removedAddresses'] = $removedAddresses;
        }

        return $data;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_index($ID)
    {
        return $this->_delete($ID);
    }

    /**
     * @param $ID
     * @return array
     * @throws Exception
     */
    public function delete_deletePublic($ID)
    {

        $one = $this->DpProduct->get('ID', intval($ID));

        $order = $this->DpOrder->getOne($one['orderID']);

        $tokenInfo = $this->Auth->getTokenInfo();

        $mongoSession = $this->MgSession->getAdapter()->findOne(array(
            'sid' => $tokenInfo->sessionID
        ));

        $isOk = false;

        if ($mongoSession->orderID == $order['ID']) {
            $isOk = true;
        }

        $user = $this->Auth->getLoggedUser();

        if ($user['ID'] == $order['userID']) {
            $isOk = true;
        }

        if (!$isOk) {
            return $this->sendFailResponse('12');
        }

        $data['response'] = false;
        if (!$one) {
            return $this->sendFailResponse('06');
        }

        if ($this->DpProduct->delete('ID', $one['ID'])) {

            $data['response'] = true;
            $data['removedProductAddress'] = $this->DpOrderAddressProduct->deleteByProduct($one['ID']);
        }

        return $data;
    }

    /**
     * @param $productID
     * @return array
     * @throws LoaderError
     * @throws RuntimeError
     * @throws SyntaxError
     */
    public function patch_index($productID)
    {
        $accept = $this->Data->getPost('accept');
        $rejectInfo = $this->Data->getPost('rejectInfo');
        $post = $this->Data->getAllPost();

        $data = array();

        $selectedProduct = $this->DpProduct->get('ID', intval($productID));
        $order = $this->DpOrder->getOne($selectedProduct['orderID']);
        $user = $this->User->get('ID', $order['userID']);
        $calc = $this->UserCalc->getOne($selectedProduct['calcID']);
        $type = $this->PrintShopType->getByList2(array($calc['typeID']));

        if ($type) {
            $type = current($type);
        }

        if ($accept === NULL) {
            return array('response' => false);
        }

        $this->DpProduct->update($selectedProduct['ID'], 'accept', $accept);
        $files = $this->DpProductFile->get('productID', $selectedProduct['ID'], true);

        if ($files) {

            $allowedThumbExtension = explode(',', THUMB_IMAGE_ALLOWED_EXTENSION);

            foreach ($files as $key => $file) {
                $actualDate = date('Y-m-d', strtotime($file['created']));

                $explodeName = explode('.', $file['name']);
                $ext = end($explodeName);

                $minImageName = false;

                if ($ext == THUMB_PDF_ALLOWED_EXTENSION) {
                    array_pop($explodeName);
                    $minImageName = implode('.', $explodeName) . '.jpg';
                } else if( in_array($ext, $allowedThumbExtension) ) {
                    $minImageName = $file['name'];
                }

                $files[$key]['url'] = STATIC_URL . companyID . '/' . 'productFiles/' . $actualDate . '/' . $file['folder'] . '/' . $file['productID'] . '/' . $file['ID'] . '/' . $file['name'];
                if( $minImageName ) {
                    $files[$key]['minUrl'] = STATIC_URL . companyID . '/' . 'productFiles/' . $actualDate . '/' . $file['folder'] . '/' . $file['productID'] . '/' . $file['ID'] . '/' . THUMB_IMAGE_PREFIX . $minImageName;
                } else {
                    $files[$key]['minUrl'] = STATIC_URL . companyID . '/' . 'images' . '/' . THUMB_IMAGE_DEFAULT;
                }

            }
        }

        $updated = 0;
        $info = '';

        $this->Setting->setModule('general');
        $this->Setting->setDomainID($this->getDomainID());
        $defaultLangID = $this->Setting->getValue('defaultLang');
        $defaultLangEntity = $this->LangSetting->getByID( $defaultLangID );
        $lang = $defaultLangEntity['code'];

        if ($accept == 1) {

            $this->DpProduct->update($selectedProduct['ID'], 'acceptDate', date('Y-m-d H:i:s'));

            $params['itemID'] = $selectedProduct['orderID'];
            $params['appVersion'] = 1;
            $ongoings = $this->ProductionPath->doPath($params);

            if (!empty($files)) {
                foreach ($files as $key => $file) {
                    if ($this->DpProductFile->update($file['ID'], 'accept', 1)) {
                        $files[$key]['accept'] = 1;
                        $updated++;
                    }
                }
            }

            if ($updated > 0 || empty($files)) {

                $templateID = 106;
                $templateName = 'product-files-list';

                $templateSetting = $this->TemplateSetting->getOne($templateID, 1);

                $templatePath = 'default/'. $templateID .'/'. $templateName .'.html';

                if( $templateSetting && $templateSetting['source'] == 1 ) {
                    $templatePath = companyID . '/'. $templateID .'/'. $templateName .'.html';
                } elseif( $templateSetting && $templateSetting['source'] == 2 ) {
                    $templatePath = companyID . '/'. $templateID .'/'. $this->getDomainID() .'/'. $templateName .'.html';
                }

                $loader = new FilesystemLoader(STATIC_PATH . 'templates');
                $twig = new Twig_Environment($loader, array());
                $twig->addExtension(new TranslateExtension());
                $template = $twig->load($templatePath);

                $product = array();
                $product['ID'] = $selectedProduct['ID'];
                $product['orderID'] = $selectedProduct['orderID'];
                $product['names'] = $type['names'];
                $product['volume'] = $calc['volume'];

                $userOption = $this->UserOption->get('uID', $user['ID']);

                if( $userOption && $userOption['lang'] ) {
                    $lang = $userOption['lang'];
                }

                $productsContent = $template->render(
                    array(
                        'product' => $product,
                        'files' => $files,
                        'lang' => $lang
                    )
                );

                $info = 'files_accepted';

                if (filter_var($user['user'], FILTER_VALIDATE_EMAIL) !== false) {
                    $this->Mail->setBind('firstName', $user['name']);
                    $this->Mail->setBind('files_info', $productsContent);

                    $send = $this->Mail->sendMail($user['user'], $user['name'], 'acceptFilesOk', $lang);
                    if ($send) {
                        $data['mailSend'] = $send;
                    } else {
                        $this->debug('error with mail', $send);
                    }
                } else {
                    $this->debug('Problem with email: ' . $user['user']);
                }

            }

            if( empty($files) ) {
                return array(
                    'response' => true,
                    'info' => 'there_are_no_files_to_accept'
                );
            }

        } elseif ($accept == -1) {
            if (!empty($files)) {
                foreach ($files as $key => $file) {
                    if (in_array($file['ID'], $post['acceptFiles'])) {
                        if ($this->DpProductFile->update($file['ID'], 'accept', 1)) {
                            $files[$key]['accept'] = 1;
                        }
                    } else {
                        if ($this->DpProductFile->update($file['ID'], 'accept', -1)) {
                            $updated++;
                            $files[$key]['accept'] = -1;
                        }
                    }
                }

                if ($updated > 0) {
                    $templateID = 106;
                    $templateName = 'product-files-list';

                    $templateSetting = $this->TemplateSetting->getOne($templateID, 1);

                    $templatePath = 'default/'. $templateID .'/'. $templateName .'.html';

                    if( $templateSetting && $templateSetting['source'] == 1 ) {
                        $templatePath = companyID . '/'. $templateID .'/'. $templateName .'.html';
                    } elseif( $templateSetting && $templateSetting['source'] == 2 ) {
                        $templatePath = companyID . '/'. $templateID .'/'. $this->getDomainID() .'/'. $templateName .'.html';
                    }

                    $loader = new FilesystemLoader(STATIC_PATH . 'templates');
                    $twig = new Twig_Environment($loader, array());
                    $twig->addExtension(new TranslateExtension());
                    $template = $twig->load($templatePath);

                    $product = array();
                    $product['ID'] = $selectedProduct['ID'];
                    $product['orderID'] = $selectedProduct['orderID'];
                    $product['names'] = $type['names'];
                    $product['volume'] = $calc['volume'];


                    $userOption = $this->UserOption->get('uID', $user['ID']);

                    if( $userOption && $userOption['lang'] ) {
                        $lang = $userOption['lang'];
                    }

                    $productsContent = $template->render(
                        array(
                            'product' => $product,
                            'files' => $files,
                            'lang' => $lang,
                            'colorRow' => true
                        )
                    );

                    $this->DpProduct->update($productID, 'rejectInfo', $rejectInfo);

                    $info = 'files_rejected';

                    if (filter_var($user['user'], FILTER_VALIDATE_EMAIL) !== false) {
                        $this->Mail->setBind('firstName', $user['name']);
                        $this->Mail->setBind('files_info', $productsContent);
                        $this->Mail->setBind('rejectInfo', $rejectInfo);

                        $send = false;

                        try {
                            $send = $this->Mail->sendMail($user['user'], $user['name'], 'rejectFiles', $lang);
                        } catch (Exception $e) {
                            $this->debug('error with mail: ', $e->getMessage());
                        }

                        if ($send) {
                            $data['mailSend'] = $send;
                        } else {
                            $this->debug('error with mail', $send);
                        }
                    } else {
                        $this->debug('Problem with email: ' . $user['user']);
                    }
                }
            }
        }

        $allOrderProducts = $this->DpProduct->get('orderID', $selectedProduct['orderID'], true);
        if (!empty($allOrderProducts)) {
            $countAccept = 0;
            foreach ($allOrderProducts as $selectedProduct) {
                if ($selectedProduct['accept'] > 0) {
                    $countAccept++;
                }
            }
        }

        return array(
            'response' => true,
            'info' => $info
        );

    }

    /**
     * @param $orderID
     * @return array|bool
     */
    public function getByOrder($orderID)
    {
        $products = $this->DpProduct->getInfoProducts($orderID);

        if (!$products) {
            return array();
        }

        $aggregateTypes = array();
        $aggregateCopyBasePrices = array();
        foreach ($products as $product) {
            $aggregateTypes[] = $product['typeID'];
            $aggregateCopyBasePrices[] = $product['copyPriceID'];
        }

        $copyPrices = $this->BasePrice->getByList($aggregateCopyBasePrices);

        $types = $this->PrintShopType->getByList2($aggregateTypes);
        foreach ($products as $key => $product) {
            $products[$key]['type'] = $types[$product['typeID']];
            $products[$key]['price'] = $this->Price->getPriceToView($product['price']);
            $products[$key]['grossPrice'] = $this->Price->getPriceToView($product['grossPrice']);
            if (isset($copyPrices[$product['copyPriceID']]) && $copyPrices[$product['copyPriceID']] > 0) {
                $copyPrices[$product['copyPriceID']]['price'] = $this->Price->getPriceToView(
                    $copyPrices[$product['copyPriceID']]['price']
                );
                $copyPrices[$product['copyPriceID']]['grossPrice'] = $this->Price->getPriceToView(
                    $copyPrices[$product['copyPriceID']]['grossPrice']
                );
                $products[$key]['copyPrice'] = $copyPrices[$product['copyPriceID']];
            }
        }

        return $products;
    }

    /**
     * @param $productID
     * @return mixed
     */
    public function patch_restoreAccept($productID)
    {
        $post = $this->Data->getAllPost();

        $accept = $post['accept'];
        $data['response'] = false;

        $loggedUser = $this->Auth->getLoggedUser();

        $product = $this->DpProduct->get('ID', $productID);
        $order = $this->DpOrder->get('ID', $product['orderID']);

        if ($order['userID'] != $loggedUser['ID']) {
            return $this->sendFailResponse('12');
        }

        $files = $this->DpProductFile->getByProduct($productID);

        foreach ($files as $file) {

            if ($file['accept'] != -1) {
                continue;
            }

            if ($this->DpProductFile->delete('ID', $file['ID'])) {
                $date = date('Y-m-d', strtotime($file['created']));
                $explodeName = explode('.', $file['name']);
                $ext = end($explodeName);
                if ($ext == 'pdf') {
                    array_pop($explodeName);
                    $minImageName = implode('.', $explodeName) . '.jpg';
                } else {
                    $minImageName = $file['name'];
                }
                $fileName = MAIN_UPLOAD . companyID . '/' . 'productFiles/' . $date . '/' . $file['folder'] . '/' . $file['productID'] . '/' . $file['ID'] . '/' . $file['name'];
                $minFileName = MAIN_UPLOAD . companyID . '/' . 'productFiles/' . $date . '/' . $file['folder'] . '/' . $file['productID'] . '/' . $file['ID'] . '/' . THUMB_IMAGE_PREFIX . $minImageName;
                $data['removedFiles'][] = $fileName;
                if (is_file($fileName)) {
                    unset($fileName);
                }
                if (is_file($minFileName)) {
                    unset($fileName);
                }

            }
        }

        if ($this->DpProduct->update($productID, 'accept', $accept)) {
            $data['response'] = true;
        }

        return $data;

    }

    public function patch_copy()
    {

    }
}