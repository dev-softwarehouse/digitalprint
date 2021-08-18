angular.module('digitalprint.services')
    .factory('CountService', function ($q, $http, $config) {

        var CountService = {};

        var resource = 'dp_calculate';

        CountService.reCalculateCart = function (data) {

            var def = $q.defer();

            $http({
                method: 'PATCH',
                data: data,
                url: $config.API_URL + [resource, 'cartReCalculate'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        CountService.restorePricesCart = function (data) {

            var def = $q.defer();

            $http({
                method: 'PATCH',
                data: data,
                url: $config.API_URL + [resource, 'cartRestorePrices'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return CountService;

    });