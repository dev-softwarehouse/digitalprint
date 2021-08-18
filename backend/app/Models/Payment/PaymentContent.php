<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 10-03-2017
 * Time: 14:37
 */

namespace DreamSoft\Models\Payment;

use DreamSoft\Core\Model;

class PaymentContent extends Model
{
    private $domainID;


    /**
     * OrderStatus constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'dp_config_';
        $this->setTableName('paymentContents', true);
    }

    /**
     * @param int $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * @return int
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param $paymentID
     * @param $lang
     * @return bool|mixed
     */
    public function exist($paymentID, $lang)
    {
        $query = 'SELECT `ID` FROM ' . $this->getTableName() . ' WHERE `paymentID` = :paymentID AND `lang` = :lang ';

        $binds['lang'] = $lang;
        $binds['paymentID'] = $paymentID;

        $this->db->exec($query, $binds);
        return $this->db->getOne();
    }

    /**
     * @param $paymentID
     * @param $lang
     * @return bool|array
     */
    public function customGet($paymentID, $lang)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `paymentID` = :paymentID AND `lang` = :lang ';

        $binds['lang'] = $lang;
        $binds['paymentID'] = $paymentID;

        if( !$this->db->exec($query, $binds) ) {
            return false;
        }
        return $this->db->getRow();
    }

}
