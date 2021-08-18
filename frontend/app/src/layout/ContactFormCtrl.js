/**
 * Created by Rafał on 19-07-2017.
 */
angular.module('dpClient.app')
    .controller('ContactFormCtrl', function ($scope, $state, $filter, Notification, SettingService,
                                             vcRecaptchaService) {

        var Setting = new SettingService('additionalSettings');

        function init() {
            Setting.getPublicSettings().then(function (settingsData) {
                if (settingsData.captchaPublicKey) {
                    $scope.model = {
                        key: settingsData.captchaPublicKey.value
                    };
                }
            });
        }

        $scope.response = null;
        $scope.widgetId = null;

        $scope.setResponse = function (response) {
            console.info('Response available');
            $scope.response = response;
        };
        $scope.setWidgetId = function (widgetId) {
            console.info('Created widget ID: %s', widgetId);
            $scope.widgetId = widgetId;
        };
        $scope.cbExpiration = function () {
            console.info('Captcha expired. Resetting response object');
            vcRecaptchaService.reload($scope.widgetId);
            $scope.response = null;
        };

        $scope.sendMessage = function (key) {

            console.log('sending the captcha response to the server', $scope.response);

            var Setting = new SettingService('forms');

            var contactData = $scope.contactForm;
            contactData.captchaResponse = $scope.response;

            $scope.mailSent = false;

            Setting.sendMessage(key, contactData).then(function (sentData) {
                if (sentData.response === true) {
                    Notification.success($filter('translate')('email_sended'));
                    $scope.mailSent = true;
                } else {
                    Notification.error($filter('translate')('error'));
                }
            }, function (errorData) {
                if( errorData.info ) {
                    Notification.error($filter('translate')(errorData.info));
                } else {
                    Notification.error($filter('translate')('error'));
                }

            });

        };

        init();
    });