<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Description of PrintShopConfigExclusion
 *
 * @author Rafał
 */
class PrintShopConfigExclusion extends PrintShop
{

    /**
     * @var string
     */
    protected $tableAttr;
    /**
     * @var string
     */
    protected $tableOption;

    /**
     * PrintShopConfigExclusion constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_exclusions', $prefix);
        if ($prefix) {
            $this->tableAttr = $this->prefix . 'config_attributes';
            $this->tableOption = $this->prefix . 'config_options';
        }
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {
        if (empty($this->attrID)) return false;
        if (empty($this->optID)) return false;

        $query = 'SELECT `excAttrID`, `excOptID` FROM `ps_config_exclusions` 
                WHERE `attrID` = :attrID AND `optID` = :optID ';

        $binds[':attrID'] = array($this->attrID, 'int');
        $binds[':optID'] = array($this->optID, 'int');

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);

    }

    /**
     * @return bool
     */
    public function customDelete()
    {
        if (empty($this->attrID)) return false;
        if (empty($this->optID)) return false;

        $query = 'DELETE FROM `' . $this->getTableName() . '` 
                WHERE `attrID` = :attrID AND `optID` = :optID ';

        $binds[':attrID'] = array($this->attrID, 'int');
        $binds[':optID'] = array($this->optID, 'int');

        if (!$this->db->exec($query, $binds)) return false;

        return true;

    }

    /**
     * @param $attrID
     * @param $optID
     * @return bool|string
     */
    public function customCreate($attrID, $optID)
    {
        if (empty($this->attrID)) return false;
        if (empty($this->optID)) return false;

        $query = 'INSERT INTO `' . $this->getTableName() . '` 
                (`attrID` , `optID`, `excAttrID`, `excOptID` )
                VALUES ( :attrID, :optID, :excAttrID, :excOptID )';

        $binds[':attrID'] = array($this->attrID, 'int');
        $binds[':optID'] = array($this->optID, 'int');
        $binds[':excAttrID'] = $attrID;
        $binds[':excOptID'] = $optID;

        if (!$this->db->exec($query, $binds)) return false;

        return true;

    }

    /**
     * @param array $options
     * @return bool|array
     */
    public function getForOptions($options = array())
    {
        if (empty($options)) {
            return false;
        }

        $query = ' SELECT * FROM `ps_config_exclusions` '
            . ' WHERE `optID` IN (' . implode(',', $options) . ') ';

        if (!$this->db->exec($query)) {
            return false;
        }

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param array $options
     * @return array|bool
     */
    public function getAllExclusions($options = array())
    {
        if (empty($options)) {
            return false;
        }

        $query = ' SELECT a.ID, 
        (SELECT GROUP_CONCAT(DISTINCT exclusions.excOptID) as exc FROM `ps_config_exclusions` as exclusions  
        LEFT JOIN `ps_config_options` as options ON options.ID = exclusions.optID 
        WHERE exclusions.optID IN (' . implode(',', $options) . ') AND exclusions.`excAttrID` = a.ID GROUP BY exclusions.`excAttrID` ) as excList
        FROM `ps_config_attributes` as a ORDER BY a.`sort` ';

        if (!$this->db->exec($query)) {
            return false;
        }

        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        if (!$res) {
            return false;
        }
        foreach ($res as $key => $row) {
            if ($row['excList'] == NULL) {
                unset($res[$key]);
            }
        }
        $result = array();
        foreach ($res as $row) {
            $result[$row['ID']] = $row;
        }

        return $result;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return array|bool
     * TODO Temporary not used params. UI can be unsynced
     */
    public function getForProduct($groupID, $typeID)
    {
        $query = ' SELECT * FROM `ps_config_exclusions` ';

        if (!$this->db->exec($query)) {
            return false;
        }

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }
}
