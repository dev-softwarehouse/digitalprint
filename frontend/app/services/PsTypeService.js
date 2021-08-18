'use strict';

angular.module('digitalprint.services')
    .service('PsTypeService', function ($q, $http, $config, Restangular, $cacheFactory) {

        var cache = $cacheFactory('ps_types');

        var TypeService = {};

        TypeService.getAll = function (groupID, force) {
            var def = $q.defer();

            if (cache.get('collection' + groupID) && !force) {
                def.resolve(cache.get('collection' + groupID));
            } else {
                Restangular.all('ps_groups/' + groupID + '/ps_types').getList().then(function (data) {
                    cache.put('collection' + groupID, data.plain()); // nie zwracamy plain bo potrzebujemy obiekt do put
                    def.resolve(data.plain());
                }, function (data) {
                    def.reject(data);
                });
            }

            return def.promise;
        };

        TypeService.forView = function (groupUrl, force) {
            var def = $q.defer();

            if (cache.get('collection' + groupUrl) && !force) {
                def.resolve(cache.get('collection' + groupUrl));
            } else {
                Restangular.all('ps_groups/' + groupUrl + '/ps_types/forView').getList().then(function (data) {
                    cache.put('collection' + groupUrl, data.plain());
                    def.resolve(data.plain());
                }, function (data) {
                    def.reject(data);
                });
            }

            return def.promise;
        };

        TypeService.getOneForView = function (groupUrl, typeUrl) {
            var def = $q.defer();

            if( groupUrl === undefined ) {
                groupUrl = '';
            }

            $http({
                method: 'GET',
                url: $config.API_URL + 'ps_groups/' + groupUrl + '/ps_types/oneForView/' + typeUrl
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        TypeService.add = function (groupID, item) {
            var def = $q.defer();

            Restangular.all('ps_groups/' + groupID + '/ps_types').doPOST(item).then(function (data) {
                if (data.ID) {
                    cache.remove('collection' + groupID);
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        TypeService.edit = function (groupID, item) {
            var def = $q.defer();

            Restangular.all('ps_groups/' + groupID + '/ps_types').customPUT(item).then(function (data) {
                if (data.response) {
                    cache.remove('collection' + groupID);
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;

        };

        TypeService.remove = function (groupID, item) {
            var def = $q.defer();
            var data;

            Restangular.all('ps_groups/' + groupID + '/ps_types').one(item.ID + '').remove().then(function (data) {
                if (data.response) {
                    cache.remove('collection' + groupID); //usuwamy cache za każdym add, remove
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;

        };

        TypeService.sort = function (groupID, sort) {
            var def = $q.defer();

            Restangular.all('ps_groups/' + groupID + '/ps_types').one('sort').patch(sort).then(function (data) {
                if (data.response) {
                    cache.remove('collection' + groupID);
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        TypeService.getRealizationTimes = function (groupID, typeID, force) {
            var def = $q.defer();

            var resource = 'ps_groups/' + groupID + '/ps_types/' + typeID + '/ps_rt_details';

            Restangular.all(resource).getList().then(function (data) {
                if (data) {
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        TypeService.setRealizationTime = function (groupID, typeID, item) {
            var def = $q.defer();

            var resource = 'ps_groups/' + groupID + '/ps_types/' + typeID + '/ps_rt_details';

            Restangular.all(resource).patch(item).then(function (data) {
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

        TypeService.removeRealizationTime = function (groupID, typeID, item) {
            var def = $q.defer();

            if (!item.details) {
                def.reject();
            }

            var resource = 'ps_groups/' + groupID + '/ps_types/' + typeID + '/ps_rt_details';

            Restangular.all(resource).one(item.details.ID + '').remove().then(function (data) {
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

        TypeService.getTypesData = function (typesList) {
            var def = $q.defer();
            $http({
                method: 'PATCH',
                url: $config.API_URL + 'ps_types/getTypesData',
                data: {
                    types: typesList
                }
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        TypeService.search = function (text) {
            var def = $q.defer();
            $http({
                method: 'GET',
                url: $config.API_URL + 'ps_types/search/' + text
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        TypeService.getOneByID = function (groupID, typeID) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + 'ps_groups/' + groupID + '/ps_types/oneByID/' + typeID
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        TypeService.cacheRemove = function (groupID) {
            cache.remove('collection' + groupID);
        };

        return TypeService;
    });
