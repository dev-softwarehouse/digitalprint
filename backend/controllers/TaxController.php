<?php

use DreamSoft\Models\PrintShopProduct\PrintShopTypeTax;
use DreamSoft\Models\Tax\Tax;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Setting\Setting;

/**
 * Class TaxController
 */
class TaxController extends Controller {

    /**
     * @var array
     */
    public $useModels = array();

    /**
     * @var Tax
     */
    protected $Tax;
    /**
     * @var Setting
     */
    protected $Setting;
    /**
     * @var PrintShopTypeTax
     */
    protected $PrintShopTypeTax;


    /**
     * TaxController constructor.
     * @param $params
     */
    public function __construct ($params) {
        parent::__construct($params);
        $this->Tax = Tax::getInstance();
        $this->Setting = Setting::getInstance();
        $this->PrintShopTypeTax = PrintShopTypeTax::getInstance();
        $this->Setting->setModule('general');
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID ) {
        $this->Tax->setDomainID( $domainID );
        $this->Setting->setDomainID( $domainID );
        $this->PrintShopTypeTax->setDomainID($domainID);
    }


    /**
     * @param null $ID
     * @return array|bool
     */
    public function index($ID = NULL ){
        
        if( strlen($ID) > 0 ){
            $data = $this->Tax->customGet($ID);
            if( $this->Setting->getValue('defaultTax') == $data['ID'] ){
                $data['default'] = 1;
            } else {
                $data['default'] = 0;
            }
        } else {
            $data = $this->Tax->getAll();
            foreach($data as $key => $val){
                if( $this->Setting->getValue('defaultTax') == $val['ID'] ){
                    $val['default'] = 1;
                } else {
                    $val['default'] = 0;
                }
                $data[$key] = $val;
            }
        }
        return $data;
    }


    /**
     * @return bool
     */
    public function post_index(){
        $name = $this->Data->getPost('name');
        $value = $this->Data->getPost('value');
        
        if( $name && is_numeric($value) ) {
            $params = array('name' => $name, 'value' => $value, 'domainID' => $this->Tax->getDomainID() );
            $lastID = $this->Tax->create( $params );
            
            if( intval($lastID) > 0 ){
                $return = $this->Tax->get('ID', $lastID);
            } else {
                $return['response'] = false;
            }
            
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }


    /**
     * @return mixed
     */
    public function put_index(){
        $name = $this->Data->getPost('name');
        $value = $this->Data->getPost('value');
        $active = $this->Data->getPost('active');
        $ID = $this->Data->getPost('ID');
        $default = $this->Data->getPost('default');
        
        if( intval($ID) == 0 ){
            header("HTTP/1.0 403 Forbidden");
            $data['success'] = false;
            return $data;
        }
        
        if($name){
            $this->Tax->update( $ID, 'name', $name );
        }
        if($value){
            $this->Tax->update( $ID, 'value', $value );
        }
        if($active !== NULL){
            $this->Tax->update( $ID, 'active', $active );
        }
        if( $default && intval($default) == 1 ){
            $this->Setting->set('defaultTax', $ID);
        }
        $data['response'] = true;
        return $data;
    }


    /**
     * @param $ID
     * @return mixed
     */
    public function delete_index($ID ){
        
        if( $this->Setting->getValue('defaultTax') == $ID ){
            $data['warning_key'] = 'used_as_default_tax';
            $data['warning'] = 'Ten wpis jest używany w programie jako domyślny dla tej domeny.';
        }
        
        if( strlen($ID) == 0 ){
            $data['response'] = false;
            return $data;
        }
        $this->Tax->delete( 'ID',$ID );
        $data['response'] = true;
        return $data;
    }

    /**
     * @param $params
     * @return array|bool
     */
    public function getBy($params ){
        if( isset($params['typeID']) && !empty($params['typeID']) ){
            $selected = $this->PrintShopTypeTax->getByType($params['typeID']);
        } elseif( isset($params['groupID']) && !empty($params['groupID']) ) {
            $selected = $this->PrintShopTypeTax->getByGroup($params['groupID']);
        } else {
            $selected = array();
        }
        $data = $this->Tax->getAll();
        
        foreach($data as $key => $val){
            
            if( is_array($selected) &&  in_array($val['ID'], $selected) ){
                $val['selected'] = 1;
            } else {
                $val['selected'] = 0;
            }
            
            if( $this->Setting->getValue('defaultTax') == $val['ID'] ){
                $val['default'] = 1;
            } else {
                $val['default'] = 0;
            }
            $data[$key] = $val;
        }
        
        return $data;
    }

    /**
     * @param $params
     * @return array
     */
    public function taxForProduct($params ){
        $selected = array();
        
        if( isset($params['typeID']) && !empty($params['typeID']) ){
            $selected = $this->PrintShopTypeTax->getByType($params['typeID']);
        }
        
        if( empty($selected) && isset($params['groupID']) && !empty($params['groupID']) ) {
            $selected = $this->PrintShopTypeTax->getByGroup($params['groupID']);
        }
        
        $data = array();
        if( $selected ) {
            foreach ($selected as $key => $taxID) {
                $one = $this->Tax->customGet($taxID,1);
                if( $this->Setting->getValue('defaultTax') == $taxID ){
                    $one['default'] = 1;
                }
                $data[] = $one;
            }
        }/* else {
            $defaultTaxId = $this->Setting->getValue('defaultTax');
            if($defaultTaxId) {
                $data[] = $this->Tax->customGet($defaultTaxId,1);
            }
        }*/
        
        return $data;
    }
}
