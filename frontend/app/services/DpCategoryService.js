angular.module('digitalprint.services')
    .service('DpCategoryService', function ($q, Restangular, $http, $config) {

        var DpCategoryService = {};

        var resource = 'dp_categories';

        DpCategoryService.getContains = function (categoryUrl) {

            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'getContains', categoryUrl].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
                console.log(data);
            });

            return def.promise;
        };

        DpCategoryService.forView = function () {

            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'forViewPublic', 1].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpCategoryService.getOneForView = function (categoryUrl) {

            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'oneForView', categoryUrl].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpCategoryService.manyForView = function (categories) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'manyForView', categories.join(',')].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
                console.log(data);
            });

            return def.promise;
        };

        DpCategoryService.getCategoryTree = function () {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'getCategoryTree'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
                console.log(data);
            });

            return def.promise;
        };

        DpCategoryService.getChilds = function (categoryUrl) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'getChilds', categoryUrl].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
                console.log(data);
            });

            return def.promise;
        };

        DpCategoryService.getGroups = function (categoryUrl) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'getGroups'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpCategoryService.getFirstByType = function (typeID) {

            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'getFirstByType', typeID].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return DpCategoryService;

    });
