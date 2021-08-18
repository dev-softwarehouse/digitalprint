<?php
/*
 * Kontroler dla walut głównych programu
 */

use DreamSoft\Core\Controller;
use DreamSoft\Models\Currency\CurrencyRoot;

class CurrencyRootController extends Controller {
    
    public $useModels = array('CurrencyRoot');
    
    protected $CurrencyRoot;
    
    public function __construct ($params) {
        parent::__construct($params);
        $this->CurrencyRoot = CurrencyRoot::getInstance();
    }
    
    /*
     * Pobierz listę tekstów językowych
     * Pola zwracane: 
     * @return array
     */
    public function index(){
        $langList = $this->CurrencyRoot->getAll();
        return $langList;
    }
    
    public function post_index(){
        $code = $this->Data->getPost('code');
        $name = $this->Data->getPost('name');
        $active = $this->Data->getPost('active');
        if( $code && $name ) {
            if( $active ){
                $active = 1;
            }
            $params = array( 'code' => $code, 
                             'name' => $name, 
                             'active' => $active); 
            $lastID = $this->CurrencyRoot->create( $params );
            if($lastID > 0){
                $return = $this->CurrencyRoot->get('ID', $lastID);
            }
            if(!$return){
                $return = $this->sendFailResponse('03');
            }
            return $return;
        } else {
            $return = $this->sendFailResponse('02');
            return $return;
        }
    }
    
    public function put_index() {
        $code = $this->Data->getPost('code');
        $name = $this->Data->getPost('name');
        $active = $this->Data->getPost('active');
        $ID = $this->Data->getPost('ID');
        //$goodKeys = array('key', 'lang', 'value');
        if( !$ID ){
            $return = $this->sendFailResponse('04');
            return $return;
        }
        
        $res = false;
        
        if($code){
            if( $this->CurrencyRoot->update( $ID, 'code', $code ) ){
                $res = true;
            }
        }
        
        if($name){
            if( $this->CurrencyRoot->update( $ID, 'name', $name ) ){
                $res = true;
            }
        }
        
        if($active){
            if( $this->CurrencyRoot->update( $ID, 'active', $active ) ){
                $res = true;
            }
        }
        
        if( $res ){
            $return['response'] = true;
            return $return;
        } else {
            $return = $this->sendFailResponse('03');
            return $return;
        }
        
    }
    
    public function delete_index( $ID ){
        $data['ID'] = $ID;
        if( intval($ID) > 0 ){
            if( $this->CurrencyRoot->delete( 'ID' ,$ID ) ){
                $data['response'] = true;
                return $data;
            } else {
                $data = $this->sendFailResponse('03');
                return $data;
            }
            
        } else {
            $data = $this->sendFailResponse('04');
            return $data;
        }
    }
}
