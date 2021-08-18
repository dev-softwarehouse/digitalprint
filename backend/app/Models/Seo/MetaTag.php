<?php

namespace DreamSoft\Models\Seo;

use DreamSoft\Core\Model;

class MetaTag extends Model
{
    /**
     * MetaTag constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('metatags', true);
    }

    /**
     * @param $ID
     * @return bool
     */
    public function getByID($ID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `ID` = :ID';

        $binds['ID'] = $ID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();

    }

    /**
     * @param $elem
     * @param $elemID
     * @return bool
     */
    public function getByElemID($elem, $elemID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `' . $elem . '` = :elemID';

        $binds['elemID'] = $elemID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();

    }

    /**
     * @param $lang
     * @param $elem
     * @param $elemID
     * @param $title
     * @param $keywords
     * @param $description
     * @return bool
     */
    public function set($lang, $elem, $elemID, $title, $keywords, $description)
    {

        $query = 'INSERT INTO `' . $this->getTableName() . '` (`' . $elem . '`, `title`, `keywords`, `description`, `lang`) VALUES (:elemID, :title, :keywords, :description, :lang)';

        $binds['elemID'] = $elemID;
        $binds['title'] = $title;
        $binds['keywords'] = $keywords;
        $binds['description'] = $description;
        $binds['lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();
    }

    /**
     * @param $elem
     * @param $elemID
     * @return bool
     */
    public function removeByElemID($elem, $elemID)
    {

        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE `' . $elem . '` = :elemID';

        $binds['elemID'] = $elemID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $groupID
     * @return bool|array
     */
    public function getByGroup($groupID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `groupID` = :groupID AND `typeID` IS NULL';

        $binds['groupID'] = $groupID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $typeID
     * @return bool
     */
    public function getByType($typeID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `typeID` = :typeID AND `groupID` IS NULL';

        $binds['typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $categoryID
     * @return bool
     */
    public function getByCategory($categoryID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `catID` = :categoryID OR `subcatID` = :categoryID';

        $binds['categoryID'] = $categoryID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }
}