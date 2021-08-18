<?php

namespace DreamSoft\Models\Offer;

/**
 * Description of ActionCompany
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class AuctionCompany extends Model {
    
    public function __construct() {
	parent::__construct(true);
        $this->prefix = 'dp_';
        $this->setTableName( 'auction_companies', true );
    }
    
    public function getAllForAuction( $auctions ){
        if( empty($auctions) || !is_array($auctions) ){
            return false;
        }
        
        $auctionStr = implode( ',', $auctions );
        
        $query='SELECT cmp.*  FROM `'.$this->getTableName().'` as cmp '
                . ' WHERE cmp.`auctionID` IN ('.$auctionStr.')  ';
        
        $binds = array();
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $result = $this->db->getAll();
        $res = array();
        if( !empty($result) ){
            foreach ($result as $key => $value) {
                $res[$value['auctionID']] = $value;
            }
        } 
        return $res;
    }

    public function getResponsesForAuction($auctionID) {
        $query = 'SELECT `responseID`, `companyID` FROM `'.$this->getTableName().'`  '
                . ' WHERE auctionID = :auctionID ';
        
        $binds = compact('auctionID');
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }
    
    public function exist( $companyID, $auctionID ) {
        $query = 'SELECT `ID` FROM `'.$this->getTableName().'` WHERE companyID = :companyID'
                . ' AND auctionID = :auctionID ';
        
        $binds = compact('companyID', 'auctionID');
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    public function get( $companyID, $auctionID, $checkResponse = false ) {
        $query = 'SELECT * FROM `'.$this->getTableName().'` WHERE companyID = :companyID'
                . ' AND auctionID = :auctionID ';
        
        if( $checkResponse ){
            $query .= ' AND responseID IS NOT NULL ';
        }
        
        $binds = compact('companyID', 'auctionID');
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }
    
    public function getMulti( $companyID, $auctionID ) {
        $query = 'SELECT * FROM `'.$this->getTableName().'` WHERE companyID = :companyID'
                . ' AND auctionID = :auctionID ';
        
        $binds = compact('companyID', 'auctionID');
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }
    
    public function getCompany( $auctionID, $responseID  ){
        $query = 'SELECT `companyID` FROM `'.$this->getTableName().'` WHERE responseID = :responseID '
                . ' AND auctionID = :auctionID ';
        
        $binds = compact('responseID', 'auctionID');
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }
}
