<?php

namespace DreamSoft\Models\Mail;
/**
 * Description of MailTypeLang
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class MailTypeLang extends Model
{
    /**
     * MailTypeLang constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $prefix = true;
        $this->setTableName('mail_typeLangs', $prefix);
    }

    /**
     * @param $mailTypeID
     * @param $lang
     * @return bool|mixed
     */
    public function exist($mailTypeID, $lang)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE `mailTypeID` = :mailTypeID AND `lang` = :lang ';

        $binds[':mailTypeID'] = $mailTypeID;
        $binds[':lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }
}
