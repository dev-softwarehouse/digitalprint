<?php
/**
 * Programmer Rafał Leśniak - 15.1.2018
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 15-01-2018
 * Time: 10:35
 */

namespace DreamSoft\Models\MainMetaTag;

use DreamSoft\Core\Model;

class MainMetaTagLanguage extends Model
{
    /**
     * MainMetaTagLanguage constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('mainMetaTagLanguages', true);
    }

    /**
     * @param $mainMetaTagID
     * @param $lang
     * @return mixed
     */
    public function exist($mainMetaTagID, $lang)
    {
        $query = ' SELECT `ID` FROM `'.$this->getTableName().'` 
        WHERE `lang` = :lang AND `mainMetaTagID` = :mainMetaTagID ';

        $binds['lang'] = $lang;
        $binds['mainMetaTagID'] = $mainMetaTagID;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

    /**
     * @param $list
     * @return array|bool
     */
    public function getByList($list)
    {
        if( !$list ) {
            return false;
        }

        $query = ' SELECT * FROM `'.$this->getTableName().'` WHERE `mainMetaTagID` IN ('.implode(',', $list).') ';

        $binds = array();

        $this->db->exec($query, $binds);

        $res = $this->db->getAll();

        if( !$res ) {
            return false;
        }

        $result = array();

        foreach ($res as $row) {
            $result[$row['mainMetaTagID']][$row['lang']] = array(
                'title' => $row['title'],
                'description' => $row['description'],
                'keywords' => $row['keywords']
            );
        }

        return $result;

    }

    /**
     * @param $mainMetaTagID
     * @param $lang
     * @return mixed
     */
    public function getOne($mainMetaTagID, $lang)
    {
        $query = ' SELECT * FROM `'.$this->getTableName().'` 
        WHERE `lang` = :lang AND `mainMetaTagID` = :mainMetaTagID ';

        $binds['lang'] = $lang;
        $binds['mainMetaTagID'] = $mainMetaTagID;

        $this->db->exec($query, $binds);

        return $this->db->getRow();
    }
}