<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 26-04-2018
 * Time: 12:27
 */

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Core\Model;

/**
 * Class PrintShopOptionFormat
 * @package DreamSoft\Models\PrintShopProduct
 */
class PrintShopOptionFormat extends Model
{
    /**
     * PrintShopOptionFormat constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('products_optionFormats', true);
    }
}