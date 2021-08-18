<?php

namespace DreamSoft\Models\Offer;
/**
 * Description of AuctionResponse
 *
 * @author Rafał
 * 
 */

use DreamSoft\Core\Model;

class AuctionResponse extends Model {
    
    public function __construct() {
	parent::__construct(true);
        $this->prefix = 'dp_';
        $this->setTableName( 'auction_responses', true );
    }
}