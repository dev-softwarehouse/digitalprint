<?php


namespace DreamSoft\Models\Cache;


use DreamSoft\Core\Model;

class Cache extends Model
{
    public function __construct($root = false, $companyID = NULL)
    {
        parent::__construct($root, $companyID);
        $this->setTableName('cache', true);
    }

    public function truncate()
    {
        $this->db->exec('delete from ' . $this->getTableName());
    }
}