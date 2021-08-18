<?php

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Models\PrintShop\PrintShop;

use PDO;
use Exception;

/**
 * Description of PrintShopPage
 *
 * @author Rafał
 */
class PrintShopPage extends PrintShop
{

    /**
     * PrintShopPage constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_pages', $prefix);
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID ';

        $query .= ' ORDER BY `pages` ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $pages
     * @return bool|string
     * @throws Exception
     */
    public function create($pages)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        if ($this->getRangePages()) {
            $this->deletePages();
        }

        if ($this->customExist($pages)) {
            throw new Exception('Item exist', 1);
        }

        $query = 'INSERT INTO `' . $this->getTableName() . '` 
            ( `groupID`, `typeID`, `pages` ) VALUES
            ( :groupID, :typeID, :pages )';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':pages'] = $pages;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();
    }

    /**
     * @param $params
     * @return bool|int
     */
    public function parentCreate($params)
    {
        return parent::create($params);
    }

    /**
     * @param $pages
     * @return bool
     */
    public function customExist($pages)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID 
                AND `pages` = :pages
                ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':pages'] = $pages;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getOne();
    }

    /**
     * @param $minPages
     * @param $maxPages
     * @param $step
     * @param int $doublePage
     * @return bool|string
     */
    public function createRange($minPages, $maxPages, $step, $doublePage = 0)
    {
        $this->deletePages();

        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'INSERT INTO `' . $this->getTableName() . '` 
            ( `groupID`, `typeID`, `minPages`, `maxPages`, `step`, `doublePage` ) VALUES
            ( :groupID, :typeID, :minPages, :maxPages, :step, :doublePage )';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':minPages'] = $minPages;
        $binds[':maxPages'] = $maxPages;
        $binds[':step'] = $step;
        $binds[':doublePage'] = $doublePage;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();

    }

    /**
     * @return bool
     */
    public function getRange()
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'SELECT `minPages`, `maxPages`, `step` FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID AND `pages` IS NULL
                ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @return bool
     */
    public function getRangePages()
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'SELECT `minPages`, `maxPages`, `step` FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID AND `pages` IS NULL
                ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @return bool
     */
    public function getPages()
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID AND `pages` IS NULL
                ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param null $pages
     * @return bool
     */
    public function deletePages($pages = null)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'DELETE FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID ';
        if ($pages !== null) $query .= ' AND `pages` = :pages';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        if ($pages !== null) $binds[':pages'] = $pages;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return bool
     */
    public function deleteByGroupType($groupID, $typeID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID
                ';

        $binds[':groupID'] = $groupID;
        $binds[':typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param $pages
     * @return bool
     */
    public function getByIDs($pages)
    {
        if (empty($pages)) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                WHERE `ID` IN (' . implode(',', $pages) . ') ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return bool
     */
    public function getDoublePage($groupID, $typeID)
    {
        $query = 'SELECT `doublePage` FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID
                ORDER BY `pages`
                ';

        $binds[':groupID'] = $groupID;
        $binds[':typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getOne();
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return bool
     */
    public function getPagesSimilar($groupID, $typeID)
    {
        $query = 'SELECT `similar` FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID
                ORDER BY `similar` DESC
                ';

        $binds[':groupID'] = $groupID;
        $binds[':typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getOne();
    }

    /**
     * @param $similar
     * @return bool
     */
    public function setPagesSimilar($similar)
    {
        if ($this->groupID === false) return false;
        if ($this->typeID === false) return false;

        $query = 'UPDATE `' . $this->getTableName() . '` 
            SET `similar` = :value
            WHERE `groupID` = :groupID AND `typeID` = :typeID
            ';

        $binds[':groupID'] = $this->groupID;
        $binds[':typeID'] = $this->typeID;
        $binds[':value'] = $similar;

        if (!$this->db->exec($query, $binds)) return false;

        return true;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return bool
     */
    public function getPagesRange($groupID, $typeID)
    {
        $query = 'SELECT `minPages`, `maxPages` FROM `' . $this->getTableName() . '` 
                WHERE `groupID` = :groupID AND `typeID` = :typeID AND `pages` IS NULL AND 
                (`minPages` > 0 OR `maxPages` > 0)  
                ORDER BY `similar` DESC ';

        $binds['groupID'] = $groupID;
        $binds['typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getRow();
    }

}
