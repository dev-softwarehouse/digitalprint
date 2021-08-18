<?php

namespace DreamSoft\Controllers\Components;

use DreamSoft\Models\PrintShopUser\UserCalcProductSpecialAttribute;
use DreamSoft\Models\PrintShopProduct\PrintShopAttributeName;
use DreamSoft\Models\PrintShopProduct\PrintShopFormatName;
use DreamSoft\Models\PrintShopProduct\PrintShopPageName;
use DreamSoft\Models\PrintShopUser\UserCalcProduct;
use DreamSoft\Models\PrintShopProduct\PrintShopOption;
use DreamSoft\Models\PrintShopProduct\PrintShopOptionDelivery;
use DreamSoft\Models\PrintShopUser\UserCalc;
use DreamSoft\Models\PrintShopUser\UserCalcProductAttribute;
use DreamSoft\Core\Component;

/**
 * Class Calculation
 */
class Calculation extends Component {

    public $useModels = array();

    /**
     * @var UserCalc
     */
    protected $UserCalc;
    /**
     * @var UserCalcProduct
     */
    protected $UserCalcProduct;
    /**
     * @var UserCalcProductAttribute
     */
    protected $UserCalcProductAttribute;
    /**
     * @var Price
     */
    protected $Price;
    /**
     * @var PrintShopAttributeName
     */
    protected $PrintShopAttributeName;
    /**
     * @var CustomName
     */
    protected $CustomName;
    /**
     * @var PrintShopFormatName
     */
    protected $PrintShopFormatName;
    /**
     *  @var PrintShopPageName
     */
    protected $PrintShopPageName;
    /**
     * @var UserCalcProductSpecialAttribute
     */
    protected $UserCalcProductSpecialAttribute;
    /**
     * @var PrintShopOption
     */
    private $PrintShopOption;
    /**
     * @var PrintShopOptionDelivery
     */
    private $PrintShopOptionDelivery;

    /**
     * Calculation constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->Price = Price::getInstance();
        $this->CustomName = CustomName::getInstance();

        $this->UserCalc = UserCalc::getInstance();
        $this->UserCalcProduct = UserCalcProduct::getInstance();
        $this->UserCalcProductAttribute = UserCalcProductAttribute::getInstance();
        $this->PrintShopAttributeName = PrintShopAttributeName::getInstance();
        $this->PrintShopFormatName = PrintShopFormatName::getInstance();
        $this->PrintShopPageName = PrintShopPageName::getInstance();
        $this->UserCalcProductSpecialAttribute = UserCalcProductSpecialAttribute::getInstance();
        $this->PrintShopOption = PrintShopOption::getInstance();
        $this->PrintShopOptionDelivery = PrintShopOptionDelivery::getInstance();
    }

    /**
     * @param $result
     * @return mixed
     */
    public function getCalcData($result)
    {
        $ids = array();

        foreach ($result as $key => $each) {
            if( $each['ID'] ) {
                $ids[] = $each['ID'];
            }
            $result[$key]['price'] = $this->Price->getPriceToView($each['price']);
            $result[$key]['grossPrice'] = $this->Price->getPriceToView($each['grossPrice']);
            $result[$key]['expense'] = $this->Price->getPriceToView($each['expense']);
        }
        $calcProducts = $this->UserCalcProduct->getByCalcIds($ids);

        $calcProductsIds = array();
        foreach ($calcProducts as $products) {
            foreach ($products as $each) {
                $calcProductsIds[] = $each['ID'];
            }
        }

        $attributes = $this->UserCalcProductAttribute->getByCalcProductIds($calcProductsIds);
        $specialAttributes = $this->UserCalcProductSpecialAttribute->getByCalcProductIds($calcProductsIds);
        $specialAttributes = $this->prepareSpecialAttributes($specialAttributes);

        foreach ($calcProducts as $calcProductKey => $products) {
            $attributesArr = array();
            $aggregateOptions = array();
            foreach ($products as $productKey => $product) {

                if( $product['formatUnit'] == 2 ) {
                    $calcProducts[$calcProductKey][$productKey]['formatWidth'] /= 10;
                    $calcProducts[$calcProductKey][$productKey]['formatHeight'] /= 10;
                }

                foreach ( $attributes[$product['ID']] as $row ) {
                    $attributesArr[] = $row['attrID'];
                    $aggregateOptions[] = $row['optID'];
                }

                $excludeDeliveries = $this->getExcludedDeliveries($product['typeID'], $aggregateOptions);

                $selectedOptions = $this->PrintShopOption->getSelectedOptionSorted($product['typeID'], $aggregateOptions);

                foreach ( $attributes[$product['ID']] as $attributeKey => $row ) {
                    $attributes[$product['ID']][$attributeKey]['excludeDeliveries'] = NULL;
                    if( $excludeDeliveries && array_key_exists($row['optID'], $excludeDeliveries) ) {
                        $attributes[$product['ID']][$attributeKey]['excludeDeliveries'] = $excludeDeliveries[$row['optID']];
                    }
                    if( $selectedOptions && array_key_exists($row['optID'], $selectedOptions) ) {
                        $attributes[$product['ID']][$attributeKey]['invisible'] = $selectedOptions[$row['optID']]['invisible'];
                    }
                }

                $calcProducts[$calcProductKey][$productKey]['customFormatName'] = $this->CustomName->prepareCustomNames(
                    $this->PrintShopFormatName->getByType($product['typeID'])
                );
                $calcProducts[$calcProductKey][$productKey]['customPageName'] = $this->CustomName->prepareCustomNames(
                    $this->PrintShopPageName->getByType($product['typeID'])
                );

                $customAttributeNames = $this->PrintShopAttributeName->customGetByList($attributesArr, $product['typeID']);

                $attributes[$product['ID']] = $this->fillCustomAttributeNames($customAttributeNames, $attributes[$product['ID']]);

                $calcProducts[$calcProductKey][$productKey]['attributes'] = $attributes[$product['ID']];
                $calcProducts[$calcProductKey][$productKey]['specialAttributes'] = $specialAttributes[$product['ID']];
            }
        }

        foreach ($result as $key => $each) {
            $firstCalcProduct = false;
            if( array_key_exists($each['ID'], $calcProducts) ) {
                $result[$key]['calcProducts'] = $calcProducts[$each['ID']];
            }
            if( !array_key_exists('complex', $each) || !$each['complex'] ) {
                if( array_key_exists('calcProducts', $each) && $each['calcProducts'] &&
                    is_array($each['calcProducts']) ) {
                    $firstCalcProduct = current($each['calcProducts']);
                }
                $result[$key]['skipUpload'] = 0;
                if( $firstCalcProduct ) {
                    $result[$key]['skipUpload'] = $firstCalcProduct['skipUpload'];
                }

            }
        }

        return $result;
    }

