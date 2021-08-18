<?php

namespace DreamSoft\Models\UserType;
/**
 * Class UserTypeGroup
 */
use DreamSoft\Core\Model;
use Exception;

class UserTypeGroup extends Model
{

    /**
     * @var string
     */
    protected $tablePerm;
    /**
     * @var string
     */
    protected $tableRolePerm;
    /**
     * @var string
     */
    protected $tableGroupRoles;
    /**
     * @var string
     */
    protected $tableUserOptions;
    /**
     * @var string
     */
    protected $tableUserTypes;


    /**
     * UserTypeGroup constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('userTypeGroups', true);
        $this->tablePerm = $this->prefix . 'permissions';
        $this->tableRolePerm = $this->prefix . 'rolePerms';
        $this->tableGroupRoles = $this->prefix . 'groupRoles';
        $this->tableUserOptions = $this->prefix . 'userOptions';
        $this->tableUserTypes = $this->prefix . 'userTypes';
    }

    /**
     * @param $userTypeID
     * @return array|bool
     */
    public function getSelectedGroups($userTypeID)
    {
        $query = 'SELECT `groupID` FROM `' . $this->getTableName() . '` 
            WHERE `userTypeID` = :userTypeID ';

        $binds['userTypeID'] = $userTypeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return array();

        foreach ($res as $row) {
            $result[] = $row['groupID'];
        }
        return $result;
    }

    /**
     * @param $groupID
     * @param $userTypeID
     * @return bool
     */
    public function exist($groupID, $userTypeID)
    {
        $query = 'SELECT COUNT(*) FROM `' . $this->getTableName() . '` 
            WHERE `groupID` = :groupID AND `userTypeID` = :userTypeID ';

        $binds['groupID'] = $groupID;
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
     * @param $groupID
     * @param $userTypeID
     * @return bool
     * @throws Exception
     */
    public function delete($groupID, $userTypeID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `userTypeID` = :userTypeID AND `groupID` = :groupID ';

        $binds[':userTypeID'] = $userTypeID;
        $binds[':groupID'] = $groupID;

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
     * @param $groupID
     * @return bool
     * @throws Exception
     */
    public function deleteByGroup($groupID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `groupID` = :groupID ';

        $binds['groupID'] = $groupID;

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

        $query = 'SELECT gr.roleID FROM `' . $this->getTableName() . '` as utg
            LEFT JOIN `' . $this->tableUserOptions . '` as uo ON uo.userTypeID = utg.userTypeID
            LEFT JOIN `' . $this->tableGroupRoles . '` as gr ON gr.groupID = utg.groupID 
            WHERE utg.`userTypeID` = :userTypeID GROUP BY gr.roleID ';

        $binds['userTypeID'] = $userTypeID;

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