<?php
/**
 * Programista Rafał Leśniak - 19.6.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 19-06-2017
 * Time: 12:45
 */

namespace DreamSoft\Models\Content;


use DreamSoft\Core\Model;

class StaticContentLang extends Model
{
    /**
     * StaticContentLang constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('static_contentLangs', true);
    }

    public function exist($contentID, $lang)
    {
        $query = ' SELECT `ID` FROM `' . $this->getTableName() . '` 
        WHERE `staticContentID` = :contentID AND `lang` = :lang ';
        $binds['lang'] = $lang;
        $binds['contentID'] = $contentID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }
}