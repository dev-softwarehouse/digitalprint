<?php

namespace DreamSoft\Models\Template;
/**
 * Description of Template
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\QueryFilter;

class TemplateRoot extends Model {

    /**
     * @var QueryFilter
     */
    protected $QueryFilter;

    /**
     * TemplateRoot constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $this->QueryFilter = new QueryFilter();
        $this->setTableName('templates', true);
    }

    /**
     * @param null $filters
     * @param int $offset
     * @param int $limit
     * @param array $orderBy
     * @return bool
     */
    public function getList($filters = NULL, $offset = 0, $limit = 30, $orderBy = array())
    {

        $query = 'SELECT t.*  FROM `dp_templates` as t ';

        $prepare = $this->QueryFilter->prepare($filters);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }
        $query .= ' GROUP BY t.ID ASC ';
        if (empty($orderBy)) {
            $query .= ' ORDER BY t.`created` DESC ';
        } else {
            $orderQuery = ' ORDER BY ';
            foreach ($orderBy as $ord) {
                if (substr($ord, 0, 1) == '-') {
                    $direct = 'DESC';
                    $ord = substr($ord, 1);
                } else {
                    $direct = 'ASC';
                }
                $orderQuery .= ' t.`' . $ord . '` ' . $direct . ',';
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
     * @param $templateList
     * @return bool
     */
    public function getByList($templateList)
    {

        if (empty($templateList)) {
            return false;
        }

        $query = ' SELECT t.* FROM  `' . $this->getTableName() . '` as t '
            . ' WHERE t.`ID` IN (' . implode(',', $templateList) . ')  ';

        if (!$this->db->exec($query)) {
            return false;
        }

        return $this->db->getAll();

    }
    
}
