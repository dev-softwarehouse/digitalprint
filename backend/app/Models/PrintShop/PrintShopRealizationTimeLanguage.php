<?php

namespace DreamSoft\Models\PrintShop;

use DreamSoft\Core\Model;

/**
 * Description of PrintShopRealizationTimeLanguage
 *
 */
class PrintShopRealizationTimeLanguage extends Model
{

    /**
     * PrintShopRealizationTimeLanguage constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('products_realizationTimeLangs', true);
    }

    /**
     * @param $lang
     * @param $name
     * @param $realizationTimeID
     * @return bool
     */
    public function set($lang, $name, $realizationTimeID)
    {
        $ID = $this->exist($realizationTimeID, $lang);
        if (!$ID) {
            $lastID = $this->create(compact('lang', 'name', 'realizationTimeID'));
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
     * @return mixed
     */
    public function getAll()
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` ';

        $this->db->exec($query);

        return $this->db->getAll();
    }

    /**
     * @param $realizationTimeID
     * @param $lang
     * @return mixed
     */
    public function exist($realizationTimeID, $lang)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `lang` = :lang AND `realizationTimeID` = :realizationTimeID ';
        $binds['lang'] = $lang;
        $binds['realizationTimeID'] = $realizationTimeID;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

    public function getById($realizationTimeID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `realizationTimeID` = :realizationTimeID ';

        $binds['realizationTimeID'] = $realizationTimeID;

        $this->db->exec($query, $binds);

        $res = $this->db->getAll();

        if( !$res ) {
            return false;
        }

        $result = array();

        foreach($res as $row) {
            $result[$realizationTimeID][$row[lang]] = $row[''];
        }

        return $result;
    }

}
