<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 30-05-2018
 * Time: 12:48
 */

namespace DreamSoft\Controllers\Components;

use DreamSoft\Models\Order\OrderConfig;
use DreamSoft\Models\PrintShopUser\UserData;
use DreamSoft\Models\ProductionPath\Operator;
use DreamSoft\Models\ProductionPath\Ongoing;
use DreamSoft\Models\ProductionPath\Operation;
use DreamSoft\Models\ProductionPath\OperationDevice;
use DreamSoft\Models\ProductionPath\PrintTypeDevice;
use DreamSoft\Models\ProductionPath\OperationOptionController;
use DreamSoft\Models\Order\DpProduct;
use DreamSoft\Core\Component;

/**
 * Class ProductionPath
 * @package DreamSoft\Controllers\Components
 */
class ProductionPath extends Component
{
    /**
     * @var Operator
     */
    private $Operator;

    public $useModels = array();

    /**
     * @var Operation
     */
    protected $Operation;
    /**
     * @var OrderConfig
     */
    protected $OrderConfig;
    /**
     * @var Ongoing
     */
    protected $Ongoing;
    /**
     * @var OperationDevice
     */
    protected $OperationDevice;
    /**
     * @var PrintTypeDevice
     */
    protected $PrintTypeDevice;
    /**
     * @var UserData
     */
    protected $UserData;
    /**
     * @var OperationOptionController
     */
    protected $OperationOptionController;
    /**
     * @var DpProduct
     */
    protected $DpProduct;

    /**
     * ProductionPath constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->Operator = Operator::getInstance();
        $this->Ongoing = Ongoing::getInstance();
        $this->Operation = Operation::getInstance();
        $this->OrderConfig = OrderConfig::getInstance();
        $this->OperationDevice = OperationDevice::getInstance();
        $this->PrintTypeDevice = PrintTypeDevice::getInstance();
        $this->UserData = UserData::getInstance();
        $this->OperationOptionController = OperationOptionController::getInstance();
        $this->DpProduct = DpProduct::getInstance();
    }

    /**
     *
     */
    public function getAllOperators()
    {
        $operators = $this->Operator->getAll();
    }

    /**
     * @param array $params
     * @return array
     */
    public function doPath($params = array())
    {
        $appVersion = 0;
        if (isset($params['appVersion'])) {
            $appVersion = $params['appVersion'];
        }

        if ($appVersion == 0) {
            return $this->pathToOrder($params);
        }

        return $this->pathToProduct($params);

    }

    /**
     * @param $params
     * @return array
     */
    private function pathToOrder($params)
    {
        $itemID = $params['itemID'];
        $orderConfig = $this->OrderConfig->get('orderID', $itemID);
        if ($orderConfig && $orderConfig['planed'] == 1) {
            return array('response' => false, 'info' => 'production_already_planned');
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

            $lastID = $this->Ongoing->create(
                compact('itemID', 'operationID', 'order', 'deviceID', 'orderOnDevice', 'appVersion')
            );
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
     * @param $params
     * @return array
     */
    private function pathToProduct($params)
    {
        $orderID = $params['itemID'];
        $appVersion = $params['appVersion'];

        $orderConfig = $this->OrderConfig->get('orderID', $orderID);
        if ($orderConfig && $orderConfig['planed'] == 1) {
            return array('response' => false, 'info' => 'production_already_planned');
        }

        $products = $this->DpProduct->getOrdersProducts(array($orderID));

        $productionTasks = array();
        foreach ($products as $product) {
            $productionTasks[$product['ID']] = $this->DpProduct->searchOperationsForProducts($product['productID']);
        }

        $ongoings = array();
        $sortContainer = array();
        foreach ($productionTasks as $productID => $operations) {

            foreach ($operations as $operation) {

                $operationID = $operation['ID'];

                $controllers = $this->OperationOptionController->getSelectedControllers($operation['optID'], $operationID);
                if ($controllers && count($controllers) && $operation['controllerID']) {
                    if (!in_array($operation['controllerID'], $controllers)) {
                        continue;
                    }
                }

                $devices = $this->OperationDevice->getDevices($operationID);
                $deviceID = NULL;
                $orderOnDevice = NULL;

                if (!empty($devices)) {

                    $matchedDevices = array();

                    foreach ($devices as $d) {

                        switch (intval($operation['attributeType'])) {
                            case ATTRIBUTE_TYPE_STANDARD:
                                $matchedDevices[] = $d;
                                break;
                            case ATTRIBUTE_TYPE_PRINT:
                                $exist = $this->PrintTypeDevice->exist($operation['printTypeID'], $d['deviceID']);
                                if ($exist) {
                                    $matchedDevices[] = $d;
                                }
                                break;
                            case ATTRIBUTE_TYPE_PAPER:
                                $matchedDevices[] = $d;
                                break;
                        }

                    }

                    if ($matchedDevices) {
                        $bestDevice = $this->selectLessBusyDevice($matchedDevices);
                        $deviceID = $bestDevice['deviceID'];
                        $orderOnDevice = intval($bestDevice['count']) + 1;

                    }
                }

                if (!$deviceID) {
                    continue;
                }

                $itemID = $operation['calcProductID'];

                $existID = $this->Ongoing->checkExist($itemID, $operationID);

                if ($existID) {
                    continue;
                }

                if (!array_key_exists($operation['calcProductID'], $sortContainer)) {
                    $sortContainer[$operation['calcProductID']] = 1;
                } else {
                    $sortContainer[$operation['calcProductID']]++;
                }

                $inProgress = 0;
                if ($sortContainer[$operation['calcProductID']] === 1) {
                    $inProgress = 1;
                }

                $order = $sortContainer[$operation['calcProductID']];

                $created = date(DATE_FORMAT);

                $lastID = $this->Ongoing->create(
                    compact(
                        'itemID',
                        'operationID',
                        'order',
                        'deviceID',
                        'orderOnDevice',
                        'appVersion',
                        'inProgress',
                        'created'
                    )
                );

                if ($lastID > 0) {
                    $ongoings[] = $this->Ongoing->get('ID', $lastID);
                }
                unset($operationID);
            }
        }


        return $ongoings;

    }

    /**
     * @param $devices
     * @return bool|array
     */
    private function selectLessBusyDevice($devices)
    {
        if (!$devices) {
            return false;
        }
        $leader = array();
        foreach ($devices as $device) {
            if (empty($leader)) {
                $leader = $device;
                continue;
            }
            if ($device['count'] < $leader['count']) {
                $leader = $device;
            }
        }

        if (!array_key_exists('count', $leader)) {
            return false;
        }

        return $leader;
    }

}