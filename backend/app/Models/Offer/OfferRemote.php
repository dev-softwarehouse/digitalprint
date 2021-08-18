<?php

namespace DreamSoft\Models\Offer;
/**
 * Description of OfferRemote
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class OfferRemote extends Model
{
    /**
     * OfferRemote constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'dp_';
        $this->setTableName('offers', true);
    }

    /**
     * @param $companyID
     */
    public function setRemote($companyID)
    {
        parent::__construct(false, $companyID);
    }

}
