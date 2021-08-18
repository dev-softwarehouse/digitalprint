<?php
/**
 * Programmer Rafał Leśniak - 5.2.2018
 */

namespace DreamSoft\Models\Lang;

use DreamSoft\Core\Model;
use Exception;

class LangSetting extends Model
{

    public $domainID;

    /**
     * LangSetting constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('langSettings', true);
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * @return mixed
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param null $code
     * @return bool|mixed
     */
    public function customGet($code = NULL)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `domainID` = :domainID ';

        if ($code) {
            $binds[':code'] = $code;
            $query .= ' AND `code` = :code ';
        }

        $binds[':domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $ID
     * @return bool|mixed
     */
    public function getByID($ID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `ID` = :ID ';

        $binds['ID'] = $ID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `domainID` = :domainID ';

        $binds[':domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $code
     * @param int $active
     * @return bool|string
     */
    public function customCreate($code, $active = 0)
    {
        $query = 'INSERT INTO `' . $this->getTableName() . '` (
                `code`,
                `domainID`,
                `active`
                ) VALUES (
                :code,
                :domainID,
                :active
                ) 
              ';
        $binds[':code'] = $code;
        $binds[':domainID'] = $this->getDomainID();
        $binds[':active'] = $active;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->lastInsertID();
    }

    /**
     * @param $key
     * @param $value
     * @return bool
     */
    public function exist($key, $value)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `' . $key . '` = :' . $key . ' AND 
           `domainID` = :domainID ';

        $binds[':' . $key] = $value;
        $binds[':domainID'] = $this->getDomainID();

        $this->db->exec($query, $binds);

        return ($this->db->rowCount() > 0);
    }
}

