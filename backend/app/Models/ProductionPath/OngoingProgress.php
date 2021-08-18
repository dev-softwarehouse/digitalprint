<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 02-08-2018
 * Time: 12:25
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;

/**
 * Class OngoingProgress
 * @package DreamSoft\Models\ProductionPath
 */
class OngoingProgress extends Model
{
    /**
     * OngoingProgress constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('ongoingProgress', $prefix);
    }

    /**
     * @param $ongoings
     * @return array|bool
     */
    public function getByOngoingList( $ongoings )
    {
        if( empty($ongoings) ) {
            return array();
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `ongoingID` IN ( ' . implode(',', $ongoings) . ' ) ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        foreach ($res as $row) {
            $result[$row['ongoingID']][] = $row;
        }
        return $result;
    }

}