/**
 * Created by Rafał on 11-07-2017.
 */
angular.module('dpClient.helpers')
    .directive('ngPreLoader', function ($config, $rootScope) {
        return {
            restrict: 'A',
            template: '<div class="pre-loader" ng-show="preloaderOn">' +
            '<img ng-src="{{loader}}">' +
            '</div>',
            scope: {
                preloaderOn: '='
            },
            link: function (scope) {

                if( $rootScope.companyID ) {
                    scope.loader =  $config.STATIC_URL + '/' + $rootScope.companyID + '/images/pre-loader.gif';
                } else {
                    scope.loader = '';
                }


            }
        }
    });
