angular.module('digitalprint.services')
    .factory('UserService', function ($q, $http, $config, $cacheFactory) {

        var UserService = {};

        var resource = 'users';

        var cache = $cacheFactory(resource);

        var getAllDef = null;

        UserService.getAll = function (force) {
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
                    cache.put('collection', data);
                    getAllDef.resolve(data);
                }).error(function (data) {
                    getAllDef.reject(data);
                });
            }

            return getAllDef.promise;
        };

        UserService.add = function (data) {
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + resource,
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

        UserService.addSimple = function (data) {
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + 'users/userSimpleRegister',
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

        UserService.get = function (uID) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + resource + '?ID=' + uID
            }).success(function (data) {
                if (data.length === 1) {
                    def.resolve(data[0]);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        UserService.remove = function (uID) {
            var def = $q.defer();
            $http({
                method: 'DELETE',
                url: $config.API_URL + [resource, uID].join('/')
            }).success(function (data) {
                def.resolve(data[0]);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        UserService.add = function (data) {
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + [resource, 'special'].join('/'),
                data: data
            }).success(function (data) {
                if (data.response) {
                    cache.remove('collection');
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        UserService.editUser = function (user) {
            var def = $q.defer();
            $http({
                method: 'PATCH',
                url: $config.API_URL + resource,
                data: user
            }).success(function (data) {
                if (data.response) {
                    cache.remove('collection');
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;

        };

        UserService.editUserOptions = function (userID, data) {
            var def = $q.defer();
            $http({
                method: 'PATCH',
                url: $config.API_URL + [resource, userID, 'userOptions'].join('/'),
                data: data
            }).success(function (data) {
                if (data.response) {
                    cache.remove('collection');
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;

        };


        UserService.getRoles = function (user) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, user.ID, 'userRoles'].join('/')
            }).success(function (data) {
                if (data.response) {
                    cache.remove('collection');
                    def.resolve(data.items);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;

        };

        UserService.setRoles = function (user, items) {
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + [resource, user.ID, 'userRoles'].join('/'),
                data: items
            }).success(function (data) {
                if (data.response) {
                    cache.remove('collection');
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        UserService.getGroups = function (user) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, user.ID, 'userGroups'].join('/')
            }).success(function (data) {
                if (data.response) {
                    cache.remove('collection');
                    def.resolve(data.items);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        UserService.setGroups = function (user, items) {
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + [resource, user.ID, 'userGroups'].join('/'),
                data: items
            }).success(function (data) {
                if (data.response) {
                    cache.remove('collection');
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        UserService.userRegister = function (data) {
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + [resource, 'userRegister'].join('/'),
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

        UserService.passForget = function (email) {
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + [resource, 'passForget'].join('/'),
                data: {
                    email: email
                }
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

        // MyAccount -> Ftp Account

        UserService.generateNewFtp = function () {
            var def = $q.defer();
            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'changeFtpPass'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;

        };

        UserService.getUserFtp = function () {
            var def = $q.defer();
            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'getUserFtpData'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;

        };
        // End of MyAccount -> Ftp account

        // My Account -> User data
        UserService.getLoggedUserData = function () {
            var def = $q.defer();
            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'getLoggedUserData'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;

        };

        UserService.userDataChange = function (data) {
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + [resource, 'changeUserData'].join('/'),
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
        // End of My Account -> Use data

        UserService.changeMail = function (data) {
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + [resource, 'changeMail'].join('/'),
                data: data
            }).success(function (data) {
                if (data.response) {
                    // cache.remove('collection');
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        UserService.getMyAccount = function () {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'getMyAccount'].join('/')
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

        UserService.checkOneTimeUser = function () {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'checkOneTimeUser'].join('/')
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

        UserService.changePass = function (data) {
            var def = $q.defer();

            $http({
                method: 'PATCH',
                url: $config.API_URL + resource + '/' + 'changePass',
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

        UserService.getCurrency = function (userID) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'getCurrency', userID].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        UserService.getImportantData = function () {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'importantData'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        UserService.editImportantData = function (data) {
            var def = $q.defer();

            $http({
                method: 'PATCH',
                data: data,
                url: $config.API_URL + [resource, 'importantData'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return UserService;

    });
