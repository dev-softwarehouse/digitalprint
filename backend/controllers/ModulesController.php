<?php

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Module\ActiveModule;
use DreamSoft\Models\Module\Module;
use DreamSoft\Models\Module\ModuleConf;
use DreamSoft\Models\Module\ModuleKey;
use DreamSoft\Models\Module\ModuleKeyLang;
use DreamSoft\Models\Module\ModuleOption;
use DreamSoft\Models\Module\ModuleOptionLang;
use DreamSoft\Models\Module\ModuleType;
use DreamSoft\Models\Module\ModuleValue;

/**
 * Konfiguracja modułów
 *
 * @class ModulesController
 * @author Rafał
 */
class ModulesController extends Controller
{

    public $useModels = array();

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
     * @var ModuleKeyLang
     */
    protected $ModuleKeyLang;
    /**
     * @var ModuleOption
     */
    protected $ModuleOption;
    /**
     * @var ModuleType
     */
    protected $ModuleType;
    /**
     * @var ModuleOptionLang
     */
    protected $ModuleOptionLang;
    /**
     * @var ModuleConf
     */
    protected $ModuleConf;
    /**
     * @var ActiveModule
     */
    protected $ActiveModule;
    /**
     * @var Price
     */
    protected $Price;
    /**
     * @var null|int
     */
    protected $domainID = NULL;

