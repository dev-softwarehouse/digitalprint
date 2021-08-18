<?php

namespace DreamSoft\Libs;

/**
 *
 * @class Routing
 */

class Routing
{

    public $resources = array(
        'auth' => array('controller' => 'Auth',
            'action' => 'auth',
            'custom' => array('login', 'logout', 'check', 'token', 'resource', 'isAdminEditor')
        ),
        'users' => array(
            'controller' => 'Users',
            'action' => 'index',
            'childs' => array('userRoles', 'userGroups', 'userOptions', 'address'),
            'custom' => array(
                'count',
                'changePass',
                'userRegister',
                'passForget',
                'searchAll',
                'special',
                'getUser',
                'canEditOtherAddress',
                'canRemoveOtherAddress',
                'canAddOtherAddress',
                'getMyAccount',
                'checkOneTimeUser',
                'canEditOtherOptions',
                'getCurrency',
                'userSimpleRegister',
                'getUsersByType',
                'getLoggedUserData',
                'canEditOtherPassword',
                'changePassword',
                'importantData'
            )
        ),
        'address' => array(
            'controller' => 'Users',
            'action' => 'address',
            'custom' => array('addressPublic', 'getUserAddresses', 'setAddressToUser')
        ),
        'userOptions' => array(
            'controller' => 'Users',
            'action' => 'userOptions',
            'custom' => array('userType')
        ),
        'userRoles' => array('controller' => 'Users', 'action' => 'userRoles'),
        'userGroups' => array('controller' => 'Users', 'action' => 'userGroups'),
        'domains' => array('controller' => 'Domains', 'action' => 'index'),
        'settings' => array(
            'package' => 'config',
            'controller' => 'Settings',
            'action' => 'index',
            'module' => true,
            'custom' => array(
                'getSkinName',
                'getPublicSettings',
                'sendMessage',
                'newsletter',
                'confirmNewsletter',
                'getDateByWorkingDays',
                'generateSiteMap'
            )
        ),
        'contents' => array('package' => 'config',
            'controller' => 'Contents',
            'action' => 'index',
            'module' => true),
        'lang' => array('package' => 'lang',
            'controller' => 'Lang',
            'action' => 'index',
            'custom' => array('import', 'export')),
        'langroot' => array('package' => 'lang',
            'controller' => 'LangRoot',
            'action' => 'index',
            'custom' => array('import', 'showEmpty', 'export')),
        'langsettings' => array('package' => 'lang',
            'controller' => 'LangSettings',
            'action' => 'index'),
        'langsettingsroot' => array('package' => 'lang',
            'controller' => 'LangSettingsRoot',
            'action' => 'index'),
        'aclPermissions' => array('controller' => 'Acl', 'action' => 'index'),
        'adminmenu' => array(
            'package' => 'Others',
            'controller' => 'Menu',
            'action' => 'index',
            'autoload' => true,
            'custom' => array(
                'superAdminAcl',
                'superAdminRequestTester',
                'superAdminModules',
                'superAdminHelp',
                'superAdminEmails',
                'superAdminTemplates',
                'shopDomainSettings',
                'shopModules',
                'shopLanguages',
                'shopSpecialUsers',
                'shopUserPermissions',
                'printShopConfigProducts',
                'printShopRealisationTimes',
                'printShopConfigAttributes',
                'printShopWorkspaces',
                'printShopProductionPath',
                'ordersProductionPath',
                'ordersProductionPanel',
                'ordersAcceptFiles',
                'ordersOperators',
                'ordersOrders',
                'ordersProducts',
                'ordersStatuses',
                'ordersShipment',
                'ordersReclamationStatuses',
                'ordersCustomProducts',
                'customerServiceRegister',
                'customerServiceUserList',
                'customerServiceOfferList',
                'customerServiceCreateOrder',
                'customerServiceCreateOffer',
                'customerServiceCalculations',
                'customerServiceOrderList',
                'customerServiceDiscounts',
                'customerServicePromotions',
                'customerServiceCoupons',
                'customerServiceReclamations',
                'contentsMails',
                'contentsSeo',
                'contentsCategories',
                'contentsGraphics',
                'contentsViewSettings',
                'contentsTemplates',
                'contentsStaticContents',
                'contentsRoutes'
            )
        ),
        'roles' => array('controller' => 'Acl', 'action' => 'roles', 'childs' => array('rolePerms')),
        'rolePerms' => array('controller' => 'Acl', 'action' => 'rolePerms'),
        'groups' => array('controller' => 'Groups', 'action' => 'index', 'childs' => array('groupRoles')),
        'groupRoles' => array('controller' => 'Groups', 'action' => 'groupRoles'),
        'initPerms' => array('controller' => 'Acl', 'action' => 'initPerms'),
        'currency' => array(
            'controller' => 'Currency',
            'action' => 'index',
            'custom' => array('getDefault')
        ),
        'currencyroot' => array('controller' => 'CurrencyRoot', 'action' => 'index'),
        'tax' => array(
            'controller' => 'Tax',
            'action' => 'index',
            'custom' => array(
                'getBy',
                'taxForProduct'
            )
        ),
        'ps_priceLists' => array(
            'package' => 'printshop_config',
            'controller' => 'PriceLists',
            'action' => 'priceList',
            'custom' => array(
                'uploadIcon'
            )
        ),
        'ps_workspaces' => array(
            'package' => 'printshop_config',
            'controller' => 'Workspaces',
            'action' => 'workspace',
            'custom' => array(
                'getByPrintType'
            )
        ),
        'ps_printtypeDevices' => array(
            'package' => 'printshop_config',
            'controller' => 'PrintType',
            'action' => 'printTypeDevices',
        ),
        'ps_attributes' => array(
            'package' => 'printshop_config',
            'controller' => 'Attributes',
            'action' => 'attribute',
            'custom' => array(
                'sortAttr',
                'copy',
                'checkCustomNames',
                'getAttributeSettings'
            ),
            'childs' => array('ps_options')),
        'ps_printtypes' => array('package' => 'printshop_config',
            'controller' => 'PrintType',
            'action' => 'printType',
            'childs' => array('ps_printtypeDevices')),
        'ps_attributetypes' => array('package' => 'printshop_config',
            'controller' => 'Attributes',
            'action' => 'attributeType'),
        'ps_specialprinttypes' => array('package' => 'printshop_config',
            'controller' => 'PrintType',
            'action' => 'printTypeSpecial'),
        'ps_pricetypes' => array('package' => 'printshop_config',
            'controller' => 'Prices',
            'action' => 'priceTypes'),
        'ps_prices' => array('package' => 'printshop_config',
            'controller' => 'Prices',
            'action' => 'prices',
            'custom' => array('export', 'importPriceList', 'removeAll', 'discountPrices'),
            'childs' => array('ps_prices_remove')
        ),
        'ps_prices_remove' => array(
            'package' => 'printshop_config',
            'controller' => 'Prices',
            'action' => 'allDiscount',
        ),
        'ps_config_increases' => array('package' => 'printshop_config',
            'controller' => 'IncreasesConfig',
            'action' => 'increases'),
        'ps_config_related_increases' => array('package' => 'printshop_config',
            'controller' => 'IncreasesConfig',
            'action' => 'increasesList'),
        'ps_config_related_increases_count' => array('package' => 'printshop_config',
            'controller' => 'IncreasesConfig',
            'action' => 'relatedIncreasesCount'),
        'ps_config_related_increases_list' => array('package' => 'printshop_config',
            'controller' => 'IncreasesConfig',
            'action' => 'relatedIncreasesList'),
        'ps_config_increaseTypes' => array('package' => 'printshop_config',
            'controller' => 'IncreasesConfig',
            'action' => 'increaseTypes'),
        'ps_detailPrices' => array('package' => 'printshop_config',
            'controller' => 'DetailPrices',
            'action' => 'detailPrices'
        ),
        'discounts' => array(
            'package' => 'discounts',
            'controller' => 'Discounts',
            'action' => 'discounts',
            'autoload' => true,
            'custom' => array(
                'discountGroups',
                'selectedDiscountGroup',
                'showProcessDiscounts'
            )
        ),
        'discountLangs' => array(
            'package' => 'discounts',
            'controller' => 'Discounts',
            'action' => 'discountLangs'
        ),
        'promotions' => array(
            'package' => 'promotions',
            'controller' => 'Promotions',
            'action' => 'promotions',
            'custom' => array(
                'count',
                'uploadIcon'
            ),
            'autoload' => true
        ),
        'promotionGroups' => array(
            'package' => 'promotions',
            'controller' => 'Promotions',
            'action' => 'promotionGroups'
        ),
        'promotionLangs' => array(
            'package' => 'promotions',
            'controller' => 'Promotions',
            'action' => 'promotionLangs'
        ),
        'ps_options' => array('package' => 'printshop_config',
            'controller' => 'Options',
            'action' => 'options',
            'custom' => array(
                'sortOptions',
                'copy',
                'uploadIcon'
            ),
            'childs' => array(
                'optionRealizationTimes',
                'optionDescriptions',
                'exclusions',
                'priceControllers',
                'optionOperations',
                'increaseControllers',
                'ps_countPrices',
                'ps_countIncreases',
                'paperPrice'
            ),
        ),
        'paperPrice' => array(
            'package' => 'printshop_config',
            'controller' => 'PaperPrice',
            'action' => 'paperPrice',
        ),
        'ps_countPrices' => array(
            'package' => 'printshop_config',
            'controller' => 'Options',
            'action' => 'countPrices',
        ),
        'ps_countIncreases' => array(
            'package' => 'printshop_config',
            'controller' => 'IncreasesConfig',
            'action' => 'countIncreases',
        ),
        'priceControllers' => array('controller' => 'Printshop', 'action' => 'priceControllers', 'childs' => array('ps_prices', 'ps_detailPrices')),
        'increaseControllers' => array('controller' => 'Printshop', 'action' => 'increaseControllers', 'childs' => array('ps_config_increases', 'ps_config_related_increases', 'ps_config_related_increases_count','ps_config_related_increases_list')),
        'optionRealizationTimes' => array('package' => 'printshop_config',
            'controller' => 'OptionRealizationTimes',
            'action' => 'optionRealizationTimes'),
        'optionDescriptions' => array('package' => 'printshop_config',
            'controller' => 'OptionDescriptions',
            'action' => 'optionDescriptions'),
        'exclusions' => array(
            'package' => 'printshop_config',
            'controller' => 'exclusions',
            'action' => 'exclusions'
        ),
        'ps_product_exclusions' => array(
            'package' => 'printshop_config',
            'controller' => 'exclusions',
            'action' => 'productExclusions'
        ),
        'ps_groups' => array(
            'package' => 'printshop',
            'controller' => 'ProductGroups',
            'action' => 'groups',
            'childs' => array(
                'ps_types',
                'ps_rt_details'
            ),
            'custom' => array(
                'offerProducts',
                'getOneForView',
                'uploadIcon',
                'groupsForSelect',
                'getActiveGroups',
                'getActiveGroupsPublic'
            )
        ),
        'ps_types' => array(
            'package' => 'printshop',
            'controller' => 'Types',
            'action' => 'types',
            'childs' => array('ps_volumes',
                'ps_product_options',
                'ps_formats',
                'ps_rt_details',
                'ps_pages',
                'ps_increases',
                'ps_increases_types',
                'ps_tooltips',
                'ps_complex',
                'ps_calculate',
                'ps_product_exclusions'
            ),

            'custom' => array(
                'sort',
                'selectedOptions',
                'forView',
                'selectedOptionsPublic',
                'oneForView',
                'uploadIcon',
                'getTypesData',
                'search',
                'getActiveTypes',
                'copy',
                'searchAll',
                'getActiveTypesPublic',
            )
        ),
        'ps_rt_details' => array(
            'package' => 'printshop',
            'controller' => 'RealizationTime',
            'action' => 'details'
        ),
        'ps_product_options' => array(
            'package' => 'printshop',
            'controller' => 'ProductOptions',
            'action' => 'options',
            'custom' => array('forEditor', 'attrList', 'getAttributeNames')
        ),
        'ps_product_options_count' => array(
            'package' => 'printshop',
            'controller' => 'ProductOptions',
            'action' => 'count'
        ),
        'ps_complex' => array(
            'package' => 'printshop',
            'controller' => 'Complex',
            'action' => 'complex',
            'custom' => array(
                'group',
                'relatedFormat',
                'complexPublic',
                'getByBaseID'
            )
        ),
        'calculations' => array(
            'package' => 'orders',
            'controller' => 'Calculation',
            'action' => 'index',
            'custom' => array('seller', 'history')
        ),
        'ps_calculate' => array(
            'package' => 'printshop',
            'controller' => 'Calculate',
            'action' => 'calculate',
            'custom' => array(
                'saveCalculation',
                'calculatePublic',
                'saveCalculationPublic',
                'updateName',
                'possibleTechnologies',
                'canChangeAttrPrice'
            )
        ),
        'ps_formats' => array('package' => 'printshop',
            'controller' => 'Formats',
            'action' => 'formats',
            'childs' => array('ps_static_prices'),
            'custom' => array('sortFormats', 'formatsPublic', 'customName')),
        'ps_static_prices' => array('package' => 'printshop',
            'controller' => 'StaticPrices',
            'action' => 'staticprices',
            'custom' => array('export', 'import')),

        'ps_volumes' => array('package' => 'printshop',
            'controller' => 'Volumes',
            'action' => 'volumes',
            'childs' => array('ps_rt_details'),
            'custom' => array('customVolume', 'setMaxVolume')),
        'ps_realizationTimes' => array('package' => 'printshop',
            'controller' => 'RealizationTime',
            'action' => 'index',
            'custom' => array('sort')),
        'ps_pages' => array('package' => 'printshop',
            'controller' => 'Pages',
            'action' => 'pages',
            'custom' => array('pagesPublic', 'customName')
        ),
        'ps_increases' => array('package' => 'printshop',
            'controller' => 'Increases',
            'action' => 'increases'),
        'ps_increase_types' => array('package' => 'printshop',
            'controller' => 'Increases',
            'action' => 'types'),
        'ps_tooltips' => array('package' => 'printshop',
            'controller' => 'Tooltips',
            'action' => 'tooltips'),
        'ps_userData' => array(
            'package' => 'printshop',
            'controller' => 'UserData',
            'action' => 'index'
        ),
        'ps_userFiles' => array(
            'package' => 'printshop',
            'controller' => 'UserFiles',
            'action' => 'index'
        ),
        'statuses' => array('controller' => 'Statuses', 'action' => 'statuses'),

        'dp_statuses' => array('package' => 'orders',
            'controller' => 'OrderStatuses',
            'action' => 'index',
            'autoload' => true,
            'custom' => array('sort', 'forClient')
        ),

        'ssh' => array('package' => 'config',
            'controller' => 'Config',
            'action' => 'ssh'),
        'test' => array(
            'package' => 'config',
            'controller' => 'Config',
            'action' => 'test',
            'custom' => array(
                'importUsers',
                'updateTemplates',
                'updateTemplate',
                'createDomain',
                'setAllUserToGroup',
                'resetDomain',
                'executeToAllDb',
                'copyUserAddresses'
            )
        ),
        'modules' => array('controller' => 'Modules',
            'action' => 'modules',
            'childs' => array('module_keys', 'module_values'),
            'custom' => array('extended')
        ),
        'module_keys' => array('controller' => 'Modules', 'action' => 'keys', 'childs' => array('module_options')),
        'module_options' => array('controller' => 'Modules', 'action' => 'options',),
        'module_values' => array('controller' => 'Modules', 'action' => 'values'),
        'module_types' => array('controller' => 'Modules', 'action' => 'moduleTypes'),
        'deliveries' => array(
            'controller' => 'Deliveries',
            'action' => 'deliveries',
            'custom' => array(
                'deliveriesPublic',
                'findParcelsPublic'
            )
        ),
        'payments' => array(
            'controller' => 'Payments',
            'package' => 'Payments',
            'action' => 'payments',
            'autoload' => true,
            'custom' => array(
                'paymentsPublic',
                'getPaymentTypes',
                'payuVerify',
                'creditLimit'
            )
        ),
        'skills' => array(
            'package' => 'ProductionPath',
            'controller' => 'Skills',
            'action' => 'skills',
            'childs' => array('skillDevices'),
            'autoload' => true
        ),
        'skillDevices' => array(
            'package' => 'ProductionPath',
            'controller' => 'Skills',
            'action' => 'skillDevices',
            'autoload' => true
        ),
        'devices' => array(
            'package' => 'ProductionPath',
            'controller' => 'Devices',
            'action' => 'devices',
            'childs' => array('deviceSkills', 'deviceOngoings'),
            'custom' => array(
                'sameDevices',
                'countOngoings',
                'countFilteredOngoings',
                'canSeeAllOngoings',
                'sort'
            ),
            'autoload' => true
        ),
        'departments' => array(
            'package' => 'ProductionPath',
            'controller' => 'Departments',
            'action' => 'departments',
            'autoload' => true,
            'custom' => array(
                'sort'
            )
        ),
        'operations' => array(
            'package' => 'ProductionPath',
            'controller' => 'Operations',
            'action' => 'operations',
            'childs' => array(
                'operationDevices',
                'operationProcesses'
            ),
            'custom' => array('sort'),
            'autoload' => true
        ),
        'operationDevices' => array(
            'package' => 'ProductionPath',
            'controller' => 'Operations',
            'action' => 'operationDevices',
            'autoload' => true
        ),
        'operationProcesses' => array(
            'package' => 'ProductionPath',
            'controller' => 'Operations',
            'action' => 'operationProcesses',
            'autoload' => true
        ),
        'operators' => array(
            'package' => 'ProductionPath',
            'controller' => 'Operators',
            'action' => 'operators',
            'childs' => array('operatorSkills', 'workTimes', 'operatorLogs'),
            'autoload' => true
        ),
        'processes' => array(
            'package' => 'ProductionPath',
            'controller' => 'Processes',
            'action' => 'index',
            'custom' => array(
                'sort'
            ),
            'autoload' => true
        ),
        'workTimes' => array(
            'controller' => 'WorkTimes',
            'action' => 'index',
            'custom' => array('last')
        ),
        'operatorSkills' => array(
            'package' => 'ProductionPath',
            'controller' => 'Operators',
            'action' => 'operatorSkills',
            'autoload' => true
        ),
        'ongoings' => array(
            'package' => 'ProductionPath',
            'controller' => 'Ongoings',
            'action' => 'index',
            'custom' => array(
                'path',
                'logs',
                'operatorLogs',
                'showForItem',
                'progress'
            ),
            'autoload' => true
        ),
        'sortOngoings' => array(
            'package' => 'ProductionPath',
            'controller' => 'Ongoings',
            'action' => 'sort',
            'autoload' => true
        ),
        'sortbyDevices' => array(
            'package' => 'ProductionPath',
            'controller' => 'Ongoings',
            'action' => 'sortbyDevices',
            'autoload' => true
        ),
        'optionOperations' => array(
            'package' => 'ProductionPath',
            'controller' => 'Operations',
            'action' => 'optionOperations',
            'autoload' => true
        ),
        'deviceSkills' => array(
            'package' => 'ProductionPath',
            'controller' => 'Devices',
            'action' => 'deviceSkills',
            'autoload' => true
        ),
        'deviceOngoings' => array(
            'package' => 'ProductionPath',
            'controller' => 'Devices',
            'action' => 'ongoings',
            'custom' => array('sort'),
            'childs' => array('moveOngoings'),
            'autoload' => true
        ),
        'moveOngoings' => array(
            'package' => 'ProductionPath',
            'controller' => 'Devices',
            'action' => 'move',
            'autoload' => true
        ),
        'deviceOrder' => array(
            'package' => 'ProductionPath',
            'controller' => 'Ongoings',
            'action' => 'deviceOrder',
            'autoload' => true
        ),
        'loadProducts' => array(
            'package' => 'printshop',
            'controller' => 'ProductOptions',
            'action' => 'loadProducts'
        ),
        'adminProjects' => array(
            'package' => 'editor',
            'controller' => 'AdminProjects',
            'action' => 'adminProjects',
            'childs' => array('adminProjectLayers'),
            'custom' => array('extended', 'deleteChilds')
        ),
        'adminProjectLayers' => array(
            'package' => 'editor',
            'controller' => 'AdminProjects',
            'action' => 'layers',
            'childs' => array('adminProjectObjects', 'adminProjectLayerAttributes'),
            'custom' => array('extendedLayer')
        ),
        'adminProjectSortLayer' => array('package' => 'editor',
            'controller' => 'AdminProjects',
            'action' => 'sortLayer'),
        'adminProjectLayerAttributes' => array(
            'package' => 'editor',
            'controller' => 'AdminProjects',
            'action' => 'attributes'),
        'adminProjectObjects' => array('package' => 'editor',
            'controller' => 'AdminProjects',
            'action' => 'objects'),
        'adminProjectOnlyObjects' => array('package' => 'editor',
            'controller' => 'AdminProjects',
            'action' => 'onlyObjects'),
        'adminProjectOnlyLayers' => array('package' => 'editor',
            'controller' => 'AdminProjects',
            'action' => 'onlyLayers'),
        'upload' => array('package' => 'editor',
            'controller' => 'Upload',
            'action' => 'upload',
            'custom' => array('compress', 'theme'),
        ),
        'upload_url' => array('package' => 'editor',
            'controller' => 'Upload',
            'action' => 'url'
        ),
        'fotobudka' => array(
            'package' => 'editor',
            'controller' => 'Upload',
            'action' => 'fotobox'
        ),
        'adminFonts' => array(
            'package' => 'editor',
            'controller' => 'Fonts',
            'action' => 'fonts',
            'custom' => array('checkFont'),
        ),
        'createCompany' => array(
            'package' => 'config',
            'controller' => 'Config',
            'action' => 'createCompany'
        ),
        'copyPerms' => array(
            'package' => 'config',
            'controller' => 'Config',
            'action' => 'copyPerms'
        ),
        'resetDomain' => array(
            'package' => 'config',
            'controller' => 'Config',
            'action' => 'resetDomain'
        ),
        'removeDomain' => array(
            'package' => 'config',
            'controller' => 'Config',
            'action' => 'removeDomain'
        ),
        'routes' => array(
            'package' => 'Route',
            'controller' => 'Routes',
            'action' => 'index',
            'custom' => array(
                'moveUp',
                'moveDown',
                'breadcrumbs',
                'level',
                'productToRoute',
                'show',
                'buildRouting',
                'one',
                'getRouteByUrl',
                'generateRoutesFile',
                'translateState'
            ),
            'childs' => array('mainContents'),
            'autoload' => true
        ),
        'mainContents' => array(
            'controller' => 'MainContents',
            'action' => 'index',
            'custom' => array('sort'),
        ),
        'adminHelps' => array(
            'package' => 'AdminHelp',
            'controller' => 'Help',
            'action' => 'helps',
            'childs' => array('helpKeys'),
            'autoload' => true
        ),
        'helpKeys' => array(
            'package' => 'AdminHelp',
            'controller' => 'Help',
            'action' => 'keys',
            'childs' => array('helpLangs'),
            'autoload' => true
        ),
        'helpLangs' => array(
            'package' => 'AdminHelp',
            'controller' => 'Help',
            'action' => 'langs',
            'autoload' => true
        ),
        'ps_preflightFolder' => array(
            'package' => 'printshop',
            'controller' => 'PreFlight',
            'action' => 'index',
        ),
        'activeModules' => array(
            'controller' => 'Modules',
            'action' => 'activeModules'
        ),
        'operatorLogs' => array(
            'package' => 'ProductionPath',
            'controller' => 'Operators',
            'action' => 'operatorLogs',
            'custom' => array('count'),
            'autoload' => true
        ),
        'mailTypes' => array('controller' => 'mail',
            'action' => 'types',
            'childs' => array('mailContents', 'mailVariables')),
        'mailContents' => array('controller' => 'mail',
            'action' => 'contents'),
        'mailVariables' => array(
            'controller' => 'mail',
            'action' => 'variables'
        ),
        'offers' => array('controller' => 'Offers',
            'action' => 'offers',
            'custom' => array('getCurrent')
        ),
        'offerItems' => array('controller' => 'Offers',
            'action' => 'items',
            'custom' => array('files', 'getFile', 'userCanAddFile')),
        'ountOffers' => array('controller' => 'Offers',
            'action' => 'count'),
        'offerCompanies' => array('controller' => 'Offers',
            'action' => 'companies'),
        'auctions' => array('controller' => 'Auctions',
            'action' => 'index',
            'custom' => array('forCompany', 'getAuctions', 'finishAuction', 'responseWinner', 'order', 'isAuctionUser', 'export'),
            'childs' => array('auctionResponses', 'auctionAllResponses', 'auctionSelectWinner', 'auctionFiles')),
        'auctionFiles' => array('controller' => 'Auctions',
            'action' => 'files',
            'custom' => array('getFile'),
        ),
        'auctionResponses' => array(
            'controller' => 'Auctions',
            'action' => 'response',
        ),
        'auctionAllResponses' => array(
            'controller' => 'Auctions',
            'action' => 'allresponses'),

        'auctionSelectWinner' => array(
            'controller' => 'Auctions',
            'action' => 'selectWinner'),
        'prices' => array(
            'controller' => 'BasePrices',
            'action' => 'index'
        ),
        'userTypes' => array(
            'controller' => 'UserTypes',
            'action' => 'types',
            'custom' => array('userTypeGroups', 'userTypeRoles')
        ),
        'templates' => array(
            'package' => 'templates',
            'controller' => 'TemplateRoot',
            'action' => 'templates',
            'custom' => array('show', 'upload', 'getFile', 'getCss', 'setSource', 'getUrl', 'removeFile')
        ),
        'local_templates' => array(
            'package' => 'templates',
            'controller' => 'Templates',
            'action' => 'templates',
            'custom' => array('upload', 'setSource', 'getFile', 'removeFile')
        ),
        'dp_orders' => array(
            'package' => 'orders',
            'controller' => 'DpOrders',
            'action' => 'index',
            'custom' => array(
                'sellerNotReady',
                'saveOffer',
                'offerList',
                'orderList',
                'offerListCount',
                'orderListCount',
                'isAdmin',
                'isSeller',
                'isBok',
                'order',
                'count',
                'placeOrder',
                'updateAddress',
                'updateVatAddress',
                'getCart',
                'setUser',
                'saveCart',
                'getAddresses',
                'myZone',
                'myZoneOffers',
                'paymentSuccess',
                'paymentStatus',
                'myZoneCount',
                'payment',
                'updatePrice',
                'recalculateDelivery',
                'addToJoinedDelivery',
                'paymentRemind',
                'getOrderInvoiceAddress',
                'changeOrderPrice',
                'restoreOrderPrice',
                'changeAddresses',
                'fileReminder',
                'canEditPrice',
                'acceptOffer',
                'rejectOffer'
            )
        ),
        'dp_products' => array(
            'package' => 'Orders',
            'controller' => 'DpProducts',
            'action' => 'index',
            'custom' => array(
                'baseInfo',
                'count',
                'deletePublic',
                'myZone',
                'getByOrder',
                'restoreAccept',
                'copy'
            ),
            'childs' => array('productFiles'),
            'autoload' => true
        ),
        'productFiles' => array(
            'package' => 'orders',
            'controller' => 'DpProductFiles',
            'action' => 'files',
            'custom' => array(
                'productListFiles',
                'canSeeUserFiles',
                'makeMiniature'
            )
        ),
        'dp_views' => array(
            'package' => 'templates',
            'controller' => 'Views',
            'action' => 'index',
            'custom' => array('variables', 'mainVariables', 'sort', 'masks', 'createMask')
        ),
        'dp_categories' => array(
            'controller' => 'Categories',
            'action' => 'index',
            'custom' => array(
                'selectedToGroup',
                'setSelectedToGroup',
                'selectedToType',
                'setSelectedToType',
                'getContains',
                'getContainsAdmin',
                'getParents',
                'forView',
                'oneForView',
                'sort',
                'sortItems',
                'manyForView',
                'categoryContains',
                'getCategoryTree',
                'getChilds',
                'uploadIcon',
                'forViewPublic',
                'getGroups',
                'getFirstByType'
            )
        ),
        'pdfGenerating' => array(
            'controller' => 'PdfGenerate',
            'action' => 'generatePdf'
        ),
        'jpgPreview' => array(
            'controller' => 'PdfGenerate',
            'action' => 'jpgPreview'
        ),
        'authors' => array(
            'controller' => 'Authors',
            'action' => 'index'
        ),
        'ps_typeDescriptions' => array(
            'package' => 'printshop',
            'controller' => 'TypeDescriptions',
            'action' => 'typeDescriptions',
            'custom' => array('typeDescriptionsPublic', 'files', 'descFiles'),
        ),
        'ps_typeDescriptionsFormats' => array(
            'package' => 'printshop',
            'controller' => 'TypeDescriptionsFormats',
            'action' => 'typeDescriptionsFormats'
        ),
        'ps_groupDescriptions' => array(
            'package' => 'printshop',
            'controller' => 'GroupDescriptions',
            'action' => 'groupDescriptions',
            'custom' => array('groupDescriptionsPublic', 'files', 'descFiles'),
        ),
        'categoriesDescriptions' => array(
            'controller' => 'CategoriesDescriptions',
            'action' => 'categoriesDescriptions',
            'custom' => array('categoriesDescriptionsPublic', 'files', 'descFiles'),
        ),
        'subcategoriesDescriptions' => array(
            'controller' => 'SubcategoriesDescriptions',
            'action' => 'subcategoriesDescriptions',
            'custom' => array('subcategoriesDescriptionsPublic', 'files', 'descFiles'),
        ),
        'ps_connectOptions' => array(
            'package' => 'printshop_config',
            'controller' => 'ConnectOptions',
            'action' => 'index',
            'custom' => array('addToGroup', 'price')
        ),
        'taUploadIcons' => array(
            'controller' => 'TextAngularUpload',
            'action' => 'textAngularIcons'
        ),
        'graphicsUpload' => array(
            'controller' => 'Graphics',
            'action' => 'uploadElement',
            'custom' => array(
                'modelIcon',
                'favicon'
            )
        ),
        'dp_ModelIconsExtensions' => array(
            'controller' => 'ModelIconExtensions',
            'action' => 'modelIconExtensions'
        ),
        'homePageBanner' => array(
            'controller' => 'HomePageBanner',
            'action' => 'homePageBanner',
            'custom' => array('homePageBannerPublic')
        ),
        'ps_patterns' => array(
            'package' => 'printshop',
            'controller' => 'TypeDescriptionPatterns',
            'action' => 'patterns',
            'custom' => array('patternsPublic')
        ),
        'ps_realizationTimeWorkingHours' => array(
            'package' => 'PrintShop',
            'controller' => 'RealizationTimeWorkingHours',
            'action' => 'index',
            'autoload' => true
        ),
        'dp_addresses' => array(
            'package' => 'Addresses',
            'controller' => 'Addresses',
            'action' => 'address',
            'custom' => array(
                'getAddress',
                'updateAddress',
                'getAddresses',
                'addAddress',
                'emptyAddress',
            ),
            'autoload' => true
        ),
        'dp_countries' => array(
            'package' => 'config',
            'controller' => 'Countries',
            'action' => 'index'
        ),
        'productCard' => array(
            'controller' => 'ProductCard',
            'action' => 'generateCard',
            'custom' => array('generateXML')
        ),
        'dp_static_contents' => array(
            'package' => 'contents',
            'controller' => 'StaticContents',
            'action' => 'index',
            'autoload' => true,
            'custom' => array('getContent')
        ),
        'dp_coupons' => array(
            'package' => 'coupons',
            'controller' => 'Coupons',
            'action' => 'index',
            'autoload' => true,
            'custom' => array('products', 'count', 'check')
        ),
        'dp_invoices' => array(
            'package' => 'orders',
            'controller' => 'Invoices',
            'action' => 'generate',
            'custom' => array('changeInvoiceType', 'getForUser')
        ),
        'dp_shipment' => array(
            'package' => 'orders',
            'controller' => 'Shipment',
            'action' => 'index',
            'custom' => array('printLabel', 'generateLabels', 'labels')
        ),
        'dp_reclamation_faults' => array(
            'package' => 'Reclamations',
            'controller' => 'ReclamationFaults',
            'action' => 'faults',
            'autoload' => true,
        ),
        'dp_reclamations' => array(
            'package' => 'Reclamations',
            'controller' => 'Reclamations',
            'action' => 'index',
            'autoload' => true,
            'custom' => array(
                'files',
                'findByOrder',
                'myZone',
                'myZoneCount',
                'count',
                'getFiles',
                'canUploadReclamationFiles',
                'canCreateReclamation',
                'createReclamation'
            )
        ),
        'dp_reclamations_statuses' => array(
            'package' => 'Reclamations',
            'controller' => 'ReclamationsStatuses',
            'action' => 'index',
            'autoload' => true,
            'custom' => array('sort', 'forClient')
        ),
        'dp_reclamations_messages' => array(
            'package' => 'Reclamations',
            'controller' => 'ReclamationsMessages',
            'action' => 'index',
            'autoload' => true,
            'custom' => array(
                'myZone',
                'count',
                'countAll',
                'canReadWriteMessages',
                'sendEmail'
            )
        ),
        'dp_news' => array(
            'package' => 'Others',
            'controller' => 'News',
            'action' => 'index',
            'autoload' => true,
            'custom' => array('rss')
        ),
        'dp_orders_messages' => array(
            'package' => 'orders',
            'controller' => 'OrdersMessages',
            'action' => 'index',
            'autoload' => true,
            'custom' => array(
                'myZone',
                'count',
                'countAll',
                'canReadWriteOrderMessages',
                'sendEmail'
            )
        ),
        'dp_mainMetaTags' => array(
            'package' => 'MetaTags',
            'controller' => 'MainMetaTags',
            'action' => 'index',
            'autoload' => true
        ),
        'dp_metaTags' => array(
            'package' => 'MetaTags',
            'controller' => 'MetaTags',
            'action' => 'index',
            'autoload' => true
        ),
        'dp_authorizationLogs' => array(
            'package' => 'Authorization',
            'controller' => 'AuthorizationLogs',
            'action' => 'index',
            'autoload' => true,
            'custom' => array(
                'count',
                'deleteByUser'
            )
        ),
        'dp_customProducts' => array(
            'package' => 'CustomProducts',
            'controller' => 'CustomProducts',
            'action' => 'index',
            'autoload' => true,
            'custom' => array(
                'files',
                'canUploadCustomProductFiles',
                'count',
                'getOne'
            )
        ),
        'dp_calculate' => array(
            'package' => 'PrintShop',
            'controller' => 'Count',
            'action' => 'index',
            'autoload' => true,
            'custom' => array(
                'cartReCalculate',
                'cartRestorePrices'
            )
        ),
        'ps_printTypeWorkspaces' => array(
            'package' => 'PrintShop',
            'controller' => 'PrintShopPrintTypeWorkspaces',
            'action' => 'index',
            'autoload' => true
        ),
        'calculate' => array(
            'package' => 'Calculate',
            'controller' => 'Calculate',
            'action' => 'index',
            'autoload' => true,
            'custom' => array(
                'printOffer'
            )
        ),
        'mainCssFile' => array(
            'package' => 'Contents',
            'controller' => 'Styles',
            'action' => 'mainFile',
            'autoload' => true
        ),
        'templateVariables' => array(
            'package' => 'Contents',
            'controller' => 'TemplateVariables',
            'action' => 'index',
            'autoload' => true,
            'custom'=>array('getTemplates','getSelectors','getForRange', 'getGlobal', 'assoc', 'getVariables')
        )
    );

