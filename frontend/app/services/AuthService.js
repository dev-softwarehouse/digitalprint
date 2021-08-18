/**

 AuthService has two parts AuthDataService and AuthHttpService

 **/

angular.module('digitalprint.services')
    .factory('AuthDataService', function ($rootScope, $cookieStore, $cookies, localStorageService, $log, $q, $timeout,
                                          $config) {

        var AuthDataService = {};

        var accessTokenName = $config.ACCESS_TOKEN_NAME;

        AuthDataService.setUserData = function (data) {

            var def = $q.defer();

            $rootScope.username = data.user.firstname;
            localStorageService.set('user', data.user);
            this.setAccessToken(data.token || data[accessTokenName]);

            var expectedToken = this.getAccessToken();
            if( data.token === expectedToken) {
                def.resolve(true);
            }else{
                def.reject(false);
            }
            return def.promise;
        };

        AuthDataService.destroyUserData = function () {
            delete $rootScope.username;
            this.deleteAccessToken();
            localStorageService.remove('user');
            return true;
        };

        AuthDataService.logout = function () {
            return this.destroyUserData();
        };

        AuthDataService.getCurrentUser = function () {
            return localStorageService.get('user');
        };

        AuthDataService.getAccessToken = function () {

            function getCookie(cname) {
                var name = cname + "=";
                var decodedCookie = decodeURIComponent(document.cookie);
                var ca = decodedCookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            }

            return getCookie(accessTokenName);
        };

        AuthDataService.setAccessToken = function (accessToken) {
            var domainName = '.' + $rootScope.domainHost;
            if ($rootScope.domainHost == 'localhost') {
                domainName = 'localhost';
            }

            var expiration_date = new Date();
            expiration_date.setFullYear(expiration_date.getFullYear() + 1);

            document.cookie = accessTokenName + "=" + accessToken + "; domain=" + domainName + "; path=/; expires=" + expiration_date.toUTCString();
        };

        AuthDataService.deleteAccessToken = function () {

            var domainName = '.' + $rootScope.domainHost;
            if ($rootScope.domainHost == 'localhost') {
                domainName = 'localhost';
            }

            document.cookie = accessTokenName + "=" + "; domain=" + domainName + "; path=/" + ";expires=-1";
        };

        AuthDataService.isLoggedIn = function () {
            var token = this.getAccessToken();
            if (token) {
                var currentUser = this.getCurrentUser();
                if (_.isObject(currentUser) && !_.isEmpty(currentUser)) {
                    return true;
                }
            }
            return false;
        };

        AuthDataService.checkGoogle = function () {

            var def = $q.defer();
            try {
                gapi.load('auth2', function () {
                    auth2 = gapi.auth2.init({
                        client_id: '345059472892-1fae8hutprcgcg3gk0i1dvdconjarcr0.apps.googleusercontent.com',
                        fetch_basic_profile: true,
                        scope: 'profile',
                        onInit: function () {


                        }
                    });

                    auth2.then(
                        function () {
                            var userAuth = auth2.currentUser.get();
                        }
                    );

                });
            }catch(e){
                console.error('gapi/auth2 problem')
            }
            return def.promise;

        };

        AuthDataService.signOutFromGoogle = function () {

        };

        AuthDataService.signInWithGoogle = function () {

            gapi.load('auth2', function () {

                auth2 = gapi.auth2.init({
                    client_id: '345059472892-1fae8hutprcgcg3gk0i1dvdconjarcr0.apps.googleusercontent.com',
                    fetch_basic_profile: true,
                    scope: 'profile'
                });

                auth2.then(
                    //ok
                    function () {


                    }
                );

            });

        };

        AuthDataService.checkLogedInOutsideServices = function () {

            this.checkGoogle();

        };

        return AuthDataService;
    });

