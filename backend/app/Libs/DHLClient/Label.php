<?php
/**
 * Programista Rafał Leśniak - 28.7.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 28-07-2017
 * Time: 18:33
 */

namespace DreamSoft\Libs\DHLClient;


use DreamSoft\Libs\Debugger;
use SoapFault;
use stdClass;
use Exception;

class Label extends SoapDHL
{

    public function __construct( $testMode = false )
    {
        $this->setTestMode($testMode);

        if( $testMode ) {
            $wsdl = self::WSDL_SANDBOX;
        } else {
            $wsdl = self::WSDL_PROD;
        }
        parent::__construct( $wsdl, array('trace' => true, 'features' => SOAP_SINGLE_ELEMENT_ARRAYS) );
    }

    /**
     * @param $shipmentId
     * @param string $labelType
     * @return null
     */
    public function getLabel( $shipmentId, $labelType = DHL_DEFAULT_LABEL_TYPE )
    {
        $data = new StdClass();
        $data->authData = $this->getAuthData()->getStructure();

        $data->itemsToPrint = new StdClass();
        $data->itemsToPrint->item = new StdClass();
        $data->itemsToPrint->item->labelType = $labelType;
        $data->itemsToPrint->item->shipmentId = $shipmentId;

        $soapSuccess = false;
        $response = null;
        try {
            $soapSuccess = true;
            $this->getLabels($data);
        } catch (SoapFault $exception) {
            throw new Exception($exception->getMessage());
        }

        if( $soapSuccess ) {
            $soapResponse = $this->__getLastResponse();

            $xml = simplexml_load_string($soapResponse);
            $item = $xml->children('SOAP-ENV', true)->Body->children('ns1', true)->
            getLabelsResponse->children('', true)->getLabelsResult->item;

            $response = $item;
        }
        return $response;
    }


}