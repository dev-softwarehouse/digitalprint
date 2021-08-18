<?php

namespace DreamSoft\Models\Module;

use DreamSoft\Core\Model;
use PDO;

class ModuleValue extends Model
{

    protected $domainID = NULL;


    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'dp_config_';
        $this->setTableName('moduleValues', true);
    }

    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    public function getDomainID()
    {
        return $this->domainID;
    }

    public function set($moduleKeyID, $value, $componentID = null, $confID = null, $domainID = NULL)
    {
        $ID = $this->customExist($moduleKeyID, $componentID, $confID, $domainID);
        if ($ID > 0) {
            $resEdit = 0;
            $resEdit += intval($this->update($ID, 'value', $value));
            if ($resEdit == 1) {
                return true;
            }
            return false;
        } else {
            $params = compact('moduleKeyID', 'componentID', 'confID', 'value', 'domainID');
            return $this->create($params);
        }
    }

    public function customExist($moduleKeyID, $componentID, $confID, $domainID)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `moduleKeyID` = :moduleKeyID ';
        if ($confID == NULL) {
            $query .= ' AND `confID` IS NULL ';
        } else {
            $query .= ' AND `confID` = :confID ';
            $binds['confID'] = $confID;
        }
        if ($domainID == NULL) {
            $query .= ' AND `domainID` IS NULL ';
        } else {
            $query .= ' AND `domainID` = :domainID ';
            $binds['domainID'] = $domainID;
        }
        if ($componentID) {
            $query .= ' AND `componentID` = :componentID ';
            $binds['componentID'] = $componentID;
        }
        $binds['moduleKeyID'] = $moduleKeyID;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

    /**
     * @param $list
     * @param null $componentID
     * @param bool $manyResults
     * @return array|bool
     */
    public function customGetByList($list, $componentID = null, $manyResults = false)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `moduleKeyID` IN ( ' . implode(',', $list) . ' ) ';

        $binds = array();
        if ($this->domainID) {
            $query .= ' AND `domainID` = :domainID ';
            $binds['domainID'] = $this->domainID;
        }
        if ($componentID) {
            $query .= ' AND `componentID` = :componentID ';
            $binds['componentID'] = $componentID;
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }
        $result = array();
        foreach ($res as $r) {
            if ($manyResults) {
                $result[$r['moduleKeyID']][] = $r['value'];
            } else {
                $result[$r['moduleKeyID']] = $r['value'];
            }

        }

        return $result;
    }

    public function deleteByList($moduleKeyList)
    {
        if (empty($moduleKeyList)) {
            return false;
        }
        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE `moduleKeyID` IN ( ' . implode(',', $moduleKeyList) . ' ) ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;

    }

    /**
     * @param $moduleKeyID
     * @param bool $multi
     * @return array|bool
     */
    public function getByKeyID($moduleKeyID, $multi = false)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `moduleKeyID`  = :moduleKeyID AND `domainID` = :domainID ';

        $binds['moduleKeyID'] = $moduleKeyID;
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        if (!$multi) {
            return $this->db->getRow();
        } else {
            return $this->db->getAll(PDO::FETCH_ASSOC);
        }

    }

    public function getByComponent($moduleKeyID, $componentID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `moduleKeyID`  = :moduleKeyID AND `domainID` = :domainID AND 
            ( `componentID` = :componentID OR `componentID` IS NULL ) ';

        $binds['moduleKeyID'] = $moduleKeyID;
        $binds['domainID'] = $this->getDomainID();
        $binds['componentID'] = $componentID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $moduleKeyID
     * @return bool
     */
    public function deleteByKeyID($moduleKeyID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` '
            . ' WHERE `moduleKeyID`  = :moduleKeyID AND `domainID` = :domainID ';

        $binds['moduleKeyID'] = $moduleKeyID;
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }
}