	var util = require('util');
console.fs = require('../libs/fsconsole.js');
var path = require('path');
var fs = require('fs');
var dateFormat = require('dateformat');
var sharp = require('sharp');
//var form = require('connect-form');
//var app = require('../app.js');
var conf = require('../confs/main.js');
var mainConf = require('../libs/mainConf.js');
//var Controller = require("../controllers/Controller.js");
var Upload = require('../models/Upload.js').model;
var Q = require('q');

class UploadStandalone {

	constructor( app ){

		this.app = app;
		this.initRouting();

	}

	initRouting (){

		this.uploadRoute();

	}

	uploadRoute(){

		this.app.post('/image-data', function( req, res ){

			console.log('Przyszlo info o jakims image data :P');

		})

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

