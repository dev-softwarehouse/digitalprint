<?php

namespace DreamSoft\Models\Acl;

/**
 * Description of Role
 *
 * @author Właściciel
 */

use DreamSoft\Core\Model;


class Role extends Model
{

    protected $permissions;

    private $tableRolePerm;
    private $tablePerm;

    public function __construct()
    {
        parent::__construct(true);
        $prefix = true;
        $this->setTableName('roles', $prefix);
        if ($prefix) {
            $this->tableRolePerm = $this->prefix . 'rolePerms';
            $this->tablePerm = $this->prefix . 'permissions';
        }
        $this->permissions = array();
    }

    /**
     * @param $name
     * @param null $desc
     * @return bool|string
     */
    public function create($name, $desc = NULL)
    {
        $query = "INSERT INTO `" . $this->getTableName() . "` 
            (
            `name`,
            `desc` 
            ) VALUES (
            :name,
            :desc
            )";

        $binds[':name'] = $name;
        $binds[':desc'] = $desc;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->lastInsertID();
    }

}
