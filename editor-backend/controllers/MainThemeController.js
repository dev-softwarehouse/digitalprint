var util = require('util'),
	fs = require('fs');
console.fs = require('../libs/fsconsole.js');

//var app = require('../app.js');
var conf = require('../confs/main.js');
var mainConf = require('../libs/mainConf.js');

var generatorUID = require('../libs/generator.js');


var Controller = require("../controllers/Controller.js");
var MainTheme = require('../models/MainTheme.js').model;
var ThemeCategory = require('../models/ThemeCategory.js').model;
var ThemePage = require('../models/ThemePage.js').model;
var EditorBitmap = require('../models/EditorBitmap.js').model;
var EditorText = require('../models/EditorText.js').model;
var ProjectImage = require('../models/ProjectImage.js').model;
var AdminAsset = require('../models/AdminAssets.js').model;
var _ = require('underscore');

function MainThemeController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "MainThemeController";
    this.socketName = "MainTheme";
}

util.inherits(MainThemeController, Controller);

MainThemeController.prototype.addMasksFromAssets = function(){

	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on(socketName+'.addMasksFromAssets', function(data) {

		var assetsIds = data.ids;
		
			MainTheme.findOne( { _id: data.themeID }, function( err, theme ){
		
				AdminAsset.find({ _id: { $in: assetsIds } }).exec( function( err, assets ){
	
					for( var i=0; i < assets.length; i++ ){
	
						if( !_.find( theme.ProjectMasks, assets[i].reference  ) ){
	
							theme.ProjectMasks.push( assets[i].reference );
	
						}
	
					}
	
					theme.save( function( err, saved ){
	
						console.log( saved );
						console.log('DODANO :)');
	
					});
	
				});
	
			})

	});

};

MainThemeController.prototype.addBackgroundsFromAssets = function(){
	
	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on(socketName+'.addBackgroundsFromAssets', function(data) {

		var assetsIds = data.ids;

		MainTheme.findOne( { _id: data.themeID }, function( err, theme ){

			console.log( theme );
			console.log( data.themeID );

			AdminAsset.find({ _id: { $in: assetsIds } }).exec( function( err, assets ){

				for( var i=0; i < assets.length; i++ ){

					if( !_.find( theme.ProjectBackgrounds, assets[i].reference  ) ){

						console.log('DODAJEEEEEEEEEEEEE');
						theme.ProjectBackgrounds.push( assets[i].reference );

					}

				}

				theme.save( function( err, saved ){

					console.log( saved );
					console.log('DODANO :)');

				});

			});

		})

	});


}


MainThemeController.prototype.addClipartsFromAssets = function(){
	
	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on(socketName+'.addClipartsFromAssets', function(data) {

		var assetsIds = data.ids;

		MainTheme.findOne( { _id: data.themeID }, function( err, theme ){

			console.log( theme );
			console.log( data.themeID );

			AdminAsset.find({ _id: { $in: assetsIds } }).exec( function( err, assets ){

				for( var i=0; i < assets.length; i++ ){

					if( !_.find( theme.ProjectCliparts, assets[i].reference  ) ){
						
						console.log('DODAJEEEEEEEEEEEEE');
						theme.ProjectCliparts.push( assets[i].reference );

					}

				}

				theme.save( function( err, saved ){

					console.log( saved );
					console.log('DODANO :)');

				});

			});

		})

	});


}


MainThemeController.prototype.addImagesFromAssets = function(){
	
	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on(socketName+'.addImagesFromAssets', function(data) {

		var assetsIds = data.ids;

		MainTheme.findOne( { _id: data.themeID }, function( err, theme ){

			console.log( theme );
			console.log( data.themeID );

			AdminAsset.find({ _id: { $in: assetsIds } }).exec( function( err, assets ){

				for( var i=0; i < assets.length; i++ ){

					if( !_.find( theme.ProjectPhotos, assets[i].reference  ) ){
						
						console.log('DODAJEEEEEEEEEEEEE');
						theme.ProjectPhotos.push( assets[i].reference );

					}

				}

				theme.save( function( err, saved ){

					console.log( saved );
					console.log('DODANO :)');

				});

			});

		})

	});


}
MainThemeController.prototype.remove = function(  ) {

    var socketName = this.socketName;
    var socket = this.socket;
    socket.on(socketName+'.remove', function(data) {
        MainTheme.deleteOne({ _id : data.ID }, function( err, theme ){
        	if(err){
                console.fs( err );
			}else{
                console.fs( 'ok' );
                socket.emit(socketName+'.removed', theme._id);
			}
		})
    })
}


