<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShop\PrintShopRealizationTime;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopVolume;
use DreamSoft\Models\PrintShop\PrintShopRealizationTimeDetail;

/**
 * Class VolumesController
 */
class VolumesController extends Controller
{

    public $useModels = array();

    /**
     * @var PrintShopVolume
     */
    protected $PrintShopVolume;
    /**
     * @var PrintShopRealizationTime
     */
    protected $PrintShopRealizationTime;
    /**
     * @var PrintShopType
     */
    protected $PrintShopType;
    /**
     * @var PrintShopRealizationTimeDetail
     */
    private $PrintShopRealizationTimeDetail;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopVolume = PrintShopVolume::getInstance();
        $this->PrintShopRealizationTime = PrintShopRealizationTime::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopRealizationTimeDetail = PrintShopRealizationTimeDetail::getInstance();
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param null $ID
     * @return array|bool|mixed
     */
    public function volumes($groupID, $typeID, $ID = NULL)
    {
        $this->PrintShopVolume->setGroupID($groupID);
        $this->PrintShopVolume->setTypeID($typeID);

        if (intval($ID) > 0) {
            $data = $this->PrintShopVolume->get('ID', $ID);
            if ($data) {
                $data['formats'] = $this->PrintShopVolume->getFormats($ID);
            }
        } else {
            $data = $this->PrintShopVolume->getAll();
            if (!empty($data)) {
                foreach ($data as $key => $v) {
                    $formats = $this->PrintShopVolume->getFormats($v['ID']);
                    $formatsIDs = array();

                    if (!empty($formats)) {
                        foreach ($formats as $row) {
                            $formatsIDs[] = $row['formatID'];
                        }
                    }
                    $data[$key]['formats'] = $formatsIDs;
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
     * @param $typeID
     * @return mixed
     */
    public function post_volumes($groupID, $typeID)
    {
        $this->PrintShopVolume->setGroupID($groupID);
        $this->PrintShopVolume->setTypeID($typeID);

        $volume = $this->Data->getPost('volume');

        if ($volume) {
            $ID = $this->PrintShopVolume->customExist($volume);
            if (!$ID) {
                $ID = $this->PrintShopVolume->create($volume);
                $return = $this->PrintShopVolume->get('ID', $ID);
            } else {
                $return['response'] = false;
                $return['info'] = 'Taki nakład już jest. Dude!';
            }

        } else {
            $return['response'] = false;
        }
        return $return;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return array
     */
    public function patch_volumes($groupID, $typeID)
    {
        $this->PrintShopVolume->setGroupID($groupID);
        $this->PrintShopVolume->setTypeID($typeID);

        $action = $this->Data->getPost('action');
        if ($action === 'formats') {
            $formats = $this->Data->getPost('formats');
            $volumeID = $this->Data->getPost('ID');

            $res = $this->PrintShopVolume->deleteVolumeFormats($volumeID);
            if ($formats && !empty($formats) && $volumeID) {
                $res = false;
                foreach ($formats as $formatID) {
                    $ID = $this->PrintShopVolume->existFormat($formatID, $volumeID);
                    if (!$ID) {
                        $res = $this->PrintShopVolume->setFormat($formatID, $volumeID);
                    }
                    unset($ID);
                }
            }
            $return['response'] = $res;

        } elseif ($action === 'import') {
            $data = $this->PrintShopVolume->getAllVolumes();
            if (!empty($data)) {
                $imports = 0;
                foreach ($data as $key => $v) {
                    if (!$v['formatID']) {
                        continue;
                    }
                    $ID = $this->PrintShopVolume->existFormat($v['formatID'], $v['ID']);
                    if (!$ID) {
                        $imports = intval($this->PrintShopVolume->setFormat($v['formatID'], $v['ID']));
                    }
                }
                if ($imports > 0) {
                    $return['info'] = $imports . ' - volumes format imported';
                    $return['response'] = true;
                } else {
                    $return['response'] = false;
                }
            }

        } elseif ($action == 'setCustomVolume') {

            $custom = $this->Data->getPost('custom');
            if ($custom == 1) {
                $lastID = $this->PrintShopVolume->createCustom();
                if ($lastID > 0) {
                    $result = TRUE;
                } else {
                    $result = FALSE;
                }
            } else {
                $result = $this->PrintShopVolume->deleteCustom();
            }

            $return['response'] = $result;
        } elseif ($action == 'setInvisibleVolume') {
            $invisible = intval($this->Data->getPost('invisible'));
            $volumeID = $this->Data->getPost('ID');

            $result = $this->PrintShopVolume->update($volumeID, 'invisible', $invisible);
            if ($result) {
                $return['response'] = true;
            } else {
                $return = $this->sendFailResponse('03');
            }
        }

        return $return;
    }

    public function post_setMaxVolume($groupID, $typeID)
    {
        $maxVolume = $this->Data->getPost('maxVolume');
        $this->PrintShopType->setGroupID($groupID);

        $data['response'] = false;

        if (empty($maxVolume)) {
            $maxVolume = null;
        }

        if ($this->PrintShopType->setMaxVolume($typeID, $maxVolume)) {
            $data['response'] = true;
        }

        return $data;
    }

    public function delete_volumes($groupID, $typeID, $ID)
    {
        $this->PrintShopVolume->setGroupID($groupID);
        $this->PrintShopVolume->setTypeID($typeID);
        $one = $this->PrintShopVolume->get('ID', $ID);

        $this->PrintShopRealizationTimeDetail->setGroupID($groupID);
        $this->PrintShopRealizationTimeDetail->setTypeID($typeID);

        if ($ID) {
            $result = $this->PrintShopVolume->defaultDelete($one['volume']);
            if ($result) {

                $this->PrintShopVolume->deleteVolumeFormats($ID);
                $this->PrintShopRealizationTime->setGroupID($groupID);
                $this->PrintShopRealizationTime->setTypeID($typeID);
                $this->PrintShopRealizationTime->setVolume($one['volume']);

                $realizationTimeDetailID = $this->PrintShopRealizationTime->getDetailsForVolume();
                $removedRTDetails = strval($this->PrintShopRealizationTimeDetail->delete('ID', $realizationTimeDetailID));
                $data['infoRemovedRTDetails'] = 'Removed: ' . $removedRTDetails . '. ';
            }
            $data['response'] = true;
            return $data;
        } else {
            header("HTTP/1.0 403 Forbidden");
            $data['response'] = false;
            return $data;
        }
    }

    public function customVolume($groupID, $typeID)
    {
        $this->PrintShopVolume->setGroupID($groupID);
        $this->PrintShopVolume->setTypeID($typeID);
        $one = $this->PrintShopVolume->getCustom();
        if ($one) {
            $return['custom'] = 1;
        } else {
            $return['custom'] = 0;
        }
        return $return;
    }
}
