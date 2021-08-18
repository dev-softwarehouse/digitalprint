'use strict';

angular.module('dpClient.app')
    .controller('category.SelectProjectCtrl', function ($scope, PsTypeService, $rootScope, $filter, Notification,
                                                        $stateParams, PhotoFolderService) {

        var typeUrl = $scope.currentTypeUrl = $stateParams.typeurl;
        var groupUrl = $scope.currentGroupUrl = $stateParams.groupurl;

        $scope.type = {};
        $scope.mainThemes = [];

        function init() {
            PsTypeService.getOneForView(groupUrl, typeUrl).then(function(dataType) {
                $scope.type = dataType;
            });

            var formats = [];

            PhotoFolderService.getProjectsForTypes(formats).then( function(data) {
                $scope.mainThemes = data;
            });
        }

        init();

    });
