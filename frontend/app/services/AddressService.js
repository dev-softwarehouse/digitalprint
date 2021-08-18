angular.module('digitalprint.services')
    .factory('AddressService', function ($rootScope, $q, $config, $http, CacheService) {

        var AddressService = {};

        AddressService.getResource = function () {
            return ['address', 'addressPublic'].join('/')
        };

        AddressService.getAll = function (addresses) {

            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'GET',
                url: $config.API_URL + resource + '/' + addresses.join(',')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        AddressService.getForUser = function () {
            var def = $q.defer();

            var resource = ['address', 'getUserAddresses'].join('/');

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

        AddressService.setForUser = function (addresses) {
            var def = $q.defer();

            var sendData = {'addresses': addresses};

            var resource = ['address', 'setAddressToUser'].join('/');

            $http({
                method: 'PATCH',
                url: $config.API_URL + resource,
                data: sendData
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        AddressService.addAddress = function (data) {
            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'POST',
                url: $config.API_URL + resource,
                data: data
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        AddressService.saveAddressToSession = function (addressID) {

            var def = $q.defer();

            var params = {'addressID': addressID};

            $http({
                method: 'POST',
                url: $config.AUTH_URL + 'addresses/add',
                params: {
                    domainName: location.hostname
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data: $.param(params)
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        AddressService.getAddressesFromSession = function () {

            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.AUTH_URL + 'addresses',
                params: {
                    domainName: location.hostname
                }
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        AddressService.getDefaultAddress = function () {
            var def = $q.defer();
            var _this = this;

            $http({
                method: 'GET',
                url: $config.API_URL + _this.resource + '/' + 'getDefault' + '?type=1'
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        AddressService.updateProductAddresses = function (orderID, productID, productAddresses) {

            var def = $q.defer();

            var params = {
                orderID: orderID,
                productID: productID,
                productAddresses: productAddresses
            };

            $http({
                method: 'POST',
                url: $config.AUTH_URL + 'product/addresses',
                params: {
                    domainName: location.hostname
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data: $.param(params)
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return AddressService;

    });