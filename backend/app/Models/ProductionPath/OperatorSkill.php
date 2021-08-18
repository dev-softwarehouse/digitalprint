<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 11:35
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;

class OperatorSkill extends Model
{
    /**
     * OperatorSkill constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('operatorSkills', true);
    }

    /**
     * @param $operatorID
     * @param $skillID
     * @return bool|mixed
     */
    public function exist($operatorID, $skillID)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `operatorID` = :operatorID AND `skillID` = :skillID ';

        $binds[':operatorID'] = $operatorID;
        $binds[':skillID'] = $skillID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $operatorID
     * @return array|bool
     */
    public function getByOperatorID($operatorID)
    {
        $query = 'SELECT `skillID` FROM `' . $this->getTableName() . '` WHERE `operatorID` = :operatorID ';

        $binds[':operatorID'] = $operatorID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $skillID
     * @return array|bool
     */
    public function getBySkillID($skillID)
    {
        $query = 'SELECT `operatorID` FROM `' . $this->getTableName() . '` WHERE `skillID` = :skillID ';

        $binds[':skillID'] = $skillID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }
}