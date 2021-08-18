<?php

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Models\Behaviours\LangFilter;
use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Description of PrintShopType
 *
 * @author Właściciel
 */
use DreamSoft\Models\Behaviours\SearchFilter;

class PrintShopType extends PrintShop
{

    protected $tableTax;
    protected $tableTypeLangs;

    /**
     * @var LangFilter
     */
    protected $LangFilter;
    /**
     * @var $SearchFilter SearchFilter
     */
    protected $SearchFilter;

    /**
     * PrintShopType constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_types', $prefix);
        if ($prefix) {
            $this->tableTypeLangs = $this->prefix . 'products_typeLangs';
            $this->tableTax = 'dp_tax';
        }
        $this->LangFilter = new LangFilter();
        $this->SearchFilter = new SearchFilter();
    }


    /**
     * @param bool $active
     * @return array|bool
     */
    public function getAll($active = false)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.*,
                `' . $this->tableTypeLangs . '`.`lang` as lLang,
                `' . $this->tableTypeLangs . '`.`name` as lName,
                `' . $this->tableTypeLangs . '`.`icon` as lDescription, 
                `' . $this->tableTypeLangs . '`.`slug` as lSlug 
                FROM `ps_products_types`
                LEFT JOIN `ps_products_typeLangs` ON `ps_products_typeLangs`.`typeID` = `ps_products_types`.`ID` 
                 ';

        if ($this->groupID) {
            $query .= 'WHERE `ps_products_types`.`groupID` = :groupID';
            $binds[':groupID'] = $this->groupID;
        }

        if ($active) {
            $query .= ' AND `active` = 1 ';
        }

        $query .= ' ORDER BY `ps_products_types`.`order` ';
        if (!$this->db->exec($query, $binds)) return false;

        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        $result = array();
        foreach ($res as $r) {
            $lLang = $lName = $lDescription = $lSlug = null;
            if (!empty($r['lLang'])) {
                $lLang = $r['lLang'];
                $lName = $r['lName'];
                $lDescription = $r['lDescription'];
                $lSlug = $r['lSlug'];
            }
            unset($r['lLang']);
            unset($r['lName']);
            unset($r['lDescription']);
            unset($r['lSlug']);
            $key = $r['ID'];
            if (!isset($result[$key])) {
                $result[$key] = array();
            }
            $result[$key] = array_merge($result[$key], $r);
            if (!empty($lLang)) {
                if (!isset($result[$key]['names'])) {
                    $result[$key]['names'] = array();
                }
                if (!isset($result[$key]['icons'])) {
                    $result[$key]['icons'] = array();
                }
                $result[$key]['names'][$lLang] = $lName;
                $result[$key]['icons'][$lLang] = $lDescription;
                $result[$key]['slugs'][$lLang] = $lSlug;
            }
        }

        $data = array();
        foreach ($result as $r) {
            $data[] = $r;
        }

