<?php

namespace DreamSoft\Models\Route;

/**
 * Description of CategoryToContent
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class RouteContent extends Model {
    
    public function __construct() {
	parent::__construct();
        $this->setTableName('routeContents', true);
    }
    
    public function exist( $contentID, $routeID ){
        $query='SELECT `ID` FROM `'.$this->getTableName().'` '
                . 'WHERE `routeID` = :routeID AND `contentID` = :contentID ';
        $binds['routeID'] = $routeID;
        $binds['contentID'] = $contentID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return  $this->db->getOne();
    }
    
    public function getByRoute($routeID){
        $query='SELECT `contentID` FROM `'.$this->getTableName().'` '
                . 'WHERE `routeID` = :routeID ';
        $binds['routeID'] = $routeID;
        //$binds['contentID'] = $contentID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return  $this->db->getAll();
    }
}
