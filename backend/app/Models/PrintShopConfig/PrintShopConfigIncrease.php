<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Description of PrintShopConfigPrice
 *
 * @author Rafał
 */
class PrintShopConfigIncrease extends PrintShop
{

    /**
     * @var string
     */
    protected $tableIncreaseTypes;

    /**
     * PrintShopConfigIncrease constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_increases', $prefix);
        $this->tableIncreaseTypes = $this->prefix . 'config_increaseTypes';
    }

    /**
     * @param $increaseType
     * @return bool|array
     */
    public function getByIncreaseType($increaseType)
    {

        $query = 'SELECT `ID`, `amount`, `value`, `increaseType` FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `optID` = :optID
                AND `increaseType` = :increaseType
                ORDER BY `amount` ';

        $binds['controllerID'] = $this->controllerID;
        $binds['optID'] = $this->optID;
        $binds['increaseType'] = $increaseType;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);

    }

    /**
     * @return bool|array
     */
    public function getIncreaseTypes()
    {
        $query = 'SELECT * FROM `' . $this->tableIncreaseTypes . '`  ';

        if (!$this->db->exec($query)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $ID
     * @return bool|array
     */
    public function getIncreaseType($ID)
    {
        $query = 'SELECT * FROM `' . $this->tableIncreaseTypes . '` WHERE `ID` = :ID  ';

        $binds['ID'] = $ID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $increaseType
     * @param $amount
     * @return bool|mixed
     */
    public function customGet($increaseType, $amount)
    {
        $query = 'SELECT `ID`, `amount`, `value`, `increaseType` FROM `' . $this->getTableName() . '` 
                WHERE (`controllerID` = :controllerID OR `controllerID` = 0 ) AND `optID` = :optID
                AND `increaseType` = :increaseType AND `amount` <= :amount
                ORDER BY `amount` DESC LIMIT 1';

        $binds[':controllerID'] = $this->controllerID;
        $binds[':optID'] = $this->optID;
        $binds[':increaseType'] = $increaseType;
        $binds[':amount'] = $amount;

        if (!$this->db->exec($query, $binds)) return false;

        $result = $this->db->getRow(PDO::FETCH_ASSOC);

        return $result;

    }

    public function oneForOption($attrID, $optID, $controllerID, $increaseType, $amount)
    {
        $query = 'SELECT `ID`, `amount`, `value`, `increaseType` FROM `ps_config_increases` 
                WHERE `attrID` = :attrID AND `optID` = :optID AND `controllerID` = :controllerID AND `increaseType` = :increaseType
                AND `amount` <= :amount
                ORDER BY `amount` DESC LIMIT 1';

        $binds[':attrID'] = $attrID;
        $binds[':optID'] = $optID;
        $binds[':controllerID'] = $controllerID;
        $binds[':increaseType'] = $increaseType;
        $binds[':amount'] = $amount;

        if (!$this->db->exec($query, $binds)) return false;

        $result = $this->db->getRow(PDO::FETCH_ASSOC);

        return $result;

    }

    /**
     * @return array|bool
     */
    public function getAll()
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `optID` = :optID    
                ORDER BY `amount` ';

        $binds[':controllerID'] = $this->controllerID;
        $binds[':optID'] = $this->optID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);

    }

    /**
     * @param $amount
     * @param $increaseType
     * @return bool
     */
    public function exist($amount, $increaseType)
    {

        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `attrID` = :attrID AND `optID` = :optID
                AND `amount` = :amount AND `increaseType` = :increaseType ';

        $binds['controllerID'] = array($this->controllerID, 'int');
        $binds['attrID'] = array($this->attrID, 'int');
        $binds['optID'] = array($this->optID, 'int');
        $binds['amount'] = $amount;
        $binds['increaseType'] = $increaseType;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getOne();

    }

    /**
     * @param $amount
     * @param $value
     * @param $increaseType
     * @return bool|string
     */
    public function customCreate($amount, $value, $increaseType)
    {
        if ($id = $this->exist($amount, $increaseType)) {
            return $this->customUpdate($id, $value);
        }

        $query = 'INSERT INTO `' . $this->getTableName() . '`
                (`controllerID`, `attrID`, `optID`, `amount`, `value`, `increaseType`)
                VALUES ( :controllerID, :attrID, :optID, :amount, :value, :increaseType )';

        $binds[':controllerID'] = $this->controllerID;
        $binds[':attrID'] = $this->attrID;
        $binds[':optID'] = $this->optID;
        $binds[':amount'] = $amount;
        $binds[':value'] = $value;
        $binds[':increaseType'] = $increaseType;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->lastInsertId();

    }

    /**
     * @param $id
     * @param $value
     * @return bool
     */
    public function customUpdate($id, $value)
    {
        $query = 'UPDATE `' . $this->getTableName() . '` 
            SET `value` = :value
            WHERE `ID` = :id
            ';
        $binds[':id'] = $id;
        $binds[':value'] = $value;

        if (!$this->db->exec($query, $binds)) return false;

        return true;
    }

    /**
     * @return bool
     */
    public function deleteBy()
    {
        if (!$this->attrID || !$this->optID) {
            return false;
        }

        $query = 'DELETE FROM `' . $this->getTableName() . '` '
            . ' WHERE i.`attrID` = :attrID AND i.`optID` = :optID ';

        $binds['attrID'] = $this->attrID;
        $binds['optID'] = $this->optID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @return bool|array
     */
    public function getPriceTypes()
    {
        $query = 'SELECT * FROM `' . $this->tableIncreaseTypes . '` ';

        if (!$this->db->exec($query)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $id
     * @return bool|array
     */
    public function getType($id)
    {
        $query = 'SELECT * FROM `' . $this->tableIncreaseTypes . '` WHERE `ID` = :id ';

        $binds[':id'] = $id;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $ID
     * @return bool|array
     */
    public function getOne($ID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                WHERE `ID` = :ID ';

        $binds[':ID'] = $ID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @return bool|array
     */
    public function countByController()
    {
        if (!$this->attrID || !$this->optID) {
            return false;
        }

        $query = 'SELECT i.controllerID, COUNT(i.`ID`) as count FROM `' . $this->getTableName() . '` as i
                WHERE i.`attrID` = :attrID AND i.`optID` = :optID
                GROUP BY i.controllerID ';


        $binds['attrID'] = $this->attrID;
        $binds['optID'] = $this->optID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @return bool|array
     */
    public function getUsingIncreaseTypes()
    {
        if (!$this->attrID || !$this->optID || $this->controllerID === null) {
            return false;
        }

        $query = 'SELECT CI.`increaseType`, CIT.`function` FROM `' . $this->getTableName() . '` AS CI
                LEFT JOIN `' . $this->tableIncreaseTypes . '` AS CIT ON CI.increaseType = CIT.ID
                WHERE (CI.`controllerID` = :controllerID OR CI.`controllerID` = 0) AND CI.`attrID` = :attrID AND CI.`optID` = :optID
                GROUP BY CI.`increaseType`
                ORDER BY CI.`amount` ';

        $binds[':controllerID'] = $this->controllerID;
        $binds[':attrID'] = $this->attrID;
        $binds[':optID'] = $this->optID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    public function getRelatedIncreasesCount()
    {
        $optID = $this->optID == 'null' ? null : $this->optID;
        $controllerID = $this->controllerID == 'null' ? null : $this->controllerID;
        $binds[':attrID'] = $this->attrID;
        if ($optID) {
            $binds[':optID'] = $this->optID;
        }
        if ($controllerID) {
            $binds[':controllerID'] = $controllerID;
        }

        $query = 'SELECT COUNT(1) FROM ps_config_related_increases
        WHERE
        ' . ($controllerID ? 'controllerID=:controllerID' : 'controllerID IS NULL') . ' AND `attrID` = :attrID AND ' . ($optID ? 'optID=:optID' : 'optID IS NULL');

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getOne();
    }

    public function getRelatedIncreasesIds()
    {
        $controllerID = $this->controllerID == 'null' ? null : $this->controllerID;
        $optID = $this->optID == 'null' ? null : $this->optID;

        $binds[':attrID'] = $this->attrID;
        if ($optID) {
            $binds[':optID'] = $optID;
        }
        if ($controllerID) {
            $binds[':controllerID'] = $controllerID;
        }

        $query = 'SELECT attrIDRelated, optIDRelated, controllerIDRelated FROM ps_config_related_increases
        WHERE
        ' . ($controllerID ? 'controllerID=:controllerID' : 'controllerID IS NULL') . ' AND `attrID` = :attrID AND ' . ($optID ? 'optID=:optID' : 'optID IS NULL') ;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $controllerID From ps_config_printtypes . Calculated technology
     * @param $groupID
     * @param $typeID
     * @param $attr Current - processed attribute details
     * @param $printTypeID
     * @param $workspace
     * @param $priceListID
     * @return array|bool
     */
    public function getRelatedIncreases($controllerID, $groupID, $typeID, $attr, $printTypeID, $workspace, $priceListID)
    {
        $relatedID = function ($typeID) use ($workspace, $printTypeID, $priceListID) {
            if ($typeID == 1) {
                return $priceListID;
            } else if ($typeID == 2) {
                return $printTypeID;
            } else if ($typeID == 3) {
                return $workspace['ID'];
            }
        };
        $increases=[];
        if (!$this->db->exec('SELECT ri .*, a . type as attrType FROM ps_config_related_increases ri 
                join ps_config_attributes a on a . ID = ri . attrIDRelated
                WHERE ri . `attrID` =:attrID', [':attrID'=>$this->attrID])) return false;
        $allRelated=$this->db->getAll(PDO::FETCH_ASSOC);
        foreach($allRelated as $related){
            $binds3=null;
            $binds3[':attrID']=$related['attrIDRelated'];
            $binds3[':groupID']=$groupID;
            $binds3[':typeID']=$typeID;
            if (!$related['optIDRelated'] && !$related['controllerIDRelated']) {
                $queryIncreasesByAttr = 'SELECT DISTINCT i .*, it .function, 1 AS isAdditional, "attribute" AS level
                        FROM ps_config_increases i
                            JOIN ps_config_increaseTypes it ON it . `ID` = i . `increaseType`
                            JOIN ps_products_options po ON po . optID = i . optID
                        WHERE
                            i . `attrID` =:attrID AND i . `controllerID` =:controllerID AND po . `groupID` = :groupID AND po . `typeID` = :typeID';
                $binds3[':controllerID']=$relatedID($related['relatedTypeID']);
                if (!$this->db->exec($queryIncreasesByAttr, $binds3)) return false;
            }else if(!$related['controllerIDRelated']){
                $queryIncreasesInclOpt = 'SELECT DISTINCT i .*, it .function, 1 AS isAdditional, "option" AS level
            FROM ps_config_increases i
                JOIN ps_config_increaseTypes it ON it . `ID` = i . `increaseType`
                JOIN ps_products_options po ON po . optID = i . optID
            WHERE
                i . `attrID` =:attrID AND i . `optID` =:optID AND i . controllerID =:controllerID AND po . `groupID` = :groupID AND po . `typeID` = :typeID';
                $binds3[':optID']=$related['optIDRelated'] ;
                $binds3[':controllerID']=$relatedID($related['relatedTypeID']);
                if (!$this->db->exec($queryIncreasesInclOpt, $binds3)) return false;
            }else{
                $queryIncreasesInclController = 'SELECT DISTINCT i .*, it .function, 1 AS isAdditional, "controller" AS level
            FROM ps_config_increases i
                JOIN ps_config_increaseTypes it ON it . `ID` = i . `increaseType`
                JOIN ps_products_options po ON po . optID = i . optID
            WHERE
                i . `attrID` =:attrID AND i . `optID` =:optID AND i . `controllerID` =:controllerID AND po . `groupID` = :groupID AND po . `typeID` = :typeID';
                $binds3[':optID']=$related['optIDRelated'] ;
                $binds3[':controllerID']=$relatedID($related['relatedTypeID']);
                if (!$this->db->exec($queryIncreasesInclController, $binds3)) return false;
            }
            $increases=array_merge_recursive($increases,$this->db->getAll());
        }
        return array_unique($increases);
    }

    /**
     * @param $related array
     * @return bool
     */
    public function saveRelatedIncreases($related)
    {
        $controllerID = $this->controllerID == 'null' ? null : $this->controllerID;
        $optID = $this->optID == 'null' ? null : $this->optID;

        $query = 'DELETE FROM ps_config_related_increases
        WHERE
        ' . ($controllerID ? 'controllerID =:controllerID AND ' : 'controllerID IS NULL AND ') . ' `attrID` = :attrID AND ' . ($optID ? 'optID=:optID' : 'optID IS NULL') ;
        $binds[':attrID'] = $this->attrID;
        if($optID){
            $binds[':optID'] = $optID;
        }
        if ($controllerID) {
            $binds[':controllerID'] = $controllerID;
        }

        if (!$this->db->exec($query, $binds)) return false;

        $stm = $this->db->getPdo()->prepare('INSERT INTO ps_config_related_increases
    (attrID, optID, controllerID, attrIDRelated, optIDRelated, controllerIDRelated, relatedTypeID)
        VALUES
        (:attrID,:optID,:controllerID,:attrIDRelated,:optIDRelated,:controllerIDRelated, :relatedTypeID)');
        $stm->bindValue('attrID', $this->attrID);
        $stm->bindValue('optID', $optID);
        $stm->bindValue('controllerID', $controllerID);
        foreach ($related as $relatedItem) {
            $stm->bindValue('attrIDRelated', $relatedItem[0]);
            $stm->bindValue('optIDRelated', $relatedItem[1]);
            $stm->bindValue('controllerIDRelated', $relatedItem[2]);
            $stm->bindValue('relatedTypeID', $relatedItem[3]);
            if (!$stm->execute()) return false;
        }
        return true;
    }
}
