<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 11:28
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;

class Operator extends Model
{
    /**
     * @var string
     */
    private $users;

    /**
     * Operator constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('operators', $prefix);
        $this->users = 'users';
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {

        $query = 'SELECT `users`.ID as uID, operator.ID as ID, `users`.`user` as `user`, `users`.name as firstname, '
            . ' `operator`.name as name , `users`.lastname as lastname '
            . ' FROM `' . $this->getTableName() . '` as operator '
            . ' LEFT JOIN `' . $this->users . '` as `users` ON `users`.`ID` = operator.uID ';
        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();

    }

    /**
     * @param $key
     * @param $value
     * @param bool $multiple
     * @return bool|mixed
     */
    public function get($key, $value, $multiple = false)
    {

        $query = 'SELECT `users`.ID as uID, operator.ID as ID, `users`.`user` as `user`, `users`.name as firstname, '
            . ' `operator`.name as name , `users`.lastname as lastname '
            . ' FROM `' . $this->getTableName() . '` as operator '
            . ' LEFT JOIN `' . $this->users . '` as `users` ON `users`.`ID` = operator.uID '
            . ' WHERE `operator`.`' . $key . '` = :' . $key;
        $binds[$key] = $value;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        if( $multiple ) {
            return $this->db->getAll();
        }
        return $this->db->getRow();

    }

    /**
     * @param $list
     * @return array|bool
     */
    public function getByList($list)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT `' . $this->getTableName() . '`.*, `users`.name as userFirstName, 
        `users`.lastname as userLastName
                FROM `' . $this->getTableName() . '` '
            . ' LEFT JOIN `users` ON `users`.ID = `' . $this->getTableName() . '`.uID '
            . ' WHERE `' . $this->getTableName() . '`.`ID` IN ( ' . implode(',', $list) . ' ) ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        foreach ($res as $row) {
            $result[$row['ID']] = $row;
        }
        return $result;
    }


}