/**
 * Created by Rafał on 19-06-2017.
 */
angular.module('dpClient.helpers')
    .directive('ngStaticContents', function ( StaticContentService, $rootScope, $interpolate ) {

        return {
            restrict: 'A',
            template: '<div ta-bind ng-model="contentObject.contents[$root.currentLang.code]"></div>',
            scope: {
                content: '@'
            },
            link: function (scope, elem, attrs) {

                scope.contentObject = {};

                StaticContentService.getContent(scope.content).then(function(data) {
                    scope.contentObject.contents = {};

                    if( $rootScope.currentLang ) {
                        scope.contentObject.contents[$rootScope.currentLang.code] = '';
                    }

                    _.each(data.contents, function(content, lang) {
                        content = $interpolate(content)(scope);
                        scope.contentObject.contents[lang] = content;
                    });
                });

            }
        }
    });
