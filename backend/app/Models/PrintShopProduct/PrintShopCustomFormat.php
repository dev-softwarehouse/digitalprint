<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-04-2018
 * Time: 10:33
 */

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Core\Model;

class PrintShopCustomFormat extends Model
{
    /**
     * PrintShopCustomFormat constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('products_customFormat', true);
    }
}