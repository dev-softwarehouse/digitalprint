angular.module('dpClient.app')
  .controller('LangCtrl', function($scope, $rootScope, $translate, $cookieStore, $window, LangSettingsService,
                                   LangSettingsRootService, Notification){

      var defaultLang = 'pl';

      LangSettingsService.getAll();
      $rootScope.$on('LangSettings.getAll', function (e, data) {
          $rootScope.languages = {};
          _.each(data, function (item) {
              if(item.active === 1) {
                  $rootScope.languages[item.code] = item;
                  if (item.default === 1) {
                      defaultLang = item.code;
                  }
              }
          });

          if ($cookieStore.get('lang')) {
              $scope.switchLanguage($cookieStore.get('lang'));
          } else {
              $scope.switchLanguage(defaultLang);
          }
      });

      $scope.countLanguages = function() {
          return _.values($rootScope.languages).length;
      };

      LangSettingsService.getAll(false).then(function (data) {
          if (!$rootScope.currentLang) {
              $rootScope.currentLang = _.findWhere(data, {default: 1});
          }
      });

      $scope.switchLanguage = function (key, reload) {

          if (typeof reload == undefined) {
              reload = false;
          }

          if (_.isUndefined($rootScope.languages[key])) {
              Notification.error($filter("translate")("languages_settings_problem"));
          }
          $translate.use(key);
          $rootScope.currentLang = $scope.currentLang = $rootScope.languages[key];
          $cookieStore.put('lang', $rootScope.languages[key].code);

          $rootScope.$emit('CreditLimit:reload', true);

          if (reload) {
              $rootScope.$emit('changeLang', key);
          }

      };

      $scope.switchCurrency = function (currency) {

          var idx = _.findIndex($rootScope.currencies, {code: currency.code});

          $rootScope.currentCurrency = $scope.currentCurrency = $rootScope.currencies[idx];
          $cookieStore.put('currency', $rootScope.currentCurrency[index].code);

      };

  }).config(function($translateProvider){

    $translateProvider
        .fallbackLanguage(['pl', 'en', 'ru','de'])
        .registerAvailableLanguageKeys(['pl', 'en', 'de', 'ru'], {
            'pl_PL': 'pl',
            'en_US': 'en',
            'en_UK': 'en',
            'de_DE': 'de',
            'de_AT': 'de',
            'de_CH': 'de',
            'de_LI': 'de',
            'de_LU': 'de',
            'ru_RU': 'ru'
        })
        .useLoader('LangLoader');

  });
