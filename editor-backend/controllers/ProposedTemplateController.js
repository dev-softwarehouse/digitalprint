var util = require('util');
console.fs = require('../libs/fsconsole.js');

var conf = require('../libs/conf.js');

var Q = require('q');

var Controller = require("../controllers/Controller.js");
//var uPageController = require("../controllers/UserPageController.js");
var ProposedTemplate = require('../models/ProposedTemplate.js').model;
var ProposedTemplateCategory = require('../models/ProposedTemplateCategory.js').model;
var ProposedImage = require('../models/ProposedImage.js').model;
var ProposedImageController = require('../controllers/ProposedImageController.js');
var ProposedTextController = require('../controllers/ProposedTextController.js');
var ProposedText = require('../models/ProposedText.js').model;
var ThemePage = require('../models/ThemePage.js').model;
var ThemePageController = require('../controllers/ThemePageController.js');
var UserPage = require('../models/UserPage.js').model;

function ProposedTemplateController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "ProposedTemplateController";
    this.socketName = "ProposedTemplate";
}

// główny kontroler podpinamy
util.inherits(ProposedTemplateController, Controller);


ProposedTemplateController.useDataFromOther = function( proposedTemplateID, fromTemplateID, themePageID ){

	var def = Q.defer();

	ProposedTemplate.find( { _id : { $in : [ proposedTemplateID, fromTemplateID ] } } ).deepPopulate('ProposedTexts ProposedImages ProposedImages.objectInside ProposedImages.objectInside.ProjectImage').exec( function( err, positions ){

		if( err ){

			console.fs( err );

		}else {

			var positionTo = null;
			var positionFrom = null;

			for( var i=0; i < positions.length; i++ ){
				console.log(positions[i]._id.toString());
				if( proposedTemplateID == positions[i]._id.toString() )
					positionTo = positions[i];

				if( fromTemplateID == positions[i]._id.toString() )
					positionFrom = positions[i];

			}
			
			positionFrom.ProposedImages = _.sortBy( positionFrom.ProposedImages, 'order' );
			positionTo.ProposedImages = _.sortBy( positionTo.ProposedImages, 'order' );

			var images = [];
			var texts = [];

			var proposedImages = positionFrom.ProposedImages;
			proposedImages = _.sortBy( proposedImages, 'order' );

			for( var i=0; i < proposedImages.length; i++ ){

				if( proposedImages[i].objectInside ){

					images.push( proposedImages[i] );

				}

			}


			var proposedTexts = positionFrom.ProposedTexts;
			proposedTexts = _.sortBy( proposedTexts, 'order' );

			for( var i=0; i < proposedTexts.length; i++ ){

				if( proposedTexts[i].content ){

					texts.push( proposedTexts[i] );

				}

			}


			var dataFromImagesPosition = 0;
			var dataFromTextsPosition = 0;

			for( var i=0; i < images.length; i++ ){

				if( positionTo.ProposedImages[i] ){

					ProposedImageController._useDataFrom( images[i]._id, positionTo.ProposedImages[i]._id ).then(

						//ok
						function( proposedImage ){

							dataFromImagesPosition++;
							checkDone();

						}

					);
						
				} else {

					dataFromImagesPosition++;
					checkDone();

				}

			}

			for( var i=0; i < texts.length; i++ ){


				if( positionTo.ProposedTexts[i] ){

					ProposedTextController._useDataFrom( texts[i]._id, positionTo.ProposedTexts[i]._id ).then(

						//ok
						function( proposedImage ){

							dataFromTextsPosition++;
							checkDone();

						}

					);
						
				} else {

					ProposedTextController.sendDefaultThemePageValue( texts[i]._id, themePageID ).then(

						//ok
						function( text ){

							dataFromTextsPosition++;
							checkDone();

						}

					);

				}

			}

			for( var i=0; i < positionTo.ProposedTexts.length - texts.length; i++ ){

					ProposedTextController.sendDefaultThemePageValue( positionTo.ProposedTexts[i]._id, themePageID ).then(

						//ok
						function( text ){

							dataFromTextsPosition++;
							checkDone();

						}

					);

			}

			
			checkDone();

			function checkDone(){

				if( images.length == dataFromImagesPosition && positionTo.ProposedTexts.length == dataFromTextsPosition ){

					def.resolve( positionTo._id );

				}

			}

		}

	});

	return def.promise;

};

