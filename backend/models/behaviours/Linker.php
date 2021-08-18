<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Linker
 *
 * @author Rafał
 */
class Linker {
    
    public function __construct() {
        
    }
    
    public function getModel( $name ){
        $name = ucfirst(strtolower($name));
        if( is_file('../'.$name.'.php') ){
            require_once '../'.$name.'.php';
            $Model = new $name;
            return $Model;
        } else {
            return false;
        }
    }
    
}
