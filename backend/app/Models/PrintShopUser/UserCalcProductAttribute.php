<?php

namespace DreamSoft\Models\PrintShopUser;
/**
 * Description of UserCalcProductAttribute
 *
 */
use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\LangFilter;

class UserCalcProductAttribute extends Model
{

    protected $attrConfig;
    protected $optConfig;
    protected $printShopAttributeLang;
    protected $printShopOptionLang;
    /**
     * @var LangFilter
     */
    protected $LangFilter;

    /**
     * UserCalcProductAttribute constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_user_';
        $this->setTableName('calc_product_attributes', true);
        $this->attrConfig = 'ps_config_attributes';
        $this->optConfig = 'ps_config_options';
        $this->printShopAttributeLang = 'ps_config_attributeLangs';
        $this->printShopOptionLang = 'ps_config_optionLangs';
        $this->LangFilter = new LangFilter();
    }

    /**
     * @param array $ids
     * @return array|bool
     */
    public function getByCalcProductIds($ids)
    {
        if( empty($ids) ) {
            return array();
        }

        $query = 'SELECT attributes.*, attrConfig.name as attrName, optConfig.name as optName,
            optConfig.emptyChoice, optConfig.doubleSidedSheet, 
            GROUP_CONCAT( DISTINCT CONCAT_WS("::", attrLang.lang, attrLang.name) SEPARATOR "||" ) as langs,
            GROUP_CONCAT( DISTINCT CONCAT_WS("::", optLang.lang, optLang.name) SEPARATOR "||" ) as optLangs
  			 FROM `' . $this->getTableName() . '` as attributes ';
        $query .= ' LEFT JOIN `' . $this->attrConfig . '` as attrConfig ON attrConfig.`ID` = attributes.`attrID` ';
        $query .= ' LEFT JOIN `' . $this->optConfig . '` as optConfig ON optConfig.`ID` = attributes.`optID` ';
        $query .= ' LEFT JOIN `' . $this->printShopAttributeLang . '` as attrLang ON attrConfig.`ID` = attrLang.`attributeID` ';
        $query .= ' LEFT JOIN `' . $this->printShopOptionLang . '` as optLang ON optConfig.`ID` = optLang.`optionID` ';
        $query .= ' WHERE attributes.`calcProductID` IN (' . implode(',', $ids) . ') ';

        $query .= ' GROUP BY attributes.ID ORDER BY `attrConfig`.`sort` ';

        $binds = array();
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $result = array();
        $res = $this->db->getAll();

        $res = $this->LangFilter->splitArray($res, 'langs');
        $res = $this->LangFilter->splitArray($res, 'optLangs');

        foreach ($res as $each) {
            if (!isset($result[$each['calcProductID']])) {
                $result[$each['calcProductID']] = array();
            }
            $result[$each['calcProductID']][] = $each;
        }

        return $result;
    }
}