<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 06-08-2018
 * Time: 15:28
 */

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Models\PrintShop\PrintShop;

/**
 * Class PrintShopOptionDelivery
 * @package DreamSoft\Models\PrintShopProduct
 */
class PrintShopOptionDelivery extends PrintShop
{
    /**
     * PrintShopOptionDelivery constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('products_optionDeliveries', true);
    }

    /**
     * @param $productOptionID
     * @param $deliveryID
     * @return bool|mixed
     */
    public function customExist($productOptionID, $deliveryID)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` 
                WHERE `deliveryID` = :deliveryID AND `productOptionID` = :productOptionID';

        $binds['productOptionID'] = $productOptionID;
        $binds['deliveryID'] = $deliveryID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $typeID
     * @param $list
     * @return array|bool
     */
    public function getByListOptions($typeID, $list)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `productOptionID` IN ( ' . implode(',', $list) . ' ) AND `typeID` = :typeID ';

        $binds['typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        foreach ($res as $row) {
            $result[$row['productOptionID']][] = $row['deliveryID'];
        }
        return $result;
    }

    /**
     * @param $productOptionID
     * @param $typeID
     * @return bool
     */
    public function deleteBy($productOptionID, $typeID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE `productOptionID` = :productOptionID 
        AND `typeID` = :typeID ';

        $binds['productOptionID'] = $productOptionID;
        $binds['typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }
}