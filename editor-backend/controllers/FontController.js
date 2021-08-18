var util = require('util'),
	path = require('path'),
	fs = require('fs');
console.fs = require('../libs/fsconsole.js');
var mongoose = require('mongoose');
var Q = require('q');

//var app = require('../app.js');
var conf = require('../confs/main.js');
var mainConf = require('../libs/mainConf.js');

var _ = require('underscore');

//var Theme = require('../models/Theme.js').model;

var Controller = require("../controllers/Controller.js");
var Font = require('../models/Font.js').model;
var FontType = require('../models/FontType.js').model;

function FontController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "FontController";
    this.socketName = "Font";
    this.destinationUrl = conf.staticPath + '/fonts/';
    this.destination = conf.staticDir + 'fonts/';
    this.ext = 'ttf';;
}

util.inherits(FontController, Controller);

FontController.prototype._removeFontType = function( ID ) {

	var _this = this;

	var def = Q.defer();

	FontType.findOne({ _id: adminProjectID }, function ( err, _fontType ){

		_fontType.remove( function( err, removed ) {

			if( err ){
				console.fs(err);
				def.reject(err);
			} else {
				var folderDest = _this.destination + _fontType.folderNumber + '/';
				var destination = folderDest + _fontType._id + '.' + _this.ext;

				fs.unlink(destination, function (err) {
					if (err) {

						console.fs(err);
						def.reject( err );

					} else {

						def.resolve(removed);

					}
				});
			}

		});

	});

	return def.promise;

};

FontController.prototype._remove = function( ID ) {

	var _this = this;

	var def = Q.defer();
	var counter;

	function smallPromise(counter){
		if( counter === 0 ){
			def.resolve(true);
		}
	};

	Font.findOne({ _id: adminProjectID }, function (err, _font){

		if(_font.FontTypes !== undefined && _font.FontTypes.length > 0){

			for (var i = 0; i < _font.FontTypes.length; i++) {
				counter=_font.FontTypes.length;

				_this._removeFontType( _font.FontTypes[i] ).then( function( removed ) {

					counter--;
					smallPromise(counter);

				}).fail( function( err ) {

					console.fs( err );
					def.reject( err );

				});

			};

		} else {
			def.resolve(false);
		}

	});

	return def.promise;

};

FontController.prototype._addFile = function( base, dest ) {

	var _this = this;

	var def = Q.defer();

	console.log( base.slice(0,50) );

	var body = base;
	var base64Data = base.replace(/^data:application\/x-font-ttf;base64,/,"");
	base64Data = base64Data.replace(/^data:;base64,/,"");
	var binaryData = new Buffer(base64Data, 'base64').toString('binary');
	console.log( base64Data.slice(0,50) );
	fs.writeFile(dest, binaryData, "binary", function(err) {
		if(err){
			console.fs(err);
			def.reject(err);
		} else {

			console.log('ZAPISALEM CZcionke w :' + dest);
			console.log( );
			def.resolve(true);
		}
	});

	return def.promise;

};

FontController.prototype._addType = function( fontObject ) {

	var def = Q.defer();

	var _this = this;

	var newFontType = new FontType();
	newFontType.name = fontObject.name;
	console.log( fontObject.name );
	FontType.count({}, function(err, counted){

		if( err ){
			console.fs( err );
			def.reject( err );
		}

		var folderNumber = Math.round(counted/100);
		newFontType.folderNumber = folderNumber;

		newFontType.save( function( err, saved ) {
			if( err ){
				console.fs( err );
				def.reject(err);
			}

			newFontType.url = _this.destinationUrl +  folderNumber + '/' + saved._id + '.' + _this.ext;
			var folderDest = _this.destination + folderNumber + '/';
			var destination = folderDest + saved._id + '.' + _this.ext;
			mainConf.mkdir(folderDest);

			_this._addFile( fontObject.base, destination ).then( function( addedFile ) {

				newFontType.save( function( err, saved2 ) {

					//console.fs( 'newFontType: ' );
					//console.fs( saved2 );

					if( err ){
						console.fs( err );
						def.reject(err);
					} else {
						console.log('RESOLVE');
						def.resolve(saved2);
					}
				});

			}).fail( function( err ) {
				console.fs(err);
				def.reject(err);
			});

		});
	});

	return def.promise;

}

FontController.prototype._addMiniature = function(item, base) {

	var _this = this;

	var def = Q.defer();

	var body = base,
	  base64Data = body.replace(/^data:image\/png;base64,/,""),
	  binaryData = new Buffer(base64Data, 'base64').toString('binary');

	var folderDest = _this.destination + 'min/';
	var dest = folderDest + item._id + '.png';
	mainConf.mkdir(folderDest);
	var url = this.destinationUrl + 'min/' + item._id + '.png';

	fs.writeFile(dest, binaryData, "binary", function(err) {
		if(err){
			console.fs(err);
			def.reject(err);
		} else {
			def.resolve(url);
		}
	});

	return def.promise;

};

