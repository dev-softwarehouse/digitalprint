/**
 * Created by Rafał Leśniak on 26.03.18.
 */
angular.module('dpClient.helpers').filter('priceFilter', function () {
    return function (value) {
        return value == parseInt(value) ? value + ',00' : value;
    };
});