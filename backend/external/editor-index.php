<?php

define('BASE_DIR', dirname(__FILE__).'/../git_repos/backend-prod/');
define('BS', chr(92));


include_once (BASE_DIR."libs/JWT.php");

set_time_limit(60);

require_once BASE_DIR.'/vendor/autoload.php';

use DreamSoft\Libs\Routing;

$Routing = new Routing();

$lang = $Routing->getHeader('lang');

if( !defined('lang') ){
    if( $lang ){
        define('lang', $lang);
    } else {
        define('lang', 'pl');
    }
}

include_once (BASE_DIR.'models/DomainRoot.php');
$DomainRoot = \DomainRoot::getInstance();

if( isset($_SERVER['HTTP_HOST']) ) {
    $parseURL = parse_url($_SERVER['HTTP_HOST']);
} else {
    // debug
}

use DreamSoft\Models\Mongo\MgSession;

$matches = null;
$returnValue = preg_match('/edytor\\.(.*)/', $parseURL['path'], $matches);

if( $returnValue === 1 ){
    $actHost = $matches[1];
} else {
    $actHost = $parseURL['host'];
}

$dr = $DomainRoot->get('name' ,$actHost);

if( $dr ){
    $Routing->setCompanyID( $dr['companyID'] );
} else {
    $Routing->setCompanyID( $getCompanyID );
}

$companyID = $Routing->getCompanyID();
if( !defined('companyID') ){
    define('companyID', $companyID);
}

include_once (BASE_DIR.'models/Domain.php');
$Domain = \Domain::getInstance();

$oneDomain = $Domain->get('host', $dr['name']);

if( isset($_POST) && !empty($_POST) ){

    $accessTokenPost = filter_input( INPUT_POST, 'access-token' );

    if( !empty($accessTokenPost) ){
        if( isset($_COOKIE['access-token']) ) {
            unset($_COOKIE['access-token']);
        }
        setcookie('access-token', $accessTokenPost, time() + (60 * 60 * 6), "/");
    }

    $paramArr = json_decode($_POST['products'], true);

    $typeID = current( array_keys($paramArr) );

    if( isset($paramArr['typeID'])  ) {
        $url = '?';
        $url .= 'typeID='.$paramArr['typeID'];
    }

    if( !empty($paramArr['products']) ) {
        $url .= '&products=[';
        $url .= implode(',', $paramArr['products']);
        $url .= ']';
    }
    if( !empty($paramArr['formats'])  ) {
        $url .= '&formats=[';
        $url .= implode(',', $paramArr['formats']);
        $url .= ']';
    }
    if( !empty($paramArr['pages']) ) {
        $url .= '&pages=[';
        $url .= implode(',', $paramArr['pages']);
        $url .= ']';
    }

    if( !empty($paramArr['attributes']) ) {
        $url .= '&attributes=[';
        foreach($paramArr['attributes'] as $productAttributes) {
            $url .= '['.implode(',', $productAttributes).'],';
        }
        $url = substr($url, 0, -1);
        $url .= ']';
    }

    if( !empty($paramArr['loadProject'])  ) {
        $url .= '&loadProject=' . $paramArr['loadProject'];
    }

    if( !empty($paramArr['themeID']) ) {
        $url .= '&themeID=' . $paramArr['themeID'];
    }

    if( !empty($paramArr['name']) ) {
        $url .= '&name=' . $paramArr['name'];
    }

    header('Location: '.$_SERVER['REQUEST_URI'] . $url);
    die();

}

$typeID = filter_input(INPUT_GET, 'typeID');
$accessToken = filter_input(INPUT_COOKIE, 'access-token');

if( $typeID > 0 && strlen($accessToken) > 0  ){

    $MgSession = MgSession::getInstance();

    $decode = JWT::decode($accessToken, secretKey, array('HS256'));

    $mongoSession = $MgSession->getAdapter()->findOne(array(
        'sid' => $decode->sessionID
    ));
    $sessionData = json_decode($mongoSession->data, true);

    include_once('Acl.php');
    $Acl = new Acl();

    if( isset($sessionData['user']) ){
        $user = $sessionData['user'];

        if( $Acl->isAdminEditor($user) ){
            readfile( 'prod/'.$companyID.'/index_prod_admin.html' );
        } else {
            readfile( 'prod/'.$companyID.'/index_prod_user.html' );
        }
    } else {
        readfile( 'prod/'.$companyID.'/index_prod_user.html' );
    }

} else {
    echo '<h2>Niepoprawna konfiguracja!</h2>';
    exit();
}