FontController.prototype._add = function(name, types, base) {

	var def = Q.defer();

	var newFont = new Font();
	newFont.name = name;
	var counter;
	var _this = this;

	function smallPromise(counter, item, toSave ){
		if( counter === 0 ){

			toSave.save( function(err, saved2) {
				if( err ){
					console.fs(err);
					def.reject(err);
				} else {

					def.resolve( saved2 );
				}
			});

		}
	};

	newFont.save( function(err, saved) {
		if( err ){
			console.fs(err);
			def.reject(err);
		} else {

			_this._addMiniature( saved, base ).then( function( url ) {
				saved.miniature = url;

				counter = types.length;

				for (var i = 0; i < types.length; i++) {

					//console.fs( 'addedType' );
					//console.fs( types[i] );

					_this._addType( types[i] ).then( function( addedType ) {

						if( addedType ){
							saved.FontTypes.push(addedType);
							counter--;
							smallPromise(counter, saved, saved);

						}
					});
				};

			});
			//def.resolve(saved);
		}
	})

	return def.promise;

};

FontController.prototype.get = function(){

	var socket = this.socket;
	var socketName = this.socketName;
	var _this = this;

	socket.on(socketName+'.get', function(data) {

		var evtID = data.evtID;

		var fontFamily = data.fontFamily;

		Font.findOne({ name : data.fontFamily}).deepPopulate('FontTypes').exec( function( err, font ){

			if( err || font == null ){

				console.fs( err );

			}
			else {

				var item = {};


					item = {};
					item['FontTypes'] = {}

					if( font.FontTypes.length > 0 ){

						for (var i = 0; i < font.FontTypes.length; i++) {
							console.fs( font.FontTypes[i]['url'] );
							item['FontTypes'][ font.FontTypes[i].name ] = {};
							item['FontTypes'][ font.FontTypes[i].name ]['url'] = font.FontTypes[i]['url'];
							item['FontTypes'][ font.FontTypes[i].name ]['_id'] = font.FontTypes[i]['_id'];
						};
					}
					item['miniature'] = font.miniature;

					var data = {

						fontName : fontFamily,
						fontTypes : item.FontTypes,
						evtID : evtID

					};


				socket.emit( socketName+'.get', data);

			}

		});

	});

};


FontController.prototype._getAll = function() {

	var def = Q.defer();

	Font.find({}, function (err, _fonts){

		if( err ){
			console.fs( err );
			def.reject( err );
		} else {

			Font.deepPopulate(_fonts, 'FontTypes', function (err) {
				if( err ){
					console.fs( err );
					def.reject( err );
				} else {
					if( _fonts === null ){
						def.reject('Brak fontów');
					} else {
						def.resolve(_fonts);
					}

				}
			});

		}

	}).deepPopulate('FontTypes');

	return def.promise;

};

//metody
FontController.prototype.add = function() {
	var socket = this.socket;
	var socketName = this.socketName;
	var _this = this;

	//console.fs('font tu ?');

	socket.on(socketName+'.add', function(data) {

		var keys = _.keys(data);

		//console.fs(data);

		var fontName = keys[0];

		var fonts = [];
		var minBase;
		for(var key in data[fontName]) {
			console.fs(key);
			if( key === 'miniature' ){
				minBase = data[fontName][key];
				continue;
			}
			var objFont = {};
			objFont.name = key;
			objFont.base = data[fontName][key];
			fonts.push(objFont);
			delete objFont;
		};


		_this._add( fontName, fonts, minBase ).then( function( result ) {

			Font.findOne({_id: result._id}, function(err, _font) {

				Font.deepPopulate(_font, 'FontTypes', function (err) {
					//console.fs( _font );
					socket.emit( socketName+'.add', _font);
				});

			}).deepPopulate('FontTypes');

		}).fail( function( err ) {
			console.fs(err);
		});

		//console.fs( fonts );
	});
};


FontController.prototype.remove = function() {
	var socket = this.socket;
	var socketName = this.socketName;
	var _this = this;

	//console.fs('font tu ?');

	socket.on(socketName+'.remove', function(data) {

		_this.remove( data.ID ).then( function( result ) {
			console.fs('FONT ID: '+ data.ID +' REMOVED_______________+++++++++++++++++++++++++++++++++++++++++++++++');
			console.fs(result);
			socket.emit( socketName+'.remove', result);
		}).fail( function( err ) {
			console.fs(err);
		});

		//console.fs( fonts );
	});
};

FontController.prototype.getAll = function(){

	var socket = this.socket;
	var socketName = this.socketName;
	var _this = this;

	socket.on(socketName+'.getAll', function(data) {

		console.fs('ALL FONTS_______________+++++++++++++++++++++++++++++++++++++++++++++++');

		_this._getAll().then( function( result ) {

			var dict = {};
			var item = {};

			//console.fs(result);
			for (var k = 0; k < result.length; k++) {
				item = {};
				item['FontTypes'] = {}
				//item[ result[k].name ] = {};
				//console.fs( result[k].FontTypes.length );
				if( result[k].FontTypes.length > 0 ){

					for (var i = 0; i < result[k].FontTypes.length; i++) {
						console.fs( result[k].FontTypes[i]['url'] );
						item['FontTypes'][ result[k].FontTypes[i].name ] = {};
						item['FontTypes'][ result[k].FontTypes[i].name ]['url'] = result[k].FontTypes[i]['url'];
						item['FontTypes'][ result[k].FontTypes[i].name ]['_id'] = result[k].FontTypes[i]['_id'];
					};
				}
				item['miniature'] = result[k].miniature;
				dict[ result[k].name ] = item;
				//dict[] = item;
			};

			console.fs( dict );

			socket.emit(socketName+'.getAll', dict);

		}).fail( function(err) {

			console.fs(err);

		});

	});


};

module.exports = FontController;