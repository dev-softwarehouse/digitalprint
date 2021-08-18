<?php

namespace DreamSoft\Models\Module;

/**
 * Description of ModuleOption
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class ModuleOption extends Model
{

    /**
     * @var string
     */
    protected $moduleOptionLangs;

    /**
     * ModuleOption constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $this->prefix = 'dp_config_';
        $this->setTableName('moduleOptions', true);
        $this->moduleOptionLangs = $this->prefix . 'moduleOptionLangs';
    }

    /**
     * @param $moduleOptionID
     * @return array|bool
     */
    public function getAllLangs($moduleOptionID)
    {

        $query = 'SELECT moduleOption.ID, moduleOption.value,langs.name,langs.lang FROM `' . $this->getTableName() . '` as moduleOption '
            . 'LEFT JOIN `' . $this->moduleOptionLangs . '` as langs ON langs.moduleOptionID = `moduleOption`.ID '
            . ' WHERE `moduleOption`.`ID` = :moduleOptionID ';

        $binds['moduleOptionID'] = $moduleOptionID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $moduleKeyID
     * @return array|bool
     */
    public function getAllByKey($moduleKeyID)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` as moduleOption '
            . ' WHERE `moduleOption`.`moduleKeyID` = :moduleKeyID ';

        $binds['moduleKeyID'] = $moduleKeyID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $keyList
     * @return array|bool
     */
    public function getAllByKeyList($keyList)
    {
        if (empty($keyList)) {
            return false;
        }
        $query = 'SELECT * FROM `' . $this->getTableName() . '` as moduleOption '
            . ' WHERE `moduleOption`.`moduleKeyID` IN (' . implode(',', $keyList) . ') ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $list
     * @param int $prepared
     * @return array|bool
     */
    public function getByList($list, $prepared = 1)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT moduleOption.moduleKeyID as moduleKeyID,moduleOption.ID as moID, moduleOption.value as moValue, '
            . ' langs.name as langName,langs.lang as lang FROM `' . $this->getTableName() . '` as moduleOption '
            . ' LEFT JOIN `' . $this->moduleOptionLangs . '` as langs ON langs.moduleOptionID = `moduleOption`.ID '
            . ' WHERE `moduleOption`.`moduleKeyID` IN (' . implode(',', $list) . ') ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        if ($prepared == 0) {
            return $res;
        }
        if (!$res) return false;
        $result = array();
        foreach ($res as $r) {
            if (!isset($result[$r['moduleKeyID']][$r['moID']])) {
                $result[$r['moduleKeyID']][$r['moID']] = array('ID' => $r['moID'], 'value' => $r['moValue'],
                    'langs' => array($r['lang'] => array('name' => $r['langName'])));
            } else {
                $result[$r['moduleKeyID']][$r['moID']]['langs'][$r['lang']] = array('name' => $r['langName']);
            }
        }
        return $result;
    }

    /**
     * @param $list
     * @return bool
     */
    public function deleteList($list)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE `moduleKeyID` IN ( ' . implode(',', $list) . ' ) ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }
}
