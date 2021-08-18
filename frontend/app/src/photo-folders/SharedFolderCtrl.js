/**
 * Created by Rafał on 24-05-2017.
 */
angular.module('dpClient.app')
    .controller('photo-folders.SharedFolderCtrl', function ($scope, $stateParams, PhotoFolderService, $filter,
                                                            Notification, $state) {

        $scope.actualPhoto = {};
        $scope.folderId = $stateParams.folderid;
        $scope.source = $stateParams.source;
        $scope.folder = {};
        $scope.photos = [];

        $scope.rating = {
            current: 0,
            max: 5
        };

        $scope.getSelectedRating = function (rating) {
            console.log(rating);
        };

        function init() {

            if( $scope.source === 'mail' ) {
                PhotoFolderService.getSharedByEmail($scope.folderId).then( function(data) {
                    console.log(data);
                });
            } else if( $scope.source === 'facebook' ) {
                PhotoFolderService.getSharedByFacebook($scope.folderId).then( function(data) {
                    $scope.folder = data;
                    $scope.photos = data.imageFiles;
                });
            }
        }

        init();

        $scope.send = function(  ) {

            var password = $scope.form.password;

            PhotoFolderService.getSharedByEmail($scope.folderId, password).then( function(data) {
                $scope.folder = data;
                $scope.photos = data.imageFiles;
            });

        };

        $scope.selectPhoto = function(photo) {
            $scope.actualPhoto = photo;
        };

        $scope.nextPhoto = function(photo) {
            var idx = _.findIndex($scope.photos, {_id: photo._id});
            if( idx > -1 ) {
                if( $scope.photos[idx+1] !== undefined ) {
                    $scope.actualPhoto = $scope.photos[idx+1];
                }
            }
        };

        $scope.previousPhoto = function(photo) {
            var idx = _.findIndex($scope.photos, {_id: photo._id});
            if( idx > -1 ) {
                if( $scope.photos[idx-1] !== undefined ) {
                    $scope.actualPhoto = $scope.photos[idx-1];
                }
            }
        };

        $scope.nextExist = function(photo) {
            var idx = _.findIndex($scope.photos, {_id: photo._id});
            if( idx > -1 ) {
                if( $scope.photos[idx+1] !== undefined) {
                    return true;
                }
            }
            return false;
        };

        $scope.previousExist = function(photo) {
            var idx = _.findIndex($scope.photos, {_id: photo._id});
            if( idx > -1 ) {
                if( $scope.photos[idx-1] !== undefined) {
                    return true;
                }
            }
            return false;
        };

    });