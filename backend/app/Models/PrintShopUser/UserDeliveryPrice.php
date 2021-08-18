<?php

namespace DreamSoft\Models\PrintShopUser;
/**
 * Created by PhpStorm.
 * User: rafal
 * Date: 09.12.16
 * Time: 21:14
 */
use DreamSoft\Core\Model;

class UserDeliveryPrice extends Model
{
    /**
     * DeliveryPrice constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_user_';
        $this->setTableName('deliveryPrices', true);
    }

    /**
     * @param $list
     * @param null $joined
     * @param null $active
     * @return array|bool
     */
    public function getByCalcList($list, $joined = NULL, $active = NULL)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `calcID` IN ( ' . implode(',', $list) . ' ) ';

        $binds = array();

        if ($joined !== NULL) {
            $query .= ' AND `joined` = :joined ';
            $binds['joined'] = $joined;
        }

        if ($active !== NULL) {
            $query .= ' AND `active` = :active ';
            $binds['active'] = $active;
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        foreach ($res as $row) {
            $result[$row['calcID']] = $row;
        }
        return $result;
    }

    /**
     * @param $calcID
     * @param null $active
     * @param null $joined
     * @return bool
     */
    public function getOneByCalc($calcID, $active = NULL, $joined = NULL)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `calcID` = :calcID ';

        $binds['calcID'] = $calcID;

        if ($joined !== NULL) {
            $query .= ' AND `joined` = :joined ';
            $binds['joined'] = $joined;
        }

        if ($active !== NULL) {
            $query .= ' AND `active` = :active ';
            $binds['active'] = $active;
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $calcID
     * @param $productID
     * @param $volume
     * @param int $active
     * @return bool
     */
    public function getByParams($calcID, $productID, $volume, $active = 1)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `calcID` = :calcID AND `productID` = :productID AND `volume` = :volume ';

        $binds['calcID'] = $calcID;
        $binds['productID'] = $productID;
        $binds['volume'] = $volume;

        if ($active !== NULL) {
            $query .= ' AND `active` = :active ';
            $binds['active'] = $active;
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $volume
     * @param $deliveryID
     * @param $productID
     * @return bool|array
     */
    public function getByOrderAddress($volume, $deliveryID, $productID)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.*, basePrice.price, 
        basePrice.grossPrice, basePrice.currency FROM `' . $this->getTableName() . '` 
                LEFT JOIN `dp_base_prices` as basePrice ON basePrice.ID = `' . $this->getTableName() . '`.priceID '
            . ' WHERE `deliveryID` = :deliveryID AND `volume` = :volume AND `productID` = :productID AND `active` = 1 ';

        $binds['deliveryID'] = $deliveryID;
        $binds['volume'] = $volume;
        $binds['productID'] = $productID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $volume
     * @param $deliveryID
     * @param $aggregateProducts
     * @return bool|mixed
     */
    public function getByJoinDelivery($deliveryID, $aggregateProducts)
    {
        if( !$aggregateProducts ) {
            return false;
        }

        $query = 'SELECT `' . $this->getTableName() . '`.*, basePrice.price, 
        basePrice.grossPrice, basePrice.currency FROM `' . $this->getTableName() . '` 
                LEFT JOIN `dp_base_prices` as basePrice ON basePrice.ID = `' . $this->getTableName() . '`.priceID '
            . ' WHERE `deliveryID` = :deliveryID AND
             `' . $this->getTableName() . '`.productID IN ('. implode(',', $aggregateProducts) .') AND `active` = 1 ';

        $binds['deliveryID'] = $deliveryID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

}