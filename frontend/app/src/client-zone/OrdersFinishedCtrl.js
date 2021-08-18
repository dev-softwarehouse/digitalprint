/**
 * Created by Rafał on 01-03-2017.
 */
'use strict';
angular.module('dpClient.app')
    .controller('client-zone.OrdersFinishedCtrl', function ( $scope, $rootScope,
                                                            DeliveryWidgetService, $config, $modal,
                                                            ClientZoneWidgetService, FileUploader, ProductFileService,
                                                             AuthDataService, $filter, Notification, TemplateRootService,
                                                             InvoiceService, MainWidgetService, DpProductService,
                                                             CommonService) {


        $scope.isCollapsed = true;
        $scope.statuses = [];
        $scope.deliveries = [];
        $scope.addresses = [];
        $scope.senders = [];
        $scope.orders = [];
        $scope.firstStatus = {};

        $scope.pagingSettings = ClientZoneWidgetService.getPagingSettings();

        $scope.pageSizeSelect = ClientZoneWidgetService.getPageSizeSelect();

        var accessTokenName = $config.ACCESS_TOKEN_NAME;

        function init() {
            ClientZoneWidgetService.getStatuses().then(function (statuses) {
                $scope.statuses = statuses;
                $scope.firstStatus = _.findWhere(statuses, {type: 1});
                ClientZoneWidgetService.clearParams();
                ClientZoneWidgetService.addParam('statusType', 2);
                ClientZoneWidgetService.getCommonData(statuses).then( function(commonData) {
                    $scope.deliveries = commonData.deliveries;
                    $scope.addresses = commonData.addresses;
                    $scope.senders = commonData.senders;
                    $scope.pagingSettings.total = commonData.count;
                    commonData.orders = ClientZoneWidgetService.mergeFiles(commonData.orders);
                    $scope.orders = commonData.orders;
                });
            });

            ClientZoneWidgetService.orderMessageInfo($scope);
        }

        $scope.getNextPage = function( page ) {
            var params = {'statusType': 2};
            params.offset = (page-1)*$scope.pagingSettings.pageSize;
            params.limit = $scope.pagingSettings.pageSize;
            ClientZoneWidgetService.getOrders($scope.statuses, params).then( function(ordersData) {
                ordersData = ClientZoneWidgetService.mergeFiles(ordersData);
                $scope.orders = ordersData;
            });
        };

        $scope.showDelivery = function (order, product) {
            TemplateRootService.getTemplateUrl(104).then(function (response) {
                $modal.open({
                    templateUrl: $config.API_URL + 'templates/getFile/' + '67' + '?companyID=' + $rootScope.companyID,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope, $rootScope, $modalInstance) {

                        $scope.addresses = [];

                        _.each(order.addresses, function(oneAddress) {
                            if(oneAddress.productID === product.productID) {
                                $scope.addresses.push(oneAddress);
                            }
                        });

                        $scope.cancel = function () {
                            $modalInstance.close();
                        }

                    }
                });
            });
        };

        $scope.uploadFiles = function (product) {
            TemplateRootService.getTemplateUrl(34).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    backdrop: true,
                    keyboard: false,
                    size: 'lg',
                    resolve: {
                        allowedExtensions: function () {
                            return CommonService.getAll().then(function (data) {
                                var extensions = [];
                                _.each(data, function(item) {
                                    extensions.push(item['extension']);
                                });

                                return extensions;

                            });
                        }
                    },
                    controller: function ($scope, $modalInstance, allowedExtensions) {

                        var header = {};
                        header[accessTokenName] = AuthDataService.getAccessToken()

                        var uploader = $scope.uploader = new FileUploader({
                            'url': ProductFileService.getUrl(product.productID),
                            'headers': header
                        });

                        uploader.filters.push({
                            name: 'imageFilter',
                            fn: function (item, options) {
                                var itemName = item.name.split('.');
                                var lastItem = itemName.pop().toLowerCase();

                                if (allowedExtensions.indexOf(lastItem) > -1) {
                                    return true;
                                }
                                Notification.warning($filter('translate')('required_ext') + allowedExtensions.join(', '));
                                return false;
                            }
                        });

                        uploader.onAfterAddingAll = function(addedItems) {
                            uploader.uploadAll();
                        };

                        uploader.onSuccessItem = function (fileItem, response, status, headers) {
                            response.file.size = (fileItem._file.size / 1024).toFixed(2);
                            product.fileList.push(response.file);
                            ProductFileService.makeMiniature(response.file.ID).then(function(responseMiniature) {
                                if( responseMiniature.response === true) {
                                    var fileIdx = _.findIndex(product.fileList, {ID: response.file.ID});
                                    if( fileIdx > -1 ) {
                                        product.fileList[fileIdx].minUrl = responseMiniature.minUrl;
                                        product.fileList[fileIdx].hasMiniature = true;
                                    }
                                }
                            });
                            product.lastFile = response.file;
                        };

                        uploader.onCompleteAll = function() {
                            $modalInstance.close();
                        };

                        $scope.cancel = function () {
                            if (uploader.isUploading) {
                                alert($filter('translate')('uploading_in_progress'));
                            } else {
                                $modalInstance.close();
                            }
                        }
                    }
                });
            });
        };

        $scope.removeFile = function (product, file) {
            ProductFileService.removeFile(product.productID, file.ID).then(function (response) {
                if (response.response) {
                    Notification.info($filter('translate')('removed') + ' ' + response.removed_item.name);
                    product = ClientZoneWidgetService.removeFile(product, file);
                }
            });
        };

        $scope.doPayment = function (order) {
            TemplateRootService.getTemplateUrl(72).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    backdrop: true,
                    keyboard: false,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        order = ClientZoneWidgetService.getDeliveryPrice(order);

                        _.each( order.products, function(product) {
                            product.price = ClientZoneWidgetService.preparePrice(product.price);
                            product.grossPrice = ClientZoneWidgetService.preparePrice(product.grossPrice);
                        });

                        $scope.order = order;
                        $scope.payments = [];
                        $scope.preventPayment = false;
                        $scope.paymentsOffset = 0;

                        ClientZoneWidgetService.getPayments().then(function (paymentsData) {
                            $scope.paymentsOffset = (4 % paymentsData.length) * 3;
                            $scope.payments = paymentsData;

                            $scope.selectedPayment = _.findWhere(paymentsData, {ID: order.paymentID});
                        });

                        $scope.paymentConfirm = function ( paymentID ) {
                            $scope.preventPayment = true;

                            ClientZoneWidgetService.payment({paymentID: paymentID}, order.ID).then(function (paymentResponse) {

                                if (_.isEmpty(paymentResponse.payment)) {
                                    $scope.preventPayment = false;
                                }

                                if (paymentResponse.response === false && paymentResponse.paid === true) {
                                    order.paid = 1;
                                    Notification.info($filter('translate')('order_already_paid'));
                                    $modalInstance.close();
                                } else if (paymentResponse.response === true && !_.isEmpty(paymentResponse.payment)) {
                                    if (paymentResponse.payment.status.statusCode === "SUCCESS") {
                                        window.location.href = paymentResponse.payment.redirectUri;
                                    }
                                    if (paymentResponse.payment.status === 'NEW' && paymentResponse.payment.operator === 'tinkoff' ) {
                                        window.location.href = paymentResponse.payment.url;
                                    }
                                } else if (paymentResponse.response === true && paymentResponse.paymentChanged === true) {
                                    Notification.info($filter('translate')('payment_method_changed'));
                                    order.paymentID = paymentID;
                                    $scope.selectedPayment = _.findWhere($scope.payments, {ID: order.paymentID});
                                } else if (paymentResponse.response === false) {
                                    Notification.info(paymentResponse.info);
                                }

                            });
                        }

                    }
                });
            });

        };

        $scope.changeLimit = function( newLimit ) {
            $scope.pagingSettings.pageSize = newLimit;
            $scope.getNextPage(1);
        };

        $scope.getOrderInvoice = function ( order ) {
            InvoiceService.getForUser(order.ID).then(function (data) {
                var fileName = "invoice_" + order.ID + ".pdf";
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                var file = new Blob([data], {type: 'application/pdf'});
                var fileURL = window.URL.createObjectURL(file);
                a.href = fileURL;
                a.download = fileName;
                a.click();
            });
            return true;
        };

        $scope.formatSizeUnits = function(file) {
            return MainWidgetService.formatSizeUnits(file.size);
        };

        $scope.messages = function(order) {
            ClientZoneWidgetService.orderMessages($scope, order, 'order');
        };

        $scope.deleteProduct = function (order, product) {

            DpProductService.delete(product).then(function (data) {
                if (data.response === true) {

                    var idx = _.findIndex(order.products, {ID: product.ID});
                    if( idx > -1 ) {
                        Notification.success($filter('translate')('deleted_successful'));
                        order.products.splice(idx, 1);
                    }

                } else {
                    Notification.error($filter('translate')('error'));
                }
            });
        };

        $scope.restoreAccept = function (product) {

            var newFiles = product.fileList.filter(function( obj ) {
                return 0 === parseInt(obj.accept);
            });

            if( newFiles.length === 0 ) {
                Notification.warning($filter('translate')('should_upload_corrected_files'));
                return;
            }

            DpProductService.restoreAccept(product.productID).then(function (data) {
                if (data.response === true) {

                    product.fileList = product.fileList.filter(function( obj ) {
                        return -1 !== parseInt(obj.accept);
                    });
                    product.accept = 0;
                    Notification.success($filter('translate')('saved_message'));

                } else {
                    Notification.error($filter('translate')('error'));
                }
            });

        };

        init();
    });
