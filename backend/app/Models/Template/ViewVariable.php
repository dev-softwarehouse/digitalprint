<?php

namespace DreamSoft\Models\Template;
/**
 * Description of ViewVariable
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class ViewVariable extends Model {
    
    public function __construct() {
	parent::__construct();
        $this->setTableName('viewVariables', true);
    }
    
    public function getAll($viewID = NULL) {
        $query='SELECT * FROM `'.$this->getTableName().'` ';
        
        if( $viewID ){
            $query .= ' WHERE `viewID` = :viewID ';
            $binds['viewID'] = $viewID;
        }
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if(!$res) return false;
        
        foreach($res as $row){
            $result[] = $row;
        }
        return $result;
    }
}