MainThemeController.prototype.removeProjectImage = function(  ){

	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on(socketName+'.removeProjectImage', function(data) {

		console.fs( data );
		console.fs( 'proba usuniecia projectImage z motywu' );

		MainTheme.findOne({ _id : data.mainThemeID }, function( err, theme ){

			if( err ){

				console.fs( err );

			}else {

				if( data.place == 'themeImagesPhotos' ){

					console.fs('usuniecie zdjec');

				}else if( data.place == 'themeImagesBackgrounds' ){

					console.fs( 'usuniecie tla' );

				}else if( data.place == 'themeCliparts' ){

					console.fs( 'usuniecie clipartu' );

				}
				else {

					console.fs('error podczas usuwania projectImage z motywu glownego');

				}


				//console.fs( theme );
				console.fs('MOTYW ZOSTAL ODNALEZIONY :)');

			}

		});

	});

};

MainThemeController.prototype.addProjectBackground = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.addProjectBackground', function( data ){

		var mainThemeID = data.mainThemeID;
		delete data.mainThemeID;

		var newProjectImage = new ProjectImage( data );

		newProjectImage.save( function( err, _newProjectImage ){

			if( err ){

				console.fs( err );

			}
			else {

				MainTheme.findById( mainThemeID, function( err, _mainTheme ){

					if( err ){

						console.fs( err );

					}
					else {

						_mainTheme.ProjectBackgrounds.push( _newProjectImage );

						_mainTheme.save( function( err, _updatedMainTheme ){

							if( err ){

								console.fs( err );

							}
							else {

								console.fs( 'MAIN THEME ZOSTAL ZAAKTUALIZOWANY!!! JURWEA' );

							}

						});

					}

				});

			}

		});

	});

}


MainThemeController.prototype.addProjectClipart = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.addProjectClipart', function( data ){

		var mainThemeID = data.mainThemeID;
		delete data.mainThemeID;

		var newProjectImage = new ProjectImage( data );

		newProjectImage.save( function( err, _newProjectImage ){

			if( err ){

				console.fs( err );

			}
			else {

				MainTheme.findById( mainThemeID, function( err, _mainTheme ){

					if( err ){

						console.fs( err );

					}
					else {

						_mainTheme.ProjectCliparts.push( _newProjectImage );
						console.fs( mainThemeID );
						console.fs( _mainTheme );

						_mainTheme.save( function( err, _updatedMainTheme ){

							if( err ){

								console.fs( err );

							}
							else {

								console.fs( _updatedMainTheme );
								console.fs( 'MAIN THEME ZOSTAL ZAAKTUALIZOWANY!!! JURWEA' );

							}

						});

					}

				});

			}

		});

	});

}


MainThemeController.prototype.addProjectPhoto = function(){

	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.addProjectPhoto', function( data ){

		var mainThemeID = data.mainThemeID;
		delete data.mainThemeID;

		var newProjectImage = new ProjectImage( data );

		newProjectImage.save( function( err, _newProjectImage ){

			if( err ){

				console.fs( err );

			}
			else {
				
				MainTheme.findById( mainThemeID, function( err, _mainTheme ){

					if( err ){

						console.fs( err );

					}
					else {

						_mainTheme.ProjectPhotos.push( _newProjectImage );
						console.fs( mainThemeID );
						console.fs( _mainTheme );

						_mainTheme.save( function( err, _updatedMainTheme ){

							if( err ){

								console.fs( err );

							}
							else {

								console.fs( _updatedMainTheme );
								console.fs( 'MAIN THEME ZOSTAL ZAAKTUALIZOWANY!!! JURWEA' );

							}

						});

					}

				});

			}

		});

	});

};


