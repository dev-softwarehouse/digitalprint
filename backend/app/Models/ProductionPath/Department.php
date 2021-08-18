<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 10-07-2018
 * Time: 12:02
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;

/**
 * Class Department
 * @package DreamSoft\Models\ProductionPath
 */
class Department extends Model
{
    /**
     * Department constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('departments', true);
    }

    /**
     * @return bool|mixed
     */
    public function getMaxSort()
    {
        $query = ' SELECT MAX(departments.`sort`) FROM `' . $this->getTableName() . '` as departments LIMIT 1';
        if (!$this->db->exec($query)) {
            return false;
        }
        return $this->db->getOne();
    }

    /**
     * @param $departments
     * @return bool|array
     */
    public function sort($departments)
    {
        $result = true;
        foreach ($departments as $index => $ID) {
            if (empty($ID)) {
                continue;
            }

            $query = 'UPDATE `' . $this->getTableName() . '` SET `sort` = :index WHERE `ID` = :ID ';

            $binds['ID'] = array($ID, 'int');
            $binds['index'] = $index+1;
            if (!$this->db->exec($query, $binds)) {
                $result = false;
            }
        }
        return $result;
    }
}