<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\PrintShop\PrintShop;

class PrintShopConfigOptionDescription extends PrintShop
{

    public function __construct()
    {
        parent::__construct();
        $this->setTableName('config_option_description', true);
    }

    public function customExists($IDType, $domainID)
    {
        $query = 'SELECT `ID` FROM `ps_config_option_description` 
                    WHERE `optionDescriptionTypeID` = :optionDescriptionTypeID
                      AND  `attributeID` = :attributeID 
                      AND  `optionID` = :optionID
                      AND  `domainID` = :domainID';

        $binds[':optionDescriptionTypeID'] = $IDType;
        $binds[':attributeID'] = $this->attrID;
        $binds[':optionID'] = $this->optID;
        $binds[':domainID'] = $domainID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getOne();
    }

    public function customCreate($optionDescriptionTypeID, $value, $domainID)
    {
        $query = 'INSERT INTO `ps_config_option_description` 
            ( `attributeID`, `optionID`, `optionDescriptionTypeID`, `value`, `domainID`) VALUES
            ( :attributeID, :optionID, :optionDescriptionTypeID, :value, :domainID )';

        $binds[':attributeID'] = $this->attrID;
        $binds[':optionID'] = $this->optID;
        $binds[':optionDescriptionTypeID'] = $optionDescriptionTypeID;
        $binds[':value'] = $value;
        $binds[':domainID'] = $domainID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();
    }

    public function customUpdate($optionDescriptionTypeID, $value, $domainID)
    {
        $query = 'UPDATE `ps_config_option_description` 
            SET `value` = :value
            WHERE `attributeID` = :attributeID
            AND `optionID` = :optionID
            AND `optionDescriptionTypeID` = :optionDescriptionTypeID
            AND `domainID` = :domainID';

        $binds[':value'] = $value;
        $binds[':attributeID'] = $this->attrID;
        $binds[':optionID'] = $this->optID;
        $binds[':optionDescriptionTypeID'] = $optionDescriptionTypeID;
        $binds[':domainID'] = $domainID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    public function customGetAll($group, $domainID)
    {
        $query = 'SELECT `ID`, `name`, `editor` FROM `ps_config_option_description_type` WHERE `group` = :group';

        if (!$this->db->exec($query, [':group' => $group])) return false;

        $types = $this->db->getAll();
        $query = 'SELECT `optionDescriptionTypeID`, `value` FROM `ps_config_option_description` 
                    WHERE `attributeID` = :attributeID 
                    AND `optionID` = :optionID AND `domainID` = :domainID';
        if (!$this->db->exec($query, [':attributeID' => $this->attrID, ':optionID' => $this->optID, ':domainID' => $domainID])) return false;
        $values = $this->db->getAll();
        foreach ($values as $value) {
            foreach ($types as &$type) {
                if ($type['ID'] === $value['optionDescriptionTypeID']) {
                    $type['value'] = $value['value'];
                    break;
                }
            }
        }
        return $types;
    }


}
