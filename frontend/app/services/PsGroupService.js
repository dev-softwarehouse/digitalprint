'use strict';

angular.module('digitalprint.services')
    .service('PsGroupService', function ($q, $http, $config, Restangular, CacheService) {

        // var cache = $cacheFactory('ps_groups');

        var GroupService = {};

        var cacheResolve = new CacheService('ps_groups');

        GroupService.getAll = function (params, options) {
            var def = $q.defer();
            options = options || {};

            var restangularPromise = Restangular.all('ps_groups', params);

            cacheResolve.getList(restangularPromise, options).then(function (data) {
                def.resolve(data);
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        GroupService.get = function (id) {
            var def = $q.defer();
            $http({
                method: 'GET',
                url: $config.API_URL + 'ps_groups/' + id
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        GroupService.getOneForView = function (url) {
            var def = $q.defer();
            $http({
                method: 'GET',
                url: $config.API_URL + 'ps_groups/getOneForView/' + url
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        GroupService.add = function (item) {
            var def = $q.defer();

            Restangular.all('ps_groups').doPOST(item).then(function (data) {
                if (data.ID) {
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        GroupService.edit = function (item) {
            var def = $q.defer();

            Restangular.all('ps_groups').customPUT(item).then(function (data) {
                if (data.response) {
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        GroupService.remove = function (item) {
            var def = $q.defer();

            Restangular.all('ps_groups').one(item.ID + '').remove().then(function (data) {
                if (data.response) {
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        GroupService.getRealizationTimes = function (groupID, force) {
            var def = $q.defer();

            var resource = 'ps_groups/' + groupID + '/ps_rt_details';

            Restangular.all(resource).getList().then(function (data) {
                if (data) {
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        GroupService.setRealizationTime = function (groupID, item) {
            var def = $q.defer();

            var resource = 'ps_groups/' + groupID + '/ps_rt_details';

            Restangular.all(resource).patch(item).then(function (data) {
                if (data.response) {
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        GroupService.removeRealizationTime = function (groupID, item) {
            var def = $q.defer();

            if (!item.details) {
                def.reject();
            }

            var resource = 'ps_groups/' + groupID + '/ps_rt_details';

            Restangular.all(resource).one(item.details.ID + '').remove().then(function (data) {
                if (data.response) {
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        GroupService.getOneByID = function (ID) {
            var def = $q.defer();
            $http({
                method: 'GET',
                url: $config.API_URL + 'ps_groups/getOneByID/' + ID
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return GroupService;
    });
