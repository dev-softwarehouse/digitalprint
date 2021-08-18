<?php

namespace DreamSoft\Models\PrintShop;
use DreamSoft\Models\Behaviours\LangFilter;
use PDO;

/**
 * Description of PrintShopComplexRelatedFormat
 *
 */
class PrintShopComplexRelatedFormat extends PrintShop
{

    /**
     * @var LangFilter
     */
    private $LangFilter;

    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_complexRelatedFormats', $prefix);
        $this->LangFilter = new LangFilter();
    }

    /**
     * @param $baseFormatID
     * @param $complexID
     * @return bool|array
     */
    public function getByBaseFormatID($baseFormatID, $complexID)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.*
            FROM `' . $this->getTableName() . '`
            WHERE `' . $this->getTableName() . '`.`baseFormatID` = :baseFormatID AND complexID = :complexID ';

        $binds['baseFormatID'] = $baseFormatID;
        $binds['complexID'] = $complexID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $baseFormatIDs
     * @param $typesIDs
     * @param $complexID
     * @return bool
     */
    public function getByBaseFormatIDs($baseFormatIDs, $typesIDs, $complexID)
    {
        if (empty($typesIDs)) {
            return false;
        }
        $query = 'SELECT `' . $this->getTableName() . '`.*
            FROM `' . $this->getTableName() . '`
            WHERE `' . $this->getTableName() . '`.`baseFormatID` IN (' . implode(',', $baseFormatIDs) . ') 
            AND `typeID` IN (' . implode(',', $typesIDs) . ') 
            AND `complexID` = :complexID ';

        $binds['complexID'] = $complexID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $baseFormatID
     * @param $complexID
     * @return bool
     */
    public function deleteByComplex($baseFormatID, $complexID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE 
        `baseFormatID` = :baseFormatID AND 
        `complexID` = :complexID ';

        $binds['baseFormatID'] = $baseFormatID;
        $binds['complexID'] = $complexID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;

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

        $query = 'SELECT relatedFormats.baseFormatID as ID,
            relatedFormats.complexID,
            formats.name as `name`,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", formatlangs.lang, formatlangs.name) SEPARATOR "||" ) as langs
            FROM `' . $this->getTableName() . '` as relatedFormats '
            . ' LEFT JOIN `ps_products_formats` as formats ON formats.ID = relatedFormats.formatID '
            . ' LEFT JOIN `ps_products_formatLangs` as formatlangs ON formatlangs.formatID = formats.ID '
            . ' WHERE relatedFormats.`complexID` IN ( ' . implode(',', $list) . ' ) 
            GROUP BY relatedFormats.`formatID` ';

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
            $result[$row['complexID']][] = $row;
        }
        return $result;
    }

}