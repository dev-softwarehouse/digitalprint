<?php


use DreamSoft\Controllers\Components\Acl;
use DreamSoft\Models\Mongo\MgSession;
use DreamSoft\Core\Controller;
use DreamSoft\Libs\JWT;
use DreamSoft\Models\User\User;

class AuthController extends Controller {
    /**
     * @var $MgSession MgSession
     */
    protected $MgSession;
    /**
     * @var Acl
     */
    protected $Acl;
    /**
     * @var User
     */
    protected $User;

    public $useModels = array();

    public function __construct ($params) {
        parent::__construct($params);
        $this->User = User::getInstance();
        $this->MgSession = MgSession::getInstance();
        $this->Acl = new Acl();
    }

    public function setDomainID( $domainID ){
        parent::setDomainID($domainID);
        $this->User->setDomainID($domainID);
    }
    
    protected function _firstCheck(){
        if( !$this->Auth->checkLogin() ) {
            if( !$this->Auth->checkLogin() ){
                $data['reason'] = 'Brak ID użytkownika w sesji';
            }
            header("HTTP/1.0 401 Unauthorized");
            $data['response'] = false;
        } else {
            $user = $this->Auth->getLoggedUser();
            $data['user'] = array();
            if( isset($user['firstname']) ){
                $data['user']['firstname'] = $user['firstname'];
            } else {
                $data['user']['firstname'] = NULL;
            }
            if( isset($user['lastname']) ){
                $data['user']['lastname'] = $user['lastname'];
            } else {
                $data['user']['lastname'] = NULL;
            }
            if( isset($user['user']) ){
                $data['user']['mail'] = $user['user'];
            } else if( isset($user['login']) ) {
                $data['user']['mail'] = $user['login'];
            } else {
                $data['user']['mail'] = NULL;
            }
            if( $token = $this->Auth->getToken() ){
                $data[ACCESS_TOKEN_NAME] = $token;
            }
            $data['response'] = true;
            $data['domainID'] = $this->getDomainID();
        }
        return $data;
    }

    /**
     * @return mixed
     */
    protected function _secondCheck()
    {

        $token = $this->Auth->getToken();
        $data['response'] = false;
        if (strlen($token) > 0) {

            try {
                $decode = JWT::decode($token, secretKey, array('HS256'));
            } catch (Exception $ex) {
                $data['response'] = false;
                $data['error'] = $ex->getMessage();
                header("HTTP/1.0 401 Unauthorized");
                return $data;
            }

            $mongoSession = $this->MgSession->getAdapter()->findOne(array(
                'sid' => $decode->sessionID
            ));

            if( !$mongoSession ) {
                if( sourceApp ) {
                    header("HTTP/1.0 401 Unauthorized");
                }
                $data['response'] = false;
                $data['info'] = 'No session data!';
                return $data;
            }

            $sessionData = json_decode($mongoSession->data, true);

            if (isset($mongoSession->expireAt)) {
                $mongoDate = $mongoSession->expireAt->toDateTime();
                $data['sessionExp'] = date('Y-m-d H:i:s', $mongoDate->getTimestamp());
            } else if ($sessionData && isset($sessionData['user']['super']) && $sessionData['user']['super'] == 1) {
            } else {
                $data['loggedOut'] = true;
                $data['response'] = false;
                return $data;
            }

            if (isset($mongoSession->orderID) && intval($mongoSession->orderID) > 0) {
                $data['orderID'] = $mongoSession->orderID;
            } else {
                $data['orderID'] = null;
            }

            $data['sessionID'] = $decode->sessionID;

            if ( array_key_exists('userEditorID', $sessionData) && $sessionData['userEditorID']) {
                $data['userEditorID'] = $sessionData['userEditorID'];
            } elseif( isset($decode->userEditorID) ) {
                $data['userEditorID'] = $decode->userEditorID;
            }

            if( isset($sessionData['service']) && strlen($sessionData['service']) > 0 ) {
                $data['service'] = $sessionData['service'];
            }

            $data['carts'] = $mongoSession->Carts;

            if ((!isset($decode->userID) || empty($decode->userID)) &&
                (!isset($sessionData['noLogin']) || $sessionData['noLogin'] == false)
            ) {
                header("HTTP/1.0 401 Unauthorized");
                $data['response'] = false;
                $data['info'] = 'Brak identyfikatora użytkownika.';
            } elseif ( array_key_exists('noLogin', $sessionData) &&  $sessionData['noLogin'] == true) {
                header("HTTP/1.0 401 Unauthorized");
                $data['response'] = true;
                $data['info'] = 'User not logged.';
                $data['noLogin'] = true;
                $data['token'] = $token;
                return $data;
            }

            $data['user'] = array();

            $userInfo = false;
            if (isset($sessionData['user']['ID']) && $sessionData['user']['ID'] > 0) {
                $userInfo = $this->User->get('ID', $sessionData['user']['ID']);
                $data['user']['userID'] = $sessionData['user']['ID'];
            }

            if ($userInfo && intval($userInfo['onetime']) === 1) {
                $data['user']['onetime'] = true;
            } else {
                $data['user']['onetime'] = false;
            }

            if (isset($decode->first_name)) {
                $data['user']['firstname'] = $decode->first_name;
            } else {
                $data['user']['firstname'] = NULL;
            }
            if (isset($decode->last_name)) {
                $data['user']['lastname'] = $decode->last_name;
            } else {
                $data['user']['lastname'] = NULL;
            }
            if (isset($decode->email)) {
                $data['user']['mail'] = $decode->email;
            } else if (isset($decode->login)) {
                $data['user']['mail'] = $decode->login;
            } else {
                $data['user']['mail'] = NULL;
            }

            if ($sessionData && isset($sessionData['user']['super']) && $sessionData['user']['super'] == 1) {
                $data['user']['super'] = 1;
            }

            $data[ACCESS_TOKEN_NAME] = $token;
            $data['response'] = true;
            $data['domainID'] = $this->getDomainID();


        } else {
            header("HTTP/1.0 401 Unauthorized");
            $data['response'] = false;
            $data['info'] = 'Brak tokena ziomek!';
        }
        return $data;
    }

    /**
     * @return mixed
     */
    public function check() 
    {
        if( intval(loginType) === 2 ){
            $data = $this->_secondCheck();
        } else {
            $data = $this->_firstCheck();
        }
        $data['typeOfCheck'] = intval(loginType);
        return $data;
    }

    /**
     * @return mixed
     */
    public function isLogged()
    {
        if($this->_check_login()) {
            $return['response'] = 'true';
        } else {
            $return['response'] = 'false';
        }
        return $return;
    }

    /**
     * @return array
     */
    public function isAdminEditor() {
        return array('response' => true);
    }
}
