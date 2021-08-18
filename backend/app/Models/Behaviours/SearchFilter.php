<?php
/**
 * Programista Rafał Leśniak - 14.6.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 14-06-2017
 * Time: 13:16
 */

namespace DreamSoft\Models\Behaviours;


use DreamSoft\Libs\Debugger;

class SearchFilter extends Debugger
{
    /**
     * SearchFilter constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @param $text
     * @return mixed|string
     */
    public function prepareString( $text )
    {
        $result = strtolower($text);
        $aReplacePL = array('ą' => 'a', 'ę' => 'e', 'ś' => 's', 'ć' => 'c',
            'ó' => 'o', 'ń' => 'n', 'ż' => 'z', 'ź' => 'z',
            'ł' => 'l', 'Ą' => 'A', 'Ę' => 'E', 'Ś' => 'S',
            'Ć' => 'C', 'Ó' => 'O', 'Ń' => 'N', 'Ż' => 'Z',
            'Ź' => 'Z', 'Ł' => 'L');
        $result = str_replace(array_keys($aReplacePL), array_values($aReplacePL), $result);
        return $result;
    }
}