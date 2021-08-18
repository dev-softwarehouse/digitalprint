<?php
/**
 * Programista Rafał Leśniak - 19.6.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 19-06-2017
 * Time: 11:33
 */

namespace DreamSoft\Models\Content;

use DreamSoft\Models\Behaviours\LangFilter;
use DreamSoft\Core\Model;

/**
 * Class Content
 * @package DreamSoft\Models\Content
 */
class StaticContent extends Model
{
    protected $staticContentLang;
    /**
     * @var LangFilter
     */
    protected $LangFilter;

    private $domainID;

    /**
     * Content constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('static_contents', true);
        $this->staticContentLang = $this->prefix . 'static_contentLangs';
        $this->LangFilter = new LangFilter();
    }

    /**
     * @return mixed
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param mixed $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * @return bool|mixed
     */
    public function getAll()
    {
        $query = ' SELECT sc.*, GROUP_CONCAT( scl.lang,  "::", scl.content SEPARATOR  "||" ) as contents FROM `' . $this->getTableName() . '` as sc ';
        $query .= ' LEFT JOIN `' . $this->staticContentLang . '` as scl ON scl.staticContentID = sc.ID ';
        $query .= ' WHERE sc.`domainID` = :domainID OR sc.`domainID` IS NULL GROUP BY sc.ID ';

        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();
        if( !$res ) {
            return false;
        }
        return $this->LangFilter->splitFlatArray($res, 'contents');
    }

    /**
     * @param $ID
     * @return bool|mixed
     */
    public function getOne( $ID )
    {
        $query = ' SELECT sc.*, GROUP_CONCAT( scl.lang,  "::", scl.content SEPARATOR  "||" ) as contents FROM `' . $this->getTableName() . '` as sc ';
        $query .= ' LEFT JOIN `' . $this->staticContentLang . '` as scl ON scl.staticContentID = sc.ID ';
        $query .= ' WHERE sc.`ID` = :ID GROUP BY sc.ID ';

        $binds['ID'] = $ID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getRow();
        if( !$res ) {
            return false;
        }
        return $this->LangFilter->splitFlatOne($res, 'contents');
    }

    public function getByKey($key) {
        $query = ' SELECT sc.*, GROUP_CONCAT( scl.lang,  "::", scl.content SEPARATOR  "||" )  as contents FROM `' . $this->getTableName() . '` as sc ';
        $query .= ' LEFT JOIN `' . $this->staticContentLang . '` as scl ON scl.staticContentID = sc.ID ';
        $query .= ' WHERE sc.`key` = :key AND sc.`active` = 1 GROUP BY sc.ID ';

        $binds['key'] = $key;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getRow();
        if( !$res ) {
            return false;
        }
        return $this->LangFilter->splitFlatOne($res, 'contents');
    }
}