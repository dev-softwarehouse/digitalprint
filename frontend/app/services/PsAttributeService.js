'use strict';

angular.module('digitalprint.services')
    .factory('PsAttributeService', function ($q, $http, $config, Restangular, $cacheFactory) {

        var cache = $cacheFactory('ps_product_options');

        var AttributeService = function (groupID, typeID) {
            this.groupID = groupID;
            this.typeID = typeID;
            this.resource = 'ps_groups/' + groupID + '/ps_types/' + typeID + '/ps_product_options';
            this.resourceFullOptions = 'ps_groups/' + groupID + '/ps_types/selectedOptions/' + typeID;
            this.resourceFullOptionsPublic = 'ps_groups/' + groupID + '/ps_types/selectedOptionsPublic/' + typeID;
        };

        // pobiera wszystkie wybrane
        AttributeService.prototype.getAll = function (force) {
            var def = $q.defer();
            var _this = this;

            if (cache.get(this.resource) && !force) {
                def.resolve(cache.get(this.resource));
            } else {
                Restangular.all(_this.resource).getList().then(function (data) {
                    cache.put(_this.resource, data.plain());
                    def.resolve(data.plain());
                }, function (data) {
                    def.reject(data);
                });
            }

            return def.promise;
        };

        AttributeService.prototype.getFullOptions = function (force) {
            var def = $q.defer();
            var _this = this;

            if (cache.get(this.resourceFullOptions) && !force) {
                def.resolve(cache.get(this.resourceFullOptions));
            } else {
                $http({
                    method: 'GET',
                    url: $config.API_URL + _this.resourceFullOptions
                }).success(function (data) {
                    cache.put(_this.resourceFullOptions, data);
                    def.resolve(data);
                }).error(function (data) {
                    def.reject(data);
                });
            }

            return def.promise;
        };

        AttributeService.prototype.getFullOptionsPublic = function (force) {
            var def = $q.defer();
            var _this = this;

            if (cache.get(this.resourceFullOptionsPublic) && !force) {
                def.resolve(cache.get(this.resourceFullOptionsPublic));
            } else {
                $http({
                    method: 'GET',
                    url: $config.API_URL + _this.resourceFullOptionsPublic
                }).success(function (data) {
                    cache.put(_this.resourceFullOptionsPublic, data);
                    def.resolve(data);
                }).error(function (data) {
                    def.reject(data);
                });
            }

            return def.promise;
        };

        AttributeService.prototype.saveOption = function (item) {
            var def = $q.defer();
            var _this = this;
            Restangular.all(_this.resource).patch(item).then(function (data) {
                if (data.response) {
                    cache.remove(_this.resource);
                    cache.remove(_this.resourceFullOptions);
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(datA);
            });

            return def.promise;
        };

        AttributeService.prototype.setInvisible = function (attrID, optID, value) {
            var def = $q.defer();
            var _this = this;
            Restangular.all(_this.resource).patch({
                attrID: attrID,
                optID: optID,
                action: 'setInvisible',
                invisible: value
            }).then(function (data) {
                if (data.response) {
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        AttributeService.prototype.setFormats = function (attrID, optID, formats) {
            var def = $q.defer();
            var _this = this;
            Restangular.all(_this.resource).patch({
                attrID: attrID,
                optID: optID,
                action: 'formats',
                formats: formats
            }).then(function (data) {
                if (data.response) {
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return AttributeService;

    });