angular.module('digitalprint.services')
    .service('PaymentService', function ($q, Restangular, $http, $config) {

        var PaymentService = {};

        PaymentService.getResource = function () {
            return ['payments', 'paymentsPublic']
        };

        PaymentService.getAll = function (orderID) {
            var def = $q.defer();
            
            var resource = this.getResource();
            resource.push(orderID);

            $http({
                method: 'GET',
                url: $config.API_URL + resource.join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        PaymentService.getCreditLimit = function () {
            var def = $q.defer();

            var resource = ['payments', 'creditLimit'];

            $http({
                method: 'GET',
                url: $config.API_URL + resource.join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return PaymentService;

    });