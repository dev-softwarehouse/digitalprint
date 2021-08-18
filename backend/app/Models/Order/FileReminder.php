<?php
/**
 * Programmer Rafał Leśniak - 26.1.2018
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 26-01-2018
 * Time: 11:50
 */

namespace DreamSoft\Models\Order;

use DreamSoft\Core\Model;

/**
 * Class FileRemind
 * @package DreamSoft\Models\Order
 */
class FileReminder extends Model
{
    /**
     * FileRemind constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('fileReminders', true);
    }

    /**
     * @param $orderID
     * @return bool
     */
    public function getForOrderID($orderID)
    {
        $query = 'SELECT * FROM ' . $this->getTableName() . ' WHERE `orderID` = :orderID';

        $binds['orderID'] = $orderID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * @param $orderID
     * @param $mailNum
     * @return bool|string
     */
    public function addRemind($orderID, $mailNum)
    {
        if ($mailNum == 1) {
            $query = 'INSERT INTO ' . $this->getTableName() . ' (`orderID`, `remindDate1`) VALUES (:orderID, :date)';

            $binds['orderID'] = $orderID;
            $binds['date'] = date('Y-m-d H:i:s');

            if (!$this->db->exec($query, $binds)) {
                return false;
            }

            return $this->db->lastInsertID();
        } else {
            $query = 'UPDATE  `' . $this->getTableName() . '` SET `remindDate' . $mailNum . '` = :date WHERE `orderID` = :orderID';
            $binds['orderID'] = $orderID;
            $binds['date'] = date('Y-m-d H:i:s');

            if (!$this->db->exec($query, $binds)) {
                return false;
            } else {
                return true;
            }
        }
    }
}