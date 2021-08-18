<?php
/**
 * UsersController
 */

use DreamSoft\Controllers\Components\Filter;
use DreamSoft\Controllers\Components\Mail;
use DreamSoft\Models\Address\Address;
use DreamSoft\Models\Coupon\Coupon;
use DreamSoft\Controllers\Components\CouponManipulation;
use DreamSoft\Models\Delivery\Delivery;
use DreamSoft\Models\Discount\UserDiscountGroup;
use DreamSoft\Models\Discount\DiscountGroup;
use DreamSoft\Controllers\Components\Acl;
use DreamSoft\Controllers\Components\Standard;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Group\Group;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\User\User;
use DreamSoft\Models\User\UserRole;
use DreamSoft\Models\User\UserOption;
use DreamSoft\Models\User\UserGroup;
use DreamSoft\Libs\Auth;

/**
 *
 * Class to
 *
 * @class UsersController
 */
class UsersController extends Controller
{

    public $useModels = array();

    /**
     * @var User
     */
    protected $User;
    /**
     * @var UserOption
     */
    protected $UserOption;
    /**
     * @var UserRole
     */
    protected $UserRole;
    /**
     * @var Address
     */
    protected $Address;
    /**
     * @var Setting
     */
    protected $Setting;
    /**
     * @var Group
     */
    protected $Group;
    /**
     * @var UserGroup
     */
    protected $UserGroup;
    /**
     * @var Delivery
     */
    protected $Delivery;
    /**
     * @var UserDiscountGroup
     */
    protected $UserDiscountGroup;
    /**
     * @var DiscountGroup
     */
    protected $DiscountGroup;


    /**
     * @var Filter
     */
    protected $Filter;
    /**
     * @var Mail
     */
    protected $Mail;
    /**
     * @var Acl
     */
    protected $Acl;
    /**
     * @var Coupon
     */
    protected $Coupon;
    /**
     * @var CouponManipulation
     */
    protected $CouponManipulation;
    /**
     * @var Standard
     */
    private $Standard;

    /**
     * @var $configs array
     */
    private $configs;

    /**
     * UsersController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->User = User::getInstance();
        $this->User->setFields(array('ID', 'user', 'name', 'lastname'));
        $this->UserRole = UserRole::getInstance();
        $this->UserGroup = UserGroup::getInstance();
        $this->Address = Address::getInstance();
        $this->UserOption = UserOption::getInstance();
        $this->Group = Group::getInstance();
        $this->Delivery = Delivery::getInstance();
        $this->Coupon = Coupon::getInstance();
        $this->CouponManipulation = CouponManipulation::getInstance();
        $this->UserDiscountGroup = UserDiscountGroup::getInstance();
        $this->DiscountGroup = DiscountGroup::getInstance();
        $this->Standard = Standard::getInstance();

        $this->Filter = Filter::getInstance();
        $this->Mail = Mail::getInstance();
        $this->Acl = new Acl();

        $this->Setting = Setting::getInstance();
        $this->Setting->setModule('general');
        $this->Setting->setDomainID(NULL);

        $this->setConfigs();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        parent::setDomainID($domainID);
        $this->Mail->setDomainID($domainID);
        $this->User->setDomainID($domainID);
        $this->DiscountGroup->setDomainID($domainID);
        $this->UserDiscountGroup->setDomainID($domainID);
    }

    public function setConfigs()
    {
        $this->configs = array(
            'ID' => array('type' => 'string', 'table' => 'users', 'field' => 'ID', 'sign' => $this->Filter->signs['li']),
            'name' => array('type' => 'string', 'table' => 'users', 'field' => 'name', 'sign' => $this->Filter->signs['li']),
            'lastname' => array('type' => 'string', 'table' => 'users', 'field' => 'lastname', 'sign' => $this->Filter->signs['li']),
            'user' => array('type' => 'string', 'table' => 'users', 'field' => 'user', 'sign' => $this->Filter->signs['lip']),
            'telephone' => array('type' => 'string', 'table' => 'addressDelivery', 'alias' => true, 'field' => 'telephone', 'sign' => $this->Filter->signs['li']),
            'deleted' => array('type' => 'string', 'table' => 'users', 'field' => 'deleted', 'sign' => $this->Filter->signs['e'], 'default' => 0),
            'registerFrom' => array('type' => 'timestamp', 'table' => 'users', 'field' => 'created', 'sign' => $this->Filter->signs['gt']),
            'registerTo' => array('type' => 'timestamp', 'table' => 'users', 'field' => 'created', 'sign' => $this->Filter->signs['lt']),
            'companyName' => array('type' => 'string', 'table' => 'addressInvoice', 'field' => 'companyName', 'alias' => true, 'sign' => $this->Filter->signs['li']),
            'nip' => array('type' => 'string', 'table' => 'addressInvoice', 'field' => 'nip', 'alias' => true, 'sign' => $this->Filter->signs['li']),
            'countryCode' => array('type' => 'string', 'table' => 'addressDelivery', 'field' => 'countryCode', 'alias' => true, 'sign' => $this->Filter->signs['e']),
            'city' => array('type' => 'string', 'table' => 'addressDelivery', 'field' => 'city', 'alias' => true, 'sign' => $this->Filter->signs['li']),
            'zipcode' => array('type' => 'string', 'table' => 'addressDelivery', 'field' => 'zipcode', 'alias' => true, 'sign' => $this->Filter->signs['li']),
            'deferredPaymentFrom' => array('type' => 'string', 'table' => 'users', 'field' => 'deferredPayment', 'sign' => $this->Filter->signs['gt']),
            'deferredPaymentTo' => array('type' => 'string', 'table' => 'users', 'field' => 'deferredPayment', 'sign' => $this->Filter->signs['lt']),
            'creditLimitFrom' => array('type' => 'string', 'table' => 'userOptions', 'field' => 'creditLimit', 'alias' => true, 'sign' => $this->Filter->signs['gt']),
            'creditLimitTo' => array('type' => 'string', 'table' => 'userOptions', 'field' => 'creditLimit', 'alias' => true, 'sign' => $this->Filter->signs['lt']),
            'block' => array('type' => 'string', 'table' => 'users', 'field' => 'block', 'sign' => $this->Filter->signs['e']),
            'enabled' => array('type' => 'string', 'table' => 'users', 'field' => 'enabled', 'sign' => $this->Filter->signs['e']),
            'domainID' => array('type' => 'string', 'table' => 'users', 'field' => 'domainID', 'sign' => $this->Filter->signs['e']),
            'discountGroupID' => array('type' => 'string', 'table' => 'userDiscountGroups', 'alias' => true, 'field' => 'discountGroupID', 'sign' => $this->Filter->signs['e']),
            'sellerID' => array('type' => 'string', 'table' => 'uop', 'alias' => true, 'field' => 'sellerID', 'sign' => $this->Filter->signs['e']),
        );
    }

    /**
     * @return array
     */
    public function getConfigs()
    {
        return $this->configs;
    }