        return $data;
    }

    /**
     * @return bool
     */
    public function getMaxOrder()
    {
        $query = 'SELECT MAX(`order`) FROM `' . $this->getTableName() . '` LIMIT 1 ';

        $binds[':groupID'] = $this->groupID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getOne();
    }

    /**
     * @param array $types
     * @return bool
     */
    public function sort($types)
    {
        $result = true;
        foreach ($types as $index => $typeID) {

            $query = 'UPDATE `' . $this->getTableName() . '` SET `order` = :index WHERE `ID` = :typeID ';

            $binds[':typeID'] = array($typeID, 'int');
            $binds[':index'] = $index;
            if (!$this->db->exec($query, $binds)) {
                $result = false;
            }
        }
        return $result;
    }

    /**
     * @param $typeID
     * @param $maxVolume
     * @return bool
     */
    public function setMaxVolume($typeID, $maxVolume)
    {

        $query = 'UPDATE `' . $this->getTableName() . '` SET `maxVolume` = :maxVolume WHERE `ID` = :typeID ';

        $binds[':typeID'] = array($typeID, 'int');
        $binds[':maxVolume'] = $maxVolume;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @return bool|array
     */
    public function getActive()
    {
        if ($this->groupID === false) return false;
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `groupID` = :groupID AND `active` = 1 ORDER BY `order` ';

        $binds[':groupID'] = $this->groupID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $name
     * @return bool|string
     */
    public function create($name)
    {
        if ($this->groupID === false) return false;

        $query = 'INSERT INTO `' . $this->getTableName() . '` 
            ( `groupID`, `name`, `order` ) VALUES
            ( :groupID, :name, :order )';

        $binds[':groupID'] = $this->groupID;
        $binds[':name'] = $name;
        $binds[':order'] = ($this->getMaxOrder() + 1);

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();
    }

    /**
     * @param $params
     * @return bool|string
     */
    public function parentCreate($params)
    {
        return parent::create($params);
    }

    /**
     * @param $groupID
     * @return bool
     */
    public function deleteByGroup($groupID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE `groupID` = :groupID ';

        $binds[':groupID'] = array($groupID, 'int');

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @return array|bool
     */
    public function getOfferTypes()
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `forSeller` = 1 ORDER BY `order` ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);

    }

    /**
     * @param $typeID
     * @return bool|mixed
     */
    public function getAttributes($typeID)
    {
        $query = 'SELECT po. * , attr.name AS attrName, attrRange.minPages, attrRange.step, attrRange.maxPages,
            attr.sort AS attrSort, 
            GROUP_CONCAT( DISTINCT CONCAT_WS("::", attrLang.lang, attrLang.name) SEPARATOR "||" ) as langs
            FROM `ps_products_options` AS po
            JOIN `ps_config_attributes` attr ON attr.ID = po.attrID
            JOIN `ps_config_attributeLangs` attrLang ON attr.ID = attrLang.attributeID
            LEFT JOIN `ps_config_attributeRanges` attrRange ON attr.rangeID = attrRange.ID
            WHERE po.typeID = :typeID GROUP BY attr.ID ORDER BY attrSort ASC ';

        $binds[':typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        if (!$res) {
            return false;
        }
        return $this->LangFilter->splitArray($res, 'langs');
    }

    /**
     * @param $typeID
     * @return array|bool
     */
    public function getOptions($typeID)
    {
        $query = 'SELECT po. * , opt.name AS optName,
            opt.sort AS optSort, opt.minThickness, opt.maxThickness, opt.sizePage, 
            opt.minPages, opt.maxPages, po.invisible, opt.emptyChoice, opt.iconID, opt.authorizedOnlyCalculation,
            GROUP_CONCAT( DISTINCT CONCAT_WS("::", optLang.lang, optLang.name) SEPARATOR "||" ) as langs 
            FROM `ps_products_options` AS po
            JOIN `ps_config_options` opt ON opt.ID = po.optID
            LEFT JOIN `ps_config_optionLangs` optLang ON opt.ID = optLang.optionID
            WHERE po.typeID = :typeID AND opt.active = 1 GROUP BY po.ID ORDER BY optSort ASC ';

        $binds[':typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll(PDO::FETCH_ASSOC);

        if (empty($res)) {
            return false;
        }

        $res = $this->LangFilter->splitArray($res, 'langs');

        $result = array();
        $optArr = array();
        foreach ($res as $key => $val) {
            $optArr[] = $val['optID'];
        }

        $exclusions = $this->getExclusions($optArr);
        $formats = $this->getFormats($typeID, $optArr);

        foreach ($res as $key => $val) {

            $prepareOption = array(
                'ID' => $val['optID'],
                'productOptionID' => $val['ID'],
                'name' => $val['optName'],
                'minThickness' => $val['minThickness'],
                'maxThickness' => $val['maxThickness'],
                'minPages' => $val['minPages'],
                'maxPages' => $val['maxPages'],
                'sizePage' => $val['sizePage'],
                'invisible' => $val['invisible'],
                'sort' => $val['optSort'],
                'emptyChoice' => $val['emptyChoice'] == 1 ? true : false,
                'default' => $val['default'],
                'iconID' => $val['iconID'],
                'authorizedOnlyCalculation' => $val['authorizedOnlyCalculation'],
            );

            if( is_array($exclusions) && array_key_exists($val['optID'], $exclusions) ) {
                $prepareOption['exclusions'] = $exclusions[$val['optID']];
            }
            if( is_array($formats) && array_key_exists($val['optID'], $formats) ) {
                $prepareOption['formats'] = $formats[$val['optID']];
            }
            if(  is_array($val) && array_key_exists('langs', $val) ) {
                $prepareOption['names'] = $val['langs'];
            } else {
                $prepareOption['names'] = NULL;
            }

            if( is_array($val) && array_key_exists('slugs', $val) ) {
                $prepareOption['slugs'] = $val['slugs'];
            } else {
                $prepareOption['slugs'] = NULL;
            }

            $result[$val['attrID']][] = $prepareOption;
        }

        return $result;
    }

    /**
     * @param $typeID
     * @param $options
     * @param null $active
     * @return array|bool
     */
    public function getFormats($typeID, $options, $active = NULL)
    {
        if (empty($options)) {
            return false;
        }

        $query = 'SELECT of.formatID, po.optID
            FROM `ps_products_options` AS po
            LEFT JOIN `ps_products_optionFormats` of ON of.productOptionID = po.ID
            LEFT JOIN `ps_products_formats` as pf ON pf.ID = of.formatID
            WHERE po.optID IN (' . implode(',', $options) . ') AND po.typeID = :typeID ';


        if( $active !== NULL ) {
            $query .= ' AND pf.active = :active ';
            $binds['active'] = $active;
        }

        $query .= ' GROUP BY of.ID ORDER BY pf.order ASC ';

        $binds = array();
        $binds['typeID'] = $typeID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        if (empty($res)) {
            return false;
        }
        $result = array();
        foreach ($res as $key => $val) {
            if($val['formatID']) {
                $result[$val['optID']][] = $val['formatID'];
            }
        }

        return $result;
    }

    /**
     * @param $options
     * @return array|bool
     */
    public function getExclusions($options)
    {
        if (empty($options)) {
            return false;
        }
        $query = 'SELECT optID, excAttrID, excOptID FROM `ps_config_exclusions` AS ce'
            . ' WHERE ce.optID IN (' . implode(',', $options) . ') ';
        $binds = array();
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        if (empty($res)) {
            return false;
        }
        $result = array();
        foreach ($res as $key => $val) {
            $result[$val['optID']][$val['excAttrID']][] = $val['excOptID'];
        }
        return $result;
    }

    /**
     * @param $list
     * @param bool $active
     * @return array|bool
     */
    public function customGetByList($list, $active = false)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT `' . $this->getTableName() . '`.*,
                `' . $this->tableTypeLangs . '`.`lang` as lLang,
                `' . $this->tableTypeLangs . '`.`name` as lName,
                `' . $this->tableTypeLangs . '`.`icon` as lDescription,
                `' . $this->tableTypeLangs . '`.`slug` as lSlug 
                FROM `' . $this->getTableName() . '`
                LEFT JOIN `' . $this->tableTypeLangs . '` ON `' . $this->tableTypeLangs . '`.`typeID` = `' . $this->getTableName() . '`.`ID`
                WHERE `' . $this->getTableName() . '`.`ID` IN (' . implode(',', $list) . ') ';

        if( $active ) {
            $query .= ' AND `' . $this->getTableName() . '`.`active` = 1 ';
        }

        $query .=' ORDER BY FIELD(`' . $this->getTableName() . '`.`ID`, ' . implode(',', $list) . ' ) ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) return false;

        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        $result = array();
        foreach ($res as $r) {
            $lLang = $lName = $lDescription = $lSlug = null;
            if (!empty($r['lLang'])) {
                $lLang = $r['lLang'];
                $lName = $r['lName'];
                $lDescription = $r['lDescription'];
                $lSlug = $r['lSlug'];
            }
            unset($r['lLang']);
            unset($r['lName']);
            unset($r['lDescription']);
            unset($r['lSlug']);
            $key = $r['ID'];
            if (!isset($result[$key])) {
                $result[$key] = array();
            }
            $result[$key] = array_merge($result[$key], $r);
            if (!empty($lLang)) {
                if (!isset($result[$key]['names'])) {
                    $result[$key]['names'] = array();
                }
                if (!isset($result[$key]['icons'])) {
                    $result[$key]['icons'] = array();
                }
                $result[$key]['icons'][$lLang] = $lDescription;
                $result[$key]['names'][$lLang] = $lName;
                $result[$key]['slugs'][$lLang] = $lSlug;
            }
            $result[$key]['groupID'] = $r['groupID'];
            $result[$key]['iconID'] = $r['iconID'];
        }

        $data = array();
        foreach ($result as $r) {
            $data[] = $r;
        }

        return $data;
    }

    /**
     * @param $list
     * @return array|bool
     */
    public function getByList2($list)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT `' . $this->getTableName() . '`.*,
                `' . $this->tableTypeLangs . '`.`lang` as lLang,
                `' . $this->tableTypeLangs . '`.`name` as lName,
                `' . $this->tableTypeLangs . '`.`icon` as lDescription, 
                `' . $this->tableTypeLangs . '`.`slug` as lSlug
                FROM `' . $this->getTableName() . '`
                LEFT JOIN `' . $this->tableTypeLangs . '` ON `' . $this->tableTypeLangs . '`.`typeID` = `' . $this->getTableName() . '`.`ID`
                WHERE `' . $this->getTableName() . '`.`ID` IN (' . implode(',', $list) . ')  
                ORDER BY FIELD(`' . $this->getTableName() . '`.`ID`, ' . implode(',', $list) . ' ) ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        $result = array();
        foreach ($res as $r) {
            $lLang = $lName = $lDescription = $lSlug = null;
            if (!empty($r['lLang'])) {
                $lLang = $r['lLang'];
                $lName = $r['lName'];
                $lDescription = $r['lDescription'];
                $lSlug = $r['lSlug'];
            }
            unset($r['lLang']);
            unset($r['lName']);
            unset($r['lDescription']);
            unset($r['lSlug']);
            $key = $r['ID'];
            if (!isset($result[$key])) {
                $result[$key] = array();
            }
            $result[$key] = array_merge($result[$key], $r);
            if (!empty($lLang)) {
                if (!isset($result[$key]['names'])) {
                    $result[$key]['names'] = array();
                }

                $result[$key]['names'][$lLang] = $lName;
                $result[$key]['icons'][$lLang] = $lDescription;
                $result[$key]['slugs'][$lLang] = $lSlug;
            }
        }

        $data = array();
        foreach ($result as $r) {
            $data[$r['ID']] = $r;
        }

        return $data;
    }

    /**
     * @param $groups
     * @return array|bool
     */
    public function getTypesByGroupList($groups)
    {
        if (empty($groups)) {
            return false;
        }

        $query = 'SELECT `' . $this->getTableName() . '`.groupID, `' . $this->getTableName() . '`.ID FROM `' . $this->getTableName() . '` 
                WHERE `' . $this->getTableName() . '`.`groupID` IN (' . implode(',', $groups) . ') ';

        if (!$this->db->exec($query)) return false;

        $res = $this->db->getAll(PDO::FETCH_ASSOC);

        if (!$res) {
            return false;
        }
        $result = array();
        foreach ($res as $row) {
            $result[$row['groupID']][] = $row['ID'];
        }

        return $result;
    }

    /**
     * @param $text
     * @param bool $active
     * @return array|bool
     */
    public function searchByText($text, $active = false)
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*,
                `' . $this->tableTypeLangs . '`.`lang` as lLang,
                `' . $this->tableTypeLangs . '`.`name` as lName,
                `' . $this->tableTypeLangs . '`.`icon` as lDescription, 
                `' . $this->tableTypeLangs . '`.`slug` as lSlug 
                FROM `' . $this->getTableName() . '`
                LEFT JOIN `' . $this->tableTypeLangs . '` ON `' . $this->tableTypeLangs . '`.`typeID` = `' . $this->getTableName() . '`.`ID` 
                WHERE ( `' . $this->getTableName() . '`.`name` LIKE :text OR `' . $this->tableTypeLangs . '`.`name` LIKE :text )
                AND `' . $this->tableTypeLangs . '`.lang = :lang ';

        if( $active ) {
            $query .= ' AND `' . $this->getTableName() . '`.active = 1 ';
        }

        $query .= ' ORDER BY `' . $this->getTableName() . '`.`order` ';

        $text = $this->SearchFilter->prepareString($text);

        $binds['text'] = '%' . $text . '%';
        $binds['lang'] = lang;

        if (!$this->db->exec($query, $binds)) return false;

        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        $result = array();
        foreach ($res as $r) {
            $lLang = $lName = $lDescription = $lSlug = null;
            if (!empty($r['lLang'])) {
                $lLang = $r['lLang'];
                $lName = $r['lName'];
                $lDescription = $r['lDescription'];
                $lSlug = $r['lSlug'];
            }
            unset($r['lLang']);
            unset($r['lName']);
            unset($r['lDescription']);
            unset($r['lSlug']);
            $key = $r['ID'];
            if (!isset($result[$key])) {
                $result[$key] = array();
            }
            $result[$key] = array_merge($result[$key], $r);
            if (!empty($lLang)) {
                if (!isset($result[$key]['names'])) {
                    $result[$key]['names'] = array();
                }
                if (!isset($result[$key]['icons'])) {
                    $result[$key]['icons'] = array();
                }
                $result[$key]['names'][$lLang] = $lName;
                $result[$key]['icons'][$lLang] = $lDescription;
                $result[$key]['slugs'][$lLang] = $lSlug;
            }
        }

        $data = array();
        foreach ($result as $r) {
            $data[] = $r;
        }

        return $data;
    }

    /**
     * @param $text
     * @param int $limit
     * @param null $active
     * @return array|bool|mixed
     */
    public function searchAdmin($text, $limit = 10, $active = NULL)
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*, `ps_products_groups`.name as groupName, 
        GROUP_CONCAT( DISTINCT CONCAT_WS(  "::", typeLangs.lang, typeLangs.name )
        SEPARATOR  "||" ) AS langs 
                FROM `' . $this->getTableName() . '`
                LEFT JOIN (
        SELECT typeID, lang, name
        FROM  `ps_products_typeLangs`
        ) AS typeLangs ON typeLangs.typeID =  `ps_products_types`.ID 
        LEFT JOIN `ps_products_groups` ON `ps_products_groups`.ID = `' . $this->getTableName() . '`.groupID
                WHERE ( `' . $this->getTableName() . '`.`name` LIKE :text OR `typeLangs`.`name` LIKE :text ) ';

        if( $active !== NULL ) {
            $query .= ' AND `' . $this->getTableName() . '`.active = :active ';
            $binds['active'] = $active;
        }

        $query .= ' 
        GROUP BY `' . $this->getTableName() . '`.ID
        ORDER BY `' . $this->getTableName() . '`.`order` 
         ';

        $query .= ' LIMIT '.intval($limit).' ';

        $text = $this->SearchFilter->prepareString($text);

        $binds['text'] = '%' . $text . '%';
        $binds['lang'] = lang;

        if (!$this->db->exec($query, $binds)) return false;

        $result = $this->db->getAll(PDO::FETCH_ASSOC);

        $result = $this->LangFilter->splitArray($result, 'langs');

        return $result;
    }

    /**
     * @return array|bool
     */
    public function getTypeForEditor()
    {
        if ($this->getTypeID() === false) return false;


        $query = 'SELECT types.*, 
          types.`name` as typeName, groups.`name` as groupName, groups.`ID` as groupID,
          GROUP_CONCAT( DISTINCT CONCAT_WS("::", typeLangs.lang, typeLangs.name) SEPARATOR "||" ) as langs,
          GROUP_CONCAT( DISTINCT CONCAT_WS("::", typeLangs.slug, typeLangs.name) SEPARATOR "||" ) as slugs,
          types.ID as typeID 
          FROM `' . $this->getTableName() . '` as types
          LEFT JOIN `ps_products_typeLangs` as typeLangs ON typeLangs.`typeID` = types.`ID`
          LEFT JOIN `ps_products_groups` as groups ON groups.ID = types.groupID
          WHERE types.ID = :typeID GROUP BY types.ID ';

        $binds['typeID'] = $this->getTypeID();

        if (!$this->db->exec($query, $binds)) return false;

        $result = $this->db->getAll(PDO::FETCH_ASSOC);

        $result = $this->LangFilter->splitArray($result, 'langs');
        $result = $this->LangFilter->splitArray($result, 'slugs');

        $groups = array();

        $noComplexGroup = array();
        foreach ($result as $key => $product) {
            $noComplexGroup[] = $product;
        }

        if (!empty($noComplexGroup)) {
            foreach ($noComplexGroup as $product) {
                $groups[] = array(
                    'complexID' => null,
                    'ID' => null,
                    'productID' => $product['ID'],
                    'name' => $product['typeName'],
                    'names' => $product['langs'],
                    'slugs' => $product['slugs'],
                    'type' => 'single',
                    'products' => array($product)
                );
            }
        }

        return $groups;
    }
}
