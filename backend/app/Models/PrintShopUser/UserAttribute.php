<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 12:35
 */

namespace DreamSoft\Models\PrintShopUser;

use DreamSoft\Core\Model;

/**
 * Class UserAttribute
 * @package DreamSoft\Models\PrintShopUser
 */
class UserAttribute extends Model
{
    /**
     * UserAttribute constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_user_';
        $this->setTableName('attributes', true);
    }

    /**
     * @param $orderID
     * @return array|bool
     */
    public function getByOrder($orderID)
    {
        $query = 'SELECT ua.attrPages, '
            . ' ca.ID as attrID, '
            . ' ca.name as attrName, '
            . ' co.name as optName, '
            . ' co.ID as optID FROM `' . $this->getTableName() . '` as ua '
            . ' LEFT JOIN `ps_config_attributes` ca ON ca.ID = ua.attributeID '
            . ' LEFT JOIN `ps_config_options` co ON co.ID = ua.optionID '
            . ' WHERE ua.orderID = :orderID ';
        $binds['orderID'] = $orderID;

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
     * @param $orders
     * @return array|bool
     */
    public function getByOrderList($orders)
    {
        if (empty($orders)) {
            return false;
        }
        $query = 'SELECT ua.attrPages, '
            . ' ca.ID as attrID, '
            . ' ca.name as attrName, '
            . ' co.name as optName, '
            . ' co.ID as optID,'
            . ' ua.orderID as orderID FROM `' . $this->getTableName() . '` as ua '
            . ' LEFT JOIN `ps_config_attributes` ca ON ca.ID = ua.attributeID '
            . ' LEFT JOIN `ps_config_options` co ON co.ID = ua.optionID '
            . ' WHERE ua.orderID IN (' . implode(',', $orders) . ') ';
        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        if (!$res) {
            return false;
        } else {

            foreach ($res as $row) {
                $result[$row['orderID']][] = $row;
            }
        }

        return $result;
    }
}