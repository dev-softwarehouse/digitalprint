var util = require('util'),
	path = require('path'),
	fs = require('fs');
console.fs = require('../libs/fsconsole.js');
var mongoose = require('mongoose');
var Q = require('q');

//var app = require('../app.js');
var conf = require('../confs/main.js');
var confLib = require('../libs/conf.js');
var mainConf = require('../libs/mainConf.js');

var generatorUID = require('../libs/generator.js');

//var Theme = require('../models/Theme.js').model;

var Controller = require("../controllers/Controller.js");
var Theme = require('../models/Theme.js').model;
var ThemePage = require('../models/ThemePage.js').model;
var EditorBitmap = require('../models/EditorBitmap.js').model;
var ProjectImage = require('../models/ProjectImage.js').model;
var ProposedTemplate = require('../models/ProposedTemplate.js').model;
var ProposedImage = require('../models/ProposedImage.js').model;
var ProposedText = require('../models/ProposedText.js').model;
var MainTheme = require('../models/MainTheme.js').model;
var Format = require('../models/Format.js').model;
var EditorText = require('../models/EditorText.js').model;
var Font = require('../models/Font.js').model;
var AdminAsset = require('../models/AdminAssets.js').model;

function ThemeController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "ThemeController";
    this.socketName = "Theme";
}

util.inherits(ThemeController, Controller);



//metody
ThemeController.prototype.getPages = function() {
	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on(socketName+'.getPages', function(data) {

		var themeID = data.themeID;

		Theme.findOne({_id: themeID}, function(err, mt) {
			if( err ){
				console.fs(err);
			}
			if( mt == null ){
				console.fs('Nie ma takiego motywu');
			}
			if( mt.Pages === null ){
				console.fs('Nie ma stron w motywie');
			}

			if( typeof mt.ThemePages !== undefined && mt.ThemePages !== null ){

				for(var i = 0;i<mt.ThemePages.length;i++){
		            mt.ThemePages[i].url = conf.staticPath+'/min/'+mt._id+'/'+mt.ThemePages[i]._id+'.jpg';
		        }

				socket.emit(socketName+'.getPages', mt.ThemePages);
			} else {
				console.fs('Nie ma stron w motywie głównym!');
			}
			socket.emit(socketName+'.getPages', mt.ThemePages);
		}).lean().populate('ThemePages');

	});
};

ThemeController.prototype.getFullBackgroundFrames = function(){

	var socketName = this.socketName;
	var socket  = this.socket;
	socket.on(socketName+'.getFullBackgroundFrames', function(data) {

		Theme.findOne({ _id : data.themeID }).deepPopulate('backgroundFrames backgroundFrames.ProjectImage').exec( function( err, theme ){

			if( err ){

				console.fs( err );

			}else {

				socket.emit( socketName+'.getFullBackgroundFrames', theme.backgroundFrames );

			}

		});

	});

};

ThemeController.prototype.getBackgroundFrames = function(){

	var socketName = this.socketName;
	var socket  = this.socket;
	socket.on(socketName+'.getBackgroundFrames', function(data) {

		Theme.findOne({ _id : data.themeID }).exec( function( err, theme ){

			if( err ){

				console.fs( err );

			}else {

				socket.emit( socketName+'.getBackgroundFrames', theme.backgroundFrames );

			}

		});

	});

};


ThemeController.prototype.getThemeFonts = function(){

	var socketName = this.socketName;
	var socket  = this.socket;
	socket.on(socketName+'.getThemeFonts', function(data) {

		var fontsNames =  data.fontsNames;

		var evtID = data.evtID

		Theme.findOne({ _id : data.themeID }).deepPopulate('fonts').exec( function( err, theme ){

			if( err ){

				console.fs( err );
				return;

			}

			var data = {

				fonts : theme.fonts,
				evtID : evtID

			};

			socket.emit( socketName + '.getThemeFonts', data );

		});

	});

}


ThemeController.prototype.setThemeFonts = function(){

	var socketName = this.socketName;
	var socket  = this.socket;
	socket.on(socketName+'.setThemeFonts', function(data) {

		var fontsNames =  data.fontsNames;

		Theme.findOne({ _id : data.themeID }).exec( function( err, theme ){

			if( err ){

				console.fs( err );
				return;

			}

			Font.find( { name: { $in : fontsNames } } ).exec( function( err, fonts ){

				if( err ){

					console.fs( err );
					return;

				}

				theme.fonts = fonts;

				theme.save( function( err, saved ){

					if( err ){

						console.fs( err );

					}else {

						console.fs( saved );
						console.fs('Zapisalem kuuurwa :)');

					}

				});


			});

		});

	});


}

ThemeController.prototype.setBackgroundFrames = function(){

	var socketName = this.socketName;
	var socket  = this.socket;
	socket.on(socketName+'.setBackgroundFrames', function(data) {

		Theme.findOne({ _id : data.themeID }).exec( function( err, theme ){

			if( err ){

				console.fs( err );

			}else {

				theme.backgroundFrames = data.framesIDS;

				theme.save( function( err, saved ){

					if( err ){

						console.fs( err );

					}else {

						console.fs( saved );
						console.fs('ZAPISANO :)');

					}

				});

			}

		});

	});

};

ThemeController.prototype._getUsedPages = function( data ){

	var socketName = this.socketName;
	var socket  = this.socket;
	var themeID = data.themeID;
	var mainThemeID = null;
	var allCloned = [];
	var copiedPages = [];
	var mainPages = [];
	var localPages = [];
	console.time('getUsedPages');
	Theme.findOne({_id: themeID}).lean().deepPopulate('ThemePages ThemePages.proposedTemplates').exec( function(err, theme) {
		if( err ){
			console.fs(err);
		}
		mainThemeID = theme.MainTheme;
		if( typeof theme.ThemePages !== undefined && theme.ThemePages !== null ){
			for(var i = 0;i<theme.ThemePages.length;i++){

	            if( theme.ThemePages[i].ThemePageFrom !== undefined && theme.ThemePages[i].ThemePageFrom !== null ){

	            	allCloned.push(theme.ThemePages[i].ThemePageFrom.toString());
	            	theme.ThemePages[i].cloned = true;
	            	copiedPages.push(theme.ThemePages[i]);
	            } else {
	            	theme.ThemePages[i].local = true;
	            	localPages.push(theme.ThemePages[i]);
	            }
	        }

		}

		MainTheme.findOne({_id: mainThemeID}).lean().deepPopulate('ThemePages ThemePages.proposedTemplates').exec( function(err, mt) {
			if(err){
				console.fs(err);
			}
			if( mt.ThemePages !== undefined && mt.ThemePages !== null ){

				var toSplice = [];

				removed=0;
				var tpLength = mt.ThemePages.length;
				for(var i = 0;i<tpLength;i++){

					if(allCloned.indexOf(mt.ThemePages[i-removed]._id+"")===-1){
						mt.ThemePages[i-removed].notused = true;
					} else {

						mt.ThemePages.splice(i-removed, 1);
						removed++;

					}
				}

				mainPages = mt.ThemePages;


			}
			console.timeEnd('getUsedPages');

			for( var i=0; i < mainPages.length; i++ ){
				console.log( mainPages );
				mainPages[i] = mainPages[i];
				mainPages[i].mainThemeID = mainThemeID;

			}

			var _data = {

				pages : {'copiedPages': copiedPages, 'mainPages': mainPages, 'localPages': localPages},
				mainThemeID : mainThemeID,
				themeID : themeID

			};

			socket.emit(socketName+'._getUsedPages', _data);

		});
	});

};


