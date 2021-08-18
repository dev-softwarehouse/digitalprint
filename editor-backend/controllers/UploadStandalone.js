var util = require('util');
var path = require('path');
var fs = require('fs');
var dateFormat = require('dateformat');
var sharp = require('sharp');

var mainConf = require('../libs/mainConf.js');
console.log( mainConf );
//var Controller = require("../controllers/Controller.js");
var Upload = require('../models/Upload.js').model;
var ProjectImage = require('../models/ProjectImage.js').model;
var Q = require('q');

console.log(GLOBAL);
console.log('7474747856354678345678534276824567823456789345');

class UploadStandalone {

	constructor( files ){

	}

	uploadEdited ( req, res ){

		var def = new Q.defer();

		var file = req.files.userFile;
		var folderType = 'projectImages';
		var now = new Date();
		var projectImage = req.body.projectImage;
		var day=dateFormat(now, "yyyy-mm-dd");

		console.fs(req.body );

		var newUpload = new Upload();
		newUpload.ext = path.extname(file.name);
		newUpload.date = day;

		newUpload.save( function(err, saved) {

			if( err ){

				console.fs(err);

			} else {

				Upload.count({date: day}, function(err, counted){

					if( err ){

						console.fs(err);

					}

					var folderNumber = Math.round(counted/30);
					var folderDest = conf.staticDir + folderType + '/' + day +'/' + folderNumber + '/';
					mainConf.mkdir(folderDest);

					var filePath = req.files.userFile.path;
					//saveMainFile( req, res, folderType, filePath, folderDest, folderNumber, saved );

					fs.rename(

						filePath,
						folderDest + saved._id + saved.ext,
						function(error) {

							if(error) {

								res.send({
									errorCode: error,
									error: 'Ah crap! Something bad happened'
								});
								return;

							} else {

								var thumbReady = false;
								var minReady = false;

								var thumbDest = folderDest + 'thumb_' + saved._id + saved.ext.toLowerCase();
								var minDest = folderDest + 'min_' + saved._id + saved.ext.toLowerCase();

								var thumbSize = JSON.parse( req.body.thumbSize );
								var minSize = JSON.parse( req.body.minSize );

								saved.url = conf.staticPath+ '/'+ folderType +'/' + saved.date + '/' + folderNumber + '/' + saved._id + saved.ext;
								saved.minUrl = conf.staticPath+ '/'+ folderType + '/' + saved.date + '/' + folderNumber + '/min_' + saved._id + (saved.ext.toLowerCase());
								saved.thumbUrl = conf.staticPath+ '/'+ folderType + '/' + saved.date + '/' + folderNumber + '/thumb_' + saved._id + (saved.ext.toLowerCase());
								saved.folderNumber = folderNumber;
								saved.save(function(err, saved2){

									if( err ){

										console.fs(err);

									} else {

										sharp( folderDest + saved._id + saved.ext.toLowerCase() )
										  .resize( thumbSize.width, thumbSize.height)
										  .toFile( thumbDest, function(err){

											if( err  ){

												console.fs( err );

											}else {

												thumbReady = true;
												check();

											}

										});


										sharp( folderDest + saved._id + saved.ext.toLowerCase() )
										  .resize( minSize.width, minSize.height)
										  .toFile( minDest, function(err){

											if( err  ){

												console.fs( err );

											}else {

												minReady = true;
												check();

											}

										});


										var data = saved2.toJSON();
										data.minUrl = conf.staticPath+ '/'+ folderType + '/' + saved.date + '/' + folderNumber + '/min_' + saved._id + (saved.ext.toLowerCase());
										data.thumbUrl = conf.staticPath+ '/'+ folderType + '/' + saved.date + '/' + folderNumber + '/thumb_' + saved._id + (saved.ext.toLowerCase());

										function check(){

											if(  minReady && thumbReady ){

												console.log('odsylam zapytanie');

												ProjectImage.findOne({ _id: projectImage}).exec( function( err, image ){
													if( err ){
														console.log( err );
													}else {

														image.EditedUpload = saved;
														image.save( function( err, savedImage ){
															if( err ){
																console.log( err );
															}else {
																def.resolve( savedImage );
															}
														});

													}
												});

											}

										}
										//console.fs('Koniec zapisu!');
										//console.fs(saved2);
										//var thumbDest = folderDest + 'thumb_' + saved._id + saved.ext;
										//saveThumb( req, res, folderType, folderDest, saved2 );

										//res.send(saved2);
									}

								});

							}

						}

					);

				});

			}

		});

		return def.promise;

	}

