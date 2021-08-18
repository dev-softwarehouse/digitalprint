<?php

ini_set('error_log', 'php://stderr' );

define('BASE_DIR', dirname(__FILE__).'/');
define('BS', chr(92));
define('APP_DIR', BASE_DIR.'app/');

set_time_limit(60);

require_once __DIR__.'/vendor/autoload.php';

use DreamSoft\Libs\Routing;
use DreamSoft\Libs\Debugger;
use DreamSoft\Core\Controller;
use DreamSoft\Libs\Auth;
use DreamSoft\Libs\Cache;
use DreamSoft\Models\Domain\DomainRoot;
use DreamSoft\Models\Domain\Domain;

if( DEBUG_MODE ) {
    error_reporting( E_ALL );
}

$Debugger = new Debugger();

$Routing = new Routing();

$lang = $Routing->getHeader('lang');

if( !defined('lang') ){
    if( $lang ){
        define('lang', $lang);
    } else {
        define('lang', DEFAULT_LANG);
    }
}

$sourceApp = $Routing->getHeader('sourceapp');

if( !defined('sourceApp') ){
    if( $lang ){
        define('sourceApp', $sourceApp);
    } else {
        define('sourceApp', 'manager');
    }
}

$controllersDir = 'controllers';

$DomainRoot = DomainRoot::getInstance();

$hostKnown = true;
$parseURL = false;
$searchDomain = false;

if( isset($_SERVER['HTTP_ORIGIN']) ){
    $parseURL = parse_url($_SERVER['HTTP_ORIGIN']);
} elseif( isset($_SERVER['HTTP_REFERER']) ) {
    $parseURL = parse_url($_SERVER['HTTP_REFERER']);
} else {
    // @TODO catch all the not known host
    $hostKnown = false;
}

if($parseURL) {
    $searchDomain = $parseURL['host'];
}

$isEditor = false;

if( $parseURL && strpos($parseURL['host'], EDITOR_DEFAULT_SUBDOMAIN ) === 0 ) {
    $searchDomain = substr($parseURL['host'], strlen(EDITOR_DEFAULT_SUBDOMAIN), strlen($parseURL['host']));
    $isEditor = true;
}

$isAdminEditor = false;

if( $parseURL && strpos($parseURL['host'], EDITOR_ADMIN_DEFAULT_SUBDOMAIN ) === 0 ) {
    $searchDomain = substr($parseURL['host'], strlen(EDITOR_ADMIN_DEFAULT_SUBDOMAIN), strlen($parseURL['host']));
    $isAdminEditor = true;
}

$getCompanyID = filter_input(INPUT_GET, 'companyID');

$dr = $DomainRoot->get('name' , $searchDomain);

if( $dr ){
    $Routing->setCompanyID( $dr['companyID'] );
} else {
    $Routing->setCompanyID( $getCompanyID );
}

$companyID = $Routing->getCompanyID();

if( !$companyID ) {
    $result['info'] = 'Cross origin problem.';
    echo json_encode($result, JSON_NUMERIC_CHECK);
    exit;
}

if( !defined('companyID') ){
    define('companyID', $companyID);
}

if( $companyID == 33 ){
    define('OLD_DIR', '/home/www/vprojekttest/');
} else if( $companyID == 35 ){
    define('OLD_DIR', '/home/www/vprojekttest3/');
}

if( !defined('MAIN_UPLOAD') ){
    define('MAIN_UPLOAD', '/home/www/data/');
}

$controller = ucfirst($Routing->getController());
$action = $Routing->getAction();

$params = $Routing->getParams();
$parents = $Routing->getParents();
$package = $Routing->getPackage();
$autoload = $Routing->getAutoload();


$Domain = Domain::getInstance();

$oneDomain = $Domain->get('host', $dr['name']);

if( !defined('domainID') ) {
    define('domainID', $oneDomain['ID']);
}

$domainCompanyID = $oneDomain['ID'];

if( intval($oneDomain['ssl']) === 1 ) {
    $domain = 'https://'.$oneDomain['host'];
} else {
    $domain = 'http://'.$oneDomain['host'];
}

if( $isEditor ) {
    if( intval($oneDomain['ssl']) === 1 ) {
        $domain = 'https://'. EDITOR_DEFAULT_SUBDOMAIN . $oneDomain['host'];
    } else {
        $domain = 'http://'. EDITOR_DEFAULT_SUBDOMAIN . $oneDomain['host'];
    }
}

if( $isAdminEditor ) {
    if( intval($oneDomain['ssl']) === 1 ) {
        $domain = 'https://'. EDITOR_ADMIN_DEFAULT_SUBDOMAIN . $oneDomain['host'];
    } else {
        $domain = 'http://'. EDITOR_ADMIN_DEFAULT_SUBDOMAIN . $oneDomain['host'];
    }
}


if( isset($parseURL['port']) ){
    $domain .= ':'.$parseURL['port'];
}

error_log('host: ' . $domain);

$origin = 'Access-Control-Allow-Origin: '.$domain.' ';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  header($origin);
  header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
  header('Access-Control-Allow-Headers: Content-type, Accept, Token, '. ACCESS_TOKEN_NAME .', IpAddr, domainID, sourceApp, x-http-method-override, expiration, secretProof, lang, CUSTOM_HOST ');

  if( $isEditor || $isAdminEditor ) {
      header('Access-Control-Allow-Credentials: true');
  } else {
      header('Access-Control-Allow-Credentials: false');
  }

  header('Access-Control-Max-Age: 10');
  header(':', true, 204);
  exit;
}

$postData = NULL;

