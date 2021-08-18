// angular.module('angular-api-collection')
//   .service('ApiPagination', function(){

//     var ApiPagination = function(config){
//       this.config = config;
//       this.currentPage;
//     }

//     var proto = {};

//     proto.getCurrentPage = function(){
//       return this.currentPage;
//     };

//     proto.setPage = function(num){
//       this.currentPage = num;
//     };

//     proto.hasPrevPage = function(){
//       return this.currentPage != 1;
//     };

//     proto.hasNextPage = function(){
//       return this.currentPage == this.totalPages;
//     };

//     proto.setPrevPage = function(){
//       if(this.hasPrevPage()){
//         this.setPage(this.currentPage - 1);
//       }
//     };

//     proto.setNextPage = function(){
//       if(this.hasNextPage()){
//         this.setPage(this.currentPage + 1);
//       }
//     };

//     proto.getTotalItems = function(){
//       return this.totalItems;
//     };

//     proto.setTotalItems = function(total){
//       this.totalItems = total;
//     };

//     proto.getTotalPages = function(){
//       return Math.ceil(this.totalItems || 0 / this.perPage);
//     }

//     proto.haveToPaginate = function(){
//       if(!!! this.totalItems) return undefined;
//       return !! this.totalItems < this.perPage;
//     };

//     proto.setPerPage = function(perPage){
//       ApiPagination.prototype.setLimit.call(this, perPage);
//     }

//     proto.getPerPage = function(){
//       return this.perPage;
//     }

//     proto.getLimit = function(){
//       return this.currentLimit;
//     }

//     proto.setLimit = function(limit){
//       this.currentLimit = limit;
//     }

//     proto.limit = function(limit){
//       ApiPagination.prototype.setLimit.call(this, limit);
//       return this;
//     }

//     proto.getOffset = function(){
//       return this.currentOffset;
//     }

//     proto.setOffset = function(offset){
//       this.currentOffset = offset;
//     }

//     proto.offset = function(offset){
//       ApiPagination.prototype.setOffset.call(this, offset);
//       return true;
//     }

//     proto.getData = function(){
//       return {
//         limit: this.limit,
//         offset: this.offset,
//         perPage: this.perPage,
//         haveToPaginate: this.haveToPaginate(),
//         hasPrevPage: this.hasPrevPage(),
//         hasNextPage: this.hasNextPage(),
//         totalItems: this.totalItems,
//         totalPages: this.totalPages,
//         current: this.currentPage,
//         setNextPage: this.setNextPage,
//         setPrevPage: this.setPrevPage
//       }
//     }

//     ApiPagination.prototype = proto;

//     return ApiPagination;
//   });
