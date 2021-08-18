<?php
/**
 * Programista Rafał Leśniak - 7.6.2017
 */

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Models\PrintShop\PrintShop;

/**
 * Class PrintShopAttributeName
 * @package DreamSoft\Models\PrintShopProduct
 */
class PrintShopAttributeName extends PrintShop
{
    /**
     * PrintShopAttributeName constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_attributeNames', $prefix);
    }

    /**
     * @param $typeID
     * @param $attributeID
     * @param $lang
     * @return int|bool
     */
    public function nameExist($typeID, $attributeID, $lang)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE `typeID` = :typeID 
        AND `lang` = :lang AND `attrID` = :attrID ';

        $binds['typeID'] = $typeID;
        $binds['attrID'] = $attributeID;
        $binds['lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $attrID
     * @param $typeID
     * @return bool
     */
    public function getForAttribute($attrID, $typeID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
        WHERE `typeID` = :typeID AND `attrID` = :attrID ';

        $binds['typeID'] = $typeID;
        $binds['attrID'] = $attrID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $list
     * @param $typeID
     * @return array|bool
     */
    public function customGetByList($list, $typeID)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
        WHERE attrID IN (' . implode(',', $list) . ') AND `typeID` = :typeID ';

        $binds['typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();

        if (!$res) {
            return false;
        }
        $result = array();
        foreach ($res as $row) {
            $result[$row['attrID']][$row['lang']] = $row['name'];
        }
        return $result;
    }

    /**
     * @param $typeID
     * @return array|bool
     */
    public function countByType($typeID)
    {
        $query = 'SELECT `attrID`, COUNT(`ID`) as count FROM `' . $this->getTableName() . '` 
        WHERE `typeID` = :typeID GROUP BY `attrID` ';

        $binds['typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }
        $result = array();
        foreach ($res as $row) {
            $result[$row['attrID']] = $row['count'];
        }

        return $result;
    }

    /**
     * @param $typeID
     * @return array|bool
     */
    public function getByType($typeID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
        WHERE `typeID` = :typeID ';

        $binds['typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }

        return $res;
    }

}