ProposedTemplateController.setDefaultThemeSettings = function( proposedTemplateID, themePageID ) {

	var def = Q.defer();

	ProposedTemplate.findOne({ _id: proposedTemplateID }).deepPopulate('ProposedImages ProposedTexts').exec( function( err, template ){

		if( err ){

			console.fs( err );

		}

		updatedTexts = 0;

		ThemePage.findOne( { _id: themePageID} ).exec( function( err, themePage ) {
			
			if ( err ){

				console.fs( err );

			}

			ThemePageController._getFonts( themePageID ).then(

				//ok
				function( fonts ){

					var firstFont = fonts[0].name;
					
					for( var i=0; i < template.ProposedTexts.length; i++ ){

						var textData = {

							fontFamily: firstFont

						};

						updateProposedText( template.ProposedTexts[i], textData );

					}

				}

			);

			function updateProposedText( text, data  ){

				for( var key in data ){

					text[ key ] = data[ key ];

				}

				text.save( function( err, updated ){

					if( err ){

						console.fs( err );

					}else {

						updatedTexts++;
						checkDone();

					}

				});

			}

			function checkDone(){

				if( updatedTexts == template.ProposedTexts.length ){

					console.fs('zrobione :)');

				}

			}

			checkDone();

		});

	});

	return def.promise;

};


ProposedTemplateController.clone = function( proposedTemplateID ){

	var def = Q.defer();

	ProposedTemplate.findOne({_id : proposedTemplateID }).deepPopulate('ProposedTexts ProposedImages').exec(function( err, fullProposedTemplate ){

		if( err ){

			console.fs( err );

		}
		else {
			
			var templateData = fullProposedTemplate.toJSON();
			delete templateData._id;
			delete templateData.__v;



			var imagesToClone = fullProposedTemplate.ProposedImages.length;
			var clonedImagesC = 0;
			
			var textsToClone = fullProposedTemplate.ProposedTexts.length;
			var clonedTextsC = 0;

			var clonedImages = false;
			var clonedTexts = false;

			templateData.ProposedTexts = [];
			templateData.ProposedImages = [];

			var userProposedTemplate = new ProposedTemplate( templateData );

			cloneProposedImages();
			cloneProposedTexts();

			function cloneProposedImages(){

				for( var i=0; i < fullProposedTemplate.ProposedImages.length; i++ ){

					var imageData = fullProposedTemplate.ProposedImages[i].toJSON();
					delete imageData._id;
					delete imageData.__v;

					var newProposedImage = new ProposedImage( imageData );

					newProposedImage.save( function( err, image ){

						if( err ){

							console.fs( err );

						}else {

							userProposedTemplate.ProposedImages.push( image );
							clonedImagesC++;
							checkDone();
							
						}

					});


				}

				checkDone();

				function checkDone(){

					if( clonedImagesC == imagesToClone ){
						clonedImages = true;
						checkAll();

					}

				}

			}

			function cloneProposedTexts(){		

				for( var i=0; i < fullProposedTemplate.ProposedTexts.length; i++ ){

					var textData = fullProposedTemplate.ProposedTexts[i].toJSON();
					delete textData._id;
					delete textData.__v;

					var newProposedText = new ProposedText( textData );

					newProposedText.save( function( err, text ){

						if( err ){

							console.fs( err );

						}else {

							userProposedTemplate.ProposedTexts.push( text );
							clonedTextsC++;
							checkDone();

						}

					});

					

				}

				checkDone();

				function checkDone(){

					if( clonedTextsC == textsToClone ){
						
						clonedTexts = true;
						checkAll();

					}

				}

			}

			function checkAll(){

				if( clonedImages && clonedTexts ){

					userProposedTemplate.save( function( err, userTemplate ){

						if( err ){

							console.fs( err );

						}else {

							def.resolve( userTemplate );

						}

					});
					

				}

			}

		}

	});

	return def.promise;

};

ProposedTemplateController.getFull = function( proposedTemplateID ){

	var def = Q.defer();

	ProposedTemplate.findOne({_id : proposedTemplateID }).deepPopulate('ProposedTexts ProposedImages').exec(function( err, fullProposedTemplate ){

		if( err ){

			console.fs( err );

		}
		else {

			def.resolve( fullProposedTemplate );

		}

	});

	return def.promise;

};



