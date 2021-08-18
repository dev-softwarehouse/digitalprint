<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 13:29
 */

namespace DreamSoft\Controllers\ProductionPath;

use DreamSoft\Core\Controller;
use DreamSoft\Models\ProductionPath\Operation;
use DreamSoft\Models\ProductionPath\OperationOption;
use DreamSoft\Models\ProductionPath\OperationDevice;
use DreamSoft\Models\ProductionPath\OperationOptionController;
use DreamSoft\Models\ProductionPath\OperationProcess;
use DreamSoft\Controllers\Components\Standard;

use Exception;

class OperationsController extends Controller
{

    /**
     * @var Operation
     */
    private $Operation;
    /**
     * @var OperationOption
     */
    private $OperationOption;
    /**
     * @var OperationDevice
     */
    private $OperationDevice;
    /**
     * @var OperationOptionController
     */
    private $OperationOptionController;
    /**
     * @var OperationProcess
     */
    private $OperationProcess;
    /**
     * @var Standard
     */
    private $Standard;


    /**
     * @constructor
     * @param {Array} $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Operation = Operation::getInstance();
        $this->OperationOption = OperationOption::getInstance();
        $this->OperationDevice = OperationDevice::getInstance();
        $this->OperationOptionController = OperationOptionController::getInstance();
        $this->OperationProcess = OperationProcess::getInstance();
        $this->Standard = Standard::getInstance();
    }

    /**
     * @param null $ID
     * @return array
     */
    public function operations($ID = NULL)
    {

        if (intval($ID) > 0) {
            $data = $this->Operation->get('ID', $ID);
        } else {
            $data = $this->Operation->getAll('order');
        }

        if (empty($data)) {
            $data = array();
        }

        return $data;

    }

    /**
     * @return mixed
     */
    public function post_operations()
    {
        $name = $this->Data->getPost('name');
        $description = $this->Data->getPost('description');

        if ($name) {
            $order = $this->Operation->getMaxOrder();
            if (!$order) {
                $order = 0;
            }
            $lastID = $this->Operation->create(compact('name', 'description', 'order'));
            if ($lastID) {
                $return = $this->Operation->get('ID', $lastID);
                $return['response'] = true;
            } else {
                $return['response'] = false;
            }
        } else {
            $return['response'] = false;
        }
        return $return;
    }

