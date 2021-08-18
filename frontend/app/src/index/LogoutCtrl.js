'use strict';

angular.module('dpClient.app')
    .controller('index.LogoutCtrl', function($rootScope, $scope, $state, $filter, AuthService,
                                             Notification, localStorageService, TokenService, LogoutService) {

	function init(){

		 AuthService.logout().then( function( res ) {

            if( res.logout ) {
                TokenService.getNonUserToken().then(function(data) { 
                    
                    $rootScope.logged = false;
                    $rootScope.oneTimeUser = false;
                    $rootScope.orderID = null;
                    if( !$rootScope.logged ) {
                        Notification.info( $filter('translate')('you_are_loggedout') );
                        AuthService.setAccessToken(data.token);
                        $state.go('login');
                    }
                });
                
            } else {
                Notification.error( $filter('translate')('unexpected_error') );
            }
            
        }, function() {
        	Notification.error( $filter('translate')('unexpected_error') );
        });
	}

	init();
});