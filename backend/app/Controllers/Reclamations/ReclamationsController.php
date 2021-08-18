<?php
/**
 * Programmer Rafał Leśniak - 31.8.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 31-08-2017
 * Time: 11:11
 */

namespace DreamSoft\Controllers\Reclamations;

use DreamSoft\Controllers\Components\Calculation;
use DreamSoft\Controllers\Components\InvoiceComponent;
use DreamSoft\Controllers\Components\Mail;
use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Core\Controller;
use DreamSoft\Controllers\Components\QueryFilter;
use DreamSoft\Libs\TwigExtensions\TranslateExtension;
use DreamSoft\Models\Address\Address;
use DreamSoft\Models\Reclamation\Reclamation;
use DreamSoft\Models\Reclamation\ReclamationFault;
use DreamSoft\Models\Reclamation\ReclamationFile;
use DreamSoft\Models\Reclamation\ReclamationMessage;
use DreamSoft\Models\Reclamation\ReclamationStatus;
use DreamSoft\Models\Reclamation\ReclamationStatusLang;
use Twig\Loader\FilesystemLoader;
use Twig\Environment as Twig_Environment;
use DreamSoft\Controllers\Components\Acl;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\Order\DpOrder;
use DreamSoft\Models\Order\DpProduct;
use DreamSoft\Models\Order\DpInvoice;
use DreamSoft\Models\User\UserOption;
use DreamSoft\Models\User\User;

class ReclamationsController extends Controller
{
    public $useModels = array();

    /**
     * @var Reclamation
     */
    protected $Reclamation;
    /**
     * @var ReclamationFile
     */
    protected $ReclamationFile;
    /**
     * @var DpOrder
     */
    protected $DpOrder;
    /**
     * @var DpInvoice
     */
    protected $DpInvoice;
    /**
     * @var DpProduct
     */
    protected $DpProduct;
    /**
     * @var PrintShopType
     */
    protected $PrintShopType;
    /**
     * @var Address
     */
    protected $Address;
    /**
     * @var Uploader
     */
    protected $Uploader;
    /**
     * @var InvoiceComponent
     */
    protected $InvoiceComponent;
    /**
     * @var QueryFilter
     */
    protected $QueryFilter;
    /**
     * @var ReclamationStatus
     */
    protected $ReclamationStatus;
    /**
     * @var ReclamationStatusLang
     */
    protected $ReclamationStatusLang;
    /**
     * @var ReclamationFault
     */
    protected $ReclamationFault;
    /**
     * @var ReclamationMessage
     */
    protected $ReclamationMessage;
    /**
     * @var User
     */
    protected $User;
    /**
     * @var Acl
     */
    protected $Acl;
    /**
     * @var Mail
     */
    protected $Mail;
    /**
     * @var Calculation
     */
    protected $Calculation;
    /**
     * @var UserOption
     */
    protected $UserOption;
    /**
     * @var array
     */
    private $configs;

    /**
     * ReclamationsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Uploader = Uploader::getInstance();
        $this->InvoiceComponent = InvoiceComponent::getInstance();
        $this->QueryFilter = new QueryFilter();

        $this->Reclamation = Reclamation::getInstance();
        $this->ReclamationFile = ReclamationFile::getInstance();
        $this->ReclamationStatus = ReclamationStatus::getInstance();
        $this->ReclamationFault = ReclamationFault::getInstance();
        $this->DpOrder = DpOrder::getInstance();
        $this->DpInvoice = DpInvoice::getInstance();
        $this->DpProduct = DpProduct::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->Address = Address::getInstance();
        $this->UserOption = UserOption::getInstance();
        $this->Calculation = Calculation::getInstance();
        $this->User = User::getInstance();
        $this->ReclamationMessage = ReclamationMessage::getInstance();
        $this->ReclamationStatusLang = ReclamationStatusLang::getInstance();
        $this->Acl = new Acl();
        $this->Mail = Mail::getInstance();
        $this->setConfigs();
    }

    public function setConfigs()
    {
        $this->configs = array(
            'ID' => array('type' => 'string', 'table' => 'dp_reclamations', 'field' => 'ID', 'sign' => $this->QueryFilter->signs['e']),
            'userID' => array('type' => 'string', 'table' => 'dp_reclamations', 'field' => 'userID', 'sign' => $this->QueryFilter->signs['e']),
            'orderID' => array('type' => 'string', 'table' => 'dp_reclamations', 'field' => 'orderID', 'sign' => $this->QueryFilter->signs['li']),
            'email' => array('type' => 'string', 'table' => 'users', 'field' => 'user', 'sign' => $this->QueryFilter->signs['li']),
            'dateFrom' => array('type' => 'timestamp', 'table' => 'dp_reclamations', 'field' => 'created', 'sign' => $this->QueryFilter->signs['gt']),
            'dateTo' => array('type' => 'timestamp', 'table' => 'dp_reclamations', 'field' => 'created', 'sign' => $this->QueryFilter->signs['lt']),
            'productID' => array('type' => 'string', 'table' => 'dp_products', 'field' => 'ID', 'sign' => $this->QueryFilter->signs['e']),
            'statusID' => array('type' => 'string', 'table' => 'dp_reclamations', 'field' => 'statusID', 'sign' => $this->QueryFilter->signs['e']),
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
     * @param $ID
     */
    public function setDomainID($ID)
    {
        parent::setDomainID($ID);
        $this->InvoiceComponent->setDomainID($ID);
        $this->Mail->setDomainID($ID);
    }

