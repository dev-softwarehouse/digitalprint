<?php

namespace DreamSoft\Models\PrintShopUser;

/**
 * Description of UserFile
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class UserFile extends Model {
    
    public function __construct() {
	parent::__construct();
        $this->prefix = 'ps_user_';
        $this->setTableName( 'files', true );
    }
    
    public function getByOrder($orderID) {
        $query = 'SELECT of.*, o.domainID FROM `'.$this->getTableName().'` as of'
                . ' LEFT JOIN `orders` as o ON o.`ID` = of.orderID '
                . ' WHERE of.`orderID` = :orderID ';
        
        $binds['orderID'] = $orderID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }
    
    public function acceptFiles( $orderID, $accept = 1, $acceptFiles = array() ) {
        
        if( !is_array($acceptFiles) ){
            $acceptFiles = array();
        }
        
        $query='UPDATE `'.$this->getTableName().'` 
              SET
                `accept` = :accept
              WHERE
                orderID = :orderID  
            ';
        if( !empty($acceptFiles) ){
            $query .= ' AND `ID` NOT IN ('.  implode(',', $acceptFiles).') ';
        }
        
        
        $binds[':orderID'] = $orderID;
        //$binds[':ID'] = $ID;
        $binds[':accept'] = $accept;
        
        if (!$this->db->exec($query, $binds)) {
              return false;
        }
        return true;
    }
    
    public function getUploadDir( $orderID ) {
        $dir = OLD_DIR.'/data/'.companyID.'/orders/'.substr($orderID, 0, -3).'/'.substr($orderID, -3, 1).'/'.$orderID.'/printshop/';
        if( !is_dir( $dir ) ){
            $this->makeUploadDir( $orderID );
        }
        return $dir;
    }
    
    public function makeUploadDir( $orderID ){
        $dir = OLD_DIR.'/data/'.companyID.'/orders/'.substr($orderID, 0, -3).'/'.substr($orderID, -3, 1).'/'.$orderID.'/printshop/';
        mkdir( $dir, 0777, true );
        chmod( $dir, 0777 );
    }
}
