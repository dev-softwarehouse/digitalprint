'use strict';

angular.module('dpClient.app')
    .controller('index.HomeCtrl', function ($rootScope, $scope, $state, $filter, UserService, AuthService,
                                            DomainService, Notification, DpCategoryService,
                                            CategoryDescriptionService, HomepageBannerService, MainWidgetService) {

        $scope.activeCategoryID = null;
        $scope.articles = [];
        $scope.startCategories = [];
        $scope.mainButtonActive = false;
        $scope._ = _;

        function init() {
            $scope.items = [];
            $scope.products = [];
            forView();
            MainWidgetService.includeTemplateVariables($scope, 'content');
        }

        $scope.loadOtherTemplateVariables=function(templateName){
            MainWidgetService.includeTemplateVariables($scope, templateName, undefined, undefined, undefined, true);
        };

        $scope.getTemplateVariable=function(collection, itemType,id,variableName,defaultValue){
            return MainWidgetService.getTemplateVariable($scope, collection, itemType,id,variableName,defaultValue);
        };

        function forView() {
            DpCategoryService.forView().then(function (data) {
                $scope.items = data;
                var tmpItems = [];
                _.each($scope.items, function (item) {
                    tmpItems.push(item.ID);
                    if( item.onMainPage === 1 ) {
                        $scope.startCategories.push(item.ID);
                        $scope.mainButtonActive = true;
                    }
                });
                getProducts(tmpItems);
                getDescription(tmpItems);
                getSlider();
            }, function (data) {
                Notification.error($filter('translate')('error'));
            });
        }

        function getProducts(list) {
            DpCategoryService.manyForView(list).then(function (data) {
                $scope.products = data;
            }, function (data) {
                Notification.error($filter('translate')('error'));
            });
        }

        function getDescription(list) {

            CategoryDescriptionService.getAll(list).then(function (data) {

                if (_.isEmpty(data)) {
                    return;
                }

                var idx;

                _.each(data, function (catDescriptions, cIndex) {
                    _.each(catDescriptions, function (catDesc) {

                        idx = _.findIndex($scope.items, {ID: parseInt(cIndex)});

                        switch (catDesc.descType) {

                            case 1:
                                if ($scope.items[idx] !== undefined) {
                                    if ($scope.items[idx].descriptions === undefined) {
                                        $scope.items[idx].descriptions = [];
                                    }
                                    $scope.items[idx].descriptions.push(catDesc);
                                }
                                break;
                            case 5:
                                if ($scope.items[idx] !== undefined) {
                                    if ($scope.items[idx].galleries === undefined) {
                                        $scope.items[idx].galleries = [];
                                    }

                                    catDesc.items = [];

                                    if (!_.isEmpty(catDesc.files)) {
                                        _.each(catDesc.files, function (oneFile) {
                                            catDesc.items.push({
                                                thumb: oneFile.urlCrop,
                                                img: oneFile.url,
                                                description: 'Image ' + oneFile.fileID
                                            });
                                        });
                                    }
                                    $scope.items[idx].galleries.push(catDesc);
                                }
                                break;
                        }

                    });

                });

            });

        }

        function getSlider() {

            HomepageBannerService.getAll().then(function (data) {
                var sliderData = [];
                sliderData.push({'ID': 1, 'files': data});
                $rootScope.$emit('Slider:data', sliderData);
            });

        }

        $scope.setActiveCategory = function (item) {
            $scope.activeCategoryID = item.ID;
            $scope.mainButtonActive = false;
        };

        $scope.setActiveMainButton = function() {
            $scope.mainButtonActive = true;
            $scope.activeCategoryID = null;
        };

        init();

    });
