<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 11:51
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;

class SameDevice extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('sameDevices', true);
    }

    /**
     * @param $deviceA
     * @param $deviceB
     * @return bool|mixed
     */
    public function exist($deviceA, $deviceB)
    {

        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE (`deviceA` = :deviceA AND `deviceB` = :deviceB) OR '
            . ' (`deviceB` = :deviceA AND `deviceA` = :deviceB) ';

        $binds['deviceA'] = $deviceA;
        $binds['deviceB'] = $deviceB;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $deviceID
     * @return array|bool
     */
    public function getSameDevices($deviceID)
    {
        $query = 'SELECT `deviceA`,`deviceB` FROM `' . $this->getTableName() . '` WHERE `deviceA` = :deviceID OR'
            . ' `deviceB` = :deviceID ';
        $binds['deviceID'] = $deviceID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (empty($res)) {
            return false;
        }
        $devices = array();
        foreach ($res as $row) {
            if ($row['deviceA'] == $row['deviceB']) {
                continue;
            }
            if ($deviceID == $row['deviceA']) {
                $devices[] = $row['deviceB'];
            } else {
                $devices[] = $row['deviceA'];
            }
        }
        return $devices;
    }
}