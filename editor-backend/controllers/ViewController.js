var util = require('util');
console.fs = require('../libs/fsconsole.js');
var Q = require('q');
var _ = require('underscore');


var Controller = require("../controllers/Controller.js");
var View = require('../models/View.js').model;
var EditorBitmap = require('../models/EditorBitmap.js').model;
var EditorText = require('../models/EditorText.js').model;
var ProjectImage = require('../models/ProjectImage.js').model;
var AdminProject = require('../models/AdminProject.js').model;
var Format = require('../models/Format.js').model;
var EditorTextController = require('../controllers/EditorTextController.js');

var generatorUID = require('../libs/generator.js');
var arraydiff = require('../libs/arraydiff.js');
//var Generator = generator.Generator;

function ViewController( controller ) {
	//console.fs(generator());
	this.socket = controller.socket;
	this.io = controller.io;
    //AdminProjectController.super_.call(this);
    this.name = "ViewController";
    this.socketName = "View";
};

util.inherits(ViewController, Controller);

ViewController.prototype.remove = function() {
	this.socket.on(this.socketName+'.removeView', function(ID) {
		var actView = new View({ _id: ID });
		
		actView.findOne( function(err, vi) {
			if( err || vi === null ){
				io.sockets.emit( this.socketName+'.error', 'Nie ma widoku!' );
			} else {
				vi.remove(function(err, removed){
					if(err){
						console.fs(err);
					} else {
						io.sockets.emit( this.socketName+'.removed', ID );
						//io.to('View:'+ID).emit( this.socketName+'.removed', ID );
					}
				});
			}
		});
	});
};

ViewController.prototype.add = function() {
	//console.fs(this.getAdminProject(""));
	var socketName = this.socketName;
	this.socket.on(socketName+'.add', function(data) {
		var newView = new View({ name: data.name, 'order': data.order });
		newView.save( function(err, savedView) {
			if(err){
				console.fs(err);
			}
			Format.findOne({_id: data.formatID}, function(err, f) {
				//console.log(newAdminProject);
				if( f.Views === null ){
					console.fs('Brak widoków');
					return;
				}
				f.Views.push(savedView);
				f.save(function(err, saved){
					if(err){
						console.fs(err);
					} else {

						Format.findOne({_id: data.formatID}, function(err, ft) {
							if(err){
								console.fs(err);
							}
							if( ft !== undefined && ft !== null){
								if(ft.Views !== undefined && ft.Views !== null ){
									//console.fs(ft.Views);
									io.sockets.emit( socketName+'.added', ft.Views );
									//io.to('View:'+savedView._id).emit( socketName+'.added', ft.Views );
								}
							}
						}).populate('Views');
					}
				});
			});
		});
		
	});
};

ViewController.prototype.change = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.changeView', function(data) {
		var viewID = data.viewID;
		//console.log(data);
		var existView = new View({_id: viewID});
		existView.findOne(function(err, vi){
			View.deepPopulate(vi,'Pages EditorBitmaps EditorBitmaps.ProjectImage', function (err) {
  				if(err && vi !== null){
					console.fs(err);
				} else {
					socket.emit(socketName+'.changeView', vi);
				}
  			});
		});
	});
};

