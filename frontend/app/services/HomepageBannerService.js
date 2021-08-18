'use strict';

angular.module('digitalprint.services')
    .factory('HomepageBannerService', function ($q, $http, $config, Restangular) {
        var HomePageBannerService = {};

        function getResource() {
            return 'homePageBanner';
        }

        var resource = getResource();

        HomePageBannerService.getAll = function () {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + resource + '/homePageBannerPublic'
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return HomePageBannerService;
    });