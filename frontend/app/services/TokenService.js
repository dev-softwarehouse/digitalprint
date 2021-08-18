angular.module('digitalprint.services')
    .factory('TokenService', function ($rootScope, $q, $config, $injector) {
        var TokenService = {};

        TokenService.check = function () {
            var _this = this;
            var def = $q.defer();

            var $http = $injector.get("$http");

            $http({
                method: 'GET',
                url: $config.API_URL + ['auth', 'check'].join('/')
            }).success(function (data) {
                if (data.response) {
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        TokenService.getNonUserToken = function () {
            var _this = this;
            var def = $q.defer();

            var $http = $injector.get("$http");

            $http({
                method: 'POST',
                url: $config.AUTH_URL + 'getNonUserToken',
                params: {
                    domainName: location.hostname
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        TokenService.getFromCart = function () {
            var _this = this;
            var def = $q.defer();

            var $http = $injector.get("$http");

            $http({
                method: 'GET',
                url: $config.AUTH_URL + 'cart/get',
                params: {
                    domainName: location.hostname
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        TokenService.joinAddresses = function (params) {
            var def = $q.defer();

            var $http = $injector.get("$http");

            $http({
                method: 'POST',
                url: $config.AUTH_URL + 'cart/joinAddresses',
                params: {
                    domainName: location.hostname
                },
                data: $.param(params),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return TokenService;
    });