<?php
/**
 * Created by PhpStorm.
 * User: lenovo
 * Date: 16.01.19
 * Time: 11:18
 */

namespace DreamSoft\Core;
use DreamSoft\Libs\Debugger;
use MongoDB\Client as Mongo;
use Exception;

class MongoModel extends Debugger
{
    public $db;

    public function __construct() {
        try {

            $dbName = 'editor_'.companyID;

            $uri = 'mongodb://' . MONGO_DB_USER . ':' . MONGO_DB_PWD . '@' . MONGO_DB_HOST . ':27017/?authSource=admin';
            $connection = new Mongo($uri);
            $this->db = $connection->selectDatabase($dbName);

        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }
    }
}