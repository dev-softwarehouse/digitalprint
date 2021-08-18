/**
 * Created by Rafał on 07-09-2017.
 */
'use strict';
angular.module('dpClient.app')
    .controller('client-zone.ReclamationsCtrl', function ($q, $scope, $state, $filter, Notification,
                                                          ClientZoneWidgetService, MainWidgetService, ReclamationService,
                                                          TemplateRootService, $modal, socket, AuthDataService,
                                                          $rootScope, $timeout, FileUploader, $config) {

        $scope.pagingSettings = ClientZoneWidgetService.getPagingSettings();
        $scope.pageSizeSelect = ClientZoneWidgetService.getPageSizeSelect();
        $scope.reclamations = [];
        $scope.isCollapsed = false;
        $scope.currentPage = 1;
        $scope.params = {};
        $scope.uploadProgress = 0;
        $scope.selectedReclamation = null;

        var updateTableTimeout = null;

        var accessTokenName = $config.ACCESS_TOKEN_NAME;

        $scope.$on('socket:error', function (ev, data) {
            console.log(ev, data);
        });

        $scope.setParams = function () {
            $timeout.cancel(updateTableTimeout);
            updateTableTimeout = $timeout(function () {
                $scope.getNextPage(1);
            }, 1000);
        };

        function init() {

            var params = {};
            countReclamations(params).then(function (counted) {
                if (counted.count > 0) {
                    $scope.pagingSettings.total = counted.count;
                }
                params.limit = $scope.pagingSettings.pageSize;
                params.offset = 0;
                ReclamationService.getAll(params).then(function (data) {
                    $scope.reclamations = data;
                });
            });

            socket.on('connect', function () {
                console.log('Client has connected to the server!');
            });

            socket.emit('checkToken', {'accessToken': AuthDataService.getAccessToken()});

            socket.on('tokenAccept', function (tokenAccept) {
                console.log('token accept: ', tokenAccept);
            });

            socket.emit('onReclamationsPanel', {'userID': $rootScope.user.userID});

            socket.on('newMessage', function (newMessage) {
                var reclamationIdx = _.findIndex($scope.reclamations, {ID: newMessage.reclamationID});
                if (reclamationIdx > -1) {
                    if ($scope.reclamations[reclamationIdx].unreadMessages === undefined) {
                        $scope.reclamations[reclamationIdx].unreadMessages = 1;
                    } else {
                        $scope.reclamations[reclamationIdx].unreadMessages++;
                    }
                }
            });
        }

        $scope.getNextPage = function (page) {
            $scope.currentPage = page;
            var params = {};
            countReclamations(params).then(function (counted) {
                if (counted.count > 0) {
                    $scope.pagingSettings.total = counted.count;
                }
                params.offset = (page - 1) * $scope.pagingSettings.pageSize;
                params.limit = $scope.pagingSettings.pageSize;
                params = _.extend(params, $scope.params);
                ReclamationService.getAll(params).then(function (data) {
                    $scope.reclamations = data;
                });
            });
        };

        function countReclamations(params) {
            var def = $q.defer();

            ReclamationService.getMyZoneCount(params).then(function (data) {
                def.resolve(data);
            });

            return def.promise;
        }

        $scope.formatSizeUnits = function (file) {
            return MainWidgetService.formatSizeUnits(file.size);
        };

        function getMessages(scope, reclamationID) {
            ReclamationService.getMessages(reclamationID).then(function (data) {
                scope.messages = data;
            });
        }

        $scope.messages = function (reclamation) {
            TemplateRootService.getTemplateUrl(101).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope) {

                        $scope.reclamation = reclamation;
                        $scope.messages = [];

                        socket.emit('onReclamation', {'reclamationID': reclamation.ID});

                        reclamation.unreadMessages = 0;

                        getMessages($scope, reclamation.ID);

                        $scope.send = function () {

                            socket.emit('addMessage', {
                                'reclamationID': reclamation.ID,
                                'message': this.form.message,
                                'accessToken': AuthDataService.getAccessToken(),
                                'companyID': $rootScope.companyID
                            });

                        };

                        socket.on('messageSaved', function (data) {
                            if (data.ID !== undefined) {
                                if ($scope.form && data.isAdmin === 0) {
                                    $scope.form.message = '';
                                }
                                getMessages($scope, reclamation.ID);
                            }
                        });
                    }
                });
            });
        };

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
                var lastItem = itemName.pop();
                var possibleExtensions = ['jpg', 'jpeg'];

                if (possibleExtensions.indexOf(lastItem) > -1) {
                    return true;
                }
                Notification.warning($filter('translate')('required_ext') + possibleExtensions.join(','));
                return false;
            }
        });

        $scope.upload = function () {
            changeUrl($scope.selectedReclamation.ID).then(function () {
                $scope.uploader.uploadAll();
                $scope.uploader.onCompleteAll = function () {

                    ReclamationService.getFiles($scope.selectedReclamation.ID).then(function(filesData) {
                        var idx = _.findIndex($scope.reclamations, {ID: $scope.selectedReclamation.ID});
                        if( idx > -1 ) {
                            $scope.reclamations[idx].files = filesData;
                        }
                        $scope.selectedReclamation = null;
                        $scope.uploader.clearQueue();
                        $scope.uploadProgress = 0;
                        Notification.success($filter('translate')('file_uploaded'));
                    });

                }
            });
        };

        $scope.cancelUpload = function() {
            $scope.uploader.clearQueue();
            $scope.selectedReclamation = null;
        };

        function changeUrl(reclamationID) {

            var def = $q.defer();

            _.each($scope.uploader.queue, function (item, index) {
                item.url = ReclamationService.getUploadUrl(reclamationID);
                if (index === $scope.uploader.queue.length - 1) {
                    def.resolve(true);
                }
            });

            return def.promise;
        }

        $scope.selectReclamation = function(reclamation) {
            $scope.selectedReclamation = reclamation;
        };

        init();

    });
