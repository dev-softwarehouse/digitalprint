<?php
/**
 * Programista Rafał Leśniak - 28.3.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 28-03-2017
 * Time: 18:19
 */
namespace DreamSoft\Models\Behaviours;

use DreamSoft\Libs\Debugger;

class LangFilter extends Debugger
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @param $arr
     * @param $name
     * @return mixed
     */
    public function splitArray($arr, $name)
    {
        if (empty($arr)) {
            return $arr;
        }

        foreach ($arr as $key => $row) {
            if (strlen($row[$name])) {
                unset($arr[$key][$name]);
                $exp1 = explode("||", $row[$name]);
                foreach ($exp1 as $oneLang) {
                    $exp2 = explode("::", $oneLang);
                    $arr[$key][$name][$exp2[0]]['name'] = $exp2[1];
                }
            } else {
                unset($arr[$key][$name]);
            }
        }

        return $arr;
    }

    /**
     * @param $arr
     * @param $name
     * @return mixed
     */
    public function splitArrayWithUrl($arr, $name)
    {
        if (empty($arr)) {
            return $arr;
        }

        foreach ($arr as $key => $row) {
            if (strlen($row[$name])) {
                unset($arr[$key][$name]);
                $exp1 = explode("||", $row[$name]);
                foreach ($exp1 as $oneLang) {
                    $exp2 = explode("::", $oneLang);
                    $arr[$key][$name][$exp2[0]]['url'] = $exp2[1];
                    $arr[$key][$name][$exp2[0]]['name'] = $exp2[2];
                }
            } else {
                unset($arr[$key][$name]);
            }
        }

        return $arr;
    }

    /**
     * @param $row
     * @param $name
     * @return mixed
     */
    public function splitOne($row, $name)
    {
        if (strlen($row[$name])) {
            $one = $row[$name];
            unset($row[$name]);
            $exp1 = explode("||", $one);
            foreach ($exp1 as $oneLang) {
                $exp2 = explode("::", $oneLang);
                $row[$name][$exp2[0]]['name'] = $exp2[1];
            }
        } else {
            unset($row[$name]);
        }
        return $row;
    }

    /**
     * @param $arr
     * @param $name
     * @return mixed
     */
    public function splitFlatArray($arr, $name)
    {
        if (empty($arr)) {
            return $arr;
        }

        foreach ($arr as $key => $row) {
            if (strlen($row[$name])) {
                unset($arr[$key][$name]);
                $exp1 = explode("||", $row[$name]);
                foreach ($exp1 as $oneLang) {
                    $exp2 = explode("::", $oneLang);
                    $arr[$key][$name][$exp2[0]] = $exp2[1];
                }
            } else {
                unset($arr[$key][$name]);
            }
        }

        return $arr;
    }

    /**
     * @param $row
     * @param $name
     * @return mixed
     */
    public function splitFlatOne($row, $name)
    {
        if (strlen($row[$name])) {
            $one = $row[$name];
            unset($row[$name]);
            $exp1 = explode("||", $one);
            foreach ($exp1 as $oneLang) {
                $exp2 = explode("::", $oneLang);
                $row[$name][$exp2[0]] = $exp2[1];
            }
        } else {
            unset($row[$name]);
        }
        return $row;
    }


}