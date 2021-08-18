<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 10:25
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Models\Behaviours\QueryFilter;
use DreamSoft\Core\Model;

class Ongoing extends Model
{
    /**
     * @var string
     */
    private $operations;
    /**
     * @var string
     */
    private $ongoingLogs;

    /**
     * @var QueryFilter
     */
    private $QueryFilter;
    /**
     * @var int
     */
    private $appVersion = 0;

    /**
     * Ongoing constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->QueryFilter = new QueryFilter();
        $prefix = true;
        $this->setTableName('ongoings', $prefix);
        $this->operations = $this->prefix . 'operations';
        $this->ongoingLogs = $this->prefix . 'ongoingLogs';
    }

    /**
     * @param $appVersion
     */
    public function setAppVersion($appVersion)
    {
        $this->appVersion = $appVersion;
    }

    /**
     * @return int
     */
    public function getAppVersion()
    {
        return $this->appVersion;
    }

    /**
     * @param null $itemID
     * @return array|bool
     */
    public function getAll($itemID = NULL)
    {
        $query = 'SELECT `' . $this->getTableName() . '` . * , `orders`.name, `cart`.realizationDate,
                `cart`.realizationTime, `orders`.amount, `ps_user_data`.volume, `ps_user_data`.pages,
                `ps_user_data`.formatWidth, `ps_user_data`.formatHeight, `ps_products_formats`.width, 
                `ps_products_formats`.height, `ps_products_formats`.name as formatName
                FROM `' . $this->getTableName() . '`
                LEFT JOIN `orders` ON `orders`.ID = `' . $this->getTableName() . '`.itemID
                LEFT JOIN `cart_items` ON `cart_items`.orderID = `orders`.ID
                LEFT JOIN `cart` ON `cart`.ID = `cart_items`.cartID 
                LEFT JOIN `ps_user_data` ON `ps_user_data`.orderID = `orders`.ID 
                LEFT JOIN `ps_products_formats` ON `ps_products_formats`.ID = `ps_user_data`.formatID 
                 ';

        $query .= ' WHERE `' . $this->getTableName() . '` . `appVersion` = :appVersion ';
        $binds['appVersion'] = $this->getAppVersion();

        if ($itemID) {
            $query .= ' AND `' . $this->getTableName() . '` . `itemID` = :itemID ';
            $binds['itemID'] = $itemID;
        }

        $query .= ' GROUP BY `' . $this->getTableName() . '`.ID
                    ORDER BY `order` ASC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        foreach ($res as $row) {
            $result[] = $row;
        }
        return $result;
    }

