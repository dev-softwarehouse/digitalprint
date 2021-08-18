<?php
/**
 * Programmer Rafał Leśniak - 29.1.2018
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 29-01-2018
 * Time: 11:07
 */

namespace DreamSoft\Models\Authorization;

use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\QueryFilter;

class AuthorizationLog extends Model
{
    /**
     * @var QueryFilter
     */
    protected $QueryFilter;

    /**
     * AuthorizationLog constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('authorizationLogs', true);
        $this->QueryFilter = new QueryFilter();
    }

    /**
     * @param $filters
     * @param int $offset
     * @param int $limit
     * @param array $orderBy
     * @param string $logicalOperator
     * @return bool
     */
    public function getList($filters, $offset = 0, $limit = 30, $orderBy = array(), $logicalOperator = 'AND')
    {
        $query = 'SELECT authorizationLogs.* '
            . ' FROM `' . $this->getTableName() . '` as authorizationLogs ';


        $prepare = $this->QueryFilter->prepare($filters, $logicalOperator);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }

        $query .= ' GROUP BY authorizationLogs.ID ASC ';
        if (empty($orderBy)) {
            $query .= ' ORDER BY authorizationLogs.`created` DESC ';
        } else {

            $orderQuery = ' ORDER BY ';
            foreach($orderBy as $ord){
                if( substr($ord, 0, 1) == '-' ){
                    $direct = 'DESC';
                    $ord = substr($ord, 1);
                } else {
                    $direct = 'ASC';
                }
                $orderQuery .= ' authorizationLogs.`'.$ord.'` '.$direct.',';
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

        $query = 'SELECT authorizationLogs.ID '
            . ' FROM `' . $this->getTableName() . '` as authorizationLogs ';

        $prepare = $this->QueryFilter->prepare($filters);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }

        $query .= ' GROUP BY authorizationLogs.ID ASC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->rowCount();

    }
}