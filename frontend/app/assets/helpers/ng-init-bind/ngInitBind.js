angular.module('dpClient.helpers')
    .directive('ngInitBind', function($compile) {
    return {
        restrict: 'A',
        link : function (scope, element, attr) {
            attr.$observe('ngBindHtml',function(){
                if(attr.ngBindHtml){
                    $compile(element[0].children)(scope);
                }
            })
        }
    };
});