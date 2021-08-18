<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 13-12-2018
 * Time: 16:20
 */

namespace DreamSoft\Models\Setting;


use DreamSoft\Core\Model;

class Setting extends Model
{
    protected $module;
    protected $lang = NULL;
    protected $domainID = NULL;

    public function __construct($lang = NULL)
    {
        parent::__construct();
        $this->setTableName('settings', true);
        $this->setLang($lang);
    }

    public function setRemote($companyID)
    {
        parent::__construct(false, $companyID);
    }

    /**
     * Set active module
     * @param string $module
     */
    public function setModule($module)
    {
        $this->module = $module;
    }

    /**
     * Get active module
     * @return string
     */
    public function getModule()
    {
        return $this->module;
    }

    /**
     * Set active language
     * @param string $lang
     */
    public function setLang($lang)
    {
        $this->lang = $lang;
    }

    /**
     * Get active language
     * @return string
     */
    public function getLang()
    {
        return $this->lang;
    }

    /**
     * Set ID of active domain
     * @param int $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * Get ID of active domain
     * @return int
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * get on row form setting
     * @param string $key
     * @return boolean|array
     */
    public function getValue($key)
    {
        if (empty($this->module)) return false;

        $query = 'SELECT `value` FROM `' . $this->getTableName() . '` WHERE `module` = :module AND `key` = :key ';

        $binds[':module'] = $this->module;
        $binds[':key'] = $key;
        if ($this->getDomainID()) {
            $query .= ' AND ( `domainID` = :domainID OR `domainID` IS NULL ) ';
            $binds[':domainID'] = $this->getDomainID();
        } else {
            $query .= ' AND `domainID` IS NULL ';
        }

        if ($this->lang) {
            $binds[':lang'] = $this->lang;
            $query .= ' AND `lang` = :lang ';
        } else {
            $query .= ' AND `lang` IS NULL ';
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * Update or add row
     * @param string $key
     * @param string $value
     * @return boolean|int
     */
    public function set($key, $value)
    {
        if ($this->getValue($key) !== false) {
            $resEdit = $this->edit($key, $value);
            return $resEdit;
        } else {
            return $this->add($key, $value);
        }

    }

    /**
     * add row
     * @param string $key
     * @param string $value
     * @return int
     */
    public function add($key, $value)
    {

        if (empty($this->module)) {
            return false;
        }

        $query = 'INSERT INTO `' . $this->getTableName() . '` (
              `module`,
              `key`,
              `value`,
              `lang`,
              `domainID`
              ) VALUES (
              :module,
              :key,
              :value,
              :lang,
              :domainID
              )';

        $binds[':module'] = $this->module;
        if ($this->lang) {
            $binds[':lang'] = $this->lang;
        } else {
            $binds[':lang'] = NULL;
        }
        $binds[':key'] = $key;
        $binds[':value'] = $value;
        $binds[':domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertId();
    }

    /**
     * Update row
     * @param string $key
     * @param string $value
     * @return boolean
     */
    public function edit($key, $value)
    {
        if (empty($this->module)) {
            return false;
        }

        $query = 'UPDATE `' . $this->getTableName() . '` SET 
                  `value` = :value 
                  WHERE `module` = :module AND `key` = :key ';

        $binds[':module'] = $this->module;
        if ($this->lang) {
            $binds[':lang'] = $this->lang;
            $query .= ' AND `lang` = :lang ';
        } else {
            $query .= ' AND `lang` IS NULL ';
        }
        $binds[':key'] = $key;

        $binds[':value'] = $value;
        $domainID = $this->getDomainID();
        if ($domainID) {
            $binds['domainID'] = $domainID;
            $query .= ' AND `domainID` = :domainID ';
        } else {
            $query .= ' AND `domainID` IS NULL ';
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Delete row
     * @param string $key
     * @return boolean
     */
    public function customDelete($key)
    {
        if (empty($this->module)) {
            return false;
        }

        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE `module` = :module AND `key` = :key AND
             `domainID` = :domainID';

        $binds[':module'] = $this->module;
        $binds[':key'] = $key;
        $binds[':domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param array $filterKeys
     * @return array|bool
     */
    public function getAllByModule($filterKeys = array())
    {
        $module = $this->getModule();

        if ( !$module ) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `module` = :module AND 
            ( `domainID` = :domainID OR `domainID` IS NULL ) ';

        $binds['module'] = $module;

        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        if (!$res) {
            return false;
        }

        $result = array();
        foreach ($res as $key =>  $r) {
            if( in_array($r['key'], $filterKeys) ) {
                continue;
            }
            if (strlen($r['lang']) > 0) {
                $result[$r['key']][$r['lang']] = $r['value'];
            } else {
                $result[$r['key']]['value'] = $r['value'];
            }
        }

        return $result;
    }

    /**
     * Get all rows from specified module and return key => value array
     * @return array|bool
     */
    public function getSettingsByModule()
    {
        if (empty($this->module)) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE '
            . ' `module` = :module AND `domainID` = :domainID ';

        $binds['module'] = $this->module;
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }

        $result = array();
        foreach ($res as $r) {
            if (strlen($r['lang']) > 0) {
                if ($r['lang'] == lang) {
                    $result[$r['key']] = $r['value'];
                }
            } else {
                $result[$r['key']] = $r['value'];
            }
        }
        return $result;
    }
}