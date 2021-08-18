<?php

namespace DreamSoft\Models\Behaviours;

use DreamSoft\Libs\Debugger;

/**
 * Description of UrlMaker
 *
 * @author Rafał
 */
class UrlMaker extends Debugger
{

    /**
     * UrlMaker constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @param $value
     * @return string|string[]
     */
    public function permalink($value)
    {
        $result = strtolower($value);
        $aReplacePL = array('ą' => 'a', 'ę' => 'e', 'ś' => 's', 'ć' => 'c',
            'ó' => 'o', 'ń' => 'n', 'ż' => 'z', 'ź' => 'z',
            'ł' => 'l', 'Ą' => 'A', 'Ę' => 'E', 'Ś' => 'S',
            'Ć' => 'C', 'Ó' => 'O', 'Ń' => 'N', 'Ż' => 'Z',
            'Ź' => 'Z', 'Ł' => 'L');
        $replaceCyrillic = array(
            'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п',
            'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я',
            'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П',
            'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'
        );
        $latin = array(
            'a', 'b', 'v', 'g', 'd', 'e', 'io', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p',
            'r', 's', 't', 'u', 'f', 'h', 'ts', 'ch', 'sh', 'sht', 'a', 'i', 'y', 'e', 'yu', 'ya',
            'A', 'B', 'V', 'G', 'D', 'E', 'Io', 'Zh', 'Z', 'I', 'Y', 'K', 'L', 'M', 'N', 'O', 'P',
            'R', 'S', 'T', 'U', 'F', 'H', 'Ts', 'Ch', 'Sh', 'Sht', 'A', 'I', 'Y', 'e', 'Yu', 'Ya'
        );
        $result = str_replace(array_keys($aReplacePL), array_values($aReplacePL), $result);
        $result = str_replace($replaceCyrillic, $latin, $result);
        return str_replace(" ", "-", preg_replace("/[^a-zA-Z0-9 .\-:\/]/", "", $result));
    }
}
