<?php

namespace DreamSoft\Controllers\Route;

use DreamSoft\Models\MainMetaTag\MainMetaTag;
use DreamSoft\Models\MainMetaTag\MainMetaTagLanguage;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeLanguage;
use DreamSoft\Models\PrintShopProduct\PrintShopGroupLanguage;
use DreamSoft\Core\Controller;
use DreamSoft\Controllers\Components\RouteAssistant;
use DreamSoft\Models\Product\CategoryLang;
use DreamSoft\Models\Seo\MetaTag;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\Route\Route;
use DreamSoft\Models\Route\RouteLang;
use DreamSoft\Models\Template\Template;
use DreamSoft\Models\Template\TemplateRoot;
use DreamSoft\Models\Template\TemplateSetting;
use DreamSoft\Models\Template\View;
use DreamSoft\Models\Template\ViewVariable;
use DreamSoft\Models\Template\ViewVariableLang;

/**
 * Description of RoutesController
 * @class RoutesController
 * @author Rafał
 */
class RoutesController extends Controller
{

    public $useModels = array();

    /**
     * @var Route
     */
    protected $Route;
    /**
     * @var RouteLang
     */
    protected $RouteLang;
    /**
     * @var View
     */
    protected $View;
    /**
     * @var ViewVariable
     */
    protected $ViewVariable;
    /**
     * @var ViewVariableLang
     */
    protected $ViewVariableLang;
    /**
     * @var TemplateRoot
     */
    protected $TemplateRoot;
    /**
     * @var Template
     */
    protected $Template;
    /**
     * @var TemplateSetting
     */
    protected $TemplateSetting;
    /**
     * @var Setting
     */
    protected $Setting;
    /**
     * @var LangSetting
     */
    protected $LangSetting;
    /**
     * @var MainMetaTag
     */
    protected $MainMetaTag;
    /**
     * @var MainMetaTagLanguage
     */
    protected $MainMetaTagLanguage;
    /**
     * @var MetaTag
     */
    protected $MetaTag;
    /**
     * @var CategoryLang
     */
    protected $CategoryLang;
    /**
     * @var PrintShopGroupLanguage
     */
    protected $PrintShopGroupLanguage;
    /**
     * @var PrintShopTypeLanguage
     */
    protected $PrintShopTypeLanguage;
    private $settingLanguages = array();

    /**
     * @var RouteAssistant;
     */
    private $RouteAssistant;


