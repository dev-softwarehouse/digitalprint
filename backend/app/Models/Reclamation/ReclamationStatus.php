<?php
/**
 * Programmer Rafał Leśniak - 7.9.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 07-09-2017
 * Time: 16:26
 */

namespace DreamSoft\Models\Reclamation;

use DreamSoft\Models\Behaviours\LangFilter;
use DreamSoft\Core\Model;

/**
 * Class ReclamationStatus
 * @package DreamSoft\Models\Reclamation
 */
class ReclamationStatus extends Model
{
    /**
     * @var int
     */
    private $domainID;
    /**
     * @var string
     */
    private $reclamationStatusLang;

    /**
     * @var LangFilter
     */
    protected $LangFilter;

    /**
     * ReclamationStatus constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('reclamationStatuses', true);
        $this->reclamationStatusLang = $this->prefix . 'reclamationStatusLangs';
        $this->LangFilter = new LangFilter();
    }

    /**
     * @param int $domainID
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
     * @param bool $active
     * @return bool|array
     */
    public function getAll($active = false)
    {
        $query = ' SELECT so.*, GROUP_CONCAT( DISTINCT CONCAT_WS("::", osl.lang, osl.name) SEPARATOR "||") AS langs 
        FROM `' . $this->getTableName() . '` AS so ';
        $query .= ' LEFT JOIN `' . $this->reclamationStatusLang . '` as osl ON osl.statusID = so.ID ';
        $query .= ' WHERE so.`domainID` = :domainID ';

        $binds['domainID'] = $this->getDomainID();

        if ($active) {
            $query .= ' AND so.`active` = 1 ';
        }

        $query .= 'GROUP BY so.ID ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();
        if( !$res ) {
            return false;
        }
        return $this->LangFilter->splitArray($res, 'langs');
    }

    /**
     * @return bool|array
     */
    public function getMaxOrder()
    {
        $query = 'SELECT MAX(sort)
            FROM  `' . $this->getTableName() . '` AS so
            WHERE so.`active` = 1 
            LIMIT 1';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }

    /**
     * @return bool|array
     */
    public function getFirstStatus()
    {
        $query = 'SELECT `ID`
            FROM  `' . $this->getTableName() . '` AS so
            WHERE so.`active` = 1 
            ORDER BY `sort`
            LIMIT 1';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }

    /**
     * @param $ID
     * @return array|bool
     */
    public function getOne($ID)
    {
        $query = ' SELECT so.*, GROUP_CONCAT( DISTINCT CONCAT_WS("::", osl.lang, osl.name) SEPARATOR "||") AS langs FROM `' . $this->getTableName() . '` AS so ';
        $query .= ' LEFT JOIN `' . $this->reclamationStatusLang . '` as osl ON osl.statusID = so.ID ';
        $query .= ' WHERE so.`ID` = :ID GROUP BY so.ID ';

        $binds['ID'] = $ID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $row = $this->db->getRow();
        if( !$row ) {
            return false;
        }
        return $this->LangFilter->splitOne($row, 'langs');
    }

    /**
     * @param $list
     * @return array|bool
     */
    public function getByList($list)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT rs.*, GROUP_CONCAT( DISTINCT CONCAT_WS("::", osl.lang, osl.name) SEPARATOR "||") AS langs ';
        $query .= ' FROM `' . $this->getTableName() . '` rs ';
        $query .= ' LEFT JOIN `' . $this->reclamationStatusLang . '` as osl ON osl.statusID = rs.ID ';
        $query .= ' WHERE rs.`ID` IN ( ' . implode(',', $list) . ' ) ';
        $query .= ' GROUP BY  `rs`.ID ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        if( !$res ) {
            return false;
        }

        $res = $this->LangFilter->splitArray($res, 'langs');

        $result = array();
        foreach ($res as $row) {
            $result[$row['ID']] = $row;
        }
        return $result;
    }
}