ViewController.prototype.get = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.get', function(data) {

		var evtID = data.evtID;

		function checkOptions( bitmaps, ids ){
			
			var matchBitmap = [];
			var match = false;
			//var bestMatch = 0;
			
			for( var i=0; i < ids.length; i++ ){

				ids[i] = parseInt( ids[i]);

			}

			if( bitmaps !== undefined && bitmaps.length > 0 ){

				for( var ed=0;ed<bitmaps.length;ed++){

					var objOptions = bitmaps[ed].ObjectOptions;
					var matchArr = [];

					if( objOptions !== undefined && objOptions.length > 0 ){
						for(var i=0;i<objOptions.length;i++){
							//console.fs( objOptions[i] );

							if(objOptions[i].ids !== undefined && objOptions[i].ids.length > 0){
								// @TODO TUTAJ RACZEJ NIE MA TABLICY TRZEBA SPARSOWAĆ
								if( objOptions[i].ids.length <= ids.length ) {
									
									var index = 0;
									for( var vi=0;vi<objOptions[i].ids.length;vi++ ){
										
										//console.fs( objOptions[i].ids[vi] );
										if( ids.indexOf( objOptions[i].ids[vi] ) >= 0  ){
											index++;
										}

									}

									//console.fs( index );
									if( index === objOptions[i].ids.length && objOptions[i].EditorBitmap ){
										matchArr.push(objOptions[i]);
									}

								}

							}
							
						}

						var bestObject = matchArr[0] || null;

						for (var i = 1; i < matchArr.length; i++) {
							if( bestObject.ids.length < matchArr[i].ids.length ){
								bestObject = matchArr[i];
							}
						};

						//console.fs('opcje: ');
						//console.fs( ids );
						//console.fs('bestObject: ');
						//console.fs(bestObject);

						//console.fs('jest:  ');
						//console.fs( bestObject.EditorBitmap );
						if( bestObject !== null ){
							if( bestObject.EditorBitmap !== undefined && bestObject.EditorBitmap !== null ){
								bitmaps[ed] = bestObject.EditorBitmap;
								//console.fs( 'Podmieniane opcje: ' );
								//console.fs( bitmaps[ed] );
								match = true;
							}
						}

					}
				}
			}
			var res = {'bitmaps': bitmaps, 'match': match};
			return res;
		};
		
		var ids = data.options;
		var viewID = data.viewID;

		View.findOne({_id: viewID}, function(err, view) {
			if(err){
				console.fs(err);
			}
			View.deepPopulate(view,'Pages EditorTexts EditorBitmaps EditorBitmaps.ProjectImage EditorBitmaps.ObjectOptions EditorBitmaps.ObjectOptions.EditorBitmap EditorBitmaps.ObjectOptions.EditorBitmap.ProjectImage', function (err) {
				if(err){
					console.fs(err);
				}


				if( view === null ){

					return;
				}

				if( !view.EditorBitmaps ){
					console.fs( 'NIe ma bitmap: ' );
					return;
				}
				//console.fs('TE BITMAPY <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
				//console.fs(view.EditorBitmaps);
				//
				var copyBitmaps = _.clone( view.EditorBitmaps );
				//console.fs( ids );
				var copyOptions = _.clone( ids );
				
				var result = checkOptions( copyBitmaps, copyOptions );

				if( result !== undefined && result.match === true ){

					view.EditorBitmaps = result.bitmaps;
				}

				if( view.EditorBitmaps === result.bitmaps ){

				}

				socket.emit(socketName+'.get', { view, evtID });
			});
		});
	});
};

