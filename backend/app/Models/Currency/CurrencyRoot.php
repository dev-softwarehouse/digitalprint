<?php

namespace DreamSoft\Models\Currency;

/**
 * Description of Currency
 *
 * @author Właściciel
 */

use DreamSoft\Core\Model;


class CurrencyRoot extends Model {
    
    public function __construct() {
	    parent::__construct(true);
        $this->setTableName('currency', true);
    }
}
