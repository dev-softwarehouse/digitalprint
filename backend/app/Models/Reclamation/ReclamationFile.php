<?php
/**
 * Programmer Rafał Leśniak - 1.9.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 01-09-2017
 * Time: 16:27
 */

namespace DreamSoft\Models\Reclamation;

use DreamSoft\Core\Model;

/**
 * Class ReclamationFile
 * @package DreamSoft\Models\Reclamation
 */
class ReclamationFile extends Model
{
    /**
     * Reclamation constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('reclamationFiles', true);
    }

    /**
     * @param $reclamations
     * @return array|bool
     */
    public function getByReclamationList( $reclamations )
    {
        if (empty($reclamations)) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `reclamationID` IN ( ' . implode(',', $reclamations) . ' ) ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        foreach ($res as $row) {
            $result[$row['reclamationID']][] = $row;
        }
        return $result;
    }
}