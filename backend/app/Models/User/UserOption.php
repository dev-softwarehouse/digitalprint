<?php

namespace DreamSoft\Models\User;

use DreamSoft\Core\Model;

/**
 * Description of UserOption
 *
 * @author Rafał
 */
class UserOption extends Model {
    
    public function __construct() {
	    parent::__construct();
        $this->setTableName('userOptions', true);
    }
    
    public function set( $uID, $options ){
        $one = $this->get('uID', $uID);
        
        if( $one ){
            if( !empty( $options ) ){
                $updated = 0;
                foreach ($options as $key => $value) {
                    $updated += intval( $this->update( $one['ID'], $key, $value) );
                }
                if( count($options) == $updated ){
                    return true;
                } else {
                    return FALSE;
                }
            }    
        } else {
            $options['uID'] = $uID;
            $lastID = $this->create( $options );
            return $lastID;
        }
        return false;
    }
    
    public function getByList($list){
        if( empty($list) ){
            return false;
        }
        $query = 'SELECT *  '
                . ' FROM `'.$this->getTableName().'` '
                . ' WHERE `'.$this->getTableName().'`.uID IN ('.  implode(',', $list).') ';
        
        $binds = array();

        $query .= ' GROUP BY `'.$this->getTableName().'`.uID ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $result = array();
        $res = $this->db->getAll();
        if(!$res){
            return FALSE;
        }
        foreach ($res as $row){
            $result[$row['uID']] = $row;
        }
        return $result;
    }
}