    /**
     * @constructor
     * @param array $parameters
     */
    public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        $this->Route = Route::getInstance();
        $this->RouteLang = RouteLang::getInstance();
        $this->View = View::getInstance();
        $this->ViewVariable = ViewVariable::getInstance();
        $this->ViewVariableLang = ViewVariableLang::getInstance();
        $this->TemplateRoot = TemplateRoot::getInstance();
        $this->Template = Template::getInstance();
        $this->LangSetting = LangSetting::getInstance();
        $this->TemplateSetting = TemplateSetting::getInstance();
        $this->Setting = Setting::getInstance();
        $this->Setting->setModule('general');
        $this->MetaTag = MetaTag::getInstance();
        $this->CategoryLang = CategoryLang::getInstance();
        $this->PrintShopGroupLanguage = PrintShopGroupLanguage::getInstance();
        $this->PrintShopTypeLanguage = PrintShopTypeLanguage::getInstance();
        $this->MainMetaTag = MainMetaTag::getInstance();
        $this->MainMetaTagLanguage = MainMetaTagLanguage::getInstance();
        $this->RouteAssistant = RouteAssistant::getInstance();
    }

    /**
     * @return array
     */
    public function getSettingLanguages()
    {
        return $this->settingLanguages;
    }

    /**
     * @param array $settingLanguages
     */
    public function setSettingLanguages($settingLanguages)
    {
        $this->settingLanguages = $settingLanguages;
    }

    /**
     * @param int $domainID
     */
    public function setDomainID($domainID)
    {
        parent::setDomainID($domainID);
        $this->Route->setDomainID($domainID);
        $this->RouteLang->setDomainID($domainID);
        $this->LangSetting->setDomainID($domainID);
        $this->Setting->setDomainID($domainID);
        $this->TemplateSetting->setDomainID($domainID);
        $this->MainMetaTag->setDomainID($domainID);
        $this->RouteAssistant->setDomainID($domainID);
    }

    /**
     * @param array $elements
     * @param int $parentId
     * @return array
     */
    function buildTree(array $elements, $parentId = 0)
    {
        $branch = array();

        foreach ($elements as $element) {
            if ($element['parentID'] == $parentId) {
                $children = $this->buildTree($elements, $element['ID']);
                if ($children) {
                    $element['children'] = $children;
                }
                $branch[] = $element;
            }
        }

        return $branch;
    }

    /**
     * @param null $state
     * @return array|bool
     */
    public function index($state = NULL)
    {
        if (strlen($state) > 0) {
            $list = $this->Route->getFullTree($state);
            if (!empty($list)) {
                foreach ($list as $key => $value) {
                    $langRes = array();
                    $langs = $value['langs'];
                    if (strlen($langs) > 0) {
                        $exp = explode("||", $langs);
                        if (!empty($exp)) {
                            foreach ($exp as $ln) {
                                $expLn = explode('::', $ln);
                                if (strlen($expLn[0])) {
                                    $langRes[$expLn[0]] = array('url' => $expLn[1], 'name' => $expLn[2]);
                                }
                            }
                        }
                    }
                    $list[$key]['langs'] = $langRes;
                    unset($langRes);
                }
                $list = $this->buildTree($list);
            }
        } else {
            $list = $this->Route->checkLevel();
            if (!empty($list)) {
                foreach ($list as $key => $value) {

                    $langUrlRes = array();
                    $langNameRes = array();
                    $langs = $value['langs'];

                    if (strlen($langs) > 0) {
                        $exp = explode("||", $langs);
                        if (!empty($exp)) {
                            foreach ($exp as $ln) {
                                $expLn = explode('::', $ln);
                                if (strlen($expLn[0])) {
                                    $langUrlRes[$expLn[0]] = $expLn[1];
                                    $langNameRes[$expLn[0]] = $expLn[2];
                                }
                            }
                        }
                    }
                    $list[$key]['langUrls'] = $langUrlRes;
                    $list[$key]['langNames'] = $langNameRes;
                    unset($langUrlRes);
                    unset($langNameRes);
                    unset($langs);
                }
                $list = $this->buildTree($list);
            }
        }

        if (!$list) {
            return array();
        }
        return $list;
    }

    /**
     * @return array
     */
    public function post_index()
    {

        $post = $this->Data->getAllPost();
        $langs = $post['langs'];
        $state = $post['state'];
        $abstract = $post['abstract'];
        $skipBreadcrumb = $post['skipBreadcrumb'];
        $name = $post['name'];
        $controller = $post['controller'];
        $parent = false;
        if (isset($post['parentID'])) {
            $parentID = $post['parentID'];
        } else {
            $parentID = 0;
        }

        $data['response'] = false;
        $exist = $this->Route->stateExist($state);
        if (intval($exist) > 0) {
            $data['exist'] = true;
            return $data;
        }
        if (!$langs) {
            $langs = json_decode($langs, true);
        }

        if ($parentID > 0) {
            $parent = $this->Route->get('ID', $parentID);
            if (!$parent) {
                $data['error'] = 'empty parent';
                return $data;
            }
        }

        if ($parent['state'] == 'main' || $parent['parentID'] == 0) {
            return $this->sendFailResponse('13', 'Can\'t add to root state!');
        }

        if ($parent) {
            $lastID = $this->Route->add($state, $parent['state']);
        } else {
            $lastID = $this->Route->add($state);
        }

        if ($lastID > 0) {
            $data['response'] = true;
            $data['item'] = $this->Route->get('ID', $lastID);

            if ($abstract) {
                $this->Route->update($lastID, 'abstract', $abstract);
            }
            if ($name) {
                $this->Route->update($lastID, 'name', $name);
            }

            if ($controller) {
                $this->Route->update($lastID, 'controller', $controller);
            }

            if ($skipBreadcrumb) {
                $this->Route->update($lastID, 'skipBreadcrumb', $skipBreadcrumb);
            }

            $countSaved = 0;

            if (!empty($post['langUrls'])) {
                foreach ($post['langUrls'] as $lang => $value) {
                    $actName = NULL;
                    if (strlen($post['langsNames'][$lang]) > 0) {
                        $actName = $post['langsNames'][$lang];
                    }
                    $countSaved += intval($this->RouteLang->set($lastID, $lang, $value, $actName));
                }
            }

            $data['langSaved'] = $countSaved;
        }

        if( $data['response'] ) {
            $this->RouteAssistant->generateRoutesFile();
        }

        return $data;
    }

    /**
     * @param $state
     * @return mixed
     */
    public function delete_index($state)
    {

        $data['response'] = false;
        if (!$state) {
            $data = $this->sendFailResponse('04');
            return $data;
        }

        $list = $this->Route->getFullTree($state);
        if (!empty($list)) {
            $toRemove = array();
            foreach ($list as $key => $value) {
                $langs = $value['langs'];
                if (strlen($langs) > 0) {
                    $exp = explode("||", $langs);
                    if (!empty($exp)) {
                        foreach ($exp as $ln) {
                            $expLn = explode('::', $ln);
                            $toRemove[] = $expLn[3];
                        }
                    }
                }
            }
        }

        $one = $this->Route->get('state', $state);
        if ($this->Route->customDelete($state)) {
            if (!empty($toRemove)) {
                $data['langsRemoved'] = $this->RouteLang->deleteList($toRemove);
            }

            $views = $this->View->getByRoute($one['ID']);
            $removedViews = 0;
            $removedViewLangs = 0;
            $removedViewVariables = 0;
            if ($this->View->delete('routeID', $one['ID'])) {
                $removedViews++;
                foreach ($views as $v) {
                    if ($this->ViewVariable->delete('viewID', $v['ID'])) {
                        $removedViewLangs++;
                        if ($this->ViewVariableLang->delete('variableID', $v['ID'])) {
                            $removedViewVariables++;
                        }
                    }
                }
            }
            $data['response'] = true;
            $data['info'] = 'removed';
            $data['removedViews'] = $removedViews;
            $data['removedViewLangs'] = $removedViewLangs;
            $data['removedViewVariables'] = $removedViewVariables;

            if( $data['response'] ) {
                $this->RouteAssistant->generateRoutesFile();
            }
        } else {
            $data = $this->sendFailResponse('05');
        }
        return $data;
    }

    /**
     * @return array
     */
    public function patch_index()
    {

        $action = $this->Data->getPost('action');

        $data['response'] = false;

        switch ($action) {
            case "move":
                $from = $this->Data->getPost('from');
                $to = $this->Data->getPost('to');
                if ($from && $to) {
                    $data['response'] = $this->Route->move($from, $to);
                } else {
                    $data = $this->sendFailResponse('02');
                }
                break;
            case "edit":
                $post = $this->Data->getAllPost();
                $ID = $this->Data->getPost('ID');
                $state = $this->Data->getPost('state');

                $parentID = $this->Data->getPost('parentID');
                $abstract = $this->Data->getPost('abstract');
                $skipBreadcrumb = $this->Data->getPost('skipBreadcrumb');
                $name = $this->Data->getPost('name');
                $controller = $this->Data->getPost('controller');

                if ($ID) {

                    $one = $this->Route->get('ID', $ID);
                    if ($parentID != $one['parentID']) {
                        $this->Route->move($one['parentID'], $parentID);
                    }
                    $updated = 0;
                    $updated += intval($this->Route->update($ID, 'state', $state));
                    $updated += intval($this->Route->update($ID, 'name', $name));
                    $updated += intval($this->Route->update($ID, 'abstract', intval($abstract)));
                    $updated += intval($this->Route->update($ID, 'skipBreadcrumb', intval($skipBreadcrumb)));

                    $updated += intval($this->Route->update($ID, 'controller', $controller));


                    $langUpdated = 0;

                    if (!empty($post['langUrls'])) {
                        foreach ($post['langUrls'] as $lang => $value) {
                            $actName = NULL;
                            if (strlen($post['langNames'][$lang]) > 0) {
                                $actName = $post['langNames'][$lang];
                            }
                            $langUpdated += intval($this->RouteLang->set($ID, $lang, $value, $actName));
                        }
                    } elseif (!empty($post['langNames'])) {
                        foreach ($post['langNames'] as $lang => $value) {
                            $langUpdated += intval($this->RouteLang->setName($ID, $lang, $value));
                        }
                    }

                    if ($updated > 0) {
                        $data['response'] = true;
                        $data['langUpdated'] = $langUpdated;
                    }
                } else {
                    $data = $this->sendFailResponse('02');
                }
                break;
            case "sort":
                // @TODO sortowanie
                break;
        }

        if( $data['response'] ) {
            $this->RouteAssistant->generateRoutesFile();
        }

        return $data;
    }


    /**
     * @return mixed
     */
    public function patch_moveUp()
    {
        $ID = $this->Data->getPost('ID');
        if ($ID) {
            $data['response'] = $this->Route->moveUp($ID);
        } else {
            $data = $this->sendFailResponse('02');
        }
        return $data;
    }

    /**
     * @return mixed
     */
    public function patch_moveDown()
    {
        $ID = $this->Data->getPost('ID');
        if ($ID) {
            $data['response'] = $this->Route->moveDown($ID);
        } else {
            $data = $this->sendFailResponse('02');
        }
        return $data;
    }

    /**
     * @param null $state
     * @return array|bool
     */
    public function breadcrumbs($state = NULL)
    {
        $one = $this->Route->get('state', $state);

        $direct = 'DESC';
        $list = $this->Route->getParents($one['lft'], $one['rgt'], $direct);
        if (empty($list)) {
            $list = array();
        } else {
            foreach ($list as $key => $value) {
                $langRes = array();
                $langs = $value['langs'];
                if (strlen($langs) > 0) {
                    $exp = explode("||", $langs);
                    if (!empty($exp)) {
                        foreach ($exp as $ln) {
                            $expLn = explode('::', $ln);
                            $langRes[$expLn[0]] = array('url' => $expLn[1], 'name' => $expLn[2]);
                        }
                    }
                }
                $list[$key]['langs'] = $langRes;
                unset($langRes);
            }
        }
        return $list;
    }

    /**
     * @param $state
     * @return array|bool
     */
    public function level($state)
    {

        if (strlen($state) > 0) {
            $list = $this->Route->getSubChildren($state);
        } else {
            $list = $this->Route->getRootChildren();
        }

        if (empty($list)) {
            $list = array();
        }
        return $list;

    }

    /**
     * @param null $lang
     * @return array|bool
     */
    public function show($lang = NULL)
    {
        return $this->RouteAssistant->show($lang);
    }

    /**
     * @return bool
     */
    public function buildRouting()
    {
        $tree = $this->Route->getFullTree('/');

        $routeArr = array();
        foreach ($tree as $key => $value) {
            $routeArr[] = $value['ID'];
        }

        $this->View->getByRouteList($routeArr, true);

        return $tree;
    }

    /**
     * @param $ID
     * @return bool|mixed
     */
    public function one($ID)
    {
        $one = $this->Route->get('ID', $ID);
        if (!$one) {
            return false;
        }
        if (intval($one['parentID'])) {
            $parent = $this->Route->get('ID', $one['parentID']);
            $one['parentUrl'] = $parent['state'];
        }
        return $one;
    }

    /**
     * @param $type
     * @param $itemUrl
     * @return array
     */
    private function getCustomMetaTags($type, $itemUrl)
    {
        $metaTags = array();
        switch ($type) {
            case 'group':
                $groupLangEntity = $this->PrintShopGroupLanguage->getByUrl($itemUrl);
                $allMetaTags = $this->MetaTag->getByGroup($groupLangEntity['groupID']);
                foreach ($allMetaTags as $oneMetaTag) {
                    $metaTags[$oneMetaTag['lang']] = array(
                        'title' => $oneMetaTag['title'],
                        'description' => $oneMetaTag['description'],
                        'keywords' => $oneMetaTag['keywords']
                    );
                }
                break;
            case 'type':
                $typeLangEntity = $this->PrintShopTypeLanguage->getByUrl($itemUrl);
                $allMetaTags = $this->MetaTag->getByType($typeLangEntity['typeID']);
                foreach ($allMetaTags as $oneMetaTag) {
                    $metaTags[$oneMetaTag['lang']] = array(
                        'title' => $oneMetaTag['title'],
                        'description' => $oneMetaTag['description'],
                        'keywords' => $oneMetaTag['keywords']
                    );
                }
                break;
            case 'category':
                $categoryID = $this->CategoryLang->getByUrl($itemUrl, lang);
                $allMetaTags = $this->MetaTag->getByCategory($categoryID);
                foreach ($allMetaTags as $oneMetaTag) {
                    $metaTags[$oneMetaTag['lang']] = array(
                        'title' => $oneMetaTag['title'],
                        'description' => $oneMetaTag['description'],
                        'keywords' => $oneMetaTag['keywords']
                    );
                }
                break;
            default:
                break;
        }

        return $metaTags;
    }

    public function patch_getRouteByUrl()
    {

        $url = $this->Data->getPost('url');

        $urlElements = array_reverse(explode('/',$url));

        $route = $this->Route->getByUrl($urlElements[0], $urlElements[1], domainID);


        $this->Setting->setModule('seoSettings');
        $this->Setting->setLang(NULL);
        $this->Setting->setDomainID($this->getDomainID());

        $gaIdCode = $this->Setting->getValue('gaIdCode');

        $this->Setting->setModule('general');
        $websiteStyle = $this->Setting->getValue('websiteStyle');

        if( $websiteStyle && $websiteStyle == 2 ) {
            $customStyleUrl = STATIC_URL . companyID . '/' . 'styles/' . domainID . '/' . 'main.css';
        } else {
            $customStyleUrl = STATIC_URL . companyID . '/' . 'styles/' . 'main.css';
        }

        if( !$gaIdCode ) {
            $gaIdCode = '';
        }

        $scriptPath = MAIN_UPLOAD . companyID . '/' . 'routing/' . $this->getDomainID() . '/states.js';
        $routing = file_get_contents($scriptPath);

        if( !$route ) {
            $route = $this->Route->getByState('home', domainID);

            $mainTag = $this->MainMetaTag->getOne($route['ID'], domainID);
            $mainTagLanguage = $this->MainMetaTagLanguage->getOne($mainTag['ID'], lang);

            return array(
                'lang' => lang,
                'domainID' => domainID,
                'lastElement' => $urlElements[0],
                'route' => $route,
                'mainTag' => $mainTag,
                'mainTagLanguage' => $mainTagLanguage,
                'gaIdCode' => $gaIdCode,
                'companyID' => companyID,
                'STATIC_URL' => STATIC_URL,
                'customStyleUrl' => $customStyleUrl,
                'routing' => $routing
            );
        }

        $mainTag = array();

        switch ($route['state']) {
            case 'calculate':
                $metaTag = $this->getCustomMetaTags('type', $urlElements[0]);
                if( array_key_exists(lang, $metaTag) ) {
                    $mainTagLanguage = $metaTag[lang];
                }
                break;
            case 'group':
                $metaTag = $this->getCustomMetaTags('group', $urlElements[0]);
                $mainTagLanguage = $metaTag[lang];
                break;
            case 'category':
                $metaTag = $this->getCustomMetaTags('category', $urlElements[0]);
                if(array_key_exists(lang, $metaTag)) {
                    $mainTagLanguage = $metaTag[lang];
                }
                break;
            default:
                $this->MainMetaTag->setDomainID(domainID);
                $mainTag = $this->MainMetaTag->getOne($route['ID'], domainID);
                $mainTagLanguage = $this->MainMetaTagLanguage->getOne($mainTag['ID'], lang);
                break;
        }

        if( !isset($mainTagLanguage) || !$mainTagLanguage ) {

            $route = $this->Route->getByUrl(lang, '_', domainID);
            $mainTag = $this->MainMetaTag->getOne($route['ID'], domainID);
            $mainTagLanguage = $this->MainMetaTagLanguage->getOne($mainTag['ID'], lang);

        }

        return array(
            'lang' => lang,
            'domainID' => domainID,
            'lastElement' => $urlElements[0],
            'route' => $route,
            'mainTag' => $mainTag,
            'mainTagLanguage' => $mainTagLanguage,
            'gaIdCode' => $gaIdCode,
            'companyID' => companyID,
            'STATIC_URL' => STATIC_URL,
            'customStyleUrl' => $customStyleUrl,
            'routing' => $routing
        );

    }

    /**
     * @param $state
     * @param array $params
     * @return array
     */
    public function translateState($state, $params = array())
    {
        if( array_key_exists('categoryurl', $params) ) {
            $categoryLangEntity = $this->CategoryLang->get('slug', $params['categoryurl']);
            $categoryLanguages = $this->CategoryLang->getForCategory($categoryLangEntity['categoryID']);
            if( array_key_exists(lang, $categoryLanguages) ) {
                $categoryTranslateUrl = $categoryLanguages[lang]['url'];
            }
        }

        if( array_key_exists('groupurl', $params) ) {
            $groupLangEntity = $this->PrintShopGroupLanguage->get('slug', $params['groupurl']);
            $groupLanguages = $this->PrintShopGroupLanguage->get('groupID', $groupLangEntity['groupID'], true);
            $groupLanguages = $this->prepareLanguage($groupLanguages);
            if( array_key_exists(lang, $groupLanguages) ) {
                $groupTranslateUrl = $groupLanguages[lang]['slug'];
            }
        }

        if( array_key_exists('typeurl', $params) ) {
            $typeLangEntity = $this->PrintShopTypeLanguage->get('slug', $params['typeurl']);
            $typeLanguages = $this->PrintShopTypeLanguage->get('typeID', $typeLangEntity['typeID'], true);
            $typeLanguages = $this->prepareLanguage($typeLanguages);
            if( array_key_exists(lang, $typeLanguages) ) {
                $typeTranslateUrl = $typeLanguages[lang]['slug'];
            }
        }

        $urlAddress = '';

        $statePath = $this->getParentStates($state);

        krsort($statePath);

        foreach ($statePath as $row) {
            if( array_key_exists('langs', $row) ) {
                $urlAddress .= $row['langs'][lang]['name'];
            }
        }

        $routeEntity = $this->Route->getOneWithLang($state);

        if( array_key_exists('langs', $routeEntity) ) {
            $urlAddress .= $routeEntity['langs'][lang]['name'];
        }

        $urlAddress = str_replace(':categoryurl', $categoryTranslateUrl, $urlAddress);
        $urlAddress = str_replace(':groupurl', $groupTranslateUrl, $urlAddress);
        $urlAddress = str_replace(':typeurl', $typeTranslateUrl, $urlAddress);

        if( preg_match('/\/:([a-zA-Z]+)/', $urlAddress, $match) ) {
            foreach( $match as $key => $phrase ) {
                if( $key > 0 ) {
                    $urlAddress = str_replace(':' . $phrase, $params[$phrase], $urlAddress);
                }
            }
        }

        return compact('urlAddress');
    }

    /**
     * @param $state
     * @return array|bool
     */
    private function getParentStates($state)
    {
        $one = $this->Route->get('state', $state);

        $direct = 'DESC';
        $list = $this->Route->getParents($one['lft'], $one['rgt'], $direct);
        if (empty($list)) {
            $list = array();
        } else {
            foreach ($list as $key => $value) {
                if( array_key_exists('langs', $value) && array_key_exists(lang, $value['langs']) ) {
                    $list[$key]['url'] = $value['langs'][lang];
                }
            }
        }
        return $list;
    }

    /**
     * @param $languageEntities
     * @return array
     */
    private function prepareLanguage($languageEntities)
    {
        if( !$languageEntities ) {
            return array();
        }

        $result = array();

        foreach ($languageEntities as $entity) {
            $result[$entity['lang']] = $entity;
        }

        return $result;
    }

}