    /**
     * @param $deviceID
     * @return array|bool
     */
    public function getByDeviceID($deviceID)
    {
        $query = 'SELECT ongoings . * , `ps_user_calc`.realisationDate,
                 `ps_user_calc`.amount, `ps_user_calc`.volume, `ps_user_calc_products`.pages, 
                 format.name as formatName, `ps_user_calc_products`.ID as calcProductID, dp_orders.ID as orderID,
                 dp_orders.userID, dp_products.ID as productID, 
                `ps_user_calc_products`.formatWidth, `ps_user_calc_products`.formatHeight 
                FROM `' . $this->getTableName() . '` as ongoings 
             LEFT JOIN `ps_user_calc_products` ON  ongoings.itemID = `ps_user_calc_products`.ID 
             LEFT JOIN `ps_user_calc` ON  `ps_user_calc`.ID = `ps_user_calc_products`.calcID 
             LEFT JOIN `dp_products` ON  `dp_products`.calcID = `ps_user_calc`.ID 
             LEFT JOIN `dp_orders` ON `dp_orders`.ID = dp_products.orderID 
             LEFT JOIN `ps_products_formats` as format ON format.`ID` = `ps_user_calc_products`.`formatID` ';


        $query .= ' WHERE ongoings . `appVersion` = :appVersion ';
        $binds['appVersion'] = $this->getAppVersion();

        if ($deviceID) {
            $query .= ' AND ongoings.`deviceID` = :deviceID ';
            $binds['deviceID'] = $deviceID;
        }

        $query .= ' GROUP BY ongoings.ID
                    ORDER BY `orderOnDevice` ASC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    public function getFilteredList($filters, $offset = 0, $limit = 30, $orderBy = array())
    {
        $query = 'SELECT ongoings . * , `ps_user_calc`.realisationDate,
                 `ps_user_calc`.amount, `ps_user_calc`.volume, `ps_user_calc_products`.pages, 
                 format.name as formatName, `ps_user_calc_products`.ID as calcProductID, dp_orders.ID as orderID,
                 dp_orders.userID, dp_products.ID as productID, `ps_user_calc_products`.sheets, 
                 `ps_user_calc_products`.projectSheets, 
                 `ps_user_calc_products`.numberOfSquareMeters, `dp_operations`.name as operationName,
                `ps_user_calc_products`.formatWidth, `ps_user_calc_products`.formatHeight 
                FROM `' . $this->getTableName() . '` as ongoings 
             LEFT JOIN `dp_operations` ON dp_operations.ID = ongoings.operationID 
             LEFT JOIN `ps_user_calc_products` ON  ongoings.itemID = `ps_user_calc_products`.ID 
             LEFT JOIN `ps_user_calc` ON  `ps_user_calc`.ID = `ps_user_calc_products`.calcID 
             LEFT JOIN `dp_products` ON  `dp_products`.calcID = `ps_user_calc`.ID 
             LEFT JOIN `dp_orders` ON `dp_orders`.ID = dp_products.orderID 
             LEFT JOIN `ps_products_formats` as format ON format.`ID` = `ps_user_calc_products`.`formatID` ';

        $prepare = $this->QueryFilter->prepare($filters);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }

        $query .= ' GROUP BY ongoings.ID ASC ';
        if (empty($orderBy)) {
            $query .= ' ORDER BY ongoings.`modified` DESC ';
        } else {

            $orderQuery = ' ORDER BY ';
            foreach ($orderBy as $ord) {
                if (strstr($ord, '.')) {
                    $exp = explode('.', $ord);
                    if (strlen($exp[0]) > 0) {
                        $sortTable = '`' . $exp[0] . '`.';
                    } else {
                        $sortTable = '';
                    }
                    $ord = $exp[1];
                } else {
                    $sortTable = ' ongoings.';
                }
                if (substr($ord, 0, 1) == '-') {
                    $direct = 'DESC';
                    $ord = substr($ord, 1);
                } else {
                    $direct = 'ASC';
                }
                $orderQuery .= ' ' . $sortTable . '`' . $ord . '` ' . $direct . ',';
            }
            $query .= substr($orderQuery, 0, -1);
        }

        $query .= ' LIMIT ' . intval($offset) . ',' . intval($limit) . ' ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param null $filters
     * @return bool|int
     */
    public function count($filters = NULL)
    {
        $query = 'SELECT ongoings . * , `ps_user_calc`.realisationDate,
                 `ps_user_calc`.amount, `ps_user_calc`.volume, `ps_user_calc_products`.pages, 
                 format.name as formatName, `ps_user_calc_products`.ID as calcProductID, dp_orders.ID as orderID,
                 dp_orders.userID, dp_products.ID as productID, 
                `ps_user_calc_products`.formatWidth, `ps_user_calc_products`.formatHeight 
                FROM `' . $this->getTableName() . '` as ongoings 
             LEFT JOIN `ps_user_calc_products` ON  ongoings.itemID = `ps_user_calc_products`.ID 
             LEFT JOIN `ps_user_calc` ON  `ps_user_calc`.ID = `ps_user_calc_products`.calcID 
             LEFT JOIN `dp_products` ON  `dp_products`.calcID = `ps_user_calc`.ID 
             LEFT JOIN `dp_orders` ON `dp_orders`.ID = dp_products.orderID 
             LEFT JOIN `ps_products_formats` as format ON format.`ID` = `ps_user_calc_products`.`formatID` ';

        $prepare = $this->QueryFilter->prepare($filters);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }
        $query .= ' GROUP BY ongoings.ID ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->rowCount();

    }

