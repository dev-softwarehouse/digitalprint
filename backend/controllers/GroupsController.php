<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\Group\Group;
use DreamSoft\Models\Group\GroupRole;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\User\UserGroup;

class GroupsController extends Controller
{

    public $useModels = array();

    /**
     * @var Group
     */
    protected $Group;
    /**
     * @var GroupRole
     */
    protected $GroupRole;
    /**
     * @var UserGroup
     */
    protected $UserGroup;
    /**
     * @var Setting
     */
    protected $Setting;

    /**
     * GroupsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Group = Group::getInstance();
        $this->Group->setFields(array('ID', 'name', 'desc'));
        $this->GroupRole = GroupRole::getInstance();
        $this->UserGroup = UserGroup::getInstance();
        $this->Setting = Setting::getInstance();
        $this->Setting->setModule('acl');
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->Setting->setDomainID(NULL);
    }

    /**
     * @param null $ID
     * @return array|bool
     */
    public function index($ID = NULL)
    {

        if (intval($ID) > 0) {
            $data = $this->Group->get('ID', $ID);
            if ($this->Setting->getValue('defaultGroup') == $data['ID']) {
                $data['default'] = 1;
            } else {
                $data['default'] = 0;
            }
        } else {
            $data = $this->Group->getAll();
            foreach ($data as $key => $group) {
                if ($this->Setting->getValue('defaultGroup') == $group['ID']) {
                    $data[$key]['default'] = 1;
                } else {
                    $data[$key]['default'] = 0;
                }
            }
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @return mixed
     */
    public function post_index()
    {
        $name = $this->Data->getPost('name');
        $desc = $this->Data->getPost('desc');
        $default = $this->Data->getPost('default');
        if ($name) {
            if (!$desc) {
                $desc = NULL;
            }
            $lastID = $this->Group->customCreate($name, $desc);


            $return = $this->Group->get('ID', $lastID);

            if ($default && intval($default) == 1) {
                $this->Setting->set('defaultCurrency', $lastID);
                $return['default'] = 1;
            }

            if (!$return) {
                $return = $this->sendFailResponse('03');
            }
            return $return;
        } else {
            $return = $this->sendFailResponse('01');
            return $return;
        }
    }

    /**
     * @return mixed
     */
    public function put_index()
    {
        $post = $this->Data->getAllPost();
        $goodKeys = array('name', 'desc');
        $default = $this->Data->getPost('default');
        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }
        foreach ($post as $key => $value) {
            if (!in_array($key, $goodKeys)) {
                continue;
            }
            $this->Group->update($ID, $key, $value);
        }

        if ($default && intval($default) == 1) {
            $this->Setting->set('defaultGroup', $ID);
        }

        $return['response'] = true;
        return $return;

    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_index($ID)
    {

        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->Group->delete('ID', $ID)) {
                $this->GroupRole->deleteByGroup($ID);
                $this->UserGroup->deleteByGroup($ID);
            }
            $data['response'] = true;
            return $data;
        } else {
            $data = $this->sendFailResponse('04');
            return $data;
        }
    }

    /**
     * @param $groupID
     * @return array
     */
    public function groupRoles($groupID)
    {
        if (intval($groupID) > 0) {
            $selected = $this->GroupRole->getSelectedRoles($groupID);

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
     * @param $groupID
     * @return mixed
     * @throws Exception
     */
    public function post_groupRoles($groupID)
    {

        if (intval($groupID) > 0) {
            $selected = $this->GroupRole->getSelectedRoles($groupID);
        } else {
            $selected = array();
        }

        $post = $this->Data->getAllPost();
        if (!empty($post)) {
            foreach ($post as $key => $roleID) {
                if (!in_array($roleID, $selected)) {
                    $this->GroupRole->create(compact('roleID', 'groupID'));
                }
            }
            foreach ($selected as $key => $roleID) {
                if (!in_array($roleID, $post)) {
                    $this->GroupRole->customDelete($roleID, $groupID);
                }
            }
        } else {
            $this->GroupRole->deleteByGroup($groupID);
        }
        $data['response'] = true;
        return $data;
    }

}