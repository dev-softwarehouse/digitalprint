<?php

/**
 * @author Rafał Leśniak
 */
namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Class PrintShopTypePattern
 */
class PrintShopTypePattern extends PrintShop
{

    /**
     * @var string
     */
    protected $filesTable;
    /**
     * @var string
     */
    protected $iconsExtensions;
    /**
     * @var string
     */
    protected $formatsTable;
    /**
     * @var string
     */
    protected $fileFolder;

    /**
     * PrintShopTypePattern constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $prefix = true;
        $this->setTableName('products_patterns', $prefix);
        $this->filesTable = 'uploadedFiles';
        $this->iconsExtensions = 'dp_modelsIconsExtensions';
        $this->formatsTable = $this->prefix . 'products_formats';
        $this->fileFolder = 'uploadedFiles/';
    }

    /**
     * @param $typeID
     * @param $descID
     * @param null $lang
     * @return bool|array
     */
    public function customGetAll($typeID, $descID, $lang = NULL)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.*, `' . $this->filesTable . '`.path, `' . $this->formatsTable . '`.name as formatName FROM `' . $this->getTableName() . '` 
        LEFT JOIN `' . $this->filesTable . '` ON `' . $this->filesTable . '`.ID = `' . $this->getTableName() . '`.fileID
        LEFT JOIN `' . $this->formatsTable . '` ON `' . $this->formatsTable . '`.ID = `' . $this->getTableName() . '`.formatID 
        WHERE `' . $this->getTableName() . '`.`typeID` = :typeID AND `' . $this->getTableName() . '`.`descID` = :descID ';

        $binds[':typeID'] = $typeID;
        $binds[':descID'] = $descID;
        if ($lang) {
            $binds[':lang'] = $lang;
            $query .= ' AND `lang` = :lang ';
        }

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $descID
     * @return bool|array
     */
    public function getByDesc($descID)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.*, `' . $this->filesTable . '`.path, `' . $this->formatsTable . '`.name as formatName FROM `' . $this->getTableName() . '` 
        LEFT JOIN `' . $this->filesTable . '` ON `' . $this->filesTable . '`.ID = `' . $this->getTableName() . '`.fileID
        LEFT JOIN `' . $this->formatsTable . '` ON `' . $this->formatsTable . '`.ID = `' . $this->getTableName() . '`.formatID 
        WHERE `' . $this->getTableName() . '`.`descID` = :descID ';

        $binds[':descID'] = $descID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

    /**
     * @param $typeID
     * @param array $descs
     * @param null $lang
     * @return array|bool
     */
    public function getByList($typeID, $descs = array(), $lang = NULL)
    {
        if (empty($descs)) {
            return false;
        }
        $query = 'SELECT `' . $this->getTableName() . '`.*, `' . $this->filesTable . '`.path, `' . $this->formatsTable . '`.name as formatName FROM `' . $this->getTableName() . '` 
        LEFT JOIN `' . $this->filesTable . '` ON `' . $this->filesTable . '`.ID = `' . $this->getTableName() . '`.fileID
        LEFT JOIN `' . $this->formatsTable . '` ON `' . $this->formatsTable . '`.ID = `' . $this->getTableName() . '`.formatID 
        WHERE `' . $this->getTableName() . '`.`typeID` = :typeID AND `' . $this->getTableName() . '`.`descID` IN (' . implode(',', $descs) . ') ';

        $binds[':typeID'] = $typeID;

        if (!$this->db->exec($query, $binds)) return false;

        $res = $this->db->getAll(PDO::FETCH_ASSOC);

        if (!$res) {
            return false;
        }

        $result = array();
        foreach ($res as $key => $value) {
            $value['patternIcon'] = STATIC_URL . $this->fileFolder . companyID . '/' . 'modelsIcons' . '/' . $value['ext'] . '.png';
            $value['patternFile'] = STATIC_URL . $this->fileFolder . companyID . '/' . $value['path'];
            $result[$value['descID']][] = $value;
        }
        return $result;
    }
}