    /**
     * @param $deviceID
     * @return bool|mixed
     */
    public function getMaxDeviceOrder($deviceID)
    {
        $query = 'SELECT MAX(orderOnDevice) as max FROM `' . $this->getTableName() . '` '
            . 'WHERE `deviceID` = :deviceID AND `finished` = 0 ';

        $binds['deviceID'] = $deviceID;

        $query .= ' AND `' . $this->getTableName() . '` . `appVersion` = :appVersion ';
        $binds['appVersion'] = $this->getAppVersion();

        $query .= 'GROUP BY `deviceID` ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $orderList
     * @return array|bool
     */
    public function getByOrderList($orderList)
    {
        if (empty($orderList)) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `itemID` IN (' . implode(',', $orderList) . ') ';

        $query .= ' AND `' . $this->getTableName() . '` . `appVersion` = :appVersion ';
        $binds['appVersion'] = $this->getAppVersion();

        $query .= ' ORDER BY `order` ASC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        if (!$res) {
            return false;
        }

        $result = array();
        foreach ($res as $key => $value) {
            $result[$value['itemID']][] = $value;
        }
        return $result;
    }

    /**
     * @param $items
     * @return array|bool
     */
    public function getByItemList($items)
    {
        $this->setAppVersion(1);

        if (empty($items)) {
            return false;
        }

        $query = 'SELECT `' . $this->getTableName() . '`.* , 
        `dp_operations`.name as operationName, MAX(`dp_ongoingLogs`.date) as currentDate 
        FROM `' . $this->getTableName() . '` 
        LEFT JOIN `dp_operations` ON `dp_operations`.ID = `' . $this->getTableName() . '`.operationID
        LEFT JOIN `dp_ongoingLogs` ON `dp_ongoingLogs`.ongoingID = `' . $this->getTableName() . '`.ID
        WHERE `itemID` IN (' . implode(',', $items) . ') ';

        $query .= ' AND `' . $this->getTableName() . '` . `appVersion` = :appVersion ';
        $binds['appVersion'] = $this->getAppVersion();

        $query .= ' 
        GROUP BY `' . $this->getTableName() . '`.ID 
        ORDER BY `order` ASC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        if (!$res) {
            return false;
        }

        $result = array();
        foreach ($res as $key => $value) {
            $result[$value['itemID']][] = $value;
        }
        return $result;
    }

    /**
     * @param $itemID
     * @param $ongoings
     * @return bool
     */
    public function sort($itemID, $ongoings)
    {
        $result = true;
        foreach ($ongoings as $index => $ongoingID) {

            $query = 'UPDATE `' . $this->getTableName() . '` SET `order` = :index WHERE `ID` = :ongoingID AND `itemID` = :itemID ';

            $binds[':formatID'] = array($ongoingID, 'int');
            $binds[':index'] = $index;
            $binds[':itemID'] = $itemID;
            if (!$this->db->exec($query, $binds)) {
                $result = false;
            }
        }
        return $result;
    }

    /**
     * @param $ongoings
     * @return bool
     */
    public function sortByDevice($ongoings)
    {
        $result = true;
        foreach ($ongoings as $index => $ongoingID) {

            $query = 'UPDATE `' . $this->getTableName() . '` SET `orderOnDevice` = :index WHERE `ID` = :ongoingID ';

            $binds[':ongoingID'] = array($ongoingID, 'int');
            $binds[':index'] = $index;
            if (!$this->db->exec($query, $binds)) {
                $result = false;
            }
        }
        return $result;
    }

