/**
 * Created by Rafał on 27-04-2017.
 */
'use strict';

angular.module('digitalprint.services')
    .factory('PhotoFolderService', function($rootScope, $q, $http, $config, AuthService){

        var PhotoFolderService = {};

        var url =  location.protocol + '//' + $rootScope.domainHost + ':'+ $rootScope.editorPort +'/';

        var accessTokenName = $config.ACCESS_TOKEN_NAME;

        var header = {};
        header[accessTokenName] = AuthService.readCookie(accessTokenName);

        PhotoFolderService.movePhoto = function( data, fromFolderID, photo ){
            var def = $q.defer();

            $.ajax({
                url: url + 'folder/photo/move/' + photo._id,
                type: 'POST',
                headers: header,
                data: {
                        'targetFolder': data.selectedFolder._id,
                        'from' : fromFolderID
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

        PhotoFolderService.copyPhoto = function( data, photo ){

            var def = $q.defer();

            $.ajax({
                url: url + 'folder/photo-copy/' + photo._id,
                type: 'POST',
                headers: header,
                data: {
                    'targetFolder': data.selectedFolder._id
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

        PhotoFolderService.createPhotobook = function( folder ){

            var def = $q.defer();

            $.ajax({
                url: url + 'folder/make-book/' + folder._id,
                type: 'POST',
                headers: header,
                data: {
                    typeID: 44,
                    pages: 16,
                    formatID: 148,
                    folderID: folder._id,
                    attributes: {
                            "i1":34,
                            "i2":19,
                            "i3":40,
                            "i4":74,
                            "i9":119,
                            "i26":242
                    }
                    /*?typeID=44&pages=16&formatID=141&1=34&2=19&3=40&4=74&9=119&26=242*/
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

        PhotoFolderService.emailShare = function (email, folder) {

            var def = $q.defer();

            var domain = location.protocol+'//'+$rootScope.domainHost;
            if( location.port.length > 0 ) {
                domain += ':'+location.port;
            }


            $.ajax({
                url: url + 'folder/email-share/' + folder._id,
                type: 'POST',
                headers: header,
                data: {
                    'email': email,
                    'host': domain,
                    'lang': $rootScope.currentLang.code
                },
                crossDomain: true,
                withCredentials: true

            }).done(function (data) {
                def.resolve(data);
            }).fail(function (data) {
                def.reject(data.status);
            });

            return def.promise;

        };

        PhotoFolderService.emailSharePhoto = function (email, photo) {

            var def = $q.defer();

            var domain = location.protocol+'//'+$rootScope.domainHost;
            if( location.port.length > 0 ) {
                domain += ':'+location.port;
            }

            $.ajax({
                url: url + 'folder/image/email-share/' + photo._id,
                type: 'POST',
                headers: header,
                data: {
                    'email': email,
                    'host': domain,
                    'lang': $rootScope.currentLang.code
                },
                crossDomain: true,
                withCredentials: true

            }).done(function (data, textStatus, xhr) {
                def.resolve(xhr.status);
            }).fail(function (data) {
                def.reject(data.status);
            });

            return def.promise;

        };

        PhotoFolderService.facebookShare = function (folder) {

            var def = $q.defer();

            $.ajax({
                url: url + 'folder/facebook-share/' + folder._id,
                type: 'POST',
                headers: header,
                crossDomain: true,
                withCredentials: true

            }).done(function (data) {
                def.resolve(data);
            }).fail(function (data) {
                def.reject(data.status);
            });

            return def.promise;

        };

        PhotoFolderService.facebookSharePhoto = function (photo) {

            var def = $q.defer();

            $.ajax({
                url: url + 'folder/image/facebook-share/' + photo._id,
                type: 'POST',
                headers: header,
                crossDomain: true,
                withCredentials: true

            }).done(function (data, textStatus, xhr) {
                def.resolve(xhr.status);
            }).fail(function (data) {
                def.reject(data.status);
            });

            return def.promise;

        };

        PhotoFolderService.saveFolderPosition = function( position, folder ){

            var def = $q.defer();

            $.ajax({
                url: url + 'folder/location/' + folder._id,
                type: 'POST',
                headers: header,
                data: {
                        'location': position
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

        PhotoFolderService.savePosition = function( position, photo ){

            var def = $q.defer();

            $.ajax({
                url: url + 'folder/photo-location/' + photo._id,
                type: 'POST',
                headers: header,
                data: {
                        'location': position
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

        PhotoFolderService.getAll = function (sort, pagingSettings) {
            var def = $q.defer();

            var sortBy =_.first(_.keys(sort));
            var order = _.first(_.values(sort));

            console.log(sortBy, order);

            $.ajax({
                url: url + 'folder?sortBy=' + sortBy + '&order=' + order + '&page=' +
                pagingSettings.currentPage + '&display='+ pagingSettings.pageSize,
                type: 'GET',
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

        PhotoFolderService.add = function (name, description) {
            var def = $q.defer();

            $.ajax({
                url: url + 'folder/',
                type: 'PUT',
                headers: header,
                crossDomain: true,
                data: {
                    parent: null,
                    folderName: name,
                    description: description,
                    date: Date.now()
                }
            }).done(function (data) {
                def.resolve(data);
            });

            return def.promise;
        };

        PhotoFolderService.edit = function (folder) {
            var def = $q.defer();

            $.ajax({
                url: url + 'folder/',
                type: 'POST',
                headers: header,
                crossDomain: true,
                data: {
                    folderId: folder._id,
                    folderName: folder.folderName,
                    description: folder.description
                }
            }).done(function (data) {
                def.resolve(data);
            });

            return def.promise;
        };

        PhotoFolderService.delete = function (folder) {
            var def = $q.defer();

            $.ajax({
                url: url + 'folder/',
                type: 'DELETE',
                headers: header,
                crossDomain: true,
                data: {folderId: folder._id}
            }).done(function( data ) {
                def.resolve(data);
            });

            return def.promise;
        };

        PhotoFolderService.getPhotos = function(folderId, sort, pagingSettings) {

            var sortBy = _.first(_.keys(sort));
            var order = _.first(_.values(sort));

            var def = $q.defer();

            $.ajax({
                url: url + 'folder/' + folderId + '?sortBy='+ sortBy +
                '&order=' + order + '&page=' + pagingSettings.currentPage + '&display=' + pagingSettings.pageSize,
                type: 'GET',
                headers: header,
                crossDomain: true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.deletePhoto = function(folderId, photoId) {
            var def = $q.defer();

            $.ajax({
                url: url + 'folder/'+ folderId +'/projectImage/' + photoId,
                type: 'DELETE',
                headers: header,
                crossDomain: true
            }).done(function( data ) {
                def.resolve(data);
            });

            return def.promise;
        };

        PhotoFolderService.getSharedByEmail = function(folderId, password) {
            var def = $q.defer();

            $.ajax({
                url: url + 'folder/shared-by-mail/' + folderId,
                type: 'POST',
                data: {
                    password: password
                },
                crossDomain: true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.getSharedByFacebook = function(folderId) {
            var def = $q.defer();

            $.ajax({
                url: url + 'folder/shared-by-facebook/' + folderId,
                type: 'GET',
                headers: header,
                crossDomain: true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.getPhotoSharedByFacebook = function(photoId) {
            var def = $q.defer();

            $.ajax({
                url: url + 'folder/image/shared-by-facebook/' + photoId,
                type: 'GET',
                headers: header,
                crossDomain: true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.getPhotoSharedByEmail = function(photoId, password) {
            var def = $q.defer();

            $.ajax({
                url: url + 'folder/image/shared-by-mail/' + photoId,
                type: 'POST',
                data: {
                    password: password
                },
                crossDomain: true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.getMasks = function() {

            var def = $q.defer();

            $http({
                method: 'GET',
                url: $config.API_URL + ['dp_views', 'masks'].join('/')
            }).success(function(data){
                def.resolve(data);
            }).error(function(data) {
                def.reject(data);
            });

            return def.promise;
        };

        PhotoFolderService.savePhoto = function( photoId, fileData, thumbSize, minSize, mainSize ) {
            var def = $q.defer();

            $.ajax({
                url: url + 'userUploadEdited/projectImage',
                type: 'POST',
                data: {
                    image64: fileData,
                    projectImage: photoId,
                    thumbSize: thumbSize,
                    minSize: minSize,
                    mainSize: mainSize
                },
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

        PhotoFolderService.addTag = function( imageID, tag ) {
            var def = $q.defer();

            $.ajax({
                url: url + 'folder/image-tag/' + imageID + '/' + tag,
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

        PhotoFolderService.removeTag = function( imageID, tag ) {
            var def = $q.defer();

            $.ajax({
                url: url + 'folder/delete-image-tag/' + imageID + '/' + tag,
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

        PhotoFolderService.findPhoto = function( name ) {
            var def = $q.defer();

            $.ajax({
                url: url + 'folder/findImage/' + name,
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

        PhotoFolderService.voteFolder = function(folderId, vote) {
            var def = $q.defer();

            $.ajax({
                url: url + 'folder/' + folderId +'/vote/' + vote,
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

        PhotoFolderService.votePhoto = function(photoId, vote) {
            var def = $q.defer();

            $.ajax({
                url: url + 'folder/image-vote/' + photoId +'/' + vote,
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

        PhotoFolderService.getImageFolder = function(imageID) {

            var def = $q.defer();

            $.ajax({
                url: url + 'imagefolderParent/' + imageID,
                type: 'GET',
                headers: header,
                crossDomain: true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.getImageByAuthor = function(name) {

            var def = $q.defer();

            $.ajax({
                url: url + 'get-image-by-autor/' + name,
                type: 'GET',
                headers: header,
                crossDomain: true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.getImageByPlace = function(name) {

            var def = $q.defer();

            $.ajax({
                url: url + 'get-image-by-place/' + name,
                type: 'GET',
                headers: header,
                crossDomain: true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.getImageByPeoples = function(name) {

            var def = $q.defer();

            $.ajax({
                url: url + 'get-image-by-peoples/' + name,
                type: 'GET',
                headers: header,
                crossDomain: true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.getImageByRating = function(min, max) {

            var def = $q.defer();

            $.ajax({
                url: url + 'get-image-by-rating',
                type: 'POST',
                data: {
                    min: min,
                    max: max
                },
                headers: header,
                crossDomain: true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.setImageAuthor = function(author, imageID) {
            var def = $q.defer();

            var data = {autor: author};

            $.ajax({
                url: url + 'set-image-autor/' + imageID,
                type: 'POST',
                headers: header,
                data: data,
                crossDomain: true,
                withCredentials : true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.setImagePlace = function(place, imageID) {
            var def = $q.defer();

            var data = {place: place};

            $.ajax({
                url: url + 'set-image-place/' + imageID,
                type: 'POST',
                headers: header,
                data: data,
                crossDomain: true,
                withCredentials : true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.setImagePeoples = function(peoples, imageID) {
            var def = $q.defer();

            var data = {peoples: peoples};

            $.ajax({
                url: url + 'add-peoples-to-image/' + imageID,
                type: 'POST',
                headers: header,
                data: data,
                crossDomain: true,
                withCredentials : true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.getImageByExtension = function(id, extension) {

            var def = $q.defer();

            $.ajax({
                url: url + 'get-image-in-extension/' + id + '/' + extension,
                type: 'GET',
                headers: header,
                crossDomain: true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.getProjectsForTypes = function(formats) {

            var def = $q.defer();

            $.ajax({
                url: url + 'getProjectsForTypes',
                type: 'GET',
                headers: header,
                /*data: {
                    formats: formats
                }*/
                crossDomain: true
            }).done(function( data ) {
                def.resolve(data);
            }).fail(function( data ) {
                def.reject(data.status);
            });

            return def.promise;
        };

        PhotoFolderService.getUrlImageByExtension = function(id, extension) {
            return url + 'get-image-in-extension/' + id + '/' + extension;
        };

        return PhotoFolderService;

    });
