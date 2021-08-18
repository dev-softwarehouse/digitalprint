/**
 * Created by Rafał on 19-06-2017.
 */
'use strict';

angular.module('digitalprint.services')
    .factory('StaticContentService', function($q, $http, $config) {

        var StaticContentService = {};
        var resource = getResource();

        function getResource() {
            return ['dp_static_contents'];
        }

        StaticContentService.getContent = function(key) {

            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + [resource, 'getContent', key].join('/')
            }).success(function(data) {
                def.resolve(data);
            }).error(function(data) {
                def.reject(data);
                console.log(data);
            });

            return def.promise;
        };

        return StaticContentService;

    });
