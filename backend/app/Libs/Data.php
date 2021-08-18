<?php

namespace DreamSoft\Libs;
/**
 * Description of Data
 *
 * @author Właściciel
 */
class Data {
    
    public $post = array();
    
    public function __construct() {
        $post = NULL;
        if( isset($_SERVER["CONTENT_TYPE"]) && stripos($_SERVER["CONTENT_TYPE"], "application/json") === 0) {
            $post = json_decode(file_get_contents("php://input"), true);
        } elseif( !empty($_POST) ){
            $post = $_POST;
        }
        $this->post = $post;
    }
    
    public function getPost( $key ){
        if( isset($this->post[$key]) ){
            return $this->post[$key];
        } else {
            return NULL;
        }
    }
    
    public function getAllPost() {
        return $this->post;
    }
    
}
