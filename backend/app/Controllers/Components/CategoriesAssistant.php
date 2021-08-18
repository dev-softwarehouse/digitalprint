<?php

namespace DreamSoft\Controllers\Components;

use DreamSoft\Libs\Auth;
use DreamSoft\Core\Component;
use DreamSoft\Models\Product\Category;
use DreamSoft\Models\Discount\UserDiscountGroup;
use DreamSoft\Models\Product\ProductCategory;
use DreamSoft\Models\PrintShopProduct\PrintShopGroup;
use DreamSoft\Models\PrintShopProduct\PrintShopType;

class CategoriesAssistant extends Component
{

    /**
     * @var Category
     */
    private $Category;
    /**
     * @var Auth
     */
    private $Auth;
    /**
     * @var UserDiscountGroup
     */
    private $UserDiscountGroup;
    /**
     * @var ProductCategory
     */
    private $ProductCategory;
    /**
     * @var PrintShopGroup
     */
    private $PrintShopGroup;
    /**
     * @var PrintShopType
     */
    private $PrintShopType;


    public function __construct()
    {
        parent::__construct();
        $this->Category = Category::getInstance();
        $this->UserDiscountGroup = UserDiscountGroup::getInstance();
        $this->ProductCategory = ProductCategory::getInstance();
        $this->PrintShopGroup = PrintShopGroup::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->Auth = new Auth();
    }

    public function setDomainID($domainID)
    {
        $this->Category->setDomainID($domainID);
    }


    /**
     * @return array|bool
     */
    public function getCategoryByUserDiscount()
    {
        $loggedUser = $this->Auth->getLoggedUser();
        $discountGroups = $this->UserDiscountGroup->get('userID', $loggedUser['ID'], true);

        $aggregateDiscountGroups = array();

        foreach ($discountGroups as $discountGroup) {
            $aggregateDiscountGroups[] = $discountGroup['discountGroupID'];
        }

        $data = $this->Category->getAll(ACTIVE_CONST, $aggregateDiscountGroups);

        return $data;
    }

    /**
     * @param $categories
     * @return array
     */
    public function getItemsInRelation($categories)
    {
        $itemsInRelation = $this->ProductCategory->getFromList($categories);

        $collections = $this->getRelationItems($itemsInRelation);

        $groups = $this->PrintShopGroup->customGetByList($collections['groupsBox']);
        $types = $this->PrintShopType->customGetByList($collections['typesBox'], true);

        return compact('types','groups', 'itemsInRelation');
    }

    /**
     * @param $itemsInRelation
     * @param $result
     * @param $data
     * @param $types
     * @return array
     */
    public function doAggregateTypes($itemsInRelation, $result, $data, $types)
    {
        $aggregateTypes = array();

        if (!empty($itemsInRelation)) {
            foreach ($itemsInRelation as $item) {
                if ($item['relType'] == REL_TYPE_TYPE) {
                    $assignResult = $this->assignToCategory($item, $types);
                    if ($assignResult) {
                        $aggregateTypes[$item['categoryID']][] = $assignResult;
                    }

                }
            }
        }

        foreach ($data as $key => $row) {
            if ($row['parentID'] > 0) {
                $result[$row['parentID']]['childs'][$row['ID']] = $row;
                if (array_key_exists($row['ID'], $aggregateTypes)) {
                    $result[$row['parentID']]['childs'][$row['ID']]['types'] = $aggregateTypes[$row['ID']];
                }
            }
        }

        foreach ($result as $key => $row) {
            if (intval($row['active']) == 0) {
                unset($result[$key]);
                continue;
            }
            if ($this->checkAggregateItem($row, $aggregateTypes) !== false) {
                $result[$row['ID']]['types'] = $this->checkAggregateItem($row, $aggregateTypes);
            }
            sort($result[$key]['childs']);
        }

        return $result;
    }

    /**
     * @param $itemsInRelation
     * @param $result
     * @param $data
     * @param $groups
     * @return array
     */
    public function doAggregateGroups($itemsInRelation, $result, $data, $groups)
    {
        $aggregateGroups = array();

        if (!empty($itemsInRelation)) {
            foreach ($itemsInRelation as $item) {
                if ($item['relType'] == REL_TYPE_GROUP) {
                    $assignResult = $this->assignToCategory($item, $groups);
                    if ($assignResult) {
                        $aggregateGroups[$item['categoryID']][] = $assignResult;
                    }

                }
            }
        }

        foreach ($data as $key => $row) {
            if ($row['parentID'] > 0) {
                $result[$row['parentID']]['childs'][$row['ID']] = $row;
                if (array_key_exists($row['ID'], $aggregateGroups)) {
                    $result[$row['parentID']]['childs'][$row['ID']]['groups'] = $aggregateGroups[$row['ID']];
                }
            }
        }

        foreach ($result as $key => $row) {
            if (intval($row['active']) == 0) {
                unset($result[$key]);
                continue;
            }
            if (array_key_exists($row['ID'], $aggregateGroups)) {
                $result[$row['ID']]['groups'] = $aggregateGroups[$row['ID']];
            }
            sort($result[$key]['childs']);
        }

        return $result;
    }

