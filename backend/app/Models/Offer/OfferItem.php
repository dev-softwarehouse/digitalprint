<?php

namespace DreamSoft\Models\Offer;

/**
 * Description of OfferItem
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class OfferItem extends Model {
    
    protected $offers;
    protected $options;

    public function __construct() {
	parent::__construct();
        $this->prefix = 'dp_';
        $this->setTableName( 'offer_items', true );
        $this->offers = $this->prefix.'offers';
        $this->options = $this->prefix.'offer_options';
    }
    
    public function setRemote( $companyID ) {
        parent::__construct(false, $companyID);
    }
    
    public function getByOffers( $offers, $inOrder = NULL ){
        
        if( empty($offers) || !is_array($offers) ){
            return false;
        }
        
        $items = $this->getAllOfferItems( $offers, $inOrder );
        
        if( empty($items) ){
            return false;
        }
        
        $resItems = array();
        foreach( $items as $it ){
            $resItems[$it['offerID']][] = $it;
        }
        
        if( empty($resItems) ){
            return false;
        }
        
        return $resItems;
    }
    
    public function getAllOfferItems( $offers, $inOrder = NULL ){
        if( empty($offers) || !is_array($offers) ){
            return false;
        }
        
        $offerStr = implode( ',', $offers );
        
        $query='SELECT items.*,pt.name as productName,ft.name formatName, ft.width, ft.height  FROM `'.$this->getTableName().'` as items '
                . 'LEFT JOIN `'.$this->options.'` as options ON options.offerItemID = items.ID '
                . 'LEFT JOIN `ps_products_types` as pt ON pt.ID = items.typeID '
                . 'LEFT JOIN `ps_products_formats` as ft ON ft.ID = items.formatID ';
        if( strlen($offerStr) > 0 ){
            $query .= ' WHERE items.`offerID` IN ('.$offerStr.') ';
        }

        $query .= ' GROUP BY items.ID ';

        $binds = array();
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }
    
    public function getOneOfferItem( $ID ){
        
        $query='SELECT items.*,pt.name as productName,ft.name formatName, ft.width, ft.height  FROM `'.$this->getTableName().'` as items '
                . 'LEFT JOIN `'.$this->options.'` as options ON options.offerItemID = items.ID '
                . 'LEFT JOIN `ps_products_types` as pt ON pt.ID = items.typeID '
                . 'LEFT JOIN `ps_products_formats` as ft ON ft.ID = items.formatID '
                . 'WHERE items.ID = :ID GROUP BY items.ID  ';
        
        $binds[':ID'] = $ID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }
}
