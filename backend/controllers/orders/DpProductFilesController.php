<?php

use DreamSoft\Controllers\Components\Acl;
use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Order\DpOrder;
use DreamSoft\Models\Order\DpProduct;
use DreamSoft\Models\Order\DpProductFile;
use DreamSoft\Models\Other\ModelIconExtension;

/**
 * Description of DpProductFilesController
 *
 * @author Rafał
 */
class DpProductFilesController extends Controller
{

    public $useModels = array();

    /**
     * @var DpProductFile
     */
    protected $DpProductFile;
    /**
     * @var DpProduct
     */
    protected $DpProduct;
    /**
     * @var DpOrder
     */
    protected $DpOrder;
    /**
     * @var Uploader
     */
    protected $Uploader;
    /**
     * @var ModelIconExtension
     */
    protected $ModelIconExtension;
    /**
     * @var Acl
     */
    private $Acl;
    /**
     * @var string
     */
    protected $folder;


    public function __construct($params)
    {
        parent::__construct($params);
        $this->DpProductFile = DpProductFile::getInstance();
        $this->DpOrder = DpOrder::getInstance();
        $this->DpProduct = DpProduct::getInstance();
        $this->ModelIconExtension = ModelIconExtension::getInstance();
        $this->Acl = new Acl();

        $this->folder = 'productFiles';
        $this->Uploader = Uploader::getInstance();

    }

    /**
     * @param $productID
     * @return array
     * @throws ImagickException
     */
    public function post_files($productID)
    {
        $product = $this->DpProduct->get('ID', $productID);

        $order = $this->DpOrder->get('ID', $product['orderID']);

        $user = $this->Auth->getLoggedUser();

        if ($order['userID'] != NULL) {
            if ($order['userID'] != $user['ID']) {
                return array('response' => 'false', 'info' => 'order is not user', 'orderID' => $order['ID']);
            }
        }

        $created = date('Y-m-d H:i:s');

        $name = strtolower($_FILES['file']['name']);

        $explodeName = explode('.', $name);
        $ext = end($explodeName);

        $allowedExtension = $this->parseAllowedExtensions($this->ModelIconExtension->getAll());

        if( !in_array($ext, $allowedExtension) ) {
            return $this->sendFailResponse('11');
        }

        $fileID = $this->DpProductFile->getMaxFileID($productID);
        if ($fileID) {
            $fileID++;
        } else {
            $fileID = 1;
        }

        $folder = intval($productID / 100);

        $lastID = $this->DpProductFile->add(compact('created', 'productID', 'name', 'folder', 'fileID'));
        $lastFile = $this->DpProductFile->get('ID', $lastID);

        $date = date('Y-m-d', strtotime($created));

        $destinationFolder = $this->folder . '/' . $date . '/' . $folder . '/' . $productID . '/' . $lastFile['ID'] . '/';

        $res = $this->Uploader->uploadToCompany($_FILES, 'file', $destinationFolder, $lastFile['name']);

        $lastFile['url'] = STATIC_URL . companyID . '/' . 'productFiles/' . $date . '/' . $folder . '/' . $productID . '/' . $lastFile['ID'] . '/' . $lastFile['name'];
        $lastFile['hasMiniature'] = false;

        return array('response' => $res, 'file' => $lastFile);

    }

    private function parseAllowedExtensions( $extensionList )
    {
        if( !$extensionList ) {
            return explode(',', THUMB_IMAGE_ALLOWED_EXTENSION);
        }
        $extensions = array();
        foreach ($extensionList as $item) {
            $extensions[] = $item['extension'];
        }

        return $extensions;
    }

