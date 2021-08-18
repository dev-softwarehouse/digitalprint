<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\RealizationTime\WorkTime;

/**
 * Description of WorkTimesController
 *
 * @author Rafał
 * @class WorkTimesController
 */
class WorkTimesController extends Controller {

    public $useModels = array();
    
    protected $WorkTime;
    
    /**
     * @constructor
     * @param {Array} $params
     */
    public function __construct ($params) {
        parent::__construct($params);
        $this->WorkTime = WorkTime::getInstance();
    }

    /**
     * @param $operatorID
     * @return array
     */
    public function index($operatorID){
        
        $data = $this->WorkTime->getList($operatorID);
        if( empty($data) ){
            $data = array();
        } else {
            foreach( $data as $key => $val ){
                $data[$key]['timestamp'] = strtotime($val['date']);
            }
        }
        return $data;
    }

    /**
     * @param $operatorID
     * @return array
     */
    public function patch_index($operatorID) {
        $response = false;
        $state = $this->Data->getPost('state');
        
        if( !$operatorID ){
            $userInfo = $this->Auth->getLoggedUser();
            $operatorID = $userInfo['ID'];
        }
        
        $last = $this->WorkTime->getLast($operatorID);
        if( $last['operatorID'] != $operatorID ){
            return $this->sendFailResponse( '07', 'Operator się nie zgadza z ostatnim wpisem.' );
        }
        if( $last['state'] == 1 && $state != 2 ){
            return $this->sendFailResponse( '07', 'Musisz zakończyć poprzednie logowanie.' );
        }
        $created = false;
        $updated = false;
        if($last['state'] == 2 && $state == 1){
            $date = date('Y-m-d H:i:s'); 
            $lastCreated = $this->WorkTime->create(compact('operatorID', 'date', 'state') );
            if( $lastCreated > 0 ){
                $created = true;
            }
        }
        if( $last['state'] == 1 && $state == 2 ){
            $updated = $this->WorkTime->update($last['ID'], 'state', $state);
        }
        if( $created || $updated ){
            $response = true;
            return compact( 'response','created','updated' );
        } else {
            return $this->sendFailResponse( '03' );
        }
    }
    
    public function last($operatorID) {
        
        $data = $this->WorkTime->getLast($operatorID);
        if( empty($data) ){
            $data = array();
        } else {
            $data['timestamp'] = strtotime($data['date']);
        }
        return $data;
        
    }
}
