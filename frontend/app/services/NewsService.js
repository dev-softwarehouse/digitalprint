/**
 * Created by Rafał on 18-09-2017.
 */
angular.module('digitalprint.services')
    .service('NewsService', function ($q, Restangular, $http, $config) {

        var NewsService = {};

        NewsService.getResource = function () {
            return 'dp_news'
        };

        NewsService.getRss = function (data) {
            var def = $q.defer();

            var resource = this.getResource();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'rss'].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return NewsService;

    });