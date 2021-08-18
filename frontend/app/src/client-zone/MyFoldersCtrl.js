/**
 * Created by Rafał Leśniak on 29.04.17.
 */
'use strict';
angular.module('dpClient.app')
    .controller('client-zone.MyFoldersCtrl', function ($scope, $state, $rootScope, ClientZoneWidgetService,
                                                       TemplateRootService, $modal, PhotoFolderService,
                                                       $filter, Notification, $config) {

        $scope.folders = [];
        $scope.sort = {'date': -1};

        $scope.pageSizeSelect = ClientZoneWidgetService.getPageSizeSelect();

        $scope.pagingSettings = {
            currentPage: 1,
            pageSize: 10
        };

        function init() {

            PhotoFolderService.getAll($scope.sort, $scope.pagingSettings).then(function (data) {
                if (data.data) {
                    _.each(data.data, function (folder) {
                        var date = new Date(folder.date);
                        folder.date = date.getFullYear() + '-' +
                            ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
                            ('0' + date.getDate()).slice(-2);
                    });
                    $scope.folders = data.data;
                }
                if (data.allCount) {
                    $scope.pagingSettings.total = data.allCount;
                }
            }, function (status) {
                if (status === 403) {
                    Notification.info($filter('translate')('only_for_logged_users'));
                    $state.go('login');
                }
            });
        }

        function reload() {
            PhotoFolderService.getAll($scope.sort, $scope.pagingSettings).then(function (data) {
                if (data.data) {
                    $scope.folders = data.data;
                }
                if (data.allCount) {
                    $scope.pagingSettings.total = data.allCount;
                }
            }, function (status) {
                if (status === 403) {
                    Notification.info($filter('translate')('only_for_logged_users'));
                    $state.go('login');
                }
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

        init();

        $scope.displayPhotoMap = function () {

            var fullwidth = document.createElement('div');
            fullwidth.className = 'fullwidth-container';

            var map = document.createElement('div');
            map.id = 'photo-map-global';

            fullwidth.addEventListener('click', function (e) {

                if (e.target == fullwidth) {
                    fullwidth.parentNode.removeChild(fullwidth);
                }

            });

            fullwidth.appendChild(map);
            document.body.appendChild(fullwidth);


            function displayMarkers(map) {

                var markers = [];

                for (var i = 0; i < $scope.folders.length; i++) {

                    if( $scope.folders[i].location ){
                      var marker = new google.maps.Marker({

                          position: {
                              lat: parseFloat($scope.folders[i].location.lat),
                              lng: parseFloat($scope.folders[i].location.lng)
                          },
                          map: map

                      });

                      marker.folderData = $scope.folders[i];
                      marker.addListener('click', function( e ){

                          function click(){
                              $state.go('client-zone-my-photos', {folderid: [this.folderData._id]});
                              fullwidth.parentNode.removeChild( fullwidth );
                          }

                          var elem = document.createElement('div');
                          elem.className = 'folderDataInfo';

                          var titleElem = document.createElement('h3');
                          titleElem.innerHTML = this.folderData.folderName;

                          var link = document.createElement('a');
                          link.className = 'btn btn-success';
                          link.innerHTML = 'Zobacz folder';
                          link.addEventListener( 'click', click.bind( this ) );
                      
                          elem.appendChild( titleElem );
                          elem.appendChild( link );

                          var infowindow =  new google.maps.InfoWindow({
                            content: elem,
                            map: map
                          });

                          infowindow.open( map, this );

                      }.bind( marker ));

                      markers.push( marker );
                    }

                    for (var im = 0; im < $scope.folders[i].imageFiles.length; im++) {

                        if ($scope.folders[i].imageFiles[im].location) {

                            var target = 50;
                            var scale = $scope.folders[i].imageFiles[im].width / target;
                            var width = target;
                            var height = $scope.folders[i].imageFiles[im].height / scale;

                            var marker = new google.maps.Marker({

                                position: {
                                    lat: parseFloat($scope.folders[i].imageFiles[im].location.lat),
                                    lng: parseFloat($scope.folders[i].imageFiles[im].location.lng)
                                },
                                map: map,
                                icon: {
                                    url: $scope.folders[i].imageFiles[im].thumbnail,
                                    scaledSize: new google.maps.Size(width, height)
                                }


                            });

                            marker.folderData = $scope.folders[i];

                            var overlay = {};

                            marker.addListener('click', function( e ){

                                function click(){
                                    $state.go('client-zone-my-photos', {folderid: [this.folderData._id]});
                                    fullwidth.parentNode.removeChild( fullwidth );
                                }

                                var elem = document.createElement('div');
                                elem.className = 'folderDataInfo';

                                var titleElem = document.createElement('h3');
                                titleElem.innerHTML = this.folderData.folderName;

                                var link = document.createElement('a');
                                link.className = 'btn btn-success';
                                link.innerHTML = 'Zobacz folder';
                                link.addEventListener( 'click', click.bind( this ) );

                                elem.appendChild( titleElem );
                                elem.appendChild( link );

                                var infowindow =  new google.maps.InfoWindow({
                                	content: elem,
                                	map: map
                                });

                                infowindow.open( map, this );

                            }.bind( marker ));



                            markers.push(marker);

                        }

                    }

                }

                var markerCluster = new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});


            }


            if (location.protocol === 'https:') {

                navigator.geolocation.getCurrentPosition(function (position) {


                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    map = new google.maps.Map(document.getElementById('photo-map-global'), {
                        center: pos,
                        zoom: 8
                    });

                    displayMarkers(map);

                });

            } else {

                var mapOptions = {
                    center: {lat: 0, lng: 0},
                    zoom: 1,
                    minZoom: 1
                };

                map = new google.maps.Map(document.getElementById('photo-map-global'), mapOptions);

                var allowedBounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng(85, -180),	// top left corner of map
                    new google.maps.LatLng(-85, 180)	// bottom right corner
                );

                var k = 5.0;
                var n = allowedBounds.getNorthEast().lat() - k;
                var e = allowedBounds.getNorthEast().lng() - k;
                var s = allowedBounds.getSouthWest().lat() + k;
                var w = allowedBounds.getSouthWest().lng() + k;
                var neNew = new google.maps.LatLng(n, e);
                var swNew = new google.maps.LatLng(s, w);
                var boundsNew = new google.maps.LatLngBounds(swNew, neNew);

                map.fitBounds(boundsNew);

                google.maps.event.addListenerOnce(map, 'bounds_changed', function () {

                    google.maps.event.trigger(map, "resize");
                    map.fitBounds(boundsNew);
                    displayMarkers(map);

                });

            }

        };

        $scope.addFolder = function () {
            TemplateRootService.getTemplateUrl(75).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        $scope.functionType = 'add';

                        $scope.save = function () {
                            var name = $scope.modalForm.folderName;
                            var description = $scope.modalForm.description;
                            PhotoFolderService.add(name, description).then(function (data) {
                                if (data.id !== undefined) {
                                    $modalInstance.close();
                                    reload();
                                    Notification.success($filter('translate')('success'));
                                }
                            });
                        };

                    }
                });
            });
        };

        $scope.createFotobook = function (folder) {

            PhotoFolderService.createPhotobook(folder).then(
                //ok
                function (data) {
                    window.open($rootScope.editorHost + '/?typeID=44&pages=16&formatID=141&1=34&2=19&3=40&4=74&9=119&26=242&loadProject=' + data._id);
                }
            );
        };

        $scope.shareFolderByEmail = function (folder) {

            TemplateRootService.getTemplateUrl(81).then(function (response) {

                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        $scope.folder = folder;

                        $scope.save = function () {

                            if (_.indexOf(folder.sharedEmails, this.email) > -1) {
                                Notification.warning($filter('translate')('email_already_sended'));
                                return;
                            }

                            PhotoFolderService.emailShare(this.email, folder).then(
                                function (data) {
                                    Notification.success($filter('translate')('success'));
                                    $modalInstance.close();
                                    reload();
                                }
                            );

                        }

                    }
                });

            });

        };


        $scope.folderLocation = function (folder) {

            TemplateRootService.getTemplateUrl(80).then(function (response) {

                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',

                    controller: function ($scope, $modalInstance) {

                        var map;

                        $scope.folder = folder;

                        $scope.save = function () {

                            if ($scope.position) {
                                PhotoFolderService.saveFolderPosition($scope.position, folder).then(
                                    function () {
                                        $modalInstance.close();
                                        Notification.success($filter('translate')('location_saved'));
                                    }
                                );
                            }

                        };

                        $scope.initFolderMap = function () {

                            $scope.position = null;
                            map = null;

                            if (folder.location) {

                                map = new google.maps.Map(document.getElementById('map-asset'), {
                                    center: {
                                        lat: parseFloat(folder.location.lat),
                                        lng: parseFloat(folder.location.lng)
                                    },
                                    zoom: 8
                                });

                                google.maps.event.addListenerOnce(map, 'bounds_changed', function () {
                                    google.maps.event.trigger(map, "resize");
                                    map.setCenter({
                                        lat: parseFloat(folder.location.lat),
                                        lng: parseFloat(folder.location.lng)
                                    });
                                    var marker = new google.maps.Marker({
                                        position: {
                                            lat: parseFloat(folder.location.lat),
                                            lng: parseFloat(folder.location.lng)
                                        },
                                        map: map

                                    });

                                    marker.addListener('click', function () {

                                        $scope.photos = folder.imageFiles;
                                        $scope.actualPhoto = folder.imageFiles[0];

                                        TemplateRootService.getTemplateUrl(88).then(function (response) {

                                            $modal.open({
                                                templateUrl: response.url,
                                                scope: $scope,
                                                size: 'lg',
                                                controller: function ($scope, $modalInstance) {

                                                    $scope.closeModal = function () {
                                                        $modalInstance.close();
                                                    };

                                                    $scope.selectPhoto = function (photo) {
                                                        $scope.actualPhoto = photo;
                                                    };

                                                    $scope.nextPhoto = function (photo) {
                                                        var idx = _.findIndex($scope.photos, {_id: photo._id});
                                                        if (idx > -1) {
                                                            if ($scope.photos[idx + 1] !== undefined) {
                                                                $scope.actualPhoto = $scope.photos[idx + 1];
                                                            }
                                                        }
                                                    };

                                                    $scope.previousPhoto = function (photo) {
                                                        var idx = _.findIndex($scope.photos, {_id: photo._id});
                                                        if (idx > -1) {
                                                            if ($scope.photos[idx - 1] !== undefined) {
                                                                $scope.actualPhoto = $scope.photos[idx - 1];
                                                            }
                                                        }
                                                    };

                                                    $scope.nextExist = function (photo) {
                                                        var idx = _.findIndex($scope.photos, {_id: photo._id});
                                                        if (idx > -1) {
                                                            if ($scope.photos[idx + 1] !== undefined) {
                                                                return true;
                                                            }
                                                        }
                                                        return false;
                                                    };

                                                    $scope.previousExist = function (photo) {
                                                        var idx = _.findIndex($scope.photos, {_id: photo._id});
                                                        if (idx > -1) {
                                                            if ($scope.photos[idx - 1] !== undefined) {
                                                                return true;
                                                            }
                                                        }
                                                        return false;
                                                    };
                                                }

                                            });
                                        });
                                    });

                                    map.addListener('click', function (evt) {

                                        $scope.position = {lat: evt.latLng.lat(), lng: evt.latLng.lng()};
                                        marker.setPosition({lat: evt.latLng.lat(), lng: evt.latLng.lng()});
                                        folder.location = {lat: evt.latLng.lat(), lng: evt.latLng.lng()};

                                    });

                                });


                            } else {
                                if (location.protocol === 'https:') {
                                    navigator.geolocation.getCurrentPosition(function (position) {

                                        var pos = {
                                            lat: position.coords.latitude,
                                            lng: position.coords.longitude
                                        };

                                        map = new google.maps.Map(document.getElementById('map-asset'), {
                                            center: pos,
                                            zoom: 8
                                        });

                                        var marker = null;

                                        map.addListener('click', function (evt) {

                                            $scope.position = {lat: evt.latLng.lat(), lng: evt.latLng.lng()};
                                            folder.location = {lat: evt.latLng.lat(), lng: evt.latLng.lng()};

                                            if (marker) {

                                                marker.setPosition({lat: evt.latLng.lat(), lng: evt.latLng.lng()});

                                            } else {

                                                marker = new google.maps.Marker({
                                                    position: {lat: evt.latLng.lat(), lng: evt.latLng.lng()},
                                                    map: map

                                                });

                                            }

                                        });

                                    });
                                } else {

                                    var mapOptions = {
                                        center: {lat: 0, lng: 0},
                                        zoom: 1,
                                        minZoom: 1
                                    };

                                    map = new google.maps.Map(document.getElementById('map-asset'), mapOptions);

                                    var marker = null;

                                    var allowedBounds = new google.maps.LatLngBounds(
                                        new google.maps.LatLng(85, -180),	// top left corner of map
                                        new google.maps.LatLng(-85, 180)	// bottom right corner
                                    );

                                    var k = 5.0;
                                    var n = allowedBounds.getNorthEast().lat() - k;
                                    var e = allowedBounds.getNorthEast().lng() - k;
                                    var s = allowedBounds.getSouthWest().lat() + k;
                                    var w = allowedBounds.getSouthWest().lng() + k;
                                    var neNew = new google.maps.LatLng(n, e);
                                    var swNew = new google.maps.LatLng(s, w);
                                    var boundsNew = new google.maps.LatLngBounds(swNew, neNew);

                                    map.fitBounds(boundsNew);

                                    google.maps.event.addListenerOnce(map, 'bounds_changed', function () {

                                        google.maps.event.trigger(map, "resize");
                                        map.fitBounds(boundsNew);

                                    });

                                    map.addListener('click', function (evt) {

                                        $scope.position = {lat: evt.latLng.lat(), lng: evt.latLng.lng()};
                                        folder.location = {lat: evt.latLng.lat(), lng: evt.latLng.lng()};

                                        if (marker) {

                                            marker.setPosition({lat: evt.latLng.lat(), lng: evt.latLng.lng()});

                                        } else {

                                            marker = new google.maps.Marker({
                                                position: {lat: evt.latLng.lat(), lng: evt.latLng.lng()},
                                                map: map

                                            });

                                        }

                                    });

                                }

                            }

                        }


                    }
                });


            });

        };

        $scope.editFolder = function (folder) {
            TemplateRootService.getTemplateUrl(75).then(function (response) {

                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        $scope.functionType = 'edit';
                        $scope.modalForm = _.clone(folder);

                        $scope.save = function () {
                            PhotoFolderService.edit($scope.modalForm).then(function (data) {
                                if (data._id !== undefined) {
                                    $modalInstance.close();
                                    reload();
                                    Notification.success($filter('translate')('success'));
                                }
                            });
                        };
                    }
                });


            });
        };

        $scope.delete = function (folder) {
            PhotoFolderService.delete(folder).then(function (data) {
                if (data._id !== undefined) {
                    var idx = _.findIndex($scope.folders, {_id: data._id});
                    if (idx > -1) {
                        $scope.folders.splice(idx, 1);
                    }
                }
            });
        };

        $scope.shareFolderByFacebook = function (folder) {
            TemplateRootService.getTemplateUrl(82).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {
                        $scope.folder = folder;


                        $scope.sendFacebookShareFlag = function (folder) {
                            PhotoFolderService.facebookShare(folder).then(function (data) {
                                console.log(data);
                            });
                        };
                    }
                });
            });
        }

    });
