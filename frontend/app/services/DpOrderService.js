angular.module('digitalprint.services')
    .factory('DpOrderService', function ($q, $http, $config) {

        var DpOrderService = {};

        var resource = 'dp_orders';

        DpOrderService.getAll = function () {

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

        DpOrderService.get = function (id) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, id].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpOrderService.edit = function (id, data) {
            var def = $q.defer();

            $http({
                method: 'PUT',
                url: $config.API_URL + [resource, id].join('/'),
                data: data
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpOrderService.sellerNotReady = function () {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'sellerNotReady'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpOrderService.getCart = function () {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'getCart'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpOrderService.setUser = function (orderID) {
            var def = $q.defer();

            $http({
                method: 'PATCH',
                url: $config.API_URL + [resource, 'setUser', orderID].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpOrderService.saveCart = function (orderID, sendData) {
            var def = $q.defer();

            $http({
                method: 'PATCH',
                url: $config.API_URL + [resource, 'saveCart', orderID].join('/'),
                data: sendData
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpOrderService.getMyZone = function (params) {
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

        DpOrderService.getMyZoneCount = function (params) {
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

        DpOrderService.sendPaymentSuccess = function (data, orderID) {
            var def = $q.defer();

            $http({
                method: 'PATCH',
                url: $config.API_URL + [resource, 'paymentSuccess', orderID].join('/'),
                data: data
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpOrderService.sendPaymentStatus = function (orderID, urlParams) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'paymentStatus', orderID].join('/'),
                params: urlParams
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpOrderService.payment = function (data, orderID) {
            var def = $q.defer();

            $http({
                method: 'PATCH',
                url: $config.API_URL + [resource, 'payment', orderID].join('/'),
                data: data
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpOrderService.updatePrice = function () {
            var def = $q.defer();

            $http({
                method: 'PATCH',
                url: $config.API_URL + [resource, 'updatePrice'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpOrderService.recalculateDelivery = function (params) {
            var def = $q.defer();

            $http({
                method: 'PATCH',
                url: $config.API_URL + [resource, 'recalculateDelivery'].join('/'),
                data: params
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpOrderService.addToJoinedDelivery = function (addressID, currency) {
            var def = $q.defer();

            var params = {addressID: addressID, currency: currency};

            $http({
                method: 'PATCH',
                url: $config.API_URL + [resource, 'addToJoinedDelivery'].join('/'),
                data: params
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpOrderService.changeAddresses = function (orderID, productID, productAddresses) {
            var def = $q.defer();

            var params = {
                orderID: orderID,
                productID: productID,
                productAddresses: productAddresses
            };

            $http({
                method: 'PATCH',
                url: $config.API_URL + [resource, 'changeAddresses', orderID].join('/'),
                data: params
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpOrderService.getMyZoneOffers = function (params) {
            var def = $q.defer();

            if (params === undefined) {
                params = {};
            }

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'myZoneOffers'].join('/'),
                params: params
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DpOrderService.acceptOffer = function(data) {

            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + [resource, 'acceptOffer'].join('/'),
                data: data
            }).success(function (data) {
                if (data.response) {
                    def.resolve(data);
                } else {
                    def.reject()
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;

        };

        DpOrderService.rejectOffer = function(data) {

            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + [resource, 'rejectOffer'].join('/'),
                data: data
            }).success(function (data) {
                if (data.response) {
                    def.resolve(data);
                } else {
                    def.reject()
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;

        };



        return DpOrderService;

    });