ThemeController.prototype.getUsedPages = function() {
	var socketName = this.socketName;
	var socket  = this.socket;
	socket.on(socketName+'.getUsedPages', function(data) {

		var themeID = data.themeID;
		var mainThemeID = null;
		var allCloned = [];
		var copiedPages = [];
		var mainPages = [];
		var localPages = [];
		console.time('getUsedPages');
		Theme.findOne({_id: themeID}).lean().deepPopulate('ThemePages ThemePages.proposedTemplates').exec( function(err, theme) {
			if( err ){
				console.fs(err);
			}
			if( theme === null ){
				socket.emit(socketName+'.getUsedPages', {});
				return;
			}
			var mainThemeID = theme.MainTheme;
			if( typeof theme.ThemePages !== undefined && theme.ThemePages !== null ){
				for(var i = 0;i<theme.ThemePages.length;i++){

		            if( theme.ThemePages[i].ThemePageFrom !== undefined && theme.ThemePages[i].ThemePageFrom !== null ){

		            	allCloned.push(theme.ThemePages[i].ThemePageFrom.toString());
		            	theme.ThemePages[i].cloned = true;
		            	copiedPages.push(theme.ThemePages[i]);
		            } else {
		            	theme.ThemePages[i].local = true;
		            	localPages.push(theme.ThemePages[i]);
		            }
		        }

			}



			MainTheme.findOne({_id: mainThemeID}).lean().deepPopulate('ThemePages ThemePages.proposedTemplates').exec( function(err, mt) {
				if(err){
					console.fs(err);
				}
				if( mt.ThemePages !== undefined && mt.ThemePages !== null ){

					var toSplice = [];

					removed=0;
					var tpLength = mt.ThemePages.length;
					for(var i = 0;i<tpLength;i++){

						if(allCloned.indexOf(mt.ThemePages[i-removed]._id+"")===-1){
							mt.ThemePages[i-removed].notused = true;
						} else {
							mt.ThemePages.splice(i-removed, 1);
							removed++;
						}
					}
					mainPages = mt.ThemePages;

				}

				console.timeEnd('getUsedPages');

				for( var i=0; i < mainPages.length; i++ ){

					mainPages[i] = mainPages[i].toJSON();
					mainPages[i].mainThemeID = mainThemeID;

				}

				socket.emit(socketName+'.getUsedPages', {'copiedPages': copiedPages, 'mainPages': mainPages, 'localPages': localPages});

			});
		});
	});
};



ThemeController.prototype.test = function() {

	function getFormatFromTheme( themeID ){

		var def = Q.defer();

		Format.findOne({ 'Themes':  themeID  }, function( err, _format ) {

			if( err ){
				console.fs(err);
				def.reject(err);
			}

			def.resolve(_format);

		});

		return def.promise;
	}

	var themeID = '5535020e457941d43955922a';

	var parentFormat = getFormatFromTheme( themeID );
	parentFormat.then( function (format){
		console.fs('Format parent ');
		console.fs(format);
	});

};

ThemeController.prototype.copyPageFromMainTheme = function() {
	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on(socketName+'.copyPageFromMainTheme', function(data) {

		var themePageID = data.mainThemePageID;
		var themeID = data.themeID;
		var mainThemeID = data.mainThemeID;
		var url = '';

		function getFormatFromTheme( themeID ){

			var def = Q.defer();

			Format.findOne({ 'Themes':  themeID  }, function( err, _format ) {

				if( err ){
					console.fs(err);
					def.reject(err);
				}

				def.resolve(_format);

			});

			return def.promise;
		}

		ThemePage.findById( themePageID ).deepPopulate('backgroundObjects.EditorBitmaps.ProjectImage foregroundObjects.EditorTexts backgroundObjects.EditorTexts foregroundObjects.EditorBitmaps.ProjectImage UsedImages.ProjectImage').exec(function(err, themePageToCopy ){

			if( err ) {
				console.fs( err );
			} else {

				var copiedImage = false;

				var backgroundEditorBitmapsCount = themePageToCopy.backgroundObjects.EditorBitmaps.length;
				var foregroundEditorBitmapsCount = themePageToCopy.foregroundObjects.EditorBitmaps.length;
				var backgroundEditorTextsCount = themePageToCopy.backgroundObjects.EditorTexts.length;
				var foregroundEditorTextsCount = themePageToCopy.foregroundObjects.EditorTexts.length;

				//console.fs( themePageToCopy );

				console.fs('ILE JEST RZECZY DO SKOPIOWANIA: ' + (backgroundEditorBitmapsCount+foregroundEditorBitmapsCount+backgroundEditorTextsCount+foregroundEditorTextsCount) );

				var themePageData = {

					order : themePageToCopy.order,
					name : themePageToCopy.name,
					vacancy : themePageToCopy.vacancy
					//width : format.width,
					//height : format.height

				};

				var copiedThemePage = new ThemePage( themePageData );

				function promise(){

					if( ( backgroundEditorBitmapsCount + foregroundEditorBitmapsCount + backgroundEditorTextsCount + foregroundEditorTextsCount ) == 0 && copiedImage ){

						copiedThemePage.ThemePageFrom = themePageToCopy;

						var parentFormat = getFormatFromTheme( themeID );
						parentFormat.then( function (format){

							copiedThemePage.width = format.width;
							copiedThemePage.height = format.height;

							copiedThemePage.save( function( err, copiedThemePage ){

								if( err ){

									console.fs( err );

								}
								else {

									Theme.findById( themeID, function( err, _theme ){

										if( err ){
											console.fs(err);

										}
										else {

											_theme.ThemePages.push( copiedThemePage );

											// zapisanie motywu ze skopiowana strona
											_theme.save( function( err, _theme ){

												if( err ){

													console.fs( err );

												} else {

													data.url = url;
													data.newThemePageID = copiedThemePage._id;

													socket.emit( socketName+'.copyPageFromMainTheme' , data );
													console.fs('strona zostala pomyślnie skopiowana!!! :)');

												}


											});

										}

									});


								}

							});

						});

					}

				};


				function copyEditorBitmap( editorBitmap, place ){

					var editorBitmap = editorBitmap.toJSON();

					delete editorBitmap._id;
					var newEditorBitmap = new EditorBitmap( editorBitmap );

					newEditorBitmap.save( function( err, _bitmap ){

						if( err ){

							console.fs( err );

						}
						else {

							copiedThemePage[place].EditorBitmaps.push( _bitmap );
							if( place == 'backgroundObjects' )
								backgroundEditorBitmapsCount--;
							else
								foregroundEditorBitmapsCount--;

							promise();

						}

					});

				};

				function copyEditorText( editorText, place ){

					var editorText = editorText.toJSON();
					delete editorText._id;

					newEditorText = new EditorText( editorText );

					newEditorText.save( function( err, _text ){

						if( err ){

							console.fs( err );

						}
						else {

							copiedThemePage[place].EditorTexts.push( _text );

							if( place == 'backgroundObjects' )
								backgroundEditorTextsCount--;
							else
								foregroundEditorTextsCount--;

							promise();

						}

					});

				};


				url = themePageToCopy.url;

		 		if( url !== undefined ){

		 			var newDir = conf.staticDir+'themes/themeMin/'+themeID+'/';

			 		var sourceFile = conf.staticDir+'themes/mainThemeMin/'+mainThemeID+'/'+themePageID+'.jpg';
			 		fs.createReadStream( sourceFile ).pipe( fs.createWriteStream( newDir + '' + copiedThemePage._id + '.jpg' ) );

			 		copiedThemePage.url = conf.staticPath+'/themes/themeMin/'+themeID+'/'+ copiedThemePage._id + '.jpg';

			 		url = copiedThemePage.url;

			 		copiedImage = true;

			 		promise();

			 	}



				for( var i=0; i < themePageToCopy.backgroundObjects.EditorBitmaps.length; i++ ){

					copyEditorBitmap( themePageToCopy.backgroundObjects.EditorBitmaps[i], 'backgroundObjects' );

				}

				for( var i=0; i < themePageToCopy.foregroundObjects.EditorBitmaps.length; i++ ){

					copyEditorBitmap( themePageToCopy.foregroundObjects.EditorBitmaps[i], 'foregroundObjects' );

				}

				for( var i=0; i < themePageToCopy.backgroundObjects.EditorTexts.length; i++ ){

					copyEditorText( themePageToCopy.backgroundObjects.EditorTexts[i], 'backgroundObjects' );

				}

				for( var i=0; i < themePageToCopy.foregroundObjects.EditorTexts.length; i++ ){

					copyEditorText( themePageToCopy.foregroundObjects.EditorTexts[i], 'foregroundObjects' );

				}

			}

		});

		return;

	});
};

