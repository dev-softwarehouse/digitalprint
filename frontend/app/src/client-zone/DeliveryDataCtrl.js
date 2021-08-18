'use strict';

angular.module('dpClient.app')
    .controller('client-zone.DeliveryDataCtrl', function ($scope, $rootScope, DpAddressService, CountriesService,
                                                          Notification, $filter, $config, $modal, TemplateRootService,
                                                          RegisterWidget) {

        $scope.countries = [];
        $scope.addresses = [];

        function init() {
            getAddresses();
            CountriesService.getAll().then( function(dataCountries) {
                $scope.countries = dataCountries;
            });
        }

        function getAddresses() {
            DpAddressService.getAddresses(1).then(function (data) {
                $scope.addresses = data;
            });
        }

        init();

        $scope.addressEdit = function( address ) {
            TemplateRootService.getTemplateUrl(65).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function($scope, $modalInstance) {

                        $scope.modalForm = address;

                        $scope.save = function(  ) {

                            DpAddressService.editUserAddress( $scope.modalForm, $scope.modalForm.ID ).then(function( data ) {

                                if(data.response === true) {

                                    var idx = _.findIndex($scope.addresses, {ID: data.item.ID});
                                    if( idx > -1 ) {
                                        $scope.addresses[idx] = data.item;
                                    }
                                    Notification.success($filter('translate')('successfully_edited'));
                                    $modalInstance.close();
                                } else {
                                    Notification.error($filter('translate')('error'));
                                }

                            }, function() {
                                Notification.error($filter('translate')('error'));
                            });

                        };

                        $scope.cancel = function() {
                            $modalInstance.close();
                        };

                        $scope.$watch('modalForm.countryCode', function (code, oldVal) {
                            RegisterWidget.findFormAreaCode(
                                $scope,
                                'modalForm',
                                code,
                                oldVal
                            );
                        }, true);

                    }
                });
            });
        };

        $scope.addressRemove = function(address) {
            DpAddressService.remove(address.ID).then(function(removedData) {
                if( removedData.response ) {
                    var idx = _.findIndex($scope.addresses, {ID: address.ID});
                    if( idx > 0 ) {
                        $scope.addresses.splice(idx, 1);
                    }
                    Notification.success($filter('translate')('deleted_successful'))
                } else {
                    Notification.error($filter('translate')('error'));
                }
            }, function() {
                Notification.error($filter('translate')('error'));
            });
        };

        $scope.add = function() {
            DpAddressService.addAddress($scope.form, 1).then( function(data) {
                if(data.response === true) {
                    $scope.addresses.push(data.item);
                    $scope.form = {};
                    Notification.success($filter('translate')('added'));
                } else {
                    Notification.error($filter('translate')('error'));
                }
            }, function() {
                Notification.error($filter('translate')('error'));
            });
        };

        $scope.$watch('form.countryCode', function (code, oldVal) {
            RegisterWidget.findFormAreaCode(
                $scope,
                'form',
                code,
                oldVal
            );
        }, true);

    });