    /**
     * @param array $categories
     * @param string $key
     * @param string $actualRow
     * @return array
     */
    public function parseLang(array $categories, $key, $actualRow)
    {
        if (strlen($actualRow)) {
            $split = explode("||", $actualRow);
            foreach ($split as $oneLang) {
                $splitColon = explode("::", $oneLang);
                $categories[$key]['langs'][$splitColon[0]]['url'] = $splitColon[1];
                $categories[$key]['langs'][$splitColon[0]]['name'] = $splitColon[2];
                if (array_key_exists(3, $splitColon) && $splitColon[3]) {
                    $categories[$key]['icons'][$splitColon[0]] = $splitColon[3];
                }
            }
        }
        return $categories;
    }

    /**
     * @param $data
     * @param $result
     * @return array
     */
    public function setParentItems($data, $result)
    {
        foreach ($data as $key => $row) {
            if ($row['parentID'] == 0) {
                $result[$row['ID']] = $row;
                $result[$row['ID']]['childs'] = array();
                unset($data[$key]);
            }
        }

        return $result;
    }

    /**
     * @param $data
     * @param $result
     * @param $icons
     * @return array
     */
    public function setParentItemsWithIcons($data, $result, $icons)
    {
        foreach ($data as $key => $row) {
            if ($row['parentID'] == 0) {
                $row['icon'] = NULL;
                if ( is_array($icons) && array_key_exists($row['iconID'], $icons)) {
                    $row['icon'] = $icons[$row['iconID']];
                }
                $result[$row['ID']] = $row;
                $result[$row['ID']]['childs'] = array();
            }
        }

        return $result;
    }

    /**
     * @param $types
     * @return array
     */
    public function getAggregateGroupsForTypes($types)
    {
        $aggregateGroupsForTypes = array();
        if ($types) {
            foreach ($types as $type) {
                if (!in_array($type['groupID'], $aggregateGroupsForTypes)) {
                    $aggregateGroupsForTypes[] = $type['groupID'];
                }
            }
        }

        return $aggregateGroupsForTypes;
    }

    /**
     * @param $groups
     * @return array|bool
     */
    public function getTypesForGroup($groups)
    {
        $aggregateGroups = array();
        foreach ($groups as $group) {
            $aggregateGroups[] = $group['ID'];
        }

        $groupsWithTypes = $this->PrintShopType->getTypesByGroupList($aggregateGroups);

        $typeArr = array();
        foreach ($groupsWithTypes as $aggregateTypes) {
            $typeArr = array_merge($typeArr, $aggregateTypes);
        }

        return $this->PrintShopType->customGetByList($typeArr, true);
    }

    /**
     * @param $types
     * @param $groupsForTypes
     * @return array
     */
    public function addSlugToTypes($types, $groupsForTypes)
    {
        if ($types) {
            foreach ($types as $key => $type) {
                if ($groupsForTypes[$type['groupID']]) {
                    $types[$key]['group']['slugs'] = $groupsForTypes[$type['groupID']]['slugs'];
                }
            }
        }

        return $types;
    }

    /**
     * @param $aggregateGroupsForTypes
     * @return array|bool
     */
    public function getGroupForTypes($aggregateGroupsForTypes)
    {
        if (!$aggregateGroupsForTypes) {
            return array();
        }

        $groups = $this->PrintShopGroup->customGetByList($aggregateGroupsForTypes);

        if (!$groups) {
            return array();
        }

        return $groups;
    }

    /**
     * @param $row
     * @param $items
     * @return bool
     */
    private function checkAggregateItem($row, $items)
    {
        if (array_key_exists($row['ID'], $items) && $items[$row['ID']] !== NULL && is_array($items[$row['ID']])) {
            return $items[$row['ID']];
        }

        return false;
    }

    /**
     * @param array $item
     * @param array $collections
     * @return array|mixed
     */
    private function assignToCategory(array $item, array $collections)
    {
        if (empty($collections)) {
            return array();
        }

        foreach ($collections as $collection) {
            if ($item['itemID'] == $collection['ID']) {
                return $collection;
            }
        }
        return false;
    }

    /**
     * @param array $itemsInRelation
     * @return array
     */
    private function getRelationItems(array $itemsInRelation)
    {
        $groupsBox = array();
        $typesBox = array();
        if (empty($itemsInRelation)) {
            return array('groupsBox' => array(), 'typesBox' => array());
        }

        foreach ($itemsInRelation as $item) {
            if ($item['relType'] == REL_TYPE_GROUP) {
                $groupsBox[] = $item['itemID'];
            } elseif ($item['relType'] == REL_TYPE_TYPE) {
                $typesBox[] = $item['itemID'];
            }
        }

        return array('groupsBox' => $groupsBox, 'typesBox' => $typesBox);
    }
}