ProposedTemplateController.prototype.addOption = function(  ){

	var socketName = this.socketName;
	var socket  = this.socket;
	var _this = this;

	socket.on(socketName+'.addOption', function(data) {



		var dataParent = data.parent;
		console.fs( data );
		console.fs( 'Dodanie opcji do pozycji proponowanej' );

		var newProposedTemplate = new ProposedTemplate();

		data.content.forEach(function(obj) {
			var newData = {};
			newData.pos = obj.pos;
			newData.size = obj.size;
			newData.bounds = obj.bounds;
			newData.order = obj.order;
			newData.rotation = obj.rotation;
			if( obj.type == 'ProposedPosition' ){
				var newProposedImage = new ProposedImage(newData);
				newProposedImage.save();
				newProposedTemplate.ProposedImages.push(newProposedImage);
			} else if( obj.type == 'Text2' ){
				var newProposedText = new ProposedText(newData);
				newProposedText.save();
				newProposedTemplate.ProposedTexts.push(newProposedText);
			}
			//console.log(obj.type);
		});

		//newProposedTemplate.category = existCategory;
		newProposedTemplate.width = data.width;
		newProposedTemplate.height = data.height;
		newProposedTemplate.isGlobal = false;
		newProposedTemplate.imagesCount = data.imagesCount;
		newProposedTemplate.textsCount = data.textCount;
		newProposedTemplate.parentTemplate = dataParent;
		newProposedTemplate.isOption = true;
   
		newProposedTemplate.save( function( err, npt ){

			if( err ){

				console.fs( err );

			}else {

				ProposedTemplate.findOne({ _id: dataParent}, function( err, pT ){

					if( err ){

						console.fs( err );

					}else {

						pT.textOptions = pT.textOptions || [];
						pT.textOptions.push( npt );
						console.fs( pT);
						console.fs('znalazlem parenta :) <=================================');

						pT.save( function( err, updatedTemplate ){

							if( err ){

								console.fs( err );

							}else {

								console.fs( updatedTemplate );
								console.fs('Zostalo to dodane tak jak chcialem');

							}

						});

					}

				});

			}

		});

	});

};


ProposedTemplateController._clone = function( proposedTemplateID ){

	var def = Q.defer();

	ProposedTemplate.findOne({ _id: proposedTemplateID}).deepPopulate("ProposedImages").exec( function( err, proposedTemplate ){

		if( err ){

			console.fs( err );

		}
		else {

			var clonedProposedImages = 0;
			var clonedProposedTexts = 0;

			var proposedImagesCount = proposedTemplate.ProposedImages.length;
			var proposedTextsCount = proposedTemplate.ProposedTexts.length;

			function checkDone( clonedProposedTemplate ){

				if( clonedProposedImages == proposedImagesCount && clonedProposedTexts == proposedTextsCount ){

					clonedProposedTemplate.save( function( err, savedProposedTemplate ){

						if( err ){


						}
						else {

							ProposedTemplate.findOne( { _id : savedProposedTemplate }).deepPopulate('ProposedImages ProposedTexts').exec(function( err, populatedClone){

								console.fs('na lajcie wyszedlem');

								def.resolve( populatedClone );

							});

						}

					});
					

				}

			};

			var dataForProposedTemplate = proposedTemplate.toJSON();
			delete dataForProposedTemplate._id;

			var newProposedTemplate = new ProposedTemplate( dataForProposedTemplate );

			newProposedTemplate.ProposedImages = [];
			newProposedTemplate.ProposedTexts = [];

			for( var i=0; i < proposedTemplate.ProposedImages.length; i++ ){

				var dataForProposedImage = proposedTemplate.ProposedImages[i].toJSON();
				delete dataForProposedImage._id;

				var newProposedImage = new ProposedImage( dataForProposedImage );

				newProposedImage.save( function( err, savedProposedImage ){

					if( err ){

						console.fs( err );

					}
					else {

						newProposedTemplate.ProposedImages.push( savedProposedImage );
						clonedProposedImages++;

						checkDone( newProposedTemplate );

					}

				});

			}

			for( var i=0; i < proposedTemplate.ProposedTexts.length; i++ ){

				var dataForProposedText = proposedTemplate.ProposedTexts[i].toJSON();
				delete dataForProposedText._id;

				var newProposedText = new ProposedText( dataForProposedText );

				newProposedText.save( function( err, savedProposedText ){

					if( err ){

						console.fs( err );

					}
					else {

						newProposedTemplate.ProposedTexts.push( savedProposedText );
						clonedProposedTexts++;

						checkDone( newProposedTemplate );

					}

				});

			}

			console.fs( proposedTemplate );
			console.fs('----------================= Klonowanie pozycji proponowanej');

		}

	});

	return def.promise;

};


