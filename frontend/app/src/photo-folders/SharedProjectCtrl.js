/**
 * Created by Rafał on 27-07-2017.
 */
angular.module('dpClient.app')
    .controller('photo-folders.SharedProjectCtrl', function ( $scope, $stateParams, EditorProjectService, Notification,
                                                              $filter) {


        $scope.projectId = $stateParams.projectid;
        $scope.source = $stateParams.source;

        $scope.send = function () {

            EditorProjectService.shareMyProject(this.form.email, $scope.projectId).then(
                function (data) {
                    Notification.success($filter('translate')('success'));
                }
            );

        };

        $scope.sendFb = function() {

            EditorProjectService.shareMyProjectByFb($scope.projectId).then(
                function (data) {
                    if( data.link ) {
                        Notification.success($filter('translate')('success'));
                        window.location.href = 'http://' + data.link;
                    } else {
                        Notification.error($filter('translate')('error'));
                    }

                }
            );
        };

    });