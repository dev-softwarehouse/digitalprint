angular.module('digitalprint.services')
  .factory('LoadingService', function() {
    
    var loadingCount = 0;
    return {
      isLoading: function() { return loadingCount > 0; },
      requested: function() { loadingCount += 1 },
      responsed: function() { loadingCount -= 1 },
      count: function() { return loadingCount }
    };
});