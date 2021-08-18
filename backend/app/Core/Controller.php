<?php
/**
 * Programista Rafał Leśniak - 31.3.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 31-03-2017
 * Time: 16:49
 */

namespace DreamSoft\Core;


use DreamSoft\Libs\Debugger;
use Exception;
use stdClass;
use DreamSoft\Libs\Data;
use DreamSoft\Libs\Auth;
use DreamSoft\Controllers\Components\Acl;

class Controller extends Debugger
{

    /**
     * @var string
     */
    private $modelsDir;
    /**
     * @var string
     */
    private $componentsDir;
    /**
     * @var
     */
    private $responseCodes;

    /**
     * @var array
     */
    public $useModels = array();
    /**
     * @var array
     */
    public $useComponents = array();

    /**
     * @var array
     */
    public $parents = array();
    /**
     * @var stdClass
     */
    public $models;
    /**
     * @var stdClass
     */
    public $components;
    /**
     * @var array
     */
    public $params;
    /**
     * @var Data
     */
    public $Data;
    /**
     * @var Auth
     */
    protected $Auth;


    /**
     * @var bool
     */
    protected $domainID = false;

    /**
     * Controller constructor.
     * @param array $parameters
     */
    public function __construct($parameters = array())
    {
        parent::__construct();

        $this->setDebugFile('controllers');

        $this->initResponseCodes();
        $this->modelsDir = 'models';
        $this->componentsDir = 'controllers' . '/' . 'components';

        $this->models = new stdClass();
        $this->components = new stdClass();

        /*
        try {
            self::useModels();
            self::useComponents();
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }
        */

        $this->params = $parameters;

        $this->Data = new Data();
        $this->Auth = new Auth();

        $this->params['lang'] = isset($this->params['lang']) ? $this->params['lang'] : 'pl';
    }

    /**
     * @param $errorCode
     * @param null $info
     * @return array
     */
    public function sendFailResponse($errorCode, $info = NULL)
    {
        $this->debug($errorCode, $info);
        $response = $this->responseCodes[$errorCode];
        if (!$response) {
            return $this->responseCodes['07'];
        }
        if ($info) {
            $response['info'] = $info;
        }
        return $response;
    }

    /**
     *
     */
    public function initResponseCodes()
    {
        $this->responseCodes = array(
            '01' => array('httpCode' => 400,
                'info' => 'empty_post',
                'response' => false),
            '02' => array('httpCode' => 400,
                'info' => 'fill_fields_of_form',
                'response' => false),
            '03' => array('httpCode' => 500,
                'info' => 'data_could_not_be_saved',
                'response' => false),
            '04' => array('httpCode' => 400,
                'info' => 'no_identifier',
                'response' => false),
            '05' => array('httpCode' => 500,
                'info' => 'Nie udało się usunąć obiektu',
                'response' => false),
            '06' => array('httpCode' => 400,
                'info' => 'Obiekt o podanym identyfikatorze nie istnieje',
                'response' => false),
            '07' => array('httpCode' => 400,
                'info' => 'Błąd niestandardowy',
                'response' => false),
            '08' => array('info' => 'Występuje duplikat unikalnego klucza tego obiektu',
                'httpCode' => 400,
                'response' => false
            ),
            '09' => array(
                'info' => 'Problem z nazwami językowymi',
                'httpCode' => 400,
                'response' => false
            ),
            '10' => array(
                'info' => 'Błąd podczas zapisu',
                'httpCode' => 400,
                'response' => false
            ),
            '11' => array(
                'info' => 'Zapytanie nie może zostać przetworzone',
                'httpCode' => 400,
                'response' => false
            ),
            '12' => array(
                'info' => 'Nie masz uprawnień do tej akcji',
                'httpCode' => 401,
                'response' => false
            ),
            '13' => array(
                'info' => 'Nie prawidłowa akcja',
                'httpCode' => 400,
                'response' => false
            ),
            '14' => array(
                'info' => 'Próba edycji danych innego użytkownika',
                'httpCode' => 400,
                'response' => false
            ),
            '15' => array(
                'info' => 'Taka relacja już istnieje',
                'httpCode' => 400,
                'response' => false
            ),
            '16' => array(
                'info' => 'Brak formatów w produkcie. Należy je skonfigurować.',
                'httpCode' => 400,
                'response' => false
            ),
            '17' => array(
                'info' => 'User not logged.',
                'httpCode' => 403,
                'response' => false
            ),
            '18' => array(
                'info' => 'User not exist.',
                'httpCode' => 400,
                'response' => false
            ),
            '19' => array(
                'info' => 'Captcha not valid.',
                'httpCode' => 400,
                'response' => false
            ),
            '20' => array(
                'info' => 'date expires',
                'httpCode' => 400,
                'response' => false
            )
        );
    }

