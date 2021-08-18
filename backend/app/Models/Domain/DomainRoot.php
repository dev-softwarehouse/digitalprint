<?php

namespace DreamSoft\Models\Domain;

/**
 * Description of DomainRoot
 *
 * @author Właściciel
 */


use DreamSoft\Core\Model;

class DomainRoot extends Model
{

    /**
     * DomainRoot constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $this->setTableName('domains', true);
    }

    /**
     * @param $name
     * @return bool|mixed
     */
    public function getByName($name)
    {

        $query = ' SELECT * FROM `' . $this->getTableName() . '` WHERE `active` = 1 AND 
             `name` = :name ';

        $binds[':name'] = $name;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();

    }
}
