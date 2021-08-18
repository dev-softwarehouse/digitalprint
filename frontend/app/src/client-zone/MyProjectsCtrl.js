/**
 * Created by Rafał on 24-05-2017.
 */
'use strict';
angular.module('dpClient.app')
    .controller('client-zone.MyProjectsCtrl', function ($scope, $state, $rootScope,
                                                        ClientZoneWidgetService, PsTypeService, EditorProjectService,
                                                        TemplateRootService, $modal ) {

        $scope.projects = [];

        $scope.pageSizeSelect = ClientZoneWidgetService.getPageSizeSelect();

        $scope.sort = {'created': -1};

        $scope.pagingSettings = {
            currentPage: 1,
            pageSize: 10
        };

        function init() {

            ClientZoneWidgetService.getProjects($scope.sort, $scope.pagingSettings).then(function (data) {

                var projects = data.data;
                if (data.allCount) {
                    $scope.pagingSettings.total = data.allCount;
                }

                var types = [];
                _.each(projects, function (oneProject) {
                    _.each(oneProject.projects, function( subProject ) {
                        types.push(subProject.typeID);
                    });
                });
                $scope.projects = projects;

                PsTypeService.getTypesData(types).then(function (data) {

                    _.each(data, function (oneTypeData, typeID) {
                        _.each($scope.projects, function (oneProject) {

                            prepareProjectLink(oneProject);

                            _.each(oneProject.projects, function( subProject ) {
                                /*EditorProjectService.getProjectPrev(subProject._id).then(function (prevData) {
                                    if (prevData && prevData.length > 0) {
                                        subProject.prevPages = prevData;
                                    }
                                });*/

                                if (subProject.typeID === parseInt(typeID)) {
                                    subProject.typeInfo = oneTypeData;
                                }
                            });

                        });
                    });

                });

            });

        }

        init();

        function reload() {
            ClientZoneWidgetService.getProjects($scope.sort, $scope.pagingSettings).then(function (data) {

                var projects = data.data;
                if( data.allCount ) {
                    $scope.pagingSettings.total = data.allCount;
                }

                var types = [];
                _.each(projects, function(oneProject) {
                    types.push(oneProject.typeID);
                });
                $scope.projects = projects;

                PsTypeService.getTypesData(types).then(function(data) {

                    _.each(data, function(oneTypeData, typeID) {
                        _.each($scope.projects, function(project) {

                            EditorProjectService.getProjectPrev(project._id).then( function(prevData) {
                                if( prevData && prevData.length > 0) {
                                    project.prevPages = prevData;
                                }
                            });

                            if( project.typeID === typeID ) {
                                project.typeInfo = oneTypeData;
                            }
                        });
                    });

                });

            });
        }

        $scope.getNextPage = function (page) {
            $scope.pagingSettings.currentPage = page;
            reload();
        };

        $scope.sortBy = function( sortItem ) {
            var activeSort = $scope.sort;
            $scope.sort = {};
            if( _.first(_.keys(activeSort)) === sortItem ) {
                $scope.sort[sortItem] = activeSort[sortItem] === 1 ? -1 : 1;
            } else {
                $scope.sort[sortItem] = 1;
            }
            reload();
        };

        $scope.changeLimit = function(displayRows) {
            $scope.pagingSettings.pageSize = displayRows;
            reload();
        };

        $scope.displayFlipBook = function (project) {

            if( project.prevPages === undefined ) {
                return;
            }

            var flipbookHolder = document.createElement('div');
            flipbookHolder.className = 'flipbook-holder';

            var remove = document.createElement('div');
            remove.className = 'remove-flipbook';
            remove.innerHTML = 'x';

            var nextPage = document.createElement('div');
            nextPage.className = 'nextPage-flipbook';
            nextPage.innerHTML = '<i class="fa fa-arrow-right" aria-hidden="true"></i>';

            var prevPage = document.createElement('div');
            prevPage.className = 'prevPage-flipbook';
            prevPage.innerHTML = '<i class="fa fa-arrow-left" aria-hidden="true"></i>';

            flipbookHolder.appendChild(remove);
            flipbookHolder.appendChild(nextPage);
            flipbookHolder.appendChild(prevPage);

            document.body.appendChild(flipbookHolder);


            var html = '<div id="flipbook">' +
                '<div class="hard"> Turn.js </div>' +
                '<div class="hard"></div>';

            for (var i = 0; i < project.prevPages.length; i++) {

                html += '<div class=""><img src="' + project.prevPages[i] + '"></div>';

            }

            html += '<div class="hard"></div>' +
                '<div class="hard"></div>' +
                '</div>';

            flipbookHolder.innerHTML += html;

            var image = new Image();
            image.onload = function () {

                var width = window.innerWidth * 0.8;
                var aspect = width / (this.width * 2);
                var height = this.height * aspect;

                if (height > window.innerHeight) {

                    height = window.innerHeight * 0.8;
                    aspect = height / this.height;
                    width = (this.width * 2) * aspect;
                }

                flipbookHolder.style.paddingTop = (height - window.innerHeight) / 2 + "px";

                $("#flipbook").turn({
                    height: height,
                    width: width,
                    autoCenter: true
                });

                $('.remove-flipbook').on('click', function (e) {
                    e.stopPropagation();
                    $(this).parent().remove();
                });

                $('.nextPage-flipbook').on('click', function (e) {
                    $("#flipbook").turn('next')
                });

                $('.prevPage-flipbook').on('click', function (e) {
                    $("#flipbook").turn("previous");
                });

                $(document).keyup(function(e) {
                    if (e.keyCode === 27) {
                        $("#flipbook").turn("destroy").remove();
                    }
                    e.stopPropagation();
                });

            };

            image.src = project.prevPages[0];

        };

        function prepareProjectLink(project) {

            var result = {
                typeID: project.typeID,
                products: [],
                formats: [],
                pages: [],
                attributes: [],
                loadProject: project._id
            };

            _.each(project.projects, function(subProject, index) {

                result.products.push(subProject.typeID);
                result.formats.push(subProject.formatID);
                result.pages.push(subProject.pages);

                result.attributes[index] = [];
                _.each(subProject.selectedAttributes, function(optID, attrID) {
                    result.attributes[index].push(attrID + '-' + optID);
                });

            });

            project.jsonText = JSON.stringify(result);

        }

        $scope.delete = function (project) {

        };

        $scope.preview = function (project) {

        };

        $scope.shareByEmail = function (project) {

            TemplateRootService.getTemplateUrl(94).then(function (response) {

                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        $scope.project = project;

                        $scope.save = function () {

                            EditorProjectService.shareMyProject(this.email, project._id).then(
                                function (data) {
                                    Notification.success($filter('translate')('success'));
                                    $modalInstance.close();
                                }
                            );

                        }

                    }
                });

            });

        };

        $scope.shareByFacebook = function(project) {

            TemplateRootService.getTemplateUrl(96).then(function (response) {

                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope) {

                        $scope.project = project;

                    }
                });

            });

        };


    });
