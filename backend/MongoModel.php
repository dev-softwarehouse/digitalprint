<?php

/**
 * Description of MongoModel
 *
 * @author Rafał
 */

require_once (BASE_DIR.'libs/ActiveMongo/ActiveMongo.php');

use DreamSoft\Models;

class MongoModel extends ActiveMongo {
    
    public $hasMany = array();
    
    public function __construct() {
        $dbName = 'editor_'.companyID;
        ActiveMongo::connect($dbName, MONGO_DB_HOST, MONGO_DB_USER, MONGO_DB_PWD);
    }
}
