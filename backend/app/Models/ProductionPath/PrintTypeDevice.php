<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 11:47
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;
/**
 * Class PrintTypeDevice
 * @package DreamSoft\Models\ProductionPath
 */
class PrintTypeDevice extends Model
{
    /**
     * @var string
     */
    protected $printTypeTable;
    /**
     * @var string
     */
    protected $deviceTable;

    /**
     * PrintTypeDevice constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('printTypeDevices', true);
        $this->deviceTable = $this->prefix . 'devices';
        $this->printTypeTable = 'ps_config_printTypes';
    }

    /**
     * @param $printTypeID
     * @param $deviceID
     * @return bool
     */
    public function exist($printTypeID, $deviceID)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `printTypeID` = :printTypeID AND `deviceID` = :deviceID ';

        $binds[':printTypeID'] = $printTypeID;
        $binds[':deviceID'] = $deviceID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $printTypeID
     * @return bool
     */
    public function getByPrintTypeID($printTypeID)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.deviceID FROM `' . $this->getTableName() . '` '
            . ' WHERE `' . $this->getTableName() . '`.`printTypeID` = :printTypeID ';

        $binds[':printTypeID'] = $printTypeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $deviceID
     * @return bool
     */
    public function getByDeviceID($deviceID)
    {
        $query = 'SELECT `printTypeID` FROM `' . $this->getTableName() . '` '
            . 'WHERE `deviceID` = :deviceID ';

        $binds[':deviceID'] = $deviceID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }
}