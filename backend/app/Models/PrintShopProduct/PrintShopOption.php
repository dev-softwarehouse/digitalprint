<?php

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Models\PrintShop\PrintShop;

use PDO;

/**
 * Class PrintShopOption
 */
class PrintShopOption extends PrintShop
{

    /**
     * @var string
     */
    protected $confOptions;
    /**
     * @var string
     */
    protected $optionFormats;
    /**
     * @var string
     */
    protected $confAttrs;
    /**
     * @var string
     */
    protected $groups;
    /**
     * @var string
     */
    protected $types;

    /**
     * PrintShopOption constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_options', $prefix);
        if ($prefix) {
            $this->confOptions = $this->prefix . 'config_options';
            $this->optionFormats = $this->prefix . 'products_optionFormats';
            $this->confAttrs = $this->prefix . 'config_attributes';
            $this->groups = $this->prefix . 'products_groups';
            $this->types = $this->prefix . 'products_types';
        }
    }

    /**
     * @param $attrID
     * @param $optID
     * @return bool|string
     */
    public function customCreate($attrID, $optID)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        if ($this->exist($attrID, $optID)) return false;

        $query = 'INSERT INTO `' . $this->getTableName() . '` 
            ( `groupID`, `typeID`, `attrID`, `optID` ) VALUES
            ( :groupID, :typeID, :attrID, :optID )';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':attrID'] = $attrID;
        $binds[':optID'] = $optID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();
    }

    /**
     * @param $attrID
     * @param $optID
     * @return bool
     */
    public function delete($attrID, $optID)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `groupID` = :groupID AND `typeID` = :typeID AND `attrID` = :attrID AND `optID` = :optID ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':attrID'] = $attrID;
        $binds[':optID'] = $optID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @return bool
     */
    public function deleteAll()
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `groupID` = :groupID AND `typeID` = :typeID ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param $attrID
     * @param $optID
     * @return bool|mixed
     */
    public function exist($attrID, $optID)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID AND `attrID` = :attrID AND `optID` = :optID';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':attrID'] = $attrID;
        $binds[':optID'] = $optID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();

    }

    /**
     * @param null $attrID
     * @return array|bool
     */
    public function getAll($attrID = NULL)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $tableName = $this->getTableName();

        $query = 'SELECT `' . $tableName . '`.`ID`, `' . $tableName . '`.`optID`, `' . $tableName . '`.`formatID`,`' . $tableName . '`.`invisible`,
                        `' . $this->confOptions . '`.`name`, `' . $this->confOptions . '`.`active`, `' . $tableName . '`.`default`,
                            `' . $tableName . '`.`attrID`, GROUP_CONCAT(DISTINCT `' . $this->optionFormats . '`.formatID SEPARATOR ";") as formats,
                                `' . $this->confAttrs . '`.name as attrName, `' . $this->confAttrs . '`.sort as attrSort
                FROM `' . $tableName . '` 
                LEFT JOIN (`' . $this->confOptions . '`) 
                ON (`' . $tableName . '`.`optID` = `' . $this->confOptions . '`.`ID`)
                LEFT JOIN (`' . $this->optionFormats . '`) 
                ON (`' . $tableName . '`.`ID` = `' . $this->optionFormats . '`.`productOptionID`)
                LEFT JOIN (`' . $this->confAttrs . '`) 
                ON (`' . $this->confOptions . '`.`attrID` = `' . $this->confAttrs . '`.`ID`)
                WHERE `' . $tableName . '`.`groupID` = :groupID 
                    AND `' . $tableName . '`.`typeID` = :typeID ';
        if ($attrID) {
            $query .= ' AND `' . $tableName . '`.`attrID` = :attrID ';
            $binds[':attrID'] = $attrID;
        }
        $query .= ' GROUP BY `' . $tableName . '`.`optID` ORDER BY `' . $this->confOptions . '`.`sort` ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @return array|bool
     */
    public function getAllOptions()
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` ';

        if (!$this->db->exec($query)) {
            return false;
        }

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $formatID
     * @param $productOptionID
     * @return bool|string
     */
    public function setFormat($formatID, $productOptionID)
    {

        if ($this->existFormat($formatID, $productOptionID) > 0) {
            return false;
        }

        $query = 'INSERT INTO `' . $this->optionFormats . '` 
            ( `formatID`, `productOptionID` ) VALUES
            ( :formatID, :productOptionID )';

        $binds[':formatID'] = $formatID;
        $binds[':productOptionID'] = $productOptionID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();

    }

    /**
     * @param $formatID
     * @param $productOptionID
     * @return bool|mixed
     */
    public function existFormat($formatID, $productOptionID)
    {

        $query = 'SELECT `ID` FROM `' . $this->optionFormats . '` 
                WHERE `formatID` = :formatID AND `productOptionID` = :productOptionID ';

        $binds[':formatID'] = $formatID;
        $binds[':productOptionID'] = $productOptionID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();

    }

    /**
     * @param $productOptionID
     * @return bool
     */
    public function deleteFormats($productOptionID)
    {

        $query = 'DELETE FROM `' . $this->optionFormats . '` 
            WHERE `productOptionID` = :productOptionID ';

        $binds[':productOptionID'] = $productOptionID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param $attrID
     * @param $optID
     * @return array|bool
     */
    public function getAllInProduct($attrID, $optID)
    {

        $query = 'SELECT * 
                FROM `' . $this->getTableName() . '` 
                WHERE `attrID` = :attrID 
                AND `optID` = :optID ';

        $binds[':attrID'] = $attrID;
        $binds[':optID'] = $optID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return bool
     */
    public function deleteByGroupType($groupID, $typeID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
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
     * @return array|bool
     */
    public function countAttrs()
    {
        $query = ' SELECT o.attrID, COUNT(o.`ID`) as count FROM `' . $this->getTableName() . '` as o'
            . ' LEFT JOIN `' . $this->groups . '` as g ON g.ID = o.groupID '
            . ' LEFT JOIN `' . $this->types . '` as t ON t.ID = o.typeID '
            . ' WHERE t.name IS NOT NULL AND g.name IS NOT NULL '
            . ' GROUP BY o.attrID ';
        if (!$this->db->exec($query)) {
            return false;
        }

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @return array|bool
     */
    public function countOpts()
    {
        $query = ' SELECT o.ID, t.name as typeName, g.name as groupName, o.formatID,o.attrID,o.optID FROM `' . $this->getTableName() . '` as o'
            . ' LEFT JOIN `' . $this->groups . '` as g ON g.ID = o.groupID '
            . ' LEFT JOIN `' . $this->types . '` as t ON t.ID = o.typeID '
            . ' WHERE t.name IS NOT NULL AND g.name IS NOT NULL ';
        //. ' GROUP BY o.optID ';
        if (!$this->db->exec($query)) {
            return false;
        }

        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        if (!$res) {
            return array();
        }
        $result = array();
        foreach ($res as $r) {
            $result[$r['attrID']][$r['optID']][] = array('group' => $r['groupName'], 'type' => $r['typeName']);
        }
        return $result;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param null $formatID
     * @return array|bool
     */
    public function getByParams($groupID, $typeID, $formatID = NULL)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `groupID` = :groupID AND `typeID` = :typeID ';

        $binds['groupID'] = $groupID;
        $binds['typeID'] = $typeID;

        if($formatID !== NULL) {
            $query .= ' AND `formatID` = :formatID ';
            $binds['formatID'] = $formatID;
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $attrID
     * @return bool
     */
    public function removeDefaults($attrID)
    {
        if ($this->getGroupID() === false) return false;
        if ($this->getTypeID() === false) return false;

        $query = 'UPDATE `' . $this->getTableName() . '` 
            SET `default` = 0 
            WHERE `groupID` = :groupID AND `typeID` = :typeID AND `attrID` = :attrID ';

        $binds['groupID'] = $this->getGroupID();
        $binds['typeID'] = $this->getTypeID();
        $binds['attrID'] = $attrID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param $typeID
     * @param $options
     * @return array|bool
     */
    public function getSelectedOption($typeID, $options)
    {
        if( !$options ) {
            return false;
        }

        $query = 'SELECT `ID`, `optID` FROM `' . $this->getTableName() . '` 
        WHERE `typeID` = :typeID AND `optID` IN (' . implode(',', $options) . ') ';

        $binds['typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res =  $this->db->getAll(PDO::FETCH_ASSOC);
        if( !$res ) {
            return false;
        }

        $result = array();

        foreach ($res as $row) {
            $result[] = $row;
        }

        return $result;

    }

    /**
     * @param $typeID
     * @param $options
     * @return array|bool
     */
    public function getSelectedOptionSorted($typeID, $options)
    {
        if( !$options ) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
        WHERE `typeID` = :typeID AND `optID` IN (' . implode(',', $options) . ') ';

        $binds['typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res =  $this->db->getAll(PDO::FETCH_ASSOC);
        if( !$res ) {
            return false;
        }

        $result = array();

        foreach ($res as $row) {
            $result[$row['optID']] = array(
                'invisible' => $row['invisible']
            );
        }

        return $result;
    }
}
