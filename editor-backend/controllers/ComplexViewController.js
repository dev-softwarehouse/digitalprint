var util = require('util');
console.fs = require('../libs/fsconsole.js');

var _ = require('underscore');
var Q = require('q');


var Controller = require("../controllers/Controller.js");
var ComplexView = require('../models/ComplexView.js').model;
var GroupLayer = require('../models/GroupLayer.js').model;
var View = require('../models/View.js').model;
var ComplexAdminProject = require('../models/ComplexAdminProject.js').model;
var FormatView = require('../models/FormatView.js').model;


//var conf = require('../libs/conf.js');

function ComplexViewController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;
    //AdminProjectController.super_.call(this);
    this.name = "ComplexViewController";
    this.socketName = "ComplexView";
};

util.inherits(ComplexViewController, Controller);

ComplexViewController.prototype.get = function() {
	
	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.get', function(data) {
		console.fs(data);
		ComplexView.findOne({_id: data.complexViewID}, function(err, _complexView){
			if(err){
				console.fs(err);
			} else {

				ComplexView.deepPopulate(_complexView, 'GroupLayers GroupLayers.FormatViews GroupLayers.FormatViews.Views', function (err,p) {

					socket.emit(socketName+'.get', _complexView);
					if( _complexView.GroupLayers !== undefined ){
						if( _complexView.GroupLayers.length > 0 ){
							for (var i = 0; i < _complexView.GroupLayers.length; i++) {

								if( _complexView.GroupLayers[i].FormatViews !== undefined ){
									if( _complexView.GroupLayers[i].FormatViews.length > 0 ){
										var _formatViews = _complexView.GroupLayers[i].FormatViews;

										for (var j = 0; j < _formatViews.length; j++) {

										};
									}
								}
							};
						}
					}
				});

			}
		}).deepPopulate('GroupLayers GroupLayers.FormatViews GroupLayers.FormatViews.Views');
	});

};

ComplexViewController.prototype.addViewObject = function() {
	var socketName =  this.socketName;
	var socket = this.socket;

	//var data = {"complexGroupID": 16, "FormatViews.formatID": 44};

	function getGroupLayers( complexViewID, complexGroupID ) {

		var def = Q.defer();

		ComplexView.findOne({_id: complexViewID}, function(err, _complexView){

			if(err){
				console.fs(err);
			}
			ComplexView.deepPopulate(_complexView, 'GroupLayers', function (err) {
				
				if( err ){
					console.fs(err);
					def.reject(err);
				} else {

					if( _complexView === null ){
						def.reject('empty');
					}
					if( _complexView.GroupLayers !== undefined && _complexView.GroupLayers !== null && _complexView.GroupLayers.length > 0 ){
						for( var i=0;i<_complexView.GroupLayers.length;i++ ){
							if( _complexView.GroupLayers[i].complexGroupID == complexGroupID ){

								def.resolve( _complexView.GroupLayers[i] );
							}
						}
					}
				}
				
				
			});
			
		}).deepPopulate('GroupLayers');
		
		return def.promise;
	};

	function findComplexAdminProject( complexViewID ){
		var def = Q.defer();

		ComplexAdminProject.findOne( {ComplexViews: complexViewID}, function(err, _cap) {
			
			if( err ){
				def.reject(err);
				console.fs(err);
			} else {
				def.resolve( _cap );	
			}

		});
		return def.promise;
	}

	function getMaxOrder() {
		var def = Q.defer();
		FormatView.findOne({})
		    .sort('-connectID')
		    .limit(1)
		    .exec(function(err, doc){
		    	if( err ){
		    		console.fs(err);
		    		def.reject(err);
		    	} else {
		    		console.fs('doc');
		    		console.fs(doc);
		    		if( doc === null || doc.length === 0 ){
		    			def.resolve(0);
		    		} else {
		    			var max = doc.order;
		    			console.fs( max );
		    			max = Number(max)+1;
		    			def.resolve(max);
		    		}
		        	
		    	}
		    }
		);
		return def.promise;
	}

	socket.on(socketName+'.addViewObject', function(data) {


		getGroupLayers( data.complexViewID , data.layerGroupID ).then( function(_groupLayer) {

			View.findOne({_id: data.viewID}, function(err, _view) {

				if(err){
					console.fs(err);
				} else {
					var formatViewData = {};
					formatViewData.order = getMaxOrder().then(function(newOrder){
						formatViewData.order = newOrder;
						formatViewData.typeID = data.typeID;
						formatViewData.formatID = data.formatID;
						var newFormatView = new FormatView( formatViewData );
						newFormatView.View = _view;

						newFormatView.save(function(err, saved) {
							
							if(err){
								console.fs(err);
							} else {

								_groupLayer.FormatViews.push(saved);

								_groupLayer.save( function(err, saved2){

									if( err ){
										console.fs(err);
									} else {
										findComplexAdminProject( data.complexViewID ).then(function(_complexAdminProject) {
											var response = {status: 'ok'};
											response.item = saved;
											response.groupLayer = _groupLayer;

											io.to('ComplexAdminProject:'+_complexAdminProject._id).emit( socketName+'.addViewObject', response );
										});
									}

									
								});

								
							}
						});
					});
				}
			});
		});
		
	}); 

};


module.exports = ComplexViewController;

