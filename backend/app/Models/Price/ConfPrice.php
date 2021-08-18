<?php

namespace DreamSoft\Models\Price;

/**
 * Description of ConfPrice
 *
 * @author Właściciel
 */

use DreamSoft\Core\Model;


class ConfPrice extends Model {

    public function __construct() {
	parent::__construct();
        $this->setTableName('conf_prices', true);
    }

    /**
     * @param array $list
     * @return bool|array
     */
    public function customGetByList(array $list )
    {
        if( empty($list) ){
            return false;
        }

        $query = 'SELECT * FROM `'.$this->getTableName().'` WHERE `ID` IN ('.  implode(',', $list).') ';

        if (!$this->db->exec($query)) {
            return false;
        }

        $res = $this->db->getAll();
        if(!$res){
            return false;
        }

        $result = array();
        foreach ($res as $key => $value) {
            $result[$value['ID']] = $value;
        }
        return $result;
    }

}
