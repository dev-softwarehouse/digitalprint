<?php
/**
 * Description of Discount
 *
 * @author Rafał
 */
namespace DreamSoft\Models\Discount;

use DreamSoft\Models\Behaviours\LangFilter;
use DreamSoft\Core\Model;
use PDO;

class Discount extends Model
{

    protected $discountGroups;
    protected $discounts;

    protected $productGroups;
    protected $productGroupLangs;

    protected $productFormats;
    protected $productFormatLangs;

    protected $productTypes;
    protected $productTypeLangs;

    protected $LangFilter;


    /**
     * Discount constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('discounts', true);
        $this->discountGroups = $this->prefix . 'discountGroups';
        $this->discounts = $this->prefix . 'discounts';

        $this->productGroups = $this->prefix . 'products_groups';
        $this->productGroupLangs = $this->prefix . 'products_groupLangs';

        $this->productFormats = $this->prefix . 'products_formats';

        $this->productFormatLangs = $this->prefix . 'products_formatLangs';

        $this->productTypes = $this->prefix . 'products_types';
        $this->productTypeLangs = $this->prefix . 'products_typeLangs';

        $this->LangFilter = new LangFilter();
    }

    public function createName($params)
    {
        $this->setTableName($this->discountGroups, false);
        return $this->create($params);
    }

    public function createObj($params)
    {
        $this->setTableName($this->discounts, false);
        return $this->create($params);

    }

    public function updateName($ID, $key, $value)
    {
        $this->setTableName($this->discountGroups, false);
        return $this->update($ID, $key, $value);
    }

    public function updateDetails($ID, $key, $value)
    {
        return $this->update($ID, $key, $value);
    }

    /**
     * @param $discountID
     * @param $lang
     * @return mixed
     */
    public function existName($discountID, $lang)
    {
        $query = 'SELECT `ID` FROM ' . $this->discountGroups . ' WHERE `ID` = :ID '
            . ' AND `lang` = :lang ';

        $binds['lang'] = $lang;
        $binds['ID'] = $discountID;

        $this->db->exec($query, $binds);
        return $this->db->getOne();
    }

    /**
     * @return bool|mixed
     */
    public function getAll()
    {
        $query = 'SELECT `' . $this->getTableName() . '`.*,
                pg.name as groupDefaultName,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", pgl.lang, pgl.name) SEPARATOR "||" ) as productGroupLangs,
                pt.name as typeDefaultName,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", ptl.lang, ptl.name) SEPARATOR "||" ) as productTypeLangs,
                pf.name as formatDefaultName,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", pfl.lang, pfl.name) SEPARATOR "||" ) as productFormatLangs
                FROM `' . $this->getTableName() . '`'
            . 'LEFT JOIN `' . $this->productGroups . '` as pg ON pg.ID = `' . $this->getTableName() . '`.productGroupID '
            . 'LEFT JOIN `' . $this->productGroupLangs . '` as pgl ON pgl.groupID = `' . $this->getTableName() . '`.productGroupID '
            . 'LEFT JOIN `' . $this->productTypes . '` as pt ON pt.ID = `' . $this->getTableName() . '`.productTypeID '
            . 'LEFT JOIN `' . $this->productTypeLangs . '` as ptl ON ptl.typeID = `' . $this->getTableName() . '`.productTypeID '
            . 'LEFT JOIN `' . $this->productFormats . '` as pf ON pf.ID = `' . $this->getTableName() . '`.productFormatID '
            . 'LEFT JOIN `' . $this->productFormatLangs . '` as pfl ON pfl.formatID = `' . $this->getTableName() . '`.productFormatID '
            . ' WHERE 1 = 1 ';

        $query .= 'GROUP BY `' . $this->getTableName() . '`.ID
         ORDER BY `' . $this->getTableName() . '`.`ID` ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        $res = $this->LangFilter->splitArray($res, 'productGroupLangs');
        $res = $this->LangFilter->splitArray($res, 'productTypeLangs');
        $res = $this->LangFilter->splitArray($res, 'productFormatLangs');

        return $res;
    }

    /**
     * @param $ID
     * @return bool
     */
    public function getOne($ID)
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*,
                pg.name as groupDefaultName,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", pgl.lang, pgl.name) SEPARATOR "||" ) as productGroupLangs,
                pt.name as typeDefaultName,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", ptl.lang, ptl.name) SEPARATOR "||" ) as productTypeLangs,
                pf.name as formatDefaultName,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", pfl.lang, pfl.name) SEPARATOR "||" ) as productFormatLangs
                FROM `' . $this->getTableName() . '`'
            . 'LEFT JOIN `' . $this->productGroups . '` as pg ON pg.ID = `' . $this->getTableName() . '`.productGroupID '
            . 'LEFT JOIN `' . $this->productGroupLangs . '` as pgl ON pgl.groupID = `' . $this->getTableName() . '`.productGroupID '
            . 'LEFT JOIN `' . $this->productTypes . '` as pt ON pt.ID = `' . $this->getTableName() . '`.productTypeID '
            . 'LEFT JOIN `' . $this->productTypeLangs . '` as ptl ON ptl.typeID = `' . $this->getTableName() . '`.productTypeID '
            . 'LEFT JOIN `' . $this->productFormats . '` as pf ON pf.ID = `' . $this->getTableName() . '`.productFormatID '
            . 'LEFT JOIN `' . $this->productFormatLangs . '` as pfl ON pfl.formatID = `' . $this->getTableName() . '`.productFormatID '
            . ' WHERE `' . $this->getTableName() . '`.ID = :ID ';

        $binds['ID'] = $ID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getRow(PDO::FETCH_ASSOC);

        if (!$res) {
            return false;
        }

        $res = $this->LangFilter->splitOne($res, 'productGroupLangs');
        $res = $this->LangFilter->splitOne($res, 'productTypeLangs');
        $res = $this->LangFilter->splitOne($res, 'productFormatLangs');

        return $res;
    }


    /**
     * @param $groups
     * @param $productGroupID
     * @param $productTypeID
     * @param $productFormatID
     * @return bool|array
     */
    public function getByParams($groups, $productGroupID, $productTypeID, $productFormatID)
    {
        if( empty($groups) ) {
            return false;
        }
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE 
         `groupID` IN ('. implode(',', $groups) .') AND 
         (`productGroupID` = :productGroupID OR `productGroupID` IS NULL) AND 
         (`productTypeID` = :productTypeID OR productTypeID IS NULL) AND 
         (`productFormatID` = :productFormatID OR  `productFormatID` IS NULL) ';

        $binds['productGroupID'] = $productGroupID;
        $binds['productTypeID'] = $productTypeID;
        $binds['productFormatID'] = $productFormatID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

}
