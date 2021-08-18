'use strict';

angular.module('digitalprint.services')
    .factory('PsTooltipService', function ($q, Restangular, $cacheFactory) {

        var cache = $cacheFactory('ps_tooltips');

        var TooltipService = function (groupID, typeID) {
            this.groupID = groupID;
            this.typeID = typeID;
            this.resource = 'ps_groups/' + groupID + '/ps_types/' + typeID + '/ps_tooltips';
        };

        TooltipService.prototype.getAll = function (force) {
            var def = $q.defer();
            var _this = this;

            if (cache.get(this.resource) && !force) {
                def.resolve(cache.get(this.resource));
            } else {
                Restangular.all(_this.resource).get('').then(function (data) {
                    cache.put(_this.resource, data.plain());
                    def.resolve(data.plain());
                }, function (data) {
                    def.reject(data);
                });
            }

            return def.promise;
        };

        TooltipService.prototype.save = function (attrID, tooltips) {
            var def = $q.defer();
            var _this = this;
            Restangular.all(_this.resource).patch({
                attrID: attrID,
                tooltip: tooltips
            }).then(function (data) {
                if (data.response) {
                    cache.remove(_this.resource);
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(datA);
            });

            return def.promise;
        };

        return TooltipService;

    });