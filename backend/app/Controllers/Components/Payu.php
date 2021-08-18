<?php

namespace DreamSoft\Controllers\Components;

use DreamSoft\Models\Module\Module;
use DreamSoft\Models\Module\ModuleKey;
use DreamSoft\Models\Module\ModuleKeyLang;
use DreamSoft\Models\Module\ModuleOption;
use DreamSoft\Models\Module\ModuleOptionLang;
use DreamSoft\Models\Module\ModuleType;
use DreamSoft\Models\Module\ModuleValue;
use DreamSoft\Models\Payment\Payment;
use DreamSoft\Models\Domain\Domain;
use DreamSoft\Core\Component;
use DreamSoft\Models\Route\RouteLang;
use Exception;

/**
 * Class Payu
 */
class Payu extends Component
{

    public $useModels = array();

    private $module_key = 'payu';

    /**
     * @var Module
     */
    private $Module;
    /**
     * @var ModuleKey
     */
    private $ModuleKey;
    /**
     * @var ModuleKeyLang
     */
    private $ModuleKeyLang;
    /**
     * @var ModuleOption
     */
    private $ModuleOption;
    /**
     * @var ModuleOptionLang
     */
    private $ModuleOptionLang;
    /**
     * @var ModuleType
     */
    private $ModuleType;
    /**
     * @var ModuleValue
     */
    private $ModuleValue;
    /**
     * @var Domain
     */
    private $Domain;
    /**
     * @var Payment
     */
    private $Payment;
    /**
     * @var RouteLang
     */
    private $RouteLang;
    /**
     * @var Translate
     */
    private $Translate;
    /**
     * @var int
     */
    private $domainID;

    /**
     * Payu constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->Module = Module::getInstance();
        $this->ModuleKey = ModuleKey::getInstance();
        $this->ModuleKeyLang = ModuleKeyLang::getInstance();
        $this->ModuleOption = ModuleOption::getInstance();
        $this->ModuleOptionLang = ModuleOptionLang::getInstance();
        $this->ModuleType = ModuleType::getInstance();
        $this->ModuleValue = ModuleValue::getInstance();
        $this->Domain = Domain::getInstance();
        $this->Payment = Payment::getInstance();
        $this->RouteLang = RouteLang::getInstance();
        $this->Translate = new Translate();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->ModuleValue->setDomainID($domainID);
        $this->Payment->setDomainID($domainID);
        $this->RouteLang->setDomainID($domainID);
        $this->domainID = $domainID;
    }

    /**
     * @return mixed
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @return array
     */
    private function getPaymentOptions()
    {

        $module = $this->Module->get('key', $this->module_key);

        $this->ModuleKey->setModuleID($module['ID']);
        $keys = $this->ModuleKey->getAllByModule();

        $keysArr = array();
        $keysFunc = array();
        $keysNames = array();
        foreach ($keys as $key => $val) {
            $keysArr[] = $val['ID'];
            $keysFunc[$val['ID']] = $val['func'];
            $keysNames[$val['ID']] = $val['key'];
        }

        $payment = $this->Payment->getOne($module['ID']);

        $values = $this->ModuleValue->customGetByList($keysArr, $payment['ID']);

        $results = array();
        foreach ($values as $key => $value) {
            $results[$keysNames[$key]] = $value;
        }

        if (empty($results)) {
            return array();
        }
        return $results;

    }

    /**
     * @param $data
     * @return bool|mixed
     */
    public function doPayment($data)
    {

        try {

            return $this->newOrder($data);

        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }
        return false;

    }

