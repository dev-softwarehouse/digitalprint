<?php

namespace DreamSoft\Models\Menu;

/**
 * Description of Menu
 *
 * @author Właściciel
 */

use DreamSoft\Core\Model;
use Exception;

class Menu extends Model
{

    /**
     * Menu constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $prefix = true;
        $this->setTableName('menu', $prefix);
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '`  ';
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
     * @param $key
     * @param null $desc
     * @return string
     */
    public function customCreate($key, $desc = NULL)
    {

        $query = 'INSERT INTO `' . $this->getTableName() . '` (
                `key`,
                `desc`
                ) VALUES (
                :key,
                :desc
                ) 
              ';
        $binds[':key'] = $key;
        $binds[':desc'] = $desc;

        if (!$this->db->exec($query, $binds)) {
            throw new Exception('nie dodano');
        }
        return $this->db->lastInsertID();
    }
}
