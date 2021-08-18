<?php
/**
 * Programista Rafał Leśniak - 21.7.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 21-07-2017
 * Time: 14:28
 */

namespace DreamSoft\Libs\DHLClient;

use SoapClient;

class Version extends SoapClient
{
    const WSDL = 'https://sandbox.dhl24.com.pl/webapi2';

    public function __construct()
    {
        parent::__construct( self::WSDL );
    }
}