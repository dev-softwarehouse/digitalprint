<?php
/**
 * Created by PhpStorm.
 * User: rafal
 * Date: 23.02.17
 * Time: 16:57
 */

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;


class Standard extends Component
{
    protected $Model;

    public function __construct()
    {
        parent::__construct();
    }

    public function setModel($Model)
    {
        $this->Model = $Model;
    }

    /**
     * @param $post
     * @param string $func
     * @return mixed
     */
    public function sort($post, $func = 'sort')
    {
        try {
            $response = call_user_func(array($this->Model, $func), $post);
            $return['response'] = $response;
        } catch (\Exception $ex) {
            $return['error'] = $ex->getMessage();
            $return['response'] = false;
        }
        return $return;
    }

    /**
     * @param $list
     * @param $sortBy
     * @return array
     */
    public function sortData($list, $sortBy)
    {
        $notSortIndex = -1;
        $sortResult = array();
        foreach ($list as $item) {
            if ($item[$sortBy] == NULL) {
                $sortResult[$notSortIndex] = $item;
                $notSortIndex--;
            } else {
                $sortResult[$item[$sortBy]] = $item;
            }
        }
        ksort($sortResult);

        $list = array_values($sortResult);

        return $list;
    }

    /**
     * @param $value
     * @return float
     */
    public function floatToDb($value)
    {
        return floatval(str_replace(',', '.', $value));
    }

    /**
     * @param $value
     * @return float
     */
    public function normalizeLength($value, $unit)
    {
        if (strpos($value, ',') !== false) {
            $value = str_replace(',', '.', $value);
        }
        if ($unit == 2) {
            $value = floatval($value);
            $value = round($value, 1);
            $value *= 10;
        } else {
            $value = round($value, 0);
        }
        return $value;
    }

    /**
     * @param $data
     * @param $key
     * @param $name
     * @return mixed
     */
    public function convertToCentimeter($data, $key, $name)
    {
        if( intval($data[$key][$name]) > 0 ) {
            $data[$key][$name] /= 10;
        }
        return $data;
    }

    /**
     * @param $secret
     * @param $response
     * @return mixed
     */
    public function sendCaptchaVerify($secret, $response)
    {
        $data = array(
            'secret' => $secret,
            'response' => $response
        );

        $verify = curl_init();
        curl_setopt($verify, CURLOPT_URL, RE_CAPTCHA_VERIFY_URL);
        curl_setopt($verify, CURLOPT_POST, true);
        curl_setopt($verify, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($verify, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($verify, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($verify);

        return json_decode($response, true);
    }

    /**
     * @param $a
     * @param $b
     * @return int
     */
    public function sortLikeJs($a, $b)
    {
        if (is_numeric($a) && is_string($b)) {
            return 1;
        }
        if (is_numeric($b) && is_string($a)) {
            return -1;
        }
        if (is_numeric($a) && is_numeric($b)) {
            return ($a < $b) ? -1 : 1;
        }
        if (is_string($a) && is_string($b)) {
            return strnatcmp($a, $b);
        }
        return 0;
    }

    public function getValidNumber($number)
    {
        $number = number_format( $number , 4 , "." , "" );
        return $number;
    }

    public function getNumberToView($value, $dot = ','){
        if( $dot == ',' ){
            $value = str_replace('.', $dot, $value);
        }
        return $value;
    }

    public function objectToArray($object) {
        if (is_object($object)) {
            $object = get_object_vars($object);
        }

        if (is_array($object)) {
            return array_map(array($this,'objectToArray'), $object);
        }
        else {
            return $object;
        }
    }

    /**
     * @param $name
     * @return mixed
     */
    public function permalink($name)
    {
        $result = strtolower($name);
        $aReplacePL = array('ą' => 'a', 'ę' => 'e', 'ś' => 's', 'ć' => 'c',
            'ó' => 'o', 'ń' => 'n', 'ż' => 'z', 'ź' => 'z',
            'ł' => 'l', 'Ą' => 'A', 'Ę' => 'E', 'Ś' => 'S',
            'Ć' => 'C', 'Ó' => 'O', 'Ń' => 'N', 'Ż' => 'Z',
            'Ź' => 'Z', 'Ł' => 'L');
        $result = str_replace(array_keys($aReplacePL), array_values($aReplacePL), $result);
        return str_replace(" ", "-", preg_replace("/[^a-zA-Z0-9.-]/", "", $result));
    }
}
