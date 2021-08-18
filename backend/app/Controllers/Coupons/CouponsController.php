<?php
/**
 * Programista Rafał Leśniak - 20.6.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 20-06-2017
 * Time: 16:44
 */

namespace DreamSoft\Controllers\Coupons;


use DreamSoft\Core\Controller;
use DreamSoft\Controllers\Components\CouponManipulation;
use DreamSoft\Controllers\Components\QueryFilter;
use DreamSoft\Models\Coupon\Coupon;
use DreamSoft\Models\Coupon\CouponOrder;
use DreamSoft\Models\Coupon\CouponProduct;
use DreamSoft\Models\Order\DpOrder;
use DreamSoft\Models\Order\DpProduct;

/**
 * Class CouponsController
 * @package DreamSoft\controllers\coupons
 */
class CouponsController extends Controller
{

    public $useModels = array();

    /**
     * @var Coupon
     */
    protected $Coupon;
    /**
     * @var CouponProduct
     */
    protected $CouponProduct;
    /**
     * @var QueryFilter
     */
    protected $QueryFilter;
    /**
     * @var DpOrder
     */
    protected $DpOrder;
    /**
     * @var DpProduct
     */
    protected $DpProduct;
    /**
     * @var array
     */
    protected $configs;
    /**
     * @var CouponOrder
     */
    protected $CouponOrder;
    /**
     * @var CouponManipulation
     */
    protected $CouponManipulation;

    /**
     * CouponsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Coupon = Coupon::getInstance();
        $this->CouponProduct = CouponProduct::getInstance();
        $this->QueryFilter = new QueryFilter();
        $this->DpOrder = DpOrder::getInstance();
        $this->DpProduct = DpProduct::getInstance();
        $this->CouponOrder = CouponOrder::getInstance();
        $this->CouponManipulation = new CouponManipulation();
        $this->setConfigs();
    }

    public function setConfigs()
    {
        $this->configs = array(
            'ID' => array('type' => 'string', 'table' => 'coupons', 'alias' => true, 'field' => 'ID', 'sign' => $this->QueryFilter->signs['li']),
            'dateFrom' => array('type' => 'timestamp', 'table' => 'coupons', 'alias' => true, 'field' => 'created', 'sign' => $this->QueryFilter->signs['gt']),
            'dateTo' => array('type' => 'timestamp', 'table' => 'coupons', 'field' => 'created', 'alias' => true, 'sign' => $this->QueryFilter->signs['lt']),
            'expiresFrom' => array('type' => 'timestamp', 'table' => 'coupons', 'field' => 'expires', 'alias' => true, 'sign' => $this->QueryFilter->signs['gt']),
            'expiresTo' => array('type' => 'timestamp', 'table' => 'coupons', 'field' => 'expires', 'alias' => true, 'sign' => $this->QueryFilter->signs['lt']),
            'multiUser' => array('type' => 'integer', 'table' => 'coupons', 'field' => 'multiUser', 'alias' => true, 'sign' => $this->QueryFilter->signs['e']),
            'percent' => array('type' => 'integer', 'table' => 'coupons', 'field' => 'percent', 'alias' => true, 'sign' => $this->QueryFilter->signs['e']),
            'value' => array('type' => 'integer', 'table' => 'coupons', 'field' => 'value', 'alias' => true, 'sign' => $this->QueryFilter->signs['e'])
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
     * @param null $params
     * @return array|bool
     */
    public function index($params = NULL)
    {
        $limit = 30;
        if (isset($params['limit'])) {
            $limit = $params['limit'];
        }
        $offset = 0;
        if (isset($params['offset'])) {
            $offset = $params['offset'];
        }

        $sortBy[0] = '-created';

        $configs = $this->getConfigs();

        $filters = $this->QueryFilter->prepare($configs, $params);

        $coupons = $this->Coupon->getList($filters, $offset, $limit, $sortBy);

        if (!$coupons) {
            return array();
        }

        $aggregateCoupons = array();
        foreach ($coupons as $coupon) {
            $aggregateCoupons[] = $coupon['ID'];
        }

        $couponProducts = $this->CouponProduct->getByList($aggregateCoupons);

        foreach ($coupons as $key => $coupon) {
            $coupons[$key]['products'] = $couponProducts[$coupon['ID']];
        }

        return $coupons;
    }

    /**
     * @param null $params
     * @return array
     */
    public function count($params = NULL)
    {

        $configs = $this->getConfigs();

        $filters = $this->QueryFilter->prepare($configs, $params);
        $count = $this->Coupon->count($filters);
        return array('count' => $count);
    }

