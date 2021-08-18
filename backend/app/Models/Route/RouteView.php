<?php

namespace DreamSoft\Models\Route;

/**
 * Description of CategoryView
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class RouteView extends Model
{

    /**
     * RouteView constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $this->setTableName('routeViews', true);
    }

    /**
     * @param $routeID
     * @param $viewID
     * @return bool|mixed
     */
    public function exist($routeID, $viewID)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE `routeID` = :routeID AND `viewID` = :viewID ';
        $binds['routeID'] = $routeID;
        $binds['viewID'] = $viewID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

}
