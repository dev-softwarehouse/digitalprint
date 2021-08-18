<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\Other\ModelIconExtension;

class ModelIconExtensionsController extends Controller
{

    /**
     * @var ModelIconExtension
     */
    protected $ModelIconExtension;
    public $useModels = array('ModelIconExtension');

    public function __construct($params)
    {
        parent::__construct($params);
        $this->ModelIconExtension = ModelIconExtension::getInstance();
    }


    public function modelIconExtensions()
    {
        $response = $this->ModelIconExtension->getAll();

        return $response;
    }
}