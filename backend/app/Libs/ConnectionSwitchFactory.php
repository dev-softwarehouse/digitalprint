<?php
/**
 * Programmer Rafał Leśniak - 11.12.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 11-12-2017
 * Time: 13:41
 */
namespace DreamSoft\Libs;

use Exception;
use PDO;
use PDOException;
use PDOStatement;

class ConnectionSwitchFactory
{

    private $connection;
    private $companyDbSettings = array();
    private $Debugger;

    /**
     * @return mixed
     */
    public function getConnection()
    {
        return $this->connection;
    }

    /**
     * @param mixed $connection
     */
    public function setConnection($connection)
    {
        $this->connection = $connection;
    }

    /**
     * @return array
     */
    public function getCompanyDbSettings()
    {
        return $this->companyDbSettings;
    }

    /**
     * @param $companyDbSettings
     */
    public function setCompanyDbSettings($companyDbSettings)
    {
        $this->companyDbSettings = $companyDbSettings;
    }

    /**
     * ConnectionSwitchFactory constructor.
     * @param bool $root
     * @param null $companyID
     * @throws Exception
     */
    public function __construct( $root = false, $companyID = NULL )
    {
        $this->Debugger = new Debugger();
        $this->Debugger->setDebugFile('db_errors');

        try {

            if( $root == true ) {

                $connection = new ConnectionMasterFactory();
                $this->setConnection( $connection );

            } else {

                $settings['dbusername'] = PRINTING_HOUSE_DB_USER;
                $settings['dbpassword'] = PRINTING_HOUSE_DB_PASSWORD;
                $settings['dbname'] = PRINTING_HOUSE_DB_NAME;
                $settings['dbhost'] = DB_PRINT_HOUSE_HOST;

                $this->setCompanyDbSettings($settings);

                $connection = ConnectionUserFactory::getInstance();

                $connection->connect($settings);

                $this->setConnection($connection);

                $settingsDb = null;

            }

        } catch (Exception $exception) {
            $this->Debugger->debug($exception->getMessage());
            throw new Exception($exception->getMessage());
        }

    }

    public function __destruct()
    {
        $this->connection = null;
    }

    /**
     * @param $query
     * @return array
     */
    public function executeForAll($query)
    {
        $settingsConnection = ConnectionSettingsFactory::getInstance();
        $settingsDb = $settingsConnection->getPdo();

        $usersQuery = ('SELECT `user`, `ID` FROM `users` WHERE `ID` > 1');
        $stmt = $settingsDb->prepare($usersQuery);
        $stmt->execute();

        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $results = array();
        $passes = 0;
        $fails = 0;

        foreach ($users as $user) {

            $settings['dbusername'] = DB_DEVELOPER_USER;
            $settings['dbpassword'] = DB_DEVELOPER_PASSWORD;

            $settingsQuery = ('SELECT `database` FROM `users_settings` WHERE ID = :ID');
            $stmt = $settingsDb->prepare($settingsQuery);
            $stmt->bindValue('ID', $user['ID'], PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() != 1) return false;

            $row = $stmt->fetch();

            $settings['dbname'] = $row['database'];
            $settings['dbhost'] = DB_DEVELOPER_HOST;

            $this->setCompanyDbSettings($settings);

            $connection = ConnectionUserFactory::getInstance();

            $connection->connect($settings);
            $companyDb = $connection->getPdo();

            try {
                $companyStmt = $companyDb->prepare($query);
                $companyResult = $companyStmt->execute();

                $results[] = array(
                    'companyID' => $user['ID'],
                    'result' => $companyResult
                );
                $passes++;
            } catch (PDOException $exception) {
                $results[] = array(
                    'companyID' => $user['ID'],
                    'error' => $exception->getMessage()
                );
                $fails++;
            }

            if( $stmt instanceof PDOStatement) {
                $stmt->closeCursor();
            }
            $stmt = null;

        }

        $settingsDb = null;

        return compact('results', 'passes', 'fails');
    }

}