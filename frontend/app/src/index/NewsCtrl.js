/**
 * Created by Rafał on 18-09-2017.
 */
'use strict';

angular.module('dpClient.app')
    .controller('index.NewsCtrl', function( $scope, NewsService, $state) {

        $scope.articles = [];

        function init(){

          getNews();

        }


        function getNews() {
            NewsService.getRss().then( function(data) {
                if( data.items ) {
                    $scope.articles = data.items;
                }
            });
        }

        init();

    });