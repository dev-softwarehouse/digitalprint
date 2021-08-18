/**
 * Created by Rafał on 11-04-2017.
 */
angular.module('dpClient.app')
    .controller('CurrencyCtrl', function ($scope, $rootScope, $cookieStore, UserService) {

        /**
         * @param {Object} currency
         * @param {number} currency.ID
         * @param {string} currency.code
         */
        $scope.switchCurrency = function (currency) {

            if( $rootScope.currentCurrency === currency ) {
                return;
            }

            $rootScope.currentCurrency = currency;
            $cookieStore.put('currency', currency.code);

            if( $rootScope.logged ) {
                UserService.editUserOptions($rootScope.user.userID, {currency: currency.code}).then( function( savedData ) {
                    console.log(savedData);
                });
            }

            $rootScope.$emit('Currency.changed', currency);

        };

    });