<?php

namespace DreamSoft\Models\Editor;

use DreamSoft\Core\Model;

class EditorInterface extends Model {
    
    public $destination = 'uploads';
    
    public function __construct($root = false) {
        parent::__construct($root);
        $this->prefix = 'e_';
    }
}
