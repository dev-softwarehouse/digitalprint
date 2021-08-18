<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\Setting\Content;

/**
 * Class ContentsController
 */
class ContentsController extends Controller
{

    /**
     * @var array
     */
    public $useModels = array('Content');

    /**
     * @var Content
     */
    protected $Content;

    /**
     * ContentsController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Content = Content::getInstance();
    }


    /**
     * @param $module
     */
    public function setModule($module)
    {
        $this->Content->setModule($module);
    }


    /**
     * @param $key
     * @return array|bool
     */
    public function index($key)
    {

        if (strlen($key) > 0) {
            $data = $this->Content->getValue($key);
        } else {
            $data = $this->Content->getAllByModule();
        }
        return $data;
    }


    /**
     * @return mixed
     */
    public function post_index()
    {
        $key = $this->Data->getPost('key');
        $value = $this->Data->getPost('value');
        if ($key && $value) {
            $this->Content->set($key, $value);
            $return['response'] = true;
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }


    /**
     * @param $ID
     * @return mixed
     */
    public function delete_index($ID)
    {
        if (strlen($ID) == 0) {
            header("HTTP/1.0 403 Forbidden");
            $data['response'] = false;
            return $data;
        }
        $this->Content->delete($ID);
        $data['response'] = true;
        return $data;
    }

}