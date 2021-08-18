<?php
/**
 * Programista Rafał Leśniak - 31.3.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 31-03-2017
 * Time: 16:50
 */

namespace DreamSoft\Core;

use DreamSoft\Libs\Debugger;
use stdClass;
use Exception;

class Component extends Debugger
{
    private $modelsDir;
    private $componentsDir;

    public $useModels = array();
    public $useComponents = array();

    public $models;
    public $components;

    public function __construct()
    {
        parent::__construct();
        $this->setDebugFile('components');

        $this->modelsDir = BASE_DIR.'models';
        $this->componentsDir = BASE_DIR.'controllers'.'/'.'components';

        $this->models = new stdClass();
        $this->components = new stdClass();

    }

    /**
     * @throws Exception
     */
    public function useModels()
    {
        error_log('Component - useModels: '. get_called_class());
    }

    /**
     * @throws Exception
     */
    public function useComponents(){

        error_log('Component - useComponents: '. get_called_class());

    }
}
