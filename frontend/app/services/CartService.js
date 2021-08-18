angular.module('digitalprint.services')
    .service('CartService', function ($q, Restangular, $http, $config) {

        var CartService = {};

        var resource = 'carts';

        CartService.getAll = function () {
            var def = $q.defer();

            Restangular.all('carts').getList().then(function (data) {
                def.resolve(data.plain());
            });

            return def.promise;
        };

        CartService.update = function (id, data) {
            var def = $q.defer();

            Restangular.all('carts', id).doPOST(data).then(function (data) {

                if (data.response) {
                    def.resolve(data.plain());
                } else {
                    def.reject(data.plain());
                }

            });

            return def.promise;
        };

        CartService.patch = function (id, data) {
            var def = $q.defer();

            Restangular.one('carts', id).patch(data).then(function (data) {

                if (data.response == true) {
                    def.resolve(data.plain());
                } else {
                    def.reject(data.plain());
                }

            });

            return def.promise;
        };

        CartService.messages = function (cartID) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, cartID, 'cart_messages'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        CartService.addMessage = function (cartID, message) {
            var def = $q.defer();

            $http({
                method: 'PATCH',
                url: $config.API_URL + [resource, cartID, 'cart_messages'].join('/'),
                data: {content: message}
            }).success(function (data) {
                if (data.response) {
                    def.resolve(data.item);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        CartService.stats = function (params) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'stats'].join('/'),
                params: params
            }).success(function (data) {
                def.resolve(data);
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return CartService;
    });
