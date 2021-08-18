<?php
/**
 * Programista Rafał Leśniak - 28.6.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 28-06-2017
 * Time: 13:17
 */

namespace DreamSoft\Models\Coupon;
use DreamSoft\Core\Model;

class CouponOrder extends Model
{
    /**
     * @var string
     */
    protected $coupon;

    /**
     * CouponOrder constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('couponOrders', true);
        $this->coupon = $this->prefix . 'coupons';
    }

    /**
     * @param $orderID
     * @param $couponID
     * @return mixed
     */
    public function existInOrder($orderID, $couponID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE 
         orderID = :orderID AND couponID = :couponID AND priceUpdated = 1 ';

        $binds['orderID'] = $orderID;
        $binds['couponID'] = $couponID;

        $this->db->exec($query, $binds);

        return $this->db->getRow();
    }

    /**
     * @param $orderID
     * @param $productID
     * @return mixed
     */
    public function productHasCoupon($orderID, $productID)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE 
         orderID = :orderID AND productID = :productID ';

        $binds['orderID'] = $orderID;
        $binds['productID'] = $productID;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

    /**
     * @param array $products
     * @return array|bool
     */
    public function getByProducts(array $products)
    {
        if (!$products) {
            return false;
        }
        $query = 'SELECT couponOrder.*, coupon.value, coupon.percent FROM `' . $this->getTableName() . '` AS couponOrder
            LEFT JOIN `' . $this->coupon . '` AS coupon ON  coupon.ID = couponOrder.couponID
             WHERE couponOrder.`productID` IN ( ' . implode(',', $products) . ' ) AND couponOrder.priceUpdated = 1 ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        foreach ($res as $row) {
            $result[$row['productID']][] = $row;
        }
        return $result;
    }

    /**
     * @param $orderID
     * @return mixed
     */
    public function getByOrder($orderID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE 
         orderID = :orderID ';

        $binds['orderID'] = $orderID;

        $this->db->exec($query, $binds);

        return $this->db->getRow();
    }

    /**
     * @param $orderID
     * @param $productID
     * @param $couponID
     * @return mixed
     */
    public function checkDuplicate($orderID, $productID, $couponID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE 
         orderID = :orderID AND productID = :productID AND couponID = :couponID AND priceUpdated = 1 ';

        $binds['orderID'] = $orderID;
        $binds['productID'] = $productID;
        $binds['couponID'] = $couponID;

        $this->db->exec($query, $binds);

        return $this->db->getRow();
    }

    /**
     * @param $productID
     * @param null $couponID
     * @return mixed
     */
    public function getByProduct($productID, $couponID = NULL)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE 
         productID = :productID ';

        $binds['productID'] = $productID;
        if ($couponID !== NULL) {
            $query .= ' AND couponID != :couponID ';
            $binds['couponID'] = $couponID;
        }

        $this->db->exec($query, $binds);

        return $this->db->getRow();
    }
}