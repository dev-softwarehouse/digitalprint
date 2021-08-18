<?php

/**
 * Kontroler konfiguracyjny
 * @class Config
 */

include_once(BASE_DIR . 'libs/SuperAdmin.php');

include_once BASE_DIR . 'libs/PHPExcel.php';
include_once BASE_DIR . 'libs/PHPExcel/IOFactory.php';

use DreamSoft\Libs\ConnectionSwitchFactory;
use DreamSoft\Libs\ConnectionUserFactory;
use DreamSoft\Models\Address\OldAddress;
use DreamSoft\Models\Group\Group;
use DreamSoft\Models\Module\Module;
use DreamSoft\Models\Module\ModuleKey;
use DreamSoft\Models\Module\ModuleValue;
use DreamSoft\Models\Payment\Payment;
use DreamSoft\Models\Currency\Currency;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\Template\Template;
use DreamSoft\Models\Template\TemplateSetting;
use DreamSoft\Models\Template\View;
use DreamSoft\Models\User\User;
use DreamSoft\Models\Domain\Domain;
use DreamSoft\Models\Domain\DomainRoot;
use DreamSoft\Models\Route\RouteLang;
use DreamSoft\Models\Route\Route;
use DreamSoft\Models\User\UserGroup;
use DreamSoft\Models\User\UserOption;
use DreamSoft\Models\Address\Address;
use DreamSoft\Models\Address\AddressUser;

class ConfigController extends Controller
{

    public $useModels = array();

    private $ssh;
    /**
     * @var User
     */
    protected $User;
    /**
     * @var DomainRoot
     */
    protected $DomainRoot;
    /**
     * @var Domain
     */
    protected $Domain;
    /**
     * @var $Route Route
     */
    protected $Route;
    /**
     * @var Route
     */
    protected $RouteRemote;
    /**
     * @var RouteLang
     */
    protected $RouteLang;
    /**
     * @var RouteLang
     */
    protected $RouteLangRemote;
    /**
     * @var View
     */
    protected $View;
    /**
     * @var View
     */
    protected $ViewRemote;
    /**
     * @var Setting
     */
    protected $Setting;
    /**
     * @var UserGroup
     */
    protected $UserGroup;
    /**
     * @var Group
     */
    protected $Group;
    /**
     * @var Template
     */
    protected $Template;
    /**
     * @var Module
     */
    protected $Module;
    /**
     * @var ModuleKey
     */
    protected $ModuleKey;
    /**
     * @var ModuleValue
     */
    protected $ModuleValue;
    /**
     * @var Payment
     */
    protected $Payment;
    /**
     * @var TemplateSetting
     */
    protected $TemplateSetting;
    /**
     * @var TemplateSetting
     */
    protected $TemplateSettingRemote;
    /**
     * @var SuperAdmin
     */
    protected $SuperAdmin;
    /**
     * @var ConnectionSwitchFactory
     */
    protected $ConnectionSwitchFactory;
    /**
     * @var Currency
     */
    private $Currency;
    /**
     * @var Address
     */
    protected $Address;
    /**
     * @var AddressUser
     */
    protected $AddressUser;
    /**
     * @var UserOption
     */
    protected $UserOption;
    /**
     * @var OldAddress
     */
    protected $OldAddress;

    protected $ExcelFile;

    /**
     * ConfigController constructor.
     * @param $params
     * @throws Exception
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->User = User::getInstance();
        $this->DomainRoot = DomainRoot::getInstance();
        $this->Domain = Domain::getInstance();
        $this->Route = Route::getInstance();
        $this->RouteRemote = new Route();
        $this->RouteLang = RouteLang::getInstance();
        $this->RouteLangRemote = new RouteLang();
        $this->View = View::getInstance();
        $this->ViewRemote = new View();
        $this->Setting = Setting::getInstance();
        $this->Setting->setModule('acl');
        $this->UserGroup = UserGroup::getInstance();
        $this->Group = Group::getInstance();
        $this->Template = Template::getInstance();
        $this->Module = Module::getInstance();
        $this->ModuleKey = ModuleKey::getInstance();
        $this->ModuleValue = ModuleValue::getInstance();
        $this->Payment = Payment::getInstance();
        $this->TemplateSetting = TemplateSetting::getInstance();
        $this->TemplateSettingRemote = new TemplateSetting();
        $this->SuperAdmin = new SuperAdmin();
        $this->ConnectionSwitchFactory = new ConnectionSwitchFactory(true);
        $this->Address = Address::getInstance();
        $this->AddressUser = AddressUser::getInstance();
        $this->UserOption = UserOption::getInstance();
        $this->OldAddress = OldAddress::getInstance();
        $this->Currency = Currency::getInstance();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        parent::setDomainID($domainID);
        $this->Route->setDomainID($domainID);
        $this->Setting->setDomainID(NULL);
        $this->Currency->setDomainID($domainID);
        $this->RouteLang->setDomainID($domainID);
    }

    public function test()
    {
        phpinfo();
        die;
    }

    public function updateUserOption()
    {
        $newLang = 'ru';
        $newCurrency = 'RUB';

        $data['response'] = false;

        $saved = 0;
        $edited = 0;

        try {

            $users = $this->User->getAll();

            foreach ($users as $user) {
                $lastID = false;
                $one = $this->UserOption->get('uID', $user['ID']);
                if( $one ) {
                    if( $this->UserOption->update($one['ID'],'lang', $newLang) &&
                    $this->UserOption->update($one['ID'],'currency', $newCurrency) ) {
                        $edited++;
                    }
                } else {
                    $params = array();
                    $params['currency'] = $newCurrency;
                    $params['lang'] = $newLang;
                    $params['uID'] = $user['ID'];
                    $params['userTypeID'] = 1;
                    $lastID = $this->UserOption->create($params);
                    if( $lastID ) {
                         $saved++;
                    }
                }
            }

            if( $saved > 0 || $edited > 0 ) {
                return array(
                    'response' => true,
                    'saved' => $saved,
                    'edited' => $edited
                );
            }

        } catch (Exception $e) {
            $data['response'] = false;
            $data['info'] = $e->getMessage();
        }

        return $data;
    }

    /**
     * @return array
     */
    public function post_test()
    {

    }

