<?php
/**
 * Created by PhpStorm.
 * User: lenovo
 * Date: 29.01.19
 * Time: 09:29
 */

namespace DreamSoft\Models\Behaviours;


use DreamSoft\Libs\Debugger;
use DreamSoft\Models\Product\ProductCategory;
use DreamSoft\Models\Product\Category;

class ProductManipulation extends Debugger
{
    /**
     * @var ProductCategory
     */
    private $ProductCategory;
    /**
     * @var Category
     */
    private $Category;
    /**
     * @var int
     */
    private $domainID;

    /**
     * ProductManipulation constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->ProductCategory = ProductCategory::getInstance();
        $this->Category = Category::getInstance();
    }

    /**
     * @return int
     */
    public function getDomainID(): int
    {
        return $this->domainID;
    }

    /**
     * @param int $domainID
     */
    public function setDomainID(int $domainID): void
    {
        $this->domainID = $domainID;
        $this->Category->setDomainID($domainID);
        $this->ProductCategory->setDomainID($domainID);
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return bool
     */
    public function selectCategory($groupID, $typeID)
    {
        $categories = $this->ProductCategory->getSelected($typeID, 2);
        $categoryID = current($categories);

        $this->debug('catID: ', $categoryID);

        $category = $this->fetchCategory($categoryID);

        if ($category) {
            return $category;
        }

        $categories = $this->ProductCategory->getSelected($groupID, 1);
        $categoryID = current($categories);
        $this->debug($categories, $categoryID);
        $category = $this->fetchCategory($categoryID);

        return $category;
    }

    /**
     * @param $categoryID
     * @return bool
     */
    public function fetchCategory($categoryID)
    {
        $category = $this->Category->getOne($categoryID);
        $this->debug('po return row: ', $category);
        if (strlen($category['langs'])) {
            $exp1 = explode("||", $category['langs']);
            unset($category['langs']);
            foreach ($exp1 as $oneLang) {
                $exp2 = explode("::", $oneLang);
                $category['langs'][$exp2[0]]['url'] = $exp2[1];
                $category['langs'][$exp2[0]]['name'] = $exp2[2];
            }
        }
        return $category;
    }
}
