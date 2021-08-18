<?php
/**
 * Programmer Julius Momnang - 22.05.2018
 */

/**
  * User: Julius Momnang
 * Date: 22-05-2018
 * Time: 13:50
 */

namespace DreamSoft\Models\Shipment;

use DreamSoft\Core\Model;

class DpdShipment extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('dpdShipments', true);
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