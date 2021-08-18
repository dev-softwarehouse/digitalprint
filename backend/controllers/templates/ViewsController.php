<?php

/**
 * Description of ViewsController
 *
 * @author Rafał
 */

use DreamSoft\Controllers\Components\RouteAssistant;
use DreamSoft\Controllers\Components\Standard;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Route\Route;
use DreamSoft\Models\Template\View;
use DreamSoft\Models\Template\ViewOrder;
use DreamSoft\Models\Template\ViewVariable;
use DreamSoft\Models\Template\ViewVariableLang;

class ViewsController extends Controller {
    
    public $useModels = array();

    /**
     * @var View
     */
    protected $View;
    /**
     * @var ViewVariable
     */
    protected $ViewVariable;
    /**
     * @var ViewVariableLang
     */
    protected $ViewVariableLang;
    /**
     * @var Route
     */
    protected $Route;
    /**
     * @var ViewOrder
     */
    protected $ViewOrder;
    /**
     * @var Standard
     */
    protected $Standard;
    /**
     * @var RouteAssistant
     */
    private $RouteAssistant;

    /**
     * @constructor
     * @param array $params
     */
    public function __construct ($params) {
        parent::__construct($params);
        $this->Standard = Standard::getInstance();
        $this->View = View::getInstance();
        $this->ViewVariable = ViewVariable::getInstance();
        $this->ViewVariableLang = ViewVariableLang::getInstance();
        $this->Route = Route::getInstance();
        $this->ViewOrder = ViewOrder::getInstance();
        $this->RouteAssistant = RouteAssistant::getInstance();
    }

    /**
     * @param int $domainID
     */
    public function setDomainID( $domainID ){
        parent::setDomainID($domainID);
        $this->Route->setDomainID( $domainID );
        $this->RouteAssistant->setDomainID($domainID);
    }

    /**
     * @return array
     */
    public function post_index()
    {
        $name = $this->Data->getPost('name');
        $replaceID = $this->Data->getPost('replaceID');
        $routeID = $this->Data->getPost('routeID');
        $templateID = $this->Data->getPost('templateID');
        $isMain = $this->Data->getPost('isMain');
        $controller = $this->Data->getPost('controller');
        $parentViewID = $this->Data->getPost('parentViewID');
        $templateRoot = $this->Data->getPost('templateRoot');

        if (!$isMain) {
            $isMain = 0;
        }

        if (!$replaceID) {
            $replaceID = 0;
        }

        if (!$parentViewID) {
            $parentViewID = NULL;
        }

        if( !$templateRoot ) {
            $templateRoot = 1;
        }

        $return['response'] = false;
        if ($name && $routeID) {
            $lastID = $this->View->create(compact('name', 'routeID', 'replaceID', 'templateRoot', 'templateID', 'isMain', 'controller', 'parentViewID'));
            if ($lastID > 0) {
                $newOrder = $this->ViewOrder->getMax($routeID);
                $newOrder++;
                $voParams = array('viewID' => $lastID, 'routeID' => $routeID, 'order' => $newOrder);
                $this->ViewOrder->create($voParams);
                $return['item'] = $this->View->get('ID', $lastID);
                $return['response'] = true;
            }
        } else {
            $return = $this->sendFailResponse('01');
        }

        return $return;
    }
    
    public function put_index() {
        $post = $this->Data->getAllPost();

        $goodKeys = array('routeID', 'name','replaceID','templateID', 'templateRoot','isMain','controller','parentViewID');
        
        if( isset($post['ID']) && !empty($post['ID']) ){
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            return $this->sendFailResponse('04');
        }
        
        if( intval($post['replaceID']) ){
            $replaceOne = $this->View->get( 'ID', $post['replaceID']);
            $post['name'] = $replaceOne['name'];
        }
        
        foreach( $post as $key => $value ){
            if( !in_array($key, $goodKeys) ){
                continue;
            }
            $this->View->update($ID, $key, $value);
        }

        $existOrderID = $this->ViewOrder->exist( $post['routeID'], $ID );
        
        if( !$existOrderID ){
            $newOrder = $this->ViewOrder->getMax( $post['routeID'] );
            $newOrder++;
            $voParams = array('viewID' => $ID, 'routeID' => $post['routeID'], 'order' => $newOrder );
            $this->ViewOrder->create( $voParams );
        }

        $item = $this->View->get('ID', $ID);

        $item['own'] = false;
        if($item['templateRoot'] == 2){
            $item['own'] = true;
        }

        $return['item'] = $item;
        $return['response'] = true;
        $this->RouteAssistant->generateRoutesFile();
        return $return;
    }

