<?php
/**
 * Programmer Rafał Leśniak - 11.12.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 11-12-2017
 * Time: 14:04
 */

namespace DreamSoft\Libs;

use PDO;
use PDOException;
use PDOStatement;

class ConnectionMasterFactory extends ConnectionFactory
{

    public function __construct()
    {
        try {

            $testGlobalPersistent = DB_GLOBAL_PERSISTENT === 'true' ? true : false;

            $db = new PDO('mysql:host=' . DB_MASTER_HOST . ';dbname=' . DB_MASTER_DATABASE, DB_MASTER_USER, DB_MASTER_PASSWORD,
                array(
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8",
                    PDO::ATTR_PERSISTENT => $testGlobalPersistent
                )
            );

            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->setPdo($db);

        } catch (PDOException $e) {
            echo $e->getMessage();
        }
    }

    public function __destruct()
    {
        parent::__destruct();
    }

}