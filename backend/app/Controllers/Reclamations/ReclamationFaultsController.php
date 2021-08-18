<?php
/**
 * Programmer Rafał Leśniak - 31.8.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 31-08-2017
 * Time: 11:12
 */

namespace DreamSoft\Controllers\Reclamations;

use DreamSoft\Core\Controller;
use DreamSoft\Models\Reclamation\ReclamationFault;
use DreamSoft\Models\Reclamation\ReclamationFaultDescription;

class ReclamationFaultsController extends Controller
{
    /**
     * @var ReclamationFault
     */
    protected $ReclamationFault;
    /**
     * @var ReclamationFaultDescription
     */
    protected $ReclamationFaultDescription;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->ReclamationFault = ReclamationFault::getInstance();
        $this->ReclamationFaultDescription = ReclamationFaultDescription::getInstance();
    }

    /**
     * @return array
     */
    public function faults()
    {

        $data = $this->ReclamationFault->getAll();
        if( empty($data) ) {
            $data = array();
        }

        return $data;

    }

    /**
     * @return array
     */
    public function post_faults()
    {
        $post = $this->Data->getAllPost();

        if( !$post['key'] || !$post['descriptions'] ) {
            return $this->sendFailResponse('01');
        }

        $key = $post['key'];
        $faultID = $this->ReclamationFault->create(compact('key'));

        $savedDescriptions = 0;
        if( $faultID ) {
            foreach ($post['descriptions'] as $lang => $description) {
                $params = array();
                $params['faultID'] = $faultID;
                $params['lang'] = $lang;
                $params['description'] = $description;
                $lastFaultDescriptionID = $this->ReclamationFaultDescription->create($params);
                if( $lastFaultDescriptionID > 0 ) {
                    $savedDescriptions++;
                }
            }

            $item = $this->ReclamationFault->getOne($faultID);

            return array('response' => true, 'item' => $item, 'savedDescriptions' => $savedDescriptions);
        }

        return $this->sendFailResponse('03');

    }

    /**
     * @param int $faultID
     * @return array
     */
    public function delete_faults( $faultID )
    {
        $one = $this->ReclamationFault->getOne($faultID);
        if( !$one ) {
            $this->sendFailResponse('06');
        }

        if( $this->ReclamationFault->delete('ID', $faultID) ) {
            $this->ReclamationFaultDescription->delete('faultID', $faultID);
            return array('response' => true, 'item' => $one);
        }

        return $this->sendFailResponse('05');
    }

    /**
     * @param $faultID
     * @return array
     */
    public function put_faults($faultID)
    {
        if (!$faultID) {
            $faultID = $this->Data->getPost('ID');
        }

        if (!$faultID) {
            $data = $this->sendFailResponse('04');
            return $data;
        }



        $key = $this->Data->getPost('key');
        $post = $this->Data->getAllPost();

        $descriptions = $post['descriptions'];


        $saved = 0;
        $savedDescriptions = 0;
        $updatedDescriptions = 0;

        if ($faultID > 0) {
            $saved += intval($this->ReclamationFault->update($faultID, 'key', $key));

            foreach ($descriptions as $lang => $description) {
                $existID = $this->ReclamationFaultDescription->checkExist($faultID, $lang);
                if( !$existID ) {
                    $params = array();
                    $params['faultID'] = $faultID;
                    $params['lang'] = $lang;
                    $params['description'] = $description['name'];
                    $lastFaultDescriptionID = $this->ReclamationFaultDescription->create($params);
                    if( $lastFaultDescriptionID > 0 ) {
                        $savedDescriptions++;
                    }
                } else {
                    if( $this->ReclamationFaultDescription->update($existID, 'description', $description['name']) ) {
                        $updatedDescriptions++;
                    }
                }
            }
        }

        if ( $saved > 0) {
            $item = $this->ReclamationFault->getOne($faultID);
            return array(
                'saved' => $saved,
                'response' => true,
                'item' => $item,
                'updatedDescriptions' => $updatedDescriptions,
                'savedDescriptions' => $savedDescriptions,
                'faultID' => $faultID
            );
        }

        $data = $this->sendFailResponse('03');
        return $data;
    }
}