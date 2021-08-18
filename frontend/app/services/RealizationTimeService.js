angular.module('digitalprint.services')
    .service('RealizationTimeService', function ($q, $http, $config, Restangular, $cacheFactory) {

        var cache = $cacheFactory('ps_realizationTimes');

        var RealizationTimeService = {};

        RealizationTimeService.getAll = function (force) {
            var def = $q.defer();

            if (cache.get('collection') && !force) {
                def.resolve(cache.get('collection'));
            } else {
                Restangular.all('ps_realizationTimes').getList().then(function (data) {
                    if (data) {
                        cache.put('collection', data.plain());
                        def.resolve(data.plain());
                    } else {
                        def.reject(data);
                    }
                }, function (data) {
                    def.reject(data);
                });
            }

            return def.promise;
        };

        RealizationTimeService.edit = function (item) {
            var def = $q.defer();

            Restangular.all('ps_realizationTimes').customPUT(item).then(function (data) {
                if (data.response) {
                    cache.remove('collection');
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;

        };

        RealizationTimeService.add = function (item) {
            var def = $q.defer();

            Restangular.all('ps_realizationTimes').doPOST(item).then(function (data) {
                if (data.ID) {
                    cache.remove('collection');
                    def.resolve(data.plain());
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        RealizationTimeService.sort = function (sort) {
            var def = $q.defer();

            $http({
                method: 'PATCH',
                url: $config.API_URL + ['ps_realizationTimes', 'sort'].join('/'),
                data: sort
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

        RealizationTimeService.remove = function (item) {
            var def = $q.defer();

            Restangular.all('ps_realizationTimes').one(item.ID + '').remove().then(function (data) {
                if (data.response) {
                    cache.remove('collection');
                    def.resolve(data.plain());
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return RealizationTimeService;

    });