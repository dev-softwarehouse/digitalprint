'use strict';
angular.module('dpClient.routes')
    .config(['$locationProvider', '$stateProvider', '$urlRouterProvider',
        function($locationProvider, $stateProvider ) {

            var langCookie =  getCookie('lang');
            var lang = langCookie ? langCookie : defaultLangCode;

            var routesObject = JSON.parse(globalRoutes);

            lang = lang.replace(/["]+/g, '');

            if (typeof routesObject !== "undefined" && routesObject) {

                _.each(routesObject[lang], function (route) {
                    $stateProvider.state(route);
                });

            }else{
                console.error('Problem with routes')
            }

            function getCookie(cname) {
                var name = cname + "=";
                var decodedCookie = decodeURIComponent(document.cookie);
                var ca = decodedCookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            }

        }
    ]);
