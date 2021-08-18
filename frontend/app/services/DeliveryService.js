angular.module('digitalprint.services')
    .factory('DeliveryService', function ($q, $http, $config, $cacheFactory) {

        var DeliveryService = {};

        DeliveryService.getResource = function () {
            return ['deliveries', 'deliveriesPublic'].join('/')
        };

        DeliveryService.getAll = function (currencyCode) {
            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, currencyCode].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DeliveryService.findParcelShops = function (addressID, deliveryID, courierID) {
            var def = $q.defer();

            var resource = this.getResource();

            var urlParams = '?deliveryID=' + deliveryID + '&courierID=' + courierID + '&addressID=' + addressID;

            $http({
                method: 'GET',
                url: $config.API_URL + 'deliveries/findParcelsPublic' + urlParams
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return DeliveryService;

    });