<?php
/**
 * Created by PhpStorm.
 * User: rafal
 * Date: 19.01.18
 * Time: 13:29
 */

namespace DreamSoft\Models\PrintShopUser;

use DreamSoft\Core\Model;
use PDO;

/**
 * Class UserCalcProductSpecialAttribute
 * @package DreamSoft\Models\PrintShopUser
 */
class UserCalcProductSpecialAttribute extends Model
{
    /**
     * UserCalcProductSpecialAttribute constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('user_calc_product_specialAttributes', true);
    }

    /**
     * @param $ids
     * @return array|bool
     */
    public function getByCalcProductIds($ids)
    {
        if (empty($ids)) {
            return array();
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `calcProductID` IN (' . implode(',', $ids) . ')';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $result = array();
        $res = $this->db->getAll();

        foreach ($res as $each) {
            if (!isset($result[$each['calcProductID']])) {
                $result[$each['calcProductID']] = array();
            }
            $result[$each['calcProductID']][] = $each;
        }

        return $result;
    }


}