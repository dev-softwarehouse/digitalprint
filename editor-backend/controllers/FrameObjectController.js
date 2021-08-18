var util = require('util');
console.fs = require('../libs/fsconsole.js');
var FrameObject = require('../models/FrameObject.js').model;
var ProjectImage = require('../models/ProjectImage.js').model;
var Upload = require('../models/Upload.js').model;
//var conf = require('../libs/conf.js');


var Controller = require("../controllers/Controller.js");

function FrameObjectController( controller ) {

	this.socket = controller.socket;
	this.io = controller.io;
    this.name = "FrameObjectController";
    this.socketName = "FrameObject";

}

// główny kontroler podpinamy
util.inherits(FrameObjectController, Controller);

FrameObjectController.prototype.getAll = function(){

	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on(socketName+'.getAll', function(data) {

		FrameObject.find().deepPopulate('ProjectImage').exec( function( err, frames ){

			if( err ){

				console.fs( err );

			}else {

				socket.emit( socketName + '.getAll', frames );

			}

		});

	});


};

FrameObjectController.prototype.get = function(){

	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on(socketName+'.get', function( data ) {

		FrameObject.findOne( { _id: data.id }).deepPopulate('ProjectImage').exec( function( err, frame ){

			if( err ){

				console.fs( err );

			}else {

				var frame = frame.toJSON();
				frame.evtID = data.evtID;

				socket.emit( socketName+'.get', frame );

			}

		});


	});

};

// metody
FrameObjectController.prototype.add = function(){

	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on(socketName+'.add', function(data) {

		var frameObject = new FrameObject( data );

		frameObject.save( function( err, saved ){

			if( err ){

				console.fs( err );

			}else {

				FrameObject.findOne( { _id: saved._id }).deepPopulate('ProjectImage Upload').exec( function( err, frame ){

					if( err ){

						console.fs( err );

					}else {

						socket.emit( socketName+'.add', frame );		

					}

				});
				
			}

		});
		
	});

};


FrameObjectController.prototype.remove = function(){

	var socketName = this.socketName;
	var socket  = this.socket;

	socket.on(socketName+'.remove', function( data ){

		FrameObject.findOne({ _id: data.frameObjectID }).deepPopulate('ProjectImage ProjectImage.Upload').exec( function( err, obj ){

			if( err ){

				console.fs( err );

			}else {

				ProjectImage.findOne({ _id: obj.ProjectImage._id }).exec( function( err, projectImage ){

					if( err ){

						console.fs( err );

					}else {

						projectImage.remove( function( err, ok){

							if( err ){

								console.fs( err );

							}else {

								console.log('USUNIETO :)');

								obj.remove( function( err, ok ){

									if( err ){

										console.fs( err );

									}else {

										console.fs('USUNIĘTO POMYSLNIE :)');
										socket.emit( socketName + '.remove', ok._id );

									}

								});

							}

						} );

					}

				});

			}

		});

	});

};

module.exports = FrameObjectController;