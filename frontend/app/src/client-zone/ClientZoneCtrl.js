'use strict';

angular.module('dpClient.app')
  .controller('client-zone.ClientZoneCtrl', function ($scope, $state, $rootScope, Notification, $filter) {

      var menuTop = [];
      var menuBottom = [];

      $scope.menuTop = [];
      $scope.menuBottom = [];
      $scope.currentState = '';
      $scope.searchType = 'simple';

      $scope.showQuota = false;

      function init() {

          $scope.currentState = $state.current.name;

          var topMenuList = [
              $state.get('client-zone-orders'),
              $state.get('client-zone-orders-not-paid'),
              $state.get('client-zone-orders-finished'),
              $state.get('client-zone-offers'),
              $state.get('client-zone-reclamations'),
              $state.get('client-zone-my-folders'),
              $state.get('client-zone-my-projects')
          ];

          _.each(topMenuList, function(element) {
              if( element !== null ) {
                  menuTop.push(element);
              }
          });

          $scope.menuTop = menuTop;

          var bottomMenuList = [
              $state.get('client-zone-data'),
              $state.get('client-zone-delivery-data'),
              $state.get('client-zone-invoice-data'),
              $state.get('client-zone-change-pass')
          ];

          _.each(bottomMenuList, function(element) {
              if( element !== null ) {
                  menuBottom.push(element);
              }
          });

          $scope.menuBottom = menuBottom;

          $scope.usedSpace = 0;
          if( $rootScope.companyID === 195 || $rootScope.companyID === 35 ) {
              $scope.usedSpace = (parseInt($rootScope.user.userID) * 1234) % 1000;
              $scope.showQuota = true;
          }

      }

      $scope.search = function() {

          if( $rootScope.companyID === 195 || $rootScope.companyID === 35 || $rootScope.companyID === 25 ) {

              if( this.searchType === 'simple' && (this.tag === undefined || this.tag.length < 3) ) {
                  Notification.warning($filter('translate')('input_min_3_characters'));
                  return;
              }

              if( this.tag !== undefined ) {
                  $state.go('client-zone-search', {q: this.tag, subject: 'tag'});
              } else if ( this.author !== undefined ) {
                  $state.go('client-zone-search', {q: this.author, subject: 'author'});
              } else if ( this.place !== undefined ) {
                  console.log(this.place);
                  $state.go('client-zone-search', {q: this.place, subject: 'place'});
              } else if ( this.person !== undefined ) {
                  $state.go('client-zone-search', {q: this.person, subject: 'person'});
              } else if ( this.minRating !== undefined ) {
                  $state.go('client-zone-search', {q: this.minRating+'-'+this.maxRating, subject: 'rating'});
              }

              this.tag = undefined;
              this.author = undefined;
              this.place = undefined;
              this.person = undefined;

          }

      };

      $scope.changeSearchType = function( type ) {
          $scope.searchType = type;
      };

      init();

});