    /**
     * @param array $params
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

        $filters = $this->QueryFilter->prepare($configs, $params);

        $list = $this->Reclamation->getList($filters, $offset, $limit, $sortBy);

        $list = $this->addAggregationFields($list);

        return $list;
    }

    /**
     * @param $orderID
     * @return array
     * @throws \Twig\Error\LoaderError
     * @throws \Twig\Error\RuntimeError
     * @throws \Twig\Error\SyntaxError
     */
    public function post_index($orderID)
    {
        $loggedUser = $this->Auth->getLoggedUser();

        if (!$loggedUser) {
            return $this->sendFailResponse('12');
        }

        $order = $this->DpOrder->getOne($orderID);

        if ($loggedUser['ID'] != $order['userID']) {
            return $this->sendFailResponse('12');
        }

        $post = $this->Data->getAllPost();

        if (!$post['description'] || array_sum($post['faults']) == 0) {
            return $this->sendFailResponse('01');
        }

        $params = array();
        $params['userID'] = $loggedUser['ID'];
        $params['orderID'] = $orderID;
        $params['description'] = $post['description'];

        $post['faults'] = array_filter($post['faults'], array($this, 'removeEmpty'));
        $params['faults'] = implode(',', array_keys($post['faults']));

        $params['products'] = implode(',', $post['products']);
        $params['created'] = date('Y-m-d H:i:s');
        $this->ReclamationStatus->setDomainID($order['domainID']);
        $firstStatus = $this->ReclamationStatus->getFirstStatus();
        if( $firstStatus ) {
            $params['statusID'] = $firstStatus;
        } else {
            $params['statusID'] = 0;
        }
        $reclamationID = $this->Reclamation->create($params);

        if (!$reclamationID) {
            $response = $this->sendFailResponse('03');
            $response['reclamationParams'] = $params;
            $response['error'] = $this->Reclamation->getErrors();
            $response['dbError'] = $this->Reclamation->getDbError();
            return $response;
        }

        $user = $this->User->get('ID', $loggedUser['ID']);

        $data['item'] = $this->Reclamation->get('ID', $reclamationID);

        $products = $this->DpProduct->getProductsByList($params['products']);
        $products = $this->Calculation->getCalcData($products);

        $loader = new FilesystemLoader(BASE_DIR . 'views');
        $twig = new Twig_Environment($loader, array());
        $twig->addExtension(new TranslateExtension());
        $template = $twig->load('mail/products_list.html');

        $userOption = $this->UserOption->get('uID', $order['userID']);

        $lang = lang;
        if( $userOption && $userOption['lang'] ) {
            $lang = $userOption['lang'];
        }

        $productsContent = $template->render(
            array(
                'products' => $products,
                'lang' => $lang
            )
        );

        if (filter_var($user['user'], FILTER_VALIDATE_EMAIL) !== false) {
            $this->Mail->setBind('status', $this->ReclamationStatusLang->getName($data['item']['statusID'], $lang));
            $this->Mail->setBind('firstname', $user['name']);
            $this->Mail->setBind('reclamation_id', $reclamationID);
            $this->Mail->setBind('products_list', $productsContent);

            $send = $this->Mail->sendMail($user['user'], $user['name'], 'newReclamation', $lang);
            if ($send) {
                $data['send'] = true;
            }

        } else {
            $this->debug('Problem with email: ' . $user['user']);
        }

        $data['response'] = true;

        return $data;
    }

