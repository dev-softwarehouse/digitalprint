<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;
use DreamSoft\Models\Behaviours\PriceOperation;
use PDO;

/**
 * Description of PrintShopConfigPaperPrice
 *
 * @author Rafał
 */
class PrintShopConfigPaperPrice extends PrintShop
{

    private $PriceOperation;
    /**
     * PrintShopConfigPaperPrice constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_paperPrice', $prefix);
        $this->PriceOperation = new PriceOperation();
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `optID` = :optID ';

        $binds['optID'] = $this->getOptID();

        if (!$this->db->exec($query, $binds)) return false;
        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $amount
     * @return bool|mixed
     */
    public function getByAmount($amount)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `optID` = :optID AND `amount` = :amount ';

        $binds['optID'] = $this->getOptID();
        $binds['amount'] = $amount;

        if (!$this->db->exec($query, $binds)) return false;
        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $price
     * @param $expense
     * @param $amount
     * @return bool|string
     */
    public function customCreate($price, $expense, $amount)
    {
        $optID = $this->getOptID();
        return self::create(
            compact('price', 'expense', 'amount', 'optID')
        );
    }

    /**
     * @param $id
     * @param $price
     * @param $expense
     * @param $amount
     * @return bool
     */
    public function customUpdate($id, $price, $expense, $amount)
    {
        $query = 'UPDATE `' . $this->getTableName() . '` 
            SET `price` = :price,
            `expense` = :expense,
            `amount` = :amount
            WHERE ID = :id
            ';

        $binds['id'] = $id;
        $binds['price'] = $price;
        $binds['expense'] = $expense;
        $binds['amount'] = $amount;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;

    }

    /**
     * @param $weight
     * @return bool
     */
    public function getPriceFromWeight($weight)
    {
        $result = $this->getByLessOrEqual($weight);

        if ($result['amount'] < $weight) {

            $nextPrice = $this->getByGreaterThan($weight);

            if ($nextPrice === false) {
                return $result;
            }

            if ($result === false) {
                $result['price'] = $nextPrice['price'];
            } else {
                $result['price'] = $this->PriceOperation->countPaperValue($result, $nextPrice, $weight);
            }
        }

        return $result;
    }

    /**
     * @param $weight
     * @return bool
     */
    public function getExpenseFromWeight($weight)
    {
        $result = $this->getExpanseByLessOrEqual($weight);

        if ($result['amount'] < $weight) {

            $nextPrice = $this->getExpanseGreaterThan($weight);

            if ($nextPrice === false) {
                return $result;
            }

            if ($result === false) {
                $result['expense'] = $nextPrice['expense'];
            } else {
                $result['expense'] = $this->PriceOperation->countPaperExpenseValue($result, $nextPrice, $weight);
            }
        }

        return $result;
    }

    /**
     * @param $weight
     * @return bool
     */
    private function getByLessOrEqual($weight)
    {
        $query = 'SELECT `ID`, `amount`, `price`, `expense` FROM `' . $this->getTableName() . '` 
                WHERE `optID` = :optID
                AND `amount` <= :amount
                ORDER BY `amount` DESC LIMIT 1';

        $binds['optID'] = $this->optID;
        $binds['amount'] = $weight;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $weight
     * @return bool|mixed
     */
    private function getByGreaterThan($weight)
    {
        $query = 'SELECT `ID`, `amount`, `price`, `expense` FROM `' . $this->getTableName() . '` 
                WHERE `optID` = :optID
                AND `amount` > :amount
                ORDER BY `amount` ASC  LIMIT 1';

        $binds['optID'] = $this->optID;
        $binds['amount'] = $weight;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $weight
     * @return bool|mixed
     */
    private function getExpanseByLessOrEqual($weight)
    {
        $query = 'SELECT `ID`, `amount`, `price`, `expense` FROM `' . $this->getTableName() . '` 
                WHERE `optID` = :optID
                AND `amount` <= :amount
                ORDER BY `amount` DESC LIMIT 1';

        $binds['optID'] = $this->optID;
        $binds['amount'] = $weight;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $weight
     * @return bool|mixed
     */
    private function getExpanseGreaterThan($weight)
    {
        $query = 'SELECT `ID`, `amount`, `price`, `expense` FROM `' . $this->getTableName() . '` 
                WHERE `optID` = :optID
                AND `amount` > :amount
                ORDER BY `amount` ASC  LIMIT 1';

        $binds['optID'] = $this->optID;
        $binds['amount'] = $weight;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }
}