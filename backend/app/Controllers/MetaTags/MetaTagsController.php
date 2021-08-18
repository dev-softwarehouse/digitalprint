<?php
/**
 * Programmer Rafał Leśniak - 17.1.2018
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 17-01-2018
 * Time: 14:28
 */

namespace DreamSoft\Controllers\MetaTags;

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeLanguage;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopGroupLanguage;
use DreamSoft\Models\MainMetaTag\MainMetaTag;
use DreamSoft\Models\MainMetaTag\MainMetaTagLanguage;
use DreamSoft\Models\Route\Route;
use DreamSoft\Models\Seo\MetaTag;
use DreamSoft\Models\Product\CategoryLang;

class MetaTagsController extends Controller
{
    /**
     * @var MetaTag
     */
    private $MetaTag;
    /**
     * @var CategoryLang
     */
    private $CategoryLang;
    /**
     * @var PrintShopTypeLanguage
     */
    protected $PrintShopTypeLanguage;
    /**
     * @var PrintShopGroupLanguage
     */
    protected $PrintShopGroupLanguage;
    /**
     * @var PrintShopType
     */
    private $PrintShopType;
    /**
     * @var Route
     */
    private $Route;
    /**
     * @var MainMetaTag
     */
    private $MainMetaTag;
    /**
     * @var MainMetaTagLanguage
     */
    private $MainMetaTagLanguage;

    public $useModels = array();

    /**
     * MetaTagsController constructor.
     * @param array $parameters
     */
    public function __construct(array $parameters = array())
    {
        parent::__construct($parameters);
        $this->MetaTag = MetaTag::getInstance();
        $this->CategoryLang = CategoryLang::getInstance();
        $this->PrintShopGroupLanguage = PrintShopGroupLanguage::getInstance();
        $this->PrintShopTypeLanguage = PrintShopTypeLanguage::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->Route = Route::getInstance();
        $this->MainMetaTag = MainMetaTag::getInstance();
        $this->MainMetaTagLanguage = MainMetaTagLanguage::getInstance();
    }

    /**
     * @param $ID
     */
    public function setDomainID($ID)
    {
        parent::setDomainID($ID);
        $this->Route->setDomainID($ID);
        $this->MainMetaTag->setDomainID($ID);
    }

