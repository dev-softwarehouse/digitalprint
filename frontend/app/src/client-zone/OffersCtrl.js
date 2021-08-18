'use strict';

angular.module('dpClient.app')
    .controller('client-zone.OffersCtrl', function ($scope, $rootScope, $q, ClientZoneWidgetService, DpOrderService,
                                                    AddressService, $filter, DeliveryService, DeliveryWidgetService,
                                                    TemplateRootService, $modal, CommonService, $config,
                                                    AuthDataService, FileUploader, ProductFileService, Notification,
                                                    MainWidgetService, $timeout, PaymentService, AuthService, $state,
                                                    $stateParams ) {

        $scope.offers = [];

        $scope.pagingSettings = ClientZoneWidgetService.getPagingSettings();

        $scope.pageSizeSelect = ClientZoneWidgetService.getPageSizeSelect();

        $scope.addresses = [];
        $scope.senders = [];
        $scope.deliveries = [];

        var accessTokenName = $config.ACCESS_TOKEN_NAME;

        if( $stateParams.offerID ) {
            $scope.pagingSettings.offerID = $stateParams.offerID;
        }

        function init() {

            getDeliveries().then(function (deliveries) {

                $scope.deliveries = deliveries;

                getAddress().then(function (allAddress) {

                    $scope.addresses = allAddress.addresses;

                    _.each(allAddress.senders, function (item) {
                        item.name = $filter('translate')(item.name);
                        $scope.senders.push(item);
                    });

                    getOffersWithAdditionalData(1).then(function(offers) {
                         $scope.offers = offers;
                    });

                    countOffers().then(function (count) {
                        $scope.pagingSettings.total = count;
                    });

                });

            });

            ClientZoneWidgetService.offerMessageInfo($scope);

        }

        function getOffersWithAdditionalData(page) {
            var def = $q.defer();

            getOffers(page).then(function (offers) {

                _.each(offers, function(offer, index) {

                    offer.payments = [];

                    offer.isCollapsed = true;

                    if( parseInt($scope.pagingSettings.offerID) === offer.ID ) {
                        offer.isCollapsed = false;
                    }

                    _.each(offer.products, function (product) {

                        product.deliveryLackOfVolume = 0;

                        DeliveryWidgetService.filterDeliveries($scope, product).then( function(filteredDeliveries) {

                            product.filteredDeliveries = filteredDeliveries;

                            product.addresses[0].addressID = $scope.addresses[0].ID;
                            product.addresses[0].senderID = $scope.senders[0].type;
                            product.addresses[0].deliveryID = filteredDeliveries[0].ID;
                            product.addresses[0].allVolume = product.volume;
                            if( product.amount > 1 ) {
                                product.addresses[0].allVolume *= product.amount;
                            }

                            DeliveryWidgetService.getPkgWeight(product, product.addresses[0], filteredDeliveries);

                        });


                    });

                    if( offers.length === (index + 1) ) {
                        def.resolve(offers);
                    }
                });

            });
            return def.promise;
        }

        var getAddress = function () {
            var def = $q.defer();

            AddressService.getForUser().then(function (data) {
                def.resolve(data);
            });

            return def.promise;
        };

        var getDeliveries = function () {
            var def = $q.defer();

            DeliveryService.getAll().then(function (data) {
                def.resolve(data);
            });

            return def.promise;
        };

        function getOffers(page) {
            var def = $q.defer();

            var params = {
                'isOffer': 1,
                'offerStatus': 1
            };

            if( $scope.pagingSettings.offerID !== undefined ) {
                params.ID = $scope.pagingSettings.offerID;
            }

            params.offset = (page - 1) * $scope.pagingSettings.pageSize;
            params.limit = $scope.pagingSettings.pageSize;

            DpOrderService.getMyZoneOffers(params).then(function (data) {
                def.resolve(data);
            }, function () {
                console.error('fetch error');
            });

            return def.promise;
        }

        function countOffers() {
            var def = $q.defer();

            var params = {
                'isOffer': 1,
                'offerStatus': 1
            };

            if( $scope.pagingSettings.offerID !== undefined ) {
                params.ID = $scope.pagingSettings.offerID;
            }

            ClientZoneWidgetService.countOrders(params).then(function (data) {
                def.resolve(data.count);
            }, function () {
                console.error('fetch error');
            });

            return def.promise;
        }

        $scope.getFlagClass = function (addresses, addressID) {
            var selectedAddress = _.findWhere(addresses, {ID: addressID});
            if (selectedAddress) {
                return 'flag-icon-' + selectedAddress.countryCode.toLowerCase();
            }
            return '';
        };

        $scope.search = function() {
            var _timeout;

            _timeout = $timeout(function() {
                $scope.getNextPage(1);
                _timeout = null;
            }, 500);
        };

        $scope.getNextPage = function (page) {
            getOffersWithAdditionalData(page).then(function(offers) {
                $scope.offers = offers;
            });

            countOffers().then(function (count) {
                $scope.pagingSettings.total = count;
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
                        header[accessTokenName] = AuthDataService.getAccessToken();

                        var uploader = $scope.uploader = new FileUploader({
                            'url': ProductFileService.getUrl(product.productID),
                            'headers': header
                        });

                        uploader.filters.push({
                            name: 'imageFilter',
                            fn: function (item, options) {
                                var itemName = item.name.split('.');
                                var lastItem = itemName.pop();

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

        $scope.formatSizeUnits = function (file) {
            return MainWidgetService.formatSizeUnits(file.size);
        };

        $scope.separateDelivery = function (product) {

            var newVolume = Number(this.separateVolume);

            if (Number(product.deliveryLackOfVolume) < 0) {
                product.deliveryLackOfVolume = 0;
            }
            if (newVolume <= 0 || _.isNaN(newVolume)) {
                Notification.error($filter('translate')('enter_volume'));
                return;
            }

            var availableVolumes = Number(product.addresses[0].allVolume + product.deliveryLackOfVolume);
            var diffVolume;

            if (newVolume === availableVolumes) {
                Notification.error($filter('translate')('enter_less_volume'));
                return;
            }
            if (newVolume > availableVolumes) {
                diffVolume = newVolume - availableVolumes;
                Notification.error($filter('translate')('volume_exceeded_by') + ' ' + diffVolume);
                return;
            }

            if (newVolume <= product.deliveryLackOfVolume) {
                product.deliveryLackOfVolume = Number(product.deliveryLackOfVolume - newVolume);
            } else {

                diffVolume = Number(newVolume - product.deliveryLackOfVolume);

                if (diffVolume === product.addresses[0].allVolume) {
                    Notification.error($filter('translate')('enter_less_volume'));
                    return;
                }

                if (diffVolume > product.addresses[0].allVolume) {
                    var over = Number(diffVolume - product.addresses[0].allVolume);
                    Notification.error($filter('translate')('volume_exceeded_by') + ' ' + over);
                    return;
                }

                product.deliveryLackOfVolume = 0;
                if (diffVolume > 0 && diffVolume < product.addresses[0].allVolume) {
                    product.addresses[0].allVolume = Number(product.addresses[0].allVolume - diffVolume);
                }

            }

            var newIndex = _.findLast(product.addresses).index + 1;
            var lastIndex = product.addresses.push({
                'volume': newVolume, 'allVolume': newVolume, 'index': newIndex
            }) - 1;
            product.addresses[lastIndex].deliveryID = product.addresses[0].deliveryID;
            product.addresses[lastIndex].addressID = product.addresses[0].addressID;
            product.addresses[lastIndex].senderID = product.addresses[0].senderID;

            $scope.changeVolumes(product);
        };

        $scope.changeVolumes = function(product) {

            var _timeout;

            var _this = this;
            if(_timeout){
                $timeout.cancel(_timeout);
            }

            var allVolumes = 0;
            _.each(product.addresses, function(oneAddress) {
                allVolumes += parseInt(oneAddress.allVolume);
                DeliveryWidgetService.getPkgWeight(product, oneAddress, product.filteredDeliveries);
            });

            _timeout = $timeout(function(){

                var selectedVolume = product.volume;
                if( product.amount > 1 ) {
                    selectedVolume *= product.amount;
                }

                if( allVolumes > selectedVolume ){
                    var over = allVolumes - selectedVolume;

                    product.addresses[_this.$index].allVolume -= Number(over);
                    product.deliveryLackOfVolume = 0;

                    Notification.error($filter('translate')('volume_exceeded_by') + ' ' + over);

                } else if( allVolumes <= selectedVolume ) {

                    product.deliveryLackOfVolume = Number(selectedVolume - allVolumes);

                }

                _timeout = null;
            },500);
        };

        $scope.acceptOffer = function(offer) {


            getPayments(offer.ID).then(function (paymentsData) {

                offer.paymentsOffset = (4 % paymentsData.length) * 3;

                _.each(paymentsData, function (payment) {
                    if (payment.deferredPayment && payment.creditLimit) {
                        payment.tooltipInfo = $filter('translate')(payment.infoForUser) + ' ' + payment.creditLimit
                            + '/' + payment.unpaidValue + ' ' + payment.baseCurrency;
                    } else {
                        payment.tooltipInfo = $filter('translate')('no_credit_limit');
                    }
                });

                offer.payments = paymentsData;

            });

        };

        $scope.paymentConfirm = function (offer, paymentID) {

            var paymentIdx = _.findIndex(offer.payments, {ID: paymentID});

            if( paymentIdx > -1 ) {
                var payment = offer.payments[paymentIdx];

                if( payment.deferredPayment && !payment.creditLimit ) {
                    Notification.error($filter('translate')('no_credit_limit'));
                    return;
                }

                if( payment.limitExceeded ) {
                    Notification.error($filter('translate')('credit_limit_exceeded') + ' - ' +
                        payment.creditLimit + '/' +  payment.unpaidValue + ' ' + payment.baseCurrency );
                    return;
                }
            }

            offer.preventPayment = true;

            doConfirmation(offer);

        };

        function doConfirmation(offer) {

            prepareProductsForOffer(offer).then( function(preparedData) {

                preparedData.paymentID = offer.paymentID;

                DpOrderService.acceptOffer(preparedData).then( function(data) {

                    if (data.payment.status) {
                        if (data.payment.status.statusCode === "SUCCESS" && data.payment.operator == 'payu') {

                            AuthService.cleanSession().then(function () {
                                $rootScope.carts = [];
                                $rootScope.orderID = null;
                                window.location.href = data.payment.redirectUri;
                            });
                        } else if(data.payment.status === 'NEW' && data.payment.operator == 'tinkoff') {

                            AuthService.cleanSession().then(function () {
                                $rootScope.carts = [];
                                $rootScope.orderID = null;
                                window.location.href = data.payment.url;
                            });
                        } else {
                            Notification.error($filter('translate')('payment_rejected'));
                        }
                    } else {
                        AuthService.cleanSession().then(function (data) {
                            $rootScope.carts = [];
                            $rootScope.orderID = null;
                            $state.go('cartVerify', {orderid: offer.ID});
                        });

                    }

                });

            });
        }

        $scope.rejectOffer = function (offer) {

            var data = {};
            data.orderID = offer.ID;

            DpOrderService.rejectOffer(data).then( function(data) {

                var idx = _.findIndex($scope.offers, {ID: offer.ID});
                if( idx > -1 ) {
                    $scope.offers.splice(idx, 1);
                    Notification.info($filter('translate')('offer_rejected'));
                }

            });
        };

        function prepareProductsForOffer(offer) {
            var def = $q.defer();

            var preparedData = {
                orderID: offer.ID,
                products: []
            };

            _.each(offer.products, function(product, index) {

                if( preparedData.products[index] === undefined ) {
                    preparedData.products[index] = {};
                }

                preparedData.products[index].productID = product.productID;
                preparedData.products[index].calcID = product.calcID;


                if( preparedData.products[index].addresses === undefined ) {
                    preparedData.products[index].addresses = [];
                }

                preparedData.products[index].addresses = product.addresses;

                if( offer.products.length === (index + 1) ) {
                    def.resolve(preparedData);
                }

            });

            return def.promise;
        }

        var getPayments = function (orderID) {
            var def = $q.defer();

            PaymentService.getAll(orderID).then(function (data) {
                def.resolve(data);
            });

            return def.promise;
        };

        $scope.messages = function (offer) {
            ClientZoneWidgetService.orderMessages($scope, offer, 'offer');
        };

        init();

    });
