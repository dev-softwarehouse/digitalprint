<?php


namespace DreamSoft\Models\Newsletter;


use DreamSoft\Core\Model;
use PDO;

class NewsletterRecipient extends Model
{
    private $domainID;

    public function __construct()
    {
        parent::__construct();
        $this->setTableName('newsletterRecipients', true);
    }

    /**
     * @return mixed
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param mixed $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * @param $email
     * @return bool|array
     */
    public function getByEmail($email)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `email` = :email AND `domainID` = :domainID ';
        $binds['email'] = $email;
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

}