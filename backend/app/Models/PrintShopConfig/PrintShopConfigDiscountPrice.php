<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\Behaviours\PriceOperation;
use PDO;

class PrintShopConfigDiscountPrice extends PrintShopConfigPrice
{
    /**
     * @var int
     */
    private $discountGroups;
    private $discountGroupID;

    /**
     * @var PriceOperation
     */
    protected $PriceOperation;

    /**
     * @return mixed
     */
    public function getDiscountGroups()
    {
        return $this->discountGroups;
    }

    /**
     * @param mixed $discountGroups
     */
    public function setDiscountGroups($discountGroups)
    {
        $this->discountGroups = $discountGroups;
    }

    /**
     * @return mixed
     */
    public function getDiscountGroupID()
    {
        return $this->discountGroupID;
    }

    /**
     * @param mixed $discountGroupID
     */
    public function setDiscountGroupID($discountGroupID)
    {
        $this->discountGroupID = $discountGroupID;
    }

    /**
     * PrintShopConfigDiscountPrice constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('config_discountPrices', $this->prefix);
        $this->PriceOperation = new PriceOperation();
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
                AND `amount` = :amount AND `priceType` = :priceType AND `discountGroupID` = :discountGroupID ';

        $binds['controllerID'] = array($this->controllerID, 'int');
        $binds['attrID'] = array($this->attrID, 'int');
        $binds['optID'] = array($this->optID, 'int');
        $binds['amount'] = $amount;
        $binds['priceType'] = $priceType;
        $binds['discountGroupID'] = $this->getDiscountGroupID();

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
                (`controllerID`, `attrID`, `optID`, `amount`, `value`, `priceType`, `expense`, `discountGroupID`)
                VALUES ( :controllerID, :attrID, :optID, :amount, :value, :priceType, :expense, :discountGroupID )';

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
        $binds['discountGroupID'] = $this->getDiscountGroupID();

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->lastInsertID();
    }

    /**
     * @return bool|array
     */
    public function getAll()
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `optID` = :optID AND `discountGroupID` = :discountGroupID   
                ORDER BY `amount` ';

