<?php

namespace DreamSoft\Models\PrintShopUser;
/**
 * Description of UserData
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class UserData extends Model {

    public function __construct() {
	parent::__construct();
        $this->prefix = 'ps_user_';
        $this->setTableName( 'data', true );
    }
    
    public function getByOrder($orderID) {
        $query = 'SELECT `'.$this->getTableName().'`.*, '
                . ' `ps_products_formats`.name as formatName '
                . ' FROM `'.$this->getTableName().'` '
                . ' LEFT JOIN `ps_products_formats` ON `ps_products_formats`.ID = `'.$this->getTableName().'`.formatID '
                . ' WHERE `orderID` = :orderID ';
        
        $binds['orderID'] = $orderID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }
    
    public function update($orderID, $key, $value){
        $query = 'UPDATE `'.$this->getTableName().'` SET `'.$key.'` = :'.$key.' WHERE orderID = :orderID';
        $binds[':'.$key] = $value;
        $binds[':orderID'] = $orderID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        } else
            return true;
    }
    
}
