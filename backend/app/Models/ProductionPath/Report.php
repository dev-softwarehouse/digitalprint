<?php

namespace DreamSoft\Models\ProductionPath;

/**
 * Typy:
 * 1 - nie zatrzymany czas operatora.
 */

use DreamSoft\Core\Model;

class Report extends Model {
    
    public function __construct() {
	parent::__construct();
        $prefix = true;
        $this->setTableName('reports', $prefix);
    }
    
}