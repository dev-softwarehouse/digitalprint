<?php

namespace DreamSoft\Models\Expense;
/**
 * Description of ExpenseLimit
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class ExpenseLimit extends Model {
    
    public function __construct() {
	parent::__construct();
        $this->setTableName('ExpenseLimits', true);
    }
    
}
