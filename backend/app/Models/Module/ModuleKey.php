<?php

namespace DreamSoft\Models\Module;

use DreamSoft\Core\Model;

class ModuleKey extends Model
{

    protected $moduleID;
    protected $moduleLangs;
    protected $moduleKeyLangs;

    /**
     * ModuleKey constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $this->prefix = 'dp_config_';
        $prefix = true;
        $this->setTableName('moduleKeys', $prefix);
        if ($prefix) {
            $this->moduleKeyLangs = $this->prefix . 'moduleKeyLangs';
        }
    }

    /**
     * @param $ID
     */
    public function setModuleID($ID)
    {
        $this->moduleID = $ID;
    }

    /**
     * @return mixed
     */
    public function getModuleID()
    {
        return $this->moduleID;
    }

    /**
     * @param $key
     * @return bool|mixed
     */
    public function customGet($key)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '`  '
            . 'WHERE `moduleID` = :moduleID AND `key` = :key ';

        $binds[':moduleID'] = $this->moduleID;
        $binds[':key'] = $key;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $moduleKeyID
     * @param $key
     * @return array|bool
     */
    public function getAllLangs($moduleKeyID, $key)
    {

        $query = 'SELECT module.ID, module.key,langs.name,langs.lang FROM `' . $this->getTableName() . '` as module '
            . 'LEFT JOIN `' . $this->moduleKeyLangs . '` as langs ON langs.moduleKeyID = module.ID '
            . ' WHERE `module`.`ID` = :moduleKeyID AND `key` = :key ';

        $binds[':moduleKeyID'] = $moduleKeyID;
        $binds[':key'] = $key;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $key
     * @param $value
     * @return bool|string
     */
    public function set($key, $value)
    {
        $item = $this->customGet($key);
        if ($item) {
            $resEdit = $this->update($item['ID'], $key, $value);
            return $resEdit;
        } else {
            return $this->customCreate($key, $value);
        }
    }

    /**
     * @param $key
     * @param string $type
     * @param null $func
     * @return bool|string
     */
    public function customCreate($key, $type = 'text', $func = NULL)
    {

        if (empty($this->moduleID)) return false;

        $query = 'INSERT INTO `' . $this->getTableName() . '` (
              `moduleID`,
              `key`,
              `type`,
              `func`
              ) VALUES (
              :moduleID,
              :key,
              :type,
              :func
              ) 
            ';

        $binds[':moduleID'] = $this->moduleID;
        $binds[':key'] = $key;
        $binds['type'] = $type;
        $binds['func'] = $func;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->lastInsertId();
    }

    public function getAllByModule($lang = NULL)
    {
        if (empty($this->moduleID)) return false;

        $query = 'SELECT langs.lang as lLang, module.key as cKey, langs.name as lName, module.ID as cID, module.type as cType, module.func FROM `' . $this->getTableName() . '` as module '
            . 'LEFT JOIN `' . $this->moduleKeyLangs . '` as langs ON langs.moduleKeyID = module.ID '
            . 'WHERE `moduleID` = :moduleID ';

        $binds[':moduleID'] = $this->moduleID;

        if ($lang) {
            $binds[':lang'] = $lang;
            $query .= ' AND langs.`lang` = :lang ';
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;
        $result = array();
        foreach ($res as $r) {
            $result[$r['cID']]['type'] = $r['cType'];
            $result[$r['cID']]['func'] = $r['func'];
            $result[$r['cID']]['key'] = $r['cKey'];
            $result[$r['cID']]['ID'] = $r['cID'];

            if (!isset($result[$r['cID']]['names'])) {
                $result[$r['cID']]['names'] = array();
            }
            if (!empty($r['lName'])) {
                $result[$r['cID']]['names'][$r['lLang']] = $r['lName'];
            }

        }
        sort($result);
        return $result;
    }

    public function getByList($list, $func = null)
    {
        $query = 'SELECT langs.lang as lang, `key`.`ID` as `keyID`,`key`.`key` as `moduleKey`,'
            . ' langs.name as langName, `key`.type as keyType, `key`.func as keyFunc,'
            . ' `key`.moduleID as moduleID FROM `' . $this->getTableName() . '` as `key` '
            . 'LEFT JOIN `' . $this->moduleKeyLangs . '` as langs ON langs.moduleKeyID = `key`.ID '
            . 'WHERE `moduleID` IN ( ' . implode(",", $list) . ' ) ';
        if ($func == null) {
            $query .= ' AND `key`.func IS NULL ';
        } else {
            $query .= ' AND `key`.func = :func ';
        }

        $binds = array();
        if (strlen($func)) {
            $binds[':func'] = $func;
        }
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;
        $result = array();
        foreach ($res as $r) {
            if (!isset($result[$r['moduleID']][$r['keyID']])) {
                $result[$r['moduleID']][$r['keyID']] = array(
                    'ID' => $r['keyID'],
                    'moduleID' => $r['moduleID'],
                    'key' => $r['moduleKey'],
                    'type' => $r['keyType'],
                    'func' => $r['keyFunc'],
                    'langs' => array(
                        $r['lang'] => array('name' => $r['langName'])
                    )
                );
            } else {
                $result[$r['moduleID']][$r['keyID']]['langs'][$r['lang']] = array('name' => $r['langName']);
            }
        }

        return $result;
    }

    /**
     * @param $moduleID
     * @param $keyID
     * @return bool|mixed
     * @deprecated since 07.02.2020
     * @TODO check and remove
     */
    public function getBy($moduleID, $keyID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '`  '
            . 'WHERE `moduleID` = :moduleID AND `ID` = :keyID ';

        $binds['moduleID'] = $moduleID;
        $binds['keyID'] = $keyID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }
}