    /**
     * @param array $views
     * @return array
     */
    public function foldViews(array $views)
    {
        $allViews = array();

        while (!empty($views)) {
            foreach ($views as $key => $row) {
                if (!$row['parentViewID']) {
                    $allViews[$row['ID']] = $row;
                    unset($views[$key]);
                } else {

                    if (isset($allViews[$row['parentViewID']])) {
                        $allViews[$row['parentViewID']]['childs'][] = $row;
                        unset($views[$key]);
                    } else {
                        unset($views[$key]);
                    }

                }
            }
        }

        if( empty($allViews) ) {
            return array();
        }

        $result = array();
        foreach ($allViews as $row) {
            $result[$row['routeID']][] = $row;
        }

        return $result;
    }

    /**
     * @param null $params
     * @return array
     */
    public function index( $params = NULL )
    {
        
        $routeID = $params['routeID'];
        if( isset($params['replaceID']) ){
            $replaceID = $params['replaceID'];
        } else {
            $replaceID = NULL;
        }
        
        $one = $this->Route->get('ID', $routeID);

        $parentRoutes = $this->Route->getParents($one['lft'], $one['rgt'], 'DESC');
        $parentRouteArr = array();
        foreach($parentRoutes as $pr){
            $parentRouteArr[] = $pr['ID'];
        }
        
        $mainViews = $this->View->getByRouteList( $parentRouteArr );
        
        if( !empty($mainViews) ){
            foreach($mainViews as $keyMv => $mv){
                if( !intval($mv['isMain']) ) {
                    unset( $mainViews[$keyMv] );
                } else {
                    $mainViews[$keyMv]['fromParent'] = 1;
                }
            }
        }
        
        $list = $this->View->getByRoute( $routeID, $replaceID );

        if( !$list ) {
            $list = array();
        }

        $replaceList = array();
        foreach ($list as $key => $row) {

            $list[$key]['own'] = false;
            if( $row['templateRoot'] == 2 ) {
                $list[$key]['own'] = true;
            }

            if( intval($row['replaceID']) ){
                $replaceList[] = $row['replaceID'];
            }
        }

        if( $mainViews && is_array($mainViews) ) {
            foreach($mainViews as $mvKey => $mv){
                if( in_array($mv['ID'], $replaceList) ){
                    unset( $mainViews[$mvKey] );
                }
            }
        }
        
        $actViews = $this->foldViews($list);
        
        if( !isset($actViews[$routeID]) || !is_array($actViews[$routeID]) ){
            $actViews[$routeID] = array();
        }
        if( !$mainViews ){
            $mainViews = array();
        }

        $result = array_merge($actViews[$routeID], $mainViews);
        
        if( empty($result) ){
            $result = array();
        }
        return $result;
    }
    
    public function delete_index( $ID ){
        $data['response'] = false;
        if( intval($ID) == 0 ){
            return $this->sendFailResponse('04');
        }
        $item = $this->View->get('ID', $ID);
        if( $item && intval($item['replaceID']) ){
            $data['replaceItem'] = $this->View->get('replaceID', $item['replaceID']);
        }
        
        if( $this->View->delete( 'ID', $ID ) ){
            $data['removeOrder'] = $this->ViewOrder->delete( $item['routeID'], $item['viewID'] );
            if( $this->ViewVariable->delete( 'viewID', $ID ) ){
                $this->ViewVariableLang->delete( 'variableID', $ID  );
                $data['response'] = true;
                $data['item'] = $item;
            }
        }
        return $data;
    }
    
    public function patch_sort() {
        $post = $this->Data->getAllPost();
        
        $routeID = $post['routeID'];
        $sortArr = $post['orders'];
        
        $result = $this->ViewOrder->sort($routeID, $sortArr);
        $data['response'] = $result;
        return $data;
    }
    
    public function variables( $params = NULL ){
        
        $viewID = NULL;
        if( isset($params['viewID']) ){
            $viewID = $params['viewID'];
        }
        
        
        $list = $this->ViewVariable->getAll( $viewID );
        
        if( empty($list) ){
            $list = array();
        }
        $listArr = array();
        foreach ($list as $key => $value) {
            $listArr[] = $value['ID'];
        }
        
        $langList = $this->ViewVariableLang->getByList( $listArr );
        
        if( !empty($langList) ){
            foreach ($list as $key => $value) {
                $list[$key]['langs'] = $langList[ $value['ID'] ];
            }
        }
        
        return $list;
        
    }
    
