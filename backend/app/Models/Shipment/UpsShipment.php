<?php
/**
 * Programmer Rafał Leśniak - 22.11.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 22-11-2017
 * Time: 13:50
 */

namespace DreamSoft\Models\Shipment;

use DreamSoft\Core\Model;

class UpsShipment extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('upsShipments', true);
    }

    public function getMaxShipmentID()
    {
        $query = 'SELECT MAX(`shipmentID`) FROM `'.$this->getTableName().'` LIMIT 1';

        if( !$this->db->exec($query) ) {
            return 1;
        }

        $maxShipmentID = $this->db->getOne();
        if( $maxShipmentID > 0 ) {
            return $maxShipmentID;
        } else {
            return 1;
        }
    }
}