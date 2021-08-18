<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 20-04-2018
 * Time: 12:42
 */

namespace DreamSoft\Libs\Tinkoff;

use Exception;

class TinkoffMerchantAPI
{
    /**
     * @var string
     */
    private $api_url;
    /**
     * @var string
     */
    private $terminalKey;
    /**
     * @var string
     */
    private $secretKey;
    /**
     * @var string
     */
    private $paymentId;
    /**
     * @var
     */
    private $status;
    /**
     * @var
     */
    private $error;
    /**
     * @var
     */
    private $response;
    /**
     * @var string
     */
    private $paymentUrl;


    /**
     * @param $terminalKey string Your Terminal name
     * @param $secretKey string Secret key for terminal
     * @param string $api_url Url for API
     */
    function __construct($terminalKey, $secretKey, $api_url)
    {
        $this->api_url = $api_url;
        $this->terminalKey = $terminalKey;
        $this->secretKey = $secretKey;
    }

    /**
     * @param $name
     * @return bool|string
     */
    function __get($name)
    {
        switch ($name) {
            case 'paymentId':
                return $this->paymentId;
            case 'status':
                return $this->status;
            case 'error':
                return $this->error;
            case 'paymentUrl':
                return $this->paymentUrl;
            case 'response':
                return htmlentities($this->response);
            default:
                if ($this->response) {
                    if ($json = json_decode($this->response, true)) {
                        foreach ($json as $key => $value) {
                            if (strtolower($name) == strtolower($key)) {
                                return $json[$key];
                            }
                        }
                    }
                }

                return false;
        }
    }

    /**
     * @param $args
     * @return mixed
     * @throws Exception
     */
    public function init($args)
    {
        return $this->buildQuery('Init', $args);
    }

    /**
     * @param $args
     * @return mixed
     * @throws Exception
     */
    public function getState($args)
    {
        return $this->buildQuery('GetState', $args);
    }

    /**
     * @param $args
     * @return mixed
     * @throws Exception
     */
    public function confirm($args)
    {
        return $this->buildQuery('Confirm', $args);
    }

    /**
     * @param $args
     * @return mixed
     * @throws Exception
     */
    public function charge($args)
    {
        return $this->buildQuery('Charge', $args);
    }

    /**
     * @param $args
     * @return mixed
     * @throws Exception
     */
    public function addCustomer($args)
    {
        return $this->buildQuery('AddCustomer', $args);
    }

    /**
     * @param $args
     * @return mixed
     * @throws Exception
     */
    public function getCustomer($args)
    {
        return $this->buildQuery('GetCustomer', $args);
    }

    /**
     * @param $args
     * @return mixed
     * @throws Exception
     */
    public function removeCustomer($args)
    {
        return $this->buildQuery('RemoveCustomer', $args);
    }

    /**
     * @param $args
     * @return mixed
     * @throws Exception
     */
    public function getCardList($args)
    {
        return $this->buildQuery('GetCardList', $args);
    }

    /**
     * @param $args
     * @return mixed
     * @throws Exception
     */
    public function removeCard($args)
    {
        return $this->buildQuery('RemoveCard', $args);
    }

    /**
     * @param $args
     * @return mixed
     * @throws Exception
     */
    public function cancelOrder($args)
    {
        return $this->buildQuery('Cancel', $args);
    }

    /**
     * @return mixed
     * @throws Exception
     */
    public function resend()
    {
        return $this->buildQuery('Resend', array());
    }

    /**
     * @param $path
     * @param $args
     * @return mixed
     * @throws Exception
     */
    public function buildQuery($path, $args)
    {
        $url = $this->api_url;
        if (is_array($args)) {
            if (!array_key_exists('TerminalKey', $args)) $args['TerminalKey'] = $this->terminalKey;
            if (!array_key_exists('Token', $args)) $args['Token'] = $this->_genToken($args);
        }
        $url = $this->_combineUrl($url, $path);


        return $this->_sendRequest($url, $args);
    }

    /**
     * @param $args
     * @return string
     */
    private function _genToken($args)
    {
        $token = '';
        $args['Password'] = $this->secretKey;
        ksort($args);

        foreach ($args as $arg) {
            if (!is_array($arg)) {
                $token .= $arg;
            }
        }
        $token = hash('sha256', $token);

        return $token;
    }

    /**
     * @return string
     */
    private function _combineUrl()
    {
        $args = func_get_args();
        $url = '';
        foreach ($args as $arg) {
            if (is_string($arg)) {
                if ($arg[strlen($arg) - 1] !== '/') $arg .= '/';
                $url .= $arg;
            } else {
                continue;
            }
        }

        return $url;

    }

    /**
     * @param $api_url
     * @param $args
     * @return mixed
     * @throws Exception
     */
    private function _sendRequest($api_url, $args)
    {
        $this->error = '';

        if (is_array($args)) {
            $args = json_encode($args);
        }

        if ($curl = curl_init()) {
            curl_setopt($curl, CURLOPT_URL, $api_url);

            curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_POST, true);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $args);
            curl_setopt($curl, CURLOPT_HTTPHEADER, array(
                'Content-Type: application/json',
            ));

            $out = curl_exec($curl);
            $this->response = $out;
            $json = json_decode($out);

            if ($json) {
                if (@$json->ErrorCode !== "0") {
                    $this->error = @$json->Details;
                } else {
                    $this->paymentUrl = @$json->PaymentURL;
                    $this->paymentId = @$json->PaymentId;
                    $this->status = @$json->Status;
                }
            }

            curl_close($curl);

            return $out;

        } else {
            throw new \Exception('Can not create connection to ' . $api_url . ' with args ' . $args, 404);
        }
    }
}