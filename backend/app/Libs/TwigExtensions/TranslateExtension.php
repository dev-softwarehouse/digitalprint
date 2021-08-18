<?php
/**
 * Programmer Rafał Leśniak - 5.2.2018
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 05-02-2018
 * Time: 16:00
 */

namespace DreamSoft\Libs\TwigExtensions;

use Twig_Extension;
use Twig_SimpleFilter;
use DreamSoft\Models\Lang\LangRoot;
use DreamSoft\Models\Lang\Lang;

class TranslateExtension extends Twig_Extension
{
    /**
     * @return array
     */
    public function getFilters()
    {
        return array(
            new Twig_SimpleFilter("translate", array($this, "baseTranslate")),
        );
    }

    /**
     * @param $key
     * @param string $lang
     * @return mixed
     */
    public function baseTranslate($key, $lang = 'pl')
    {
        $LangRoot = LangRoot::getInstance();
        $Lang = Lang::getInstance();

        $regularValue = $Lang->getOne($key, $lang);

        if( $regularValue ) {
            return $regularValue['value'];
        } else {
            $rootValue = $LangRoot->getOne($key, $lang);
            if( $rootValue ) {
                return $rootValue['value'];
            }
        }

        return $key;

    }
}