    /**
     * @param $productID
     * @return array|bool
     */
    public function files($productID)
    {

        $product = $this->DpProduct->get('ID', $productID);

        $order = $this->DpOrder->get('ID', $product['orderID']);

        $user = $this->Auth->getLoggedUser();

        if ($order['userID'] != NULL) {
            if ($user['super'] == 0) {
                if (($order['userID'] != $user['ID']) && !$this->Acl->canSeeUserFiles($user)) {
                    return array();
                }
            }
        }

        $list = $this->DpProductFile->getByProduct($productID);

        if (empty($list)) {
            $list = array();
        } else {

            $allowedThumbExtension = explode(',', THUMB_IMAGE_ALLOWED_EXTENSION);

            foreach ($list as $key => $row) {

                $explodeName = explode('.', $row['name']);
                $ext = end($explodeName);

                $minImageName = false;

                if ($ext == THUMB_PDF_ALLOWED_EXTENSION) {
                    array_pop($explodeName);
                    $minImageName = implode('.', $explodeName) . '.jpg';
                } else if( in_array($ext, $allowedThumbExtension) ) {
                    $minImageName = $row['name'];
                }

                $date = date('Y-m-d', strtotime($row['created']));
                $list[$key]['url'] = STATIC_URL . companyID . '/' . 'productFiles/' . $date . '/' . $row['folder'] . '/' . $row['productID'] . '/' . $row['ID'] . '/' . $row['name'];

                if($minImageName){
                    $list[$key]['minUrl'] = STATIC_URL . companyID . '/' . 'productFiles/' . $date . '/' . $row['folder'] . '/' . $row['productID'] . '/' . $row['ID'] . '/' . THUMB_IMAGE_PREFIX . $minImageName;
                } else {
                    $list[$key]['minUrl'] = STATIC_URL . companyID . '/' . 'images' . '/' . THUMB_IMAGE_DEFAULT;
                }

                $list[$key]['hasMiniature'] = true;

            }

        }

        return $list;
    }

    /**
     * @param $orderParams
     * @return array|bool
     */
    public function productListFiles($orderParams)
    {
        $orderParams = explode(',', $orderParams);
        $firstOrderID = current($orderParams);

        $order = $this->DpOrder->get('ID', $firstOrderID);

        $user = $this->Auth->getLoggedUser();

        if ($order['userID'] != NULL) {
            if ($user['super'] == 0) {
                if (($order['userID'] != $user['ID'])) {
                    return array();
                }
            }
        }

        $list = $this->DpProductFile->getByOrderList($orderParams, 0);

        $result = array();
        if (empty($list)) {
            return array();
        } else {

            $allowedThumbExtension = explode(',', THUMB_IMAGE_ALLOWED_EXTENSION);

            foreach ($list as $key => $row) {

                $explodeName = explode('.', $row['name']);
                $ext = end($explodeName);

                $minImageName = false;

                if ($ext == THUMB_PDF_ALLOWED_EXTENSION) {
                    array_pop($explodeName);
                    $minImageName = implode('.', $explodeName) . '.jpg';
                } else if( in_array($ext, $allowedThumbExtension) ) {
                    $minImageName = $row['name'];
                }

                $date = date('Y-m-d', strtotime($row['created']));

                $row['size'] = filesize(MAIN_UPLOAD . companyID . '/' . '/' . 'productFiles/' . $date . '/' . $row['folder'] . '/' . $row['productID'] . '/' . $row['ID'] . '/' . $row['name']);
                $row['url'] = STATIC_URL . companyID . '/' . 'productFiles/' . $date . '/' . $row['folder'] . '/' . $row['productID'] . '/' . $row['ID'] . '/' . $row['name'];

                if($minImageName) {
                    $row['minUrl'] = STATIC_URL . companyID . '/' . 'productFiles/' . $date . '/' . $row['folder'] . '/' . $row['productID'] . '/' . $row['ID'] . '/' . THUMB_IMAGE_PREFIX . $minImageName;
                } else {
                    $row['minUrl'] = STATIC_URL . companyID . '/' . 'images' . '/' . THUMB_IMAGE_DEFAULT;
                }

                $row['hasMiniature'] = true;

                $result[$row['productID']][] = $row;
            }

        }

        return $result;

    }

    /**
     * @deprecated since 12.2017
     * @param $productID
     * @param $fileID
     */
    public function getFile($productID, $fileID)
    {


        //$folder = 'offer_items';

        /*$one = $this->AF->get('ID', $fileID);
        $file = MAIN_UPLOAD.$this->folder.'/'.$one['created'].'/'.$one['auctionID'].'/'.$one['name'];
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file);
        
        $size   = filesize($file);
        
        header('Content-Description: File Transfer');
        header('Content-Type: '.$mime_type);
        header('Content-Disposition: attachment; filename="'.basename($file).'"');
        header('Content-Length: ' . $size);
        readfile($file);*/

    }

