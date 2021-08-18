<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 30-10-2018
 * Time: 12:43
 */

namespace DreamSoft\Controllers\Components;

use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Core\Component;
use DreamSoft\Models\MainMetaTag\MainMetaTag;
use DreamSoft\Models\MainMetaTag\MainMetaTagLanguage;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\Domain\Domain;
use DreamSoft\Models\Route\Route;
use DreamSoft\Models\Route\RouteLang;
use DreamSoft\Models\Template\Template;
use DreamSoft\Models\Template\TemplateRoot;
use DreamSoft\Models\Template\TemplateSetting;
use DreamSoft\Models\Template\View;

class RouteAssistant extends Component
{
    /**
     * @var Route
     */
    private $Route;
    /**
     * @var RouteLang
     */
    private $RouteLang;
    /**
     * @var Domain
     */
    private $Domain;

    private $settingLanguages = array();

    /**
     * @var int
     */
    private $domainID;

    /**
     * @var LangSetting
     */
    private $LangSetting;

    /**
     * @var Setting
     */
    private $Setting;
    /**
     * @var View
     */
    private $View;
    /**
     * @var MainMetaTag
     */
    protected $MainMetaTag;
    /**
     * @var MainMetaTagLanguage
     */
    protected $MainMetaTagLanguage;
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

    public $useModels = array();

    public function __construct()
    {
        parent::__construct();
        $this->Domain = Domain::getInstance();
        $this->Route = Route::getInstance();
        $this->LangSetting = LangSetting::getInstance();
        $this->Setting = Setting::getInstance();
        $this->Setting->setModule('general');
        $this->RouteLang = RouteLang::getInstance();
        $this->View = View::getInstance();
        $this->MainMetaTag = MainMetaTag::getInstance();
        $this->MainMetaTagLanguage = MainMetaTagLanguage::getInstance();
        $this->TemplateRoot = TemplateRoot::getInstance();
        $this->Template = Template::getInstance();
        $this->TemplateSetting = TemplateSetting::getInstance();
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

    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
        $this->Route->setDomainID($domainID);
        $this->RouteLang->setDomainID($domainID);
        $this->LangSetting->setDomainID($domainID);
        $this->Setting->setDomainID($domainID);
        $this->TemplateSetting->setDomainID($domainID);
    }

    /**
     * @return int
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param $state
     * @param $lang
     * @return string
     */
    public function getStateUrl($state, $lang)
    {
        $myRouteEntity = $this->Route->getOneWithLang($state);

        $url = '';
        if( $myRouteEntity ) {

            $actualStateParents = $this->Route->getParents(
                $myRouteEntity['lft'],
                $myRouteEntity['rgt'],
                'ASC'
            );

            $domain = $this->Domain->get('ID', $this->Route->getDomainID());
            if( $domain ) {
                if( $domain['ssl'] ) {
                    $url .= 'https://';
                } else {
                    $url .= 'http://';
                }
                $url .= $domain['host'];
            }

            if( $domain['host'] == 'localhost') {
                $url .= ':9001';
            }

            if( $actualStateParents ) {
                foreach ($actualStateParents as $actualStateParent) {

                    if( !array_key_exists('langs', $actualStateParent) && $actualStateParent['abstract'] == 1 ) {
                        continue;
                    }

                    if( !array_key_exists('langs', $actualStateParent) && $actualStateParent['abstract'] == 0 ) {
                        return '';
                    }

                    if( !array_key_exists($lang, $actualStateParent['langs']) ) {
                        return '';
                    }

                    $url .= $actualStateParent['langs'][$lang]['name'];
                }
            }
            if( !array_key_exists('langs', $myRouteEntity) ) {
                return '';
            }
            if( !array_key_exists($lang, $myRouteEntity['langs']) ) {
                return '';
            }
            $url .= $myRouteEntity['langs'][$lang]['name'];
        }

        return $url;
    }

    /**
     * @return array
     */
    public function generateRoutesFile()
    {

        $allLanguages = $this->LangSetting->getAll();

        $aggregateLanguages = array();
        foreach($allLanguages as $language) {
            $aggregateLanguages[] = $language['code'];
        }

        $this->setSettingLanguages($aggregateLanguages);

        $savedFiles = 0;
        $routesToFile = array();

        foreach($allLanguages as $language) {
            $result = $this->show($language['code']);
            $routesToFile[$language['code']] = $this->prepareJson($result, $language['code']);
        }

        if( $this->saveRoutingFile($routesToFile)) {
            $savedFiles++;
        }

        if( $savedFiles > 0 ) {
            return array(
                'generateRoutes' => true
            );
        }

        return array('generateRoutes' => false);
    }

