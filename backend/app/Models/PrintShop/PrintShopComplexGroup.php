<?php

namespace DreamSoft\Models\PrintShop;

use DreamSoft\Models\PrintShop\PrintShop;

/**
 * Description of PrintshopComplexGroup
 *
 */
class PrintShopComplexGroup extends PrintShop {
    
    public function __construct(){
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_complexGroups', $prefix);
    }

}