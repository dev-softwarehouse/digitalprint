<?php

namespace DreamSoft\Models\Address;
/**
 * Class Address
 */
use DreamSoft\Core\Model;

class Address extends Model
{

    /**
     * @var string
     */
    protected $addressUsers;

    /**
     * Typy adresów:
     * 1 - adres wysyłki
     * 2 - adres faktury
     * 3 - adres nadania
     */

    /**
     * Address constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('address', false);
        $this->addressUsers = 'address_users';
    }

    /**
     * @param $params
     * @return bool|string
     */
    public function createJoin($params)
    {
        $this->setTableName($this->addressUsers, false);
        $result = $this->create($params);
        $this->setTableName('address', false);
        return $result;
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

        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `ID` IN ( ' . implode(',', $list) . ' ) ';

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

    /**
     * @param $userID
     * @param int $type
     * @return bool
     */
    public function getByUser($userID, $type = 1)
    {

        $query = 'SELECT ad.*, au.default, au.ID as joinID, au.userID  FROM `' . $this->getTableName() . '` as ad '
            . ' LEFT JOIN `' . $this->addressUsers . '` as au ON ad.ID = au.addressID '
            . ' WHERE `au`.userID = :userID AND au.type = :type ';

        $binds['userID'] = $userID;
        $binds['type'] = $type;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        return $res;
    }

    /**
     * @param $addressID
     * @param $userID
     * @return bool
     */
    public function getJoin($addressID, $userID)
    {

        $query = 'SELECT au.*  FROM `' . $this->addressUsers . '` as au  '
            . ' WHERE `au`.userID = :userID AND au.addressID = :addressID ';

        $binds['userID'] = $userID;
        $binds['addressID'] = $addressID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getRow();

        return $res;
    }

    public function defaultExist($userID, $type, $default = 1)
    {

        $query = 'SELECT COUNT(au.ID) as count  FROM `' . $this->addressUsers . '` as au '
            . ' WHERE `au`.userID = :userID AND au.type = :type AND au.`default` = :default ';

        $binds['userID'] = $userID;
        $binds['type'] = $type;
        $binds['default'] = $default;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getOne();

        return $res;
    }

    public function removeDefault($userID, $type)
    {
        $query = 'UPDATE  `' . $this->addressUsers . '` SET `default` = 0 WHERE userID = :userID '
            . ' AND `type` = :type ';
        $binds['userID'] = $userID;
        $binds['type'] = $type;

        if (!$this->db->exec($query, $binds)) {
            return false;
        } else {
            return true;
        }
    }

    public function setDefault($addressID, $userID, $default = 1)
    {
        $query = 'UPDATE  `' . $this->addressUsers . '` SET `default` = :default WHERE `addressID` = :addressID AND `userID` = :userID ';
        $binds['addressID'] = $addressID;
        $binds['default'] = $default;
        $binds['userID'] = $userID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        } else {
            return true;
        }
    }

    public function removeJoin($addressID)
    {
        $this->setTableName($this->addressUsers, false);
        $result = $this->delete('addressID', $addressID);
        $this->setTableName('address', false);
        return $result;
    }

    /**
     * @param $ID
     * @return bool|string
     */
    public function copy($ID)
    {
        $query = 'INSERT INTO `' . $this->getTableName() . '` (`name`, `lastname`, `street`, 
        `house`, `apartment`, `zipcode`, `city`, `areaCode`, `telephone`, `companyName`, `nip`, 
        `addressName`, `countryCode`)
  SELECT `name`, `lastname`, `street`, `house`, `apartment`, `zipcode`, `city`, `areaCode`, `telephone`, 
  `companyName`, `nip`, `addressName`, `countryCode` FROM `' . $this->getTableName() . '` WHERE ID = :ID;';

        $binds['ID'] = $ID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $lastID = $this->db->lastInsertID();

        if ($lastID > 0) {
            $this->update($lastID, 'copyFromID', $ID);
        }
        return $lastID;
    }

    /**
     * @param $userID
     * @param int $type
     * @return bool|array
     */

    public function getDefault($userID, $type = 1)
    {
        $query = 'SELECT ad.*, au.ID as joinID, au.userID  FROM `' . $this->getTableName() . '` as ad '
            . ' LEFT JOIN `' . $this->addressUsers . '` as au ON ad.ID = au.addressID '
            . ' WHERE `au`.userID = :userID AND au.type = :type AND au.`default` = 1';

        $binds['userID'] = $userID;
        $binds['type'] = $type;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $userID
     * @param int $type
     * @return bool
     */
    public function customGetAll($userID, $type = 1)
    {
        $query = 'SELECT ad.*, au.ID as joinID, au.userID, au.`default`  FROM `' . $this->getTableName() . '` as ad '
            . ' LEFT JOIN `' . $this->addressUsers . '` as au ON ad.ID = au.addressID '
            . ' WHERE `au`.userID = :userID AND au.type = :type ';

        $binds['userID'] = $userID;
        $binds['type'] = $type;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $addressID
     * @return bool
     */
    public function getOne($addressID)
    {
        $query = 'SELECT ad.*, au.ID as joinID, au.userID, au.`default`  FROM `' . $this->getTableName() . '` as ad '
            . ' LEFT JOIN `' . $this->addressUsers . '` as au ON ad.ID = au.addressID '
            . ' WHERE `ad`.ID = :ID GROUP BY `ad`.ID  ';

        $binds['ID'] = $addressID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $list
     * @param int $type
     * @return array|bool
     */
    public function getDefaultByList($list, $type = 1)
    {
        if (empty($list) || !is_array($list)) {
            return false;
        }
        $query = 'SELECT ad.*, au.ID as joinID, au.userID  FROM `' . $this->getTableName() . '` as ad '
            . ' LEFT JOIN `' . $this->addressUsers . '` as au ON ad.ID = au.addressID '
            . ' WHERE `au`.userID IN (' . implode(',', $list) . ') AND au.type = :type AND au.`default` = 1';

        $binds['type'] = $type;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }
        $result = array();
        foreach ($res as $row) {
            $result[$row['userID']] = $row;
        }
        return $result;
    }

}
