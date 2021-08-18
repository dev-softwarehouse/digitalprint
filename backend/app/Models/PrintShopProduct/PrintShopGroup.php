<?php

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Description of PrintShopGroup
 *
 * @author Właściciel
 */
class PrintShopGroup extends PrintShop
{

    /**
     * @var string
     */
    protected $tableGroupLangs;

    /**
     * PrintShopGroup constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_groups', $prefix);
        $this->tableGroupLangs = $this->prefix . 'products_groupLangs';
    }

    /**
     * @param bool $active
     * @param bool $withAdminItems
     * @return array|bool
     */
    public function getAll($active = false, $withAdminItems = false)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.*,
                         `' . $this->tableGroupLangs . '`.`lang` as lLang,
                         `' . $this->tableGroupLangs . '`.`name` as lName,
                         `' . $this->tableGroupLangs . '`.`slug` as lSlug,
                         `' . $this->tableGroupLangs . '`.`icon` as lIcon
                 FROM `' . $this->getTableName() . '` 
                 LEFT JOIN `' . $this->tableGroupLangs . '` ON `' . $this->tableGroupLangs . '`.`groupID` = `' . $this->getTableName() . '`.`ID`
                 ';

        if ($active && $withAdminItems) {
            $query .= ' WHERE (`' . $this->getTableName() . '`.`active` = 1 OR `' . $this->getTableName() . '`.`forSeller` = 1 )';
        } else if ($active) {
            $query .= ' WHERE `' . $this->getTableName() . '`.`active` = 1';
        }

        if (!$this->db->exec($query)) return false;

        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        $result = array();
        foreach ($res as $r) {
            $lLang = $lName = $lIcon = $lSlug = null;
            if (!empty($r['lLang'])) {
                $lLang = $r['lLang'];
                $lName = $r['lName'];
                $lIcon = $r['lIcon'];
                $lSlug = $r['lSlug'];
            }
            unset($r['lLang']);
            unset($r['lName']);
            unset($r['lIcon']);
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
                $result[$key]['icons'][$lLang] = $lIcon;
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
     * @param $id
     * @return array|bool
     */
    public function customGet($id)
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*,
                    `' . $this->tableGroupLangs . '`.`lang` as lLang,
                     `' . $this->tableGroupLangs . '`.`name` as lName,
                     `' . $this->tableGroupLangs . '`.`slug` as lSlug,
                     `' . $this->tableGroupLangs . '`.`icon` as lIcon
                         
                 FROM `' . $this->getTableName() . '`
                 LEFT JOIN `' . $this->tableGroupLangs . '` ON `' . $this->tableGroupLangs . '`.`groupID` = `' . $this->getTableName() . '`.`ID`
                 WHERE `' . $this->getTableName() . '`.`ID` = :ID ';

        $binds[':ID'] = $id;

        if (!$this->db->exec($query, $binds)) return false;

        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        $result = array();
        foreach ($res as $r) {
            $lLang = $lName = $lIcon = $lSlug = null;
            if (!empty($r['lLang'])) {
                $lLang = $r['lLang'];
                $lName = $r['lName'];
                $lIcon = $r['lIcon'];
                $lSlug = $r['lSlug'];
            }
            unset($r['lLang']);
            unset($r['lName']);
            unset($r['lIcon']);
            unset($r['lSlug']);
            $result = array_merge($result, $r);
            if (!empty($lLang)) {
                if (!isset($result['names'])) {
                    $result['names'] = array();
                }
                $result['names'][$lLang] = $lName;
                $result['slugs'][$lLang] = $lSlug;
                $result['icons'][$lLang] = $lIcon;
            }
        }
        return $result;
    }

    /**
     * @return array|bool
     */
    public function getActiveGroups()
    {
        return $this->getAll(true);
    }

    /**
     * @param $name
     * @param int $forSeller
     * @return bool|string
     */
    public function customCreate($name, $forSeller = 0)
    {
        $query = 'INSERT INTO `' . $this->getTableName() . '` 
            ( `name`, `forSeller` ) VALUES
            ( :name, :forSeller )';

        $binds[':name'] = $name;
        $binds[':forSeller'] = $forSeller;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();
    }

    /**
     * @return bool
     */
    public function getOfferGroups()
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `forSeller` = 1  ORDER BY `order` ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);

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

        foreach ($list as $key => $l) {
            if (empty($l)) {
                unset($list[$key]);
            }
        }

        $query = 'SELECT `' . $this->getTableName() . '`.*,
                         `' . $this->tableGroupLangs . '`.`lang` as lLang,
                         `' . $this->tableGroupLangs . '`.`name` as lName,
                         `' . $this->tableGroupLangs . '`.`icon` as lIcon,
                         `' . $this->tableGroupLangs . '`.`slug` as lSlug
                 FROM `' . $this->getTableName() . '` 
                 LEFT JOIN `' . $this->tableGroupLangs . '` ON `' . $this->tableGroupLangs . '`.`groupID` = `' . $this->getTableName() . '`.`ID`
                 WHERE `' . $this->getTableName() . '`.`ID` IN (' . implode(',', $list) . ')  
                ORDER BY FIELD(`' . $this->getTableName() . '`.`ID`, ' . implode(',', $list) . ' ) ';


        if (!$this->db->exec($query)) return false;

        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        $result = array();
        foreach ($res as $r) {
            $lLang = $lName = $lIcon = $lSlug = null;
            if (!empty($r['lLang'])) {
                $lLang = $r['lLang'];
                $lName = $r['lName'];
                $lIcon = $r['lIcon'];
                $lSlug = $r['lSlug'];
            }
            unset($r['lLang']);
            unset($r['lName']);
            unset($r['lIcon']);
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
                $result[$key]['icons'][$lLang] = $lIcon;
                $result[$key]['slugs'][$lLang] = $lSlug;
                $result[$key]['iconID'] = $r['iconID'];
            }
        }

        $data = array();
        foreach ($result as $r) {
            $data[$r['ID']] = $r;
        }

        return $data;

    }


}

?>
