<?php

namespace DreamSoft\Models\Template;
/**
 * Description of ViewVariableLang
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class ViewVariableLang extends Model {
    
    public function __construct() {
	parent::__construct();
        $this->setTableName('viewVariableLangs', true);
    }
    
    public function set($variableID, $lang, $desc){
        $response = false;
        $updated = 0;
        $actID = $this->exist($variableID, $lang);

        if( intval($actID) > 0 ){
            if( $this->update($actID, 'desc', $desc) ){
                $updated++;
            }
            if( $updated == 1 ){
                $response = true;
            }
        } else {
            $params['desc'] = $desc;
            $params['lang'] = $lang;
            $params['variableID'] = $variableID;
            
            $actID = $this->create($params);
            if( intval($actID) > 0 ){
                $response = true;
            }
        }
        return $response;
    }
    
    public function exist($variableID, $lang){
        $query = 'SELECT `ID` FROM `'.$this->getTableName().'` WHERE variableID = :variableID AND '
                . ' lang = :lang ';
        
        $binds['variableID'] = $variableID;
        $binds['lang'] = $lang;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }
    
    public function getByVariable( $variableID ){
        $query = 'SELECT * FROM `'.$this->getTableName().'` WHERE variableID = :variableID ';
        
        $binds['variableID'] = $variableID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();
        
        if( !$res ){
           return false;
        }
        $result = array();
        foreach($res as $row){
            $result[ $row['lang'] ] = $row['desc'];
        }
        return $result;
    }
    
    public function getByList( $list ){
        if( empty($list) ){
            return false;
        }
        
        $query = 'SELECT * FROM `'.$this->getTableName().'` WHERE variableID IN ('.implode(',',$list).') ';
        
        $binds = array();
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();
        
        if( !$res ){
           return false;
        }
        $result = array();
        foreach($res as $row){
            $result[ $row['variableID'] ][ $row['lang'] ] = $row['desc'];
        }
        return $result;
    }
    
}
