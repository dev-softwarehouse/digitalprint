<?php

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Core\Model;

/**
 * Class PrintShopFormatLanguage
 * @package DreamSoft\Models\PrintShopProduct
 */
class PrintShopFormatLanguage extends Model
{

    /**
     * PrintShopFormatLanguage constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('products_formatLangs', true);
    }

    /**
     * @param $lang
     * @param $name
     * @param $formatID
     * @return bool
     */
    public function set($lang, $name, $formatID)
    {
        $ID = $this->exist($formatID, $lang);
        if (!$ID) {
            $lastID = $this->create(compact('lang', 'name', 'formatID'));
            if ($lastID > 0) {
                return true;
            }
        } else {
            $res = $this->update($ID, 'name', $name);
            return $res;
        }
        return false;
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` ';

        $this->db->exec($query);

        return $this->db->getAll();
    }

    /**
     * @param $formatID
     * @param $lang
     * @return bool
     */
    public function exist($formatID, $lang)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `lang` = :lang AND `formatID` = :formatID ';
        $binds['lang'] = $lang;
        $binds['formatID'] = $formatID;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

}
