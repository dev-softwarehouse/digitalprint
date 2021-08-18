<?php

namespace DreamSoft\Models\Content;

/**
 * Description of CategoryContentLang
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class MainContentLang extends Model {

     public function __construct() {
	parent::__construct();
        $this->setTableName('mainContentLangs', true);
    }

    /**
     * @param $mainContentID
     * @param $lang
     * @param $title
     * @param $content
     * @return bool
     */
    public function set($mainContentID, $lang, $title, $content)
    {
        $response = false;
        $updated = 0;
        $actID = $this->exist($mainContentID, $lang);

        if (intval($actID) > 0) {
            // Aktualizacja
            if ($this->update($actID, 'title', $title)) {
                $updated++;
            }
            if ($this->update($actID, 'content', $content)) {
                $updated++;
            }

            if ($updated == 2) {
                $response = true;
            }
        } else {
            $params['title'] = $title;
            $params['content'] = $content;
            $params['lang'] = $lang;
            $params['mainContentID'] = $mainContentID;

            $actID = $this->create($params);
            if (intval($actID) > 0) {
                $response = true;
            }
        }
        return $response;
    }

    public function exist($mainContentID, $lang){
        $query = 'SELECT `ID` FROM `'.$this->getTableName().'` WHERE mainContentID = :mainContentID AND '
                . ' lang = :lang ';

        $binds['mainContentID'] = $mainContentID;
        $binds['lang'] = $lang;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }
}
