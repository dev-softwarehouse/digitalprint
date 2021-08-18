<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;
use DreamSoft\Models\Behaviours\PriceOperation;
use PDO;

/**
 * Description of PrintShopConnectOption
 *
 * @author Rafał
 */
class PrintShopConfigConnectPrice extends PrintShop
{

    private $PriceOperation;
    /**
     * PrintShopConfigConnectPrice constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_connectPrices', $prefix);
        $this->PriceOperation = new PriceOperation();
    }

    /**
     * @param $connectOptionID
     * @param $amount
     * @return bool|mixed
     */
    public function exist($connectOptionID, $amount)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE `connectOptionID` = :connectOptionID AND '
            . ' `amount` = :amount ';

        $binds['connectOptionID'] = $connectOptionID;
        $binds['amount'] = $amount;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

    /**
     * @param $connectOptionID
     * @param $amount
     * @param $value
     * @param null $expense
     * @return bool|mixed|string
     */
    public function set($connectOptionID, $amount, $value, $expense = NULL)
    {

        $exist = $this->exist($connectOptionID, $amount);

        if ($exist > 0) {
            $updated = $this->update($exist, 'value', $value);
            $updatedExpense = $this->update($exist, 'expense', $expense);
            if ($updated) {
                return $exist;
            }
        } else {
            $params['connectOptionID'] = $connectOptionID;
            $params['amount'] = $amount;
            $params['value'] = $value;
            $params['expense'] = $expense;
            $lastID = $this->create($params);
            if ($lastID > 0) {
                return $lastID;
            }
        }

    }

    /**
     * @param $connectOptionID
     * @return array|bool
     */
    public function getList($connectOptionID)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE connectOptionID = :connectOptionID ORDER BY `amount` ASC ';

        $binds['connectOptionID'] = $connectOptionID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * @param $connectOptionID
     * @param $amount
     * @return bool
     */
    public function deleteBy($connectOptionID, $amount)
    {
        $query = ' DELETE FROM `' . $this->getTableName() . '` WHERE `amount` = :amount AND `connectOptionID` = :connectOptionID ';

        $binds['connectOptionID'] = $connectOptionID;
        $binds['amount'] = $amount;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $connectOptionID
     * @param $weight
     * @return bool|mixed
     */
    public function getPriceFromWeight($connectOptionID, $weight)
    {
        $result = $this->getByLessOrEqual($connectOptionID, $weight);

        if ($result['amount'] < $weight) {

            $nextPrice = $this->getByGreaterThan($connectOptionID, $weight);

            if ($nextPrice === false) {
                return $result;
            }

            if ($result === false) {
                $result['value'] = $nextPrice['value'];
            } else {
                $result['value'] = $this->PriceOperation->countValue($result, $nextPrice, $weight);
            }
        }

        return $result;
    }

    /**
     * @param $connectOptionID
     * @param $weight
     * @return bool|mixed
     */
    public function getExpenseFromWeight($connectOptionID, $weight)
    {
        $result = $this->getExpanseByLessOrEqual($connectOptionID, $weight);

        if ($result['amount'] < $weight) {

            $nextPrice = $this->getExpanseGreaterThan($connectOptionID, $weight);

            if ($nextPrice === false) {
                return $result;
            }

            if ($result === false) {
                $result['expense'] = $nextPrice['expense'];
            } else {
                $result['expense'] = $this->PriceOperation->countExpenseValue($result, $nextPrice, $weight);
            }
        }

        return $result;
    }

    /**
     * @param $connectOptionID
     * @param $weight
     * @return bool
     */
    private function getByLessOrEqual($connectOptionID, $weight)
    {
        $query = 'SELECT `ID`, `amount`, `value` FROM `' . $this->getTableName() . '` 
                WHERE `connectOptionID` = :connectOptionID
                AND `amount` <= :amount
                ORDER BY `amount` DESC LIMIT 1';

        $binds['connectOptionID'] = $connectOptionID;
        $binds['amount'] = $weight;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $connectOptionID
     * @param $weight
     * @return bool
     */
    private function getByGreaterThan($connectOptionID, $weight)
    {
        $query = 'SELECT `ID`, `amount`, `value` FROM `' . $this->getTableName() . '` 
                WHERE `connectOptionID` = :connectOptionID
                AND `amount` > :amount
                ORDER BY `amount` DESC LIMIT 1';

        $binds['connectOptionID'] = $connectOptionID;
        $binds['amount'] = $weight;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $connectOptionID
     * @param $weight
     * @return bool|mixed
     */
    private function getExpanseByLessOrEqual($connectOptionID, $weight)
    {
        $query = 'SELECT `ID`, `amount`, `value`, `expense` FROM `' . $this->getTableName() . '` 
                WHERE `connectOptionID` = :connectOptionID
                AND `amount` <= :amount
                ORDER BY `amount` DESC LIMIT 1';

        $binds['connectOptionID'] = $connectOptionID;
        $binds['amount'] = $weight;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $connectOptionID
     * @param $weight
     * @return bool|mixed
     */
    private function getExpanseGreaterThan($connectOptionID, $weight)
    {
        $query = 'SELECT `ID`, `amount`, `value`, `expense` FROM `' . $this->getTableName() . '` 
                WHERE `connectOptionID` = :connectOptionID
                AND `amount` > :amount
                ORDER BY `amount` DESC LIMIT 1';

        $binds['connectOptionID'] = $connectOptionID;
        $binds['amount'] = $weight;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }
}
