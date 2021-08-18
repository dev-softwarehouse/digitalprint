angular.module('digitalprint.services')
    .service('TemplateRootService', function ($q, $http, $config) {

        var TemplateRootService = {};

        var resource = 'templates';

        TemplateRootService.getTemplateUrl = function (templateID) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'getUrl', templateID].join('/')
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return TemplateRootService;

    });