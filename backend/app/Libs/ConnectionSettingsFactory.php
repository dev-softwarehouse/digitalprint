<?php
/**
 * Programmer Rafał Leśniak - 11.12.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 11-12-2017
 * Time: 14:29
 */

namespace DreamSoft\Libs;

use PDO;
use PDOException;

class ConnectionSettingsFactory extends ConnectionFactory
{

    public function __construct()
    {

        try {

            $testGlobalPersistent = DB_GLOBAL_PERSISTENT === 'true' ? true : false;

            $db = new PDO('mysql:host=' . DB_SETTINGS_HOST . ';dbname=' . DB_SETTINGS_DATABASE, DB_SETTINGS_USER, DB_SETTINGS_PASSWORD,
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