ThemeController._getAllNotVacancyPages = function( themeID ){

	var def = Q.defer();

	Theme.findOne( { _id : themeID }).deepPopulate( 'ThemePages' ).exec( function( err, theme ){

		if( err ){

			console.fs( err );
			def.reject( err );

		}else {

			console.fs( theme.ThemePages );
			var themePages  = theme.ThemePages;
			var notVacancyThemePages = _.filter( themePages, function( themePage ){

				return !themePage.vacancy;

			});

			def.resolve( notVacancyThemePages );

		}


	});

	return def.promise;

};

ThemeController._getAllVacancyPages = function( themeID ){

	var def = Q.defer();

	Theme.findOne( { _id : themeID }).deepPopulate( 'ThemePages' ).exec( function( err, theme ){

		if( err ){

			console.fs( err );
			def.reject( err );

		}else {

			console.fs( theme.ThemePages );
			var themePages  = theme.ThemePages;
			var notVacancyThemePages = _.filter( themePages, function( themePage ){

				return themePage.vacancy;

			});

			def.resolve( notVacancyThemePages );

		}


	});

	return def.promise;

};

ThemeController.prototype.addLocalPage = function(){

	var socketName = this.socketName;
	var socket = this.socket;
	var _this = this;

	socket.on(socketName+'.addLocalPage', function(data) {

		Theme.findOne({_id: data.themeID}, function(err, theme) {

			var themeID = data.themeID;

			if( err ){
				console.fs(err);
			}
			if( theme == null ){
				console.fs('Nie ma takiego motywu');
				return;
			}


			var backgroundTextObjectsCount = data.backgroundObjects.Texts.length;
			var backgroundImageObjectsCount = data.backgroundObjects.EditorBitmaps.length;
			var foregroundTextObjectsCount = data.foregroundObjects.Texts.length;
			var foregroundImageObjectsCount = data.foregroundObjects.EditorBitmaps.length;

			console.fs( 'Ile jest rzeczy do zapisania' );
			console.fs( 'backgroundTextObjectsCount: ' + backgroundTextObjectsCount );
			console.fs( 'backgroundImageObjectsCount: ' + backgroundImageObjectsCount );
			console.fs( 'foregroundTextObjectsCount: ' + foregroundTextObjectsCount );
			console.fs( 'foregroundImageObjectsCount: ' + foregroundImageObjectsCount );


			var pageData = {

				name : data.name,
				order : data.order,
				width : data.width,
				height : data.height,
				vacancy : data.vacancy

			};



			var newThemePage = new ThemePage( pageData );

			newThemePage.save(function( err, savedThemePage ){

				if( err ){

					console.fs(err);

				}
				else {

					var imageSaved = false;

					function promise(){

						if( backgroundTextObjectsCount == 0 && foregroundTextObjectsCount == 0 && backgroundImageObjectsCount == 0 && foregroundImageObjectsCount == 0 && imageSaved){

							savedThemePage.save( function( err, saveEndThemePage ){

								if( err ){

									console.fs( err );

								}
								else {



									theme.ThemePages.push( saveEndThemePage );

									theme.save( function( err, updatedTheme ){

										if( err ){

											console.fs( err );

										}
										else {

											// wiadomosc zwrotna o dodaniu lokalnej strony, zawierw wszystkie strony motywu, powinna zawierac tylko dodane ( zeby zmniejszyc [rzeplyw danych])
											console.fs( updatedTheme );
											console.fs('motyw zostal zauktualizowany');

											var _data = {

												themeID : themeID

											};

											_this._getUsedPages( _data );
											//socket.emit('Theme.addLocalPage', updatedTheme.ThemePages );

										}

									});

								}

							});

						}

					};


					function saveBackgroundText( text ){

						var textData = {

							name : text.name,
							width : text.width,
							height : text.height,
							order : text.order,
							content : text.content,
							uid : generatorUID(),
							x : text.x,
							y : text.y,
	                        borderColor : text.borderColor,
	                        borderWidth : text.borderWidth,
	                        displaySimpleBorder : text.displaySimpleBorder,
	                        dropShadow : text.dropShadow,
	                        shadowBlur : text.shadowBlur,
	                        shadowColor : text.shadowColor,
	                        shadowOffsetX : text.shadowOffsetX,
	                        shadowOffsetY : text.shadowOffsetY,
							rotation : text.rotation

						};

						var newText = new EditorText( textData );

						newText.save( function( err, _newText ){

							if( err ){

								console.fs( err );
								console.fs('nie udalo sie zapisac tekstu!!!');

							}
							else {

								backgroundTextObjectsCount--;
								console.fs('Ile Zostalo tekstów w backgroundzie do zapisania: ' + backgroundTextObjectsCount );
								savedThemePage.backgroundObjects.EditorTexts.push( _newText );

								promise();

							}

						});
					};


					function saveForegroundText( text ){

						var textData = {

							name : text.name,
							width : text.width,
							height : text.height,
							order : text.order,
							content : text.content,
							uid : generatorUID(),
							x : text.x,
							y : text.y,
							rotation : text.rotation,
	                        borderColor : text.borderColor,
	                        borderWidth : text.borderWidth,
	                        displaySimpleBorder : text.displaySimpleBorder,
	                        dropShadow : text.dropShadow,
	                        shadowBlur : text.shadowBlur,
	                        shadowColor : text.shadowColor,
	                        shadowOffsetX : text.shadowOffsetX,
	                        shadowOffsetY : text.shadowOffsetY,

						};

						var newText = new EditorText( textData );

						newText.save( function( err, _newText ){

							if( err ){

								console.fs( err );
								console.fs('nie udalo sie zapisac tekstu!!!');

							}
							else {

								foregroundTextObjectsCount--;
								console.fs('Ile Zostalo tekstów w foregroundzie do zapisania: ' + foregroundTextObjectsCount );
								savedThemePage.foregroundObjects.EditorTexts.push( _newText );

								promise();

							}

						});
					};


					function saveBackgroundImage( image ){

						console.fs('_+_+__++_+_+_+_+_JEST projectImage ? _!__!_!_!_!_!_!_!__!_');
						console.fs(image);
						var imageData = {

							name : image.name,
							width : image.width,
							height : image.height,
							rotation : image.rotation,
							scaleX : image.scaleX,
							scaleY : image.scaleY,
							uid : generatorUID(),
	                        borderColor : image.borderColor,
	                        borderWidth : image.borderWidth,
	                        displaySimpleBorder : image.displaySimpleBorder,
	                        dropShadow : image._dropShadow,
	                        shadowBlur : image.shadowBlur,
	                        shadowColor : image.shadowColor,
	                        shadowOffsetX : image.shadowOffsetX,
	                        shadowOffsetY : image.shadowOffsetY,
							ProjectImage : image.ProjectImage,
							x : image.x,
							y : image.y,
							order : image.order

						};

						var newEditorBitmap = new EditorBitmap( imageData );

						newEditorBitmap.save( function( err, _newEditorBitmap ){

							if( err ){

								console.fs('nie udalo sie zapisac bitmapy!');

							}
							else {

								backgroundImageObjectsCount--;
								console.fs('Ile Zostalo tekstów w foregroundzie do zapisania: ' + backgroundImageObjectsCount );
								savedThemePage.backgroundObjects.EditorBitmaps.push( _newEditorBitmap );

								promise();

							}

						});

					};


					function saveForegroundImage( image ){

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
	                        borderColor : image.borderColor,
	                        borderWidth : image.borderWidth,
	                        displaySimpleBorder : image.displaySimpleBorder,
	                        dropShadow : image._dropShadow,
	                        shadowBlur : image.shadowBlur,
	                        shadowColor : image.shadowColor,
	                        shadowOffsetX : image.shadowOffsetX,
	                        shadowOffsetY : image.shadowOffsetY,
							order : image.order

						};

						var newEditorBitmap = new EditorBitmap( imageData );

						newEditorBitmap.save( function( err, _newEditorBitmap ){

							if( err ){

								console.fs('nie udalo sie zapisac bitmapy!');

							}
							else {

								foregroundImageObjectsCount--;
								console.fs('Ile Zostalo tekstów w foregroundzie do zapisania: ' + foregroundImageObjectsCount );
								savedThemePage.foregroundObjects.EditorBitmaps.push( _newEditorBitmap );

								promise();

							}

						});

					};


					if( data.base64 !== undefined ) {

						var dir = conf.staticDir+'themes/themeMin/'+theme._id+'/';
						mainConf.mkdir(dir);
						var body = data.base64,
						base64Data = body.replace(/^data:image\/png;base64,/,""),
						binaryData = new Buffer(base64Data, 'base64').toString('binary');

						fs.writeFile(dir+savedThemePage._id+".jpg", binaryData, "binary", function(err) {

							if(err){

								console.log(err);

							}

							imageSaved = true;
							savedThemePage.url = conf.staticPath+'/themes/themeMin/'+theme._id+'/'+savedThemePage._id+'.jpg';
							promise();

						});

					}
					else {

						imageSaved = true;
						console.fs('Brak base64');
						promise();


					}

					for( var i=0; i < data.backgroundObjects.Texts.length; i++ ){

						saveBackgroundText( data.backgroundObjects.Texts[i] );

					}

					for( var i=0; i < data.foregroundObjects.Texts.length; i++ ){

						saveForegroundText( data.foregroundObjects.Texts[i] );

					}

					for( var i=0; i < data.foregroundObjects.EditorBitmaps.length; i++ ){

						saveForegroundImage( data.foregroundObjects.EditorBitmaps[i] );

					}

					for( var i=0; i < data.backgroundObjects.EditorBitmaps.length; i++ ){

						saveBackgroundImage( data.backgroundObjects.EditorBitmaps[i] );

					}

					console.fs( savedThemePage );
					console.fs( 'udalo sie zapisac strone' );

				}

			});


		});

		return;

		console.time('addLocalPage');
		var themeID = data.themeID;

		var pageData = {}
		pageData.name = data.name;
		pageData.order = data.order;
		pageData.width = data.width;
		pageData.height = data.height;
		Theme.findOne({_id: themeID}, function(err, theme) {
			if( err ){
				console.fs(err);
			}
			if( theme == null ){
				console.fs('Nie ma takiego motywu');
				return;
			}
			var newPage = new ThemePage(pageData);
			newPage.save( function(err, saved) {
				if(err){
					console.fs(err);
				}

				var myObj = {
				    result: function async() {
				    	console.fs('backgroundObjectsSaved: ');
				    	console.fs(backgroundObjectsSaved);

				    	console.fs('foregroundObjectsSaved: ');
				    	console.fs(foregroundObjectsSaved);

				    	console.fs('imageSaved: ');
				    	console.fs(imageSaved);

				    	console.fs('mainThemeSaved: ');
				    	console.fs(mainThemeSaved);

				    	if( backgroundObjectsSaved && foregroundObjectsSaved && imageSaved && mainThemeSaved ){

							console.fs('Dodano strone --------------------------------------------------------<<<');
							console.timeEnd('addLocalPage');
							io.sockets.emit(socketName+'.addedLocalPage', saved);

				    	} else {
				    		console.log('Jeszcze nie wszystko się zapisało!');
				    	}

				    }
				};
				var imageSaved = false;
				if( data.base64 !== undefined ) {
					var dir = conf.staticDir+'min/'+theme._id+'/';

					mainConf.mkdir(dir);
					var body = data.base64,
					  base64Data = body.replace(/^data:image\/png;base64,/,""),
					  binaryData = new Buffer(base64Data, 'base64').toString('binary');

					fs.writeFile(dir+saved._id+".jpg", binaryData, "binary", function(err) {
						if(err){
							console.log(err);
						}
						saved.url = conf.staticPath+'/min/'+theme._id+'/'+saved._id+'.jpg';
						saved.save( function(err, imgSaved){
							if(err){
								console.fs(err);
							} else {
								imageSaved = true;
							}
							myObj.result();
						});
					});
				} else {
					imageSaved = true;
					console.fs('Brak base64');
				}

				var bo = data.backgroundObjects.EditorBitmaps;
				var backgroundObjectsSaved = false;
				if( bo &&  typeof bo !== undefined && bo.length > 0 ) {
					var countBgSaved = 0;
					for(var i = 0;i<bo.length;i++){
						//console.log(bo[i]);
						//var newGenerator = new Generator();
						bo[i].uid = generatorUID();
						var newEditorBitmap = new EditorBitmap(bo[i]);
						newEditorBitmap.save( function(err, eb){
							if(err){
								console.fs(err);
							}

							saved.backgroundObjects.EditorBitmaps.push(eb);
							saved.save( function(err, savedWithBg){
								if(err){
									console.fs(err);
								} else {
									countBgSaved++;
									if(countBgSaved == bo.length){
										backgroundObjectsSaved = true;
									}
								}
								myObj.result();
							});
						});
					}
				} else {
					backgroundObjectsSaved = true;
				}
				var fo = data.foregroundObjects.EditorBitmaps;
				var foregroundObjectsSaved = false;

				if( fo && typeof fo !== undefined && fo.length > 0 ) {
					var countFgSaved = 0;
					for(var i = 0;i<fo.length;i++){
						//console.log(fo[i]);
						//var newGenerator = new Generator();
						fo[i].uid = generatorUID();
						var newEditorBitmap = new EditorBitmap(fo[i]);
						newEditorBitmap.save( function(err, eb){
							if(err){
								console.fs(err);
							}
							saved.foregroundObjects.EditorBitmaps.push(eb);
							saved.save( function(err, savedWithFg) {
								if(err){
									console.fs(err);
								} else {
									countFgSaved++;
									if(countFgSaved == fo.length){
										foregroundObjectsSaved = true;
									}
								}
								myObj.result();
							});
						});
					}
				} else {
					foregroundObjectsSaved = true;
				}
				var mainThemeSaved = false;
				theme.ThemePages.push(saved);
				theme.save(function(err, savedMT){
					mainThemeSaved = true;
					myObj.result();
				});
			});


		});

	});
};


