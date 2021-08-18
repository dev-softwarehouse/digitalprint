<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShop\PrintShopRealizationTime;
use DreamSoft\Models\PrintShop\PrintShopRealizationTimeLanguage;
use DreamSoft\Models\PrintShop\PrintShopRealizationTimeDetail;

/**
 * Description of PrintShopRealizationTimeController
 *
 * @author Rafał
 */
class RealizationTimeController extends Controller
{

    public $useModels = array();

    /**
     * @var PrintShopRealizationTime
     */
    protected $PrintShopRealizationTime;
    /**
     * @var PrintShopRealizationTimeLanguage
     */
    protected $PrintShopRealizationTimeLanguage;
    /**
     * @var PrintShopRealizationTimeDetail
     */
    private $PrintShopRealizationTimeDetail;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopRealizationTime = PrintShopRealizationTime::getInstance();
        $this->PrintShopRealizationTimeLanguage = PrintShopRealizationTimeLanguage::getInstance();
        $this->PrintShopRealizationTimeDetail = PrintShopRealizationTimeDetail::getInstance();
    }

    /**
     * @param null $groupID
     * @param null $typeID
     * @param null $volume
     * @param null $ID
     * @return array|bool
     */
    public function index($groupID = NULL, $typeID = NULL, $volume = NULL, $ID = NULL)
    {
        $this->PrintShopRealizationTime->setGroupID($groupID);
        $this->PrintShopRealizationTime->setTypeID($typeID);
        $this->PrintShopRealizationTime->setVolume($volume);

        if (intval($ID) > 0) {
            $data = $this->PrintShopRealizationTime->getWithDetails($ID);
        } else {
            $data = $this->PrintShopRealizationTime->getRealizationTimes();
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
        $days = $this->Data->getPost('days');
        $pricePercentage = $this->Data->getPost('pricePercentage');
        $color = $this->Data->getPost('color');

        $names = $this->Data->getPost('names');

        if (($name || $names) && $days) {
            $lastID = $this->PrintShopRealizationTime->addRealizationTime($name, $days, $pricePercentage);

            if( $lastID > 0 ) {
                $this->PrintShopRealizationTime->update($lastID, 'color', $color);
            }


            $return = $this->PrintShopRealizationTime->getWithDetails($lastID);

            if (!$return) {
                $return['response'] = false;
                return $return;
            }
            if (!empty($names)) {
                $return['names'] = array();
                foreach ($names as $lang => $name) {
                    $res = $this->PrintShopRealizationTimeLanguage->set($lang, $name, $lastID);
                    if (!$res) {
                        $return = $this->sendFailResponse('09');
                        return $return;
                    }
                    $return['names'][$lang] = $name;
                }
            }
            return $return;
        } else {
            $return = $this->sendFailResponse('01');
            return $return;
        }

    }

    /**
     * @return array
     */
    public function put_index()
    {
        $post = $this->Data->getAllPost();

        $names = $post['names'];
        $active = intval($post['active']);
        $color = $post['color'];
        unset($post['names']);

        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }

        $res = $this->PrintShopRealizationTime->editRealizationTime($ID, $post['name'], $post['days'], $post['pricePercentage']);

        if ($active) {
            $this->PrintShopRealizationTime->update($ID, 'active', 1);
        } else {
            $this->PrintShopRealizationTime->update($ID, 'active', 0);
        }

        if( strlen($color) > 1 ) {
            $this->PrintShopRealizationTime->update($ID, 'color', $color);
        } else {
            $this->PrintShopRealizationTime->update($ID, 'color', NULL);
        }

        if ($res) {
            $return['response'] = true;
        } else {
            $return['response'] = false;
        }

        if (!empty($names)) {
            foreach ($names as $lang => $name) {
                $res = $this->PrintShopRealizationTimeLanguage->set($lang, $name, $ID);
                if (!$res) {
                    $return = $this->sendFailResponse('09');
                    return $return;
                }
            }
        }

        return $return;
    }

    /**
     * @param $ID
     * @return array
     */
    public function delete_index($ID)
    {
        if (intval($ID) > 0) {
            $this->PrintShopRealizationTime->delete('ID', $ID);
            $this->PrintShopRealizationTimeDetail->delete('realizationID', $ID);

            $data['response'] = true;

            if (!$this->PrintShopRealizationTimeLanguage->delete('realizationTimeID', $ID)) {
                $data = $this->sendFailResponse('09');
                return $data;
            }
            return $data;
        } else {
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @return mixed
     */
    public function patch_sort()
    {
        $post = $this->Data->getAllPost();
        $response = $this->PrintShopRealizationTime->sort($post);
        $return['response'] = $response;
        return $return;
    }

    /**
     * @param $groupID
     * @param null $typeID
     * @param null $volume
     * @return array|bool
     */
    public function details($groupID, $typeID = NULL, $volume = NULL)
    {
        $this->PrintShopRealizationTime->setGroupID($groupID);
        $this->PrintShopRealizationTime->setTypeID($typeID);
        $this->PrintShopRealizationTime->setVolume($volume);

        $this->PrintShopRealizationTimeDetail->setGroupID($groupID);
        $this->PrintShopRealizationTimeDetail->setTypeID($typeID);
        $this->PrintShopRealizationTimeDetail->setVolume($volume);

        $data = $this->PrintShopRealizationTime->getRealizationTimes();
        $prevData = $this->PrintShopRealizationTime->getDetailsPrev();

        if (!empty($prevData) && !empty($data)) {
            foreach ($data as $key => $row) {
                if (isset($row['ID']) && isset($prevData[$row['ID']])) {
                    if ($prevData[$row['ID']]['realizationID'] == $row['ID']) {
                        $data[$key]['days'] = $prevData[$row['ID']]['days'];
                        $data[$key]['pricePercentage'] = $prevData[$row['ID']]['pricePercentage'];
                        $data[$key]['active'] = $prevData[$row['ID']]['active'];
                    }
                }
            }
        }
        if (!empty($data)) {
            foreach ($data as $key => $rt) {
                if (isset($rt['ID'])) {
                    $details = $this->PrintShopRealizationTimeDetail->customGet($rt['ID']);
                } else {
                    $details = false;
                }
                if ($details) {
                    $data[$key]['details'] = $details;
                }

            }
        }

        if (empty($data)) {
            $data = array();
        }


        return $data;
    }

    /**
     * @param $groupID
     * @param null $typeID
     * @param null $volume
     * @return mixed
     */
    public function patch_details($groupID, $typeID = NULL, $volume = NULL)
    {

        $this->PrintShopRealizationTimeDetail->setGroupID($groupID);
        $this->PrintShopRealizationTimeDetail->setTypeID($typeID);
        $this->PrintShopRealizationTimeDetail->setVolume($volume);

        $realizationID = $this->Data->getPost('realizationID');
        $days = $this->Data->getPost('days');
        if (!$days) {
            $days = 0;
        }
        $pricePercentage = $this->Data->getPost('pricePercentage');
        if (!$pricePercentage) {
            $pricePercentage = 0;
        }
        $active = $this->Data->getPost('active');
        if (!$active) {
            $active = 0;
        }

        if ($realizationID && $days) {
            try {
                $data['response'] = $this->PrintShopRealizationTimeDetail->customSet($realizationID, $days, $pricePercentage, $active);
                $one = $this->PrintShopRealizationTimeDetail->customGet($realizationID);
                $data['data']['ID'] = $one['ID'];
            } catch (Exception $ex) {
                $data['response'] = false;
                $data['error'] = $ex->getMessage();
            }

        } else {
            $data['response'] = false;
        }

        return $data;

    }

    /**
     * @return array
     */
    public function delete_details()
    {

        $countArgs = func_num_args();
        $args = func_get_args();
        if ($countArgs == 2) {
            $ID = $args[1];
        } elseif ($countArgs == 3) {
            $ID = $args[2];
        } elseif ($countArgs == 4) {
            $ID = $args[3];
        } else {
            $data['response'] = false;
            return $data;
        }

        if (intval($ID) > 0) {
            $data['response'] = $this->PrintShopRealizationTimeDetail->delete('ID', $ID);
        } else {
            $data['response'] = false;
        }
        return $data;

    }
}