    public $companyID;
    public $controller;
    public $action;
    public $params = array();
    public $module = false;
    public $parents = array();
    public $package = NULL;
    public $autoload = false;

    /**
     * Routing constructor.
     * @param null $companyID
     */
    public function __construct($companyID = NULL)
    {

        if ($companyID > 0) {
            $this->setCompanyID($companyID);
        } else {
            $this->setCompanyID(35);
        }
        $this->parseUri();
    }

    /**
     * @return bool
     *
     */
    public function getModule()
    {
        return $this->module;
    }

    /**
     * @param $module
     */
    public function setModule($module)
    {
        $this->module = $module;
    }

    /**
     * @return mixed
     */
    public function getCompanyID()
    {
        return $this->companyID;
    }

    /**
     * @return mixed
     */
    public function getController()
    {
        return $this->controller;
    }

    /**
     * @return mixed
     */
    public function getAction()
    {
        return $this->action;
    }

    /**
     * @return array
     */
    public function getParams()
    {
        if (empty($this->params)) {
            return array();
        }
        return $this->params;
    }

    /**
     * @return array
     */
    public function getParents()
    {
        return $this->parents;
    }

    /**
     * @return array
     */
    public function getResources()
    {
        return $this->resources;
    }

    /**
     * @param $companyID
     */
    public function setCompanyID($companyID)
    {
        $this->companyID = $companyID;
    }