ThemeController.prototype.removeLocalPage = function(){

	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on(socketName+'.removeLocalPage', function(data) {

		var themePageID = data.themePageID;
		var themeID = data.themeID;

		ThemePage.findOne({_id: themePageID}, function(err, existPage) {

			if(err){

				console.fs(err);

			}
			if(existPage === null){
				io.sockets.emit(socketName+'.removeLocalPage', false );
				return;
			}
			existPage.remove(function(err, removed){

				if(err){

					console.fs(err);

				}
				if( existPage.url !== undefined ){

					var url = existPage.url;
					var nameFile = url.split("/").pop();

					var targetFile = conf.staticDir+'themes/themeMin/'+themeID+'/'+themePageID+'.jpg';
					fs.unlink(targetFile, function(err){

						if(err){

							console.fs(err);

						}

						io.sockets.emit(socketName+'.removeLocalPage', removed );

					});
				} else {

					io.sockets.emit(socketName+'.removeLocalPage', removed );

				}
			});
		});

	});

};


ThemeController.prototype.removeCopiedPage = function() {
	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on(socketName+'.removeCopiedPage', function(data) {
		var themePageID = data.themePageID;
		var themeID = data.themeID;
		var mainThemePage = data.mainThemePage;

		ThemePage.findOne({_id: themePageID}, function(err, existPage) {
			console.fs( existPage );

			if(err){
				console.fs(err);
			}
			existPage.remove(function(err, removed){
				if(err){
					console.fs(err);
				}
				Theme.findOne({_id: themeID}, function(err, _theme) {

					ThemePage.findOne({_id: existPage.ThemePageFrom}, function(err, _mainThemePage) {

						if(err){
							console.fs(err);
						}

						if( existPage.url !== undefined ){
							var url = existPage.url;
							var nameFile = url.split("/").pop();
							var targetFile = conf.staticDir+'themes/themeMin/'+themeID+'/'+themePageID+'.jpg';
							fs.unlink(targetFile, function(err){
								if(err){
									console.fs(err);
								}
								console.fs('Usunięto strone motywu i obrazek.');
								console.fs(removed);
								var dataResponse = _mainThemePage.toJSON();
								dataResponse.mainThemeID = _theme.MainTheme;
								dataResponse.removedThemePageID = existPage._id;
								io.sockets.emit(socketName+'.removeCopiedPage', dataResponse);
							});
						} else {
							console.fs('Usunięto strone motywu.');
							console.fs(removed);
							var dataResponse = _mainThemePage.toJSON();
							dataResponse.mainThemeID = _theme.MainTheme;
							dataResponse.removedThemePageID = existPage._id;
							io.sockets.emit(socketName+'.removeCopiedPage', dataResponse);
						}
					});

				});
			});
		});
	});
};

