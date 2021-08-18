<?php

namespace DreamSoft\Models\Product;

use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\LangFilter;

class ProductCategory extends Model
{

    protected $categoryLangs;
    protected $categories;
    private $domainID;

    /**
     * @var LangFilter
     */
    private $LangFilter;

    public function __construct()
    {
        parent::__construct();
        $this->setTableName('productCategories', true);
        $this->categories = $this->prefix . 'categories';
        $this->categoryLangs = $this->prefix . 'categoryLangs';
        $this->LangFilter = new LangFilter();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * @return mixed
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param $itemID
     * @param int $relType
     * @return bool
     */
    public function getByRelationType($itemID, $relType = 1)
    {
        $query = 'SELECT `itemID` FROM `' . $this->getTableName() . '` WHERE `itemID` = :itemID AND `relType` = :relType ';

        $binds['itemID'] = $itemID;
        $binds['relType'] = $relType;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $itemID
     * @param int $relType
     * @return array|bool
     */
    public function getSelected($itemID, $relType = 1)
    {
        $query = 'SELECT `categoryID` FROM `' . $this->getTableName() . '` WHERE `itemID` = :itemID AND `relType` = :relType ';

        $binds['itemID'] = $itemID;
        $binds['relType'] = $relType;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        if ($res) {
            foreach ($res as $key => $value) {
                $result[] = $value['categoryID'];
            }
        }
        return $result;
    }

    /**
     * @param $categoryID
     * @param int $relType
     * @return bool
     */
    public function deleteByCategory($categoryID, $relType = 1)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE `categoryID` = :categoryID ';

        $binds['categoryID'] = $categoryID;


        if ($relType !== NULL) {
            $binds['relType'] = $relType;
            $query .= ' AND `relType` = :relType ';
        }


        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * Remove relation item to category
     *
     * @param int $itemID
     * @param int $relType 1-groupID, 2-typeID
     * @return bool
     */
    public function deleteByItem($itemID, $relType = 1)
    {
        $query = 'DELETE `' . $this->getTableName() . '` FROM `' . $this->getTableName() . '`
                LEFT JOIN  `' . $this->categories . '` ON `' . $this->categories . '`.ID =  `' . $this->getTableName() . '`.categoryID 
                WHERE `' . $this->categories . '`.domainID = :domainID AND `' . $this->getTableName() . '`.`itemID` = :itemID  ';

        $binds['itemID'] = $itemID;
        $binds['domainID'] = $this->getDomainID();

        if ($relType !== NULL) {
            $binds['relType'] = $relType;
            $query .= ' AND `' . $this->getTableName() . '`.`relType` = :relType ';
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param $itemID
     * @param $relType
     * @param $list
     * @return bool
     */
    public function selectCategories($itemID, $relType, $list)
    {
        if (!$list) {
            return false;
        }

        $this->deleteByItem($itemID, $relType);
        $saved = 0;
        foreach ($list as $value) {
            $maxSortValue = $this->getMaxSortForCategory($value);
            $params['itemID'] = $itemID;
            $params['relType'] = $relType;
            $params['categoryID'] = $value;
            if($maxSortValue > 0) {
                $params['sort'] = $maxSortValue + 1;
            } else {
                $params['sort'] = 1;
            }

            $saved += intval($this->create($params));
            unset($params);
        }

        if ($saved > 0) {
            return true;
        }
        return false;

    }

    /**
     * @param $items
     * @return bool
     */
    public function sort($items)
    {
        $result = true;

        foreach ($items as $index => $itemID) {

            $query = 'UPDATE `' . $this->getTableName() . '` SET `sort` = :index WHERE `ID` = :itemID ';

            $binds['itemID'] = array($itemID, 'int');
            $binds['index'] = $index;

            if (!$this->db->exec($query, $binds)) {
                $result = false;
            }
        }
        return $result;
    }

    /**
     * @param array $list
     * @return array|bool
     */
    public function getFromList($list = array())
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` AS c '
            . ' WHERE `categoryID` IN (' . implode(",", $list) . ') ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }
        return $res;
    }

    /**
     * @param int $relType
     * @return bool
     */
    public function contains($relType = 1)
    {

        $query = 'SELECT c.itemID, c.categoryID, '
            . ' GROUP_CONCAT( DISTINCT CONCAT_WS("::", cl.lang, cl.slug, cl.name) SEPARATOR "||" ) as langs FROM `' . $this->getTableName() . '` as c '
            . ' LEFT JOIN `dp_categories` as ct ON ct.ID = c.categoryID '
            . ' LEFT JOIN `' . $this->categoryLangs . '` as cl ON ct.ID =  cl.categoryID '
            . ' WHERE c.`relType` = :relType AND ct.domainID = :domainID ';

        $query .= ' GROUP BY c.ID '
            . ' ORDER BY ct.created ';

        $binds['relType'] = $relType;
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();

        if (!$res) {
            return false;
        }

        return $res;
    }

    /**
     * @param array $list
     * @param int $relType
     * @return bool|array
     */
    public function getByItemList($list = array(), $relType = 1)
    {
        if (empty($list)) {
            return false;
        }
        $query = 'SELECT pc.itemID, c.discountGroupID, c.ID as categoryID, pc.relType, '
            . ' GROUP_CONCAT( DISTINCT CONCAT_WS("::", cl.lang, cl.slug, cl.name) SEPARATOR "||" ) as langs '
            . ' FROM `' . $this->getTableName() . '` as pc '
            . ' LEFT JOIN `dp_categories` as c ON c.ID = pc.categoryID '
            . ' LEFT JOIN `' . $this->categoryLangs . '` as cl ON c.ID =  cl.categoryID '
            . ' WHERE `itemID` IN (' . implode(",", $list) . ') AND c.domainID = :domainID AND `relType` = :relType GROUP BY pc.itemID ';

        $binds['relType'] = $relType;

        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }

        $res = $this->LangFilter->splitArrayWithUrl($res, 'langs');

        $result = array();

        foreach ($res as $key => $value) {
            $result[$value['itemID']] = $value;
        }

        return $result;
    }

    /**
     * @return bool
     */
    public function getGroups()
    {
        $query = 'SELECT c.itemID, c.categoryID  FROM `' . $this->getTableName() . '` AS c '
            . ' WHERE c.`relType` = 1 ';

        if (!$this->db->exec($query)) {
            return false;
        }

        return $this->db->getAll();

    }

    /**
     * @param $categoryID
     * @return bool|mixed
     */
    public function getMaxSortForCategory($categoryID)
    {
        $query = ' SELECT MAX(`sort`) FROM `' . $this->getTableName() . '` WHERE `categoryID` = :categoryID LIMIT 1';

        $binds['categoryID'] = $categoryID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }
}
