var util = require('util');
console.fs = require('../libs/fsconsole.js');
var Q = require('q');
var mongoose = require('mongoose');

var Controller = require("../controllers/Controller.js");
var Page = require('../models/Page.js').model;
var EditorBitmap = require('../models/EditorBitmap.js').model;
var AdminProject = require('../models/AdminProject.js').model;
var View = require('../models/View.js').model;

function PageController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;
    //AdminProjectController.super_.call(this);
    this.name = "PageController";
    this.socketName = "Page";
};

util.inherits(PageController, Controller);

PageController.prototype.addEditorBitmap = function() {
	var socket = this.socket;
	var socketName = socketName;
	socket.on(socketName+'.addEditorBitmap', function(data) {
		pageID = data.pageID;
		delete data.pageID;
		var newEditorBitmap = new EditorBitmap(data);
		newEditorBitmap.save();
		var existPage = new Page({ _id: pageID });
		existPage.find( function(err, pa) {
			pa.EditorBitmaps.push(newEditorBitmap);
			pa.save();
		});
		// Tu nie ma widoku io.to('View:'+);
		io.sockets.emit( socketName+'.addedEditorBitmap', newEditorBitmap );
	});
};

PageController.prototype.get = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.get', function(data) {
		var pageID = data.pageID;

		Page.findById(pageID).deepPopulate('ProposedTemplate UsedImages EditorBitmaps').exec(function(err, page){
			if(err){
				console.fs(err);
			}
			socket.emit(socketName+'.get', page);
		});
	});
};

PageController.prototype._getAdminProject = function( viewID ) {

	var def = Q.defer();

	//console.fs( viewID );

	console.fs( 'this.Views.indexOf('+ viewID +') != -1' );

	AdminProject.findOne( {$where : 'this.Views.indexOf("'+ viewID +'") != -1'}, function( err, _ap ) {
		
		if( err ){

			console.fs( err );
			def.reject( err );

		} else {
			def.resolve( _ap );
		}

	}).populate('Views');

	return def.promise;

};

PageController.prototype.add = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	var _this = this;
	socket.on(socketName+'.add', function(data) {

		viewID = data.viewID;
		delete data.viewID;
		var newPage = new Page(data);
		newPage.save( function(err, savedPage){
			var existView = new View({ _id: viewID });
			existView.findOne( function(err, vi) {
				if(err || vi === null){
					console.fs(err);
				} else {
					vi.Pages.push(newPage);
					vi.save( function(err, savedView) {
						if(err){
							console.fs(err);
						}

						console.fs( viewID );
						//_this._getAdminProject( viewID ).then( function( _adminProject ) {

							//console.fs('Dodanie strony: ');
							//console.fs( _adminProject );

							//io.to('AdminProject:' + _adminProject._id ).emit( socketName+'.added', savedPage );
							socket.emit( socketName+'.added', savedPage );

						//});
						
					});
				}
			});
		});
		
	});
};

PageController.prototype.remove = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	var _this = this;

	socket.on(socketName+'.remove', function( data ) {



		console.fs('Page remove!');
		console.fs( data );


		Page.findOne({_id : data.pageID}, function(err, pa) {
			if( err || pa === null ){
				io.sockets.emit( socketName+'.error', 'Nie ma strony!' );
			} else {
				pa.remove( function(err, removed){
					if(err){
						console.fs(err);
					}
					//_this._getAdminProject( data.viewID ).then( function( _adminProject ) {

						//console.fs('Remove page');
						//console.fs( _adminProject );

						//io.to('AdminProject:' + _adminProject._id ).emit( socketName+'.remove', data.viewID );
						socket.emit( socketName+'.remove', data.viewID );

					//});
				});
			}
		});

	});
};

PageController.prototype.update = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.update', function(data) {
		
		console.fs( data );
		console.fs('updates');

		Page.findOne({ _id: data.pageID }, function (err, _page){

			if(err){

				console.fs(err);

			} else {

				_page.vacancy = data.toUpdate.vacancy;
				_page.spread = data.toUpdate.spread;
				_page.pageValue = parseInt(data.toUpdate.pageValue);
				_page.save( function(err, saved) {

					if(err){

						console.fs(err);

					} else {

						io.sockets.emit( socketName+'.update', saved );

					}

				});

			}

		});

	});
	
};

PageController.prototype.savePosition = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.savePosition', function(data) {
		
		Page.findOne({ _id: data.pageID }, function (err, _page){
			if(err){
				console.fs(err);
			} else {

				if( _page !== null ){

					_page.x = data.x;
					_page.y = data.y;
					_page.save( function(err, saved) {
						if(err){
							console.fs(err);
						} else {
							io.sockets.emit( socketName+'.savePosition', saved );
						}
					});

				} else {

				}

				
			}
		});
	});
};

PageController.prototype.saveRotation = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.saveRotation', function(data) {
		//console.fs('--==--=-=-=-==-=-=-=- PAGE UPDATE --=-=-=-=-==-=-=---==-=-');
		//console.fs(data);
		Page.findOne({ _id: data.pageID }, function (err, _page){
			if(err){
				console.fs(err);
			} else {
				_page.rotation = data.rotation;
				_page.save( function(err, saved) {
					if(err){
						console.fs(err);
					} else {
						io.sockets.emit( socketName+'.saveRotation', saved );
					}
				});
			}
		});
	});
};

module.exports = PageController;