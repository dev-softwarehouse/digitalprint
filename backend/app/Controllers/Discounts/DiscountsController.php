<?php
/**
 * Controller for groups of discounts (pl: Rabaty, grupy rabatowe)
 *
 * @class DiscountsController
 */

namespace DreamSoft\Controllers\Discounts;

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Models\Discount\Discount;
use DreamSoft\Models\Discount\DiscountGroup;
use DreamSoft\Models\Discount\DiscountGroupLang;
use DreamSoft\Controllers\Components\Standard;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Discount\UserDiscountGroup;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\Module\Module;
use DreamSoft\Models\Module\ModuleKey;
use DreamSoft\Models\Module\ModuleValue;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigAttribute;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigDiscountPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigOption;
use DreamSoft\Models\PrintShopProduct\PrintShopGroup;

class DiscountsController extends Controller
{

    public $useModels = array();

    /**
     * @var Discount
     */
    protected $Discount;
    /**
     * @var DiscountGroup
     */
    protected $DiscountGroup;
    /**
     * @var DiscountGroupLang
     */
    protected $DiscountGroupLang;
    /**
     * @var LangSetting
     */
    protected $LangSetting;
    /**
     * @var Module
     */
    protected $Module;
    /**
     * @var ModuleKey
     */
    protected $ModuleKey;
    /**
     * @var ModuleValue
     */
    protected $ModuleValue;
    /**
     * @var PrintShopGroup
     */
    protected $PrintShopGroup;
    /**
     * @var Standard
     */
    protected $Standard;
    /**
     * @var UserDiscountGroup
     */
    protected $UserDiscountGroup;
    /**
     * @var PrintShopConfigDiscountPrice
     */
    protected $PrintShopConfigDiscountPrice;
    /**
     * @var PrintShopConfigAttribute
     */
    protected $PrintShopConfigAttribute;
    /**
     * @var PrintShopConfigOption
     */
    protected $PrintShopConfigOption;
    /**
     * @var Price
     */
    protected $Price;

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->DiscountGroup->setDomainID($domainID);
        $this->ModuleValue->setDomainID($domainID);
        $this->UserDiscountGroup->setDomainID($domainID);
    }

    /**
     * DiscountsController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Discount = Discount::getInstance();
        $this->DiscountGroup = DiscountGroup::getInstance();
        $this->DiscountGroupLang = DiscountGroupLang::getInstance();
        $this->UserDiscountGroup = UserDiscountGroup::getInstance();
        $this->LangSetting = LangSetting::getInstance();
        $this->Module = Module::getInstance();
        $this->ModuleKey = ModuleKey::getInstance();
        $this->ModuleValue = ModuleValue::getInstance();
        $this->PrintShopGroup = PrintShopGroup::getInstance();
        $this->PrintShopConfigDiscountPrice = PrintShopConfigDiscountPrice::getInstance();
        $this->PrintShopConfigAttribute = PrintShopConfigAttribute::getInstance();
        $this->PrintShopConfigOption = PrintShopConfigOption::getInstance();
        $this->Standard = Standard::getInstance();
        $this->Price = Price::getInstance();
    }

    /**
     * @param null $params
     * @return array
     */
    public function discounts($params = NULL)
    {
        return $this->_Discounts();
    }

    /**
     * @param $myData
     * @param $domainID
     * @return mixed
     */
    public function getData($myData, $domainID)
    {
        $data = $this->Discount->getAll();
        $productGroups = $this->PrintShopGroup->getAll();
        $types = $this->Discount->getProductTypes();
        $formats = $this->Discount->getProductFormats();
        $ds_groups = $this->DiscountGroup->getAll();
        $myData['discounts'] = $data;
        $myData['productGroups'] = $productGroups;
        $myData['prodtypes'] = $types;
        $myData['prodformats'] = $formats;
        $myData['discountGroups'] = $ds_groups;
        return $myData;
    }

    /**
     * @return array
     */
    private function _Discounts()
    {
        $discounts = $this->Discount->getAll();

        $productGroups = $this->PrintShopGroup->getAll();
        $discountGroups = $this->DiscountGroup->getAll();

        if ($discountGroups) {
            foreach ($discountGroups as $key => $discountGroup) {
                $discountGroups[$key]['discounts'] = $this->findDiscounts($discounts, $discountGroup['ID']);
            }
        }

        if (empty($productGroups)) {
            $productGroups = array();
        }

        if (empty($discountGroups)) {
            $discountGroups = array();
        }

        $myData = array(
            "productGroups" => $productGroups,
            "discountGroups" => $discountGroups,
        );

        return $myData;
    }

    /**
     * @param $discounts
     * @param $groupID
     * @return array
     */
    private function findDiscounts($discounts, $groupID)
    {
        $result = array();
        if (!$discounts) {
            return $result;
        }
        foreach ($discounts as $discount) {
            if ($discount['groupID'] == $groupID) {
                $result[] = $discount;
            }
        }
        return $result;
    }

    /**
     * @return mixed
     */
    public function post_discounts()
    {

        $data['response'] = false;

        $productGroupID = $this->Data->getPost('productGroupID');
        $productTypeID = $this->Data->getPost('productTypeID');
        $productFormatID = $this->Data->getPost('productFormatID');
        $qty_start = $this->Data->getPost('qty_start');
        $qty_end = $this->Data->getPost('qty_end');
        $metersStart = $this->Data->getPost('meters_start');
        $metersEnd = $this->Data->getPost('meters_end');
        $percentage = $this->Data->getPost('percentage');
        $discountGroupID = $this->Data->getPost('groupID');

        if (intval($qty_start) < 1) {
            $qty_start = NULL;
        }
        if (intval($qty_end) < 1) {
            $qty_end = NULL;
        }
        if (intval($metersStart) < 1) {
            $metersStart = NULL;
        }
        if (intval($metersEnd) < 1) {
            $metersEnd = NULL;
        }

        if ($percentage > 0) {

            $params['productGroupID'] = $productGroupID;
            $params['productFormatID'] = $productFormatID;
            $params['productTypeID'] = $productTypeID;
            $params['qty_start'] = $qty_start;
            $params['qty_end'] = $qty_end;
            $params['meters_start'] = $metersStart;
            $params['meters_end'] = $metersEnd;
            $params['percentage'] = $this->Standard->floatToDb($percentage);
            $params['groupID'] = $discountGroupID;

            $lastID = $this->Discount->create($params);

        } else {
            $data = $this->sendFailResponse('02', 'percentage is empty');
            return $data;
        }

        if ($lastID) {
            $data['response'] = true;
            $data['item'] = $this->Discount->getOne($lastID);
        }

        return $data;
    }

    /**
     * @return array|bool|mixed
     */
    public function discountGroups()
    {
        $data = $this->DiscountGroup->getAll();
        if (!$data) {
            return array();
        }

        return $data;
    }

    /**
     * @param $userID
     * @return array|bool|mixed
     */
    public function selectedDiscountGroup($userID)
    {

        $data = $this->DiscountGroup->getAll();
        if (!$data) {
            return array();
        }
        $userSelected = $this->UserDiscountGroup->get('userID', $userID, true);
        $aggregateSelected = array();
        if ($userSelected) {
            foreach ($userSelected as $us) {
                $aggregateSelected[] = $us['discountGroupID'];
            }
        }

        foreach ($data as $key => $discountGroup) {
            if (in_array($discountGroup['ID'], $aggregateSelected)) {
                $data[$key]['selected'] = true;
            } else {
                $data[$key]['selected'] = false;
            }
        }


        return $data;
    }

    /**
     * @param $userID
     * @return array
     */
    public function patch_selectedDiscountGroup($userID)
    {
        $post = $this->Data->getAllPost();

        $this->UserDiscountGroup->delete('userID', $userID);

        $saved = 0;

        if (!empty($post)) {
            foreach ($post as $discountGroupID) {
                $params = array();
                $params['userID'] = $userID;
                $params['discountGroupID'] = $discountGroupID;
                $lastID = $this->UserDiscountGroup->create($params);
                if ($lastID > 0) {
                    $saved++;
                }
            }
        } else {
            return array('response' => true, 'deleted' => 'all');
        }

        if ($saved > 0) {
            $usersDiscountGroups = $this->UserDiscountGroup->getGroupsForUsers(array($userID));
            return array(
                'response' => true,
                'saved' => $saved,
                'userDiscountGroups' => $usersDiscountGroups[$userID]
            );
        }

        return $this->sendFailResponse('03');
    }

    /**
     * @return array
     */
    public function post_discountGroups()
    {
        $post = $this->Data->getAllPost();
        $names = $post['names'];

        $savedLangs = 0;
        $data['response'] = false;

        if (!empty($names)) {

            $params['domainID'] = $this->DiscountGroup->getDomainID();

            $lastID = $this->DiscountGroup->create($params);

            if (!$lastID) {
                return $this->sendFailResponse('03');
            }

            foreach ($names as $lang => $name) {
                unset($params);
                $params['groupID'] = $lastID;
                $params['lang'] = $lang;
                $params['name'] = $name;
                if ($this->DiscountGroupLang->create($params) > 0) {
                    $savedLangs++;
                }
            }

            if ($savedLangs) {
                $data['response'] = true;
                $data['savedLangs'] = $savedLangs;
                $data['item'] = $this->DiscountGroup->getOne($lastID);
                $data['item']['discounts'] = array();
            }

        } else {
            return $this->sendFailResponse('09');
        }

        return $data;
    }

    /**
     * @param $ID
     * @return array
     */
    public function put_discountGroups($ID)
    {
        $post = $this->Data->getAllPost();
        $languages = $post['langs'];

        if (!$ID) {
            $ID = $this->Data->getPost('ID');
        }

        if (!$ID) {
            return $this->sendFailResponse('04');
        }

        $updateLanguages = 0;
        $savedLanguages = 0;
        $data['response'] = false;

        if (!empty($languages)) {
            foreach ($languages as $lang => $name) {
                $existID = $this->DiscountGroupLang->getOne($ID, $lang);
                if ($existID) {
                    $updateLanguages += intval($this->DiscountGroupLang->update($existID, 'name', $name['name']));
                } else {
                    $param['name'] = $name['name'];
                    $param['lang'] = $lang;
                    $param['groupID'] = $ID;

                    $lastID = $this->DiscountGroupLang->create($param);
                    if ($lastID > 0) {
                        $savedLanguages++;
                    }
                    unset($param);
                }
            }
        }

        if ($updateLanguages > 0 || $savedLanguages > 0) {
            return array('response' => true, 'langs' => $languages, 'ID' => $ID);
        }
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_discountGroups($ID)
    {
        $data['response'] = false;
        if ($ID) {
            $data['message'] = $ID;
            $item = $this->DiscountGroup->get('ID', $ID);

            if (!$item) {
                return $this->sendFailResponse('06');
            }

            if ($this->DiscountGroup->delete('ID', $ID)) {
                if ($this->DiscountGroupLang->delete('groupID', $ID)) {
                    if ($this->Discount->delete('groupID', $ID)) {
                        $data['response'] = true;
                        $data['item'] = $item;
                        return $data;
                    }
                }
            } else {
                return $data;
            }
        } else {
            $data = $this->sendFailResponse('04');
            return $data;
        }
    }

    /**
     * @param $discountID
     * @return array
     */
    public function put_discounts($discountID)
    {
        if (!$discountID) {
            $discountID = $this->Data->getPost('ID');
        }

        if (!$discountID) {
            $data = $this->sendFailResponse('04');
            return $data;
        }

        $productGroupID = $this->Data->getPost('productGroupID');
        $productTypeID = $this->Data->getPost('productTypeID');
        $productFormatID = $this->Data->getPost('productFormatID');
        $qty_start = $this->Data->getPost('qty_start');
        $qty_end = $this->Data->getPost('qty_end');
        $metersStart = $this->Data->getPost('meters_start');
        $metersEnd = $this->Data->getPost('meters_end');
        $percentage = $this->Data->getPost('percentage');

        if (intval($qty_start) < 1) {
            $qty_start = NULL;
        }
        if (intval($qty_end) < 1) {
            $qty_end = NULL;
        }
        if (intval($metersStart) < 1) {
            $metersStart = NULL;
        }
        if (intval($metersEnd) < 1) {
            $metersEnd = NULL;
        }

        $saved = 0;

        if ($discountID > 0) {
            $saved += intval($this->Discount->updateDetails($discountID, 'productGroupID', $productGroupID));
            $saved += intval($this->Discount->updateDetails($discountID, 'productTypeID', $productTypeID));
            $saved += intval($this->Discount->updateDetails($discountID, 'productFormatID', $productFormatID));
            $saved += intval($this->Discount->updateDetails($discountID, 'qty_start', $qty_start));
            $saved += intval($this->Discount->updateDetails($discountID, 'qty_end', $qty_end));
            $saved += intval($this->Discount->updateDetails($discountID, 'meters_start', $metersStart));
            $saved += intval($this->Discount->updateDetails($discountID, 'meters_end', $metersEnd));
            $saved += intval($this->Discount->updateDetails($discountID, 'percentage', $percentage));
        }

        if ($saved > 0) {
            $item = $this->Discount->getOne($discountID);
            return array('saved' => $saved, 'response' => true, 'item' => $item);
        }

        $data = $this->sendFailResponse('03');
        return $data;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_discounts($ID)
    {
        $data['response'] = false;
        if ($ID) {
            $data['message'] = $ID;
            $item = $this->Discount->get('ID', $ID);

            if (!$item) {
                return $this->sendFailResponse('06');
            }

            if ($this->Discount->delete('ID', $ID)) {
                $data['response'] = true;
                $data['item'] = $item;
                return $data;
            } else {
                return $data;
            }
        } else {
            $data = $this->sendFailResponse('04');
            return $data;
        }
    }

    /**
     * @param $discountGroupID
     * @return array|bool
     */
    public function showProcessDiscounts( $discountGroupID )
    {
        $discountGroup = $this->DiscountGroup->get('ID', $discountGroupID);

        if( !$discountGroup ) {
            return $this->sendFailResponse('06');
        }

        $processDiscounts = $this->PrintShopConfigDiscountPrice->getMatrix($discountGroupID);

        if( !$processDiscounts ) {
            return array();
        }

        $aggregateAttributes = array();
        $aggregateOptions = array();
        foreach ($processDiscounts as $processDiscount) {
            $aggregateAttributes[] = $processDiscount['attrID'];
            $aggregateOptions[] = $processDiscount['optID'];
        }

        $attributes = $this->PrintShopConfigAttribute->customGetByList($aggregateAttributes);
        $options = $this->PrintShopConfigOption->customGetByList($aggregateOptions);

        if( $attributes ) {
            foreach ($processDiscounts as $key => $processDiscount) {
                if( isset($attributes[$processDiscount['attrID']]) ) {
                    $processDiscounts[$key]['attribute'] = $attributes[$processDiscount['attrID']];
                }
            }
        }

        if( $options ) {
            foreach ($processDiscounts as $key => $processDiscount) {
                if( isset($options[$processDiscount['optID']]) ) {
                    $processDiscounts[$key]['option'] = $options[$processDiscount['optID']];
                }
            }
        }

        $data = array();
        foreach ($processDiscounts as $row) {
            $optionKey = false;
            if( $row['attribute']['type'] == 1 ) {
                $optionKey = $row['optID'] . '-pl-' . $row['priceListID'];
            } elseif($row['attribute']['type'] == 2) {
                $optionKey = $row['optID'] . '-p-' . $row['printTypeID'];
            } elseif ( $row['attribute']['type'] == 3 ) {
                $optionKey = $row['optID'] . '-w-' . $row['workSpaceID'];
            }

            //$optionKey .= '-'. $row['printTypeID'];

            $item = array();

            $item['printType'] = array(
                'printTypeName' => $row['printTypeName'],
                'printTypeID' => $row['printTypeID']
            );
            $item['workSpace'] = array(
                'workSpaceName' => $row['workSpaceName'],
                'workSpaceID' => $row['workSpaceID']
            );
            $item['priceList'] = array(
                'priceListName' => $row['priceListName'],
                'priceListID' => $row['priceListID']
            );
            $item['attribute'] = $row['attribute'];
            $item['option'] = $row['option'];

            $existKey = $this->searchExist($data[$optionKey], $item);

            if( $existKey !== false ) {

                if( !isset($data[$optionKey][$existKey]['priceTypes'][$row['priceTypeID']]) ) {
                    $data[$optionKey][$existKey]['priceTypes'][$row['priceTypeID']] = array(
                        'priceTypeName' => $row['priceTypeName'],
                        'priceTypeID' => $row['priceTypeID'],
                    );
                }

                $data[$optionKey][$existKey]['priceTypes'][$row['priceTypeID']]['values'][] = array(
                    'amount' => $row['amount'],
                    'value' => $this->Price->getPriceToView($row['value']),
                    'expanse' => $this->Price->getPriceToView($row['expanse'])
                );
            } else {
                if( !isset($item['priceTypes'][$row['priceTypeID']]) ) {
                    $item['priceTypes'][$row['priceTypeID']] = array(
                        'priceTypeName' => $row['priceTypeName'],
                        'priceTypeID' => $row['priceTypeID'],
                    );
                }

                $item['priceTypes'][$row['priceTypeID']]['values'][] = array(
                    'amount' => $row['amount'],
                    'value' => $this->Price->getPriceToView($row['value']),
                    'expanse' => $this->Price->getPriceToView($row['expanse'])
                );

                $data[$optionKey][] = $item;
            }

        }

        foreach ($data as $key => $item) {
            foreach ($item as $iKey => $row) {
                if( $row['priceTypes'] ) {
                    foreach ( $row['priceTypes'] as $priceTypeKey => $priceType ) {
                        if( $priceType['values'] ) {
                            usort($priceType['values'], array($this, 'pricesSort'));
                            $data[$key][$iKey]['priceTypes'][$priceTypeKey]['values'] = $priceType['values'];
                        }
                    }
                }
            }
        }

        return $data;
    }

    /**
     * @param $a
     * @param $b
     * @return bool
     */
    private static function pricesSort($a,$b)
    {
        return $a['amount'] > $b['amount'];
    }

    private function searchExist($data, $item)
    {
        foreach($data as $key => $row) {

            if( $item['attribute']['type'] == $row['attribute']['type'] &&
               $row['option']['ID'] == $item['option']['ID'] ) {

                return $key;

            }

        }

        return false;
    }

}