    /**
     * @param null $optionID
     * @param null $ID
     * @return mixed
     */
    public function put_operations($optionID = null, $ID = null)
    {
        $goodFields = array('name', 'description');
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
                    $saved += intval($this->Operation->update($ID, $key, $value));
                }
            }

            if ($saved == $count) {
                $data['response'] = true;
                $data['info'] = 'Zapisano: ' . $count . ' pól.';
            } else {
                $data['info'] = 'Brak zapisanych pól';
            }
        } else {
            $data['info'] = 'Pusty POST';
        }
        return $data;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_operations($ID)
    {
        if ($ID) {
            if ($this->Operation->delete('ID', $ID)) {
                $data['response'] = true;
                return $data;
            }
        } else {
            $data['info'] = 'Brak ID';
            $data['httpCode'] = 400;
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
        $this->Standard->setModel($this->Operation);
        return $this->Standard->sort($post, $func = 'sort');
    }

    /**
     * @param $operationID
     * @return array
     */
    public function operationOptions($operationID)
    {

        if (intval($operationID) > 0) {
            $selected = $this->OperationOption->getSelectedOptions($operationID);
        } else {
            $selected = array();
        }

        if (is_array($selected)) {
            sort($selected);
            $list = $selected;
        }
        if (empty($list)) {
            $list = array();
        }
        return $list;
    }

    /**
     * @param $operationID
     * @return mixed
     * @throws \Exception
     */
    public function post_operationOptions($operationID)
    {
        if (intval($operationID) > 0) {
            $selected = $this->OperationOption->getSelectedOptions($operationID);
        } else {
            $selected = array();
        }

        $post = $this->Data->getAllPost();
        if (!empty($post)) {
            foreach ($post as $key => $optionID) {
                if (!in_array($optionID, $selected)) {
                    $this->OperationOption->create(compact('optionID', 'operatioID'));
                }
            }
        }
        foreach ($selected as $key => $optionID) {
            if (!in_array($optionID, $post)) {
                $this->OperationOption->deleteBoth($optionID, $operationID);
            }
        }
        $data['response'] = true;
        return $data;
    }

    /**
     * @param $operationID
     * @return array
     */
    public function operationDevices($operationID)
    {
        $data = $this->OperationDevice->getSelectedDevices($operationID);

        if (empty($data)) {
            return array();
        }

        return $data;
    }

    /**
     * @param $operationID
     * @return mixed
     */
    public function post_operationDevices($operationID)
    {
        $post = $this->Data->getAllPost();

        $removedRelations = $this->OperationDevice->delete('operationID', $operationID);
        $data['response'] = false;
        if (!empty($post)) {
            foreach ($post as $deviceID) {
                $ID = $this->OperationDevice->exist($deviceID, $operationID);
                if (!$ID) {
                    $params['operationID'] = $operationID;
                    $params['deviceID'] = $deviceID;
                    if ($this->OperationDevice->create($params) > 0) {
                        $data['response'] = true;
                    }
                }
            }
        } else {
            $data['info'] = 'Usunięto powiązania';
            $data['response'] = $removedRelations;
        }

        return $data;
    }

    /**
     * @param $attributeID
     * @param $optionID
     * @return array
     */
    public function optionOperations($attributeID, $optionID)
    {
        if (intval($optionID) > 0) {
            $selected = $this->OperationOption->getSelectedOperations($optionID);
        } else {
            $selected = array();
        }

        if (is_array($selected)) {
            sort($selected);
            $list = $selected;
        }
        if (empty($list)) {
            $list = array();
        }
        return $list;
    }

    /**
     * @param $attributeID
     * @param $optionID
     * @return mixed
     * @throws Exception
     */
    public function post_optionOperations($attributeID, $optionID)
    {
        if (intval($optionID) > 0) {
            $selected = $this->OperationOption->getSelectedOperations($optionID);
        } else {
            $selected = array();
        }

        $post = $this->Data->getAllPost();
        if (!empty($post)) {
            foreach ($post as $key => $operationID) {
                if (!array_key_exists($operationID, $selected)) {
                    $this->OperationOption->create(compact('optionID', 'operationID'));
                }
            }

            foreach ($selected as $operationID => $operation) {
                if (!in_array($operationID, $post)) {
                    $this->OperationOption->deleteBoth($optionID, $operationID);
                    $this->OperationOptionController->deleteOne($optionID, $operationID);
                }
            }

        } else {
            $this->OperationOption->delete('optionID', $optionID);
            $this->OperationOptionController->delete('optionID', $optionID);

            $data['info'] = 'Pusty POST - usuwamy wszystko';
        }


        $data['response'] = true;
        return $data;
    }

    /**
     * @param $attributeID
     * @param $optionID
     * @param $operationID
     * @return mixed
     * @throws Exception
     */
    public function patch_optionOperations($attributeID, $optionID, $operationID)
    {
        if (intval($optionID) > 0 && intval($operationID) > 0) {
            $selected = $this->OperationOptionController->getSelectedControllers($optionID, $operationID);
            if (!$selected) {
                $selected = array();
            }
        } else {
            $selected = array();
        }

        $post = $this->Data->getAllPost();
        if (!empty($post)) {
            foreach ($post as $key => $controllerID) {
                if (!in_array($controllerID, $selected)) {
                    $this->OperationOptionController->create(compact('optionID', 'operationID', 'controllerID'));
                }
            }

            foreach ($selected as $key => $controllerID) {
                if (!in_array($controllerID, $post)) {
                    $this->OperationOptionController->deleteOne($optionID, $operationID, $controllerID);
                }
            }

        } else {
            $this->OperationOptionController->deleteOne($optionID, $operationID);
            $data['info'] = 'Pusty POST - usuwamy wszystko';
        }

        $data['response'] = true;
        return $data;
    }

    /**
     * @param $operationID
     * @return array
     */
    public function operationProcesses($operationID)
    {
        $data = $this->OperationProcess->getSelectedProcesses($operationID);

        if (empty($data)) {
            return array();
        }

        return $data;
    }

    /**
     * @param $operationID
     * @return mixed
     */
    public function post_operationProcesses($operationID)
    {
        $post = $this->Data->getAllPost();

        $removedRelations = $this->OperationProcess->delete('operationID', $operationID);
        $data['response'] = false;
        if (!empty($post)) {
            foreach ($post as $processID) {
                $ID = $this->OperationProcess->relationExist($processID, $operationID);
                if (!$ID) {
                    $params['operationID'] = $operationID;
                    $params['processID'] = $processID;
                    if ($this->OperationProcess->create($params) > 0) {
                        $data['response'] = true;
                    }
                }
            }
        } else {
            $data['info'] = 'removed';
            $data['response'] = $removedRelations;
        }

        return $data;
    }

}