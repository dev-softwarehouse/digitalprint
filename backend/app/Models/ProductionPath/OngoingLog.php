<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 10:45
 */

namespace DreamSoft\Models\ProductionPath;

use DateTime;
use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\QueryFilter;
use Exception;

class OngoingLog extends Model
{
    /**
     * @var string
     */
    private $ongoings;
    /**
     * @var QueryFilter
     */
    private $QueryFilter;

    public function __construct()
    {
        parent::__construct();
        $this->QueryFilter = new QueryFilter();
        $prefix = true;
        $this->setTableName('ongoingLogs', $prefix);
        $this->ongoings = $this->prefix . 'ongoings';
    }

    /**
     * @param $itemID
     * @return array|bool
     * @throws Exception
     */
    public function getByOrderID($itemID)
    {
        $result = array();

        $query = 'SELECT `' . $this->getTableName() . '`.*,`users`.name, '
            . ' `users`.lastname, `users`.user, `dp_operations`.name as operationName  FROM `' . $this->getTableName() . '` '
            . ' LEFT JOIN `dp_ongoings` ON `dp_ongoings`.ID = `' . $this->getTableName() . '`.ongoingID   '
            . ' LEFT JOIN `dp_operators` ON `dp_operators`.ID = `' . $this->getTableName() . '`.operatorID '
            . ' LEFT JOIN `users` ON `users`.ID = `dp_operators`.uID '
            . ' LEFT JOIN `dp_operations` ON `dp_operations`.ID = `dp_ongoings`.operationID '
            . ' WHERE `dp_ongoings`.`itemID` = :itemID '
            . ' GROUP BY `' . $this->getTableName() . '`.ID'
            . ' ORDER BY `' . $this->getTableName() . '`.date ASC  ';
        $binds['itemID'] = $itemID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        foreach ($res as $key => $row) {

            $date = new DateTime($row['date']);
            $row['timestamp'] = $date->format('U');
            $result[] = $row;
        }
        return $result;

    }

    /**
     * @param $ongoingID
     * @return array|bool
     */
    public function getByOngoingID($ongoingID)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.* FROM `' . $this->getTableName() . '`'
            . ' WHERE `' . $this->getTableName() . '`.ongoingID = :ongoingID ';

        $binds['ongoingID'] = $ongoingID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();
        if (!$res) return false;
        return $res;
    }

    /**
     * @param $ongoings
     * @param null $operatorID
     * @return array|bool
     */
    public function getLogsByOngoings($ongoings, $operatorID = NULL)
    {

        if (empty($ongoings)) {
            return false;
        }
        $query = ' SELECT * FROM `' . $this->getTableName() . '` WHERE `ongoingID` IN (' . implode(',', $ongoings) . ') ';

        if( $operatorID !== NULL ) {
            $query .= ' AND `operatorID` = :operatorID ';
            $binds['operatorID'] = $operatorID;
        }

        $query .=  ' ORDER BY `date` ASC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        $result = array();
        foreach ($res as $key => $val) {
            $result[$val['ongoingID']][] = $val;
        }

        return $result;
    }
}