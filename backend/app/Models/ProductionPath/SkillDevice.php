<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 12:04
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;

/**
 * Class SkillDevice
 * @package DreamSoft\Models\ProductionPath
 */
class SkillDevice extends Model
{
    /**
     * SkillDevice constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('skillDevices', true);
    }

    /**
     * @param $skillID
     * @param $deviceID
     * @return bool|mixed
     */
    public function exist($skillID, $deviceID)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `skillID` = :skillID AND `deviceID` = :deviceID ';

        $binds[':skillID'] = $skillID;
        $binds[':deviceID'] = $deviceID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $skillID
     * @return array|bool
     */
    public function getBySkillID($skillID)
    {
        $query = 'SELECT `deviceID` FROM `' . $this->getTableName() . '` WHERE `skillID` = :skillID ';

        $binds[':skillID'] = $skillID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $deviceID
     * @return array|bool
     */
    public function getByDeviceID($deviceID)
    {
        $query = 'SELECT `skillID` FROM `' . $this->getTableName() . '` WHERE `deviceID` = :deviceID ';

        $binds[':deviceID'] = $deviceID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $userID
     * @return array|bool
     */
    public function getByUserID($userID)
    {
        $query = 'SELECT sd.`deviceID` FROM `' . $this->getTableName() . '` as sd '
            . ' LEFT JOIN `dp_operatorSkills` as os ON os.skillID = sd.skillID '
            . ' LEFT JOIN `dp_operators` as op ON op.ID = os.operatorID '
            . ' WHERE op.`uID` = :userID ';

        $binds[':userID'] = $userID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $result = array();
        $res = $this->db->getAll();
        if (!empty($res)) {
            foreach ($res as $row) {
                $result[] = $row['deviceID'];
            }
        }
        return $result;
    }
}