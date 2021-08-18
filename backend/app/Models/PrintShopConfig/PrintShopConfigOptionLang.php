<?php

namespace DreamSoft\Models\PrintShopConfig;

/**
 * Description of PrintShopConfigOptionLang
 *
 */
use DreamSoft\Core\Model;

class PrintShopConfigOptionLang extends Model
{

    /**
     * PrintShopConfigOptionLang constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('config_optionLangs', true);
    }

    /**
     * @param $lang
     * @param $name
     * @param $optionID
     * @return bool
     */
    public function set($lang, $name, $optionID)
    {
        $ID = $this->exist($optionID, $lang);
        if (!$ID) {
            $lastID = $this->create(compact('lang', 'name', 'optionID'));
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
     * @param $optionID
     * @return mixed
     */
    /*public function get($optionID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `optionID` = :optionID ';
        $binds['optionID'] = $optionID;

        $this->db->exec($query, $binds);

        return $this->db->getAll();
    }*/

    /**
     * @param $optionID
     * @param $lang
     * @return mixed
     */
    public function exist($optionID, $lang)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `lang` = :lang AND `optionID` = :optionID ';
        $binds['lang'] = $lang;
        $binds['optionID'] = $optionID;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

}