    /**
     * @return mixed
     */
    public function post_index()
    {

        $email = $this->Data->getPost('user');
        $password = $this->Data->getPost('pass');
        $password_confirm = $this->Data->getPost('pass_confirm');
        $firstname = $this->Data->getPost('name');
        $lastname = $this->Data->getPost('lastname');
        $group = $this->Data->getPost('group');
        $special = $this->Data->getPost('special');

        $userTypeID = $this->Data->getPost('userTypeID');

        $address['name'] = $this->Data->getPost('ad_name');
        $address['lastname'] = $this->Data->getPost('ad_lastname');
        $address['companyName'] = $this->Data->getPost('ad_companyName');
        $address['street'] = $this->Data->getPost('ad_street');
        $address['house'] = $this->Data->getPost('ad_house');
        $address['apartment'] = $this->Data->getPost('ad_apartment');
        $address['zipcode'] = $this->Data->getPost('ad_zipcode');
        $address['city'] = $this->Data->getPost('ad_city');
        $address['areaCode'] = $this->Data->getPost('ad_areaCode');
        $address['telephone'] = $this->Data->getPost('ad_telephone');
        $address['countryCode'] = $this->Data->getPost('ad_countryCode');

        $fvAddress['name'] = $this->Data->getPost('fv_name');
        $fvAddress['lastname'] = $this->Data->getPost('fv_lastname');
        $fvAddress['companyName'] = $this->Data->getPost('fv_companyName');
        $fvAddress['street'] = $this->Data->getPost('fv_street');
        $fvAddress['house'] = $this->Data->getPost('fv_house');
        $fvAddress['apartment'] = $this->Data->getPost('fv_apartment');
        $fvAddress['zipcode'] = $this->Data->getPost('fv_zipcode');
        $fvAddress['city'] = $this->Data->getPost('fv_city');
        $fvAddress['areaCode'] = $this->Data->getPost('fv_areaCode');
        $fvAddress['telephone'] = $this->Data->getPost('fv_telephone');
        $fvAddress['countryCode'] = $this->Data->getPost('fv_countryCode');
        $fvAddress['nip'] = $this->Data->getPost('fv_nip');

        $post = $this->Data->getAllPost();
        $discountGroups = $post['discountGroups'];

        $addressID = false;
        $userID = false;
        $fvAddressID = false;

        if (!$group) {
            $group = 0;
        }

        $hasDelAddress = $this->Data->getPost('hasDelAddress');
        if (intval($hasDelAddress) == 1) {
            try {
                $validAddress = $this->_checkAddress($address);
            } catch (Exception $e) {
                $data['info']['address'] = $e->getMessage();
                $validAddress = false;
            }
        } else {
            $validAddress = true;
        }

        $hasFvAddress = $this->Data->getPost('hasFvAddress');
        if (intval($hasFvAddress) == 1) {
            try {
                $validFvAddress = $this->_checkAddress($fvAddress);
            } catch (Exception $e) {
                $validFvAddress = false;
                $data['info']['fvAddress'] = $e->getMessage();
            }
        } else {
            $validFvAddress = true;
        }

        if ($email && $password && $firstname && $lastname && ($password == $password_confirm) && $validAddress && $validFvAddress) {
            try {
                if ($special === NULL) {
                    $special = 0;
                }
                $userID = $this->User->customCreate($email, $password, $firstname, $lastname, $group, $special);
            } catch (Exception $e) {
                $data['info'] = $e->getMessage();
            }
        } else {

            if( $email && !$password ) {

                $freeEmail = $this->User->freeEmail($email);

                if( !$freeEmail ) {
                    return array(
                        'response' => false,
                        'info' => 'mail_occupied',
                        'user' => $email,
                        'afterInfo' => $email
                    );
                }

                $params = array();
                $params['user'] = $params['login'] = $email;
                if($firstname) {
                    $params['firstname'] = $firstname;
                }
                if( $lastname ) {
                    $params['name'] = $lastname;
                }
                $userID = $this->User->create($params);

                if( !$userID ) {
                    return array(
                        'response' => false,
                        'info' => 'error_when_saving_data',
                        'databaseError' => $this->User->getDbError(),
                        'errors' => $this->User->getErrors()
                    );
                }
            } else {

                if ( !$email || !$password || !$firstname || !$lastname ) {
                    $data['info'] = 'Enter required fields. Check: ' . implode(',', compact('email', 'password', 'firstname', 'lastname'));
                }
                if ($password != $password_confirm) {
                    $data['info'] = 'Passwords not match';
                }

            }

        }

        if ($userID > 0) {

            if ($userTypeID) {

                $this->UserOption->set($userID, array('userTypeID' => $userTypeID));

            } else {
                $this->Setting->setModule('general');
                $this->Setting->setDomainID(NULL);
                $this->Setting->setLang(NULL);

                $defaultUserType = $this->Setting->getValue('defaultUserType');
                if ($defaultUserType) {
                    $this->UserOption->set($userID, array('userTypeID' => $defaultUserType));
                }
            }

            $this->User->update($userID, 'domainID', $this->getDomainID());

            if (intval($hasDelAddress) > 0 && $validAddress) {

                if( !isset($address['addressName']) ) {
                    $addressName = $address['city'] . ',' . ' ' . $address['street'] . ' ' . $address['house'];
                    if (strlen($address['apartment']) > 0) {
                        $addressName .= '/' . $address['apartment'];
                    }
                    $address['addressName'] = $addressName;
                }

                $addressID = $this->Address->create($address);
                if (intval($addressID) > 0) {
                    $params['type'] = 1;
                    $params['userID'] = $userID;
                    $params['addressID'] = $addressID;
                    $params['default'] = 1;
                    $joinAddressID = $this->Address->createJoin($params);
                    unset($params);
                }
            }

            if (intval($hasFvAddress) > 0 && $validFvAddress) {

                if( !isset($fvAddress['addressName']) ) {
                    $addressName = $fvAddress['city'] . ',' . ' ' . $fvAddress['street'] . ' ' . $fvAddress['house'];
                    if (strlen($fvAddress['apartment']) > 0) {
                        $addressName .= '/' . $fvAddress['apartment'];
                    }
                    $fvAddress['addressName'] = $addressName;
                }

                $fvAddressID = $this->Address->create($fvAddress);
                if (intval($fvAddressID) > 0) {
                    $params['type'] = 2;
                    $params['userID'] = $userID;
                    $params['addressID'] = $fvAddressID;
                    $params['default'] = 1;
                    $joinFvAddressID = $this->Address->createJoin($params);
                    unset($params);
                }
            }

            if( $this->getDomainID() > 0 ) {
                $this->User->update($userID, 'domainID', $this->getDomainID());
            }

            $data['user'] = $this->User->get('ID', $userID);

            $loggedUser = $this->Auth->getLoggedUser();

            if( $this->Acl->isSeller($loggedUser) ) {
                $this->UserOption->set($userID, array('sellerID' => $loggedUser['ID']));
            }

            if (intval($addressID) > 0) {
                $data['address'] = $this->Address->get('ID', $addressID);
            }
            if (intval($fvAddressID) > 0) {
                $data['fvAddress'] = $this->Address->get('ID', $fvAddressID);
            }

            $lang = lang;
            $userOption = $this->UserOption->get('uID', $userID);
            if( $userOption && $userOption['lang'] ) {
                $lang = $userOption['lang'];
            }

            if( $discountGroups ) {
                $data['discountGroupAdded'] = 0;
                foreach ($discountGroups as $discountGroupID) {
                    $params = array();
                    $params['userID'] = $userID;
                    $params['discountGroupID'] = $discountGroupID;
                    $lastDiscountGroupID = $this->UserDiscountGroup->create($params);
                    if( $lastDiscountGroupID > 0 ) {
                        $data['discountGroupAdded']++;
                    }
                }
            }

            $data['response'] = true;
            return $data;
        } else {
            $post = $this->Data->getAllPost();
            if (empty($post)) {
                $data['info'] = 'Pusty Post';
                $data['errorCode'] = '01';
            }
            $data['errorCode'] = '02';
            $data['httpCode'] = 400;
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @param $address
     * @return bool
     * @throws Exception
     */
    private function _checkAddress($address)
    {
        if (empty($address)) {
            return false;
        }

        $required = array('street', 'house', 'zipcode', 'city', 'countryCode');
        $requiredOposite = array(0 => array('name', 'lastname'), 1 => array('companyName'));

        $emptyFields = array();
        foreach ($address as $aKey => $a) {
            if (in_array($aKey, $required) && empty($a)) {
                $emptyFields[] = $aKey;
            }
        }

        $ok = array();
        foreach ($requiredOposite as $ro) {
            foreach ($ro as $rKey => $field) {
                if (!empty($address[$field])) {
                    $ok[$rKey] = 1;
                } else {
                    $ok[$rKey] = 0;
                }
            }
        }

        if (array_sum($ok) > 0 && empty($emptyFields)) {
            return true;
        } else {
            if (array_sum($ok) == 0) {
                throw new Exception('Must enter required fields: ' . implode(',', $requiredOposite[0]) . ' or ' . implode(',', $requiredOposite[1]));
            }
            if (empty($emptyFields)) {
                throw new Exception('Must enter: ' . implode(',', $emptyFields));
            }
        }
        return false;
    }

    /**
     * @param null $ID
     * @return mixed
     */
    public function patch_index($ID = NULL)
    {

        $goodFields = array(
            'thegroup',
            'group',
            'enabled',
            'name',
            'lastname',
            'advertising',
            'allegro_mode',
            'refID',
            'refPoints',
            'refPointsAdded',
            'boxmachine1',
            'boxmachine2',
            'ftpPass',
            'deferredPayment',
            'block',
            'advID',
            'sms',
            'discount_group',
            'special',
            'domainID',
            'block',
            'user',
            'login'
        );

        $post = $this->Data->getAllPost();
        if (isset($post['ID']) && intval($post['ID']) > 0) {
            $ID = $post['ID'];
            unset($post['ID']);
        }
        $data['response'] = false;

        $count = count($post);
        if (!empty($post)) {
            $saved = 0;
            foreach ($post as $key => $value) {
                if (in_array($key, $goodFields)) {
                    $saved += intval($this->User->update($ID, $key, $value));
                }
            }
            if ($saved > 0) {
                $data['response'] = true;
                $data['info'] = 'Saved: ' . $count . ' fields.';
            } else {
                $data['httpCode'] = 400;
                $data['errorCode'] = '03';
                $data['info'] = 'Any saved fields';
            }
        } else {
            $data['httpCode'] = 400;
            $data['errorCode'] = '01';
            $data['info'] = 'Empty POST';
        }
        return $data;
    }

    /**
     * @param null $params
     * @return array|bool
     */
    public function index($params = NULL)
    {
        $limit = 30;
        if (isset($params['limit'])) {
            $limit = $params['limit'];
        }
        $offset = 0;
        if (isset($params['offset'])) {
            $offset = $params['offset'];
        }

        $sortBy[0] = '-ID';
        if (isset($params['sort'])) {
            $sortBy = explode('|', $params['sort']);
        }

        $loggedUser = $this->Auth->getLoggedUser();

        if( !$this->Acl->isSuperUser($loggedUser) && $this->Acl->isSeller($loggedUser)
         && !$this->Acl->isBok($loggedUser) ) {
            $params['sellerID'] = $loggedUser['ID'];
        }

        $configs = $this->getConfigs();

        $filters = $this->Filter->prepare($configs, $params);

        $list = $this->User->getList($filters, $offset, $limit, $sortBy);
        $users = array();
        foreach ($list as $row) {
            $users[] = $row['ID'];
        }

        $addressByList = $this->Address->getDefaultByList($users, 1);
        $fvAddressByList = $this->Address->getDefaultByList($users, 2);
        $userOptions = $this->UserOption->getByList($users);
        $countDiscountGroups = $this->UserDiscountGroup->countGroupsForUsers($users);
        $usersDiscountGroups = $this->UserDiscountGroup->getGroupsForUsers($users);

        foreach ($list as $key => $value) {

            $list[$key]['address'] = isset($addressByList[$value['ID']]) ? $addressByList[$value['ID']] : array();
            $list[$key]['fvAddress'] = isset($fvAddressByList[$value['ID']]) ? $fvAddressByList[$value['ID']] : array();
            if(  is_array($countDiscountGroups) && array_key_exists($value['ID'], $countDiscountGroups)
                && $countDiscountGroups[$value['ID']] ) {
                $list[$key]['countDiscountGroups'] = $countDiscountGroups[$value['ID']];
            } else {
                $list[$key]['countDiscountGroups'] = NULL;
            }

            if( is_array($usersDiscountGroups) && array_key_exists($value['ID'], $usersDiscountGroups)
                && $usersDiscountGroups[$value['ID']] ) {
                $list[$key]['userDiscountGroups'] = $usersDiscountGroups[$value['ID']];
            } else {
                $list[$key]['countDiscountGroups'] = NULL;
            }

            if (isset($userOptions[$value['ID']])) {
                $list[$key]['userTypeID'] = $userOptions[$value['ID']]['userTypeID'];
                $list[$key]['options'] = $userOptions[$value['ID']];
            } else {
                $list[$key]['userTypeID'] = NULL;
                $list[$key]['options'] = NULL;
            }
            unset($list[$key]['stats']['uID']);
            unset($list[$key]['pass']);
        }

        if (empty($list)) {
            $list = array();
        }

        return $list;
    }

    /**
     * @param $params
     * @return array|bool
     */
    public function searchAll($params)
    {

        $configs = array(
            'ID' => array('type' => 'string', 'table' => 'users', 'field' => 'ID', 'sign' => $this->Filter->signs['lip']),
            'name' => array('type' => 'string', 'table' => 'users', 'field' => 'name', 'sign' => $this->Filter->signs['lip']),
            'lastname' => array('type' => 'string', 'table' => 'users', 'field' => 'lastname', 'sign' => $this->Filter->signs['lip']),
            'user' => array('type' => 'string', 'table' => 'users', 'field' => 'user', 'sign' => $this->Filter->signs['lip']),
            'domainID' => array('type' => 'string', 'table' => 'users', 'orEmpty' => true, 'field' => 'domainID', 'sign' => $this->Filter->signs['e']),
            'companyName' => array('type' => 'string', 'table' => 'addressInvoice', 'alias' => true, 'field' => 'companyName', 'sign' => $this->Filter->signs['lip']),
            'nip' => array('type' => 'string', 'table' => 'addressInvoice', 'alias' => true, 'field' => 'nip', 'sign' => $this->Filter->signs['lip']),
            'sellerID' => array('type' => 'string', 'table' => 'uop', 'alias' => true, 'field' => 'sellerID', 'sign' => $this->Filter->signs['lip']),
        );

        $limit = 30;
        if (isset($params['limit'])) {
            $limit = $params['limit'];
        }
        $offset = 0;
        if (isset($params['offset'])) {
            $offset = $params['offset'];
        }

        switch ($params['type']) {
            case 'firstName':
                $params['name'] = $params['search'];
                break;
            case 'lastName':
                $params['lastname'] = $params['search'];
                break;
            case 'companyName':
                $params['companyName'] = $params['search'];
                break;
            case 'nip':
                $params['nip'] = $params['search'];
                break;
            case 'ID':
                $params['ID'] = $params['search'];
                break;
            default:
                $params['user'] = $params['search'];
                break;
        }

        $params['domainID'] = $this->getDomainID();
        unset($params['search']);

        $sortBy[0] = '-ID';
        if (isset($params['sort'])) {
            $sortBy = explode('|', $params['sort']);
        }

        $loggedUser = $this->Auth->getLoggedUser();

        if( !$this->Acl->isSuperUser($loggedUser) && $this->Acl->isSeller($loggedUser) &&
            !$this->Acl->isBok($loggedUser) ) {
            $params['sellerID'] = $loggedUser['ID'];
        }

        $filters = $this->Filter->prepare($configs, $params);

        $list = $this->User->getList($filters, $offset, $limit, $sortBy, 'AND');
        $users = array();
        foreach ($list as $row) {
            $users[] = $row['ID'];
        }

        $addressByList = $this->Address->getDefaultByList($users, 1);
        $fvAddressByList = $this->Address->getDefaultByList($users, 2);
        $userOptions = $this->UserOption->getByList($users);
        $userDiscountGroups = $this->UserDiscountGroup->getByUserList($users);

        $unsortedDiscountGroups = $this->DiscountGroup->getAll();
        $discountGroups = array();

        if( $unsortedDiscountGroups ) {
            foreach ($unsortedDiscountGroups as $discountGroup) {
                $discountGroups[$discountGroup['ID']] = $discountGroup;
            }
        }

        foreach ($list as $key => $value) {
            $list[$key]['address'] = isset($addressByList[$value['ID']]) ? $addressByList[$value['ID']] : array();
            $list[$key]['fvAddress'] = isset($fvAddressByList[$value['ID']]) ? $fvAddressByList[$value['ID']] : array();
            if (isset($userOptions[$value['ID']])) {
                $list[$key]['userTypeID'] = $userOptions[$value['ID']]['userTypeID'];
                $list[$key]['options'] = $userOptions[$value['ID']];
            } else {
                $list[$key]['userTypeID'] = NULL;
                $list[$key]['options'] = NULL;
            }
            $list[$key]['discountGroups'] = array();
            if( isset($userDiscountGroups[$value['ID']]) && is_array($userDiscountGroups[$value['ID']]) ) {
                foreach ($userDiscountGroups[$value['ID']] as $discountGroupID ) {
                    $list[$key]['discountGroups'][] = $discountGroups[$discountGroupID];
                }
            }
            unset($list[$key]['stats']['uID']);
            unset($list[$key]['pass']);
        }

        if (empty($list)) {
            $list = array();
        }

        return $list;
    }

    /**
     * @param null $params
     * @return array
     */
    public function count($params = NULL)
    {
        $configs = $this->getConfigs();

        $loggedUser = $this->Auth->getLoggedUser();

        if( !$this->Acl->isSuperUser($loggedUser) && $this->Acl->isSeller($loggedUser) ) {
            $params['sellerID'] = $loggedUser['ID'];
        }

        $filters = $this->Filter->prepare($configs, $params);

        $count = $this->User->count($filters);

        return array('count' => $count);
    }

    /**
     * @param $userID
     * @return array
     */
    public function userRoles($userID)
    {
        if (intval($userID) > 0) {
            $selected = $this->UserRole->getSelectedRoles($userID);
        }

        if (is_array($selected)) {
            sort($selected);
            $list = $selected;
        }
        if (empty($list)) {
            $list = array();
        }
        return array('response' => true, 'items' => $list);
    }

    /**
     * @param $userID
     * @return mixed
     * @throws Exception
     */
    public function post_userRoles($userID)
    {
        if (intval($userID) > 0) {
            $selected = $this->UserRole->getSelectedRoles($userID);
        }

        $post = $this->Data->getAllPost();

        if (!empty($post)) {
            $count = 0;
            foreach ($post as $key => $roleID) {
                $exist = $this->UserRole->exist($roleID, $userID);

                if (!in_array($roleID, $selected) && !$exist) {

                    $lastID = $this->UserRole->create(compact('roleID', 'userID'));

                    if (intval($lastID) > 0) {
                        $count++;
                    }
                }
            }
            $delCount = 0;
            foreach ($selected as $key => $roleID) {
                $exist = $this->UserRole->exist($roleID, $userID);
                if (!in_array($roleID, $post) && $exist) {
                    if ($this->UserRole->customDelete($roleID, $userID)) {
                        $delCount++;
                    }
                }
            }
        } else {
            $this->UserRole->deleteByUser($userID);
        }
        $data['response'] = true;
        $data['added'] = $count;
        $data['removed'] = $delCount;
        return $data;
    }

    /**
     * @param $userID
     * @return array
     */
    public function userGroups($userID)
    {

        if (intval($userID) > 0) {
            $selected = $this->UserGroup->getUserGroups($userID);

            if (is_array($selected)) {
                sort($selected);
                $list = $selected;
            }
        }

        if (empty($list)) {
            $list = array();
        }
        return array('response' => true, 'items' => $list);
    }

    /**
     * @param $userID
     * @return mixed
     * @throws Exception
     */
    public function post_userGroups($userID)
    {

        if (intval($userID) > 0) {
            $selected = $this->UserGroup->getUserGroups($userID);
            if (!$selected) {
                $selected = array();
            }
            $post = $this->Data->getAllPost();
            if (!empty($post)) {
                foreach ($post as $key => $groupID) {
                    if (!in_array($groupID, $selected)) {
                        $this->UserGroup->customCreate($groupID, $userID);
                    }
                }
                foreach ($selected as $key => $groupID) {
                    if (!in_array($groupID, $post)) {
                        $this->UserGroup->delete($groupID, $userID);
                    }
                }
            } else {
                $this->UserGroup->deleteByUser($userID);
            }
            $data['response'] = true;
        } else {
            $data['httpCode'] = 400;
            $data['errorCode'] = '04';
            $data['info'] = ' Brak identyfikatora w GET - userID ';
            $data['response'] = false;
        }


        return $data;
    }

    /**
     * @return array
     */
    public function patch_changePass()
    {

        $loggedUser = $this->Auth->getLoggedUser();

        $post = $this->Data->getAllPost();

        $data['response'] = false;

        if (!$loggedUser) {
            return $this->sendFailResponse('12');
        }

        $oldPass = hash('sha512', $post['oldPass'] . Auth::salt);

        $userPass = $this->User->getPass($loggedUser['ID']);

        if ($oldPass != $userPass) {
            $data = array('response' => false, 'info' => 'Passwords didn\'t match', 'code' => '01');
            return $data;
        }

        $count = count($post);
        if (!empty($post)) {
            $saved = 0;
            $saved += intval($this->User->editPassword($loggedUser['ID'], $post['pass']));

            if ($saved > 0) {
                $data['response'] = true;
                $data['info'] = 'Saved: ' . $saved . ' fields.';
                $data['countUpdated'] = $saved;
            } else {
                $data = $this->sendFailResponse('03');
            }
        } else {
            $data = $this->sendFailResponse('01');
        }
        return $data;
    }

    /**
     * @return array
     */
    public function patch_changePassword()
    {

        $loggedUser = $this->Auth->getLoggedUser();

        if( !$this->Acl->isSuperUser($loggedUser) && !$this->canEditOtherPassword() ) {
            return $this->sendFailResponse('12');
        }

        $post = $this->Data->getAllPost();

        $ID = $post['ID'];

        if( !$ID ) {
            return $this->sendFailResponse('01');
        }

        $data['response'] = false;

        if( $post['password'] !== $post['passwordRepeat'] ) {
            return $this->sendFailResponse('01', 'passwords_not_same');
        }

        $count = count($post);
        if (!empty($post)) {
            $saved = 0;
            $saved += intval($this->User->editPassword($ID, $post['password']));

            if ($saved > 0) {
                $data['response'] = true;
                $data['info'] = 'Saved: ' . $saved . ' fields.';
                $data['countUpdated'] = $saved;
            } else {
                $data = $this->sendFailResponse('03');
            }
        } else {
            $data = $this->sendFailResponse('01');
        }
        return $data;
    }

    /**
     * @return mixed
     * @throws Exception
     */
    public function post_userRegister()
    {

        $email = $this->Data->getPost('user');
        $password = $this->Data->getPost('pass');
        $password_confirm = $this->Data->getPost('pass_confirm');
        $firstname = $this->Data->getPost('name');
        $lastname = $this->Data->getPost('lastname');
        $group = $this->Data->getPost('group');
        $post = $this->Data->getAllPost();

        $this->Setting->setModule('additionalSettings');
        $this->Setting->setDomainID($this->getDomainID());
        $this->Setting->setLang(NULL);

        $captchaPrivateKey = $this->Setting->getValue('captchaPrivateKey');

        if( $captchaPrivateKey ) {

            $captchaResponse = $post['captchaResponse'];

            $captchaVerify = $this->Standard->sendCaptchaVerify($captchaPrivateKey, $captchaResponse);

            if (!isset($captchaVerify['success']) || $captchaVerify['success'] === false) {
                return $this->sendFailResponse('19', 'captcha_not_valid');
            }
        }

        $freeEmail = $this->User->freeEmail($email);

        if (!$freeEmail) {
            return array('response' => false, 'info' => 'account_with_that_email_exist');
        }

        $promotions = $this->Data->getPost('promotions');

        $oneTimeRegister = $this->Data->getPost('oneTimeUser');

        $this->Setting->setLang(NULL);
        $this->Setting->setDomainID($this->getDomainID());
        $this->Setting->setModule('additionalSettings');

        $onlyForCompanies = $this->Setting->getValue('onlyForCompanies');

        $hasDelAddress = $this->Data->getPost('hasDelAddress');
        $hasFvAddress = $this->Data->getPost('hasFvAddress');

        // regularAddress
        $address['name'] = $firstname;
        $address['lastname'] = $lastname;
        $address['companyName'] = $this->Data->getPost('companyName');
        $address['street'] = $this->Data->getPost('ad_street');
        $address['house'] = $this->Data->getPost('ad_house');
        $address['apartment'] = $this->Data->getPost('ad_apartment');
        $address['zipcode'] = $this->Data->getPost('ad_zipcode');
        $address['city'] = $this->Data->getPost('ad_city');
        $address['areaCode'] = $this->Data->getPost('ad_areaCode');
        $address['telephone'] = $this->Data->getPost('ad_telephone');
        $address['countryCode'] = $this->Data->getPost('ad_countryCode');

        // deliveryAddress
        $deliveryAddress['name'] = $this->Data->getPost('del_name');
        $deliveryAddress['lastname'] = $this->Data->getPost('del_lastname');
        $deliveryAddress['companyName'] = $this->Data->getPost('del_companyName');
        $deliveryAddress['street'] = $this->Data->getPost('del_street');
        $deliveryAddress['house'] = $this->Data->getPost('del_house');
        $deliveryAddress['apartment'] = $this->Data->getPost('del_apartment');
        $deliveryAddress['zipcode'] = $this->Data->getPost('del_zipcode');
        $deliveryAddress['city'] = $this->Data->getPost('del_city');
        $deliveryAddress['areaCode'] = $this->Data->getPost('del_areaCode');
        $deliveryAddress['telephone'] = $this->Data->getPost('del_telephone');
        $deliveryAddress['countryCode'] = $this->Data->getPost('del_countryCode');

        // invoiceAddress
        $fvAddress['name'] = $this->Data->getPost('fv_name');
        $fvAddress['lastname'] = $this->Data->getPost('fv_lastname');
        $fvAddress['companyName'] = $this->Data->getPost('fv_companyName');
        $fvAddress['street'] = $this->Data->getPost('fv_street');
        $fvAddress['house'] = $this->Data->getPost('fv_house');
        $fvAddress['apartment'] = $this->Data->getPost('fv_apartment');
        $fvAddress['zipcode'] = $this->Data->getPost('fv_zipcode');
        $fvAddress['city'] = $this->Data->getPost('fv_city');
        $fvAddress['nip'] = $this->Data->getPost('fv_nip');
        $fvAddress['countryCode'] = $this->Data->getPost('fv_countryCode');

        if( $onlyForCompanies && intval($hasFvAddress) == 0 ) {
            $fvAddress = $address;
            $fvAddress['nip'] = $this->Data->getPost('nip');
            $hasFvAddress = 1;
        }

        if (!$group) {
            $group = 0;
        }

        try {
            if (intval($oneTimeRegister) == 1) {
                $validAddress = true;
            } else {
                $validAddress = $this->_checkAddress($address);
            }
        } catch (Exception $e) {
            $data['info']['address'] = $e->getMessage();
            $validAddress = false;
        }

        if (intval($hasDelAddress) == 1) {
            try {
                $validDelAddress = $this->_checkAddress($address);
            } catch (Exception $e) {
                $data['info']['deliveryAddress'] = $e->getMessage();
                $validDelAddress = false;
            }
        } else {
            $validDelAddress = true;
        }

        if (intval($hasFvAddress) == 1) {
            try {
                $validFvAddress = $this->_checkAddress($fvAddress);
            } catch (Exception $e) {
                $validFvAddress = false;
                $data['info']['fvAddress'] = $e->getMessage();
            }
        } else {
            $validFvAddress = true;
        }

        if (intval($oneTimeRegister) == 1) {
            $password = TEMP_PASS;
            $password_confirm = TEMP_PASS;
        }

        if( $oneTimeRegister && !$firstname ) {
            $firstname = '-';
        }

        if ($email && $password && $firstname && ($password == $password_confirm) && $validFvAddress && $validDelAddress) {
            try {
                $userID = $this->User->addSimple($email, $firstname, $password);

                if( $userID > 0 ) {
                    $this->User->update($userID, 'domainID', $this->getDomainID());
                    if( $lastname ) {
                        $this->User->update($userID, 'lastname', $lastname);
                    }
                    if( $address['telephone'] ) {
                        $this->User->update($userID, 'telephone', $address['telephone']);
                    }
                    if( $address['areaCode'] ) {
                        $this->User->update($userID, 'areaCode', $address['areaCode']);
                    }
                    if( $address['countryCode'] ) {
                        $this->User->update($userID, 'countryCode', $address['countryCode']);
                    }
                } else {
                    $data['error'] = $this->User->getDbError();
                    $data['info'] = 'error_when_saving_data';
                }

            } catch (Exception $e) {
                $data['info'] = $e->getMessage();
            }
        } else {
            if (!$email || !$password || !$firstname ) {
                $data['info'] = 'Enter required fields';
            }
            if ($password != $password_confirm) {
                $data['info'] = 'Passwords not match';
            }
        }

        if ($userID > 0) {

            $this->Setting->setModule('general');
            $this->Setting->setDomainID(NULL);
            $this->Setting->setLang(NULL);
            $defaultUserType = $this->Setting->getValue('defaultUserType');

            if ($defaultUserType) {
                $this->UserOption->set($userID, array('userTypeID' => $defaultUserType));
            }

            if( $validAddress ) {
                $addressID = $this->Address->create($address);
                if (intval($addressID) > 0) {
                    $params['type'] = 1;
                    $params['userID'] = $userID;
                    $params['addressID'] = $addressID;
                    $params['default'] = 1;
                    $joinAddressID = $this->Address->createJoin($params);
                    unset($params);
                }

                if ($addressID) {
                    $this->User->update($userID, 'areaCode', $address['ad_areaCode']);
                    $this->User->update($userID, 'telephone', $address['ad_telephone']);
                }

                if (intval($addressID) > 0) {
                    $data['address'] = $this->Address->get('ID', $addressID);
                }
            }

            if (intval($hasDelAddress) > 0 && $validDelAddress) {
                $deliveryAddressID = $this->Address->create($deliveryAddress);
                if (intval($deliveryAddressID) > 0) {
                    unset($params);
                    $params['type'] = 1;
                    $params['userID'] = $userID;
                    $params['addressID'] = $deliveryAddressID;
                    $joinDelAddressID = $this->Address->createJoin($params);
                    unset($params);
                }
            }

            if (intval($hasFvAddress) > 0 && $validFvAddress) {
                $fvAddressID = $this->Address->create($fvAddress);
                if (intval($fvAddressID) > 0) {
                    unset($params);
                    $params['type'] = 2;
                    $params['userID'] = $userID;
                    $params['addressID'] = $fvAddressID;
                    $params['default'] = 1;
                    $joinFvAddressID = $this->Address->createJoin($params);
                    unset($params);
                }
            }

            $data['user'] = $this->User->get('ID', $userID);

            if (intval($fvAddressID) > 0) {
                $data['fvAddress'] = $this->Address->get('ID', $fvAddressID);
            }

            $this->Setting->setModule('acl');
            $this->Setting->setDomainID(NULL);
            $this->Setting->setLang(NULL);
            $defaultGroup = $this->Setting->getValue('defaultGroup');
            $group = $this->Group->get('ID', $defaultGroup);

            if ($group) {
                $data['createGroup'] = $this->UserGroup->customCreate($group['ID'], $userID);
            }

            if (intval($oneTimeRegister) == 1) {
                $this->User->editPassword($data['user']['ID'], $data['user']['ID']);
                $this->User->update($data['user']['ID'], 'user', $data['user']['user'] . '_' . $data['user']['ID']);
                $this->User->update($data['user']['ID'], 'onetime', 1);
            }

            if ($promotions) {
                $this->User->update($data['user']['ID'], 'advertising', 1);
            }

            if (filter_var($email, FILTER_VALIDATE_EMAIL) !== false && intval($oneTimeRegister) == 0) {

                $send = $this->sendRegisterEmail($email, $firstname, $userID);

            } else {
                $this->debug('Error with email: ' . $email);
            }

            $data['response'] = true;
            return $data;
        } else {
            $post = $this->Data->getAllPost();
            if (empty($post)) {
                $data['info'] = 'Pusty Post';
                $data['errorCode'] = '01';
            }
            $data['errorCode'] = '02';
            $data['httpCode'] = 400;
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @param $email
     * @param $firstName
     * @param $userID
     * @param bool $lang
     * @return array|bool
     */
    private function sendRegisterEmail($email, $firstName, $userID, $lang = false)
    {
        $this->Mail->setBind('user_name', $firstName);
        $this->Mail->setBind('user_id', $userID);

        $this->Setting->setDomainID($this->getDomainID());
        $this->Setting->setLang(NULL);
        $this->Setting->setModule('registerCoupon');
        $registerCoupon = $this->Setting->getAllByModule();

        if( $registerCoupon['value']['value'] > 0 && $registerCoupon['expiresDays']['value'] > 0 ) {

            $couponData['expires'] =  strtotime('+'.intval($registerCoupon['expiresDays']['value']).' days');
            $couponData['multiUser'] = $registerCoupon['multiUser']['value'];
            $couponData['percent'] = $registerCoupon['percent']['value'];
            $couponData['value'] = $registerCoupon['value']['value'];
            $couponData['value'] = $registerCoupon['value']['value'];

            if( $registerCoupon['groupID']['value'] > 0 ) {
                $couponData['products']['groupID'] = $registerCoupon['groupID']['value'];
            }
            if( $registerCoupon['typeID']['value'] > 0 ) {
                $couponData['products']['typeID'] = $registerCoupon['typeID']['value'];
            }
            if( $registerCoupon['formatID']['value'] > 0 ) {
                $couponData['products']['formatID'] = $registerCoupon['formatID']['value'];
            }

            $couponID = $this->CouponManipulation->generateID();
            $added = $this->CouponManipulation->addOne($couponData, $couponID);
            if( $added ) {
                $this->Mail->setBind('coupon_id', $added['ID']);
            } else {
                $this->Mail->setBind('coupon_id', '');
            }
        } else {
            $this->Mail->setBind('coupon_id', '');
        }

        $send = false;

        try {
            $send = $this->Mail->sendMail($email, $firstName, 'register', $lang);
            $this->debug('register email: ' . var_export($send, true));
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }

        return $send;
    }

    /**
     * @return mixed
     */
    public function post_userSimpleRegister()
    {

        $this->Setting->setLang(NULL);

        $email = $this->Data->getPost('user');
        $firstname = $this->Data->getPost('name');
        $lastname = $this->Data->getPost('lastname');

        $freeEmail = $this->User->freeEmail($email);
        if( !$freeEmail ) {
            return $this->sendFailResponse('13', 'Email zajęty');
        }
        $group = 0;
        $password = TEMP_PASS;
        $password_confirm = TEMP_PASS;

        $data['response'] = false;

        $userID = null;

        if ($email && $password && $firstname && $lastname && ($password == $password_confirm)) {
            try {
                $userID = $this->User->customCreate($email, $password, $firstname, $lastname, $group);

                if( $userID > 0 ) {
                    $this->User->update($userID, 'login', $email);
                    $this->User->update($userID, 'domainID', $this->getDomainID());
                }

            } catch (Exception $e) {
                $data['info'] = $e->getMessage();
            }
        } else {
            if (!$email || !$password || !$firstname || !$lastname) {
                $data['info'] = 'Enter required fields';
            }
            if ($password != $password_confirm) {
                $data['info'] = 'Passwords not match';
            }
        }

        if( $userID > 0 ) {
            $defaultUserType = $this->Setting->getValue('defaultUserType');

            if ($defaultUserType) {
                $this->UserOption->set($userID, array('userTypeID' => $defaultUserType));
            }

            if (filter_var($email, FILTER_VALIDATE_EMAIL) !== false) {

                $userOption = $this->UserOption->get('uID', $userID);

                $lang = lang;
                if( $userOption && $userOption['lang'] ) {
                    $lang = $userOption['lang'];
                }

                $send = $this->sendRegisterEmail($email, $firstname, $userID, $lang);

            } else {
                $this->debug('Error with email: ' . $email);
            }

            $data['response'] = true;
        }

        return $data;
    }

    public function passForget()
    {

    }

    /**
     * @return array
     */
    public function post_passForget()
    {
        $data = array();
        $data['user'] = $this->Data->getPost('email');
        $newPass = substr(md5(time()), 10, 10);

        $hashPass = hash('sha512', $newPass . Auth::salt);

        $user = $this->User->getByEmail($data['user']);

        if (!$user) {
            return $this->sendFailResponse('18');
        }

        $send = false;

        if (filter_var($data['user'], FILTER_VALIDATE_EMAIL) !== false) {

            $oldPass = $user['pass'];

            $changePass = $this->User->setPass($data['user'], $hashPass, $this->getDomainID());

            $userOption = $this->UserOption->get('uID', $user['ID']);
            $lang = lang;

            if( $userOption && $userOption['lang'] ) {
                $lang = $userOption['lang'];
            }

            $this->Mail->setBind('first_name', $user['name']);
            $this->Mail->setBind('new_password', $newPass);
            if ($changePass) {
                try {
                    $send = $this->Mail->sendMail($user['user'], $user['name'], 'newPassword', $lang);
                } catch (Exception $e) {
                    $this->debug('send mail exception: '. $e->getMessage());
                }

            }

            if (!$send) {
                $this->User->update($user['ID'], 'pass', $oldPass);
            }
        } else {
            return $this->sendFailResponse('07', 'Email problem');
        }


        if ($changePass && $send) {
            $data['response'] = true;
        } else {
            return $this->sendFailResponse('03');
        }

        return $data;

    }

    /**
     * Address or list of addresses for user
     *
     * @method address
     *
     * @param integer $userID
     * @param array $params
     *
     * @return array
     *
     */
    public function address($userID, $params)
    {

        $type = 1;
        if (isset($params['type'])) {
            $type = $params['type'];
        }

        $user = $this->Auth->getLoggedUser();
        if ($userID && $this->Acl->isSeller($user)) {
            $user['ID'] = $userID;
        }
        $data = $this->Address->getByUser($user['ID'], $type);

        if (empty($data)) {
            $data = array();
        }

        foreach($data as $key => $address) {
            if( !$address['addressName'] ) {
                $addressName = $address['city'] . ',' . ' ' . $address['street'] . ' ' . $address['house'];
                if (strlen($address['apartment']) > 0) {
                    $addressName .= '/' . $address['apartment'];
                }
                $data[$key]['addressName'] = $addressName;
            }
        }


        return $data;
    }

    /**
     * @param null $userID
     * @return mixed
     */
    private function _addAddress($userID = NULL)
    {
        // adres
        $address['addressName'] = $this->Data->getPost('addressName');
        $address['name'] = $this->Data->getPost('name');
        $address['lastname'] = $this->Data->getPost('lastname');
        $address['companyName'] = $this->Data->getPost('companyName');
        $address['street'] = $this->Data->getPost('street');
        $address['house'] = $this->Data->getPost('house');
        $address['apartment'] = $this->Data->getPost('apartment');
        $address['zipcode'] = $this->Data->getPost('zipcode');
        $address['city'] = $this->Data->getPost('city');
        $address['areaCode'] = $this->Data->getPost('areaCode');
        $address['telephone'] = $this->Data->getPost('telephone');
        $address['nip'] = $this->Data->getPost('nip');
        $address['countryCode'] = $this->Data->getPost('countryCode');
        $addressDefault = $this->Data->getPost('default');

        $addressType = $this->Data->getPost('type');

        try {
            $validAddress = $this->_checkAddress($address);
        } catch (Exception $e) {
            $info = $e->getMessage();
            $validAddress = false;
            return $this->sendFailResponse('01', $info);
        }

        if ($validAddress) {
            $addressID = $this->Address->create($address);
            if (intval($addressID) > 0) {
                if (strlen($address['addressName']) == 0) {
                    $newName = $address['city'] . ' - ' . $address['street'] . ' ';
                    $newName .= $address['house'];
                    if (strlen($address['apartment']) > 0) {
                        $newName .= '/' . $address['apartment'];
                    }
                    $this->Address->update($addressID, 'addressName', $newName);
                }

                $params['type'] = $addressType;
                $params['userID'] = $userID;
                $params['addressID'] = $addressID;

                $defaultExist = intval($this->Address->defaultExist($userID, $addressType));

                if ($defaultExist === 0) {
                    $params['default'] = 1;
                } else {
                    if (intval($addressDefault) === 1) {
                        $this->Address->removeDefault($userID, $addressType);
                        $params['default'] = 1;
                    } else {
                        $params['default'] = 0;
                    }
                }

                $joinAddressID = $this->Address->createJoin($params);
                $data['addressID'] = $addressID;
                $data['response'] = true;
                $data['item'] = $this->Address->get('ID', $addressID);
                $data['item']['default'] = $addressDefault;
                unset($params);

            } else {
                return $this->sendFailResponse('03');
            }

        } else {
            return $this->sendFailResponse('01');
        }
        return $data;
    }

    /**
     * Add address
     *
     * @method post_address
     *
     * @param int $userID
     * @param {Integer} $type POST 1 - receiver address, 2 - invoice
     * @param {String} $name POST
     * @param {String} $lastname POST
     * @param {String} $companyName POST
     * @param {String} $street POST
     * @param {String} $house POST
     * @param {String} $apartment POST
     * @param {String} $zipcode POST
     * @param {String} $city POST
     * @param {String} $telephone POST
     * @param {String} $nip POST
     *
     * @return array
     *
     */
    public function post_address($userID)
    {

        $user = $this->Auth->getLoggedUser();

        if ($userID != $user['ID'] && ($user['super'] == 1 || $this->canEditOtherAddress())) {
            $userToAdd = $userID;
        } elseif ($userID == $user['ID']) {
            $userToAdd = $user['ID'];
        } else {
            return $this->sendFailResponse('12');
        }

        return $this->_addAddress($userToAdd);

    }

    /**
     * @return mixed
     */
    protected function _editAddress()
    {

        $post = $this->Data->getAllPost();

        $sessionUser = $this->Auth->getLoggedUser();

        if ($post['userID'] != $sessionUser['ID'] && ($sessionUser['super'] == 1 || $this->canEditOtherAddress())) {
            $user = $this->User->getOne($post['userID']);
        } elseif ($post['userID'] == $sessionUser['ID']) {
            $user = $this->User->getOne($sessionUser['ID']);
        } else {
            return $this->sendFailResponse('12');
        }

        $goodKeys = array('name', 'lastname', 'companyName',
            'street', 'house', 'apartment', 'zipcode',
            'city', 'areaCode', 'telephone', 'nip',
            'addressName', 'countryCode');

        $return['response'] = false;

        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }

        $one = $this->Address->getJoin($ID, $user['ID']);

        $updated = 0;
        foreach ($post as $key => $value) {
            if (!in_array($key, $goodKeys)) {
                continue;
            }

            if ($key === 'addressName' && strlen($value) == 0) {
                $newName = $post['city'] . ' - ' . $post['street'] . ' ';
                $newName .= $post['house'];
                if (strlen($post['apartment']) > 0) {
                    $newName .= '/' . $post['apartment'];
                }

                $value = $newName;
            }

            $updated += intval($this->Address->update($ID, $key, $value));
        }

        if (isset($post['default']) && !empty($post['default']) && $post['default'] == 1) {

            $this->Address->removeDefault($user['ID'], $one['type']);
            $this->Address->setDefault($ID, $user['ID'], $post['default']);

        }

        if ($updated > 0) {
            $return['item'] = $this->Address->get('ID', $ID);
            $return['response'] = true;
        }

        return $return;

    }


    /**
     * Edit address
     *
     * @method put_address
     *
     * @param {Integer} $ID
     * @param {String} $name POST
     * @para, {String} $lastname POST
     * @param {String} $companyName POST
     * @param {String} $street POST
     * @param {String} $house POST
     * @param {String} $apartment POST
     * @param {String} $zipcode POST
     * @param {String} $city POST
     * @param {String} $telephone POST
     * @param {String} $nip POST
     *
     * @return {Array}
     */
    public function put_address()
    {
        return $this->_editAddress();
    }

    /**
     * Niestandardowe adres
     *
     * @method patch_address
     *
     * @param int $userID
     *
     * @return array
     */
    public function patch_address($userID)
    {

        $user = $this->Auth->getLoggedUser();

        if ($user['ID'] != $userID && $user['super'] != 1) {
            return $this->sendFailResponse('12');
        }

        $action = $this->Data->getPost('action');
        $ID = $this->Data->getPost('ID');

        if ($action == 'setDefault') {

            $default = $this->Data->getPost('default');

            $join = $this->Address->getJoin($ID);
            $data['response'] = false;
            if ($this->Address->removeDefault($join['userID'], $join['type'])) {
                $data['response'] = $this->Address->setDefault($ID, $user['ID'], $default);
            }

        } else {
            return $this->sendFailResponse('13');
        }

        return $data;

    }

    /**
     * Delete address
     *
     * @method delete_address
     *
     * @param int $userID
     * @param int $ID
     *
     * @return array
     */
    public function delete_address($userID, $ID)
    {
        $data['response'] = false;
        $data['ID'] = $ID;

        $user = $this->Auth->getLoggedUser();
        if (intval($userID) <= 0) {
            $userID = $user['ID'];
        }

        $one = $this->Address->getJoin($ID, $userID);

        if (intval($ID) > 0) {
            if ($this->Address->delete('ID', $ID)) {
                $this->Address->removeJoin($ID);

                if (intval($one['default']) === 1) {
                    $list = $this->Address->getByUser($userID, $one['type']);
                    $current = current($list);
                    $this->Address->setDefault($current['ID'], $current['userID'], 1);
                }

                $data['response'] = true;
            }
            return $data;
        } else {
            $data = $this->sendFailResponse('04');
            return $data;
        }
    }

    /**
     * @param $userID
     * @return mixed
     */
    private function _editUserOption($userID)
    {
        $goodFields = array(
            'userTypeID',
            'currency',
            'lang',
            'discountGroupID',
            'sellerID',
            'creditLimit'
        );

        $post = $this->Data->getAllPost();
        $data['response'] = false;

        if(!$userID) {
            $data['info'] = 'UserID empty';
            return $data;
        }

        $userInfo = $this->Auth->getLoggedUser();

        if ($userInfo['ID'] == $userID || $userInfo['super'] == 1 || $this->canEditOtherOptions()) {
            // Edycja swoich danych
        } else {
            return $this->sendFailResponse('14');
        }

        $count = count($post);

        $userOption = $this->UserOption->get('uID', $userID);
        if (!$userOption) {
            $params['uID'] = $userID;
            $userOptionID = $this->UserOption->create($params);
        } else {
            $userOptionID = $userOption['ID'];
        }

        if (!empty($post)) {
            $saved = 0;

            foreach ($post as $key => $value) {
                if (in_array($key, $goodFields)) {
                    if ($key == 'discountGroupID' && intval($value) < 1) {
                        $value = NULL;
                    }
                    if ($key == 'sellerID' && intval($value) < 1) {
                        $value = NULL;
                    }
                    $saved += intval($this->UserOption->update($userOptionID, $key, $value));
                }
            }
            if ($saved == $count) {
                $data['response'] = true;
                $data['info'] = 'Saved: ' . $count . ' fields.';
            } else {
                return $this->sendFailResponse('03');
            }
        } else {
            $data['info'] = 'Pusty POST';
        }
        return $data;
    }


    /**
     * User options
     *
     *
     * @method patch_userOptions
     *
     * @param int $userID
     * @return array
     */
    public function patch_userOptions($userID)
    {
        return $this->_editUserOption($userID);
    }

    /**
     * @param $userID
     * @return mixed
     */
    public function patch_userType($userID)
    {
        $goodFields = array('userTypeID');
        $post = $this->Data->getAllPost();
        $data['response'] = false;

        $userInfo = $this->Auth->getLoggedUser();
        $user = $this->User->get('ID', $userInfo['ID']);

        if ( $userInfo['super'] != 1 && !$this->Acl->canEditOtherOptions($userInfo) ) {
            return $this->sendFailResponse('07');
        }

        $count = count($post);

        $userOption = $this->UserOption->get('uID', $userID);
        if (!$userOption) {
            $params['uID'] = $userID;
            $userOptionID = $this->UserOption->create($params);
        } else {
            $userOptionID = $userOption['ID'];
        }

        if (!empty($post)) {
            $saved = 0;

            foreach ($post as $key => $value) {
                if (in_array($key, $goodFields)) {
                    $saved += intval($this->UserOption->update($userOptionID, $key, $value));
                }
            }
            if ($saved == $count) {
                $data['response'] = true;
                $data['info'] = 'Saved: ' . $count . ' fields.';
            } else {
                return $this->sendFailResponse('10');
            }
        } else {
            $data['info'] = 'Pusty POST';
        }
        return $data;

    }

    /**
     * users list with filters
     *
     * @method index
     *
     * @param array|null $params filtry
     * @return array
     */
    public function special($params = NULL)
    {
        $limit = 30;
        if (isset($params['limit'])) {
            $limit = $params['limit'];
        }
        $offset = 0;
        if (isset($params['offset'])) {
            $offset = $params['offset'];
        }

        $sortBy[0] = '-ID';
        if (isset($params['sort'])) {
            $sortBy = explode('|', $params['sort']);
        }

        $params['deleted'] = 0;

        $configs = $this->getConfigs();
        $configs['special'] = array('type' => 'string', 'table' => 'users', 'field' => 'special', 'sign' => $this->Filter->signs['e'], 'default' => 1);

        $filters = $this->Filter->prepare($configs, $params);

        $list = $this->User->getList($filters, $offset, $limit, $sortBy);
        $addressList = array();
        $fvAddressList = array();
        $users = array();
        foreach ($list as $row) {
            if (intval($row['normalAddressID']) > 0) {
                $addressList[] = $row['normalAddressID'];
            }
            if (intval($row['fvAddressID']) > 0) {
                $fvAddressList[] = $row['fvAddressID'];
            }
            $users[] = $row['ID'];
        }

        $addressByList = $this->Address->getByList($addressList);
        $fvAddressByList = $this->Address->getByList($fvAddressList);
        $userOptions = $this->UserOption->getByList($users);

        foreach ($list as $key => $value) {
            $list[$key]['address'] = isset($addressByList[$value['normalAddressID']]) ? $addressByList[$value['normalAddressID']] : array();
            $list[$key]['fvAddress'] = isset($fvAddressByList[$value['fvAddressID']]) ? $fvAddressByList[$value['fvAddressID']] : array();
            if (isset($userOptions[$value['ID']])) {
                $list[$key]['userTypeID'] = $userOptions[$value['ID']]['userTypeID'];
                $list[$key]['options'] = $userOptions[$value['ID']];
            } else {
                $list[$key]['userTypeID'] = NULL;
                $list[$key]['options'] = NULL;
            }
            unset($list[$key]['stats']['uID']);
        }

        if (empty($list)) {
            $list = array();
        }

        return $list;
    }

    /**
     * count all user with filters
     *
     * @method count
     *
     * @param array $params filters
     * @return array
     */
    public function countSpecial($params = NULL)
    {
        $configs = $this->getConfigs();
        $configs['special'] = array('type' => 'string', 'table' => 'users', 'field' => 'special', 'sign' => $this->Filter->signs['e'], 'default' => 1);

        $params['deleted'] = 0;

        $filters = $this->Filter->prepare($configs, $params);

        $count = $this->User->count($filters);

        return array('count' => $count);
    }

    /**
     * @param null $ID
     * @return mixed
     */
    public function patch_special($ID = NULL)
    {

        $goodFields = array(
            'user',
            'enabled',
            'name',
            'lastname',
        );
        $post = $this->Data->getAllPost();
        if (isset($post['ID']) && intval($post['ID']) > 0) {
            $ID = $post['ID'];
            unset($post['ID']);
        }
        $data['response'] = false;

        $count = count($post);
        if (!empty($post)) {
            $saved = 0;
            foreach ($post as $key => $value) {
                if (in_array($key, $goodFields)) {
                    $saved += intval($this->User->update($ID, $key, $value));
                }
            }
            if ($saved > 0) {
                $data['response'] = true;
                $data['info'] = 'Zapisano: ' . $count . ' pĂłĹ‚.';
            } else {
                $data['httpCode'] = 400;
                $data['errorCode'] = '03';
                $data['info'] = 'Brak zapisanych pĂłl';
            }
        } else {
            $data['httpCode'] = 400;
            $data['errorCode'] = '01';
            $data['info'] = 'Pusty POST';
        }
        return $data;
    }

    /**
     * @param $userID
     * @return array
     */
    public function delete_index($userID)
    {

        $user = $this->User->getOne($userID);
        $data['response'] = false;

        if (!$user) {
            return $this->sendFailResponse('07', 'No user');
        }

        if ($this->User->update($user['ID'], 'user', 'DEL_' . $user['ID'] . '_' . $user['user'])) {
            $this->User->update($user['ID'], 'deleted', 1);
            $this->User->update($user['ID'], 'name', 'DELETED');
            $this->User->update($user['ID'], 'lastname', 'DELETED');

            $this->Address->delete('ID', $user['addressID']);
            $data['response'] = true;
        } else {
            $this->sendFailResponse('05');
        }
        return $data;
        // @TODO delete every relation with user
    }

    /**
     * @return mixed
     */
    public function post_special()
    {

        $email = $this->Data->getPost('user');
        $password = $this->Data->getPost('pass');
        $password_confirm = $this->Data->getPost('pass_confirm');
        $firstname = $this->Data->getPost('name');
        $lastname = $this->Data->getPost('lastname');
        $group = $this->Data->getPost('group');
        $special = $this->Data->getPost('special');

        $userTypeID = $this->Data->getPost('userTypeID');

        if (!$group) {
            $group = 0;
        }

        if ($email && $password && ($password == $password_confirm)) {
            try {
                if ($special === NULL) {
                    $special = 0;
                }
                $userID = $this->User->customCreate($email, $password, $firstname, $lastname, $group, $special);
            } catch (Exception $e) {
                $data['info'] = $e->getMessage();
            }
        } else {
            if (!$email || !$password || !$firstname || !$lastname) {
                $data['info'] = 'This fields are required: ' . implode(',', compact('email', 'password', 'firstname', 'lastname'));
            }
            if ($password != $password_confirm) {
                $data['info'] = 'Passowords not match.';
            }

        }

        if ($userID > 0) {

            $this->User->update($userID, 'domainID', $this->getDomainID());

            if ($userTypeID) {

                $this->UserOption->set($userID, array('userTypeID' => $userTypeID));

            } else {
                $defaultUserType = $this->Setting->getValue('defaultUserType');
                if ($defaultUserType) {
                    $this->UserOption->set($userID, array('userTypeID' => $defaultUserType));
                }
            }

            $data['user'] = $this->User->get('ID', $userID);


            $data['response'] = true;
            return $data;
        } else {
            $post = $this->Data->getAllPost();
            if (empty($post)) {
                $data['info'] = 'Pusty Post';
                $data['errorCode'] = '01';
            }
            $data['errorCode'] = '02';
            $data['httpCode'] = 400;
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @return array
     */
    public function canEditOtherAddress()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->canEditOtherAddress($user));
    }

    /**
     * @return array
     */
    public function canRemoveOtherAddress()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->canRemoveOtherAddress($user));
    }

    /**
     * @return array
     */
    public function canAddOtherAddress()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->canAddOtherAddress($user));
    }

    /**
     * @return array
     */
    public function canEditOtherOptions()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->canEditOtherOptions($user));
    }

    public function canEditOtherPassword()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->canEditOtherPassword($user));
    }

    /**
     * @param $uID
     * @return bool
     */
    public function getUser($uID)
    {
        $user = $this->User->getUserByID($uID);

        if ($user) {

            unset($user['pass']);

            $user['address'] = $this->Address->getDefault($uID, 1);
            $user['fvAddress'] = $this->Address->getDefault($uID, 2);

            $userDiscountGroups = $this->UserDiscountGroup->getByUserList(array($uID));

            $unsortedDiscountGroups = $this->DiscountGroup->getAll();

            $discountGroups = array();

            if( $unsortedDiscountGroups ) {
                foreach ($unsortedDiscountGroups as $discountGroup) {
                    $discountGroups[$discountGroup['ID']] = $discountGroup;
                }
            }

            $user['discountGroups'] = array();
            if( isset($userDiscountGroups[$uID]) && is_array($userDiscountGroups[$uID]) ) {
                foreach ($userDiscountGroups[$uID] as $discountGroupID ) {
                    $user['discountGroups'][] = $discountGroups[$discountGroupID];
                }
            }
            return $user;
        } else {
            return $this->sendFailResponse('06');
        }
    }

    /**
     * @param $addressList
     * @return array
     */
    public function addressPublic($addressList)
    {
        if (strlen($addressList) == 0) {
            return array('response' => false, 'addresses' => array());
        }

        $adrExp = explode(',', $addressList);

        $address = $this->Address->getByList($adrExp);

        if (empty($address)) {
            return array('response' => false, 'addresses' => array());
        }
        sort($address);

        return array('response' => true, 'addresses' => $address);
    }

    /**
     * @return array
     */
    public function getUserAddresses()
    {
        $loggedUser = $this->Auth->getLoggedUser();
        $senders = $this->Delivery->getSenderTypes();
        if (!$loggedUser) {
            return array('response' => false, 'addresses' => array(), 'senders' => $senders);
        }
        $addresses = $this->Address->getByUser($loggedUser['ID'], 1);

        if (!$addresses) {
            return array('response' => false, 'addresses' => array(), 'senders' => $senders);
        }

        foreach ($addresses as $keyAddress => $address) {
            $addressName = $address['city'] . ',' . ' ' . $address['street'] . ' ' . $address['house'];
            if (strlen($address['apartment']) > 0) {
                $addressName .= '/' . $address['apartment'];
            }
            $addresses[$keyAddress]['addressName'] = $addressName;
        }

        return array('response' => true, 'addresses' => $addresses, 'senders' => $senders);
    }

    /**
     * @return array
     */
    public function patch_setAddressToUser()
    {

        $post = $this->Data->getAllPost();
        $addresses = $post['addresses'];

        if (empty($addresses) || !is_array($addresses)) {
            return array('response' => false);
        }
        $loggedUser = $this->Auth->getLoggedUser();

        if (!$loggedUser) {
            return array('response' => false);
        }

        $joins = array();
        foreach ($addresses as $aID) {
            $params['type'] = 1;
            $params['userID'] = $loggedUser['ID'];
            $params['addressID'] = $aID;
            $joins[] = $this->Address->createJoin($params);
            unset($params);
        }
        if (!empty($joins)) {
            return array('return' => true, 'joins' => $joins);
        }

        return array('response' => false);
    }

    /**
     * @return mixed
     */
    public function post_addressPublic()
    {
        $loggedUser = $this->Auth->getLoggedUser();

        if( !$loggedUser ) {
            return $this->sendFailResponse('17');
        }

        $data = $this->_addAddress($loggedUser['ID']);
        return $data;
    }

    /**
     * @return array
     */
    public function isEditorAdmin()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->isAdminEditor($user));
    }

    /**
     * @return array
     */
    public function getMyAccount()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function checkOneTimeUser()
    {
        $loggedUser = $this->Auth->getLoggedUser();

        $user = $this->User->getUserByID($loggedUser['ID']);

        if ($user && $user['onetime'] == 1) {
            return array('response' => true);
        }
        return array('response' => false);
    }

    /**
     * @param $userID
     * @return array
     */
    public function getCurrency($userID)
    {

        $userOptions = $this->UserOption->get('uID', $userID);

        if (!$userOptions || $userOptions['currency'] == NULL) {
            return array('response' => false);
        }

        return array('response' => true, 'currencyCode' => $userOptions['currency']);

    }

    /**
     * @return array|bool
     * @TODO search with isSeller role
     */
    public function getUsersByType()
    {
        if (companyID == 195) {
            $aclType = EFOTOGALLERY_SELLER_TYPE;
        } else if (companyID == 280) {
            $aclType = PRINTHIT_SELLER_TYPE;
        } else if (companyID == 35) {
            $aclType = LOCALHOST_SELLER_TYPE;
        } else if (companyID == 25) {
            $aclType = DREAMSOFT_SELLER_TYPE;
        } else if (companyID == 685) {
            $aclType = TOTEMGROUP_SELLER_TYPE;
        } else {
            $aclType = DREAMSOFT_SELLER_TYPE;
        }
        $users = $this->User->getByAclType($aclType);

        return $users;
    }

    /**
     * @return bool
     */
    public function getLoggedUserData()
    {
        $loggedUser = $this->Auth->getLoggedUser();

        if ($loggedUser && $loggedUser['super'] != 1) {

            $user = $loggedUser;
            $user['address'] = $this->Address->getDefault($loggedUser['ID'], 1);
            $user['fvAddress'] = $this->Address->getDefault($loggedUser['ID'], 2);

            $userDiscountGroups = $this->UserDiscountGroup->getByUserList(array($loggedUser['ID']));

            $unsortedDiscountGroups = $this->DiscountGroup->getAll();

            $discountGroups = array();

            if( $unsortedDiscountGroups ) {
                foreach ($unsortedDiscountGroups as $discountGroup) {
                    $discountGroups[$discountGroup['ID']] = $discountGroup;
                }
            }

            $user['discountGroups'] = array();
            if( isset($userDiscountGroups[$loggedUser['ID']]) && is_array($userDiscountGroups[$loggedUser['ID']]) ) {
                foreach ($userDiscountGroups[$loggedUser['ID']] as $discountGroupID ) {
                    $user['discountGroups'][] = $discountGroups[$discountGroupID];
                }
            }
            return $user;
        }

        return $loggedUser;
    }

    /**
     * @return array
     */
    public function importantData() {
        $loggedUser = $this->Auth->getLoggedUser();

        $this->User->setFields(array(
            'ID',
            'user',
            'login',
            'name',
            'lastname',
            'areaCode',
            'telephone',
            'countryCode',
            'advertising',
            'sms'
        ));

        if( !$loggedUser ) {
            return $this->sendFailResponse('17');
        } else {
            $userData = $this->User->get('ID', $loggedUser['ID']);

            return array(
                'login' => $userData['login'],
                'name' => $userData['name'],
                'lastname' => $userData['lastname'],
                'countryCode' => $userData['countryCode'],
                'areaCode' => $userData['areaCode'],
                'telephone' => $userData['telephone'],
                'sms' => $userData['sms'],
                'advertising' => $userData['advertising'],
            );
        }
    }

    public function patch_importantData()
    {
        $post = $this->Data->getAllPost();
        $loggedUser = $this->Auth->getLoggedUser();
        $updated = 0;
        $response = false;

        if( !$loggedUser ) {
            return $this->sendFailResponse('17');
        } else {
            $goodFields = array(
                'ID',
                'user',
                'login',
                'name',
                'lastname',
                'areaCode',
                'telephone',
                'countryCode',
                'advertising',
                'sms'
            );

            foreach($post as $key => $value) {
                if( in_array($key, $goodFields) ) {
                    $updated += intval($this->User->update($loggedUser['ID'], $key, $value));
                }
            }
        }

        if( $updated > 0 ) {
            $response = true;
        }

        return array('response' => $response, 'updated' => $updated);
    }

}
