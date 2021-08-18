<?php

namespace DreamSoft\Models\Offer;
/**
 * Description of Offer
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\QueryFilter;

class Offer extends Model
{

    private $QueryFilter;

    /**
     * Offer constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'dp_';
        $this->setTableName('offers', true);
        $this->QueryFilter = new QueryFilter();
    }

    /**
     * @param $companyID
     */
    public function setRemote($companyID)
    {
        parent::__construct(false, $companyID);
    }

    /**
     * @param null $filters
     * @param int $offset
     * @param int $limit
     * @param array $orderBy
     * @return array|bool
     */
    public function getList($filters = NULL, $offset = 0, $limit = 30, $orderBy = array())
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*, `users`.`user`, `users`.`name` as userName, `users`.`lastname` as userLastname ';
        $query .= ' FROM `' . $this->getTableName() . '` ';
        $query .= ' LEFT JOIN `users` ON `' . $this->getTableName() . '`.`uID` = `users`.`ID` ';

        $prepare = $this->QueryFilter->prepare($filters);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }

        if (empty($orderBy)) {
            $query .= ' ORDER BY `' . $this->getTableName() . '`.`created` DESC ';
        } else {
            $orderQuery = ' ORDER BY ';
            foreach ($orderBy as $ord) {
                if (substr($ord, 0, 1) == '-') {
                    $direct = 'DESC';
                    $ord = substr($ord, 1);
                } else {
                    $direct = 'ASC';
                }
                $orderQuery .= ' `' . $this->getTableName() . '`.`' . $ord . '` ' . $direct . ',';
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
     * @return bool|int
     */
    public function count($filters = NULL)
    {
        $query = 'SELECT COUNT(`' . $this->getTableName() . '`.`ID`) as count '
            . ' FROM `' . $this->getTableName() . '` ';

        $query .= ' LEFT JOIN `users` ON `' . $this->getTableName() . '`.`uID` = `users`.`ID` ';

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

    public function getFinished($finished = 0, $userID = NULL)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE finished = :finished ';

        if ($userID) {
            $query .= ' AND `uID` = :uID ';
            $binds['uID'] = $userID;
        }
        $binds[':finished'] = $finished;
        $this->db->exec($query, $binds);
        return $this->db->getRow();
    }
}
