<?php

namespace DreamSoft\Models\Module;
/**
 * Description of ModuleLang
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class ModuleKeyLang extends Model
{

    public function __construct()
    {
        parent::__construct(true);
        $this->prefix = 'dp_config_';
        $this->setTableName('moduleKeyLangs', true);
    }

    public function set($lang, $name, $moduleKeyID)
    {
        $ID = $this->exist($moduleKeyID, $lang);
        if (!$ID) {
            $lastID = $this->create(compact('lang', 'name', 'moduleKeyID'));
            if ($lastID > 0) {
                return true;
            }
        } else {
            $res = $this->update($ID, 'name', $name);
            return $res;
        }
        return false;
    }

    public function exist($moduleKeyID, $lang)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `lang` = :lang AND `moduleKeyID` = :moduleKeyID ';
        $binds['lang'] = $lang;
        $binds['moduleKeyID'] = $moduleKeyID;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

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
