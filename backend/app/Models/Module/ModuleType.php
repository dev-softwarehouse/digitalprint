<?php

namespace DreamSoft\Models\Module;

/**
 * Description of ModuleType
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class ModuleType extends Model {
    
    public function __construct() {
	parent::__construct(true);
        $this->prefix = 'dp_config_';
        $this->setTableName( 'moduleTypes', true );
    }

    
}