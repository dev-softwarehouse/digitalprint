'use strict';

angular.module('digitalprint.services')
    .factory('CacheService', function ($q, $http, $cacheFactory, $config) {

        var CacheService = function (collection) {
            this.collection = collection;
            this.cache = new $cacheFactory(collection);
        };

        CacheService.prototype.doRequest = function (defer, options, method) {
            var def = $q.defer();
            var _this = this;

            var url = (_.isString(defer)) ? defer : defer.getRestangularUrl();
            var cache = this.cache.get(url);

            options = options || {};

            var onSuccess = function (url, data) {
                _this.cache.put(url, data);
                def.resolve(data);
            };

            var onError = function (data) {
                def.reject(data);
            };

            if (options.cache == false || !!!cache) {

                if (_.isString(defer)) {

                    $http({
                        method: 'GET',
                        url: $config.API_URL + defer
                    }).success(function (data) {
                        onSuccess(defer, data);
                    }).error(onError);

                } else {
                    defer[method || 'getList']().then(function (data) {
                        onSuccess(url, data)
                    }, onError);
                }

            } else {
                def.resolve(cache);
            }

            return def.promise;
        };

        CacheService.prototype.getList = function (restangularPromise, options) {
            return this.doRequest(restangularPromise, options, 'getList');
        };

        CacheService.prototype.get = function (restangularPromise, options) {
            return this.doRequest(restangularPromise, options, 'get');
        };

        CacheService.prototype.removeAll = function () {
            this.cache.removeAll();
        };

        return CacheService;
    });