'use strict';

angular.module('dpClient.app')
    .controller('category.CustomProductCtrl', function ($scope, $rootScope, MainWidgetService, AuthDataService,
                                                        CustomProductService, FileUploader, $q, $filter,
                                                        Notification, SettingService, PsTypeDescriptionService,
                                                        PsTypeService, $state, TextWidgetService, $timeout,
                                                        LoginWidgetService, $config, PsGroupService,
                                                        DpCategoryService ) {

        $scope.formSent = false;
        $scope.customProduct = false;

        $scope.descriptions = [];
        $scope.galleries = [];
        $scope.descriptions = [];
        $scope.thumbnails = [];
        $scope.patterns = [];

        var accessTokenName = $config.ACCESS_TOKEN_NAME;

        var header = {};
        header[accessTokenName] = AuthDataService.getAccessToken();

        $scope.uploader = new FileUploader({
            'headers': header,
            'autoUpload ': true
        });

        $scope.uploader.onProgressAll = function (progress) {
            $scope.uploadProgress = progress;
        };

        $scope.uploader.filters.push({
            name: 'imageFilter',
            fn: function (item, options) {
                var itemName = item.name.split('.');
                var lastItem = itemName.pop().toLowerCase();
                var possibleExtensions = ['jpg', 'jpeg'];

                if (possibleExtensions.indexOf(lastItem) > -1) {
                    return true;
                }
                Notification.warning($filter('translate')('required_ext') + possibleExtensions.join(','));
                return false;
            }
        });

        $scope.save = function () {

            CustomProductService.add(this.form).then(function (savedData) {
               if( savedData.response === true ) {

                   if( $scope.uploader.queue.length > 0 ) {
                       changeUrl( savedData.item.ID ).then( function() {
                           $scope.uploader.uploadAll();
                           $scope.uploader.onCompleteAll  = function() {
                               $scope.formSent = true;
                               $scope.customProduct = savedData.item;
                               Notification.success($filter('translate')('saved_message'));
                           }
                       });
                   } else {
                       $scope.formSent = true;
                       $scope.customProduct = savedData.item;
                       Notification.success($filter('translate')('saved_message'));
                   }

               }
            });

        };

        function init() {
            getType($state.params.groupurl, $state.params.typeurl).then(function(responseData) {

                getDescriptions();
                if($state.params.groupurl === undefined) {
                    getGroup(responseData.group.slugs[$rootScope.currentLang.code]);
                } else {
                    getGroup($state.params.groupurl);
                }

                if( $state.params.categoryurl === undefined ) {
                    getCategory(responseData.category.langs[$rootScope.currentLang.code].url);
                } else {
                    getCategory($state.params.categoryurl);
                }

            });

        }

        function getType(groupUrl, typeUrl) {

            var def = $q.defer();

            PsTypeService.getOneForView(groupUrl, typeUrl).then(function (data) {
                if( data && data.active === 0 ) {
                    Notification.error($filter('translate')('product_currently_not_available'));
                    $state.go('home');
                    return;
                }
                $scope.currentGroupID = data.groupID;
                $scope.currentTypeID = data.ID;
                def.resolve(data);


            }, function (data) {
                console.error(data);
                Notification.error($filter('translate')('error'));
                def.reject(data);
            });

            return def.promise;



        }

        function getGroup( currentGroupUrl ) {
            PsGroupService.getOneForView( currentGroupUrl ).then(function(data) {
                if( $rootScope.currentLang && $rootScope.currentLang.code ) {
                    $rootScope.customBreadcrumbs.group = data.names[$rootScope.currentLang.code];
                } else {
                    $rootScope.customBreadcrumbs.group = $filter('translate')('group');
                }
            }, function(data) {
                Notification.error($filter('translate')('error'));
            });
        }

        function getCategory(currentCategoryUrl) {
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

        function getDescriptions() {

            var SettingView = new SettingService('general');

            var groupID = $scope.currentGroupID;
            var typeID = $scope.currentTypeID;

            SettingView.getPublicSettings().then(function (settingsData) {

                PsTypeDescriptionService.getAll(groupID, typeID).then(function (data) {

                    var sliderData = [];

                    if (!_.isEmpty(data)) {

                        _.each(data, function (oneDesc) {

                            /**
                             * @param {Object} oneDesc
                             * @param {number} oneDesc.descType
                             *
                             */
                            switch (oneDesc.descType) {
                                case 1:
                                    if( settingsData.numberOfLinesInDescription &&
                                        settingsData.numberOfLinesInDescription.value > 0 ) {
                                        var word = TextWidgetService.findWord(
                                            oneDesc.langs[$rootScope.currentLang.code].description,
                                            settingsData.numberOfLinesInDescription.value
                                        );
                                        var paragraphNumber = TextWidgetService.findParagraph(
                                            oneDesc.langs[$rootScope.currentLang.code].description,
                                            word
                                        );
                                        if( paragraphNumber !== false ) {
                                            oneDesc.showLess = TextWidgetService.getLess(
                                                oneDesc.langs[$rootScope.currentLang.code].description,
                                                paragraphNumber
                                            );
                                            oneDesc.initHide = true;
                                        } else {
                                            oneDesc.showLess = false;
                                        }
                                    }

                                    $scope.descriptions.push(oneDesc);
                                    break;
                                case 5:

                                    oneDesc.items = [];

                                    if (!_.isEmpty(oneDesc.files)) {
                                        _.each(oneDesc.files, function (oneFile) {

                                            /**
                                             * @param {Object} oneFile
                                             * @param {string} oneFile.urlCrop
                                             * @param {number} oneFile.fileID
                                             */

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

                                    $scope.thumbnails.push(oneDesc);

                                    break;

                                case 7:
                                    $scope.patterns = oneDesc.patterns;

                                    break;
                            }

                        });

                        descriptionTabResetActive();
                    }

                    $rootScope.$emit('Slider:data', sliderData);

                });
            });

        }

        function changeUrl(reclamationID) {

            var def = $q.defer();

            _.each($scope.uploader.queue, function(item, index) {
                item.url = CustomProductService.getUploadUrl(reclamationID);
                if( index === $scope.uploader.queue.length-1 ) {
                    def.resolve(true);
                }
            });

            return def.promise;
        }

        function descriptionTabResetActive() {
            $timeout(function () {
                $('.with-nav-tabs .nav-tabs li').removeClass('active');
                $('.with-nav-tabs .tab-content div.tab-pane').removeClass('active');

                $('.with-nav-tabs .nav-tabs li').first().addClass('active');
                $('.with-nav-tabs .tab-content div.tab-pane').first().addClass('active');
            }, 300);
        }

        $scope.formatSizeUnits = function (bytes) {
            return MainWidgetService.formatSizeUnits(bytes);
        };

        $scope.removeFile = function(fileItem) {
            fileItem.remove();
        };

        $scope.hasFormats = function (desc) {
            return true;
        };

        $scope.hasOneFormat = function (pattern) {
            return true;
        };

        $scope.login = function (credentials) {
            var backTo = {
                state: 'custom-product',
                params: {
                    categoryurl: $state.params.categoryurl,
                    groupurl: $state.params.groupurl,
                    typeurl: $state.params.typeurl
                }
            };
            LoginWidgetService.login(credentials, backTo);
        };

        init();

    });
