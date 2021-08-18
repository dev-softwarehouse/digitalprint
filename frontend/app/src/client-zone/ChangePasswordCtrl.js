'use strict';

angular.module('dpClient.app')
.controller('client-zone.ChangePasswordCtrl', function ($scope, Notification, $filter, UserService) {

    function init() {
    }

    init();

    $scope.change = function () {

        if( $scope.form.pass !== $scope.form.confirmPass ) {
            Notification.error($filter('translate')('passwords_not_same'));
            return;
        }

        UserService.changePass($scope.form).then(function( data ) {
            if(data.response === true) {
                Notification.success($filter('translate')('successfully_edited'));
            } else {
                Notification.error($filter('translate')('error'));
            }
        }, function() {
            Notification.error($filter('translate')('error'));
        });

    }
});