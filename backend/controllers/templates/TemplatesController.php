<?php
/**
 * Programista Rafał Leśniak - 21.4.2017
 */

use DreamSoft\Controllers\Components\Filter;
use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Template\Template;
use DreamSoft\Models\Template\TemplateRoot;
use DreamSoft\Models\Template\TemplateSetting;

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 21-04-2017
 * Time: 15:49
 */
class TemplatesController extends Controller
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
     * @var Template
     */
    protected $Template;
    /**
     * @var Filter
     */
    protected $Filter;
    /**
     * @var Uploader
     */
    protected $Uploader;

    private $configs;

    /**
     * TemplatesController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->TemplateRoot = TemplateRoot::getInstance();
        $this->TemplateSetting = TemplateSetting::getInstance();
        $this->Template = Template::getInstance();
        $this->Filter = Filter::getInstance();
        $this->Uploader = Uploader::getInstance();
        $this->setConfigs();
    }

    public function setConfigs()
    {
        $this->configs = array(
            'name' => array('type' => 'string', 'table' => 'dp_templates', 'field' => 'name', 'sign' => $this->Filter->signs['li'])
        );
    }

    /**
     * @return mixed
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
        $this->Template->setDomainID($ID);
    }

    /**
     * @method templates
     * @param {Array} $params
     * @return array
     */
    public function templates($params = NULL)
    {
        $limit = 150;
        if (isset($params['limit'])) {
            $limit = $params['limit'];
        }
        $offset = 0;
        if (isset($params['offset'])) {
            $offset = $params['offset'];
        }

        $sortBy[0] = '-created';
        if (isset($params['sort'])) {
            $sortBy = explode('|', $params['sort']);
        }

        $configs = $this->getConfigs();

        $filters = $this->Filter->prepare($configs, $params);

        $rootList = $this->TemplateRoot->getList($filters, $offset, $limit, $sortBy);
        $list = $this->Template->getList($filters, $offset, $limit, $sortBy);

        $templateRootSettings = $this->TemplateSetting->getAll(TEMPLATE_ROOT_VALUE);

        foreach ($rootList as $key => $rootTemplate) {
            $rootList[$key]['own'] = false;
            $rootList[$key]['ownName'] = 'default_templates';
            if (isset($templateRootSettings[$rootTemplate['ID']])) {
                $rootList[$key]['source'] = $templateRootSettings[$rootTemplate['ID']]['source'];
            } else {
                $rootList[$key]['source'] = 0;
            }
        }

        $templateSettings = $this->TemplateSetting->getAll(TEMPLATE_LOCAL_VALUE);

        foreach ($list as $key => $template) {
            $list[$key]['own'] = true;
            $list[$key]['ownName'] = 'own_templates';
            if (isset($templateSettings[$template['ID']])) {
                $list[$key]['source'] = $templateSettings[$template['ID']]['source'];
            } else {
                $list[$key]['source'] = 0;
            }
        }

        if( !$rootList ) {
            $rootList = array();
        }

        if( is_array($list) && !empty($list) ) {
            $list = array_merge($rootList, $list);
        } else {
            $list = $rootList;
        }

        if (empty($list)) {
            $list = array();
        }

        foreach ($list as $key => $item) {
            $list[$key]['fileExist'] = $this->checkTemplateFileExist($item);
            $list[$key]['url'] = $this->getFileUrl($item);
        }

        return $list;
    }

    /**
     * @return mixed
     */
    public function post_templates()
    {

        $fileName = $name = $this->Data->getPost('name');

        $created = date('Y-m-d H:i:s');
        $useVariables = $this->Data->getPost('useVariables');
        $return['response'] = false;
        if ($name) {
            $lastID = $this->Template->create(compact('name', 'fileName', 'created', 'useVariables'));
            if ($lastID > 0) {
                $params['source'] = 1;
                $params['templateID'] = $lastID;
                $params['domainID'] = $this->getDomainID();
                $params['root'] = TEMPLATE_LOCAL_VALUE;
                $lastTemplateSettingID = $this->TemplateSetting->create($params);
                if ($lastTemplateSettingID > 0) {
                    $return['item'] = $this->getOneWithSource($lastID);
                    $return['response'] = true;
                } else {
                    $return['info'] = 'Template setting fail.';
                }
            }
        } else {
            $return = $this->sendFailResponse('01');
        }

        return $return;
    }

    /**
     * @param int $templateID
     * @return array
     */
    public function delete_templates($templateID)
    {
        $result['response'] = false;

        $template = $this->getOneWithSource($templateID, 2);

        if ($template['source'] == 2) {
            $defaultDestinationFolder = $this->getDestinationDefaultSource($template);
            $this->Uploader->remove($defaultDestinationFolder, $template['fileName'] . '.html');
        }

        $destinationFolder = $this->getDestinationFolder($template);
        if ($destinationFolder) {
            $this->Uploader->remove($destinationFolder, $template['fileName'] . '.html');
        }

        if ($this->TemplateSetting->deleteByID($template['ID'], 2) && $this->Template->delete('ID', $template['ID'])) {
            $result = array('response' => true);
        } else {
            $result = $this->sendFailResponse('05');
        }
        return $result;
    }

    /**
     * @return array
     * @deprecated since 27.04.2017
     */
    public function put_templates()
    {
        $ID = $this->Data->getPost('ID');
        $name = $this->Data->getPost('name');
        $useVariables = $this->Data->getPost('useVariables');

        $one = $this->Template->get('ID', $ID);
        if (!$one) {
            return $this->sendFailResponse('06');
        }

        $updated = 0;
        if (!empty($name)) {
            $updated += intval($this->Template->update($ID, 'name', $name));
            $updated += intval($this->Template->update($ID, 'fileName', $name));
            $updated += intval($this->Template->update($ID, 'useVariables', $useVariables));
        }

        if ($updated > 0) {
            return array('response' => true);
        } else {
            return $this->sendFailResponse('03');
        }
    }

    /**
     * @return array
     */
    public function patch_setSource()
    {
        $source = $this->Data->getPost('source');
        $templateID = $this->Data->getPost('templateID');

        $response['response'] = false;

        $templateSetting = $this->TemplateSetting->getOne($templateID, TEMPLATE_LOCAL_VALUE);

        $updated = false;
        $lastID = 0;

        if ($templateSetting) {
            $updated = $this->TemplateSetting->update($templateSetting['ID'], 'source', $source);
        } else {
            $params['source'] = $source;
            $params['templateID'] = $templateID;
            $params['domainID'] = $this->getDomainID();
            $params['root'] = TEMPLATE_LOCAL_VALUE;
            $lastID = $this->TemplateSetting->create($params);
        }

        if ($lastID > 0 || $updated) {
            $item = $this->getOneWithSource($templateID);
            $item['fileExist'] = $this->checkTemplateFileExist($item);
            $response['item'] = $item;
            $response['response'] = true;
        }

        return $response;
    }

    /**
     * @param $templateID
     * @return array
     */
    public function post_upload($templateID)
    {
        $template = $this->getOneWithSource($templateID, TEMPLATE_LOCAL_VALUE);

        $destinationFolder = $this->getDestinationFolder($template);

        if (!$destinationFolder) {
            return array('response' => false, 'info' => 'destination folder fail');
        }

        $res = $this->Uploader->upload($_FILES, 'templateFile', $destinationFolder, $template['fileName'] . '.html');

        if ($res) {
            $template['fileExist'] = true;
        }

        return array('response' => $res, 'item' => $template);
    }

    /**
     * @param $templateID
     */
    public function getFile($templateID)
    {
        $template = $this->getOneWithSource($templateID, TEMPLATE_LOCAL_VALUE);

        $file = $this->getFilePath($template);

        header('Content-Type: text/html');
        readfile($file);
        die;
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
     * @return string
     */
    private function getFilePath(array $template)
    {
        $templateFolder = $template['ID'];
        if ($template['own'] == true) {
            $templateFolder = LOCAL_TEMPLATE_PREFIX . $template['ID'];
        }

        $file = '';

        if ($template['source'] == 1) {
            $file = MAIN_UPLOAD . 'templates' . '/' . companyID . '/' . $templateFolder . '/' . $template['fileName'] . '.html';
        } elseif ($template['source'] == 2) {
            $file = MAIN_UPLOAD . 'templates' . '/' . companyID . '/' . $templateFolder . '/' . $this->getDomainID() . '/' . $template['fileName'] . '.html';
        } elseif( $template['own'] == false ) {
            $file = MAIN_UPLOAD . 'templates' . '/' . TEMPLATE_DEFAULT_FOLDER . '/' . $template['ID'] . '/' . $template['fileName'] . '.html';
        }

        return $file;
    }

    /**
     * @param array $template
     * @return bool
     */
    private function checkTemplateFileExist(array $template)
    {
        $templateFolder = $template['ID'];
        if ($template['own'] == true) {
            $templateFolder = LOCAL_TEMPLATE_PREFIX . $template['ID'];
        }

        $file = '';

        if ($template['source'] == 1) {
            $file = MAIN_UPLOAD . 'templates' . '/' . companyID . '/' . $templateFolder . '/' . $template['fileName'] . '.html';
        } elseif ($template['source'] == 2) {
            $file = MAIN_UPLOAD . 'templates' . '/' . companyID . '/' . $templateFolder . '/' . $this->getDomainID() . '/' . $template['fileName'] . '.html';
        }

        return file_exists($file);
    }

    /**
     * @param array $template
     * @return bool|string
     */
    private function getDestinationFolder(array $template)
    {
        if ($template['source'] <= 0) {
            return false;
        }

        $templateFolder = $template['ID'];
        if ($template['own'] == true) {
            $templateFolder = LOCAL_TEMPLATE_PREFIX . $template['ID'];
        }

        $folder = false;

        if ($template['source'] == 1) {
            $folder = 'templates' . '/' . companyID . '/' . $templateFolder . '/';
        } elseif ($template['source'] == 2) {
            $folder = 'templates' . '/' . companyID . '/' . $templateFolder . '/' . $this->getDomainID() . '/';
        }
        return $folder;
    }

    /**
     * @param int $templateID
     * @param int $root
     * @return array
     */
    private function getOneWithSource($templateID, $root = 2)
    {
        $one = $this->Template->get('ID', $templateID);
        $templateSetting = $this->TemplateSetting->getOne($templateID, $root);
        if ($templateSetting) {
            $one['source'] = $templateSetting['source'];
        } else {
            $one['source'] = 0;
        }
        $one['own'] = true;

        return $one;
    }

    private function getDestinationDefaultSource(array $template)
    {
        if ($template['source'] <= 0) {
            return false;
        }

        $templateFolder = $template['ID'];
        if ($template['own'] == true) {
            $templateFolder = LOCAL_TEMPLATE_PREFIX . $template['ID'];
        }

        $folder = 'templates' . '/' . companyID . '/' . $templateFolder . '/';

        return $folder;
    }

    /**
     * @param array $template
     * @return string
     */
    private function getFileUrl(array $template)
    {
        $templateFolder = $template['ID'];
        if ($template['own'] == true) {
            $templateFolder = LOCAL_TEMPLATE_PREFIX . $template['ID'];
        }

        $file = '';

        if ($template['source'] == 1) {
            $file = STATIC_URL . 'templates' . '/' . companyID . '/' . $templateFolder . '/' . $template['fileName'] . '.html';
        } elseif ($template['source'] == 2) {
            $file = STATIC_URL . 'templates' . '/' . companyID . '/' . $templateFolder . '/' . $this->getDomainID() . '/' . $template['fileName'] . '.html';
        } elseif ($template['own'] == false) {
            $file = STATIC_URL . 'templates' . '/' . TEMPLATE_DEFAULT_FOLDER . '/' . $template['ID'] . '/' . $template['fileName'] . '.html';
        }

        return $file;
    }

}
