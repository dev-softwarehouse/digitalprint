<?php

namespace DreamSoft\Models\Address;
/**
 * Class Address
 */
use DreamSoft\Core\Model;

class OldAddress extends Model
{
    /**
     * OldAddress constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('old_address', false);
    }

}