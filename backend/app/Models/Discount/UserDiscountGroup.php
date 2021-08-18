<?php
/**
 * Programmer Rafał Leśniak - 12.10.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 12-10-2017
 * Time: 14:26
 */

namespace DreamSoft\Models\Discount;

use DreamSoft\Core\Model;

class UserDiscountGroup extends Model
{
    /**
     * @var int
     */
    private $domainID;

    public function __construct()
    {
        parent::__construct();
        $this->setTableName('userDiscountGroups', true);
    }

    /**
     * @return int
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param int $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * @param $users
     * @return array|bool
     */
    public function countGroupsForUsers($users)
    {
        if( !$users ) {
            return false;
        }

        $query = ' SELECT `'.$this->getTableName().'`.`userID`, COUNT(`'.$this->getTableName().'`.`ID`) as count FROM `'.$this->getTableName().'` 
            LEFT JOIN `ps_discountGroups` ON `'.$this->getTableName().'`.discountGroupID = `ps_discountGroups`.ID 
            WHERE `'.$this->getTableName().'`.`userID` IN ('.  implode(',', $users).') AND `ps_discountGroups`.domainID = :domainID 
            GROUP BY `'.$this->getTableName().'`.`userID` ';

        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if( !$res ){
            return false;
        }

        $result = array();
        foreach($res as $r){
            $result[$r['userID']] = $r['count'];
        }
        return $result;
    }

    /**
     * @param $users
     * @return array|bool
     */
    public function getGroupsForUsers($users)
    {
        if( !$users ) {
            return false;
        }

        $query = ' SELECT `'.$this->getTableName().'`.`userID`, 
         `ps_discountGroupLangs`.lang, `ps_discountGroupLangs`.name, `ps_discountGroups`.ID 
         FROM `'.$this->getTableName().'` 
            LEFT JOIN `ps_discountGroups` ON `'.$this->getTableName().'`.discountGroupID = `ps_discountGroups`.ID 
            LEFT JOIN `ps_discountGroupLangs` ON `ps_discountGroupLangs`.groupID = `ps_discountGroups`.ID 
            WHERE `'.$this->getTableName().'`.`userID` IN ('.  implode(',', $users).') AND `ps_discountGroups`.domainID = :domainID 
             ';

        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        if( !$res ){
            return false;
        }

        $result = array();

        foreach($res as $r){
            $result[$r['userID']][$r['ID']][$r['lang']] = $r['name'];
        }

        return $result;
    }

    /**
     * @param array $list
     * @return bool|array
     */
    public function getByUserList(array $list)
    {
        if( empty($list) ) {
            return false;
        }

        $query = 'SELECT userID, GROUP_CONCAT(discountGroupID SEPARATOR ",") as groups FROM `' . $this->getTableName() . '` 
         WHERE `userID` IN ('. implode(',', $list) .') 
         GROUP BY userID ';

        if (!$this->db->exec($query)) {
            return false;
        }

        $res = $this->db->getAll();
        if( !$res ){
            return false;
        }

        $result = array();
        foreach($res as $r){
            if( strlen($r['groups']) > 0 ) {
                $result[$r['userID']] = explode(',',$r['groups']);
            }
        }
        return $result;
    }

    /**
     * @param $userID
     * @return bool|array
     */
    public function getByUser($userID)
    {
        $query = ' SELECT `'.$this->getTableName().'`.* FROM `'.$this->getTableName().'` 
            LEFT JOIN `ps_discountGroups` ON `'.$this->getTableName().'`.discountGroupID = `ps_discountGroups`.ID 
            WHERE `'.$this->getTableName().'`.`userID` = :userID AND `ps_discountGroups`.domainID = :domainID 
            GROUP BY `'.$this->getTableName().'`.`ID` ';

        $binds['userID'] = $userID;
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();

    }
}