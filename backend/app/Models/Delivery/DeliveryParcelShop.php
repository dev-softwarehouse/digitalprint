<?php

namespace DreamSoft\Models\Delivery;

use DreamSoft\Core\Model;

/**
 * Class DeliveryParcelShop
 * @package DreamSoft\Models\Delivery
 */
class DeliveryParcelShop extends Model
{
    /**
     * DeliveryParcelShop constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'dp_';
        $this->setTableName('deliveryParcelShops', true);
    }

}