    /**
     * @param $orderID
     * @return mixed
     */
    public function post_createReclamation($orderID)
    {
        $loggedUser = $this->Auth->getLoggedUser();

        if( !$this->canCreateReclamation() && $loggedUser['super'] != 1 ) {
            return $this->sendFailResponse('12');
        }

        $order = $this->DpOrder->get('ID', $orderID);

        $post = $this->Data->getAllPost();

        if (!$post['description'] || array_sum($post['faults']) == 0) {
            return $this->sendFailResponse('01');
        }

        $params = array();
        $params['userID'] = $order['userID'];
        $params['orderID'] = $orderID;
        $params['description'] = $post['description'];

        $post['faults'] = array_filter($post['faults'], array($this, 'removeEmpty'));
        $params['faults'] = implode(',', array_keys($post['faults']));

        $params['products'] = implode(',', $post['products']);
        $params['created'] = date('Y-m-d H:i:s');
        $this->ReclamationStatus->setDomainID($order['domainID']);
        $params['statusID'] = $this->ReclamationStatus->getFirstStatus();
        $params['operatorID'] = $loggedUser['ID'];
        $reclamationID = $this->Reclamation->create($params);

        if (!$reclamationID) {
            return $this->sendFailResponse('03');
        }

        $user = $this->User->get('ID', $order['userID']);

        $data['item'] = $this->Reclamation->get('ID', $reclamationID);

        $products = $this->DpProduct->getProductsByList($params['products']);
        $products = $this->Calculation->getCalcData($products);

        $loader = new FilesystemLoader(BASE_DIR . 'views');
        $twig = new Twig_Environment($loader, array());
        $twig->addExtension(new TranslateExtension());
        $template = $twig->load('mail/products_list.html');

        $productsContent = $template->render(
            array(
                'products' => $products,
            )
        );

        $userOption = $this->UserOption->get('uID', $order['userID']);

        $lang = lang;
        if( $userOption && $userOption['lang'] ) {
            $lang = $userOption['lang'];
        }

        if (filter_var($user['user'], FILTER_VALIDATE_EMAIL) !== false) {
            $this->Mail->setBind('status', $this->ReclamationStatusLang->getName($data['item']['statusID'], $lang));
            $this->Mail->setBind('firstname', $user['name']);
            $this->Mail->setBind('reclamation_id', $reclamationID);
            $this->Mail->setBind('products_list', $productsContent);

            $send = $this->Mail->sendMail($user['user'], $user['name'], 'newReclamation', $lang);
            if ($send) {
                $data['send'] = true;
            }

        } else {
            $this->debug('Problem with email: ' . $user['user']);
        }

        $data['response'] = true;

        return $data;
    }

