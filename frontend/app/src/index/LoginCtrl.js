// used in unauthorized and base view
angular.module('dpClient.app')
    .controller('index.LoginCtrl', function ($rootScope, $scope, $state, $filter, $window, $http, UserService,
                                             AuthService, DomainService, DpAddressService, Notification,
                                             LoginWidgetService, SocialWidgetService) {

        if (!_.isUndefined($state.current.data)) {
            $rootScope.bodyClass = $state.current.data.bodyClass;
        }

        $rootScope.rememberLogin = false;

        $scope.login = function (credentials) {
            var backTo = {};
            if( $rootScope.startPoint ) {
                backTo.state = $rootScope.startPoint.state;
                backTo.params = $rootScope.startPoint.params;
            }
            LoginWidgetService.login(credentials, backTo);
        };

        $scope.check = function () {
            AuthService.check().then(function (data) {
                $rootScope.logged = true;
            }, function (data) {
                $rootScope.logged = false;
            });
        };

        $scope.getUser = function () {
            return AuthService.getCurrentUser();
        };

        $scope.passForget = function () {
            UserService.passForget($scope.email).then(function () {
                console.log('udało się zmienić email');
            }, function (data) {
                console.log('nie udało się zmienić maila');
            });
        };

        $scope.changeMail = function () {
            UserService.changeMail($scope.form).then(function (data) {
                console.log('udało się zmienić email');
            }, function (data) {
                console.log('nie udało się zmienić maila');
            });
        };

        $scope.loginFacebook = function () {

            SocialWidgetService.loginFacebook();

        };

        $scope.loginGoogle = function () {

            SocialWidgetService.loginGoogle();

        };

    });
