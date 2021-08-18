/**
 * Created by Rafał on 24-05-2017.
 */
angular.module('dpClient.helpers')
.directive('ngStarRating', function (PhotoFolderService, $rootScope, Notification, $filter) {
    return {
        restrict: 'A',
        template: '<ul class="rating">' +
        '<li ng-repeat="star in stars[itemId]" ng-class="star" ng-click="toggle(itemId, $index)">' +
        '<i class="fa fa-star" aria-hidden="true"></i>' +
        '</li>' +
        '</ul>',
        scope: {
            ratingValue: '=',
            max: '=',
            onRatingSelected: '&',
            itemId: '=',
            type: '@'
        },
        link: function (scope, elem, attrs) {

            scope.stars = {};

            var initStars = function() {

                console.log(scope.type);

                var filledRate = Math.round(scope.ratingValue);

                scope.stars[scope.itemId] = [];

                for (var i = scope.max; i > 0; i--) {
                    scope.stars[scope.itemId].push({
                        filled: i <= filledRate
                    });
                }
            };

            initStars();

            scope.toggle = function (id, index) {

                if( !$rootScope.logged ) {
                    Notification.warning($filter('translate')('login_to_rate'));
                    return;
                }
                var newIndex = scope.max - index;

                if( scope.type === 'photo' ) {
                    PhotoFolderService.votePhoto(id, newIndex).then(function(data) {
                        colorStars(scope, id, data.averageRate);
                        updateRate(scope, id, data.averageRate);
                    });
                } else if ( scope.type === 'folder' ) {
                    PhotoFolderService.voteFolder(id, newIndex).then(function(data) {
                        colorStars(scope, id, data.averageRate);
                        updateRate(scope, id, data.averageRate);
                    });
                }
            };

            function colorStars(scope, id, averageRate) {
                scope.stars[id] = [];
                for (var i = scope.max; i > 0; i--) {
                    scope.stars[id].push({
                        filled: i <= averageRate
                    });
                }
            }

            function updateRate(scope, id, rate) {
                console.log(scope);
                if( scope.type === 'folder' ){
                    scope.$parent.folder.averageRate = rate;
                } else if( scope.type === 'photo' ) {
                    var photoIndex = _.findIndex(scope.$parent.photos, {_id: id});
                    if( photoIndex > -1 ) {
                        scope.$parent.photos[photoIndex].averageRate = rate;
                    }
                }
            }
        }
    }
});