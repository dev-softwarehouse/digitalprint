'use strict';

angular.module('digitalprint.services')
    .factory('TypePatternService', function ($q, $http, $config) {

        var TypePatternService = {};

        var resource = getResource();

        function getResource() {
            return 'ps_patterns';

        }

        TypePatternService.getUploadUrl = function () {
            return $config.API_URL + [resource].join('/');
        };

        TypePatternService.getList = function (typeID, descID) {

            var params = {
                'typeID': typeID,
                'descID': descID
            };

            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'patternsPublic'].join('/'),
                params: params
            }).success(function (data) {
                def.resolve(data);
            }).error(function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        return TypePatternService;
    });
