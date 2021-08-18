<?php

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Class PrintShopIncrease
 */
class PrintShopIncrease extends PrintShop
{

    /**
     * PrintShopIncrease constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_increases', $prefix);
    }

    /**
     * @param $increaseType
     * @return array|bool
     */
    public function customGetAll($increaseType)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'SELECT `ps_products_increases`.*,`ps_products_increaseTypes`.unit  FROM `ps_products_increases`
                LEFT JOIN `ps_products_increaseTypes` ON `ps_products_increaseTypes`.ID = `ps_products_increases`.type
                WHERE `groupID` = :groupID AND `typeID` = :typeID ';
        if ($increaseType) {
            $query .= ' AND `type` = :increaseType ';
        }
        $query .= ' ORDER BY `amount` ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        if ($increaseType) {
            $binds[':increaseType'] = $increaseType;
        }

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $amount
     * @param $value
     * @param $type
     * @param null $formatID
     * @return bool|string
     */
    public function customCreate($amount, $value, $type, $formatID = null)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'INSERT INTO `ps_products_increases` 
            ( `groupID`, `typeID`, `formatID`, `amount`, `value`, `type` ) VALUES
            ( :groupID, :typeID, :formatID, :amount, :value, :type )';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':formatID'] = $formatID;
        $binds[':value'] = $value;
        $binds[':amount'] = $amount;
        $binds[':type'] = $type;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();
    }

    /**
     * @param $amount
     * @param $type
     * @param null $formatID
     * @return bool
     */
    public function exist($amount, $type, $formatID = null)
    {
        $query = 'SELECT `ID` FROM `ps_products_increases`
                WHERE `groupID` = :groupID AND `typeID` = :typeID ';
        if ($formatID) {
            $query .= ' AND `formatID` = :formatID ';
        } else {
            $query .= ' AND `formatID` IS NULL ';
        }
        $query .= ' AND `amount` = :amount AND `type` = :type ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        if ($formatID) {
            $binds[':formatID'] = $formatID;
        }
        $binds[':type'] = $type;
        $binds[':amount'] = $amount;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getOne();
    }

    /**
     * @return bool|array
     */
    public function getTypes()
    {
        $query = 'SELECT * FROM `ps_products_increaseTypes` ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $ID
     * @return bool
     */
    public function getType($ID)
    {
        $query = 'SELECT * FROM `ps_products_increaseTypes` WHERE `ID` = :ID ';

        $binds[':ID'] = $ID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return bool
     */
    public function deleteByGroupType($groupID, $typeID)
    {
        $query = 'DELETE FROM `ps_products_increases` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID
                ';

        $binds[':groupID'] = $groupID;
        $binds[':typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param $amount
     * @param null $formatID
     * @return bool
     */
    public function getSheetIncrease($amount, $formatID = null)
    {
        return $this->getIncrease(null, null, $formatID, $amount, 1);
    }

    /**
     * @param $amount
     * @param null $formatID
     * @return bool
     */
    public function getSetIncrease($amount, $formatID = null)
    {
        return $this->getIncrease(null, null, $formatID, $amount, 2);
    }

    /**
     * @param $amount
     * @param null $formatID
     * @return bool
     */
    public function getSetPriceIncrease($amount, $formatID = null)
    {
        return $this->getIncrease(null, null, $formatID, $amount, 3);
    }

    /**
     * @param $amount
     * @param null $formatID
     * @return bool
     */
    public function getRollSlipIncrease($amount, $formatID = null)
    {
        return $this->getIncrease(null, null, $formatID, $amount, 4);
    }

    /**
     * @param $amount
     * @param null $formatID
     * @return bool
     */
    public function getPtcPriceIncrease($amount, $formatID = null)
    {
        return $this->getIncrease(null, null, $formatID, $amount, 5);
    }

    /**
     * @param null $groupID
     * @param null $typeID
     * @param null $formatID
     * @param $amount
     * @param $type
     * @return bool
     */
    public function getIncrease($groupID = null, $typeID = null, $formatID = null, $amount, $type)
    {
        if ($groupID === null && $this->groupID) {
            $groupID = $this->groupID;
        } else {
            return false;
        }
        if ($typeID === null && $this->typeID) {
            $typeID = $this->typeID;
        } else {
            return false;
        }
        $query = 'SELECT `value` FROM `ps_products_increases` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID AND ( `formatID` = :formatID OR `formatID` IS NULL )
                AND `type` = :type AND `amount` <= :amount
                ORDER BY `amount` DESC LIMIT 1';

        $binds[':groupID'] = $groupID;
        $binds[':typeID'] = $typeID;
        $binds[':formatID'] = $formatID;
        $binds[':amount'] = $amount;
        $binds[':type'] = $type;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getOne();

    }
}
