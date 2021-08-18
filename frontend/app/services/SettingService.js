angular.module('digitalprint.services')
    .service('SettingService', function ($rootScope, $q, $config, $http, localStorageService, $cacheFactory) {

        var resource;

        var SettingService = function (module) {
            this.module = module;
            resource = ['settings', this.module].join('/');
        };

        SettingService.prototype.setModule = function(module) {
            this.module = module;
        };

        SettingService.prototype.getPublicSettings = function () {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + ['settings', 'getPublicSettings', this.module].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        SettingService.prototype.getSkinName = function () {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + ['settings', 'getSkinName'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        SettingService.prototype.sendMessage = function(key, data) {
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + ['settings', 'sendMessage', key].join('/'),
                data: data
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        SettingService.prototype.signToNewsletter = function(email) {
            var def = $q.defer();

            var data = {email: email};

            $http({
                method: 'POST',
                url: $config.API_URL + ['settings', 'newsletter'].join('/'),
                data: data
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        SettingService.prototype.confirmNewsletter = function(token) {
            var def = $q.defer();

            var data = {token: token};

            $http({
                method: 'POST',
                url: $config.API_URL + ['settings', 'confirmNewsletter'].join('/'),
                data: data
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        SettingService.prototype.getDateByWorkingDays = function() {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + ['settings', 'getDateByWorkingDays'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return SettingService;
    });
