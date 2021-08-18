<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 11:20
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;
use Exception;

/**
 * Class OperationDevice
 * @package DreamSoft\Models\ProductionPath
 */
class OperationDevice extends Model
{
    /**
     * OperationDevice constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('operationDevices', $prefix);
    }

    /**
     * @param $operationID
     * @return array|bool
     */
    public function getSelectedDevices($operationID)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.`deviceID` FROM `' . $this->getTableName() . '`
            WHERE `' . $this->getTableName() . '`.`operationID` = :operationID ';

        $binds['operationID'] = $operationID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return array();
        }

        $result = array();

        foreach ($res as $row) {
            $result[] = $row['deviceID'];
        }
        return $result;
    }

    /**
     * @param $operationID
     * @return array|bool
     */
    public function getDevices($operationID)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.`deviceID`, COUNT(`dp_ongoings`.`deviceID`) as count FROM `' . $this->getTableName() . '`
            LEFT JOIN `dp_ongoings` ON `dp_ongoings`.deviceID = `' . $this->getTableName() . '`.`deviceID` AND `dp_ongoings`.finished = 0 
            WHERE `' . $this->getTableName() . '`.`operationID` = :operationID 
            GROUP BY `' . $this->getTableName() . '`.ID '
            . ' ORDER BY count ASC ';

        $binds['operationID'] = $operationID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return array();
        }
        return $res;
    }

    /**
     * @param $deviceID
     * @return array|bool
     */
    public function getSelectedOperations($deviceID)
    {
        $query = 'SELECT `operationID` FROM `' . $this->getTableName() . '` 
            WHERE `deviceID` = :deviceID ';

        $binds['deviceID'] = $deviceID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return array();
        }
        foreach ($res as $row) {
            $result[] = $row['operationID'];
        }
        return $result;
    }

    /**
     * @param $deviceID
     * @param $operationID
     * @return bool
     */
    public function exist($deviceID, $operationID)
    {
        $query = 'SELECT COUNT(*) FROM `' . $this->getTableName() . '` 
            WHERE `deviceID` = :deviceID AND `operationID` = :operationID ';

        $binds[':operationID'] = $operationID;
        $binds[':deviceID'] = $deviceID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $count = $this->db->getOne();
        if ($count > 0) {
            return true;
        }
        return false;
    }

    /**
     * @param $deviceID
     * @param $operationID
     * @return bool
     * @throws Exception
     */
    public function deleteBoth($deviceID, $operationID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `deviceID` = :deviceID AND `operationID` = :operationID ';

        $binds['operationID'] = $operationID;
        $binds['deviceID'] = $deviceID;

        if (!$this->db->exec($query, $binds)) {
            throw new Exception('removed_error');
        }
        return true;
    }
}