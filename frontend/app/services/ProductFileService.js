angular.module('digitalprint.services')
    .service('ProductFileService', function ($q, Restangular, $http, $config) {

        var ProductFileService = {};

        var resource = ['dp_products', 'productFiles'].join('/');

        ProductFileService.getUrl = function (productID) {
            return $config.API_URL + ['dp_products', productID, 'productFiles'].join('/');
        };

        ProductFileService.getAll = function (productID) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: this.getUrl(productID)
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        ProductFileService.getByList = function(orders){
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + ['productFiles', 'productListFiles', orders.join(',')].join('/')
            }).success(function(data) {
                def.resolve(data);
            }).error(function(data) {
                def.reject(data);
            });

            return def.promise;
        };

        ProductFileService.removeFile = function (productID, fileID) {
            var def = $q.defer();

            $http({
                method: 'DELETE',
                url: this.getUrl(productID) + '/' + fileID
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        ProductFileService.makeMiniature = function(fileID){
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + ['productFiles', 'makeMiniature', fileID].join('/')
            }).success(function(data) {
                def.resolve(data);
            }).error(function(data) {
                def.reject(data);
            });

            return def.promise;
        };

        return ProductFileService;

    });