    /**
     * @return null
     */
    public function getPackage()
    {
        return $this->package;
    }

    /**
     * @return bool
     */
    public function getAutoload()
    {
        return $this->autoload;
    }

    /**
     * @param null $uri
     * @return bool
     */
    public function parseUri($uri = NULL)
    {
        if ($uri === NULL) {

            $exp = explode('?', $_SERVER['REQUEST_URI']);
            if (isset($exp[1]) && !empty($exp[1])) {
                $ap = explode('&', $exp[1]);
                $addedParams = array();
                foreach ($ap as $key => $val) {
                    $expAp = explode("=", $val);
                    $addedParams[$expAp[0]] = $expAp[1];
                }
            } else {
                $addedParams = array();
            }
            $uri = explode('/', $exp[0]);
            unset($exp);

            array_shift($uri);
            if( strlen(REQUEST_URI_PREFIX) > 0 && $uri[0] == REQUEST_URI_PREFIX ) {
                array_shift($uri);
            }
        }

        switch ($_SERVER['REQUEST_METHOD']) {
            case "POST":
                $prefix = 'post_';
                break;
            case "DELETE":
                $prefix = 'delete_';
                break;
            case "PUT":
                $prefix = 'put_';
                break;
            default:
                $prefix = '';
                break;
        }

        if ($this->getHeader('x-http-method-override') == 'put') {
            $prefix = 'put_';
        } elseif ($this->getHeader('x-http-method-override') == 'patch') {
            $prefix = 'patch_';
        }


        $this->companyID = $this->getCompanyID();

        foreach ($uri as $key => $r) {

            if ($key % 2 == 0) {
                if (isset($this->resources[$r]['childs'])) {
                    $childs = $this->resources[$r]['childs'];
                } else {
                    $childs = array();
                }

                if (isset($this->resources[$r]['custom'])) {
                    $customs = $this->resources[$r]['custom'];
                } else {
                    $customs = array();
                }

                if (isset($uri[$key + 2]) && in_array($uri[$key + 2], $childs)) {
                    $this->params[] = $uri[$key + 1];
                    $uri = array_splice($uri, 2, count($uri));

                    if (!empty($addedParams)) {
                        $this->params[] = $addedParams;
                    }

                    return $this->parseUri($uri);
                } elseif (isset($uri[$key + 1]) && in_array($uri[$key + 1], $customs)) {

                    $this->controller = ucfirst($this->resources[$r]['controller']) . 'Controller';
                    $customKey = array_search($uri[$key + 1], $customs);
                    $this->action = $prefix . $this->resources[$r]['custom'][$customKey];
                    if (isset($uri[$key + 2])) {
                        $this->params[] = $uri[$key + 2];
                    }
                    if (!empty($addedParams)) {
                        $this->params[] = $addedParams;
                    }
                    if (isset($this->resources[$r]['package'])) {
                        $this->package = $this->resources[$r]['package'];
                    } else {
                        $this->package = NULL;
                    }

                    if (isset($this->resources[$r]['autoload'])) {
                        $this->autoload = true;
                    } else {
                        $this->autoload = false;
                    }
                    return true;
                } else {
                    if( array_key_exists($r, $this->resources) ) {
                        $this->controller = ucfirst($this->resources[$r]['controller']) . 'Controller';
                        $this->action = $prefix . $this->resources[$r]['action'];
                    }
                    if (isset($this->resources[$r]['module']) &&
                        $this->resources[$r]['module'] == true && isset($uri[$key + 1])
                    ) {
                        $this->setModule($uri[$key + 1]);
                        if (isset($uri[$key + 2])) {
                            $this->params[] = $uri[$key + 2];
                        }
                    } elseif (isset($uri[$key + 1])) {
                        $this->params[] = $uri[$key + 1];
                    }
                    if (!empty($addedParams)) {
                        $this->params[] = $addedParams;
                    }
                    if (isset($this->resources[$r]['package'])) {
                        $this->package = $this->resources[$r]['package'];
                    } else {
                        $this->package = NULL;
                    }

                    if (isset($this->resources[$r]['autoload'])) {
                        $this->autoload = true;
                    } else {
                        $this->autoload = false;
                    }
                    return true;
                }
            }
        }
        return false;

        $resource = NULL;
        if (is_numeric(end($uri))) {
            $resource = prev($uri);
        } else {
            $resource = end($uri);
        }

        if (isset($this->resources[$resource]['recursive']) && $this->resources[$resource]['recursive'] === true) {

            $this->controller = ucfirst($this->resources[$resource]['controller']) . 'Controller';
            $this->action = $prefix . $this->resources[$resource]['action'];

            array_shift($uri);
            foreach ($uri as $key => $u) {
                if ($key % 2 == 1) {
                    $this->params[] = $u;
                }
            }
            return true;

        } elseif (key_exists($uri[1], $this->resources)) {
            $resourceIndex = 1;
            $paramIndex = 2;
            $childIndex = 3;
            $childParmIndex = 4;
            $customIndex = 2;
            $customParam = 3;
            if (isset($this->resources[$uri[$resourceIndex]]['module']) &&
                $this->resources[$uri[$resourceIndex]]['module'] == true
            ) {
                $this->setModule($uri[2]);
                $paramIndex = 3;
            }

            if (isset($this->resources[$uri[$resourceIndex]]['childs']) &&
                isset($uri[$childIndex]) &&
                strlen($uri[$childIndex]) > 0 &&
                in_array($uri[$childIndex], $this->resources[$uri[$resourceIndex]]['childs'])
            ) {
                $child = $uri[$childIndex];
                $this->parents[] = $uri[1];
                $this->controller = ucfirst($this->resources[$uri[$resourceIndex]]['controller']) . 'Controller';
                $this->action = $prefix . $child;
                $this->params[] = $uri[$paramIndex];
                if (isset($uri[$childParmIndex])) {
                    $this->params[] = $uri[$childParmIndex];
                }
            } elseif (
                isset($this->resources[$uri[$resourceIndex]]['custom']) &&
                isset($uri[$customIndex]) &&
                strlen($uri[$customIndex]) > 0 &&
                in_array($uri[$customIndex], $this->resources[$uri[$resourceIndex]]['custom'])
            ) {
                $actionKey = array_search($uri[$customIndex], $this->resources[$uri[$resourceIndex]]['custom']);
                $this->parents[] = $uri[1];
                $this->controller = ucfirst($this->resources[$uri[$resourceIndex]]['controller']) . 'Controller';
                $this->action = $prefix . $this->resources[$uri[$resourceIndex]]['custom'][$actionKey];
                if (isset($uri[$customParam])) {
                    $this->params[] = $uri[$customParam];
                }

            } else {

                $this->controller = ucfirst($this->resources[$uri[$resourceIndex]]['controller']) . 'Controller';
                $this->action = $prefix . $this->resources[$uri[$resourceIndex]]['action'];
                //$pUri = array_slice ($uri, $paramIndex);
                if (isset($uri[$paramIndex]) && strlen($uri[$paramIndex]) > 0) {
                    $this->params[] = $uri[$paramIndex];
                }

            }
            return true;
        }

        $skipAction = false;
        $ctrlIndex = 1;
        if (isset($uri[$ctrlIndex]) && !empty($uri[$ctrlIndex])) {
            $ctrl = ucfirst($uri[$ctrlIndex]);
        } else {
            $ctrl = 'Index';
        }
        $actionIndex = 2;
        if (isset($uri[$actionIndex]) && !empty($uri[$actionIndex])) {
            $action = $uri[$actionIndex];
        } else {
            $skipAction = true;
            $action = 'index';
        }

        $this->controller = $ctrl . 'Controller';
        if ($skipAction) {
            $pUri = array_slice($uri, 3);
        } else {
            $pUri = array_slice($uri, 4);
        }
        $this->params = $this->prepareParams($pUri);
        $this->action = $prefix . $action;

        return true;
    }

    /**
     * @param $parameters
     * @param bool $resource
     * @return array
     */
    public function prepareParams($parameters, $resource = false)
    {

        if (empty($parameters) || !is_array($parameters)) {
            return array();
        }

        if ($resource) {

            foreach ($parameters as $key => $val) {
                if ($key == 0) {
                    $param[] = $val;
                } else {
                    if ($key % 2 == 0) {
                        $param[] = $val;
                    } else {
                        $currentResource = $val;
                        $paramKeys = array_keys($parameters);
                        if (end($paramKeys) == $key) {
                            $param[] = array('resource' => $currentResource);
                        }
                    }
                }
            }
            return $param;
        }

        foreach ($parameters as $key => $val) {
            if ($key % 2 == 0) {
                $params[$val] = NULL;
                $prev = $val;
            } else {
                $params[$prev] = $val;
            }
        }

        return $params;
    }

    /**
     * @param $name
     * @return bool
     */
    public function getHeader($name)
    {
        $headers = apache_request_headers();
        foreach ($headers as $header => $value) {
            if (strtolower($header) == $name && strlen($value) > 0) {
                return $value;
            }
        }
        return false;
    }

}
