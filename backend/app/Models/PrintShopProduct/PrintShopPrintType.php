<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 26-04-2018
 * Time: 13:21
 */

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Core\Model;

/**
 * Class PrintShopPrintType
 * @package DreamSoft\Models\PrintShopProduct
 */
class PrintShopPrintType extends Model
{
    /**
     * PrintShopPrintType constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('products_printTypes', true);
    }

}