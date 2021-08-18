<?php

namespace DreamSoft\Models\Acl;

/**
 * Description of RolePerm
 *
 * @author Właściciel
 */

use DreamSoft\Core\Model;
use Exception;

class RolePerm extends Model
{

    /**
     * @var string
     */
    protected $tablePerm;

    /**
     * RolePerm constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $prefix = true;
        $this->setTableName('rolePerms', $prefix);
        if ($prefix) {
            $this->tablePerm = $this->prefix . 'permissions';
        }
    }

    /**
     * @param $roleID
     * @return array|bool
     */
    public function getSelectedPerms($roleID)
    {
        $query = 'SELECT `permID` FROM `' . $this->getTableName() . '` 
            WHERE `roleID` = :roleID ';

        $binds[':roleID'] = $roleID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return array();

        foreach ($res as $row) {
            $result[] = $row['permID'];
        }
        return $result;
    }

    /**
     * @param $roles
     * @return array|bool
     */
    public function getPermsFromRoles($roles)
    {
        if (empty($roles)) {
            return array();
        }

        $query = 'SELECT `permID` FROM `' . $this->getTableName() . '` 
            WHERE `roleID` IN (' . implode(',', $roles) . ') ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return array();

        foreach ($res as $row) {
            $result[] = $row['permID'];
        }
        return $result;
    }

    /**
     * @param $roleID
     * @param $permID
     * @return bool
     */
    public function exist($roleID, $permID)
    {
        $query = 'SELECT COUNT(*) FROM `' . $this->getTableName() . '` 
            WHERE `roleID` = :roleID AND `permID` = :permID ';

        $binds[':roleID'] = $roleID;
        $binds[':permID'] = $permID;

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
     * @param $permID
     * @return bool
     * @throws Exception
     */
    public function delete($roleID, $permID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `roleID` = :roleID AND `permID` = :permID ';

        $binds[':roleID'] = $roleID;
        $binds[':permID'] = $permID;

        if (!$this->db->exec($query, $binds)) {
            throw new Exception('nie usunięto');
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
            throw new Exception('nie usunięto');
        }
        return true;
    }

    /**
     * @param $permID
     * @return bool
     * @throws Exception
     */
    public function deleteByPerm($permID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `permID` = :permID ';

        $binds[':permID'] = $permID;

        if (!$this->db->exec($query, $binds)) {
            throw new Exception('nie usunięto');
        }
        return true;
    }


}
