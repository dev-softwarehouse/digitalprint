'use strict';

angular.module('digitalprint.services')
    .factory('PsFormatService', function ($q, Restangular, $cacheFactory) {

        var cache = $cacheFactory('ps_formats');

        var FormatService = function (groupID, typeID) {
            this.groupID = groupID;
            this.typeID = typeID;
        };

        FormatService.prototype.getResource = function () {
            return 'ps_groups/' + this.groupID + '/ps_types/' + this.typeID + '/ps_formats';
        };

        FormatService.prototype.getPublic = function (complexID, force) {
            var def = $q.defer();
            var _this = this;

            var resource = this.getResource() + '/formatsPublic/' + complexID;

            if (cache.get(resource) && !force) {
                def.resolve(cache.get(resource));
            } else {
                Restangular.all(resource).getList().then(function (data) {
                    cache.put(resource, data.plain());
                    def.resolve(data.plain());
                }, function (data) {
                    def.reject(data);
                });
            }

            return def.promise;
        };

        FormatService.prototype.getCustomNames = function () {
            var def = $q.defer();

            var resource = 'ps_formats';

            Restangular.all(resource).one('customName', this.typeID).get().then(function (data) {
                def.resolve(data.plain());
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return FormatService;
    });