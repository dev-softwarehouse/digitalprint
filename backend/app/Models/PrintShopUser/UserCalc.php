<?php

namespace DreamSoft\Models\PrintShopUser;
/**
 * Description of UserCalc
 *
 */
use DreamSoft\Core\Model;

class UserCalc extends Model
{

    protected $priceTable;

    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_user_';
        $this->setTableName('calc', true);
        $this->usersTable = 'users';
        $this->groupTable = 'ps_products_groups';
        $this->typeTable = 'ps_products_types';
        $this->priceTable = 'dp_base_prices';
    }

    /**
     * @param array $params
     * @param bool $getOne
     * @param bool $groupBaseID
     * @return array|bool|mixed
     */
    public function getAll($params = array(), $getOne = false, $groupBaseID = true)
    {

        $query = ' SELECT * FROM (
          SELECT userCalc.*,
           groupTable.name as groupName, typeTable.name as typeName,
           priceTable.price, priceTable.grossPrice, priceTable.currency
           FROM `' . $this->getTableName() . '` as userCalc ';
        $query .= ' LEFT JOIN `' . $this->groupTable . '` as groupTable ON groupTable.`ID` = userCalc.`groupID` ';
        $query .= ' LEFT JOIN `' . $this->typeTable . '` as typeTable ON typeTable.`ID` = userCalc.`typeID` ';
        $query .= ' LEFT JOIN `' . $this->priceTable . '` as priceTable ON priceTable.`ID` = userCalc.`priceID` ';

        $pairs = array();
        $binds = array();
        if (!empty($params)) {
            $idx = 0;
            foreach ($params as $p => $v) {
                $pairs[] = ' ' . $p . ' = :param' . $idx . ' ';
                $binds['param' . $idx] = $v;
                $idx++;
            }
            $query .= ' WHERE ';
            $query .= implode(' AND ', $pairs);

        }

        $query .= ' ORDER BY userCalc.`created` DESC ';


        $query .= ') as tmp_table ';
        if ($groupBaseID) $query .= ' GROUP BY tmp_table.baseID ';
        $query .= ' ORDER BY tmp_table.`created` DESC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        if ($getOne) {
            $result = $this->db->getRow();
        } else {
            $result = $this->db->getAll();
        }


        return $result;
    }

    /**
     * @param $ID
     * @return bool|mixed
     */
    public function getOne($ID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `ID` =  :ID ';
        $binds[':ID'] = $ID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getRow();
    }

    /**
     * @param $uID
     * @return array|bool
     */
    public function getAllforUser($uID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `uID` =  :uID ';
        $binds = array();
        $binds[':uID'] = $uID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $result = $this->db->getAll();

        return $result;
    }

    public function getAllforSeller($sellerID)
    {
        $params = array('sellerID' => $sellerID);
        return $this->getAll($params);
    }

    public function customGet($id)
    {
        $params = array('userCalc.ID' => $id);
        return $this->getAll($params, true);
    }

    public function getMaxVersion($id)
    {
        $query = 'SELECT MAX( userCalc.ver )
     FROM `' . $this->getTableName() . '` as userCalc
     WHERE userCalc.baseID = :baseID';

        $binds[':baseID'] = $id;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();

    }

    public function getHistory($baseID)
    {
        $params = array('userCalc.baseID' => $baseID);
        return $this->getAll($params, false, false);
    }

    /**
     * @param $list
     * @return array|bool
     */
    public function customGetByList($list)
    {
        if (empty($list)) {
            return false;
        }

        $query = ' SELECT userCalc.*, priceTable.price, priceTable.grossPrice, priceTable.currency ';
        $query .= ' FROM `' . $this->getTableName() . '` as userCalc ';
        $query .= ' LEFT JOIN `' . $this->priceTable . '` as priceTable ON priceTable.`ID` = userCalc.`priceID` ';
        $query .= ' WHERE userCalc.`ID` IN (' . implode(',', $list) . ') ';

        if (!$this->db->exec($query)) {
            return false;
        }

        $res = $this->db->getAll();

        $result = array();
        if ($res) {

            foreach ($res as $key => $value) {
                $result[$value['ID']] = $value;
            }

            return $result;
        } else {
            return false;
        }

    }

}
