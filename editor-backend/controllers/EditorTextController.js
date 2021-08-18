var util = require('util');
console.fs = require('../libs/fsconsole.js');

var generatorUID = require('../libs/generator.js');
var arraydiff = require('../libs/arraydiff.js');

var _ = require('underscore');
var Q = require('q');

var Controller = require("../controllers/Controller.js");
var EditorText = require('../models/EditorText.js').model;
var View = require('../models/View.js').model;

function EditorTextController( controller ) {

	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "EditorTextController";
    this.socketName = "EditorText";

};

util.inherits(EditorTextController, Controller);

EditorTextController.clone = function( id ){

	var def = Q.defer();

	EditorText.findOne( { _id: id } ).exec( function( err, text ){

		if( err ){
			console.log( err );
		}else {

			var newText = text;
			delete newText._id;

			var newText = new EditorText( newText );

			newText.save( function( err, saved ){

				def.resolve( saved );

			} );

		}

	});

	return def.promise;

}

EditorTextController._add = function( data, callback ) {

	console.log(' dodanie tekstu funkcja zewnetrzna');

	var newEditorText = new EditorText(data);

	newEditorText.save( function(err, newEditorText) {

		if( err ){

			console.fs( err );

		}else {

			callback( newEditorText );

		}

	});

};

EditorTextController.prototype.setShadow = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName + '.setShadow', function( data ){

		EditorText.findOne({ _id : data.editorTextID}, function( err, text ){

			if( err ){

				console.fs( err );

			}else {

				text.dropShadow = data.value;

				text.save( function( err, saved ){

					if( err ){

						console.fs( err );

					}else {

						console.fs('zapisano zmiane');

					}

				});

			}

		});

	});

};


EditorTextController._remove = function( editorTextID, callback ) {

	EditorText.findOne({ _id: editorTextID }, function(err, et) {

		console.log('wlazlo i dziala');
		console.log('poszukiwany editorText o ID : ' + editorTextID);

		if( err || et === null ){

			console.fs(err);

		} else {

			et.remove( function(err, removed) {

				console.log('====================== wykonanie callbacka =================================');

				callback( removed );

			});

		}

	});

};


EditorTextController._removeMe2 = function( editorTextID, callback ){

	console.log( data );
	console.log('====================== Usuwanie tekstu =================================');
	/*

*/

};

EditorTextController.prototype._getByID = function( editorTextID, callback, errorCallback ){

	EditorText.findOne({ _id : editorTextID }, function( err, text){

		if( err ){

			if( errorCallback )
				errorCallback( err );
			else
				console.fs( err );

		}
		else {

			callback( text );

		}

	});

};


EditorTextController.prototype.setAlphaBackground = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName + '.setAlphaBackground', function( data ){

		console.fs( data );
		console.fs('chce zmienic wartosc alpha');

		this._getByID( data.dbID, function( text ){

			console.fs( text );
			text.backgroundOpacity = data.backgroundOpacity;

			text.save( function( err, savedText ){

				if( err ){

					console.fs( err );

				}else {

					console.fs('Tekst ostał zapisany :)))');

				}

			});

		});

	}.bind( this ));

};


EditorTextController.prototype.setVerticalPadding = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName + '.setVerticalPadding', function( data ){

		this._getByID( data.dbID, function( text ){

			text.verticalPadding = data.value;

			text.save( function( err, savedText ){

				if( err ){

					console.fs( err );

				}else {

					console.fs('Tekst został zapisany :)))');

				}

			});

		});

	}.bind( this ));

};



EditorTextController.prototype.setHorizontalPadding = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName + '.setHorizontalPadding', function( data ){

		this._getByID( data.dbID, function( text ){

			text.horizontalPadding = data.value;

			text.save( function( err, savedText ){

				if( err ){

					console.fs( err );

				}else {

					console.fs('Tekst został zapisany :)))');

				}

			});

		});

	}.bind( this ));

};


EditorTextController.prototype.setBackgroundColor = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName + '.setBackgroundColor', function( data ){

		console.fs( data  );
		console.fs( 'Jakie dane przesylam' );

		this._getByID( data.dbID, function( text ){

			console.fs( text );
			console.fs('znalazlem tekst');

			text.backgroundColor = data.color;

			text.save( function( err, savedText ){

				if( err ){

					console.fs( err );

				}else {

					console.fs( savedText );
					console.fs('ZAPISALEM TEKST');

				}

			});

		});

	}.bind( this ));

};


EditorTextController.prototype.setTransform = function(){

	var socketName = this.socketName;
	var socket = this.socket;
	var _this = this;

	socket.on( socketName + '.setTransform', function( data ){

		console.log( data );
		console.log('============================= SET TRANSFORM ==============================');

		_this._getByID(

			// id tekstu
			data.editorTextID,

			//callback pozytywny
			function( text ){

				console.log('jest pozytywnie');

				if( text == null )
					return;

				text.x        = data.x;
				text.y        = data.y;
				text.width    = data.width;
				text.height   = data.height;
				text.rotation = data.rotation;

				text.save( function( savedText ){

					socket.emit( socketName + '.setTransform', savedText );

				});

			},

			//call back negatywny
			function( err ){

				console.log('wystapil blad podczas pobierania obiektu');
			}

		);

	});

};


EditorTextController.prototype.setContent = function(){

	var socketName = this.socketName;
	var socket = this.socket;
	var _this = this;

	socket.on(this.socketName+'.setContent', function(data){

		EditorText.findOne({ _id : data.editorTextID }, function( err, text){

			if( err ){

				console.fs( err );

			}
			else {

				text.content = data.content;

				text.save( function( err, saved ){

					if( err ){

						console.fs( err );

					}else {

						socket.emit(socketName+'.setContent', saved );

					}


				});


			}

		});

	});

};

EditorTextController.prototype.removeMe = function(){

	var socketName = this.socketName;
	var socket = this.socket;
	var _this = this;

	socket.on( this.socketName + '.remove', function( data ){

		_this._removeMe( data.editorTextID, function( removedText ){

			io.sockets.emit( this.socketName+'.remove', data );

		});

	});

};

EditorTextController.prototype.add = function(){

	var socketName = this.socketName;
	var socket = this.socket;
	var _this = this;

	socket.on(this.socketName+'.add', function(data){

		_this.add( data, function( newText ){

			io.sockets.emit( this.socketName+'.add', newText );

		});

	});

};


module.exports = EditorTextController;
