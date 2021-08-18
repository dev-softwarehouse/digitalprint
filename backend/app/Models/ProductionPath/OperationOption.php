<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 11:22
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;
use Exception;

/**
 * Class OperationOption
 * @package DreamSoft\Models\ProductionPath
 */
class OperationOption extends Model
{
    /**
     * OperationOption constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('operationOptions', $prefix);
    }

    /**
     * @param $operationID
     * @return array|bool
     */
    public function getSelectedOptions($operationID)
    {
        $query = 'SELECT `optionID` FROM `' . $this->getTableName() . '` 
            WHERE `operationID` = :operationID ';

        $binds['operationID'] = $operationID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return array();
        }
        foreach ($res as $row) {
            $result[] = $row['optionID'];
        }
        return $result;
    }

    /**
     * @param $optionID
     * @return array|bool
     */
    public function getSelectedOperations($optionID)
    {

        $query = 'SELECT `' . $this->getTableName() . '`.`operationID`, 
                GROUP_CONCAT(DISTINCT OOC.controllerID SEPARATOR ";") as controllers
            FROM `' . $this->getTableName() . '` 
            LEFT JOIN `dp_operationOptionControllers` as OOC 
                ON OOC.operationID = `' . $this->getTableName() . '`.operationID
                AND OOC.optionID = `' . $this->getTableName() . '`.optionID
            WHERE `' . $this->getTableName() . '`.`optionID` = :optionID 
            GROUP BY `' . $this->getTableName() . '`.ID ';


        $binds['optionID'] = $optionID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return array();
        }
        $result = array();
        foreach ($res as $row) {
            if (!empty($row['controllers'])) {
                $row['controllers'] = explode(';', $row['controllers']);
            } else {
                $row['controllers'] = array();
            }
            $result[$row['operationID']] = $row;
        }
        return $result;
    }

    /**
     * @param $optionID
     * @param $operationID
     * @return bool
     */
    public function exist($optionID, $operationID)
    {
        $query = 'SELECT COUNT(*) FROM `' . $this->getTableName() . '` 
            WHERE `optionID` = :optionID AND `operationID` = :operationID ';

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
     * @return bool
     * @throws Exception
     */
    public function deleteBoth($optionID, $operationID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `optionID` = :optionID AND `operationID` = :operationID ';

        $binds['operationID'] = $operationID;
        $binds['optionID'] = $optionID;

        if (!$this->db->exec($query, $binds)) {
            throw new Exception('removed_error');
        }
        return true;
    }

    /**
     * @param $options
     * @param $operations
     * @return array|bool
     */
    public function getPairs($options, $operations)
    {
        if( !$options || !$operations ) {
            return false;
        }
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
            WHERE `optionID` IN ('.implode(',', $options).') AND `operationID` IN ('.implode(',', $operations).') ';

        if (!$this->db->exec($query)) {
            return false;
        }
        return $this->db->getAll();
    }
}