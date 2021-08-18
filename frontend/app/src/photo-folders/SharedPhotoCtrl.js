/**
 * Created by Rafał on 24-05-2017.
 */
/**
 * Created by Rafał on 24-05-2017.
 */
angular.module('dpClient.app')
    .controller('photo-folders.SharedPhotoCtrl', function ($scope, $stateParams, PhotoFolderService, $filter,
                                                           Notification, $state) {

        $scope.photoId = $stateParams.photoid;
        $scope.source = $stateParams.source;
        $scope.photo = {};

        function init() {

            console.log( $scope.photoId );
            console.log( $scope.source );

            if( $scope.source === 'mail' ) {
            } else if( $scope.source === 'facebook' ) {
                PhotoFolderService.getPhotoSharedByFacebook($scope.photoId).then( function(data) {
                    $scope.photo = data;
                });
            }
        }

        init();

        $scope.send = function(  ) {

            var password = $scope.form.password;

            PhotoFolderService.getPhotoSharedByEmail($scope.photoId, password).then( function(data) {
                $scope.photo = data;
            });

        };

        $scope.selectPhoto = function(photo) {
            $scope.actualPhoto = photo;
        };

    });
