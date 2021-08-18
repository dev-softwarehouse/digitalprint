<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 11:19
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;

class Operation extends Model
{
    /**
     * Operation constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('operations', $prefix);
    }

    /**
     * @param $operations
     * @return bool
     */
    public function sort($operations)
    {
        $result = true;
        foreach ($operations as $index => $operationID) {

            $query = 'UPDATE `' . $this->getTableName() . '` SET `order` = :index WHERE `ID` = :operationID ';

            $binds[':operationID'] = array($operationID, 'int');
            $binds[':index'] = $index;
            if (!$this->db->exec($query, $binds)) {
                $result = false;
            }
        }
        return $result;
    }

    /**
     * @param null $sortBy
     * @return array|bool
     */
    public function getAll($sortBy = NULL)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` ';

        $binds = array();
        if ($sortBy) {
            $query .= ' ORDER BY `' . $sortBy . '` ';
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        foreach ($res as $row) {
            $result[] = $row;
        }
        return $result;
    }

    /**
     * @param $orderID
     * @return array|bool
     * @deprecated since 05.2018
     */
    public function getByOrderID($orderID)
    {

        $query = ' SELECT op.ID, oo.optionID, ua.controllerID FROM `' . $this->getTableName() . '` as op '
            . ' LEFT JOIN `dp_operationOptions` as oo ON oo.operationID = op.ID '
            . ' LEFT JOIN `ps_user_attributes` as ua ON ua.optionID = oo.optionID '
            . ' WHERE ua.orderID = :orderID ORDER BY op.`order` ASC ';

        $binds['orderID'] = $orderID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @return bool|mixed
     */
    public function getMaxOrder()
    {
        $query = ' SELECT MAX(op.`order`) FROM `' . $this->getTableName() . '` as op LIMIT 1';
        if (!$this->db->exec($query)) {
            return false;
        }
        return $this->db->getOne();
    }
}