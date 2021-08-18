<?php

use DreamSoft\Controllers\Components\Filter;
use DreamSoft\Controllers\Components\RouteAssistant;
use DreamSoft\Controllers\Components\Standard;
use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Domain\Domain;
use DreamSoft\Models\Route\Route;
use DreamSoft\Models\Template\TemplateRoot;
use DreamSoft\Models\Template\TemplateSetting;

/**
 * Description of TemplatesController
 * @class TemplatesController
 * @author Rafał
 */
class TemplateRootController extends Controller
{

    public $useModels = array();

    /**
     * @var TemplateRoot
     */
    protected $TemplateRoot;
    /**
     * @var TemplateSetting
     */
    protected $TemplateSetting;
    /**
     * @var Filter
     */
    protected $Filter;
    /**
     * @var Uploader
     */
    protected $Uploader;
    /**
     * @var Standard
     */
    protected $Standard;
    /**
     * @var Route
     */
    protected $Route;
    /**
     * @var Domain
     */
    protected $Domain;

    protected $configs;
    protected $folder;
    /**
     * @var RouteAssistant
     */
    private $RouteAssistant;

    /**
     * @constructor
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Filter = Filter::getInstance();
        $this->TemplateRoot = TemplateRoot::getInstance();
        $this->TemplateSetting = TemplateSetting::getInstance();
        $this->Route = Route::getInstance();
        $this->Domain = Domain::getInstance();
        $this->Standard = Standard::getInstance();
        $this->folder = 'templates';
        $this->Uploader = Uploader::getInstance();
        $this->RouteAssistant = RouteAssistant::getInstance();
        $this->setConfigs();
    }

    public function setConfigs()
    {
        $this->configs = array(
            'name' => array('type' => 'string', 'table' => 'dp_templates', 'field' => 'name', 'sign' => $this->Filter->signs['li'])
        );
    }

    /**
     * @return array
     */
    public function getConfigs()
    {
        return $this->configs;
    }

    /**
     * @param int $ID
     */
    public function setDomainID($ID)
    {
        parent::setDomainID($ID);
        $this->TemplateSetting->setDomainID($ID);
        $this->RouteAssistant->setDomainID($ID);
    }

    /**
     * @method templates
     * @param {Array} $params
     * @return array
     */
    public function templates($params = NULL)
    {

        $list = $this->TemplateRoot->getList(null, 0, 1000, ['-created']);

        if (empty($list)) {
            $list = array();
        }

        $templateSettings = $this->TemplateSetting->getAll(1);

        foreach ($list as $key => $item) {

            if (isset($templateSettings[$item['ID']])) {
                $list[$key]['source'] = $item['source'] = $templateSettings[$item['ID']]['source'];
            } else {
                $list[$key]['source'] = $item['source'] = 0;
            }

            $list[$key]['fileExist'] = $this->checkTemplateFileExist($item);
        }

        return $list;
    }

    /**
     * @method post_templates
     * @return {Array}
     */
    public function post_templates()
    {

        $fileName = $name = $this->Data->getPost('name');
        $useVariables = $this->Data->getPost('useVariables');
        $created = date('Y-m-d H:i:s');

        $return['response'] = false;
        if ($name) {
            $lastID = $this->TemplateRoot->create(compact('name', 'fileName', 'created', 'useVariables'));
            if ($lastID > 0) {
                $return['item'] = $this->TemplateRoot->get('ID', $lastID);
                $return['response'] = true;
            }
        } else {
            $return = $this->sendFailResponse('01');
        }

        return $return;
    }

