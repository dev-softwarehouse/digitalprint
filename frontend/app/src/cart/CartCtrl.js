'use strict';

/**
 * @ngdoc function
 * @name digitalprintFrontendApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the digitalprintFrontendApp
 */
angular.module('dpClient.app')
    .controller('cart.CartCtrl', function ($scope, $rootScope, $filter, DpOrderService, DeliveryService, DpProductService,
                                           AddressService, DpAddressService, AuthService, PaymentService,
                                           ProductFileService, UserService, AuthDataService, CalculationService,
                                           CountriesService, RegisterWidget, Notification, FileUploader, $state, $q,
                                           $config, $modal, $timeout, LoginWidgetService, DeliveryWidgetService,
                                           TemplateRootService, CouponService, TokenService, EditorProjectService,
                                           SocialWidgetService, SettingService, CommonService, $sce, CountService,
                                           CartWidgetService, AddressWidgetService, vcRecaptchaService ) {

        var _timeout;
        var _overallTimeout;
        var auth2;

        $scope._ = _;

        $scope.isCollapsed = false;
        $scope.cart = {};
        $scope.deliveries = [];
        $scope.addresses = [];
        $scope.additionalDeliveryMethod = false;
        $scope.blockCart = false;
        $scope.payments = [];
        $scope.preventPayment = false;
        $scope.paymentsOffset = 0;
        $scope.countries = [];
        $scope.coupons = [];
        $scope.onlyForCompanies = false;
        $scope.confirmButtonInCart = false;
        $scope.userCanRecalculateCart = false;
        $scope.reCountProductExist = false;
        $scope.confirmTextInCart = {};
        $scope.senders = [];
        $scope.confirmButton = false;
        $scope.showSeparateConfirmButton = false;

        $scope.form = {};
        $scope.noRegisterForm = {};

        $scope.canJoinAddresses = false;
        $scope.addressToJoin = {};

        $scope.connectedIndexes = {};
        $scope.connectDeliveryPrices = {};

        $scope.joinedDelivery = {};

        $scope.response = null;
        $scope.widgetId = null;

        $scope.setResponse = function (response) {
            console.info('Response available');
            $scope.response = response;
        };
        $scope.setWidgetId = function (widgetId) {
            console.info('Created widget ID: %s', widgetId);
            $scope.widgetId = widgetId;
        };
        $scope.cbExpiration = function () {
            console.info('Captcha expired. Resetting response object');
            vcRecaptchaService.reload($scope.widgetId);
            $scope.response = null;
        };

        $scope.$on('Cart:addresses', function (event, addresses) {
            $scope.addresses = addresses;
        });

        $rootScope.$on('Cart:copied', function () {
            getCartData();
        });

        $rootScope.$on('Cart:deleted', function () {
            getCartData();
        });

        var Setting = new SettingService('additionalSettings');

        var init = function () {

            getCartData();

        };

        function getCartData() {

            var projects = [];
            $scope.coupons = [];
            $scope.cart.overallAddresses = [{}];
            $scope.connectDeliveryPrices = {};
            $scope.connectedIndexes = {};

            $scope.reCountProductExist = false;

            DpOrderService.getCart().then(function (data) {

                if (data.response === false) {
                    return;
                }

                /**
                 * @param {Object} data
                 * @param {Array} data.carts[].ProductAddresses
                 */
                CountriesService.getAll().then(function (dataCountries) {
                    $scope.countries = dataCountries;
                });

                Setting.getPublicSettings().then(function(settingsData) {
                    if( settingsData.confirmButtonInCart ) {
                        $scope.confirmButtonInCart = settingsData.confirmButtonInCart.value;
                        $scope.confirmTextInCart = settingsData.confirmTextInCart;
                    }
                    if(settingsData.onlyForCompanies) {
                        $scope.onlyForCompanies = settingsData.onlyForCompanies.value;
                    }
                    if( settingsData.recalculateInCart ) {
                        $scope.userCanRecalculateCart = settingsData.recalculateInCart.value;
                    }
                    if( settingsData.separateConfirmButton ) {
                        $scope.showSeparateConfirmButton = settingsData.separateConfirmButton.value;
                    }
                    if (settingsData.captchaPublicKey) {
                        $scope.model = {
                            key: settingsData.captchaPublicKey.value
                        };
                    }
                });

                if (data.carts !== undefined) {
                    $rootScope.carts = data.carts;
                    checkAddressesToJoin(data.carts, data.order).then(function (addressToJoin) {
                        $scope.addressToJoin = addressToJoin;
                        _.each(addressToJoin, function (matchedAddress, addressKeyID) {
                            if (matchedAddress.length === 1) {
                                var tokenParams = {};
                                tokenParams.active = false;
                                tokenParams['addressID'] = addressKeyID;
                                TokenService.joinAddresses(tokenParams).then(function (data) {
                                    tokenParams['productAddresses'] = matchedAddress;
                                    DpOrderService.recalculateDelivery({
                                        'active': false,
                                        'productAddresses': matchedAddress
                                    }).then(function (recalculateData) {
                                        delete $scope.connectedIndexes[addressKeyID];
                                        delete $scope.addressToJoin[addressKeyID];
                                    });
                                });
                            }
                        });
                    });
                }

                if (data.order !== undefined) {
                    $scope.cart.currencySymbol = data.order.currencySymbol;
                    $scope.cart.userMail = data.order.userMail;
                    $scope.cart.userTelephone = data.order.defaultAddress.areaCode + '' + data.order.defaultAddress.telephone;
                    $scope.cart.userFullName = data.order.defaultAddress.name + ' ' + data.order.defaultAddress.lastname;
                }

                getDeliveries().then(function (deliveries) {

                    getPayments(data.order.ID).then(function (paymentsData) {

                        $scope.paymentsOffset = (4 % paymentsData.length) * 3;

                        _.each(paymentsData, function(payment) {
                            if( payment.deferredPayment && payment.creditLimit ) {
                                payment.tooltipInfo = $filter('translate')(payment.infoForUser) + ' ' + payment.creditLimit
                                    + '/' + payment.unpaidValue + ' ' + payment.baseCurrency;
                            } else {
                                payment.tooltipInfo = $filter('translate')('no_credit_limit');
                            }
                        });

                        $scope.payments = paymentsData;

                        $scope.deliveries = deliveries;

                        $scope.cart.deliveryPrice = 0;
                        $scope.cart.deliveryGrossPrice = 0;

                        _.each(data.order.products, function (product, index) {

                            if( product.beforeReCountPriceID > 0 ) {
                                $scope.reCountProductExist = true;
                            }

                            if (typeof product.deliveryPrice === 'string') {
                                product.deliveryPrice = product.deliveryPrice.replace(',', '.');
                            }
                            $scope.cart.deliveryPrice += parseFloat(product.deliveryPrice);
                            if (typeof product.deliveryPriceGross === 'string') {
                                product.deliveryPriceGross = product.deliveryPriceGross.replace(',', '.');
                            }
                            $scope.cart.deliveryGrossPrice += parseFloat(product.deliveryPriceGross);

                            var cartIndex = _.findIndex(data.carts, {productID: product.productID});
                            if (cartIndex > -1 && !_.isEmpty(data.carts[cartIndex].ProductAddresses) && data.carts[cartIndex].ProductAddresses !== null) {
                                if (data.carts[cartIndex].ProductAddresses[0].commonRealisationTime &&
                                    data.carts[cartIndex].ProductAddresses[0].commonDeliveryID > 0) {
                                    var tmpDate = new Date(null);
                                    tmpDate.setTime(data.carts[cartIndex].ProductAddresses[0].commonRealisationTime.$date.$numberLong);
                                    product.realisationDate = tmpDate;
                                } else {
                                    product.realisationDate = Date.parse(product.realisationDate);
                                }
                            }

                            product.addresses = [];
                            var pAddresses;

                            var pIdx = _.findIndex(data.carts, {productID: product.productID});

                            if (pIdx > -1) {
                                pAddresses = data.carts[pIdx].ProductAddresses;
                            }

                            if (!_.isEmpty(pAddresses)) {
                                product.addresses = pAddresses;
                            }


                            product.checked = true;

                            /**
                             *
                             * @param {Array} product.fileList
                             */
                            product.fileList = [];
                            product.lastFile = {};
                            getFiles(product.productID).then(function (files) {
                                product.fileList = files;
                                product.lastFile = _.last(_.sortBy(files, function (sortableFile) {
                                    /**
                                     * @param {Object} sortableFile
                                     * @param {string} sortableFile.created
                                     */
                                    return sortableFile.created;
                                }));
                            });

                            if (product.projectID) {
                                EditorProjectService.getProjectPrev(product.projectID).then(function (prevData) {
                                    if (prevData && prevData.length > 0) {
                                        product.prevPages = prevData;
                                    }
                                });
                            }

                            if(product.projectID) {
                                projects.push(product.projectID);
                            }

                            var findIndex;
                            if( index === (data.order.products.length - 1) && projects.length > 0) {
                                EditorProjectService.getProjectsData(projects).then(function(projectsData) {
                                    if( projectsData.length > 0 ) {
                                        _.each(projectsData, function(oneProject) {
                                            findIndex = -1;
                                            if( oneProject.projectName ) {
                                                findIndex = _.findIndex(data.order.products, {projectID: oneProject._id});
                                                if( findIndex > -1 ) {
                                                    data.order.products[findIndex].projectName = oneProject.projectName;
                                                }
                                            }
                                        });
                                    }
                                });
                            }

                        });

                        $scope.cart.products = data.order.products;
                        $scope.cart.sumPrice = data.order.sumPrice;
                        $scope.cart.sumGrossPrice = data.order.sumGrossPrice;

                        $scope.cart.sumCalcPrice = data.order.sumCalcPrice;
                        $scope.cart.sumCalcGrossPrice = data.order.sumCalcGrossPrice;

                        $scope.allDeliveryPrice();

                        getAddress().then(function (allAddress) {

                            $scope.addresses = allAddress.addresses;

                            $scope.senders = [];

                            _.each(allAddress.senders, function (item) {
                                item.name = $filter('translate')(item.name);
                                $scope.senders.push(item);
                            });

                            _.each($scope.cart.products, function (product) {

                                if (product.coupons && product.coupons.length > 0) {

                                    _.each(product.coupons, function (coupon) {
                                        var couponIdx = _.findIndex($scope.coupons, {orderID: coupon.orderID, couponID: coupon.couponID});
                                        if( couponIdx > -1 ) {
                                            $scope.coupons[couponIdx].products.push(coupon.productID);
                                        } else {
                                            coupon.products = [coupon.productID];
                                            $scope.coupons.push(coupon);
                                        }
                                    });

                                }

                                if (allAddress.addresses.length > 0) {

                                    $scope.cart.overallAddresses[0].addressID = allAddress.addresses[0].ID;

                                }

                                if( product.addresses.length > 0 ) {
                                    $scope.checkDelivery(product.addresses[0]);

                                    showDeliveryBox(product);
                                }

                            });

                        });

                    });

                });
            });

        }

        $scope.$watch('countries', function (countries) {

            if (_.isEmpty(countries)) {
                return;
            }

            RegisterWidget.initCodeRegister($scope, countries);
            RegisterWidget.initCodeWithoutRegister($scope, countries);

        });

        $scope.selectCountry = function (prefix, withoutRegister) {

            if (withoutRegister) {
                RegisterWidget.selectCountryWithoutRegister($scope, prefix);
            } else {
                RegisterWidget.selectCountryRegister($scope, prefix);
            }

        };

        $scope.addProductAddress = function (product) {

            var idx = _.findIndex($scope.cart.products, {productID: product.productID});

            if (idx === -1) {
                return;
            }

            if (!$scope.cart.products[idx].addresses) {
                $scope.cart.products.addresses = [];
            }
            var adr = {};

            $scope.cart.products[idx].addresses.push(adr);
        };

        $scope.addOverallAddress = function () {

            var adr = {};
            $scope.cart.overallAddresses.push(adr);

        };

        $scope.removeAddress = function (idx) {

            $scope.order.addresses.splice(idx, 1);
        };

        var getDeliveries = function () {
            var def = $q.defer();

            DeliveryService.getAll().then(function (data) {
                def.resolve(data);
            });

            return def.promise;
        };

        var getPayments = function (orderID) {
            var def = $q.defer();

            PaymentService.getAll(orderID).then(function (data) {
                def.resolve(data);
            });

            return def.promise;
        };

        var getAddress = function () {
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
        };

        var getFiles = function (productID) {

            var def = $q.defer();

            ProductFileService.getAll(productID).then(function (files) {
                def.resolve(files);
            });

            return def.promise;

        };

        var checkFiles = function () {
            var def = $q.defer();

            var emptyProducts = 0;

            _.each($scope.cart.products, function (product, index) {

                if (product.fileList.length === 0) {
                    emptyProducts++;
                }

                if (index === ($scope.cart.products.length - 1)) {
                    def.resolve(emptyProducts);
                }

            });

            return def.promise;
        };

        $scope.deleteProduct = function (product) {

            CartWidgetService.deleteProduct($scope, product).then( function() {
                console.log('product deleted!');
            });
        };

        $scope.addressesEdit = function () {
            $scope.isCollapsedAddAddress = false;

            TemplateRootService.getTemplateUrl(31).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        $scope.addAddress = function () {
                            $scope.form.saving = true;
                            AddressService.addAddress($scope.form).then(function (data) {

                                if (data.response === true) {
                                    $scope.isCollapsedAddAddress = false;
                                    $scope.form.saving = false;
                                    $scope.addresses.push(data.item);
                                    AddressService.saveAddressToSession(data.addressID).then(function (data) {
                                        console.log('saveAddress: ', data);
                                    });
                                }


                            });

                        };

                        $scope.cancel = function () {
                            $modalInstance.close();
                        }

                    }
                });

            });

        };

        $scope.showDelivery = function (product) {

            showDelivery(product);

        };

        function fillDeliveryInfo(scope, address) {

            var _addressTimeout = null;
            var def = $q.defer();

            var adrIdx = _.findIndex(scope.addresses, {ID: parseInt(address.addressID)});
            if (adrIdx > -1) {
                address.details = scope.addresses[adrIdx];
            }

            var sdrIdx = _.findIndex(scope.senders, {type: parseInt(address.senderID)});
            if (sdrIdx > -1) {
                address.senderName = $filter('translate')(scope.senders[sdrIdx].name);
            }

            var dlvIdx = _.findIndex(scope.filteredDeliveries, {ID: parseInt(address.deliveryID)});
            if (dlvIdx > -1) {
                address.deliveryNames = scope.filteredDeliveries[dlvIdx].names;
            }

            console.log('address: ', address);

            var deliveryIndex = _.findIndex(scope.filteredDeliveries, {ID: address.deliveryID});
            if (deliveryIndex > -1) {
                address.deliveryNames = scope.filteredDeliveries[deliveryIndex].names;
                address.collectionPoints = scope.filteredDeliveries[deliveryIndex].collectionPoints;
                var collectionPointIndex = _.findIndex(
                    scope.filteredDeliveries[deliveryIndex].collectionPoints,
                    {ID: address.collectionPointID});
                if( collectionPointIndex > -1 ) {
                    address.collectionPoint = scope.filteredDeliveries[deliveryIndex].collectionPoints[collectionPointIndex];
                }
            }

            _addressTimeout = $timeout(function(){
                def.resolve(address);
                _addressTimeout = null;
            },500);

            return def.promise;
        }

        function fillDeliveryInfo2(product, address) {

            var _addressTimeout = null;
            var def = $q.defer();

            var adrIdx = _.findIndex(product.addresses, {ID: parseInt(address.addressID)});
            if (adrIdx > -1) {
                address.details = product.addresses[adrIdx];
            }

            var sdrIdx = _.findIndex(product.senders, {type: parseInt(address.senderID)});
            if (sdrIdx > -1) {
                address.senderName = $filter('translate')(product.senders[sdrIdx].name);
            }

            var dlvIdx = _.findIndex(product.filteredDeliveries, {ID: parseInt(address.deliveryID)});
            if (dlvIdx > -1) {
                address.deliveryNames = product.filteredDeliveries[dlvIdx].names;
            }

            _addressTimeout = $timeout(function(){
                def.resolve(address);
                _addressTimeout = null;
            },500);

            return def.promise;
        }

        $scope.allDeliveryPrice = function () {

            var deliveryPrice = 0;
            var deliveryGrossPrice = 0;

            $scope.additionalDeliveryMethod = this.additionalDeliveryMethod;

            var tmpPrice;
            var tmpGrossPrice;
            var tmpCalcPrice;
            var tmpCalcGrossPrice;
            var tmpDeliveryGrossPrice;
            var tmpDeliveryPrice;

            if (this.additionalDeliveryMethod) {

                _.each($scope.cart.overallAddresses, function (overallAddress) {

                    var idx = _.findIndex($scope.deliveries, {ID: overallAddress.deliveryID});

                    if (idx > -1) {

                        if (angular.isDefined($scope.deliveries[idx].price)) {

                            deliveryPrice += parseFloat($scope.deliveries[idx].price.price);
                            deliveryGrossPrice += parseFloat($scope.deliveries[idx].price.priceGross);

                        }
                    }

                });

                $scope.cart.deliveryPrice = deliveryPrice.toFixed(2).replace('.', ',');
                $scope.cart.deliveryGrossPrice = deliveryGrossPrice.toFixed(2).replace('.', ',');

                tmpPrice = parseFloat($scope.cart.sumPrice.replace(',', '.')) + deliveryPrice;
                tmpGrossPrice = parseFloat($scope.cart.sumGrossPrice.replace(',', '.')) + deliveryGrossPrice;

                tmpCalcPrice = parseFloat($scope.cart.sumCalcPrice.replace(',', '.')) + deliveryPrice;
                tmpCalcGrossPrice = parseFloat($scope.cart.sumCalcGrossPrice.replace(',', '.')) + deliveryGrossPrice;

            } else {

                if ($scope.cart.sumPrice !== undefined) {
                    tmpPrice = $scope.cart.sumPrice;
                    tmpDeliveryPrice = $scope.cart.deliveryPrice;

                    if (typeof(tmpPrice) === 'string') {
                        tmpPrice = tmpPrice.replace(',', '.');
                    }
                    if (typeof tmpDeliveryPrice === 'string') {
                        tmpDeliveryPrice = tmpDeliveryPrice.replace(',', '.');
                    }
                    tmpPrice = parseFloat(tmpPrice) + parseFloat(tmpDeliveryPrice);
                }

                if ($scope.cart.sumCalcPrice !== undefined) {
                    tmpCalcPrice = $scope.cart.sumCalcPrice;
                    tmpDeliveryPrice = $scope.cart.deliveryPrice;

                    if (typeof(tmpCalcPrice) === 'string') {
                        tmpCalcPrice = tmpCalcPrice.replace(',', '.');
                    }
                    if (typeof tmpDeliveryPrice === 'string') {
                        tmpDeliveryPrice = tmpDeliveryPrice.replace(',', '.');
                    }
                    tmpCalcPrice = parseFloat(tmpCalcPrice) + parseFloat(tmpDeliveryPrice);
                }

                if ($scope.cart.sumGrossPrice !== undefined) {
                    tmpGrossPrice = $scope.cart.sumGrossPrice;
                    tmpDeliveryGrossPrice = $scope.cart.deliveryGrossPrice;

                    if (typeof(tmpGrossPrice) === 'string') {
                        tmpGrossPrice = tmpGrossPrice.replace(',', '.');
                    }
                    if (typeof tmpDeliveryGrossPrice === 'string') {
                        tmpDeliveryGrossPrice = tmpDeliveryGrossPrice.replace(',', '.');
                    }
                    tmpGrossPrice = parseFloat(tmpGrossPrice) + parseFloat(tmpDeliveryGrossPrice);
                }

                if ($scope.cart.sumCalcGrossPrice !== undefined) {
                    tmpCalcGrossPrice = $scope.cart.sumCalcGrossPrice;
                    tmpDeliveryGrossPrice = $scope.cart.deliveryGrossPrice;

                    if (typeof(tmpCalcGrossPrice) === 'string') {
                        tmpCalcGrossPrice = tmpCalcGrossPrice.replace(',', '.');
                    }
                    if (typeof tmpDeliveryGrossPrice === 'string') {
                        tmpDeliveryGrossPrice = tmpDeliveryGrossPrice.replace(',', '.');
                    }
                    tmpCalcGrossPrice = parseFloat(tmpCalcGrossPrice) + parseFloat(tmpDeliveryGrossPrice);
                }

            }

            $scope.cart.totalPrice = tmpPrice.toFixed(2).replace('.', ',');
            $scope.cart.totalGrossPrice = tmpGrossPrice.toFixed(2).replace('.', ',');

            $scope.cart.totalCalcPrice = tmpCalcPrice.toFixed(2).replace('.', ',');
            $scope.cart.totalCalcGrossPrice = tmpCalcGrossPrice.toFixed(2).replace('.', ',');

            $scope.cart.deliveryPrice = parseFloat(tmpDeliveryPrice).toFixed(2).replace('.', ',');
            $scope.cart.deliveryGrossPrice = parseFloat(tmpDeliveryGrossPrice).toFixed(2).replace('.', ',');
        };

        $scope.checkDelivery = function (address) {

            var idx = _.findIndex($scope.deliveries, {ID: address.deliveryID});

            address.turnOffAddress = false;

            if (idx < 0) {
                return;
            }

            var delivery = $scope.deliveries[idx];

            if (angular.isDefined(delivery.module) && Object.keys(delivery.module).length > 0) {

                if (angular.isDefined(delivery.module.keys) && Object.keys(delivery.module.keys).length > 0) {

                    _.each(delivery.module.keys, function (key) {

                        if (key.func === 'collection') {

                            address.turnOffAddress = true;

                        }

                    });

                }

            }

        };

        $scope.changeOverallVolumes = function () {

            if (_overallTimeout) {
                $timeout.cancel(_overallTimeout);
            }

            _overallTimeout = $timeout(function () {

                var productsVolumes = 0;
                _.each($scope.cart.products, function (product) {
                    if (product.checked) {
                        _.each(product.addresses, function (address) {
                            productsVolumes += address.allVolume;
                        });
                    }
                });

                var allVolumes = 0;
                _.each($scope.cart.overallAddresses, function (overallAddress) {
                    allVolumes += parseInt(overallAddress.allVolume);
                });

                if (allVolumes > productsVolumes) {

                    var over = allVolumes - productsVolumes;
                    Notification.error($filter('translate')('volume_exceeded_by') + ' ' + over);
                    $scope.blockCart = true;

                } else {

                    $scope.blockCart = false;

                }

            });

        };

        $scope.toggleProduct = function () {
            $scope.allDeliveryPrice();
            $scope.changeOverallVolumes();
        };

        $scope.saveCartData = function () {

            if (this.blockCart) {
                return;
            }

            var orderID;
            var sendData = {};
            sendData.addresses = {};

            _.each($scope.cart.products, function (product) {

                orderID = product.orderID;
                sendData.addresses[product.ID] = product.addresses;

            });

            sendData.paymentID = $scope.cart.paymentID;
            sendData.orderMessage = $scope.form.orderMessage;

            DpOrderService.saveCart(orderID, sendData).then(function () {

                AuthService.cleanSession().then(function () {

                    $rootScope.carts = [];
                    $rootScope.orderID = null;
                    $state.go('cartVerify');

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
                    controller: function ($scope, $modalInstance, allowedExtensions, $config) {

                        var accessTokenName = $config.ACCESS_TOKEN_NAME;

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

                        uploader.onSuccessItem = function (fileItem, response, status) {
                            var idx = _.findIndex($scope.cart.products, {productID: response.file.productID});
                            response.file.size = (fileItem._file.size / 1024).toFixed(2);
                            if (idx > -1) {
                                $scope.cart.products[idx].fileList.push(response.file);
                                ProductFileService.makeMiniature(response.file.ID).then(function(responseMiniature) {
                                    if( responseMiniature.response === true) {
                                        var fileIdx = _.findIndex($scope.cart.products[idx].fileList, {ID: response.file.ID});
                                        if( fileIdx > -1 ) {
                                            $scope.cart.products[idx].fileList[fileIdx].minUrl = responseMiniature.minUrl;
                                            $scope.cart.products[idx].fileList[fileIdx].hasMiniature = true;
                                        }
                                    }
                                });
                                $scope.cart.products[idx].lastFile = response.file;
                            }
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

        $scope.reg = false;
        $scope.no_acct = false;
        $scope._login = true;
        $scope.isActiveReg = false;
        $scope.isActiveNo_acct = false;
        $scope.isActive_login = true;

        $scope.showReg = function () {
            $scope.reg = true;
            $scope.no_acct = false;
            $scope._login = false;
            $scope.isActive = !$scope.isActive;
        };

        $scope.showLogin = function () {
            $scope.reg = false;
            $scope.no_acct = false;
            $scope._login = true;
            $scope.isActive = !$scope.isActive;
        };

        $scope.showCheckout = function () {
            $scope.reg = false;
            $scope.no_acct = true;
            $scope._login = false;
            $scope.isActive = !$scope.isActive;
        };


        $scope.removeFile = function (productID, fileID) {

            ProductFileService.removeFile(productID, fileID).then(function (response) {
                if (response.response) {

                    Notification.info($filter('translate')('removed') + ' ' + response.removed_item.name);

                    var idx = _.findIndex($scope.cart.products, {productID: productID});
                    if (idx > -1) {
                        var fileIdx = _.findIndex($scope.cart.products[idx].fileList, {ID: fileID});
                        if (fileIdx > -1) {
                            var toRemove = _.clone($scope.cart.products[idx].fileList[fileIdx]);
                            $scope.cart.products[idx].fileList.splice(fileIdx, 1);
                            if (toRemove.ID === $scope.cart.products[idx].lastFile.ID) {
                                $scope.cart.products[idx].lastFile = _.last(_.sortBy($scope.cart.products[idx].fileList, function (o) {
                                    return o.created;
                                }));
                            }
                        }

                    }

                }

            });

        };

        init();

        $scope.login = function (credentials) {
            LoginWidgetService.loginInCart($scope, credentials).then(function() {
                getCartData();
            });
        };

        $scope.addUser = function () {
            if ($scope.form.terms === true && $scope.form.data_protection === true) {

                $scope.form.captchaResponse = $scope.response;

                UserService.userRegister($scope.form).then(function (data) {
                    if (data.response) {
                        var credentials = {};
                        credentials.password = $scope.form.pass;
                        credentials.email = $scope.form.user;

                        $scope.cart.userMail = data.user.user;
                        if( data.address ) {
                            $scope.cart.userTelephone = data.address.areaCode + '' + data.address.telephone;
                            $scope.cart.userFullName = data.address.name + ' ' + data.address.lastname;
                        }

                        LoginWidgetService.loginInCart($scope, credentials).then(function() {
                            getCartData();
                        });

                    } else {
                        if (data.info.length > 0) {
                            Notification.error($filter('translate')(data.info));
                        } else {
                            Notification.error($filter('translate')('error'));
                        }
                    }

                }, function (data) {
                    Notification.error($filter('translate')('unexpected_error'));
                });
            } else {
                Notification.error($filter('translate')('accept_terms'));
            }
        };

        $scope.addNonRegister = function () {

            if ($scope.noRegisterForm.terms !== true || $scope.noRegisterForm.data_protection !== true) {
                Notification.error($filter('translate')('accept_terms'));
                return;
            }

            checkFiles().then(function (emptyProducts) {

                if (emptyProducts > 0) {
                    Notification.error($filter('translate')('to_order_add_file'));
                    return;
                }

                $scope.noRegisterForm.oneTimeUser = 1;
                $scope.noRegisterForm.captchaResponse = $scope.response;

                UserService.userRegister($scope.noRegisterForm).then(function (data) {

                    console.log(data);

                    var credentials = {};
                    credentials.password = data.user.ID;
                    credentials.email = data.user.user + '_' + data.user.ID;

                    $scope.cart.userMail = data.user.user;
                    if( data.address ) {
                        $scope.cart.userTelephone = data.address.areaCode + '' + data.address.telephone;
                        $scope.cart.userFullName = data.address.name + ' ' + data.address.lastname;
                    }

                    LoginWidgetService.loginInCart($scope, credentials, true).then( function() {
                        getCartData();
                    });

                }, function err(data) {
                    if (data.info.length > 0) {
                        Notification.error($filter('translate')(data.info));
                    } else {
                        Notification.error($filter('translate')('unexpected_error'));
                    }
                });

            });

        };

        $scope.continueShopping = function () {
            $state.go('home');
        };

        $scope.paymentConfirm = function (paymentID) {

            var paymentIdx = _.findIndex($scope.payments, {ID: paymentID});

            if( paymentIdx > -1 ) {
                var payment = $scope.payments[paymentIdx];

                if( payment.deferredPayment && !payment.creditLimit ) {
                    Notification.error($filter('translate')('no_credit_limit'));
                    return;
                }

                if( payment.limitExceeded ) {
                    Notification.error($filter('translate')('credit_limit_exceeded') + ' - ' +
                        payment.creditLimit + '/' +  payment.unpaidValue + ' ' + payment.baseCurrency );
                    return;
                }

                resetPayments().then(function() {
                    payment.selected = true;
                });
            }

            if( $scope.confirmButtonInCart ) {
                if( !$scope.form.confirmStatute ) {
                    Notification.error($filter('translate')('confirm_statute_is_required'));
                    return;
                }
            }

            checkSelfCollectDelivery($scope.cart.products).then(function(collectDeliveries) {

                if ($scope.addresses.length === 0 && !collectDeliveries) {

                    fillRecieverAddress();

                } else {

                    var incorrectProduct = 0;
                    _.each($scope.cart.products, function (product) {
                        if( _.isEmpty(product.addresses)) {
                            //showDelivery(product);
                            incorrectProduct++;
                        }
                    });

                    if( incorrectProduct > 0 ) {
                        Notification.error($filter('translate')('choose_delivery'));
                        return;
                    }

                    Setting.getPublicSettings().then(function(settingsData) {
                        if( settingsData.onlyForCompanies && settingsData.onlyForCompanies.value === 1 ) {
                            DpAddressService.getDefaultAddress(2).then(function (invoiceData) {
                                if( invoiceData.address.length === 0 ) {
                                    fillInvoiceAddress();
                                } else {
                                    if( settingsData.separateConfirmButton && settingsData.separateConfirmButton.value === 1 ) {
                                        showConfirmButton(payment);
                                    } else {
                                        $scope.preventPayment = true;
                                        doConfirmation(paymentID);
                                    }
                                }
                            });
                        } else {
                            if( settingsData.separateConfirmButton && settingsData.separateConfirmButton.value === 1 ) {
                                showConfirmButton(payment);
                            } else {
                                $scope.preventPayment = true;
                                doConfirmation(paymentID);
                            }
                        }

                    });

                }



            });

        };

        $scope.confirmStatuteCheck = function() {
            if( this.form.confirmStatute ) {
                var payment = _.findWhere($scope.payments, { selected: true });
                if(payment) {
                    $scope.confirmButton = true;
                }
            } else {
                $scope.confirmButton = false;
            }
        };

        $scope.confirmOrder = function() {
            var payment = _.findWhere($scope.payments, { selected: true });

            if( payment ) {
                doConfirmation(payment.ID);
            } else {
                Notification.info($filter('translate')('select_a _payment_method'));
            }
        };

        function showConfirmButton(payment) {

            $scope.confirmButton = true;

        }

        function resetPayments() {

            var def = $q.defer();

            $scope.payments.forEach(function(element, index) {
                element.selected = false;
                if( ($scope.payments.length -1 ) === index ) {
                    def.resolve(true);
                }
            });

            return def.promise;
        }

        function doConfirmation(paymentID) {

            var orderID;
            var sendData = {};
            sendData.addresses = {};

            _.each($scope.cart.products, function (product) {

                orderID = product.orderID;
                sendData.addresses[product.ID] = product.addresses;

            });

            sendData.paymentID = paymentID;
            sendData.orderMessage = $scope.form.orderMessage;

            DpOrderService.saveCart(orderID, sendData).then(function (_cartData) {

                if (_cartData.payment.status) {
                    if (_cartData.payment.status.statusCode === "SUCCESS" && _cartData.payment.operator == 'payu') {

                        AuthService.cleanSession().then(function () {
                            $rootScope.carts = [];
                            $rootScope.orderID = null;
                            window.location.href = _cartData.payment.redirectUri;
                        });
                    } else if(_cartData.payment.status === 'NEW' && _cartData.payment.operator == 'tinkoff') {

                        AuthService.cleanSession().then(function () {
                            $rootScope.carts = [];
                            $rootScope.orderID = null;
                            window.location.href = _cartData.payment.url;
                        });
                    } else if(_cartData.payment.status === 'NEW' && _cartData.payment.operator == 'sberbank') {

                        AuthService.cleanSession().then(function () {
                            $rootScope.carts = [];
                            $rootScope.orderID = null;
                            window.location.href = _cartData.payment.url;
                        });
                    } else if(_cartData.payment.status === 'CREATED' && _cartData.payment.operator == 'paypal') {

                        AuthService.cleanSession().then(function () {
                            $rootScope.carts = [];
                            $rootScope.orderID = null;
                            window.location.href = _cartData.payment.url;
                        });
                    } else {
                        Notification.error($filter('translate')('payment_rejected'));
                    }
                } else {
                    AuthService.cleanSession().then(function (data) {
                        $rootScope.carts = [];
                        $rootScope.orderID = null;
                        $state.go('cartVerify', {orderid: orderID});
                    });

                }

            });
        }

        $scope.editName = function (product) {

            if (_timeout) {
                $timeout.cancel(_timeout);
            }

            _timeout = $timeout(function () {
                var CalculateService = new CalculationService(product.groupID, product.typeID);
                CalculateService.updateName({
                    name: product.name,
                    productID: product.productID
                }).then(function (response) {
                    if (response.response == true) {
                        Notification.success($filter('translate')('saved_message'));
                    }
                });
            }, 1000);

        };

        $scope.showOldPrice = function (oldPrice, newPrice) {
            if (typeof oldPrice === 'string') {
                oldPrice = oldPrice.replace(',', '.');
            }
            if (typeof newPrice === 'string') {
                newPrice = newPrice.replace(',', '.');
            }
            return parseFloat(oldPrice) > parseFloat(newPrice);
        };

        $scope.sendCoupon = function () {
            var coupon = this.form.couponID;
            this.form.couponID = null;
            CouponService.check(coupon, $rootScope.orderID).then(function (data) {
                if (data.response) {
                    DpOrderService.updatePrice().then(function (updateData) {

                        if( updateData.response === true ) {
                            if( updateData.messages.length > 0 ) {
                                _.each(updateData.messages, function(msg) {
                                    Notification.success($filter('translate')(msg));
                                });
                            }
                            getCartData();
                        } else {
                            if( updateData.messages.length > 0 ) {
                                _.each(updateData.messages, function(msg) {
                                    Notification.error($filter('translate')(msg));
                                });
                            }
                        }

                    });
                } else {
                    if( data.info ) {
                        _.each(data.info.results, function(oneResult) {
                            if( oneResult.valid ) {
                                Notification.success( $filter('translate')(oneResult.reason) );
                            } else {
                                Notification.error( $filter('translate')(oneResult.reason) );
                            }
                        });
                        Notification.error( $filter('translate')(data.info) );
                    } else {
                        Notification.error($filter('translate')('error'));
                    }
                }
            }, function (data) {
                Notification.error($filter('translate')(data.info));
            });
        };

        function checkAddressesToJoin(mongoCarts, order) {
            var pAddress = null;
            var match = {};
            var prdIndex;

            var def = $q.defer();

            _.each(mongoCarts, function (cart, index) {
                if (cart.ProductAddresses && cart.ProductAddresses.length === 1) {

                    prdIndex = _.findIndex(order.products, {productID: cart.productID});

                    if (prdIndex > -1) {
                        pAddress = _.first(cart.ProductAddresses);

                        if (pAddress.join && $scope.connectedIndexes[pAddress.addressID] === undefined) {
                            var maxIndex;
                            if (_.isEmpty($scope.connectedIndexes)) {
                                maxIndex = 1;
                            } else {
                                maxIndex = _.max($scope.connectedIndexes) + 1;
                            }
                            $scope.connectedIndexes[pAddress.addressID] = maxIndex;
                        }

                        if ($scope.connectDeliveryPrices[pAddress.addressID] === undefined) {
                            $scope.connectDeliveryPrices[pAddress.addressID] = {};
                        }

                        fillDeliveryData(order, pAddress.addressID, 'oldDeliveryPriceGross', 'old');
                        fillDeliveryData(order, pAddress.addressID, 'deliveryPriceGross', 'new');

                        if (match[pAddress.addressID] === undefined) {
                            match[pAddress.addressID] = [];
                        }
                        match[pAddress.addressID].push({
                            productID: cart.productID,
                            names: order.products[prdIndex].names,
                            join: pAddress.join,
                            calcID: cart.calcID,
                            deliveryID: pAddress.deliveryID,
                            volume: pAddress.volume,
                            allVolume: pAddress.allVolume,
                            realisationDate: order.products[prdIndex].realisationDate
                        });
                        if (match[pAddress.addressID].length > 1) {
                            $scope.canJoinAddresses = true;
                        }

                        if (mongoCarts.length === index + 1) {
                            def.resolve(match);
                        }
                    }
                }
            });

            function fillDeliveryData(order, addressID, name, dest) {
                if (order.products[prdIndex] === undefined) {
                    return;
                }
                if ($scope.connectDeliveryPrices[addressID][dest] === undefined) {
                    $scope.connectDeliveryPrices[addressID][dest] = 0;
                }
                if (typeof(order.products[prdIndex][name]) === 'string') {
                    $scope.connectDeliveryPrices[addressID][dest] += parseFloat(order.products[prdIndex][name].replace(',', '.'));
                } else {
                    $scope.connectDeliveryPrices[addressID][dest] += order.products[prdIndex][name];
                }
            }

            $scope.joinAddresses = function (addressID, productAddress) {

                var _that = this;
                var active = !!productAddress.join;
                var tokenParams = {};
                var params = {};
                params.active = active;

                if (!active) {
                    tokenParams = {};
                    tokenParams.active = active;
                    tokenParams['addressID'] = addressID;
                    TokenService.joinAddresses(tokenParams).then(function (data) {
                        tokenParams['productAddresses'] = $scope.addressToJoin[addressID];
                        DpOrderService.recalculateDelivery(tokenParams).then(function (recalculateData) {
                            delete $scope.connectedIndexes[addressID];
                            getCartData();
                        });
                    });
                } else {
                    TemplateRootService.getTemplateUrl(92).then(function (response) {
                        var mergeDeliveryModal = $modal.open({
                            templateUrl: response.url,
                            scope: $scope,
                            backdrop: true,
                            keyboard: true,
                            size: 'lg',
                            controller: function ($scope, $modalInstance) {

                                $scope.summary = null;
                                $scope.collectionPoints = [];

                                $scope.activeAddressToJoin = $scope.addressToJoin[addressID];
                                $scope.activeAddressID = addressID;

                                $scope.changeDelivery = function () {
                                    var selectedDeliveryID = this.joinDeliveryID;
                                    $scope.summary = DeliveryWidgetService.getJoinWeight($scope, selectedDeliveryID);
                                    $scope.collectionPoints = DeliveryWidgetService.checkCollectionPoints($scope, selectedDeliveryID);
                                    if( $scope.collectionPoints.length > 0 ) {
                                        $scope.collectionPointID = $scope.collectionPoints[0].ID;
                                    }
                                };

                                $scope.changeCollectionPoint = function() {
                                    $scope.addressToJoin[addressID].collectionPointID = this.collectionPointID;
                                };

                                $scope.save = function () {

                                    var commonRealisationTime = 0;

                                    _.each($scope.addressToJoin[addressID], function (productAddress) {
                                        if (Date.parse(productAddress.realisationDate) > Date.parse(commonRealisationTime)) {
                                            commonRealisationTime = productAddress.realisationDate;
                                        }
                                    });

                                    tokenParams = {};
                                    tokenParams['addressID'] = addressID;
                                    tokenParams['active'] = active;
                                    tokenParams['commonDeliveryID'] = $scope.joinDeliveryID;
                                    tokenParams['commonRealisationTime'] = commonRealisationTime;
                                    tokenParams['collectionPointID'] = $scope.collectionPointID;

                                    TokenService.joinAddresses(tokenParams).then(function (data) {
                                        params.currency = $rootScope.currentCurrency.code;
                                        params.commonDeliveryID = $scope.joinDeliveryID;
                                        params['productAddresses'] = $scope.addressToJoin[addressID];
                                        DpOrderService.recalculateDelivery(params).then(function (recalculateData) {
                                            var maxIndex;
                                            if (_.isEmpty($scope.connectedIndexes)) {
                                                maxIndex = 1;
                                            } else {
                                                maxIndex = _.max($scope.connectedIndexes) + 1;
                                            }
                                            $scope.connectedIndexes[addressID] = maxIndex;
                                            getCartData();
                                            $modalInstance.close(true);
                                        });
                                    });
                                }

                            }
                        });

                        mergeDeliveryModal.result.then(function (closeResult) {
                            joinAllDeliveries($scope.cart.products);
                            productAddress.join = true;
                            console.log('save merge delivery!');
                        }, function () {
                            productAddress.join = false;
                            $scope.joinedDelivery = {};
                        });
                    });
                }

            };

            return def.promise;
        }

        function joinAllDeliveries(products) {

            var weight = 0;
            var numberOfPackages = 0;
            var commonAddress;
            var volume = 0;

            $scope.joinedDelivery = {};

            var indexProduct = 0;
            _.each(products, function(product) {

                if( product.addresses.length === 1 ) {

                    commonAddress = _.find(product.addresses, function(item) {
                        return item.commonDeliveryID  === item.deliveryID;
                    });

                    if( commonAddress !== undefined && commonAddress.join === true ) {
                        if( commonAddress.collectionPointID ) {
                            $scope.joinedDelivery.collectionPoint = commonAddress.collectionPoint;
                            $scope.joinedDelivery.collectionPointID = commonAddress.collectionPointID;
                        }

                        $scope.joinedDelivery.deliveryID = commonAddress.deliveryID;
                        if( commonAddress.allVolume !== undefined ) {
                            volume += commonAddress.allVolume;
                        }
                        $scope.joinedDelivery.volume = volume;
                        $scope.joinedDelivery.senderID = commonAddress.senderID;
                        $scope.joinedDelivery.deliveryNames = _.extend({}, commonAddress.deliveryNames);
                        $scope.joinedDelivery.details = commonAddress.details;
                        $scope.joinedDelivery.senderName = commonAddress.senderName;

                        if( commonAddress.no_of_pkgs !== undefined ) {
                            numberOfPackages += commonAddress.no_of_pkgs;
                        }

                        $scope.joinedDelivery.no_of_pkgs = numberOfPackages;

                        if( commonAddress.grossweight !== undefined ) {
                            if( typeof commonAddress.grossweight === 'string' ) {
                                weight = parseFloat(commonAddress.grossweight.replace(',', '.'));
                            } else {
                                weight = parseFloat(commonAddress.grossweight);
                            }
                        } else {
                            weight = 0;
                        }

                        if( $scope.joinedDelivery.grossweight === undefined ) {
                            $scope.joinedDelivery.grossweight = 0;
                        }

                        $scope.joinedDelivery.grossweight += weight;

                        if( (products.length-1) === indexProduct ) {
                            $scope.joinedDelivery.grossweight = $scope.joinedDelivery.grossweight.toFixed(2) +
                                ''.replace('.',',');
                        }
                        $scope.joinedDelivery.price = commonAddress.price;
                        $scope.joinedDelivery.priceGross = commonAddress.priceGross;
                    } else {
                        $scope.joinedDelivery = {};
                    }
                }

                indexProduct++;
            });

        }

        function fillRecieverAddress() {
            console.log('Musisz posiadać address');

            TemplateRootService.getTemplateUrl(97).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        $scope.saveAddress = function () {

                            this.form.default = 1;

                            DpAddressService.addAddress($scope.form, 1).then( function(data) {
                                if(data.response === true) {
                                    $scope.addresses.push(data.item);
                                    var params = {addressID: data.item.ID};
                                    AuthService.updateDefaultAddress(params).then(function () {
                                        addAddressToOrder(data.item.ID);
                                        Notification.success($filter('translate')('added'));
                                        $modalInstance.close();
                                    });
                                } else {
                                    Notification.error($filter('translate')('error'));
                                }
                            }, function(data) {
                                Notification.error($filter('translate')('error'));
                            });

                        };

                        $scope.cancel = function () {
                            $modalInstance.close();
                        }

                    }
                });

            });

        }

        function fillInvoiceAddress() {

            console.log('Musisz podać dane do faktury!');

            TemplateRootService.getTemplateUrl(98).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        $scope.saveAddress = function () {

                            this.form.default = 1;

                            DpAddressService.addAddress($scope.form, 2).then( function(data) {
                                if(data.response === true) {
                                    Notification.success($filter('translate')('added'));
                                    $modalInstance.close();
                                } else {
                                    Notification.error($filter('translate')('error'));
                                }
                            }, function(data) {
                                Notification.error($filter('translate')('error'));
                            });

                        };

                        $scope.cancel = function () {
                            $modalInstance.close();
                        }

                    }
                });

            });

        }

        /**
        function showDelivery(product) {

            TemplateRootService.getTemplateUrl(67).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope, $rootScope, $modalInstance) {

                        $scope.deliveryLackOfVolume = 0;

                        var adrIdx;
                        var sdrIdx;
                        var dlvIdx;

                        $scope.selectedProduct = product;
                        $scope.selectedProduct.editMode = false;

                        $scope.filteredDeliveries = [];
                        filterDeliveries($scope, product).then(function(filteredDeliveries) {

                            $scope.filteredDeliveries = filteredDeliveries;

                            if( product.addresses.length > 0 ) {

                                _.each(product.addresses, function (address) {

                                    DeliveryWidgetService.checkExclusionsCart($scope, product, address);

                                    address.senders = $scope.$parent.senders;

                                    adrIdx = _.findIndex($scope.addresses, {ID: address.addressID});
                                    if (adrIdx > -1) {
                                        address.details = $scope.addresses[adrIdx];
                                    }

                                    sdrIdx = _.findIndex($scope.senders, {type: address.senderID});
                                    if (sdrIdx > -1) {
                                        address.senderName = $filter('translate')($scope.senders[sdrIdx].name);
                                    }

                                    if (address.commonDeliveryID) {
                                        address.deliveryID = address.commonDeliveryID;
                                    }

                                    dlvIdx = _.findIndex($scope.filteredDeliveries, {ID: address.deliveryID});
                                    if (dlvIdx > -1) {
                                        address.deliveryNames = $scope.filteredDeliveries[dlvIdx].names;
                                    }

                                    DeliveryWidgetService.getPkgWeight(product, address, $scope.filteredDeliveries);
                                });
                            } else {

                                $scope.productAddresses = [{}];

                                $scope.productAddresses[0].deliveryID = $scope.filteredDeliveries[0].ID;
                                $scope.productAddresses[0].index = 0;

                                var address = $scope.productAddresses[0];
                                address.weight = product.weight;
                                address.volume = product.volume;
                                address.allVolume = product.volume * product.amount;


                                address.deliveries = $scope.filteredDeliveries;
                                address.senders = $scope.$parent.senders;
                                address.senderID = address.senders[0].type;

                                var defaultAddress = _.first(_.filter($scope.$parent.addresses, function(num) {
                                    if( num.default === 1 ){
                                        return num;
                                    }
                                }));

                                address.addressID = defaultAddress.ID;

                                DeliveryWidgetService.getPkgWeight(product, address, $scope.filteredDeliveries);

                            }
                        });

                        $scope.saveAddresses = function () {

                            var oneProductAddress = _.first($scope.productAddresses);
                            if( !oneProductAddress || oneProductAddress.join === true  ) {
                                Notification.error($filter('translate')('error'));
                                return;
                            }

                            DeliveryWidgetService.reducePostData($scope.productAddresses).then( function(productAddresses) {

                                AddressService.updateProductAddresses(product.orderID, product.productID, productAddresses).then(function(savedData) {
                                    if( savedData.response === true) {
                                        DpOrderService.changeAddresses(product.orderID, product.productID, productAddresses).then(function(updateData) {

                                            if( updateData.response === true ) {
                                                getCartData();
                                            }

                                            Notification.success($filter('translate')('saved_message'));
                                            var tmpProductAddresses = [];
                                            _.each(savedData.productAddresses, function (oneAddress) {
                                                DeliveryWidgetService.getPkgWeight(product, oneAddress, $scope.filteredDeliveries);
                                                fillDeliveryInfo($scope, oneAddress).then(function (updatedAddress) {
                                                    tmpProductAddresses.push(updatedAddress);
                                                });
                                            });
                                            $scope.selectedProduct.addresses = tmpProductAddresses;
                                            $scope.selectedProduct.editMode = false;
                                        });
                                    } else {
                                        Notification.error($filter('translate')('error'));
                                    }
                                });

                            });

                        };

                        $scope.editAddresses = function() {
                            var oneProductAddress = _.first(product.addresses);
                            if( !oneProductAddress || oneProductAddress.join === true  ) {
                                Notification.error($filter('translate')('error'));
                                return;
                            }
                            $scope.selectedProduct.editMode = true;
                            $scope.productAddresses = product.addresses;
                            _.each($scope.productAddresses, function(productAddress) {
                                productAddress.deliveries = $scope.filteredDeliveries;
                            });
                        };

                        $scope.cancel = function () {
                            $modalInstance.close();
                        };

                        $scope.separateDelivery = function () {

                            var newVolume = Number(this.separateVolume);

                            if ($scope.deliveryLackOfVolume < 0) {
                                $scope.deliveryLackOfVolume = 0;
                            }
                            if (newVolume <= 0 || _.isNaN(newVolume)) {
                                Notification.error($filter('translate')('enter_volume'));
                                return;
                            }

                            var availableVolumes = Number($scope.productAddresses[0].allVolume + $scope.deliveryLackOfVolume);
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

                            if (newVolume <= $scope.deliveryLackOfVolume) {
                                $scope.deliveryLackOfVolume = Number($scope.deliveryLackOfVolume - newVolume);
                            } else {

                                diffVolume = Number(newVolume - $scope.deliveryLackOfVolume);

                                if (diffVolume === $scope.productAddresses[0].allVolume) {
                                    Notification.error($filter('translate')('enter_less_volume'));
                                    return;
                                }

                                if (diffVolume > $scope.productAddresses[0].allVolume) {
                                    var over = Number(diffVolume - $scope.productAddresses[0].allVolume);
                                    Notification.error($filter('translate')('volume_exceeded_by') + ' ' + over);
                                    return;
                                }

                                $scope.deliveryLackOfVolume = 0;
                                if (diffVolume > 0 && diffVolume < $scope.productAddresses[0].allVolume) {
                                    $scope.productAddresses[0].allVolume = Number($scope.productAddresses[0].allVolume - diffVolume);
                                }

                            }

                            var newIndex = _.findLast($scope.productAddresses).index + 1;
                            var lastIndex = $scope.productAddresses.push({
                                'volume': newVolume, 'allVolume': newVolume, 'index': newIndex
                            }) - 1;
                            $scope.productAddresses[lastIndex].deliveryID = $scope.productAddresses[0].deliveryID;
                            $scope.productAddresses[lastIndex].addressID = $scope.productAddresses[0].addressID;
                            $scope.productAddresses[lastIndex].senderID = $scope.productAddresses[0].senderID;
                            $scope.productAddresses[lastIndex].deliveries = $scope.filteredDeliveries;

                            $scope.changeVolumes();
                        };

                        $scope.changeVolumes = function() {

                            var _this = this;
                            if(_timeout){
                                $timeout.cancel(_timeout);
                            }

                            var allVolumes = 0;
                            _.each($scope.productAddresses, function(oneAddress) {
                                allVolumes += parseInt(oneAddress.allVolume);
                                DeliveryWidgetService.getPkgWeight(product, oneAddress, $scope.filteredDeliveries);
                            });

                            _timeout = $timeout(function(){

                                var selectedVolume = $scope.selectedProduct.volume;
                                if( $scope.selectedProduct.amount > 1 ) {
                                    selectedVolume *= $scope.selectedProduct.amount;
                                }

                                if( allVolumes > selectedVolume ){
                                    var over = allVolumes - selectedVolume;

                                    $scope.productAddresses[_this.$index].allVolume -= Number(over);
                                    $scope.deliveryLackOfVolume = 0;

                                    Notification.error($filter('translate')('volume_exceeded_by') + ' ' + over);

                                } else if( allVolumes <= selectedVolume ) {

                                    $scope.deliveryLackOfVolume = Number(selectedVolume - allVolumes);

                                }

                                _timeout = null;
                            },500);
                        };

                        $scope.removeProductAddress = function (idx) {
                            var oldVolume = Number($scope.productAddresses[idx].allVolume);
                            $scope.productAddresses.splice(idx, 1);
                            $scope.productAddresses[0].allVolume = Number($scope.productAddresses[0].allVolume) + oldVolume;
                        };

                    }
                });
            });
        }
        **/

        function showDeliveryBox(product) {
            product.deliveryLackOfVolume = 0;
            product.editMode = false;

            $scope.filteredDeliveries = [];

            var deliveryAddressIndex;
            var senderAddressIndex;
            var deliveryIndex;

            filterDeliveries2($scope, product).then(function(filteredDeliveries) {

                product.filteredDeliveries = filteredDeliveries;

                if( product.addresses.length > 0 ) {

                    _.each(product.addresses, function (address, index) {

                        if( !address.index ) {
                            address.index = index;
                        }
                        DeliveryWidgetService.checkExclusionsCart($scope, product, address);

                        address.senders = $scope.senders;

                        deliveryAddressIndex = _.findIndex($scope.addresses, {ID: address.addressID});
                        if (deliveryAddressIndex > -1) {
                            address.details = $scope.addresses[deliveryAddressIndex];
                        }

                        senderAddressIndex = _.findIndex($scope.senders, {type: address.senderID});
                        if (senderAddressIndex > -1) {
                            address.senderName = $filter('translate')($scope.senders[senderAddressIndex].name);
                        }

                        if (address.commonDeliveryID) {
                            address.deliveryID = address.commonDeliveryID;
                        }

                        deliveryIndex = _.findIndex(product.filteredDeliveries, {ID: address.deliveryID});
                        if (deliveryIndex > -1) {

                            address.deliveryNames = product.filteredDeliveries[deliveryIndex].names;
                            address.collectionPoints = product.filteredDeliveries[deliveryIndex].collectionPoints;
                            var collectionPointIndex = _.findIndex(
                                product.filteredDeliveries[deliveryIndex].collectionPoints,
                                {ID: address.collectionPointID});
                            if( collectionPointIndex > -1 ) {
                                address.collectionPoint = product.filteredDeliveries[deliveryIndex].collectionPoints[collectionPointIndex];
                            }
                        }

                        DeliveryWidgetService.getPkgWeight(product, address, product.filteredDeliveries);
                    });

                } else {

                    product.productAddresses = [{}];

                    product.productAddresses[0].deliveryID = $scope.filteredDeliveries[0].ID;
                    product.productAddresses[0].index = 0;

                    var address = product.productAddresses[0];
                    address.weight = product.weight;
                    address.volume = product.volume;
                    address.allVolume = product.volume * product.amount;


                    address.deliveries = product.filteredDeliveries;
                    address.senders = product.senders;
                    address.senderID = address.senders[0].type;

                    var defaultAddress = _.first(_.filter(product.addresses, function(num) {
                        if( num.default === 1 ){
                            return num;
                        }
                    }));

                    address.addressID = defaultAddress.ID;

                    DeliveryWidgetService.getPkgWeight(product, address, product.filteredDeliveries);

                }

                joinAllDeliveries($scope.cart.products);

            });

        }

        $scope.editDeliveryAddresses = function(product) {
            var oneProductAddress = _.first(product.addresses);
            if( !oneProductAddress || oneProductAddress.join === true  ) {
                Notification.error($filter('translate')('error'));
                return;
            }
            product.editMode = true;
            product.productAddresses = product.addresses;

            _.each(product.productAddresses, function(productAddress, index) {
                productAddress.deliveries = product.filteredDeliveries;
                DeliveryWidgetService.checkExclusionsInCart(product, productAddress);
                checkDeliveryParcelShops(productAddress);
            });
        };

        $scope.separateDelivery = function (product) {

            /**
             * @param {number|string} $scope.separateVolume
             */
            var newVolume = Number(this.separateVolume);

            if (product.deliveryLackOfVolume < 0) {
                product.deliveryLackOfVolume = 0;
            }
            if (newVolume <= 0 || _.isNaN(newVolume)) {
                Notification.error($filter('translate')('enter_volume'));
                return;
            }

            var availableVolumes = Number(product.productAddresses[0].allVolume + product.deliveryLackOfVolume);
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

                if (diffVolume === product.productAddresses[0].allVolume) {
                    Notification.error($filter('translate')('enter_less_volume'));
                    return;
                }

                if (diffVolume > product.productAddresses[0].allVolume) {
                    var over = Number(diffVolume - product.productAddresses[0].allVolume);
                    Notification.error($filter('translate')('volume_exceeded_by') + ' ' + over);
                    return;
                }

                product.deliveryLackOfVolume = 0;
                if (diffVolume > 0 && diffVolume < product.productAddresses[0].allVolume) {
                    product.productAddresses[0].allVolume = Number(product.productAddresses[0].allVolume - diffVolume);
                }

            }

            var newIndex = _.findLast(product.productAddresses).index + 1;
            var lastIndex = product.productAddresses.push({
                'volume': newVolume, 'allVolume': newVolume, 'index': newIndex
            }) - 1;
            product.productAddresses[lastIndex].deliveryID = product.productAddresses[0].deliveryID;
            product.productAddresses[lastIndex].addressID = product.productAddresses[0].addressID;
            product.productAddresses[lastIndex].senderID = product.productAddresses[0].senderID;
            product.productAddresses[lastIndex].deliveries = product.filteredDeliveries;

            $scope.changeVolumes(product);
        };

        $scope.changeVolumes = function(product) {

            var _this = this;
            if(_timeout){
                $timeout.cancel(_timeout);
            }

            var allVolumes = 0;

            _.each(product.productAddresses, function(oneAddress, index) {
                allVolumes += parseInt(oneAddress.allVolume);
                DeliveryWidgetService.getPkgWeight(product, oneAddress, product.filteredDeliveries);
                checkDeliveryParcelShops(oneAddress);
                checkDeliveryCollectionPoints(oneAddress);
            });

            _timeout = $timeout(function(){

                var selectedVolume = product.volume;
                if( product.amount > 1 ) {
                    selectedVolume *= product.amount;
                }

                if( allVolumes > selectedVolume ){
                    var over = allVolumes - selectedVolume;

                    product.productAddresses[_this.$index].allVolume -= Number(over);
                    product.deliveryLackOfVolume = 0;

                    Notification.error($filter('translate')('volume_exceeded_by') + ' ' + over);

                } else if( allVolumes <= selectedVolume ) {

                    product.deliveryLackOfVolume = Number(selectedVolume - allVolumes);

                }

                _timeout = null;
            },500);
        };

        $scope.saveAddresses = function (product) {

            var oneProductAddress = _.first(product.productAddresses);
            if( !oneProductAddress || oneProductAddress.join === true  ) {
                Notification.error($filter('translate')('error'));
                return;
            }

            DeliveryWidgetService.reducePostData(product.productAddresses).then( function(productAddresses) {

                AddressService.updateProductAddresses(product.orderID, product.productID, productAddresses).then(function(savedData) {
                    if( savedData.response === true) {
                        DpOrderService.changeAddresses(product.orderID, product.productID, productAddresses).then(function(updateData) {

                            if( updateData.response === true ) {
                                getCartData();
                            }

                            Notification.success($filter('translate')('saved_message'));
                            var tmpProductAddresses = [];
                            _.each(savedData.productAddresses, function (oneAddress) {
                                DeliveryWidgetService.getPkgWeight(product, oneAddress, $scope.filteredDeliveries);
                                fillDeliveryInfo(product, oneAddress).then(function (updatedAddress) {
                                    tmpProductAddresses.push(updatedAddress);
                                });
                            });
                            product.addresses = tmpProductAddresses;
                            product.editMode = false;
                        });
                    } else {
                        Notification.error($filter('translate')('error'));
                    }
                });

            });

        };

        $scope.removeProductAddress = function (product, idx) {
            var oldVolume = Number(product.productAddresses[idx].allVolume);
            product.productAddresses.splice(idx, 1);
            product.productAddresses[0].allVolume = Number(product.productAddresses[0].allVolume) + oldVolume;
        };

        /**
         * @param scope
         * @param product
         */
        function filterDeliveries(scope, product) {
            // deffer
            var def = $q.defer();

            var filteredDeliveries = scope.$parent.deliveries;

            var counter = 0;
            var counterCompare = 0;

            _.each(product.calcProducts, function( oneProduct ) {

                counterCompare += oneProduct.attributes.length;
                _.each(oneProduct.attributes, function(attribute) {

                    if( attribute.excludeDeliveries && attribute.excludeDeliveries.length > 0 ) {

                        _.each(attribute.excludeDeliveries, function(deliveryID) {

                            var deliveryIndex = _.findIndex(filteredDeliveries, {ID: deliveryID});

                            if( deliveryIndex > -1 ) {

                                filteredDeliveries.splice(deliveryIndex, 1);
                            }

                        });
                        counter++;
                        if( counter === counterCompare ) {
                            def.resolve(filteredDeliveries);
                        }
                    } else {
                        counter++;
                        if( counter === counterCompare ) {
                            def.resolve(filteredDeliveries);
                        }
                    }
                });
            });

            return def.promise;
        }

        function checkDeliveryParcelShops(productAddress) {

            var deliveryIndex = _.findIndex(productAddress.deliveries, {ID: productAddress.deliveryID});
            if( deliveryIndex > -1 ) {

                if( productAddress.deliveries[deliveryIndex].hasParcelShops && !productAddress.parcelShops ) {

                    productAddress.hasParcelShops = true;
                    productAddress.parcelShops = null;

                    DeliveryWidgetService.findParcelShops(
                        productAddress.addressID,
                        productAddress.deliveries[deliveryIndex].ID,
                        productAddress.deliveries[deliveryIndex].courierID,
                        productAddress
                    ).then( function(result) {
                        console.log(result);
                    });
                } else if ( productAddress.deliveries[deliveryIndex].hasParcelShops && productAddress.parcelShops ) {
                    productAddress.hasParcelShops = true;
                } else {
                    productAddress.hasParcelShops = false;
                }
            }
        }

        function checkDeliveryCollectionPoints(productAddress) {

            var deliveryIndex = _.findIndex(productAddress.deliveries, {ID: productAddress.deliveryID});
            if( deliveryIndex > -1 ) {

                if(productAddress.deliveries[deliveryIndex].module.func === 'collectionAttributes') {

                    productAddress.collectionPointID = productAddress.deliveries[deliveryIndex].collectionPoints[0].ID;
                    productAddress.collectionPoint = productAddress.deliveries[deliveryIndex].collectionPoints[0];
                    productAddress.collectionPoints = productAddress.deliveries[deliveryIndex].collectionPoints;

                } else {
                    delete productAddress.collectionPointID;
                    delete productAddress.collectionPoint;
                    delete productAddress.collectionPoints;
                }
            }


        }

        function filterDeliveries2(scope, product) {
            // deffer
            var def = $q.defer();

            var filteredDeliveries = scope.deliveries;

            var counter = 0;
            var counterCompare = 0;

            _.each(product.calcProducts, function( oneProduct ) {

                counterCompare += oneProduct.attributes.length;
                _.each(oneProduct.attributes, function(attribute) {

                    if( attribute.excludeDeliveries && attribute.excludeDeliveries.length > 0 ) {

                        _.each(attribute.excludeDeliveries, function(deliveryID) {

                            var deliveryIndex = _.findIndex(filteredDeliveries, {ID: deliveryID});

                            if( deliveryIndex > -1 ) {

                                filteredDeliveries.splice(deliveryIndex, 1);
                            }

                        });
                        counter++;
                        if( counter === counterCompare ) {
                            def.resolve(filteredDeliveries);
                        }
                    } else {
                        counter++;
                        if( counter === counterCompare ) {
                            def.resolve(filteredDeliveries);
                        }
                    }
                });
            });

            return def.promise;
        }

        $scope.displayFlipBook = function (product) {

            if( product.prevPages === undefined ) {
                return;
            }

            var flipbookHolder = document.createElement('div');
            flipbookHolder.className = 'flipbook-holder';

            var remove = document.createElement('div');
            remove.className = 'remove-flipbook';
            remove.innerHTML = 'x';

            var nextPage = document.createElement('div');
            nextPage.className = 'nextPage-flipbook';
            nextPage.innerHTML = '<i class="fa fa-arrow-right" aria-hidden="true"></i>';

            var prevPage = document.createElement('div');
            prevPage.className = 'prevPage-flipbook';
            prevPage.innerHTML = '<i class="fa fa-arrow-left" aria-hidden="true"></i>';

            flipbookHolder.appendChild(remove);
            flipbookHolder.appendChild(nextPage);
            flipbookHolder.appendChild(prevPage);

            document.body.appendChild(flipbookHolder);


            var html = '<div id="flipbook">' +
                '<div class="hard"> Turn.js </div>' +
                '<div class="hard"></div>';

            for (var i = 0; i < product.prevPages.length; i++) {

                html += '<div class=""><img src="' + product.prevPages[i] + '"></div>';

            }

            html += '<div class="hard"></div>' +
                '<div class="hard"></div>' +
                '</div>';

            flipbookHolder.innerHTML += html;

            var image = new Image();
            image.onload = function () {

                var width = window.innerWidth * 0.8;
                var aspect = width / (this.width * 2);
                var height = this.height * aspect;

                if (height > window.innerHeight) {

                    height = window.innerHeight * 0.8;
                    aspect = height / this.height;
                    width = (this.width * 2) * aspect;
                }

                flipbookHolder.style.paddingTop = (height - window.innerHeight) / 2 + "px";

                $("#flipbook").turn({
                    height: height,
                    width: width,
                    autoCenter: true
                });

                $('.remove-flipbook').on('click', function (e) {
                    e.stopPropagation();
                    $(this).parent().remove();
                });

                $('.nextPage-flipbook').on('click', function (e) {
                    $("#flipbook").turn('next')
                });

                $('.prevPage-flipbook').on('click', function (e) {
                    $("#flipbook").turn("previous");
                });

                $(document).keyup(function(e) {
                    if (e.keyCode === 27) {
                        $("#flipbook").turn("destroy").remove();
                    }
                    e.stopPropagation();
                });

            };

            image.src = product.prevPages[0];

        };

        function addAddressToOrder(addressID) {
            _.each($rootScope.carts, function(order) {
                if( !order.ProductAddresses ) {
                    _.each($scope.cart.products, function (product) {
                        if( _.isEmpty(product.addresses)) {
                            //showDelivery(product);
                        }
                    });
                } else {
                    order.ProductAddresses[0].addressID = addressID;
                }
            });
        }

        function checkSelfCollectDelivery(products) {
            var def = $q.defer();

            var countAddresses = 0;
            var countCollectionPoints = 0;
            var iterator = 0;
            var productIterator = 0;

            _.each(products, function(oneProduct) {
                countAddresses += oneProduct.addresses.length;

                _.each(oneProduct.addresses, function(oneAddress) {
                    if( oneAddress.collectionPointID !== undefined || oneAddress.collectionPointID > 0 ) {
                        countCollectionPoints++;
                    }
                    iterator++;
                    productIterator++;

                    if( iterator === countAddresses && productIterator === products.length) {
                        if(countCollectionPoints === countAddresses) {
                            def.resolve(true);
                        } else {
                            def.resolve(false);
                        }
                    }
                })
            });

            return def.promise;
        }

        $scope.loginFacebook = function () {

            SocialWidgetService.loginFacebook();

        };

        $scope.loginGoogle = function () {

            SocialWidgetService.loginGoogle();

        };

        $scope.trustAsHtml = function(string) {
            return $sce.trustAsHtml(string);
        };

        $scope.reCalculateCart = function() {

            var data = $scope.cart;

            CountService.reCalculateCart(data).then( function(responseData) {
                 if( responseData.response ) {
                     getCartData();
                     Notification.success($filter('translate')('saved_message'));
                 } else {
                     Notification.warning($filter('translate')('no_price_has_been_changed'));
                 }
            });

        };

        $scope.copyProduct = function(product) {
            CartWidgetService.copyProduct($scope, product);
        };

        $scope.changeOnlyVolume = function(product) {
            CartWidgetService.copyProduct($scope, product, true);
        };

        $scope.addressesEdit = function () {
            AddressWidgetService.addressesEdit($scope);
        };

    });
