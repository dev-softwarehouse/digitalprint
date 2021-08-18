<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-04-2018
 * Time: 13:17
 */

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Core\Model;

/**
 * Class PrintShopFormatVolume
 * @package DreamSoft\Models\PrintShopProduct
 */
class PrintShopFormatVolume extends Model
{
    /**
     * PrintShopFormatVolume constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->prefix = 'ps_';
        $this->setTableName('products_formatVolumes', $prefix);
    }

    /**
     * @param $formatID
     * @return array|bool
     */
    public function getByFormat($formatID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
        WHERE `formatID` = :formatID ';

        $binds['formatID'] = $formatID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }

        return $res;
    }

    /**
     * @param $list
     * @return array|bool
     */
    public function getByFormatList($list)
    {
        if( !$list ) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `formatID` IN ( ' . implode(',', $list) . ' ) ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }
}