        $binds['controllerID'] = $this->controllerID;
        $binds['optID'] = $this->optID;
        $binds['discountGroupID'] = $this->getDiscountGroupID();

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);

    }

    /**
     * @param $priceType
     * @return bool
     */
    public function removeAll($priceType)
    {

        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE `controllerID` = :controllerID AND 
          attrID = :attrID AND  optID = :optID AND `priceType` = :priceType AND `discountGroupID` = :discountGroupID ';

        $binds = array();
        $binds['controllerID'] = $this->controllerID;
        $binds['attrID'] = $this->attrID;
        $binds['optID'] = $this->optID;
        $binds['priceType'] = $priceType;
        $binds['discountGroupID'] = $this->getDiscountGroupID();

        if (!$this->db->exec($query, $binds)) return false;
        return true;
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

        $binds['attrID'] = $this->attrID;
        $binds['optID'] = $this->optID;


        $discountGroups = $this->getDiscountGroups();

        if ($discountGroups) {
            $aggregateDiscountGroup = array();
            foreach ($discountGroups as $discountGroup) {
                $aggregateDiscountGroup[] = $discountGroup['discountGroupID'];
            }
            $query .= ' AND CP.`discountGroupID` IN (' . implode(',', $aggregateDiscountGroup) . ') ';
        }

        if ($this->controllerID !== NULL) {
            $query .= ' AND CP.`controllerID` = :controllerID ';
            $binds['controllerID'] = $this->controllerID;
        }

        $query .= ' GROUP BY CP.`priceType`
                ORDER BY CP.`amount` ';

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $priceType
     * @param $amount
     * @return bool
     */
    public function customGet($priceType, $amount)
    {

        $allPossibleResults = $this->getPriceByGroup($priceType, $amount);

        if( !$allPossibleResults ) {
            $result = array();
        } else {

            $firstResult = current($allPossibleResults);
            if( $firstResult['amount'] < $amount ) {
                $result = $firstResult;
            } else {
                $result = $this->selectBestPrice($allPossibleResults);
            }

        }

        if ($result['amount'] < $amount) {

            $nextPrice = $this->getNextPriceByGroup($priceType, $amount, $result['discountGroupID']);

            if ($nextPrice === false) {
                $lastRangePrice = $result['value'] / $result['amount'];
                $result['lastRangePrice'] = $lastRangePrice;
                return $result;
            }

            if ( empty($result) ) {
                $result['value'] = $nextPrice['value'];
                $result['discountGroupID'] = $nextPrice['discountGroupID'];
            } else {

                $result['value'] = $this->PriceOperation->countValue($result, $nextPrice, $amount);
                $result['discountGroupID'] = $nextPrice['discountGroupID'];
            }
        }

        return $result;

    }

    /**
     * @param $priceType
     * @param $amount
     * @return bool|array
     */
    private function getPriceByGroup($priceType, $amount)
    {
        $discounts = $this->getDiscountGroups();

        $aggregateDiscounts = array();
        if ($discounts) {
            foreach ($discounts as $discount) {
                $aggregateDiscounts[] = $discount['discountGroupID'];
            }
        }

        $query = 'SELECT `ID`, `amount`, `value`, `priceType`, `expense`, `discountGroupID` FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `optID` = :optID AND `attrID` = :attrID
                AND `priceType` = :priceType AND `amount` <= :amount ';

        if (!empty($aggregateDiscounts)) {
            $query .= ' AND `discountGroupID` IN (' . implode(',', $aggregateDiscounts) . ') ';
        }

        $query .= 'ORDER BY `amount` DESC';

        $binds[':controllerID'] = $this->controllerID;
        $binds[':attrID'] = $this->attrID;
        $binds[':optID'] = $this->optID;
        $binds[':priceType'] = $priceType;
        $binds[':amount'] = $amount;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $priceType
     * @param $amount
     * @param $discountGroupID
     * @return bool
     */
    private function getNextPriceByGroup($priceType, $amount, $discountGroupID)
    {
        $discounts = $this->getDiscountGroups();

        $aggregateDiscounts = array();
        if ($discounts) {
            foreach ($discounts as $discount) {
                $aggregateDiscounts[] = $discount['discountGroupID'];
            }
        }

        $query = 'SELECT `ID`, `amount`, `value`, `priceType`, `expense`, `discountGroupID` FROM `' . $this->getTableName() . '` 
                WHERE `controllerID` = :controllerID AND `optID` = :optID AND `attrID` = :attrID 
                AND `priceType` = :priceType AND `amount` > :amount ';

        if (!empty($aggregateDiscounts)) {
            $query .= ' AND `discountGroupID` IN (' . implode(',', $aggregateDiscounts) . ') ';
        }

        if( $discountGroupID > 0 ) {
            $query .= ' AND `discountGroupID` = :discountGroupID ';
            $binds['discountGroupID'] = $discountGroupID;
        }

        $query .= 'ORDER BY `amount` ASC LIMIT 1';

        $binds[':controllerID'] = $this->controllerID;
        $binds[':attrID'] = $this->attrID;
        $binds[':optID'] = $this->optID;
        $binds[':priceType'] = $priceType;
        $binds[':amount'] = $amount;

        if (!$this->db->exec($query, $binds)) {
            echo 'SQL get Price Error';
            return false;
        }

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    private function selectBestPrice($allPossibleResults)
    {
        $bestResult = false;
        foreach ($allPossibleResults as $oneResult) {
            if( $oneResult['value'] < $bestResult['value'] || $bestResult === false ) {
                $bestResult = $oneResult;
            }
        }

        return $bestResult;
    }

    /**
     * @param $discountGroupID
     * @return bool|array
     */
    public function getMatrix($discountGroupID)
    {
        $query = 'SELECT discountPrice.*, printTypes.name as printTypeName, printTypes.ID as printTypeID, 
              priceTypes.name as priceTypeName, priceTypes.ID as priceTypeID, workSpaces.name as workSpaceName, 
              workSpaces.ID as workSpaceID, priceLists.name as priceListName, priceLists.ID as priceListID 
               FROM `' . $this->getTableName() . '` as discountPrice 
               LEFT JOIN `ps_config_printTypes` as printTypes ON printTypes.ID = discountPrice.controllerID 
               LEFT JOIN `ps_config_priceTypes` as priceTypes ON priceTypes.ID = discountPrice.priceType  
               LEFT JOIN `ps_config_workspaces` as workSpaces ON workSpaces.ID = discountPrice.controllerID 
               LEFT JOIN `ps_config_priceLists` as priceLists ON priceLists.ID = discountPrice.controllerID 
               WHERE discountPrice.`discountGroupID` = :discountGroupID  
                ORDER BY discountPrice.optID ASC 
               ';

        $binds[':discountGroupID'] = $discountGroupID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll(PDO::FETCH_ASSOC);
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
            for ($i=$firstElement['amount'];$i <= $amount; $i++) {
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

            $resultPrice = array(
                'value' => $sumPrice,
                'amount' => $amount,
                'priceType' => $previousElement['priceType']
            );

            return $resultPrice;
        }

        return false;
    }

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