ThemeController.prototype.remove = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.remove', function(data){
		console.fs('Usuwanie!');
		console.time('usuwanie');
		var themeID = data.themeID;
		var formatID = data.formatID;

	    Theme.findOne({ _id: themeID }, function(err, th){
	    	if(err){
	    		console.fs(err);
	    	}
	    	th.remove( function(err, removed) {
		    	if(err){
		    		console.fs(err);
		    	} else {
		    		var url = th.url;
					var nameFile = url.split("/").pop();
					var targetFile = conf.staticDir+'themes/themeMin/'+th._id+'/'+th._id+'.jpg';
					fs.unlink(targetFile, function(err){
						if(err){
							console.fs(err);
						}
						console.fs('Usunięto: '+targetFile);
						Format.findOne({_id: formatID}, function(err, ft) {
							if(!err && ft !== null){
								console.timeEnd('usuwanie');
								io.sockets.emit(socketName+'.removed',ft.Themes);
							} else {
								console.fs(err);
							}
						}).lean().populate('Themes','_id name url');
					});

		    	}
		    });
	    });


	});
};

/**
 * Theme.add
 * Kopiujemy główny motyw bez stron do danego formatu
 * @param {Integer} [data.mainThemeID] ID motywu głównego
 * @param {Integer} [data.formatID] ID formatu
 */
ThemeController.prototype.add = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.add', function(data){

		var themeID = data.mainThemeID;
		var formatID = data.formatID;
		console.fs(' FormatID: ');
		console.fs( formatID );
		console.time('dodanie');

		Format.findOne({_id: formatID}, function(err, ft) {

			if(!err && ft !== null){

				var themeExist = false;

				for(var i = 0;i<ft.Themes.length;i++){

		            if( ft.Themes[i]._id == themeID ){

		            	themeExist = true;

		            }

		        }

		        if( !themeExist ){

		        	MainTheme.findOne({_id: themeID}, function(err, actTheme){

		        		if(!err && actTheme !== null){

		        			var newTheme = new Theme();
		        			newTheme.name = actTheme.name;
		        			newTheme.MainTheme = actTheme;

		        			if( actTheme.ThemePages !== undefined && actTheme.ThemePages !== null && actTheme.ThemePages.length > 0 ){

		        				// narazie tak ma być bo nie ma edytora motywów !
		        				newTheme.toCopy = false;

		        			} else {

		        				newTheme.toCopy = false;

		        			}


		        			if( actTheme.url !== undefined ){

		        				var url = actTheme.url;
		        				var nameFile = url.split("/").pop();
								var sourceFile = conf.staticDir+'themes/mainThemeMin/'+ themeID + '/' + themeID + '.jpg';
		        			}

		        			newTheme.save(function(err,th) {

		        				if( !err && th !== null ){

		        					var dir = conf.staticDir+'themes/themeMin/' + newTheme._id + '/';
		        					var targetFile = dir+th._id+'.jpg';
		        					mainConf.mkdir(dir);

		        					if( sourceFile !== undefined ){

		        						fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
										th.url = conf.staticPath+'/themes/themeMin/'+th._id+'/'+th._id+'.jpg';

		        					} else {

		        						th.url = '';

		        					}

									th.save( function(err, savedTH) {

										if(err){

											console.fs(err);

										}

										Format.findOne({_id: formatID}, function(err, ft) {

			        						//console.fs(apt);
			        						ft.Themes.push(th);

			        						ft.save(function(err, saved) {

			        							var newArr = [];
			        							newArr.push( th );
			        							Format.findOne({_id: formatID}, function(err, ft) {
			        								socket.emit(socketName+'.added', ft.Themes);
			        							}).lean().populate('Themes','_id name url');

			        						});

			        					});

									});

		        				}
							});
		        		}
		        	});//.populate('ThemePages');
		        } else {
		        	socket.emit(socketName+'.existTheme', 'Motyw istnieje już w formacie');
		        }
			}
		}).lean().populate('Themes','_id name url');
	});
};



/**
 * @method copy
 * @return {[type]} [description]
 */
