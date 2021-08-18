<?php

namespace DreamSoft\Models\PrintShopConfig;

use DreamSoft\Models\Behaviours\LangFilter;
use DreamSoft\Models\PrintShop\PrintShop;
use PDO;

/**
 * Description of PrintShopConfigPriceList
 *
 * @author Właściciel
 */
class PrintShopConfigPriceList extends PrintShop
{

    /**
     * @var LangFilter
     */
    protected $LangFilter;

    /**
     * PrintShopConfigPriceList constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('config_priceLists', true);
        $this->LangFilter = new LangFilter();
    }

    /**
     * @return array|bool|mixed
     */
    public function getAll()
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", priceListLanguages.lang, priceListLanguages.name) SEPARATOR "||" ) as names 
                FROM `' . $this->getTableName() . '`'
            . 'LEFT JOIN `ps_config_priceListLanguages` as priceListLanguages ON priceListLanguages.priceListID = `' . $this->getTableName() . '`.ID '
            . ' WHERE 1 = 1 ';

        $query .= ' GROUP BY `' . $this->getTableName() . '`.ID  ORDER BY `' . $this->getTableName() . '`.`ID` ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll(PDO::FETCH_ASSOC);

        $res = $this->LangFilter->splitFlatArray($res, 'names');
        return $res;

    }

    /**
     * @param $priceListIds
     * @return array|bool
     */
    public function getByList($priceListIds)
    {

        if (empty($priceListIds)) {
            return false;
        }

        $query = 'SELECT `' . $this->getTableName() . '`.*,
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", priceListLanguages.lang, priceListLanguages.name) SEPARATOR "||" ) as names 
                FROM `' . $this->getTableName() . '`'
            . 'LEFT JOIN `ps_config_priceListLanguages` as priceListLanguages ON priceListLanguages.priceListID = `' . $this->getTableName() . '`.ID '
            . ' WHERE 1 = 1 ';

        $query .= ' GROUP BY `' . $this->getTableName() . '`.ID  ORDER BY `' . $this->getTableName() . '`.`ID` ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll(PDO::FETCH_ASSOC);

        $res = $this->LangFilter->splitFlatArray($res, 'names');

        $result = array();

        if ($res) {
            foreach ($res as $row) {
                $result[$row['ID']] = $row;
            }
        }

        return $result;

    }

}
