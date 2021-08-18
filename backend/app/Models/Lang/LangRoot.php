<?php
/**
 * Programmer Rafał Leśniak - 5.2.2018
 */

namespace DreamSoft\Models\Lang;

use DreamSoft\Core\Model;
use Exception;

/**
 * Class LangRoot
 * @package DreamSoft\Models\Lang
 */
class LangRoot extends Model
{

    /**
     * LangRoot constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $this->setTableName('langs', true);
    }

    /**
     * @param null $lang
     * @return bool
     */
    public function getAll($lang = NULL)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '`  ';

        $binds = array();

        if ($lang) {
            $query .= ' WHERE `lang` = :lang ';
            $binds[':lang'] = $lang;
        }


        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $key
     * @param $lang
     * @return bool | array
     */
    public function getOne($key, $lang)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `key` = :key AND `lang` = :lang ';

        $binds[':key'] = $key;
        $binds[':lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $key
     * @param $value
     * @param $lang
     * @return bool|string
     */
    public function customCreate($key, $value, $lang)
    {

        $query = 'INSERT INTO `' . $this->getTableName() . '` (
                `key`,
                `value`,
                `lang`
                ) VALUES (
                :key,
                :value,
                :lang
                ) 
              ';
        $binds[':key'] = $key;
        $binds[':value'] = $value;
        $binds[':lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->lastInsertID();
    }


    /**
     * @param $ID
     * @param $key
     * @param $value
     * @param $lang
     * @return bool
     */
    public function customUpdate($ID, $key, $value, $lang)
    {

        $query = 'UPDATE `' . $this->getTableName() . '` SET 
                  `value` = :value,
                  `lang` = :lang,
                  `key` = :key
                  WHERE `ID` = :ID ';

        $binds[':lang'] = $lang;
        $binds[':key'] = $key;
        $binds[':value'] = $value;
        $binds[':ID'] = $ID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        } else
            return true;
    }

    /**
     * @param $key
     * @param $value
     * @param $lang
     * @return bool|mixed
     */
    public function set($key, $value, $lang)
    {
        $one = $this->getOne($key, $lang);
        if ($one !== false) {
            return $this->customUpdate($one['ID'], $key, $value, $lang);
        } else {
            return $this->customCreate($key, $value, $lang);
        }

    }

    /**
     * @param $langs
     * @return bool
     */
    public function searchEmpty($langs)
    {
        if (empty($langs)) {
            return false;
        }
        $query = 'SELECT rt.key as `key`, ';
        $fields = '';
        foreach ($langs as $l) {
            $fields .= $l . '.value as ' . $l . ',';
        }
        $query .= substr($fields, 0, strlen($fields) - 1);
        $query .= ' FROM `dp_langs` AS rt ';
        foreach ($langs as $l) {
            $query .= ' LEFT JOIN `dp_langs` AS ' . $l . ' ON ' . $l . '.key = rt.key
                        AND ' . $l . '.`lang` = "' . $l . '" ';
        }
        $where = array();
        foreach ($langs as $l) {
            $where[] = $l . '.value IS NULL  ';
        }
        $query .= ' WHERE ' . implode(' OR ', $where);
        $query .= 'GROUP BY rt.`key`';

        if (!$this->db->exec($query)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $lang string
     * @return array
     */
    public function exportAll($lang)
    {
        $this->db->exec('SELECT `key`, `value`
            FROM `dp_langs` where lang=\'pl\'');
        $pl = $this->db->getAll();
        $keyStm = $this->db->getPdo()->prepare('select `value` from dp_langs where `key`=:key and lang=:lang');
        $translations = [];
        foreach ($pl as $plRow) {
            $row = [$plRow['key'], null, $plRow['value']];
            $keyStm->execute([':key' => $plRow['key'], ':lang' => $lang]);
            if ($keyStm->rowCount() == 1) {
                $row[1] = $keyStm->fetchColumn(0);
            }
            $translations[] = $row;
        }
        return $translations;
    }
}




