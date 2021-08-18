<?php

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Description of PrintshopProoductPreflight
 *
 * @author Rafał
 */
class PrintShopPreFlight extends PrintShop
{

    /**
     * PrintShopPreFlight constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('products_preflights', true);
    }

    /**
     * @param $formatID
     * @return array|bool
     */
    public function getByFormat($formatID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                WHERE `formatID` = :formatID 
                ';

        $binds[':formatID'] = $formatID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

}
