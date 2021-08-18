var util = require('util'),
	fs = require('fs');
console.fs = require('../libs/fsconsole.js');
var _ = require('underscore');
var Q = require('q');
var mongoose = require('mongoose');
    Schema = mongoose.Schema;

//var app = require('../app.js');
var conf = require('../confs/main.js');

var generatorUID = require('../libs/generator.js');

//var Theme = require('../models/Theme.js').model;


var Controller = require("../controllers/Controller.js");

var ThemePage = require('../models/ThemePage.js').model;
var EditorBitmap = require('../models/EditorBitmap.js').model;
var EditorText = require('../models/EditorText.js').model;
var ProposedTemplate = require('../models/ProposedTemplate.js').model;
var Theme = require('../models/Theme.js').model;

var _modelList = {};
_modelList['EditorBitmap'] = EditorBitmap;
_modelList['EditorText'] = EditorText;

function ThemePageController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "ThemePageController";
    this.socketName = "ThemePage";
}

util.inherits(ThemePageController, Controller);


ThemePageController.clone = function( themePageID ){

	var def = new Q.defer();

	var userThemePage = null;

	ThemePage.findOne({ _id: themePageID }).exec( function( err, themePage ){

		if( err ){

			console.fs( err );

		}else {

			themePage = themePage.toJSON();
			delete themePage._id;
			delete themePage.__v;

			/*
			themePage.foregroundObjects.EditorTexts = [];
			themePage.foregroundObjects.EditorBitmaps = [];
			themePage.backgroundObjects.EditorTexts = [];
			themePage.backgroundObjects.EditorBitmaps = [];
			*/

			userThemePage = new ThemePage( themePage );

			userThemePage.backgroundObjects.EditorTexts = [];
			userThemePage.backgroundObjects.EditorBitmaps = [];
			userThemePage.foregroundObjects.EditorTexts = [];
			userThemePage.foregroundObjects.EditorBitmaps = [];

			var backgroundImagesCloned = false;
			var foregroundImagesCloned = false;
			var backgroundTextsCloned  = false;
			var foregroundTextsCloned  = false;

			function cloneBackgroundsBitmaps(){

				EditorBitmap.find( { _id: { $in: themePage.backgroundObjects.EditorBitmaps }}).exec( function( err, bitmaps ){

					if( err ){

						console.fs( err );

					}else {

						var bitmapsToClone = bitmaps.length;
						var clonedBitmaps = 0;

						for( var i=0; i < bitmaps.length; i++ ){

							var bitmap = bitmaps[i].toJSON();
							delete bitmap._id;
							delete bitmap.__v;
							// chyba musze jeszcze usunac uid i nadac nowe, ale to trzeba sprawdzic

							var newBitmap = new EditorBitmap( bitmap );

							newBitmap.save( function( err, nBitmap ){

								if( err ){

									console.fs( err );

								}else {

									userThemePage.backgroundObjects.EditorBitmaps.push( newBitmap );
									clonedBitmaps++;

									checkDone();

								}

							});

						}

						function checkDone(){

							if( bitmapsToClone == clonedBitmaps ){

								backgroundImagesCloned = true;
								checkDoneAll();

							}

						}

						checkDone();

					}

				});


			};

			function cloneBackgroundsTexts(){

				EditorText.find( { _id: { $in: themePage.backgroundObjects.EditorTexts }}).exec( function( err, texts ){

					if( err ){

						console.fs( err );

					}else {

						var textsToClone = texts.length;
						var clonedTexts = 0;

						for( var i=0; i< texts.length; i++ ){

							var text = texts[i].toJSON();
							delete text._id;
							delete text.__v;

							var newText = new EditorText( text );
							newText.save( function( err, text ){

								if( err ){

									console.fs( err );

								}else {

									userThemePage.backgroundObjects.EditorTexts.push( text );
									clonedTexts++;
									checkDone();

								}

							});

						}

						checkDone();

						function checkDone(){

							if( textsToClone == clonedTexts ){

								backgroundTextsCloned = true;
								checkDoneAll();

							}

						}

					}

				});

			};

			function cloneForegroundsBitmaps(){

				EditorBitmap.find( { _id: { $in: themePage.foregroundObjects.EditorBitmaps }}).exec( function( err, bitmaps ){

					if( err ){

						console.fs( err );

					}else {

						var bitmapsToClone = bitmaps.length;
						var clonedBitmaps = 0;

						for( var i=0; i < bitmaps.length; i++ ){

							var bitmap = bitmaps[i].toJSON();
							delete bitmap._id;
							delete bitmap.__v;
							// chyba musze jeszcze usunac uid i nadac nowe, ale to trzeba sprawdzic

							var newBitmap = new EditorBitmap( bitmap );

							newBitmap.save( function( err, nBitmap ){

								if( err ){

									console.fs( err );

								}else {

									userThemePage.foregroundObjects.EditorBitmaps.push( newBitmap );
									clonedBitmaps++;

									checkDone();

								}

							});

						}

						checkDone();

						function checkDone(){

							if( bitmapsToClone == clonedBitmaps ){

								foregroundImagesCloned = true;
								checkDoneAll();

							}

						}

					}

				});

			};

			function cloneForegroundsTexts(){

				EditorText.find( { _id: { $in: themePage.foregroundObjects.EditorTexts }}).exec( function( err, texts ){

					if( err ){

						console.fs( err );

					}else {


						var textsToClone = texts.length;
						var clonedTexts = 0;

						for( var i=0; i< texts.length; i++ ){

							var text = texts[i].toJSON();
							delete text._id;
							delete text.__v;

							var newText = new EditorText( text );
							newText.save( function( err, text ){

								if( err ){

									console.fs( err );

								}else {

									userThemePage.foregroundObjects.EditorTexts.push( text );
									clonedTexts++;
									checkDone();

								}

							});

						}

						checkDone();

						function checkDone(){

							if( textsToClone == clonedTexts ){

								foregroundTextsCloned = true;
								checkDoneAll();

							}

						}

					}

				});

			};

			cloneBackgroundsBitmaps();
			cloneForegroundsBitmaps();
			cloneBackgroundsTexts();
			cloneForegroundsTexts();

			function checkDoneAll(){

				if( backgroundImagesCloned && foregroundImagesCloned && backgroundTextsCloned && foregroundTextsCloned ){

					userThemePage.save( function( err, saved ){

						if( err ){

							console.fs( err );

						}else {

							def.resolve( saved );

						}

					});

				}

			}

		}



	});

	return def.promise;

};

