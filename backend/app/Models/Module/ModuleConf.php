<?php

namespace DreamSoft\Models\Module;

/**
 * Description of ModuleConfig
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class ModuleConf extends Model {
    
    public function __construct() {
	parent::__construct();
        $this->prefix = 'dp_config_';
        $prefix = true;
        $this->setTableName( 'moduleConfs', $prefix );
    }
    
}
