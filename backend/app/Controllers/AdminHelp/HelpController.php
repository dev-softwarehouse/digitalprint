<?php

namespace DreamSoft\Controllers\AdminHelp;

use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Core\Controller;
use DreamSoft\Controllers\Components\Standard;
use DreamSoft\Models\AdminHelp\Help;
use DreamSoft\Models\AdminHelp\HelpLang;
use DreamSoft\Models\AdminHelp\HelpKey;

/**
 * Class HelpController
 */
class HelpController extends Controller
{

    public $useModels = array();

    protected $Help;
    protected $HelpLang;
    protected $LangSetting;
    protected $HelpKey;
    /**
     * @var Standard
     */
    protected $Standard;

    /**
     * @constructor
     * @param {Array} $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Standard = Standard::getInstance();
        $this->Help = Help::getInstance();
        $this->LangSetting = LangSetting::getInstance();
        $this->HelpLang = HelpLang::getInstance();
        $this->HelpKey = HelpKey::getInstance();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
        $this->LangSetting->setDomainID($domainID);
    }

    /**
     * @param null $module
     * @return array
     */
    public function helps($module = NULL)
    {
        if (strlen($module) > 0) {
            if (defined('lang')) {
                $lang = lang;
            } else {
                $lang = 'pl';
            }
            $data = $this->Help->getByModule($module, $lang);
        } else {
            $data = $this->Help->getAll();
        }

        if (empty($data)) {
            $data = array();
        }
        sort($data);
        return $data;
    }

    /**
     * @return array
     */
    public function post_helps()
    {

        $module = $this->Data->getPost('module');
        $description = $this->Data->getPost('description');

        $return['response'] = false;

        if ($module) {

            $exist = $this->Help->exist('module', $module);

            if ($exist) {
                return $this->sendFailResponse('08', 'Moduł ' . $module . ' już istnieje!');
            }

            $helpID = $this->Help->create(compact('module', 'description'));

            if ($helpID > 0) {
                $one = $this->Help->get('ID', $helpID);

                $return['item'] = $one;
                $return['response'] = true;
            }
        }
        return $return;
    }

    /**
     * @return array
     */
    public function put_helps()
    {

        $post = $this->Data->getAllPost();
        $goodKeys = array('active', 'module', 'description');

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
            if ($key == 'module') {
                $exist = $this->Help->exist('module', $module);
                if ($exist) {
                    //return array('response' => false, 'info' => 'Moduł '.$module.' już istnieje!');
                    return $this->sendFailResponse('08', 'Moduł ' . $module . ' już istnieje!');
                }
            }
            $this->Help->update($ID, $key, $value);
        }

        $return['response'] = true;
        return $return;

    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_helps($ID)
    {

        $data['ID'] = $ID;
        $removeHL = 0;

        if (intval($ID) > 0) {
            if ($this->Help->delete('ID', $ID)) {
                $this->HelpKey->delete('moduleID', $ID);
                $all = $this->HelpKey->getByModule($ID);
                if (!empty($all)) {
                    foreach ($all as $hk) {
                        $removeHL += intval($this->HelpLang->delete('keyID', $hk['ID']));
                    }
                }
                $data['response'] = true;
                $data['removed'] = $ID;
                $data['removedTexts'] = 'removed: ' . $removeHL;
            }
        } else {
            $data['response'] = false;
        }
        return $data;
    }

    /**
     * @param $module
     * @param string $key
     * @return array
     */
    public function keys($module, $key = '')
    {

        if (strlen($key) > 0 && strlen($module) > 0) {
            $data = $this->Help->getByParams($module, $key);
        } elseif (strlen($module) > 0) {
            $data = $this->Help->getByParams($module);
        }
        if (empty($data)) {
            $data = array();
        }
        //sort($data);
        return $data;
    }

    /**
     * @param $module
     * @return array
     */
    public function post_keys($module)
    {

        $key = $this->Data->getPost('key');
        $moduleID = $this->Data->getPost('moduleID');
        if (!$moduleID) {
            $moduleOne = $this->Help->get('module', $module);
            $moduleID = $moduleOne['ID'];
        }
        $texts = $this->Data->getPost('texts');

        if (!is_array($texts)) {
            $texts = $this->Standard->objectToArray(json_decode($texts));
        }

        if ($key && $moduleID) {
            $exist = $this->HelpKey->exist($moduleID, $key);

            if ($exist > 0) {
                return $this->sendFailResponse('08', 'Klucz: ' . $key . ' powtarza się dla modułu: ' . $moduleID);
            }

            $created = date('Y-m-d H:i:s');

            $lastID = $this->HelpKey->create(compact('key', 'moduleID', 'created'));

            $createdLang = 0;

            if ($lastID > 0) {
                $data['item'] = $this->HelpKey->get('ID', $lastID);
                $data['response'] = true;

                if (!empty($texts)) {

                    foreach ($texts as $lang => $t) {
                        $helpLangID = $this->HelpLang->exist($lang, $lastID);

                        if (intval($helpLangID) > 0) {
                            $this->HelpLang->update($helpLangID, 'description', $t['description']);
                            $this->HelpLang->update($helpLangID, 'title', $t['title']);
                        } else {
                            $params['keyID'] = $lastID;
                            $params['description'] = $t['description'];
                            $params['title'] = $t['title'];
                            $params['lang'] = $lang;
                            $lastLangID = $this->HelpLang->create($params);
                            if ($lastLangID > 0) {
                                $data['item']['texts'][$lang] = array(
                                    'title' => $t['title'],
                                    'description' => $t['description']
                                );
                                $createdLang++;
                            }
                        }
                    }
                }

            } else {
                $data = $this->sendFailResponse('03');
            }
        } else {
            $data = $this->sendFailResponse('02');
        }
        $data['createdLang'] = $createdLang;
        return $data;
    }

