var util = require('util');
console.fs = require('../libs/fsconsole.js');

var conf = require('../libs/conf.js');

var Q = require('q');

var generatorUID = require('../libs/generator.js');
var Controller = require("../controllers/Controller.js");
var ProposedTemplate = require('../models/ProposedTemplate.js').model;
var ProposedTemplateCategory = require('../models/ProposedTemplateCategory.js').model;
var ProposedImage = require('../models/ProposedImage.js').model;
var ProposedText = require('../models/ProposedText.js').model;
var ThemePage = require('../models/ThemePage.js').model;
var EditorBitmap = require('../models/EditorBitmap.js').model;
var UserPage = require('../models/UserPage.js').model;
var ProjectImage = require('../models/ProjectImage.js').model;


var ThemePageController = require("../controllers/ThemePageController.js");

function ProposedTextController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "ProposedTextController";
    this.socketName = "ProposedText";
}

// główny kontroler podpinamy
util.inherits(ProposedTextController, Controller);


ProposedTextController.sendDefaultThemePageValue = function( proposedTextID, themePageID ){

	var def = Q.defer();

	ThemePageController._getFonts( themePageID ).then( 

		//ok
		function( fonts ){

			ProposedText.findOne( { _id: proposedTextID }).exec( function( err, text ){

				if( err ){

					console.fs( err );

				}else {

					console.log( fonts );
					text.fontFamily = fonts[0].name;
					text.save( function( err, savedText ){

						if( err ){

							console.fs( err );

						}else {

							console.fs( savedText );
							console.fs('udalo sie');
							def.resolve( savedText );

						}

					});

					
				}

			});

		}

	);

	return def.promise;

};


ProposedTextController._useDataFrom = function( proposedTextIDFrom, proposedTextIDTo ){

	var def = Q.defer();

	ProposedText.find( { _id: { $in : [ proposedTextIDFrom, proposedTextIDTo ] }} ).exec( function( err, proposedTexts ){

		if( err ){

			console.fs( err );

		}else {

			var cloned = true;	

			var proposedTextFrom = null;
			var proposedTextTo = null;

			for( var i=0; i < proposedTexts.length; i ++){

				if( proposedTexts[i]._id.toString() == proposedTextIDFrom )
					proposedTextFrom = proposedTexts[i];

				if( proposedTexts[i]._id.toString() == proposedTextIDTo )
					proposedTextTo = proposedTexts[i];

			}

			proposedTextTo.content = proposedTextFrom.content;

			proposedTextTo.save( function( err, saved ){

				if( err ){

					console.fs( err );

				}else {

					def.resolve( saved._id );

				}

			});

		}


	});

	return def.promise;

};

ProposedTextController.prototype.setAttributes = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( this.socketName+'.setAttributes', function( data ) {

		ProposedText.findOne( { _id : data.proposedTextID }).exec( function( err, proposedText ){

			if( err ){ console.fs( err ); return false; }

			for( var key in data.attributes ){

				proposedText[key] = data.attributes[key];

			}

			proposedText.save( function( err, saved ){

				if( err ){ console.fs( err ); return false }
				
				socket.emit( 'ProposedText.setAttributes', data );

			});

		});

	});

};

ProposedTextController.prototype.setContent = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( this.socketName+'.setContent', function( data ) {

		ProposedText.findOne( { _id: data.proposedTextID }, function( err, text ){

			if( err ){

				console.fs( err );

			}else {

				text.content = data.content;

				text.save( function( err, savedText ){

					if( err ){

						console.fs( err );

					}else {


					}

				});

			}

		});

	});

};

module.exports = ProposedTextController;