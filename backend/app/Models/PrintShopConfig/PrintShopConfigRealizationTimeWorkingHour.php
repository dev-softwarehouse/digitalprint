<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-09-2018
 * Time: 10:51
 */

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;

/**
 * Class PrintShopConfigRealizationTimeWorkingHour
 * @package DreamSoft\Models\PrintShopConfig
 */
class PrintShopConfigRealizationTimeWorkingHour extends PrintShop
{
    /**
     * PrintShopConfigRealizationTimeDay constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_realizationTimeWorkingHours', $prefix);
    }


}