ThemePageController.prototype.getThemeBackgroundFrames = function(){

	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.getThemeBackgroundFrames', function( data ){

		var evtID = data.evtID;

		Theme.findOne({  ThemePages: data.themePageID }).deepPopulate('backgroundFrames backgroundFrames.ProjectImage').exec(function( err, theme ){

			if( err ){ console.fs( err ); return false; }

			var data = {
				evtID : evtID
			};

			data.backgroundFrames = theme.backgroundFrames;

			socket.emit( socketName + '.getThemeBackgroundFrames', data );
			console.log('poszla odpowiedz:)');

		});


	});

};


ThemePageController.hasTemplateWith = function( themePage, imagesCount, textsCount ){

	// tylko dla gotowego argumentu themepage
	var templates = _.filter( themePage.proposedTemplates, function( template ){

		return ( template.imagesCount == imagesCount && template.textsCount == textsCount );

	});

	return templates.length;

};

ThemePageController._getFonts = function( themePageID ){

	var def = Q.defer();

	ThemePage.findOne({ _id : themePageID }).exec( function( err, themePage ){

		if( err ){

			console.fs( err );
			return false;

		}

		if( themePage.fonts ){


		}else {

			console.log( themePage._id );

			Theme.findOne( { ThemePages : {$in: [ themePage._id ] } } ).deepPopulate('fonts fonts.FontTypes').exec( function( err, theme){

				if( err ){
					console.fs( err);
					return;
				}

				def.resolve( theme.fonts );

			});

		}

	});

	return def.promise;

};

ThemePageController.prototype.getFonts = function(){

	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.getFonts', function( data ){

		var themePageID = data.themePageID;
		var evtID = data.evtID;

		ThemePage.findOne({ _id : themePageID }).exec( function( err, themePage ){

			if( err ){

				console.fs( err );
				return false;

			}

			if( themePage.fonts ){


			}else {

				Theme.findOne( { ThemePages : {$in: [ themePageID ] } } ).deepPopulate('fonts fonts.FontTypes').exec( function( err, theme){

					if( err ){
						console.fs( err);
						reutrn;
					}

					var data = {

						fonts: theme.fonts,
						evtID: evtID

					};

					socket.emit( socketName + '.getFonts', data );


				});

			}

		});

	});

};


