<?php

namespace DreamSoft\Models\PrintShop;

use DreamSoft\Models\Behaviours\LangFilter;
use PDO;
/**
 * Class PrintShopComplex
 */
class PrintShopComplex extends PrintShop
{

    /**
     * @var LangFilter
     */
    protected $LangFilter;

    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_complex', $prefix);
        $this->LangFilter = new LangFilter();
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {
        if ($this->typeID === false) return false;


        $query = 'SELECT `' . $this->getTableName() . '`.*, `' . $this->getTableName() . '`.ID as complexID, 
          types.`name` as typeName, groups.`name` as groupName, groups.`ID` as groupID,
          GROUP_CONCAT( DISTINCT CONCAT_WS("::", typeLangs.lang, typeLangs.name) SEPARATOR "||" ) as langs
          FROM `' . $this->getTableName() . '`
          LEFT JOIN `ps_products_types` as types ON types.ID = `' . $this->getTableName() . '`.typeID
          LEFT JOIN `ps_products_typeLangs` as typeLangs ON typeLangs.`typeID` = types.`ID`
          LEFT JOIN `ps_products_groups` as groups ON groups.ID = types.groupID
          WHERE baseID = :baseID GROUP BY `' . $this->getTableName() . '`.ID ';

        $binds[':baseID'] = $this->typeID;

        if (!$this->db->exec($query, $binds)) return false;

        $result = $this->db->getAll(PDO::FETCH_ASSOC);

        $result = $this->LangFilter->splitArray($result, 'langs');

        $groupsID = array();
        foreach ($result as $product) {
            if ($product['complexGroupID']) {
                $groupsID[] = $product['complexGroupID'];
            }
        }

        if (!empty($groupsID)) {
            $query = 'SELECT * FROM `ps_products_complexGroups`
                  WHERE `ID` IN(' . implode(',', $groupsID) . ')';
            if (!$this->db->exec($query)) return false;
            $groupsDb = $this->db->getAll(PDO::FETCH_ASSOC);
        }

        $groups = array();
        if (!empty($groupsDb)) {
            foreach ($groupsDb as $each) {
                $groups[$each['ID']] = $each;
            }
        }

        $noComplexGroup = array();
        foreach ($result as $key => $product) {
            if ($product['complexGroupID']) {
                if (!isset($groups[$product['complexGroupID']]['products'])) {
                    $groups[$product['complexGroupID']]['products'] = array();
                }
                $groups[$product['complexGroupID']]['products'][] = $product;
            } else {
                $noComplexGroup[] = $product;
            }
        }

        sort($groups);
        if (!empty($noComplexGroup)) {
            foreach ($noComplexGroup as $product) {
                $groups[] = array(
                    'complexID' => $product['complexID'],
                    'ID' => null,
                    'productID' => $product['ID'],
                    'name' => $product['typeName'],
                    'names' => $product['langs'],
                    'type' => 'other',
                    'products' => array($product)
                );
            }
        }

        return $groups;

    }

    /**
     * @param $ID
     * @return bool
     */
    public function customGet($ID)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.*, types.`name` as typeName, groups.`name` as groupName, groups.`ID` as groupID
            FROM `' . $this->getTableName() . '`
            LEFT JOIN `ps_products_types` as types ON types.ID = `' . $this->getTableName() . '`.typeID
            LEFT JOIN `ps_products_groups` as groups ON groups.ID = types.groupID
            WHERE `' . $this->getTableName() . '`.ID = :ID ';

        $binds[':ID'] = $ID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $complexGroupID
     * @return bool
     */
    public function usedGroup($complexGroupID)
    {
        $query = 'SELECT COUNT(`complexGroupID`) 
              FROM `' . $this->getTableName() . '` 
              WHERE `complexGroupID` = :complexGroupID ';

        $binds[':complexGroupID'] = $complexGroupID;

        if (!$this->db->exec($query, $binds)) return false;
        return !!$this->db->getOne();
    }

    /**
     * @param $baseID
     * @return bool
     */
    public function getBase($baseID)
    {
        $query = 'SELECT * 
              FROM `' . $this->getTableName() . '` 
              WHERE `baseID` = :baseID ';

        $binds['baseID'] = $baseID;

        if (!$this->db->exec($query, $binds)) return false;
        return $this->db->getRow();
    }

    /**
     * @param $typeID
     * @return bool
     */
    public function getByType($typeID)
    {
        $query = 'SELECT * 
              FROM `' . $this->getTableName() . '` 
              WHERE `typeID` = :typeID ';

        $binds['typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) return false;
        return $this->db->getRow();
    }

    /**
     * @param $baseID
     * @param null $complexGroupID
     * @return array|bool
     */
    public function getByBaseID($baseID, $complexGroupID = NULL)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
              WHERE `baseID` = :baseID ';

        if ($complexGroupID != NULL) {
            $query .= ' AND (`complexGroupID` != :complexGroupID OR `complexGroupID` IS NULL) ';
            $binds['complexGroupID'] = $complexGroupID;
        }

        $binds['baseID'] = $baseID;

        if (!$this->db->exec($query, $binds)) return false;
        return $this->db->getAll();
    }
}