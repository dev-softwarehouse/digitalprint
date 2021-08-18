<?php

namespace DreamSoft\Models\RealizationTime;
/**
 * Description of Holiday
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class Holiday extends Model
{

    public function __construct()
    {
        parent::__construct();
        $this->setTableName('holidays', false);
    }

    public function getHolidays($type = false)
    {

        $query = ' SELECT * FROM `' . $this->getTableName() . '` ';

        $binds = array();
        if ($type) {
            $binds[':type'] = $type;
            $query .= ' WHERE `type` = :type ';
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();

    }

}