    /**
     * @return mixed
     */
    public function post_index()
    {
        $post = $this->Data->getAllPost();

        $amount = 1;
        if ($post['amount']) {
            $amount = $post['amount'];
        }

        $data['response'] = false;

        $data['items'] = array();

        if ($post['expires']) {

            if (isset($post['ID']) && strlen($post['ID']) > 0) {
                $existCoupon = $this->Coupon->get('ID', $post['ID']);
                if ($existCoupon) {
                    return $this->sendFailResponse('08');
                }
                $added = $this->CouponManipulation->addOne($post, $post['ID']);
                if ($added) {
                    $data['items'][] = $added;
                }
            } else {
                for ($i = 0; $i < $amount; $i++) {
                    $couponID = $this->CouponManipulation->generateID();
                    $added = $this->CouponManipulation->addOne($post, $couponID);
                    if ($added) {
                        $data['items'][] = $added;
                    }
                }
            }

            $dir = STATIC_PATH . companyID . '/export/tmp/';

            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
                chmod($dir, 0777);
            }

            $fileName = 'coupons_' . date('Y-m-d-H-s') . '.csv';
            $data['exportPath'] = STATIC_URL . companyID . '/export/tmp/' . $fileName;

            $fp = fopen($dir . $fileName, 'w');
            foreach ($data['items'] as $item) {
                fputcsv($fp, array($item['ID']));
            }
            fclose($fp);

        } else {
            return $this->sendFailResponse('02');
        }

        if (!empty($data['items'])) {
            $data['response'] = true;
        }

