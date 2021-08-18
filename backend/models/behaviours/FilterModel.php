<?php


class FilterModel {

    public function __construct(){
        
    }
    
    public function prepare($filters, $logicalOperator = 'AND'){
        
        $where = '';
        $binds = array();
        $usedJoins = array();
        if( !empty($filters) ){
            foreach($filters as $key => $f) {

                if( in_array($key, $usedJoins) ) {
                    continue;
                }

                if( $f['type'] == 'timestamp' ){
                    $f['value'] = date('Y-m-d H:i:s', $f['value']);
                }
                if( $f['type'] == 'date' ){
                    $f['value'] = date('Y-m-d H:i:s', strtotime($f['value']) );
                }

                if( $f['orEmpty'] === true && intval($f['value']) > 0 ){
                    $where .= ' '.$logicalOperator.' ( `'.$f['table'].'`.`'.$f['field'].'` '.$f['sign'].' :'.$key.' OR ';
                    $where .= ' `'.$f['table'].'`.`'.$f['field'].'` IS NULL )';
                } else {

                    if( $f['sign'] === 'LIKE-PART' ){

                        if( $f['join'] ) {

                            $where.= ' '.$logicalOperator.'  ( `'.$f['table'].'`.`'.$f['field'].'` LIKE "%'.$f['value'].'%" OR 
                            `'.$filters[$f['join']]['table'].'`.`'.$filters[$f['join']]['field'].'` LIKE "%'.$filters[$f['join']]['value'].'%" ) ';

                            $usedJoins[] = $f['join'];

                        } else {
                            $where.= ' '.$logicalOperator.'  `'.$f['table'].'`.`'.$f['field'].'` LIKE "%'.$f['value'].'%" ';
                        }

                        
                    } else if ($f['sign'] === 'IN') {

                        $where.= ' '.$logicalOperator.'  `'.$f['table'].'`.`'.$f['field'].'` '.$f['sign'].' ('.$f['value'].') ';

                    } else {
                        if( $f['join'] ) {

                            $where.= ' '.$logicalOperator.'  ( `'.$f['table'].'`.`'.$f['field'].'` '.$f['sign'].' :'.$key.' OR 
                            `'.$filters[$f['join']]['table'].'`.`'.$filters[$f['join']]['field'].'` '.$filters[$f['join']]['sign'].' :'.$f['join'].' ) ';

                            $usedJoins[] = $f['join'];

                        } else {
                            $where.= ' '.$logicalOperator.'  `'.$f['table'].'`.`'.$f['field'].'` '.$f['sign'].' :'.$key;
                        }

                    }
                }
                
                if( $f['sign'] !== 'LIKE-PART' && $f['sign'] !== 'IN' ){
                    $binds[$key] = $f['value'];
                    if( $f['join'] ) {
                        $binds[$filters[$f['join']]['field']] = $filters[$f['join']]['value'];
                    }
                }
            }
        }

        return compact('where', 'binds');
    }
    
    public function checkRequired(){
        return;
    }
}
