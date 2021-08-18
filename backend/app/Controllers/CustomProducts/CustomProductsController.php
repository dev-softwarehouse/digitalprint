<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 28-03-2018
 * Time: 13:44
 */

namespace DreamSoft\Controllers\CustomProducts;

use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Core\Controller;
use DreamSoft\Controllers\Components\QueryFilter;
use DreamSoft\Models\Address\Address;
use DreamSoft\Models\CustomProduct\CustomProduct;
use DreamSoft\Models\CustomProduct\CustomProductFile;
use DreamSoft\Controllers\Components\Acl;
use DreamSoft\Models\Order\DpOrder;
use DreamSoft\Models\User\User;

class CustomProductsController extends Controller
{
    public $useModels = array();

    /**
     * @var CustomProduct
     */
    protected $CustomProduct;
    /**
     * @var CustomProductFile
     */
    protected $CustomProductFile;
    /**
     * @var Uploader
     */
    protected $Uploader;
    /**
     * @var QueryFilter
     */
    protected $QueryFilter;
    /**
     * @var User
     */
    protected $User;
    /**
     * @var Address
     */
    protected $Address;
    /**
     * @var DpOrder
     */
    protected $DpOrder;
    /**
     * @var Acl
     */
    protected $Acl;

    /**
     * @var array
     */
    private $configs;

