'use strict';

angular.module('dpClient.app').filter('menutypes', function ( $rootScope ) {
    function checkChilds(childs) {
        var filtered = [];
        _.each(childs, function (child) {
            if (!_.isUndefined(child.groups) && !_.isNull(child.groups) && !_.isEmpty(child.groups)) {
                filtered = _.union(filtered, checkGroups(child.groups));
            }
            if (!_.isUndefined(child.types) && !_.isNull(child.types) && !_.isEmpty(child.types)) {
                filtered = _.union(filtered, child.types);
            }
        });
        return filtered;
    }

    function checkGroups(groups) {
        var filtered = [];
        _.each(groups, function (group) {
            if (!_.isNull(group) && !_.isUndefined(group.types) && !_.isEmpty(group.types)) {
                filtered = _.union(filtered, group.types);
            }
        });
        return filtered;
    }

    return function (items) {
        if (_.isUndefined(items) || _.isEmpty(items)) {
            return [];
        }
        _.each(items, function (item) {
            var filtered = [];
            if (!_.isUndefined(item.childs) && !_.isNull(item.childs) && !_.isEmpty(item.childs)) {
                filtered = _.union(filtered, checkChilds(item.childs));
            }
            if (!_.isUndefined(item.groups) && !_.isNull(item.groups) && !_.isEmpty(item.groups)) {
                filtered = _.union(filtered, checkGroups(item.groups));
            }
            if (!_.isUndefined(item.types) && !_.isNull(item.types) && !_.isEmpty(item.types)) {
                filtered = _.union(filtered, item.types);
            }
            filtered = _.sortBy(_.uniq(filtered, function (item) {
                return item.ID;
            }), function( item ) {
                if(item.names != undefined && $rootScope.currentLang != undefined) {
                    return item.names[$rootScope.currentLang.code];
                }
                return item.name;
            });
            item.allTypes = filtered;
        });
        return items;

    };
});
