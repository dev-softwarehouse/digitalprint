/**
 * Created by Rafał on 09-05-2017.
 */
angular.module('dpClient.helpers')
    .directive('ngAction', [
        function(){
            return {
                restrict: 'A',
                scope: {
                    'ngAction': '='
                },
                link: function(scope, el, attrs) {
                    scope.$watch('ngAction', function (action) {
                        el[0].action = action;
                    });
                }
            };
        }]);