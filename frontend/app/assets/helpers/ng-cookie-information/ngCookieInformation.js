/**
 * Created by Rafał Leśniak on 30.08.17.
 */
angular.module('dpClient.helpers')
    .directive('ngCookieInformation', function ($config, $rootScope, $cookieStore) {
        return {
            restrict: 'A',
            template: '<div ng-if="!cookieAccepted" id="cookie-block">' +
            '<div class="cookie-info">' +
            '<div ng-static-contents class="staticContentBox" content="cookie.info"></div>' +
            '</div>' +
            '<a ng-click="acceptCookie()" class="cookies-close"><i class="fa fa-times-circle" aria-hidden="true"></i></a>' +
            '</div>',
            scope: {},
            controller: function($scope) {

                $scope.cookieAccepted = false;

                if ( $cookieStore.get('cookieAccepted')) {
                    $scope.cookieAccepted = true;
                }

                $scope.acceptCookie = function() {
                    $scope.cookieAccepted = true;
                    var domainName = '.' + $rootScope.domainHost;
                    if ($rootScope.domainHost === 'localhost') {
                        domainName = 'localhost';
                    }
                    var expiration_date = new Date();
                    expiration_date.setMonth(expiration_date.getMonth() + 1);

                    document.cookie = "cookieAccepted=true; domain=" + domainName + "; path=/; expires=" + expiration_date.toUTCString();
                };


            }
        }
    });
