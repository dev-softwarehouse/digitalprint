<?php

namespace DreamSoft\Models\Template;
/**
 * Description of ProductCategory
 *
 * @author Rafał
 */
use DreamSoft\Core\Model;

class TemplateSetting extends Model
{

    private $domainID;

    public function __construct()
    {

        parent::__construct();
        $this->setTableName('template_settings', true);
    }

    public function setRemote( $companyID ) {
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
     * @return mixed
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param int $root
     * @return array|bool
     */
    public function getAll( $root = 1 )
    {

        $query = ' SELECT t.* FROM  `dp_template_settings` as t 
        WHERE t.`domainID` = :domainID AND t.`root` = :root ';

        $binds['domainID'] = $this->getDomainID();
        $binds['root'] = $root;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        return $this->aggregateByRoot($res);
    }

    public function getByDomain() {
        $query = ' SELECT t.* FROM  `' . $this->getTableName() . '` as t 
        WHERE t.`domainID` = :domainID ';

        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param array $list
     * @return array|bool
     */
    private function aggregateByRoot(array $list)
    {

        if (empty($list)) {
            return false;
        }

        $result = array();
        foreach ($list as $row) {
            $result[$row['templateID']] = $row;
        }

        return $result;
    }

    /**
     * @param int $templateID
     * @param int $root
     * @return bool
     */
    public function getOne($templateID, $root = 1)
    {

        $query = ' SELECT t.* FROM  `' . $this->getTableName() . '` as t WHERE 
         t.templateID = :templateID AND t.domainID = :domainID AND `root` = :root ';

        $binds['templateID'] = $templateID;
        $binds['root'] = $root;
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $templateID
     * @param int $root
     * @return bool
     */
    public function deleteByID($templateID, $root = 1)
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE `templateID` = :templateID AND `root` = :root ';

        $binds['templateID'] = $templateID;
        $binds['root'] = $root;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }


    /**
     * @param $list
     * @param int $root
     * @return array|bool
     */
    public function getByList( $list, $root = 1 )
    {
        if( empty($list) ) {
            return false;
        }
        $query = ' SELECT * FROM  `' . $this->getTableName() . '`  WHERE 
         templateID IN ('. implode(',', $list) .') AND `domainID` = :domainID AND `root` = :root ';

        $binds['domainID'] = $this->getDomainID();
        $binds['root'] = $root;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        if( empty($res) ) {
            return false;
        }

        $result = array();
        foreach ($res as $row){
            $result[$row['templateID']] = $row['source'];
        }

        return $result;
    }
}
