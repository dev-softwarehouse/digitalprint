<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;

/**
 * Description of PrintShopConnectOption
 *
 * @author Rafał
 */
class PrintShopConfigConnectOption extends PrintShop
{

    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_connectOptions', $prefix);
    }

    public function customExist($optionID)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE `optionID` = :optionID ';

        $binds['optionID'] = $optionID;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

    public function set($optionID, $connectOptionID)
    {

        $exist = $this->customExist($optionID);

        if ($exist > 0) {
            $updated = $this->update($exist, 'connectOptionID', $connectOptionID);
            if ($updated) {
                return true;
            }
        } else {
            $params['optionID'] = $optionID;
            $params['connectOptionID'] = $connectOptionID;
            $lastID = $this->create($params);
            if ($lastID > 0) {
                return $lastID;
            }
        }

    }

    public function getByList($list)
    {
        if (empty($list)) {
            return false;
        }
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE optionID IN (' . implode(',', $list) . ') ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();

        if (!$res) {
            return false;
        }
        $result = array();
        foreach ($res as $row) {
            $result[$row['optionID']] = $row['connectOptionID'];
        }
        return $result;
    }

    public function deleteBy($optionID, $connectOptionID)
    {
        $query = ' DELETE FROM `' . $this->getTableName() . '` WHERE `optionID` = :optionID AND `connectOptionID` = :connectOptionID ';

        $binds['optionID'] = $optionID;
        $binds['connectOptionID'] = $connectOptionID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }
}
