<?php

use DreamSoft\Controllers\Components\ExportImport;
use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Models\Lang\LangRoot;
use DreamSoft\Models\Lang\LangSettingsRoot;
use DreamSoft\Core\Controller;
use DreamSoft\Controllers\Traits\ExportLang;
use DreamSoft\Controllers\Traits\ImportLang;
/**
 * Class LangRootController
 */
class LangRootController  extends Controller
{
    use ExportLang;
    use ImportLang;
    public $useModels = array();

    /**
     * @var LangRoot
     */
    protected $LangRoot;
    protected $LangSettingsRoot;
    /**
     * @var ExportImport
     */
    protected $ExportImport;
    /**
     * @var Uploader
     */
    protected $Uploader;


    public function __construct($params)
    {
        parent::__construct($params);
        $this->LangRoot = LangRoot::getInstance();
        $this->LangSettingsRoot = LangSettingsRoot::getInstance();
        $this->ExportImport = ExportImport::getInstance();
        $this->Uploader = Uploader::getInstance();
    }

    /**
     * @return mixed
     */
    public function index()
    {
        $langList = $this->LangRoot->getAll();
        return $langList;
    }

    /**
     * @return mixed
     */
    public function post_index()
    {
        $key = $this->Data->getPost('key');
        $lang = $this->Data->getPost('lang');
        $value = $this->Data->getPost('value');
        if ($key && $lang && $value) {

            $exist = $this->LangRoot->getOne($key, $lang);

            if (!$exist) {
                $lastID = $this->LangRoot->customCreate($key, $value, $lang);
                if ($lastID > 0) {
                    $return = $this->LangRoot->getOne($key, $lang);
                }
                if (!$return) {
                    $return['response'] = false;
                }
            } else {
                return $this->sendFailResponse('08');
            }

            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    /**
     * @return mixed
     */
    public function put_index()
    {
        $key = $this->Data->getPost('key');
        $value = $this->Data->getPost('value');
        $lang = $this->Data->getPost('lang');
        $ID = $this->Data->getPost('ID');

        if (!$ID) {
            $return['response'] = false;
            return $return;
        }


        $res = $this->LangRoot->customUpdate($ID, $key, $value, $lang);
        if ($res) {
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
        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->LangRoot->delete('ID', $ID)) {
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

    /**
     * @return mixed
     */
    public function showEmpty()
    {
        $langList = $this->LangSettingsRoot->getAll();
        //
        $langArr = array();
        if (!empty($langList)) {
            foreach ($langList as $row) {
                if ($row['active'] == 1) {
                    $langArr[] = $row['code'];
                }
            }
        }
        return $this->LangRoot->searchEmpty($langArr);
    }

    protected function getData()
    {
        return $this->Data;
    }

    protected function getLang()
    {
        return $this->LangRoot;
    }

    protected function getExportImport()
    {
        return $this->ExportImport;
    }
    protected function getUploader()
    {
        return $this->Uploader;
    }
}