    /**
     * Edit template
     *
     * @method put_templates
     * @return array
     */
    public function put_templates()
    {
        $ID = $this->Data->getPost('ID');
        $name = $this->Data->getPost('name');
        $useVariables = $this->Data->getPost('useVariables');

        $one = $this->TemplateRoot->get('ID', $ID);
        if (!$one) {
            return $this->sendFailResponse('06');
        }

        $updated = 0;
        if (!empty($name)) {
            $updated += intval($this->TemplateRoot->update($ID, 'name', $name));
            $updated += intval($this->TemplateRoot->update($ID, 'fileName', $name));
            $updated += intval($this->TemplateRoot->update($ID, 'useVariables', $useVariables));
        }

        if ($updated == 3) {
            return array('response' => true);
        } else {
            return $this->sendFailResponse('03');
        }
    }

    /**
     *
     * @method delete_templates
     * @param int $ID
     * @return array
     */
    public function delete_templates($ID)
    {
        if (intval($ID) > 0) {
            if ($this->TemplateRoot->delete('ID', $ID)) {
                $data['response'] = true;
            } else {
                return $this->sendFailResponse('05');
            }
        } else {
            return $this->sendFailResponse('05');
        }
        return $data;
    }

    /**
     * @param $templateID
     * @return array
     */
    public function post_upload($templateID)
    {
        $one = $this->getOneWithSource($templateID, 1);

        $destinationFolder = $this->getDestinationFolder($one);

        if (!$destinationFolder) {
            return array('response' => false, 'info' => 'destination folder fail');
        }

        $res = $this->Uploader->upload($_FILES, 'templateFile', $destinationFolder, $one['fileName'] . '.html');

        if( $res ) {
            $one['fileExist'] = true;
        }

        return array('response' => $res, 'item' => $one);
    }

    /**
     * @param $templateID
     */
    public function getFile($templateID)
    {
        $one = $this->getOneWithSource($templateID, 1);

        $file = $this->getFilePath($one);

        header('Content-Type: text/html');
        readfile($file);
        die;
    }

    /**
     * @param $templateID
     * @return array
     */
    public function getUrl($templateID)
    {
        $one = $this->getOneWithSource($templateID, 1);

        $url = $this->getFileUrl($one);

        $rand = rand(0, 100);
        $url .= '?_ver=' . $rand;

        return array('url' => $url);
    }

    public function getCss()
    {
        $file = MAIN_UPLOAD . companyID . '/' . 'styles' . '/' . MAIN_CSS_FILE;

        if (!is_file($file)) {
            $file = MAIN_UPLOAD . SOURCE_PRINTHOUSE_ID . '/' . 'styles' . '/' . MAIN_CSS_FILE;
        }

        header('Content-Type: text/css');
        readfile($file);
        die;
    }

    /**
     * @return mixed
     */
    public function patch_setSource()
    {
        $source = $this->Data->getPost('source');
        $templateID = $this->Data->getPost('templateID');

        $response['response'] = false;

        $template = $this->TemplateSetting->getOne($templateID, 1);

        $updated = false;
        $lastID = 0;

        if ($template) {
            $updated = $this->TemplateSetting->update($template['ID'], 'source', $source);
        } else {
            $params['source'] = $source;
            $params['templateID'] = $templateID;

            $params['domainID'] = $this->getDomainID();
            $lastID = $this->TemplateSetting->create($params);
        }

        if ($lastID > 0 || $updated) {
            $item = $this->TemplateRoot->get('ID', $templateID);
            $templateSetting = $this->TemplateSetting->getOne($item['ID'], 1);
            $item['source'] = $templateSetting['source'];
            $item['fileExist'] = $this->checkTemplateFileExist($item);
            $item['url'] = $this->getFileUrl($item);
            $item['own'] = false;
            $response['item'] = $item;
            $response['response'] = true;
            $response['routingGenerated'] = $this->RouteAssistant->generateRoutesFile();
        }

        return $response;
    }

