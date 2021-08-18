<?php

namespace DreamSoft\Models\Order;

/**
 * Description of OrderConfig
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class OrderConfig extends Model {
    
    public function __construct() {
        parent::__construct();
        $this->setTableName('orderConfigs', true);
    }
    
}
