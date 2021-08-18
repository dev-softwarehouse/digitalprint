<?php

namespace DreamSoft\Models\RealizationTime;

use DreamSoft\Core\Model;

/**
 * Description of WorkTime
 *
 * @author Rafał
 */
class WorkTime extends Model {
    
    public function __construct() {
        parent::__construct();
        $this->setTableName('workTimes', false);
    }
    
    public function getLast($operatorID) {
        $query = 'SELECT * FROM `'.$this->getTableName().'` WHERE `operatorID` = :operatorID '
                . ' ORDER BY `date` DESC ';
        $binds['operatorID'] = $operatorID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        
        return $this->db->getRow();
    }
    
    public function getList($operatorID) {
        $query = 'SELECT * FROM `'.$this->getTableName().'` WHERE `operatorID` = :operatorID '
                . ' ORDER BY `date` DESC ';
        $binds['operatorID'] = $operatorID;
        
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        
        return $this->db->getAll();
    }
}
