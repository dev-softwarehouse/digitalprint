<?php

namespace DreamSoft\Models\Order;

/**
 * Description of DpOrderAddressProduct
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class DpOrderAddressProduct extends Model
{

    private $orderAddress;
    private $address;

    public function __construct()
    {
        parent::__construct();
        $this->setTableName('orderAddressProducts', true);
        $this->orderAddress = $this->prefix . 'orderAddress';
        $this->address = 'address';
    }

    public function deleteByProduct($productID)
    {
        $query = ' DELETE FROM `' . $this->getTableName() . '` WHERE `productID` = :productID ';

        $binds['productID'] = $productID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $productID
     * @param int $type
     * @return bool|array
     */
    public function getByProduct($productID, $type = 1)
    {
        $query = 'SELECT oa.addressID, oa.deliveryID, oap.volume FROM `' . $this->getTableName() . '` AS oap 
         LEFT JOIN `' . $this->orderAddress . '` AS oa ON oa.ID = oap.orderAddressID 
         LEFT JOIN `' . $this->address . '` AS a ON a.ID = oa.addressID 
         WHERE oa.type = :type AND oap.`productID` = :productID ';

        $binds['productID'] = $productID;
        $binds['type'] = $type;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    public function getAllByProduct($productID)
    {
        $query = 'SELECT oa.addressID, oa.deliveryID, oap.volume FROM `' . $this->getTableName() . '` AS oap 
         LEFT JOIN `' . $this->orderAddress . '` AS oa ON oa.ID = oap.orderAddressID 
         LEFT JOIN `' . $this->address . '` AS a ON a.ID = oa.addressID 
         WHERE oap.`productID` = :productID ';

        $binds['productID'] = $productID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }
}