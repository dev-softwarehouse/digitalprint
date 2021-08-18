<?php

namespace DreamSoft\Models\Template;

/**
 * Description of ViewOrder
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class ViewOrder extends Model {
    
    public function __construct() {
	parent::__construct();
        $this->setTableName('viewOrders', true);
    }
    
    public function getMax( $routeID ){
        $query='SELECT MAX(`order`) FROM `'.$this->getTableName().'` ';
        
        
        $query .= ' WHERE `routeID` = :routeID ';
        $binds['routeID'] = $routeID;
        
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }
    
    public function delete( $routeID, $viewID ){
        $query='DELETE FROM `'.$this->getTableName().'` WHERE `routeID` = :routeID AND `viewID` = :viewID ';
        
        $binds['routeID'] = $routeID;
        $binds['viewID'] = $viewID;
        
        if (!$this->db->exec($query, $binds)) {
              return false;
        }
        
        return true;  
    }
    
    public function exist( $routeID, $viewID ){
        $query='SELECT `ID` FROM `'.$this->getTableName().'` WHERE `routeID` = :routeID AND `viewID` = :viewID ';
        $binds['routeID'] = $routeID;
        $binds['viewID'] = $viewID;
        
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }
    
    public function sort($routeID, $orders){
        $result = true;
        foreach($orders as $index => $vID){
            
            $query='UPDATE `'.$this->getTableName().'` SET `order` = :index WHERE `viewID` = :viewID AND `routeID` = :routeID ';
            
            $binds['viewID'] = array($vID, 'int');
            $binds['routeID'] = array($routeID, 'int');
            $binds['index'] = $index;
            if(!$this->db->exec($query, $binds)){
                $result = false;
            }
        }
        return $result;
    }
}
