<?php

namespace DreamSoft\Models\AdminHelp;

/**
 * Description of HelpKey
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class HelpKey extends Model
{

    /**
     * HelpKey constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $this->setTableName('helpKeys', true);
    }

    /**
     * @param $moduleID
     * @param $key
     * @return bool|mixed
     */
    public function exist($moduleID, $key)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE `key` = :key AND `moduleID` = :moduleID ';
        $binds['key'] = $key;
        $binds['moduleID'] = $moduleID;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

    /**
     * @param $moduleID
     * @return array|bool
     */
    public function getByModule($moduleID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE moduleID = :moduleID ';

        $binds[':moduleID'] = $moduleID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        return $res;
    }
}