// metody
//
// MainTheme.add
MainThemeController.prototype.add = function() {

	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.add', function(data) {
		//console.fs('Dodaj motyw:');
		var newMainTheme = new MainTheme({name: data.name});

		ThemeCategory.findOne({_id: data.categoryID}, function(err, tc) {
			if(err){
				console.fs( err );
			}

			if( !err && tc !== null){
			    //console.fs(tc);
				newMainTheme.ThemeCategories.push(tc._id);
				newMainTheme.save( function(err, last) {
					if( data.base64 !== undefined ) {
						var dir = conf.staticDir+'themes/mainThemeMin/'+last._id;
						//console.log(dir);
						mainConf.mkdir(dir);
						var body = data.base64,
						  base64Data = body.replace(/^data:image\/png;base64,/,""),
						  binaryData = new Buffer(base64Data, 'base64').toString('binary');

						fs.writeFile(dir+'/'+last._id+".jpg", binaryData, "binary", function(err) {
							if(err){
								console.log(err);
							}
							last.url = conf.staticPath+'/themes/mainThemeMin/'+last._id+'/'+last._id+'.jpg';
							last.save( function(err, saved){
								if( err ){
									console.fs(err);
								}
								socket.emit(socketName+'.added', saved);
							});

						});
					} else {
						socket.emit(socketName+'.added', last);
					}
				});
			}
		});
		//console.log(socketName+'.added');

	});
};

MainThemeController.prototype.get = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.get', function(data) {
		MainTheme.findOne({_id: data.ID }, function(err, mt) {
			//console.fs(mt);
			if( err ){
				console.fs(err);
			}
			socket.emit(socketName+'.get', mt);
		}).populate('ThemeCategories');
	});
};

MainThemeController.prototype.update = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.update', function(data) {
		MainTheme.findOne({_id: data.ID }, function(err, mt) {
			//console.fs(mt);
			if( err ){
				console.fs(err);
			}
			if( data.name !== undefined ){
				mt.name = data.name;
			}
			if( data.base64 !== undefined ){
				var dir = conf.staticDir+'themes/mainThemeMin/'+mt._id+'/';
				//console.log(dir);
				mainConf.mkdir(dir);
				var body = data.base64,
				  base64Data = body.replace(/^data:image\/png;base64,/,""),
				  binaryData = new Buffer(base64Data, 'base64').toString('binary');


				if( mt.url === undefined ){
					var string = '';
				} else {
					var string =  mt.url;
				}

				var regex = /\_u([0-9]+)/;
				var result = string.match(regex);
				if( result !== null ){
					console.fs('liczba: '+result[1]);
					var number = Number(result[1])+1;
				} else {
				    var number = 1;
				}
				var fileOptions = {flags: 'w', encoding: 'binary'};
				fs.writeFile(dir+mt._id+".jpg", binaryData, fileOptions, function(err){
					if(err){
						console.fs(err);
					}
					mt.url = conf.staticPath+'/themes/mainThemeMin/'+mt._id+'/'+mt._id+'.jpg';
					console.fs('Zapisano!');
					mt.save( function(err, saved) {
						if(err){
							console.fs(err);
						}
						socket.emit(socketName+'.updated', saved);
					});
				});
			} else {
				mt.save( function(err, saved) {
					if(err){
						console.fs(err);
					}
					socket.emit(socketName+'.updated', saved);
				});
			}

		});
	});
};

MainThemeController.prototype.getAll = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.getAll', function(data) {
		MainTheme.find({}, function(err, mt) {
			if(err){
				console.fs(err);
			}
			socket.emit(socketName+'.getAll', mt);
		});
	});
};