    /**
     * @param $module
     * @return array
     */
    public function put_keys($module)
    {
        $post = $this->Data->getAllPost();
        $goodKeys = array('active', 'key');

        $moduleID = $this->Data->getPost('moduleID');
        if (!$moduleID) {
            $moduleOne = $this->Help->get('module', $module);
            $moduleID = $moduleOne['ID'];
        }

        $texts = $this->Data->getPost('texts');

        if (!is_array($texts)) {
            $texts = $this->Standard->objectToArray(json_decode($texts));
        }

        $langs = $this->LangSetting->getAll();
        $langArr = array();
        foreach ($langs as $l) {
            if ($l['active'] == 1) {
                $langArr[$l['code']] = $l['code'];
            }
        }

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
            if ($key == 'module') {
                $exist = $this->HelpKey->exist($moduleID, $key);
                if ($exist > 0) {
                    return $this->sendFailResponse('08', 'Klucz: ' . $key . ' powtarza się dla modułu: ' . $moduleID);
                }
            }
            $this->Help->update($ID, $key, $value);
            $return['item'] = $this->HelpKey->get('ID', $ID);
        }

        if (!empty($texts)) {

            $createdLang = 0;
            $updatedLang = 0;
            foreach ($texts as $lang => $t) {
                $helpLangID = $this->HelpLang->exist($lang, $ID);
                if (!in_array($lang, $langArr)) {
                    $this->HelpLang->delete('ID', $helpLangID);
                    continue;
                }
                if (intval($helpLangID) > 0) {
                    $updatedLocal = 0;
                    $updatedLocal += intval($this->HelpLang->update($helpLangID, 'description', $t['description']));
                    $updatedLocal += intval($this->HelpLang->update($helpLangID, 'title', $t['title']));
                    if ($updatedLocal == 2) {
                        $updatedLang++;
                    }
                } else {
                    $params['keyID'] = $ID;
                    $params['description'] = $t['description'];
                    $params['title'] = $t['title'];
                    $params['lang'] = $lang;
                    $lastLangID = $this->HelpLang->create($params);
                    if ($lastLangID > 0) {
                        $return['item']['texts'][$lang] = array(
                            'title' => $t['title'],
                            'description' => $t['description']
                        );
                        $createdLang++;
                    }
                }
            }
        }

        $return['response'] = true;
        $return['updatedLang'] = $updatedLang;
        $return['createdLang'] = $createdLang;
        return $return;
    }

    /**
     * @param $module
     * @param $ID
     * @return mixed
     */
    public function delete_keys($module, $ID)
    {
        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->HelpKey->delete('ID', $ID)) {
                $this->HelpLang->delete('keyID', $ID);
                $data['response'] = true;
                $data['removed'] = $ID;
            }
        } else {
            $data['response'] = false;
        }
        return $data;
    }

    /**
     * @param $module
     * @param $key
     * @return array
     */
    public function put_langs($module, $key)
    {

        $keyID = $this->Data->getPost('keyID');
        if (!$keyID) {
            $keyOne = $this->HelpKey->get('key', $key);
            $keyID = $keyOne['ID'];
        }
        $texts = $this->Data->getPost('texts');

        if (!is_array($texts)) {
            $texts = $this->Standard->objectToArray(json_decode($texts));
        }

        $langs = $this->LangSetting->getAll();

        $langArr = array();
        foreach ($langs as $l) {
            if ($l['active'] == 1) {
                $langArr[$l['code']] = $l['code'];
            }
        }

        $saved = 0;
        $updated = 0;
        if ($keyID && !empty($texts)) {
            foreach ($texts as $lang => $d) {
                if (in_array($lang, $langArr)) {
                    $exist = $this->HelpLang->exist($lang, $keyID);
                    if (!$exist) {
                        $params['keyID'] = $keyID;
                        $params['description'] = $d['description'];
                        $params['title'] = $d['title'];
                        $params['lang'] = $lang;
                        $lastID = $this->HelpLang->create($params);
                        if ($lastID > 0) {
                            $saved++;
                        }
                        unset($lastID);
                    } else {
                        $updatedLocal = 0;
                        $updatedLocal += intval($this->HelpLang->update($exist, 'description', $d['description']));
                        $updatedLocal += intval($this->HelpLang->update($exist, 'title', $d['title']));
                        if ($updatedLocal == 2) {
                            $updated++;
                        }
                    }
                }
            }
        } else {
            $data = $this->sendFailResponse('02');
        }
        if ($saved > 0) {
            $data['resonse'] = true;
            $data['saved'] = $saved;
            $data['updated'] = $updated;
        } else {
            $data = $this->sendFailResponse('03');
        }
        return $data;
    }

}