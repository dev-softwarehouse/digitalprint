<?php
/**
 * Programista Rafał Leśniak - 21.7.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 21-07-2017
 * Time: 17:27
 */

namespace DreamSoft\Libs\DHLClient;

use DOMDocument;
use DreamSoft\Libs\Debugger;
use Exception;
use SimpleXMLElement;
use SoapClient;
use SoapFault;
use StdClass;

class Shipment extends SoapDHL
{
    /**
     * @var Shipper
     */
    private $Shipper;
    /**
     * @var Receiver
     */
    private $Receiver;
    /**
     * @var Payment
     */
    private $Payment;
    /**
     * @var Piece
     */
    private $Piece;
    /**
     * @var Service
     */
    private $Service;

    /**
     * @var string
     */
    private $shipmentDate;
    /**
     * @var string
     */
    private $content;

    const rootName = 'shipments';

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

    public function createShipment()
    {
        $data = new StdClass();
        $data->authData = $this->getAuthData()->getStructure();

        $data->shipments = new StdClass;
        $data->shipments->item = new StdClass();
        $data->shipments->item->shipmentDate = $this->getShipmentDate();
        $data->shipments->item->skipRestrictionCheck = false;
        $data->shipments->item->content = $this->getContent();

        $data->shipments->item->shipper = $this->getShipper()->getStructure();
        $data->shipments->item->receiver = $this->getReceiver()->getStructure();
        $data->shipments->item->pieceList = new stdClass();
        $data->shipments->item->pieceList->item = $this->getPiece()->getStructure();
        $data->shipments->item->payment = $this->getPayment()->getStructure();
        $data->shipments->item->service = $this->getService()->getStructure();

        $soapSuccess = false;
        $response = null;
        try {
            $soapSuccess = true;
            $this->createShipments($data);
        } catch (SoapFault $exception) {
            throw new Exception($exception->getMessage());
        }

        if( $soapSuccess ) {
            $soapResponse = $this->__getLastResponse();

            $xml = simplexml_load_string($soapResponse);
            $item = $xml->children('SOAP-ENV', true)->Body->children('ns1', true)->
            createShipmentsResponse->children('', true)->createShipmentsResult->item;

            $response = $item;
        }
        return $response;

    }

    /**
     * @return Shipper
     */
    public function getShipper()
    {
        return $this->Shipper;
    }

    /**
     * @param Shipper $Shipper
     */
    public function setShipper($Shipper)
    {
        $this->Shipper = $Shipper;
    }

    /**
     * @return Receiver
     */
    public function getReceiver()
    {
        return $this->Receiver;
    }

    /**
     * @param Receiver $Receiver
     */
    public function setReceiver($Receiver)
    {
        $this->Receiver = $Receiver;
    }

    /**
     * @return Payment
     */
    public function getPayment()
    {
        return $this->Payment;
    }

    /**
     * @param Payment $Payment
     */
    public function setPayment($Payment)
    {
        $this->Payment = $Payment;
    }

    /**
     * @return Piece
     */
    public function getPiece()
    {
        return $this->Piece;
    }

    /**
     * @param Piece $Piece
     */
    public function setPiece($Piece)
    {
        $this->Piece = $Piece;
    }

    /**
     * @return Service
     */
    public function getService()
    {
        return $this->Service;
    }

    /**
     * @param Service $Service
     */
    public function setService($Service)
    {
        $this->Service = $Service;
    }

    /**
     * @return string
     */
    public function getShipmentDate()
    {
        return $this->shipmentDate;
    }

    /**
     * @param string $shipmentDate
     */
    public function setShipmentDate($shipmentDate)
    {
        $this->shipmentDate = $shipmentDate;
    }

    /**
     * @return string
     */
    public function getContent()
    {
        return $this->content;
    }

    /**
     * @param string $content
     */
    public function setContent($content)
    {
        $this->content = $content;
    }


}