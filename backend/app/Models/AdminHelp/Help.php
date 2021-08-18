<?php

namespace DreamSoft\Models\AdminHelp;

/**
 * Description of Help
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class Help extends Model {
    
    protected $helpLangs;
    protected $helpKeys;


    public function __construct() {
	    parent::__construct(true);
        $this->setTableName('helps', true);
        $this->helpLangs = $this->prefix . 'helpLangs';
        $this->helpKeys = $this->prefix . 'helpKeys';
    }
    
    public function getByModule($module = NULL, $lang = NULL) {
        $query='SELECT `'.$this->getTableName().'`.module,`'.$this->getTableName().'`.description, '
                . ' `'.$this->getTableName().'`.active as moduleActive,'
                . ' `'.$this->helpKeys.'`.key,`'.$this->helpKeys.'`.active as keyActive,'
                . ' `'.$this->helpLangs.'`.title, `'.$this->helpLangs.'`.description, '
                . ' `'.$this->helpLangs.'`.lang, `'.$this->getTableName().'`.ID '
                . ' FROM `'.$this->getTableName().'` '
                . ' LEFT JOIN `'.$this->helpKeys.'` ON '
                . ' `'.$this->helpKeys.'`.moduleID = `'.$this->getTableName().'`.ID '
                . ' LEFT JOIN `'.$this->helpLangs.'` ON '
                . ' `'.$this->helpLangs.'`.keyID = `'.$this->helpKeys.'`.ID ';
        if( $module ){
            $query.= ' WHERE `'.$this->getTableName().'`.`module` = :module ';
            $binds['module'] = $module;
        }
        
        if( $lang ){
            $query .= ' AND `'.$this->helpKeys.'`.`lang` = :lang ';
            $binds['lang'] = $lang;
        }

        if (!$this->db->exec($query, $binds)) {
            $this->setError($this->getDbError());
            return false;
        }

        $res = $this->db->getAll();
        if(!$res) return false;
        $result = array();
        foreach($res as $row){
            if( !isset($result[$row['ID']]) ){
                $result[$row['ID']] = array( 'ID' => $row['ID'] );
            }
            if( !empty($row['title']) && !empty($row['description']) ){
                $result[$row['ID']]['texts'][$row['lang']] = array('title' => $row['title'],
                    'description' => $row['description']);
            }
            $result[$row['ID']]['moduleActive'] = $row['moduleActive'];
            if( !empty($row['key']) ){
                $result[$row['ID']]['keyActive'] = $row['keyActive'];
                $result[$row['ID']]['key'] = $row['key'];
            }
            $result[$row['ID']]['module'] = $row['module'];
        }
        return $result;
    }
    
    public function getByParams($module,$key = NULL, $lang = NULL) {
        $query='SELECT `'.$this->helpKeys.'`.ID,'
                . ' `'.$this->helpKeys.'`.moduleID, '
                . ' `'.$this->helpLangs.'`.title, `'.$this->helpLangs.'`.description, '
                . ' `'.$this->helpLangs.'`.lang,'
                . ' `'.$this->helpKeys.'`.active,'
                . ' `'.$this->helpKeys.'`.key '
                . ' FROM `'.$this->getTableName().'` '
                . ' LEFT JOIN `'.$this->helpKeys.'` ON '
                . ' `'.$this->helpKeys.'`.moduleID = `'.$this->getTableName().'`.ID '
                . ' LEFT JOIN `'.$this->helpLangs.'` ON '
                . ' `'.$this->helpLangs.'`.keyID = `'.$this->helpKeys.'`.ID '
                . ' WHERE `'.$this->helpKeys.'`.ID IS NOT NULL AND`'.$this->getTableName().'`.`module` = :module ';
        
        $binds['module'] = $module;
        
        if( $key ){
            $query .= ' AND `'.$this->helpKeys.'`.key = :key ';
            $binds['key'] = $key;
        }
        
        if( $lang ) {
            $query .= ' AND `lang` = :lang ';
            $binds['lang'] = $lang;
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if(!$res) return false;
        $result = array();
        foreach($res as $row){
            if( !isset($result[$row['ID']]) ){
                $result[$row['ID']] = array( 'ID' => $row['ID'], 
                                             'active' => $row['active'], 
                                             'key' => $row['key'],
                                             'moduleID' => $row['moduleID'] 
                                            );
            }
            if( strlen( $row['title'] ) > 0 ){
                $result[$row['ID']]['texts'][$row['lang']] = array('title' => $row['title'],
                    'description' => $row['description']);
            }
        }
        sort($result);
        return $result;
    }
    
    public function getAll() {

        $query='SELECT * FROM `'.$this->getTableName().'` ';
               // . ' WHERE `lang` = :lang ';
        //$binds['lang'] = $lang;
        
        if (!$this->db->exec($query)) {
            return false;
        }

        $res = $this->db->getAll();
        if(!$res) return false;
        $result = array();
        foreach($res as $row){
            $result[] = $row;
        }
        return $result;
    }
    
    /*public function deleteByParams($module,$key, $lang = NULL) {
        $query='DELETE FROM `'.$this->getTableName().'` '
                . ' INNER JOIN `'.$this->helpLangs.'` ON '
                . ' `'.$this->helpLangs.'`.helpID = `'.$this->getTableName().'`.ID '
                . ' WHERE `module` = :module AND `key` = :key ';
        $binds['key'] = $key;
        $binds['module'] = $module;
        if( $lang ){
            $query .= ' AND `lang` = :lang ';
            $binds['lang'] = $lang;
        }
        
        if (!$this->db->exec($query, $binds)) {
              return false;
        }
        
        return true;
    }*/
}
