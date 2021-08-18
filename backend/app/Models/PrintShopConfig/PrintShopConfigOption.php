<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\Behaviours\LangFilter;
use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Description of PrintShopConfigOption
 *
 * @author Właściciel
 */
class PrintShopConfigOption extends PrintShop
{

    private $tableProductsOption;
    private $tableOptionRealizationTime;
    private $tableOptionLangs;
    /**
     * @var LangFilter
     */
    protected $LangFilter;

    /**
     * PrintShopConfigOption constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_options', $prefix);
        if ($prefix) {
            $this->tableProductsOption = $this->prefix . 'products_options';
            $this->tableOptionRealizationTime = $this->prefix . 'config_optionRealizationTime';
            $this->tableOptionLangs = $this->prefix . 'config_optionLangs';
        }
        $this->LangFilter = new LangFilter();
    }

    /**
     * @param $name
     * @param $adminName
     * @param null $oneSide
     * @return bool|string
     */
    public function customCreate($name, $adminName, $oneSide = null)
    {
        if (empty($this->attrID)) return false;

        $query = 'SELECT max(`sort`)+1 FROM `' . $this->getTableName() . '` WHERE `attrID` = :attrID ';

        $binds[':attrID'] = $this->attrID;

        if (!$this->db->exec($query, $binds)) return false;

        $sort = $this->db->getOne();
        if ($sort == null) $sort = 1;

        $binds = array();

        $query = 'INSERT INTO `' . $this->getTableName() . '` 
            ( `attrID`, `name`, `adminName`, `sort`, `oneSide` ) VALUES
            ( :attrID, :name, :adminName, :sort, :oneSide
            )
                ';
        $binds[':attrID'] = $this->attrID;
        $binds[':name'] = $name;
        $binds[':adminName'] = $adminName;
        $binds[':sort'] = $sort;
        $binds[':oneSide'] = $oneSide;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->lastInsertID();

    }

    /**
     * @return array|bool
     */
    public function getAll()
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*,
                         `' . $this->tableOptionLangs . '`.`lang` as lLang,
                         `' . $this->tableOptionLangs . '`.`name` as lName
                 FROM `' . $this->getTableName() . '` 
                 LEFT JOIN `' . $this->tableOptionLangs . '` ON `' . $this->tableOptionLangs . '`.`optionID` = `' . $this->getTableName() . '`.`ID`
                 ';
        $binds = array();
        if (!empty($this->attrID)) {
            $query .= ' WHERE `attrID` = :attrID  ';
            $binds[':attrID'] = $this->attrID;
        }
        $query .= ' ORDER BY `' . $this->getTableName() . '`.`sort` ';


        if (!$this->db->exec($query, $binds)) return false;

        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        $result = array();
        foreach ($res as $r) {
            $lLang = $lName = null;
            if (!empty($r['lLang'])) {
                $lLang = $r['lLang'];
                $lName = $r['lName'];
            }
            unset($r['lLang']);
            unset($r['lName']);
            $key = $r['ID'];
            if (!isset($result[$key])) {
                $result[$key] = array();
            }
            $result[$key] = array_merge($result[$key], $r);
            if (!empty($lLang)) {
                if (!isset($result[$key]['names'])) {
                    $result[$key]['names'] = array();
                }
                $result[$key]['names'][$lLang] = $lName;
            }
        }

        $data = array();
        foreach ($result as $r) {
            $data[] = $r;
        }

        return $data;

    }

    public function customGet($id)
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*,
                    `' . $this->tableOptionLangs . '`.`lang` as lLang,
                     `' . $this->tableOptionLangs . '`.`name` as lName
                 FROM `' . $this->getTableName() . '`
                 LEFT JOIN `' . $this->tableOptionLangs . '` ON `' . $this->tableOptionLangs . '`.`optionID` = `' . $this->getTableName() . '`.`ID`
                 WHERE `' . $this->getTableName() . '`.`ID` = :ID ';

        $binds[':ID'] = $id;

        if (!$this->db->exec($query, $binds)) return false;

        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        $result = array();
        foreach ($res as $r) {
            $lLang = $lName = null;
            if (!empty($r['lLang'])) {
                $lLang = $r['lLang'];
                $lName = $r['lName'];
            }
            unset($r['lLang']);
            unset($r['lName']);

            $result = array_merge($result, $r);
            if (!empty($lLang)) {
                if (!isset($result['names'])) {
                    $result['names'] = array();
                }
                $result['names'][$lLang] = $lName;
            }
        }
        return $result;
    }

    public function sort($options)
    {
        $result = true;
        foreach ($options as $index => $optID) {
            if (empty($optID))
                continue;

            $query = 'UPDATE `' . $this->getTableName() . '` SET `sort` = :index WHERE `ID` = :optID ';

            $binds[':optID'] = array($optID, 'int');
            $binds[':index'] = $index;
            if (!$this->db->exec($query, $binds)) {
                $result = false;
            }
        }
        return $result;
    }

    public function setActive($id, $active = 1)
    {
        $query = 'UPDATE `' . $this->getTableName() . '` 
                SET `active` = :active
                WHERE `ID` = :id ';

        $binds[':id'] = $id;
        $binds[':active'] = $active;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    public function getRealizationTime($ID)
    {

        $query = 'SELECT * FROM `' . $this->tableOptionRealizationTime . '` WHERE `ID` = :ID ';

        $binds[':ID'] = $ID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    public function getRealizationTimes($optionID = NULL)
    {
        if ($optionID === null) $optionID = $this->optID;

        $query = 'SELECT * FROM `' . $this->tableOptionRealizationTime . '` WHERE `optionID` = :optionID ';

        $binds[':optionID'] = $optionID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    public function updateRealizationTime($ID, $key, $value)
    {
        $query = 'UPDATE `' . $this->tableOptionRealizationTime . '` 
                SET `' . $key . '` = :' . $key . '
                WHERE `ID` = :ID ';
        $binds[':ID'] = $ID;
        $binds[':' . $key] = $value;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->lastInsertID();
    }

    public function createRealizationTime($optionID, $volume, $days)
    {
        $query = 'INSERT INTO `' . $this->tableOptionRealizationTime . '` 
            ( `optionID`,
              `volume`,
              `days`) VALUES
            ( :optionID,
              :volume,
              :days
              ) ';
        $binds[':optionID'] = $optionID;
        $binds[':volume'] = $volume;
        $binds[':days'] = $days;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->lastInsertID();
    }

    /**
     * @param $list
     * @return array|bool|mixed
     */
    public function customGetByList($list)
    {
        if (empty($list)) {
            return false;
        }

        $list = array_unique($list);

        $query = 'SELECT `options`.*, 
              GROUP_CONCAT( DISTINCT CONCAT_WS("::", optLang.lang, optLang.name) SEPARATOR "||" ) as langs 
              FROM `' . $this->getTableName() . '` as options
              LEFT JOIN `ps_config_optionLangs` as  optLang ON `options`.ID = optLang.optionID '
            . ' WHERE `options`.`ID` IN (' . implode(',', $list) . ') 
             GROUP BY `options`.ID ASC ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        if (!$res) {
            return false;
        }

        $res = $this->LangFilter->splitArray($res, 'langs');

        $result = array();

        foreach ($res as $row) {
            $result[$row['ID']] = $row;
        }

        return $result;
    }

}
