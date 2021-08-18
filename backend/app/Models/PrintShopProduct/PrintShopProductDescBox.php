<?php

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Core\Model;

/**
 * Class PrintShopProductDescBox
 * @package DreamSoft\Models\PrintShopProduct
 */
class PrintShopProductDescBox extends Model
{

    /**
     * PrintShopProductDescBox constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('products_desc_boxes', FALSE);
    }

}
