'use strict';

angular.module('digitalprint.services')
    .service('SubCategoryDescriptionService', function ($q, $http, $config) {

        var SubCategoryDescriptionService = {};

        SubCategoryDescriptionService.getAll = function (subcategoryURL) {
            var def = $q.defer();
            $http({
                method: 'GET',
                url: $config.API_URL + 'subcategoriesDescriptions/subcategoriesDescriptionsPublic?categoryURL=' + subcategoryURL
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return SubCategoryDescriptionService;
    });