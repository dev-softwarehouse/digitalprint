'use strict';

angular.module('digitalprint.services')
    .service('CategoryDescriptionService', function ($q, $http, $config, Restangular, $cacheFactory) {

        var CategoryDescriptionService = {};

        CategoryDescriptionService.getAll = function (list) {
            var def = $q.defer();
            $http({
                method: 'GET',
                url: $config.API_URL + 'categoriesDescriptions/categoriesDescriptionsPublic?list=' + list
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return CategoryDescriptionService;

    });