ViewController.prototype.moveObjects = function() {
	var socketName = this.socketName;
	var socket = this.socket;

	function dynamicSort(property) {
	    var sortOrder = 1;
	    if(property[0] === "-") {
	        sortOrder = -1;
	        property = property.substr(1);
	    }
	    return function (a,b) {
	        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
	        return result * sortOrder;
	    }
	}

	socket.on(socketName+'.moveObjects', function(data) {
		// zmieniamy order obiektów w widoku
		// obiekty które możemy zmieniać

		//var orderList = [];
		var listTypes=[];
		var editorBitmapsIds=[];
		var editorTextsIds = [];
		for(var objectID in data.objectsInfo ){

			//listTypes[data.objectsInfo[i].type].push(data.objectsInfo[i]);
			if( data.objectsInfo[objectID].type === 'EditorBitmap' ){
				editorBitmapsIds.push(objectID);
			}
			if( data.objectsInfo[objectID].type === 'EditorText' ){
				editorTextsIds.push(objectID);
			}
		}

		function saveEditorBitmap( editorBitmapsIds ){
			var def = Q.defer();

			function counter( len, count ){
				if( len === count ){
					return true;
				} else {
					return false;
				}
			}

			var count = 0;
			var finish = false;
			if( editorBitmapsIds.length > 0 ){
				EditorBitmap.find({ _id: { $in: editorBitmapsIds }}, function(err, _editorBitmaps){

					for(var i=0;i<_editorBitmaps.length;i++){
						var _editorBitmap = _editorBitmaps[i];
							if(err){
							console.fs(err);
							def.reject(err);
						}
						if(_editorBitmap === null){
							count++;
							var finish = counter(editorBitmapsIds.length, count);
							if( finish ){
								def.resolve({'saved': count});
							}
						}
						_editorBitmap.order = data.objectsInfo[_editorBitmap._id].order;
						_editorBitmap.save(function(err, saved){

							if(err){

								console.fs(err);
								def.reject(err);

							} else {

								count++;
		
								var finish = counter(editorBitmapsIds.length, count);

								if( finish ){

									def.resolve({'saved': count});

								}

							}

						});
					}
				});
			} else {
				def.resolve({'saved': 0});
			}

			return def.promise;
		};

		function saveEditorTexts(editorTextsIds) {
			
			var def = Q.defer();

			function counter( len, count ){
				if( len == count ){
					return true;
				} else {
					return false;
				}
			}

			var count = 0;
			var finish = false;
			if( editorTextsIds.length > 0 ){
				EditorBitmap.find({ _id: { $in: editorTextsIds }}, function(err, _editorTexts){

					for(var i=0;i<_editorTexts.length;i++){
						var _editorText = _editorTexts[i];
							if(err){
							console.fs(err);
							//def.reject(err);
						}
						if(_editorText === null){
							count++;
							var finish = counter(editorTextsIds.length, count);
							if( finish ){
								def.resolve({'saved': count});
							}
						}
						_editorText.order = data.objectsInfo[_editorText._id].order;
						_editorText.save(function(err, saved){
							if(err){
								console.fs(err);
								//def.reject(err);
							} else {
								count++;

								var finish = counter(editorTextsIds.length, count);
								if( finish ){
									def.resolve({'saved': count});
								}
							}
						});
					}
				});
			} else {
				def.resolve({'saved': 0});
			}

			return def.promise;
			
		}

		function saveObjects(editorBitmapsIds, editorTextsIds){
			var def = Q.defer();

			function counter( len, count ){
				if( len == count ){
					return true;
				} else {
					return false;
				}
			}

			var toSaved = 2;
			var allSaved = 0;

			var p1 = saveEditorBitmap( editorBitmapsIds );
			p1.then(function (saved){
				//console.log('_-________-----__--_----___--Skończony zapis: ');
				allSaved++;
				var checkCounter = counter(toSaved, allSaved);
				if(checkCounter){
					def.resolve(true);
				} 
			});

			var p2 = saveEditorTexts( editorTextsIds );
			p2.then(function (saved){
				//console.log('_-________-----__--_----___--Skończony zapis: ');
				allSaved++;
				var checkCounter = counter(toSaved, allSaved);
				if(checkCounter){
					def.resolve(true);
				} 
			});

			return def.promise;
		}
		
		var p3 = saveObjects(editorBitmapsIds, editorTextsIds);
		p3.then(function (saved){
			console.log('_-________-----__--_----___--Skończony zapis: ');
			data['status'] = saved;

			io.sockets.emit(socketName+'.moveObjects', data);
		});

	});
};



ViewController.prototype._addNewText = function( viewID, text ){

	var socketName = this.socketName;
	var socket = this.socket;

	EditorTextController._add( text, function( createdText ){

		View.findOne({ _id: viewID, }, function( err, view ){

			if( err ){

				console.fs( err );

			}else {

				view.EditorTexts.push( createdText );
				view.save( function( err, view ){

					if( err ){

						console.fs( err );

					}
					else {

						var data = {

							viewID : viewID,
							text : createdText

						};

						io.sockets.emit( socketName+'.addNewText', data );

					}

				});

			}

		});

	});

};

ViewController.prototype._removeText = function( viewID, editorTextID ){

	var socketName = this.socketName;
	var socket = this.socket;
	var _this = this;

	EditorTextController._remove( editorTextID, function( data ){


		var dataToSend = { editorTextID : editorTextID };

		socket.emit( socketName+'.removeText', dataToSend );

	});

	//EditorTextController._removeMe2();

};


ViewController.prototype.addNewText = function(){

	var socketName = this.socketName;
	var socket = this.socket;
	var _this = this;
	socket.on(socketName+'.addNewText', function(data){


		_this._addNewText( data.viewID, data.text );

	});

};

ViewController.prototype.removeText = function(){

	var socketName = this.socketName;
	var socket = this.socket;
	var _this = this;

	socket.on(socketName+'.removeText', function( data ) {

		_this._removeText( data.viewID, data.editorTextID );

	});

};


ViewController.prototype.update = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.update', function(data) {

		View.findOne({ _id: data.viewID }, function (err, _view){
			if(err){
				console.fs(err);
			} else {
				var hasRep = _.has(data.toUpdate, 'repeatable');
				if( hasRep ){
					_view.repeatable = data.toUpdate.repeatable;
				}
				_view.save( function(err, saved) {
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

module.exports = ViewController;