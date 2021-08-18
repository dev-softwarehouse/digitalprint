<?php
/**
 * Created by PhpStorm.
 * User: lenovo
 * Date: 22.01.19
 * Time: 10:48
 */

namespace DreamSoft\Models\Order;

use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\QueryFilter;

class DpProduct extends Model
{
    /**
     * @var QueryFilter
     */
    protected $QueryFilter;
    protected $calcTable;
    protected $calcProductTable;
    protected $priceTable;
    protected $orderTable;

    /**
     * DpProduct constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->QueryFilter = new QueryFilter();
        $this->setTableName('products', true);
        $this->calcTable = 'ps_user_calc';
        $this->calcProductTable = 'ps_user_calc_products';
        $this->priceTable = 'dp_base_prices';
        $this->orderTable = $this->prefix . 'orders';
    }

    /**
     * @param null $filters
     * @param int $offset
     * @param int $limit
     * @param array $orderBy
     * @param string $logicalOperator
     * @return bool|array
     */
    public function getList($filters = NULL, $offset = 0, $limit = 30, $orderBy = array(), $logicalOperator = 'AND')
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*, calculate.typeID, calculate.groupID, calculate.realisationDate as realisationDate, orders.userID, calculate.volume '
            . ' FROM `' . $this->getTableName() . '` '
            . ' LEFT JOIN `' . $this->orderTable . '` as orders ON orders.ID = `' . $this->getTableName() . '`.orderID '
            . ' LEFT JOIN `' . $this->calcTable . '` as calculate ON calculate.ID = `' . $this->getTableName() . '`.calcID '
            . ' LEFT JOIN `ps_products_types` as types ON types.ID = calculate.typeID '
            . ' LEFT JOIN `ps_products_typeLangs` as typeLanguages ON typeLanguages.typeID = types.ID ';

