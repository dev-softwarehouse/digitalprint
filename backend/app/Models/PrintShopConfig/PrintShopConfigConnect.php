<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;

/**
 * Description of Connect
 *
 * @author Rafał
 */
class PrintShopConfigConnect extends Printshop
{

    /**
     * PrintShopConfigConnect constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_connects', $prefix);
    }


}
