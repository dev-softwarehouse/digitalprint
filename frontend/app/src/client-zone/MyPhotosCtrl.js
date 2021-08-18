/**
 * Created by Rafał on 02-05-2017.
 */
'use strict';
angular.module('dpClient.app')
    .controller('client-zone.MyPhotosCtrl', function ($scope, $state, $filter, Notification, $rootScope, ClientZoneWidgetService,
                                                      TemplateRootService, $modal, PhotoFolderService, $stateParams,
                                                      AuthService, $window, $q, CanvasService, $config) {

        $scope.photos = [];
        $scope.folder = {};
        $scope.actualPhoto = {};
        $scope.sliderOn = false;
        $scope.slider = {
            value: 0,
            options: {
                floor: -100,
                ceil: 100
            }
        };
        $scope.slider.type = null;
        $scope.textOn = false;

        $scope.folderId = $stateParams.folderid;

        $scope.sort = {'name': 1};

        $scope.pageSizeSelect = ClientZoneWidgetService.getPageSizeSelect();

        $scope.pagingSettings = {
            currentPage: 1,
            pageSize: 10
        };

        var accessTokenName = $config.ACCESS_TOKEN_NAME;

        var featherEditor = new Aviary.Feather({
            apiKey: '8c01e579a3104458a3bc25345716a10e',
            apiVersion: 3,
            language: 'pl',
            onSave: function(imageID, newURL) {
                var img = document.getElementById(imageID);
                img.src = newURL;
            }
        });

        function getMeta(url){
            var deferred = $q.defer();

            var w; var h;
            var img= new Image();
            img.src=url;
            img.onload=function(){
                w=this.width;
                h=this.height;
                deferred.resolve({width: this.width, height: this.height});
            };

            return deferred.promise;
        }

        function initCanvas(width, height, url) {
            var deferred = $q.defer();

            var c = document.createElement('canvas');
            c.width = width;
            c.height = height;
            var ctx = c.getContext("2d");
            var img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = url;
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
                deferred.resolve(c);
            };

            return deferred.promise;
        }

        $scope.launchEditor = function(photo) {

            if( photo.imageUrl === undefined ) {
                Notification.warning($filter('translate')('photo_in_prepared'));
                return;
            }

            console.log( photo );

            featherEditor.launch({
                image: 'photo_' + photo._id,
                url: photo.imageUrl,
                onSaveButtonClicked: function(imageID) {
                    console.log(imageID);
                },
                onSave: function(imageID, newURL) {

                    getMeta(newURL).then( function(metaImg) {
                        var sequences = [];

                        sequences.push(getMeta(photo.thumbnail));
                        sequences.push(getMeta(photo.minUrl));
                        sequences.push(initCanvas(metaImg.width, metaImg.height, newURL));

                        $q.all(sequences).then(
                            function (results) {
                                var thumbSize = results[0];
                                var minSize = results[1];
                                var canvas = results[2];

                                var mainSize = {
                                    width: metaImg.width,
                                    height: metaImg.height
                                };

                                console.log(thumbSize, minSize, mainSize);
                                console.log( canvas.width, canvas.height );

                                PhotoFolderService.savePhoto(photo._id, canvas.toDataURL(), thumbSize, minSize, mainSize).then(function(data) {
                                    $scope.savePreload = false;
                                    if( data.EditedUpload ) {
                                        photo = data;
                                        var photoIndex = _.findIndex($scope.photos, {_id: data._id});
                                        if( photoIndex > -1 ) {
                                            $scope.photos[photoIndex] = data;
                                        }

                                        Notification.success($filter('translate')('success'));
                                    } else {
                                        Notification.error($filter('translate')('error'));
                                    }
                                });
                            }
                        );
                    });
                }
            });
            return false;
        };

        function init() {
            PhotoFolderService.getPhotos($scope.folderId, $scope.sort, $scope.pagingSettings).then(function (photosData) {
                $scope.folder = photosData.data;
                _.each(photosData.data.imageFiles, function(photo) {
                    fillStarts(photo);
                });
                $scope.photos = photosData.data.imageFiles;
                $scope.actualPhoto = photosData.data.imageFiles[0];
                $scope.pagingSettings.total = photosData.allCount;
            }, function (status) {
                if (status === 403) {
                    Notification.info($filter('translate')('only_for_logged_users'));
                    $state.go('login');
                }
            });

            var conf = {
                uploadButton: $window.document.getElementById('uploadButton'),
                onLoadedItem: onLoadedItem,
                onUploadedItem: onUploadedItem,
                onStartUpload: onStartUpload,
                uploadServerUrl: $config.AUTH_URL + '/userUpload/projectImage'
            };

            new $window.UploaderStandalone(conf);
        }

        function fillStarts( photo ) {
            photo.stars = [];
            for (var i = 5; i > 0; i--) {
                photo.stars.push({
                    filled: i <= photo.averageRate
                });
            }
        }

        function reload() {
            PhotoFolderService.getPhotos($scope.folderId, $scope.sort, $scope.pagingSettings).then(function (photosData) {
                $scope.folder = photosData.data;
                _.each(photosData.data.imageFiles, function(photo) {
                    fillStarts(photo);
                });
                $scope.photos = photosData.data.imageFiles;
                $scope.actualPhoto = photosData.data.imageFiles[0];
                $scope.pagingSettings.total = photosData.allCount;
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

        $scope.selectPhoto = function (photo) {
            $scope.actualPhoto = photo;
        };

        $scope.nextPhoto = function (photo) {
            if( photo === undefined ) {
                return;
            }
            var idx = _.findIndex($scope.photos, {_id: photo._id});
            if (idx > -1) {
                if ($scope.photos[idx + 1] !== undefined) {
                    $scope.actualPhoto = $scope.photos[idx + 1];
                }
            }
        };

        $scope.previousPhoto = function (photo) {
            if( photo === undefined ) {
                return;
            }
            var idx = _.findIndex($scope.photos, {_id: photo._id});
            if (idx > -1) {
                if ($scope.photos[idx - 1] !== undefined) {
                    $scope.actualPhoto = $scope.photos[idx - 1];
                }
            }
        };

        $scope.nextExist = function (photo) {
            if( photo === undefined ) {
                return;
            }
            var idx = _.findIndex($scope.photos, {_id: photo._id});
            if (idx > -1) {
                if ($scope.photos[idx + 1] !== undefined) {
                    return true;
                }
            }
            return false;
        };

        $scope.previousExist = function (photo) {
            if( photo === undefined ) {
                return;
            }
            var idx = _.findIndex($scope.photos, {_id: photo._id});
            if (idx > -1) {
                if ($scope.photos[idx - 1] !== undefined) {
                    return true;
                }
            }
            return false;
        };

        $scope.addPhoto = function (thumbnail) {

            var def = $q.defer();

            var pushed = $scope.photos.push({uploaded: false, thumbnail: thumbnail, name: 'new'});
            if (pushed) {
                var lastIndex = $scope.photos.length - 1;
                def.resolve(lastIndex);
            }

            return def.promise;

        };

        $scope.deletePhoto = function (photo) {
            if (!photo._id) {
                Notification.warning($filter('translate')('photo_not_yet_uploaded'));
                return;
            }
            PhotoFolderService.deletePhoto($scope.folderId, photo._id).then(function (data) {
                if (data._id) {
                    var photoIndex = _.findIndex($scope.photos, {_id: photo._id});
                    if (photoIndex > -1) {
                        $scope.photos.splice(photoIndex, 1);
                        Notification.success($filter('translate')('deleted_successful'));
                        reload();
                    }
                }
            });
        };

        $scope.rotate = function (photo, direct) {
            $scope.sliderOn = false;
            $scope.textOn = false;

            if (photo.rotate === undefined) {
                photo.rotate = 0;
            }

            if (direct === 0) {
                photo.rotate -= 90;
            } else {
                photo.rotate += 90;
            }

            var canvas = CanvasService.getCanvas();
            var stage = CanvasService.getStage();
            var bitmap = CanvasService.getBitmap();
            var container = CanvasService.getContainer();

            bitmap.regX = bitmap.image.width * 0.5;
            bitmap.regY = bitmap.image.height * 0.5;

            if (photo.rotate % 180 === 0) {
                bitmap.x = (bitmap.image.width / 2)*bitmap.scaleX;
                bitmap.y = (bitmap.image.height / 2)*bitmap.scaleX;
            } else {
                bitmap.y = (bitmap.image.width / 2)*bitmap.scaleX;
                bitmap.x = (bitmap.image.height / 2)*bitmap.scaleX;
            }

            var width = stage.canvas.width;
            var height = stage.canvas.height;

            bitmap.rotation = photo.rotate;

            var canvasObject = $window.document.getElementById('photoCanvas');
            canvasObject.setAttribute('width', height);
            canvasObject.setAttribute('height', width);
        };

        $scope.saturation = function (photo) {
            $scope.sliderOn = true;
            $scope.textOn = false;

            $scope.slider.options = {
                floor: -100,
                ceil: 100
            };

            $scope.slider.type = 'saturation';
            var filterSaturation = CanvasService.getFilter('saturation');
            if( filterSaturation !== undefined ) {
                $scope.slider.value = filterSaturation.sliderValue;
            } else {
                $scope.slider.value = 0;
            }

            var bitmap = CanvasService.getBitmap();
            var stage = CanvasService.getStage();

            $scope.$watch('slider.value', function (value) {

                if( $scope.slider.type !== 'saturation' ) {
                    return;
                }

                bitmap.uncache();

                var matrix = new createjs.ColorMatrix();
                matrix.reset();
                matrix.adjustSaturation(value);
                CanvasService.setFilter(
                    'saturation',
                    new createjs.ColorMatrixFilter(matrix),
                    value
                );
                CanvasService.updateBitmapFilter();

                bitmap.cache(0, 0, bitmap.image.width, bitmap.image.height);
                bitmap.updateCache();
            });

        };

        $scope.brightness = function (photo) {
            $scope.sliderOn = true;
            $scope.textOn = false;

            $scope.slider.options = {
                floor: -100,
                ceil: 100
            };

            $scope.slider.type = 'brightness';

            var filterBrightness = CanvasService.getFilter('brightness');
            if( filterBrightness !== undefined ) {
                $scope.slider.value = filterBrightness.sliderValue;
            } else {
                $scope.slider.value = 0;
            }

            var bitmap = CanvasService.getBitmap();
            var stage = CanvasService.getStage();

            $scope.$watch('slider.value', function (value) {

                if( $scope.slider.type !== 'brightness' ) {
                    return;
                }

                bitmap.uncache();

                var matrix = new createjs.ColorMatrix();
                matrix.reset();
                matrix.adjustBrightness(value);

                CanvasService.setFilter(
                    'brightness',
                    new createjs.ColorMatrixFilter(matrix),
                    value
                );
                CanvasService.updateBitmapFilter();

                bitmap.cache(0, 0, bitmap.image.width, bitmap.image.height);
                bitmap.updateCache();
            });

        };

        $scope.$on('photoTools', function (e, value) {
            $scope.sliderOn = value;
        });

        $scope.$on('sendMask',function(event, newMask) {

            var bitmap = CanvasService.getBitmap();
            var stage = CanvasService.getStage();
            var container = CanvasService.getContainer();
            var canvas = CanvasService.getCanvas();
            var mask = CanvasService.getMask();

            container.removeChild(mask);

            var image = new Image();
            image.crossOrigin = "Anonymous";
            image.addEventListener('load', addMask);
            image.src = newMask;

            function addMask(event) {

                CanvasService.setMask(event.target);

                var maskBitmap = new createjs.Bitmap(event.target);

                var scaleX = canvas.width/maskBitmap.image.width;
                var scaleY = canvas.height/maskBitmap.image.height;

                maskBitmap.scaleX = scaleX;
                maskBitmap.scaleY = scaleY;

                var maskContainer = new createjs.Container();
                maskContainer.addChild( maskBitmap );

                maskContainer.cache(0, 0,canvas.width, canvas.height, 1/bitmap.scaleX);

                CanvasService.setFilter('mask', new createjs.AlphaMapFilter(maskContainer.cacheCanvas));
                CanvasService.updateBitmapFilter();

                bitmap.cache(0, 0, bitmap.image.width, bitmap.image.height);
                bitmap.updateCache();
            }

        });

        $scope.editPhoto = function (photo) {

            AdobeCreativeSDK.init({
                /* 2) Add your Client ID (API Key) */
                clientID: 'ce642ff1bee84680bb61503796cabeb5',
                onError: function(error) {
                    if (error.type === AdobeCreativeSDK.ErrorTypes.AUTHENTICATION) {
                        console.log('You must be logged in to use the Creative SDK');
                    } else if (error.type === AdobeCreativeSDK.ErrorTypes.GLOBAL_CONFIGURATION) {
                        console.log( error );
                        console.log('Please check your configuration');
                    } else if (error.type === AdobeCreativeSDK.ErrorTypes.SERVER_ERROR) {
                        console.log('Oops, something went wrong');
                    }
                }
            });
        };

        $scope.putText = function() {
            $scope.textOn = !$scope.textOn;
            $scope.sliderOn = false;

            $scope.saveText = function() {

                var text = new createjs.Text(this.text.value, "13px Arial", "#ffffff");
                text.x = this.text.x;
                text.y = this.text.y;
                text.textBaseline = "alphabetic";

                var container = CanvasService.getContainer();
                container.addChild(text);
                showAddedTexts();
            }
        };

        function showAddedTexts() {

            var container = CanvasService.getContainer();
            $scope.childrenText = [];

            _.each(container.children, function(oneChild) {
                if( oneChild.text !== undefined ) {
                    $scope.childrenText.push(oneChild);
                }
            });

        }

        $scope.removeText = function(text) {
            var container = CanvasService.getContainer();
            container.removeChild(text);
            var index = _.findIndex($scope.childrenText, {id: text.id});
            if( index > -1 ) {
                $scope.childrenText.splice(index, 1);
            }
        };

        $scope.addMask = function ( photo ) {
            TemplateRootService.getTemplateUrl(89).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope, $modalInstance, $config) {

                        $scope.masks = [];
                        $scope.currentPage = 1;
                        $scope.pageSize = 10;
                        $scope.photo = photo;

                        PhotoFolderService.getMasks().then(function(data) {

                            $scope.masksCount = data.length;
                            $scope.masks = {};
                            var page = 1;
                            _.each(data, function(oneMask, index) {
                                page = Math.ceil((index+1)/$scope.pageSize);

                                if( $scope.masks[page] === undefined ) {
                                    $scope.masks[page] = [];
                                }

                                $scope.masks[page].push(oneMask);
                            })
                        });

                        $scope.numberOfPages=function(){
                            return Math.ceil($scope.masksCount/$scope.pageSize);
                        };

                        $scope.selectMask = function(photo, mask) {
                            $scope.$emit('sendMask', mask);
                            $modalInstance.close();
                        };

                        $scope.getMaskImage = function(photo, mask) {
                            var thumbEncodeUrl = encodeURIComponent(photo.thumbnail);
                            var maskEncodeUrl = encodeURIComponent(mask);
                            return $config.API_URL + ['dp_views', 'createMask'].join('/') + '?' +  ['photoUrl=' + thumbEncodeUrl, 'maskUrl=' + maskEncodeUrl].join('&');
                        };

                    }
                });
            });
        };

        $scope.editPhotoLocalisation = function (photo) {

            TemplateRootService.getTemplateUrl(79).then(function (response) {

                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',

                    controller: function ($scope, $modalInstance) {

                        // @TODO edit
                        $scope.photo = photo;

                        $scope.save = function () {
                            if ($scope.position) {
                                PhotoFolderService.savePosition($scope.position, photo).then(
                                    //ok
                                    function (res) {
                                        $modalInstance.close();
                                        Notification.success($filter('translate')('location_saved'));
                                    }
                                );
                            }

                        };

                        $scope.initMap = function () {

                            $scope.position = null;

                            if (photo.location) {

                                var image = new Image();

                                image.onload = function () {

                                    var target = 50;
                                    var scale = this.width / target;
                                    var width = target;
                                    var height = this.height / scale;

                                    var map = new google.maps.Map(document.getElementById('map-asset'), {
                                        center: {
                                            lat: parseFloat(photo.location.lat),
                                            lng: parseFloat(photo.location.lng)
                                        },
                                        zoom: 8
                                    });

                                    var marker = new google.maps.Marker({
                                        position: {
                                            lat: parseFloat(photo.location.lat),
                                            lng: parseFloat(photo.location.lng)
                                        },
                                        map: map,
                                        icon: {url: photo.thumbnail, scaledSize: new google.maps.Size(width, height)},

                                    });

                                    map.addListener('click', function (evt) {

                                        $scope.position = {lat: evt.latLng.lat(), lng: evt.latLng.lng()};
                                        photo.location = {lat: evt.latLng.lat(), lng: evt.latLng.lng()};

                                        if (marker) {

                                            marker.setPosition({lat: evt.latLng.lat(), lng: evt.latLng.lng()});

                                        } else {

                                            var image = new Image();
                                            image.onload = function () {

                                                var target = 50;
                                                var scale = this.width / target;
                                                var width = target;
                                                var height = this.height / scale;

                                                marker.setPosition({lat: evt.latLng.lat(), lng: evt.latLng.lng()});

                                            };

                                            image.src = photo.thumbnail + "?_=" + (new Date().getTime() );

                                        }

                                    });

                                };
                                image.src = photo.thumbnail + "?_=" + (new Date().getTime() );


                            } else {
                                if (location.protocol === 'https:') {
                                    navigator.geolocation.getCurrentPosition(function (position) {

                                        var pos = {
                                            lat: position.coords.latitude,
                                            lng: position.coords.longitude
                                        };

                                        var map = new google.maps.Map(document.getElementById('map-asset'), {
                                            center: pos,
                                            zoom: 8
                                        });

                                        var marker = null;

                                        map.addListener('click', function (evt) {

                                            $scope.position = {lat: evt.latLng.lat(), lng: evt.latLng.lng()};
                                            photo.location = {lat: evt.latLng.lat(), lng: evt.latLng.lng()};

                                            if (marker) {

                                                marker.setPosition({lat: evt.latLng.lat(), lng: evt.latLng.lng()});

                                            } else {

                                                var image = new Image();
                                                image.onload = function () {

                                                    var target = 50;
                                                    var scale = this.width / target;
                                                    var width = target;
                                                    var height = this.height / scale;

                                                    marker = new google.maps.Marker({
                                                        position: {lat: evt.latLng.lat(), lng: evt.latLng.lng()},
                                                        map: map,
                                                        icon: {
                                                            url: photo.thumbnail,
                                                            scaledSize: new google.maps.Size(width, height)
                                                        }
                                                    });

                                                };
                                                image.src = photo.thumbnail + "?_=" + (new Date().getTime() );

                                            }

                                        });

                                    });

                                } else {

                                    var mapOptions = {
                                        center: new google.maps.LatLng(0, 0),
                                        zoom: 1,
                                        minZoom: 1
                                    };

                                    var map = new google.maps.Map(document.getElementById('map-asset'), mapOptions);

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

                                    var marker = null;

                                    map.addListener('click', function (evt) {

                                        $scope.position = {lat: evt.latLng.lat(), lng: evt.latLng.lng()};
                                        photo.location = {lat: evt.latLng.lat(), lng: evt.latLng.lng()};

                                        if (marker) {

                                            marker.setPosition({lat: evt.latLng.lat(), lng: evt.latLng.lng()});

                                        } else {

                                            var image = new Image();
                                            image.onload = function () {

                                                var target = 50;
                                                var scale = this.width / target;
                                                var width = target;
                                                var height = this.height / scale;

                                                marker = new google.maps.Marker({
                                                    position: {lat: evt.latLng.lat(), lng: evt.latLng.lng()},
                                                    map: map,
                                                    icon: {
                                                        url: photo.thumbnail,
                                                        scaledSize: new google.maps.Size(width, height)
                                                    }
                                                });

                                            };
                                            image.src = photo.thumbnail + "?_=" + (new Date().getTime() );

                                        }

                                    });

                                }

                            }

                        }

                    }

                });
            });

        };

        $scope.movePhoto = function (folder, photo) {
            TemplateRootService.getTemplateUrl(78).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    resolve: {
                        folders: function () {
                            return PhotoFolderService.getAll({'date': -1}, {currentPage: 1,
                                pageSize: 50}).then(function (data) {
                                return data;
                            }, function (status) {
                                if (status === 403) {
                                    $state.go('login');
                                }
                            });
                        }
                    },
                    controller: function ($scope, $modalInstance, folders) {

                        $scope.functionType = 'move';
                        $scope.form = {};
                        // @TODO move
                        $scope.photo = photo;
                        $scope.folders = folders.data;

                        var folderIndex = _.findIndex(folders, {_id: folder._id});
                        if (folderIndex > -1) {
                            $scope.form.selectedFolder = folders[folderIndex];
                        }

                        $scope.save = function (data) {

                            PhotoFolderService.movePhoto($scope.form, folder._id, photo).then(function (data) {

                                var photoIndex = _.findIndex($scope.photos, {_id: photo._id});
                                if (photoIndex > -1) {
                                    $scope.photos.splice(photoIndex, 1);
                                    Notification.success($filter('translate')('moved_successful'));
                                }

                            });

                        };

                    }
                });
            });
        };

        $scope.copyPhoto = function (folder, photo) {
            TemplateRootService.getTemplateUrl(78).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    resolve: {
                        folders: function () {
                            return PhotoFolderService.getAll({'date': -1}, {currentPage: 1,
                                pageSize: 50}).then(function (data) {
                                return data;
                            }, function (status) {
                                if (status === 403) {
                                    $state.go('login');
                                }
                            });
                        }
                    },
                    controller: function ($scope, $modalInstance, folders) {

                        $scope.functionType = 'copy';
                        $scope.form = {};
                        // @TODO move
                        $scope.photo = photo;
                        $scope.folders = folders.data;

                        var folderIndex = _.findIndex(folders, {_id: folder._id});
                        if (folderIndex > -1) {
                            $scope.form.selectedFolder = folders[folderIndex];
                        }

                        $scope.save = function () {

                            PhotoFolderService.copyPhoto($scope.form, photo).then(function (data) {

                                Notification.success($filter('translate')('copied_successful'));

                            });

                        }


                    }
                });
            });
        };

        function waitForDom(index) {
            var def = $q.defer();

            setInterval(function () {
                if ($window.document.getElementsByClassName('repeatContainer')[index] !== undefined) {
                    def.resolve(true);
                }
            }, 1000);

            return def.promise;
        }

        function onLoadedItem(data, callback) {

            $scope.addPhoto(data.context.thumbImage).then(function (photoIndex) {

                waitForDom(photoIndex).then(function () {
                    var image = $window.document.getElementsByClassName('repeatContainer')[photoIndex];

                    image.context = data.context;

                    var uploadProgressBar = $window.document.createElement('div');
                    uploadProgressBar.className = 'uploadProgress';

                    var uploadProgressBarBorder = $window.document.createElement('div');
                    uploadProgressBarBorder.className = 'border-bar';

                    uploadProgressBar.appendChild(uploadProgressBarBorder);

                    var uploadProgressBarInner = $window.document.createElement('div');
                    uploadProgressBarInner.className = 'status';
                    uploadProgressBarInner.style.position = 'absolute';
                    uploadProgressBarInner.style.top = 0;
                    uploadProgressBarInner.style.left = 0;
                    uploadProgressBarInner.style.width = 0;

                    uploadProgressBarBorder.appendChild(uploadProgressBarInner);

                    image.appendChild(uploadProgressBar);

                    data.context.setElement(image);

                    callback();
                });

            });
        }

        function onUploadedItem(contextElement, data) {

            var photoIndex = contextElement.elem.getAttribute('tabindex');
            $scope.pagingSettings.total++;
            if( $scope.pagingSettings.total > $scope.pagingSettings.pageSize && $scope.pagingSettings.total % $scope.pagingSettings.pageSize === 1 ) {
                reload();
            }
            $scope.photos[photoIndex] = data;
        }

        function onStartUpload(data, contextElement) {

            data.append('companyID', $rootScope.companyID);
            data.append(accessTokenName, AuthService.readCookie(accessTokenName));
            data.append('folderId', $scope.folder._id);

            return data;
        }

        $scope.goToLink = function (domainHost, langCode, link, photoId) {
            location.href = 'https://www.facebook.com/sharer/sharer.php?u=http://' + domainHost + '/' + langCode + '/' + link + '/' + photoId + '&amp;src=sdkpreparse';
        };

        $scope.sharePhotoByEmail = function (photo) {
            TemplateRootService.getTemplateUrl(86).then(function (response) {

                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        $scope.photo = photo;

                        $scope.save = function () {

                            if (_.indexOf(photo.sharedEmails, this.email) > -1) {
                                Notification.warning($filter('translate')('email_already_sended'));
                                return;
                            }

                            PhotoFolderService.emailSharePhoto(this.email, photo).then(
                                function (status) {
                                    if( status === 201 ) {
                                        photo.emailShared = true;
                                        Notification.success($filter('translate')('success'));
                                        $modalInstance.close();
                                    }
                                }
                            );
                        };

                    }
                });

            });

        };

        $scope.sharePhotoByFacebook = function (photo) {
            TemplateRootService.getTemplateUrl(87).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {
                        $scope.photo = photo;

                        $scope.sendFacebookShareFlag = function (photo) {
                            PhotoFolderService.facebookSharePhoto(photo).then(function (status) {
                                if( status === 201 ) {
                                    photo.facebookShare = true;
                                    Notification.success($filter('translate')('success'));
                                    $modalInstance.close();
                                }
                            });
                        };
                    }
                });
            });
        };

        $scope.addTags = function(photo) {

            TemplateRootService.getTemplateUrl(90).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        $scope.photo = photo;

                        if( photo.tags === undefined ) {
                            photo.tags = [];
                        }

                        $scope.saveTag = function() {

                            var tagName = this.name;

                            if (_.indexOf(photo.tags, this.name) > -1) {
                                Notification.warning($filter('translate')('tag_exist'));
                                return;
                            }

                            PhotoFolderService.addTag(photo._id, this.name).then(function(tagData) {
                                photo.tags.push(tagName);
                                $scope.name = '';
                            });

                        };

                        $scope.saveAuthor = function() {
                            var authorName = this.author;

                            PhotoFolderService.setImageAuthor(authorName, photo._id).then(function() {
                                photo.autor = authorName;
                                $scope.author = '';
                            });
                        };

                        $scope.savePlace = function() {
                            var placeName = this.place;

                            PhotoFolderService.setImagePlace(placeName, photo._id).then(function() {
                                photo.place = placeName;
                                $scope.place = '';
                            });
                        };

                        $scope.savePerson = function() {

                            var personName = this.person;

                            if (_.indexOf(photo.peoples, this.person) > -1) {
                                Notification.warning($filter('translate')('person_already_assigned'));
                                return;
                            }

                            PhotoFolderService.setImagePeoples(this.person, photo._id).then(function() {
                                photo.peoples.push(personName);
                                $scope.person = '';
                            });

                        };

                        $scope.remove = function(photo, tag) {
                            PhotoFolderService.removeTag(photo._id, tag).then(function(tagData) {
                                var tagIdx =  _.findIndex(photo.tags, tag);
                                if( tagIdx > -1 ) {
                                    photo.tags.splice(tagIdx, 1);
                                }
                            });
                        };

                        $scope.removePerson = function(photo, person) {
                            //PhotoFolderService.removeTag(photo._id, person).then(function(tagData) {
                                var personIdx =  _.findIndex(photo.peoples, person);
                                if( personIdx > -1 ) {
                                    photo.peoples.splice(personIdx, 1);
                                }
                            //});
                        };

                        $scope.removePlace = function(photo) {
                            //PhotoFolderService.removeTag(photo._id, place).then(function(tagData) {
                            photo.place = null;
                            //});
                        };

                        $scope.removeAuthor = function(photo) {
                            //PhotoFolderService.removeTag(photo._id, place).then(function(tagData) {
                            photo.author = null;
                            //});
                        };
                    }
                });
            });
        };

        $scope.getImageExtension = function(photo, extension) {

            var fileName = photo._id + "." + extension;
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = PhotoFolderService.getUrlImageByExtension(photo._id, extension);
            a.download = fileName;
            a.click();
        };

        init();

    });
