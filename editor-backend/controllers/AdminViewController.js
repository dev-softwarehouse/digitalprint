var util = require('util');
console.fs = require('../libs/fsconsole.js');


var Controller = require("../controllers/Controller.js");
var AdminProject = require('../models/AdminProject.js').model;
var MainTheme = require('../models/MainTheme.js').model;
var EditorText = require('../models/EditorText.js').model;
var View = require('../models/View.js').model;
var Theme = require('../models/Theme.js').model;

//var conf = require('../libs/conf.js');

function AdminViewController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;
    //AdminProjectController.super_.call(this);
    this.name = "AdminViewController";
    this.socketName = "AdminView";
};

util.inherits(AdminViewController, Controller);


AdminViewController.prototype.get = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.get', function(data){

		console.fs('chcę pobrac konkretny widok');

	});

};


AdminViewController.prototype.removeText = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.removeText', function( data ) {

		console.fs( data );
		console.fs( 'chce usunac tekst z adminview' );

		View.findOne({ _id : data.viewID }).deepPopulate( 'EditorTexts' ).exec( function( err, view ){

			if( err ){

				console.fs( err );

			}else {

				var texts = view.EditorTexts;

				texts = _.reject( texts, function( elem ){ 
						
					if( elem._id.toString() == data.textID.toString() ){

						elem.remove( function( err, removedText ){

							if( err ){

								console.fs( err );

							}else {

								console.fs('obiekt został pomyuslnie usuniety :)))))');

							}

						});

						return true;
					}
					else {

						return false;
					}

				});

				view.EditorTexts = texts;

				view.save( function( err, updatedView ){

					if( err ){

						console.fs( err );

					}else {



					}

				});

				console.fs( view );
				console.fs('ID do usuniecia : ' + data.textID );
				console.fs('jaka jest tablica textow');

				//console.fs( view );
				//console.fs( 'znalazlem widok' );

			}

		});

	});

};


module.exports = AdminViewController;