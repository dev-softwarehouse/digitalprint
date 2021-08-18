<?php

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Models\PrintShop\PrintShop;
use PDO;
use DreamSoft\Controllers\Components\Standard;

/**
 * Class PrintShopStaticPrice
 */
class PrintShopStaticPrice extends PrintShop
{
    /**
     * @var Standard
     */
    private $Standard;

    /**
     * PrintShopStaticPrice constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_staticPrices', $prefix);
        $this->Standard = Standard::getInstance();
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;
        if ($this->formatID === false) return false;

        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . 'WHERE `groupID` = :groupID AND `typeID` = :typeID AND `formatID` = :formatID';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':formatID'] = $this->formatID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $options
     * @return bool|mixed
     */
    public function getByOptions($options)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;
        if ($this->formatID === false) return false;

        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . 'WHERE `groupID` = :groupID AND `typeID` = :typeID AND `formatID` = :formatID AND `options` = :options';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':formatID'] = $this->formatID;
        $binds[':options'] = $options;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow();
    }

    /**
     * @param $options
     * @param null $price
     * @param null $expense
     * @return bool|string
     */
    public function create($options, $price = null, $expense = null)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;
        if ($this->formatID === false) return false;

        $query = 'INSERT INTO `' . $this->getTableName() . '` 
            ( `groupID`, `typeID`, `formatID`, `price`, `expense`, `options` ) VALUES 
            ( :groupID, :typeID, :formatID, :price, :expense, :options )';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':formatID'] = $this->formatID;
        $binds[':options'] = $options;
        $binds[':expense'] = $expense;
        $binds[':price'] = $price;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();
    }

    /**
     * @param $options
     * @param $key
     * @param $value
     * @return bool
     */
    public function update($options, $key, $value)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;
        if ($this->formatID === false) return false;


        $query = 'UPDATE `' . $this->getTableName() . '` SET `' . $key . '` = :' . $key . ' '
            . 'WHERE `groupID` = :groupID AND `typeID` = :typeID AND `formatID` = :formatID AND `options` = :options';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':formatID'] = $this->formatID;
        $binds[':options'] = $options;
        $binds[':' . $key] = $value;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $options
     * @return bool
     */
    public function customDelete($options)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;
        if ($this->formatID === false) return false;

        $query = 'DELETE FROM `' . $this->getTableName() . '` '
            . 'WHERE `groupID` = :groupID AND `typeID` = :typeID AND `formatID` = :formatID AND `options` = :options';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':formatID'] = $this->formatID;
        $binds[':options'] = $options;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param $options
     * @param string $key
     * @return bool|mixed
     */
    private function getStatic($options, $key = 'price')
    {
        $query = 'SELECT `' . $key . '` FROM `' . $this->getTableName() . '` WHERE groupID = :groupID AND 
            typeID = :typeID AND formatID = :formatID AND options = :options ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':formatID'] = $this->formatID;

        uksort($options, array($this->Standard, 'sortLikeJs'));

        $binds[':options'] = json_encode($options);

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $options
     * @return bool|mixed
     */
    public function getStaticExpense($options)
    {
        return $this->getStatic($options, 'expense');
    }

    /**
     * @param $options
     * @return bool|mixed
     */
    public function getStaticPrice($options)
    {
        return $this->getStatic($options, 'price');
    }

}

?>