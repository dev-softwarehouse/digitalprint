<?php
/**
 * Programmer Rafał Leśniak - 1.9.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 01-09-2017
 * Time: 10:09
 */

namespace DreamSoft\Models\Reclamation;

use DreamSoft\Models\Behaviours\QueryFilter;
use DreamSoft\Core\Model;

/**
 * Class Reclamation
 * @package DreamSoft\Models\Reclamation
 */
class Reclamation extends Model
{

    /**
     * @var QueryFilter
     */
    protected $QueryFilter;

    /**
     * Reclamation constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('reclamations', true);
        $this->QueryFilter = new QueryFilter();
    }


    public function getList($filters = NULL,$offset = 0, $limit = 30,$orderBy = array(), $logicalOperator = 'AND')
    {
        $query='SELECT `'.$this->getTableName().'`.* FROM `'.$this->getTableName().'`
            LEFT JOIN `users` ON `users`.ID = `'.$this->getTableName().'`.userID
             LEFT JOIN `dp_orders` ON `dp_orders`.ID = `'.$this->getTableName().'`.orderID
             LEFT JOIN `dp_products` ON `dp_orders`.ID = `dp_products`.orderID ';

        $prepare = $this->QueryFilter->prepare($filters, $logicalOperator);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if( !empty($where) ){
            $query .= ' WHERE '.substr($where, 4);
        }

        $query .= ' GROUP BY `'.$this->getTableName().'`.ID ASC ';
        if( empty($orderBy) ){
            $query .= ' ORDER BY `'.$this->getTableName().'`.`created` DESC ';
        } else {

            $orderQuery = ' ORDER BY ';
            foreach($orderBy as $ord){
                if( strstr($ord,'.') ){
                    $exp = explode('.', $ord);
                    if( strlen($exp[0]) > 0 ){
                        $sortTable = '`'.$exp[0].'`.';
                    } else {
                        $sortTable = '';
                    }
                    $ord = $exp[1];
                } else {
                    $sortTable = '`'.$this->getTableName().'`.';
                }
                if( substr($ord, 0, 1) == '-' ){
                    $direct = 'DESC';
                    $ord = substr($ord, 1);
                } else {
                    $direct = 'ASC';
                }
                $orderQuery .= ' '.$sortTable.'`'.$ord.'` '.$direct.',';
            }
            $query .= substr($orderQuery, 0, -1);
        }

        $query .= ' LIMIT '.intval($offset).','.intval($limit).' ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    public function count($filters = NULL)
    {
        $query = 'SELECT COUNT(`' . $this->getTableName() . '`.`ID`) as count FROM `'.$this->getTableName().'`
            LEFT JOIN `users` ON `users`.ID = `'.$this->getTableName().'`.userID
             LEFT JOIN `dp_orders` ON `dp_orders`.ID = `'.$this->getTableName().'`.orderID
             LEFT JOIN `dp_products` ON `dp_orders`.ID = `dp_products`.orderID ';


        $prepare = $this->QueryFilter->prepare($filters);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }
        $query .= ' GROUP BY `' . $this->getTableName() . '`.ID ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->rowCount();

    }

    /**
     * @param $orders
     * @return array|bool
     */
    public function getByOrderList($orders)
    {
        if( empty($orders) ){
            return false;
        }
        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `orderID` IN ( ' . implode(',', $orders) . ' ) ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        foreach ($res as $row) {
            $result[$row['orderID']] = $row;
        }
        return $result;
    }
}