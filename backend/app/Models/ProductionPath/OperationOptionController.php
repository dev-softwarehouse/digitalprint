<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 11:27
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;
use Exception;

/**
 * Class OperationOptionController
 * @package DreamSoft\Models\ProductionPath
 */
class OperationOptionController extends Model
{
    /**
     * OperationOptionController constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('operationOptionControllers', $prefix);
    }

    /**
     * @param $optionID
     * @param $operationID
     * @return array|bool
     */
    public function getSelectedControllers($optionID, $operationID)
    {
        $query = 'SELECT `controllerID` FROM `' . $this->getTableName() . '` 
            WHERE `operationID` = :operationID AND `optionID` = :optionID ';

        $binds['operationID'] = $operationID;
        $binds['optionID'] = $optionID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return array();
        }
        foreach ($res as $row) {
            $result[] = $row['controllerID'];
        }
        return $result;
    }

    /**
     * @param $optionID
     * @param $operationID
     * @param $controllerID
     * @return bool
     */
    public function customExist($optionID, $operationID, $controllerID)
    {
        $query = 'SELECT COUNT(*) FROM `' . $this->getTableName() . '` 
            WHERE `operationID` = :operationID AND `optionID` = :optionID
            AND `controllerID` = :controllerID ';

        $binds[':controllerID'] = $controllerID;
        $binds[':operationID'] = $operationID;
        $binds[':optionID'] = $optionID;

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
     * @param $optionID
     * @param $operationID
     * @param null $controllerID
     * @return bool
     * @throws Exception
     */
    public function deleteOne($optionID, $operationID, $controllerID = null)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `operationID` = :operationID AND optionID = :optionID ';

        if ($controllerID !== null) {
            $query .= ' AND `controllerID` = :controllerID ';
            $binds['controllerID'] = $controllerID;
        }

        $binds['optionID'] = $optionID;
        $binds['operationID'] = $operationID;

        if (!$this->db->exec($query, $binds)) {
            throw new Exception('not_removed');
        }
        return true;
    }
}