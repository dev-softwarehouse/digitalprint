<?php
/**
 * Programmer Rafał Leśniak - 11.12.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 11-12-2017
 * Time: 14:34
 */

namespace DreamSoft\Libs;

use PDO;
use PDOException;
use Exception;
use PDOStatement;

class ConnectionUserFactory extends ConnectionFactory
{
    private $settings = array();

    /**
     * @return mixed
     */
    public function getSettings()
    {
        return $this->settings;
    }

    /**
     * @param mixed $settings
     */
    public function setSettings($settings)
    {
        $this->settings = $settings;
    }

    public function __construct()
    {

    }

    public function __destruct()
    {
        parent::__destruct();
    }

    public function connect( $settings )
    {
        try {
            $this->setSettings($settings);

            $testGlobalPersistent = DB_GLOBAL_PERSISTENT === 'true' ? true : false;

            $db = new PDO('mysql:host='. $settings['dbhost'] .';dbname=' . $settings['dbname'], $settings['dbusername'], $settings['dbpassword'],
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

    /**
     * @param bool $root
     * @param null $companyID
     * @return bool
     */
    public function selectDatabase($root = false, $companyID = NULL)
    {
        try {
            if ($root) {
                $settings['dbusername'] = DB_MASTER_USER;
                $settings['dbpassword'] = DB_MASTER_PASSWORD;
                $settings['dbname'] = DB_MASTER_DATABASE;
                $settings['dbhost'] = DB_MASTER_HOST;
                return $settings;
            }
            if ($companyID == NULL) {
                $companyID = companyID;
            }

            $pdo = new PDO('mysql:host=localhost;dbname='.DB_SETTINGS_DATABASE, DB_SETTINGS_USER, DB_SETTINGS_PASSWORD,
                array(
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8",
                    PDO::ATTR_PERSISTENT => boolval(DB_GLOBAL_PERSISTENT)
                )
            );
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $query = ('SELECT `user` FROM `users` WHERE ID = :id');
            $stmt = $pdo->prepare($query);
            $stmt->bindValue(':id', $companyID, PDO::PARAM_INT);
            $stmt->execute();

            $settings['dbusername'] = 'v_' . $stmt->fetchColumn();

            if( $stmt instanceof PDOStatement) {
                $stmt->closeCursor();
            }
            $stmt = null;

            $query = ('SELECT `database`, `dbpass` FROM `users_settings` WHERE ID = :id');
            $stmt = $pdo->prepare($query);
            $stmt->bindValue(':id', $companyID, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() != 1) return false;

            $row = $stmt->fetch();

            if( $stmt instanceof PDOStatement) {
                $stmt->closeCursor();
            }
            $stmt = null;

            $settings['dbpassword'] = $row['dbpass'];
            $settings['dbname'] = $row['database'];
            $settings['dbhost'] = DB_PRINT_HOUSE_HOST;

            $pdo = null;

            return $settings;
        } catch (PDOException $e) {
            die($e->getMessage());
        }
        return false;
    }
}