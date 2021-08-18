<?php

namespace DreamSoft\Controllers\Components;
/**
 * Programista Rafał Leśniak - 9.6.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 09-06-2017
 * Time: 16:12
 */

use DreamSoft\Core\Component;

class CustomName extends Component {

    /**
     * @param $data
     * @return array
     */
    public function prepareCustomNames($data)
    {
        if( !$data ) {
            return array();
        }
        $list = array();
        foreach ($data as $row) {
            $list[$row['lang']] = $row['name'];
        }

        return $list;

    }

}