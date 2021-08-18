<?php

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;
use DreamSoft\Libs\Auth;
use DreamSoft\Models\Acl\Permission;
use DreamSoft\Models\Acl\Role;
use DreamSoft\Models\Acl\RolePerm;
use DreamSoft\Models\Group\GroupRole;
use DreamSoft\Models\User\UserRole;
use DreamSoft\Models\User\UserOption;
use DreamSoft\Models\UserType\UserTypeGroup;
use DreamSoft\Models\UserType\UserTypeRole;

class Acl extends Component
{

    public $useModels = array();

    /**
     * @var Permission
     */
    protected $Permission;
    /**
     * @var UserRole
     */
    protected $UserRole;
    /**
     * @var GroupRole
     */
    protected $GroupRole;
    /**
     * @var UserOption
     */
    protected $UserOption;
    /**
     * @var UserTypeGroup
     */
    protected $UserTypeGroup;
    /**
     * @var UserTypeRole
     */
    protected $UserTypeRole;

    /**
     * @var array
     */
    protected $allPerms;
    /**
     * @var array
     */
    protected $allRoles;

    /**
     * @var Auth
     */
    public $Auth;

    /**
     * @var Role
     */
    protected $Role;
    /**
     * @var RolePerm
     */
    protected $RolePerm;

    /**
     * Acl constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->Permission = Permission::getInstance();
        $this->Role = Role::getInstance();
        $this->UserRole = UserRole::getInstance();
        $this->GroupRole = GroupRole::getInstance();
        $this->UserOption = UserOption::getInstance();
        $this->UserTypeGroup = UserTypeGroup::getInstance();
        $this->UserTypeRole = UserTypeRole::getInstance();
        $this->RolePerm = RolePerm::getInstance();
        $this->Auth = new Auth();
        $this->allPerms = $this->_getAllPerms();
        $this->allRoles = $this->_getAllRoles();
    }

    /**
     * @return array
     */
    private function _getAllPerms()
    {
        $all = $this->Permission->getAll();
        $result = array();
        if ($all) {
            foreach ($all as $key => $value) {
                $result[$value['ID']] = $value;
            }
        }
        return $result;
    }

    /**
     * @return array
     */
    private function _getAllRoles()
    {
        $all = $this->Role->getAll();
        $result = array();
        if ($all) {
            foreach ($all as $key => $value) {
                $result[$value['ID']] = $value;
            }
        }
        return $result;
    }

    /**
     * @param $controller
     * @param $action
     * @param null $package
     * @param null $user
     * @return bool
     */
    public function checkPerms($controller, $action, $package = NULL, $user = NULL)
    {

        $perm = $this->Permission->getByMethod($controller, $action, $package);

        if ($perm['default'] == 1) {
            return true;
        }

        if (!$user['ID']) {
            return false;
        }

        if (isset($user['super']) && $user['super'] == 1) {
            return true;
        }

        $userRoles = $this->UserRole->getSelectedRoles($user['ID']);
        $userPerms = $this->RolePerm->getPermsFromRoles($userRoles);

        if (!empty($userPerms)) {

            foreach ($userPerms as $permissionID) {
                $actPerm = $this->allPerms[$permissionID];

                if (ucfirst($actPerm['controller']) == $controller && ($package == NULL || $actPerm['package'] == $package) &&
                    ($actPerm['action'] == $action || $actPerm['action'] == '*')
                ) {
                    return true;
                }
            }
        }

        $roles = $this->GroupRole->getRolesByGroups($user['ID']);
        $perms = $this->RolePerm->getPermsFromRoles($roles);

        if (!empty($perms)) {
            foreach ($perms as $permID) {

                $actPerm = $this->allPerms[$permID];

                if (ucfirst($actPerm['controller']) == $controller && ($package == NULL || $actPerm['package'] == $package) &&
                    ($actPerm['action'] == $action || $actPerm['action'] == '*')
                ) {
                    return true;
                }
            }
        }

        $userOption = $this->UserOption->get('uID', $user['ID']);
        if (intval($userOption['userTypeID']) > 0) {

            $roles = $this->UserTypeRole->getUserTypeRoles($userOption['userTypeID']);
            $userTypePerms = $this->RolePerm->getPermsFromRoles($roles);

            if (!empty($userTypePerms)) {
                foreach ($userTypePerms as $permID) {

                    $actPerm = NULL;

                    if( array_key_exists($permID, $this->allPerms) ) {
                        $actPerm = $this->allPerms[$permID];
                    }

                    if (is_array($actPerm) && ucfirst($actPerm['controller']) == $controller &&
                        ($package == NULL || $actPerm['package'] == $package) &&
                        ($actPerm['action'] == $action || $actPerm['action'] == '*')
                    ) {
                        return true;
                    }
                }
            }

            $roles = $this->UserTypeGroup->getUserTypeRoles($userOption['userTypeID']);
            $groupTypePerms = $this->RolePerm->getPermsFromRoles($roles);

            if (!empty($groupTypePerms)) {
                foreach ($groupTypePerms as $permID) {

                    $actPerm = $this->allPerms[$permID];

                    if (ucfirst($actPerm['controller']) == $controller && ($package == NULL || $actPerm['package'] == $package) &&
                        ($actPerm['action'] == $action || $actPerm['action'] == '*')
                    ) {
                        return true;
                    }
                }
            }

        }

        return false;
    }

