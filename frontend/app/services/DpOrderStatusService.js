/**
 * Created by Rafał on 01-03-2017.
 */
angular.module('digitalprint.services')
    .service('DpOrderStatusService', function ($rootScope, $q, $http, $config) {

        var DpStatusService = {};

        var resource = 'dp_statuses';

        DpStatusService.getAll = function ( active ) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'forClient'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });


            return def.promise;
        };

        return DpStatusService;
    });