if( isset($_SERVER["CONTENT_TYPE"]) && stripos($_SERVER["CONTENT_TYPE"], "application/json") === 0) {
    $postData = json_decode(file_get_contents("php://input"), true);
}
global $postData;

$cache = new Cache();
$cache->checkValid();
if($cached=$cache->getCached()){
    header('Access-Control-Allow-Origin: *');
    echo $cached;exit;
}
$Auth = new Auth();

if(strstr(strtolower($_SERVER['HTTP_USER_AGENT']), "googlebot"))
{
    $Debugger->debug('Google try to enter!');
    $Debugger->debug('companyID: ' . $companyID);
    $Debugger->debug('domain: '. $domain);
}

try {
    if( $package && strlen($package) > 0 ){
        $packageDir = '/'.$package;
    } else {
        $packageDir = '';
    }

    if( $autoload ) {
        if( $package ) {
            $controllerNspName = '\\DreamSoft\\Controllers\\' . ucfirst($package) . '\\' . $controller;
            if( class_exists($controllerNspName) ) {
                $controllerInst = new $controllerNspName($params);
            } else {
                header('Access-Control-Allow-Origin: *');
                $result['debug'] = true;
                $result['controllerNS'] = $controllerNspName;
                $result['info'] = 'Nie ma takiego kontrolera w przestrzeni nazw! '. $controllerNspName;
                echo json_encode($result, JSON_NUMERIC_CHECK);
                exit();
            }
        }
    } else {
        if( is_file($controllersDir.$packageDir.'/'.$controller.'.php') ) {
            include_once ($controllersDir.$packageDir.'/'.$controller.'.php');
            $controllerInst = new $controller($params);
        } else {
            header('Access-Control-Allow-Origin: *');
            $result['debug'] = true;
            $result['path'] = $controllersDir.$packageDir;
            $result['controller'] = $controller;
            $result['info'] = 'Nie ma takiego kontrolera';
            echo json_encode($result, JSON_NUMERIC_CHECK);
            exit();
        }
    }

    $module = $Routing->getModule();
    if( method_exists ($controllerInst , 'setModule') && $module ) {
        $controllerInst->setModule($module);
    }

    $domainID = $Routing->getHeader('domainid');
    if( !$domainID ){
        $domainID = $domainCompanyID;
    }

    if( method_exists ($controllerInst , 'setDomainID') && $domainID ){
        $controllerInst->setDomainID($domainID);
    }

    if( !empty($parents) ){
        $controllerInst->setParents($parents);
    }

    if( method_exists ( $controllerInst , $action ) ){

        header('Access-Control-Allow-Origin: *');

        $pos = strpos($controller, 'Controller');
        $controllerName = substr($controller, 0, $pos);

        $user = $Auth->getLoggedUser();
        $testSession = $Auth->getSession();

        $permError = '';
        try{
            $hasPerms = $controllerInst->checkPerms( $controllerName, $action, $package, $user );
        } catch ( Exception $e ){
            $hasPerms = false;
            $permError = $e->getMessage();
        }

        if( !$hasPerms ) {
            $AuthorizationLog = \DreamSoft\Models\Authorization\AuthorizationLog::getInstance();
            $logParams = array();
            $logParams['userID'] = $user['ID'];
            $logParams['url'] = $_SERVER['REQUEST_URI'];
            $logParams['controller'] = $controllerName;
            $logParams['action'] = $action;
            $logParams['package'] = $package;
            $logParams['domainID'] = $domainID;
            $logParams['created'] = date('Y-m-d H:i:s');
            $AuthorizationLog->create($logParams);
            header("HTTP/1.0 403 Forbidden");
            $result['response'] = false;
            $result['info'] = 'Authorization block by ACL.';
            if( isset($_SESSION) ) {
                $result['session'] = $_SESSION;
            }
            $result['error'] = $permError;
            $Debugger->setDebugFile('acl_blocks');
            $Debugger->debug(
                'ACL BLOCK: user: '.$user['ID'],
                'user email: '. $user['user'],
                'controller: '.$controllerName,
                'action: '.$action,
                'domain: '.$oneDomain['host']
            );
            $Debugger->setDebugFile('common');
            echo json_encode($result, JSON_NUMERIC_CHECK);
            die;
        }

        $result = call_user_func_array(array($controllerInst, $action), $Routing->getParams() );

        if( is_array($result) ){
            Controller::sendJson();
            if( isset($result['returnType']) ){
                $returnType = $result['returnType'];
            } else {
                $returnType = 'Array';
            }
            if( isset($result['httpCode']) ){
                http_response_code($result['httpCode']);
                unset($result['httpCode']);
            }

            unset($result['returnType']);

            if( $returnType == 'Object' ){
                $result = json_encode($result, JSON_FORCE_OBJECT|JSON_NUMERIC_CHECK|JSON_PARTIAL_OUTPUT_ON_ERROR);
            } else {
                $result = json_encode($result, JSON_NUMERIC_CHECK|JSON_PARTIAL_OUTPUT_ON_ERROR);
            }
        }
        $cache->save($result);
        echo $result;
    } else {
        header('Access-Control-Allow-Origin: *');
        $result['debug'] = true;
        $result['action'] = $action;
        $result['info'] = 'Action not found.';
        echo json_encode($result, JSON_NUMERIC_CHECK);
    }

} catch (Exception $ex) {
    error_log( $ex->getMessage() );
    $result['response'] = false;
    $result['fired'] = 'try in index';
    $result['error'] = $ex->getMessage();
    echo json_encode($result, JSON_NUMERIC_CHECK);
}
