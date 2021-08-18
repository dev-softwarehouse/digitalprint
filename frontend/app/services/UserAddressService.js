angular.module('digitalprint.services')
    .service('UserAddressService', function ($q, $http, $config) {

        /**
         * @deprecated
         * @TODO check and remove
         * @param userID
         * @constructor
         */

        var UserAddressService = function (userID) {
            this.userID = userID;
            this.resource = ['users', this.userID, 'address'].join('/');
        };

        UserAddressService.prototype.getAllAddresses = function () {
            var def = $q.defer();
            var _this = this;

            $http({
                method: 'GET',
                url: $config.API_URL + _this.resource + '?type=1'
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        UserAddressService.prototype.getAllAddressesVat = function () {
            var def = $q.defer();
            var _this = this;

            $http({
                method: 'GET',
                url: $config.API_URL + _this.resource + '?type=2'
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        UserAddressService.prototype.createAddress = function (data) {
            var def = $q.defer();
            var _this = this;

            $http({
                method: 'POST',
                url: $config.API_URL + _this.resource,
                data: data
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

        UserAddressService.prototype.edit = function (data) {
            var def = $q.defer();
            var _this = this;

            $http({
                method: 'PUT',
                url: $config.API_URL + _this.resource,
                data: data
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

        UserAddressService.prototype.remove = function (data) {
            var def = $q.defer();
            var _this = this;

            $http({
                method: 'DELETE',
                url: $config.API_URL + [_this.resource, data.ID].join('/'),
                data: data
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

        return UserAddressService;
    });