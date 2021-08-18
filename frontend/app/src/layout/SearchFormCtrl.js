/**
 * Created by Rafał on 14-06-2017.
 */
/**
 * Created by Rafał on 11-04-2017.
 */
angular.module('dpClient.app')
    .controller('SearchFormCtrl', function ($scope, $state, $filter, Notification) {

        $scope.search = function() {
            /**
             * @param this object
             * @param this.searchText string
             */
            if( this.searchText.length < 3 ) {
                Notification.warning($filter('translate')('enter_minimum_chars').replace("%d", 3));
                return;
            }
            $state.go('search', {text: this.searchText});
        }

    });