<?php

/**
 * Description of UserTypesController
 * @class UserTypesController
 * @author Rafał
 */

use DreamSoft\Core\Controller;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\UserType\UserType;
use DreamSoft\Models\UserType\UserTypeGroup;
use DreamSoft\Models\UserType\UserTypeRole;

class UserTypesController extends Controller
{

    public $useModels = array();

    /**
     * @var UserType
     */
    protected $UserType;
    /**
     * @var UserTypeGroup
     */
    protected $UserTypeGroup;
    /**
     * @var UserTypeRole
     */
    protected $UserTypeRole;
    /**
     * @var Setting
     */
    protected $Setting;

    public function __construct($params)
    {
        parent::__construct($params);

        $this->UserType = UserType::getInstance();
        $this->UserTypeGroup = UserTypeGroup::getInstance();
        $this->UserTypeRole = UserTypeRole::getInstance();
        $this->Setting = Setting::getInstance();
        $this->Setting->setModule('general');
        $this->Setting->setDomainID(NULL);

    }

    /**
     * @return array|bool
     */
    public function types()
    {

        $list = $this->UserType->getAll();

        foreach ($list as $key => $val) {

            if ($this->Setting->getValue('defaultUserType') == $val['ID']) {
                $list[$key]['default'] = 1;
            } else {
                $list[$key]['default'] = 0;
            }

        }

        if (empty($list)) {
            $list = array();
        }
        return $list;
    }

    /**
     * @return mixed
     */
    public function post_types()
    {
        $return['response'] = false;
        $name = $this->Data->getPost('name');
        $description = $this->Data->getPost('description');
        if ($name) {
            if (!$description) {
                $description = NULL;
            }
            $lastID = $this->UserType->create(compact('name', 'description'));
            $return['item'] = $this->UserType->get('ID', $lastID);
            if (!$return['item']) {
                $return = $this->sendFailResponse('03');
                //$return['response'] = false;
            } else {
                $return['response'] = true;
            }
            //
            return $return;
        } else {
            $return = $this->sendFailResponse('01');
            return $return;
        }
    }

    /**
     * @param $ID
     * @return mixed
     * @throws Exception
     */
    public function delete_types($ID)
    {

        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->UserType->delete('ID', $ID)) {
                $this->UserTypeGroup->deleteByUserType($ID);
                $this->UserTypeRole->deleteByUserType($ID);
            }
            $data['response'] = true;
            return $data;
        } else {
            $data = $this->sendFailResponse('04');
            return $data;
        }
    }

    /**
     * @return array
     */
    public function put_types()
    {
        $name = $this->Data->getPost('name');
        $description = $this->Data->getPost('description');
        $default = $this->Data->getPost('default');
        $ID = $this->Data->getPost('ID');
        if (!$ID) {
            return array('response' => false, 'info' => 'Brak ID');
        }

        $count = 0;
        $count += intval($this->UserType->update($ID, 'name', $name));
        $count += intval($this->UserType->update($ID, 'description', $description));

        if ($default && intval($default) == 1) {
            $this->Setting->set('defaultUserType', $ID);
        }

        $return['response'] = false;

        if ($count == 2) {
            $return['response'] = true;
        }
        return $return;
    }

    /**
     * @param $userTypeID
     * @return array
     */
    public function userTypeGroups($userTypeID)
    {
        if (intval($userTypeID) > 0) {
            $selected = $this->UserTypeGroup->getSelectedGroups($userTypeID);

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
     * @param $userTypeID
     * @return mixed
     * @throws Exception
     */
    public function post_userTypeGroups($userTypeID)
    {

        if (intval($userTypeID) > 0) {
            $selected = $this->UserTypeGroup->getSelectedGroups($userTypeID);
        } else {
            $selected = array();
        }

        $post = $this->Data->getAllPost();
        if (!empty($post)) {
            foreach ($post as $key => $groupID) {
                if (!in_array($groupID, $selected)) {
                    $this->UserTypeGroup->create(compact('groupID', 'userTypeID'));
                }
            }
            foreach ($selected as $key => $groupID) {
                if (!in_array($groupID, $post)) {
                    $this->UserTypeGroup->delete($groupID, $userTypeID);
                }
            }
        }
        $data['response'] = true;
        return $data;
    }

    /**
     * @param $userTypeID
     * @return array
     */
    public function userTypeRoles($userTypeID)
    {
        if (intval($userTypeID) > 0) {
            $selected = $this->UserTypeRole->getSelectedRoles($userTypeID);

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
     * @param $userTypeID
     * @return mixed
     * @throws Exception
     */
    public function post_userTypeRoles($userTypeID)
    {

        if (intval($userTypeID) > 0) {
            $selected = $this->UserTypeRole->getSelectedRoles($userTypeID);
        } else {
            $selected = array();
        }

        $post = $this->Data->getAllPost();
        if (!empty($post)) {
            foreach ($post as $key => $roleID) {
                if (!in_array($roleID, $selected)) {
                    $this->UserTypeRole->create(compact('roleID', 'userTypeID'));
                }
            }
            foreach ($selected as $key => $roleID) {
                if (!in_array($roleID, $post)) {
                    $this->UserTypeRole->delete($roleID, $userTypeID);
                }
            }
        } else {
            $this->UserTypeRole->deleteByUserType($userTypeID);
        }
        $data['response'] = true;
        return $data;
    }

}
