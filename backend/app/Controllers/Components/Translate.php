<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 06-07-2018
 * Time: 11:32
 */

namespace DreamSoft\Controllers\Components;

use DreamSoft\Models\Lang\Lang;
use DreamSoft\Models\Lang\LangRoot;
use DreamSoft\Core\Component;

class Translate extends Component
{
    /**
     * @var LangRoot
     */
    private $LangRoot;
    /**
     * @var Lang
     */
    private $Lang;

    /**
     * LangComponent constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->Lang = Lang::getInstance();
        $this->LangRoot = LangRoot::getInstance();
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