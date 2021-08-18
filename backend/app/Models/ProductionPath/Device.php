<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 10:16
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;

/**
 * Class Device
 * @package DreamSoft\Models\ProductionPath
 */
class Device extends Model
{
    /**
     * Device constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('devices', true);
    }

    /**
     * @param $operatorID
     * @return array|bool
     */
    public function countAll($operatorID = NULL)
    {
        $query = ' SELECT `' . $this->getTableName() . '`.ID,COUNT(`dp_ongoings`.ID) as countTasks FROM `' . $this->getTableName() . '` '
            . ' LEFT JOIN `dp_ongoings` ON `dp_ongoings`.deviceID = `' . $this->getTableName() . '`.ID '
            . ' LEFT JOIN `orders` ON `orders`.ID = `dp_ongoings`.`itemID` '
            . ' WHERE `dp_ongoings`.finished = 0 AND `dp_ongoings`.inProgress = 1 ';


        $binds = array();

        if( $operatorID !== NULL ) {
            $query .= ' AND `dp_ongoings`.operatorID = :operatorID ';
            $binds['operatorID'] = $operatorID;
        }

        $query .= ' GROUP BY `' . $this->getTableName() . '`.ID ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        $result = array();

        foreach ($res as $row) {
            $result[] = $row;
        }
        return $result;
    }

    /**
     * @param null $devices
     * @return array|bool
     */
    public function getAll($devices = NULL)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` ';

        if (is_array($devices) && !empty($devices)) {
            $query .= ' WHERE `ID` IN (' . implode(',', $devices) . ') ';
        }

        $binds = array();
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
     * @return bool|mixed
     */
    public function getMaxSort()
    {
        $query = ' SELECT MAX(devices.`sort`) FROM `' . $this->getTableName() . '` as devices LIMIT 1';
        if (!$this->db->exec($query)) {
            return false;
        }
        return $this->db->getOne();
    }

    /**
     * @param $devices
     * @return bool|array
     */
    public function sort($devices)
    {
        $result = true;
        foreach ($devices as $index => $ID) {
            if (empty($ID)) {
                continue;
            }

            $query = 'UPDATE `' . $this->getTableName() . '` SET `sort` = :index WHERE `ID` = :ID ';

            $binds['ID'] = array($ID, 'int');
            $binds['index'] = $index+1;
            if (!$this->db->exec($query, $binds)) {
                $result = false;
            }
        }
        return $result;
    }
}