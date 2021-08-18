<?php

namespace DreamSoft\Models\Offer;

/**
 * Description of AuctionResponseItem
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class AuctionResponseItem extends Model {
    
    public function __construct() {
	parent::__construct(true);
        $this->prefix = 'dp_';
        $this->setTableName( 'auction_responseItems', true );
    }
    
    public function getByResponse( $responseID ) {
        
        $query='SELECT * FROM `'.$this->getTableName().'` WHERE `responseID` = :responseID ';
        
        $binds['responseID'] = $responseID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if(!$res) return false;
        
        return $res;
        
    }
    
    public function exist( $responseID, $itemID ){
        $query = ' SELECT `ID` FROM `'.$this->getTableName().'` WHERE `responseID` = :responseID AND '
                . ' `itemID` = :itemID ';
        
        $binds[':responseID'] = $responseID;
        $binds[':itemID'] = $itemID;
        
        if (!$this->db->exec($query,$binds)) {
              return false;
        }

        return $this->db->getOne();
    }
    
    public function getOneRow( $responseID, $itemID ){
        $query = ' SELECT * FROM `'.$this->getTableName().'` WHERE `responseID` = :responseID AND '
                . ' `itemID` = :itemID ';
        
        $binds[':responseID'] = $responseID;
        $binds[':itemID'] = $itemID;
        
        if (!$this->db->exec($query,$binds)) {
              return false;
        }

        return $this->db->getRow();
    }
    
    public function getByListItems( $itemList, $winerResponseID = NULL ){
        if( empty($itemList) || !is_array($itemList) ){
            return false;
        }
        
        //$itemListStr = ;
        
        $query = ' SELECT * FROM `'.$this->getTableName().'` WHERE '
                . ' `itemID` IN ('. implode( ',', $itemList ) .') ';
        
        if( $winerResponseID ){
            $query .= ' AND `responseID` = :responseID ';
            $binds['responseID'] = $winerResponseID;
        } else {
            $binds = array();
        }
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $items = $this->db->getAll();
        
        if( empty($items) ){
            return false;
        }
        
        $resItems = array();
        foreach( $items as $it ){
            $resItems[$it['itemID']] = $it;
        }
        
        if( empty($resItems) ){
            return false;
        }
        
        return $resItems;
    }
}