    /**
     * @param array $params
     * @return array
     */
    public function index($params = array()) {
        $type = $params['type'];
        $itemUrl = $params['itemUrl'];
        $categoryUrl = NULL;
        if( array_key_exists('categoryUrl', $params) ) {
            $categoryUrl = $params['categoryUrl'];
        }

        $metaTags = array();
        switch ($type) {
            case 'group':
                $groupLangEntity = $this->PrintShopGroupLanguage->getByUrl($itemUrl);
                $allMetaTags = $this->MetaTag->getByGroup($groupLangEntity['groupID']);
                $groupLangEntities = $this->PrintShopGroupLanguage->get('groupID', $groupLangEntity['groupID'], true);
                $categoryID = $this->CategoryLang->getByUrl($categoryUrl, lang);
                $categoryLangEntities = $this->CategoryLang->get('categoryID', $categoryID, true);
                if( $categoryLangEntities ) {
                    foreach ($categoryLangEntities as $categoryLangEntity) {
                        $metaTags['urlParams']['category'][$categoryLangEntity['lang']] = $categoryLangEntity['slug'];
                    }
                }

                $metaTags['metaTags'] = array();
                foreach ($allMetaTags as $oneMetaTag) {
                    $metaTags['metaTags'][$oneMetaTag['lang']] = array(
                        'title' => $oneMetaTag['title'],
                        'description' => $oneMetaTag['description'],
                        'keywords' => $oneMetaTag['keywords']
                    );
                }

                if( empty($metaTags['metaTags']) ) {
                    $routeEntity = $this->Route->getByState($type, $this->getDomainID());
                    $mainMetaTagEntity = $this->MainMetaTag->getOne($routeEntity['ID'], $this->getDomainID());
                    $mainMetaLanguageEntity = $this->MainMetaTagLanguage->getOne($mainMetaTagEntity['ID'], lang);
                    $metaTags['metaTags'][lang] = array(
                        'title' => $mainMetaLanguageEntity['title'],
                        'description' => $mainMetaLanguageEntity['description'],
                        'keywords' => $mainMetaLanguageEntity['keywords']
                    );
                }

                if( $groupLangEntities ) {
                    foreach ($groupLangEntities as $groupLangEntity) {
                        $metaTags['urlParams']['group'][$groupLangEntity['lang']] = $groupLangEntity['slug'];
                    }
                }
                break;
            case 'type':
                $typeLangEntity = $this->PrintShopTypeLanguage->getByUrl($itemUrl);
                $typeEntity = $this->PrintShopType->get('ID', $typeLangEntity['typeID']);
                $groupLangEntities = $this->PrintShopGroupLanguage->get('groupID', $typeEntity['groupID'], true);
                $typeLangEntities = $this->PrintShopTypeLanguage->get('typeID', $typeLangEntity['typeID'], true);
                $allMetaTags = $this->MetaTag->getByType($typeLangEntity['typeID']);
                $categoryID = $this->CategoryLang->getByUrl($categoryUrl, lang);
                $categoryLangEntities = $this->CategoryLang->get('categoryID', $categoryID, true);

                $metaTags['metaTags'] = array();
                foreach ($allMetaTags as $oneMetaTag) {
                    $metaTags['metaTags'][$oneMetaTag['lang']] = array(
                        'title' => $oneMetaTag['title'],
                        'description' => $oneMetaTag['description'],
                        'keywords' => $oneMetaTag['keywords']
                    );
                }

                if( empty($metaTags['metaTags']) ) {
                    $routeEntity = $this->Route->getByState('calculate', $this->getDomainID());
                    $mainMetaTagEntity = $this->MainMetaTag->getOne($routeEntity['ID'], $this->getDomainID());
                    $mainMetaLanguageEntity = $this->MainMetaTagLanguage->getOne($mainMetaTagEntity['ID'], lang);
                    $metaTags['metaTags'][lang] = array(
                        'title' => $mainMetaLanguageEntity['title'],
                        'description' => $mainMetaLanguageEntity['description'],
                        'keywords' => $mainMetaLanguageEntity['keywords']
                    );
                }

                if( $groupLangEntities ) {
                    foreach ($groupLangEntities as $groupLangEntity) {
                        $metaTags['urlParams']['group'][$groupLangEntity['lang']] = $groupLangEntity['slug'];
                    }
                }
                if( $typeLangEntities ) {
                    foreach ($typeLangEntities as $typeLangEntity) {
                        $metaTags['urlParams']['type'][$typeLangEntity['lang']] = $typeLangEntity['slug'];
                    }
                }
                if( $categoryLangEntities ) {
                    foreach ($categoryLangEntities as $categoryLangEntity) {
                        $metaTags['urlParams']['category'][$categoryLangEntity['lang']] = $categoryLangEntity['slug'];
                    }
                }

                break;
            case 'category':
                $categoryID = $this->CategoryLang->getByUrl($itemUrl, lang);
                $allMetaTags = $this->MetaTag->getByCategory($categoryID);
                $categoryLangEntities = $this->CategoryLang->get('categoryID', $categoryID, true);
                $metaTags['metaTags'] = array();
                foreach ($allMetaTags as $oneMetaTag) {
                    $metaTags['metaTags'][$oneMetaTag['lang']] = array(
                        'title' => $oneMetaTag['title'],
                        'description' => $oneMetaTag['description'],
                        'keywords' => $oneMetaTag['keywords']
                    );
                }

                if( empty($metaTags['metaTags']) ) {
                    $routeEntity = $this->Route->getByState('category', $this->getDomainID());
                    $mainMetaTagEntity = $this->MainMetaTag->getOne($routeEntity['ID'], $this->getDomainID());
                    $mainMetaLanguageEntity = $this->MainMetaTagLanguage->getOne($mainMetaTagEntity['ID'], lang);
                    $metaTags['metaTags'][lang] = array(
                        'title' => $mainMetaLanguageEntity['title'],
                        'description' => $mainMetaLanguageEntity['description'],
                        'keywords' => $mainMetaLanguageEntity['keywords']
                    );
                }

                if( $categoryLangEntities ) {
                    foreach ($categoryLangEntities as $categoryLangEntity) {
                        $metaTags['urlParams']['category'][$categoryLangEntity['lang']] = $categoryLangEntity['slug'];
                    }
                }
                break;
            default:
                break;
        }

        if( !empty($metaTags) ) {
            $metaTags['response'] = true;
        } else {
            $metaTags['response'] = false;
            $metaTags['metaTags'] = NULL;
        }

        return $metaTags;
    }
}