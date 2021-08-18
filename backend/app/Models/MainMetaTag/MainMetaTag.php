<?php
/**
 * Programmer Rafał Leśniak - 15.1.2018
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 15-01-2018
 * Time: 10:33
 */

namespace DreamSoft\Models\MainMetaTag;

use DreamSoft\Core\Model;

class MainMetaTag extends Model
{
    private $domainID;

    /**
     * @return int
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param int $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    public function __construct()
    {
        parent::__construct();
        $this->setTableName('mainMetaTags', true);
    }

    /**
     * @param $routes
     * @return array|bool
     */
    public function getByRoutes($routes)
    {
        if( !$routes ) {
            return false;
        }

        $query = ' SELECT * FROM '.$this->getTableName().' WHERE `routeID` IN ('.implode(',', $routes).') AND 
         domainID = :domainID ';

        $binds['domainID'] = $this->getDomainID();

        $this->db->exec($query, $binds);

        $res = $this->db->getAll();

        if( !$res ) {
            return false;
        }

        $result = array();

        foreach ($res as $row) {
            $result[$row['routeID']] = $row;
        }

        return $result;
    }

    /**
     * @param $routeID
     * @param $domainID
     * @return mixed
     */
    public function getOne( $routeID, $domainID )
    {
        $query = ' SELECT * FROM '.$this->getTableName().' WHERE `routeID` = :routeID AND 
         `domainID` = :domainID ';

        $binds['domainID'] = $domainID;
        $binds['routeID'] = $routeID;

        $this->db->exec($query, $binds);

        return $this->db->getRow();
    }
}