<?php
/**
 * Programista Rafał Leśniak - 21.7.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 21-07-2017
 * Time: 14:40
 */

namespace DreamSoft\Libs\DHLClient;

use SoapClient;

class Auth extends SoapClient
{
    const WSDL_SANDBOX = 'https://sandbox.dhl24.com.pl/webapi2';
    const WSDL_PROD = 'https://dhl24.com.pl/webapi2';

    private $testMode;

    /**
     * @var Credentials
     */
    private $credentials;

    public function __construct( $credentials, $testMode = false )
    {
        $this->setTestMode($testMode);
        $this->setCredentials($credentials);

        if( $testMode ) {
            $wsdl = self::WSDL_SANDBOX;
        } else {
            $wsdl = self::WSDL_PROD;
        }
        parent::__construct( $wsdl, array('trace' => true) );
    }

    /**
     * @return Credentials
     */
    public function getCredentials()
    {
        return $this->credentials;
    }

    /**
     * @param Credentials $credentials
     */
    public function setCredentials($credentials)
    {
        $this->credentials = $credentials;
    }



    /**
     * @return mixed
     */
    public function getTestMode()
    {
        return $this->testMode;
    }

    /**
     * @param mixed $testMode
     */
    public function setTestMode($testMode)
    {
        $this->testMode = $testMode;
    }


}