    /**
     * @param $user
     * @return bool
     */
    public function isSuperUser($user)
    {
        if (!isset($user['super']) || $user['super'] == 0) {
            return false;
        }

        if ($user['super'] == 1) {
            return true;
        }

        return false;
    }

    /**
     * @param $user
     * @return bool
     */
    public function isAdmin($user)
    {
        return $this->checkPerms('DpOrders', 'isAdmin', 'orders', $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function isSeller($user)
    {
        return $this->checkPerms('DpOrders', 'isSeller', 'orders', $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function isBok($user)
    {
        return $this->checkPerms('DpOrders', 'isBok', 'orders', $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function canEditPrice($user)
    {
        return $this->checkPerms('DpOrders', 'canEditPrice', 'orders', $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function isAuctionUser($user)
    {
        return $this->checkPerms('Auctions', 'getAuctions', NULL, $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function canEditOtherAddress($user)
    {
        return $this->checkPerms('Users', 'canEditOtherAddress', NULL, $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function canRemoveOtherAddress($user)
    {
        return $this->checkPerms('Users', 'canRemoveOtherAddress', NULL, $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function canAddOtherAddress($user)
    {
        return $this->checkPerms('Users', 'canAddOtherAddress', NULL, $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function isAdminEditor($user)
    {
        return $this->checkPerms('Auth', 'isAdminEditor', NULL, $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function canEditOtherOptions($user)
    {
        return $this->checkPerms('Users', 'canEditOtherOptions', NULL, $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function canReadWriteMessages($user)
    {
        return $this->checkPerms('ReclamationsMessages', 'canReadWriteMessages', 'Reclamations', $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function canUploadReclamationFiles($user)
    {
        return $this->checkPerms('Reclamations', 'canUploadReclamationFiles', 'Reclamations', $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function canReadWriteOrderMessages($user)
    {
        return $this->checkPerms('OrdersMessages', 'canReadWriteOrderMessages', 'orders', $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function canCreateReclamation($user)
    {
        return $this->checkPerms('OrdersMessages', 'canCreateReclamation', 'orders', $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function canEditOtherPassword($user)
    {
        return $this->checkPerms('OrdersMessages', 'canEditOtherPassword', 'orders', $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function canUploadCustomProductFiles($user)
    {
        return $this->checkPerms('CustomProducts', 'canUploadCustomProductFiles', 'orders', $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function canSeeAllOngoings($user)
    {
        return $this->checkPerms('Devices', 'canSeeAllOngoings', 'ProductionPath', $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function canSeeUserFiles($user)
    {
        return $this->checkPerms('DpProductFiles', 'canSeeUserFiles', 'orders', $user);
    }

    /**
     * @param $user
     * @return bool
     */
    public function canChangeAttrPrice($user)
    {
        return $this->checkPerms('Calculate', 'canChangeAttrPrice', 'printshop', $user);
    }

}