    /**
     * @param $data
     * @return mixed
     * @throws Exception
     */
    private function newOrder($data)
    {

        try {
            $accessToken = $this->getAccessToken();
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }

        $options = $this->getPaymentOptions();

        $domain = $this->Domain->get('ID', $this->getDomainID());
        $host = $domain['host'];

        if ($host == 'localhost') {
            $host .= ':9001';
        }

        $routeLang = $this->RouteLang->getByRoute('cartVerify');

        $url = str_replace(':orderid', $data['orderID'], $routeLang['url']);

        $params['continueUrl'] = 'http://' . $host . '/pl' . $url;
        $params['notifyUrl'] = 'http://' . $host . '/pl' . $url;
        $params['customerIp'] = $_SERVER['REMOTE_ADDR'];
        $params['merchantPosId'] = $options['pos_id'];
        $translatedPhrases = $this->Translate->translate('order_id');
        if( $translatedPhrases && array_key_exists(lang, $translatedPhrases) ) {
            $params['description'] = $translatedPhrases[lang] .': ' . $data['orderID'];
        } else {
            $params['description'] = 'order: ' . $data['orderID'];
        }

        $params["settings"]['invoiceDisabled'] = true;
        $params += $data;

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, "https://secure.payu.com/api/v2_1/orders");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_HEADER, FALSE);

        curl_setopt($ch, CURLOPT_POST, TRUE);

        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));

        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            "Content-Type: application/json",
            "Authorization: Bearer " . $accessToken->access_token
        ));

        $response = curl_exec($ch);

        if (!$response) {
            throw new Exception('Error: "' . curl_error($ch) . '" - Code: ' . curl_errno($ch));
        }

        curl_close($ch);

        return json_decode($response);
    }

    /**
     * @param $paymentOrderID
     * @return mixed
     * @throws Exception
     */
    public function statusOrder($paymentOrderID)
    {
        try {
            $accessToken = $this->getAccessToken();
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }

        $domain = $this->Domain->get('ID', $this->getDomainID());
        $host = $domain['host'];

        if ($host == 'localhost') {
            $host .= ':9001';
        }

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, 'https://secure.payu.com/api/v2_1/orders/' . $paymentOrderID);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_HEADER, FALSE);

        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            "Content-Type: application/json",
            "Authorization: Bearer " . $accessToken->access_token
        ));

        $response = curl_exec($ch);

        if (!$response) {
            throw new Exception('Error: "' . curl_error($ch) . '" - Code: ' . curl_errno($ch));
        }

        curl_close($ch);

        return json_decode($response, true);
    }

    /**
     * @param $paymentOrderID
     * @return mixed
     * @throws Exception
     */
    public function cancelOrder($paymentOrderID)
    {
        try {
            $accessToken = $this->getAccessToken();
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }

        $domain = $this->Domain->get('ID', $this->getDomainID());
        $host = $domain['host'];

        if ($host == 'localhost') {
            $host .= ':9001';
        }

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, 'https://secure.payu.com/api/v2_1/orders/' . $paymentOrderID);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_HEADER, FALSE);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");

        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            "Content-Type: application/json",
            "Authorization: Bearer " . $accessToken->access_token
        ));

        $response = curl_exec($ch);

        if (!$response) {
            throw new Exception('Error: "' . curl_error($ch) . '" - Code: ' . curl_errno($ch));
        }

        curl_close($ch);

        return json_decode($response, true);
    }

    /**
     * @return string
     * @throws Exception
     *
     *
     * curl https://api.sandbox.paypal.com/v1/oauth2/token \
     * -H "Accept: application/json" \
     * -H "Accept-Language: en_US" \
     * -u "Client-Id:Secret" \
     * -d "grant_type=client_credentials"
     */
    private function getAccessToken()
    {

        $options = $this->getPaymentOptions();

        $params['grant_type'] = 'client_credentials';
        $params['client_id'] = $options['pos_id'];
        $params['client_secret'] = $options['key1'];

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, "https://secure.payu.com/pl/standard/user/oauth/authorize");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_HEADER, FALSE);
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            "Content-Type: application/x-www-form-urlencoded"
        ));

        $response = curl_exec($ch);

        if (!$response) {
            throw new Exception('Error: "' . curl_error($ch) . '" - Code: ' . curl_errno($ch));
        }

        curl_close($ch);

        return json_decode($response);

    }

    /**
     * @param $orderID
     * @return array
     * @throws Exception
     */
    public function checkStatus($orderID)
    {
        try {
            $accessToken = $this->getAccessToken();
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, 'https://secure.payu.com/api/v2_1/orders/' . $orderID);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_HEADER, FALSE);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            "Content-Type: application/json",
            "Authorization: Bearer " . $accessToken->access_token
        ));

        $response = curl_exec($ch);

        if (!$response) {
            throw new Exception('Error: "' . curl_error($ch) . '" - Code: ' . curl_errno($ch));
        }

        curl_close($ch);

        return json_decode($response, true);
    }


}