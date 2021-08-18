<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;

/**
 * Description of PrintShopConfigAttributeRange
 *
 * @author Rafał
 */
class PrintShopConfigAttributeRange extends PrintShop
{

    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_attributeRanges', $prefix);
    }


}
