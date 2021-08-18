<?php

namespace DreamSoft\Controllers\Components;
/**
 * Description of Lang
 *
 * @author Rafał
 */

use DreamSoft\Models\Lang\Lang;
use DreamSoft\Models\Lang\LangRoot;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Core\Component;
use DreamSoft\Models\Domain\Domain;

/**
 * Class LangComponent
 */
class LangComponent extends Component
{

    public $useModels = array();

    /**
     * @var LangSetting
     */
    protected $LangSetting;
    /**
     * @var LangRoot
     */
    protected $LangRoot;
    /**
     * @var Lang
     */
    protected $Lang;
    /**
     * @var Domain
     */
    protected $Domain;

    /**
     * LangComponent constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->LangSetting = LangSetting::getInstance();
        $this->Lang = Lang::getInstance();
        $this->LangRoot = LangRoot::getInstance();
        $this->Domain = Domain::getInstance();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->LangSetting->setDomainID($domainID);
    }

    /**
     * @param null $langCode
     * @return array|bool
     */
    public function getList($langCode = NULL)
    {
        if (strlen($langCode) > 0) {
            $lang = $this->LangSetting->customGet($langCode);
            if (!$lang) {
                return false;
            }
        }

        if (isset($lang['code'])) {
            $langRootList = $this->LangRoot->getAll($lang['code']);
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
            return $langResult;
        }
        return $langResult;
    }

    /**
     * @param $key
     * @return array
     */
    public function translate($key)
    {

        $mainTranslates = $this->LangRoot->get('key', $key, true);
        if (!$mainTranslates) {
            return array();
        }

        $companyTranslates = $this->Lang->get('key', $key, true);
        $companyTranslates = $this->parseLocalTranslate($companyTranslates);

        $result = array();
        foreach ($mainTranslates as $translate) {
            if ($companyTranslates[$translate['lang']]) {
                $result[$translate['lang']] = $companyTranslates[$translate['lang']];
            } else {
                $result[$translate['lang']] = $translate['value'];
            }
        }

        return $result;
    }

    /**
     * @param $translates
     * @return array|bool
     */
    private function parseLocalTranslate($translates)
    {
        if (!$translates) {
            return false;
        }
        $result = array();
        foreach ($translates as $translate) {
            $result[$translate['lang']] = $translate['value'];
        }
        return $result;
    }

}
