<?php

use DreamSoft\Models\Lang\LangSettingsRoot;
use DreamSoft\Models\Lang\LangRoot;
use DreamSoft\Core\Controller;

/**
 * Class LangSettingsRootController
 */
class LangSettingsRootController extends Controller
{

    public $useModels = array();

    /**
     * @var LangSettingsRoot
     */
    protected $LangSettingsRoot;
    /**
     * @var LangRoot
     */
    protected $LangRoot;

    /**
     * LangSettingsRootController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->LangSettingsRoot = LangSettingsRoot::getInstance();
        $this->LangRoot = LangRoot::getInstance();
    }

    /**
     * @return bool
     */
    public function index()
    {

        $langList = $this->LangSettingsRoot->getAll();
        if (!$langList) {
            $return['response'] = false;
            return $return;
        }
        return $langList;
    }

    /**
     * @return mixed
     */
    public function post_index()
    {
        $code = $this->Data->getPost('code');
        $name = $this->Data->getPost('name');
        $active = $this->Data->getPost('active');
        if (!$active) {
            $active = 1;
        }

        if (!$code || !$name) {
            $return = $this->sendFailResponse('02');
            return $return;
        }

        $params['code'] = $code;
        $params['name'] = $name;
        $params['active'] = $active;
        $lastID = $this->LangSettingsRoot->create($params);
        if ($lastID > 0) {
            $data['item'] = $this->LangSettingsRoot->get('ID', $lastID);
            $data['response'] = true;
            return $data;
        } else {
            return $this->sendFailResponse('03');
        }
    }

    /**
     * @return mixed
     */
    public function put_index()
    {
        $post = $this->Data->getAllPost();

        $goodKeys = array('code', 'name', 'active');

        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            return $this->sendFailResponse('04');
        }

        foreach ($post as $key => $value) {
            if (!in_array($key, $goodKeys)) {
                continue;
            }
            $this->LangSettingsRoot->update($ID, $key, $value);
        }
        $return['response'] = true;
        return $return;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_index($ID)
    {
        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->LangSettingsRoot->delete('ID', $ID)) {
                $data['response'] = true;
                return $data;
            } else {
                $data['response'] = false;
                return $data;
            }

        } else {
            header("HTTP/1.0 403 Forbidden");
            $data['response'] = false;
            return $data;
        }
    }
}


