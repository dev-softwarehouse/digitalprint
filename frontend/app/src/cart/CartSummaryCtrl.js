'use strict';

/**
 * @ngdoc function
 * @name dpClient.app.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the dpClient.app
 */
angular.module('dpClient.app')
    .controller('CartSummaryCtrl', function($scope, $modal) {

        $scope.deliveryMethod = function(cart) {
            $modal.open({
                templateUrl: 'src/cart/templates/modalboxes/delivery-method.html',
                controller: function($scope) {
                    $scope.cart = cart;
                }
            })
        }
    });