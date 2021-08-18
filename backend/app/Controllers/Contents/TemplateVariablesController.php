<?php

namespace DreamSoft\Controllers\Contents;

use \DreamSoft\Core\Controller;
use DreamSoft\Models\Group\Group;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\Product\Category;
use DreamSoft\Models\Template\TemplateRoot;
use DreamSoft\Models\Template\Template;
use DreamSoft\Models\TemplateVariables\TemplateVariables;
use DreamSoft\Models\TemplateVariables\VariableType;

class TemplateVariablesController extends Controller
{
    /**
     * @var VariableType
     */
    private $TemplateVariableType;
    /**
     * @var TemplateVariables
     */
    private $TemplateVariables;
    /**
     * @var TemplateRoot
     */
    private $TemplateRoot;
    /**
     * @var Template
     */
    private $Template;

    /**
     * @var Group
     */
    protected $Group;
    /**
     * @var Category
     */
    protected $Category;
    /**
     * @var PrintShopType
     */
    protected $PrintShopType;

    public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        $this->TemplateVariableType = VariableType::getInstance();
        $this->TemplateRoot = TemplateRoot::getInstance();
        $this->Template = Template::getInstance();
        $this->Group = Group::getInstance();
        $this->Category = Category::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->TemplateVariables = TemplateVariables::getInstance();
    }

    public function index()
    {
        return $this->TemplateVariableType->get('domainID', $this->domainID, true);;
    }

    public function delete_index($id)
    {
        $this->TemplateVariables->delete('templateVariableTypeID', $id);
        return ['response' => $this->TemplateVariableType->delete('ID', $id)];
    }

    public function getTemplates()
    {
        $format = ['useVariables' => ['value' => 1, 'table' => 't', 'field' => 'useVariables', 'sign' => '=']];
        return array_merge($this->TemplateRoot->getList($format), $this->Template->getList($format));
    }

    public function getSelectors()
    {
        return ['categories' => $this->Category->getAllWithLang('dp_categorylangs', 'categoryID'),
            'groups' => $this->Group->getAllWithLang('ps_products_grouplangs', 'groupID'),
            'types' => $this->PrintShopType->getAllWithLang('ps_products_typelangs', 'typeID')];
    }

    /**
     * Create
     * @return array
     */
    public function post_index()
    {
        $postData = $this->Data->getAllPost();
        $postData['domainID'] = $this->domainID;
        return ['response' => $this->TemplateVariableType->create($postData)];
    }

    /**
     * Update
     * @return array
     */
    public function put_index($ID)
    {
        $data = array_filter($this->Data->getAllPost(), function ($key) {
            return in_array($key, ['name', 'values', 'templateID']);
        }, ARRAY_FILTER_USE_KEY);
        return ['response' => $this->TemplateVariableType->updateAll($ID, $data)];
    }

    /**
     * Create
     * @return array
     */
    public function post_assoc()
    {
        $postData = $this->Data->getAllPost();
        $data = [];
        $data['templateVariableTypeID'] = $postData['ID'];
        $data['value'] = $postData['value'];
        $data['categoryID'] = $postData['categoryID'];
        $data['groupID'] = $postData['groupID'];
        $data['typeID'] = $postData['typeID'];
        return ['response' => $this->TemplateVariables->create($data)];
    }

    /**
     * Update
     * @return array
     */
    public function put_assoc($ID)
    {
        $postData = $this->Data->getAllPost();
        if (!$postData['range']) {
            return ['response' => $this->TemplateVariables->updateAll($ID, $postData)];
        } else {
            $checkData = [[], []];
            if ($postData['range'] == 'category') {
                $checkData[0][] = 'categoryID';
                $checkData[1][] = $postData['categoryID'];
            } else if ($postData['range'] == 'group') {
                $checkData[0][] = 'groupID';
                $checkData[1][] = $postData['groupID'];
            } else if ($postData['range'] == 'type') {
                $checkData[0][] = 'typeID';
                $checkData[1][] = $postData['typeID'];
            }
            $checkData[0][] = 'templateVariableTypeID';
            $checkData[1][] = $postData['templateVariableTypeID'];
            if ($this->TemplateVariables->exist($checkData[0], $checkData[1])) {
                $this->TemplateVariables->delete($checkData[0], $checkData[1]);
            }
            $record = [];
            $record['templateVariableTypeID'] = $postData['templateVariableTypeID'];
            $record['value'] = $postData['value'];
            $record['categoryID'] = $postData['categoryID'];
            $record['groupID'] = $postData['groupID'];
            $record['typeID'] = $postData['typeID'];
            return ['response' => $this->TemplateVariables->create($record)];
        }

    }

    /**
     * @return array
     */
    public function getForRange($params)
    {
        return $this->TemplateVariables->getKind($params['range'], $params['id']);
    }

    public function getGlobal()
    {
        return $this->TemplateVariables->getGlobal();
    }

    public function getVariables($params = null)
    {
        if($params['all']){
            return ['response' => $this->TemplateVariables->getConfiguredVariables( $params['templateName'])];
        }else{
            return ['response' => $this->TemplateVariables->getVariables($params['groupID'], $params['typeID'], $params['categoryID'], $params['templateName'])];
        }
    }
}
