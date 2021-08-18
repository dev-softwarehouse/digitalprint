<?php

namespace DreamSoft\Models\Description;

use DreamSoft\Core\Model;

class SubcategoriesDescription extends Model
{

    private $descriptionsLangs;
    private $descriptionsFormats;
    private $descriptionTypes;
    private $descriptionsFiles;
    private $uploadedFiles;

    /**
     * @var string
     */
    private $domainID;

    /**
     * SubcategoriesDescription constructor.
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
     * @return string
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param string $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * @param $subcategoryID
     * @return array|bool
     */
    public function customGetAll($subcategoryID)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` AS d 
        LEFT JOIN `' . $this->descriptionsLangs . '` AS dl ON dl.descID = d.ID 
        WHERE d.subCatID = :subcategoryID ORDER BY `order`';
        $binds[':subcategoryID'] = $subcategoryID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $subcategoryID
     * @return bool|mixed
     */
    public function getMaxOrder($subcategoryID)
    {
        $query = 'SELECT `order` FROM `' . $this->getTableName() . '`
         WHERE subCatID = :subcategoryID ORDER BY `order` DESC LIMIT 1';
        $binds['subcategoryID'] = $subcategoryID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    public function getByDescLangID($descLangID)
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` AS d LEFT JOIN `' . $this->descriptionsLangs . '` AS dl ON d.ID = dl.descID WHERE dl.ID = :descLangID';

        $binds[':descLangID'] = $descLangID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

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
     * @param $subcategoryID
     * @param $descType
     * @param $visible
     * @param null $order
     * @return bool|string
     */
    public function createDesc($subcategoryID, $descType, $visible, $order = NULL)
    {
        $query = 'INSERT INTO `' . $this->getTableName() . '` 
        (`subCatID`, `descType`, `visible`, `order`) VALUES ( :subcategoryID, :descType, :visible, :order )';

        $binds['subcategoryID'] = $subcategoryID;
        $binds['descType'] = $descType;
        $binds['visible'] = $visible;
        $binds['order'] = $order;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();
    }

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
     * @param $fileID
     * @return bool
     */
    public function removeDescriptionFiles($fileID)
    {
        $query = 'DELETE FROM `' . $this->descriptionsFiles . '` WHERE `fileID` = :fileID';
        $binds['fileID'] = $fileID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

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

    public function exist($subcategoryID, $lang)
    {

        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE `subCatID` = :subcategoryID AND `lang` = :lang ';

        $binds[':subcategoryID'] = $subcategoryID;
        $binds[':lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }

    public function countFormats($descID)
    {
        $query = 'SELECT COUNT(*) FROM `' . $this->descriptionsFormats . '` WHERE `descID` = :descID';

        $binds[':descID'] = $descID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }

    public function getDescTypes()
    {

        $query = 'SELECT * FROM `' . $this->descriptionTypes . '` WHERE `viewEverywhere` = 1';

        if (!$this->db->exec($query)) {
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

    public function setDescriptionFiles($descID, $fileID)
    {

        $query = 'INSERT INTO `' . $this->descriptionsFiles . '` (`descID`, `domainID`, `fileID`) VALUES (:descID, :domainID, :fileID)';
        $binds['descID'] = $descID;
        $binds['fileID'] = $fileID;
        $binds['domainID'] = $this->getDomainID();
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->lastInsertID();
    }

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
