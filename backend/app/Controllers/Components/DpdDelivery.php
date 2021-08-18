<?php

namespace DreamSoft\Controllers\Components;
/**
 * Created by PhpStorm.
 * User: rafal
 * Date: 04.11.17
 * Time: 11:26
 */

use DreamSoft\Core\Component;
use DreamSoft\Models\Setting\Setting;
use Exception;

class DpdDelivery extends Component
{

    /**
     * @var Setting
     */
    protected $Setting;
    /**
     * @var Price
     */
    protected $Price;

    public $useModels = array();

    /**
     * dpdDelivery constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->Setting = Setting::getInstance();
        $this->Price = Price::getInstance();
    }

    /**
     * @param array $preparedData
     * @param $packageWeight
     * @return mixed
     * @throws Exception
     */
    public function shipment(array $preparedData, $packageWeight)
    {

        $senderData = $this->getSenderData();
        $countryCode = $senderData['country']['value'];

        if (strlen($preparedData['address']['companyName']) > 0) {
            $mainName = $preparedData['address']['companyName'];
        } else {
            $mainName = $preparedData['address']['name'] . ' ' . $preparedData['address']['lastname'];
        }

        $shipFromAddressLine = $senderData['street']['value'] . ' ' . trim($senderData['houseNumber']['value']);
        if (strlen($senderData['flatNumber']['value']) > 0) {
            $shipFromAddressLine .= '/' . trim($senderData['flatNumber']['value']);
        }

        $shipToAddressLine = $preparedData['address']['street'] . ' ' . $preparedData['address']['house'];
        if (strlen($preparedData['address']['apartment']) > 0) {
            $shipToAddressLine .= '/' . $preparedData['address']['apartment'];
        }

        $shipperAttentionName = $senderData['contactPerson']['value'];
        if( $preparedData['senderID'] == 2 ) {
            $shipperAttentionName = $preparedData['shipFromAddress']['name'] . ' ' . $preparedData['shipFromAddress']['lastname'];
        }

        $serviceCode = $preparedData['courier']['settings']['package'].'';
        if( intval($serviceCode) < 10 ) {
            $serviceCode = "0".intval($serviceCode);
        }

        $prepareRequest = array(
            'DPDSecurity' => array(
                'UsernameToken' => array(
                    'Username' => $preparedData['courier']['settings']['login'],
                    'Password' => $preparedData['courier']['settings']['password']
                ),
                'ServiceAccessToken' => array(
                    'clientNumber' => $preparedData['courier']['settings']['shipperCode'],
                    'clientKey' => $preparedData['courier']['settings']['key_api']
                )
            ),
            'ShipmentRequest' => array(
                'Request' => array(
                    'RequestOption' => 'nonvalidate',
                    'TransactionReference' => 'Selbstdruck'
                ),
                'Shipment' => array(
                    'Description' => 'orderID: ' . $preparedData['orderID'].', productID: ' . $preparedData['orderID'],
                    'Shipper' => array(
                        'Name' => $senderData['companyName']['value'],
                        'AttentionName' => $shipperAttentionName,
                        'TaxIdentificationNumber' => str_replace('-', '',trim($senderData['nip']['value'])),
                        'Phone' => array(
                            'Number' => trim($senderData['phone']['value']),
                            "Extension" => "1"
                        ),
                        'ShipperNumber' => $preparedData['courier']['settings']['shipperNumber'],
                        'Address' => array(
                            'AddressLine' => $shipFromAddressLine,
                            'City' => $senderData['city']['value'],
                            'PostalCode' => str_replace('-', '',trim($senderData['postalCode']['value'])),
                            'CountryCode' => $countryCode
                        )
                    ),
                    'ShipTo' => array(
                        'Name' => $mainName,
                        'AttentionName' => $preparedData['address']['name'] . ' ' . $preparedData['address']['lastname'],
                        'Phone' => array(
                            'Number' => $preparedData['address']['telephone'],
                            "Extension" => "1"
                        ),
                        'Address' => array(
                            'AddressLine' => $shipToAddressLine,
                            'City' => $preparedData['address']['city'],
                            'PostalCode' => str_replace('-', '', $preparedData['address']['zipcode']),
                            'CountryCode' => $preparedData['address']['countryCode']
                        )
                    ),
                    'PaymentInformation' => array(
                        'ShipmentCharge' => array(
                            'Type' => '01',
                            'BillShipper' => array(
                                'AccountNumber' => $preparedData['courier']['settings']['shipperNumber'],
                            )
                        )
                    ),
                    'Service' => array(
                        'Code' => $serviceCode,
                        'Description' => 'Standard'
                    ),
                    'Package' => array(
                        'Description' => 'Description',
                        'Packaging' => array(
                            'Code' => '02',
                            'Description' => 'Description'
                        ),
                        'Dimensions' => array(
                            'UnitOfMeasurement' => array(
                                'Code' => 'CM',
                                'Description' => 'Centimeter'
                            ),
                            'Length' => strval($preparedData['input']['length']),
                            'Width' => strval($preparedData['input']['width']),
                            'Height' => strval($preparedData['input']['height'])
                        ),
                        'PackageWeight' => array(
                            'UnitOfMeasurement' => array(
                                'Code' => 'KGS',
                                'Description' => 'Kilo'
                            ),
                            'Weight' => strval($packageWeight)
                        )
                    ),
                    "ShipmentServiceOptions" => array(
                        "Notification" => array(
                            array(
                                "NotificationCode" => "6",
                                "EMail" => array(
                                    "EMailAddress" => (
                                    $preparedData['user']['login']
                                    )
                                )
                            ),
                            array(
                                "NotificationCode" => "7",
                                "EMail" => array(
                                    "EMailAddress" => array(
                                        $preparedData['user']['login']
                                    )
                                )
                            ),
                            array(
                                "NotificationCode" => "8",
                                "EMail" => array(
                                    "EMailAddress" => array(
                                        $preparedData['user']['login']
                                    ),
                                    "UndeliverableEMailAddress" => "noreply@digitalprint.pro",
                                    "FromEMailAddress" => "noreply@digitalprint.pro",
                                    "FromName" => "Drukarnia",
                                    "Memo" => "Dear customer! ",
                                    "Subject" => array(
                                        "SubjectCode" => "01"
                                    )
                                )
                            )
                        ),
                    )
                ),
                'LabelSpecification' => array(
                    'LabelImageFormat' => array(
                        'Code' => 'GIF',
                        'Description' => 'GIF'
                    ),
                    "LabelStockSize" => array(
                        "Height" => 8,
                        "Width" => 4
                    )
                )
            )
        );

        if( intval($preparedData['courier']['settings']['cod']) == 1) {

            $codRequest = array(
                "CODFundsCode" => "1",
                "CODAmount" => array(
                    "MonetaryValue" => str_replace(',', '.',$preparedData['basePrice']['grossPrice']),
                    "CurrencyCode" => $preparedData['basePrice']['currency']
                )
            );
            $prepareRequest['ShipmentRequest']['Shipment']['Package']['PackageServiceOptions']['COD'] = $codRequest;
        }

        if( $preparedData['senderID'] == 2 ) {

            if (strlen($preparedData['shipFromAddress']['companyName']) > 0) {
                $mainNameFrom = $preparedData['shipFromAddress']['companyName'];
            } else {
                $mainNameFrom = $preparedData['shipFromAddress']['name'] . ' ' . $preparedData['shipFromAddress']['lastname'];
            }

            $shipToAddressLineFrom = $preparedData['shipFromAddress']['street'] . ' ' . $preparedData['shipFromAddress']['house'];
            if (strlen($preparedData['shipFromAddress']['apartment']) > 0) {
                $shipToAddressLineFrom .= '/' . $preparedData['shipFromAddress']['apartment'];
            }

            $shipFrom = array(
                'Name' => $mainNameFrom,
                'AttentionName' => $preparedData['shipFromAddress']['name'] . ' ' . $preparedData['shipFromAddress']['lastname'],
                'Phone' => array(
                    'Number' => $preparedData['shipFromAddress']['telephone'],
                    "Extension" => "1"
                ),
                'Address' => array(
                    'AddressLine' => $shipToAddressLineFrom,
                    'City' => $preparedData['shipFromAddress']['city'],
                    'PostalCode' => str_replace('-', '', $preparedData['shipFromAddress']['zipcode']),
                    'CountryCode' => $preparedData['shipFromAddress']['countryCode']
                )
            );

            $prepareRequest['ShipmentRequest']['Shipment']['ShipFrom'] = $shipFrom;

        }

        $ch = curl_init();

        $headers = array();
        $headers[] = 'Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept';
        $headers[] = 'Access-Control-Allow-Methods: POST';
        $headers[] = 'Access-Control-Allow-Origin: *';
        $headers[] = 'Content-Type: application/json';

        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 45);
        if( isset($preparedData['courier']['settings']['dpd_test_mode']) && $preparedData['courier']['settings']['dpd_test_mode'] == 2 ) {
            curl_setopt($ch, CURLOPT_URL, DPD_SHIP_URL);
        } else {
            curl_setopt($ch, CURLOPT_URL, DPD_SHIP_TEST_URL);
        }
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($prepareRequest));

        $response = curl_exec($ch);

        if (!$response) {
            throw new Exception('Error: "' . curl_error($ch) . '" - Code: ' . curl_errno($ch));
        }

        curl_close($ch);

        return json_decode($response, true);

    }

    private function centimetersToInches($centimeters)
    {
        return round($centimeters / 2.54, 2);
    }

    private function kilogramsToPounds($kilograms)
    {
        return round($kilograms * 2.204, 2);
    }

    private function getSenderData()
    {
        $this->Setting->setModule('senderData');
        $senderData = $this->Setting->getAllByModule();

        return $senderData;
    }

    /**
     * @param $courierData
     * @param $trackingNumber
     * @return mixed
     * @throws Exception
     */
    private function dpdLabelRecovery( $courierData, $trackingNumber )
    {
        $request = array(
            "DPDSecurity" => array(
                "UsernameToken" => array(
                    "Username" => "Your User Id",
                    "Password" => "Your Password"
                ),
                "ServiceAccessToken" => array(
                    "clientNumber" => "Your Access License Number",
                    "clientKey" => "Your Client Key"
                )
            ),
            "LabelRecoveryRequest" => array(
                "LabelSpecification" => array(
                    "LabelImageFormat" => array(
                        "Code" => "GIF"
                    )
                ),
                "TrackingNumber" => "Your Tracking Number"
            )
        );

        $ch = curl_init();

        $headers = array();
        $headers[] = 'Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept';
        $headers[] = 'Access-Control-Allow-Methods: POST';
        $headers[] = 'Access-Control-Allow-Origin: *';
        $headers[] = 'Content-Type: application/json';

        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 45);
        curl_setopt($ch, CURLOPT_URL, " http://wstest.dpd.ru/services/order2?wsdl");
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($request));

        $response = curl_exec($ch);

        if (!$response) {
            throw new Exception('Error: "' . curl_error($ch) . '" - Code: ' . curl_errno($ch));
        }

        curl_close($ch);

        return json_decode($response, true);
    }

    /**
     * @param $base64
     * @param $output
     * @return mixed
     */
    public function printLabel($base64, $output) {

        $ifp = fopen( $output, 'wb' );

        fwrite( $ifp, base64_decode( $base64 ) );

        fclose( $ifp );

        return $output;
    }

}