    /**
     * @param $typeID
     * @param $aggregateOptions
     * @return array
     */
    private function getExcludedDeliveries($typeID, $aggregateOptions)
    {

        $productOptions = $this->PrintShopOption->getSelectedOption($typeID, $aggregateOptions);

        if( !$productOptions ) {
            return array();
        }
        $aggregateProductOptions = array();
        $productOptionPairs = array();
        foreach ($productOptions as $row) {
            $aggregateProductOptions[] = $row['ID'];
            $productOptionPairs[$row['ID']] = $row['optID'];
        }

        $excludeDeliveries = $this->PrintShopOptionDelivery->getByListOptions($typeID, $aggregateProductOptions);

        $result = array();
        foreach ($excludeDeliveries as $productOptionID => $excludeDelivery) {
            if( array_key_exists($productOptionID, $productOptionPairs) ) {
                $result[$productOptionPairs[$productOptionID]] = $excludeDelivery;
            }
        }
        return $result;
    }

    /**
     * @param $aggregateCalculations
     * @return array|bool
     */
    public function getCalcProductSeparated($aggregateCalculations)
    {
        $calcProducts = $this->UserCalcProduct->getByCalcIds($aggregateCalculations);

        $calcProductsIds = array();
        foreach ($calcProducts as $products) {
            foreach ($products as $each) {
                $calcProductsIds[] = $each['ID'];
            }
        }

        $attributes = $this->UserCalcProductAttribute->getByCalcProductIds($calcProductsIds);
        $specialAttributes = $this->UserCalcProductSpecialAttribute->getByCalcProductIds($calcProductsIds);
        $specialAttributes = $this->prepareSpecialAttributes($specialAttributes);

        foreach ($calcProducts as $calcProductKey => $products) {
            $attributesArr = array();
            foreach ($products as $productKey => $product) {
                foreach ( $attributes[$product['ID']] as $row ) {
                    $attributesArr[] = $row['attrID'];
                }

                $calcProducts[$calcProductKey][$productKey]['customFormatName'] = $this->CustomName->prepareCustomNames(
                    $this->PrintShopFormatName->getByType($product['typeID'])
                );
                $calcProducts[$calcProductKey][$productKey]['customPageName'] = $this->CustomName->prepareCustomNames(
                    $this->PrintShopPageName->getByType($product['typeID'])
                );

                $customAttributeNames = $this->PrintShopAttributeName->customGetByList($attributesArr, $product['typeID']);

                $attributes[$product['ID']] = $this->fillCustomAttributeNames($customAttributeNames, $attributes[$product['ID']]);

                $calcProducts[$calcProductKey][$productKey]['attributes'] = $attributes[$product['ID']];
                $calcProducts[$calcProductKey][$productKey]['specialAttributes'] = $specialAttributes[$product['ID']];
            }
        }

        return $calcProducts;
    }

