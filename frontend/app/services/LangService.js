angular.module('digitalprint.services')
  .factory('LangService', function($rootScope, $q, $config, $http, CacheService){

    var LangService = {};

    var cacheResolve = new CacheService('lang');

    var resource = 'lang';

    LangService.getAll = function() {
      var def = $q.defer();

      cacheResolve.doRequest(resource).then(function(data){
        def.resolve(data);
      }, function(data){
        def.reject(data);
      });

      return def.promise;
    }

    LangService.getEmpty = function() {
      var def = $q.defer();

      $http({
        method: 'GET',
        url: $config.API_URL + [resource, 'showEmpty'].join("/")
      }).success(function(data) {
        if(data.response) {
          def.resolve(data);
        } else {
          def.reject(data);
        }
      });

      return def.promise;
    }

    LangService.getLang = function(langCode){
      var def = $q.defer();

      cacheResolve.doRequest([resource, langCode].join('/')).then(function(data){
        if(data.response) {
          def.resolve(data.response);
        } else {
          def.reject(data);
        }
      }, function(data){
        def.reject(data);
      });

      return def.promise;
    }

    LangService.edit = function(lang) {
      var def = $q.defer();

      $http({
        method: 'PUT',
        url: $config.API_URL + resource,
        data: lang
      }).success(function(data) {
        if(data.response) {
          def.resolve(data);
        } else {
          def.reject(data);
        }
      });

      return def.promise;
    }

    LangService.remove = function(id) {
      var def = $q.defer();

      $http({
        method: 'DELETE',
        url: $config.API_URL + [resource, id].join('/')
      }).success(function(data) {
        if(data.response) {
          def.resolve(data);
        } else {
          def.reject(data);
        }
      });

      return def.promise;
    }

    return LangService;
  });