ProposedTemplateController.prototype._addToCategory = function( item, categories ) {

	var def = Q.defer();

	item.ProposedTemplateCategory = categories[0];
	item.save( function(err, saved) {
		if( err ){
			console.fs(err);
			def.reject(err);
		} else {
			def.resolve(saved);
		}
	});

	return def.promise;

};

ProposedTemplateController.prototype.add = function() {
	var socketName = this.socketName;
	var socket  = this.socket;
	var _this = this;

	socket.on(socketName+'.add', function(data) {
		
		console.log('------------------------------------- Przyszła informacja o dodaniu pozycji proponowanych');
		console.log(data);



		var themePageID = data.themePageID;
		var newProposedTemplate = new ProposedTemplate();



		data.content.forEach(function(obj) {
			var newData = {};
			newData.pos = obj.pos;
			newData.size = obj.size;
			newData.bounds = obj.bounds;
			newData.order = obj.order;
			newData.rotation = obj.rotation;
			if( obj.type == 'ProposedPosition' ){
				var newProposedImage = new ProposedImage(newData);
				newProposedImage.save();
				newProposedTemplate.ProposedImages.push(newProposedImage);
			} else if( obj.type == 'Text2' ){
				var newProposedText = new ProposedText(newData);
				newProposedText.save();
				newProposedTemplate.ProposedTexts.push(newProposedText);
			}
			//console.log(obj.type);
		});

		//newProposedTemplate.category = existCategory;
		newProposedTemplate.width = data.width;
		newProposedTemplate.height = data.height;
		newProposedTemplate.isGlobal = data.isGlobal;
		newProposedTemplate.imagesCount = data.imagesCount;
		newProposedTemplate.textsCount = data.textCount;
   
		newProposedTemplate.save( function( err, pt ){

			_this._addToCategory(pt, data.categories). then( function( savedPT ) {

				if( err ){

					console.fs('nie zapisano szablonu');
					console.fs( err );

				} else {

					console.fs('zapisano szablon');
					console.fs( savedPT );
					console.fs( themePageID );


					var dir = conf.staticDir+'proposedTemplates_min/'+savedPT._id+'/';
					//console.log(dir);
					conf.mkdir(dir);
					// image jest w base64
					var body = data.image,
				  	base64Data = body.replace(/^data:image\/png;base64,/,""),
					binaryData = new Buffer(base64Data, 'base64').toString('binary');

					//console.fs(dir+saved._id+".jpg");  
					
					fs.writeFile(dir+savedPT._id+".jpg", binaryData, "binary", function(err) {
						if(err){
							console.log(err);
						}
						savedPT.url = conf.staticPath+'/proposedTemplates_min/'+savedPT._id+'/'+savedPT._id+'.jpg'

						savedPT.save( function( err, savedPT ){

							if( err ){

								console.fs('nie udalo sie zapisac zdjecia pozycji proponowanej');

							}
							else {

								console.fs('udalo sie zapisac zdjecie pozycji prtoponowamej');

								ThemePage.findOne({_id: themePageID}, function( err, tp ){
									// tp - themePage
									if( err ) {

										console.fs( err );
										console.fs('nie znaleziono motywu');

									}
									else {

										if( tp === null ) {

											console.fs( 'Zapisano bez strony motywu! ' );
											socket.emit( socketName+'.add', savedPT );

										} else {

											console.fs( tp );
											console.fs('znaleziono motyw');
											tp.proposedTemplates.push( savedPT );
											tp.save( function( err, themePage ){

												if( err ){

													console.fs( err );
													console.fs('nie udalo sie wpisac szablon');

												}
												else {

													console.fs( themePage );
													console.fs( 'szablon zostal zapisany w stronie motywu ');

													tp.deepPopulate('proposedTemplates', function( err, lastThemePage ){

														console.fs( lastThemePage );
														console.fs('zobacz  czy dziala');
														socket.emit( socketName+'.add', lastThemePage );

													});

												}

											});

										}

										

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




ProposedTemplateController.prototype.getAllForThemePage = function() {

	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on( socketName+'.getAllForThemePage', function( data ){

		console.fs('POBRANIE WSZYSTKICH SZABLONÓW POZYCJI PROPONOWANYCH DLA STRONY MOTYWU');

	});

};


ProposedTemplateController.prototype.get = function(){

	var socketName = this.socketName;
	var socket  = this.socket;
	socket.on(socketName+'.get', function( data ){

		console.fs( data );

		ProposedTemplate.findOne({ _id : data.ID }).deepPopulate('ProposedImages ProposedTexts').exec( function( err, pt ){

			if( err ){

				console.fs( err );
				console.fs('bład podczas pobierania szablonu pozycji proponowanej');

			}
			else {

				socket.emit( socketName+'.get', pt );

			}

		});

	});

};


ProposedTemplateController.prototype.getAllGlobal = function() {
	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on(socketName+'.getAllGlobal', function(data) {

		console.fs( data );

		//var actProposedTemplate = new ProposedTemplate({'isGlobal': true});
		
		console.fs( socketName+'.getAllGlobal' );

		ProposedTemplate.find({'isGlobal': true}, function(err, pt){
			ProposedTemplate.deepPopulate(pt, 'ProposedImages ProposedTexts ProposedTemplateCategory', function (err,p) {
				console.fs( 'PT: ' );
				console.fs(pt);
				socket.emit(socketName+'.getAllGlobal', pt);
			});
		});
	});
};


ProposedTemplateController.prototype.remove = function() {
	
	var socketName = this.socketName;
	var socket  = this.socket;
	socket.on(socketName+'.remove', function(data) {

		console.fs('KTOS CHCE USUNAC SZABLON POZYCJI PROPONOWANYCH');

		var proposedTemplateID = data.ID;

		ProposedTemplate.findOne({ _id : proposedTemplateID }, function( err, pt ){

			if( err ){

				console.fs('nie udalo sie pobrac proposedTemplate');

			}
			else {

				console.fs( pt );
				console.fs('pozycja proponowana');

				var proposedTexts = pt.ProposedTexts.length;
				var proposedImages = pt.ProposedImages.length;


				function promise(){

					console.fs( proposedTexts );
					console.fs( proposedImages );

					if( proposedTexts == 0 && proposedImages == 0 ){

						ProposedTemplate.findOneAndRemove({ _id : proposedTemplateID}, function( err, removed ){

							if( err ){

								console.fs('nie usunelo sie dobrze');

							}
							else {

								var path = conf.staticDir + removed.url.split( conf.staticPath+"/" )[1];
								//console.fs( path );
								fs.unlinkSync( path );
								console.fs(removed._id);
								fs.rmdir( path.split( '/'+removed._id+'.jpg' )[0] );
								socket.emit( socketName + '.remove', { ID : removed._id });

							}

						});

					}

				};


				function removeProposedText( id ){

					ProposedText.findOneAndRemove({_id : id }, function( err ){

						if( err ){

							console.fs('nie udalo sie usunac pozycji proponowanej tekstu');

						}
						else {

							proposedTexts--;
							console.fs('Pozycjie proponowane rtekstu, do usuniecia: ' + proposedTexts);

						}

						promise();

					});

				};


				function removeProposedImage( id ){

					ProposedImage.findOneAndRemove({_id : id }, function( err ){

						if( err ){

							console.fs('nie udalo sie usunac pozycji proponowanej obrazu');

						}
						else {

							proposedImages--;
							console.fs('Pozycjie proponowane obrazu, do usuniecia: ' + proposedImages);


						}

						promise();

					});

				};


				for( var i=0; i < pt.ProposedImages.length; i++ ){

					removeProposedImage( pt.ProposedImages[i] );

				}


				for( var i=0; i < pt.ProposedTexts.length; i++ ){

					removeProposedText( pt.ProposedTexts[i] );

				}

				promise();

			}

		});

	});

}

ProposedTemplateController.prototype.setGlobal = function() {
	ProposedTemplate.update({ 'isGlobal': { $exists: false } }, {'isGlobal': true} , {'multi': true}, function(err, records){
        if (err) {
            return false;
        } else {
            return true;
        };
    });
};

module.exports = ProposedTemplateController;