angular.module('dpClient.app')
    .controller('SliderCtrl', function ($scope, $rootScope, SettingService) {

        $scope.slides = [];
        $scope.sliderText = '';

        $rootScope.$on('Slider:data', function (event, data) {

            $scope.slides = [];
            $scope.sliderOptions = {
                sliderAutoSlide: 3,
                sliderTransition: 'slide'
            };

            var tmp = {};
            if (!_.isEmpty(data)) {

                var Setting = new SettingService('bannerSlider');

                Setting.getPublicSettings().then(function(settingsData) {
                    if( settingsData.sliderAutoSlide ) {
                        $scope.sliderOptions.sliderAutoSlide = settingsData.sliderAutoSlide.value;
                    }
                    if( settingsData.sliderTransition ) {
                        $scope.sliderOptions.sliderTransition = settingsData.sliderTransition.value;
                    }

                    $scope.sliderText = 'rn-carousel rn-carousel-index="sliderIndex" rn-carousel-controls rn-carousel-auto-slide="' + $scope.sliderOptions.sliderAutoSlide + '"' +
                        ' rn-carousel-pause-on-hover rn-carousel-buffered rn-carousel-transition="' + $scope.sliderOptions.sliderTransition + '" rn-carousel-controls-allow-loop';

                });

                _.each(data, function (oneSlider) {

                    if (!_.isEmpty(oneSlider.files)) {
                        _.each(oneSlider.files, function (oneFile) {

                            tmp = {name: 'Image' + oneFile.fileID, 'url': oneFile.url, link: oneFile.link};
                            $scope.slides.push(tmp);

                        });
                    }
                });

            } else {
                $scope.slides = [];
            }

            $scope.sliderHeight = {'height': '210px'};
        });

    });