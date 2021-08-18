<?php
/**
 * Programmer Rafał Leśniak - 11.9.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 11-09-2017
 * Time: 14:42
 */

namespace DreamSoft\Models\Reclamation;

use DreamSoft\Core\Model;

class ReclamationMessage extends Model
{
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('reclamationMessages', true);
    }

    /**
     * @param $reclamations
     * @param $isAdmin
     * @return bool|array
     */
    public function countUnread($reclamations, $isAdmin)
    {
        if( empty($reclamations) || !is_array($reclamations) ){
            return false;
        }

        $query = 'SELECT COUNT(`' . $this->getTableName() . '`.`ID`) as count, reclamationID '
            . ' FROM `' . $this->getTableName() . '` 
             WHERE `read` = :read AND isAdmin = :isAdmin AND reclamationID IN ( '.implode(',', $reclamations).' )
              GROUP BY reclamationID ';

        $binds['read'] = 0;
        $binds['isAdmin'] = $isAdmin;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if( !$res ){
            return false;
        }
        $result = array();
        foreach ($res as $row){
            $result[$row['reclamationID']] = $row['count'];
        }
        return $result;
    }

    /**
     * @param $reclamationID
     * @param $isAdmin
     * @return bool
     */
    public function setRead($reclamationID, $isAdmin)
    {
        $query = 'UPDATE `' . $this->getTableName() . '` SET `read` = :read 
        WHERE `reclamationID` = :reclamationID AND `isAdmin` = :isAdmin ';

        $binds['read'] = 1;
        $binds['isAdmin'] = $isAdmin;
        $binds['reclamationID'] = $reclamationID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $isAdmin
     * @return bool
     */
    public function countAllUnread($isAdmin)
    {
        $query = 'SELECT COUNT( ID ) AS count
                FROM  `' . $this->getTableName() . '` 
                WHERE  `isAdmin` = :isAdmin
                AND `read` = 0 ';

        $binds['isAdmin'] = $isAdmin;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }
}