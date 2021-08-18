<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopProduct\PrintShopPreFlight;

/**
 * Description of PreFlightController
 *
 * @class PreFlightController
 */
class PreFlightController extends Controller
{

    /**
     * @var array
     */
    public $useModels = array();

    /**
     * @var PrintShopPreFlight
     */
    protected $PrintShopPreFlight;

    /**
     *
     * @constructor
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopPreFlight = PrintShopPreFlight::getInstance();
    }

    /**
     * @param null $params
     * @return array|bool|mixed
     */
    public function index($params = NULL)
    {

        if (isset($params['ID']) && intval($params['ID']) > 0) {
            $ID = $params['ID'];
        }

        if (isset($params['formatID']) && intval($params['formatID']) > 0) {
            $formatID = $params['formatID'];
        }

        if (intval($ID) > 0) {
            $data = $this->PrintShopPreFlight->get('ID', $ID);
        } elseif (intval($formatID) > 0) {
            $data = $this->PrintShopPreFlight->getByFormat($formatID);
        } else {
            $data = $this->PrintShopPreFlight->getAll();
        }

        if (empty($data)) {
            $data = array();
        }

        return $data;

    }

    /**
     * @return mixed
     */
    public function post_index()
    {

        $formatID = $this->Data->getPost('formatID');
        $name = $this->Data->getPost('name');
        $folderName = $this->Data->getPost('folderName');

        if ($formatID && $name && $folderName) {
            $lastID = $this->PrintShopPreFlight->create(compact('formatID', 'name', 'folderName'));
            $return['item'] = $this->PrintShopPreFlight->get('ID', $lastID);
            $return['response'] = true;
            if (!$return) {
                $return['response'] = false;
            }
            return $return;
        } else {
            $return['info'] = 'Uzupełnij dane formularza';
            $return['errorCode'] = '02';
            $return['httpCode'] = 400;
            $return['response'] = false;
            return $return;
        }

    }

    /**
     * @return mixed
     */
    public function put_index()
    {
        $goodFields = array('folderName', 'name', 'active');
        $post = $this->Data->getAllPost();
        $data['response'] = false;
        if (isset($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        }

        $count = count($goodFields);
        if (!empty($post)) {
            $saved = 0;
            foreach ($post as $key => $value) {
                if (in_array($key, $goodFields)) {
                    $saved += intval($this->PrintShopPreFlight->update($ID, $key, $value));
                }
            }

            if ($saved == $count) {
                $data['response'] = true;
                $data['info'] = 'Zapisano: ' . $count . ' pól.';
            } else {
                $data['errorCode'] = '03';
                $data['httpCode'] = 500;
                $data['info'] = 'Brak zapisanych pól';
            }
        } else {
            $data['errorCode'] = '01';
            $data['httpCode'] = 400;
            $data['info'] = 'Pusty POST';
        }
        return $data;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_index($ID)
    {
        if (intval($ID) > 0) {
            if ($this->PrintShopPreFlight->delete('ID', $ID)) {
                $data['response'] = true;
            } else {
                $data['errorCode'] = '05';
                $data['httpCode'] = 500;
                $data['info'] = 'Nie udało się usunąć obiektu';
                $data['response'] = false;
            }
        } else {
            $data['errorCode'] = '04';
            $data['httpCode'] = 400;
            $data['info'] = 'Brak identyfikatora obiektu';
            $data['response'] = false;
        }
        return $data;
    }


}
