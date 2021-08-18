<?php

namespace DreamSoft\Models\Other;

use DreamSoft\Core\Model;

/**
 * Class ModelIconExtension
 */
class ModelIconExtension extends Model
{

    /**
     * ModelIconExtension constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('modelsIconsExtensions', true);
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '`';

        if (!$this->db->exec($query)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $ID
     * @return array|bool
     */
    public function getById($ID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `ID` = :ID';

        $binds[':ID'] = $ID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

}