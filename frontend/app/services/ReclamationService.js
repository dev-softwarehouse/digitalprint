/**
 * Created by Rafał on 01-09-2017.
 */

angular.module('digitalprint.services')
    .service('ReclamationService', function ($q, $http, $config) {

        var ReclamationService = {};

        var faultsResource = 'dp_reclamation_faults';
        var resource = 'dp_reclamations';
        var messagesResource = 'dp_reclamations_messages';

        ReclamationService.getFaults = function () {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + faultsResource
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        ReclamationService.getUploadUrl = function (reclamationID) {
            return $config.API_URL + [resource, 'files', reclamationID].join('/');
        };

        ReclamationService.add = function (data, orderID) {
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + [resource, orderID].join('/'),
                data: data
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        ReclamationService.findByOrder = function (orderID) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'findByOrder', orderID].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        ReclamationService.getAll = function (params) {
            var def = $q.defer();

            if (params === undefined) {
                params = {};
            }

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'myZone'].join('/'),
                params: params
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        ReclamationService.getMyZoneCount = function (params) {
            var def = $q.defer();

            if (params === undefined) {
                params = {};
            }

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'myZoneCount'].join('/'),
                params: params
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        ReclamationService.getMessages = function(reclamationID) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [messagesResource, 'myZone', reclamationID].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        ReclamationService.getFiles = function (reclamationID) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL +  [resource, 'getFiles', reclamationID].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return ReclamationService;

    });


