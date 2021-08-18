'use strict';
/**
 * Created by Rafał on 13-04-2017.
 */
angular.module('digitalprint.services')
    .factory( 'LoginWidgetService', function ( AuthService, $rootScope, DpAddressService, AddressService, Notification,
                                               UserService, $cookieStore, $filter, $state, $q ) {

        /**
         * @param scope
         * @param credentials
         * @param backTo
         */
        function login( credentials, backTo ) {

            if( _.isEmpty(credentials) ) {
                Notification.error($filter('translate')('unexpected_error'));
                return;
            }

            AuthService.login(credentials).then(function (data) {

                /**
                 * @param {Object} data.user
                 * @param {number} data.user.super
                 */

                if( data.user ) {
                    $rootScope.user = data.user;
                }

                if( data.user !== undefined && data.user.super ) {

                    var startPoint = 'client-zone-orders';
                    if($rootScope.myZoneStartPoint) {
                        startPoint = $rootScope.myZoneStartPoint;
                    }

                    $state.go(startPoint).then(function () {
                        $rootScope.logged = true;
                        Notification.success($filter('translate')('login_success'));
                    });
                } else {
                    DpAddressService.getDefaultAddress(1).then(function (defaultAddress) {

                        if (defaultAddress.response) {
                            var params = {addressID: defaultAddress.address.ID};

                            AuthService.updateDefaultAddress(params).then(function () {

                                selectCurrency( data.user.userID ).then( function () {

                                    $rootScope.logged = true;
                                    $rootScope.$emit('CreditLimit:reload', true);

                                    var startPoint = 'client-zone-orders';
                                    if($rootScope.myZoneStartPoint) {
                                        startPoint = $rootScope.myZoneStartPoint;
                                    }

                                    if( backTo !== undefined && backTo.state !== undefined ){
                                        $state.go(backTo.state, backTo.params).then(function () {
                                            Notification.success($filter('translate')('login_success'));
                                        });
                                    } else {
                                        $state.go(startPoint).then(function () {
                                            Notification.success($filter('translate')('login_success'));
                                        });
                                    }

                                });

                            });

                        } else {
                            Notification.error($filter('translate')(data.error));
                        }
                    });
                }

            }, function (data) {
                $rootScope.logged = false;

                /**
                 * @param {Object} data
                 * @param {number} data.httpCode
                 */

                if (data.httpCode === 400) {
                    Notification.error($filter('translate')('wrong_mail_password'));
                } else {
                    Notification.error($filter('translate')(data.error));
                }
            });
        }

        function getAddress() {
            var def = $q.defer();

            if( $rootScope.logged ){

                AddressService.getForUser().then( function(data) {
                    def.resolve(data);
                });

            } else {
                AddressService.getAddressesFromSession().then( function(addresses) {
                    AddressService.getAll( addresses ).then( function(data) {
                        def.resolve(data);
                    });
                });
            }

            return def.promise;
        }

        /**
         * @param userID
         */
        function selectCurrency( userID ) {
            var def = $q.defer();

            UserService.getCurrency(userID).then(function( data ) {
                /**
                 * @param {Object} data
                 * @param {string} data.currencyCode
                 */

                if( data.response == false ) {
                    def.resolve(false);
                    return;
                }

                if( $rootScope.currentCurrency.code !== data.currencyCode ) {
                    var idx = _.findIndex($rootScope.currencies, {code: data.currencyCode});
                    if (idx > -1) {
                        $rootScope.currentCurrency = $rootScope.currencies[idx];
                    }
                    if( data.currencyCode !== undefined ) {
                        $cookieStore.put('currency', data.currencyCode);
                    }

                    $rootScope.$emit('Currency.changed', $rootScope.currentCurrency);

                    def.resolve(true);

                } else {
                    def.resolve(false);
                }
            });

            return def.promise;
        }

        function loginInCart( scope, credentials, onetime ) {

            var def = $q.defer();

            if( onetime === undefined ) {
                onetime = false;
            }

            if( _.isEmpty(credentials) ) {
                Notification.error($filter('translate')('unexpected_error'));
                return;
            }

            AuthService.getSessionCarts().then( function(cartData) {

                credentials.orderID = cartData.orderID;
                credentials.carts = [];

                if( cartData ) {
                    _.each(cartData.carts, function(oneCart) {

                        /**
                         * @param {Object} oneCart
                         * @param {number} oneCart._id
                         */

                        credentials.carts.push(oneCart._id)
                    })
                }

                AuthService.login(credentials).then(function(data) {
                    $rootScope.logged = true;

                    $rootScope.$emit('CreditLimit:reload', true);

                    if( onetime ) {
                        $rootScope.oneTimeUser = true;
                    }

                    if( data.user !== undefined && data.user.super ) {
                        Notification.success($filter('translate')('login_success'));
                    } else {
                        DpAddressService.getDefaultAddress(1).then( function(defaultAddress) {

                            if(defaultAddress.response) {

                                getAddress().then( function( allAddress ) {

                                    scope.addresses = allAddress.addresses;
                                    scope.senders = allAddress.senders;

                                    _.each(scope.cart.products, function (product) {

                                        _.each(product.addresses, function (address) {
                                            address.senderID = allAddress.senders[0].type;
                                            address.addressID = defaultAddress.address.ID;
                                        });

                                    });

                                    var params = {addressID: defaultAddress.address.ID};

                                    AuthService.updateDefaultAddress(params).then(function (updateData) {

                                        def.resolve(true);

                                        if( onetime ) {
                                            Notification.success($filter('translate')('you_can_order_now'));
                                        } else {
                                            Notification.success( $filter('translate')('login_success') );
                                        }

                                    });

                                });
                            } else {
                                def.reject(false);
                            }
                        });
                    }


                }, function(data) {
                    $rootScope.logged = false;
                    if (data.httpCode === 400) {
                        Notification.error($filter('translate')('wrong_mail_password'));
                    } else {
                        Notification.error("Error " + data.error);
                    }
                    def.reject(false);
                });

            });

            return def.promise;
        }

        return {
            login: login,
            loginInCart: loginInCart
        };
    });
