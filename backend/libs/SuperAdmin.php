<?php
/**
 * Programmer Rafał Leśniak - 17.11.2017
 */

/**
 * Programmer Rafał Leśniak - 17.11.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 17-11-2017
 * Time: 10:48
 */

use DreamSoft\Libs\Debugger;
use DreamSoft\Libs\Auth;

class SuperAdmin
{
    /**
     * @var PDO
     */
    private $db;
    private $Debugger;

    public function __construct()
    {
        $settings['dbhost'] = DB_DEVELOPER_HOST;
        $settings['dbusername'] = DB_DEVELOPER_USER;
        $settings['dbpassword'] = DB_DEVELOPER_PASSWORD;
        $settings['dbname'] = DB_SETTINGS_DATABASE;

        $this->Debugger = new Debugger();
        $this->Debugger->setDebugFile('superAdmin');

        try {
            $this->db = new PDO('mysql:host=' . $settings['dbhost'] . ';dbname=' . $settings['dbname'], $settings['dbusername'], $settings['dbpassword'],
                array(
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8",
                    PDO::ATTR_PERSISTENT => true
                )
            );
            $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo $e->getMessage();
        }
    }

    public function __destruct()
    {
        $this->db = null;
    }

    /**
     * @param $login
     * @param $pass
     * @param $group
     * @param $name
     * @return bool
     * @throws Exception
     */
    public function newSuperUser($login, $pass, $group, $name)
    {

        if (!$this->freeLogin($login)) {
            throw new Exception('Login occupied');
        }

        $query = 'INSERT INTO users (
              user,
              pass,
              thegroup,
              name
              ) VALUES (
              :login,
              :pass,
              :group,
              :name
              ) 
            ';

        $pass = hash('sha512', $pass . Auth::salt);

        try {

            $stmt = $this->db->prepare($query);

            $stmt->bindValue('login', $login, PDO::PARAM_STR);
            $stmt->bindValue('pass', $pass, PDO::PARAM_STR);
            $stmt->bindValue('group', $group, PDO::PARAM_INT);
            $stmt->bindValue('name', $name, PDO::PARAM_STR);

            $stmt->execute();

            return $this->db->lastInsertId();
        } catch (PDOException $e) {
            $this->Debugger->debug($e->getMessage());
        }

        return false;

    }

    /**
     * @param $login
     * @param $database
     * @return bool
     */
    public function newSuperUserSettings($login, $database)
    {
        $id = $this->getUserID($login);

        $query = 'INSERT INTO `users_settings` (
                  `ID`,
                  `database`,
                  `dbpass`) VALUES (
                  :id,
                  :database,
                  :dbpass
                  )';

        $database = $id . $database;

        $dbpass = substr(md5(time() . Auth::salt), 10, 10);

        try {

            $stmt = $this->db->prepare($query);

            $stmt->bindValue('id', $id, PDO::PARAM_INT);
            $stmt->bindValue('database', $database, PDO::PARAM_STR);
            $stmt->bindValue('dbpass', $dbpass, PDO::PARAM_STR);

            $stmt->execute();

            return $this->db->lastInsertId();
        } catch (PDOException $e) {
            $this->Debugger->debug($e->getMessage());
        }

        return false;

    }

    /**
     * @param $login
     * @return bool
     */
    public function freeLogin($login)
    {

        $query = 'SELECT ID FROM users WHERE user = :login';

        try {

            $stmt = $this->db->prepare($query);

            $stmt->bindValue('login', $login, PDO::PARAM_STR);

            $stmt->execute();

            if ( $stmt->rowCount() == 0 ) {
                return true;
            } else {
                return false;
            }

        } catch (PDOException $e) {
            $this->Debugger->debug($e->getMessage());
        }

        return false;

    }

    /**
     * @param $login
     * @return int
     */
    public function getUserID($login)
    {

        $query = 'SELECT ID FROM users WHERE user = :login';
        $binds[':login'] = $login;

        try {

            $stmt = $this->db->prepare($query);

            $stmt->bindValue('login', $login, PDO::PARAM_STR);

            $stmt->execute();

            return $stmt->fetchColumn();
        } catch (PDOException $e) {
            $this->Debugger->debug($e->getMessage());
        }

        return false;

    }

    public function getSettings($id)
    {
        $query = "SELECT `database`, `dbpass` FROM users_settings WHERE ID = :id";

        try {

            $stmt = $this->db->prepare($query);

            $stmt->bindValue('id', $id, PDO::PARAM_INT);

            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            $this->Debugger->debug($e->getMessage());
        }

        return false;
    }

}