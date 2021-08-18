<?php
/**
 * Description of Promotion
 *
 * @author Rafał
 */

namespace DreamSoft\Models\Promotion;

use DreamSoft\Core\Model;
use PDO;
use DreamSoft\Models\Behaviours\LangFilter;
use DreamSoft\Models\Behaviours\QueryFilter;

class Promotion extends Model
{
    /**
     * @var string
     */
    private $promotions;
    /**
     * @var string
     */
    private $productGroupLanguages;
    /**
     * @var string
     */
    private $productFormatLanguages;
    /**
     * @var string
     */
    private $productTypeLanguages;
    /**
     * @var string
     */
    private $promotionLanguages;
    /**
     * @var LangFilter
     */
    private $LangFilter;
    /**
     * @var QueryFilter
     */
    private $QueryFilter;
    /**
     * @var int
     */
    private $domainID;

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;

    }

    /**
     * @return int
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * Promotion constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('promotions', true);
        $this->promotions = $this->prefix . 'promotions';

        $this->productGroupLanguages = $this->prefix . 'products_groupLangs';
        $this->productFormatLanguages = $this->prefix . 'products_formatLangs';
        $this->productTypeLanguages = $this->prefix . 'products_typeLangs';
        $this->promotionLanguages = $this->prefix . 'promotionLangs';

        $this->LangFilter = new LangFilter();
        $this->QueryFilter = new QueryFilter();
    }

    /**
     * @param null $params
     * @param bool $multi
     * @return array|bool|mixed
     */
    public function customGet($params = null, $multi = true)
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->promotionLanguages . '`.lang, `' . $this->promotionLanguages . '`.name) SEPARATOR "||" ) as promotionLanguages,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->productGroupLanguages . '`.lang, `' . $this->productGroupLanguages . '`.name) SEPARATOR "||" ) as groupLanguages,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->productTypeLanguages . '`.lang, `' . $this->productTypeLanguages . '`.name) SEPARATOR "||" ) as typeLanguages,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->productFormatLanguages . '`.lang, `' . $this->productFormatLanguages . '`.name) SEPARATOR "||" ) as formatLanguages
                FROM `' . $this->getTableName() . '`'
            . 'LEFT JOIN `' . $this->promotionLanguages . '` ON `' . $this->promotionLanguages . '`.promotionID = `' . $this->getTableName() . '`.ID '
            . 'LEFT JOIN `' . $this->productGroupLanguages . '` ON `' . $this->productGroupLanguages . '`.groupID = `' . $this->getTableName() . '`.productGroupID '
            . 'LEFT JOIN `' . $this->productTypeLanguages . '` ON `' . $this->productTypeLanguages . '`.typeID = `' . $this->getTableName() . '`.productTypeID '
            . 'LEFT JOIN `' . $this->productFormatLanguages . '` ON `' . $this->productFormatLanguages . '`.formatID = `' . $this->getTableName() . '`.productFormatID '
            . ' WHERE 1 = 1 ';

        $binds = array();

        if (count($params)) {
            foreach ($params as $key => $value) {
                $query .= ' AND `' . $this->getTableName() . '`.`' . $key . '` = :' . $key . ' ';
                $binds[$key] = $value;
            }
        }

        if (!isset($params['domainID'])) {
            $binds['domainID'] = $this->getDomainID();
            $query .= ' AND `' . $this->getTableName() . '`.`domainID` = :domainID ';
        }

        $query .= ' GROUP BY `' . $this->getTableName() . '`.ID ORDER BY `' . $this->getTableName() . '`.`ID` ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        if (!$multi) {
            $res = $this->db->getRow(PDO::FETCH_ASSOC);

            $res = $this->LangFilter->splitOne($res, 'promotionLanguages');
            $res = $this->LangFilter->splitOne($res, 'groupLanguages');
            $res = $this->LangFilter->splitOne($res, 'typeLanguages');
            $res = $this->LangFilter->splitOne($res, 'formatLanguages');
        } else {
            $res = $this->db->getAll(PDO::FETCH_ASSOC);

            $res = $this->LangFilter->splitArray($res, 'promotionLanguages');
            $res = $this->LangFilter->splitArray($res, 'groupLanguages');
            $res = $this->LangFilter->splitArray($res, 'typeLanguages');
            $res = $this->LangFilter->splitArray($res, 'formatLanguages');
        }

        return $res;
    }

    /**
     * @param $filters
     * @param int $offset
     * @param int $limit
     * @param array $orderBy
     * @param string $logicalOperator
     * @return array|bool
     */
    public function getList($filters, $offset = 0, $limit = 30, $orderBy = array(), $logicalOperator = 'AND')
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->promotionLanguages . '`.lang, `' . $this->promotionLanguages . '`.name) SEPARATOR "||" ) as promotionLanguages,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->productGroupLanguages . '`.lang, `' . $this->productGroupLanguages . '`.name) SEPARATOR "||" ) as groupLanguages,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->productTypeLanguages . '`.lang, `' . $this->productTypeLanguages . '`.name) SEPARATOR "||" ) as typeLanguages,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->productFormatLanguages . '`.lang, `' . $this->productFormatLanguages . '`.name) SEPARATOR "||" ) as formatLanguages
                FROM `' . $this->getTableName() . '`'
            . 'LEFT JOIN `' . $this->promotionLanguages . '` ON `' . $this->promotionLanguages . '`.promotionID = `' . $this->getTableName() . '`.ID '
            . 'LEFT JOIN `' . $this->productGroupLanguages . '` ON `' . $this->productGroupLanguages . '`.groupID = `' . $this->getTableName() . '`.productGroupID '
            . 'LEFT JOIN `' . $this->productTypeLanguages . '` ON `' . $this->productTypeLanguages . '`.typeID = `' . $this->getTableName() . '`.productTypeID '
            . 'LEFT JOIN `' . $this->productFormatLanguages . '` ON `' . $this->productFormatLanguages . '`.formatID = `' . $this->getTableName() . '`.productFormatID ';

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

        $res = $this->db->getAll();

        $res = $this->LangFilter->splitArray($res, 'promotionLanguages');
        $res = $this->LangFilter->splitArray($res, 'groupLanguages');
        $res = $this->LangFilter->splitArray($res, 'typeLanguages');
        $res = $this->LangFilter->splitArray($res, 'formatLanguages');

        return $res;
    }

    /**
     * @param $filters
     * @return bool|int
     */
    public function count($filters)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.*,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->promotionLanguages . '`.lang, `' . $this->promotionLanguages . '`.name) SEPARATOR "||" ) as promotionLanguages,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->productGroupLanguages . '`.lang, `' . $this->productGroupLanguages . '`.name) SEPARATOR "||" ) as groupLanguages,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->productTypeLanguages . '`.lang, `' . $this->productTypeLanguages . '`.name) SEPARATOR "||" ) as typeLanguages,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->productFormatLanguages . '`.lang, `' . $this->productFormatLanguages . '`.name) SEPARATOR "||" ) as formatLanguages
                FROM `' . $this->getTableName() . '`'
            . 'LEFT JOIN `' . $this->promotionLanguages . '` ON `' . $this->promotionLanguages . '`.promotionID = `' . $this->getTableName() . '`.ID '
            . 'LEFT JOIN `' . $this->productGroupLanguages . '` ON `' . $this->productGroupLanguages . '`.groupID = `' . $this->getTableName() . '`.productGroupID '
            . 'LEFT JOIN `' . $this->productTypeLanguages . '` ON `' . $this->productTypeLanguages . '`.typeID = `' . $this->getTableName() . '`.productTypeID '
            . 'LEFT JOIN `' . $this->productFormatLanguages . '` ON `' . $this->productFormatLanguages . '`.formatID = `' . $this->getTableName() . '`.productFormatID ';

        $prepare = $this->QueryFilter->prepare($filters);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }

        $query .= ' GROUP BY `' . $this->getTableName() . '`.ID ASC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->rowCount();
    }

    /**
     * @param $productGroupID
     * @param $productTypeID
     * @param $productFormatID
     * @return array|bool
     */
    public function getByParams($productGroupID, $productTypeID, $productFormatID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE 
         (`productGroupID` = :productGroupID OR `productGroupID` IS NULL) AND 
         (`productTypeID` = :productTypeID OR productTypeID IS NULL) AND 
         (`productFormatID` = :productFormatID OR `productFormatID` IS NULL) AND `domainID` = :domainID AND 
          `active` = 1 ';

        $binds['productGroupID'] = $productGroupID;
        $binds['productTypeID'] = $productTypeID;
        $binds['productFormatID'] = $productFormatID;
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $types
     * @return array|bool
     */
    public function getByTypes($types)
    {
        if( !$types || !is_array($types) ) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `productTypeID` IN ( ' . implode(',', $types) . ' ) AND `active` = 1 ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        $result = array();
        foreach ($res as $row) {
            $result[$row['productTypeID']][] = $row;
        }
        return $result;
    }

    /**
     * @param $groups
     * @return array|bool
     */
    public function getByGroups($groups)
    {
        if( !$groups || !is_array($groups) ) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `productGroupID` IN ( ' . implode(',', $groups) . ' ) AND `active` = 1 ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        $result = array();
        foreach ($res as $row) {
            $result[$row['productGroupID']][] = $row;
        }
        return $result;
    }

}
