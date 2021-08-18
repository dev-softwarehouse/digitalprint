'use strict';

angular.module('dpClient.app')
	.controller('category.GroupsCtrl', function($scope, $rootScope, $filter, PsTypeService, PsGroupService,
                                                DpCategoryService, PsGroupDescriptionService, $stateParams,
                                                Notification, MainWidgetService) {

	var currentGroupID;
	var currentGroupUrl;

    $scope.descriptions = [];
    $scope.galleries = [];

    function init() {
        $scope.items = [];
        $scope.group = {};
        $scope.category = {};
        $scope.form = {};
        currentGroupUrl = $scope.currentGroupUrl = $stateParams.groupurl;
        getTypes(currentGroupUrl);
        getGroup(currentGroupUrl);
        getOne( $stateParams.categoryurl );
        getDescription( currentGroupUrl );
    }

    init();

    $scope.loadOtherTemplateVariables=function(templateName){
        MainWidgetService.includeTemplateVariables($scope, templateName, undefined, undefined, undefined, true);
    };

    $scope.getTemplateVariable=function(collection, itemType,id,variableName,defaultValue){
        return MainWidgetService.getTemplateVariable($scope, collection, itemType,id,variableName,defaultValue);
    };

    function getTypes( currentGroupUrl ){

        PsTypeService.forView( currentGroupUrl ).then(function(data) {
            $scope.items = data;
        }, function(data) {
            Notification.error($filter('translate')('error'));
        });
    }

    function getGroup( currentGroupUrl ) {
        PsGroupService.getOneForView( currentGroupUrl ).then(function(data) {
            $scope.group = data;
            if( $rootScope.currentLang && $rootScope.currentLang.code ) {
                $rootScope.customBreadcrumbs.group = data.names[$rootScope.currentLang.code];
            } else {
                $rootScope.customBreadcrumbs.group = $filter('translate')('group');
            }
            MainWidgetService.includeTemplateVariables($scope, 'group', data.ID);
        }, function(data) {
            Notification.error($filter('translate')('error'));
        });
    }

    function getOne(currentCategoryUrl) {
        DpCategoryService.getOneForView(currentCategoryUrl).then(function (data) {
            $scope.category = data;
            if( $rootScope.currentLang && $rootScope.currentLang.code && data.langs ) {
                $rootScope.customBreadcrumbs.category = data.langs[$rootScope.currentLang.code].name;
            } else {
                $rootScope.customBreadcrumbs.category = $filter('translate')('category');
            }
        }, function (data) {
            Notification.error($filter('translate')('error'));
        });
    }

    function getDescription( groupUrl ) {

        PsGroupDescriptionService.getAll(groupUrl).then(function (data) {

            var sliderData = [];

            if (!_.isEmpty(data)) {

                _.each(data, function (oneDesc) {

                    switch (oneDesc.descType) {
                        case 1:
                            $scope.descriptions.push(oneDesc);
                            break;
                        case 5:

                            oneDesc.items = [];

                            if (!_.isEmpty(oneDesc.files)) {
                                _.each(oneDesc.files, function (oneFile) {
                                    oneDesc.items.push({
                                        thumb: oneFile.urlCrop,
                                        img: oneFile.url,
                                        description: 'Image ' + oneFile.fileID
                                    });
                                });
                            }

                            $scope.galleries.push(oneDesc);

                            break;
                        case 3:

                            sliderData.push(oneDesc);

                            break;

                        case 6:

                            //$scope.thumbnails.push(oneDesc);

                            break;
                    }

                });
            }

            $rootScope.$emit('Slider:data', sliderData);

        });

    }

});