	upload ( req, res ) {

		var def = new Q.defer();

		var file = req.files.userFile;
		var folderType = 'projectImages';
		var now = new Date();

		var day=dateFormat(now, "yyyy-mm-dd");

		console.fs(req.body );

		var newUpload = new Upload();
		newUpload.ext = path.extname(file.name);
		newUpload.date = day;

	 	newUpload.save( function(err, saved) {

	 		if( err ){

	 			console.fs(err);

	 		} else {

	 			Upload.count({date: day}, function(err, counted){

	 				if( err ){

	 					console.fs(err);

	 				}

	 				var folderNumber = Math.round(counted/30);
	 				var folderDest = conf.staticDir + folderType + '/' + day +'/' + folderNumber + '/';
	 				mainConf.mkdir(folderDest);

	 				var filePath = req.files.userFile.path;
	 				//saveMainFile( req, res, folderType, filePath, folderDest, folderNumber, saved );

	 				fs.rename(

						filePath,
						folderDest + saved._id + saved.ext,
						function(error) {

				            if(error) {

								res.send({
									errorCode: error,
				            		error: 'Ah crap! Something bad happened'
								});
				                return;

				            } else {

				            	var thumbReady = false;
				            	var minReady = false;

								var thumbDest = folderDest + 'thumb_' + saved._id + saved.ext.toLowerCase();
								var minDest = folderDest + 'min_' + saved._id + saved.ext.toLowerCase();

								var thumbSize = JSON.parse( req.body.thumbSize );
								var minSize = JSON.parse( req.body.minSize );

				            	saved.url = conf.staticPath+ '/'+ folderType +'/' + saved.date + '/' + folderNumber + '/' + saved._id + saved.ext;
				            	saved.folderNumber = folderNumber;
				            	saved.save(function(err, saved2){

				            		if( err ){

				            			console.fs(err);

				            		} else {

										sharp( folderDest + saved._id + saved.ext.toLowerCase() )
										  .resize( thumbSize.width, thumbSize.height)
										  .toFile( thumbDest, function(err){

										  	if( err  ){

										  		console.fs( err );

										  	}else {

										  		thumbReady = true;
										  		check();

										  	}

										});


										sharp( folderDest + saved._id + saved.ext.toLowerCase() )
										  .resize( minSize.width, minSize.height)
										  .toFile( minDest, function(err){

										  	if( err  ){

										  		console.fs( err );

										  	}else {

										  		minReady = true;
										  		check();

										  	}

										});


										var data = saved2.toJSON();
										data.minUrl = conf.staticPath+ '/'+ folderType + '/' + saved.date + '/' + folderNumber + '/min_' + saved._id + (saved.ext.toLowerCase());
										data.thumbUrl = conf.staticPath+ '/'+ folderType + '/' + saved.date + '/' + folderNumber + '/thumb_' + saved._id + (saved.ext.toLowerCase());

										function check(){

											if(  minReady && thumbReady ){

												console.log('odsylam zapytanie');
												def.resolve( data );

											}

										}
				            			//console.fs('Koniec zapisu!');
				            			//console.fs(saved2);
				            			//var thumbDest = folderDest + 'thumb_' + saved._id + saved.ext;
				            			//saveThumb( req, res, folderType, folderDest, saved2 );

				            			//res.send(saved2);
				            		}

				            	});

				            }

						}

				    );

	 			});

	 		}

	 	});

	}

};

module.exports = {
	Upload: UploadStandalone
}
