<?php
/**
 * Programista Rafał Leśniak - 8.6.2017
 */

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Models\PrintShop\PrintShop;

/**
 * Class PrintShopPageName
 */
class PrintShopPageName extends PrintShop
{
    /**
     * PrintShopPageName constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_pageNames', $prefix);
    }

    /**
     * @param $typeID
     * @param $lang
     * @return int|bool
     */
    public function nameExist($typeID, $lang)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE `typeID` = :typeID 
        AND `lang` = :lang ';

        $binds['typeID'] = $typeID;
        $binds['lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $typeID
     * @return bool
     */
    public function getByType($typeID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
        WHERE `typeID` = :typeID  ';

        $binds['typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

}