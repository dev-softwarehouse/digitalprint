<?php

namespace DreamSoft\Models\Delivery;
/**
 * Description of DeliveryName
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class DeliveryName extends Model
{

    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'dp_config_';
        $this->setTableName('deliveryNames', true);
    }

    public function getNames($list)
    {
        if (empty($list)) {
            return false;
        }
        $query = ' SELECT * FROM `' . $this->getTableName() . '` WHERE `deliveryID` IN (' . implode(',', $list) . ') ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }

        $result = array();
        foreach ($res as $r) {
            $result[$r['deliveryID']][$r['lang']] = $r['name'];
        }
        return $result;
    }
}
