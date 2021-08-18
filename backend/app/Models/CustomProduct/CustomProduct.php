<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 28-03-2018
 * Time: 13:39
 */

namespace DreamSoft\Models\CustomProduct;

use DreamSoft\Models\Behaviours\QueryFilter;
use DreamSoft\Core\Model;

class CustomProduct extends Model
{
    /**
     * @var QueryFilter
     */
    protected $QueryFilter;

    /**
     * CustomProduct constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('customProducts', true);
        $this->QueryFilter = new QueryFilter();
    }

    /**
     * @param null $filters
     * @param int $offset
     * @param int $limit
     * @param array $orderBy
     * @param string $logicalOperator
     * @return bool
     */
    public function getList($filters = NULL, $offset = 0, $limit = 30, $orderBy = array(), $logicalOperator = 'AND')
    {
        $query = 'SELECT `' . $this->getTableName() . '`.* FROM `' . $this->getTableName() . '`
            LEFT JOIN `users` ON `users`.ID = `' . $this->getTableName() . '`.userID ';

        $prepare = $this->QueryFilter->prepare($filters, $logicalOperator);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }

        $query .= ' GROUP BY `' . $this->getTableName() . '`.ID ASC ';
        if (empty($orderBy)) {
            $query .= ' ORDER BY `' . $this->getTableName() . '`.`created` DESC ';
        } else {

            $orderQuery = ' ORDER BY ';
            foreach ($orderBy as $ord) {
                if (strstr($ord, '.')) {
                    $exp = explode('.', $ord);
                    if (strlen($exp[0]) > 0) {
                        $sortTable = '`' . $exp[0] . '`.';
                    } else {
                        $sortTable = '';
                    }
                    $ord = $exp[1];
                } else {
                    $sortTable = '`' . $this->getTableName() . '`.';
                }
                if (substr($ord, 0, 1) == '-') {
                    $direct = 'DESC';
                    $ord = substr($ord, 1);
                } else {
                    $direct = 'ASC';
                }
                $orderQuery .= ' ' . $sortTable . '`' . $ord . '` ' . $direct . ',';
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
     * @param null $filters
     * @return bool
     */
    public function count($filters = NULL)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.* FROM `' . $this->getTableName() . '`
            LEFT JOIN `users` ON `users`.ID = `' . $this->getTableName() . '`.userID ';

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
}