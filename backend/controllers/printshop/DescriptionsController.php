<?php

use DreamSoft\Models\PrintShopProduct\PrintShopProductDescBox;
use DreamSoft\Core\Controller;

/**
 * Description of DescriptionsController
 * @class Descriptions
 * @author Rafał
 */
class DescriptionsController extends Controller {
    public $useModels = array();
    
    protected $PrintShopProductDescBox;

    /**
     * @constructor
     * @param {Array} $params
     */
    public function __construct ( $params ) {
        parent::__construct($params);
        $this->PrintShopProductDescBox = PrintShopProductDescBox::getInstance();
    }
    
    /**
     * 
     * @param {Integer} $ID
     * @return {Array}
     * @example URL /ps_descriptions GET
     */
    public function desc( $ID = NULL ){
        if( intval($ID) > 0 ){
            $data = $this->PrintShopProductDescBox->get('ID',$ID);
        } else {
            $data = $this->PrintShopProductDescBox->getAll();
        }
        if(empty($data)){
            $data = array();
        }
        return $data;
    }
    
    /*
     * Dodaj opis
     * 
     * @method post_desc
     * @param {Integer} $groupID ID grupy z POST (wymagane)
     * @param {Integer} $typeID ID typu z POST
     * @param {Integer} $formatID ID formatu z POST
     * @param {String} $name nazwa na pasek acordiona
     * @param {String} $description opis
     * @return {Array}
     * @example URL /ps_descriptions POST
     */
    public function post_desc(){
        $typeID = $this->Data->getPost('typeID');
        $groupID = $this->Data->getPost('groupID');
        $formatID = $this->Data->getPost('groupID');
        $name = $this->Data->getPost('name');
        $description = $this->Data->getPost('description');
        
        if( $name && $groupID && $description ){
            $lastID = $this->PrintShopProductDescBox->create(compact('groupID','typeID', 'formatID', 'name', 'description') );
            $return = $this->PrintShopProductDescBox->get('ID',$lastID);
            if(!$return){
                $return['response'] = false;
            }
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }
    
    /**
     * Edycja opisu
     * 
     * @method put_desc
     * @param {Integer} $ID z POST
     * @param {String} $name z POST
     * @param {String} $description z POST
     * @return {Array}
     * @example URL /ps_descriptions PUT
     */
    public function put_adminProjects( ) {
        $name = $this->Data->getPost('name');
        $description = $this->Data->getPost('description');
        $ID = $this->Data->getPost('ID');
        
        if( intval($ID) == 0 ){
            $data['response'] = false;
            return $data;
        }
        
        if($name){
            $this->PrintShopProductDescBox->update( $ID, 'name', $name );
        }
        if( $description ){
            $this->PrintShopProductDescBox->update( $ID, 'description', $description );
        }
        
        $data['response'] = true;
        return $data;
    }
    
    public function delete_adminProjects( $ID ){
        if( strlen($ID) == 0 ){
            $data['response'] = false;
            return $data;
        }
        $this->AP->delete( 'ID',$ID );
        $data['response'] = true;
        return $data;
    }
    
    
}
