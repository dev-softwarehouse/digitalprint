angular.module('dpClient.app')
    .controller('index.RegisterCtrl', function ($scope, $rootScope, $state, $filter, UserService,
                                                AuthService, Notification, CountriesService, RegisterWidget,
                                                LoginWidgetService, SocialWidgetService, SettingService,
                                                $cookieStore, vcRecaptchaService) {

        $scope.form = {};
        $scope.countries = [];
        $scope.onlyForCompanies = false;
        $scope._ = _;

        $scope.response = null;
        $scope.widgetId = null;

        $scope.setResponse = function (response) {
            console.info('Response available');
            $scope.response = response;
        };
        $scope.setWidgetId = function (widgetId) {
            console.info('Created widget ID: %s', widgetId);
            $scope.widgetId = widgetId;
        };
        $scope.cbExpiration = function () {
            console.info('Captcha expired. Resetting response object');
            vcRecaptchaService.reload($scope.widgetId);
            $scope.response = null;
        };

        var Setting = new SettingService('additionalSettings');

        function init() {

            var currentLangCode;
            if( $rootScope.currentLang ) {
                currentLangCode = $rootScope.currentLang.code;
            } else if( $cookieStore.get('lang') ) {
                currentLangCode = $cookieStore.get('lang');
            } else {
                currentLangCode = $rootScope.defaultLangCode;
            }

            CountriesService.getAll().then(function (dataCountries) {
                _.each(dataCountries, function(one) {

                    if( currentLangCode ) {
                        if( one['name_' + currentLangCode] !== undefined ) {
                            if( currentLangCode.toUpperCase() === one.code ) {
                                $scope.form.ad_countryCode = one.code;
                                $scope.form.del_countryCode = one.code;
                                $scope.form.fv_countryCode = one.code;

                                $scope.form.ad_areaCode = one.areaCode;
                                $scope.form.del_areaCode = one.areaCode;
                            }
                            $scope.countries.push(one);
                        }
                    } else {
                        $scope.countries.push(one);
                    }

                });
            });

            Setting.getPublicSettings().then(function(settingData) {
                if( settingData.onlyForCompanies ) {
                    $scope.onlyForCompanies = settingData.onlyForCompanies.value;
                }
                if (settingData.captchaPublicKey) {
                    $scope.model = {
                        key: settingData.captchaPublicKey.value
                    };
                }
            });
        }

        init();

        $scope.$watch('countries', function (countries) {

            if( _.isEmpty(countries) ) {
                return;
            }

            RegisterWidget.initCodeRegister($scope, countries);

        });

        $scope.selectCountry = function( prefix ) {
            RegisterWidget.selectCountryRegister($scope, prefix);
        };

        $scope.addUser = function () {

            $scope.form.captchaResponse = $scope.response;

            if ($scope.form.terms !== true || $scope.form.data_protection !== true) {
                Notification.error($filter('translate')('accept_terms'));
            } else {
                UserService.userRegister($scope.form).then(function (data) {
                    Notification.success($filter('translate')('user_has_been_added'));
                    var credentials = {};
                    credentials.password = $scope.form.pass;
                    credentials.email = $scope.form.user;

                    LoginWidgetService.login(credentials);

                }, function (data) {
                    if( data.info ) {
                        Notification.error($filter('translate')(data.info));
                    } else {
                        Notification.error($filter('translate')('unexpected_error'));
                    }
                });
            }

        };

        $scope.loginFacebook = function () {

            SocialWidgetService.loginFacebook();

        };

        $scope.loginGoogle = function () {

            SocialWidgetService.loginGoogle();

        };

        $scope.login = function (credentials) {
            var backTo = {};
            if( $rootScope.startPoint ) {
                backTo.state = $rootScope.startPoint.state;
                backTo.params = $rootScope.startPoint.params;
            }
            LoginWidgetService.login(credentials, backTo);
        };

        $scope.copyFromUserForm = function() {
            $scope.form.fv_street = $scope.form.ad_street;
            $scope.form.fv_house = $scope.form.ad_house;
            $scope.form.fv_apartment = $scope.form.ad_apartment;
            $scope.form.fv_zipcode = $scope.form.ad_zipcode;
            $scope.form.fv_city = $scope.form.ad_city;
            $scope.form.fv_countryCode = $scope.form.ad_countryCode;
            $scope.form.fv_areaCode = $scope.form.ad_areaCode;
            $scope.form.fv_telephone = $scope.form.ad_telephone;
        };

        $scope.copyFromDeliveryForm = function() {
            $scope.form.fv_companyName = $scope.form.del_companyName;
            $scope.form.fv_street = $scope.form.del_street;
            $scope.form.fv_house = $scope.form.del_house;
            $scope.form.fv_apartment = $scope.form.del_apartment;
            $scope.form.fv_zipcode = $scope.form.del_zipcode;
            $scope.form.fv_city = $scope.form.del_city;
            $scope.form.fv_countryCode = $scope.form.del_countryCode;
            $scope.form.fv_areaCode = $scope.form.del_areaCode;
            $scope.form.fv_telephone = $scope.form.del_telephone;
        };

    });
