<?php

namespace DreamSoft\Models\Order;

/**
 * Description of DpOrderAddress
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class DpOrderAddress extends Model
{

    protected $addressProductsTable;
    protected $addressSource;
    protected $deliveryPrices;
    protected $basePrices;

    public function __construct()
    {
        parent::__construct();
        $this->setTableName('orderAddress', true);
        $this->addressProductsTable = 'dp_orderAddressProducts';
        $this->addressSource = 'address';
        $this->deliveryPrices = 'ps_user_deliveryPrices';
        $this->basePrices = 'dp_base_prices';
    }

    /**
     * @param $orderIDs
     * @param null $type
     * @return bool
     */
    public function getOrdersAddresses($orderIDs, $type = null)
    {
        if (empty($orderIDs)) {
            return false;
        }
        $query = 'SELECT orderAddress.orderID, addressProduct.volume, address.*, orderAddress.senderID, orderAddress.ID as orderAddressID, orderAddress.type, 
            orderAddress.senderID, orderAddress.deliveryID, orderAddress.joined, orderAddress.collectionPointID, orders.userID, addressProduct.productID  
            FROM `' . $this->getTableName() . '` as orderAddress 
            LEFT JOIN  `' . $this->addressSource . '` as address ON orderAddress.addressID = address.ID
            LEFT JOIN  `dp_orders` as orders ON orders.ID = orderAddress.orderID 
            LEFT JOIN  `dp_orderAddressProducts` as addressProduct ON orderAddress.ID = addressProduct.orderAddressID 
            WHERE orderAddress.orderID IN (' . implode(',', $orderIDs) . ') ';
        if ($type) {
            $query .= ' AND orderAddress.type = :type';
        }

        $query .= ' GROUP BY orderAddress.ID ';

        $binds = array();
        if ($type) {
            $binds['type'] = $type;
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $result = $this->db->getAll();
        $orderAddressIDs = array();
        $senderIDs = array();
        foreach ($result as $each) {
            $orderAddressIDs[] = $each['orderAddressID'];
            if (intval($each['senderID']) > 0) {
                $senderIDs[] = $each['senderID'];
            }
        }

        return $result;
    }

    /**
     * @param $senderList
     * @return array|bool
     */
    public function getSenderOrdersAddresses($senderList)
    {
        if (empty($senderList)) {
            return false;
        }
        $query = 'SELECT address.*, orderAddress.ID as orderAddressID, orderAddress.type 
            FROM `' . $this->getTableName() . '` as orderAddress 
            LEFT JOIN  `' . $this->addressSource . '` as address ON orderAddress.addressID = address.ID
            WHERE orderAddress.senderID IN (' . implode(',', $senderList) . ') ';

        if (!$this->db->exec($query)) {
            return false;
        }

        $res = $this->db->getAll();

        if (!$res) {
            return false;
        }

        $result = array();
        foreach ($res as $r) {
            $result[$r['orderAddressID']] = $r;
        }
        return $result;
    }

    /**
     * @param $orderAddressIDs
     * @return bool|array
     */
    public function getAddressProducts($orderAddressIDs)
    {
        if (empty($orderAddressIDs)) {
            return false;
        }

        $query = 'SELECT orderAddress.ID, 
                         addressProducts.orderAddressID, 
                         addressProducts.productID, 
                         addressProducts.volume,
                         basePrice.price,
                         basePrice.ID as priceID,
                         basePrice.grossPrice,
                         basePrice.currency,
                         deliveryPrices.joined  
                          FROM `' . $this->addressProductsTable . '` as addressProducts
            LEFT JOIN `'.$this->deliveryPrices.'` as deliveryPrices ON 
            deliveryPrices.productID = addressProducts.productID AND deliveryPrices.volume = addressProducts.volume AND 
            deliveryPrices.deliveryID = orderAddress.deliveryID 
            LEFT JOIN `'.$this->basePrices.'` as basePrice ON basePrice.ID = deliveryPrices.priceID 
            LEFT JOIN `dp_orderAddress` as orderAddress ON orderAddress.ID = addressProducts.orderAddressID 
            WHERE addressProducts.orderAddressID IN (' . implode(',', $orderAddressIDs) . ') AND deliveryPrices.volume = addressProducts.volume
            GROUP BY addressProducts.orderAddressID ';

        if (!$this->db->exec($query)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * @param $orderID
     * @param int $type
     * @return bool
     */
    public function deleteByOrder($orderID, $type = 1)
    {
            $query = ' DELETE FROM `' . $this->getTableName() . '` WHERE `orderID` = :orderID AND `type` = :type ';

            $binds['orderID'] = $orderID;
            $binds['type'] = $type;

            if (!$this->db->exec($query, $binds)) {
                return false;
            }
        return true;
    }

    /**
     * @param $list
     * @return bool|array
     */
    public function getByList($list)
    {
        if( empty($list) ){
            return false;
        }

        $query = 'SELECT * FROM `'.$this->getTableName().'` WHERE `ID` IN ('.  implode(',', $list).') ';

        if (!$this->db->exec($query)) {
            return false;
        }

        $res = $this->db->getAll();
        if(!$res){
            return false;
        }

        foreach ($res as $key => $value) {
            $result[$value['ID']] = $value;
        }
        return $result;
    }

    /**
     * @param $orderID
     * @param int $type
     * @return bool|array
     */
    public function getByOrder($orderID, $type = 1)
    {
        $query = ' SELECT orderAddress.*, orderAddressProduct.productID, orderAddressProduct.volume  FROM `' . $this->getTableName() . '` as orderAddress
        LEFT JOIN `'. $this->addressProductsTable .'` as orderAddressProduct ON orderAddressProduct.`orderAddressID` = orderAddress.`ID`
        WHERE orderAddress.`orderID` = :orderID AND orderAddress.`type` = :type ';

        $binds['orderID'] = $orderID;
        $binds['type'] = $type;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    public function getOrdersInvoiceAddresses($orderIDs)
    {
        if (empty($orderIDs)) {
            return false;
        }
        $query = 'SELECT * FROM `' . $this->getTableName() . '` as orderAddress 
            WHERE orderAddress.orderID IN (' . implode(',', $orderIDs) . ') ';

        $query .= ' AND orderAddress.type = 2';


        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        if (!$res) {
            return false;
        }

        $result = array();
        foreach ($res as $r) {
            $result[$r['orderID']] = $r;
        }
        return $result;
    }
}