ThemeController.prototype.copyThemes = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.copyThemes', function(data){
		var formatID = data.formatID;
		var themesData = data.themes;

		console.time('copyThemes');
		console.fs('copyTheme');
		//console.fs(data);
		//
		var backgroundObjectsSaved = false;
		var foregroundObjectsSaved = false;
		var usedImagesSaved = false;
		var proposedTemplatesSaved = false;
		var count = 0;
		var countThemes = 0;
		var themesToSave = [];


		// Funkcja zapisujaca format z nowymi motywami
		function updateFormat(){

			console.fs('ILE RAZY TU JESTEM??');
			console.fs(themesToSave);

			Format.findById( formatID, function( err, _format ){

				if( err ){

					console.fs( err );

				}
				else {

					for( var i=0; i < themesToSave.length; i++ ){

						_format.Themes.push( themesToSave[i] );

					}

					_format.save( function( err, _formatUpdated ){

						if( err ){

							console.fs( err );

						}
						else {

							Format.findById( _formatUpdated._id ).deepPopulate('Themes').exec( function( err, _formatUpdated  ){

								console.fs( _formatUpdated );
								console.fs('Format zostal zaaktualizowany!!! :)');

								if( _formatUpdated.Themes !== null ){
									_formatUpdated.ThemesToCopy = [];

									var countThemes = _formatUpdated.Themes.length;
									for(var i=0;i<countThemes;i++){
										console.fs( 'Licznik wynosi: ' + i );
										if(_formatUpdated.Themes[i].toCopy === true){
											_formatUpdated.ThemesToCopy.push(_formatUpdated.Themes[i]);
											_formatUpdated.Themes.remove(i,i);
											i--;
											countThemes--;
										}
									}
									console.fs( 'Koniec TUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU!' );
								}

								socket.emit('Theme.addThemeToCopy', _formatUpdated.ThemesToCopy );

							});

						}

					});

				}

			});

		}; // koniec funkcji zapisujacej nowe motywy do formatu


		Theme.find({_id : {$in: themesData}}).deepPopulate('ThemePages').exec(function (err, themes) {

			if( err ){

				console.fs( err );

			}

			countThemes = themes.length;


			function copyTheme( theme ){

				console.fs( theme );
				console.fs('co jest do skopiowania');

				var editorBitmapsBackgroundCount = 0;
				var editorBitmapsForegroundCount = 0;
				var editorTextsBackgroundCount = 0;
				var editorTextsForegroundCount = 0;
				var themePagesCount = theme.ThemePages.length;

				for( var page = 0; page < theme.ThemePages.length; page++ ){

					editorBitmapsBackgroundCount += theme.ThemePages[page].backgroundObjects.EditorBitmaps.length;
					editorBitmapsForegroundCount += theme.ThemePages[page].foregroundObjects.EditorBitmaps.length;
					editorTextsBackgroundCount += theme.ThemePages[page].backgroundObjects.EditorTexts.length;
					editorTextsForegroundCount += theme.ThemePages[page].foregroundObjects.EditorTexts.length;

				}

				console.fs( 'dane jakie mam' );
				console.fs( 'themePagesCount: ' + themePagesCount );
				console.fs( 'editorTextsBackgroundCount: ' + editorTextsBackgroundCount );
				console.fs( 'editorTextsForegroundCount: ' + editorTextsForegroundCount );
				console.fs( 'editorBitmapsBackgroundCount: ' + editorBitmapsBackgroundCount );
				console.fs( 'editorBitmapsForegroundCount: ' + editorBitmapsForegroundCount );

				var themeData = {

					name : theme.name,
					MainTheme :theme.MainTheme,
					toCopy: true

				};

				var copiedTheme = new Theme( themeData );

				var oldThemeSource = conf.staticDir + 'themes/themeMin/' + theme._id;
				var oldSourceThemeImage = oldThemeSource + '/' + theme._id + '.jpg';

				var newThemeSource = conf.staticDir + 'themes/themeMin/' + copiedTheme._id;
				var newSourceThemeImage = newThemeSource + '/' + copiedTheme._id + '.jpg';

				copiedTheme.url = conf.staticPath+ '/themes/themeMin/' + copiedTheme._id + '/' + copiedTheme._id + '.jpg';
				fs.mkdirSync( newThemeSource );
				fs.createReadStream( oldSourceThemeImage ).pipe( fs.createWriteStream( newSourceThemeImage ) );


				copiedTheme.save( function( err, _copiedTheme ){

					if( err ){

						console.fs( err );

					}
					else {

						var promiseCalled = false;
						var _themeWasSaved = false;

						function promise(){

							if( editorBitmapsBackgroundCount + editorBitmapsForegroundCount + editorTextsBackgroundCount + editorTextsForegroundCount + themePagesCount == 0  ){


								console.fs('teraz moge zapisac motyw!');

								_copiedTheme.save( function( err, _copiedThemeSaved ){

									if( err ){

										console.fs( err );

									}
									else {

										// dodanie do tablicy motywów oczekujacych na zapianie
										if( themesToSave.indexOf( _copiedThemeSaved._id ) < 0 ){

											themesToSave.push( _copiedThemeSaved._id );

										}

										if( themesToSave.length == countThemes ){

											updateFormat();

										}

									}


								});


							}

						};

						// promis w wypadku gdy dany motyw nie posiada zadnych stron lokalnych
						promise();

						var themePAgesCount = 0;

						function copyThemePage( themePage ){

							ThemePage.findById( themePage._id ).deepPopulate('backgroundObjects.EditorBitmaps foregroundObjects.EditorBitmaps backgroundObjects.EditorTexts foregroundObjects.EditorTexts').exec( function( err, themePage ){

								if( err ){

									console.fs( err );

								}
								else {

									var themePageData = {

										name : themePage.name,
										width : themePage.width,
										height : themePage.height,
										order : themePage.order,
										ThemePageFrom: themePage.ThemePageFrom
									};

									var pageBackgroundBitmapsCount = themePage.backgroundObjects.EditorBitmaps.length;
									var pageForegroundBitmapsCount = themePage.foregroundObjects.EditorBitmaps.length;
									var pageBackgroundTextsCount = themePage.backgroundObjects.EditorTexts.length;
									var pageForegroundTextsCount = themePage.foregroundObjects.EditorTexts.length;

									var copiedThemePage = new ThemePage( themePageData );

									copiedThemePage.save( function( err, _copiedThemePage ){

										if( err ){

											console.fs( err );

										}
										else {

											// dodanie strony do kopi motywu
											themePAgesCount++;
											console.fs('====-=====-=-=====-======-======-');
											console.fs( themePAgesCount );
											_copiedTheme.ThemePages.push( _copiedThemePage );
											themePagesCount--;

											var updateThemeCount = 0;
											// trzeba wywolac po dodaniu wszystkich obiektów do strony motywu
											function updateThemePage(){

												var themeWasUpdated = false;

												if( pageBackgroundBitmapsCount == 0 && pageForegroundBitmapsCount == 0 && pageBackgroundTextsCount == 0 && pageForegroundTextsCount == 0 ){
													updateThemeCount++;

													themeWasUpdated = true;

													_copiedThemePage.save( function( err, _copiedThemePageUpdated ){

														if( err ){

															console.fs( err );

														}
														else {

															var oldSource = conf.staticDir + 'themes/themeMin/' + theme._id;
															var oldSourcePageImage = oldSource + '/' + themePage._id + '.jpg';

															var newSource = conf.staticDir + 'themes/themeMin/' + _copiedTheme._id;
															var newSourcePageImage = newSource + '/' + copiedThemePage._id + '.jpg';



															if (  fs.existsSync( newSource ) ){

																	if( fs.existsSync( oldSourcePageImage )  ){

																		fs.createReadStream( oldSourcePageImage ).pipe( fs.createWriteStream( newSourcePageImage ) );

																		_copiedThemePage.url = conf.staticPath+ '/themes/themeMin/' + _copiedTheme._id + '/' + copiedThemePage._id + '.jpg';
																		_copiedThemePage.save( function( err, _copiedThemePageLastUpdate ){

																			if(err){

																				console.fs( err );

																			}
																			else {

																				if( !_themeWasSaved && editorBitmapsBackgroundCount + editorBitmapsForegroundCount + editorTextsBackgroundCount + editorTextsForegroundCount + themePagesCount == 0 ){

																					console.fs( editorBitmapsBackgroundCount + editorBitmapsForegroundCount + editorTextsBackgroundCount + editorTextsForegroundCount + themePagesCount );
																					console.fs('proba zapisania');
																					_themeWasSaved = true;
																					promise();

																				}


																			}

																		});

																	}
																	else {

																		console.fs('Brak zdjecia strony motywu! (' + oldSourcePageImage + ')' );

																	}

																}
																else {

																	fs.mkdirSync( newSource );

																	if( fs.existsSync( oldSourcePageImage )  ){

																		fs.createReadStream( oldSourcePageImage ).pipe( fs.createWriteStream( newSourcePageImage ) );

																		_copiedThemePage.url = conf.staticPath+ '/themes/themeMin/' + _copiedTheme._id + '/' + copiedThemePage._id + '.jpg';
																		_copiedThemePage.save( function( err, _copiedThemePageLastUpdate ){

																			if(err){

																				console.fs( err );

																			}
																			else {


																				if( !_themeWasSaved ){
																					console.fs( editorBitmapsBackgroundCount + editorBitmapsForegroundCount + editorTextsBackgroundCount + editorTextsForegroundCount + themePagesCount );
																					console.fs('proba zapisania');
																					_themeWasSaved = true;
																					promise();

																				}

																			}

																		});

																	}
																	else {

																		console.fs('Brak zdjecia strony motywu! (' + oldSourcePageImage + ')' );

																	}

																}

														}

													});

												}

											}; // koniec updateThemePage()

											var saved_ = 1;

											function checkEnd(){

												if( pageBackgroundBitmapsCount == 0 && pageForegroundBitmapsCount == 0 && pageBackgroundTextsCount == 0 && pageForegroundTextsCount == 0  ){

													saved_=0;
													console.fs('Wszystko jest gotowe do zapisania!:)  -- : ' + _copiedTheme._id);

												}

											};

											// brakuje kopiowania szablonów pozycji proponowanych !!!
											function copyEditorBitmap( editorBitmap, place ){

												var editorBitmap = editorBitmap.toJSON();
												delete editorBitmap._id;

												var newEditorBitmap = new EditorBitmap( editorBitmap );

												newEditorBitmap.save( function( err, _bitmap ){

													if( err ){

														console.fs( err );

													}
													else {

														console.fs('zapisano bitampe');

														_copiedThemePage[place].EditorBitmaps.push( _bitmap );
														if( place == 'backgroundObjects' ){

															editorBitmapsBackgroundCount--;
															pageBackgroundBitmapsCount--;
															console.fs('licznik bitmap: bg:' + pageBackgroundBitmapsCount + ' fg:'+pageForegroundBitmapsCount);

														}
														else {

															editorBitmapsForegroundCount--;
															pageForegroundBitmapsCount--;
															console.fs('licznik bitmap: bg:' + pageBackgroundBitmapsCount + ' fg:'+pageForegroundBitmapsCount);

														}

														if( pageBackgroundBitmapsCount + pageForegroundBitmapsCount + pageBackgroundTextsCount + pageForegroundTextsCount == 0 && saved_ ){

															saved_ = 0;
															checkEnd();
															updateThemePage();

														}

														console.fs('zapisano bitampe --- koniec');

													}

												});

											};// koniec funkcji kopiujacej bitmapy

											function copyEditorText( editorText, place ){

												var editorText = editorText.toJSON();
												delete editorText._id;

												newEditorText = new EditorText( editorText );

												newEditorText.save( function( err, _text ){

													if( err ){

														console.fs( err );

													}
													else {

														_copiedThemePage[place].EditorTexts.push( _text );

														if( place == 'backgroundObjects' ){

															editorTextsBackgroundCount--;
															pageBackgroundTextsCount--;

														}
														else {

															editorTextsForegroundCount--;
															pageForegroundTextsCount--;

														}

														if( pageBackgroundBitmapsCount + pageForegroundBitmapsCount + pageBackgroundTextsCount + pageForegroundTextsCount == 0 && saved_ ){

															saved_ = 0;
															checkEnd();
															updateThemePage();

														}

													}

												});

											};// koniec funkcji kopiujacej teksty

											// kopiowanie bitmapy z backgrounda
											for( var editorBitmap=0; editorBitmap < themePage.backgroundObjects.EditorBitmaps.length; editorBitmap++ ){

												copyEditorBitmap( themePage.backgroundObjects.EditorBitmaps[editorBitmap], 'backgroundObjects' );

											}

											// kopiowanie bitmapy z foregrounda
											for( var editorBitmap=0; editorBitmap < themePage.foregroundObjects.EditorBitmaps.length; editorBitmap++ ){

												copyEditorBitmap( themePage.foregroundObjects.EditorBitmaps[editorBitmap], 'foregroundObjects' );

											}

											// kopiowanie tekstow z backgrounda
											for( var editorText=0; editorText < themePage.backgroundObjects.EditorTexts.length; editorText++ ){

												copyEditorText( themePage.backgroundObjects.EditorTexts[editorText], 'backgroundObjects' );

											}

											// kopiowanie tekstow z foregrounda
											for( var editorText=0; editorText < themePage.foregroundObjects.EditorTexts.length; editorText++ ){

												copyEditorText( themePage.foregroundObjects.EditorTexts[editorText], 'foregroundObjects' );

											}


										}//koniec elsa funkcji zapisujacej skopiowana strone

									});//koniec funkcji zapisujacej skopiowana strone
								}

							});// koniec funkcji wyszukujacej strony motywu z deep populate





						};//koniec funkcji kopiujacej strony


						for( var i=0; i < themePagesCount; i++ ){

							copyThemePage( theme.ThemePages[i] );

						}


					}


				});
				// koniec sava skopiowanego theme

			};

			//console.fs( themes );
			//return;
			//var themeFinished = false;;
			//var editorBitmapFinished = false;
			//var themePageFinished = false;
			var formatFinished = false;

			var themePagesCount = 0;
			var editorBitmapsBackgroundCount = 0;
			var editorBitmapsForegroundCount = 0;
			var editorTextsBackgroundCount   = 0;
			var editorTextsForegroundCount   = 0;
			var themeCount                   = themes.length;

			for( var i=0; i < themes.length; i++ ){

				copyTheme( themes[i] );

				themePagesCount += themes[i].ThemePages.length;

				// zlicznie wszystkich elementów do skopiowania
				for( var page = 0; page < themes[i].ThemePages.length; page++ ){

					editorBitmapsBackgroundCount += themes[i].ThemePages[page].backgroundObjects.EditorBitmaps.length;
					editorBitmapsForegroundCount += themes[i].ThemePages[page].foregroundObjects.EditorBitmaps.length;
					editorTextsBackgroundCount += themes[i].ThemePages[page].backgroundObjects.EditorTexts.length;
					editorTextsForegroundCount += themes[i].ThemePages[page].foregroundObjects.EditorTexts.length;

				}

			}

			return;

		});

	});
};

