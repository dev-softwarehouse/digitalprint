<?php
/**
 * Programmer Rafał Leśniak - 5.2.2018
 */

namespace DreamSoft\Models\Lang;

use DreamSoft\Core\Model;

/**
 * Class Lang
 * @package DreamSoft\Models\Lang
 */
class Lang extends Model
{

    /**
     * Lang constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('langs', true);
    }

    /**
     * @param null $lang
     * @return bool|array
     */
    public function getAll($lang = NULL)
    {


        $query = 'SELECT * FROM `dp_langs` ';

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
     * @param $value
     * @param $lang
     * @return bool
     */
    public function update($key, $value, $lang)
    {

        $query = 'UPDATE `dp_langs` SET 
                  `value` = :value 
                  WHERE `key` = :key AND `lang` = :lang ';

        $binds[':lang'] = $lang;
        $binds[':key'] = $key;
        $binds[':value'] = $value;

        if (!$this->db->exec($query, $binds)) {
            return false;
        } else
            return true;
    }

    /**
     * @param $key
     * @param $value
     * @param $lang
     * @return bool|string
     */
    public function set($key, $value, $lang)
    {
        $res = false;
        if ($this->exist($key, $lang)) {
            $res = $this->update($key, $value, $lang);
        } else {
            $params = array('key' => $key, 'value' => $value, 'lang' => $lang);
            $res = $this->create($params);
        }
        return $res;
    }

    /**
     * @param $key
     * @param $lang
     * @return bool
     */
    public function exist($key, $lang)
    {
        $query = 'SELECT ID FROM `dp_langs` WHERE `key` = :key AND `lang` = :lang ';

        $binds[':key'] = $key;
        $binds[':lang'] = $lang;

        $this->db->exec($query, $binds);

        return ($this->db->rowCount() > 0);
    }

    /**
     * @param $key
     * @param $lang
     * @return mixed
     */
    public function getOne($key, $lang)
    {
        $query = 'SELECT * FROM `dp_langs` WHERE `key` = :key AND `lang` = :lang ';

        $binds[':key'] = $key;
        $binds[':lang'] = $lang;

        $this->db->exec($query, $binds);

        return $this->db->getRow();
    }

    /**
     * @param $key
     * @return mixed
     */
    public function getByKey($key)
    {
        $query = 'SELECT * FROM `dp_langs` WHERE `key` = :key ';

        $binds[':key'] = $key;

        $this->db->exec($query, $binds);

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

    /**
     * @param $ID
     * @param $key
     * @param $value
     * @param $lang
     * @return bool
     */
    public function customUpdate($ID, $key, $value, $lang)
    {

        $query = 'UPDATE `dp_langs` SET 
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
}
