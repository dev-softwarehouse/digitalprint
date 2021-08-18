<?php

namespace DreamSoft\Models\Menu;

/**
 * Description of SubMenu
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class SubMenu extends Model
{

    /**
     * SubMenu constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $prefix = true;
        $this->setTableName('subMenu', $prefix);
    }

    /**
     * @param $menuID
     * @return array|bool
     */
    public function customGetAll($menuID)
    {
        $query = 'SELECT * FROM `dp_subMenu` WHERE `menuID` = :menuID AND `active` = 1';
        $binds['menuID'] = $menuID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        foreach ($res as $row) {
            $result[] = $row;
        }
        return $result;
    }

}