ThemeController.prototype.getAll = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.getAll', function(data) {
		var formatID = data.formatID;
		Format.findOne({_id: formatID}, function(err, ft) {
			if(!err && ft !== null){
				//console.fs(ft.Themes);
				socket.emit(socketName+'.getAll',ft.Themes);
			}
		}).lean().populate('Themes','_id name');
	});
};


ThemeController.prototype.cloneCopiedPage = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.cloneCopiedPage', function( data ) {

		var themePageID = data.themePageID;
		var themeID = data.themeID;
		var url = '';

		function getFormatFromTheme( themeID ){

			var def = Q.defer();

			Format.findOne({ 'Themes':  themeID  }, function( err, _format ) {

				if( err ){
					console.fs(err);
					def.reject(err);
				}

				def.resolve(_format);

			});

			return def.promise;
		}

		ThemePage.findById( themePageID ).deepPopulate('proposedTemplates proposedTemplates.ProposedTexts proposedTemplates.ProposedImages backgroundObjects.EditorBitmaps.ProjectImage foregroundObjects.EditorTexts backgroundObjects.EditorTexts foregroundObjects.EditorBitmaps.ProjectImage UsedImages.ProjectImage').exec(function(err, themePageToCopy ){

			if( err ) {
				console.fs( err );
			} else {

				var copiedImage = false;

				var backgroundEditorBitmapsCount = themePageToCopy.backgroundObjects.EditorBitmaps.length;
				var foregroundEditorBitmapsCount = themePageToCopy.foregroundObjects.EditorBitmaps.length;
				var backgroundEditorTextsCount = themePageToCopy.backgroundObjects.EditorTexts.length;
				var foregroundEditorTextsCount = themePageToCopy.foregroundObjects.EditorTexts.length;
				var proposedTemplatesCount = themePageToCopy.proposedTemplates.length;
				//console.fs( themePageToCopy );

				console.fs('ILE JEST RZECZY DO SKOPIOWANIA: ' + (backgroundEditorBitmapsCount+foregroundEditorBitmapsCount+backgroundEditorTextsCount+foregroundEditorTextsCount+proposedTemplatesCount) );

				var themePageData = {

					order : themePageToCopy.order,
					name : themePageToCopy.name,
					vacancy : themePageToCopy.vacancy
					//width : format.width,
					//height : format.height

				};

				var copiedThemePage = new ThemePage( themePageData );

				function promise(){

					/*
					console.log( backgroundEditorBitmapsCount );
					console.log( foregroundEditorBitmapsCount );
					console.log( backgroundEditorTextsCount );
					console.log( foregroundEditorTextsCount );
					console.log( proposedTemplatesCount );
					console.log( backgroundEditorBitmapsCount + foregroundEditorBitmapsCount + backgroundEditorTextsCount + foregroundEditorTextsCount + proposedTemplatesCount );
					console.log('^^^');
					*/

					if( ( backgroundEditorBitmapsCount + foregroundEditorBitmapsCount + backgroundEditorTextsCount + foregroundEditorTextsCount + proposedTemplatesCount ) == 0 && copiedImage ){

						var parentFormat = getFormatFromTheme( themeID );
						parentFormat.then( function (format){

							copiedThemePage.width = format.width;
							copiedThemePage.height = format.height;

							copiedThemePage.save( function( err, copiedThemePage ){

								if( err ){

									console.fs( err );

								}
								else {

									Theme.findById( themeID, function( err, _theme ){

										if( err ){
											console.fs(err);

										}
										else {

											_theme.ThemePages.push( copiedThemePage );

											// zapisanie motywu ze skopiowana strona
											_theme.save( function( err, _theme ){

												if( err ){

													console.fs( err );

												} else {

													data.url = url;
													data.newThemePageID = copiedThemePage._id;

													socket.emit( socketName+'.cloneCopiedPage' , data );
													console.fs('strona zostala pomyślnie skopiowana!!! :)');
												}


											});

										}

									});


								}

							});

						});

					}

				};


				function copyEditorBitmap( editorBitmap, place ){

					var editorBitmap = editorBitmap.toJSON();

					delete editorBitmap._id;
					var newEditorBitmap = new EditorBitmap( editorBitmap );

					newEditorBitmap.save( function( err, _bitmap ){

						if( err ){

							console.fs( err );

						}
						else {

							copiedThemePage[place].EditorBitmaps.push( _bitmap );
							if( place == 'backgroundObjects' )
								backgroundEditorBitmapsCount--;
							else
								foregroundEditorBitmapsCount--;

							promise();

						}

					});

				};

				function copyEditorText( editorText, place ){

					var editorText = editorText.toJSON();
					delete editorText._id;

					newEditorText = new EditorText( editorText );

					newEditorText.save( function( err, _text ){

						if( err ){

							console.fs( err );

						}
						else {

							copiedThemePage[place].EditorTexts.push( _text );

							if( place == 'backgroundObjects' )
								backgroundEditorTextsCount--;
							else
								foregroundEditorTextsCount--;

							promise();

						}

					});

				};


				function copyProposedTemplate( proposedTEmplate ){

					var templID = proposedTEmplate._id;

					var proposedTEmplate = proposedTEmplate.toJSON();
					delete proposedTEmplate._id;

					var proposedImages = [];
					var proposedTexts = [];

					for( var i=0; i < proposedTEmplate.ProposedImages.length; i++ ){

						delete proposedTEmplate.ProposedImages[i]._id;
						delete proposedTEmplate.ProposedImages[i].__v;

						var proposedImage = new ProposedImage( proposedTEmplate.ProposedImages[i] );

						proposedImage.save( function( err, pImage ){

							if( err ){

								console.fs( err );

							}else {

								proposedImages.push( pImage );
								promis2();

							}

						});

					}

					for( var i=0; i < proposedTEmplate.ProposedTexts.length; i++ ){

						delete proposedTEmplate.ProposedTexts[i]._id;
						delete proposedTEmplate.ProposedTexts[i].__v;

						console.log( proposedTEmplate.ProposedTexts[i] );

						var proposedText = new ProposedText( proposedTEmplate.ProposedTexts[i] );

						proposedText.save( function( err, savedText ){

							if( err ){

								console.fs( err );

							}else {

								proposedTexts.push( savedText );
								promis2();

							}

						});

					}

					function promis2(){

						/*
						console.log('++++++++++++++++++++++++++++++++++++');
						console.log( proposedImages.length );
						console.log( proposedTEmplate.ProposedImages.length);
						console.log( proposedTexts.length );
						console.log( proposedTEmplate.ProposedTexts.length );

						console.log('************************************');
						*/

						if( proposedImages.length == proposedTEmplate.ProposedImages.length && proposedTexts.length == proposedTEmplate.ProposedTexts.length ){

							/*
							console.log( proposedImages.length );
							console.log( proposedTexts.length );
							console.log( 'szablon zostalskopiowany :)' );
							*/

							var copiedTemplate = new ProposedTemplate();

							copiedTemplate.imagesCount = proposedTEmplate.imagesCount;
							copiedTemplate.textsCount = proposedTEmplate.textsCount;
							copiedTemplate.height = proposedTEmplate.height;
							copiedTemplate.width = proposedTEmplate.width;
							copiedTemplate.ProposedImages = proposedImages;
							copiedTemplate.ProposedTexts = proposedTexts;

							copiedTemplate.save( function( err, saved){

								if( err ){

									console.fs( err );

								}else {

									var dir = conf.staticDir+'proposedTemplates_min/'+saved._id+'/';
									//console.log(dir);
									confLib.mkdir(dir);

									var sourceFile = conf.staticDir+'proposedTemplates_min/' + templID + '/' + templID +'.jpg';
							 		fs.createReadStream( sourceFile ).pipe( fs.createWriteStream( dir + '' + saved._id + '.jpg' ) );

							 		saved.url = conf.staticPath+'/proposedTemplates_min/'+saved._id+'/'+saved._id+'.jpg';

							 		saved.save( function( err, ok ){

							 			if( err ){

							 				console.fs( err );

							 			}else {

							 				copiedThemePage.proposedTemplates.push( ok );
											proposedTemplatesCount--;
											promise();

							 			}


							 		});


								}

							});


						}

					}

				}


				url = themePageToCopy.url;

		 		if( url !== undefined ){

		 			var newDir = conf.staticDir+'themes/themeMin/'+themeID+'/';

			 		var sourceFile = conf.staticDir+'themes/themeMin/'+themeID+'/'+themePageID+'.jpg';
			 		fs.createReadStream( sourceFile ).pipe( fs.createWriteStream( newDir + '' + copiedThemePage._id + '.jpg' ) );

			 		copiedThemePage.url = conf.staticPath+'/themes/themeMin/'+themeID+'/'+ copiedThemePage._id + '.jpg';

			 		url = copiedThemePage.url;

			 		copiedImage = true;

			 		promise();

			 	}



				for( var i=0; i < themePageToCopy.backgroundObjects.EditorBitmaps.length; i++ ){

					copyEditorBitmap( themePageToCopy.backgroundObjects.EditorBitmaps[i], 'backgroundObjects' );

				}

				for( var i=0; i < themePageToCopy.foregroundObjects.EditorBitmaps.length; i++ ){

					copyEditorBitmap( themePageToCopy.foregroundObjects.EditorBitmaps[i], 'foregroundObjects' );

				}

				for( var i=0; i < themePageToCopy.backgroundObjects.EditorTexts.length; i++ ){

					copyEditorText( themePageToCopy.backgroundObjects.EditorTexts[i], 'backgroundObjects' );

				}

				for( var i=0; i < themePageToCopy.foregroundObjects.EditorTexts.length; i++ ){

					copyEditorText( themePageToCopy.foregroundObjects.EditorTexts[i], 'foregroundObjects' );

				}

				for( var i=0; i < themePageToCopy.proposedTemplates.length; i++ ){

					copyProposedTemplate( themePageToCopy.proposedTemplates[i] );

				}

			}

		});

		return;

	});

};

