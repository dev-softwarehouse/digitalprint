angular.module('digitalprint.services')
    .factory('CurrencyService', function ($rootScope, $q, $http, $config, $cacheFactory) {

        var CurrencyService = {};

        var resource = 'currency';

        var cache = $cacheFactory(resource);

        var getAllDef = null;

        CurrencyService.getAll = function (force) {
            if (_.isNull(getAllDef) || force || getAllDef.promise.$$state.status === 1) {
                getAllDef = $q.defer();
            } else {
                return getAllDef.promise;
            }

            if (cache.get('collection') && !force) {
                getAllDef.resolve(cache.get('collection'));
            } else {
                $http({
                    method: 'GET',
                    url: $config.API_URL + resource
                }).success(function (data) {
                    cache.put('collection', data);
                    $rootScope.$emit('Currency.getAll', data);
                    getAllDef.resolve(data);
                }).error(function (data) {
                    getAllDef.reject(data);
                });
            }

            return getAllDef.promise;
        };

        CurrencyService.create = function (lang) {
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + resource,
                data: lang
            }).success(function (data) {
                if (data.ID) {
                    cache.remove('collection');
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        CurrencyService.update = function (lang) {
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

        CurrencyService.remove = function (id) {
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

        return CurrencyService;
    });
