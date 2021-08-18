<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;

/**
 * Description of PrintShopConfigAttributeType
 *
 * @author Rafał
 */
class PrintShopConfigAttributeType extends PrintShop
{

    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_attributeTypes', $prefix);
    }

}
