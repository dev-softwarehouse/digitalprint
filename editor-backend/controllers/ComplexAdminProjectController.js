var util = require('util');
console.fs = require('../libs/fsconsole.js');

var _ = require('underscore');
var Q = require('q');


var Controller = require("../controllers/Controller.js");
var ComplexAdminProject = require('../models/ComplexAdminProject.js').model;
var ComplexProductType = require('../models/ComplexProductType.js').model;
var ComplexView = require('../models/ComplexView.js').model;
var GroupLayer = require('../models/GroupLayer.js').model;
var FormatView = require('../models/FormatView.js').model;


//var conf = require('../libs/conf.js');

function ComplexAdminProjectController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "ComplexAdminProjectController";
    this.socketName = "ComplexAdminProject";
};

util.inherits(ComplexAdminProjectController, Controller);

ComplexAdminProjectController.prototype.getAll = function() {
	var socketName =  this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.getAll', function(data) {
		var response = {};

		ComplexProductType.findOne({typeID: data.typeID}, function(err, _complexProductType){
			if(err){
				console.fs(err);
			} else {
				response.status = 'ok';
				if(_complexProductType.ComplexAdminProjects === null){

					response.items = [];
					socket.emit( socketName+'.getAll', response );
				} else {
					response.items = _complexProductType.ComplexAdminProjects;
					socket.emit( socketName+'.getAll', response );
				}
			}
		}).populate('ComplexAdminProjects');
	});
};

ComplexAdminProjectController.prototype.add = function() {
	var socketName =  this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.add', function(data) {

		var response = {};
		ComplexProductType.findOne({typeID: data.typeID}, function(err, _complexProductType){

			if(_complexProductType === undefined || _complexProductType === null){
				response.status = 'error';
				response.msg = "Nie ma takiego ComplexProductType.";
				io.sockets.emit( socketName+'.add', response );
				return;
			}
			var newComplexAdminProject = new ComplexAdminProject({name: data.name});
			newComplexAdminProject.save( function(err, saved){
				if(err){
					console.fs(err);
					response.status = 'error';
					response.msg = err;
					io.sockets.emit( socketName+'.add', response );
				} else {
					_complexProductType.ComplexAdminProjects.push(saved);
					_complexProductType.save( function(err, saved2) {
						if( err ){

							console.fs(err);
							response.status = 'error';
							response.msg = err;
							io.sockets.emit( socketName+'.add', response );
						} else {

							response.status = 'ok';
							response.items = _complexProductType.ComplexAdminProjects;
							io.sockets.emit( socketName+'.add', response );
						}
					});
				}
			});
		}).populate('ComplexAdminProjects');

	});
};

ComplexAdminProjectController.prototype.load = function() {
	var socketName =  this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.load', function(data) {

		var response = {};

		ComplexAdminProject.findOne({'_id': data.complexAdminProjectID}, function(err, _complexAdminProject) {

			if(err){
				response.status = 'error';
				response.msg = err;
				io.to('ComplexAdminProject:'+data.complexAdminProjectID).emit( socketName+'.load', response );
				return;
			}
			if( _complexAdminProject === null ){
				response.status = 'error';
				response.msg = "Empty";
				io.to('ComplexAdminProject:'+data.complexAdminProjectID).emit( socketName+'.load', response );
				return;
			}
			response.status = 'ok';
			response.item = _complexAdminProject;
			io.to('ComplexAdminProject:'+data.complexAdminProjectID).emit( socketName+'.load', response );
		}).populate('ComplexViews');
	});
};

