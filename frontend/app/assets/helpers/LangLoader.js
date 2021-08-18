angular.module('dpClient.helpers')
  .factory('LangLoader', function (LangService) {
    return function(options) {
      var selectedLang = options.key;

      if(selectedLang === undefined) {
        console.log("Undefined lang select pl");
        selectedLang = 'pl';
      }
      return LangService.getLang(selectedLang);
    }
  });