    /**
     * @param $controller
     * @param $action
     * @param null $package
     * @param null $user
     * @return bool
     */
    public function checkPerms($controller, $action, $package = NULL, $user = NULL)
    {
        $Acl = new Acl();
        return $Acl->checkPerms($controller, $action, $package, $user);
    }

    /**
     * @param $index
     * @return bool|mixed
     */
    public function getParam($index)
    {
        $i = 0;
        foreach ($this->params as $row) {
            if ($i == $index) {
                return $row;
            }
            $i++;
        }
        return false;
    }

    /**
     * @param $parents
     */
    public function setParents($parents)
    {
        $this->parents = $parents;
    }

    /**
     * @return bool
     */
    protected function _check_login()
    {
        if (!$this->Auth->checkLogin()) {
            return false;
        }
        return true;
    }

    /**
     *
     */
    public static function sendJson()
    {
        header('Content-Type: application/json');
    }

    /**
     * @throws Exception
     */
    public function useModels()
    {
        error_log('Controller - useModels: '. get_called_class());

        /*
        if (!empty($this->useModels) && is_array($this->useModels)) {
            foreach ($this->useModels as $key => $row) {
                error_log(var_export($row, true));
                if (is_array($row)) {
                    if (is_file($this->modelsDir . '/' . $row['package'] . '/' . $key . '.php')) {
                        include_once($this->modelsDir . '/' . $row['package'] . '/' . $key . '.php');
                        //{$key} = $key::getInstance()::getInstance();
                        //$this->useRelatedModels({$key}->hasMany)::getInstance();
                    } else {
                        throw new Exception('Problem z modelem ' . $key . ' nie istnieje lub ma złą nazwę.');
                    }
                } else {
                    if (is_file($this->modelsDir . '/' . $row . '.php')) {
                        include_once($this->modelsDir . '/' . $row . '.php');
                        //{$row} = $row::getInstance()::getInstance();
                        //$this->useRelatedModels({$row}->hasMany)::getInstance();
                    } else {
                        throw new Exception('Problem z modelem ' . $row . ' nie istnieje lub ma złą nazwę.');
                    }
                }
            }
        }
        */
    }

    /**
     * @throws Exception
     */
    public function useComponents()
    {
        error_log('Controller - useComponents: '. get_called_class());

        /*
        if (!empty($this->useComponents) && is_array($this->useComponents)) {
            foreach ($this->useComponents as $row) {
                if (is_file($this->componentsDir . '/' . $row . '.php')) {
                    include_once($this->componentsDir . '/' . $row . '.php');
                    $nameRow = $row;
                    $this->components->{$row} = new $nameRow();
                } else {
                    throw new Exception('Problem z komponentem ' . $row . ' nie istnieje lub ma złą nazwę.');
                }
            }
        }
        */
    }

    /**
     * @param $ID
     */
    public function setDomainID($ID)
    {
        $this->domainID = $ID;
    }

    /**
     * @return bool
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param $Model
     * @return mixed
     */
    public function checkModelErrors($Model)
    {
        $errors = $Model->getErrors();

        if (!empty($errors)) {
            return $errors;
        }
    }

    /**
     * @param $module
     * @param $name
     * @return bool|string
     */
    public function getView($module, $name)
    {
        $file = BASE_DIR . 'views' . DIRECTORY_SEPARATOR . $module . DIRECTORY_SEPARATOR . $name . '.' . 'html';
        if (is_file($file)) {
            return file_get_contents($file);
        } else {
            $this->debug('problem with: ' . $module . ' - ' . $name);
        }
    }
}