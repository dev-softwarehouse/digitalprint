<?php


namespace DreamSoft\Models\Currency;

use DreamSoft\Core\Model;
use Exception;

/**
 * Class Currency
 * @package DreamSoft\Models\Currency
 */
class Currency extends Model
{
    /**
     * @var int
     */
    protected $domainID;

    /**
     * Currency constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('currency', true);
    }


    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }


    /**
     * @return mixed
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param $code
     * @param int $active
     * @return string
     */
    public function customCreate($code, $active = 0)
    {
        $query = 'INSERT INTO `' . $this->getTableName() . '` (
                `code`,
                `domainID`,
                `active`
                ) VALUES (
                :code,
                :domainID,
                :active
                ) 
              ';
        $binds[':code'] = $code;
        $binds[':domainID'] = $this->getDomainID();
        $binds[':active'] = $active;

        if (!$this->db->exec($query, $binds)) {
            throw new Exception('nie dodano');
        }
        return $this->db->lastInsertID();
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `domainID` = :domainID ';

        $binds[':domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $ID
     * @return bool
     */
    public function getOne($ID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `ID` = :ID AND 
           `domainID` = :domainID ';

        $binds[':ID'] = $ID;
        $binds[':domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $key
     * @param $value
     * @return bool
     */
    public function exist($key, $value)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `' . $key . '` = :' . $key . ' AND 
           `domainID` = :domainID ';

        $binds[':' . $key] = $value;
        $binds[':domainID'] = $this->getDomainID();

        $this->db->exec($query, $binds);

        return ($this->db->rowCount() > 0);
    }


    /**
     * @param $code
     * @return bool
     */
    public function getByCode($code)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `code` = :code AND 
           `domainID` = :domainID ';

        $binds['code'] = $code;
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

}
