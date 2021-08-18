<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 12:07
 */

namespace DreamSoft\Controllers\ProductionPath;

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopUser\UserCalcProductAttribute;
use DreamSoft\Models\ProductionPath\Device;
use DreamSoft\Models\ProductionPath\Operation;
use DreamSoft\Models\ProductionPath\Process;
use DreamSoft\Models\ProductionPath\SkillDevice;
use DreamSoft\Models\ProductionPath\Ongoing;
use DreamSoft\Models\ProductionPath\OperationDevice;
use DreamSoft\Models\PrintShopUser\UserAttribute;
use DreamSoft\Models\ProductionPath\SameDevice;
use DreamSoft\Models\PrintShopUser\UserCalcProduct;
use DreamSoft\Models\ProductionPath\Operator;
use DreamSoft\Models\Order\OrderMessage;
use DreamSoft\Controllers\Components\QueryFilter;
use DreamSoft\Controllers\Components\Acl;
use DreamSoft\Models\ProductionPath\OperationProcess;
use DreamSoft\Models\ProductionPath\Department;
use DreamSoft\Controllers\Components\Standard;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigWorkspace;
use DreamSoft\Models\ProductionPath\OperationOption;
use DreamSoft\Models\ProductionPath\OngoingProgress;

class DevicesController extends Controller
{
    public $useModels = array();
    /**
     * @var Department
     */
    private $Department;
    /**
     * @var Device
     */
    private $Device;
    /**
     * @var SkillDevice
     */
    private $SkillDevice;
    /**
     * @var Ongoing
     */
    private $Ongoing;
    /**
     * @var OperationDevice
     */
    private $OperationDevice;
    /**
     * @var UserAttribute
     */
    private $UserAttribute;
    /**
     * @var SameDevice
     */
    private $SameDevice;
    /**
     * @var UserCalcProduct
     */
    private $UserCalcProduct;
    /**
     * @var Operator
     */
    private $Operator;
    /**
     * @var OrderMessage
     */
    private $OrderMessage;
    /**
     * @var QueryFilter
     */
    private $QueryFilter;
    /**
     * @var Process
     */
    private $Process;
    /**
     * @var Operation
     */
    private $Operation;
    /**
     * @var OperationProcess
     */
    private $OperationProcess;
    /**
     * @var PrintShopConfigWorkspace
     */
    private $PrintShopConfigWorkspace;
    /**
     * @var Standard
     */
    private $Standard;

    /**
     * @var array
     */
    private $configs;

    /**
     * @var Acl
     */
    private $Acl;
    /**
     * @var UserCalcProductAttribute
     */
    private $UserCalcProductAttribute;
    /**
     * @var OperationOption
     */
    private $OperationOption;
    /**
     * @var OngoingProgress
     */
    private $OngoingProgress;

