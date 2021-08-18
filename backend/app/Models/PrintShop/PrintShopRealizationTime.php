<?php

namespace DreamSoft\Models\PrintShop;

use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Description of PrintShopRealizationTime
 *
 * @author Rafał
 */
class PrintShopRealizationTime extends PrintShop
{

    protected $realizationTimeDetails;
    protected $domainID;
    protected $realizationTimeLanguages;

    /**
     * PrintShopRealizationTime constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_realizationTimes', $prefix);
        if ($prefix) {
            $this->realizationTimeDetails = $this->prefix . 'products_realizationTimeDetails';
            $this->realizationTimeLanguages = $this->prefix . 'products_realizationTimeLangs';
        }
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
     * @param $name
     * @param $days
     * @param $pricePercentage
     * @return bool|string
     */
    public function addRealizationTime($name, $days, $pricePercentage)
    {
        $params = compact('name', 'days', 'pricePercentage');
        return $this->create($params);
    }

    /**
     * @param $id
     * @param $name
     * @param $days
     * @param $pricePercentage
     * @return bool
     */
    public function editRealizationTime($id, $name, $days, $pricePercentage)
    {

        $updated = 0;

        if( $this->update($id, 'name', $name) ) {
            $updated++;
        }
        if( $this->update($id, 'days', $days) ) {
            $updated++;
        }
        if( $this->update($id, 'pricePercentage', $pricePercentage) ) {
            $updated++;
        }

        if ( $updated > 0 ) {
            return true;
        }

        return false;

    }

    /**
     * @param null $active
     * @return array|bool
     */
    public function getRealizationTimes($active = NULL)
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*, 
               `' . $this->realizationTimeLanguages . '`.`lang` as lLang,
               `' . $this->realizationTimeLanguages . '`.`name` as lName
              FROM `' . $this->getTableName() . '`
              LEFT JOIN `' . $this->realizationTimeLanguages . '` ON 
              `' . $this->realizationTimeLanguages . '`.`realizationTimeID` = `' . $this->getTableName() . '`.`ID` ';

        $binds = array();

        if ($active != NULL) {
            $query .= ' WHERE `active` = :active ';
            $binds['active'] = $active;
        }

        $query .= 'ORDER BY `' . $this->getTableName() . '`.`order` ';

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
     * @return bool
     */
    public function getDetailsForVolume()
    {

        if (intval($this->getGroupID()) == 0 || intval($this->getTypeID()) == 0 ||
            intval($this->getVolume()) == 0
        ) {
            return false;
        }

        $query = 'SELECT `ID` 
                        FROM `' . $this->realizationTimeDetails . '` 
                         WHERE ';

        $binds = array();

        $binds[':groupID'] = $this->getGroupID();
        $query .= ' `groupID` = :groupID ';

        $binds[':typeID'] = $this->getTypeID();
        $query .= ' AND `typeID` = :typeID ';

        $query .= ' AND `volume` = :volume ';
        $binds[':volume'] = $this->getVolume();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();

    }

    /**
     * @return array|bool
     */
    public function getDetailsPrev()
    {

        $query = 'SELECT `ID`, `realizationID`, `days`, `pricePercentage`, `active`, `groupID`, `typeID`, `volume` 
                        FROM `' . $this->realizationTimeDetails . '` 
                         WHERE ';

        $binds = array();
        if (intval($this->getGroupID()) > 0 && intval($this->getTypeID()) > 0) {
            $binds[':groupID'] = $this->getGroupID();
            $query .= ' `groupID` = :groupID ';
        } else {
            $query .= ' `groupID` IS NULL ';
        }

        if (intval($this->getGroupID()) > 0 && intval($this->getTypeID()) > 0 && intval($this->getVolume()) > 0) {
            $binds[':typeID'] = $this->getTypeID();
            $query .= ' AND (`typeID` = :typeID OR typeID IS NULL) ';
        } else {
            $query .= ' AND `typeID` IS NULL ';
        }

        if (intval($this->getVolume()) > 0) {
            $query .= ' AND (`volume` < :volume OR `volume` IS NULL ) ';
            $binds[':volume'] = intval($this->getVolume());
        } else {
            $query .= ' AND `volume` IS NULL ';
        }
        $query .= '  ORDER BY `volume` ASC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll(PDO::FETCH_ASSOC);

        $result = array();
        if ($res) {
            foreach ($res as $row) {
                if (!isset($result[$row['realizationID']]) || $this->checkRealizationTime($result[$row['realizationID']], $row)) {
                    $result[$row['realizationID']] = $row;
                }
            }
        }

        return $result;

    }

