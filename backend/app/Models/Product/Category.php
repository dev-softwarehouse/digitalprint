<?php

namespace DreamSoft\Models\Product;
/**
 * Description of Category
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;
use PDO;

class Category extends Model
{

    /**
     * @var string
     */
    private $categoryLangs;
    /**
     * @var int
     */
    private $domainID;

    /**
     * Category constructor.
     */
    public function __construct()
    {

        parent::__construct();

        $this->setTableName('categories', true);
        $this->categoryLangs = $this->prefix . 'categoryLangs';
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * @return mixed
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param int $active
     * @param string $discountGroups
     * @return bool|array
     */
    public function getAll($active = 1, $discountGroups = 'all')
    {
        $query = 'SELECT c.*, GROUP_CONCAT( DISTINCT CONCAT_WS("::", cl.lang, cl.slug, cl.name, cl.icon) SEPARATOR "||" ) AS langs FROM `' . $this->getTableName() . '` AS c '
            . ' LEFT JOIN `' . $this->categoryLangs . '` AS cl ON cl.categoryID = c.ID ';

        $query .= ' WHERE c.domainID = :domainID ';

        if ($active != NULL) {
            $query .= ' AND c.active = :active ';
            $binds['active'] = $active;
        }

        if ($discountGroups == 'all') {

        } else if ($discountGroups != NULL && is_array($discountGroups)) {
            $query .= ' AND (c.`discountGroupID` IN ('.implode(',', $discountGroups).') OR c.`discountGroupID` IS NULL) ';
        } else {
            $query .= ' AND c.`discountGroupID` IS NULL ';
        }

        $binds['domainID'] = $this->getDomainID();

        $query .= ' GROUP BY c.ID'
            . ' ORDER BY c.parentID, c.sort ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $categoryID
     * @return bool
     */
    public function getOne($categoryID)
    {
        $query = 'SELECT c.*, GROUP_CONCAT( DISTINCT CONCAT_WS("::", cl.lang, cl.slug, cl.name) SEPARATOR "||" ) AS langs FROM `' . $this->getTableName() . '` AS c '
            . ' LEFT JOIN `' . $this->categoryLangs . '` AS cl ON cl.categoryID = c.ID ';


        $query .= ' WHERE c.ID = :categoryID AND c.domainID = :domainID ';
        $binds['domainID'] = $this->getDomainID();
        $binds['categoryID'] = $categoryID;


        $query .= ' GROUP BY c.ID'
            . ' LIMIT 1 ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @return bool
     */
    public function getParents()
    {
        $query = 'SELECT c.*, GROUP_CONCAT( DISTINCT CONCAT_WS("::", cl.lang, cl.slug, cl.name) SEPARATOR "||" ) AS langs FROM `' . $this->getTableName() . '` AS c '
            . ' LEFT JOIN `' . $this->categoryLangs . '` AS cl ON c.ID =  cl.categoryID '
            . ' WHERE c.parentID = 0 AND domainID = :domainID ';
        $query .= ' GROUP BY cl.categoryID '
            . ' ORDER BY c.created ';

        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $cats
     * @return bool
     */
    public function sort($cats)
    {
        $result = true;

        foreach ($cats as $index => $categoryID) {

            $query = 'UPDATE `' . $this->getTableName() . '` SET `sort` = :index WHERE `ID` = :categoryID ';

            $binds['categoryID'] = array($categoryID, 'int');
            $binds['index'] = $index;
            if (!$this->db->exec($query, $binds)) {
                $result = false;
            }
        }
        return $result;
    }

    /**
     * @param $parentID
     * @return bool
     */
    public function getMaxSort($parentID)
    {
        $query = 'SELECT MAX(c.sort) FROM `' . $this->getTableName() . '` AS c '
            . ' WHERE domainID = :domainID AND `parentID` = :parentID ';

        $binds['domainID'] = $this->getDomainID();
        $binds['parentID'] = $parentID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $parentID
     * @return bool
     */
    public function getChilds($parentID )
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` AS c '
            . ' WHERE domainID = :domainID AND `parentID` = :parentID ';

        $binds['domainID'] = $this->getDomainID();
        $binds['parentID'] = $parentID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $parentID
     * @param null $discountGroups
     * @return bool
     */
    public function getInfoChilds($parentID, $discountGroups = NULL)
    {
        $query = 'SELECT c.*, 
                GROUP_CONCAT( 
                DISTINCT CONCAT_WS("::", cl.lang, cl.slug, cl.name, cl.icon
                ) SEPARATOR "||" ) AS langs FROM `' . $this->getTableName() . '` AS c '
            . ' LEFT JOIN `' . $this->categoryLangs . '` AS cl ON c.ID =  cl.categoryID '
            . ' WHERE domainID = :domainID AND `parentID` = :parentID ';

        if ($discountGroups != NULL) {
            $query .= ' AND (c.`discountGroupID` IN ('.implode(',', $discountGroups).') OR c.`discountGroupID` IS NULL) ';
        } else {
            $query .= ' AND c.`discountGroupID` IS NULL ';
        }

        $query .= ' GROUP BY cl.categoryID ORDER BY c.created ';

        $binds['domainID'] = $this->getDomainID();
        $binds['parentID'] = $parentID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

}