    /**
     * @constructor
     * @param {Array} $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Device = Device::getInstance();
        $this->SkillDevice = SkillDevice::getInstance();
        $this->Ongoing = Ongoing::getInstance();
        $this->OperationDevice = OperationDevice::getInstance();
        $this->UserAttribute = UserAttribute::getInstance();
        $this->SameDevice = SameDevice::getInstance();
        $this->UserCalcProduct = UserCalcProduct::getInstance();
        $this->Operator = Operator::getInstance();
        $this->OrderMessage = OrderMessage::getInstance();
        $this->Process = Process::getInstance();
        $this->Operation = Operation::getInstance();
        $this->OperationProcess = OperationProcess::getInstance();
        $this->Department = Department::getInstance();
        $this->QueryFilter = new QueryFilter();
        $this->PrintShopConfigWorkspace = PrintShopConfigWorkspace::getInstance();
        $this->Standard = Standard::getInstance();
        $this->Acl = new Acl();
        $this->UserCalcProductAttribute = UserCalcProductAttribute::getInstance();
        $this->OperationOption = OperationOption::getInstance();
        $this->OngoingProgress = OngoingProgress::getInstance();
        $this->Ongoing->setAppVersion(1);
        $this->setConfigs();
    }

    public function setConfigs()
    {
        $this->configs = array(
            'deviceID' => array('type' => 'string', 'table' => 'ongoings',
                'field' => 'deviceID', 'sign' => $this->QueryFilter->signs['e']),
            'appVersion' => array('type' => 'string', 'table' => 'ongoings',
                'field' => 'appVersion', 'sign' => $this->QueryFilter->signs['e'], 'default' => 1),
            'ID' => array('type' => 'string', 'table' => 'ongoings',
                'field' => 'ID', 'sign' => $this->QueryFilter->signs['li']),
            'finished' => array('type' => 'string', 'table' => 'ongoings',
                'field' => 'finished', 'sign' => $this->QueryFilter->signs['e']),
            'userID' => array('type' => 'string', 'table' => 'dp_orders',
                'field' => 'userID', 'sign' => $this->QueryFilter->signs['li']),
            'orderID' => array('type' => 'string', 'table' => 'dp_orders',
                'field' => 'ID', 'sign' => $this->QueryFilter->signs['li']),
            'productID' => array('type' => 'string', 'table' => 'dp_products',
                'field' => 'ID', 'sign' => $this->QueryFilter->signs['li']),
            'operationID' => array('type' => 'string', 'table' => 'ongoings',
                'field' => 'operationID', 'sign' => $this->QueryFilter->signs['li']),
            'operatorID' => array('type' => 'string', 'table' => 'ongoings',
                'field' => 'operatorID', 'sign' => $this->QueryFilter->signs['li']),
            'realisationTimeFrom' => array('type' => 'timestamp', 'table' => 'ps_user_calc',
                'field' => 'realisationDate', 'sign' => $this->QueryFilter->signs['gt']),
            'realisationTimeTo' => array('type' => 'timestamp', 'table' => 'ps_user_calc',
                'field' => 'realisationDate', 'sign' => $this->QueryFilter->signs['lt']),
            'inProgress' => array('type' => 'string', 'table' => 'ongoings',
                'field' => 'inProgress', 'sign' => $this->QueryFilter->signs['e']),
        );
    }

    public function getConfigs()
    {
        return $this->configs;
    }

    /**
     * @param null $ID
     * @return array
     */
    public function devices($ID = NULL)
    {
        $user = $this->Auth->getLoggedUser();
        $data = array();
        if (intval($ID) > 0) {
            $data = $this->Device->get('ID', $ID);
        } else {
            if ($user['super'] == 1) {
                $data = $this->Device->getAll();
            } elseif (is_array($user) && isset($user['ID'])) {
                $list = $this->SkillDevice->getByUserID($user['ID']);
                $data = $this->Device->getAll($list);
            }
        }

        if (empty($data)) {
            $data = array();
        }

        $departmentsUnsorted = $this->Department->getAll();

        $departments = array();
        if ($departmentsUnsorted) {
            foreach ($departmentsUnsorted as $row) {
                $departments[$row['ID']] = $row;
            }
        }

        foreach ($data as $key => $row) {
            $data[$key]['department'] = NULL;
            if (array_key_exists($row['departmentID'], $departments)) {
                $data[$key]['department'] = $departments[$row['departmentID']];
            }
        }

        $data = $this->Standard->sortData($data, 'sort');

        return $data;
    }

    /**
     * @return mixed
     */
    public function post_devices()
    {
        $name = $this->Data->getPost('name');
        $departmentID = $this->Data->getPost('departmentID');

        $sort = $this->Device->getMaxSort();

        if (!$sort) {
            $sort = 1;
        } else {
            $sort++;
        }

        if ($name && $departmentID) {
            $lastID = $this->Device->create(compact('name', 'departmentID', 'sort'));
            if ($lastID > 0) {
                $one = $this->Device->get('ID', $lastID);
                $data = $one;
            }
        } else {
            $data['response'] = false;
            $data['info'] = 'Nie ma pola {name}';
        }
        return $data;
    }

