'use strict';

angular.module('digitalprint.services')
    .service('PsTypeDescriptionService', function ($q, $http, $config ) {

        var TypeDescriptionService = {};

        TypeDescriptionService.getAll = function (groupID, typeID) {
            var def = $q.defer();
            $http({
                method: 'GET',
                url: $config.API_URL + 'ps_typeDescriptions/typeDescriptionsPublic?groupID=' + groupID + '&typeID=' + typeID
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return TypeDescriptionService;
    });