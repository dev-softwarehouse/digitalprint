<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrintTypeWorkspace;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrintType;
use DreamSoft\Models\ProductionPath\PrintTypeDevice;

/**
 * Description of PrintTypeController
 *
 * @author Rafał
 */
class PrintTypeController extends Controller
{

    /**
     * @var array
     */
    public $useModels = array();

    /**
     * @var PrintShopConfigPrintType
     */
    protected $PrintShopConfigPrintType;
    /**
     * @var PrintShopConfigPrintTypeWorkspace
     */
    protected $PrintShopConfigPrintTypeWorkspace;
    /**
     * @var PrintTypeDevice
     */
    protected $PrintTypeDevice;

    /**
     * PrintTypeController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopConfigPrintType = PrintShopConfigPrintType::getInstance();
        $this->PrintShopConfigPrintTypeWorkspace = PrintShopConfigPrintTypeWorkspace::getInstance();
        $this->PrintTypeDevice = PrintTypeDevice::getInstance();
    }

    /**
     * @param null $ID
     * @return array|bool|mixed
     */
    public function printType($ID = NULL)
    {
        if (intval($ID) > 0) {
            $data = $this->PrintShopConfigPrintType->getOne($ID);
        } else {
            $data = $this->PrintShopConfigPrintType->getAll();
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @return array|bool|mixed
     */
    public function post_printType()
    {

        $name = $this->Data->getPost('name');
        $workspaceID = $this->Data->getPost('workspaceID');
        $pricelistID = $this->Data->getPost('pricelistID');

        $workspaces = $this->Data->getPost('workspaces');

        if ($name) {
            $lastID = $this->PrintShopConfigPrintType->customCreate($name, $workspaceID, $pricelistID);
            if (!$lastID) {
                $return['response'] = false;
            }
            if (!empty($workspaces)) {
                $this->PrintShopConfigPrintTypeWorkspace->delete('printTypeID', $lastID);
                foreach ($workspaces as $workspaceID) {
                    $ID = $this->PrintShopConfigPrintTypeWorkspace->exist($lastID, $workspaceID);
                    if (!$ID) {
                        $params = array();
                        $params['printTypeID'] = $lastID;
                        $params['workspaceID'] = $workspaceID;
                        if (!$this->PrintShopConfigPrintTypeWorkspace->create($params)) {
                            $data = $this->sendFailResponse('03');
                            return $data;
                        }
                    }
                }
            }

            $return = $this->PrintShopConfigPrintType->getOne($lastID);
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    /**
     * @return array
     */
    public function put_printType()
    {
        $post = $this->Data->getAllPost();

        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }
        $res = $this->PrintShopConfigPrintType->customUpdate($ID, $post['name'], $post['workspaceID'], $post['pricelistID']);
        if ($res) {
            $this->PrintShopConfigPrintTypeWorkspace->delete('printTypeID', $ID);
            if (!empty($post['workspaces'])) {
                foreach ($post['workspaces'] as $workspaceID) {
                    $exist = $this->PrintShopConfigPrintTypeWorkspace->exist($ID, $workspaceID);
                    if (!$exist) {
                        $params = array();
                        $params['printTypeID'] = $ID;
                        $params['workspaceID'] = $workspaceID;
                        if (!$this->PrintShopConfigPrintTypeWorkspace->create($params)) {
                            $data = $this->sendFailResponse('03');
                            return $data;
                        }
                    }
                }
            }

            $return['response'] = true;
        } else {
            $return['response'] = false;
        }
        return $return;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_printType($ID)
    {
        if (intval($ID) > 0) {
            $this->PrintShopConfigPrintType->delete('ID', $ID);
            $this->PrintShopConfigPrintTypeWorkspace->delete('printTypeID', $ID);
            $data['response'] = true;
            return $data;
        } else {
            header("HTTP/1.0 403 Forbidden");
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @param null $ID
     * @return array
     */
    public function printTypeSpecial($ID = NULL)
    {
        if (intval($ID) > 0) {
            $data = $this->PrintShopConfigPrintType->getOne($ID);
        } else {
            $data = $this->PrintShopConfigPrintType->getSpecial();
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $printTypeID
     * @return mixed
     */
    public function patch_printTypeDevices($printTypeID)
    {
        $post = $this->Data->getAllPost();
        if (!empty($post)) {
            $this->PrintTypeDevice->delete('printTypeID', $printTypeID);
            $data['response'] = false;
            foreach ($post as $deviceID) {
                $ID = $this->PrintTypeDevice->exist($printTypeID, $deviceID);
                if (!$ID) {
                    $params['printTypeID'] = $printTypeID;
                    $params['deviceID'] = $deviceID;
                    if ($this->PrintTypeDevice->create($params) > 0) {
                        $data['response'] = true;
                    }
                }
            }
        } else {
            $this->PrintTypeDevice->delete('printTypeID', $printTypeID);
            $data['info'] = 'Usunięto powiązania';
            $data['response'] = true;
        }

        return $data;
    }

    /**
     * @param $printTypeID
     * @return array
     */
    public function printTypeDevices($printTypeID)
    {
        $res = $this->PrintTypeDevice->getByPrintTypeID($printTypeID);

        if (empty($res)) {
            return array();
        }
        $data = array();
        foreach ($res as $key => $value) {
            $data[] = $value['deviceID'];
        }

        return $data;
    }

}
