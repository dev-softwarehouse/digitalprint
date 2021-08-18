<?php

namespace DreamSoft\Models\Domain;

use DreamSoft\Core\Model;

class Domain extends Model
{

    /**
     * Domain constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('domains', true);
    }

    /**
     * @return array|bool
     */
    public function getDomains()
    {

        $query = ('SELECT * FROM `' . $this->getTableName() . '` WHERE active = 1 ');

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $all = $this->db->getAll();
        if (empty($all) || !is_array($all)) {
            return false;
        }
        foreach ($all as $row) {
            $result[] = $row['host'];
        }
        return $result;
    }

    /**
     * Update domain
     * @param int $ID
     * @param string $key
     * @param string $value
     * @return boolean
     */
    public function update($ID, $key, $value)
    {
        $query = 'UPDATE `' . $this->getTableName() . '` SET 
                  `' . $key . '` = :' . $key . '
                  WHERE ID = :ID
                ';
        $binds[':ID'] = array($ID, 'int');
        $binds[':' . $key] = $value;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @return array
     */
    public function getList()
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `active` = 1 ';
        $binds = array();
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $name
     * @return bool
     */
    public function getByName($name)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `active` = 1 AND `name` = :name ';
        $binds['name'] = $name;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }
}