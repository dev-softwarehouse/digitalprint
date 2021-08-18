<?php

namespace DreamSoft\Models\Module;

/**
 * Description of Module
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class Module extends Model
{

    private $moduleTypes;
    private $moduleKeys;
    private $moduleKeyLangs;
    private $moduleOptions;
    private $moduleOptionLangs;

    public function __construct()
    {
        parent::__construct(true);
        $this->prefix = 'dp_config_';
        $this->setTableName('modules', true);
        $this->moduleTypes = $this->prefix . 'moduleTypes';
        $this->moduleKeys = $this->prefix . 'moduleKeys';
        $this->moduleKeyLangs = $this->prefix . 'moduleKeyLangs';
        $this->moduleOptions = $this->prefix . 'moduleOptions';
        $this->moduleOptionLangs = $this->prefix . 'moduleOptionLangs';
    }

    public function getWithRelations($type = NULL)
    {

        $query = 'SELECT modules.ID, modules.name, modules.key, modules.typeID '
            . 'FROM `' . $this->getTableName() . '` as modules '
            . 'LEFT JOIN `' . $this->moduleTypes . '` as moduleTypes ON moduleTypes.ID = modules.typeID '
            . 'LEFT JOIN `' . $this->moduleKeys . '` as keys ON keys.moduleID = modules.ID '
            . 'LEFT JOIN `' . $this->moduleOptions . '` as options ON options.moduleKeyID = keys.ID'
            . 'LEFT JOIN `' . $this->moduleKeyLangs . '` as keyLangs ON keyLangs.moduleKeyID = keys.ID '
            . 'LEFT JOIN `' . $this->moduleOptionLangs . '` as optionLangs ON optionLangs.moduleOptionID = options.ID ';

        if ($type) {
            $query .= ' WHERE moduleTypes.`key` = :type GROUP BY modules.ID ';
            $binds['type'] = $type;
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $typeID
     * @return array|bool
     */
    public function customGetAll($typeID)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `typeID` = :typeID ';
        $binds['typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

}
