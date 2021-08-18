<?php

namespace DreamSoft\Models\Offer;

/**
 * Description of OfferCompanies
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class OfferCompany extends Model {
    
    public function __construct() {
	parent::__construct();
        $this->prefix = 'dp_';
        $this->setTableName( 'offer_companies', true );
    }
    
    public function getByCompanies($companies){
        if( empty($companies) || !is_array($companies) ){
            return false;
        }
        
        $query = ' SELECT oc.* FROM `'.$this->getTableName().'` as oc '
                . ' WHERE oc.companyID IN (' . implode(',', $companies) . ') ';
        //$binds[':offerID'] = $offerID;
        
        //$binds = array();
        
        if (!$this->db->exec($query)) {
            return false;
        }
        $res = $this->db->getAll();
        $result = array();
        if(!$res){
            return false;
        }

        foreach ($res as $key => $value) {
            $result[$value['companyID']] = $value;
        }
        return $result;
    }
    
    public function getAll(){
        
        $query='SELECT * FROM `'.$this->getTableName().'` WHERE `active` = 1 ';
        $binds = array();
        
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
