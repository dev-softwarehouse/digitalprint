angular.module('dpClient.config', []);
angular.module('dpClient.routes', ['ui.router', 'restangular']);
angular.module('dpClient.directives', []);
angular.module('digitalprint.services', ['LocalStorageModule']);
angular.module('dpClient.helpers', ['ui-notification']);
angular.module('dpClient.filters', []);

var $stateProviderRef = null;
var $urlRouterProviderRef = null;
var defaultLangCode = 'pl';
var $configProviderRef = null;

angular.module('dpClient.app', [
    'LocalStorageModule',
    'ui.bootstrap',
    'pascalprecht.translate',
    'ngCookies',
    'ngAnimate',
    'angular-api-collection',
    'ui.sortable',
    'ncy-angular-breadcrumb',
    'ngSanitize',
    'textAngular',
    'btford.socket-io',
    'angularFileUpload',
    'jkuri.gallery',
    'angular-carousel',
    'dpClient.routes',
    'dpClient.directives',
    'digitalprint.services',
    'dpClient.helpers',
    'dpClient.filters',
    'dpClient.config',
    'bw.paging',
    'wt.responsive',
    'ngScrollbars',
    'rzModule',
    'vcRecaptcha',
    'updateMeta'
])
    .config(function ($configProvider, $locationProvider, $urlRouterProvider, $stateProvider, RestangularProvider,
                      localStorageServiceProvider, ApiCollectionProvider, $breadcrumbProvider, $httpProvider) {

        $urlRouterProviderRef = $urlRouterProvider;
        $stateProviderRef = $stateProvider;
        $locationProvider.html5Mode(true);
        $urlRouterProvider.deferIntercept();

        var mainURL = 'REPLACE_API_URL';
        var mainURLTest = 'REPLACE-API-URL';

        if (mainURL === mainURLTest.replace(/\-/g, '_')) {
            $configProvider.set('API_URL', 'http://localtest.me/api/');
            RestangularProvider.setBaseUrl('http://localtest.me/api/');
        } else {
            $configProvider.set('API_URL', mainURL);
            RestangularProvider.setBaseUrl(mainURL);
        }

        var authUrl = 'REPLACE_AUTH_URL';
        var authUrlTest = 'REPLACE-AUTH-URL';

        if (authUrl === authUrlTest.replace(/\-/g, '_')) {
            $configProvider.set('AUTH_URL', 'http://localtest.me:2600/');
        } else {
            $configProvider.set('AUTH_URL', authUrl);
        }

        var staticUrl = 'REPLACE_STATIC_URL';
        var staticUrlTest = 'REPLACE-STATIC-URL';
        var staticUrlTmp = '';

        if (staticUrl === staticUrlTest.replace(/\-/g, '_')) {
            $configProvider.set('STATIC_URL', 'http://localtest.me/static/');
            staticUrlTmp = 'http://localtest.me/static/';
        } else {
            $configProvider.set('STATIC_URL', staticUrl);
            staticUrlTmp = staticUrl;
        }

        var socketUrl = 'REPLACE_SOCKET_URL';
        var socketUrlTest = 'REPLACE-SOCKET-URL';

        if (socketUrl === socketUrlTest.replace(/\-/g, '_')) {
            $configProvider.set('SOCKET_URL', 'http://localtest.me:2600');
        } else {
            $configProvider.set('SOCKET_URL', socketUrl);
        }

        $configProvider.set('ACCESS_TOKEN_NAME', 'access-token');

        RestangularProvider.setMethodOverriders(['put', 'patch']);

        localStorageServiceProvider.setPrefix('digitalprint');

        $breadcrumbProvider.setOptions({
            includeAbstract: false,
            template: '<ol class="breadcrumb">\n' +
                '    <li ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="$last || !!step.abstract">\n' +
                '        <a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}">\n' +
                '            <span ng-if="!($root.customBreadcrumbs[step.name] && $root.customBreadcrumbs[step.name] !== step.name)">\n' +
                '                {{step.ncyBreadcrumbLabel}}\n' +
                '            </span>\n' +
                '            <span ng-if="$root.customBreadcrumbs[step.name] && $root.customBreadcrumbs[step.name] !== step.name">\n' +
                '                {{ $root.customBreadcrumbs[step.name] }}\n' +
                '            </span>\n' +
                '        </a>\n' +
                '        <span ng-switch-when="true">\n' +
                '            <span ng-if="!($root.customBreadcrumbs[step.name] && $root.customBreadcrumbs[step.name] !== step.name)">\n' +
                '                {{step.ncyBreadcrumbLabel}}\n' +
                '            </span>\n' +
                '            <span ng-if="$root.customBreadcrumbs[step.name] && $root.customBreadcrumbs[step.name] !== step.name">\n' +
                '                {{ $root.customBreadcrumbs[step.name] }}\n' +
                '            </span>\n' +
                '        </span>\n' +
                '    </li>\n' +
                '</ol>'
        });

        $httpProvider.interceptors.push('authInterceptor');
        $httpProvider.interceptors.push('httpMethodOverride');
        $httpProvider.interceptors.push('loadingInterceptor');
        $httpProvider.interceptors.push('catchMailErrorInterceptor');
        $httpProvider.interceptors.push('responseErrorInterceptor');

        var blankPage = {
            abstract: false,
            templateUrl: staticUrlTmp + 'templates/default/120/404.html',
            name: 'blankPage',
            url: '/404'
        };
        $stateProvider.state(blankPage);

        if (window.location.pathname !== '/') {
            $urlRouterProvider.otherwise('/404');
        } else {
            $urlRouterProvider.otherwise('/pl');
        }

    })
    .run(function ($q, $rootScope, $config, $state, $cookieStore, routes, getDomains, $location, Notification,
                   $filter, $timeout, $urlRouter, $stateParams, metaTags, AuthDataService, $window, translateRouting) {

        $rootScope.$state = $state;
        $rootScope.customBreadcrumbs = {};

        var routesContainer = JSON.parse(globalRoutes);
        var defaultLang = $cookieStore.get('lang') ? $cookieStore.get('lang') : defaultLangCode;

        if( routesContainer ) {
            $rootScope.routes = routesContainer[defaultLang];
        }else{
            console.error('Problem with routes 2')
        }

        $configProviderRef = $config;

        getDomains.request().then(function (data) {

            _.each(data, function (oneDomain) {
                if (angular.isDefined(oneDomain.selected) && oneDomain.selected === 1) {
                    $rootScope.domainID = oneDomain.ID;
                    $rootScope.companyID = oneDomain.companyID;
                    $rootScope.STATIC_URL = $config.STATIC_URL;
                    $rootScope.domainHost = oneDomain.host;
                    $rootScope.domainName = oneDomain.name;
                    $rootScope.editorPort = oneDomain.port;
                    $rootScope.skinName = oneDomain.skinName;
                    $rootScope.webMasterVerifyTag = oneDomain.webMasterVerifyTag;
                    $rootScope.domainWithSsl = oneDomain.ssl;
                    if (oneDomain.ssl === 1) {
                        $rootScope.editorHost = 'https://edytor.' + oneDomain.host;
                    } else {
                        $rootScope.editorHost = 'http://edytor.' + oneDomain.host;
                    }
                    $rootScope.myZoneStartPoint = oneDomain.myZoneStartPoint;
                    $rootScope.currencies = [];
                    if (oneDomain.currencies.length > 0) {
                        _.each(oneDomain.currencies, function (oneCurrency) {
                            if (oneCurrency.active === 1) {
                                $rootScope.currencies.push(oneCurrency);
                            }
                        });
                    }
                    _.each($rootScope.currencies, function (currency) {
                        if (angular.isDefined(currency.selected) && currency.selected === true) {

                            if ($cookieStore.get('currency')) {
                                var idx = _.findIndex($rootScope.currencies, {code: $cookieStore.get('currency')});
                                if (idx > -1) {
                                    $rootScope.currentCurrency = $rootScope.currencies[idx];
                                }
                            } else {
                                $rootScope.currentCurrency = currency;
                                $cookieStore.put('currency', currency.code);
                            }

                        }
                    });

                    if (angular.isDefined(oneDomain.defaultLangCode)) {
                        defaultLangCode = oneDomain.defaultLangCode;
                        $rootScope.defaultLangCode = oneDomain.defaultLangCode;
                    }
                }
            });

            $urlRouter.sync();
            $urlRouter.listen();

            if ( window.location.pathname === '/' || window.location.pathname === '/' + defaultLangCode) {
                $state.go("home");
            }

        }, function (data) {
            Notification.error($filter('translate')('error'));
        });

        $rootScope.$on('$stateChangeSuccess',
            function (event, toState, toParams, fromState, fromParams) {

                routes.findOne($state.current.name).then(function (oneRoute) {

                    if( $rootScope.urlParams === undefined ) {
                        $rootScope.urlParams = {};
                    }

                    if( !$rootScope.currentLang ) {
                        return;
                    }

                    if( !oneRoute ) {
                        return;
                    }

                    if (oneRoute.name === 'group') {

                        metaTags.getByGroup($stateParams.groupurl, $stateParams.categoryurl).then(function (metaForGroup) {
                            if (metaForGroup.response) {
                                if( metaForGroup.metaTags[$rootScope.currentLang.code] !== undefined ) {
                                    document.title = metaForGroup.metaTags[$rootScope.currentLang.code].title;
                                    addMeta(
                                        metaForGroup.metaTags[$rootScope.currentLang.code].description,
                                        metaForGroup.metaTags[$rootScope.currentLang.code].keywords
                                    );
                                }
                            } else {
                                if( oneRoute.metaTags ) {
                                    document.title = oneRoute.metaTags.languages[$rootScope.currentLang.code].title;
                                    addMeta(
                                        oneRoute.metaTags.languages[$rootScope.currentLang.code].description,
                                        oneRoute.metaTags.languages[$rootScope.currentLang.code].keywords
                                    );
                                } else {
                                    addHomeMeta();
                                }
                            }
                            if( metaForGroup.urlParams ) {
                                $rootScope.urlParams.group = metaForGroup.urlParams.group;
                                $rootScope.urlParams.category = metaForGroup.urlParams.category;
                            }
                        });
                    } else if (oneRoute.name === 'calculate') {
                        metaTags.getByType($stateParams.typeurl, $stateParams.categoryurl).then(function (metaForType) {

                            if (metaForType.response) {

                                if( metaForType.metaTags[$rootScope.currentLang.code] !== undefined ) {
                                    document.title = metaForType.metaTags[$rootScope.currentLang.code].title;
                                    addMeta(
                                        metaForType.metaTags[$rootScope.currentLang.code].description,
                                        metaForType.metaTags[$rootScope.currentLang.code].keywords
                                    );
                                }
                            } else {
                                if( oneRoute.metaTags ) {
                                    document.title = oneRoute.metaTags.languages[$rootScope.currentLang.code].title;
                                    addMeta(
                                        oneRoute.metaTags.languages[$rootScope.currentLang.code].description,
                                        oneRoute.metaTags.languages[$rootScope.currentLang.code].keywords
                                    );
                                } else {
                                    addHomeMeta();
                                }
                            }
                            if( metaForType.urlParams ) {
                                $rootScope.urlParams.group = metaForType.urlParams.group;
                                $rootScope.urlParams.category = metaForType.urlParams.category;
                                $rootScope.urlParams.type = metaForType.urlParams.type;
                            }
                        });
                    } else if (oneRoute.name === 'category') {

                        metaTags.getByCategory($stateParams.categoryurl).then(function (metaForCategory) {

                            if (metaForCategory.response) {

                                if( metaForCategory.metaTags[$rootScope.currentLang.code] !== undefined ) {
                                    document.title = metaForCategory.metaTags[$rootScope.currentLang.code].title;
                                    addMeta(
                                        metaForCategory.metaTags[$rootScope.currentLang.code].description,
                                        metaForCategory.metaTags[$rootScope.currentLang.code].keywords
                                    );
                                }

                            } else {
                                if( oneRoute.metaTags ) {
                                    document.title = oneRoute.metaTags.languages[$rootScope.currentLang.code].title;
                                    addMeta(
                                        oneRoute.metaTags.languages[$rootScope.currentLang.code].description,
                                        oneRoute.metaTags.languages[$rootScope.currentLang.code].keywords
                                    );
                                } else {
                                    addHomeMeta();
                                }
                            }
                            if( metaForCategory.urlParams ) {
                                $rootScope.urlParams.category = metaForCategory.urlParams.category;
                            }
                        });
                    } else if (oneRoute.metaTags) {
                        document.title = oneRoute.metaTags.languages[$rootScope.currentLang.code].title;
                        addMeta(
                            oneRoute.metaTags.languages[$rootScope.currentLang.code].description,
                            oneRoute.metaTags.languages[$rootScope.currentLang.code].keywords
                        );
                    } else {
                        addHomeMeta();
                    }
                });

                function addMeta( description, keywords ) {

                    var metaList = document.getElementsByTagName("META");
                    for(var i=0;i<metaList.length;i++) {
                        if( metaList[i].name === 'description') {
                            metaList[i].setAttribute('content', description);
                        }
                        if( metaList[i].name === 'keywords') {
                            metaList[i].setAttribute('content', keywords);
                        }
                    }
                }

                function addHomeMeta() {
                    routes.findOne('home').then(function (homeRoute) {
                        if( homeRoute.metaTags !== undefined ) {
                            document.title = homeRoute.metaTags.languages[$rootScope.currentLang.code].title;
                            addMeta(
                                homeRoute.metaTags.languages[$rootScope.currentLang.code].description,
                                homeRoute.metaTags.languages[$rootScope.currentLang.code].keywords
                            );
                        }
                    });
                }

                event.preventDefault();
                $("html, body").animate({
                    scrollTop: 0
                }, 600);
            });

        $rootScope.$on('changeLang', function (e, toLang) {

            translateRouting.request($state.current.name, $stateParams).then( function( data ) {
                window.location = data.urlAddress;
            });

        });

    })
    .factory('httpMethodOverride', function () {
        return {
            'request': function (config) {
                if (config.method === 'PUT' || config.method === 'PATCH') {
                    config.headers['x-http-method-override'] = config.method.toLowerCase();
                    config.method = 'POST';
                }
                return config;
            }

        };
    })
    .factory('getDomains', function ($q, $http, $config) {
        return {
            request: function () {

                var def = $q.defer();

                $http({
                    url: $config.API_URL + ['domains'].join('/'),
                    method: 'GET'
                }).then(function (res) {
                    def.resolve(res.data)
                }, function (err) {
                    deferred.reject(new Error(err));
                });

                return def.promise;
            }
        };
    })
    .factory('translateRouting', function ($q, $rootScope, $http, $config) {
        return {
            request: function (actualState, stateParams) {

                var def = $q.defer();

                $http({
                    url: $config.API_URL + ['routes', 'translateState', actualState].join('/'),
                    method: 'GET',
                    params: stateParams
                }).then(function (res) {
                    def.resolve(res.data)
                }, function (err) {
                    def.reject(new Error(err));
                });

                return def.promise;
            }
        };
    })
    .factory('routes', function ($http, $config, $q, $rootScope, $cookieStore) {
        return {
            getAll: function () {

                var def = $q.defer();

                $http({
                    url: $config.API_URL + ['routes', 'show'].join('/'),
                    method: 'GET'
                }).then(function successCallback(response) {
                    def.resolve(response);
                }, function errorCallback(response) {
                    def.reject(response);
                });
                return def.promise;
            },
            setAll: function () {
                var def = $q.defer();

                var defaultLang = $cookieStore.get('lang') ? $cookieStore.get('lang') : defaultLangCode;

                var actDate = new Date();
                var dateStr = actDate.getHours() + actDate.getMinutes() + actDate.getSeconds();

                var state;

                var counter = 0;
                //this.getAll().then(function (res) {

                    _.each($rootScope.routes, function (value, index) {

                        if (value.abstract == 1) {
                            value.abstract = true;
                        } else {
                            value.abstract = false;
                        }

                        if (value.langs && angular.isDefined(value.langs[defaultLang]) && value.langs[defaultLang].url != null) {

                            state = {
                                "name": value.name,
                                "url": value.langs[defaultLang].url,
                                "parent": value.parent,
                                "abstract": value.abstract,
                                "views": {},
                                "ncyBreadcrumb": {
                                    "label": value.langs[defaultLang].name
                                }
                            };
                        } else {

                            state = {
                                "name": value.name,
                                "parent": value.parent,
                                "abstract": value.abstract,
                                "views": {},
                                "ncyBreadcrumb": {
                                    "skip": true
                                }
                            };

                        }

                        if (angular.isDefined(value.controller) && value.controller != null) {
                            state.controller = value.controller;
                        }

                        if (value.abstract === true && value.name == 'main') {
                            var actTemplate = value.views.pop();

                            state.templateUrl = actTemplate.template.url + '?ver=' + dateStr;

                            delete state.views;

                        } else if (value.route === true) {

                            delete state.views;

                        } else {

                            angular.forEach(value.views, function (view) {

                                if (view.template) {

                                    //$templateCache.get()

                                    console.log( view.template );

                                    state.views[view.name] = {
                                        templateUrl: view.template.url + '?ver=' + dateStr,
                                        controller: view.controller
                                    };
                                }

                            });

                        }

                        $stateProviderRef.state(value.name, state);

                        counter++;
                        if (counter == res.data.length) {
                            def.resolve(true);
                        }

                    });
                //});

                return def.promise;
            },
            findOne: function (name) {
                var def = $q.defer();

                _.each($rootScope.routes, function (each) {
                    if (each.name === name) {
                        def.resolve(each);
                    }
                });

                return def.promise;
            }
        };
    })

    .factory('authInterceptor', function ($q,
                                          $location,
                                          AuthDataService,
                                          TokenService,
                                          $cookieStore,
                                          $cookies,
                                          localStorageService,
                                          $rootScope,
                                          $injector,
                                          $config) {
        return {
            request: function (config) {

                config.headers = config.headers || {};

                config.headers.domainID = $rootScope.domainID;

                var accessTokenName = $config.ACCESS_TOKEN_NAME;

                if ($cookieStore.get('lang') !== undefined && $cookieStore.get('lang').length > 0) {
                    config.headers.lang = $cookieStore.get('lang');
                }

                if (AuthDataService.getAccessToken()) {
                    config.headers[accessTokenName] = AuthDataService.getAccessToken();
                }

                if (!angular.isDefined($rootScope.user)) {
                    $rootScope.user = {};

                    TokenService.check().then(

                        function (data) {

                            if (data.loggedOut == true) {
                                $rootScope.logged = false;
                                AuthDataService.destroyUserData();
                                TokenService.getNonUserToken().then(function (data) {
                                    AuthDataService.setAccessToken(data.token);
                                    config.headers[accessTokenName] = AuthDataService.getAccessToken();
                                });
                            } else if (_.isObject(data.user)) {
                                $rootScope.logged = true;
                                $rootScope.user = data.user;
                                $rootScope.orderID = data.orderID;
                                $rootScope.oneTimeUser = data.user.onetime;
                                $rootScope.carts = data.carts;
                            } else {
                                $rootScope.logged = false;
                            }

                        },
                        // fail
                        function (data) {

                            AuthDataService.checkLogedInOutsideServices();

                            $rootScope.logged = false;

                            if (angular.isDefined(data['noLogin']) && data['noLogin'] == true) {
                                TokenService.getFromCart().then(function (dataCarts) {
                                    $rootScope.carts = dataCarts.carts;
                                    $rootScope.orderID = dataCarts.orderID;
                                });
                                AuthDataService.setAccessToken(data.token);
                            } else {
                                TokenService.getNonUserToken().then(function (data) {
                                    AuthDataService.setAccessToken(data.token);
                                    config.headers[accessTokenName] = AuthDataService.getAccessToken();
                                });
                            }

                        });

                }

                config.headers.sourceApp = 'client';

                return config;
            },
            responseError: function (rejection) {
                if (rejection.status === 403) {
                    var Notification = $injector.get('Notification');
                    var $filter = $injector.get('$filter');
                    Notification.info($filter('translate')('you_are_loggedout'));
                    var $state = $injector.get('$state');
                    var $stateParams = $injector.get('$stateParams');
                    var $rootScope = $injector.get('$rootScope');
                    if( $state.current.name !== 'login' ) {
                        $rootScope.startPoint = {
                            'state': $state.current.name,
                            'params': $stateParams
                        };
                    }

                    $state.go('login');
                }
                return $q.reject(rejection);
            }
        };
    })
    .factory('loadingInterceptor', function ($q, $rootScope, LoadingService) {
        return {
            request: function (config) {
                LoadingService.requested();
                config.requestTimestamp = new Date().getTime();
                $rootScope.$broadcast('loading:progress');
                return config;
            },
            response: function (response) {
                LoadingService.responsed();
                $rootScope.$broadcast('loading:finish');
                return response;
            },
            responseError: function (rejection) {
                LoadingService.responsed();
                $rootScope.$broadcast('loading:finish');
                return $q.reject(rejection);
            }
        }
    })
    .factory('catchMailErrorInterceptor', function () {
        return {
            response: function (response) {
                if (response.data.mailInfo && response.data.mailInfo.error) {
                    console.log('Mail Error: ' + response.data.mailInfo.error);
                }
                return response;
            }
        }
    })
    .factory('responseErrorInterceptor', function ($q, $injector, $timeout) {
        return {
            responseError: function (response) {
                console.log('responseError Status: ' + response.status);

                if (response.status == 0 || response.status == 408 || response.status > 500) {
                    var $http = $injector.get('$http');
                    return $timeout(function () {
                        return $http(response.config);
                    }, 3000, false);
                } else {
                    return $q.reject(response);
                }

            }
        }
    }).factory('readExpiryTimeInterceptor', function ($q) {
    return {
        response: function (response) {
            if (response.headers()['x-http-method-override']) {
                console.log('ok');
            }
        }
    }
}).factory('socket', function (socketFactory, $config) {
    var myIoSocket = io.connect($config.SOCKET_URL, {secure: true});

    var mySocket = socketFactory({
        prefix: '',
        ioSocket: myIoSocket
    });

    mySocket.forward('error');
    return mySocket;
}).factory('metaTags', function ($q, $http, $config) {
    return {
        getByGroup: function (groupUrl, categoryUrl) {
            var def = $q.defer();

            $http({
                url: $config.API_URL + 'dp_metaTags' + '?type=' + 'group' + '&' + 'itemUrl=' + groupUrl + '&categoryUrl=' + categoryUrl,
                method: 'GET'
            }).then(function (res) {
                def.resolve(res.data)
            }, function (err) {
                def.reject(new Error(err));
            });

            return def.promise;
        },
        getByType: function (typeUrl, categoryUrl) {
            var def = $q.defer();

            $http({
                url: $config.API_URL + 'dp_metaTags' + '?type=' + 'type' + '&' + 'itemUrl=' + typeUrl + '&categoryUrl=' + categoryUrl,
                method: 'GET'
            }).then(function (res) {
                def.resolve(res.data)
            }, function (err) {
                def.reject(new Error(err));
            });

            return def.promise;
        },
        getByCategory: function (categoryUrl) {

            var def = $q.defer();

            $http({
                url: $config.API_URL + 'dp_metaTags' + '?type=' + 'category' + '&' + 'itemUrl=' + categoryUrl,
                method: 'GET'
            }).then(function (res) {
                def.resolve(res.data)
            }, function (err) {
                def.reject(new Error(err));
            });

            return def.promise;
        }
    };
});

angular.module('dpClient.helpers').directive('myScroll', function () {
    return {
        restrict: "A",
        link: function (scope, element) {
            $(element).on('click', function () {

                $('html, body').animate({
                    scrollTop: 0
                });
                return false;
            });
        }
    };
});

angular.module('dpClient.helpers').directive('initBind', function ($compile) {
    return {
        restrict: 'A',
        link : function (scope, element, attr) {
            attr.$observe('ngBindHtml',function(){
                if(attr.ngBindHtml){
                    $compile(element[0].children)(scope);
                }
            })
        }
    };
});

$(window).scroll(function () {
    if ($(this).scrollTop() > 200) {
        $('i#scrollTop').fadeIn();
    } else {
        $('i#scrollTop').fadeOut();
    }

});
