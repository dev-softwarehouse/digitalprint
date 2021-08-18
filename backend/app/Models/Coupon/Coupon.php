<?php
/**
 * Programista Rafał Leśniak - 20.6.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 20-06-2017
 * Time: 16:35
 */

namespace DreamSoft\Models\Coupon;


use DreamSoft\Models\Behaviours\QueryFilter;
use DreamSoft\Core\Model;

/**
 * Class Coupon
 * @package DreamSoft\Models\Coupon
 */
class Coupon extends Model
{
    /**
     * @var QueryFilter
     */
    protected $QueryFilter;

    /**
     * Coupon constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('coupons', true);
        $this->QueryFilter = new QueryFilter();
    }

    /**
     * @param $filters
     * @param int $offset
     * @param int $limit
     * @param array $orderBy
     * @param string $logicalOperator
     * @return bool|array
     */
    public function getList($filters, $offset = 0, $limit = 30, $orderBy = array(), $logicalOperator = 'AND')
    {
        $query = 'SELECT coupons.* '
            . ' FROM `' . $this->getTableName() . '` as coupons ';

        $prepare = $this->QueryFilter->prepare($filters, $logicalOperator);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }

        $query .= ' GROUP BY coupons.ID ASC ';
        if (empty($orderBy)) {
            $query .= ' ORDER BY coupons.`created` DESC ';
        } else {

            $orderQuery = ' ORDER BY ';
            foreach($orderBy as $ord){
                if( substr($ord, 0, 1) == '-' ){
                    $direct = 'DESC';
                    $ord = substr($ord, 1);
                } else {
                    $direct = 'ASC';
                }
                $orderQuery .= ' coupons.`'.$ord.'` '.$direct.',';
            }
            $query .= substr($orderQuery, 0, -1);
        }

        $query .= ' LIMIT ' . intval($offset) . ',' . intval($limit) . ' ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $filters
     * @return bool
     */
    public function count($filters)
    {

        $query = 'SELECT coupons.ID '
            . ' FROM `' . $this->getTableName() . '` as coupons ';

        $prepare = $this->QueryFilter->prepare($filters);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }

        $query .= ' GROUP BY coupons.ID ASC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->rowCount();

    }

    public function getByList($list)
    {
        if (empty($list)) {
            return false;
        }

        foreach ($list as $key => $ID) {
            $list[$key] = '"' . $ID . '"';
        }

        return parent::getByList($list);
    }
}