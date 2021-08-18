<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Class PrintShopConfigWorkspace
 * @package DreamSoft\Models\PrintShopConfig
 */
class PrintShopConfigWorkspace extends PrintShop
{

    /**
     * @var string
     */
    protected $tableWorkspaceTypes;

    /**
     * PrintShopConfigWorkspace constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('config_workspaces', $prefix);
        if ($prefix) {
            $this->tableWorkspaceTypes = $this->prefix . 'workspaceTypes';
        }
    }

    /**
     * @return array|bool
     */
    public function getAllTypes()
    {
        $query = 'SELECT * FROM `' . $this->tableWorkspaceTypes . '` ';

        if (!$this->db->exec($query)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $id
     * @return bool|mixed
     */
    public function getType($id)
    {
        $query = 'SELECT * FROM `' . $this->tableWorkspaceTypes . '` WHERE `ID` = :id ';

        $binds[':id'] = $id;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $id
     * @param $name
     * @param $paperWidth
     * @param $paperHeight
     * @param $width
     * @param $height
     * @param $type
     * @return bool
     */
    public function customUpdate($id, $name, $paperWidth, $paperHeight, $width, $height, $type)
    {
        $query = 'UPDATE `' . $this->getTableName() . '` 
            SET `name` = :name,
            `width` = :width,
            `height` = :height,
            `paperWidth` = :paperWidth,
            `paperHeight` = :paperHeight,
            `type` = :type
            WHERE ID = :id
            ';

        $binds['id'] = $id;
        $binds['name'] = $name;
        $binds['width'] = $width;
        $binds['height'] = $height;
        $binds['paperWidth'] = $paperWidth;
        $binds['paperHeight'] = $paperHeight;
        $binds['type'] = $type;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;

    }
}

?>
