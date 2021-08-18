angular.module('digitalprint.services')
    .service('DomainService', function ($rootScope, $q, $config, $http, localStorageService, $cacheFactory) {

        var DomainService = {};

        var resource = 'domains';
        var cache = $cacheFactory(resource);

        var getAllDef = null;

        DomainService.getAll = function (force) {
            if (_.isNull(getAllDef) || force || getAllDef.promise.$$state.status === 1) {
                getAllDef = $q.defer();
            } else {
                return getAllDef.promise;
            }

            if (cache.get('collection') && !force) {
                getAllDef.resolve(cache.get('collection'));
            } else {
                $http({
                    method: 'GET',
                    url: $config.API_URL + resource
                }).success(function (data) {
                    getAllDef.resolve(data);
                }).error(function (data) {
                    getAllDef.reject(data);
                });
            }

            return getAllDef.promise;
        };

        DomainService.editDomain = function (domain) {
            var def = $q.defer();

            $http({
                method: 'PUT',
                url: $config.API_URL + resource,
                data: domain
            }).success(function (data) {
                if (data.response) {
                    cache.remove('collection');
                    $rootScope.$emit('Domain:editSuccess');
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DomainService.getCurrentDomain = function () {
            var def = $q.defer();

            this.getAll().then(function (data) {

                var result = _.findWhere(data, {
                    selected: 1
                });

                if (!!result) {
                    localStorageService.set('domainID', result.ID);
                    $rootScope.currentDomain = result;
                    def.resolve(result);
                } else {
                    def.reject();
                }

            });

            return def.promise;
        };

        DomainService.getDomain = function (id) {
            var def = $q.defer();

            this.getAll().then(function (data) {
                var domain = _.findWhere(data, {ID: id});
                def.resolve(domain);
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        DomainService.setDomain = function (id) {
            this.getDomain(id).then(function (data) {
                localStorageService.set('domainID', id);

                $rootScope.currentDomain = data;
            });

        };

        return DomainService;
    });