    public function post_variables(  ){
        
        $return['response'] = false;
        $viewID = $this->Data->getPost('viewID');
        $name = $this->Data->getPost('name');
        $function = $this->Data->getPost('function');
        $langs = $this->Data->getPost('langs');
        if( !is_array($langs) ){
            $langs = json_decode($langs, true);
        }
        $created = date('Y-m-d H:i:s');
        
        if( $name && $function && $viewID ) {
            $lastID = $this->ViewVariable->create( compact('name', 'function','created', 'viewID') );
            $langUpdated = 0;
            if( !empty($langs) ){
                foreach ($langs as $lang => $desc) {
                    $langUpdated += intval( $this->ViewVariableLang->set($lastID, $lang, $desc) );
                }
            }
            $row = $this->ViewVariable->get('ID', $lastID);
            $row['langs'] = $this->ViewVariableLang->getByVariable( $lastID );
            $return['response'] = true;
            $return['item'] = $row;
            $return['langUpdated'] = $langUpdated;
            return $return;
        } else {
            return $this->sendFailResponse('01');
        }
        
        return $return;
        
    }
    
    public function put_variables(  ){
        
        $return['response'] = false;
        $ID = $this->Data->getPost('ID');
        $name = $this->Data->getPost('name');
        $function = $this->Data->getPost('function');
        $langs = $this->Data->getPost('langs');
        if( !is_array($langs) ){
            $langs = json_decode($langs, true);
        }
        $updated = 0;
        if( $name || $function ){
            $updated += intval($this->ViewVariable->update($ID, 'name', $name));
            $updated += intval($this->ViewVariable->update($ID, 'function', $function));
            
            if( $updated > 0 ) {
                
                $langUpdated = 0;
                if( !empty($langs) ){
                    foreach ($langs as $lang => $desc) {
                        $langUpdated += intval( $this->ViewVariableLang->set($ID, $lang, $desc) );
                    }
                }
                
                $return['response'] = true;
                $return['langUpdated'] = $langUpdated;
                
            } else {
            
                return $this->sendFailResponse('10');
                
            }
            
        } else {
            return $this->sendFailResponse('01');
        }
        
        return $return;
    }
    
    /*
     * Usuń zmienną
     * @method delete_variables
     * @param {Integer} ID
     * 
     * @return {Array}
     */
    public function delete_variables( $ID ) {
        
        $data['response'] = false;
        if( intval($ID) == 0 ){
            return $this->sendFailResponse('04');
        }
        if( $this->ViewVariable->delete( 'ID',$ID ) ){
            $this->ViewVariableLang->delete( 'variableID', $ID  );
            $data['response'] = true;
        }
        return $data;
    }
    
    public function mainVariables( $routeID ){

        $one = $this->Route->get('ID', $routeID);
        
        $parentRoutes = $this->Route->getParents($one['lft'], $one['rgt'], 'DESC');

        $parentRouteArr = array();
        foreach($parentRoutes as $pr){
        
            $parentRouteArr[] = $pr['ID'];
            
        }

        $mainViews = $this->View->getByRouteList( $parentRouteArr );
        
        
        return $mainViews;
    }

    public function masks() {
        $dir = STATIC_PATH . companyID . '/' . 'masks/';
        $files = scandir($dir);
        if(empty($files)) {
            return array();
        }

        $masks = array();

        foreach ($files as $file) {
            $ext = end(explode('.',$file));
            if( $file !== '.' && $file !== '..' && $ext == 'png' ) {
                $masks[] = STATIC_URL . companyID . '/'. 'masks/' . $file;
            }
        }

        return $masks;
    }

    public function createMask($params) {
        $photoUrl = rawurldecode($params['photoUrl']);
        $maskUrl = rawurldecode($params['maskUrl']);

        $source = new Imagick($photoUrl);
        $mask = new Imagick($maskUrl);


        $mask->thumbnailImage($source->getImageWidth(), $source->getImageHeight());
        $mask->setImageMatte(false);

        $source->compositeImage($mask, Imagick::COMPOSITE_COPYOPACITY, 0, 0);

        $source->setImageFormat('png');

        header( "Content-type: image/png");
        echo $source;
        exit();
    }
}
