<?php

namespace DreamSoft\Models\Order;

/**
 * Description of DpProductFile
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\UrlMaker;

class DpProductFile extends Model
{
    /**
     * @var UrlMaker
     */
    private $UrlMaker;

    /**
     * DpProductFile constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'dp_';
        $this->UrlMaker = new UrlMaker();
        $this->setTableName('productFiles', true);
    }

    /**
     * @param $productID
     * @return bool
     */
    public function getByProduct($productID)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `productID` = :productID ';

        $binds['productID'] = $productID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        return $res;
    }

    /**
     * @param $orders
     * @param null $isLocal
     * @return bool
     */
    public function getByOrderList($orders, $isLocal = NULL)
    {
        if (!$orders) {
            return false;
        }
        $query = 'SELECT dpf . * 
            FROM  `' . $this->getTableName() . '` AS dpf
            LEFT JOIN  `dp_products` AS p ON p.ID = dpf.`productID`
            LEFT JOIN  `dp_orders` AS o ON o.ID = p.`orderID`
            WHERE o.`ID` IN  (' . implode(',', $orders) . ')';

        $binds = array();

        if ($isLocal !== NULL) {
            $query .= ' AND dpf.isLocal = :isLocal ';
            $binds['isLocal'] = $isLocal;
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        return $res;
    }

    /**
     * @param $products
     * @return array|bool
     */
    public function getByList($products)
    {

        if (empty($products) || !is_array($products)) {
            return false;
        }

        $query = 'SELECT * 
                  FROM `' . $this->getTableName() . '` WHERE `productID` IN  (' . implode(',', $products) . ') ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        $result = array();
        if (!$res) {
            return false;
        }

        foreach ($res as $key => $value) {
            $result[$value['productID']][] = $value;
        }
        return $result;

    }

    /**
     * @param $params
     * @return bool|string
     */
    public function add($params)
    {

        if (empty($params)) {
            return false;
        }

        foreach ($params as $key => $value) {
            if ($key === 'name') {
                $params[$key] = $this->UrlMaker->permalink($value);
            }
        }
        return $this->create($params);
    }

    /**
     * @param $productID
     * @return bool
     */
    public function getMaxFileID($productID)
    {
        $query = 'SELECT MAX(`fileID`) FROM `' . $this->getTableName() . '` WHERE `productID` = :productID ';

        $binds['productID'] = $productID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $productID
     * @return bool|int
     */
    public function countByProduct($productID)
    {

        $query = 'SELECT COUNT(`ID`) FROM `' . $this->getTableName() . '` WHERE `productID` = :productID ';

        $binds['productID'] = $productID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return intval($this->db->getOne());
    }

}
