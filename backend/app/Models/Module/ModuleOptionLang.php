<?php

namespace DreamSoft\Models\Module;

/**
 * Description of ModuleOptionLang
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class ModuleOptionLang extends Model {
    
    public function __construct() {
	parent::__construct(true);
        $this->prefix = 'dp_config_';
        $this->setTableName( 'moduleOptionLangs', true );
    }
    
    public function set( $lang, $name, $moduleOptionID ){
        $ID = $this->exist($moduleOptionID, $lang);
        if( !$ID ){
            $lastID = $this->create( compact('lang','name','moduleOptionID') );
            if( $lastID > 0 ){
                return true;
            }
        } else {
            $res = $this->update($ID, 'name', $name);
            return $res;
        }
        return false;
    }
    
    public function exist( $moduleOptionID, $lang ){
        $query = 'SELECT `ID` FROM `'.$this->getTableName().'` WHERE `lang` = :lang AND `moduleOptionID` = :moduleOptionID ';

        $binds['lang'] = $lang;
        $binds['moduleOptionID'] = $moduleOptionID;
      
        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }
    
    public function getByMOduleOptions($list){
        if( empty($list) ){
            return false;
        }
        $query = 'SELECT * FROM `'.$this->getTableName().'` WHERE `moduleOptionID` IN ('.implode(',', $list).') ';
        $binds = array();
      
        $this->db->exec($query, $binds);

        $res = $this->db->getAll();
        $result = array();
        if( $res ){
            foreach ($res as $row){
                $result[$row['moduleOptionID']][$row['lang']] = $row['name'];
            }
        }
        return $result;
    }
    
    public function deleteList($list) {
        if( empty($list) ){
            return false;
        }

        $query='DELETE FROM `'.$this->getTableName().'` WHERE `moduleOptionID` IN ( '. implode(',', $list) .' ) ';
        
        $binds = array();
        
        if (!$this->db->exec($query, $binds)) {
              return false;
        }
        
        return true;
    }
    
}