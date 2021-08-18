'use strict';

/**
 * @ngdoc function
 * @name dpClient.app.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the dpClient.app
 */
angular.module('dpClient.app')
  .controller('cart.CartVerifyCtrl', function ($scope, $rootScope, UserService, AuthService, TokenService,
                                               Notification, $filter, $location, $stateParams,
                                               DpOrderService, ClientZoneWidgetService ) {

      $scope.transactionConfirm = false;
      $scope.isOnline = false;
      $scope.wasOneTimeUser = false;
      $scope.products = [];
      $scope.order = {};

      var init = function () {

          var orderID;

          orderID = ($location.search()).orderID;
          if( !orderID ) {
              orderID = $stateParams.orderid;
          }

          var urlParams = {};

          if( orderID === 'tinkoff' ) {
              urlParams = {
                  OrderId: $location.search().OrderId,
                  PaymentId: $location.search().PaymentID
              };
          }
          if( ($location.search()).provider === 'paypal' ) {
              urlParams = {
                  token: $location.search().token,
                  PayerID: $location.search().PayerID
              };
          }
          if( ($location.search()).orderId !== undefined ) {
              urlParams.orderId = ($location.search()).orderId;
          }

          DpOrderService.sendPaymentStatus(orderID, urlParams).then(function ( statusResponse ) {

              $rootScope.$emit('CreditLimit:reload', true);

              $scope.products = statusResponse.products;
              if( statusResponse.orderInfo ) {
                  $scope.order.finalPrice = statusResponse.orderInfo.finalPrice;
                  $scope.order.currency = statusResponse.orderInfo.currency;
                  $scope.order.ID = statusResponse.orderInfo.orderID;
              }

              if( statusResponse.paymentOnline == true ) {
                  $scope.isOnline = true;
              }

              if( statusResponse.paymentStatus == true ) {
                  $scope.transactionConfirm = true;
              }

              ClientZoneWidgetService.getPayments().then(function (paymentsData) {
                  $scope.payments = paymentsData;

                  if( statusResponse.order != undefined  ) {
                      $scope.selectedPayment = _.findWhere(paymentsData, {ID: statusResponse.order.paymentID});
                  }

              });

              UserService.checkOneTimeUser().then(function (data) {
                  if (data.response == true) {

                      AuthService.logout().then(function (res) {

                          if (res.logout) {

                              TokenService.getNonUserToken().then(function (data) {
                                  $rootScope.logged = false;
                                  $rootScope.oneTimeUser = false;
                                  $scope.wasOneTimeUser = true;
                                  $rootScope.orderID = null;
                                  if (!$rootScope.logged) {
                                      AuthService.setAccessToken(data.token);
                                  }
                              });

                          } else {
                              Notification.error($filter('translate')('unexpected_error'));
                          }

                      }, function () {
                          Notification.error($filter('translate')('unexpected_error'));
                      });

                  }
              });
          });


      };

      init();

});
