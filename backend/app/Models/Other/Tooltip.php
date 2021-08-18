<?php

namespace DreamSoft\Models\Other;

use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Class Tooltip
 */
class Tooltip extends PrintShop
{

    /**
     * Tooltip constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('products_tooltips', true);
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID
                ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;

        if (!$this->db->exec($query, $binds)) return false;

        $res = $this->db->getAll(PDO::FETCH_ASSOC);

        if (empty($res)) {
            return false;
        }

        $result = array();
        foreach ($res as $key => $val) {
            $result[$val['attrID']][] = $val;
        }

        return $result;
    }

    /**
     * @param $attrID
     */
    public function getOne($attrID)
    {

    }

    /**
     * @param $attrID
     * @param $tooltip
     * @param string $langCode
     * @return bool|string
     */
    public function customCreate($attrID, $tooltip, $langCode = 'pl')
    {
        if ($this->groupID === false) {
            return false;
        }
        if ($this->typeID === false) {
            return false;
        }
        if ($this->exist($attrID, $langCode)) {
            return false;
        }

        $query = 'INSERT INTO `' . $this->getTableName() . '` 
            ( `groupID`, `typeID`, `attrID`, `tooltip`, `langCode` ) VALUES
            ( :groupID, :typeID, :attrID, :tooltip, :langCode )';

        $binds['groupID'] = $this->groupID;
        $binds['typeID'] = $this->typeID;
        $binds['attrID'] = $attrID;
        $binds['tooltip'] = $tooltip;
        $binds['langCode'] = $langCode;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();
    }

    /**
     * @param $attrID
     * @param string $langCode
     * @return bool
     */
    public function exist($attrID, $langCode = 'pl')
    {

        if ($this->groupID === false) {
            return false;
        }
        if ($this->typeID === false) {
            return false;
        }

        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '`  WHERE '
            . ' `groupID` = :groupID AND `typeID` = :typeID AND '
            . ' `attrID` = :attrID AND `langCode` = :langCode ';

        $binds['groupID'] = $this->groupID;
        $binds['typeID'] = $this->typeID;
        $binds['attrID'] = $attrID;
        $binds['langCode'] = $langCode;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getOne();
        if ($res > 0) {
            return $res;
        }
        return false;
    }

    /**
     * @param $attrID
     * @param $langCode
     * @return bool
     */
    public function deleteByLang($attrID, $langCode)
    {
        if ($this->groupID === false) {
            return false;
        }
        if ($this->typeID === false) {
            return false;
        }

        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE '
            . ' `groupID` = :groupID AND `typeID` = :typeID AND '
            . ' `attrID` = :attrID AND `langCode` = :langCode ';

        $binds['groupID'] = $this->groupID;
        $binds['typeID'] = $this->typeID;
        $binds['attrID'] = $attrID;
        $binds['langCode'] = $langCode;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }
}
