<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Description of PrintShopPrintType
 *
 * @author Właściciel
 */
class PrintShopConfigPrintType extends PrintShop
{

    private $joinWorkspacesTable;

    /**
     * PrintShopConfigPrintType constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_printTypes', $prefix);
        $this->joinWorkspacesTable = 'ps_config_printTypeWorkspaces';
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {

        $query = 'SELECT * FROM `ps_config_printTypes` WHERE `printTypeID` IS NULL ';

        if (!$this->db->exec($query)) return false;

        $result = $this->db->getAll(PDO::FETCH_ASSOC);

        $query = 'SELECT * FROM `ps_config_printTypeWorkspaces` ';
        if (!$this->db->exec($query)) return false;
        $workspaces = $this->db->getAll(PDO::FETCH_ASSOC);

        $groupWorkspaces = array();
        if (!empty($workspaces)) {
            foreach ($workspaces as $workspace) {
                if (!isset($groupWorkspaces[$workspace['printTypeID']])) {
                    $groupWorkspaces[$workspace['printTypeID']] = array();
                }
                $groupWorkspaces[$workspace['printTypeID']][] = $workspace['workspaceID'];
            }
        }
        foreach ($result as $key => $printType) {
            $result[$key]['workspaces'] = array();
            if (isset($groupWorkspaces[$printType['ID']])) {
                $result[$key]['workspaces'] = $groupWorkspaces[$printType['ID']];
            }
            if (!empty($printType['workspaceID']) && array_key_exists('workspaces', $printType) &&
                !in_array($printType['workspaceID'], $printType['workspaces'])) {
                $result[$key]['workspaces'][] = $printType['workspaceID'];
            }
        }

        return $result;

    }

    /**
     * @param $name
     * @param $workspaceID
     * @param $pricelistID
     * @return bool|string
     */
    public function customCreate($name, $workspaceID, $pricelistID)
    {
        return self::create(compact('name', 'workspaceID', 'pricelistID'));
    }

    /**
     * @param $id
     * @param $name
     * @param $workspaceID
     * @param $pricelistID
     * @return bool
     */
    public function customUpdate($id, $name, $workspaceID, $pricelistID)
    {
        $query = 'UPDATE `' . $this->getTableName() . '` 
            SET `name` = :name, `workspaceID` = :workspaceID, `pricelistID` = :pricelistID
            WHERE `ID` = :id
            ';

        $binds[':id'] = $id;
        $binds[':name'] = $name;
        $binds[':workspaceID'] = $workspaceID;
        $binds[':pricelistID'] = $pricelistID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $id
     * @return bool|mixed
     */
    public function getOne($id)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `ID` = :id ';

        $binds[':id'] = $id;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @return array|bool
     */
    public function getSpecial()
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `printTypeID` IS NOT NULL ';

        if (!$this->db->exec($query)) return false;
        return $this->db->getAll(PDO::FETCH_ASSOC);

    }

}
