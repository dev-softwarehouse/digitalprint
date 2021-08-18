<?php

namespace DreamSoft\Models\User;

use DreamSoft\Core\Model;
use Exception;

/**
 * Description of UserGroup
 *
 * @author Właściciel
 */
class UserGroup extends Model
{

    /**
     * UserGroup constructor.
     */
    public function __construct()
    {
        parent::__construct(false);
        $prefix = true;
        $this->setTableName('userGroups', $prefix);
    }


    /**
     * @param $userID
     * @return array|bool
     */
    public function getUserGroups($userID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
            WHERE `userID` = :userID ';

        $binds[':userID'] = $userID;

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
     * @param $userID
     * @return bool
     */
    public function exist($groupID, $userID)
    {
        $query = 'SELECT COUNT(*) FROM `' . $this->getTableName() . '` 
            WHERE `groupID` = :groupID AND `userID` = :userID ';

        $binds[':groupID'] = $groupID;
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
     * @param $groupID
     * @param $userID
     * @return bool|string
     */
    public function customCreate($groupID, $userID)
    {

        $query = 'INSERT INTO `' . $this->getTableName() . '` 
            (
            `userID`,
            `groupID` 
            ) VALUES (
            :userID,
            :groupID
            )';

        $binds[':userID'] = $userID;
        $binds[':groupID'] = $groupID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->lastInsertID();
    }


    /**
     * @param $groupID
     * @param $userID
     * @return bool
     * @throws Exception
     */
    public function delete($groupID, $userID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `groupID` = :groupID AND `userID` = :userID ';

        $binds[':groupID'] = $groupID;
        $binds[':userID'] = $userID;

        if (!$this->db->exec($query, $binds)) {
            throw new Exception('nie usunięto');
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
            throw new Exception('nie usunięto');
        }
        return true;
    }


    /**
     * @param $groupID
     * @return bool
     */
    public function deleteByGroup($groupID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `groupID` = :groupID ';

        $binds[':groupID'] = $groupID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }
}
