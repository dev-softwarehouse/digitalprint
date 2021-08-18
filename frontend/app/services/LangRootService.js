angular.module('digitalprint.services')
    .service('LangRootService', function ($q, $http, $config) {

        var LangRootService = {};

        var resource = 'langroot';

        LangRootService.getAll = function () {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + resource
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        LangRootService.getEmpty = function () {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'showEmpty'].join("/")
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        LangRootService.create = function (lang) {
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + resource,
                data: lang
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        LangRootService.update = function (lang) {
            var def = $q.defer();

            $http({
                method: 'PUT',
                url: $config.API_URL + resource,
                data: lang
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

        LangRootService.remove = function (id) {
            var def = $q.defer();

            $http({
                method: 'DELETE',
                url: $config.API_URL + [resource, id].join("/")
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

        return LangRootService;
    });
