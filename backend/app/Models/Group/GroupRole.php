<?php

namespace DreamSoft\Models\Group;

/**
 * Description of GroupRole
 *
 * @author Właściciel
 */
use DreamSoft\Core\Model;
use Exception;

class GroupRole extends Model {
    	
    protected $tableRolePerm;
    protected $tableGroup;
    protected $tableUserGroup;
    protected $tableRole;
    protected $tablePerm;

    public function __construct() {
        parent::__construct(false);
        $prefix = true;
        $this->setTableName('groupRoles', $prefix);
        if( $prefix ) {
            $this->tableRolePerm = $this->prefix.'rolePerms';
            $this->tableGroup = $this->prefix.'groups';
            $this->tableUserGroup = $this->prefix.'userGroups';
            $this->tableRole = $this->prefix.'roles';
            $this->tablePerm = $this->prefix.'permissions';
        }
    }

    /**
     * @param $groupID
     * @return array|bool
     */
    public function getSelectedRoles($groupID){
        $query = 'SELECT `roleID` FROM `'.$this->getTableName().'` 
            WHERE `groupID` = :groupID ';
        
        $binds[':groupID'] = $groupID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        
        $res = $this->db->getAll();
        if(!$res) return array();
        
        foreach($res as $row){
            $result[] = $row['roleID'];
        }
        return $result;
    }

    /**
     * @param $roleID
     * @param $groupID
     * @return bool
     */
    public function exist($roleID, $groupID){
        $query = 'SELECT COUNT(*) FROM `'.$this->getTableName().'` 
            WHERE `roleID` = :roleID AND `groupID` = :groupID ';
        
        $binds[':roleID'] = $roleID;
        $binds[':groupID'] = $groupID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $count = $this->db->getOne();
        if($count > 0){
            return true;
        }
        return false;
    }

    /**
     * @param $roleID
     * @param $groupID
     * @return bool
     */
    public function customDelete($roleID, $groupID){
        $query = 'DELETE FROM `'.$this->getTableName().'` 
            WHERE `roleID` = :roleID AND `groupID` = :groupID ';
        
        $binds[':roleID'] = $roleID;
        $binds[':groupID'] = $groupID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $groupID
     * @return bool
     */
    public function deleteByGroup($groupID){
        $query = 'DELETE FROM `'.$this->getTableName().'` 
            WHERE `groupID` = :groupID ';
        
        $binds[':groupID'] = $groupID;
        
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
    public function deleteByRole($roleID){
        $query = 'DELETE FROM `'.$this->getTableName().'` 
            WHERE `roleID` = :roleID ';
        
        $binds[':roleID'] = $roleID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $userID
     * @return array|bool
     */
    public function getRolesByGroups($userID)
    {

        $query = ' SELECT gr.roleID FROM `' . $this->getTableName() . '` as gr
            LEFT JOIN `' . $this->tableUserGroup . '` as ug ON gr.`groupID` = ug.groupID
            WHERE ug.`userID` = :userID  ';

        $binds[':userID'] = $userID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return array();

        $result = array();
        foreach ( $res as $row ) {
            $result[] = $row['roleID'];
        }

        return $result;
    }
}

?>
