<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\Other\Status;

/**
 * Description of StatusesController
 *
 * @author Rafał
 */
class StatusesController extends Controller
{
    public $useModels = array('Status');

    /**
     * @var mixed
     */
    private $Status;

    /**
     * StatusesController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Status = Status::getInstance();
    }

    /**
     * @return array
     */
    public function statuses()
    {
        $list = $this->Status->getAll();
        if (empty($list)) {
            $list = array();
        }
        return $list;
    }
}
