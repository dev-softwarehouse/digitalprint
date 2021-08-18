<?php
/**
 * Programista Rafał Leśniak - 22.6.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 22-06-2017
 * Time: 15:56
 */

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;

class QueryFilter extends Component {

    public $signs = array(
        'l' => '<',
        'lt' => '<=',
        'g' => '>',
        'gt' => '>=',
        'e' => '=',
        'li' => 'LIKE',
        'lip' => 'LIKE-PART',
        'not' => '!='
    );

    public function __construct (  ) {
        parent::__construct();
    }

    public function prepare($configs, $request){

        $result = array();

        if( !empty($request) ){

            foreach($request as $fKey => $f){

                if( !is_array($configs) ) {
                    continue;
                }

                if( !in_array($fKey, array_keys($configs)) ){
                    continue;
                }

                if( strlen($f) == 0 ) {
                    continue;
                }

                $actType = isset($configs[$fKey]['type']) ? $configs[$fKey]['type'] : 'string';
                $actTable = isset($configs[$fKey]['table']) ? $configs[$fKey]['table'] : 'cart';
                $actSign = isset($configs[$fKey]['sign']) ? $configs[$fKey]['sign'] : $this->signs['e'];

                $actValue = $f;

                if( !isset($configs[$fKey]['field']) ){
                    continue;
                }

                if( $actType == 'string' ){
                    $actValue = urldecode($actValue);
                }

                if( $actSign == 'LIKE' ){
                    $actValue = '%'.$actValue.'%';
                }

                $orEmpty = NULL;
                if( array_key_exists('orEmpty', $configs[$fKey]) ) {
                    $orEmpty = $configs[$fKey]['orEmpty'];
                }

                $result[$fKey] = array(
                    'value' => $actValue,
                    'type' => $actType,
                    'table' => $actTable,
                    'field' => $configs[$fKey]['field'],
                    'sign' => $actSign,
                    'orEmpty' => $orEmpty
                );
                unset($actSign);
                unset($actTable);
                unset($actType);
                unset($actValue);
            }
        }

        if( !empty($configs) ){
            foreach( $configs as $k => $c ){
                if( !array_key_exists($k, $result) && isset($c['default']) && strlen($c['default']) > 0 ){
                    $actType = isset($configs[$k]['type']) ? $configs[$k]['type'] : 'string';
                    $actTable = isset($configs[$k]['table']) ? $configs[$k]['table'] : 'cart';
                    $actSign = isset($configs[$k]['sign']) ? $configs[$k]['sign'] : $this->signs['e'];
                    $actAlias = isset($configs[$k]['alias']) ? $configs[$k]['alias'] : false;
                    if( $actSign == 'LIKE' ){
                        $actValue = '%'.$c['default'].'%';
                    } else {
                        $actValue = $c['default'];
                    }

                    $orEmpty = NULL;
                    if( array_key_exists('orEmpty', $configs[$k]) ) {
                        $orEmpty = $configs[$k]['orEmpty'];
                    }
                    $result[$k] = array(
                        'value' => $actValue,
                        'type' => $actType,
                        'table' => $actTable,
                        'field' => $configs[$k]['field'],
                        'sign' => $actSign,
                        'orEmpty' => $orEmpty,
                        'alias' => $actAlias
                    );
                }
                unset($actSign);
                unset($actTable);
                unset($actType);
                unset($actValue);
                unset($actAlias);
            }
        }
        return $result;
    }
}