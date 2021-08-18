<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 28-03-2018
 * Time: 13:40
 */

namespace DreamSoft\Models\CustomProduct;

use DreamSoft\Core\Model;

class CustomProductFile extends Model
{
    /**
     * CustomProduct constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('customProductFiles', true);
    }

    public function getByCustomProductList($customProducts)
    {
        if (empty($customProducts)) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `customProductID` IN ( ' . implode(',', $customProducts) . ' ) ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        foreach ($res as $row) {
            $result[$row['customProductID']][] = $row;
        }
        return $result;
    }
}