/**
 * Created by Rafał on 03-03-2017.
 */
/**
 * Created by Rafał on 03-03-2017.
 */
angular.module('digitalprint.services')
    .factory('ClientZoneWidgetService', function (DpOrderService, DpOrderStatusService, ProductFileService,
                                                  DeliveryService, AddressService, AuthService, $rootScope, $q,
                                                  PaymentService, SettingService, TemplateRootService, $modal,
                                                  socket, AuthDataService, OrderMessageService, Notification, $config,
                                                  $filter) {

        var accessTokenName = $config.ACCESS_TOKEN_NAME;

        function ClientZoneWidgetService(json) {
            angular.extend(this, json);
        }

        var pagingSettings = {
            currentPage: 1,
            pageSize: 10
        };

        var pegeSizeSelect = [10, 30, 50];

        var globalParams = {};

        function addParam(key, value) {
            globalParams[key] = value;
        }

        function clearParams() {
            globalParams = {};
        }

        function getCommonData(statuses) {
            var def = $q.defer();

            var commonData = {};
            getDeliveries().then(function (deliveries) {
                commonData.deliveries = deliveries;
                getAddress().then(function (allAddress) {
                    commonData.addresses = allAddress.addresses;
                    commonData.senders = allAddress.senders;
                    var params = {};
                    params = _.extend(params, globalParams);
                    countOrders(params).then(function (counted) {
                        if (counted.count > 0) {
                            commonData.count = counted.count;
                        }
                        params.limit = getPagingSettings().pageSize;
                        params.offset = 0;
                        getOrders(statuses, params).then(function (ordersData) {
                            commonData.orders = ordersData;
                            def.resolve(commonData);
                        });
                    });
                });
            });

            return def.promise;
        }

        function getPageSizeSelect() {
            return pegeSizeSelect;
        }

        function getPagingSettings() {
            return pagingSettings;
        }

        function getOrders(statuses, params) {
            var _this = this;
            var def = $q.defer();

            DpOrderService.getMyZone(params).then(function (data) {

                getReclamationSettings().then(function (endOfReclamationTime) {

                    _.each(data, function (order) {
                        order.reclamationOnTime = compareDate(order.ended, endOfReclamationTime.date);
                    });

                    def.resolve(data);

                });

            });

            return def.promise;
        }

        function getStatuses() {
            var def = $q.defer();

            DpOrderStatusService.getAll().then(function (data) {
                def.resolve(data);
            });

            return def.promise;
        }

        function countOrders(params) {
            var def = $q.defer();

            DpOrderService.getMyZoneCount(params).then(function (data) {
                def.resolve(data);
            });

            return def.promise;
        }

        function getDeliveries() {
            var def = $q.defer();

            DeliveryService.getAll().then(function (data) {
                def.resolve(data);
            });

            return def.promise;
        }

        function getAddress() {
            var def = $q.defer();

            if ($rootScope.logged) {

                AddressService.getForUser().then(function (data) {
                    def.resolve(data);
                });

            } else {
                AddressService.getAddressesFromSession().then(function (addresses) {
                    AddressService.getAll(addresses).then(function (data) {
                        def.resolve(data);
                    });
                });
            }

            return def.promise;
        }

        function getFiles(productID) {
            var def = $q.defer();
            ProductFileService.getAll(productID).then(function (files) {
                def.resolve(files);
            });
            return def.promise;
        }

        function getAggregateOrders(ordersData) {
            var def = $q.defer();
            var orders = [];
            _.each(ordersData, function (order, index) {
                orders.push(order.ID);
                if (index + 1 === ordersData.length) {
                    def.resolve(orders);
                }
            });
            return def.promise;
        }

        function getAllFiles(ordersData) {
            var def = $q.defer();

            this.getAggregateOrders(ordersData).then(function (orders) {
                ProductFileService.getByList(orders).then(function (files) {
                    def.resolve(files);
                });
            });

            return def.promise;
        }

        function removeFile(product, file) {
            var fileIdx = _.findIndex(product.fileList, {ID: file.ID});
            if (fileIdx > -1) {
                var toRemove = _.clone(product.fileList[fileIdx]);
                product.fileList.splice(fileIdx, 1);
                if (product.lastFile && toRemove.ID === product.lastFile.ID) {
                    product.lastFile = _.last(_.sortBy(product.fileList, function (o) {
                        return o.created;
                    }));
                }
            }
            return product;
        }

        function mergeFiles(ordersData) {
            var _this = this;

            _this.getAllFiles(ordersData).then(function (files) {

                _.each(ordersData, function (order) {

                    if( order.products ) {
                        order.filesAlert = order.products.length;
                        order.waitForAccept = order.products.length;
                    }

                    order.filesRejected = 0;

                    _.each(order.products, function (product) {
                        if( product.accept === 1 ) {
                            order.waitForAccept--;
                        } else if( product.accept === -1 ) {
                            order.filesRejected++;
                        }
                        product.fileList = [];
                        product.lastFile = {};

                        if (files[parseInt(product.productID)] !== undefined) {
                            product.fileList = files[parseInt(product.productID)];
                            product.lastFile = _.last(_.sortBy(files[parseInt(product.productID)], function (o) {
                                return o.created;
                            }));
                            order.filesAlert--;
                        } else {
                            product.noFiles = true;
                        }



                    });

                });
            });

            return ordersData;
        }

        function getPayments() {
            var def = $q.defer();

            PaymentService.getAll().then(function (data) {
                def.resolve(data);
            });

            return def.promise;
        }

        function payment(params, orderID) {
            var def = $q.defer();

            DpOrderService.payment(params, orderID).then(function (data) {
                def.resolve(data);
            });

            return def.promise;
        }

        function addDeliveryToOrder(order) {

            order.deliveryPrice = 0;
            order.deliveryGrossPrice = 0;

            _.each(order.products, function (product) {

                if (typeof product.deliveryPrice === 'string') {
                    product.deliveryPrice = product.deliveryPrice.replace(',', '.');
                }
                order.deliveryPrice += parseFloat(product.deliveryPrice);
                if (typeof product.deliveryPriceGross === 'string') {
                    product.deliveryPriceGross = product.deliveryPriceGross.replace(',', '.');
                }
                order.deliveryGrossPrice += parseFloat(product.deliveryPriceGross);

            });

            return order;

        }

        function getDeliveryPrice(order) {

            var deliveryPrice = 0;
            var deliveryGrossPrice = 0;

            order = addDeliveryToOrder(order);


            if (order.sumPrice !== undefined) {
                var tmpPrice = order.sumPrice;
                var tmpDeliveryPrice = order.deliveryPrice;

                if (typeof(tmpPrice) === 'string') {
                    tmpPrice = tmpPrice.replace(',', '.');
                }
                if (typeof tmpDeliveryPrice === 'string') {
                    tmpDeliveryPrice = tmpDeliveryPrice.replace(',', '.');
                }
                tmpPrice = parseFloat(tmpPrice) + parseFloat(tmpDeliveryPrice);
            }

            if (order.sumGrossPrice !== undefined) {
                var tmpGrossPrice = order.sumGrossPrice;
                var tmpDeliveryGrossPrice = order.deliveryGrossPrice;

                if (typeof(tmpGrossPrice) === 'string') {
                    tmpGrossPrice = tmpGrossPrice.replace(',', '.');
                }
                if (typeof tmpDeliveryGrossPrice === 'string') {
                    tmpDeliveryGrossPrice = tmpDeliveryGrossPrice.replace(',', '.');
                }
                tmpGrossPrice = parseFloat(tmpGrossPrice) + parseFloat(tmpDeliveryGrossPrice);
            }

            order.totalPrice = tmpPrice.toFixed(2).replace('.', ',');
            order.totalGrossPrice = tmpGrossPrice.toFixed(2).replace('.', ',');

            order.deliveryPrice = parseFloat(tmpDeliveryPrice).toFixed(2).replace('.', ',');
            order.deliveryGrossPrice = parseFloat(tmpDeliveryGrossPrice).toFixed(2).replace('.', ',');

            return order;
        }

        function preparePrice(price) {
            var tmpPrice = price;
            if (typeof(tmpPrice) === 'string') {
                tmpPrice = tmpPrice.replace(',', '.');
            }
            tmpPrice = parseFloat(tmpPrice);

            return tmpPrice.toFixed(2).replace('.', ',');
        }

        function getProjects(sort, pagingSettings) {

            var sortBy = _.first(_.keys(sort));
            var order = _.first(_.values(sort));

            var def = $q.defer();

            var url = location.protocol + '//' + $rootScope.domainHost + ':' + $rootScope.editorPort + '/getMyProjects?sortBy=' + sortBy +
                '&order=' + order + '&page=' + pagingSettings.currentPage + '&display=' + pagingSettings.pageSize;

            var header = {};
            header[accessTokenName] = AuthService.readCookie(accessTokenName);

            $.ajax({
                url: url,
                type: 'GET',
                headers: header,
                crossDomain: true,
                withCredentials: true
            }).done(function (data) {
                def.resolve(data);
            }).fail(function (data) {
                console.log(data);
                def.reject(data.status);
            });

            return def.promise;

        }

        function getReclamationSettings() {
            var Setting = new SettingService('reclamation');

            var def = $q.defer();

            Setting.getDateByWorkingDays().then(function (data) {
                def.resolve(data);
            });
            return def.promise;
        }

        function addDaysToDate(days, currentDate) {
            var currentDateObj = new Date(currentDate);
            currentDateObj.setDate(currentDateObj.getDate() + days);
            return currentDateObj;
        }

        function compareDate(date1, date2) {
            if (!date1) {
                return false;
            }
            var dateOne = new Date(date1);
            var dateTwo = new Date(date2);
            return dateOne > dateTwo;
        }

        function getOrderMessages(scope, orderID) {
            OrderMessageService.getMessages(orderID).then(function (data) {
                scope.messages = data;
            });
        }

        function orderMessages(scope, order, type) {
            TemplateRootService.getTemplateUrl(103).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: scope,
                    size: 'lg',
                    controller: function ($scope) {

                        $scope.order = order;
                        $scope.messages = [];

                        $scope.typeOfResource = type;

                        socket.emit('onOrder', {'orderID': order.ID});

                        order.unreadMessages = 0;

                        getOrderMessages($scope, order.ID);

                        $scope.send = function () {

                            socket.emit('order.addMessage', {
                                'orderID': order.ID,
                                'message': this.form.message,
                                'accessToken': AuthDataService.getAccessToken(),
                                'companyID': $rootScope.companyID
                            });

                        };

                        socket.on('order.messageSaved', function (data) {
                            if (data.ID !== undefined) {
                                if ($scope.form && data.isAdmin === 0) {
                                    $scope.form.message = '';
                                }
                                getOrderMessages($scope, order.ID);
                            }
                        });
                    }
                });
            });
        }

        function orderMessageInfo(scope) {
            socket.on('connect', function () {
                console.log('Client has connected to the server!');
            });

            socket.emit('onOrdersPanel', {'userID': $rootScope.user.userID});

            socket.on('order.newMessage', function (newMessage) {
                var orderIdx = _.findIndex(scope.orders, {ID: newMessage.orderID});
                if (orderIdx > -1) {
                    if (scope.orders[orderIdx].unreadMessages === undefined) {
                        scope.orders[orderIdx].unreadMessages = 1;
                    } else {
                        scope.orders[orderIdx].unreadMessages++;
                    }
                }
            });
        }

        function offerMessageInfo(scope) {
            socket.on('connect', function () {
                console.log('Client has connected to the server!');
            });

            socket.emit('onOrdersPanel', {'userID': $rootScope.user.userID});

            socket.on('order.newMessage', function (newMessage) {
                var orderIdx = _.findIndex(scope.offers, {ID: newMessage.orderID});
                if (orderIdx > -1) {
                    if (scope.offers[orderIdx].unreadMessages === undefined) {
                        scope.offers[orderIdx].unreadMessages = 1;
                    } else {
                        scope.offers[orderIdx].unreadMessages++;
                    }
                }
            });
        }

        function doPayment($scope, order) {
            TemplateRootService.getTemplateUrl(72).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    backdrop: true,
                    keyboard: false,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        order = getDeliveryPrice(order);

                        _.each(order.products, function (product) {
                            product.price = preparePrice(product.price);
                            product.grossPrice = preparePrice(product.grossPrice);
                        });

                        $scope.order = order;
                        $scope.payments = [];
                        $scope.preventPayment = false;
                        $scope.paymentsOffset = 0;

                        getPayments(order.ID).then(function (paymentsData) {
                            $scope.paymentsOffset = (4 % paymentsData.length) * 3;
                            $scope.payments = paymentsData;

                            $scope.selectedPayment = _.findWhere(paymentsData, {ID: order.paymentID});
                        });

                        $scope.paymentConfirm = function (paymentID) {
                            $scope.preventPayment = true;

                            var paymentIdx = _.findIndex($scope.payments, {ID: paymentID});

                            if( paymentIdx > -1 ) {
                                var paymentType = $scope.payments[paymentIdx];

                                if( paymentType.limitExceeded ) {
                                    $scope.preventPayment = false;
                                    Notification.error($filter('translate')('credit_limit_exceeded') + ' - ' +
                                        paymentType.creditLimit + '/' +  paymentType.unpaidValue + ' ' + paymentType.baseCurrency );
                                    return;
                                }
                            }

                            payment({paymentID: paymentID}, order.ID).then(function (paymentResponse) {

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
                                    if ( paymentResponse.payment.status === 'NEW' && paymentResponse.payment.operator === 'sberbank' ) {
                                        window.location.href = paymentResponse.payment.formUrl;
                                    }
                                    if ( paymentResponse.payment.status === 'CREATED' && paymentResponse.payment.operator === 'sberbank' ) {
                                        Notification.info($filter('translate')(paymentResponse.paymentInfo));
                                    }
                                } else if (paymentResponse.response === true && paymentResponse.paymentChanged === true) {
                                    Notification.info($filter('translate')('payment_method_changed'));
                                    order.paymentID = paymentID;
                                    $scope.selectedPayment = _.findWhere($scope.payments, {ID: order.paymentID});
                                } else if (paymentResponse.response === false) {
                                    Notification.error($filter('translate')(paymentResponse.info));
                                }

                            });
                        }

                    }
                });
            });
        }

        return {
            getProjects: getProjects,
            getPageSizeSelect: getPageSizeSelect,
            getPagingSettings: getPagingSettings,
            getOrders: getOrders,
            getStatuses: getStatuses,
            countOrders: countOrders,
            getDeliveries: getDeliveries,
            getAddress: getAddress,
            getCommonData: getCommonData,
            addParam: addParam,
            clearParams: clearParams,
            getFiles: getFiles,
            getAggregateOrders: getAggregateOrders,
            getAllFiles: getAllFiles,
            removeFile: removeFile,
            mergeFiles: mergeFiles,
            getPayments: getPayments,
            payment: payment,
            getDeliveryPrice: getDeliveryPrice,
            preparePrice: preparePrice,
            getReclamationSettings: getReclamationSettings,
            orderMessages: orderMessages,
            orderMessageInfo: orderMessageInfo,
            offerMessageInfo: offerMessageInfo,
            doPayment: doPayment
        };
    });
