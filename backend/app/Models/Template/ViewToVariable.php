<?php

namespace DreamSoft\Models\Template;

/**
 * Description of ViewToVariable
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;
use Exception;

class ViewToVariable extends Model
{

    /**
     * ViewToVariable constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('viewToVariables', true);
    }

    /**
     * @param $viewID
     * @return array|bool
     */
    public function getSelectedVariables($viewID)
    {
        $query = 'SELECT `variableID` FROM `' . $this->getTableName() . '` 
            WHERE `viewID` = :viewID ';

        $binds['viewID'] = $viewID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return array();

        foreach ($res as $row) {
            $result[] = $row['variableID'];
        }
        return $result;
    }


    /**
     * @param $viewID
     * @param $variableID
     * @return bool
     */
    public function exist($viewID, $variableID)
    {
        $query = 'SELECT COUNT(*) FROM `' . $this->getTableName() . '` 
            WHERE `viewID` = :viewID AND `variableID` = :variableID ';

        $binds['viewID'] = $viewID;
        $binds['variableID'] = $variableID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $count = $this->db->getOne();
        if ($count > 0) {
            return true;
        }
        return false;
    }

    /**
     * @param $viewID
     * @param $variableID
     * @return bool|string
     * @throws Exception
     */
    public function create($viewID, $variableID)
    {
        $query = "INSERT INTO `" . $this->getTableName() . "` 
            (
            `viewID`,
            `variableID` 
            ) VALUES (
            :viewID,
            :variableID
            )";

        $binds['viewID'] = $viewID;
        $binds['variableID'] = $variableID;

        if (!$this->db->exec($query, $binds)) {
            throw new Exception('nie dodano');
        }
        return $this->db->lastInsertID();
    }


    /**
     * @param $viewID
     * @param $variableID
     * @return bool
     * @throws Exception
     */
    public function delete($viewID, $variableID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `viewID` = :viewID AND `variableID` = :variableID ';

        $binds['viewID'] = $viewID;
        $binds['variableID'] = $variableID;

        if (!$this->db->exec($query, $binds)) {
            throw new Exception('nie usunięto');
        }
        return true;
    }


    /**
     * @param $viewID
     * @return bool
     * @throws Exception
     */
    public function deleteByView($viewID)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` 
            WHERE `$viewID` = :$viewID ';

        $binds['$viewID'] = $viewID;

        if (!$this->db->exec($query, $binds)) {
            throw new Exception('nie usunięto');
        }
        return true;
    }
}