    /**
     * @return array
     */
    public function put_devices()
    {
        $ID = $this->Data->getPost('ID');
        if (!$ID) {
            return $this->sendFailResponse('04');
        }

        $data['response'] = false;

        $name = $this->Data->getPost('name');
        $departmentID = $this->Data->getPost('departmentID');
        $saved = 0;
        if ($name || $departmentID) {
            $saved += intval($this->Device->update($ID, 'name', $name));
            $saved += intval($this->Device->update($ID, 'departmentID', $departmentID));
            if ($saved > 0) {
                $data['response'] = true;
                $data['item'] = $this->Device->get('ID', $ID);
                $data['item']['department'] = $this->Department->get('ID', $data['item']['departmentID']);
            }
        } else {
            $data = $this->sendFailResponse('02');
        }
        return $data;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_devices($ID)
    {
        if ($ID) {
            if ($this->Device->delete('ID', $ID)) {
                $this->SkillDevice->delete('deviceID', $ID);
                $data['response'] = true;
                return $data;
            }
        } else {
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @param $deviceID
     * @return mixed
     */
    public function patch_deviceSkills($deviceID)
    {
        $post = $this->Data->getAllPost();
        if (!empty($post)) {
            $this->SkillDevice->delete('deviceID', $deviceID);
            $data['response'] = false;
            foreach ($post as $skillID) {
                $ID = $this->SkillDevice->exist($skillID, $deviceID);
                if (!$ID) {
                    $params['skillID'] = $skillID;
                    $params['deviceID'] = $deviceID;
                    if ($this->SkillDevice->create($params) > 0) {
                        $data['response'] = true;
                    }
                }
            }
        } else {
            $this->SkillDevice->delete('deviceID', $deviceID);
            $data['info'] = 'Usunięto powiązania';
            $data['response'] = true;
        }

        return $data;
    }

    /**
     * @param $deviceID
     * @return array
     */
    public function deviceSkills($deviceID)
    {
        $res = $this->SkillDevice->getByDeviceID($deviceID);

        if (empty($res)) {
            return array();
        }
        $data = array();
        foreach ($res as $key => $value) {
            $data[] = $value['skillID'];
        }

        return $data;
    }

    /**
     * @param $params
     * @return array|bool
     */
    public function ongoings($params)
    {
        $configs = $this->getConfigs();

        if ($params['deviceID'] > 0) {

            $limit = 30;
            if (isset($params['limit'])) {
                $limit = $params['limit'];
            }
            $offset = 0;
            if (isset($params['offset'])) {
                $offset = $params['offset'];
            }

            $sortBy[0] = 'orderOnDevice';
            if (isset($params['sort'])) {
                $sortBy = explode('|', $params['sort']);
            }

            $loggedUser = $this->Auth->getLoggedUser();
            $operator = $this->Operator->get('uID', $loggedUser['ID']);

            if (!$operator && !$this->Acl->canSeeAllOngoings($loggedUser)) {
                return array();
            }

            if ($operator && !$this->Acl->canSeeAllOngoings($loggedUser)) {
                $params['operatorID'] = $operator['ID'];
            }

            $filters = $this->QueryFilter->prepare($configs, $params);

            $data = $this->Ongoing->getFilteredList($filters, $offset, $limit, $sortBy);

            $operations = $this->prepareOperations();

            if (empty($data)) {
                return array();
            }

            $aggregateCalcProducts = array();
            $aggregateOperators = array();
            $aggregateOrders = array();
            $aggregateDevices = array();
            $aggregateWorkspaces = array();
            $aggregateOperations = array();
            $aggregateOngoings = array();
            foreach ($data as $key => $val) {
                if ($val['calcProductID'] && !in_array($val['calcProductID'], $aggregateCalcProducts)) {
                    $aggregateCalcProducts[] = $val['calcProductID'];
                }
                if ($val['operatorID'] && !in_array($val['operatorID'], $aggregateOperators)) {
                    $aggregateOperators[] = $val['operatorID'];
                }
                if ($val['orderID'] && !in_array($val['orderID'], $aggregateOrders)) {
                    $aggregateOrders[] = $val['orderID'];
                }
                if ($val['deviceID'] && !in_array($val['deviceID'], $aggregateDevices)) {
                    $aggregateDevices[] = $val['deviceID'];
                }
                if ($val['operationID'] && !in_array($val['operationID'], $aggregateOperations)) {
                    $aggregateOperations[] = $val['operationID'];
                }
                if ($val['ID'] && !in_array($val['ID'], $aggregateOngoings)) {
                    $aggregateOngoings[] = $val['ID'];
                }
            }

            $calculationProducts = $this->UserCalcProduct->getByList($aggregateCalcProducts);

            if ($calculationProducts) {
                foreach ($calculationProducts as $calculationProduct) {
                    if ($calculationProduct['workspaceID'] && !in_array($calculationProduct['workspaceID'], $aggregateWorkspaces)) {
                        $aggregateWorkspaces[] = $calculationProduct['workspaceID'];
                    }
                }
            }

            $operators = $this->Operator->getByList($aggregateOperators);
            $orderMessages = $this->OrderMessage->getByOrderList($aggregateOrders);
            $userAttributes = $this->UserCalcProductAttribute->getByCalcProductIds($aggregateCalcProducts);
            $devices = $this->Device->getByList($aggregateDevices);
            $workspaces = $this->PrintShopConfigWorkspace->getByList($aggregateWorkspaces);
            $progress = $this->OngoingProgress->getByOngoingList($aggregateOngoings);

            $aggregateOptions = array();

            foreach ($userAttributes as $calcProductID => $attributes) {
                foreach ($attributes as $attribute) {
                    $aggregateOptions[] = $attribute['optID'];
                }
            }

            $matchedOptionOperation = $this->matchOptionOperation($aggregateOptions, $aggregateOperations);

            foreach ($data as $key => $item) {
                $data = $this->assignVariable($data, $key, 'calculateProduct', NULL);
                $data = $this->assignVariable($data, $key, 'operator', NULL);
                $data = $this->assignVariable($data, $key, 'orderMessage', NULL);
                $data = $this->assignVariable($data, $key, 'userAttributes', NULL);
                if ($calculationProducts[$item['calcProductID']]) {
                    $data = $this->assignVariable(
                        $data,
                        $key,
                        'calculateProduct',
                        $calculationProducts[$item['calcProductID']]
                    );
                }

                if ($operators[$item['operatorID']]) {
                    $data = $this->assignVariable($data, $key, 'operator', $operators[$item['operatorID']]);
                }

                if ( array_key_exists($item['orderID'], $orderMessages) && $orderMessages[$item['orderID']]) {
                    $data = $this->assignVariable($data, $key, 'orderMessage', $orderMessages[$item['orderID']]);
                }
                if ($devices[$item['deviceID']]) {
                    $data = $this->assignVariable($data, $key, 'device', $devices[$item['deviceID']]);
                }
                if ($workspaces[$item['calculateProduct']['workspaceID']]) {
                    $data = $this->assignVariable(
                        $data,
                        $key,
                        'workspace',
                        $workspaces[$item['calculateProduct']['workspaceID']]
                    );
                }
                if( array_key_exists($item['ID'], $progress) ) {
                    $data = $this->assignVariable($data, $key, 'progress', $progress[$item['ID']]);
                    $preparedProgress = $this->prepareProgress($item['progress']);
                    $data = $this->assignVariable($data, $key, 'madeSheets', $preparedProgress['madeSheets']);
                    $data = $this->assignVariable($data, $key, 'madeSheetsReverse', $preparedProgress['madeSheetsReverse']);
                }

                if ($userAttributes[$item['calcProductID']]) {
                    $data = $this->assignVariable($data, $key, 'userAttributes', $userAttributes[$item['calcProductID']]);
                }

                if ($item['userAttributes']) {
                    foreach ($item['userAttributes'] as $userAttribute) {
                        if (array_key_exists($item['operationID'] . '_' . $userAttribute['optID'], $matchedOptionOperation)) {
                            $data = $this->assignVariable($data, $key, 'doubleSidedSheet', $userAttribute['doubleSidedSheet']);
                        }
                    }
                }

                if ($operations[$item['operationID']]) {

                    foreach ($operations[$item['operationID']]['processes'] as $processKey => $process) {
                        $operations[$item['operationID']]['processes'][$processKey]['selected'] = false;
                        if ($process['ID'] == $item['processID']) {
                            $operations[$item['operationID']]['processes'][$processKey]['selected'] = true;
                        }
                    }

                    $data = $this->assignVariable($data, $key, 'operation', $operations[$item['operationID']]);
                }

                $sheetsInfo = $this->prepareSheetsInfo($item);
                $data = $this->assignVariable($data, $key, 'sheetsInfo', $sheetsInfo);
            }

        } else {
            $data = array();
        }

        return $data;
    }

    /**
     * @param $data
     * @param $index
     * @param $key
     * @param $value
     * @return mixed
     */
    private function assignVariable($data, $index, $key, $value)
    {
        $data[$index][$key] = $value;
        return $data;
    }

    /**
     * @param $progress
     * @return array
     */
    private function prepareProgress($progress)
    {
        $madeSheets = array();
        $madeSheetsReverse = array();

        if( !$progress ) {
            return array(
                'madeSheets' => $madeSheets,
                'madeSheetsReverse' => $madeSheetsReverse
            );
        }

        foreach ($progress as $row) {
            if( $row['type'] == TYPE_OPERATION_ON_SHEET_OBVERSE ) {
                $madeSheets[$row['sheetNumber']] = $row['sheets'];
            } else if ( $row['type'] == TYPE_OPERATION_ON_SHEET_REVERSE ) {
                $madeSheetsReverse[$row['sheetNumber']] = $row['sheets'];
            }
        }

        return array(
            'madeSheets' => $madeSheets,
            'madeSheetsReverse' => $madeSheetsReverse
        );
    }

    /**
     * @param $options
     * @param $operations
     * @return array
     */
    private function matchOptionOperation($options, $operations)
    {

        $pairs = $this->OperationOption->getPairs($options, $operations);
        if (!$pairs) {
            return array();
        }

        $result = array();

        foreach ($pairs as $pair) {
            $result[$pair['operationID'] . '_' . $pair['optionID']] = true;
        }

        return $result;
    }

    /**
     * @param $item
     * @return mixed
     */
    private function prepareSheetsInfo($item)
    {
        $checkMod = fmod($item['projectSheets'], floor($item['projectSheets']));

        $partValue = $checkMod;

        $basicUnitOfSheets = $item['sheets'] / $item['projectSheets'];

        $rangeSheets = $item['projectSheets'];
        if ($item['projectSheets'] > 1) {
            $fullSheetsProjectNumber = floor($item['projectSheets']);

            $partProjectSheets = NULL;
            if ($checkMod) {
                $partProjectSheets = ceil($checkMod * $basicUnitOfSheets);
            }

            $fullProjectSheets = ceil((floor($item['projectSheets']) *
                    $basicUnitOfSheets) / floor($item['projectSheets']));
        } else {

            $fullSheetsProjectNumber = $item['projectSheets'];
            $fullProjectSheets = $item['sheets'];
            $partProjectSheets = 0;
            $rangeSheets = 1;

        }

        return compact(
            'partProjectSheets',
            'fullProjectSheets',
            'fullSheetsProjectNumber',
            'partValue',
            'rangeSheets'
        );
    }

    /**
     * @return array
     */
    private function prepareOperations()
    {
        $processes = $this->Process->getAll();

        if (!$processes) {
            $processes = array();
        }

        $sortedProcess = array();
        foreach ($processes as $process) {
            $sortedProcess[$process['ID']] = $process;
        }

        $operations = $this->Operation->getAll();

        $sortedOperations = array();
        foreach ($operations as $operation) {
            $sortedOperations[$operation['ID']] = $operation;
        }

        $operationProcesses = $this->OperationProcess->getAll();

        foreach ($operationProcesses as $operationProcess) {
            if (isset($sortedOperations[$operationProcess['operationID']]) &&
                isset($sortedProcess[$operationProcess['processID']])) {
                $sortedOperations[$operationProcess['operationID']]['processes'][] = $sortedProcess[$operationProcess['processID']];
            }
        }

        return $sortedOperations;

    }

    /**
     * @param $params
     * @return array
     */
    public function countFilteredOngoings($params)
    {
        if (!isset($params['deviceID']) || intval($params['deviceID']) == 0) {
            return array('count' => 0);
        }

        $loggedUser = $this->Auth->getLoggedUser();
        $operator = $this->Operator->get('uID', $loggedUser['ID']);

        if (!$operator && !$this->Acl->canSeeAllOngoings($loggedUser)) {
            return array('count' => 0);
        }

        if ($operator && !$this->Acl->canSeeAllOngoings($loggedUser)) {
            $params['operatorID'] = $operator['ID'];
        }

        $configs = $this->getConfigs();

        $filters = $this->QueryFilter->prepare($configs, $params);

        $count = $this->Ongoing->count($filters);
        return array('count' => $count);
    }

    /**
     * @return array|bool
     */
    public function countOngoings()
    {
        $loggedUser = $this->Auth->getLoggedUser();

        $operator = $this->Operator->get('uID', $loggedUser['ID']);

        $operatorID = NULL;

        if ($operator) {
            $operatorID = $operator['ID'];
        }

        if (!$operatorID && !$this->Acl->canSeeAllOngoings($loggedUser)) {
            return array();
        }

        if ($this->Acl->canSeeAllOngoings($loggedUser)) {
            $operatorID = NULL;
        }

        $data = $this->Device->countAll($operatorID);
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @return array
     */
    public function patch_sort()
    {
        $post = $this->Data->getAllPost();
        if ($this->Device->sort($post)) {
            return array('response' => true);
        } else {
            return $this->sendFailResponse('03');
        }
    }

    /**
     * @param $deviceID
     * @param $ongoingID
     * @return array
     */
    public function patch_move($deviceID, $ongoingID)
    {

        $newDeviceID = $this->Data->getPost('newDeviceID');

        $sameDevices = $this->SameDevice->getSameDevices($deviceID);

        if (!in_array($newDeviceID, $sameDevices)) {
            return $this->sendFailResponse('07', 'Nowa maszyna nie jest powiązana ze starą maszyną.');
        }

        $max = intval($this->Ongoing->getMaxDeviceOrder($deviceID)) + 1;
        if ($this->Ongoing->move($ongoingID, $newDeviceID, $max)) {
            $list = $this->Ongoing->getByDeviceID($deviceID);
            if (!empty($list)) {
                $ongoings = array();
                $i = 1;
                foreach ($list as $l) {
                    $ongoings[$i] = $l['ID'];
                    $i++;
                }
                $this->Ongoing->sortByDevice($ongoings);
            }
            return array('response' => true);
        } else {
            return $this->sendFailResponse('03');
        }
    }

    /**
     * @param $deviceID
     * @return array
     */
    public function sameDevices($deviceID)
    {
        $data = $this->SameDevice->getSameDevices($deviceID);
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $deviceID
     * @return mixed
     */
    public function patch_sameDevices($deviceID)
    {
        $post = $this->Data->getAllPost();
        if (!empty($post)) {
            $this->SameDevice->delete('deviceA', $deviceID);
            $data['response'] = false;
            foreach ($post as $deviceB) {
                $ID = $this->SameDevice->exist($deviceID, $deviceB);
                if (!$ID) {
                    $params['deviceA'] = $deviceID;
                    $params['deviceB'] = $deviceB;
                    if ($this->SameDevice->create($params) > 0) {
                        $data['response'] = true;
                    }
                }
            }
        } else {
            $this->SameDevice->delete('deviceA', $deviceID);
            $data['info'] = 'remove_joins';
            $data['response'] = true;
        }

        return $data;
    }

    public function canSeeAllOngoings()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->canSeeAllOngoings($user));
    }

}