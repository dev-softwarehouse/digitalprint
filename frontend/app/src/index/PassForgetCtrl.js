/**
 * Created by rafal on 06.02.17.
 */
'use strict';

angular.module('dpClient.app')
.controller('index.PassForgetCtrl', function($rootScope, $scope, $state, $filter, AuthService, Notification, UserService) {

    function init(){


    }

    init();

    $scope.passForget = function() {

        UserService.passForget($scope.email).then( function(data) {
            if( data.response ) {
                Notification.success($filter('translate')("new_password_sent"));
                $state.go('login');
            } else {
                Notification.error($filter('translate')("error"));
            }
        }, function(data) {
            Notification.error($filter('translate')("error"));
        });

    }
});