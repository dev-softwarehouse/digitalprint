<?php

namespace DreamSoft\Models\User;

use DreamSoft\Core\Model;
use Exception;

/**
 * Description of UserRoles
 *
 * @author Właściciel
 */
class UserRole extends Model
{

    /**
     * @var string
     */
    protected $tablePerm;
    /**
     * @var string
     */
    protected $tableRolePerm;

    public function __construct()
    {
        parent::__construct(false);
        $prefix = true;
        $this->setTableName('userRoles', $prefix);
        if ($prefix) {
            $this->tablePerm = $this->prefix . 'permissions';
            $this->tableRolePerm = $this->prefix . 'rolePerms';
        }
    }

    /**
     * @param $userID
     * @return array|bool
     */
    public function getSelectedRoles($userID)
    {
        $query = 'SELECT `roleID` FROM `' . $this->getTableName() . '` 
            WHERE `userID` = :userID ';

        $binds[':userID'] = $userID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return array();

        foreach ($res as $row) {
            $result[] = $row['roleID'];
        }
        return $result;
    }

    /**
     * @param $userID
     * @return array|bool
     */
    public function getUserPerms($userID)
    {

        $query = 'SELECT rp.permID FROM `' . $this->getTableName() . '` as ur 
            LEFT JOIN `' . $this->tableRolePerm . '` as rp ON ur.roleID = rp.roleID  
            WHERE ur.`userID` = :userID GROUP BY rp.permID ';

        $binds[':userID'] = $userID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return array();
        return $res;
    }

    /**
     * @param $roleID
     * @param $userID
     * @return bool
     */
    public function exist($roleID, $userID)
    {
        $query = 'SELECT COUNT(*) FROM `' . $this->getTableName() . '` 
            WHERE `roleID` = :roleID AND `userID` = :userID ';

        $binds[':roleID'] = $roleID;
        $binds[':userID'] = $userID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $count = $this->db->getOne();
        if ($count > 0) {
            return true;
        }
        return false;
    }

    /**
     * @param $roleID
     * @param $userID
     * @return bool
     * @throws Exception
     */
    public function customDelete($roleID, $userID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `roleID` = :roleID AND `userID` = :userID ';

        $binds[':roleID'] = $roleID;
        $binds[':userID'] = $userID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $userID
     * @return bool
     * @throws Exception
     */
    public function deleteByUser($userID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `userID` = :userID ';

        $binds[':userID'] = $userID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $roleID
     * @return bool
     * @throws Exception
     */
    public function deleteByRole($roleID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `roleID` = :roleID ';

        $binds[':roleID'] = $roleID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }
}