    /**
     * @param $routes
     * @param $langCode
     * @return array
     */
    private function prepareJson($routes, $langCode)
    {
        $this->Setting->setModule('general');
        $this->Setting->setLang(NULL);
        $this->Setting->setDomainID($this->getDomainID());

        $renderDate = date('Y-m-d');

        $states = array();

        foreach ($routes as $row) {

            $oneState = array();

            $oneState['abstract'] = false;
            if( intval($row['route']['abstract']) == 1 ) {
                $oneState['abstract'] = true;
            }

            if( array_key_exists('langs', $row['route']) &&  $row['route']['langs'] &&
                array_key_exists($langCode, $row['route']['langs']) &&
                strlen($row['route']['langs'][$langCode]['url']) > 0 ) {
                $oneState['name'] = $row['route']['name'];
                $oneState['url'] = $row['route']['langs'][$langCode]['url'];
                $oneState['parent'] = $row['route']['parent'];
                $oneState['views'] = array();
                $oneState['ncyBreadcrumb']['label'] = $row['route']['langs'][$langCode]['name'];
            } else {
                $oneState['name'] = $row['route']['name'];
                if( array_key_exists('parent', $row['route']) ) {
                    $oneState['parent'] = $row['route']['parent'];
                }
                $oneState['ncyBreadcrumb']['skip'] = true;
            }

            if( $row['route']['controller'] ) {
                $oneState['controller'] = $row['route']['controller'];
            }

            if( array_key_exists('metaTags', $row) && $row['metaTags'] ) {
                $oneState['metaTags'] = $row['metaTags'];
            }

            if( array_key_exists('state', $row['route']) && $row['route']['state'] ) {
                $oneState['state'] = $row['route']['state'];
            }

            if( $oneState['abstract'] && $row['route']['state'] == 'main' ) {
                $oneState['templateUrl'] = $row['views'][0]['template']['url'] . '?ver=' . $renderDate;
            } else {

                if( $row['views'] ) {
                    foreach ($row['views'] as $view) {

                        if (array_key_exists('template', $view) && $view['template']) {
                            $oneState['views'][$view['name']]['templateUrl'] =  $view['template']['url'] . '?ver=' . $renderDate;
                            if( array_key_exists('controller', $view) &&  $view['controller'] ) {
                                $oneState['views'][$view['name']]['controller'] = $view['controller'];
                            }
                            $oneState['views'][$view['name']]['name'] = $view['name'];

                        }

                    }
                }

            }

            $states[$row['route']['state']] = $oneState;
        }

        return $states;
    }

    /**
     * @param $routesToFile
     */
    private function saveRoutingFile($routesToFile)
    {
        $json = json_encode($routesToFile);

        $contentOfFile = $json;

        $body = 'var globalRoutes = \'';
        $body .= $contentOfFile . '\';' . PHP_EOL;

        $dir = MAIN_UPLOAD . companyID  . '/routing/' . $this->getDomainID();
        if( !is_dir($dir) ) {
            mkdir($dir, 0777, true);
        }

        $fp = fopen($dir . '/' . 'states.js', 'w');
        fwrite($fp, $body);
        fclose($fp);
    }

    public function show($lang)
    {
        if( !$lang ) {
            $defaultLang = 'en';
            $langList = $this->LangSetting->getAll();
            if ($langList) {
                foreach ($langList as $l) {
                    if ($this->Setting->getValue('defaultLang') == $l['ID']) {
                        $defaultLang = $l['code'];
                    }
                }
            }
            $lang = $defaultLang;
        }

        $tree = $this->Route->getRootTree();

        if (empty($tree)) {
            return false;
        }

        $aggregateBranches = array();
        $aggregateRoutes = array();
        foreach ($tree as $key => $branch) {
            $aggregateBranches[$branch['ID']] = $branch['name'];
            $aggregateRoutes[] = $branch['ID'];
        }

        $languages = $this->RouteLang->customGetByList(array_keys($aggregateBranches));

        foreach ($tree as $key => $branch) {
            if( isset($aggregateBranches[$branch['parentID']]) ) {
                $tree[$key]['parent'] = $aggregateBranches[$branch['parentID']];
            }
        }

        $views = $this->View->getAllView();

        $views = $this->prepareViews($views);
        $views = $this->foldViews($views);

        if (empty($tree)) {
            return array();
        }

        $result = array();

        $mainMetaTags = $this->MainMetaTag->getByRoutes($aggregateRoutes);

        if($mainMetaTags) {
            $aggregateMetaTags = array();
            foreach ($mainMetaTags as $mainMetaTag) {
                $aggregateMetaTags[] = $mainMetaTag['ID'];
            }
            $mainMetaTagLanguages = $this->MainMetaTagLanguage->getByList($aggregateMetaTags);
            if( $mainMetaTagLanguages ) {
                foreach ($mainMetaTags as $key => $mainMetaTag) {
                    $mainMetaTags[$key]['languages'] = $mainMetaTagLanguages[$mainMetaTag['ID']];
                }
            }
        }

        foreach ($tree as $branch) {

            if (isset($languages[$branch['ID']])) {
                $branch['langs'] = $languages[$branch['ID']];
                foreach ($branch['langs'] as $actLang => $ln) {
                    if ($actLang == $lang) {
                        $branch['langs'][$actLang]['default'] = true;
                    }
                }
            }

            $tmpViews = NULL;
            $tmpMetaTags = NULL;

            if(isset($views[$branch['ID']])) {
                $tmpViews = $views[$branch['ID']];
            }

            if( isset($mainMetaTags[$branch['ID']]) ) {
                $tmpMetaTags = $mainMetaTags[$branch['ID']];
            }

            $result[] = array(
                'route' => $branch,
                'views' => $tmpViews,
                'metaTags' => $tmpMetaTags
            );
        }

        return $result;
    }

