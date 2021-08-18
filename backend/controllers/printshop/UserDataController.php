<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopUser\UserData;

/**
 * Description of UserDataController
 *
 * @author Rafał
 * @class UserDataController
 */
class UserDataController extends Controller
{
    public $useModels = array();

    /**
     * @var UserData
     */
    protected $UserData;

    /**
     * UserDataController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->UserData = UserData::getInstance();
    }

    /**
     * @param null $orderID
     * @return array
     */
    public function index($orderID = NULL)
    {
        if ($orderID) {
            $data = $this->UserData->getByOrder($orderID);
        } else {
            $data = $this->UserData->getAll();
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $orderID
     * @return mixed
     */
    public function patch_index($orderID)
    {
        $goodFields = array('accept');
        $post = $this->Data->getAllPost();
        $data['response'] = false;

        $count = count($post);
        if (!empty($post)) {
            $saved = 0;
            foreach ($post as $key => $value) {
                if (in_array($key, $goodFields)) {
                    $saved = intval($this->UserData->update($orderID, $key, $value));
                }
            }
            if ($saved == $count) {
                $data['response'] = true;
                $data['info'] = 'Zapisano: ' . $count . ' pól.';
            } else {
                $data = $this->sendFailResponse('03');
            }
        } else {
            $data = $this->sendFailResponse('01');
        }
        return $data;
    }
}
