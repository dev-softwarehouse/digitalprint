<?php
/**
 * Programista Rafał Leśniak - 20.6.2017
 */

namespace DreamSoft\Models\Coupon;


use DreamSoft\Models\Behaviours\LangFilter;
use DreamSoft\Core\Model;

/**
 * Class CouponProduct
 * @package DreamSoft\Models\Coupon
 */
class CouponProduct extends Model
{
    protected $productGroups;
    protected $productGroupLangs;

    protected $productFormats;
    protected $productFormatLangs;

    protected $productTypes;
    protected $productTypeLangs;

    protected $couponOrder;

    protected $LangFilter;

    /**
     * Coupon constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('couponProducts', true);

        $this->productGroups = PRINT_SHOP_PREFIX . 'products_groups';
        $this->productGroupLangs = PRINT_SHOP_PREFIX . 'products_groupLangs';

        $this->productFormats = PRINT_SHOP_PREFIX . 'products_formats';

        $this->productFormatLangs = PRINT_SHOP_PREFIX . 'products_formatLangs';

        $this->productTypes = PRINT_SHOP_PREFIX . 'products_types';
        $this->productTypeLangs = PRINT_SHOP_PREFIX . 'products_typeLangs';

        $this->couponOrder = CUSTOM_PREFIX . 'couponOrders';

        $this->LangFilter = new LangFilter();
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

        foreach ($list as $key => $ID) {
            $list[$key] = '"' . $ID . '"';
        }

        $query = 'SELECT `' . $this->getTableName() . '`.*, 
                pg.name as groupDefaultName,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", pgl.lang, pgl.name) SEPARATOR "||" ) as productGroupLangs,
                pt.name as typeDefaultName,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", ptl.lang, ptl.name) SEPARATOR "||" ) as productTypeLangs,
                pf.name as formatDefaultName,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", pfl.lang, pfl.name) SEPARATOR "||" ) as productFormatLangs
                FROM `' . $this->getTableName() . '` ';


        $query .= '
                LEFT JOIN `' . $this->productGroups . '` as pg ON pg.ID = `' . $this->getTableName() . '`.groupID '
            . 'LEFT JOIN `' . $this->productGroupLangs . '` as pgl ON pgl.groupID = `' . $this->getTableName() . '`.groupID '
            . 'LEFT JOIN `' . $this->productTypes . '` as pt ON pt.ID = `' . $this->getTableName() . '`.typeID '
            . 'LEFT JOIN `' . $this->productTypeLangs . '` as ptl ON ptl.typeID = `' . $this->getTableName() . '`.typeID '
            . 'LEFT JOIN `' . $this->productFormats . '` as pf ON pf.ID = `' . $this->getTableName() . '`.formatID '
            . 'LEFT JOIN `' . $this->productFormatLangs . '` as pfl ON pfl.formatID = `' . $this->getTableName() . '`.formatID ';

        $query .= ' WHERE `' . $this->getTableName() . '`.`couponID` IN ( ' . implode(',', $list) . ' ) 
        GROUP BY `' . $this->getTableName() . '`.`ID` ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        $result = array();
        foreach ($res as $row) {
            $result[$row['couponID']][] = $row;
        }
        return $result;
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
                FROM `' . $this->getTableName() . '` ';


        $query .= '
                LEFT JOIN `' . $this->productGroups . '` as pg ON pg.ID = `' . $this->getTableName() . '`.groupID '
            . 'LEFT JOIN `' . $this->productGroupLangs . '` as pgl ON pgl.groupID = `' . $this->getTableName() . '`.groupID '
            . 'LEFT JOIN `' . $this->productTypes . '` as pt ON pt.ID = `' . $this->getTableName() . '`.typeID '
            . 'LEFT JOIN `' . $this->productTypeLangs . '` as ptl ON ptl.typeID = `' . $this->getTableName() . '`.typeID '
            . 'LEFT JOIN `' . $this->productFormats . '` as pf ON pf.ID = `' . $this->getTableName() . '`.formatID '
            . 'LEFT JOIN `' . $this->productFormatLangs . '` as pfl ON pfl.formatID = `' . $this->getTableName() . '`.formatID ';

        $query .= ' WHERE `' . $this->getTableName() . '`.`ID` = :ID
        GROUP BY `' . $this->getTableName() . '`.`ID` ';

        $binds['ID'] = $ID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();

    }

    /**
     * @param $couponID
     * @return bool
     */
    public function getSimple($couponID)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.* FROM `' . $this->getTableName() . '` ';
        $query .= ' WHERE `' . $this->getTableName() . '`.`couponID` = :couponID
        GROUP BY `' . $this->getTableName() . '`.`ID` ORDER BY `' . $this->getTableName() . '`.`ID` ASC ';

        $binds['couponID'] = $couponID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $productID
     * @return array|bool
     */
    public function getByProduct($productID)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.* FROM `' . $this->getTableName() . '`
         LEFT JOIN `' . $this->couponOrder . '` as couponOrder ON couponOrder.couponID = `' . $this->getTableName() . '`.`couponID` ';
        $query .= ' WHERE couponOrder.`productID` = :productID 
        GROUP BY `' . $this->getTableName() . '`.`ID` ';

        $binds['productID'] = $productID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        if (!$res) {
            return false;
        }

        $result = array();
        foreach ($res as $row) {
            $result[$row['couponID']] = $row;
        }

        return $result;
    }
}