    /**
     * @param $ID
     * @return array
     */
    public function put_index($ID)
    {
        if (!$ID) {
            $result = $this->sendFailResponse('04');
            return $result;
        }
        $post = $this->Data->getAllPost();
        $post['modified'] = date('Y-m-d H:i:s');

        $goodKeys = array('statusID');

        $reclamation = $this->Reclamation->get('ID', $ID);

        if (!$reclamation) {
            return $this->sendFailResponse('06');
        }

        $user = $this->User->get('ID', $reclamation['userID']);

        $result = array();

        foreach ($post as $key => $value) {
            if (!in_array($key, $goodKeys)) {
                unset($post[$key]);
            }
            if ($key == 'statusID') {

                $products = $this->DpProduct->getProductsByList($reclamation['products']);
                $products = $this->Calculation->getCalcData($products);

                $loader = new FilesystemLoader(BASE_DIR . 'views');
                $twig = new Twig_Environment($loader, array());
                $twig->addExtension(new TranslateExtension());
                $template = $twig->load('mail/products_list.html');

                $productsContent = $template->render(
                    array(
                        'products' => $products,
                    )
                );

                $order = $this->DpOrder->get('ID', $reclamation['orderID']);
                $this->ReclamationStatus->setDomainID($order['domainID']);

                $userOption = $this->UserOption->get('uID', $user['ID']);

                $lang = lang;
                if( $userOption && $userOption['lang'] ) {
                    $lang = $userOption['lang'];
                }

                if (filter_var($user['user'], FILTER_VALIDATE_EMAIL) !== false) {
                    $this->Mail->setBind('old_status', $this->ReclamationStatusLang->getName($reclamation['statusID'], $lang));
                    $this->Mail->setBind('status', $this->ReclamationStatusLang->getName($value, $lang));
                    $this->Mail->setBind('firstname', $user['name']);
                    $this->Mail->setBind('reclamation_id', $reclamation['ID']);
                    $this->Mail->setBind('products_list', $productsContent);

                    $send = $this->Mail->sendMail($user['user'], $user['name'], 'changeStatusReclamation', $lang);
                    if ($send) {
                        $data['send'] = true;
                    }

                } else {
                    $this->debug('Problem with email: ' . $user['user']);
                }
            }
        }

        $result['response'] = $this->Reclamation->updateAll($ID, $post);
        return $result;
    }

    /**
     * @param $value
     * @return bool
     */
    private function removeEmpty($value)
    {
        return $value === true;
    }

    /**
     * @param $reclamationID
     * @return array
     * @throws \ImagickException
     */
    public function post_files($reclamationID)
    {
        $reclamation = $this->Reclamation->get('ID', $reclamationID);

        $user = $this->Auth->getLoggedUser();

        if ($reclamation['userID'] != $user['ID'] && !$this->canUploadReclamationFiles() ) {
            return $this->sendFailResponse('12');
        }

        if( $reclamation['userID'] != $user['ID'] && $this->canUploadReclamationFiles() ) {
            $isAdmin = 1;
        } else {
            $isAdmin = 0;
        }

        $created = date('Y-m-d H:i:s');

        $name = $_FILES['file']['name'];

        $folder = intval($reclamationID / 100);

        $reclamationFileID = $this->ReclamationFile->create(compact('created', 'folder', 'name', 'reclamationID', 'isAdmin'));

        if (!$reclamationFileID) {
            return $this->sendFailResponse('03');
        }

        $file = $this->ReclamationFile->get('ID', $reclamationFileID);

        $date = date('Y-m-d', strtotime($created));

        $destinationFolder = RECLAMATION_FOLDER . '/' . $date . '/' . $folder . '/' . $reclamationID . '/';

        if (!is_dir(MAIN_UPLOAD . companyID . '/' . $destinationFolder)) {
            mkdir(MAIN_UPLOAD . companyID . '/' . $destinationFolder, 0775, true);
            chmod(MAIN_UPLOAD . companyID . '/' . $destinationFolder, 0775);
        }

        $res = $this->Uploader->uploadToCompany($_FILES, 'file', $destinationFolder, $file['name']);

        if (!$res) {
            return $this->sendFailResponse('10');
        }
        $minImage = $this->Uploader->resizeImage(MAIN_UPLOAD . companyID . '/' . $destinationFolder . $file['name'], THUMB_IMAGE_RESIZE_WIDTH, THUMB_IMAGE_RESIZE_HEIGHT, false);

        $explodeName = explode('.', $file['name']);
        $ext = strtolower(end($explodeName));

        if ($ext == 'pdf') {
            array_pop($explodeName);
            $minImageName = implode('.', $explodeName) . '.jpg';
        } else {
            $minImageName = $file['name'];
        }

        $minImage->writeImage(MAIN_UPLOAD . companyID . '/' . $destinationFolder . THUMB_IMAGE_PREFIX . $minImageName);

        $lastFile['url'] = STATIC_URL . companyID . '/' . RECLAMATION_FOLDER . '/' . $date . '/' . $folder . '/' . $reclamationID . '/' . $file['name'];
        $lastFile['minUrl'] = STATIC_URL . companyID . '/' . RECLAMATION_FOLDER . '/' . $date . '/' . $folder . '/' . $reclamationID . '/' . THUMB_IMAGE_PREFIX . $minImageName;

        return array('response' => $res, 'file' => $lastFile);
    }

