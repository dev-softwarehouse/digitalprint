'use strict';

angular.module('dpClient.app')
    .controller('index.ConfirmNewsletter', function ($rootScope, $scope, $state, $filter, Notification,
                                                     SettingService) {

        var Setting = new SettingService('general');

        $scope.confirmation = {};

        function init() {
            console.log( $state.params );
            Setting.confirmNewsletter($state.params.token).then(function(data) {
                if( data.response === true ) {
                    $scope.confirmation.success = data.info;
                } else {
                    $scope.confirmation.error = data.info;
                }
            });
        }

        init();

    });