ThemePageController.prototype.setDefaultSettings = function(){

	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.setDefaultSettings', function(data){

		ThemePage.findOne( { _id : data.themePageID}, function( err, themePage ){

			if( err ){

				console.fs( err );

			}else {

				themePage.defaultSettings = data.settings;

				themePage.save( function( err, saved ){

					if( err ){

						console.fs( err );

					}else {

						socket.emit( "ThemePage.setDefaultSettings", saved );

					}

				});

			}

		} );

	});

};


ThemePageController.prototype.getSelectedProposedTemplates = function(){

	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.getSelectedProposedTemplates', function(data){

		console.fs( data );
		console.fs('Przyszlo zapytanie o pozycje proponowane _________________________________________________');

		ThemePage.findOne({ _id : data.themePageID })
		.populate({
		  path: 'proposedTemplates',
		  match: { imagesCount: data.imagesCount },
		  select: '_id ProposedImages ProposedTexts'
		})
		.exec( function( err, themePage ){

			if( err ){

				console.fs( err );

			}
			else {

				var data = themePage.proposedTemplates;
				socket.emit( socketName+'.getSelectedProposedTemplates', data );

			}

		})

	});

};

// metody
ThemePageController.prototype.addProposedTemplate = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.addProposedTemplate', function(data) {
		var themePageID = data.ThemePageID;
		ThemePage.findOne({_id: themePageID}, function(err, themePage){
			themePage.ProposedTemplates.push();
		});
	});
};




/*
ThemePageController.prototype.update = function() {

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.update', function( data ){

		console.fs( data );
		console.fs( 'przyszedl update themePage' );

	})

};
*/


ThemePageController.prototype.changeObjectsOrder = function( ){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.changeObjectsOrder', function( data ){

		var themePageID = data.themePageID;

		console.fs('cos przyszlo');

		ThemePage.findById( themePageID ).deepPopulate( 'EditorBitmaps EditorTexts' ).exec( function( err, themePage ){

			if( err ){

				console.log( err );

			}
			else {



			}

		});

	});

};

ThemePageController.prototype.updateImage = function() {

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.updateImage', function( data ){

		ThemePage.findById( data.themePageID, function( err, themePage ){

			if( err ){

				console.fs( err );

			} else {

				var hasUrl = _.has(themePage, 'url');

				if( !hasUrl ){
					console.fs('Nie ma url\'a');
					return;
				}

				if( themePage.url ){

					var dir = conf.staticDir + themePage.url.split( conf.staticPath+'/' )[1];

					var body = data.image64;
					var base64Data = body.replace(/^data:image\/png;base64,/,"");
					var binaryData = new Buffer( base64Data, 'base64').toString('binary');

					fs.writeFile( dir, binaryData, "binary", function(err) {

						if( err ){

							console.fs( err );

						}else {

							console.fs('wszystko poszlo ok!!!:)');

						}

					});

				}

			}

		});

	});

};


ThemePageController.prototype.get = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.get', function(data) {
		var themePageID = data.themePageID;

		ThemePage.findById(themePageID).deepPopulate('backgroundObjects.EditorTexts foregroundObjects.EditorTexts backgroundObjects.EditorBitmaps.ProjectImage foregroundObjects.EditorBitmaps.ProjectImage UsedImages proposedTemplates proposedTemplates.ProposedImages proposedTemplates.ProposedTexts ThemePageFrom').exec(function(err, page){
			if(err){
				console.fs(err);
			}
			console.log( page.backgroundObjects.EditorBitmaps );
			socket.emit(socketName+'.get', page);
		});
	});
};

ThemePageController.getFullThemePage = function( themePageID ){

	var def = Q.defer();

	ThemePage.findOne( { _id : themePageID }).deepPopulate( 'backgroundObjects.EditorTexts foregroundObjects.EditorTexts backgroundObjects.EditorBitmaps.ProjectImage foregroundObjects.EditorBitmaps.ProjectImage UsedImages proposedTemplates proposedTemplates.ProposedImages proposedTemplates.ProposedTexts ThemePageFrom' ).exec( function( err, themePage ){

		if( err ){

			console.fs( err );

		}else{


			def.resolve( themePage );

		}

	});

	return def.promise;

}


