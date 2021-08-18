<?php

namespace DreamSoft\Models\Acl;
/**
 * Class Permission
 */

use DreamSoft\Core\Model;

class Permission extends Model
{

    /**
     * Permission constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $prefix = true;
        $this->setTableName('permissions', $prefix);
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` ';
        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        foreach ($res as $row) {
            $result[] = $row;
        }
        return $result;
    }

    /**
     * @param $controller
     * @param $action
     * @param null $package
     * @return mixed
     */
    public function getByMethod($controller, $action, $package = NULL)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
            WHERE `controller` = :controller AND `action` = :action ';
        $binds['controller'] = $controller;
        $binds['action'] = $action;
        if ($package) {
            $query .= ' AND `package` = :package ';
            $binds['package'] = $package;
        }

        $this->db->exec($query, $binds);
        return $this->db->getRow();
    }

    /**
     * @param $controller
     * @param $action
     * @param null $package
     * @return bool
     */
    public function exist($controller, $action, $package = NULL)
    {
        $query = 'SELECT COUNT(*) FROM `' . $this->getTableName() . '` 
            WHERE `controller` = :controller AND `action` = :action ';

        $binds[':controller'] = $controller;
        $binds[':action'] = $action;
        if ($package) {
            $query .= ' AND `package` = :package ';
            $binds['package'] = $package;
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $count = $this->db->getOne();
        if ($count > 0) {
            return true;
        }
        return false;
    }
}