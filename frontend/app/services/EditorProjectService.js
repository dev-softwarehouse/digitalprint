/**
 * Created by Rafał on 12-07-2017.
 */
angular.module('digitalprint.services')
    .factory('EditorProjectService', function ($q, $rootScope, AuthService, $http, $config) {

        var EditorProjectService = {};

        var url = location.protocol + '//' + $rootScope.domainHost + ':' + $rootScope.editorPort +'/';

        var accessTokenName = $config.ACCESS_TOKEN_NAME;

        var header = {};
        header[accessTokenName] = AuthService.readCookie(accessTokenName);

        EditorProjectService.getProjectPrev = function (projectID) {
            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + 'jpgPreview?projectID=' + projectID
            }).success(function(data) {
                def.resolve(data);
            }).error(function(data) {
                def.reject(data);
            });

            return def.promise;

        };

        EditorProjectService.shareMyProject = function(email, projectID) {
            var def = $q.defer();

            $.ajax({
                url: url + ['shareMyProject', projectID].join('/'),
                type: 'POST',
                headers: header,
                data: {
                    emails: [email]
                },
                crossDomain: true,
                withCredentials : true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        EditorProjectService.shareMyProjectByFb = function(projectID) {
            var def = $q.defer();

            $.ajax({
                url: url + ['getsharedProjectFromFB', projectID].join('/'),
                type: 'POST',
                headers: header,
                crossDomain: true,
                withCredentials : true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        EditorProjectService.getProjectsData = function(projects) {
            var def = $q.defer();

            $.ajax({
                url: url + ['getProjectsData'].join('/'),
                type: 'POST',
                headers: header,
                data: {
                    projects: projects
                },
                crossDomain: true,
                withCredentials : true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        return EditorProjectService;

    });