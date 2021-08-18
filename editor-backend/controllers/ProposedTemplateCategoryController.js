var util = require('util');
console.fs = require('../libs/fsconsole.js');
var Q = require('q');

var conf = require('../libs/conf.js');


var Controller = require("../controllers/Controller.js");
var ProposedTemplate = require('../models/ProposedTemplate.js').model;
var ProposedTemplateCategory = require('../models/ProposedTemplateCategory.js').model;

function ProposedTemplateCategoryController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "ProposedTemplateCategoryController";
    this.socketName = "ProposedTemplateCategory";
}

// główny kontroler podpinamy
util.inherits(ProposedTemplateCategoryController, Controller);

ProposedTemplateCategoryController.prototype._add = function(data) {

	//console.fs( data );
	//
	//console.fs( ' TU ' );

	var def = Q.defer();

	var newPTC = new ProposedTemplateCategory();
	newPTC.name = data.name;

	
	console.fs('newPTC');
	console.fs(newPTC);

	newPTC.save( function(err, saved) {
		if( err ){
			console.fs(err);
			def.reject(err);
		} else {
			def.resolve(saved);
		}
	});

	return def.promise;

};

ProposedTemplateCategoryController.prototype._list = function(){
	
	var def = Q.defer();

	ProposedTemplateCategory.find({}, function(err, _ptc){

		if( err ){

			console.fs(err);
			def.reject(err);

		} else {

			def.resolve(_ptc);

		}
	});

	return def.promise;

};

ProposedTemplateCategoryController.prototype.add = function(){
	var socketName = this.socketName;
	var socket = this.socket;
	var _this = this;
	
	//console.fs('TUTUTU');

	socket.on(socketName+'.add', function(data) {

		//console.fs( data );

		_this._add( data ).then( function( saved ) {


			_this._list().then( function( list ) {

				//console.fs( socketName+'.add' );
				//console.fs( list );
				socket.emit( socketName+'.add', list );

			}).fail( function( err ) {
				console.fs( err );
			});

		}).fail( function( err ) {
			console.fs( err );
		});

	});
	
};

ProposedTemplateCategoryController.prototype._remove = function( ID ) {
	
	var def = Q.defer();

	ProposedTemplateCategory.findOne( {_id: ID}, function( err, _ptc ) {
		
		if(err){

			console.fs( err );
			def.reject( err );

		} else {

			_ptc.remove( function(err, removed) {
				
				if( err ){
					console.fs( err );
					def.reject( err );
				} else {
					def.resolve(removed);
				}

			});

		}

	});

	return def.promise;

};

ProposedTemplateCategoryController.prototype.remove = function() {
	
	var socketName = this.socketName;
	var socket = this.socket;
	var _this = this;

	socket.on(this.socketName+'.remove', function(data) {

		_this._remove( data.ID ).then( function(result) {
			socket.emit(socketName+'.remove', result);
		});

	});

};

ProposedTemplateCategoryController.prototype.getAll = function() {
	
	var socketName = this.socketName;
	var socket = this.socket;
	var _this = this;


	socket.on(socketName+'.getAll', function(data) {

		ProposedTemplateCategory.find( {}, function( err, _ptc ) {
			//console.fs( _ptc );
			//console.fs(  );
			socket.emit(socketName+'.getAll', _ptc);
		});

	});
};


module.exports = ProposedTemplateCategoryController;