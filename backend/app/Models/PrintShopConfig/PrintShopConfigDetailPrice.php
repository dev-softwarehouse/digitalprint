<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Description of PrintShopConfigDetailPrice
 *
 * @author Rafał
 */
class PrintShopConfigDetailPrice extends PrintShop
{

    /**
     * PrintShopConfigDetailPrice constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_detailPrices', $prefix);
    }

    /**
     * @return bool|mixed
     */
    public function customGet()
    {

        $query = 'SELECT `ID`, `minPrice`, `basePrice`, `startUp`, `excluded`, `printRotated` FROM `' . $this->getTableName() . '` 
                WHERE `attrID` = :attrID AND `optID` = :optID ';

        if (!empty($this->controllerID)) {
            $query .= ' AND `controllerID` = :controllerID ';
            $binds[':controllerID'] = $this->controllerID;
        }

        $binds[':attrID'] = $this->attrID;
        $binds[':optID'] = $this->optID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);

    }

    /**
     * @return array|bool
     */
    public function getAll()
    {

        $query = 'SELECT `controllerID`, `ID`, `minPrice`, `basePrice`, `startUp`, `excluded`, `printRotated` FROM `' . $this->getTableName() . '` 
                WHERE `attrID` = :attrID AND `optID` = :optID ';

        $binds[':attrID'] = $this->attrID;
        $binds[':optID'] = $this->optID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);

    }

    /**
     * @return bool
     */
    public function customExist()
    {

        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `attrID` = :attrID AND `optID` = :optID';

        $binds[':controllerID'] = $this->controllerID;
        $binds[':attrID'] = $this->attrID;
        $binds[':optID'] = $this->optID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getOne();
    }

    /**
     * @param $id
     * @param $name
     * @param $value
     * @return bool
     */
    public function update($id, $name, $value)
    {
        $query = 'UPDATE `' . $this->getTableName() . '` 
            SET `' . $name . '` = :value
            WHERE `ID` = :id
            ';
        $binds[':id'] = $id;
        $binds[':value'] = $value;

        if (!$this->db->exec($query, $binds)) return false;

        return true;
    }

    /**
     * @param $name
     * @param $value
     * @return bool|string
     */
    public function customCreate($name, $value)
    {
        if ($id = $this->customExist()) {
            return $this->update($id, $name, $value);
        }

        $query = 'INSERT INTO `' . $this->getTableName() . '`
                (`controllerID`, `attrID`, `optID`, `' . $name . '`)
                VALUES ( :controllerID, :attrID, :optID, :value )';

        $binds[':controllerID'] = $this->controllerID;
        $binds[':attrID'] = $this->attrID;
        $binds[':optID'] = $this->optID;
        $binds[':value'] = $value;

        if (!$this->db->exec($query, $binds)) return false;

        return true;

    }

    /**
     * @param $minPrice
     * @param $basePrice
     * @param $startUp
     * @return bool
     */
    public function createAll($minPrice, $basePrice, $startUp)
    {
        if ($id = $this->customExist()) {
            return false;
        }

        $query = 'INSERT INTO `' . $this->getTableName() . '`
                (`controllerID`, `attrID`, `optID`, `minPrice`,`basePrice`,`startUp`)
                VALUES ( :controllerID, :attrID, :optID, :minPrice, :basePrice, :startUp )';

        $binds[':controllerID'] = $this->controllerID;
        $binds[':attrID'] = $this->attrID;
        $binds[':optID'] = $this->optID;
        $binds[':minPrice'] = $minPrice;
        $binds[':basePrice'] = $basePrice;
        $binds[':startUp'] = $startUp;

        if (!$this->db->exec($query, $binds)) return false;

        return true;
    }

    /**
     * @param $printTypeID
     * @param array $options
     * @return bool
     */
    public function getControllerPrintRotated($printTypeID, $options = array())
    {
        if (sizeof($options)==0) return false;
        $query = 'SELECT SUM(`printRotated`) FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID '
            . ' AND `optID` IN (';
        $query .= implode(',', $options);
        $query .= ')';

        $binds[':controllerID'] = $printTypeID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getOne();
    }

}
