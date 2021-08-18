<?php

namespace DreamSoft\Models\Module;

use DreamSoft\Core\Model;

class ActiveModule extends Model
{
    /**
     * ActiveModule constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'dp_config_';
        $this->setTableName('activeModules', true);
    }

    /**
     * @param $key
     * @param $value
     * @return bool|mixed
     */
    public function exist($key, $value)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `' . $key . '` = :' . $key . ' ';
        $binds[':' . $key] = $value;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }
}
