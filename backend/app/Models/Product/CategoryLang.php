<?php

namespace DreamSoft\Models\Product;

/**
 * Description of CategoryLang
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\UrlMaker;

class CategoryLang extends Model
{

    /**
     * @var UrlMaker
     */
    private $UrlMaker;

    /**
     * CategoryLang constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('categoryLangs', true);
        $this->UrlMaker = new UrlMaker();
    }

    /**
     * @param $categoryID
     * @param $lang
     * @param null $name
     * @param null $slug
     * @param null $icon
     * @return bool
     */
    public function set($categoryID, $lang, $name = NULL, $slug = NULL, $icon = NULL)
    {
        $response = false;
        $actID = $this->exist($categoryID, $lang);

        if (intval($actID) > 0) {

            $updated = 0;
            if ($name) {
                $updated += intval($this->update($actID, 'name', $name));
            }
            if ($slug) {
                $updated += intval($this->update($actID, 'slug', $this->UrlMaker->permalink($slug)));
            }
            if ($icon) {
                $updated += intval($this->update($actID, 'icon', $icon));
            }

            if ($updated > 0) {
                $response = true;
            }


        } else {
            if (!$slug) {
                $slug = $this->UrlMaker->permalink($name);
            } else {
                $slug = $this->UrlMaker->permalink($slug);
            }
            $params['slug'] = $slug;
            $params['lang'] = $lang;
            $params['categoryID'] = $categoryID;
            $params['name'] = $name;
            $actID = $this->create($params);
            if (intval($actID) > 0) {
                $response = true;
            }
        }
        return $response;
    }

    /**
     * @param $categoryID
     * @param $lang
     * @return bool|mixed
     */
    public function exist($categoryID, $lang)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE categoryID = :categoryID AND '
            . ' lang = :lang ';

        $binds['categoryID'] = $categoryID;
        $binds['lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }

    /**
     * @param $url
     * @param $domainID
     * @param $lang
     * @return bool|mixed
     */
    public function existOne($url, $domainID, $lang)
    {

        $slug = $this->UrlMaker->permalink($url);

        $query = 'SELECT  `dp_categoryLangs`.`categoryID`, COUNT(`dp_categoryLangs`.`ID`) as `count`, `dp_categoryLangs`.`ID`,  `dp_categoryLangs`.`slug` FROM `' . $this->getTableName() . '` '
            . ' LEFT JOIN `dp_categories` ON `dp_categories`.`ID` = `' . $this->getTableName() . '`.`categoryID` '
            . ' WHERE domainID = :domainID AND '
            . ' lang = :lang AND `slug` = :slug ';

        $binds['lang'] = $lang;
        $binds['domainID'] = $domainID;
        $binds['slug'] = $slug;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getRow();
    }

    /**
     * @param $categoryID
     * @return bool
     */
    public function deleteByCategory($categoryID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE `categoryID` = :categoryID ';

        $binds['categoryID'] = $categoryID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param $categoryID
     * @return array|bool
     */
    public function getForCategory($categoryID)
    {
        $query = 'SELECT `lang`,`name`,`slug`, `icon`  FROM `' . $this->getTableName() . '` WHERE categoryID = :categoryID ';

        $binds['categoryID'] = $categoryID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();
        if (!$res) {
            return array();
        }
        $result = array();
        foreach ($res as $key => $value) {
            $result[$value['lang']] = array('name' => $value['name'], 'url' => $value['slug']);

        }

        return $result;
    }

    /**
     * @param $categoryID
     * @return array|bool
     */
    public function getIconForCategory($categoryID)
    {
        $query = 'SELECT `lang`, `icon`  FROM `' . $this->getTableName() . '` WHERE categoryID = :categoryID ';

        $binds['categoryID'] = $categoryID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();
        if (!$res) {
            return array();
        }
        $result = array();
        foreach ($res as $key => $value) {
            $result[$value['lang']] = array($value['icon']);

        }

        return $result;
    }

    /**
     * @param $url
     * @param $lang
     * @return bool|mixed
     */
    public function getByUrl($url, $lang)
    {
        $query = 'SELECT `categoryID` FROM `' . $this->getTableName() . '` WHERE slug = :slug AND '
            . ' lang = :lang ';

        $binds['slug'] = $url;
        $binds['lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }

}
