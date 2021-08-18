<?php

namespace DreamSoft\Models\UserType;

use DreamSoft\Core\Model;

class UserType extends Model {
    
    public function __construct() {
	parent::__construct();
        $this->setTableName('userTypes', true);
    }
    
}