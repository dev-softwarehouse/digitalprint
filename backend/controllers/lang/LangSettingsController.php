<?php

use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\Lang\LangSettingsRoot;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Setting\Setting;


/**
 * Class LangSettingsController
 */
class LangSettingsController extends Controller
{

    /**
     * @var array
     */
    public $useModels = array();

    /**
     * @var LangSetting
     */
    protected $LangSetting;
    /**
     * @var LangSettingsRoot
     */
    protected $LangSettingsRoot;
    /**
     * @var Setting
     */
    protected $Setting;
    /**
     * @var
     */
    protected $domainID;

    /**
     * LangSettingsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->LangSetting = LangSetting::getInstance();
        $this->LangSettingsRoot = LangSettingsRoot::getInstance();
        $this->Setting = Setting::getInstance();
        $this->Setting->setModule('general');
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->LangSetting->setDomainID($domainID);
        $this->Setting->setDomainID($domainID);
    }

    /**
     * @return mixed
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @return array
     */
    public function index()
    {

        $langList = $this->LangSetting->getAll();
        $langListRoot = $this->LangSettingsRoot->getAll();
        if (!$langList || !$langListRoot) {
            $return = array();
            return $return;
        }
        $langArr = array();
        foreach ($langList as $l) {
            if ($this->Setting->getValue('defaultLang') == $l['ID']) {
                $l['default'] = 1;
            } else {
                $l['default'] = 0;
            }
            $langArr[$l['code']] = $l;
        }
        foreach ($langListRoot as $r) {
            if (isset($langArr[$r['code']])) {
                $langArr[$r['code']]['name'] = $r['name'];
            }
        }
        foreach ($langArr as $l) {
            $result[] = $l;
        }
        return $result;
    }

    /**
     * @return bool
     */
    public function post_index()
    {
        $code = $this->Data->getPost('code');
        $active = $this->Data->getPost('active');
        if ($code) {
            $exist = $this->LangSetting->exist('code', $code);
            if ($exist) {
                $return['msg'] = 'Lang Exist';
                $return['response'] = false;
                return $return;
            }
            if ($active) {
                $lastID = $this->LangSetting->customCreate($code, $active);
            } else {
                $lastID = $this->LangSetting->customCreate($code);
            }

            if (intval($lastID) > 0) {
                $return = $this->LangSetting->customGet($code);
                if ($return) {
                    $rootLang = $this->LangSettingsRoot->get('code', $code);
                    if ($rootLang) {
                        $return['name'] = $rootLang['name'];
                    }
                }
            }
            if (empty($return)) {
                $return['response'] = false;
            }
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
        $code = $this->Data->getPost('code');
        $active = $this->Data->getPost('active');
        $default = $this->Data->getPost('default');
        $ID = $this->Data->getPost('ID');
        if (!$ID) {
            $return['response'] = false;
            return $return;
        }

        $res = false;

        if ($code) {
            if ($this->LangSetting->update($ID, 'code', $code)) {
                $res = true;
            }
        }
        if ($active !== NULL) {
            if ($this->LangSetting->update($ID, 'active', $active)) {
                $res = true;
            }
        }
        if ($default && intval($default) == 1) {
            $this->Setting->set('defaultLang', $ID);
        }


        if ($res) {
            $return['response'] = true;
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_index($ID)
    {
        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->LangSetting->delete('ID', $ID)) {
                $data['response'] = true;
                return $data;
            } else {
                $data['response'] = false;
                return $data;
            }

        } else {
            header("HTTP/1.0 403 Forbidden");
            $data['response'] = false;
            return $data;
        }
    }
}