ThemeController.prototype.get = function() {

	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.get', function(data) {
		var themeID = data.themeID;
		Theme.findOne({_id: themeID}).deepPopulate('ThemePages ThemePages.proposedTemplates MainTheme.ProjectPhotos MainTheme.ProjectBackgrounds MainTheme.ProjectCliparts MainTheme.ProjectMasks').exec( function(err, theme) {

			var allCloned = [];
			var copiedPages = [];
			var mainPages = [];
			var localPages = [];

			if(err){
				console.fs(err);
			} else {

				mainThemeID = theme.MainTheme;
				if( typeof theme.ThemePages !== undefined && theme.ThemePages !== null ){
					for(var i = 0;i<theme.ThemePages.length;i++){

			            if( theme.ThemePages[i].ThemePageFrom !== undefined && theme.ThemePages[i].ThemePageFrom !== null ){
			            	//theme.ThemePages[i].cloned = theme.ThemePages[i].ThemePageFrom._id;
			            	//console.fs(typeof theme.ThemePages[i].ThemePageFrom);
			            	//console.fs(typeof theme.ThemePages[i].ThemePageFrom.toString());
			            	allCloned.push(theme.ThemePages[i].ThemePageFrom.toString());
			            	theme.ThemePages[i].cloned = true;
			            	copiedPages.push(theme.ThemePages[i]);
			            } else {
			            	theme.ThemePages[i].local = true;
			            	localPages.push(theme.ThemePages[i]);
			            }
			        }

				}

				MainTheme.findOne({_id: mainThemeID}).lean().deepPopulate('ThemePages ThemePages.proposedTemplates').exec( function(err, mt) {

					if(err){
						console.fs(err);
					}
					if( mt.ThemePages !== undefined && mt.ThemePages !== null ){

						var toSplice = [];

						removed=0;
						var tpLength = mt.ThemePages.length;
						for(var i = 0;i<tpLength;i++){

							if(allCloned.indexOf(mt.ThemePages[i-removed]._id+"")===-1){
								mt.ThemePages[i-removed].notused = true;
							} else {
								//toSplice.push(i);
								mt.ThemePages.splice(i-removed, 1);
								removed++;
								//mt.ThemePages[i].used = true;
							}
						}
						//mainPages = toSplice.diff(mt.ThemePages);
						mainPages = mt.ThemePages;

					}
					//console.fs(pages);
					//console.fs(mainPages);


					for( var i=0; i < mainPages.length; i++ ){
						console.log( mainPages[i] );
						console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
						mainPages[i].mainThemeID = mainThemeID;

					}

					var _data = {

						pages : {'copiedPages': copiedPages, 'mainPages': mainPages, 'localPages': localPages},
						mainThemeID : mainThemeID,
						themeID : themeID

					};

					theme = theme.toJSON();
					theme.usedPages = _data.pages;
					socket.emit(socketName+'.get', theme);
					//socket.emit(socketName+'._getUsedPages', _data);

				});//.lean().populate('ThemePages');



			}
		});
	});
};

/**
 * Theme.toCopy
 * Filtrujemy theme po fladze toCopy
 * @param {Integer} [data.formatID] ID formatu
 */
ThemeController.prototype.toCopy = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.toCopy', function(data){

	});
};

module.exports = ThemeController;
