'use strict';

angular.module('digitalprint.services')
    .service('PsGroupDescriptionService', function ($q, $http, $config, Restangular, $cacheFactory) {

        var PsGroupDescriptionService = {};

        PsGroupDescriptionService.getAll = function (groupUrl) {
            var def = $q.defer();
            $http({
                method: 'GET',
                url: $config.API_URL + 'ps_groupDescriptions/groupDescriptionsPublic?groupUrl=' + groupUrl
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return PsGroupDescriptionService;

    });