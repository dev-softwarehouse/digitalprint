<?php


namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;

/**
 * Class PrintShopConfigPrintTypeWorkspace
 * @package DreamSoft\Models\PrintShopConfig
 */
class PrintShopConfigPrintTypeWorkspace extends PrintShop
{

    /**
     * @var string
     */
    private $workspaceTable;
    private $printTypeWorkspace;
    /**
     * @var string
     */
    private $printTypeTable;

    /**
     * PrintShopConfigPrintTypeWorkspace constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('config_printTypeWorkspaces', true);
        $this->workspaceTable = 'ps_config_workspaces';
        $this->printTypeTable = 'ps_config_printTypes';
        $this->printTypeWorkspace = 'ps_products_printTypeWorkspaces';
    }

    /**
     * @param $printTypeID
     * @param $workspaceID
     * @return bool
     */
    public function exist($printTypeID, $workspaceID)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `printTypeID` = :printTypeID AND `workspaceID` = :workspaceID ';

        $binds['printTypeID'] = $printTypeID;
        $binds['workspaceID'] = $workspaceID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $printTypeID
     * @return bool|array
     */
    public function getByPrintTypeID($printTypeID)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.workspaceID, WS.*
                 FROM `' . $this->getTableName() . '` '
            . ' LEFT JOIN `' . $this->workspaceTable . '` as WS ON `' . $this->getTableName() . '`.workspaceID = WS.ID '
            . ' WHERE `' . $this->getTableName() . '`.`printTypeID` = :printTypeID ';

        $binds['printTypeID'] = $printTypeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $workspaceID
     * @return bool|array
     */
    public function getByWorkspaceID($workspaceID)
    {
        $query = 'SELECT `printTypeID` FROM `' . $this->getTableName() . '` '
            . 'WHERE `workspaceID` = :workspaceID ';

        $binds['workspaceID'] = $workspaceID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

}
