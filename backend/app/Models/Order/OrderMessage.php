<?php
/**
 * Programmer Rafał Leśniak - 14.9.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 14-09-2017
 * Time: 18:14
 */

namespace DreamSoft\Models\Order;


use DreamSoft\Core\Model;

/**
 * Class OrderMessage
 * @package DreamSoft\Models\Order
 */
class OrderMessage extends Model
{
    /**
     * OrderMessage constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('orderMessages', true);
    }

    /**
     * @param $orders
     * @return array|bool
     */
    public function getByOrderList($orders)
    {
        if( empty($orders) ){
            return false;
        }
        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `orderID` IN ( ' . implode(',', $orders) . ' ) ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        foreach ($res as $row) {
            $result[$row['orderID']] = $row;
        }
        return $result;
    }

    /**
     * @param $orderID
     * @param int $isFirst
     * @return bool|array
     */
    public function getOne($orderID, $isFirst = 1)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `orderID` = :orderID AND `isFirst` = :isFirst ';

        $binds['orderID'] = $orderID;
        $binds['isFirst'] = $isFirst;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $orders
     * @param $isAdmin
     * @return bool|array
     */
    public function countUnread($orders, $isAdmin)
    {
        if( empty($orders) || !is_array($orders) ){
            return false;
        }

        $query = 'SELECT COUNT(`' . $this->getTableName() . '`.`ID`) as count, orderID '
            . ' FROM `' . $this->getTableName() . '` 
             WHERE `read` = :read AND isAdmin = :isAdmin AND orderID IN ( '.implode(',', $orders).' )
              GROUP BY orderID ';

        $binds['read'] = 0;
        $binds['isAdmin'] = $isAdmin;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if( !$res ){
            return false;
        }
        $result = array();
        foreach ($res as $row){
            $result[$row['orderID']] = $row['count'];
        }
        return $result;
    }

    /**
     * @param $orders
     * @return array|bool
     */
    public function countAll($orders)
    {
        if( empty($orders) || !is_array($orders) ){
            return false;
        }

        $query = 'SELECT COUNT(`' . $this->getTableName() . '`.`ID`) as count, orderID '
            . ' FROM `' . $this->getTableName() . '` 
             WHERE orderID IN ( '.implode(',', $orders).' )
              GROUP BY orderID ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if( !$res ){
            return false;
        }
        $result = array();
        foreach ($res as $row){
            $result[$row['orderID']] = $row['count'];
        }
        return $result;
    }

    /**
     * @param $orderID
     * @param $isAdmin
     * @return bool
     */
    public function setRead($orderID, $isAdmin)
    {
        $query = 'UPDATE `' . $this->getTableName() . '` SET `read` = :read 
        WHERE `orderID` = :orderID AND `isAdmin` = :isAdmin ';

        $binds['read'] = 1;
        $binds['isAdmin'] = $isAdmin;
        $binds['orderID'] = $orderID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $isAdmin
     * @return bool
     */
    public function countAllUnread($isAdmin)
    {
        $query = 'SELECT COUNT( ID ) AS count
                FROM  `' . $this->getTableName() . '` 
                WHERE  `isAdmin` = :isAdmin
                AND `read` = 0 ';

        $binds['isAdmin'] = $isAdmin;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }

}