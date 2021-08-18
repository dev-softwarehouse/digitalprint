<?php
/**
 * Programista Rafał Leśniak - 8.6.2017
 */

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Models\PrintShop\PrintShop;

/**
 * Class PrintShopFormatName
 */
class PrintShopFormatName extends PrintShop
{
    /**
     * PrintShopFormatName constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_formatNames', $prefix);
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
     * @return bool|array
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