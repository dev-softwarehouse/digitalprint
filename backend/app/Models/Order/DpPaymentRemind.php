<?php

namespace DreamSoft\Models\Order;
/**
 * Class DpPaymentRemind
 */
use DreamSoft\Core\Model;

class DpPaymentRemind extends Model
{

    /**
     * DpPaymentRemind constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('paymentReminder', true);
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
