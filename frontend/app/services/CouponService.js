/**
 * Created by Rafał on 27-06-2017.
 */
angular.module('digitalprint.services')
    .service('CouponService', function ($rootScope, $q, $http, $config) {

        var CouponService = {};

        function getResource() {
            return ['dp_coupons'];
        }

        CouponService.check = function (coupon, orderID) {
            var def = $q.defer();

            var resource = getResource();
            resource.push('check');

            $http({
                method: 'POST',
                url: $config.API_URL + resource.join('/'),
                data: {
                    'coupon': coupon,
                    'orderID': orderID
                }
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return CouponService;

    });