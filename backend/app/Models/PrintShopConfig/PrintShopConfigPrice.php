<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;
use DreamSoft\Models\Behaviours\PriceOperation;
use PDO;

/**
 * Description of PrintShopConfigPrice
 *
 * @author Rafał
 */
class PrintShopConfigPrice extends PrintShop
{

    protected $tablePriceTypes;
    protected $tableDetailPrices;
    private $PriceOperation;

    /**
     * PrintShopConfigPrice constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_prices', $prefix);
        if ($prefix) {
            $this->tablePriceTypes = $this->prefix . 'config_priceTypes';
            $this->tableDetailPrices = $this->prefix . 'config_detailPrices';
        }
        $this->PriceOperation = new PriceOperation();
    }

    /**
     * @param $priceType
     * @return array|bool
     */
    public function getByPriceType($priceType)
    {
        $query = 'SELECT `ID`, `amount`, `value`, `priceType`, `expense` FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `optID` = :optID
                AND `priceType` = :priceType
                ORDER BY `amount` ';

        $binds['controllerID'] = $this->getControllerID();
        $binds['optID'] = $this->getOptID();
        $binds['priceType'] = $priceType;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);

    }

    /**
     * @param $priceType
     * @param $amount
     * @return bool|mixed
     */
    public function customGet($priceType, $amount)
    {

        $result = $this->getFirstPrice($priceType, $amount);

        if ($result['amount'] < $amount) {

            $nextPrice = $this->getNextPrice($priceType, $amount);

            if ($nextPrice === false) {
                if( $result['amount'] > 0 ) {
                    $lastRangePrice = $result['value'] / $result['amount'];
                } else {
                    $lastRangePrice = $result['value'];
                }
                $result['lastRangePrice'] = $lastRangePrice;
                return $result;
            }

            if ($result === false) {
                $result['value'] = $nextPrice['value'];
            } else {
                $result['value'] = $this->PriceOperation->countValue($result, $nextPrice, $amount);
            }
        }

        return $result;

    }

    /**
     * @param $priceType
     * @param $amount
     * @return array|bool
     */
    public function getForAmountPatterns($priceType, $amount)
    {
        $results = $this->getAllLowerPrices($priceType, $amount);

        if( $results ) {

            $firstElement = current($results);

            $sortedPrices = array();
            foreach ($results as $row) {
                $sortedPrices[$row['amount']] = $row;
            }

            $sumPrice = 0.0;

            $previousElement = array();

            $iterations = 0;

            for ($i=$firstElement['amount'];$i <= ($amount-1); $i++) {
                $iterations++;

                if(!array_key_exists($i, $sortedPrices) ) {
                    if( array_key_exists('value', $previousElement) ) {
                        $sumPrice += intval($previousElement['value']);
                    }
                } else {
                    $sumPrice += intval($sortedPrices[$i]['value']);
                    $previousElement = $sortedPrices[$i];
                }

            }

            $priceType = NULL;
            if( array_key_exists('priceType', $previousElement) ) {
                $priceType = $previousElement['priceType'];
            }

            $resultPrice = array(
                'value' => $sumPrice,
                'amount' => $amount,
                'priceType' => $priceType
            );

            return $resultPrice;
        }

        return false;
    }

    /**
     * @param $priceType
     * @param $amount
     * @return bool|mixed
     */
    public function getExpense($priceType, $amount)
    {

        $result = $this->getFirstExpense($priceType, $amount);

        if ($result['amount'] < $amount) {

            $nextPrice = $this->getNextExpanse($priceType, $amount);

            if ($nextPrice === false) {
                return $result;
            }

            if ($result === false) {
                $result['expense'] = $nextPrice['expense'];
            } else {
                $result['expense'] = $this->PriceOperation->countExpenseValue($result, $nextPrice, $amount);
            }
        }

        return $result;

    }

    /**
     * @return bool|array
     */
    public function getAll()
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `optID` = :optID    
                ORDER BY `amount` ';

        $binds['controllerID'] = $this->controllerID;
        $binds['optID'] = $this->optID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);

    }

    /**
     * @param $amount
     * @param $priceType
     * @return bool
     */
    public function exist($amount, $priceType)
    {

        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `attrID` = :attrID AND `optID` = :optID
                AND `amount` = :amount AND `priceType` = :priceType ';

        $binds[':controllerID'] = array($this->getControllerID(), 'int');
        $binds[':attrID'] = array($this->getAttrID(), 'int');
        $binds[':optID'] = array($this->getOptID(), 'int');
        $binds[':amount'] = $amount;
        $binds[':priceType'] = $priceType;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getOne();

    }

    /**
     * @param $amount
     * @param $value
     * @param $priceType
     * @param $expense
     * @return bool|string
     */
    public function customCreate($amount, $value, $priceType, $expense)
    {
        if (empty($expense)) $expense = null;

        if ($id = $this->exist($amount, $priceType)) {
            return $this->update($id, $value, $expense);
        }

        $query = 'INSERT INTO `' . $this->getTableName() . '`
                (`controllerID`, `attrID`, `optID`, `amount`, `value`, `priceType`, `expense`)
                VALUES ( :controllerID, :attrID, :optID, :amount, :value, :priceType, :expense )';

        $binds[':controllerID'] = $this->controllerID;
        $binds[':attrID'] = $this->attrID;
        $binds[':optID'] = $this->optID;
        $binds[':amount'] = $amount;
        $binds[':value'] = $value;
        $binds[':priceType'] = $priceType;
        if ($expense == 0) {
            $expense = NULL;
        }
        $binds[':expense'] = $expense;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->lastInsertID();
    }

    /**
     * @param $priceType
     * @return bool
     */
    public function removeAll($priceType)
    {

        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE `controllerID` = :controllerID AND 
          attrID = :attrID AND  optID = :optID AND `priceType` = :priceType ';

        $binds[':controllerID'] = $this->controllerID;
        $binds[':attrID'] = $this->attrID;
        $binds[':optID'] = $this->optID;
        $binds[':priceType'] = $priceType;

        if (!$this->db->exec($query, $binds)) return false;
        return true;
    }

    /**
     * @param $id
     * @param $value
     * @param $expense
     * @return bool
     */
    public function update($id, $value, $expense)
    {
        $query = 'UPDATE `' . $this->getTableName() . '` 
            SET `value` = :value,
            `expense` = :expense
            WHERE `ID` = :id
            ';
        $binds['id'] = $id;
        $binds['value'] = $value;
        if( $expense === '' ) {
            $expense = NULL;
        }
        $binds['expense'] = $expense;

        if (!$this->db->exec($query, $binds)) return false;

        return true;
    }

    /**
     * @return array|bool
     */
    public function getPriceTypes()
    {
        $query = 'SELECT * FROM `' . $this->tablePriceTypes . '` ';

        if (!$this->db->exec($query)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $id
     * @return bool|mixed
     */
    public function getPriceType($id)
    {
        $query = 'SELECT * FROM `' . $this->tablePriceTypes . '` WHERE `ID` = :id ';

        $binds[':id'] = $id;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @return bool|mixed
     */
    public function getDetailPrices()
    {

        $query = 'SELECT `ID`, `minPrice`, `basePrice`, `startUp`, `excluded`, `printRotated` FROM `' . $this->tableDetailPrices . '` 
                WHERE `controllerID` = :controllerID AND `attrID` = :attrID AND  `optID` = :optID';

        $binds['controllerID'] = $this->getControllerID();
        $binds['attrID'] = $this->getAttrID();
        $binds['optID'] = $this->getOptID();

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);

    }

    /**
     * @return bool|mixed
     */
    public function isDetailPrices()
    {

        $query = 'SELECT `ID` FROM `' . $this->tableDetailPrices . '` 
                WHERE `controllerID` = :controllerID AND `attrID` = :attrID AND `optID` = :optID';

        $binds['controllerID'] = $this->getControllerID();
        $binds['attrID'] = $this->getAttrID();
        $binds['optID'] = $this->getOptID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $id
     * @param $name
     * @param $value
     * @return bool
     */
    public function updateDetailPrices($id, $name, $value)
    {

        $query = 'UPDATE `' . $this->tableDetailPrices . '` 
            SET `' . $name . '` = :value
            WHERE `ID` = :id
            ';
        $binds[':id'] = $id;
        $binds[':value'] = $value;

        if (!$this->db->exec($query, $binds)) return false;

        return true;
    }

    /**
     * @param $name
     * @param $value
     * @return bool
     */
    public function setDetailPrices($name, $value)
    {
        if ($id = $this->isDetailPrices()) {
            return $this->updateDetailPrices($id, $name, $value);
        }

        $query = 'INSERT INTO `' . $this->tableDetailPrices . '`
                (`controllerID`, `attrID`, `optID`, `' . $name . '`)
                VALUES ( :controllerID, :attrID, :optID, :value )';

        $binds[':controllerID'] = $this->controllerID;
        $binds[':attrID'] = $this->attrID;
        $binds[':optID'] = $this->optID;
        $binds[':value'] = $value;

        if (!$this->db->exec($query, $binds)) return false;

        return true;

    }

    /**
     * @param $ID
     * @return bool
     */
    public function deleteDetailPrices($ID)
    {
        $this->setTableName($this->tableDetailPrices, false);
        return parent::delete('ID', $ID);
    }

    /**
     * @param $ID
     * @return bool|mixed
     */
    public function getOne($ID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                WHERE `ID` = :ID ';

        $binds[':ID'] = $ID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @return array|bool
     */
    public function countByController()
    {

        if (!$this->attrID || !$this->optID) {
            return false;
        }

        $query = 'SELECT c.controllerID, COUNT(c.`ID`) as count FROM `' . $this->getTableName() . '` as c
                WHERE c.`attrID` = :attrID AND c.`optID` = :optID
                GROUP BY c.controllerID ';


        $binds['attrID'] = $this->attrID;
        $binds['optID'] = $this->optID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @return bool|array
     */
    public function getUsingPriceTypes()
    {
        if (!$this->attrID || !$this->optID) {
            return false;
        }
        $query = 'SELECT CP.`priceType`, CPT.`function` FROM `' . $this->getTableName() . '` AS CP
                LEFT JOIN `' . $this->tablePriceTypes . '` AS CPT ON CP.`priceType` = CPT.`ID`
                WHERE CP.`attrID` = :attrID AND CP.`optID` = :optID ';

        $binds[':attrID'] = $this->attrID;
        $binds[':optID'] = $this->optID;

        if ($this->controllerID !== NULL) {
            $query .= ' AND CP.`controllerID` = :controllerID ';
            $binds[':controllerID'] = $this->controllerID;
        }

        $query .= ' GROUP BY CP.`priceType`
                ORDER BY CP.`amount` ';

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $priceType
     * @param $amount
     * @return bool|mixed
     */
    private function getNextExpanse($priceType, $amount)
    {
        $query = 'SELECT `ID`, `amount`, `value`, `priceType`, `expense` FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `attrID` = :attrID AND `optID` = :optID
                AND `priceType` = :priceType AND `amount` > :amount AND `expense` IS NOT NULL
                ORDER BY `amount` ASC  LIMIT 1';

        $binds['controllerID'] = $this->getControllerID();
        $binds['attrID'] = $this->getAttrID();
        $binds['optID'] = $this->getOptID();
        $binds['priceType'] = $priceType;
        $binds['amount'] = $amount;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);

    }

    /**
     * @param $priceType
     * @param $amount
     * @return bool|mixed
     */
    private function getFirstExpense($priceType, $amount)
    {
        $query = 'SELECT `ID`, `amount`, `expense`, `priceType` FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `attrID` = :attrID AND `optID` = :optID
                AND `priceType` = :priceType AND `amount` <= :amount AND `expense` IS NOT NULL
                ORDER BY `amount` DESC LIMIT 1';

        $binds['controllerID'] = $this->getControllerID();
        $binds['attrID'] = $this->getAttrID();
        $binds['optID'] = $this->getOptID();
        $binds['priceType'] = $priceType;
        $binds['amount'] = $amount;


        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $priceType
     * @param $amount
     * @return bool|mixed
     */
    private function getFirstPrice($priceType, $amount)
    {
        $query = 'SELECT `ID`, `amount`, `value`, `priceType`, `expense` FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `optID` = :optID AND `attrID` = :attrID
                AND `priceType` = :priceType AND `amount` <= :amount
                ORDER BY `amount` DESC LIMIT 1';

        $binds['controllerID'] = $this->getControllerID();
        $binds['attrID'] = $this->getAttrID();
        $binds['optID'] = $this->getOptID();
        $binds['priceType'] = $priceType;
        $binds['amount'] = $amount;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $priceType
     * @param $amount
     * @return bool|mixed
     */
    private function getNextPrice($priceType, $amount)
    {
        $query = 'SELECT `ID`, `amount`, `value`, `priceType`, `expense` FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `attrID` = :attrID AND `optID` = :optID
                AND `priceType` = :priceType AND `amount` > :amount
                ORDER BY `amount` ASC  LIMIT 1';

        $binds['controllerID'] = $this->getControllerID();
        $binds['attrID'] = $this->getAttrID();
        $binds['optID'] = $this->getOptID();
        $binds['priceType'] = $priceType;
        $binds['amount'] = $amount;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $priceType
     * @param $amount
     * @return bool|mixed
     */
    private function getAllLowerPrices($priceType, $amount)
    {
        $query = 'SELECT `ID`, `amount`, `value`, `priceType`, `expense` FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `optID` = :optID AND `attrID` = :attrID
                AND `priceType` = :priceType AND `amount` <= :amount
                ORDER BY `amount` ASC';

        $binds['controllerID'] = $this->getControllerID();
        $binds['attrID'] = $this->getAttrID();
        $binds['optID'] = $this->getOptID();
        $binds['priceType'] = $priceType;
        $binds['amount'] = $amount;

        if (!$this->db->exec($query, $binds)) {
            echo 'SQL get Price Error';
            return false;
        }

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $priceType
     * @param $amount
     * @return array|bool
     */
    public function getExpenseForAmountPatterns($priceType, $amount)
    {
        $results = $this->getAllLowerPrices($priceType, $amount);

        if( $results ) {

            $firstElement = current($results);

            $sortedPrices = array();
            foreach ($results as $row) {
                $sortedPrices[$row['amount']] = $row;
            }

            $sumExpense = 0.0;

            $previousElement = array();

            $iterations = 0;
            for ($i=$firstElement['amount'];$i <= $amount; $i++) {
                $iterations++;

                if(!array_key_exists($i, $sortedPrices) ) {
                    if( array_key_exists('expense', $previousElement) ) {
                        $sumExpense += intval($previousElement['expense']);
                    }
                } else {
                    $sumExpense += intval($sortedPrices[$i]['expense']);
                    $previousElement = $sortedPrices[$i];
                }

            }

            $resultPrice = array(
                'expense' => $sumExpense,
                'amount' => $amount,
                'priceType' => $previousElement['priceType']
            );

            return $resultPrice;
        }

        return false;
    }
}