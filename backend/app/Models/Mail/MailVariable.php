<?php

namespace DreamSoft\Models\Mail;
/**
 * Description of MailVariable
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class MailVariable extends Model
{
    /**
     * MailVariable constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $prefix = true;
        $this->setTableName('mail_variables', $prefix);
    }

    /**
     * @param $mailTypeID
     * @return array|bool
     */
    public function getList($mailTypeID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `mailTypeID` = :mailTypeID ';
        $binds['mailTypeID'] = $mailTypeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        return $res;
    }

}
