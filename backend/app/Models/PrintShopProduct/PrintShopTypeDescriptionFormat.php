<?php

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Core\Model;

/**
 * Class PrintShopTypeDescriptionsFormat
 * @package DreamSoft\Models\PrintShopProduct
 */
class PrintShopTypeDescriptionFormat extends Model
{

    /**
     * PrintShopTypeDescriptionsFormat constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('products_descriptionsFormats', true);
    }

    /**
     * @param $descID
     * @return bool
     */
    public function getForDesc($descID)
    {
        $query = 'SELECT * FROM ' . $this->getTableName() . ' WHERE `descID` = :descID';

        $binds[':descID'] = $descID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();

    }

    /**
     * @param $list
     * @return array|bool
     */
    public function getForDescList($list)
    {
        if (empty($list)) {
            return false;
        }
        $query = 'SELECT formatID, descID FROM ' . $this->getTableName() . ' WHERE `descID` IN (' . implode(',', $list) . ') ';

        if (!$this->db->exec($query)) {
            return false;
        }
        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }
        $result = array();
        foreach ($res as $row) {
            $result[$row['descID']][] = $row['formatID'];
        }
        return $result;
    }

    /**
     * @param $descID
     * @param $formatID
     * @return bool|string
     */
    public function setFormat($descID, $formatID)
    {

        $params['descID'] = $descID;
        $params['formatID'] = $formatID;
        $actID = $this->create($params);

        return $actID;
    }

    /**
     * @param $descID
     * @param $formatID
     * @return bool
     */
    public function exist($descID, $formatID)
    {
        $query = 'SELECT * FROM ' . $this->getTableName() . ' WHERE `descID` = :descID AND `formatID` = :formatID';

        $binds[':descID'] = $descID;
        $binds[':formatID'] = $formatID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();

    }

    /**
     * @param $descID
     * @return bool
     */
    public function clearRecords($descID)
    {
        $query = 'DELETE FROM ' . $this->getTableName() . ' WHERE `descID` = :descID';

        $binds[':descID'] = $descID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        } else {
            return true;
        }

    }
}