    /**
     * CustomProductsController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->CustomProduct = CustomProduct::getInstance();
        $this->CustomProductFile = CustomProductFile::getInstance();
        $this->Acl = new Acl();
        $this->Uploader = Uploader::getInstance();
        $this->QueryFilter = new QueryFilter();
        $this->setConfigs();
        $this->User = User::getInstance();
        $this->Address = Address::getInstance();
        $this->DpOrder = DpOrder::getInstance();
    }

    public function setConfigs()
    {
        $this->configs = array(
            'ID' => array('type' => 'string', 'table' => 'dp_customProducts', 'field' => 'ID', 'sign' => $this->QueryFilter->signs['li']),
            'userID' => array('type' => 'string', 'table' => 'dp_customProducts', 'field' => 'userID', 'sign' => $this->QueryFilter->signs['li']),
            'userMail' => array('type' => 'string', 'table' => 'users', 'field' => 'login', 'sign' => $this->QueryFilter->signs['li']),
            'dateFrom' => array('type' => 'timestamp', 'table' => 'dp_customProducts', 'field' => 'created', 'sign' => $this->QueryFilter->signs['gt']),
            'dateTo' => array('type' => 'timestamp', 'table' => 'dp_customProducts', 'field' => 'created', 'sign' => $this->QueryFilter->signs['lt']),
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
     * @param $params
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

        $list = $this->CustomProduct->getList($filters, $offset, $limit, $sortBy);

        $list = $this->addAggregationFields($list);

        return $list;
    }

    /**
     * @param $list
     * @return mixed
     */
    private function addAggregationFields($list)
    {
        if (!$list) {
            return array();
        }

        $loggedUser = $this->Auth->getLoggedUser();

        $aggregateUsers = array();
        $aggregateCustomProducts = array();
        $aggregateOrders = array();

        foreach ($list as $row) {
            $aggregateUsers[] = $row['userID'];
            $aggregateCustomProducts[] = $row['ID'];
            if( $row['orderID'] ) {
                $aggregateOrders[] = $row['orderID'];
            }
        }


        $users = $this->User->getByList($aggregateUsers);
        $addresses = $this->Address->getDefaultByList($aggregateUsers, 1);
        $orders = $this->DpOrder->getByList($aggregateOrders);

        $files = $this->CustomProductFile->getByCustomProductList($aggregateCustomProducts);

        $files = $this->addUrlToFiles($files);


        foreach ($list as $key => $row) {

            $list[$key]['user'] = $users[$row['userID']];
            $list[$key]['address'] = $addresses[$row['userID']];
            $list[$key]['files'] = $files[$row['ID']];
            if($row['orderID']) {
                $list[$key]['order'] = $orders[$row['orderID']];
            } else {
                $list[$key]['order'] = null;
            }

        }

        return $list;
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
                $ext = strtolower(end($explodeName));

                if ($ext == 'pdf') {
                    array_pop($explodeName);
                    $minImageName = implode('.', $explodeName) . '.jpg';
                } else {
                    $minImageName = $file['name'];
                }

                $date = date('Y-m-d', strtotime($file['created']));

                $files[$reclamationID][$fileKey]['size'] = filesize(MAIN_UPLOAD . companyID . '/' . CUSTOM_PRODUCT_FOLDER . '/' . $date . '/' . $file['folder'] . '/' . $file['customProductID'] . '/' . $file['name']);

                $files[$reclamationID][$fileKey]['url'] = STATIC_URL . companyID . '/' . CUSTOM_PRODUCT_FOLDER . '/' . $date . '/' . $file['folder'] . '/' . $file['customProductID'] . '/' . $file['name'];
                $files[$reclamationID][$fileKey]['minUrl'] = STATIC_URL . companyID . '/' . CUSTOM_PRODUCT_FOLDER . '/' . $date . '/' . $file['folder'] . '/' . $file['customProductID'] . '/' . THUMB_IMAGE_PREFIX . $minImageName;
            }
        }

        return $files;
    }

    /**
     * @return array
     */
    public function post_index()
    {
        $post = $this->Data->getAllPost();

        $loggedUser = $this->Auth->getLoggedUser();

        if( !$loggedUser ) {
            return $this->sendFailResponse('17');
        }

        $data['response'] = false;

        if( $post['name'] && $post['content'] ) {

            $params = array();
            $params['name'] = $post['name'];
            $params['content'] = $post['content'];
            $params['created'] = date('Y-m-d H:i:s');
            $params['userID'] = $loggedUser['ID'];

            $lastID = $this->CustomProduct->create($params);

            if( $lastID ) {
                $data['response'] = true;
                $data['item'] = $this->CustomProduct->get('ID', $lastID);
            }


        } else {
            return $this->sendFailResponse('01');
        }

        return $data;
    }

    /**
     * @param $customProductID
     * @return array
     * @throws \ImagickException
     */
    public function post_files($customProductID)
    {
        $customProductEntity = $this->CustomProduct->get('ID', $customProductID);

        $user = $this->Auth->getLoggedUser();

        if ($customProductEntity['userID'] != $user['ID'] && !$this->canUploadCustomProductFiles() ) {
            return $this->sendFailResponse('12');
        }

        $created = date('Y-m-d H:i:s');

        $name = strtolower($_FILES['file']['name']);

        $folder = intval($customProductID / 100);

        $customProductFileID = $this->CustomProductFile->create(compact('created', 'folder', 'name', 'customProductID'));

        if (!$customProductFileID) {
            return $this->sendFailResponse('03');
        }

        $file = $this->CustomProductFile->get('ID', $customProductFileID);

        $date = date('Y-m-d', strtotime($created));

        $destinationFolder = CUSTOM_PRODUCT_FOLDER . '/' . $date . '/' . $folder . '/' . $customProductID . '/';

        if (!is_dir(MAIN_UPLOAD . companyID . '/' . $destinationFolder)) {
            mkdir(MAIN_UPLOAD . companyID . '/' . $destinationFolder, 0774, true);
            chmod(MAIN_UPLOAD . companyID . '/' . $destinationFolder, 0774);
        }

        $res = $this->Uploader->uploadToCompany($_FILES, 'file', $destinationFolder, $file['name']);

        if (!$res) {
            return $this->sendFailResponse('10');
        }
        $minImage = $this->Uploader->resizeImage(MAIN_UPLOAD . companyID . '/' . $destinationFolder . $file['name'], THUMB_IMAGE_RESIZE_WIDTH, THUMB_IMAGE_RESIZE_HEIGHT, false);

        $explodeName = explode('.', $file['name']);
        $ext = end($explodeName);

        if ($ext == 'pdf') {
            array_pop($explodeName);
            $minImageName = implode('.', $explodeName) . '.jpg';
        } else {
            $minImageName = $file['name'];
        }

        $minImageName = strtolower($minImageName);
        $minImage->writeImage(MAIN_UPLOAD . companyID . '/' . $destinationFolder . THUMB_IMAGE_PREFIX . $minImageName);

        $lastFile['url'] = STATIC_URL . companyID . '/' . CUSTOM_PRODUCT_FOLDER . '/' . $date . '/' . $folder . '/' . $customProductID . '/' . $file['name'];
        $lastFile['minUrl'] = STATIC_URL . companyID . '/' . CUSTOM_PRODUCT_FOLDER . '/' . $date . '/' . $folder . '/' . $customProductID . '/' . THUMB_IMAGE_PREFIX . $minImageName;

        return array('response' => $res, 'file' => $lastFile);
    }

    /**
     * @return array
     */
    public function canUploadCustomProductFiles()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->canUploadCustomProductFiles($user));
    }

    /**
     * @param null $params
     * @return array
     */
    public function count($params = NULL)
    {
        $configs = $this->getConfigs();
        $filters = $this->QueryFilter->prepare($configs, $params);

        $count = $this->CustomProduct->count($filters);
        return array('count' => $count);
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function getOne($ID)
    {
        $customProduct = $this->CustomProduct->get('ID', $ID);

        if( !$customProduct ) {
            return $this->sendFailResponse('06');
        }

        return $customProduct;
    }

}