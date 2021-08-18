<?php
namespace DreamSoft\Models\PrintShopConfig;

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 08-03-2018
 * Time: 14:04
 */

use DreamSoft\Models\PrintShop\PrintShop;

/**
 * Class PrintShopConfigPriceListLanguage
 */
class PrintShopConfigPriceListLanguage extends PrintShop
{
    /**
     * PrintShopConfigPriceListLanguage constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_priceListLanguages', $prefix);
    }

    /**
     * @param $priceListID
     * @param $lang
     * @return bool
     */
    public function getOne($priceListID, $lang)
    {
        $query = ' SELECT `ID` FROM `' . $this->getTableName() . '` 
        WHERE `priceListID` = :priceListID AND `lang` = :lang ';

        $binds['priceListID'] = $priceListID;
        $binds['lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

}