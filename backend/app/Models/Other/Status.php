<?php

namespace DreamSoft\Models\Other;

use DreamSoft\Core\Model;

class Status extends Model {
    
    public function __construct() {
	parent::__construct();
        $this->setTableName( 'statuses', false );
    }
    
}