<?php

namespace DreamSoft\Models\Mail;

/**
 * Description of MailTitle
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class MailTitle extends Model
{

    /**
     * @var int
     */
    private $domainID;

    /**
     * MailTitle constructor.
     */
    public function __construct()
    {
        parent::__construct(false);
        $prefix = true;
        $this->setTableName('mail_titles', $prefix);
    }

    /**
     * @param $companyID
     */
    public function setRemote($companyID)
    {
        parent::__construct(false, $companyID);
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * @param $mailTypeID
     * @param $lang
     * @return bool|mixed
     */
    public function exist($mailTypeID, $lang)
    {
        $query = ' SELECT `ID` FROM `' . $this->getTableName() . '` WHERE `mailTypeID` = :mailTypeID AND '
            . ' `lang` = :lang AND `domainID` = :domainID ';
        $binds[':lang'] = $lang;
        $binds[':mailTypeID'] = $mailTypeID;
        $binds[':domainID'] = $this->domainID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $mailTypeID
     * @return array|bool
     */
    public function getByType($mailTypeID)
    {
        $query = ' SELECT * FROM `' . $this->getTableName() . '` WHERE `mailTypeID` = :mailTypeID AND '
            . ' `domainID` = :domainID ';

        $binds[':mailTypeID'] = $mailTypeID;
        $binds[':domainID'] = $this->domainID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }
        $result = array();
        foreach ($res as $row) {
            $result[$row['lang']] = $row['title'];
        }
        return $result;
    }

    /**
     * @param $mailTypeID
     * @param $lang
     * @return bool|mixed
     */
    public function getOne($mailTypeID, $lang)
    {
        $query = ' SELECT * FROM `' . $this->getTableName() . '` WHERE `mailTypeID` = :mailTypeID AND '
            . ' `lang` = :lang AND `domainID` = :domainID ';
        $binds[':lang'] = $lang;
        $binds[':mailTypeID'] = $mailTypeID;
        $binds[':domainID'] = $this->domainID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

}
