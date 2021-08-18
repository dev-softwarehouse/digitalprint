<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 07-06-2018
 * Time: 15:01
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;

/**
 * Class Process
 * @package DreamSoft\Models\ProductionPath
 */
class Process extends Model
{
    /**
     * Process constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('processes', true);
    }

    /**
     * @return bool|int
     */
    public function getMaxOrder()
    {
        $query = ' SELECT MAX(process.`order`) FROM `' . $this->getTableName() . '` as process LIMIT 1';
        if (!$this->db->exec($query)) {
            return false;
        }
        return $this->db->getOne();
    }

    /**
     * @param $operations
     * @return array|bool
     */
    public function getByOperationList($operations)
    {
        if (empty($operations)) {
            return false;
        }
        $query = ' SELECT `' . $this->getTableName() . '`.*, `dp_operationProcesses`.operationID FROM `' . $this->getTableName() . '` 
        LEFT JOIN `dp_operationProcesses` ON `dp_operationProcesses`.processID = `' . $this->getTableName() . '`.ID
        WHERE `dp_operationProcesses`.`operationID` IN (' . implode(',', $operations) . ') ';

        $query .=  '
        GROUP BY `' . $this->getTableName() . '`.ID
        ORDER BY `order` ASC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        $result = array();
        foreach ($res as $key => $val) {
            $result[$val['operationID']][] = $val;
        }

        return $result;
    }

    /**
     * @param $statuses
     * @return bool|array
     */
    public function sort($statuses)
    {
        $result = true;
        foreach ($statuses as $index => $ID) {
            if (empty($ID)) {
                continue;
            }

            $query = 'UPDATE `' . $this->getTableName() . '` SET `order` = :index WHERE `ID` = :ID ';

            $binds['ID'] = array($ID, 'int');
            $binds['index'] = $index;
            if (!$this->db->exec($query, $binds)) {
                $result = false;
            }
        }
        return $result;
    }
}