<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 08-06-2018
 * Time: 11:43
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;

/**
 * Class OperationProcess
 * @package DreamSoft\Models\ProductionPath
 */
class OperationProcess extends Model
{

    private $processTable;

    /**
     * OperationProcess constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('operationProcesses', $prefix);
        $this->processTable = $this->prefix . 'processes';
    }

    /**
     * @param $operationID
     * @return array|bool
     */
    public function getSelectedProcesses($operationID)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.`processID` FROM `' . $this->getTableName() . '`
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
            $result[] = $row['processID'];
        }
        return $result;
    }

    /**
     * @param $processID
     * @param $operationID
     * @return bool
     */
    public function relationExist($processID, $operationID)
    {
        $query = 'SELECT COUNT(*) FROM `' . $this->getTableName() . '` 
            WHERE `processID` = :processID AND `operationID` = :operationID ';

        $binds[':operationID'] = $operationID;
        $binds[':processID'] = $processID;

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
     * @param $operationID
     * @return array|int
     */
    public function getFirstProcessOnOperation($operationID)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.`processID`, `'.$this->processTable.'`.order FROM `' . $this->getTableName() . '`
            LEFT JOIN `'.$this->processTable.'` ON `'.$this->processTable.'`.ID = `' . $this->getTableName() . '`.processID
            WHERE `' . $this->getTableName() . '`.`operationID` = :operationID  ';

        $binds['operationID'] = $operationID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $result = $this->db->getAll();
        if( !$result ) {
            return false;
        }

        $first = false;
        foreach($result as $row) {
            if( !$first || $first['order'] > $row['order'] ) {
                $first = $row;
            }
        }

        if( !$first ) {
            return false;
        }

        return $first['processID'];
    }
}