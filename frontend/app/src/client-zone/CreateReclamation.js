/**
 * Created by Rafał on 01-09-2017.
 */
'use strict';

angular.module('dpClient.app')
    .controller('client-zone.CreateReclamationCtrl', function ($q, $scope, $rootScope, Notification, $filter,
                                                               ReclamationService, FileUploader, AuthDataService,
                                                               $stateParams, DpProductService, MainWidgetService,
                                                               $config) {

        $scope.faults = [];
        $scope.uploadProgress = 0;
        $scope.orderID = $stateParams.orderid;
        $scope.form = {};
        $scope.reclamationExist = false;
        $scope.reclamation = {};
        $scope.products = [];

        var accessTokenName = $config.ACCESS_TOKEN_NAME;

        var header = {};
        header[accessTokenName] = AuthDataService.getAccessToken();

        $scope.uploader = new FileUploader({
            'headers': header,
            'autoUpload ': true
        });

        $scope.uploader.onProgressAll = function (progress) {
            $scope.uploadProgress = progress;
        };

        $scope.uploader.filters.push({
            name: 'imageFilter',
            fn: function (item, options) {
                var itemName = item.name.split('.');
                var lastItem = itemName.pop();
                var possibleExtensions = ['jpg', 'jpeg'];

                if (possibleExtensions.indexOf(lastItem) > -1) {
                    return true;
                }
                Notification.warning($filter('translate')('required_ext') + possibleExtensions.join(','));
                return false;
            }
        });

        $scope.save = function () {

            if( this.form.products === undefined || this.form.products.length === 0) {
                Notification.error($filter('translate')('select_at_least_one_product'));
                return;
            }

            var sum = _.reduce(this.form.faults, function (memo, num) {
                if (num === true) {
                    return ++memo;
                }
                return memo;
            }, 0);

            if (sum === 0) {
                Notification.error($filter('translate')('select_fault_description'));
                return;
            }

            ReclamationService.add(this.form, $scope.orderID).then(function (data) {
                if (data.response === true) {

                    if( $scope.uploader.queue.length > 0 ) {
                        changeUrl( data.item.ID ).then( function() {
                            $scope.uploader.uploadAll();
                            $scope.uploader.onCompleteAll  = function() {
                                findReclamation();
                                Notification.success($filter('translate')('reclamation_created'));
                            }
                        });
                    } else {
                        findReclamation();
                        Notification.success($filter('translate')('reclamation_created'));
                    }

                }
            }, function (data) {
                Notification.error($filter('translate')('error'));
            });

        };

        function changeUrl(reclamationID) {

            var def = $q.defer();

            _.each($scope.uploader.queue, function(item, index) {
                item.url = ReclamationService.getUploadUrl(reclamationID);
                if( index === $scope.uploader.queue.length-1 ) {
                    def.resolve(true);
                }
            });

            return def.promise;
        }

        $scope.formatSizeUnits = function (bytes) {
            return MainWidgetService.formatSizeUnits(bytes);
        };

        $scope.removeFile = function(fileItem) {
            fileItem.remove();
        };

        function init() {
            ReclamationService.getFaults().then(function (data) {
                $scope.faults = data;
                $scope.form.faults = {};
                _.each(data, function (item) {
                    $scope.form.faults[item.ID] = false;
                });
            });
            findReclamation();
            DpProductService.getByOrder($scope.orderID).then( function( productData ) {
                $scope.products = productData;
            });
        }

        function findReclamation() {
            ReclamationService.findByOrder($scope.orderID).then( function( reclamation ) {
                if( reclamation && reclamation.ID ) {
                    $scope.reclamationExist = true;
                    $scope.reclamation = reclamation;
                }
            }, function( error ) {
                $scope.reclamationExist = false;
            });
        }

        init();

    });