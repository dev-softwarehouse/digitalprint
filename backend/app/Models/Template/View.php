<?php

namespace DreamSoft\Models\Template;

/**
 * Description of View
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class View extends Model {
    
    protected $viewOrder;


    public function __construct() {
	parent::__construct();
        $this->setTableName('views', true);
        $this->viewOrder = $this->prefix . 'viewOrders';
    }

    public function setRemote( $companyID ) {
        parent::__construct(false, $companyID);
    }
    
    public function getByRoute( $routeID, $replaceID = NULL ){
        $query='SELECT v.* FROM `'.$this->getTableName().'` as v '
                . ' LEFT JOIN `'.$this->viewOrder.'` as vo ON vo.viewID = v.ID AND vo.routeID = v.routeID '
                . ' WHERE v.`routeID` = :routeID ';
        
        $binds['routeID'] = $routeID;
        if( $replaceID ){
            $query .= ' AND v.`replaceID` = :replaceID ';
            $binds['replaceID'] = $replaceID;
        }
        
        $query .= ' GROUP BY v.ID '
                . ' ORDER BY vo.`order` ASC ';
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if(!$res){
            return false;
        }
        
        return $res;
    }
    
    public function getByRouteList( $routes, $indexed = false ){
        
        if( empty($routes) ){
            return false;
        }
        
        $query='SELECT * FROM `'.$this->getTableName().'` '
                . ' WHERE `routeID` IN ('.  implode(',', $routes).') AND '
                . ' `isMain` = 1 ';
                
        
        $binds = array();
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if(!$res) return false;
        
        $result = array();
        if( $indexed ){
            foreach($res as $row){
                $result[ $row['routeID'] ][ $row['ID'] ] = $row;
            }
            return $result;
        }
        
        return $res;
    }
    
    public function getAllView(){
        
        $query = ' SELECT * FROM `'.$this->getTableName().'` ';
        
        if (!$this->db->exec($query)) {
            return false;
        }
        
        $res = $this->db->getAll(); 
        
        if(!$res){
            return false;
        }
        
        return $res;
    }
    
}
