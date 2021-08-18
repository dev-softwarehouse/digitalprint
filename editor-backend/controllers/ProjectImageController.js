var util = require('util');
console.fs = require('../libs/fsconsole.js');
//var fs = require('fs');
var Q = require('q');

var Controller = require("../controllers/Controller.js");
var AdminProject = require('../models/AdminProject.js').model;
var ProjectImage = require('../models/ProjectImage.js').model;
var Upload = require('../models/Upload.js').model;

var generatorUID = require('../libs/generator.js');
//var Generator = generator.Generator;

function ProjectImageController( controller ) {
	//console.fs(generator());
	this.socket = controller.socket;
	this.io = controller.io;
    //AdminProjectController.super_.call(this);
    this.name = "ProjectImageController";
    this.socketName = "ProjectImage";
};

util.inherits(ProjectImageController, Controller);

// metody
//  ProjectImageController._addedToProject( projectImageID, projectID )
ProjectImageController._addedToProject = function( projectImageUID, projectID ){

	var def = Q.defer();

	ProjectImage.findOne({ uid: projectImageUID }, function( err, projectImage ){

        if( err ){

            console.fs( err );

        }else {

            var test = {};

            for( var key in projectImage.projectUsed ){

            	test[ key ] = projectImage.projectUsed[key];

            }

            if( test ){

	            if( test[ projectID ] ){

					test[ projectID ] += 1;

	            }else {

	            	test[projectID ] = 1;

	            }

	        }else {

	        	test = {};
	        	test[ projectID ] = 1;

	        }

	        projectImage.projectUsed = test;

            projectImage.save( function( err ,saved ){

            	if( err ){

            		console.fs( err );

            	}else {

            		def.resolve( saved );

            	}

            });

        }

    });

    return def.promise;

}


ProjectImageController._removedFromProject = function( projectImageUID, projectID ){

	var def = Q.defer();

	ProjectImage.findOne({ uid: projectImageUID }, function( err, projectImage ){

        if( err ){

            console.fs( err );

        }else if(projectImage){

            var test = {};

            for( var key in projectImage.projectUsed ){

            	test[ key ] = projectImage.projectUsed[key];

            }

            if( test ){

	            if( test[ projectID ] ){

					test[ projectID ] -= 1;

	            }else {

	            	test[projectID ] = 0;

	            }

	        }else {

	        	test = {};
	        	test[ projectID ] = 0;

	        }

	        projectImage.projectUsed = test;

            projectImage.save( function( err ,saved ){

            	if( err ){

            		console.fs( err );

            	}else {

            		def.resolve( saved );

            	}

            });

        }

    });

    return def.promise;

}



ProjectImageController._resetUseInProject = function( projectImageID, projectID ){

	var def = Q.defer();

	ProjectImage.findOne({ _id: projectImageID }, function( err, projectImage ){

        if( err ){

            console.fs( err );

        }else {

            var test = {};

            for( var key in projectImage.projectUsed ){

            	test[ key ] = projectImage.projectUsed[key];

            }

            if( test ){

	            if( test[ projectID ] ){

					test[ projectID ] = 0;

	            }else {

	            	test[projectID ] = 0;

	            }

	        }else {

	        	test = {};
	        	test[ projectID ] = 0;

	        }

	        projectImage.projectUsed = test;

            projectImage.save( function( err ,saved ){

            	if( err ){

            		console.fs( err );

            	}else {

            		def.resolve( saved );

            	}

            });

        }

    });

    return def.promise;

}



ProjectImageController.prototype.add = function() {

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(this.socketName+'.add', function(data) {

		var adminProjectID = data.adminProjectID;
		delete data.adminProjectID;
		//console.fs(data);

		var newProjectImage = new ProjectImage(data);

		newProjectImage.save( function(err) {

			if(err){

				console.fs(err);

			} else {

				AdminProject.findOne( { _id: adminProjectID }, function(err, ap) {

					if( err || ap === null ){

						io.sockets.emit( this.socketName+'.error', 'Nie ma projektu!' );

					}

					ap.ProjectImages.push(newProjectImage);

					ap.save( function(err, saved) {

						//console.fs('dodalem obrazek');
						//io.sockets.emit( 'ProjectImage.add', newProjectImage );
						io.to('AdminProject:'+data.adminProjectID).emit( socketName+'.add', newProjectImage );

					});

				});
			}

		});

	});

};

ProjectImageController.prototype.addNoRef = function() {

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(this.socketName+'.addNoRef', function(data) {

		//console.fs(data);
		console.log( data );
		var adminProjectID = data.adminProjectID;
		delete data.adminProjectID;
		//console.fs(data);

		var newProjectImage = new ProjectImage(data);

		newProjectImage.save( function(err, saved) {

			if(err){

				console.fs(err);

			} else {
				//console.fs( ' TUTHAH ' );
				//console.fs( newProjectImage );
				//console.fs('to: '+'AdminProject:'+adminProjectID);
				//console.fs( socketName+'.addNoRef' );

				console.log('LECI ODPOWIEDZ');
				console.log( saved );
				console.log('***************');

				socket.emit( socketName+'.addNoRef', saved );

			}

		});

	});

};

ProjectImageController.prototype.update = function() {

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.update', function( data ){


		var projectImageUID = data.projectImageUID;
		var uploadID = data.uploadID;

		delete data.projectImageUID;
		delete data.uploadID;

		console.log( projectImageUID );

		ProjectImage.findOne({ uid : projectImageUID }, function( err, projectImage ){

			if( err ){

				console.fs( err );

			} else {

				//console.fs( 'jaka data zostala przyslana' );

				console.log( projectImage  );

				for( var key in data ){

					
					projectImage[key] = data[key];

				}

				projectImage.save( function( err, _updatedProjectImage ){

					if( err ){

						console.fs( err );

					}
					else {

						var updated = {

							uid : _updatedProjectImage.uid

						};

						for( var key in data ){

							updated[key] = data[key];

						}

						if( uploadID !== undefined && uploadID !== null ){
							Upload.findOne({_id: uploadID}, function( err, _upload ) {
								_updatedProjectImage.Upload = _upload;
								_updatedProjectImage.save(function( err, _updatedProjectImage2 ){
									if(err){
										console.fs(err);
									} else {

										socket.emit('ProjectImage.update', _updatedProjectImage2 );

									}
								});
							});
						} else {

							socket.emit('ProjectImage.update', _updatedProjectImage );

						}

					}

				});

			}

		});

	});

}


ProjectImageController.prototype.remove = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(this.socketName+'.remove', function(data) {
		var projectImageUID = data.projectImageUID;

		ProjectImage.findOne({uid: projectImageUID}, function(err, pi) {

			if( err || pi === null ){
				socket.emit( this.socketName+'.error', 'Nie ma obrazków projektu!' );
			} else {
				pi.remove(function(err, removed){
					if(err){
						console.fs(err);
					} else {

						//var response = { 'ID': ID, 'uid': pi.uid };
						socket.emit( socketName+'.remove', removed );
					}
				});
			}
		});
	});
};

module.exports = ProjectImageController;