    /**
     * ModulesController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Module = Module::getInstance();
        $this->ModuleKey = ModuleKey::getInstance();
        $this->ModuleValue = ModuleValue::getInstance();
        $this->ModuleKeyLang = ModuleKeyLang::getInstance();
        $this->ModuleOption = ModuleOption::getInstance();
        $this->ModuleOptionLang = ModuleOptionLang::getInstance();
        $this->ModuleType = ModuleType::getInstance();
        $this->ModuleConf = ModuleConf::getInstance();
        $this->ActiveModule = ActiveModule::getInstance();
        $this->Price = Price::getInstance();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->ModuleValue->setDomainID($domainID);
        $this->domainID = $domainID;
    }

    /**
     * @param null $ID
     * @return array|bool
     */
    public function moduleTypes($ID = NULL)
    {
        if (intval($ID) > 0) {
            $data = $this->ModuleType->get('ID', $ID);
        } else {
            $data = $this->ModuleType->getAll();
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }


    /**
     * @param null $params
     * @return array|bool
     */
    public function modules($params = NULL)
    {
        $type = NULL;
        if (is_array($params) && !empty($params)) {
            $type = $params['type'];
            $ID = NULL;
        } else {
            $ID = $params;
        }
        if (intval($ID) > 0) {
            $data = $this->Module->get('ID', $ID);
        } else {
            $data = $this->Module->getAll($type);
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;

    }

    /**
     * @return mixed
     */
    public function post_modules()
    {
        $name = $this->Data->getPost('name');
        $key = $this->Data->getPost('key');
        $typeID = $this->Data->getPost('typeID');
        if ($name && $typeID) {
            $lastID = $this->Module->create(compact('name', 'key', 'typeID'));
            $return = $this->Module->get('ID', $lastID);
            if (!$return) {
                $return['response'] = false;
            }
        } else {
            $return['response'] = false;
        }
        return $return;
    }


    /**
     * @param $ID
     * @return mixed
     */
    public function delete_modules($ID)
    {
        $data['ID'] = $ID;
        if (intval($ID) > 0) {

            if ($this->Module->delete('ID', $ID)) {
                $this->ModuleKey->setModuleID($ID);
                $keys = $this->ModuleKey->getAllByModule();
                $keysArr = array();
                foreach ($keys as $key => $val) {
                    $keysArr[] = $val['ID'];
                }
                $this->ModuleKeyLang->deleteList($keysArr);
                $options = $this->ModuleOption->getAllByKeyList($keysArr);
                $this->ModuleValue->deleteByList($keysArr);
                $optionsArr = array();
                foreach ($options as $o) {
                    $optionsArr[] = $o['ID'];
                }
                $this->ModuleOption->deleteList($keysArr);
                $this->ModuleOptionLang->deleteList($optionsArr);
                $this->ModuleKey->delete('moduleID', $ID);
                $data['response'] = true;
                return $data;
            } else {
                $data['response'] = false;
                return $data;
            }

        } else {
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @return array
     */
    public function put_modules()
    {

        $name = $this->Data->getPost('name');
        $key = $this->Data->getPost('key');
        $typeID = $this->Data->getPost('typeID');
        $func = $this->Data->getPost('func');
        $ID = $this->Data->getPost('ID');
        if (!$ID) {
            return array('response' => false, 'info' => 'Brak ID');
        }

        $count = 0;
        $count += intval($this->Module->update($ID, 'name', $name));
        $count += intval($this->Module->update($ID, 'key', $key));
        $count += intval($this->Module->update($ID, 'typeID', $typeID));
        $count += intval($this->Module->update($ID, 'func', $func));

        $return['response'] = false;

        if ($count == 3) {
            $return['response'] = true;
        }
        return $return;

    }

    /**
     * @param null $params
     * @return array|bool
     */
    public function extended($params = NULL)
    {
        $type = isset($params['type']) ? $params['type'] : NULL;
        $func = isset($params['func']) ? $params['func'] : NULL;

        $typeID = false;

        if( $type == 'couriers' ) {
            $typeID = MODULE_TYPE_COURIERS;
        } else if( $type == 'payment' )  {
            $typeID = MODULE_TYPE_PAYMENTS;
        }

        if( !$typeID ) {
            return array(
                'info' => 'parameters need type',
                'response' => false
            );
        }

        $modules = $this->Module->customGetAll($typeID);

        if (!empty($modules)) {
            $moduleArr = array();
            foreach ($modules as $m) {
                $moduleArr[] = $m['ID'];
            }

            $keys = $this->ModuleKey->getByList($moduleArr, $func);

            if (!empty($keys)) {
                $keysArr = array();
                $keysTypeArr = array();
                foreach ($keys as $moduleID => $mKeys) {
                    foreach ($mKeys as $kKey => $kValue) {
                        $keysTypeArr[$kValue['ID']] = $kValue['type'];
                        $keysArr[] = $kKey;
                    }
                }

                $options = $this->ModuleOption->getByList($keysArr);
                if( $func == 'collectionAttributes' ) {
                    $values = $this->ModuleValue->customGetByList($keysArr, null, true);
                } else {
                    $values = $this->ModuleValue->customGetByList($keysArr);
                }

            }
            foreach ($modules as $key => $val) {

                if (isset($keys[$val['ID']])) {
                    foreach ($keys[$val['ID']] as $kKey => $kVal) {
                        if (isset($options[$kVal['ID']])) {
                            sort($options[$kVal['ID']]);
                            $keys[$val['ID']][$kKey]['options'] = $options[$kVal['ID']];
                        }
                        if (isset($values[$kVal['ID']])) {
                            $actValue = $values[$kVal['ID']];
                            if ($keysTypeArr[$kVal['ID']] == 'price') {
                                $actValue = $this->Price->getPriceToView($values[$kVal['ID']]);
                            }

                            if( $func == 'collectionAttributes' ) {
                                $keys[$val['ID']][$kKey]['values'] = $actValue;
                            } else {
                                $keys[$val['ID']][$kKey]['value'] = $actValue;
                            }

                        }
                    }
                    sort($keys[$val['ID']]);
                    $modules[$key]['keys'] = $keys[$val['ID']];
                }
            }
            return $modules;
        } else {
            return array('response' => false);
        }
    }

    /**
     * @param $moduleID
     * @param null $key
     * @return array|bool
     */
    public function keys($moduleID, $key = NULL)
    {

        $this->ModuleKey->setModuleID($moduleID);
        if ($key) {
            $all = $this->ModuleKey->getAllLangs($moduleID, $key);
            $names = array();
            $data = array();
            foreach ($all as $row) {
                $names[$row['lang']] = $row['name'];
                $data = $row;
            }
            $data['names'] = $names;
            unset($data['name']);
        } else {
            $data = $this->ModuleKey->getAllByModule();
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $moduleID
     * @return mixed
     */
    public function patch_keys($moduleID)
    {

        try {
            $this->ModuleKey->setModuleID($moduleID);

            $post = $this->Data->getAllPost();

            $names = $post['names'];
            $key = $post['key'];
            $type = $post['type'];
            $func = NULL;
            if (isset($post['func'])) {
                $func = $post['func'];
            }
            $moduleKeyID = $post['ID'];
            if (!$type) {
                $type = 'string';
            }

            if (!$moduleKeyID) {
                $moduleKeyID = $this->ModuleKey->customCreate($key, $type, $func);
            } else {
                $this->ModuleKey->update($moduleKeyID, 'key', $key);
                $this->ModuleKey->update($moduleKeyID, 'type', $type);
                $this->ModuleKey->update($moduleKeyID, 'func', $func);
            }

            if (!empty($names)) {

                foreach ($names as $lang => $name) {
                    $res = $this->ModuleKeyLang->set($lang, $name, $moduleKeyID);
                    if (!$res) {
                        throw new Exception('Wystąpił błąd', '01');
                    }
                }
                $all = $this->ModuleKey->getAllLangs($moduleKeyID, $key);

                $names = array();
                $data['item'] = array();
                foreach ($all as $row) {
                    $names[$row['lang']] = $row['name'];
                }
                $data['item'] = $this->ModuleKey->customGet($key);
                $data['item']['names'] = $names;
                $data['response'] = true;
            } else {
                $data['response'] = false;
                $data['names'] = $names;
            }

            return $data;
        } catch (Exception $e) {
            $data['error'] = $e->getMessage();
        }
        return $data;
    }

    /**
     * @param $moduleID
     * @param $ID
     * @return mixed
     */
    public function delete_keys($moduleID, $ID)
    {

        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->ModuleKey->delete('ID', $ID)) {
                $this->ModuleKeyLang->delete('moduleKeyID', $ID);
                $this->ModuleValue->delete('moduleKeyID', $ID);
                $keysArr = array($ID);
                $options = $this->ModuleOption->getAllByKeyList($keysArr);
                $optionsArr = array();
                foreach ($options as $o) {
                    $optionsArr[] = $o['ID'];
                }

                $this->ModuleOption->deleteList($keysArr);

                $this->ModuleOptionLang->deleteList($optionsArr);
                $data['response'] = true;
                return $data;
            } else {
                $data['response'] = false;
                return $data;
            }
        } else {
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @param $moduleKey
     * @param $params
     * @return array
     */
    public function values($moduleKey, $params)
    {
        $componentID = null;
        if ($params['deliveryID']) {
            $componentID = $params['deliveryID'];
        }
        if ($params['componentID']) {
            $componentID = $params['componentID'];
        }

        if (intval($params['ID']) > 0) {
            $data = $this->ModuleValue->get('ID', $params['ID']);
        } else {
            $module = $this->Module->get('key', $moduleKey);
            $this->ModuleKey->setModuleID($module['ID']);
            $keys = $this->ModuleKey->getAllByModule();

            $keysArr = array();
            $keysFunc = array();
            foreach ($keys as $key => $val) {
                $keysArr[] = $val['ID'];
                $keysFunc[$val['ID']] = $val['func'];
            }

            $values = $this->ModuleValue->customGetByList($keysArr, $componentID, true);

            if (empty($values)) {
                return array('response' => false);
            }
            $data['keys'] = $values;
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $moduleKey
     * @param null $key
     * @return array
     */
    public function patch_values($moduleKey, $key = NULL)
    {

        $data['response'] = false;
        try {

            $values = $this->Data->getPost('keys');
            $componentID = $this->Data->getPost('componentID');

            $confID = NULL;
            $count = 0;
            if ($values) {

                foreach ($values as $moduleKeyID => $value) {
                    $moduleKey = $this->ModuleKey->get('ID', $moduleKeyID);
                    if ($moduleKey && $moduleKey['type'] == 'price') {
                        $value = $this->Price->getPriceToDb($value);
                    }
                    $res = $this->ModuleValue->set($moduleKeyID, $value, $componentID, $confID, $this->domainID);
                    if (intval($res) > 0) {
                        $count++;
                    }
                }

                if (count($values) == $count) {
                    $data['response'] = true;
                }

            }

            return $data;
        } catch (Exception $e) {
            $data['error'] = $e->getMessage();
        }
        return $data;
    }

    /**
     * @param $moduleID
     * @param $key
     * @param $ID
     * @return mixed
     */
    public function delete_values($moduleID, $key, $ID)
    {
        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->ModuleValue->delete('ID', $ID)) {
                $data['response'] = true;
                return $data;
            } else {
                $data['response'] = false;
                return $data;
            }
        } else {
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @param $moduleID
     * @param $courierKeyID
     * @param null $ID
     * @return array|bool
     */
    public function options($moduleID, $courierKeyID, $ID = NULL)
    {
        if (intval($ID) > 0) {
            $data = $this->ModuleOption->get('ID', $ID);
            $names = $this->ModuleOptionLang->getByMOduleOptions(array($ID));
            $data['names'] = $names;
        } else {
            $data = $this->ModuleOption->getAllByKey($courierKeyID);
            if (!empty($data)) {
                $mOptions = array();
                foreach ($data as $d) {
                    $mOptions[] = $d['ID'];
                }
                $names = $this->ModuleOptionLang->getByMOduleOptions($mOptions);
            }
            foreach ($data as $key => $val) {
                $data[$key]['names'] = $names[$val['ID']];
            }
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $moduleID
     * @param $moduleKeyID
     * @return mixed
     */
    public function patch_options($moduleID, $moduleKeyID)
    {
        try {

            $post = $this->Data->getAllPost();

            $names = $post['names'];
            $value = $post['value'];
            $moduleOptionID = $post['ID'];

            if (!$moduleOptionID) {
                $moduleOptionID = $this->ModuleOption->create(compact('moduleKeyID', 'value'));
            } elseif (!empty($value)) {
                $this->ModuleOption->update($moduleOptionID, 'value', $value);
            }
            if (!empty($names)) {

                foreach ($names as $lang => $name) {
                    $res = $this->ModuleOptionLang->set($lang, $name, $moduleOptionID);
                    if (!$res) {
                        throw new Exception('Wystąpił błąd', '01');
                    }
                }
                $all = $this->ModuleOption->getAllLangs($moduleOptionID);

                $names = array();
                $data['item'] = array();
                foreach ($all as $row) {
                    $names[$row['lang']] = $row['name'];
                }
                $data['item'] = $this->ModuleOption->get('ID', $moduleOptionID);
                $data['item']['names'] = $names;
                $data['response'] = true;
            } else {
                $data['response'] = false;
                $data['names'] = $names;
            }

            return $data;
        } catch (Exception $e) {
            $data['error'] = $e->getMessage();
        }
        return $data;
    }

    public function delete_options($moduleID, $courierKeyID, $ID)
    {
        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->ModuleOption->delete('ID', $ID)) {
                $this->ModuleOptionLang->delete('moduleOptionID', $ID);
                $data['response'] = true;
                return $data;
            } else {
                $data['response'] = false;
                return $data;
            }
        } else {
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @param null $ID
     * @return array|bool
     */
    public function activeModules($ID = NULL)
    {
        if (intval($ID) > 0) {
            $data = $this->ActiveModule->get('ID', $ID);
        } else {
            $data = $this->ActiveModule->getAll();
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @return mixed
     */
    public function post_activeModules()
    {
        $moduleID = $this->Data->getPost('moduleID');
        $data['response'] = false;
        if ($moduleID) {
            $oneModule = $this->Module->get('ID', $moduleID);
            $existID = $this->ActiveModule->exist('moduleID', $moduleID);
            if (!$existID && $oneModule) {
                $lastID = $this->ActiveModule->create(compact('moduleID'));
                if ($lastID > 0) {
                    $data['item'] = $this->ActiveModule->get('ID', $lastID);
                    $data['response'] = true;
                } else {
                    $data = $this->sendFailResponse('03');
                }
            } else {
                if (!$existID) {
                    $data = $this->sendFailResponse('08');
                }
                if (!$oneModule) {
                    $data = $this->sendFailResponse('07', 'Moduł o takim ID nie iestnieje');
                }
            }
        } else {
            $data = $this->sendFailResponse('01');
        }
        return $data;
    }

    /**
     * @return mixed
     */
    public function put_activeModules()
    {
        $data['send'] = json_decode(file_get_contents("php://input"), true);
        $data['post'] = $_POST;

        $goodFields = array('active');
        $post = $this->Data->getAllPost();
        $data['response'] = false;

        if (isset($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        }

        $count = count($goodFields);
        if (!empty($post)) {
            $saved = 0;
            foreach ($post as $key => $value) {
                if (in_array($key, $goodFields)) {
                    $saved += intval($this->ActiveModule->update($ID, $key, $value));
                }
            }

            if ($saved == $count) {
                $data['response'] = true;
                $data['info'] = 'Saved: ' . $count . ' fields.';
            } else {
                $data['errorCode'] = '03';
                $data['httpCode'] = 500;
                $data['info'] = '0 saved fields';
            }
        } else {
            $data['errorCode'] = '01';
            $data['httpCode'] = 400;
            $data['info'] = 'Empty post';
        }
        return $data;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_activeModules($ID)
    {
        if (intval($ID) > 0) {
            if ($this->ActiveModule->delete('ID', $ID)) {
                $data['response'] = true;
            } else {
                $data = $this->sendFailResponse('05');
            }
        } else {
            $data = $this->sendFailResponse('04');
        }
        return $data;
    }

}
