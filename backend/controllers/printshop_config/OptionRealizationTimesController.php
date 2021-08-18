<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigRealizationTime;

/**
 * Description of OptionRealizationTimesController
 *
 * @author Rafał
 */
class OptionRealizationTimesController extends Controller
{

    public $useModels = array();

    /**
     * @var PrintShopConfigRealizationTime
     */
    protected $PrintShopConfigRealizationTime;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopConfigRealizationTime = PrintShopConfigRealizationTime::getInstance();
    }

    public function optionRealizationTimes($attrID, $optionID, $volume = NULL)
    {
        $this->PrintShopConfigRealizationTime->setAttrID($attrID);
        $this->PrintShopConfigRealizationTime->setOptID($optionID);

        if (intval($volume) > 0) {
            $result = $this->PrintShopConfigRealizationTime->getSpecify($optionID, $volume);
        } else {
            $result = $this->PrintShopConfigRealizationTime->customGetAll($optionID);
        }

        if (empty($result)) {
            $result = array();
        }
        return $result;

    }

    public function post_optionRealizationTimes($attrID, $optionID)
    {

        $volume = $this->Data->getPost('volume');
        $days = $this->Data->getPost('days');

        if ($optionID && $volume && $days) {
            $lastID = $this->PrintShopConfigRealizationTime->set($optionID, $volume, $days);
            if ($lastID === true) {
                $return = $this->PrintShopConfigRealizationTime->getOne($optionID, $volume);
            } elseif (intval($lastID) > 0) {
                $return = $this->PrintShopConfigRealizationTime->get('ID', $lastID);
            } else {
                $return['response'] = false;
            }
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    public function put_optionRealizationTimes($attrID, $optionID)
    {

        $post = $this->Data->getAllPost();

        $goodKeys = array('volume',
            'days');

        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }

        $res = false;
        foreach ($post as $key => $value) {
            if (in_array($key, $goodKeys)) {
                $res = $this->PrintShopConfigRealizationTime->customUpdate($ID, $key, $value);
            }
        }

        if ($res) {
            $return['response'] = true;
        } else {
            $return['response'] = false;
        }
        return $return;

    }

    /**
     * @param $attrID
     * @param $optionID
     * @param $ID
     * @return mixed
     */
    public function delete_optionRealizationTimes($attrID, $optionID, $ID)
    {
        if (intval($ID) > 0) {
            $this->PrintShopConfigRealizationTime->delete('ID', $ID);
            $data['response'] = true;
            return $data;
        } else {
            header("HTTP/1.0 403 Forbidden");
            $data['response'] = false;
            return $data;
        }
    }

}
