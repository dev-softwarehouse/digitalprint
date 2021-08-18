angular.module('digitalprint.services')
    .factory('CalculateDataService', function ($q, $http, $config) {

        var CalculateDataService = function (typeID) {
            this.typeID = typeID;
        };

        CalculateDataService.prototype.getResource = function () {
            return ['calculate', this.typeID].join('/')
        };

        CalculateDataService.prototype.getData = function () {

            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + this.getResource()
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        CalculateDataService.prototype.printOffer = function (data) {
            var def = $q.defer();

            $http({
                method: 'PATCH',
                url: $config.API_URL + ['calculate', 'printOffer'].join('/'),
                data: data
            }).success(function (data) {
                def.resolve(data);
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return CalculateDataService;
    });
