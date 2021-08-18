<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 12:40
 */

namespace DreamSoft\Controllers\ProductionPath;

use DreamSoft\Core\Controller;
use DreamSoft\Models\Order\OrderConfig;
use DreamSoft\Models\PrintShopUser\UserData;
use DreamSoft\Models\ProductionPath\Ongoing;
use DreamSoft\Models\ProductionPath\OngoingLog;
use DreamSoft\Models\ProductionPath\Operation;
use DreamSoft\Models\ProductionPath\OperationDevice;
use DreamSoft\Models\PrintShopUser\UserAttribute;
use DreamSoft\Models\ProductionPath\PrintTypeDevice;
use DreamSoft\Models\ProductionPath\Operator;
use DreamSoft\Models\ProductionPath\SkillDevice;
use DreamSoft\Models\ProductionPath\OperationOptionController;
use DreamSoft\Models\ProductionPath\Process;
use DreamSoft\Models\ProductionPath\Department;
use DreamSoft\Models\ProductionPath\Device;
use DreamSoft\Models\ProductionPath\OngoingProgress;

/**
 * Class OngoingsController
 * @package DreamSoft\Controllers\ProductionPath
 */
class OngoingsController extends Controller
{
    public $useModels = array();
    /**
     * @var Ongoing
     */
    private $Ongoing;
    /**
     * @var OngoingLog
     */
    private $OngoingLog;
    /**
     * @var Operation
     */
    private $Operation;
    /**
     * @var OrderConfig
     */
    private $OrderConfig;
    /**
     * @var OperationDevice
     */
    private $OperationDevice;
    /**
     * @var UserAttribute
     */
    private $UserAttribute;
    /**
     * @var PrintTypeDevice
     */
    private $PrintTypeDevice;
    /**
     * @var UserData
     */
    private $UserData;
    /**
     * @var Operator
     */
    private $Operator;
    /**
     * @var SkillDevice
     */
    private $SkillDevice;
    /**
     * @var OperationOptionController
     */
    private $OperationOptionController;
    /**
     * @var Process
     */
    private $Process;
    /**
     * @var Department
     */
    private $Department;
    /**
     * @var Device
     */
    private $Device;
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
        $this->Ongoing = Ongoing::getInstance();
        $this->OngoingLog = OngoingLog::getInstance();
        $this->Operation = Operation::getInstance();
        $this->OrderConfig = OrderConfig::getInstance();
        $this->OperationDevice = OperationDevice::getInstance();
        $this->UserAttribute = UserAttribute::getInstance();
        $this->PrintTypeDevice = PrintTypeDevice::getInstance();
        $this->UserData = UserData::getInstance();
        $this->Operator = Operator::getInstance();
        $this->SkillDevice = SkillDevice::getInstance();
        $this->Process = Process::getInstance();
        $this->OperationOptionController = OperationOptionController::getInstance();
        $this->Ongoing->setAppVersion(1);
        $this->Department = Department::getInstance();
        $this->Device = Device::getInstance();
        $this->OngoingProgress = OngoingProgress::getInstance();
    }

    /**
     * @param $orderID
     * @param null $ID
     * @return array
     */
    public function index($orderID, $ID = NULL)
    {
        if (intval($ID) > 0) {
            $data = $this->Ongoing->get('ID', $ID);
        } else {
            $data = $this->Ongoing->getAll($orderID);
            if (!empty($data)) {
                foreach ($data as $key => $val) {
                    if (strlen($val['formatWidth']) > 0) {
                        $data[$key]['width'] = $val['formatWidth'];
                    }
                    unset($data[$key]['formatWidth']);
                    if (strlen($val['formatHeight']) > 0) {
                        $data[$key]['height'] = $val['formatHeight'];
                    }
                    unset($data[$key]['formatHeight']);
                    $attrs = $this->UserAttribute->getByOrder($val['orderID']);
                    $data[$key]['attrs'] = $attrs;
                }
            }
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
    public function post_index($orderID)
    {
        $orderID = $this->Data->getPost('orderID');
        $state = $this->Data->getPost('state');
        if ($state === NULL) {
            $state = 0;
        }
        $operatorID = $this->Data->getPost('operatorID');
        $operationID = $this->Data->getPost('operationID');

        $loggedUser = $this->Auth->getLoggedUser();
        $executiveUserID = $loggedUser['ID'];

        if (!$operatorID) {
            $userInfo = $this->Auth->getLoggedUser();
            $operator = $this->Operator->get('uID', $userInfo['ID']);
            $operatorID = $operator['ID'];
        }
        $return['response'] = false;
        if ($orderID && $operatorID) {
            $lastID = $this->Ongoing->create(compact('orderID', 'operatorID', 'state', 'operationID'));
            if ($lastID) {
                $ongoingID = $this->Ongoing->get('ID', $lastID);
                if ($ongoingID > 0) {
                    $date = date('Y-m-d H:i:s');
                    $this->OngoingLog->create(
                        compact(
                            'date',
                            'ongoingID',
                            'operatorID',
                            'state',
                            'executiveUserID',
                            'operationID')
                    );
                    $return['response'] = true;
                }
            }
        }
        return $return;
    }

    /**
     * @param $ongoingID
     * @return mixed
     */
    public function patch_index($ongoingID)
    {

        $goodFields = array(
            'orderID',
            'operatorID',
            'finished',
            'state',
            'deviceID',
            'processID',
            'sheetNumber',
            'processSideType'
        );
        $post = $this->Data->getAllPost();

        $data['response'] = false;

        $ID = $ongoingID;
        $operatorID = $this->Data->getPost('operatorID');
        $userInfo = $this->Auth->getLoggedUser();

        $executiveUserID = $userInfo['ID'];

        $count = count($post);
        $data['stateChange'] = false;
        if (!empty($post)) {
            $saved = 0;
            $savedLogs = false;
            $item = $this->Ongoing->get('ID', $ID);

            if( !$operatorID && !$item['operatorID'] ) {
                $operatorEntity = $this->Operator->get('uID', $userInfo['ID']);
                if( !$operatorEntity ) {
                    return $this->sendFailResponse('13');
                }
                $operatorID = $operatorEntity['ID'];
            } else if (!$operatorID) {
                $operatorID = $item['operatorID'];
            }

            $userDevices = $this->SkillDevice->getByUserID($userInfo['ID']);

            if (!in_array($item['deviceID'], $userDevices)) {
                $data['info'] = 'operator_does_not_support_this_device';
                return $data;
            }
            $logs = $this->OngoingLog->getByOngoingID($ID);
            foreach ($post as $key => $value) {
                if (in_array($key, $goodFields)) {
                    if ($key == 'state' && $item['state'] == $value) {
                        continue;
                    }
                    if ($key == 'state' && empty($logs) && ($value == 3 || $value == 2)) {
                        continue;
                    }
                    if ($key == 'finished' && empty($logs) && $item['state'] == 0 && $value == 1) {
                        continue;
                    }

                    if( $key == 'finished' && $value == 1 ) {

                        $saved += intval($this->Ongoing->update($ID, 'inProgress', 0));
                        $ongoingEntity = $this->Ongoing->get('ID', $ID);
                        $nextInQueue = $this->Ongoing->getNext($ongoingEntity);

                        if( $nextInQueue ) {
                            $this->Ongoing->update($nextInQueue['ID'], 'inProgress', 1);
                        }

                        $this->Ongoing->update($ID, 'inProgress', 0);
                    }

                    if ($key == 'state' && $item['state'] != $value) {
                        $date = date('Y-m-d H:i:s');
                        $ongoingID = $ID;
                        $state = $value;
                        $ongoingEntity = $this->Ongoing->get('ID', $ID);

                        if( $value == 1 ) {
                            $deviceBusy = $this->Ongoing->checkMachineBusy($ongoingEntity['deviceID'], $ongoingEntity['ID']);

                            if($deviceBusy > 0) {
                                $data['info'] = 'device_is_already_busy';
                                $data['response'] = false;
                                return $data;
                            }
                        }

                        $processID = $ongoingEntity['processID'];
                        $operationID = $ongoingEntity['operationID'];
                        $sheetNumber = NULL;
                        if( $post['sheetNumber'] ) {
                            $sheetNumber = $post['sheetNumber'];
                        }
                        $processSideType = NULL;
                        if( $post['processSideType'] ) {
                            $processSideType = $post['processSideType'];
                        }


                        $lastLog = $this->OngoingLog->create(
                            compact(
                                'date',
                                'ongoingID',
                                'operatorID',
                                'state',
                                'executiveUserID',
                                'processID',
                                'operationID',
                                'sheetNumber',
                                'processSideType'
                            )
                        );
                        if ($lastLog > 0) {
                            $savedLogs = true;
                        }
                        if($state == 3) {
                            $data['finishedPausedProcesses'] = $this->finishPausedProcesses(
                                $ongoingID,
                                $operatorID,
                                $operationID,
                                $executiveUserID
                            );
                        }

                    }
                    $saved += intval($this->Ongoing->update($ID, $key, $value));
                }
            }
            if ($saved > 0) {
                $data['response'] = true;
                $data['info'] = 'saved_message';
                if ($savedLogs) {
                    $data['stateChange'] = true;
                }
            } else {
                $data['info'] = 'error_when_saving_data';
            }
        } else {
            $data['info'] = 'no_data';
        }
        return $data;
    }

    /**
     * @param $ongoingID
     * @param $operatorID
     * @param $operationID
     * @param $executiveUserID
     * @return bool
     */
    private function finishPausedProcesses($ongoingID, $operatorID, $operationID, $executiveUserID)
    {
        $ongoingLogs = $this->OngoingLog->get('ongoingID', $ongoingID, true);

        if( !$ongoingLogs ) {
            return false;
        }

        $finished = array();
        foreach ($ongoingLogs as $ongoingLog) {

            if( $ongoingLog['state'] == 3 ) {
                $finished[$ongoingLog['ongoingID'].'_'.$ongoingLog['processID']] = true;
            }

        }

        $date = date(DATE_FORMAT);

        $savedLogs = 0;

        foreach ($ongoingLogs as $ongoingLog) {

            $searchKey = $ongoingLog['ongoingID'].'_'.$ongoingLog['processID'];

            if( !array_key_exists($searchKey, $finished) ) {

                $state = 3;
                $processID = $ongoingLog['processID'];

                $saveLog = $this->OngoingLog->create(
                    compact(
                        'date',
                        'ongoingID',
                        'operatorID',
                        'state',
                        'executiveUserID',
                        'processID',
                        'operationID'
                    )
                );

                if( $saveLog > 0 ) {
                    $savedLogs++;
                    $finished[$searchKey] = true;
                }

            }

        }

        if( $savedLogs ) {
            return true;
        }

        return false;
    }

    /**
     * @param $orderID
     * @param $ID
     * @return mixed
     */
    public function delete_index($orderID, $ID)
    {
        $data['ID'] = $ID;
        $data['response'] = false;
        if (intval($ID) > 0) {
            if ($this->Ongoing->delete('ID', $ID)) {
                $data['response'] = true;
                return $data;
            }
        }
        return $data;
    }

    /**
     * @param array $params
     * @return array
     */
    public function path($params = array())
    {
        $itemID = $params['orderID'];

        $appVersion = 0;

        $orderConfig = $this->OrderConfig->get('orderID', $itemID);

        if ($orderConfig && $orderConfig['planed'] == 1) {
            return array('response' => false, 'info' => 'Już zaplanowano zadania.');
        }

        $operations = $this->Operation->getByOrderID($itemID);

        $ongoings = array();
        $order = 1;
        foreach ($operations as $o) {
            $operationID = $o['ID'];

            $controllers = $this->OperationOptionController->getSelectedControllers($o['optionID'], $operationID);
            if ($controllers && count($controllers) && $o['controllerID']) {
                if (!in_array($o['controllerID'], $controllers)) {
                    continue;
                }
            }

            $devices = $this->OperationDevice->getDevices($operationID);
            $deviceID = NULL;
            $orderOnDevice = NULL;
            if (!empty($devices)) {
                foreach ($devices as $d) {
                    $userData = $this->UserData->get('orderID', $itemID);
                    $exist = $this->PrintTypeDevice->exist($userData['printTypeID'], $d['deviceID']);
                    if ($exist) {
                        $deviceID = $d['deviceID'];
                        $orderOnDevice = intval($this->Ongoing->getMaxDeviceOrder($deviceID)) + 1;
                        break;
                    }
                }
                if (!$deviceID) {
                    foreach ($devices as $d) {
                        $printTypesList = $this->PrintTypeDevice->getByDeviceID($d['deviceID']);
                        if (empty($printTypesList)) {
                            $deviceID = $d['deviceID'];
                            $orderOnDevice = intval($this->Ongoing->getMaxDeviceOrder($deviceID)) + 1;
                            break;
                        }
                    }
                }
            }

            $lastID = $this->Ongoing->create(compact('itemID', 'operationID', 'order', 'deviceID', 'orderOnDevice', 'appVersion'));
            if ($lastID > 0) {
                $ongoings[] = $this->Ongoing->get('ID', $lastID);
            }
            unset($operationID);
            $order++;
        }
        if (!empty($ongoings)) {
            $planed = 1;
            $this->OrderConfig->create(compact('orderID', 'planed'));
        }

        return $ongoings;
    }

    /**
     * @param $orderID
     * @return mixed
     */
    public function patch_sort($orderID)
    {
        $post = $this->Data->getAllPost();
        return $this->Ongoing->sort($orderID, $post);
    }

    /**
     * @param $deviceID
     * @return array
     */
    public function patch_deviceOrder($deviceID)
    {
        $ogs = $this->Ongoing->getByDeviceID($deviceID);
        $order = intval($this->Ongoing->getMaxDeviceOrder($deviceID), 1);
        $count = 0;
        foreach ($ogs as $o) {
            if (intval($o['orderOnDevice']) < 0) {
                $order++;
                if ($this->Ongoing->update($o['ID'], 'orderOnDevice', $order)) {
                    $count++;
                }
            }
        }
        $response = false;
        if ($count > 0) {
            $response = true;
        }
        return array('response' => $response, 'info' => 'Updated ' . $count . ' wpisów.');
    }

    /**
     * @param $ongoingID
     * @return array
     */
    public function logs($ongoingID)
    {

        if (!(intval($ongoingID) > 0)) {
            return array('response' => false, 'info' => 'nie ma ongoingID');
        }
        $logs = $this->OngoingLog->get('ongoingID', $ongoingID, true);

        if (!empty($logs)) {

            $aggregateOngoings = array();
            $aggregateOperators = array();
            $aggregateProcesses = array();
            $aggregateOperations = array();
            foreach ($logs as $log) {
                if( $log['ongoingID'] && is_numeric($log['ongoingID']) ) {
                    $aggregateOngoings[] = $log['ongoingID'];
                }
                if( $log['operatorID'] && is_numeric($log['operatorID']) ) {
                    $aggregateOperators[] = $log['operatorID'];
                }
                if( $log['processID'] && is_numeric($log['processID']) ) {
                    $aggregateProcesses[] = $log['processID'];
                }
                if($log['operationID'] && is_numeric($log['operationID'])) {
                    $aggregateOperations[] = $log['operationID'];
                }
            }
            $ongoings = $this->Ongoing->getByList($aggregateOngoings);
            $operators = $this->Operator->getByList($aggregateOperators);
            $processes = $this->Process->getByList($aggregateProcesses);
            $operations = $this->Operation->getByList($aggregateOperations);

            $lastLog = NULL;
            $diffTimes = array();
            foreach ($logs as $key => $row) {

                if (($row['state'] == 2 || $row['state'] == 3) && $lastLog && $lastLog['state'] == 1) {

                    $diffTimes[] = $logs[$key]['diffTime'] = strtotime($row['date']) - strtotime($lastLog['date']);
                }

                $logs[$key]['sumTime'] = array_sum($diffTimes);

                if( $ongoings[$row['ongoingID']] ) {
                    $logs[$key]['ongoing'] = $ongoings[$row['ongoingID']];
                }
                if( $operators[$row['operatorID']] ) {
                    $logs[$key]['operator'] = $operators[$row['operatorID']];
                }
                if( $processes[$row['processID']] ) {
                    $logs[$key]['process'] = $processes[$row['processID']];
                }

                if( $operations[$row['operationID']] ) {
                    $logs[$key]['operation'] = $operations[$row['operationID']];
                }

                $lastLog = $row;
            }

        } else {
            $logs = array();
        }
        return $logs;
    }

    public function operatorLogs($operatorID)
    {
        if (!$operatorID) {
            return $this->sendFailResponse('02');
        }
        $data = $this->Ongoing->getByOperator($operatorID);
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    public function current()
    {

    }

    /**
     * @param $itemID
     * @return array|bool
     */
    public function showForItem($itemID)
    {
        $ongoings = $this->Ongoing->getByItemList(array($itemID));

        if( !$ongoings ) {
            return array();
        }

        $aggregateOngoings = array();
        $aggregateOperations = array();
        $aggregateDevices = array();
        $aggregateOperators = array();

        foreach ($ongoings as $items) {

            foreach ($items as $ongoing) {
                if ($ongoing['ID'] && !in_array($ongoing['ID'], $aggregateOngoings)) {
                    $aggregateOngoings[] = $ongoing['ID'];
                }
                if ($ongoing['operationID'] && !in_array($ongoing['operationID'], $aggregateOperations)) {
                    $aggregateOperations[] = $ongoing['operationID'];
                }
                if ($ongoing['deviceID'] && !in_array($ongoing['deviceID'], $aggregateDevices)) {
                    $aggregateDevices[] = $ongoing['deviceID'];
                }
                if ($ongoing['operatorID'] && !in_array($ongoing['operatorID'], $aggregateOperators)) {
                    $aggregateOperators[] = $ongoing['operatorID'];
                }
            }
        }

        $logs = $this->OngoingLog->getLogsByOngoings($aggregateOngoings);
        $operations = $this->Operation->getByList($aggregateOperations);
        $processes = $this->Process->getByOperationList($aggregateOperations);
        $devices = $this->Device->getByList($aggregateDevices);
        $operators = $this->Operator->getByList($aggregateOperators);

        $aggregateDepartments = array();
        if( $devices ) {
            foreach ($devices as $device) {
                if( $device['departmentID'] && !in_array($device['departmentID'], $aggregateDepartments) ) {
                    $aggregateDepartments[] = $device['departmentID'];
                }
            }
            $departments = $this->Department->getByList($aggregateDepartments);

            foreach ($devices as $key => $device) {
                if( array_key_exists($device['departmentID'], $departments) ) {
                    $devices[$key]['department'] = $departments[$device['departmentID']];
                }
            }
        }

        $flatLogs = array();
        if( $logs ) {
            foreach ($logs as $ongoingID => $ongoingLogs) {
                foreach ($ongoingLogs as $log) {
                    $flatLogs[] = $log;
                }
            }
        }

        foreach ($ongoings as $itemID => $items) {

            foreach ($items as $key => $ongoing) {
                $ongoings[$itemID][$key]['operator'] = NULL;
                if( array_key_exists($ongoing['operatorID'], $operations) ) {
                    $ongoings[$itemID][$key]['operator'] = $operations[$ongoing['operatorID']];
                }
                $ongoings[$itemID][$key]['operation'] = NULL;
                if( array_key_exists($ongoing['operationID'], $operations) ) {
                    $ongoings[$itemID][$key]['operation'] = $operations[$ongoing['operationID']];
                }
                $ongoings[$itemID][$key]['processes'] = NULL;
                if( array_key_exists($ongoing['operationID'], $processes) ) {
                    $ongoings[$itemID][$key]['processes'] = $processes[$ongoing['operationID']];
                }
                $ongoings[$itemID][$key]['devices'] = NULL;
                if( array_key_exists($ongoing['deviceID'], $devices) ) {
                    $ongoings[$itemID][$key]['device'] = $devices[$ongoing['deviceID']];
                }
                $dateShift = strtotime($ongoing['created'].' + 1 hour');
                $ongoings[$itemID][$key]['startDate'] = $ongoing['created'];
                $ongoings[$itemID][$key]['endDate'] = date(DATE_FORMAT, $dateShift);

                if( $ongoings[$itemID][$key]['processes'] === NULL ) {
                    $firstLog = $this->searchLog($flatLogs, $ongoing['ID'], 'ASC');
                    if($firstLog) {
                        $ongoings[$itemID][$key]['startDate'] = $firstLog['date'];
                    }
                    $lastLog = $this->searchLog($flatLogs, $ongoing['ID'], 'DESC');
                    if($lastLog) {
                        $ongoings[$itemID][$key]['endDate'] = $lastLog['date'];
                    }
                } else if ( !empty($ongoings[$itemID][$key]['processes']) ) {
                    $ongoingFirstLog = NULL;
                    $ongoingLastLog = NULL;
                    $notStartedKeys = array();
                    foreach ( $ongoings[$itemID][$key]['processes'] as $processKey => $process ) {

                        $ongoings[$itemID][$key]['processes'][$processKey]['startDate'] = $ongoing['created'];
                        $ongoings[$itemID][$key]['processes'][$processKey]['endDate'] = date(DATE_FORMAT, $dateShift);

                        $firstLog = $this->searchProcessLog($flatLogs, $ongoing['ID'], $process['ID'], 'ASC');
                        if( !$firstLog ) {
                            $ongoings[$itemID][$key]['processes'][$processKey]['ganttGroup'] = 2;
                            $notStartedKeys[] = $processKey;
                            continue;
                        }
                        if( $ongoingFirstLog === NULL || ($ongoingFirstLog['date'] > $firstLog['date'] && $firstLog['date']) ) {
                            $ongoingFirstLog = $firstLog;
                        }
                        if( $firstLog ) {
                            $ongoings[$itemID][$key]['processes'][$processKey]['startDate'] = $firstLog['date'];
                        }
                        $lastLog = $this->searchProcessLog($flatLogs, $ongoing['ID'], $process['ID'], 'DESC');
                        if( $ongoingLastLog === NULL || $ongoingLastLog['date'] < $lastLog['date'] ) {
                            $ongoingLastLog = $lastLog;
                        }
                        if( $lastLog ) {
                            $ongoings[$itemID][$key]['processes'][$processKey]['endDate'] = $lastLog['date'];
                        }
                    }
                    foreach ($notStartedKeys as $notStartedKey) {
                        if( $ongoingFirstLog ) {
                            $ongoings[$itemID][$key]['processes'][$notStartedKey]['startDate'] = $ongoingFirstLog['date'];
                        }
                        if( $ongoingLastLog ) {
                            $ongoings[$itemID][$key]['processes'][$notStartedKey]['endDate'] = $ongoingLastLog['date'];
                        }
                    }
                    $ongoings[$itemID][$key]['processes'] = array_values($ongoings[$itemID][$key]['processes']);
                    if( $ongoingFirstLog ) {
                        $ongoings[$itemID][$key]['startDate'] = $ongoingFirstLog['date'];
                    }
                    if( $ongoingLastLog ) {
                        $ongoings[$itemID][$key]['endDate'] = $ongoingLastLog['date'];
                    }
                }
            }

        }

        reset($ongoings);

        $preparedOngoings = array_values(current($ongoings));

        return array(
            'ongoings' => $preparedOngoings,
            'logs' => $flatLogs,
        );
    }

    /**
     * @return array
     */
    public function patch_progress()
    {
        $post = $this->Data->getAllPost();

        $madeSheets = $post['madeSheets'];
        $madeSheetsReverse = $post['madeSheetsReverse'];
        $ongoingID = $post['ongoingID'];

        if( !$ongoingID ) {
            $this->sendFailResponse('02');
        }

        $saved = 0;

        if( !empty($madeSheets) ) {

            foreach ($madeSheets as $sheetNumber => $sheetsAmount) {

                if( $this->saveSheetProgress(
                    $ongoingID,
                    TYPE_OPERATION_ON_SHEET_OBVERSE,
                    $sheetNumber,
                    $sheetsAmount)
                ) {
                    $saved++;
                }

            }

        }

        if( !empty($madeSheetsReverse) ) {

            foreach ($madeSheetsReverse as $sheetNumber => $sheetsAmount) {

                if( $this->saveSheetProgress(
                    $ongoingID,
                    TYPE_OPERATION_ON_SHEET_REVERSE,
                    $sheetNumber,
                    $sheetsAmount)
                ) {
                    $saved++;
                }

            }

        }

        if( $saved > 0 ) {
            return array(
                'response' => true,
                'saved' => $saved
            );
        }

        return array(
            'response' => false
        );
    }

    private function saveSheetProgress($ongoingID, $type, $sheetNumber, $sheets)
    {
        $created = date(DATE_FORMAT);

        $lastID = $this->OngoingProgress->create(
            compact(
                'ongoingID',
                'type',
                'sheets',
                'sheetNumber',
                'created'
            )
        );
        if( $lastID > 0 ) {
            return true;
        }

        return false;
    }

    /**
     * @param $ongoing
     * @return array
     */
    private function setDefaultDates($ongoing)
    {
        $ongoing['startDate'] = $ongoing['created'];
        $ongoing['endDate'] = $ongoing['created'];

        return $ongoing;
    }

    /**
     * @param $logs
     * @param $ongoingID
     * @param string $order
     * @return null
     */
    private function searchLog($logs, $ongoingID, $order = 'ASC')
    {
        if( empty($logs) ) {
            return NULL;
        }

        $lastLog = NULL;

        foreach ($logs as $log) {

            if( $log['ongoingID'] != $ongoingID || $log['processID'] ) {
                continue;
            }

            if( $lastLog === NULL ) {
                $lastLog = $log;
            }

            if( $order === 'ASC' ) {
                if( $log['date'] && $log['date'] < $lastLog['date'] ) {
                    $lastLog = $log;
                }
            } else {
                if( $log['date'] > $lastLog['date'] ) {
                    $lastLog = $log;
                }
            }

        }

        return $lastLog;
    }

    /**
     * @param $logs
     * @param $ongoingID
     * @param $processID
     * @param string $order
     * @return null
     */
    private function searchProcessLog($logs, $ongoingID, $processID, $order = 'ASC')
    {
        if( empty($logs) ) {
            return NULL;
        }

        $lastLog = NULL;

        foreach ($logs as $log) {

            if( $log['ongoingID'] != $ongoingID || $log['processID'] != $processID ) {
                continue;
            }

            if( $lastLog === NULL ) {
                $lastLog = $log;
            }

            if( $order === 'ASC' ) {
                if( $log['date'] && $log['date'] < $lastLog['date'] ) {
                    $lastLog = $log;
                }
            } else {
                if( $log['date'] > $lastLog['date'] ) {
                    $lastLog = $log;
                }
            }

        }

        return $lastLog;
    }
}