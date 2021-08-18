;(function (window, angular, undefined) {

    angular.module('angular-api-collection', [])

        .provider('ApiCollection', function () {

            this.$get = ['$http', '$q', 'ApiCollectionPagination', 'ApiCollectionController', function ($http, $q, ApiCollectionPagination, ApiCollectionController) {

                var ApiCollection = function (collection, config) {
                    this.collection = collection;

                    config = config || {};

                    this.config = _.extend({
                        onSuccess: function () {
                        }
                    }, config);

                    var defaultParams = {
                        limit: 10,
                        offset: 0
                    };

                    this.params = _.extend(defaultParams, config.params);

                    if (!!!config.currentPage) {
                        this.currentPage = 1;
                    }

                };

                ApiCollection.prototype = _.extend(ApiCollection.prototype, ApiCollectionController, ApiCollectionPagination);

                return ApiCollection;
            }];

        })

        .factory('ApiCollectionController', function ($http, $q, CacheService) {

            var CollectionCtrl = {};

            var cacheResolve = new CacheService(this.collection);

            CollectionCtrl.get = function (config) {
                var def = $q.defer();

                var promises = [];
                var _this = this;

                config = config || {};

                // ustawiamy parametry
                this.params = _.extend(this.params, config.params);

                var collectionUrl = this.buildUrl();
                // console.log("collectionUrl", collectionUrl);

                promises.push(cacheResolve.get(collectionUrl, config));

                if (this.config.count) {
                    promises.push(cacheResolve.get(this.buildUrl(this.config.count), config));
                }

                $q.all(promises).then(function (data) {

                    var response = data[0];

                    if (data[1]) {
                        var count = data[1].count;
                        response.count = count;
                        _this.setTotalItems(count);
                    }

                    def.resolve(response);

                    _this.config.onSuccess(response);

                });

                return def.promise;
            };

            CollectionCtrl.clearCache = function () {
                cacheResolve.removeAll();
                this.get();
            };

            // CollectionCtrl.getBaseUrl = function(){
            //   return this.baseUrl;
            // }

            CollectionCtrl.setRows = function (rows) {
                this.setParam('limit', rows);
                this.setParam('offset', 0);
                this.currentPage = 1;
                this.get();
            };

            CollectionCtrl.setParam = function (prop, val) {
                this.params[prop] = val;

                if (_.isEmpty(val + '')) {
                    delete this.params[prop];
                }

                return this;
            };

            CollectionCtrl.getParam = function (prop) {
                return this.params[prop];
            };

            CollectionCtrl.buildUrl = function (url) {
                var collection = this.collection;
                if (url) {
                    collection = url;
                }

                var url = collection;

                var params = angular.copy(this.params);

                _.each(params, function (item, idx) {

                    if (_.isEmpty(item + '')) {
                        delete params[idx];
                    }
                });

                var qs = $.param(params);
                if (qs) {
                    url += '?' + qs;
                }

                return url;
            };

            return CollectionCtrl;
        })

        .factory('ApiCollectionPagination', function () {

            var PaginationCtrl = {};

            // Limit
            PaginationCtrl.setLimit = function (val) {
                this.setParam('limit', val);
            };

            PaginationCtrl.getLimit = function () {
                return this.getParam('limit');
            };

            PaginationCtrl.setPerPage = function (perPage) {
                this.setLimit(perPage);
            };

            PaginationCtrl.setOffset = function (val) {
                this.setParam('offset', val);
            };

            PaginationCtrl.getOffset = function () {
                return this.getParam('offset');
            };

            PaginationCtrl.getTotalItems = function () {
                return this.totalItems;
            };

            PaginationCtrl.setTotalItems = function (totalItems) {
                this.totalItems = totalItems;
                this.calculateTotalPages();
            };

            PaginationCtrl.setPage = function (page) {
                this.currentPage = page;

                var offset = ( this.currentPage - 1 ) * this.getLimit();

                this.setOffset(offset);
            };

            PaginationCtrl.setPrevPage = function () {
                if (this.hasPrevPage()) {
                    this.setPage(this.currentPage - 1);
                }
            };

            PaginationCtrl.setNextPage = function () {
                if (this.hasNextPage()) {
                    this.setPage(this.currentPage + 1);
                }
            };

            PaginationCtrl.calculateTotalPages = function () {
                this.totalPages = Math.ceil(this.totalItems / this.getLimit());
            };

            PaginationCtrl.getTotalPages = function () {
                return this.totalPages;
            };

            PaginationCtrl.getData = function () {
                return {
                    limit: this.params.limit,
                    offset: this.params.offset,
                    totalItems: this.totalItems,
                    totalPages: this.totalPages,
                    current: this.currentPage,
                    setNextPage: this.setNextPage,
                    setPrevPage: this.setPrevPage
                }
            };

            return PaginationCtrl;
        });

})(window, window.angular);