angular.module('digitalprint.services')
    .factory('AuthService', function ($rootScope, $q, $config, $http, AuthDataService, UserService) {
        var AuthService = {};
        AuthService = _.merge(AuthService, AuthDataService);

        AuthService.loginWithFacebook = function (credentials) {

            var _this = this;
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.AUTH_URL + 'login',
                data: $.param(credentials),
                params: {
                    domainName: location.hostname
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).success(function (data) {

                _this.setUserData(data).then(function (confirm) {
                    $rootScope.logged = true;
                    def.resolve(data);
                });

            }).error(function (data) {

                UserService.addSimple({
                    user: credentials.email,
                    name: credentials.name,
                    lastname: credentials.lastName
                }).then(
                    function (data) {

                        $http({
                            method: 'POST',
                            url: $config.AUTH_URL + 'login',
                            data: $.param(credentials),
                            params: {
                                domainName: location.hostname
                            },
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        }).success(function (data) {

                            _this.setUserData(data).then(function (confirm) {
                                $rootScope.logged = true;
                                def.resolve(data);
                            });

                        });

                    },
                    function (data) {

                        AuthService.logOutWithFacebook().then(
                            function () {
                                $state.go("home");
                            },function () {
                                $state.go("home");
                            }
                        );
                        def.reject(data);

                    }
                );

            });

            return def.promise;

        };


        AuthService.logOutWithFacebook = function () {

            var _this = this;
            var def = $q.defer();
            if((typeof FB)!='undefined'){
                FB.getLoginStatus(function (response) {

                    if (response.status == 'connected') {

                        FB.logout(function (res) {

                            def.resolve();

                        });

                    } else {

                        def.reject('Nie był zalogowany');

                    }

                });
            }else{
                def.reject('FB not exists');
            }


            return def.promise;

        };

        AuthService.logOutWithGoogle = function () {
            //TODO
            /*

            gapi.load('auth2', function () {

                auth2 = gapi.auth2.init({
                    client_id: '345059472892-1fae8hutprcgcg3gk0i1dvdconjarcr0.apps.googleusercontent.com',
                    fetch_basic_profile: true,
                    scope: 'profile'
                });

                auth2.then(
                    function () {

                        if (auth2.isSignedIn.get()) {

                            auth2.signOut();

                        }

                    }
                );

            });*/


        };


        AuthService.loginWithGoogle = function (credentials) {

            var _this = this;
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.AUTH_URL + 'login',
                data: $.param(credentials),
                params: {
                    domainName: location.hostname
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).success(function (data) {

                _this.setUserData(data).then(function (confirm) {
                    $rootScope.logged = true;
                    def.resolve(data);
                });

            }).error(function (data) {

                UserService.addSimple({
                    user: credentials.email,
                    name: credentials.name,
                    lastname: credentials.lastName
                }).then(
                    //ok
                    function (data) {

                        $http({
                            method: 'POST',
                            url: $config.AUTH_URL + 'login',
                            data: $.param(credentials),
                            params: {
                                domainName: location.hostname
                            },
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        }).success(function (data) {

                            _this.setUserData(data).then(function (confirm) {

                                    $rootScope.logged = true;
                                    def.resolve(data);
                                },
                                function (err) {

                                });

                        }).error(function (data) {


                        });

                    },

                    //FAIL
                    function (data) {

                        gapi.load('auth2', function () {

                            auth2 = gapi.auth2.init({
                                client_id: '345059472892-1fae8hutprcgcg3gk0i1dvdconjarcr0.apps.googleusercontent.com',
                                fetch_basic_profile: true,
                                scope: 'profile'
                            });

                            auth2.then(
                                function () {

                                    if (auth2.isSignedIn.get()) {

                                        auth2.signOut().then(
                                            // ok
                                            function () {


                                            }
                                        );
                                    }
                                }
                            );
                        });

                        def.reject(data);
                    }
                );

            });

            return def.promise;

        };

        AuthService.login = function (credentials) {
            var _this = this;
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.AUTH_URL + 'login',
                data: $.param(credentials),
                params: {
                    domainName: $rootScope.domainHost
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).success(function (data) {
                _this.setUserData(data).then(function (confirmResult) {
                    if(confirmResult){
                        def.resolve(data);
                    }
                    else{
                        def.reject(confirmResult);
                    }
                });

            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        AuthService.logout = function () {
            var _this = this;
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.AUTH_URL + ['logout'].join('/'),
                params: {
                    domainName: location.hostname
                }
            }).success(function (data) {
                AuthService.logOutWithGoogle();
                AuthService.logOutWithFacebook();
                AuthDataService.destroyUserData();
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });
            return def.promise;
        };

        AuthService.check = function () {
            var _this = this;
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + ['auth', 'check'].join('/')
            }).success(function (data) {
                if (data.response) {
                    _this.setUserData(data).then(function (confirm) {
                        def.resolve(data);
                    });
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        AuthService.addToCart = function (params) {
            var _this = this;
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.AUTH_URL + 'cart/add',
                data: $.param(params),
                params: {
                    domainName: location.hostname
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        AuthService.getSessionCarts = function () {
            var _this = this;
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.AUTH_URL + 'cart/get',
                params: {
                    domainName: location.hostname
                }
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        AuthService.sendSMData = function (data) {
            var _this = this;
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.AUTH_URL + 'socialLogin',
                data: $.param(data),
                params: {
                    domainName: $rootScope.domainHost
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).success(function (data) {
                _this.setUserData(data).then(function (confirm) {
                    def.resolve(data);
                });
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        AuthService.cleanSession = function (params) {
            var _this = this;
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.AUTH_URL + 'cleanSession',
                params: {
                    domainName: location.hostname
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        AuthService.updateDefaultAddress = function (param) {
            var _this = this;
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.AUTH_URL + 'cart/updateDefaultAddress',
                params: {
                    domainName: location.hostname
                },
                data: $.param(param),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        AuthService.readCookie = function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        };

        return AuthService;
    });