        $prepare = $this->QueryFilter->prepare($filters, $logicalOperator);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }

        $query .= ' GROUP BY `' . $this->getTableName() . '`.ID ASC ';
        if (empty($orderBy)) {
            $query .= ' ORDER BY `' . $this->getTableName() . '`.`created` DESC ';
        } else {

            $orderQuery = ' ORDER BY ';
            foreach ($orderBy as $ord) {
                if (strstr($ord, '.')) {
                    $exp = explode('.', $ord);
                    if (strlen($exp[0]) > 0) {
                        $sortTable = '`' . $exp[0] . '`.';
                    } else {
                        $sortTable = '';
                    }
                    $ord = $exp[1];
                } else {
                    $sortTable = '`' . $this->getTableName() . '`.';
                }
                if (substr($ord, 0, 1) == '-') {
                    $direct = 'DESC';
                    $ord = substr($ord, 1);
                } else {
                    $direct = 'ASC';
                }
                $orderQuery .= ' ' . $sortTable . '`' . $ord . '` ' . $direct . ',';
            }
            $query .= substr($orderQuery, 0, -1);
        }

        $query .= ' LIMIT ' . intval($offset) . ',' . intval($limit) . ' ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param null $filters
     * @return bool
     */
    public function count($filters = NULL)
    {

        $query = 'SELECT COUNT(`' . $this->getTableName() . '`.`ID`) as count '
            . ' FROM `' . $this->getTableName() . '` '
            . ' LEFT JOIN `' . $this->orderTable . '` as orders ON orders.ID = `' . $this->getTableName() . '`.orderID '
            . ' LEFT JOIN `' . $this->calcTable . '` as calculate ON calculate.ID = `' . $this->getTableName() . '`.calcID '
            . ' LEFT JOIN `ps_products_types` as types ON types.ID = calculate.typeID '
            . ' LEFT JOIN `ps_products_typeLangs` as typeLanguages ON typeLanguages.typeID = types.ID ';


        $prepare = $this->QueryFilter->prepare($filters);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }
        $query .= ' GROUP BY `' . $this->getTableName() . '`.ID ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->rowCount();

    }

    /**
     * @param $orderIDs
     * @return bool|array
     */
    public function getOrdersProducts($orderIDs)
    {
        if (!$orderIDs) {
            return false;
        }
        $query = 'SELECT products.*, products.`ID` as productID, calc.*,
			priceTable.price, priceTable.grossPrice, priceTable.currency,
			calcPriceTable.price as calcPrice, calcPriceTable.grossPrice as calcGrossPrice,
			priceTable.taxID 
		    FROM `' . $this->getTableName() . '` products 
    		LEFT JOIN `' . $this->calcTable . '` calc ON products.calcID = calc.ID
    		LEFT JOIN `' . $this->priceTable . '` as priceTable ON priceTable.`ID` = calc.`priceID` 
    		LEFT JOIN `' . $this->priceTable . '` as calcPriceTable ON calcPriceTable.`ID` = calc.`calcPriceID` 
    		WHERE products.`orderID` IN (' . implode(',', $orderIDs) . ') ORDER BY products.`created` DESC';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param string $products
     * @return bool|array
     */
    public function getProductsByList($products)
    {
        $query = 'SELECT products.*, products.`ID` as productID, calc.*,
			priceTable.price, priceTable.grossPrice, priceTable.currency,
			calcPriceTable.price as calcPrice, calcPriceTable.grossPrice as calcGrossPrice,
			priceTable.taxID 
		    FROM `' . $this->getTableName() . '` products 
    		LEFT JOIN `' . $this->calcTable . '` calc ON products.calcID = calc.ID
    		LEFT JOIN `' . $this->priceTable . '` as priceTable ON priceTable.`ID` = calc.`priceID` 
    		LEFT JOIN `' . $this->priceTable . '` as calcPriceTable ON calcPriceTable.`ID` = calc.`calcPriceID` 
    		WHERE products.`ID` IN (' . $products . ') ORDER BY products.`created` DESC';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $productID
     * @return bool
     */
    public function getBaseInfo($productID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
    		WHERE `ID` = :productID';
        $binds = array();
        $binds[':productID'] = $productID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $orderID
     * @return bool
     */
    public function getInfoProducts($orderID)
    {
        $query = 'SELECT products.*, products.`ID` as productID, calc.*,
			priceTable.price, priceTable.grossPrice, priceTable.currency, priceTable.copyFromID as copyPriceID,
			calcPriceTable.price as calcPrice, calcPriceTable.grossPrice as calcGrossPrice,
			GROUP_CONCAT(calcProducts.groupID,",", calcProducts.typeID,",",calcProducts.formatID SEPARATOR "||") as subProducts
		    FROM `' . $this->getTableName() . '` products 
    		LEFT JOIN `' . $this->calcTable . '` calc ON products.calcID = calc.ID
    		LEFT JOIN `' . $this->calcProductTable . '` calcProducts ON calcProducts.calcID = calc.ID
    		LEFT JOIN `' . $this->priceTable . '` as priceTable ON priceTable.`ID` = calc.`priceID` 
    		LEFT JOIN `' . $this->priceTable . '` as calcPriceTable ON calcPriceTable.`ID` = calc.`calcPriceID` 
    		WHERE products.`orderID` = :orderID GROUP BY calc.ID ORDER BY products.`created` DESC';

        $binds['orderID'] = $orderID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $calcID
     * @return bool
     */
    public function getProductByCalcID($calcID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `calcID` = :calcID';
        $binds = array();
        $binds['calcID'] = $calcID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getRow();
    }

    /**
     * @param $products
     * @return array|bool
     */
    public function getByList($products)
    {
        if (!$products) {
            return array();
        }
        $query = 'SELECT products.*, products.`ID` as productID, calc.*
		    FROM `' . $this->getTableName() . '` products 
    		LEFT JOIN `' . $this->calcTable . '` calc ON products.calcID = calc.ID
    		WHERE products.`ID` IN( ' . implode(',', $products) . ' ) GROUP BY calc.ID ORDER BY products.`created` DESC';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $productID
     * @return array|bool
     */
    public function searchOperationsForProducts($productID)
    {
        $query = ' SELECT operation.*, calcProductAttribute.controllerID, calcProductAttribute.optID, 
          product.ID as productID, calcProduct.printTypeID, calcProduct.ID as calcProductID, 
          attributes.type as attributeType 
         FROM `' . $this->getTableName() . '` as product
         LEFT JOIN `ps_user_calc` as calc ON calc.ID = product.calcID 
         LEFT JOIN `ps_user_calc_products` as calcProduct ON calcProduct.calcID = calc.ID
         LEFT JOIN `ps_user_calc_product_attributes` as calcProductAttribute 
         ON calcProductAttribute.calcProductID = calcProduct.ID 
         LEFT JOIN `dp_operationOptions` as operationOption ON operationOption.optionID = calcProductAttribute.optID
         LEFT JOIN `dp_operations` as operation ON operation.ID = operationOption.operationID 
         LEFT JOIN `ps_config_attributes` as attributes ON attributes.ID = calcProductAttribute.attrID 
         WHERE product.ID = :productID AND operation.ID IS NOT NULL 
         ORDER BY operation.`order` ASC 
         ';

        $binds['productID'] = $productID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();

    }
}