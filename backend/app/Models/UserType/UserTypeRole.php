<?php

namespace DreamSoft\Models\UserType;

use DreamSoft\Core\Model;
use Exception;

class UserTypeRole extends Model
{

    protected $tablePerm;
    protected $tableRolePerm;

    /**
     * UserTypeRole constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('userTypeRoles', true);
        $this->tablePerm = $this->prefix . 'permissions';
        $this->tableRolePerm = $this->prefix . 'rolePerms';
    }

    /**
     *
     * @param int $userTypeID
     * @return array
     */
    public function getSelectedRoles($userTypeID)
    {
        $query = 'SELECT `roleID` FROM `' . $this->getTableName() . '` 
            WHERE `userTypeID` = :userTypeID ';

        $binds['userTypeID'] = $userTypeID;

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
     * @param $roleID
     * @param $userTypeID
     * @return bool
     */
    public function exist($roleID, $userTypeID)
    {
        $query = 'SELECT COUNT(*) FROM `' . $this->getTableName() . '` 
            WHERE `groupID` = :groupID AND `userTypeID` = :userTypeID ';

        $binds['roleID'] = $roleID;
        $binds['userTypeID'] = $userTypeID;

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
     * @param $userTypeID
     * @return bool
     * @throws Exception
     */
    public function delete($roleID, $userTypeID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `userTypeID` = :userTypeID AND `roleID` = :roleID ';

        $binds['userTypeID'] = $userTypeID;
        $binds['roleID'] = $roleID;

        if (!$this->db->exec($query, $binds)) {
            throw new Exception('nie usunięto');
        }
        return true;
    }

    /**
     * @param $userTypeID
     * @return bool
     * @throws Exception
     */
    public function deleteByUserType($userTypeID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `userTypeID` = :userTypeID ';

        $binds['userTypeID'] = $userTypeID;

        if (!$this->db->exec($query, $binds)) {
            throw new Exception('nie usunięto');
        }
        return true;
    }

    /**
     * @param $userTypeID
     * @return array|bool
     */
    public function getUserTypeRoles($userTypeID)
    {
        $query = 'SELECT ut.roleID FROM `' . $this->getTableName() . '` as ut 
            WHERE ut.`userTypeID` = :userTypeID GROUP BY ut.roleID ';

        $binds[':userTypeID'] = $userTypeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return array();

        $result = array();
        foreach ($res as $row) {
            $result[] = $row['roleID'];
        }

        return $result;
    }
}