<?php
/**
 * Programista Rafał Leśniak - 17.7.2017
 */

namespace DreamSoft\Models\Address;
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 17-07-2017
 * Time: 11:49
 */
use DreamSoft\Core\Model;

class AddressUser extends Model
{
    public function __construct() {
        parent::__construct();
        $this->setTableName('address_users', false);
    }

    /**
     * @param $userID
     * @param int $type
     * @return array|bool
     */
    public function getOne($userID, $type = 1)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `userID` = :userID AND 
                  `type` = :type ';

        $binds['userID'] = $userID;
        $binds['type'] = $type;

        $this->db->exec($query, $binds);

        return $this->db->getRow();
    }

    /**
     * @param $userID
     * @param int $type
     * @return mixed
     */
    public function existDefault($userID, $type = 1)
    {
        $query = 'SELECT `addressID` FROM `' . $this->getTableName() . '` WHERE `userID` = :userID AND 
                  `type` = :type AND `default` = 1 ';

        $binds['userID'] = $userID;
        $binds['type'] = $type;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

    /**
     * @param $userID
     * @param int $type
     * @return bool
     */
    public function resetDefault($userID, $type = 1)
    {
        $query = 'UPDATE `' . $this->getTableName() . '` SET `default` = 0 WHERE `userID` = :userID AND 
                  `type` = :type ';

        $binds['userID'] = $userID;
        $binds['type'] = $type;

        if( $this->db->exec($query, $binds) ) {
            return true;
        }

        return false;
    }
}