ComplexAdminProjectController.prototype.addComplexView = function() {
	var socketName =  this.socketName;
	var socket = this.socket;

	function addFormatView( groupLayer, formatView, typeID, order ){
		var def = Q.defer();

		var newFormatView = new FormatView( {'order': order, 'typeID': typeID, 'formatID':formatView.ID  } );

		newFormatView.save( function(err, saved){
			if(err){
				console.fs(err);
				def.reject(err);
			} else {
				def.resolve(saved);
			}
		});

		return def.promise;
	};

	function addGroupLayer( complexAdminProject, groupLayer, order ){
		var def = Q.defer();

		var newGroupLayer = new GroupLayer({'order': order, 'name':groupLayer.name,'complexGroupID': groupLayer.ID });

		newGroupLayer.save( function(err, saved){

			if(err){
				console.fs(err);
				def.reject(err);
			} else {

				if( saved.FormatViews === undefined ){
					saved.FormatViews = [];
				}

				function smallPromise(counter){

					if( counter === 0 ){
						console.fs('Promise 2' + counter);
						complexAdminProject.GroupLayers.push(saved);
						complexAdminProject.save( function(err, saved2){
							if(err){
								console.fs(err);
								def.reject(err);
							} else {

								def.resolve(saved);
							}
						});
					}
				}

				var counter = 0;
				smallPromise(counter);
				
			}
		});

		return def.promise;
	};

	function getAdminProjectComplex( ID ) {
		def = Q.defer();
		ComplexAdminProject.findOne({_id: ID}, function(err, _complexAdminProject){
			if(err){
				console.fs(err);
			}
			ComplexAdminProject.deepPopulate(_complexAdminProject, 'ComplexViews ComplexViews.GroupLayers ComplexViews.GroupLayers.FormatViews', function (err) {
				var editorBitmaps = [];
				if( err ){
					console.fs(err);
					def.reject(err);
				}
				if( _complexAdminProject === null ){
					def.reject("Nie ma ComplexAdminProject");
				}
				def.resolve( _complexAdminProject );
			});
			
		}).deepPopulate('ComplexViews ComplexViews.GroupLayers ComplexViews.GroupLayers.FormatViews');
		return def.promise;
	};

	socket.on(socketName+'.addComplexView', function(data) {

		var response = {};
		
		var newComplexView = new ComplexView( {'order': data.order, 'name': data.name} );

		newComplexView.save( function(err, saved) {
			if(err){
				console.fs(err);
				response.status = 'error';
				response.msg = err;
				io.to('ComplexAdminProject:'+data.complexAdminProjectID).emit( socketName+'.addComplexView', response );
			} else {
				ComplexAdminProject.findOne({'_id': data.complexAdminProjectID}, function(err, _complexAdminProject) {
					if(err){
						console.fs(err);
						response.status = 'error';
						response.msg = err;
						io.to('ComplexAdminProject:'+data.complexAdminProjectID).emit( socketName+'.addComplexView', response );
					} else {
						_complexAdminProject.ComplexViews.push(saved);
						_complexAdminProject.save( function( err, saved2 ) {
							if(err){
								console.fs(err);
							} else {

								if( saved2.GroupLayers === undefined ){
									saved2.GroupLayers = [];
								}

								function smallPromise( counter ){

									if( counter === 0 ){

										response.status = 'ok';

										var apRoster = io.sockets.adapter.rooms['ComplexAdminProject:'+data.complexAdminProjectID];

		                            	var apc = getAdminProjectComplex( data.complexAdminProjectID );
		                            	apc.then(function(item){

		                            		response.item = item;

		                            		io.to('ComplexAdminProject:'+data.complexAdminProjectID).emit( socketName+'.addComplexView', response );
		                            	});
									}
								}

								var counter = 0;
								
								if( data.groupLayers.length > 0 ){
									counter = data.groupLayers.length;
									for( var i=0;i<data.groupLayers.length;i++ ){

										var agl = addGroupLayer(saved2, data.groupLayers[i], i);
										agl.then( function( savedGroupLayer ) {
											saved.GroupLayers.push( savedGroupLayer );

											saved.save( function(err, saved2) {
												if(err){
													console.fs(err);
												} else {
													console.fs('Saved2');
													counter--;
													smallPromise(counter);
												}
											});
										}).fail(function (error) {
											console.fs(error);
										});
										
									}

								} else {
									response.status = 'error';
									response.msg = 'Brak groupLayers';

									io.to('ComplexAdminProject:'+data.complexAdminProjectID).emit( socketName+'.addComplexView', response );
								}

								
							}
						});
					}
				});
			}
		});
	});
};



module.exports = ComplexAdminProjectController;