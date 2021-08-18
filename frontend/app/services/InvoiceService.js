/**
 * Created by Rafał on 17-07-2017.
 */
'use strict';

angular.module('digitalprint.services')
    .factory('InvoiceService', function ($q, $http, $config) {

        var InvoiceService = {};

        var resource = getResource();

        function getResource() {
            return 'dp_invoices';
        }

        InvoiceService.getForUser = function (orderID) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'getForUser',orderID].join("/"),
                responseType: 'arraybuffer',
                dataType:'blob'
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return InvoiceService;
    });