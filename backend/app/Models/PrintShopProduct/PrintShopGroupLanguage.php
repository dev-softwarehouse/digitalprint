<?php

namespace DreamSoft\Models\PrintShopProduct;
/**
 * Class PrintShopGroupLang
 */
use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\UrlMaker;

class PrintShopGroupLanguage extends Model
{

    /**
     * @var UrlMaker
     */
    protected $UrlMaker;

    /**
     * PrintShopGroupLang constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('products_groupLangs', true);
        $this->UrlMaker = new UrlMaker();
    }

    /**
     * @param $lang
     * @param $name
     * @param $groupID
     * @param null $slug
     * @return bool
     */
    public function set($lang, $name, $groupID, $slug = NULL)
    {
        $ID = $this->exist($groupID, $lang);

        if( !$slug ) {
            $slug = $this->UrlMaker->permalink($name);
        }

        if (!$ID) {
            $lastID = $this->create(compact('lang', 'name', 'groupID', 'slug'));
            if ($lastID > 0) {
                return true;
            }
        } else {
            $res = ( $this->update($ID, 'name', $name) && $this->update($ID, 'slug', $slug) );
            return $res;
        }
        return false;
    }

    /**
     * @param $lang
     * @param $icon
     * @param $groupID
     * @return bool
     */
    public function setIcon($lang, $icon, $groupID)
    {
        $ID = $this->exist($groupID, $lang);
        if (!$ID) {
            $lastID = $this->create(compact('lang', 'icon', 'groupID'));
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
     * @param $groupID
     * @param $lang
     * @return mixed
     */
    public function exist($groupID, $lang)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `lang` = :lang AND `groupID` = :groupID ';
        $binds['lang'] = $lang;
        $binds['groupID'] = $groupID;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

    /**
     * @param $slug
     * @return mixed
     */
    public function getByUrl($slug)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `slug` LIKE :slug ';
        $binds['slug'] = $slug;

        $this->db->exec($query, $binds);

        $row = $this->db->getRow();

        return $row;
    }

}
