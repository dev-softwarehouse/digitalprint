'use strict';

angular.module('digitalprint.services')
    .factory('PsComplexService', function ($q, $http, $config, $cacheFactory) {

        var cache = $cacheFactory('ps_complex');

        var ComplexService = function (groupID, typeID) {
            this.groupID = groupID;
            this.typeID = typeID;
        };

        ComplexService.prototype.getResource = function () {
            return 'ps_groups/' + this.groupID + '/ps_types/' + this.typeID + '/ps_complex';
        };

        ComplexService.prototype.getAll = function () {
            var def = $q.defer();

            var resource = this.getResource();

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

        ComplexService.prototype.getAllPublic = function () {
            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'GET',
                url: $config.API_URL + resource + '/complexPublic'
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        ComplexService.prototype.add = function (baseID, typeID, complexGroupID) {
            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'POST',
                url: $config.API_URL + resource,
                data: {
                    baseID: baseID,
                    typeID: typeID,
                    complexGroupID: complexGroupID
                }
            }).success(function (data) {
                if (data.ID) {
                    cache.remove(resource);
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        ComplexService.prototype.edit = function (item) {
            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'PUT',
                url: $config.API_URL + resource,
                data: item
            }).success(function (data) {
                if (data.response) {
                    cache.remove(resource);
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;

        };

        ComplexService.prototype.remove = function (id) {
            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'DELETE',
                url: $config.API_URL + [resource, id].join("/")
            }).success(function (data) {
                if (data.response) {
                    cache.remove(resource);
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;

        };

        ComplexService.prototype.addGroup = function (complexID, name) {
            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'POST',
                url: $config.API_URL + [resource, 'group', complexID].join('/'),
                data: {name: name}
            }).success(function (data) {
                if (data.response) {
                    cache.remove(resource);
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        ComplexService.prototype.editGroup = function (groupID, name) {
            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'PUT',
                url: $config.API_URL + [resource, 'group'].join('/'),
                data: {ID: groupID, name: name}
            }).success(function (data) {
                if (data.response) {
                    cache.remove(resource);
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        ComplexService.prototype.relatedFormat = function (baseFormatID) {
            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'relatedFormat', baseFormatID].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        ComplexService.prototype.saveRelatedFormat = function (baseFormatID, formats) {
            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'POST',
                url: $config.API_URL + [resource, 'relatedFormat', baseFormatID].join('/'),
                data: {formats: formats}
            }).success(function (data) {
                if (data.response) {
                    cache.remove(resource);
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return ComplexService;
    });