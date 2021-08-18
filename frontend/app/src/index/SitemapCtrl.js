/**
 * Created by Rafał on 19-09-2017.
 */
'use strict';

angular.module('dpClient.app')
    .controller('index.SitemapCtrl', function( $scope, $rootScope, routes, DpCategoryService, $q ) {

        $scope.sites = [];
        $scope.menuItems = [];

        var parentAvailable = ['sitemap', 'cart'];

        $rootScope.$watch('menuItems', function( data ) {
            if( data !== undefined ) {
                $scope.menuItems = data;
            }
        });

        function init() {

            routes.getAll().then( function(routeData) {
                if( routeData.data ) {
                    _.each(routeData.data, function(one, index) {
                        if( one.route.parent === 'home' &&
                            one.route.abstract === 0 &&
                            parentAvailable.indexOf(one.route.state) > -1 ) {
                            $scope.sites.push(one.route);
                        } else if( one.route.parent === 'staticPages' ) {
                            $scope.sites.push(one.route);
                        }
                    });

                    getGroups().then( function(groupsData) {

                        //$scope.sites.groups = groupsData;

                        getItems().then(function (itemsData) {

                            _.each(itemsData, function (parentCategory) {

                                $scope.sites.push({
                                    state: 'category',
                                    langs: parentCategory.langs,
                                    children: parentCategory.childs,
                                    //groups: groupsData[parentCategory.ID],
                                    types: parentCategory.types
                                });


                                _.each(parentCategory.childs, function(child) {

                                    //child.groups =  groupsData[child.ID];

                                });

                            });
                        });
                    });

                }
            });

        }

        function getItems() {
            var def = $q.defer();

            var timeHandler = setTimeout(function(){
                if( $scope.menuItems !== undefined ) {
                    def.resolve($scope.menuItems);
                    clearTimeout(timeHandler);
                }
            }, 1000);

            return def.promise;
        }

        function getGroups() {
            var def = $q.defer();

            DpCategoryService.getGroups().then(function(data) {
                def.resolve(data);
            });

            return def.promise;
        }

        /*function getContains(currentCategoryUrl) {
            var def = $q.defer();

            DpCategoryService.getContains(currentCategoryUrl).then(function (data) {
                def.resolve(data);
            }, function (data) {
                Notification.error($filter('translate')('error'));
            });

            return def.promise;
        }*/

        init();

    });
