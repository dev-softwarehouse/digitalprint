/**
 * Created by Rafał on 11-07-2017.
 */
angular.module('dpClient.helpers')
    .directive('ngMainPreLoader', function ($config, $rootScope) {
        return {
            restrict: 'A',
            template: '<div ng-if="preloaderIndex > 0 && !blockPreloader" id="mainLoader">' +
            '<div class="main-pre-loader">' +
            '<span></span>' +
            '</div>' +
            '</div>',
            scope: {},
            controller: function($scope) {

                $scope.preloaderIndex = 0;
                $scope.blockPreloader = false;
                $scope.counter = 0;
                $scope.stopPreloader = false;

                $scope.$on('loading:progress', function () {
                    if( !$scope.stopPreloader ) {
                        $scope.preloaderIndex++;
                        $scope.preLoaderActive = true;
                    }
                });

                $scope.$on('loading:finish', function () {
                    $scope.preloaderIndex--;
                    if( $scope.preloaderIndex < 1 ) {
                        $scope.counter++;
                    }
                    if( $scope.counter > 10 ) {
                        $scope.blockPreloader = true;
                    }
                    $scope.preLoaderActive = false;
                });

                $rootScope.$on('stopPreLoader', function() {
                    $scope.stopPreloader = true;
                });
            }
        }
    });