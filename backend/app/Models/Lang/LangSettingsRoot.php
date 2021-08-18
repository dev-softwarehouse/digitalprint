<?php
/**
 * Programmer Rafał Leśniak - 5.2.2018
 */

namespace DreamSoft\Models\Lang;

use DreamSoft\Core\Model;

/**
 * Description of LangList
 *
 * @author Właściciel
 */
class LangSettingsRoot extends Model
{

    public function __construct()
    {
        parent::__construct(true);
        $this->setTableName('langSettings', true);
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }
}
