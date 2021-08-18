<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopUser\UserFile;

/**
 * Description of UserFilesController
 *
 * @author Rafał
 * @class UserFilesController
 */
class UserFilesController extends Controller {
    
    public $useModels = array();

    /**
     * @var UserFile
     */
    protected $UserFile;

    /**
     * @param $orderID
     * @return array
     */
    public function index($orderID) {
        if( $orderID ){
            $data = $this->UserFile->getByOrder($orderID);
        }
        if( empty($data) ){
            $data = array();
        }
        return $data;
    }

    /**
     * @param $orderID
     * @param $fileID
     * @return array
     */
    public function patch_index($orderID, $fileID) {
        $goodFields = array('accept');
        $post = $this->Data->getAllPost();
        $data['response'] = false;
        
        $count = count($post);
        if( !empty($post) ){
            $saved = 0;
            foreach($post as $key => $value){
                if( in_array($key, $goodFields) ){
                    $saved = intval($this->UD->update($fileID, $key, $value));
                }
            }
            if( $saved == $count ){
                $data['response'] = true;
                $data['info'] = 'Zapisano: '.$count.' pól.';
            } else {
                $data = $this->sendFailResponse('03');
            }
        } else {
            $data = $this->sendFailResponse('01');
        }
        return $data;
    }
}
