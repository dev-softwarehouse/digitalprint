/**
 * Created by Rafał Leśniak on 30.08.17.
 */
'use strict';
angular.module('dpClient.app')
    .controller('client-zone.SearchCtrl', function ($scope, $stateParams, $rootScope, PhotoFolderService, $state) {

        $scope.q = $stateParams.q;
        $scope.subject = $stateParams.subject;

        $scope.photos = [];

        function init() {
            if( $stateParams.subject === 'tag' ) {
                PhotoFolderService.findPhoto($scope.q).then( function(searchData) {
                    $scope.photos = searchData;
                    _.each(searchData, function(photo) {
                        fillPhotoRating(photo);
                    });
                });
            } else if ( $stateParams.subject === 'author' ) {
                PhotoFolderService.getImageByAuthor($scope.q).then( function(searchData) {
                    $scope.photos = searchData;
                    _.each(searchData, function(photo) {
                        fillPhotoRating(photo);
                    });
                });
            } else if ( $stateParams.subject === 'place' ) {
                PhotoFolderService.getImageByPlace($scope.q).then( function(searchData) {
                    $scope.photos = searchData;
                    _.each(searchData, function(photo) {
                        fillPhotoRating(photo);
                    });
                });
            } else if ( $stateParams.subject === 'person' ) {
                PhotoFolderService.getImageByPeoples($scope.q).then( function(searchData) {
                    $scope.photos = searchData;
                    _.each(searchData, function(photo) {
                        fillPhotoRating(photo);
                    });
                });
            } else if ( $stateParams.subject === 'rating' ) {
                var rating = $scope.q.split('-');
                PhotoFolderService.getImageByRating(rating[0], rating[1]).then( function(searchData) {
                    $scope.photos = searchData;
                    _.each(searchData, function(photo) {
                        fillPhotoRating(photo);
                    });
                });
            }

        }

        function fillPhotoRating(photo) {
            photo.stars = [];
            for (var i = 5; i > 0; i--) {
                photo.stars.push({
                    filled: i <= photo.averageRate
                });
            }
        }

        $scope.selectPhoto = function (photo) {
            $scope.actualPhoto = photo;
        };

        $scope.nextPhoto = function (photo) {
            if( photo === undefined ) {
                return;
            }
            var idx = _.findIndex($scope.photos, {_id: photo._id});
            if (idx > -1) {
                if ($scope.photos[idx + 1] !== undefined) {
                    $scope.actualPhoto = $scope.photos[idx + 1];
                }
            }
        };

        $scope.previousPhoto = function (photo) {
            if( photo === undefined ) {
                return;
            }
            var idx = _.findIndex($scope.photos, {_id: photo._id});
            if (idx > -1) {
                if ($scope.photos[idx - 1] !== undefined) {
                    $scope.actualPhoto = $scope.photos[idx - 1];
                }
            }
        };

        $scope.nextExist = function (photo) {
            if( photo === undefined ) {
                return;
            }
            var idx = _.findIndex($scope.photos, {_id: photo._id});
            if (idx > -1) {
                if ($scope.photos[idx + 1] !== undefined) {
                    return true;
                }
            }
            return false;
        };

        $scope.previousExist = function (photo) {
            if( photo === undefined ) {
                return;
            }
            var idx = _.findIndex($scope.photos, {_id: photo._id});
            if (idx > -1) {
                if ($scope.photos[idx - 1] !== undefined) {
                    return true;
                }
            }
            return false;
        };

        $scope.goToFolder = function(photo) {

            PhotoFolderService.getImageFolder(photo._id).then( function(data) {
               if( data && data._id !== undefined ) {
                   $state.go('client-zone-my-photos', {folderid: data._id});
               }
            });

        };

        init();

    });