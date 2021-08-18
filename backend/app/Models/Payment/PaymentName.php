<?php


namespace DreamSoft\Models\Payment;

use DreamSoft\Core\Model;

/**
 * Class PaymentName
 */
class PaymentName extends Model
{

    /**
     * PaymentName constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'dp_config_';
        $this->setTableName('paymentNames', true);
    }
}