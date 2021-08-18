/**
 * Created by rafal on 01.02.17.
 */
'use strict';

angular.module('dpClient.app')
    .controller('client-zone.InvoiceDataCtrl', function ($scope, $rootScope, DpAddressService, CountriesService,
                                                         Notification, $filter) {

        $scope.countries = [];

        function init() {
            getDefaultAddress();
        }

        function getDefaultAddress() {
            DpAddressService.getDefaultAddress(2).then(function (data) {
                $scope.form = data.address;
                CountriesService.getAll().then( function(dataCountries) {
                    $scope.countries = dataCountries;
                });
            });
        }

        init();

        $scope.edit = function () {

            $scope.form.type = 2;
            $scope.form.default = 1;

            DpAddressService.editUserAddress($scope.form, $scope.form.ID).then(function( data ) {
                if(data.response === true) {
                    Notification.success($filter('translate')('successfully_edited'));
                } else {
                    Notification.error($filter('translate')('error'));
                }

            }, function() {
                Notification.error($filter('translate')('error'));
            });

        }
    });