    /**
     * @param $ongoingID
     * @param $newDeviceID
     * @param $newIndex
     * @return bool
     */
    public function move($ongoingID, $newDeviceID, $newIndex)
    {
        $query = 'UPDATE `' . $this->getTableName() . '` SET `deviceID` = :deviceID, `orderOnDevice` = :index '
            . 'WHERE `ID` = :ongoingID ';
        $binds['deviceID'] = array($newDeviceID, 'int');
        $binds['ongoingID'] = $ongoingID;
        $binds['index'] = $newIndex;

        if (!$this->db->exec($query, $binds)) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * @param null $filters
     * @param int $offset
     * @param int $limit
     * @param array $orderBy
     * @return array|bool
     */
    public function getList($filters = NULL, $offset = 0, $limit = 30, $orderBy = array())
    {

        $query = 'SELECT ongoings.ID, ongoings.operationID, ongoings.deviceID, ongoings.itemID, 
                         `ps_user_calc`.realisationDate, `dp_products`.ID as productID, `dp_orders`.ID as orderID, 
                         ongoings.operatorID, `ps_user_calc`.ID as calcID, `ps_user_calc_products`.ID  as calcProductID
                  FROM `' . $this->getTableName() . '` as ongoings ';

        $query .= ' LEFT JOIN `' . $this->ongoingLogs . '` as ongoingLogs ON ongoings.ID = ongoingLogs.ongoingID '
            . ' LEFT JOIN `ps_user_calc_products` ON  ongoings.itemID = `ps_user_calc_products`.ID  '
            . ' LEFT JOIN `ps_user_calc` ON  `ps_user_calc`.ID = `ps_user_calc_products`.calcID  '
            . ' LEFT JOIN `dp_products` ON  `dp_products`.calcID = `ps_user_calc`.ID '
            . ' LEFT JOIN `dp_orders` ON `dp_orders`.ID = dp_products.orderID ';

        $prepare = $this->QueryFilter->prepare($filters);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }
        $query .= ' GROUP BY ongoings.ID ASC ';
        if (empty($orderBy)) {
            $query .= ' ORDER BY ongoingLogs.`date` DESC ';
        } else {
            $orderQuery = ' ORDER BY ';
            foreach ($orderBy as $ord) {
                if (substr($ord, 0, 1) == '-') {
                    $direct = 'DESC';
                    $ord = substr($ord, 1);
                } else {
                    $direct = 'ASC';
                }
                $orderQuery .= ' ongoingLogs.`' . $ord . '` ' . $direct . ',';
            }
            $query .= substr($orderQuery, 0, -1);
        }

        $query .= ' LIMIT ' . intval($offset) . ',' . intval($limit) . ' ';


        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $filters
     * @return bool|int
     */
    public function simpleCount($filters)
    {

        $query = 'SELECT ongoings.*  FROM `' . $this->getTableName() . '` as ongoings ';
        $query .= ' LEFT JOIN `' . $this->ongoingLogs . '` as ongoingLogs ON ongoings.ID = ongoingLogs.ongoingID ';

        $prepare = $this->QueryFilter->prepare($filters);
        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }

        $query .= ' GROUP BY ongoings.ID ASC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->rowCount();

    }

    /**
     * @param null $operatorID
     * @return array|bool
     */
    public function getByOperator($operatorID = NULL)
    {
        $query = 'SELECT ongoingLogs.*, `orders`.name, `dp_operations`.name  FROM `' . $this->getTableName() . '` as ongoings '
            . ' LEFT JOIN `' . $this->ongoingLogs . '` as ongoingLogs ON ongoings.ID = ongoingLogs.ongoingID '
            . ' LEFT JOIN `orders` ON `orders`.ID = ongoings.itemID '
            . ' LEFT JOIN `dp_operations` ON `dp_operations`.ID = ongoings.operationID ';

        $query .= ' WHERE ongoings . `appVersion` = :appVersion ';
        $binds['appVersion'] = $this->getAppVersion();

        if ($operatorID) {
            $query .= ' AND ongoingLogs . `operatorID` = :operatorID ';
            $binds['operatorID'] = $operatorID;
        }

        $query .= ' GROUP BY ongoingLogs.ID
                    ORDER BY `ongoingLogs`.ongoingID ASC, `ongoingLogs`.`date` ASC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();
        if (!$res) return false;

        foreach ($res as $row) {
            $result[] = $row;
        }
        return $result;
    }

    /**
     * @param $deviceID
     * @param $ongoingID
     * @return bool|mixed
     */
    public function checkMachineBusy($deviceID, $ongoingID)
    {
        $query = 'SELECT COUNT(`ID`) FROM `' . $this->getTableName() . '`
         WHERE `deviceID` = :deviceID AND `state` = :state 
        AND `finished` = :finished AND `ID` != :ongoingID ';

        $binds['deviceID'] = $deviceID;
        $binds['state'] = 1;
        $binds['finished'] = 0;
        $binds['ongoingID'] = $ongoingID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $ongoing
     * @return bool|mixed
     */
    public function getNext($ongoing)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '`
         WHERE `itemID` = :itemID 
        AND `finished` = :finished AND `order` > :order AND `inProgress` = 0
         ORDER BY `order` ASC LIMIT 1 ';

        $binds['itemID'] = $ongoing['itemID'];
        $binds['order'] = $ongoing['order'];
        $binds['finished'] = 0;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $itemID
     * @param $operationID
     * @return bool|mixed
     */
    public function checkExist($itemID, $operationID)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '`
         WHERE `itemID` = :itemID 
        AND `operationID` = :operationID
         ORDER BY `order` ASC LIMIT 1 ';

        $binds['itemID'] = $itemID;
        $binds['operationID'] = $operationID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }
}