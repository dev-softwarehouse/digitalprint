angular.module('dpClient.helpers')
    .directive('ngConfirmClick', [
        function () {
            return {
                restrict: 'A',
                replace: false,
                link: function (scope, element, attr) {

                    var clickAction = attr.ngConfirmClick;

                    element.bind('click', function (event) {
                        scope.open();

                        scope.onConfirm = function () {
                            scope.$eval(clickAction)
                        }
                    });
                },
                controller: function ($scope, $rootScope, $filter, $modal, $sce, $attrs, $config) {

                    var clickAction = $attrs.ngConfirmClick;

                    $scope.open = function () {
                        $modal.open({
                            scope: $scope,
                            templateUrl: $config.API_URL + 'templates/getFile/' + '35' + '?companyID=' + $rootScope.companyID,
                            controller: function ($scope, $modalInstance) {
                                $scope.title = $sce.trustAsHtml($attrs.confirmTitle) || $filter('translate')('confirm');
                                $scope.description = $sce.trustAsHtml($filter('translate')($attrs.confirmText)) || $sce.trustAsHtml($filter('translate')('irreversible_remove'));

                                $scope.confirm = function () {
                                    $scope.onConfirm();
                                    $modalInstance.close();
                                }

                            }
                        });
                    }

                }
            };
        }]);