'use strict';

angular.module('digitalprint.services')
    .factory('PsPageService', function ($q, Restangular, $cacheFactory) {

        var cache = $cacheFactory('ps_pages');

        var PageService = function (groupID, typeID) {
            this.groupID = groupID;
            this.typeID = typeID;
            this.resource = 'ps_groups/' + groupID + '/ps_types/' + typeID + '/ps_pages';
            this.resourcePublic = 'ps_groups/' + groupID + '/ps_types/' + typeID + '/ps_pages/pagesPublic';
        };

        PageService.prototype.getPublic = function (force) {
            var def = $q.defer();
            var _this = this;

            if (cache.get(this.resource) && !force) {
                def.resolve(cache.get(this.resource));
            } else {
                Restangular.all(_this.resourcePublic).getList().then(function (data) {
                    cache.put(_this.resource, data.plain());
                    def.resolve(data.plain());
                }, function (data) {
                    def.reject(data);
                });
            }

            return def.promise;
        };

        PageService.prototype.getCustomNames = function () {
            var def = $q.defer();

            var resource = 'ps_pages';

            Restangular.all(resource).one('customName', this.typeID).get().then(function (data) {
                def.resolve(data.plain());
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };


        return PageService;

    });