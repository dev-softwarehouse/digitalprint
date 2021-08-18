<?php

namespace DreamSoft\Models\Payment;

use DreamSoft\Core\Model;
use PDO;

/**
 * Class Payment
 * @package DreamSoft\Models\Payment
 */
class Payment extends Model
{

    /**
     * @var string
     */
    protected $paymentNames;
    /**
     * @var string
     */
    protected $paymentContents;
    /**
     * @var int
     */
    protected $domainID;

    /**
     * @param $domainID
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
     * Payment constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'dp_config_';
        $this->setTableName('payments', true);
        $this->paymentNames = $this->prefix . 'paymentNames';
        $this->paymentContents = $this->prefix . 'paymentContents';
    }

    /**
     * @param $params
     * @return bool|string
     */
    public function createName($params)
    {
        $this->setTableName($this->paymentNames, false);
        return $this->create($params);
    }

    /**
     * @param $ID
     * @param $key
     * @param $value
     * @return bool
     */
    public function updateName($ID, $key, $value)
    {
        $this->setTableName($this->paymentNames, false);
        return $this->update($ID, $key, $value);
    }

    /**
     * @param $paymentID
     * @param $lang
     * @return mixed
     */
    public function existName($paymentID, $lang)
    {
        $query = 'SELECT `ID` FROM ' . $this->paymentNames . ' WHERE `paymentID` = :paymentID '
            . ' AND `lang` = :lang ';

        $binds['lang'] = $lang;
        $binds['paymentID'] = $paymentID;

        $this->db->exec($query, $binds);
        return $this->db->getOne();
    }

    /**
     * @param null $params
     * @return array|bool
     */
    public function getAll($params = null)
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*, 
                `' . $this->paymentNames . '`.name as lName, 
                `' . $this->paymentNames . '`.lang as lLang, 
                `' . $this->paymentContents . '`.content as oneContent,
                `' . $this->paymentContents . '`.lang as cLang,
                `' . $this->paymentContents . '`.html as cHtml
                FROM `' . $this->getTableName() . '` '
            . 'LEFT JOIN `' . $this->paymentNames . '` ON `' . $this->paymentNames . '`.paymentID = `' . $this->getTableName() . '`.ID '
            . 'LEFT JOIN `' . $this->paymentContents . '` ON `' . $this->paymentContents . '`.paymentID = `' . $this->getTableName() . '`.ID '
            . ' WHERE 1 = 1 ';

        if ( $params && is_array($params) ) {
            foreach ($params as $key => $value) {
                $query .= ' AND `' . $this->getTableName() . '`.`' . $key . '` = :' . $key . ' ';
                $binds[$key] = $value;
            }
        }

        if (empty($params) || !array_key_exists('domainID', $params) ) {
            $binds['domainID'] = $this->getDomainID();
            $query .= ' AND `' . $this->getTableName() . '`.`domainID` = :domainID ';
        }

        $query .= ' ORDER BY `' . $this->getTableName() . '`.`ID` ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        $result = array();
        foreach ($res as $r) {
            $lLang = $lName = $oneContent = $cLang = $cHtml = null;
            if (!empty($r['lLang'])) {
                $cLang = $r['cLang'];
                $cHtml = $r['cHtml'];
                $lLang = $r['lLang'];
                $lName = $r['lName'];
                $oneContent = $r['oneContent'];
            }
            unset($r['cLang']);
            unset($r['cHtml']);
            unset($r['lLang']);
            unset($r['lName']);
            unset($r['oneContent']);
            $key = $r['ID'];
            if (!isset($result[$key])) {
                $result[$key] = array();
            }
            $result[$key] = array_merge($result[$key], $r);
            if (!empty($lLang)) {
                if (!isset($result[$key]['names'])) {
                    $result[$key]['names'] = array();
                }
                if (!isset($result[$key]['contents'])) {
                    $result[$key]['contents'] = array();
                }
                $result[$key]['names'][$lLang] = $lName;
                $result[$key]['contents'][$cLang] = $oneContent;
                $result[$key]['html'][$cLang] = $cHtml;
            }
        }

        $data = array();
        foreach ($result as $r) {
            $data[] = $r;
        }

        return $data;
    }

    /**
     * @param $list
     * @return array|bool
     */
    public function getByList($list)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT `' . $this->getTableName() . '`.*, 
                `' . $this->paymentNames . '`.name as oneName, 
                `' . $this->paymentNames . '`.lang as nLang, 
                `' . $this->paymentContents . '`.content as oneContent,
                `' . $this->paymentContents . '`.lang as cLang
                FROM `' . $this->getTableName() . '` '
            . 'LEFT JOIN `' . $this->paymentNames . '` ON `' . $this->paymentNames . '`.paymentID = `' . $this->getTableName() . '`.ID '
            . 'LEFT JOIN `' . $this->paymentContents . '` ON `' . $this->paymentContents . '`.paymentID = `' . $this->getTableName() . '`.ID '
            . ' WHERE `' . $this->getTableName() . '`.ID IN (' . implode(',', $list) . ') ';

        if (!$this->db->exec($query)) {
            return false;
        }

        $res = $this->db->getAll(PDO::FETCH_ASSOC);

        $result = array();

        if (!$res) {
            return false;
        }

        foreach ($res as $r) {
            $result[$r['ID']]['names'][$r['nLang']] = $r['oneName'];
            $result[$r['ID']]['descriptions'][$r['cLang']] = $r['oneContent'];
        }

        return $result;
    }

    /**
     * @param $componentID
     * @return bool
     */
    public function getOne($componentID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE domainID = :domainID AND `componentID` = :componentID ';

        $binds['domainID'] = $this->getDomainID();
        $binds['componentID'] = $componentID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

}
