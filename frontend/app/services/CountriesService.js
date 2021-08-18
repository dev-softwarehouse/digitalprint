/**
 * Created by rafal on 31.01.17.
 */
angular.module('digitalprint.services')
    .factory('CountriesService', function ($rootScope, $q, $config, $http) {

        var CountriesService = {};

        CountriesService.getResource = function () {
            return ['dp_countries'].join('/')
        };

        CountriesService.getAll = function () {

            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'GET',
                url: $config.API_URL + resource
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return CountriesService;

    });