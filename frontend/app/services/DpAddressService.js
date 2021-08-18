angular.module('digitalprint.services')
    .factory('DpAddressService', function($q, $http, $config){

    var DpAddressService = {};

    var resource = 'dp_addresses';

    DpAddressService.getDefaultAddress = function( type ) {
        var def = $q.defer();

        $http({
            method: 'GET',
            url: $config.API_URL + resource + '/' + 'getAddress' + '/' + type
        }).success(function(data) {
            def.resolve(data);
        }).error(function(data) {
            def.reject(data);
        });

        return def.promise;
    };

    DpAddressService.editUserAddress = function( data, addressID ) {
        var def = $q.defer();

        if( addressID === undefined ) {
            addressID = '';
        }

        data = _.extend({}, data);

        $http({
            method: 'PATCH',
            url: $config.API_URL + resource + '/' + 'updateAddress' + '/' + addressID,
            data: data
        }).success(function(data) {
            def.resolve(data);
        }).error(function(data) {
            def.reject(data);
        });

        return def.promise;
    };

    DpAddressService.getAddresses = function( type ) {
        var def = $q.defer();

        $http({
            method: 'GET',
            url: $config.API_URL + resource + '/' + 'getAddresses' + '/' + type
        }).success(function(data) {
            def.resolve(data);
        }).error(function(data) {
            def.reject(data);
        });

        return def.promise;
    };

    DpAddressService.addAddress = function( data, type ) {
        var def = $q.defer();

        data = _.toPlainObject(data);
        $http({
            method: 'POST',
            url: $config.API_URL + resource + '/' + 'addAddress' + '/' + type,
            data: data
        }).success(function(data) {
            def.resolve(data);
        }).error(function(data) {
            def.reject(data);
        });

        return def.promise;
    };

    DpAddressService.emptyAddress = function () {
        var def = $q.defer();

        $http({
            method: 'GET',
            url: $config.API_URL + resource + '/' + 'emptyAddress'
        }).success(function (data) {
            def.resolve(data);
        }).error(function (data) {
            def.reject(data);
        });

        return def.promise;
    };

    DpAddressService.remove = function (addressID) {
        var def = $q.defer();

        $http({
            method: 'DELETE',
            url: $config.API_URL + resource + '/' + addressID
        }).success(function (data) {
            def.resolve(data);
        }).error(function (data) {
            def.reject(data);
        });

        return def.promise;
    };

    return DpAddressService;
});
