angular.module('digitalprint.services')
    .factory('CalculationService', function ($q, $http, $config) {

        var CalculationService = function (groupID, typeID) {
            this.groupID = groupID;
            this.typeID = typeID;
        };

        CalculationService.prototype.getResource = function () {
            return ['ps_groups', this.groupID, 'ps_types', this.typeID, 'ps_calculate', 'calculatePublic'].join('/')
        };

        CalculationService.prototype.getVolumes = function (data) {

            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'PATCH',
                data: data,
                url: $config.API_URL + resource
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        CalculationService.prototype.calculate = function (data) {

            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'POST',
                data: data,
                url: $config.API_URL + resource
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        CalculationService.prototype.saveCalculation = function (data) {

            var def = $q.defer();

            var resource = ['ps_groups', this.groupID, 'ps_types', this.typeID, 'ps_calculate', 'saveCalculationPublic'].join('/');

            $http({
                method: 'POST',
                data: data,
                url: $config.API_URL + resource
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        CalculationService.prototype.updateName = function (data) {

            var def = $q.defer();

            var resource = ['ps_groups', this.groupID, 'ps_types', this.typeID, 'ps_calculate', 'updateName', data.productID].join('/');

            $http({
                method: 'PATCH',
                data: data,
                url: $config.API_URL + resource
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return CalculationService;

    });
