<?php

use DreamSoft\Controllers\Components\ExportImport;
use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\Lang\Lang;
use DreamSoft\Models\Lang\LangRoot;
use DreamSoft\Models\Lang\LangSettingsRoot;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Domain\Domain;
use DreamSoft\Controllers\Traits\ExportLang;
use DreamSoft\Controllers\Traits\ImportLang;
/**
 * Class LangController
 */
class LangController extends Controller {
    use ExportLang;
    use ImportLang;
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
     * @var LangRoot
     */
    protected $LangRoot;
    /**
     * @var $Lang Lang
     */
    protected $Lang;
    /**
     * @var Domain
     */
    protected $Domain;

    /**
     * @var ExportImport
     */
    protected $ExportImport;
    /**
     * @var Uploader
     */
    protected $Uploader;

    public function __construct ($params) {
        parent::__construct($params);
        $this->LangSetting = LangSetting::getInstance();
        $this->LangSettingsRoot = LangSettingsRoot::getInstance();
        $this->Lang = Lang::getInstance();
        $this->LangRoot = LangRoot::getInstance();
        $this->Domain = Domain::getInstance();
        $this->ExportImport = ExportImport::getInstance();
        $this->Uploader = Uploader::getInstance();
    }

    /**
     * @param $domainID
     */
    public function setDomainID( $domainID ) {
        $this->LangSetting->setDomainID( $domainID );
    }

    /**
     * @param null $langCode
     * @return array
     */
    public function index($langCode = NULL)
    {
        if (strlen($langCode) > 0) {
            $lang = $this->LangSetting->customGet($langCode);
            if (!$lang) {
                $lang['code'] = $langCode;
            }

        }

        if (isset($lang['code'])) {
            $langRootList = $this->LangRoot->getAll($lang['code']);
            if (!$langRootList) {
                header("HTTP/1.0 403 Forbidden");
                $data['response'] = false;
                return $data;
            }
        } else {
            $langRootList = $this->LangRoot->getAll();
        }
        if (isset($lang['code'])) {
            $langList = $this->Lang->getAll($lang['code']);
        } else {
            $langList = $this->Lang->getAll();
        }

        $langArr = array();
        foreach ($langList as $l) {
            $langArr[$l['lang']][$l['key']] = array('value' => $l['value'], 'ID' => $l['ID']);
        }

        $langResult = array();
        if (!isset($lang['code'])) {
            foreach ($langRootList as $l) {
                $l['original'] = $l['value'];
                if (isset($langArr[$l['lang']][$l['key']])) {
                    $l['value'] = $langArr[$l['lang']][$l['key']]['value'];
                    $l['change'] = true;
                    $l['localID'] = $langArr[$l['lang']][$l['key']]['ID'];
                } else {
                    $l['change'] = false;
                    $l['localID'] = false;
                    unset($l['value']);
                }
                $langResult[] = $l;
            }
        } else {

            foreach ($langRootList as $l) {
                if (isset($langArr[$l['lang']][$l['key']])) {
                    $langResult[$l['key']] = $langArr[$l['lang']][$l['key']]['value'];
                } else {
                    $langResult[$l['key']] = $l['value'];
                }
            }
            return array('response' => $langResult);
        }
        return $langResult;
    }

    /**
     * @return mixed
     */
    public function put_index() {
        $key = $this->Data->getPost('key');
        $value = $this->Data->getPost('value');
        $lang = $this->Data->getPost('lang');
        if( !$key || !$lang ){
            $return['response'] = false;
            return $return;
        }
        
        $res = $this->Lang->set($key, $value, $lang);
        if( $res ){
            if( is_numeric($res) && $res > 0 ){
                $return['localID'] = $res;
            }
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
    public function delete_index( $ID ){
        $data['ID'] = $ID;
        if( intval($ID) > 0 ){
            if( $this->Lang->delete( 'ID' ,$ID ) ){
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

    protected function getData()
    {
        return $this->Data;
    }

    protected function getLang()
    {
        return $this->Lang;
    }

    protected function getLangRoot()
    {
        return $this->LangRoot;
    }

    protected function getExportImport()
    {
        return $this->ExportImport;
    }
    protected function getUploader()
    {
        return $this->Uploader;
    }
}
