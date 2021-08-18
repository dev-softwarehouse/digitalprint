<?php

/**
 * Description of Auth
 *
 * @author Właściciel
 */
namespace DreamSoft\Libs;

use DreamSoft\Models\Mongo\MgSession;
use DreamSoft\Models\Setting\Setting;
use Exception;

/**
 * Class Auth
 */
class Auth
{

    /**
     *
     */
    const salt = 'Je$te$my_$-NajLp$I_#A#A!@#$%^&*';
    /**
     * @var array
     */
    public $messages = array();
    /**
     * @var
     */
    public $accessToken;
    /**
     * @var
     */
    protected $error;
    /**
     * @var Setting
     */
    protected $Setting;
    /**
     * @var MgSession
     */
    protected $MgSession;

    /**
     * Auth constructor.
     */
    public function __construct()
    {
        $this->Setting = new Setting();
        $this->MgSession = MgSession::getInstance();
        $this->init();
    }

    /**
     *
     */
    public function init()
    {

        $headers = apache_request_headers();

        foreach ($headers as $header => $value) {
            if (strtolower($header) == ACCESS_TOKEN_NAME && strlen($value) > 0) {
                $this->accessToken = $value;
            }
        }

        header("Cache-control: private");
    }

    /**
     *
     */
    public function __destruct()
    {

    }

    /**
     * @return bool
     */
    public function getToken()
    {
        if (!empty($this->accessToken)) {
            return $this->accessToken;
        }
        return false;
    }

    /**
     * @return bool|object
     * @throws Exception
     */
    public function getTokenInfo()
    {
        if (!empty($this->accessToken)) {
            return JWT::decode($this->accessToken, secretKey, array('HS256'));
        }
        return false;
    }

    /**
     * @param $token
     */
    public function setToken($token)
    {
        $this->accessToken = $token;
    }

    /**
     * @return bool
     */
    public function getError()
    {
        if (!empty($this->error)) {
            return $this->error;
        }
        return false;
    }

    /**
     * @param $error
     */
    public function setError($error)
    {
        $this->error = $error;
    }

    /**
     * @return bool|array
     */
    public function getLoggedUser()
    {
        if (intval(loginType) === 2) {

            if (!isset($this->accessToken) || empty($this->accessToken)) {
                return false;
            }
            if (!$this->checkAccessToken()) {
                return false;
            }

            try {
                $decode = JWT::decode($this->accessToken, secretKey, array('HS256'));
                if (isset($decode->sessionID)) {
                    $sessionID = $decode->sessionID;

                    $oneSession = $this->MgSession->getAdapter()->findOne(array(
                        'sid' => $sessionID,
                        'valid' => true
                    ));
                    if( is_object($oneSession) ) {
                        $json = json_decode($oneSession->data, true);
                    }

                    if (isset($json['user'])) {
                        return $json['user'];
                    }
                    return false;
                } else {
                    return false;
                }
            } catch (Exception $e) {
                return false;
            }
        } else {
            if (isset($_SESSION['user'])) {
                return $_SESSION['user'];
            }
        }
        return false;
    }

    /**
     * @return bool
     */
    public function checkLogin()
    {
        $user = $this->getLoggedUser();
        if (isset($user['ID']) && intval($user['ID']) > 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @param $message
     */
    public function setMessage($message)
    {
        $this->messages[] = $message;
    }

    /**
     * @return mixed
     */
    public function getMessages()
    {
        $messages = $_SESSION['messages'];
        unset($_SESSION['messages']);
        return $messages;
    }

    /**
     * @return array|bool
     */
    public function getSaltSetting()
    {
        $this->Setting->setModule('config');
        return $this->Setting->getValue('saltOff');
    }

    /**
     * @return bool
     */
    public function getSessionData()
    {
        try {

            if (!$this->checkAccessToken()) {
                throw new Exception('Bad token');
            }

            $decode = JWT::decode($this->accessToken, secretKey, array('HS256'));
            if (isset($decode->sessionID)) {
                $oneSession = $this->MgSession->getAdapter()->findOne(array(
                    'sid' => $decode->sessionID
                ));
                return $oneSession->data;
            }
        } catch (Exception $e) {

            return false;
        }
    }

    /**
     * @return bool|object
     */
    public function getSession()
    {
        try {
            if (!$this->checkAccessToken()) {
                throw new Exception('Bad token');
            }

            $decode = JWT::decode($this->accessToken, secretKey, array('HS256'));
            if (isset($decode->sessionID)) {
                $oneSession = $this->MgSession->getAdapter()->findOne(array(
                    'sid' => $decode->sessionID
                ));
                return $oneSession;
            }
        } catch (Exception $e) {

            return false;
        }
    }

    /**
     * @return bool
     */
    public function getSessionID()
    {
        try {
            if (!$this->checkAccessToken()) {
                throw new Exception('Bad token');
            }

            $decode = JWT::decode($this->accessToken, secretKey, array('HS256'));
            if (isset($decode->sessionID)) {
                return $decode->sessionID;
            } else {
                return false;
            }
        } catch (Exception $e) {

            return false;
        }
    }

    /**
     * @param $key
     * @param $value
     * @return bool
     */
    public function setSessionData($key, $value)
    {
        try {

            if (!$this->checkAccessToken()) {
                throw new Exception('Bad token');
            }

            $decode = JWT::decode($this->accessToken, secretKey, array('HS256'));
            if (isset($decode->sessionID)) {

                $oneSession = $this->MgSession->getAdapter()->findOne(array(
                    'sid' => $decode->sessionID
                ));
                if (strlen($oneSession->data) > 0) {
                    $data = json_decode($oneSession->data, true);
                    $data[$key] = $value;
                    $this->MgSession->getAdapter()->update(array(
                        'sid' => $decode->sessionID
                    ), array(
                        'data' => json_encode($data)
                    ), array(
                        'multiple' => true,
                        'upsert' => false
                    ));
                }
            }
        } catch (Exception $e) {

            return false;
        }
    }

    /**
     * @return bool
     */
    public function checkAccessToken()
    {
        $tks = explode('.', $this->accessToken);

        if (strlen($this->accessToken) > 0 && count($tks) === 3) {
            return true;
        }
        return false;
    }

}
