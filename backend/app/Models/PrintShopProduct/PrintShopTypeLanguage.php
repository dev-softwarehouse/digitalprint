<?php

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\UrlMaker;

/**
 * Class PrintShopTypeLang
 */
class PrintShopTypeLanguage extends Model
{
    /**
     * @var UrlMaker
     */
    private $UrlMaker;

    /**
     * PrintShopTypeLang constructor.
     */
    public function __construct()
    {
        parent::__construct();

        $this->prefix = 'ps_';
        $this->setTableName('products_typeLangs', true);
        $this->UrlMaker = new UrlMaker();
    }

    /**
     * @param $lang
     * @param $name
     * @param $typeID
     * @param null $slug
     * @return bool
     */
    public function set($lang, $name, $typeID, $slug = NULL)
    {
        $ID = $this->exist($typeID, $lang);

        if (!$slug) {
            $slug = $this->UrlMaker->permalink($name);
        }

        if (!$ID) {
            $lastID = $this->create(compact('lang', 'name', 'typeID', 'slug'));
            if ($lastID > 0) {
                return true;
            }
        } else {
            return ($this->update($ID, 'name', $name) && $this->update($ID, 'slug', $slug));
        }
        return false;
    }

    /**
     * @param $lang
     * @param $icon
     * @param $typeID
     * @return bool
     */
    public function setDescription($lang, $icon, $typeID)
    {
        $ID = $this->exist($typeID, $lang);
        if (!$ID) {
            $lastID = $this->create(compact('lang', 'icon', 'typeID'));
            if ($lastID > 0) {
                return true;
            }
        } else {
            $res = $this->update($ID, 'icon', $icon);
            return $res;
        }
        return false;
    }

    /**
     * @param $typeID
     * @param $lang
     * @return mixed
     */
    public function getOne($typeID, $lang)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `typeID` = :typeID AND `lang` = :lang ';
        $binds['typeID'] = $typeID;
        $binds['lang'] = $lang;

        $this->db->exec($query, $binds);

        return $this->db->getAll();
    }

    /**
     * @param $typeID
     * @param $lang
     * @return mixed
     */
    public function exist($typeID, $lang)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `lang` = :lang AND `typeID` = :typeID ';
        $binds['lang'] = $lang;
        $binds['typeID'] = $typeID;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

    /**
     * @param $typeUrl
     * @return mixed
     */
    public function getByUrl($typeUrl)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `slug` LIKE :typeUrl ';
        $binds['typeUrl'] = $typeUrl;

        $this->db->exec($query, $binds);

        return $this->db->getRow();
    }

}