ThemePageController.findProposedTemplate = function( themePageID, imagesCount, textsCount ){

	var def = Q.defer();

    ThemePage.findOne({ _id: themePageID }).populate({
      path: 'proposedTemplates',
      match: { imagesCount: imagesCount },
      select: '_id ProposedImages ProposedTexts'
    }).exec( function( err, themePage ){

    	if( err ){

    		console.fs( err );
    		def.resolve( false );

    	}else {

    		if( themePage.proposedTemplates.length > 0 ){

    			ProposedTemplate.findOne({ _id : themePage.proposedTemplates[0]._id }).deepPopulate('ProposedImages ProposedTexts').exec( function( err, _proposedTemplate ){

    				if (err ){

    					console.fs( err );

    				}else {

						ThemePageController.getFullThemePage( themePageID ).then( function( fullThemePage ){ def.resolve( { proposedTemplate : _proposedTemplate, themePage : fullThemePage } );  });

    				}

    			});

    		}else {

    			def.resolve( false );

    		}

    	}

    });

	return def.promise;

};


ThemePageController._getMinAndMaxProposedImages = function( themePageID ){

	var def = Q.defer();

	ThemePage.findOne({ _id : themePageID }).deepPopulate('proposedTemplates').exec( function( err, themePage ){

		if( err ){

			console.fs( err );

		}else {

			var maxProposedImages = 0;
			var minProposedImages = null;
			var maxProposedTexts  = 0;
			var minProposedTexts  = null;
			var proposedList      = [];

			for( var i=0; i < themePage.proposedTemplates.length; i++ ){

				var currentTemplate = themePage.proposedTemplates[i];

				var elem = {

					_id         : currentTemplate._id,
					imagesCount : currentTemplate.imagesCount,
					textsCount  : currentTemplate.textsCount

				};

				proposedList.push( elem );

				if( maxProposedImages < currentTemplate.imagesCount ){

					maxProposedImages = currentTemplate.imagesCount;

					if( minProposedImages == null ){

						minProposedImages = currentTemplate.imagesCount;

					}

				}

				if( minProposedImages > currentTemplate.imagesCount ){

					minProposedImages = currentTemplate.imagesCount;

				}

				if( maxProposedTexts < currentTemplate.textsCount ){

					maxProposedTexts = currentTemplate.textsCount;

					if( minProposedTexts == null ){

						minProposedTexts = currentTemplate.textsCount;

					}

				}

				if( minProposedTexts > currentTemplate.textsCount ){

					minProposedTexts = currentTemplate.textsCount;

				}

			}

			if( minProposedTexts == null ){

				minProposedTexts = 0;

			}

			if( minProposedImages == null ){

				minProposedImages = 0;

			}

			var dataInfo = {

				maxImages : maxProposedImages,
				minImages : minProposedImages,
				maxTexts : maxProposedTexts,
				minTexts : minProposedTexts,
				list : proposedList

			}

			def.resolve( dataInfo );

		}

	});

	return def.promise;

};


