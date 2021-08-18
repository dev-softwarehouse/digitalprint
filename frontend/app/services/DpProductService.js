angular.module('digitalprint.services')
    .factory('DpProductService', function ($q, $http, $config) {

        var DpProductService = {};

        var resource = 'dp_products';

        DpProductService.getAll = function () {

            var def = $q.defer();

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

        DpProductService.baseInfo = function (id) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'baseInfo', id].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpProductService.delete = function (product) {
            var def = $q.defer();

            $http({
                method: 'DELETE',
                url: $config.API_URL + resource + '/' + 'deletePublic' + '/' + product.productID
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpProductService.deleteFromMongo = function (product) {

            var def = $q.defer();
            var preparedData = {
                'productID': product.productID,
                'orderID': product.orderID,
                'calcID': product.calcID
            };

            $http({
                method: 'POST',
                url: $config.AUTH_URL + 'cart/delete',
                data: $.param(preparedData),
                params: {
                    domainName: location.hostname
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpProductService.getByOrder = function (orderID) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'getByOrder', orderID].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpProductService.restoreAccept = function (productID) {
            var def = $q.defer();

            $http({
                method: 'PATCH',
                url: $config.API_URL + [resource, 'restoreAccept', productID].join('/'),
                data: {
                    accept: 0
                }
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return DpProductService;

    });