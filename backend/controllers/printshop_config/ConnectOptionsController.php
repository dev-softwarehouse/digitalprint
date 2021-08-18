<?php

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigConnect;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigConnectOption;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigConnectPrice;

/**
 * Class ConnectOptionsController
 */
class ConnectOptionsController extends Controller
{

    /**
     * @var array
     */
    public $useModels = array();
    /**
     * @var PrintShopConfigConnect
     */
    protected $PrintShopConfigConnect;
    /**
     * @var PrintShopConfigConnectOption
     */
    protected $PrintShopConfigConnectOption;
    /**
     * @var PrintShopConfigConnectPrice
     */
    protected $PrintShopConfigConnectPrice;
    /**
     * @var Price
     */
    protected $Price;

    /**
     * ConnectOptionsController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopConfigConnect = PrintShopConfigConnect::getInstance();
        $this->PrintShopConfigConnectOption = PrintShopConfigConnectOption::getInstance();
        $this->PrintShopConfigConnectPrice = PrintShopConfigConnectPrice::getInstance();
        $this->Price = Price::getInstance();
    }

    /**
     * @param null $ID
     * @return array|bool|mixed
     */
    public function index($ID = NULL)
    {
        if (intval($ID) > 0) {
            $data = $this->PrintShopConfigConnect->get('ID', $ID);
            $data['price'] = $this->Price->getNumberToView($data['price']);
        } else {
            $data = $this->PrintShopConfigConnect->getAll();
            foreach ($data as $key => $row) {
                $data[$key]['price'] = $this->Price->getNumberToView($row['price']);
            }
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @return array
     */
    public function post_index()
    {
        $name = $this->Data->getPost('name');

        if ($name) {
            $created = date('Y-m-d H:i:s');
            $lastID = $this->PrintShopConfigConnect->create(compact('name', 'created'));
            $item = $this->PrintShopConfigConnect->get('ID', $lastID);
            if (!$item) {
                $return = $this->sendFailResponse('03');
            }
            $return = array('response' => true, 'item' => $item);
            return $return;
        } else {
            $return = $this->sendFailResponse('01');
            return $return;
        }
    }


    /**
     * @return mixed
     */
    public function put_index()
    {
        $post = $this->Data->getAllPost();
        $goodKeys = array('name');
        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }
        foreach ($post as $key => $value) {
            if (!in_array($key, $goodKeys)) {
                continue;
            }
            $this->PrintShopConfigConnect->update($ID, $key, $value);
        }
        $return['response'] = true;
        return $return;
    }

    /**
     * @param $connectID
     * @return mixed
     */
    public function delete_index($connectID)
    {
        $data['response'] = false;

        if ($this->PrintShopConfigConnect->delete('ID', $connectID)) {
            $this->PrintShopConfigConnectPrice->delete('connectOptionID', $connectID);
            $this->PrintShopConfigConnectOption->delete('connectOptionID', $connectID);
            $data['response'] = true;
        }

        return $data;
    }

    /**
     * @param $optionID
     * @return array
     */
    public function patch_addToGroup($optionID)
    {
        $post = $this->Data->getAllPost();

        if (!isset($post['connectID'])) {
            return $this->sendFailResponse('06');
        }
        $connectID = $post['connectID'];

        if ($connectID === 0) {
            $res = $this->PrintShopConfigConnectOption->delete('optionID', $optionID);
            return array('response' => true, 'removed' => true);
        }

        $res = $this->PrintShopConfigConnectOption->set($optionID, $connectID);

        if ($res) {
            return array('response' => true);
        }
        return $this->sendFailResponse('03');

    }

    /**
     * @param $connectOptionID
     * @return array|bool
     */
    public function price($connectOptionID)
    {
        $data = $this->PrintShopConfigConnectPrice->getList($connectOptionID);
        if (empty($data)) {
            $data = array();
        } else {

            foreach ($data as $key => $value) {
                $data[$key]['value'] = $this->Price->getNumberToView($value['value']);
                $data[$key]['expense'] = $this->Price->getNumberToView($value['expense']);
            }

        }
        return $data;
    }

    /**
     * @param $connectOptionID
     * @return array
     */
    public function patch_price($connectOptionID)
    {
        $post = $this->Data->getAllPost();

        if (!$post['amount'] || !$post['value']) {
            $this->sendFailResponse('01');
        }

        if (isset($post['expense']) && $post['expense'] > 0) {
            $expense = $this->Price->getPriceToDb($post['expense']);
        } else {
            $expense = NULL;
        }

        $res = $this->PrintShopConfigConnectPrice->set(
            $connectOptionID,
            $post['amount'],
            $this->Price->getPriceToDb($post['value']),
            $expense
        );

        if ($res > 0) {
            $item = $this->PrintShopConfigConnectPrice->get('ID', $res);
            $item['value'] = $this->Price->getNumberToView($item['value']);
            $item['expense'] = $this->Price->getNumberToView($item['expense']);
            return array('response' => true, 'item' => $item);
        }

        return $this->sendFailResponse('03');
    }

    /**
     * @param $connectOptionID
     * @param $params
     * @return array
     */
    public function delete_price($connectOptionID, $params)
    {
        if (!$params['amount']) {
            $this->sendFailResponse('01');
        }

        $res = $this->PrintShopConfigConnectPrice->deleteBy($connectOptionID, $params['amount']);

        if ($res) {
            return array('response' => true);
        }

        return $this->sendFailResponse('05');
    }
}
