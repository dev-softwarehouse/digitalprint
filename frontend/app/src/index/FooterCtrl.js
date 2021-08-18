/**
 * Created by Rafał on 05-09-2017.
 */
angular.module('dpClient.app')
    .controller('index.FooterCtrl', function ($scope, $rootScope, $state, $filter, Notification,
                                              SettingService, NewsService, TextWidgetService) {

        $scope.sent = false;
        $scope.articles = [];
        $scope.showArticles = false;
        var additionalSettings = {};

        var Setting = new SettingService('general');

        $scope.sendEmail = function() {

            Setting.setModule('general');
            if( $scope.newsletterAgreement === undefined || $scope.newsletterAgreement === false) {
                Notification.warning($filter('translate')('subscription_to_newsletter_agreement_info'));
                return false;
            }

            Setting.signToNewsletter(this.email).then(function(data) {
                if( data.response === true ) {
                    $scope.sent = true;
                    Notification.success($filter('translate')(data.info));
                } else {
                    Notification.error($filter('translate')(data.info));
                }
            });

        };

        function init() {
            $rootScope.$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {
                    if( toState.name === 'home' || toState.name === 'news' ) {
                        if( $scope.articles.length === 0 ) {
                            getNews();
                        }
                        $scope.showArticles = true;
                    } else {
                        $scope.showArticles = false;
                    }
                });

            if( $state.is('home') || $state.is('news') ) {
                getNews();
                $scope.showArticles = true;
            } else {
                $scope.showArticles = false;
            }

            Setting.setModule('additionalSettings');
            Setting.getPublicSettings().then(function (data) {
                additionalSettings = data;
            });
        }

        function getNews() {
            NewsService.getRss().then( function(data) {
                if( data.items ) {
                    $scope.articles = data.items;
                }
            });
        }

        init();


    });
