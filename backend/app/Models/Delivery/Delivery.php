<?php

namespace DreamSoft\Models\Delivery;
/**
 * Description of Delivery
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\LangFilter;
use PDO;

class Delivery extends Model
{

    /**
     * @var LangFilter
     */
    protected $LangFilter;

    private $senderTypes = array(
        array('name' => 'sender_printhouse', 'type' => SENDER_PRINTHOUSE),
        array('name' => 'sender_client', 'type' => SENDER_CLIENT)
    );

    protected $deliveryNames;
    protected $deliveries;
    private $domainID;

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
     * @return array
     */
    public function getSenderTypes()
    {
        return $this->senderTypes;
    }

    /**
     * Delivery constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'dp_config_';
        $this->setTableName('deliveries', true);
        $this->deliveryNames = $this->prefix . 'deliveryNames';
        $this->deliveries = $this->prefix . 'deliveries';
        $this->LangFilter = new LangFilter();
    }

    /**
     * @param $params
     * @return bool|string
     */
    public function createName($params)
    {
        $this->setTableName($this->deliveryNames, false);
        return $this->create($params);
    }

    /**
     * @param $params
     * @return bool|string
     */
    public function createObj($params)
    {
        $this->setTableName($this->deliveries, false);
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
        $this->setTableName($this->deliveryNames, false);
        return $this->update($ID, $key, $value);
    }

    /**
     * @param $deliveryID
     * @param $lang
     * @return mixed
     */
    public function existName($deliveryID, $lang)
    {
        $query = 'SELECT `ID` FROM ' . $this->deliveryNames . ' WHERE `deliveryID` = :deliveryID '
            . ' AND `lang` = :lang ';

        $binds['lang'] = $lang;
        $binds['deliveryID'] = $deliveryID;

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
                `' . $this->deliveryNames . '`.name as lName, 
                `' . $this->deliveryNames . '`.lang as lLang 
                FROM `' . $this->getTableName() . '`'
            . 'LEFT JOIN `' . $this->deliveryNames . '` ON `' . $this->deliveryNames . '`.deliveryID = `' . $this->getTableName() . '`.ID '
            . ' WHERE 1 = 1 ';

        if ($params && count($params) > 0 ) {
            foreach ($params as $key => $value) {
                $query .= ' AND `' . $this->getTableName() . '`.`' . $key . '` = :' . $key . ' ';
                $binds[$key] = $value;
            }
        }

        if (!isset($params['domainID'])) {
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
            $lLang = $lName = null;
            if (!empty($r['lLang'])) {
                $lLang = $r['lLang'];
                $lName = $r['lName'];
            }
            unset($r['lLang']);
            unset($r['lName']);
            $key = $r['ID'];
            if (!isset($result[$key])) {
                $result[$key] = array();
            }
            $result[$key] = array_merge($result[$key], $r);
            if (!empty($lLang)) {
                if (!isset($result[$key]['names'])) {
                    $result[$key]['names'] = array();
                }
                $result[$key]['names'][$lLang] = $lName;
            }
        }

        $data = array();
        foreach ($result as $r) {
            $data[] = $r;
        }

        return $data;
    }

    /**
     * @param array $list
     * @return bool|array
     */
    public function customGetByList(array $list)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT `' . $this->getTableName() . '`.*, 
               GROUP_CONCAT( DISTINCT CONCAT_WS("::", `' . $this->deliveryNames . '`.lang, `' . $this->deliveryNames . '`.name) SEPARATOR "||" ) as langs
                FROM `' . $this->getTableName() . '` 
        LEFT JOIN `' . $this->deliveryNames . '` ON `' . $this->deliveryNames . '`.deliveryID = `' . $this->getTableName() . '`.ID 
        WHERE `' . $this->getTableName() . '`.`ID` IN (' . implode(',', $list) . ') 
        GROUP BY  `' . $this->getTableName() . '`.ID ';

        if (!$this->db->exec($query)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }

        $res = $this->LangFilter->splitArray($res, 'langs');

        $result = array();
        foreach ($res as $key => $value) {
            $result[$value['ID']] = $value;
        }
        return $result;
    }
}
