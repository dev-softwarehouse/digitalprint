<?php

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Core\Model;

/**
 * Class PrintShopTypeDescription
 * @package DreamSoft\Models\PrintShopProduct
 */
class PrintShopTypeDescription extends Model
{

    /**
     * @var string
     */
    private $descriptionsLangs;
    /**
     * @var string
     */
    private $descriptionsFormats;
    /**
     * @var string
     */
    private $descriptionTypes;
    /**
     * @var string
     */
    private $descriptionsFiles;
    /**
     * @var string
     */
    private $uploadedFiles;
    /**
     * @var int
     */
    private $domainID;
    /**
     * PrintShopTypeDescription constructor.
     */
    public function __construct()
    {

        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('products_descriptions', true);
        $this->descriptionsLangs = $this->prefix . 'products_descriptionsLangs';
        $this->descriptionsFormats = $this->prefix . 'products_descriptionsFormats';
        $this->descriptionsFiles = $this->prefix . 'products_descriptionsFiles';
        $this->descriptionTypes = 'descriptionTypes';
        $this->uploadedFiles = 'uploadedFiles';

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
     * @param $typeID
     * @return array|bool
     */
    public function customGetAll($typeID)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` AS d 
        LEFT JOIN `' . $this->descriptionsLangs . '` AS dl ON dl.descID = d.ID 
        WHERE typeID = :typeID ORDER BY `order`';
        $binds['typeID'] = $typeID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $typeID
     * @return array|bool
     */
    public function getMaxOrder($typeID)
    {

        $query = 'SELECT `order` FROM `' . $this->getTableName() . '` 
        WHERE typeID = :typeID ORDER BY `order` DESC LIMIT 1';
        $binds['typeID'] = $typeID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $groupID
     * @return array|bool
     */
    public function getAllForGroup($groupID)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` AS d '
            . ' LEFT JOIN `' . $this->descriptionsLangs . '` AS dl ON dl.descID = d.ID '
            . ' WHERE `groupID` = :groupID AND `typeID` IS NULL ORDER BY `order`';
        $binds[':groupID'] = $groupID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $descLangID
     * @return bool|mixed
     */
    public function getByDescLangID($descLangID)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` AS d LEFT JOIN `' . $this->descriptionsLangs . '` AS dl ON d.ID = dl.descID WHERE dl.ID = :descLangID';

        $binds[':descLangID'] = $descLangID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $descID
     * @return bool|mixed
     */
    public function getForView($descID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` AS d LEFT JOIN `' . $this->descriptionsLangs . '` AS dl ON d.ID = dl.descID WHERE d.ID = :descID';

        $binds[':descID'] = $descID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $typeID
     * @param $descType
     * @param $visible
     * @param null $order
     * @return bool|string
     */
    public function createDesc($typeID, $descType, $visible, $order = NULL)
    {

        $query = 'INSERT INTO `' . $this->getTableName() . '` 
        (`typeID`, `descType`, `visible`, `order`) VALUES ( :typeID, :descType, :visible, :order )';

        $binds['typeID'] = $typeID;
        $binds['descType'] = $descType;
        $binds['visible'] = $visible;
        $binds['order'] = $order;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();
    }

    /**
     * @param $descID
     * @return bool
     */
    public function removeDesc($descID)
    {

        $query = ' DELETE FROM `' . $this->getTableName() . '` WHERE `ID` = :descID';

        $binds[':descID'] = $descID;

        if ($this->db->exec($query, $binds)) {
            $query = ' DELETE FROM `' . $this->descriptionsLangs . '` WHERE `descID` = :descID';
            if ($this->db->exec($query, $binds)) {
                $query = ' DELETE FROM `' . $this->descriptionsFormats . '` WHERE `descID` = :descID';
                if ($this->db->exec($query, $binds)) {
                    return true;
                } else {
                    return false;
                }
            }
        } else {

            return false;
        }
    }

    /**
     * @param $descID
     * @param $order
     * @return bool
     */
    public function editOrder($descID, $order)
    {

        $query = 'UPDATE `' . $this->getTableName() . '` SET `order` = :order WHERE `ID` = :descID';

        $binds[':order'] = $order;
        $binds[':descID'] = $descID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * @param $descID
     * @param $visible
     * @return bool
     */
    public function editVisible($descID, $visible)
    {

        $query = 'UPDATE `' . $this->getTableName() . '` SET `visible` = :visible WHERE `ID` = :descID';

        $binds[':visible'] = $visible;
        $binds[':descID'] = $descID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * @param $typeID
     * @param $lang
     * @return bool|mixed
     */
    public function exist($typeID, $lang)
    {

        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE `typeID` = :typeID AND `lang` = :lang ';

        $binds[':typeID'] = $typeID;
        $binds[':lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    /**
     * @param $descID
     * @return bool|mixed
     */
    public function countFormats($descID)
    {
        $query = 'SELECT COUNT(*) FROM `' . $this->descriptionsFormats . '` WHERE `descID` = :descID';

        $binds[':descID'] = $descID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }

    /**
     * @return array|bool
     */
    public function getDescTypes()
    {

        $query = 'SELECT * FROM `' . $this->descriptionTypes . '`';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * @param $descID
     * @return bool
     */
    public function getDescriptionFiles($descID)
    {
        $query = 'SELECT * FROM ' . $this->descriptionsFiles . ' WHERE `descID` = :descID';

        $binds[':descID'] = $descID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $descID
     * @return bool
     */
    public function clearDescriptionFiles($descID)
    {
        $query = 'DELETE FROM `' . $this->descriptionsFiles . '` WHERE `descID` =:descID';
        $binds[':descID'] = $descID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $descID
     * @param $fileID
     * @return bool|string
     */
    public function setDescriptionFiles($descID, $fileID)
    {

        $query = 'INSERT INTO `' . $this->descriptionsFiles . '` (`descID`, `fileID`,`domainID`) VALUES (:descID, :fileID, :domainID)';
        $binds[':descID'] = $descID;
        $binds[':fileID'] = $fileID;
        $binds[':domainID'] = $this->getDomainID();
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->lastInsertID();
    }

    /**
     * @param $list
     * @return array|bool
     */
    public function getFilesByList($list)
    {
        if (empty($list)) {
            return false;
        }
        $query = ' SELECT `' . $this->descriptionsFiles . '`.*, '
            . ' `' . $this->uploadedFiles . '`.path '
            . '   FROM `' . $this->descriptionsFiles . '` '
            . ' LEFT JOIN `' . $this->uploadedFiles . '` ON `' . $this->uploadedFiles . '`.ID = `' . $this->descriptionsFiles . '`.fileID '
            . ' WHERE `descID` IN (' . implode(',', $list) . ') ';

        if (!$this->db->exec($query)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }
        $result = array();
        foreach ($res as $row) {
            $result[$row['descID']][] = $row;
        }

        return $result;
    }
}
