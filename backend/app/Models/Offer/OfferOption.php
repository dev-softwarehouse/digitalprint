<?php

namespace DreamSoft\Models\Offer;

/**
 * Description of OfferOption
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class OfferOption extends Model {
    
    public function __construct() {
	parent::__construct();
        $this->prefix = 'dp_';
        $this->setTableName( 'offer_options', true );
    }
    
    public function setRemote( $companyID ) {
        parent::__construct(false, $companyID);
    }
    
    public function getByItemList($items){
        if( empty($items) ){
            return false;
        }
        $query = 'SELECT op.attrPages, '
                . ' ca.ID as attrID, '
                . ' ca.name as attrName, '
                . ' co.name as optName, '
                . ' co.ID as optID,'
                . ' op.offerItemID FROM `'.$this->getTableName().'` as op '
                . ' LEFT JOIN `ps_config_attributes` ca ON ca.ID = op.attrID '
                . ' LEFT JOIN `ps_config_options` co ON co.ID = op.optID '
                . ' WHERE op.offerItemID IN ('.  implode(',', $items).') ';
        $binds = array();
        
         if (!$this->db->exec($query, $binds)) {
            return false;
        }
        
        $res = $this->db->getAll();
        $result = array();
        if(!$res) {
            return false;
        } else {
            
            foreach($res as $row){
                $result[$row['offerItemID']][] = $row; 
            }
        }

        return $result;
    }
    
}
