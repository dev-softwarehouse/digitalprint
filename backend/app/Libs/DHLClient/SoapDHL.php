<?php
/**
 * Programista Rafał Leśniak - 28.7.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 28-07-2017
 * Time: 18:36
 */

namespace DreamSoft\Libs\DHLClient;

use SoapClient;

class SoapDHL extends SoapClient
{
    /**
     * @var bool
     */
    private $testMode;

    /**
     * @var Credentials
     */
    private $authData;

    const WSDL_SANDBOX = 'https://sandbox.dhl24.com.pl/webapi2';
    const WSDL_PROD = 'https://dhl24.com.pl/webapi2';

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

    public function __construct($wsdl, array $options = null)
    {
        parent::__construct($wsdl, $options);
    }

    /**
     * @return Credentials
     */
    public function getAuthData()
    {
        return $this->authData;
    }

    /**
     * @param Credentials $authData
     */
    public function setAuthData($authData)
    {
        $this->authData = $authData;
    }


}