    /**
     * @param $viewList
     * @return array
     */
    public function prepareViews($viewList)
    {

        $viewsArr = array();
        foreach ($viewList as $rl) {
            $viewsArr[] = $rl['ID'];
        }

        $allViews = $viewList;

        $templateArr = array();
        $localTemplateArr = array();
        foreach ($allViews as $key => $view) {

            $allViews[$key]['own'] = false;
            if (intval($view['templateRoot']) == 2) {
                $allViews[$key]['own'] = true;
            }

            if (intval($view['templateID']) > 0) {
                if ( array_key_exists('own', $allViews[$key]) && $allViews[$key]['own']) {
                    $localTemplateArr[] = $view['templateID'];
                } else {
                    $templateArr[] = $view['templateID'];
                }
            }
        }

        $templates = $this->TemplateRoot->getByList($templateArr);
        $localTemplates = $this->Template->getByList($localTemplateArr);

        $templateSettings = $this->TemplateSetting->getByList($templateArr, 1);
        $localTemplateSettings = $this->TemplateSetting->getByList($localTemplateArr, 2);

        if( is_array($templates) ) {
            foreach ($templates as $key => $template) {
                $templates[$key]['source'] = NULL;
                if( isset($templateSettings[$template['ID']]) ) {
                    $templates[$key]['source'] = $templateSettings[$template['ID']];
                    $template['source'] = $templateSettings[$template['ID']];
                }
                $templates[$key]['root'] = 1;
                $templates[$key]['own'] = false;
                $templates[$key]['url'] = $this->getFilePath($template);
            }
        }

        if( is_array($localTemplates) ) {
            foreach ($localTemplates as $key => $template) {
                $localTemplates[$key]['source'] = $template['source'] = $localTemplateSettings[$template['ID']];
                $localTemplates[$key]['root'] = 2;
                $localTemplates[$key]['own'] = true;
                $localTemplates[$key]['url'] = $this->getFilePath($localTemplates[$key]);
            }
        }

        if (is_array($templates) && is_array($localTemplates) && !empty($localTemplates)) {
            $templates = array_merge($templates, $localTemplates);
        }

        $templateByKeys = array();
        foreach ($templates as $t) {
            $templateByKeys[$t['ID'] . '_' . $t['root']] = $t;
        }

        $actViews = array();

        if (!empty($allViews)) {

            foreach ($allViews as $key => $value) {
                if( array_key_exists($value['templateID'] . '_' . $value['templateRoot'], $templateByKeys) ) {
                    $value['template'] = $templateByKeys[$value['templateID'] . '_' . $value['templateRoot']];
                }
                $actViews[] = $value;
                unset($value);
            }

        }

        return $actViews;
    }

    /**
     * @param array $template
     * @return string
     */
    private function getFilePath(array $template)
    {
        $templateFolder = $template['ID'];

        if ( array_key_exists('own', $template) && $template['own'] == true) {
            $templateFolder = LOCAL_TEMPLATE_PREFIX . $template['ID'];
        }

        if (array_key_exists('source', $template) && $template['source'] == 1) {
            $file = STATIC_URL . 'templates' . '/' . companyID . '/' . $templateFolder . '/' . $template['fileName'] . '.html';
        } elseif (array_key_exists('source', $template) && $template['source'] == 2) {
            $file = STATIC_URL . 'templates' . '/' . companyID . '/' . $templateFolder . '/' . $this->getDomainID() . '/' . $template['fileName'] . '.html';
        } else {
            $file = STATIC_URL . 'templates' . '/' . TEMPLATE_DEFAULT_FOLDER . '/' . $template['ID'] . '/' . $template['fileName'] . '.html';
        }

        return $file;
    }

    /**
     * @param $views
     * @return array
     */
    private function foldViews($views)
    {
        $allViews = array();

        while (!empty($views)) {
            foreach ($views as $key => $row) {
                if (!$row['parentViewID']) {
                    $allViews[$row['ID']] = $row;
                    unset($views[$key]);
                } else {
                    if (isset($allViews[$row['parentViewID']])) {
                        $allViews[$row['parentViewID']]['childs'] = $row;
                        unset($views[$key]);
                    } else {
                        unset($views[$key]);
                    }
                }
            }
        }

        $result = array();
        foreach ($allViews as $row) {

            $result[$row['routeID']][] = $row;
        }
        return $result;
    }

}