    /**
     * Step 1 - new database
     * @return array
     */
    public function patch_createCompany()
    {
        $post = $this->Data->getAllPost();
        $settings = $post['settings'];
        $settings['database'] = $settings['name'] = $settings['user'];


        try {
            $this->SuperAdmin->newSuperUser($settings['user'], $settings['dbpass'], 4, $settings['name']);
        } catch (Exception $e) {
            return array(
                'info' => $e->getMessage(),
                'response' => false
            );
        }

        $this->SuperAdmin->newSuperUserSettings($settings['user'], $settings['database']);

        $companyID = $this->SuperAdmin->getUserID($settings['user']);

        $data['response'] = false;

        $tableList = array(
            'address',
            'address_users',
            'dp_base_prices',
            'dp_categories',
            'dp_categoryLangs',
            'dp_conf_prices',
            'dp_config_activeModules',
            'dp_config_deliveries',
            'dp_config_deliveryNames',
            'dp_config_moduleConfs',
            'dp_config_moduleValues',
            'dp_config_paymentContents',
            'dp_config_paymentNames',
            'dp_config_payments',
            'dp_contents',
            'dp_currency',
            'dp_devices',
            'dp_domains',
            'dp_expenseLimits',
            'dp_homepageBanner',
            'dp_langSettings',
            'dp_langs',
            'dp_mail_contents',
            'dp_mail_titles',
            'dp_mainContentLangs',
            'dp_mainContents',
            'dp_metatags',
            'dp_modelsIconsExtensions',
            'dp_offer_companies',
            'dp_offer_itemFiles',
            'dp_offer_items',
            'dp_offer_options',
            'dp_offers',
            'dp_ongoingLogs',
            'dp_ongoings',
            'dp_operationDevices',
            'dp_operationOptionControllers',
            'dp_operationOptions',
            'dp_operations',
            'dp_operatorSkills',
            'dp_operators',
            'dp_orderAddress',
            'dp_orderAddressProducts',
            'dp_orderConfigs',
            'dp_orderStatusLangs',
            'dp_orderStatuses',
            'dp_orders',
            'dp_printTypeDevices',
            'dp_productCategories',
            'dp_productFiles',
            'dp_products',
            'dp_reports',
            'dp_routeContents',
            'dp_routeLangs',
            'dp_routeViews',
            'dp_routes',
            'dp_routesTmp',
            'dp_sameDevices',
            'dp_sessions',
            'dp_settings',
            'dp_skillDevices',
            'dp_skills',
            'dp_tax',
            'dp_templates',
            'dp_userGroups',
            'dp_userOptions',
            'dp_userRoles',
            'dp_userTypeGroups',
            'dp_userTypeRoles',
            'dp_userTypes',
            'dp_viewOrders',
            'dp_viewToVariables',
            'dp_viewVariableLangs',
            'dp_viewVariables',
            'dp_views',
            'dp_workTimes',
            'dp_couponProducts',
            'dp_coupons',
            'dp_couponOrders',
            'dp_invoices',
            'ps_config_discountPrices',
            'ps_config_attributeLangs',
            'ps_config_attributeRanges',
            'ps_config_attributes',
            'ps_config_connectOptions',
            'ps_config_connectPrices',
            'ps_config_connects',
            'ps_config_detailPrices',
            'ps_config_exclusions',
            'ps_config_friendlyLinks',
            'ps_config_increaseTypes',
            'ps_config_increases',
            'ps_config_optionLangs',
            'ps_config_optionRealizationTime',
            'ps_config_options',
            'ps_config_paperPrice',
            'ps_config_priceLists',
            'ps_config_prices',
            'ps_config_printTypeWorkspaces',
            'ps_config_printTypes',
            'ps_config_settings',
            'ps_config_workspaceTypes',
            'ps_config_workspaces',
            'ps_discountGroupLangs',
            'ps_discountGroups',
            'ps_discounts',
            'ps_label_config',
            'ps_products_arrangements',
            'ps_products_complex',
            'ps_products_complexGroups',
            'ps_products_complexRelatedFormats',
            'ps_products_customFormat',
            'ps_products_desc_boxes',
            'ps_products_descriptions',
            'ps_products_descriptionsFiles',
            'ps_products_descriptionsFormats',
            'ps_products_descriptionsLangs',
            'ps_products_excelAttributes',
            'ps_products_excelOutputs',
            'ps_products_excelSettings',
            'ps_products_formatLangs',
            'ps_products_formatVolumes',
            'ps_products_formats',
            'ps_products_groupLangs',
            'ps_products_groups',
            'ps_products_increaseTypes',
            'ps_products_increases',
            'ps_products_models',
            'ps_products_optionFormats',
            'ps_products_options',
            'ps_products_pages',
            'ps_products_patterns',
            'ps_products_preflights',
            'ps_products_printTypes',
            'ps_products_realizationTimeDetails',
            'ps_products_realizationTimeLangs',
            'ps_products_realizationTimes',
            'ps_products_specialFolder',
            'ps_products_staticPrices',
            'ps_products_tooltips',
            'ps_products_typeLangs',
            'ps_products_typeTaxes',
            'ps_products_types',
            'ps_products_volumes',
            'ps_promotionGroups',
            'ps_promotionLangs',
            'ps_user_attributes',
            'ps_user_calc',
            'ps_user_calc_product_attributes',
            'ps_user_calc_products',
            'ps_user_canvas',
            'ps_user_data',
            'ps_user_deliveryPrices',
            'ps_user_files',
            'ps_user_tmpFiles',
            'ps_products_formatNames',
            'ps_products_pageNames',
            'ps_products_attributeNames',
            'dp_orderMessages',
            'dp_paymentReminder',
            'ps_promotions',
            'ps_config_priceListLanguages',
            'dp_reclamations',
            'dp_reclamationFiles',
            'dp_reclamationStatuses',
            'dp_reclamationStatusLangs',
            'dp_reclamationMessages',
            'ps_products_attributeSettings',
            'dp_static_contentLangs',
            'dp_static_contents',
            'dp_userDiscountGroups',
            'dp_template_settings',
            'dp_upsShipments',
            'dp_authorizationLogs',
            'dp_fileReminders',
            'dp_mainMetaTags',
            'ps_user_calc_product_specialAttributes',
            'dp_reclamationFaults',
            'dp_reclamationFaultDescriptions',
            'dp_mainMetaTagLanguages',
            'dp_customProducts',
            'dp_customProductFiles',
            'dp_processes',
            'dp_operationProcesses',
            'users',
            'uploadedFiles',
            'holidays',
        );

        $copyList = array(
            'dp_groups',
            'dp_groupRoles',
            'ps_config_attributeTypes',
            'ps_config_priceTypes',
            'descriptionTypes'
        );

        $patternDatabase = '25piekny_druk';

        $ConnectionUserFactory = ConnectionUserFactory::getInstance();
        $companyDatabase = $ConnectionUserFactory->selectDatabase(false, $companyID);

        try {
            $root_host = DB_DEVELOPER_HOST;
            $root = DB_DEVELOPER_USER;
            $root_pass = DB_DEVELOPER_PASSWORD;

            $pdo = new PDO('mysql:host=' . $root_host, $root, $root_pass, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $userSettings = $this->SuperAdmin->getSettings($companyID);
            $settings['database'] = $userSettings['database'];
            $settings['dbpass'] = $userSettings['dbpass'];

            $pdo->exec("CREATE DATABASE `" . $settings['database'] . "`");
            $pdo->exec("CREATE USER 'v_" . $settings['user'] . "'@'localhost' IDENTIFIED BY '" . $settings['dbpass'] . "' ");
            $pdo->exec("GRANT SELECT , INSERT , UPDATE , DELETE ON `" . addcslashes($settings['database'], '_%') . "`.* TO 'v_" . $settings['user'] . "'@'localhost' IDENTIFIED BY '" . $settings['dbpass'] . "' ");
            $pdo->exec("FLUSH PRIVILEGES");

            foreach ($tableList as $tl) {
                $pdo->exec(' USE `' . $companyDatabase['dbname'] . '`; ');
                $query = "SHOW TABLES LIKE '$tl' ";

                $exist = $pdo->query($query)->rowCount();
                if ($exist > 0) {
                    continue;
                }

                $pdo->exec(' USE `' . $companyDatabase['dbname'] . '`; ');

                $qCreate = ' CREATE TABLE IF NOT EXISTS `' . $tl . '` LIKE `' . $patternDatabase . '`.`' . $tl . '`; ';
                $pdo->exec($qCreate);
                if (in_array($tl, $copyList)) {
                    $qCopy = ' INSERT `' . $tl . '` SELECT * FROM `' . $patternDatabase . '`.`' . $tl . '`; ';
                    $pdo->exec($qCopy);
                }
                if ($tl == 'dp_domains') {
                    $qInsert = " INSERT INTO `$tl` (
                                `ID`,
                                `name`,
                                `desc`,
                                `host`,
                                `active`
                                )
                                VALUES (
                                NULL , '" . $companyID . "." . ROOT_DOMAIN . "', NULL , '" . $companyID . "." . ROOT_DOMAIN . "', '1'
                                ); ";
                    $pdo->exec($qInsert);
                    $domainID = $pdo->lastInsertId();
                }
                if ($tl == 'dp_langSettings' && $domainID) {
                    $qInsert2 = "INSERT INTO `$tl` (
                                `ID` ,
                                `code`,
                                `domainID`,
                                `active`
                                )
                                VALUES (
                                NULL , 'pl', '" . $domainID . "', '1'
                                );
                                ";
                    $pdo->exec($qInsert2);
                }
                if( $tl == 'dp_settings' ) {
                    $qInsert3 = "INSERT INTO `dp_settings` (`ID`, `module`, `key`, `value`, `lang`, `domainID`) VALUES
                                (NULL, 'skins', 'bootswatch-cosmo', 'bootswatch-cosmo', NULL, NULL),
                                (NULL, 'skins', 'bootswatch-united', 'bootswatch-united', NULL, NULL),
                                (NULL, 'skins', 'bootswatch-yeti', 'bootswatch-yeti', NULL, NULL),
                                (NULL, 'skins', 'clean', 'clean', NULL, NULL),
                                (NULL, 'skins', 'demo', 'demo', NULL, NULL),
                                (NULL, 'skins', 'sample-first', 'sample-first', NULL, NULL),
                                (NULL, 'skins', 'simple-blue', 'simple-blue', NULL, NULL),
                                (NULL, 'skins', 'simple', 'simple', NULL, NULL);";
                    $pdo->exec($qInsert3);
                }
            }

            $this->createFolders($companyID);
            $this->createRootDomain($pdo, $companyID);
        } catch (Exception $e) {
            $data['error'] = $e->getMessage();
            $data['response'] = false;
        }