    /**
     * @param array $specialAttributes
     * @return array|null
     */
    private function prepareSpecialAttributes( array $specialAttributes )
    {
        if( !$specialAttributes ) {
            return null;
        }

        foreach ($specialAttributes as $key => $subProduct) {

            foreach ($subProduct as $productID => $specialAttribute) {
                $specialAttributes[$key][$productID]['price'] = $this->Price->getPriceToView($specialAttribute['price']);
                $specialAttributes[$key][$productID]['expense'] = $this->Price->getPriceToView($specialAttribute['expense']);
            }
        }

        return $specialAttributes;
    }

    /**
     * @param $customNames
     * @param $list
     * @return mixed
     */
    private function fillCustomAttributeNames($customNames, $list)
    {
        if ($customNames) {
            foreach ($list as $keyAttr => $attr) {
                if (isset($customNames[$attr['attrID']]) && !empty($customNames[$attr['attrID']])) {
                    foreach ($customNames[$attr['attrID']] as $cLang => $customName) {
                        $list[$keyAttr]['langs'][$cLang]['name'] = $customName;
                    }
                }
            }

            return $list;
        }
        return $list;
    }

    /**
     * @param $result
     * @return array
     */
    public function getMyZoneData($result)
    {
        if( !$result ) {
            return array();
        }
        $ids = array();
        foreach ($result as $key => $each) {
            $ids[] = $each['ID'];
        }

        $calcProducts = $this->UserCalcProduct->getByCalcIds($ids);
        $calcProductsIds = array();
        foreach ($calcProducts as $products) {
            foreach ($products as $each) {
                $calcProductsIds[] = $each['ID'];
            }
        }

        $attributes = $this->UserCalcProductAttribute->getByCalcProductIds($calcProductsIds);
        $specialAttributes = $this->UserCalcProductSpecialAttribute->getByCalcProductIds($calcProductsIds);
        foreach ($calcProducts as $calcProductKey => $products) {

            $aggregateOptions = array();

            foreach ($products as $productKey => $product) {

                if( $product['formatUnit'] == 2 ) {
                    $calcProducts[$calcProductKey][$productKey]['formatWidth'] /= 10;
                    $calcProducts[$calcProductKey][$productKey]['formatHeight'] /= 10;
                }

                foreach ( $attributes[$product['ID']] as $row ) {
                    $aggregateOptions[] = $row['optID'];
                }

                $selectedOptions = $this->PrintShopOption->getSelectedOptionSorted($product['typeID'], $aggregateOptions);

                foreach ( $attributes[$product['ID']] as $attributeKey => $row ) {
                    if( $selectedOptions && array_key_exists($row['optID'], $selectedOptions) ) {
                        $attributes[$product['ID']][$attributeKey]['invisible'] = $selectedOptions[$row['optID']]['invisible'];
                    }
                }

                if( array_key_exists($product['ID'], $attributes) ) {
                    $calcProducts[$calcProductKey][$productKey]['attributes'] = $attributes[$product['ID']];
                }

                if( array_key_exists($product['ID'], $specialAttributes) ) {
                    $calcProducts[$calcProductKey][$productKey]['specialAttributes'] = $specialAttributes[$product['ID']];
                }

            }
        }

        foreach ($result as $key => $each) {
            $result[$key]['calcProducts'] = $calcProducts[$each['ID']];
            if( !$each['complex'] ) {
                if( array_key_exists('calcProducts', $each) ) {
                    $firstCalcProduct = current($each['calcProducts']);
                    $result[$key]['skipUpload'] = $firstCalcProduct['skipUpload'];
                }
            }
        }
        return $result;
    }

}