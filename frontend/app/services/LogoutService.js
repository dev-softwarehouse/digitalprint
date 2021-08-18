angular.module('digitalprint.services')
  .factory('LogoutService', function($rootScope, localStorageService, Notification, TokenService, AuthDataService, AuthService, $filter, $q){

      var LogoutService = {};

      LogoutService.destroyUserData = function () {
          delete $rootScope.username;
          AuthDataService.deleteAccessToken();
          localStorageService.remove('user');
          return true;
      };

      LogoutService.logout = function () {
          return this.destroyUserData();
      };

      LogoutService.init = function () {

          var def = $q.defer();

          AuthDataService.logout();
          Notification.info($filter('translate')('you_are_loggedout'));
          TokenService.getNonUserToken().then(function (data) {
              AuthService.setAccessToken(data.token);
              def.resolve(true);
          });

          return def.promise;
      };

      return LogoutService;

  });