    /**
     * @return array
     */
    public function post_removeFile()
    {
        $templateID = $this->Data->getPost('templateID');
        $root = $this->Data->getPost('root');

        $template = $this->getOneWithSource($templateID, $root);

        $destinationFolder = $this->getDestinationFolder($template);
        if (!$destinationFolder) {
            return array('response' => false, 'info' => 'destination folder fail');
        }

        if ($this->Uploader->remove($destinationFolder, $template['fileName'] . '.html')) {
            $result = array('response' => true);
        } else {
            $result = $this->sendFailResponse('05');
        }
        return $result;
    }

    /**
     * @param array $template
     * @return bool
     */
    private function checkTemplateFileExist( array $template )
    {
        if( $template['source'] == 1 ) {
            $file = MAIN_UPLOAD . 'templates' . '/' . companyID . '/' . $template['ID'] . '/' . $template['fileName'] . '.html';
        } elseif ( $template['source'] == 2 ) {
            $file = MAIN_UPLOAD . 'templates' . '/' . companyID . '/' . $template['ID'] . '/' . $this->getDomainID() . '/' . $template['fileName'] . '.html';
        } else {
            $file = MAIN_UPLOAD . 'templates' . '/' . TEMPLATE_DEFAULT_FOLDER . '/' . $template['ID'] . '/' . $template['fileName'] . '.html';
        }
        return file_exists($file);
    }

    /**
     * @param array $template
     * @return bool|string
     */
    private function getDestinationFolder(array $template)
    {

        if( $template['source'] <= 0 ) {
            return false;
        }
        if( $template['source'] == 1 ) {
            $folder = 'templates' . '/' . companyID . '/' . $template['ID'] . '/';
        } elseif ( $template['source'] == 2 ) {
            $folder = 'templates' . '/' . companyID . '/' . $template['ID'] . '/' . $this->getDomainID() . '/';
        } else {
            $folder = false;
        }

        return $folder;
    }

    /**
     * @param array $template
     * @return string
     */
    private function getFilePath(array $template)
    {
        if( $template['source'] == 1 ) {
            $file = MAIN_UPLOAD . 'templates' . '/' . companyID . '/' . $template['ID'] . '/' . $template['fileName'] . '.html';
        } elseif ( $template['source'] == 2 ) {
            $file = MAIN_UPLOAD . 'templates' . '/' . companyID . '/' . $template['ID'] . '/' . $this->getDomainID() . '/' . $template['fileName'] . '.html';
        } else {
            $file = MAIN_UPLOAD . 'templates' . '/' . TEMPLATE_DEFAULT_FOLDER . '/' . $template['ID'] . '/' . $template['fileName'] . '.html';
        }

        return $file;
    }

    /**
     * @param array $template
     * @return string
     */
    private function getFileUrl(array $template)
    {
        $staticUrl = STATIC_URL;
        $domain = $this->Domain->get('ID', $this->getDomainID());

        if( intval($domain['ssl']) === 1 && sourceApp === 'client' ) {
            $staticUrl = str_replace('http://', 'https://', $staticUrl);
        }

        if( $template['source'] == 1 ) {
            $file = $staticUrl . 'templates' . '/' . companyID . '/' . $template['ID'] . '/' . $template['fileName'] . '.html';
        } elseif ( $template['source'] == 2 ) {
            $file = $staticUrl . 'templates' . '/' . companyID . '/' . $template['ID'] . '/' . $this->getDomainID() . '/' . $template['fileName'] . '.html';
        } else {
            $file = $staticUrl . 'templates' . '/' . TEMPLATE_DEFAULT_FOLDER . '/' . $template['ID'] . '/' . $template['fileName'] . '.html';
        }

        return $file;
    }

    /**
     * @param $templateID
     * @param int $root
     * @return array
     */
    private function getOneWithSource($templateID, $root = 1)
    {
        $one = $this->TemplateRoot->get('ID', $templateID);
        $templateSetting = $this->TemplateSetting->getOne($templateID, $root);
        if( $templateSetting ) {
            $one['source'] = $templateSetting['source'];
        } else {
            $one['source'] = 0;
        }


        return $one;
    }

}
