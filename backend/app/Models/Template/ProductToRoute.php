<?php

namespace DreamSoft\Models\Template;

/**
 * Description of ProductToCategory
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class ProductToRoute extends Model {
    
    public function __construct() {
	parent::__construct();
        $this->setTableName('productToRoutes', true);
    }
    
    public function exist( $productID, $routeID  ){
        $query='SELECT `ID` FROM `'.$this->getTableName().'` '
                . 'WHERE `productID` = :productID AND `routeID` = :routeID ';
        $binds['productID'] = $productID;
        $binds['routeID'] = $routeID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }
    
    public function delete( $productID, $routeID  ){
        $query='DELETE FROM `'.$this->getTableName().'` '
                . 'WHERE `productID` = :productID AND `routeID` = :routeID ';
        $binds['productID'] = $productID;
        $binds['routeID'] = $routeID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }
    
    public function getByRoute( $routeID ) {
        $query='SELECT `productID` FROM `'.$this->getTableName().'` '
                . 'WHERE `routeID` = :routeID ';
        //$binds['productID'] = $productID;
        $binds['routeID'] = $routeID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }
}
