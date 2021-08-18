<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 26-04-2018
 * Time: 13:21
 */

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Core\Model;

/**
 * Class PrintShopPrintTypeWorkspace
 * @package DreamSoft\Models\PrintShopProduct
 */
class PrintShopPrintTypeWorkspace extends Model
{
    /**
     * PrintShopPrintType constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('products_printTypeWorkspaces', true);
    }

    /**
     * @param $printTypeID
     * @param $formatID
     * @return bool
     */
    public function deleteByParams($printTypeID, $formatID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE 
                  `formatID` = :formatID AND `printTypeID` = :printTypeID ';

        $binds['formatID'] = $formatID;
        $binds['printTypeID'] = $printTypeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $printTypeID
     * @param $formatID
     * @return array|bool
     */
    public function getByParams($printTypeID, $formatID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE 
                  `formatID` = :formatID AND `printTypeID` = :printTypeID ';

        $binds['formatID'] = $formatID;
        $binds['printTypeID'] = $printTypeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        if( !$res ) {
            return false;
        }

        $result = array();
        foreach ($res as $row) {
            $result[$row['workspaceID']] = $row;
        }

        return $result;
    }

    /**
     * @param $printTypes
     * @param $formats
     * @return array|bool
     */
    public function getByAggregateData($printTypes, $formats)
    {
        if( !($printTypes && $formats) ) {
            return false;
        }
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE 
                  `formatID` IN ('. implode(',', $formats) .') 
                  AND `printTypeID` IN (' . implode(',', $printTypes) . ') ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if( !$res ) {
            return false;
        }

        $result = array();

        foreach ($res as $row) {
            $result[$row['formatID']][$row['printTypeID']][$row['workspaceID']] = $row;
        }

        return $result;
    }

}