MainThemeController.prototype.getPages = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.getPages', function(data) {
		var mainThemeID = data.mainThemeID;

		MainTheme.findOne({_id: mainThemeID}, function(err, mt) {

			if( err ){
				console.fs(err);
			}
			if( mt == null ){
				console.fs('Nie ma takiego motywu glównego');
			}
			//console.fs(mt);
			socket.emit(socketName+'.getPages', mt.ThemePages || []);
			/*if( typeof mt.ThemePages !== undefined && mt.ThemePages !== null && mt.ThemePages.length != 0 ){

				for(var i = 0;i<mt.ThemePages.length;i++){
		            mt.ThemePages[i].url = 'http://digitalprint.pro:'+conf.staticPath+'/min/'+mt._id+'/'+mt.ThemePages[i]._id+'.jpg';
		        }
		        //console.fs(mt.ThemePages);
		        console.fs('Jakoś tu wlazło');
				socket.emit(socketName+'.getPages', mt.ThemePages);
			} else {
				console.fs('Nie ma stron w motywie głównym!');
				socket.emit(socketName+'.getPages', []);
			}*/
		}).lean().populate('ThemePages');

	});
};

MainThemeController.prototype.getPage = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.getPage', function(data) {
		//console.log(data);
		var themePageID = data.themePageID;

		ThemePage.findById(themePageID).deepPopulate('backgroundObjects.EditorBitmaps.ProjectImage foregroundObjects.EditorBitmaps.ProjectImage').exec(function(err, page){
			if(err){
				console.fs(err);
			}
			//console.fs(page.backgroundObjects.EditorBitmaps.ProjectImage);
			socket.emit(socketName+'.getPage', page);
		});
	});
};

