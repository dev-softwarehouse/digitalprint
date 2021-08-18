<?php

namespace DreamSoft\Models\Price;

/**
 * Description of BasePrice
 *
 * @author Właściciel
 */

use DreamSoft\Core\Model;


class BasePrice extends Model
{

    /**
     * BasePrice constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('base_prices', true);
    }

    /**
     * @param $ID
     * @return bool|string
     */
    public function copy($ID)
    {
        $query = 'INSERT INTO `' . $this->getTableName() . '` (`price`, `grossPrice`, `currency`, 
        `baseCurrency`, `exchangeRate`, `taxID`, `date`)
        SELECT `price`, `grossPrice`, `currency`, `baseCurrency`, `exchangeRate`, `taxID`, `date` 
        FROM `' . $this->getTableName() . '` WHERE ID = :ID ';


        $binds['ID'] = $ID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $lastID = $this->db->lastInsertID();

        return $lastID;
    }

}