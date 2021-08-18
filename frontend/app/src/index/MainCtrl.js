'use strict';

angular.module('dpClient.app')
    .controller('index.MainCtrl', function ($q, $scope, $rootScope, MainWidgetService, MenuTypesService, $state) {
        MainWidgetService.includeTemplateVariables($scope, 'header');
        MainWidgetService.getMegaMenu().then(function (megaMenu) {

            if( megaMenu.items.length > 0 ) {
                megaMenu.items[0].isVisible = true;
            }

            $rootScope.menuItems = megaMenu.items;
            if( megaMenu.visible === 1 ) {
                $rootScope.showMenu = true;
            } else {
                $rootScope.showMenu = false;
            }

            $rootScope.menuType = megaMenu.menuType;

            if( $rootScope.menuType === undefined ) {
                $rootScope.menuType = 1;
            }

            $rootScope.allTypes = MenuTypesService.getAllTypes(megaMenu.items);
        });

        $scope.showSubMenu = function(item) {
            _.each($scope.menuItems, function(iterateItem) {
                if(item === iterateItem) {
                    iterateItem.isVisible = true;
                } else {
                    iterateItem.isVisible = false;
                }
            });
        };

        $scope.checkState = function(stateName) {
            return $state.current.state === stateName;
        };

        $rootScope.$on('CreditLimit:reload', function (event, data) {
            MainWidgetService.getCreditLimitInfo();
        });

        MainWidgetService.getForms().then( function( forms ) {
            $rootScope.forms = forms;
        });

        $(window).resize(function () {
            if ($(window).width() < 768) {
                $('.navbar-collapse li a.navbarLink').attr('data-toggle', 'collapse').attr('data-target', '#navbar');
            } else {
                $('.navbar-collapse li a.navbarLink').attr('data-toggle', false).attr('data-target', false);
            }
        });

        $scope.scrollToTop = function () {
            var duration = 500;
            $('html, body').animate({scrollTop: 0}, duration);
        };

        $scope.zoomStaticImage = function(url) {
            var file = {};
            file.url = url;
            $scope.actualFile = file;
        };

        $(function() {

            MainWidgetService.handleGoTop();

            var intervalHandler = setInterval(function() {
                if( $('.navbar-collapse li a.navbarLink').size() > 0 ) {
                    if ($(window).width() < 768) {
                        $('.navbar-collapse li a.navbarLink').attr('data-toggle', 'collapse').attr('data-target', '#navbar');
                    } else {
                        $('.navbar-collapse li a.navbarLink').attr('data-toggle', false).attr('data-target', false);
                    }
                    clearInterval(intervalHandler);
                }
            }, 500);

        });

    });
