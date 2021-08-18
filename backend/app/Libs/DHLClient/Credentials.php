<?php
/**
 * Programista Rafał Leśniak - 21.7.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 21-07-2017
 * Time: 15:38
 */

namespace DreamSoft\Libs\DHLClient;

use stdClass;

class Credentials
{
    /**
     * @var string
     */
    private $user;
    /**
     * @var string
     */
    private $password;
    /**
     * @var bool
     */
    private $testMode;

    const rootName = 'authData';

    public function __construct( $testMode = false )
    {
        $this->setTestMode($testMode);
    }

    /**
     * @return string
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * @param string $user
     */
    public function setUser($user)
    {
        $this->user = $user;
    }

    /**
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * @param string $password
     */
    public function setPassword($password)
    {
        $this->password = $password;
    }

    /**
     * @return bool
     */
    public function isTestMode()
    {
        return $this->testMode;
    }

    /**
     * @param bool $testMode
     */
    public function setTestMode($testMode)
    {
        $this->testMode = $testMode;
    }


    /**
     * @return array
     */
    public function getStructure()
    {
        $AuthData = new StdClass;
        $AuthData->username = $this->getUser();
        $AuthData->password = $this->getPassword();

        return $AuthData;
    }


}