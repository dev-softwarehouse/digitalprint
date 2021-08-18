/**
 * Created by Rafał on 27-05-2017.
 */
angular.module('digitalprint.services')
    .factory('CanvasService', function(){

        var CanvasService = {};
        var canvas;
        var context;
        var stage;
        var bitmap;
        var container;
        var mask;
        var filters = {};

        CanvasService.setCanvas = function(newCanvas){
            canvas = newCanvas;
        };

        CanvasService.setContext = function(newContext){
            context = newContext;
        };

        CanvasService.getCanvas = function(){
            return canvas;
        };

        CanvasService.getContext = function(){
            return context;
        };

        CanvasService.setStage = function(newStage) {
            stage = newStage;
        };

        CanvasService.getStage = function() {
            return stage;
        };

        CanvasService.setBitmap = function(newBitamp) {
            bitmap = newBitamp;
        };

        CanvasService.getBitmap = function() {
            return bitmap;
        };

        CanvasService.setContainer = function(newContainer) {
            container = newContainer;
        };

        CanvasService.getContainer = function() {
            return container;
        };

        CanvasService.setMask = function(newMask) {
            mask = newMask;
        };

        CanvasService.getMask = function() {
            return mask;
        };

        CanvasService.setFilter = function(name, value, sliderValue) {
            filters[name] = {};
            filters[name].value = value;
            if( sliderValue !== undefined ) {
                filters[name].sliderValue = sliderValue;
            }
        };

        CanvasService.updateBitmapFilter = function () {

            bitmap.filters = [];

            _.each(filters, function(one) {
                bitmap.filters.push(one.value);
            });
        };

        CanvasService.getFilter = function(name) {
            return filters[name];
        };

        CanvasService.getFilters = function() {
            return filters;
        };

        return CanvasService;
    });