ThemePageController.prototype.update = function() {

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.update', function(data) {

		var groundTypes = ['background', 'foreground'];
		var objectTypes = ['EditorBitmap', 'EditorText'];
		var objectNames = ['EditorBitmaps', 'Texts'];

		function updateEditorObject( objectType, newData ){

			var def = Q.defer();

			var localData = _.clone(newData);
			var ID = localData._id;
			delete localData._id;

			//var target = _.extend(object1, object2);
			_modelList[objectType].findOne({_id: ID}, function( err, _editorObject ) {
				if( err ){
					console.fs(err);
					def.reject(err);
				}
				if( _editorObject === null ){
					def.resolve(false);
				} else {
					_editorObject = _.extend(_editorObject,localData );

					_editorObject.save( function(err, saved) {
						if(err){

							console.fs(err);
							def.reject(err);
						} else {

							def.resolve(true);
						}
					});
				}

			});
			return def.promise;
		};

		function saveEditorBitmap( groundType, objectType, themePageID, image ){
			var def = Q.defer();

			var imageData = {

				name : image.name,
				width : image.width,
				height : image.height,
				rotation : image.rotation,
				scaleX : image.scaleX,
				scaleY : image.scaleY,
				uid : generatorUID(),
				ProjectImage : image.ProjectImage,
				x : image.x,
				y : image.y,
				order : image.order

			};

			var newEditorObject = new _modelList[objectType]( imageData );

			newEditorObject.save( function( err, _newEditorObject ){

				if( err ){

					console.fs('nie udalo sie zapisac bitmapy!');

				} else {

					ThemePage.findOne({_id: themePageID}, function( err,  _themePage) {

						_themePage[groundType+'Objects'][objectType+'s'].push(_newEditorObject);

						_themePage.save(function(err, savedThemePage){
							if(err){
								console.fs(err);
								def.reject(err);
							}
							def.resolve(true);
						});

					});

				}

			});

			return def.promise;

		};

		function saveEditorText( groundType, objectType, themePageID, text ){

			var def = Q.defer();

			var textData = {

				name : text.name,
				width : text.width,
				height : text.height,
				rotation : text.rotation,
				uid : generatorUID(),
				x : text.x,
				y : text.y,
				order : text.order,
				content : text.content
			};

			var newEditorObject = new _modelList[objectType]( textData );

			newEditorObject.save( function( err, _newEditorObject ){

				if( err ){

					def.reject(err);

				} else {

					ThemePage.findOne({_id: themePageID}, function( err,  _themePage) {
						//console.fs(objectType);
						_themePage[groundType+'Objects'][objectType+'s'].push(_newEditorObject);

						_themePage.save(function(err, savedThemePage){
							if(err){
								console.fs(err);
								def.reject(err);
							}

							def.resolve(true);

						});

					});

				}

			});

			return def.promise;

		}

		function checkToRemove( themePageID, objectsInfo ){

			var def = Q.defer();
			var needRemove = false;

			console.log('Rozpoczyman check to remove');

			ThemePage.findOne({_id: themePageID}, function( err,  _themePage) {

				console.log( _themePage );

				var found = false;
				var toRemove={};

				for(var i = 0; i < groundTypes.length; i++){

					toRemove[groundTypes[i]] = {};

					for(var j = 0; j < objectTypes.length; j++){

						toRemove[groundTypes[i]][objectNames[j]] = [];
						var objectHasKey = _.has(_themePage, groundTypes[i]+'Objects');

						/*
						if( !objectHasKey ){

							console.log( groundTypes[i]+'Objects' );
							console.log('NIMA !');
							continue;


						}
						*/

						console.log( '****************************************' );
						console.log( groundTypes[i]+'Objects' );

						var actObjects = _themePage[groundTypes[i]+'Objects'][objectTypes[j]+'s'];

						for(var k=0;k<actObjects.length;k++){
							var actObjectInfo = objectsInfo[groundTypes[i]+'Objects'][objectNames[j]];
							for(var l=0;l<actObjectInfo.length;l++){
								if( actObjects[k].equals(actObjectInfo[l]._id) ){
									found = true;
								}
							}
							if( found === false ){

								toRemove[groundTypes[i]][objectNames[j]].push( actObjects[k] );
								needRemove = true;
							}
							found = false;
						}

						found = false;
					}
				}

				if( needRemove )
					toDoCounter++;

				function updateObject(place, type, list){
					var def = Q.defer();

					var objectToUpdate = place+'.'+type;

					ThemePage.update(
				        {_id:  themePageID},
				        {$pull: {objectToUpdate: {
				            _id: { $in: list }
				        }}},
				        {multi: true},
				        function(err, updated){
				        	if( err ){
				        		console.fs(err);
								def.reject(err);
				        	} else {
				        		def.resolve(updated);
				        	}
				        }
				    );
					return def.promise;
				};

				function removeObject( model, list ){

					var def = Q.defer();

					_modelList[model].remove({_id:{$in: list}}, function(err, removed) {

						if( err ){

			        		console.fs(err);
							def.reject(err);

			        	} else {

			        		def.resolve(removed);

			        	}
					});
					return def.promise;
				};

				var funcs = [];

				for(var i = 0; i < groundTypes.length; i++){

					for(var j = 0; j < objectTypes.length; j++){

						funcs.push( updateObject( groundTypes[i]+'Objects', objectNames[j], toRemove[groundTypes[i]][objectNames[j]] ) );
						funcs.push( removeObject( 'EditorText', toRemove[groundTypes[i]][objectNames[j]] ) );

					}

				}

				// Tutaj trzeba uzupełnić obiekty, które dodamy do tekstów i obrazków

				Q.all([
					// Wyrzuć z backgroundObjects te EditorBitmapy których już nie ma po aktualizacji
					updateObject('backgroundObjects', 'EditorBitmaps', toRemove['background']['EditorBitmaps'] ),

					// Analogicznie z foreground i każdym innym obiektem
					updateObject('foregroundObjects', 'EditorBitmaps', toRemove['foreground']['EditorBitmaps'] ),

					// usuń EditorBitmapy, których już nie ma z backgroundu
					removeObject( 'EditorBitmap', toRemove['background']['EditorBitmaps'] ),

					// usuń EditorBitmapy, których już nie ma z foregroundu
					removeObject( 'EditorBitmap', toRemove['foreground']['EditorBitmaps'] ),
					// TEKSTY <<<<<<<<<<<<<<<<<<<<<<<<
					// Wyrzuć z backgroundObjects te EditorBitmapy których już nie ma po aktualizacji
					updateObject('backgroundObjects', 'EditorTexts', toRemove['background']['Texts'] ),

					// Analogicznie z foreground i każdym innym obiektem
					updateObject('foregroundObjects', 'EditorTexts', toRemove['foreground']['Texts'] ),

					// usuń EditorBitmapy, których już nie ma z backgroundu
					removeObject( 'EditorText', toRemove['background']['Texts'] ),

					// usuń EditorBitmapy, których już nie ma z foregroundu
					removeObject( 'EditorText', toRemove['foreground']['Texts'] )
				]).spread(function (p1, p2, p3, p4, p5, p6, p7, p8) {
					def.resolve( {'p1': p1, 'p2': p2, 'p3': p3, 'p4': p4, 'p5': p5, 'p6': p6, 'p7': p7, 'p8': p8 } );
				    //return makeShaderProgram(fragmentCode, vertexCode);
				});

			});

			return def.promise;
		}

		function updateMiniature( themePageID, miniature ){
			var def = Q.defer();

			ThemePage.findById( themePageID, function( err, _themePage ){

				if( err ){

					console.fs( err );
					def.reject(err);

				} else {

					if( _themePage.url ){

						var dir = conf.staticDir + _themePage.url.split( conf.staticPath+'/' )[1];

						var body = miniature;
						var base64Data = body.replace(/^data:image\/png;base64,/,"");
						var binaryData = new Buffer( base64Data, 'base64').toString('binary');

						fs.writeFile( dir, binaryData, "binary", function(err) {

							if( err ){

								console.fs( err );
								def.reject(err);

							}else {

								def.resolve(true);

							}

						});

					}

				}

			});
			return def.promise;
		};

		function counter( len, count ){
			if( len == count ){
				return true;
			} else {
				return false;
			}
		};

		function promise( allDone, counter ){

			if( allDone === counter ){

				socket.emit( 'ThemePage.update', 'ok' );

			}

		};

		var toDoCounter = 0;
		var objectCounter=0;
		var objectsToUpdate=0;
		var hasObjectToUpdate=false;
		var hasObjectToAdd=false;
		var saveCounter=0;
		var objectToSave=0;
		var allDone = 0;

		for(var i = 0; i < groundTypes.length; i++){

			console.log( "=-=-=-=-=-=-" );
			console.log( groundTypes[i] );

			for(var j = 0; j < objectTypes.length; j++){

				console.log( objectTypes[j] );

				var objectData = data.objectsInfo[groundTypes[i]+'Objects'][objectNames[j]];

				for(var k=0;k<objectData.length;k++){

					if( objectData[k]._id !== null ){

						if(hasObjectToUpdate === false){

							toDoCounter++;
							hasObjectToUpdate = true;

						}

						objectsToUpdate++;
						var p1 = updateEditorObject( objectTypes[j], objectData[k]);

						p1.then( function (saved){

							if(saved){
								objectCounter++;

								if( counter(objectsToUpdate, objectCounter) ){

									allDone++;
									promise(allDone, toDoCounter);
								}
							}

						});

					} else {

						if(hasObjectToAdd === false){

							toDoCounter++;
							hasObjectToAdd = true;

						}

						objectToSave++;

						if( objectTypes[j] === 'EditorBitmap' ){

							var p2 = saveEditorBitmap(groundTypes[i], objectTypes[j], data.themePageID, objectData[k]);

						} else if ( objectTypes[j] === 'EditorText' ) {

							var p2 = saveEditorText(groundTypes[i], objectTypes[j], data.themePageID, objectData[k]);

						}

						p2.then( function (saved){

							if(saved){

								saveCounter++;

								if( counter(objectToSave, saveCounter) ) {

									allDone++;
									promise(allDone, toDoCounter);

								}

							}

						});
					}
				}
			}
		}

		toDoCounter++;
		checkToRemove( data.themePageID, data.objectsInfo ).then( function( checked ){
			allDone++;
			promise(allDone, toDoCounter);
		});

		toDoCounter++;
		updateMiniature( data.themePageID, data.miniature ).then( function( updated ){

			allDone++;
			promise(allDone, toDoCounter);

		});

	});
};

module.exports = ThemePageController;
