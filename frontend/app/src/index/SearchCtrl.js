/**
 * Created by Rafał on 14-06-2017.
 */
'use strict';

angular.module('dpClient.app')
    .controller('index.SearchCtrl', function($rootScope, $scope, $state, $filter,
                                             Notification, PsTypeService, $stateParams) {

        var searchText = $stateParams.text;
        $scope.results = [];
        $scope.searchText = searchText;

        function init(){

            PsTypeService.search(searchText).then( function(data) {
                $scope.results = data;
            });

        }

        init();

    });