        return $data;
    }

    /**
     * @param $couponID
     * @return mixed
     */
    public function delete_index($couponID)
    {
        $data['ID'] = $couponID;
        if ( strlen($couponID) > 0 ) {
            if ($this->Coupon->delete('ID', $couponID)) {
                $this->CouponProduct->delete('couponID', $couponID);
                $data['response'] = true;
                return $data;
            } else {
                $data = $this->sendFailResponse('03');
                return $data;
            }

        } else {
            $data = $this->sendFailResponse('04');
            return $data;
        }
    }

    /**
     * @return array
     */
    public function post_products()
    {
        $post = $this->Data->getAllPost();
        $couponID = $post['couponID'];

        $coupon = $this->Coupon->get('ID', $couponID);

        if (!$coupon) {
            return $this->sendFailResponse('06');
        }

        $data['response'] = false;

        if (isset($post['groupID'])) {
            $params['couponID'] = $couponID;
            $params['groupID'] = $post['groupID'];
            if ($post['typeID']) {
                $params['typeID'] = $post['typeID'];
            }
            if ($post['formatID']) {
                $params['formatID'] = $post['formatID'];
            }
            $lastRelationID = $this->CouponProduct->create($params);
        } else {
            $allRelations = $this->CouponProduct->get('couponID', $couponID, true);
            if (!empty($allRelations)) {
                return array('response' => false, 'info' => 'duplicate_all_items');
            } else {
                $params['couponID'] = $couponID;
                $lastRelationID = $this->CouponProduct->create($params);
            }
        }

        if ($lastRelationID > 0) {
            $data['item'] = $this->CouponProduct->getOne($lastRelationID);
            $data['response'] = true;
        }

        return $data;
    }

    public function delete_products($ID)
    {
        $couponProduct = $this->CouponProduct->get('ID', $ID);

        if (!$couponProduct) {
            return $this->sendFailResponse('06');
        }

        if ($this->CouponProduct->delete('ID', $ID)) {
            return array('response' => true);
        }

        return $this->sendFailResponse('05');
    }

    public function post_check()
    {
        $post = $this->Data->getAllPost();

        $coupon = strtoupper($post['coupon']);
        $orderID = $post['orderID'];

        if (empty($coupon)) {
            return $this->sendFailResponse('01');
        }

        if (!$orderID) {
            return $this->sendFailResponse('01', 'no_order_id');
        }

        $coupon = $this->Coupon->get('ID', $coupon);
        $coupon['couponID'] = $coupon['ID'];

        $countValid = 0;
        if ($coupon) {
            $checkCoupons = $this->checkCoupon($coupon, $orderID);

            if( $checkCoupons ) {
                foreach ($checkCoupons as $checkCoupon) {
                    foreach ($checkCoupon as $result) {
                        if($result['valid'] == true) {
                            $countValid++;
                        }
                    }
                }
            }

            if( $countValid > 0 ) {
                return array(
                    'coupon' => $coupon,
                    'response' => true,
                    'info' => $checkCoupons
                );
            } else {
                return array(
                    'coupon' => $coupon,
                    'response' => false,
                    'info' => $checkCoupons
                );
            }
        }

        return $this->sendFailResponse('06');
    }

    /**
     * @param $couponEntity
     * @param $orderID
     * @return array
     */
    private function checkCoupon($couponEntity, $orderID)
    {
        $products = $this->DpProduct->getInfoProducts($orderID);

        if ($couponEntity['expires'] < date('Y-m-d')) {
            $results[] = array(
                'valid' => false,
                'reason' => 'coupon_expired'
            );
            return compact('results','products');
        }

        if ($couponEntity['used'] > 0 && $couponEntity['multiUser'] == 0) {
            $results[] = array(
                'valid' => false,
                'reason' => 'coupon_used'
            );
            return compact('results','products');
        }

        $orderEntity = $this->DpOrder->get('ID', $orderID);
        $loggedUser = $this->Auth->getLoggedUser();

        if ($loggedUser && $loggedUser['ID'] != $orderEntity['userID']) {
            $results[] = array(
                'valid' => false,
                'reason' => 'order_not_match_user'
            );
            return compact('results','products');
        }

        if (!$products) {
            $results[] = array(
                'valid' => false,
                'reason' => 'no_products_in_order'
            );
            return compact('results','products');
        } else {
            $productsToCheck = array();
            foreach ($products as $product) {
                if (strpos($product['subProducts'], '||') !== false) {
                    $productsToCheck[] = array(
                        'typeID' => $product['typeID'],
                        'groupID' => $product['groupID'],
                        'formatID' => NULL,
                        'productID' => $product['productID']
                    );
                }
                $productsToCheck = array_merge($productsToCheck, $this->extractSubProducts($product));
            }
        }

        $couponProducts = $this->CouponProduct->getSimple($couponEntity['ID']);

        $productsMatch = $this->searchCouponMatch($couponProducts, $orderID, $productsToCheck);

        $products = array();

        $results = array();

        if (!$productsMatch) {
            $results[] = array(
                'valid' => false,
                'reason' => 'any_product_match'
            );
        } else {

            foreach ($productsMatch as $productMatch) {

                $couponDuplicate = $this->CouponOrder->checkDuplicate($orderID, $productMatch['productID'], $couponEntity['ID']);

                if( $couponDuplicate ) {
                    $results[] = array(
                        'valid' => false,
                        'reason' => 'coupon_used_in_product'
                    );
                    continue;
                }

                $existCouponOrder = $this->existCouponCheck($orderID, $couponEntity);

                if( $existCouponOrder && $couponEntity['multiUser'] == 0 ) {
                    $results[] = array(
                        'valid' => false,
                        'reason' => 'coupon_exist_in_order'
                    );
                } else {
                    $params = array();
                    $params['orderID'] = $orderID;
                    $params['productID'] = $productMatch['productID'];
                    $params['couponID'] = $couponEntity['ID'];
                    $params['created'] = date('Y-m-d H:i:s');

                    $lastCouponOrderID = $this->CouponOrder->create($params);
                    if( $lastCouponOrderID > 0 ) {
                        $products[] = $productMatch['productID'];
                        $results[] = array(
                            'valid' => true,
                            'reason' => 'ok'
                        );
                    }

                }
            }

        }

        return compact('results','products');
    }

    /**
     * @param $orderID
     * @param $couponEntity
     * @return bool|array
     */
    private function existCouponCheck($orderID, $couponEntity)
    {
        $existCouponOrder = $this->CouponOrder->existInOrder($orderID, $couponEntity['ID']);

        if( !$existCouponOrder ) {
            return false;
        }

        $existProduct = $this->DpProduct->get('ID', $existCouponOrder['productID']);
        if( !$existProduct ) {
            $this->CouponOrder->delete('ID', $existCouponOrder['ID']);
            return $this->existCouponCheck($orderID, $couponEntity);
        }

        return $existCouponOrder;
    }

    /**
     * @param $product
     * @return array
     */
    private function extractSubProducts($product)
    {
        $combinations = array();
        $explodeParts = explode('||', $product['subProducts']);
        foreach ($explodeParts as $explodePart) {
            $explodeSubProducts = explode(',', $explodePart);
            $combinations[] = array(
                'groupID' => $explodeSubProducts[0],
                'typeID' => $explodeSubProducts[1],
                'formatID' => $explodeSubProducts[2],
                'productID' => $product['productID']
            );
        }

        return $combinations;
    }

    /**
     * @param $couponProducts
     * @param $orderID
     * @param $products
     * @return array|bool
     */
    private function searchCouponMatch($couponProducts, $orderID, $products)
    {
        if (!$couponProducts) {
            return false;
        }
        $results = array();
        foreach ($couponProducts as $couponProduct) {

            foreach($products as $product) {
                if ($couponProduct['groupID'] == NULL) {
                    $results[] = array('productID' => $product['productID']);
                    continue;
                }

                $checkType = $checkFormat = false;
                $checkGroup = $this->checkBy($couponProduct['groupID'], 'groupID', $product);
                if( $couponProduct['typeID'] == NULL ) {
                    $checkType = true;
                } else {
                    $checkType = $this->checkBy($couponProduct['typeID'], 'typeID', $product);
                }
                if( $couponProduct['formatID'] == NULL ) {
                    $checkFormat = true;
                } else {
                    $checkFormat = $this->checkBy($couponProduct['formatID'], 'formatID', $product);
                }

                if( $checkGroup && $checkType && $checkFormat ) {
                    $results[] = array('productID' => $product['productID']);
                }
            }
        }

        if( $results ) {
            return $results;
        }

        return false;
    }

    /**
     * @param $ID
     * @param $key
     * @param $product
     * @return bool
     */
    private function checkBy( $ID, $key, $product )
    {
        if( $product[$key] == $ID ) {
            return true;
        }

        return false;
    }
}