    /**
     * @param $fileID
     * @return array
     */
    protected function _delete_file($fileID)
    {

        $result = array();

        $one = $this->DpProductFile->get('ID', $fileID);

        if (!$one) {
            $result = $this->sendFailResponse('04');
        }

        $date = date('Y-m-d', strtotime($one['created']));

        $destFoleder = $this->folder . '/' . $date . '/' . $one['folder'] . '/' . $one['productID'] . '/' . $one['ID'] . '/';

        if ($this->Uploader->removeFromCompany($destFoleder, $one['name'])) {

            if ($this->DpProductFile->delete('ID', $one['ID'])) {

                $result = array('response' => true, 'removed_item' => $one);

            } else {

                $result = $this->sendFailResponse('05');

            }

        } else {

            $result = $this->sendFailResponse('05');

        }

        return $result;

    }


    /**
     * @param $productID
     * @param $fileID
     * @return array
     */
    public function delete_files($productID, $fileID)
    {

        $oneFile = $this->DpProductFile->get('ID', $fileID);

        $product = $this->DpProduct->get('ID', $oneFile['productID']);

        $order = $this->DpOrder->get('ID', $product['orderID']);

        $user = $this->Auth->getLoggedUser();

        if ($order['userID'] != NULL) {
            if ($order['userID'] != $user['ID']) {
                return array('response' => 'false');
            }
        }

        return $this->_delete_file($fileID);

    }

    /**
     * @return array
     */
    public function canSeeUserFiles()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->canSeeAllOngoings($user));
    }

    /**
     * @param $fileID
     * @return array
     */
    public function makeMiniature($fileID)
    {
        $file = $this->DpProductFile->get('ID', $fileID);


        $explodeName = explode('.', $file['name']);
        $ext = end($explodeName);

        $minImageName = false;

        $allowedThumbExtension = explode(',', THUMB_IMAGE_ALLOWED_EXTENSION);

        if ($ext == THUMB_PDF_ALLOWED_EXTENSION) {
            array_pop($explodeName);
            $minImageName = implode('.', $explodeName) . '.jpg';
        } else if( in_array($ext, $allowedThumbExtension) ) {
            $minImageName = $file['name'];
        }

        $date = date('Y-m-d', strtotime($file['created']));


        $minFile = STATIC_PATH . companyID . '/' . 'productFiles/' . $date . '/' . $file['folder'] . '/' . $file['productID'] . '/' . $file['ID'] . '/' . THUMB_IMAGE_PREFIX . $minImageName;
        $minUrl = STATIC_URL . companyID . '/' . 'productFiles/' . $date . '/' . $file['folder'] . '/' . $file['productID'] . '/' . $file['ID'] . '/' . THUMB_IMAGE_PREFIX . $minImageName;

        $result = array();

        if( !is_file($minFile) ) {

            $destinationFolder = $this->folder . '/' . $date . '/' . $file['folder'] . '/' . $file['productID'] . '/' . $file['ID'] . '/';
            try {
                $minImage = $this->Uploader->resizeImage(MAIN_UPLOAD . companyID . '/' . $destinationFolder . $file['name'], THUMB_IMAGE_RESIZE_WIDTH, THUMB_IMAGE_RESIZE_HEIGHT, false);
                $minImage->writeImage(MAIN_UPLOAD . companyID . '/' . $destinationFolder . THUMB_IMAGE_PREFIX . $minImageName);
                $result['response'] = true;
                $result['minUrl'] = $minUrl;
                $result['created'] = true;

            } catch (ImagickException $exception) {
                $result['response'] = false;
                $result['info'] = $exception->getMessage();
            }


        } else {
            $result['minUrl'] = $minUrl;
            $result['created'] = false;
            $result['response'] = true;
        }

        return $result;

    }


}
