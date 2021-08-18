<?php

namespace DreamSoft\Models\Tax;

use DreamSoft\Core\Model;

/**
 * Class Tax
 */
class Tax extends Model
{

    private $domainID;
    /**
     * Tax constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('tax', true);
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
     * @param $ID
     * @param null $active
     * @return bool
     */
    public function customGet($ID, $active = NULL)
    {

        if (!$ID) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE  ';

        $binds[':ID'] = $ID;
        $query .= ' `ID` = :ID ';

        if ($active !== NULL) {
            $binds['active'] = $active;
            $query .= ' AND `active` = :active ';
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @return bool
     */
    public function getFirst()
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `domainID` = :domainID ';

        $binds[':domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param null|int $active
     * @return bool|array
     */
    public function getAll($active = NULL)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `domainID` = :domainID ';

        $binds['domainID'] = $this->getDomainID();
        if ($active != NULL) {
            $query .= ' AND `active` = :active ';
            $binds['active'] = $active;
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $list
     * @return bool
     */
    public function customGetByList($list)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `ID` IN (' . implode(',', $list) . ') ';

        if (!$this->db->exec($query)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }

        foreach ($res as $key => $value) {
            $result[$value['ID']] = $value;
        }
        return $result;
    }
}