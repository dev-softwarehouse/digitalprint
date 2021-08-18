angular.module('dpClient.config')
  .provider('$config', function(){

    var config = {};

    return {
      set: function(key, val){
        config[key] = val
      },
      get: function(key){
        return config[key];
      },
      $get: function(){
        return config;
      }
    }

  });