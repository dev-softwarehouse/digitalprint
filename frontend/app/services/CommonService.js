'use strict';

angular.module('digitalprint.services')
    .factory('CommonService', function ($q, $http, $config) {

        var CommonService = {};

        CommonService.getAll = function () {

            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + 'dp_ModelIconsExtensions'
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return CommonService;
    });