        if (!isset($data['error'])) {
            return array('response' => true);
        }
        return $data;
    }

    /**
     * @param $companyID
     * @return bool
     */
    private function createFolders($companyID)
    {
        $rootDir = BASE_DIR . 'data/' . $companyID;
        if (!is_dir($rootDir)) {
            mkdir($rootDir, 0777, true);
            chmod($rootDir, 0774);
        }
        $commonFolders = array(
            'images',
            'orderInvoices',
            'productCards',
            'productFiles',
            'productXml',
            'reclamationFiles',
            'styles',
            'export',
            'editorPDF',
            'dhl_labels',
            UPS_LABELS_DIR,
            'fonts'
        );
        foreach ($commonFolders as $folder) {
            $fullPathFolder = $rootDir . '/' . $folder;
            if (!is_dir($fullPathFolder)) {
                mkdir($fullPathFolder, 0777, true);
                chmod($fullPathFolder, 0774);
            }
        }

        $uploadFolder = BASE_DIR . 'data/uploadedFiles/' . $companyID;
        if (!is_dir($uploadFolder)) {
            mkdir($uploadFolder, 0777, true);
            chmod($uploadFolder, 0774);
        }

        if (is_dir($rootDir) && is_dir($uploadFolder)) {
            return true;
        }

        return false;

    }

    /**
     * @param $pdo PDO
     * @param $companyID
     * @return bool
     */
    private function createRootDomain($pdo, $companyID)
    {
        $pdo->exec(' USE `dp`; ');

        $query = "INSERT INTO `dp_domains` (
                                `companyID`,
                                `name`,
                                `port`,
                                `active`
                                )
                                VALUES (
                                :companyID,
                                :name,
                                :port,
                                :active
                                );
                                ";
        try {

            $stmt = $pdo->prepare($query);

            $stmt->bindValue('companyID', $companyID, PDO::PARAM_INT);
            $stmt->bindValue('name', $companyID . '.' . ROOT_DOMAIN, PDO::PARAM_STR);
            $stmt->bindValue('port', NULL, PDO::PARAM_NULL);
            $stmt->bindValue('active', 1, PDO::PARAM_INT);

            $stmt->execute();

            return $pdo->lastInsertId();
        } catch (PDOException $e) {
            $this->debug($e->getMessage());
        }

        return false;

    }

    /**
     * Step 2 - new database
     * @return array
     */
    public function post_createDomain()
    {

        $post = $this->Data->getAllPost();
        $domainName = $post['domainName'];

        $this->RouteRemote->setDomainID(SOURCE_DOMAIN_ID);

        $existDomain = $this->DomainRoot->get('name', $domainName);

        if ($existDomain) {
            $response['info'] = 'Domena ' . $existDomain['name'] . ' już istnieje.';
            $response['response'] = false;
            return $response;
        }

        $olderDomain = $this->DomainRoot->get('companyID', companyID);
        if (!$olderDomain) {
            $response['info'] = 'Występił problem z wersją. Skontaktuj się z administratorem.';
            $response['response'] = false;
            return $response;
        }

        $params['companyID'] = companyID;
        $params['port'] = $olderDomain['port'];
        $params['name'] = $domainName;
        $params['active'] = 1;
        $lastRootDomainID = $this->DomainRoot->create($params);
        unset($params);

        $createParams = array();
        $createParams['name'] = $domainName;
        $createParams['host'] = $domainName;
        $createParams['desc'] = NULL;

        $lastDomainID = $this->Domain->create($createParams);
        unset($createParams);

        $newDomain = $this->Domain->get('ID', $lastDomainID);

        $this->RouteRemote->setRemote(35);
        $routes = $this->RouteRemote->getFullTree('main');

        $this->RouteLang->setDomainID($lastDomainID);
        $this->Route->setDomainID($lastDomainID);

        $newViews = array();
        $newLangs = array();
        foreach ($routes as $oneRoute) {

            $this->RouteRemote->setRemote(35);
            if ($oneRoute['parentID'] > 0) {
                $parent = $this->RouteRemote->get('ID', $oneRoute['parentID']);
            }

            $this->Route->setRemote(companyID);
            if ($parent) {
                $lastRouteID = $this->Route->add($oneRoute['state'], $parent['state']);
            } else {
                $lastRouteID = $this->Route->add($oneRoute['state']);
            }

            $this->Route->update($lastRouteID, 'abstract', $oneRoute['abstract']);
            $this->Route->update($lastRouteID, 'name', $oneRoute['name']);
            $this->Route->update($lastRouteID, 'controller', $oneRoute['controller']);

            $this->RouteLangRemote->setRemote(35);
            $remoteLangs = $this->RouteLangRemote->get('routeID', $oneRoute['ID'], true);

            if (!empty($remoteLangs)) {
                foreach ($remoteLangs as $rl) {
                    $this->RouteLang->setRemote(companyID);
                    $newLangs[] = $this->RouteLang->set($lastRouteID, $rl['lang'], $rl['url'], $rl['name']);
                }
            }

            $this->ViewRemote->setRemote(35);
            $remoteViews = $this->ViewRemote->get('routeID', $oneRoute['ID'], true);

            if (!empty($remoteViews)) {
                foreach ($remoteViews as $rv) {
                    $params['name'] = $rv['name'];
                    $params['routeID'] = $lastRouteID;
                    $params['replaceID'] = $rv['replaceID'];
                    $params['templateID'] = $rv['templateID'];
                    $params['isMain'] = $rv['isMain'];
                    $params['controller'] = $rv['controller'];
                    $params['parentViewID'] = $rv['parentViewID'];
                    $this->View->setRemote(companyID);
                    $newViews[] = $this->View->create($params);
                    unset($params);
                }
            }

            $this->TemplateSettingRemote->setRemote(35);
            $templateSettings = $this->TemplateSettingRemote->getByDomain();

            $newTemplateSettings = array();

            if (!empty($templateSettings)) {
                foreach ($templateSettings as $ts) {
                    $params['templateID'] = $ts['templateID'];
                    $params['source'] = $ts['source'];
                    $params['domainID'] = $lastDomainID;
                    $params['root'] = $ts['root'];
                    $this->TemplateSetting->setRemote(companyID);
                    $newTemplateSettings[] = $this->TemplateSetting->create($params);
                    unset($params);
                }
            }


        }
        $response = array(
            'response' => true,
            'routes' => $routes,
            'newViews' => $newViews,
            'newLangs' => $newLangs,
            'newDomain' => $newDomain,
            'newTemplateSettings' => $newTemplateSettings
        );
        return $response;
    }

    /**
     * @return array
     */
    private function makeDomain()
    {

        $this->RouteRemote->setDomainID(SOURCE_DOMAIN_ID);

        $activeDomainID = $this->getDomainID();

        $activeDomain = $this->Domain->get('ID', $activeDomainID);

        $this->RouteRemote->setRemote(SOURCE_PRINTHOUSE_ID);
        $routes = $this->RouteRemote->getFullTree('main');

        $this->RouteLang->setDomainID($activeDomainID);
        $this->Route->setDomainID($activeDomainID);

        $newViews = array();
        $newLangs = array();
        foreach ($routes as $oneRoute) {

            $this->RouteRemote->setRemote(SOURCE_PRINTHOUSE_ID);
            if ($oneRoute['parentID'] > 0) {
                $parent = $this->RouteRemote->get('ID', $oneRoute['parentID']);
            }

            $this->Route->setRemote(companyID);
            if ($parent) {
                $lastRouteID = $this->Route->add($oneRoute['state'], $parent['state']);
            } else {
                $lastRouteID = $this->Route->add($oneRoute['state']);
            }

            $this->Route->update($lastRouteID, 'abstract', $oneRoute['abstract']);
            $this->Route->update($lastRouteID, 'name', $oneRoute['name']);
            $this->Route->update($lastRouteID, 'controller', $oneRoute['controller']);

            $this->RouteLangRemote->setRemote(SOURCE_PRINTHOUSE_ID);
            $remoteLangs = $this->RouteLangRemote->get('routeID', $oneRoute['ID'], true);

            if (!empty($remoteLangs)) {
                foreach ($remoteLangs as $rl) {
                    $this->RouteLang->setRemote(companyID);
                    $newLangs[] = $this->RouteLang->set($lastRouteID, $rl['lang'], $rl['url'], $rl['name']);
                }
            }

            $this->ViewRemote->setRemote(SOURCE_PRINTHOUSE_ID);
            $remoteViews = $this->ViewRemote->get('routeID', $oneRoute['ID'], true);

            if (!empty($remoteViews)) {
                foreach ($remoteViews as $rv) {
                    $params['name'] = $rv['name'];
                    $params['routeID'] = $lastRouteID;
                    $params['replaceID'] = $rv['replaceID'];
                    $params['templateID'] = $rv['templateID'];
                    $params['isMain'] = $rv['isMain'];
                    $params['controller'] = $rv['controller'];
                    $params['parentViewID'] = $rv['parentViewID'];
                    $this->View->setRemote(companyID);
                    $newViews[] = $this->View->create($params);
                    unset($params);
                }
            }

            $this->TemplateSettingRemote->setRemote(SOURCE_PRINTHOUSE_ID);
            $templateSettings = $this->TemplateSettingRemote->getByDomain();

            $newTemplateSettings = array();

            if (!empty($templateSettings)) {
                foreach ($templateSettings as $ts) {
                    $params['templateID'] = $ts['templateID'];
                    $params['source'] = $ts['source'];
                    $params['domainID'] = $activeDomainID;
                    $params['root'] = $ts['root'];
                    $this->TemplateSetting->setRemote(companyID);
                    $newTemplateSettings[] = $this->TemplateSetting->create($params);
                    unset($params);
                }
            }


        }
        $response = array(
            'response' => true,
            'routes' => $routes,
            'newViews' => $newViews,
            'newLangs' => $newLangs,
            'activeDomain' => $activeDomain,
            'newTemplateSettings' => $newTemplateSettings
        );
        return $response;
    }

    /**
     * @return array
     */
    public function patch_resetDomain()
    {

        $domainID = $this->getDomainID();

        $domain = $this->Domain->get('ID', $domainID);
        if ($domain) {

            $this->TemplateSetting->delete('domainID', $domainID);

            $routes = $this->Route->getFullTree('main');
            foreach ($routes as $route) {
                $this->View->delete('routeID', $route['ID']);
                $this->RouteLang->delete('routeID', $route['ID']);
            }

            $this->Route->customDelete('main');

            return $this->makeDomain();
        }

        return array('response' => false);
    }

    /**
     * @return array
     *
     */
    public function patch_removeDomain()
    {

        $domainID = $this->getDomainID();

        $domain = $this->Domain->get('ID', $domainID);
        if ($domain) {

            $this->TemplateSetting->delete('domainID', $domainID);

            $routes = $this->Route->getFullTree('main');
            foreach ($routes as $route) {
                $this->View->delete('routeID', $route['ID']);
                $this->RouteLang->delete('routeID', $route['ID']);
            }

            $this->Route->customDelete('main');

            return array('response' => true);
        }

        return array('response' => false);
    }

    /**
     * @return array
     */
    public function post_executeToAllDb()
    {
        $query = $this->Data->getPost('query');

        if (empty($query)) {
            return array(
                'info' => 'add a field name query in post',
                'response' => false
            );
        }

        $result = $this->ConnectionSwitchFactory->executeForAll($query);

        return $result;
    }

    /**
     * @return array|bool
     */
    public function copyUserAddresses()
    {
        $this->User->setTableName('users2', false);
        $users = $this->User->getAll();

        $aggregateUsers = array();
        $aggregateInvoices = array();
        foreach ($users as $user) {
            $aggregateUsers[] = $user['ID'];
            if( intval($user['addressID']) > 0 ) {
                $aggregateInvoices[] = $user['addressID'];
            }
        }

        $defaultAddresses = $this->Address->getDefaultByList($aggregateUsers, 1);
        $defaultInvoiceAddresses = $this->Address->getDefaultByList($aggregateInvoices, 2);

        $createdAddresses = 0;
        $createdInvoiceAddresses = 0;
        $createdAddressJoin = 0;
        $createdInvoiceAddressJoin = 0;

        foreach ($users as $user) {
            if( !$defaultAddresses[$user['ID']] ) {
                $params = array();
                $params['name'] = $user['name'];
                $params['lastname'] = $user['lastname'];
                $params['street'] = $user['street'];
                $params['house'] = $user['house'];
                $params['apartment'] = $user['apartment'];
                $params['zipcode'] = $user['zipcode'];
                $params['city'] = $user['city'];
                $params['areaCode'] = $user['areaCode'];
                $params['telephone'] = $user['telephone'];
                $params['companyName'] = $user['companyName'];
                $params['nip'] = $user['nip'];
                $userAddressID = $this->Address->create($params);
                if( $userAddressID > 0 ) {
                    $createdAddresses++;
                    $params = array();
                    $params['userID'] = $user['ID'];
                    $params['addressID'] = $userAddressID;
                    $params['default'] = 1;
                    $params['type'] = 1;
                    $addressJoinID = $this->AddressUser->create($params);
                    if( $addressJoinID > 0 ) {
                        $createdAddressJoin++;
                    }
                }
            }

            if( !$defaultInvoiceAddresses[$user['ID']] && $user['addressID'] > 0 ) {
                $invoiceAddress = $this->Address->get('ID', $user['addressID']);

                if( $invoiceAddress ) {
                    $params = array();
                    $params['name'] = $invoiceAddress['name'];
                    $params['lastname'] = $invoiceAddress['lastname'];
                    $params['street'] = $invoiceAddress['street'];
                    $params['house'] = $invoiceAddress['house'];
                    $params['apartment'] = $invoiceAddress['apartment'];
                    $params['zipcode'] = $invoiceAddress['zipcode'];
                    $params['city'] = $invoiceAddress['city'];
                    $params['areaCode'] = $invoiceAddress['areaCode'];
                    $params['telephone'] = $invoiceAddress['telephone'];
                    $params['companyName'] = $invoiceAddress['companyName'];
                    $params['nip'] = $invoiceAddress['nip'];
                    $invoiceAddressID = $this->Address->create($params);
                    if( $invoiceAddressID > 0 ) {
                        $createdInvoiceAddresses++;
                        $params = array();
                        $params['userID'] = $user['ID'];
                        $params['addressID'] = $invoiceAddressID;
                        $params['default'] = 1;
                        $params['type'] = 2;
                        $invoiceAddressJoinID = $this->AddressUser->create($params);
                        if( $invoiceAddressJoinID > 0 ) {
                            $createdInvoiceAddressJoin++;
                        }
                    }
                }

            }

            $groupExist = $this->checkUserGroup($user['ID'], 51);

            if( !$groupExist ) {
                $this->UserGroup->customCreate(51, $user['ID']);
            }
        }

        $response = false;
        if( $createdAddresses > 0 || $createdInvoiceAddresses > 0 ) {
            $response = true;
        }

        return array(
            'createdAddresses' => $createdAddresses,
            'createdAddressJoin' => $createdAddressJoin,
            'createdInvoiceAddresses' => $createdInvoiceAddresses,
            'createdInvoiceAddressJoin' => $createdInvoiceAddressJoin,
            'response' => $response
        );
    }

    public function post_importUsers()
    {
        ini_set('max_execution_time', 720);

        $post = $this->Data->getAllPost();

        $file = $_FILES['file'];
        $dir = STATIC_PATH . companyID . '/export/tmp/';
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        $filename = 'users.xls';
        $path = $dir . $filename;

        if (move_uploaded_file($file['tmp_name'], $path)) {
            if( $post['type'] == 'delivery' ) {
                $data = $this->importDeliveryAddress($path);
            } elseif($post['type'] == 'invoice') {
              $data = $this->importInvoiceAddress($path);
            } else {
                $data = $this->import($path);
            }
            $data['response'] = true;
        } else {
            $data['response'] = false;
        }

        return $data;
    }

    /**
     * @param $path
     * @return array
     * @throws PHPExcel_Reader_Exception
     */
    private function import($path)
    {
        $data['response'] = true;

        if (!$this->openFile($path, 0)) {
            $data['response'] = false;
            return $data;
        }
        $sheetArray = $this->sheetToArray();

        $User = new User();
        $User->setDomainID(SOURCE_DOMAIN_ID);

        $UserOption = new UserOption();

        $savedUsers = 0;
        $savedUserOptions = 0;

        foreach ($sheetArray as $key => $row) {
            if ($key == 1) {
                continue;
            }

            if( $row['A'] == NULL ) {
                continue;
            }

            $newUser = array();

            $existUser = $User->getByEmail($row['A']);

            if( !$existUser ) {
                $newUser['user'] = $newUser['login'] = $row['A'];
                $newUser['telephone'] = $row['D'];
                if( strlen($row['B']) == 0 ) {
                    $newUser['name'] = '-';
                } else {
                    $newUser['name'] = $row['B'];
                }
                $newUser['lastname'] = $row['C'];
                $newUser['domainID'] = SOURCE_DOMAIN_ID;

                $lastID = $User->create($newUser);

                if( $lastID > 0 ) {

                    $savedUsers++;

                    $userOptionExist = $UserOption->get('uID', $lastID);

                    if( !$userOptionExist ) {
                        $newUserOption = array();
                        $newUserOption['uID'] = $lastID;
                        $newUserOption['userTypeID'] = 1;
                        $lastUserOptionID = $UserOption->create($newUserOption);
                        if( $lastUserOptionID > 0 ) {
                            $savedUserOptions++;
                        }
                    }

                }

            }

        }

        return compact(
            'savedUsers'
        );
    }

    /**
     * @param $path
     * @return array
     * @throws PHPExcel_Reader_Exception
     */
    private function importDeliveryAddress($path)
    {
        $this->openFile($path, 2);
        $sheetArrayAddresses = $this->sheetToArray();

        $User = new User();
        $User->setDomainID(SOURCE_DOMAIN_ID);

        $Address = new Address();
        $AddressUser = new AddressUser();

        $savedDeliveryJoins = 0;
        $savedDeliveryAddress = 0;

        foreach ($sheetArrayAddresses as $key => $row) {

            if ($key == 1) {
                continue;
            }

            if ($row['A'] == NULL) {
                continue;
            }

            $existUser = $User->getByEmail($row['A']);

            $newAddress = $this->prepareAddress($row['F']);

            $newAddress['zipcode'] = $row['G'];
            $newAddress['city'] = $row['H'];
            $newAddress['companyName'] = $row['E'];
            $newAddress['name'] = $row['B'];
            $newAddress['lastname'] = $row['C'];
            $newAddress['telephone'] = $row['D'];

            $newAddress['countryCode'] = $this->selectCountryCode($row['I']);

            $newAddress['addressName'] = $newAddress['street'] . ' ' . $newAddress['house'];

            $lastAddressID = $Address->create($newAddress);
            if ($lastAddressID > 0) {

                $savedDeliveryAddress++;

                $newAddressJoin = array();
                $existAddressJoin = $AddressUser->getOne($existUser['ID'], 1);
                if ($existAddressJoin) {
                    $newAddressJoin['default'] = 0;
                } else {
                    $newAddressJoin['default'] = 1;
                }

                $newAddressJoin['userID'] = $existUser['ID'];
                $newAddressJoin['addressID'] = $lastAddressID;
                $newAddressJoin['type'] = 1;
                $lastAddressUserID = $AddressUser->create($newAddressJoin);
                if ($lastAddressUserID > 0) {
                    $savedDeliveryJoins++;
                }
            }
        }

        return compact(
            'savedDeliveryAddress',
            'savedDeliveryJoins'
        );
    }

    private function importInvoiceAddress($path)
    {
        $this->openFile($path, 1);
        $sheetArrayInvoices = $this->sheetToArray();

        $User = new User();
        $User->setDomainID(SOURCE_DOMAIN_ID);

        $Address = new Address();
        $AddressUser = new AddressUser();

        $savedJoins = 0;
        $savedAddress = 0;

        foreach ($sheetArrayInvoices as $key => $row) {
            if ($key == 1) {
                continue;
            }

            if( $row['A'] == NULL ) {
                continue;
            }

            $existUser = $User->getByEmail($row['A']);

            $newAddress = $this->prepareAddress($row['E']);

            $newAddress['zipcode'] = $row['F'];
            $newAddress['city'] = $row['G'];
            $newAddress['companyName'] = $row['B'];

            $newAddress['countryCode'] = $this->selectCountryCode($row['H']);

            $newAddress['addressName'] = $newAddress['street'] . ' ' . $newAddress['house'];

            $lastAddressID = $Address->create($newAddress);
            if( $lastAddressID > 0 ) {

                $savedAddress++;

                $newAddressJoin = array();
                $existAddressJoin = $AddressUser->getOne($existUser['ID'], 2);
                if( $existAddressJoin ) {
                    $newAddressJoin['default'] = 0;
                } else {
                    $newAddressJoin['default'] = 1;
                }

                $newAddressJoin['userID'] = $existUser['ID'];
                $newAddressJoin['addressID'] = $lastAddressID;
                $newAddressJoin['type'] = 2;
                $lastAddressUserID = $AddressUser->create($newAddressJoin);
                if( $lastAddressUserID > 0 ) {
                    $savedJoins++;
                }
            }
        }

        return compact(
            'savedJoins',
            'savedAddress'
        );
    }

    private function prepareAddress($rowAddress)
    {
        $rowAddress = str_replace(',', '', $rowAddress);
        $rowAddress = str_replace(' Lok. ', '/', $rowAddress);
        $rowAddress = str_replace(' Lok.', '/', $rowAddress);
        $rowAddress = str_replace('/Lok.', '/', $rowAddress);

        $newAddress = array();

        if( strstr( $rowAddress, ' ' ) ) {
            $expAddress = explode(' ', $rowAddress);
            $addressNumber = end($expAddress);
            if( strstr( $addressNumber, '/' ) ) {
                $addressNumberExplode = explode('/',$addressNumber);
                $newAddress['house'] = $addressNumberExplode[0];
                $newAddress['apartment'] = $addressNumberExplode[1];
            } else {
                $newAddress['house'] = $addressNumber;
            }
            array_pop($expAddress);
            $newAddress['street'] = implode(' ', $expAddress);

        } else {
            $newAddress['street'] = $rowAddress;
            $newAddress['house'] = '-';
        }

        return $newAddress;
    }

    /**
     * @param $name
     * @return string
     */
    private function selectCountryCode($name)
    {
        $countryCode = 'PL';
        if( $name == 'Polska' ) {
            $countryCode = 'PL';
        } elseif( $name == '1Niemcy' ) {
            $countryCode = 'DE';
        } elseif( $name == 'Wielka Brytania' ) {
            $countryCode = 'GB';
        } elseif ( $name == 'Holandia' ) {
            $countryCode = 'NL';
        } elseif ( $name == 'Austria' ) {
            $countryCode = 'AT';
        }

        return $countryCode;
    }

    /**
     * @param $path
     * @param int $sheetIndex
     * @return bool
     * @throws PHPExcel_Reader_Exception
     */
    private function openFile($path, $sheetIndex = 1)
    {
        if (!file_exists($path)) {
            return false;
        }
        $inputFileType = PHPExcel_IOFactory::identify($path);
        $ExcelReader = PHPExcel_IOFactory::createReader($inputFileType);

        $this->ExcelFile = $ExcelReader->load($path);

        $this->ExcelFile->setActiveSheetIndex($sheetIndex);

        return true;
    }

    private function sheetToArray()
    {
        return $this->ExcelFile->getActiveSheet()->toArray(null, true, true, true);
    }

    private function checkUserGroup($userID, $groupID)
    {
        $userGroups = $this->UserGroup->getUserGroups($userID);
        foreach ($userGroups as $userGroup) {
            if( $userGroup['groupID'] == $groupID ) {
                return true;
            }
        }

        return false;
    }
}
