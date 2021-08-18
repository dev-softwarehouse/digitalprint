<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigWorkspace;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrintTypeWorkspace;

/**
 * Class WorkspacesController
 */
class WorkspacesController extends Controller {

    /**
     * @var array
     */
    public $useModels = array();


    /**
     * @var PrintShopConfigWorkspace
     */
    protected $PrintShopConfigWorkspace;
    /**
     * @var PrintShopConfigPrintTypeWorkspace
     */
    private $PrintShopConfigPrintTypeWorkspace;

    /**
     * WorkspacesController constructor.
     * @param $params
     */
    public function __construct ($params ) {
        parent::__construct($params);
        $this->PrintShopConfigWorkspace = PrintShopConfigWorkspace::getInstance();
        $this->PrintShopConfigPrintTypeWorkspace = PrintShopConfigPrintTypeWorkspace::getInstance();
    }

    /**
     * @param null $ID
     * @return array
     */
    public function workspace($ID = NULL ){
        
        if( intval($ID) > 0 ){
            $data = $this->PrintShopConfigWorkspace->get('ID', $ID);
        } else {
            $data = $this->PrintShopConfigWorkspace->getAll();
        }
        if(empty($data)){
            $data = array();
        }
        return $data;
        
    }

    /**
     * @return mixed
     */
    public function post_workspace(){
        $name = $this->Data->getPost('name');
        $width = $this->Data->getPost('width');
        $height = $this->Data->getPost('height');
        $paperWidth = $this->Data->getPost('paperWidth');
        $paperHeight = $this->Data->getPost('paperHeight');
        $type = $this->Data->getPost('type');
        if( $name && $width && $height && $type && $paperWidth && $paperHeight) {

            $lastID = $this->PrintShopConfigWorkspace->create(
                compact('name', 'paperWidth', 'paperHeight', 'width', 'height')
            );
            $return = $this->PrintShopConfigWorkspace->get('ID', $lastID);
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
     * @return mixed
     */
    public function put_workspace(){
        $post = $this->Data->getAllPost();
        if( isset($post['ID']) && !empty($post['ID']) ){
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }
        $res = $this->PrintShopConfigWorkspace->customUpdate($ID, $post['name'],
            $post['paperWidth'], $post['paperHeight'],
            $post['width'], $post['height'], $post['type'] );
        if( $res ){
            $return['response'] = true;
        } else {
            $return['response'] = false;
        }
        return $return;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_workspace($ID ){
        
        $data['ID'] = $ID;
        if( intval($ID) > 0 ){
            $this->PrintShopConfigWorkspace->delete('ID',$ID);
            $data['response'] = true;
            return $data;
        } else {
            header("HTTP/1.0 403 Forbidden");
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @param $printTypeID
     * @return array
     */
    public function getByPrintType($printTypeID)
    {
        $data = $this->PrintShopConfigPrintTypeWorkspace->getByPrintTypeID($printTypeID);

        if( !$data ) {
            return array();
        }

        return $data;
    }
}
