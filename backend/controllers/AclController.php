<?php

use DreamSoft\Libs\Routing;
use DreamSoft\Core\Controller;
use DreamSoft\Models\User\User;
use DreamSoft\Models\User\UserGroup;
use DreamSoft\Models\User\UserRole;
use DreamSoft\Models\Acl\Role;
use DreamSoft\Models\Acl\Permission;
use DreamSoft\Models\Acl\RolePerm;
use DreamSoft\Models\Group\GroupRole;

/**
 * Class AclController
 */
class AclController extends Controller
{

    public $useModels = array();

    /**
     * @var Role
     */
    protected $Role;
    /**
     * @var Permission
     */
    protected $Permission;
    /**
     * @var User
     */
    protected $User;
    /**
     * @var UserRole
     */
    protected $UserRole;
    /**
     * @var RolePerm
     */
    protected $RolePerm;
    /**
     * @var UserGroup
     */
    protected $UserGroup;
    /**
     * @var GroupRole
     */
    protected $GroupRole;

    /**
     * AclController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Role = Role::getInstance();
        $this->Permission = Permission::getInstance();
        $this->UserRole = UserRole::getInstance();
        $this->RolePerm = RolePerm::getInstance();
        $this->User = User::getInstance();
        $this->UserGroup = UserGroup::getInstance();
        $this->GroupRole = GroupRole::getInstance();
    }

    /**
     * @return mixed
     * @throws Exception
     */
    public function initPerms()
    {

        $Routing = new Routing();

        $controllersDir = 'controllers';

        $default = array(
            'Auth' => array('post_login', 'check'),
            'Lang' => array('index'),
            'LangSettings' => array('index'),
        );

        $prefixes = array('', 'post_', 'delete_', 'put_', 'patch_');

        $list = $Routing->getResources();

        $params = array();
        foreach ($list as $row) {
            if (isset($controllerInst) && is_object($controllerInst)) {
                unset($controllerInst);
            }
            if (isset($row['package'])) {
                $package = $row['package'];
            } else {
                $package = NULL;
            }

            $controller = ucfirst($row['controller']) . 'Controller';

            if (isset($row['autoload']) && intval($row['autoload']) == 1) {

                if (isset($row['package']) && strlen($row['package']) > 0) {
                    $controllerNspName = '\\DreamSoft\\Controllers\\' . ucfirst($row['package']) . '\\' . $controller;

                    if (class_exists($controllerNspName)) {
                        $controllerInst = new $controllerNspName($params);
                    }
                }

            } else {

                if (isset($row['package']) && strlen($row['package']) > 0) {
                    $packageDir = '/' . $row['package'];
                    if (is_file(BASE_DIR . $controllersDir . $packageDir . '/' . $controller . '.php')) {
                        include_once(BASE_DIR . $controllersDir . $packageDir . '/' . $controller . '.php');
                        $controllerInst = new $controller($params);
                    }
                } else {
                    if (is_file(BASE_DIR . $controllersDir . '/' . $controller . '.php')) {
                        include_once(BASE_DIR . $controllersDir . '/' . $controller . '.php');
                        $controllerInst = new $controller($params);
                    }
                }
            }

            if (!isset($controllerInst) || !is_object($controllerInst)) {
                continue;
            }

            foreach ($prefixes as $p) {


                if (method_exists($controllerInst, $p . $row['action']) && !$this->Permission->exist(ucfirst($row['controller']), $p . $row['action'], $package)) {
                    if (isset($default[ucfirst($row['controller'])]) && in_array($p . $row['action'], $default[ucfirst($row['controller'])])) {
                        $setDefault = 1;
                    } else {
                        $setDefault = 0;
                    }

                    $createParams = array();

                    $createParams['controller'] = ucfirst($row['controller']);
                    $createParams['action'] = $p . $row['action'];
                    $createParams['default'] = $setDefault;
                    $createParams['package'] = $package;

                    $this->Permission->create($createParams);
                } else {
                    $one = $this->Permission->getByMethod(ucfirst($row['controller']), $p . $row['action'], NULL);
                    if ($one['package'] != $package) {
                        $this->Permission->update($one['ID'], 'package', $package);
                    }

                }
            }

            if (!empty($row['custom']) && is_array($row['custom'])) {
                foreach ($row['custom'] as $c) {
                    foreach ($prefixes as $p) {

                        if (method_exists($controllerInst, $p . $c) && !$this->Permission->exist(ucfirst($row['controller']), $p . $c, $package)) {
                            if (isset($default[ucfirst($row['controller'])]) && in_array($p . $c, $default[ucfirst($row['controller'])])) {
                                $setDefault = 1;
                            } else {
                                $setDefault = 0;
                            }

                            $createParams = array();
                            $createParams['controller'] = ucfirst($row['controller']);
                            $createParams['action'] = $p . $c;
                            $createParams['default'] = $setDefault;
                            $createParams['package'] = $package;

                            $this->Permission->create($createParams);
                        } else {
                            $one = $this->Permission->getByMethod(ucfirst($row['controller']), $p . $c, NULL);
                            if ($one['package'] != $package) {
                                $this->Permission->update($one['ID'], 'package', $package);
                            }
                        }
                    }
                }
            }
        }
        $return['response'] = true;
        return $return;
    }

