<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Core\Model;

class PrintShopConfigAttributeLang extends Model
{

    /**
     * PrintShopConfigAttributeLang constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('config_attributeLangs', true);
    }

    /**
     * @param $lang
     * @param $name
     * @param $attributeID
     * @return bool
     */
    public function set($lang, $name, $attributeID)
    {
        $ID = $this->exist($attributeID, $lang);
        if (!$ID) {
            $lastID = $this->create(compact('lang', 'name', 'attributeID'));
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
     * @param $attributeID
     * @param $lang
     * @return bool
     */
    public function exist($attributeID, $lang)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `lang` = :lang AND `attributeID` = :attributeID ';
        $binds['lang'] = $lang;
        $binds['attributeID'] = $attributeID;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

}
