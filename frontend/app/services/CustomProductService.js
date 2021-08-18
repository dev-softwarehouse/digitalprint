angular.module('digitalprint.services')
    .service('CustomProductService', function ($q, $http, $config) {

        var resource = 'dp_customProducts';

        var CustomProductService = {};

        CustomProductService.getUploadUrl = function (customProductID) {
            return $config.API_URL + [resource, 'files', customProductID].join('/');
        };

        CustomProductService.add = function (data) {
            var def = $q.defer();

            $http({
                method: 'POST',
                url: $config.API_URL + [resource].join('/'),
                data: data
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return CustomProductService;

    });