    /**
     * @param $orderID
     * @return array
     */
    public function findByOrder($orderID)
    {
        $item = $this->Reclamation->get('orderID', $orderID);
        if (!$item) {
            return $this->sendFailResponse('06');
        }

        $faults = $this->ReclamationFault->getAll();
        $indexedFaults = array();
        foreach ($faults as $fault) {
            $indexedFaults[$fault['ID']] = $fault;
        }

        $checkedFaults = explode(',', $item['faults']);
        $tmpFaults = array();
        foreach ($checkedFaults as $checkedFaultID) {
            $tmpFaults[] = $indexedFaults[$checkedFaultID];
        }
        $item['faults'] = $tmpFaults;

        return $item;
    }

    /**
     * @param array $params
     * @return array
     */
    public function myZone($params)
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

        $filters = $this->QueryFilter->prepare($configs, $params);
        $list = $this->Reclamation->getList($filters, $offset, $limit, $sortBy);

        $list = $this->addAggregationFields($list);

        return $list;
    }

    /**
     * @param array|bool $list
     * @return mixed
     */
    private function addAggregationFields($list)
    {
        if (!$list) {
            return array();
        }

        $loggedUser = $this->Auth->getLoggedUser();

        $isAdmin = 1;
        if ($loggedUser['super'] == 1 || $this->Acl->canReadWriteMessages($loggedUser)) {
            $isAdmin = 0;
        }

        $faults = $this->ReclamationFault->getAll();
        $indexedFaults = array();
        foreach ($faults as $fault) {
            $indexedFaults[$fault['ID']] = $fault;
        }

        $aggregateReclamations = array();
        $aggregateReclamationStatuses = array();
        $aggregateUsers = array();
        $aggregateOrders = array();
        $aggregateProducts = array();
        foreach ($list as $row) {
            $aggregateReclamationStatuses[] = $row['statusID'];
            $aggregateUsers[] = $row['userID'];
            $aggregateReclamations[] = $row['ID'];
            $aggregateOrders[] = $row['orderID'];
            $aggregateProducts = array_merge($aggregateProducts, explode(',', $row['products']));
        }

        $statuses = $this->ReclamationStatus->getByList($aggregateReclamationStatuses);
        $users = $this->User->getByList($aggregateUsers);
        $files = $this->ReclamationFile->getByReclamationList($aggregateReclamations);
        $invoices = $this->DpInvoice->getByOrderList($aggregateOrders);
        $products = $this->DpProduct->getByList($aggregateProducts);
        $addresses = $this->Address->getDefaultByList($aggregateUsers, 1);
        $unreadMessages = $this->ReclamationMessage->countUnread($aggregateReclamations, $isAdmin);
        $orders = $this->DpOrder->getByList($aggregateOrders);

        $aggregateTypes = array();
        foreach ($products as $product) {
            $aggregateTypes[] = $product['typeID'];
        }

        $types = $this->PrintShopType->getByList2($aggregateTypes);

        $indexedProducts = array();
        foreach ($products as $product) {
            $product['type'] = $types[$product['typeID']];
            $indexedProducts[$product['productID']] = $product;
        }

        $files = $this->addUrlToFiles($files);
        $files = $this->divideFiles($files);

        foreach ($list as $key => $row) {
            $list[$key]['status'] = $statuses[$row['statusID']];
            $list[$key]['user'] = $users[$row['userID']];
            $list[$key]['address'] = $addresses[$row['userID']];
            $checkedFaults = explode(',', $row['faults']);
            $tmpFaults = array();
            foreach ($checkedFaults as $checkedFaultID) {
                $tmpFaults[] = $indexedFaults[$checkedFaultID];
            }
            $list[$key]['faults'] = $tmpFaults;
            $checkedProducts = explode(',', $row['products']);
            $tmpProducts = array();
            foreach ($checkedProducts as $checkedProductID) {
                $tmpProducts[] = $indexedProducts[$checkedProductID];
            }

            $list[$key]['products'] = $tmpProducts;
            $list[$key]['files'] = array();
            if( array_key_exists($row['ID'], $files) ) {
                $list[$key]['files'] = $files[$row['ID']];
            }

            $list[$key]['invoiceNumber'] = NULL;
            if( array_key_exists($row['orderID'], $invoices) ) {
                $list[$key]['invoiceNumber'] = $this->InvoiceComponent->prepareInvoiceNumber($invoices[$row['orderID']]);
            }

            if (intval($unreadMessages[$row['ID']]) > 0) {
                $list[$key]['unreadMessages'] = $unreadMessages[$row['ID']];
            }
            if ($orders[$row['orderID']]) {
                $list[$key]['order'] = array(
                    'created' => $orders[$row['orderID']]['created']
                );
            }
        }

        return $list;
    }

    /**
     * @param $params
     * @return mixed
     */
    public function myZoneCount($params = array())
    {

        $user = $this->Auth->getLoggedUser();

        if (!$user) {
            return array('response' => false);
        }

        $params['userID'] = $user['ID'];

        $configs = $this->getConfigs();

        $filters = $this->QueryFilter->prepare($configs, $params);

        $count = $this->Reclamation->count($filters);
        return array('count' => $count);
    }

    /**
     * @param null $params
     * @return array
     */
    public function count($params = NULL)
    {
        $configs = $this->getConfigs();
        $filters = $this->QueryFilter->prepare($configs, $params);

        $count = $this->Reclamation->count($filters);
        return array('count' => $count);
    }

    /**
     * @param $files
     * @return array
     */
    private function addUrlToFiles($files)
    {
        if (!$files) {
            return array();
        }
        foreach ($files as $reclamationID => $reclamationFiles) {

            foreach ($reclamationFiles as $fileKey => $file) {

                $explodeName = explode('.', $file['name']);
                $ext = end($explodeName);

                if ($ext == 'pdf') {
                    array_pop($explodeName);
                    $minImageName = implode('.', $explodeName) . '.jpg';
                } else {
                    $minImageName = $file['name'];
                }

                $date = date('Y-m-d', strtotime($file['created']));

                $files[$reclamationID][$fileKey]['size'] = filesize(MAIN_UPLOAD . companyID . '/' . RECLAMATION_FOLDER . '/' . $date . '/' . $file['folder'] . '/' . $file['reclamationID'] . '/' . $file['name']);

                $files[$reclamationID][$fileKey]['url'] = STATIC_URL . companyID . '/' . RECLAMATION_FOLDER . '/' . $date . '/' . $file['folder'] . '/' . $file['reclamationID'] . '/' . $file['name'];
                $files[$reclamationID][$fileKey]['minUrl'] = STATIC_URL . companyID . '/' . RECLAMATION_FOLDER . '/' . $date . '/' . $file['folder'] . '/' . $file['reclamationID'] . '/' . THUMB_IMAGE_PREFIX . $minImageName;
            }
        }

        return $files;
    }

    /**
     * @param $files
     * @return array
     */
    private function divideFiles($files)
    {
        $result = array('user' => array(), 'admin' => array());

        foreach ($files as $reclamationID => $reclamationFiles) {

            foreach ($reclamationFiles as $fileKey => $file) {
                if ($file['isAdmin']) {
                    $result[$reclamationID]['admin'][] = $file;
                } else {
                    $result[$reclamationID]['user'][] = $file;
                }
            }
        }

        return $result;
    }

    /**
     * @param $reclamationID
     * @return array
     */
    public function getFiles($reclamationID)
    {
        $user = $this->Auth->getLoggedUser();

        $reclamation = $this->Reclamation->get('ID', $reclamationID);

        if ($reclamation['userID'] != $user['ID'] && !$this->canUploadReclamationFiles() && $user['super'] != 1 ) {
            return $this->sendFailResponse('12');
        }

        $files = $this->ReclamationFile->getByReclamationList(array($reclamationID));

        if (!$files) {
            return array('user' => array(), 'admin' => array());
        }

        $files = $this->addUrlToFiles($files);
        $files = $this->divideFiles($files);
        $files = $files[$reclamationID];

        return $files;
    }

    /**
     * @return array
     */
    public function canUploadReclamationFiles()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->canUploadReclamationFiles($user));
    }

    /**
     * @return array
     */
    public function canCreateReclamation()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->canCreateReclamation($user));
    }
}