MainThemeController.prototype.addPage = function() {
	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.addPage', function(data) {

		MainTheme.findOne({_id: data.mainThemeID}, function(err, theme) {

			var themeID = data.mainThemeID;

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

									console.fs( savedThemePage );

									theme.ThemePages.push( saveEndThemePage );

									theme.save( function( err, updatedTheme ){

										if( err ){

											console.fs( err );

										}
										else {

											// wiadomosc zwrotna o dodaniu lokalnej strony, zawierw wszystkie strony motywu, powinna zawierac tylko dodane ( zeby zmniejszyc [rzeplyw danych])
											//console.fs( updatedTheme );
											//console.fs('motyw zostal zauktualizowany');

											var _data = {

												themeID : themeID

											};



											io.sockets.emit(socketName+'.addedPage', { page: savedThemePage, mainThemeID : theme._id} );
											//_this._getUsedPages( _data );
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
	                        dropShadow : text._dropShadow,
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
							borderColor : text.borderColor,
	                        borderWidth : text.borderWidth,
	                        displaySimpleBorder : text.displaySimpleBorder,
	                        dropShadow : text._dropShadow,
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

								foregroundTextObjectsCount--;
								console.fs('Ile Zostalo tekstów w foregroundzie do zapisania: ' + foregroundTextObjectsCount );
								savedThemePage.foregroundObjects.EditorTexts.push( _newText );

								promise();

							}

						});
					};


					function saveBackgroundImage( image ){

						var imageData = {

							name : image.name,
							width : image.width,
							height : image.height,
							rotation : image.rotation,
							scaleX : image.scaleX,
							scaleY : image.scaleY,
							uid : generatorUID(),
							ProjectImage : image.ProjectImage,
	                        borderColor : image.borderColor,
	                        borderWidth : image.borderWidth,
	                        displaySimpleBorder : image.displaySimpleBorder,
	                        dropShadow : image._dropShadow,
	                        shadowBlur : image.shadowBlur,
	                        shadowColor : image.shadowColor,
	                        shadowOffsetX : image.shadowOffsetX,
	                        shadowOffsetY : image.shadowOffsetY,
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

						var dir = conf.staticDir+'themes/mainThemeMin/'+theme._id+'/';
						mainConf.mkdir(dir);
						var body = data.base64,
						base64Data = body.replace(/^data:image\/png;base64,/,""),
						binaryData = new Buffer(base64Data, 'base64').toString('binary');

						fs.writeFile(dir+savedThemePage._id+".jpg", binaryData, "binary", function(err) {

							if(err){

								console.log(err);

							}

							imageSaved = true;
							savedThemePage.url = conf.staticPath+'/themes/mainThemeMin/'+theme._id+'/'+savedThemePage._id+'.jpg';
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

		console.time('addPage');
		var mainThemeID = data.mainThemeID;
		if( mainThemeID === undefined ){
			return;
		}

		var pageData = {}
		pageData.name = data.name;
		pageData.order = data.order;
		pageData.width = data.width;
		pageData.height = data.height;
		MainTheme.findOne({_id: mainThemeID}, function(err, mt) {
			if( err ){
				console.fs(err);
			}
			if( mt == null ){
				console.fs('Nie ma takiego motywu');
			}
			var newPage = new ThemePage(pageData);

			newPage.save( function(err, saved) {
				if(err){
					console.fs(err);
				}

				var myObj = {
				    result: function async() {
				    	// console.fs('backgroundObjectsSaved: ');
				    	// console.fs(backgroundObjectsSaved);

				    	// console.fs('foregroundObjectsSaved: ');
				    	// console.fs(foregroundObjectsSaved);

				    	// console.fs('imageSaved: ');
				    	// console.fs(imageSaved);

				    	// console.fs('mainThemeSaved: ');
				    	// console.fs(mainThemeSaved);

				    	if( backgroundObjectsSaved && foregroundObjectsSaved && imageSaved && mainThemeSaved ){

							console.timeEnd('addPage');

							io.sockets.emit(socketName+'.addedPage', { page: saved, mainThemeID : mt._id} );

				    	} else {
				    		console.log('Jeszcze nie wszystko się zapisało!');
				    	}

				    }
				}
				var imageSaved = false;
				if( data.base64 !== undefined ) {
					var dir = conf.staticDir+'themes/mainThemeMin/'+mt._id+'/';
					//console.log(dir);
					mainConf.mkdir(dir);
					var body = data.base64,
					  base64Data = body.replace(/^data:image\/png;base64,/,""),
					  binaryData = new Buffer(base64Data, 'base64').toString('binary');

					//console.fs(dir+saved._id+".jpg");

					fs.writeFile(dir+saved._id+".jpg", binaryData, "binary", function(err) {
						if(err){
							console.log(err);
						}
						saved.url = conf.staticPath+'/themes/mainThemeMin/'+mt._id+'/'+saved._id+'.jpg';
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
						delete bo[i]._id;
						var newEditorBitmap = new EditorBitmap(bo[i]);
						newEditorBitmap.save( function(err, eb){
							if(err){
								console.fs(err);
							}
							//console.fs(eb);
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
				//console.fs('fo: ');
				//console.fs(fo.length);
				//console.fs(typeof fo);
				if( fo && typeof fo !== undefined && fo.length > 0 ) {
					var countFgSaved = 0;
					for(var i = 0;i<fo.length;i++){
						//console.log(fo[i]);
						//var newGenerator = new Generator();
						fo[i].uid = generatorUID();
						delete fo[i]._id;
						var newEditorBitmap = new EditorBitmap(fo[i]);
						newEditorBitmap.save( function(err, eb){
							if(err){
								console.fs(err);
							}
							//console.fs(eb);
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
				mt.ThemePages.push(saved);
				mt.save(function(err, savedMT){
					mainThemeSaved = true;
					myObj.result();
				});
			});


		});

	});
};

MainThemeController.prototype.copyPageFromLocal = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.copyPageFromLocal', function(data) {
		console.time('copyPageFromLocal');
		var inc = 0;
		console.fs('COPY LOCAL---------------------------------------');
		console.fs(data);
		//return;
		var themePageID = data.themePageID;
		var mainThemeID = data.mainThemeID;
		var themeID = data.themeID;

		ThemePage.findById(themePageID).deepPopulate('backgroundObjects.EditorBitmaps.ProjectImage foregroundObjects.EditorBitmaps.ProjectImage backgroundObjects.EditorTexts foregroundObjects.EditorTexts UsedImages.ProjectImage').exec(function(err, themePageToCopy){

			if( err ){

				console.fs( err );

			}
			else {

				var copiedImage = false;

				var backgroundEditorBitmapsCount = themePageToCopy.backgroundObjects.EditorBitmaps.length;
				var foregroundEditorBitmapsCount = themePageToCopy.foregroundObjects.EditorBitmaps.length;
				var backgroundEditorTextsCount = themePageToCopy.backgroundObjects.EditorTexts.length;
				var foregroundEditorTextsCount = themePageToCopy.foregroundObjects.EditorTexts.length;

				var _copiedThemePageData = {

					name : themePageToCopy.name,
					order : themePageToCopy.order,
					width : themePageToCopy.width,
					height : themePageToCopy.height,

				};

				var copiedThemePage = new ThemePage( _copiedThemePageData );


				// promise ktory zapisze calosc, w momecie skopiowania wszystkich reczy
				function promise(){

					if( ( backgroundEditorBitmapsCount + foregroundEditorBitmapsCount + backgroundEditorTextsCount + foregroundEditorTextsCount ) == 0 && copiedImage ){

						copiedThemePage.save( function( err, _copiedThemePage ){

							if( err ){

								console.fs( err );

							}
							else {

								// dodanie strony do motywu glownego
								MainTheme.findOne({ _id : mainThemeID }, function( err, _mainTheme ){

									if( err ){

										console.fs( err);

									}
									else {

										_mainTheme.ThemePages.push( _copiedThemePage );

										_mainTheme.save( function( err, _mainTheme ){

											if( err ){

												console.fs( err );

											}
											else {

												// zapisanie ze aktualna strona jest kopia
												themePageToCopy.ThemePageFrom = _copiedThemePage;
												themePageToCopy.save( function( err, updatedOldPage ){

													if( err ){

														console.log( fs );

													}
													else {
														console.fs('-_-----__---__---__COPY PAGE FROM LOCAL _______---___--__----_____');
												 		io.sockets.emit(socketName+'.copyPageFromLocal', updatedOldPage);
														console.fs( 'strona zostala skopiowana!!! :))' );

													}

												});

											}

										});

									}

								});

							}

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


				var url = themePageToCopy.url;

		 		if( url !== undefined ){

		 			var newDir = conf.staticDir+'themes/mainThemeMin/'+mainThemeID+'/';
		 			mainConf.mkdir(newDir);
		 			nameFile = url.split("/").pop();
			 		var sourceFile = conf.staticDir+'themes/themeMin/'+themeID+'/'+themePageToCopy._id + '.jpg';
			 		fs.createReadStream( sourceFile ).pipe( fs.createWriteStream( newDir + '' + copiedThemePage._id + '.jpg' ) );

			 		copiedThemePage.url = conf.staticPath+'/themes/mainThemeMin/' + mainThemeID + '/' + copiedThemePage._id + '.jpg';//min/'+mainThemeID+'/'+ themePageToCopy._id + '.jpg';
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

				// testy przebiegły pomyślnie
				//copyEditorText( themePageToCopy.backgroundObjects.EditorTexts[0] );
				//copyEditorBitmap( themePageToCopy.backgroundObjects.EditorBitmaps[0], 'backgroundObjects' );

			}

		});

		return;

		ThemePage.findById(themePageID).deepPopulate('backgroundObjects.EditorBitmaps.ProjectImage foregroundObjects.EditorBitmaps.ProjectImage UsedImages.ProjectImage').exec(function(err, page){
			if(err){
				console.fs(err);
			}
			console.fs(page);
			var pageData = {};
			pageData.name = page.name;
			pageData.order = page.order;
			pageData.width = page.width;
			pageData.height = page.height;

			var newThemePage = new ThemePage(pageData);
			//newThemePage.ThemePageFrom = page;
			newThemePage.save(function(err, savedPage){
				//console.fs('tu');

				var myObj = {
				    result: function async1() {
				    	if( backgroundObjectsSaved && foregroundObjectsSaved && usedImagesSaved && proposedTemplatesSaved ){
				    		console.fs('!!!!!!!!KONIEC LOCAL!!!!!!!!!!!');
						    var newPageID = savedPage._id;
							console.fs('newPageID: ');
							console.fs(newPageID);
							MainTheme.findById(mainThemeID).exec(function(err, mt){
								//console.fs('Nasze theme: ');
								//console.fs(actTheme);
								mt.ThemePages.push(savedPage);
								mt.save(function(err, savedTheme) {
									if( err ){
										console.fs(err);
									}
									ThemePage.findById(newPageID).deepPopulate('backgroundObjects.EditorBitmaps.ProjectImage foregroundObjects.EditorBitmaps.ProjectImage UsedImages.ProjectImage').exec(function(err, newPage){
								 		//console.fs('Old page: ');
								 		//console.fs(page);
								 		//console.fs('new page: ');
								 		//console.fs(newPage);
								 		var url = page.url;
								 		if( url !== undefined ){
								 			var newDir = conf.staticDir+'min/'+mt._id+'/';
								 			mainConf.mkdir(newDir);
								 			nameFile = url.split("/").pop();
									 		var sourceFile = conf.staticDir+'min/'+themeID+'/'+nameFile;
									 		fs.readFile(sourceFile, function (err, dataFile) {
									 			if(err){
									 				console.fs(err);
									 			}
									 			console.fs(dataFile);
									 			var targetFile = conf.staticDir+'min/'+mt._id+'/'+nameFile;
										 		var fileOptions = {flags: 'w', encoding: 'binary'};
												fs.writeFile(targetFile, dataFile, fileOptions, function(err){
													if(err){
														console.fs(err);
													}
													console.fs('zapisano zdjęcie: ');
											 		newPage.url = conf.staticPath+'/min/'+mt._id+'/'+nameFile;
											 		newPage.save( function(err, savedPageEnd){
											 			if(err){
											 				console.fs(err);
											 			}
											 			page.ThemePageFrom = newPage;
											 			page.save( function(err, oldPageSaved) {
											 				if(err){
											 					console.fs(err);
											 				}

												 			console.timeEnd('copyPageFromLocal');
												 			console.fs('-_-----__---__---__COPY PAGE FROM LOCAL _______---___--__----_____');
												 			io.sockets.emit(socketName+'.copyPageFromLocal', savedPageEnd);
											 			});

											 		});
												});
									 		});
								 		}

								 	});
								});
							});

				    	} else {
				    		console.log('Jeszcze nie wszystko się zapisało!');
				    	}

				    }
				}

				if( err ){
					console.fs('Problem with simple first save: ');
					console.fs(err);
				}

				var backgroundObjectsSaved = true;
				if( page.backgroundObjects.EditorBitmaps && typeof page.backgroundObjects.EditorBitmaps !== 'undefined' ){

					if( page.backgroundObjects.EditorBitmaps.length > 0 ) {
						backgroundObjectsSaved = false;
						var backgroundObjectsCounter = page.backgroundObjects.EditorBitmaps.length;
					}


					for(var i = 0;i<page.backgroundObjects.EditorBitmaps.length;i++){

						var projectImageData = page.backgroundObjects.EditorBitmaps[i].ProjectImage.toJSON();

						var editorBitmapData = page.backgroundObjects.EditorBitmaps[i].toJSON();
						delete editorBitmapData._id;
						//delete editorBitmapData.ProjectImage;
						inc++;
						console.log('incrementer: '+inc);
						//console.fs(editorBitmapData);
						var newEditorBitmap = new EditorBitmap(editorBitmapData);

						newEditorBitmap.save(function(err, eb) {
							if(err){
								console.fs('New Editor bitmap in backgroundObjects problem: ');
								console.fs(err);
							}

							savedPage.backgroundObjects.EditorBitmaps.push(eb);
							console.log('savedPage with backgroundObjects: ');
							console.log(savedPage);
							savedPage.save(function(err, savedPage2) {
								if(err){
									console.fs('Saved page with EditorBitmap problem: ');
									console.fs(err);
								}
								backgroundObjectsCounter--;
								if(backgroundObjectsCounter == 0){
									backgroundObjectsSaved = true;
								}
								myObj.result();
							});
						});
					}

				}

				var foregroundObjectsSaved = true;
				if( page.foregroundObjects.EditorBitmaps && typeof page.foregroundObjects.EditorBitmaps !== 'undefined' ){

					if( page.foregroundObjects.EditorBitmaps.length > 0 ){
						foregroundObjectsSaved = false;
						var foregroundObjectsCounter = page.foregroundObjects.EditorBitmaps.length;
					}

					for(var i = 0;i<page.foregroundObjects.EditorBitmaps.length;i++){

						var projectImageData = page.foregroundObjects.EditorBitmaps[i].ProjectImage.toJSON();

						var editorBitmapData = page.foregroundObjects.EditorBitmaps[i].toJSON();
						delete editorBitmapData._id;

						var newEditorBitmap = new EditorBitmap(editorBitmapData);


						newEditorBitmap.save(function(err, eb) {
							if(err){
								console.fs('New Editor bitmap in foregroundObjects problem: ');
								console.fs(err);
							}

							savedPage.foregroundObjects.EditorBitmaps.push(eb);
							console.log('savedPage with foregroundObjects: ');
							console.log(savedPage);
							savedPage.save(function(err, savedPage2) {
								if(err){
									console.fs('Saved page with EditorBitmap problem: ');
									console.fs(err);
								}
								foregroundObjectsCounter--;
								if(foregroundObjectsCounter == 0){
									foregroundObjectsSaved = true;
								}
								myObj.result();
							});
						});
					}

				}

				var usedImagesSaved = true;
				if( page.UsedImages && typeof page.UsedImages !== 'undefined' ){

					if( page.UsedImages.length > 0) {
						usedImagesSaved = false;
						var usedImagesCounter = page.UsedImages.length;
					}

					for(var i = 0;i<page.UsedImages.length;i++){

						var projectImageData = page.UsedImages[i].ProjectImage.toJSON();
						delete projectImageData._id;
						var newProjectImage = new ProjectImage(projectImageData);

						newProjectImage.save( function(err, savedUsedImage) {
							if(err){
								console.fs('Problem with save on of UsedImages: ');
								console.fs(err);
							}
							savedPage.UsedImages.push(savedUsedImage);
							savedPage.save(function(err, savedPage2) {
								if(err){
									console.fs('Saved page with one of UsedImages problem: ');
									console.fs(err);
								}
								usedImagesCounter--;
								if(usedImagesCounter == 0){
									usedImagesSaved = true;
								}
								myObj.result();
							});
						});
					}

				}

				var proposedTemplatesSaved = true;
				if( page.proposedTemplates && typeof page.proposedTemplates !== 'undefined' ){

					if( page.proposedTemplates.length > 0 ){
						proposedTemplatesSaved = false;
						var proposedTemplatesCounter = page.proposedTemplates.length;
					}

					for(var i = 0;i<page.proposedTemplates.length;i++){

						var proposedTemplateData = page.proposedTemplates[i].ProposedTemplate.toJSON();
						delete proposedTemplateData._id;
						var newProposedTemplate = new ProposedTemplate(proposedTemplateData);
						newProposedTemplate.save( function(err, savedProposedTemplate) {
							if(err){
								console.fs('Problem with save on of proposedTemplates: ');
								console.fs(err);
							}
							savedPage.proposedTemplates.push(savedProposedTemplate);
							savedPage.save(function(err, savedProposedTemplate) {
								if(err){
									console.fs('Saved page with one of proposedTemplates problem: ');
									console.fs(err);
								}
								proposedTemplatesCounter--;
								if(proposedTemplatesCounter == 0){
									proposedTemplatesSaved = true;
								}
								myObj.result();
							});
						});
					}

				}
				// koniec save
			});
			// koniec find ThemePage
		});
	});
};

module.exports = MainThemeController;
