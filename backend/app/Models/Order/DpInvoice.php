<?php
/**
 * Programista Rafał Leśniak - 14.7.2017
 */

namespace DreamSoft\Models\Order;

use DreamSoft\Core\Model;

class DpInvoice extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('invoices', true);
    }

    /**
     * @param $year
     * @param $month
     * @param int $type
     * @return bool|mixed
     */
    public function getMaxID($year, $month, $type = 1)
    {

        $query = 'SELECT `invoiceID`
            FROM ' . $this->getTableName() . '
            WHERE ';
        if ($year) {
            $binds['year'] = array($year, 'int');
            $query .= ' YEAR( documentDate ) = :year ';
            $isYear = true;
        } else {
            $isYear = false;
        }
        if (strlen($month) > 0) {
            if ($isYear) {
                $query .= ' AND ';
            }
            $query .= ' MONTH( documentDate ) = :month ';
            $binds['month'] = array($month, 'int');
        }
        $query .= ' AND `type` = :type
            ORDER BY invoiceID DESC
            LIMIT 1';


        $binds['type'] = array($type, 'int');

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();

    }

    /**
     * @param $orderID
     * @param int $type
     * @return bool
     */
    public function getOne($orderID, $type = 1)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '`
            WHERE `orderID` = :orderID AND `type` = :type ';

        $binds['orderID'] = $orderID;
        $binds['type'] = $type;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $list
     * @return array|bool
     */
    public function getByOrderList($list)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT *, MAX(type) as invoiceType FROM `' . $this->getTableName() . '` '
            . ' WHERE `orderID` IN ( ' . implode(',', $list) . ' ) GROUP BY `orderID` ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        foreach ($res as $row) {
            $result[$row['orderID']] = $row;
        }
        return $result;
    }
}