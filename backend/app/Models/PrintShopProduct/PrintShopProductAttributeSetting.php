<?php
/**
 * Programmer Rafał Leśniak - 14.11.2017
 */

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Core\Model;

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 14-11-2017
 * Time: 13:13
 */
class PrintShopProductAttributeSetting extends Model
{
    /**
     * PrintShopProductAttributeSetting constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('products_attributeSettings', true);
    }

    /**
     * @param $typeID
     * @param $attrID
     * @return bool
     */
    public function exist($typeID, $attrID)
    {
        $query = ' SELECT `ID` FROM `' . $this->getTableName() . '` WHERE 
         `typeID` = :typeID AND `attrID` = :attrID ';

        $binds['typeID'] = $typeID;
        $binds['attrID'] = $attrID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }
}