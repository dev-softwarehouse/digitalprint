'use strict';

angular.module('digitalprint.services')
    .factory('PsCalculateService', function ($q, $http, $config, $cacheFactory) {

        var cache = $cacheFactory('ps_calculate');

        var CalculateService = function (groupID, typeID) {
            this.groupID = groupID;
            this.typeID = typeID;
        };

        CalculateService.prototype.getResource = function () {
            return 'ps_groups/' + this.groupID + '/ps_types/' + this.typeID + '/ps_calculate';
        };

        CalculateService.prototype.calculate = function (item) {
            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'POST',
                url: $config.API_URL + resource,
                data: item
            }).success(function (data) {
                if (data.response) {
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        CalculateService.prototype.getVolumes = function (item) {
            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'PATCH',
                url: $config.API_URL + resource,
                data: item
            }).success(function (data) {
                if (data.response) {
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        CalculateService.prototype.saveCalculation = function (preparedProduct) {
            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'POST',
                url: $config.API_URL + [resource, 'saveCalculation'].join('/'),
                data: preparedProduct
            }).success(function (data) {
                if (data.response) {
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return CalculateService;
    });