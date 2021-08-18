<?php

namespace DreamSoft\Models\AdminHelp;

use DreamSoft\Core\Model;
use PDO;

class HelpLang extends Model
{

    /**
     * HelpLang constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $this->setTableName('helpLangs', true);
    }

    /**
     * @param $keyID
     * @param null $langArr
     * @return array|bool
     */
    public function getByHelpID($keyID, $langArr = NULL)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '`'
            . ' WHERE `keyID` = :keyID ';
        $binds['keyID'] = array($keyID, PDO::PARAM_INT);

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        $result = array();
        foreach ($res as $r) {
            if ($langArr && !in_array($r['lang'], $langArr)) {
                continue;
            }
            $result[$r['lang']] = array('description' => $r['description'],
                'title' => $r['title']);
        }
        return $result;
    }

    /**
     * @param null $langArr
     * @return array|bool
     */
    public function getAll($langArr = NULL)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` ';
        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        $result = array();
        foreach ($res as $r) {
            if ($langArr && !in_array($r['lang'], $langArr)) {
                continue;
            }
            $result[$r['keyID']][$r['lang']] = array('description' => $r['description'],
                'title' => $r['title']);
        }
        return $result;
    }

    /**
     * @param $lang
     * @param $keyID
     * @return bool|mixed
     */
    public function exist($lang, $keyID)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` '
            . ' WHERE lang = :lang AND keyID = :keyID ';

        $binds['lang'] = $lang;
        $binds['keyID'] = $keyID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $keyID
     * @param $lang
     * @return bool
     */
    public function deleteBy($keyID, $lang)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE lang = :lang AND keyID = :keyID ';

        $binds['keyID'] = $keyID;
        $binds['lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }
}