    /**
     * @param $data1
     * @param $data2
     * @return bool
     */
    private function checkRealizationTime($data1, $data2)
    {
        if (empty($data1)) {
            return false;
        }
        if (intval($data1['volume']) < intval($data2['volume'])) {
            return true;
        }
        if (intval($data1['typeID']) < intval($data2['typeID'])) {
            return true;
        }
        if (intval($data1['groupID']) < intval($data2['groupID'])) {
            return true;
        }
        return false;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function getWithDetails($ID)
    {

        $detailsResult = false;

        if ($this->getGroupID() != NULL) {

            $params = array(
                'groupID' => $this->getGroupID(),
                'typeID' => $this->getTypeID(),
                'volume' => $this->getVolume()
            );

            $detailsResult = $this->searchByParams($ID, $params);

        }

        $realizationTime = $this->get('ID', $ID);

        return $this->fillRealizationTimeDetails($realizationTime, $detailsResult);

    }

    /**
     * @param $ID
     * @param $params
     * @return bool|mixed
     */
    private function searchByParams($ID, $params)
    {
        $detailsResult = $this->getDetailsByParams($ID, $params);
        if( $detailsResult === false ) {
            $testParams = array_filter($params);
            $paramKeys = array_keys($testParams);
            $lastKey = end($paramKeys);
            if( $lastKey === 'groupID' ) {
                return false;
            }
            $params[$lastKey] = NULL;
            return $this->searchByParams($ID, $params);
        }

        return $detailsResult;
    }

    /**
     * @param $ID
     * @param $params
     * @return bool|mixed
     */
    private function getDetailsByParams($ID, $params)
    {
        $query = 'SELECT `ID`, `realizationID`, `days`, `pricePercentage`, `active`, `groupID`, `typeID`, `volume` 
                        FROM `' . $this->realizationTimeDetails . '`
                        WHERE 
                        `realizationID` = :ID AND `groupID` = :groupID ';

        if ($params['typeID'] != NULL) {
            $query .= ' AND typeID = :typeID';
        } else {
            $query .= ' AND typeID IS NULL';
        }
        if ($params['volume'] != NULL) {
            $query .= ' AND (volume < :volume OR volume = :volume ) ORDER BY `volume` DESC';
        } else {
            $query .= ' AND volume IS NULL';
        }

        $binds = array();
        $binds['ID'] = array($ID, 'int');
        $binds['groupID'] = array($params['groupID'], 'int');
        if ($params['typeID'] != NULL){
            $binds['typeID'] = $params['typeID'];
        }
        if ($params['volume'] != NULL) {
            $binds['volume'] = $params['volume'];
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getRow(PDO::FETCH_ASSOC);
    }

    /**
     * @param $realizationTime
     * @param $details
     * @return mixed
     */
    private function fillRealizationTimeDetails($realizationTime, $details)
    {
        if ($details != false) {

            if ($details['groupID'] == $this->getGroupID()
                && $details['typeID'] == $this->getTypeID()
                && $details['volume'] == $this->getVolume()
            )
                $realizationTime['detailsID'] = $details['ID'];


            $realizationTime['days'] = $details['days'];
            $realizationTime['pricePercentage'] = $details['pricePercentage'];

            $realizationTime['active'] = $details['active'];

        }

        return $realizationTime;
    }

    /**
     * @return array|bool
     */
    public function getRealizationTimeDetailsAll()
    {

        $query = 'SELECT * FROM `' . $this->realizationTimeDetails . '`
                WHERE 
                `groupID` = :groupID';

        if ($this->typeID != null)
            $query .= ' AND ( typeID = :typeID OR typeID IS NULL ) ';
        else
            $query .= ' AND typeID IS NULL';

        $query .= ' ORDER BY `volume` ASC ';

        $binds[':groupID'] = array($this->groupID, 'int');
        if ($this->typeID != null) $binds[':typeID'] = $this->typeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $result = array();
        $res = $this->db->getAll(PDO::FETCH_ASSOC);
        if (!$res) {
            return false;
        }

        foreach ($res as $row) {
            $result[$row['realizationID']][] = $row;
        }
        return $result;
    }

    /**
     * @param $realizationTimes
     * @return bool
     */
    public function sort($realizationTimes)
    {
        $result = true;
        foreach ($realizationTimes as $index => $ID) {
            if (empty($ID))
                continue;

            $query = 'UPDATE `' . $this->getTableName() . '` SET `order` = :index WHERE `ID` = :ID ';

            $binds[':ID'] = array($ID, 'int');
            $binds[':index'] = $index;
            if (!$this->db->exec($query, $binds)) {
                $result = false;
            }
        }
        return $result;
    }

}
