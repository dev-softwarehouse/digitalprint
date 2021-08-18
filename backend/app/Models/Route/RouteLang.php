<?php

namespace DreamSoft\Models\Route;

/**
 * Description of CategoryLang
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\UrlMaker;

class RouteLang extends Model {
    
    protected $UrlMaker;
    protected $routes;

    public function __construct() {
	    parent::__construct();
        $this->UrlMaker = new UrlMaker();
        $this->setTableName('routeLangs', true);
        $this->routes = $this->prefix . 'routes';
    }

    public function setRemote( $companyID ) {
        parent::__construct(false, $companyID);
    }
    
    public function setDomainID( $domainID ) {
        $this->domainID = $domainID;
    }
    
    public function getDomainID() {
        return $this->domainID;
    }
    
    public function set($routeID, $lang, $url, $name = NULL){
        $response = false;
        $actID = $this->exist($routeID, $lang);
        if( intval($actID) > 0 ){
            
            // Aktualizacja
            $updated = 0;
            if( $name ){
                $updated += intval($this->update($actID, 'name', $name));
            }
            $updated += intval($this->update($actID, 'url', $url));
            
            if( $updated > 0 ){
                $response = true;
            }
               
            
        } else {
            //$params['name'] = $name;
            $params['url'] = $this->UrlMaker->permalink($url);
            $params['lang'] = $lang;
            $params['routeID'] = $routeID;
            $params['domainID'] = $this->getDomainID();
            $params['name'] = $name;
            $actID = $this->create($params);
            if( intval($actID) > 0 ){
                $response = true;
            }
        }
        return $response;
    }
    
    public function setName($routeID, $lang, $name){
        $response = false;
        $actID = $this->exist($routeID, $lang);
        
        if( intval($actID) > 0 ){

            $updated = 0;

            $updated += intval($this->update($actID, 'name', $name));
            
            if( $updated > 0 ){
                $response = true;
            }
               
            
        }
        return $response;
    }
    
    public function exist($routeID, $lang){
        $query = 'SELECT `ID` FROM `'.$this->getTableName().'` WHERE routeID = :routeID AND '
                . ' lang = :lang AND domainID = :domainID ';
        
        $binds['routeID'] = $routeID;
        $binds['lang'] = $lang;
        $binds['domainID'] = $this->getDomainID();
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }
    
    public function getCategoryBySlug( $url ){
        $query = 'SELECT `categoryID` FROM `'.$this->getTableName().'` WHERE url = :url '
                . ' AND domainID = :domainID ';
        
        $binds['url'] = $url;
        $binds['domainID'] = $this->getDomainID();
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }
    
    public function urlExist( $url )
    {
        $query = 'SELECT `routeID` FROM `'.$this->getTableName().'` WHERE url = :url '
                . ' AND domainID = :domainID ';
        $binds['url'] = $url;
        $binds['domainID'] = $this->getDomainID();
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }
    
    public function deleteList( $list ){
        if( empty($list) ){
            return false;
        }
        $query='DELETE FROM `'.$this->getTableName().'` WHERE `ID` IN ('.  implode(',', $list).') ';
        
        if (!$this->db->exec($query)) {
              return false;
        }
        
        return true;
    }
    
    public function customGetByList($list){
        if( empty($list) ){
            return false;
        }
        $query = 'SELECT * FROM `'.$this->getTableName().'` WHERE routeID IN (' . implode(',', $list) . ') ';
        
        if( !$this->db->exec( $query ) ) {
            return false;
        }
        $res = $this->db->getAll();
        if( !$res ){
            return false;
        }
        $result = array();
        foreach ($res as $row){
            $result[ $row['routeID'] ][ $row['lang'] ] = $row;
        }
        return $result;
    }

    /**
     * @param $state
     * @param null $lang
     * @return bool
     */
    public function getByRoute($state, $lang = NULL)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.* FROM `' . $this->getTableName() . '` 
        LEFT JOIN `' . $this->routes . '` ON `' . $this->routes . '`.ID = `' . $this->getTableName() . '`.routeID
        WHERE `' . $this->routes . '`.`state` = :state 
         AND `' . $this->getTableName() . '`.`lang` = :lang AND `' . $this->routes . '`.domainID = :domainID ';

        $binds['state'] = $state;
        if (!$lang) {
            $binds['lang'] = lang;
        } else {
            $binds['lang'] = $lang;
        }
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getRow();
    }

    /**
     * @param $state
     * @param null $lang
     * @return bool
     */
    public function getAllByRoute($state, $lang = NULL)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.* FROM `' . $this->getTableName() . '` 
        LEFT JOIN `' . $this->routes . '` ON `' . $this->routes . '`.ID = `' . $this->getTableName() . '`.routeID
        WHERE `' . $this->routes . '`.`state` = :state AND `' . $this->getTableName() . '`.`lang` = :lang ';

        $binds['state'] = $state;
        if (!$lang) {
            $binds['lang'] = lang;
        } else {
            $binds['lang'] = $lang;
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

}