    /**
     * @param null $ID
     * @return array|bool
     */
    public function index($ID = NULL)
    {
        if (intval($ID) > 0) {
            $data = $this->Permission->get($ID);
        } else {
            $data = $this->Permission->getAll();
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @return mixed
     * @throws Exception
     */
    public function post_index()
    {
        $package = $this->Data->getPost('package');
        $controller = $this->Data->getPost('controller');
        $action = $this->Data->getPost('action');
        $default = $this->Data->getPost('default');
        $desc = $this->Data->getPost('desc');
        if ($controller && $action) {
            if (!$default) {
                $default = 0;
            }
            if (!$desc) {
                $desc = NULL;
            }
            $row['desc']=$desc;
            $row['package']=$package;
            $row['controller']=$controller;
            $row['action']=$action;
            $row['default']=$default;
            $lastID = $this->Permission->create($row);
            $row = $this->Permission->get('ID', $lastID);
            $return = $row;
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    /**
     * @return mixed
     */
    public function put_index()
    {
        $post = $this->Data->getAllPost();
        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }
        $useKeys = array('controller', 'action', 'default', 'desc', 'package');
        foreach ($post as $key => $value) {
            if (!in_array($key, $useKeys)) {
                continue;
            }
            $this->Permission->update($ID, $key, $value);
        }
        $return['response'] = true;
        return $return;

    }

    /**
     * @param $ID
     * @return mixed
     * @throws Exception
     */
    public function delete_index($ID)
    {

        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->Permission->delete('ID', $ID)) {
                $this->RolePerm->deleteByPerm($ID);
            }
            $data['response'] = true;
            return $data;
        } else {
            header("HTTP/1.0 403 Forbidden");
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @param null $ID
     * @return array|bool
     */
    public function roles($ID = NULL)
    {

        if (intval($ID) > 0) {
            $data = $this->Role->get('ID', $ID);
        } else {
            $data = $this->Role->getAll();
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @return mixed
     * @throws Exception
     */
    public function post_roles()
    {
        $name = $this->Data->getPost('name');
        $desc = $this->Data->getPost('desc');
        if ($name) {
            if (!$desc) {
                $desc = NULL;
            }
            $lastID = $this->Role->create($name, $desc);
            $row = $this->Role->get('ID', $lastID);
            $return = $row;
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    /**
     * @return mixed
     */
    public function put_roles()
    {
        $post = $this->Data->getAllPost();
        $goodKeys = array('name', 'desc');
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
            $this->Role->update($ID, $key, $value);
        }
        $return['response'] = true;
        return $return;

    }

    /**
     * @param $ID
     * @return mixed
     * @throws Exception
     */
    public function delete_roles($ID)
    {
        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->Role->delete('ID', $ID)) {
                $this->RolePerm->deleteByRole($ID);
                $this->UserRole->deleteByRole($ID);
                $this->GroupRole->deleteByRole($ID);
            }
            $data['response'] = true;
            return $data;
        } else {
            header("HTTP/1.0 403 Forbidden");
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @param $roleID
     * @return array
     */
    public function rolePerms($roleID)
    {
        if (intval($roleID) > 0) {
            $selected = $this->RolePerm->getSelectedPerms($roleID);
        } else {
            $selected = array();
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
     * @param $roleID
     * @return mixed
     * @throws Exception
     */
    public function post_rolePerms($roleID)
    {
        if (intval($roleID) > 0) {
            $selected = $this->RolePerm->getSelectedPerms($roleID);
        } else {
            $selected = array();
        }

        $post = $this->Data->getAllPost();
        if (!empty($post)) {
            foreach ($post as $key => $permID) {
                if (!in_array($permID, $selected)) {
                    $this->RolePerm->create(compact('roleID', 'permID'));
                }
            }
            foreach ($selected as $key => $permID) {
                if (!in_array($permID, $post)) {
                    $this->RolePerm->delete($roleID, $permID);
                }
            }
            $data['response'] = true;
        } else {
            $data['response'] = false;
        }
        return $data;
    }
}
