<?php

namespace DreamSoft\Models\PrintShop;

/**
 * Class PrintShopFormatPrintType
 */
use DreamSoft\Core\Model;
use PDO;

class PrintShopFormatPrintType extends Model
{

    /**
     * PrintShopFormatPrintType constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('products_printTypes', true);
    }

    /**
     * @param $formatID
     * @return array|bool
     */
    public function getByFormatID($formatID)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.*, PT.name, PT.workspaceID, PT.pricelistID, 
                PL.iconID as priceListIconID
                FROM `' . $this->getTableName() . '` 
                LEFT JOIN `ps_config_printTypes` as PT ON `' . $this->getTableName() . '`.`printTypeID` = PT.`ID` 
                LEFT JOIN  `ps_config_priceLists` AS PL ON PT.`pricelistID` = PL.`ID` 
                WHERE `formatID` = :formatID 
                GROUP BY PT.`ID` 
                ';

        $binds[':formatID'] = $formatID;

        if (!$this->db->exec($query, $binds)) return false;

        return $this->db->getAll(PDO::FETCH_ASSOC);
    }

}