var util = require('util');
var Controller = require("../controllers/Controller.js");
var UserSessionController = require('../controllers/UserSessionController.js').UserSessionController;
var User = require('../models/User.js').model;
var UserFolder = require('../models/UserFolder.js').model;
var UserEditor = require('../models/UserEditor.js').model;
var MainTheme = require('../models/MainTheme.js').model;
var View = require('../models/View.js').model;
var Theme = require('../models/Theme.js').model;
var ProjectImage = require('../models/ProjectImage.js').model;
var Format = require('../models/Format.js').model;
var mainConf = require('../libs/mainConf.js');
var jwt = require('jsonwebtoken');
var jwt_secret = mainConf.jwt_secret;
var Q = require('q');
var mongoose = require('mongoose');
var _ = require('underscore');
const nodemailer = require('nodemailer');
var sharp = require('sharp');
//var conf = require('../confs/main.js');
//var UserController = require( '../controllers/UserController' );

class UserFolderController {

	constructor( app, userController ){

		this.app = app;
		this.initRouting();
		this.UserController = userController;

	}

	checkUserRights( req, res ){

		var def = Q.defer();

		if( !req.headers['access-token'] ){

			res.status( 401 ).send('Wymagana autoryzacja');
			def.reject( { statusCode: 401, statusMessage: 'Wymagana autoryzacja'} );

		}else {

			if( !global.sessions[req.headers['access-token']] ){

				var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

				User.findOne({ userID: mongoose.Types.ObjectId(decodedToken.userEditorID) }).exec( function( err, user ){
					if( err ){
						console.log( err );
					}else {

						if( user ){
							console.log(user);
							console.log('TUTAJ');
							def.resolve( user );
						}else {

							res.status( 401 ).send('Wymagana autoryzacja - brak użytkownika o podanych parametrach');
							def.reject( { statusCode: 401, statusMessage: 'Wymagana autoryzacja - brak użytkownika o podanych parametrach'} );

						}

					}
				});

			}else {

				var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

				User.findOne({ userID: global.sessions[req.headers['access-token']] }).exec( function( err, user ){
					if( err ){
						console.log( err );
					}else {
						if( user ){
							console.log(user);
							console.log('TUTAJ 2');
							def.resolve( user );
						}else {
							res.status( 401 ).send( 'Wymagana autoryzacja - brak klucza autoryzacji' );
							def.reject( { statusCode: 401, statusMessage: 'Wymagana autoryzacja - brak klucza autoryzacji'} );
						}

					}
				});

			}

		}

		return def.promise;

	}

	passMaker(){

	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 32; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;

	}

	createGetProjectsForTypesRoute( app ){

		app.get('/getProjectsForTypes', function( req, res ){

			var types = req.body.types;

			console.log(types);

			MainTheme.find().exec( function( err, themes ){

				res.send( themes );

			});			

		});

	}

	initRouting(){

		this.createGetProjectsForTypesRoute( this.app );
		this.createFolderRoute( this.app );
		this.getFoldersRoute( this.app );
		this.getSingleFolderRoute( this.app );
		this.updateFolderNameRoute( this.app );
		this.removeFolderRoute( this.app );
		this.removeUserImage( this.app );
		this.movePhoto( this.app );
		this.copyPhoto( this.app );
		this.setPhotoLocation( this.app );
		this.setFolderLocation( this.app );
		this.emailShareFolder( this.app );
		this.makeBook( this.app );
		this.makeBookFromFilter( this.app );
		this.facebookShareFolder( this.app );
		this.getSharedFolder( this.app );
		this.uploadChangedFile( this.app );
		this.emailShareImage( this.app );
		this.facebookShareImage( this.app );
		this.createFolderVoteRoute( this.app );
		this.createImageVoteRoute( this.app );
		this.createImageTagsRoute( this.app );
		this.createFindImageRoute( this.app );
		this.getImageParentFolder( this.app );
		this.createSetPlaceRoute( this.app );
		this.findImageByPlace( this.app );
		this.createAddAutor( this.app );
		this.findImageByAutor( this.app );
		this.addPeopleToImage( this.app );
		this.findImageWithPeople( this.app );
		this.findImageByRating( this.app );
		this.downloadFileExt( this.app );
		this.makeBookFromImages( this.app );

	}

	makeBookFromImages( app ){

		var _this = this;

		app.post('/folder/make-book-from-images', function( req, res ){

			_this.checkUserRights( req, res ).then( function( user ){

				var attributes = {};
				for( var key in req.body.attributes ){

					var _key = key.slice(1);
					attributes[ "" + _key ] = req.body.attributes[ key ];

				}

				_this.UserController.createProjectFromImages(req.headers['access-token'], req.body.typeID, req.body.formatID, req.body.pages, attributes, req.body.images ).then(

					//ok
					function( project ){
						res.send( project );
					}

				);

			});

		});

		/*

		$.ajax({
			url: url + 'folder/make-book-from-images',
			type: 'POST',
			headers: {
					"access_token": AuthService.readCookie("access_token")
			},
			data: {
					typeID: 44,
					pages: 16,
					formatID: 141,
					folderID: folder._id,
					attributes: {
									"i1":34,
									"i2":19,
									"i3":40,
									"i4":74,
									"i9":119,
									"i26":242
					},
					images: [tablica z _id obrazow]

			},
			crossDomain: true,
			withCredentials : true

	})
		*/

	}

	makeBookFromFilter( app ){

		var _this = this;

		app.post('/folder/make-book-from-filter', function( req, res ){

			_this.checkUserRights( req, res ).then( function( user ){

				/*

				$.ajax({
				                url: url + 'folder/make-book-from-filter',
				                type: 'POST',
				                headers: {
				                    "access_token": AuthService.readCookie("access_token")
				                },
				                data: {
				                    typeID: 44,
				                    pages: 16,
				                    formatID: 141,
				                    folderID: folder._id,
				                    attributes: {
				                            "i1":34,
				                            "i2":19,
				                            "i3":40,
				                            "i4":74,
				                            "i9":119,
				                            "i26":242
				                    },
														peoples: 'Marcin', // lub false,
														location: 'Krakwow', // lub false,
														autor: 'Autor' //lub false
				                },
				                crossDomain: true,
				                withCredentials : true

				            })
				*/

				//ok
				function check( user ){

					_this.getAllImagesFromUserFolders( user ).then( function( userImages ){

						var location = req.body.location;
						var peoples = req.body.peoples;
						var autor = req.body.authors;
						var allImages = [];

						var peoplesSearched, locationSearched, autorSearched = false;

						if( peoples ){
							ProjectImage.find( { _id: { $in: userImages }, peoples: { $in : [new RegExp('('+peoples+')+', "i")] } } ).deepPopulate('EditedUpload').exec( function( err, images ){

								if( err ){
									console.log( err );
								}else {

									for( var i=0; i<images.length; i++ ){

										var _image = _.findWhere( allImages, {_id: images[i]._id} );
										if( !_image ){
											allImages.push( images[i] );
										}

										peoplesSearched = true;
										check();

									}

								}

							});
						}else {
							peoplesSearched = true;
							check();
						}


						if( autor ){
							ProjectImage.find( { _id: { $in: userImages }, autor: new RegExp('('+autor+')+', "i")  } ).deepPopulate('EditedUpload').exec( function( err, images ){

								if(  err ){

									console.log( err );

								}else {
									for ( var i=0; i<images.length; i++ ){

										var _image = _.findWhere( allImages, {_id: images[i]._id} );
										if( !_image ){
											allImages.push( images[i] );
										}

										autorSearched = true;
										check();

									}
								}

							});
						}else {
								autorSearched = true;
								check();
						}


						if( location ){
							ProjectImage.find( { _id: { $in: userImages }, place: new RegExp('('+location+')+', "i") }  ).deepPopulate( "EditedUpload" ).exec( function( err,  images ){

								for ( var i=0; i<images.length; i++ ){

									var _image = _.findWhere( allImages, {_id: images[i]._id} );
									if( !_image ){
										allImages.push( images[i] );
									}

									peoplesSearched = true;
									check();

								}

								locationSearched=true;
								check();

							});
						}else {
							locationSearched = true;
							check();
						}

						function check(){

							if( locationSearched && peoplesSearched && autorSearched ){

								var attributes = {};
								for( var key in req.body.attributes ){

									var _key = key.slice(1);
									attributes[ "" + _key ] = req.body.attributes[ key ];

								}

								_this.UserController.createProjectFromImages(req.headers['access-token'], req.body.typeID, req.body.formatID, req.body.pages, attributes, allImages ).then(

									//ok
									function( project ){
										res.send( project );
									}

								);
							}

						}

					});


				}

			})

			var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');
			global.sessions[ req.headers['access-token'] ] = decodedToken.userEditorID;
			var attributes = {};
			for( var key in req.body.attributes ){

				var _key = key.slice(1);
				attributes[ "" + _key ] = req.body.attributes[ key ];

			}

			_this.UserController._addProject( req.headers['access-token'], req.body.typeID, req.body.formatID, req.body.pages, attributes, req.params.folder ).then(
				// function ok
				function( project ){

					res.send( project );

				}

			);

		});

	}

	downloadFileExt( app ){

		app.get('/get-image-in-extension/:id/:ext', function( req, res ){

			ProjectImage.findOne( { _id: req.params.id } ).deepPopulate('Upload').exec( function( err, image ){

				if( err ){

					console.log( err );

				}else {

					var pathTo = global.staticDir + global.companyID + '/userProjectImages/' + image.Upload.userID + "/" + image.Upload.date + '/' + image.Upload.folderNumber + '/' + image.Upload._id + image.Upload.ext;
					var pathDest = global.staticDir + global.companyID + '/userProjectImages/' + image.Upload.userID + "/" + image.Upload.date + '/' + image.Upload.folderNumber + '/' + image.Upload._id + '.'+ req.params.ext;
					console.log( pathDest);
					sharp( pathTo )[req.params.ext]().toBuffer(  function( err, data ){

						if( err ){

							console.log( err );
							res.status( 404 ).send();

						}else {
							res.setHeader('Content-Disposition', 'attachment; filename='+req.params.id +'.' +req.params.ext);
							res.setHeader('Content-Transfer-Encoding', 'binary');
							res.setHeader('Content-Type', 'application/octet-stream');
							res.end( data, 'binary');

						}

					});

				}

			});

		});

	}

	findImageWithPeople( app ){

		var _this = this;

		app.get('/get-image-by-peoples/:name', function( req, res ){

			_this.checkUserRights( req, res ).then( function( user ){

				UserFolder.find( { userOwner: user._id } ).exec( function( err, folder ){

					if( err ){

						console.log( err );

					}else {

						var images = [];

						for( var i=0; i < folder.length; i++){

							images = images.concat( folder[i].imageFiles );

						}

						ProjectImage.find( { _id: { $in: images }, peoples: { $in : [new RegExp('('+req.params.name+')+', "i")] } } ).deepPopulate('EditedUpload').exec( function( err, images ){

							if( err ){
								console.log( err );
							}else {

								res.status( 200 ).send( images );

							}

						})


					}

				});

			});

		});

	}

	addPeopleToImage( app ){

		var _this = this;

		app.post('/add-peoples-to-image/:imageID', function( req, res ){

			_this.checkUserRights( req, res ).then( function( user ){

				ProjectImage.findOne( { _id: req.params.imageID } ).exec( function( err, image ){

					if( err ){

						console.log( err );

					}else {

						image.peoples = image.peoples.concat( req.body.peoples );
						image.save( function( err, saved ){
							if( err ){
								console.log( err);
							}else {

								res.status(201).send();

							}

						});

					}
				});

			});

		});

	}

	getAllImagesFromUserFolders( user ){

		var def = Q.defer();

		UserFolder.find( { userOwner: user } ).deepPopulate('imageFiles imageFiles.EditedUpload').exec( function( err, folders ){

			var images = [];

			for( var i=0; i < folders.length; i++){

				images = images.concat( folders[i].imageFiles );

			}


			def.resolve( images );

		});

		return def.promise;

	}

	findImageByRating( app ){

		var _this = this;

		app.post('/get-image-by-rating', function( req, res ){

			var minValue = req.body.min;
			var maxValue = req.body.max;
			var parentFolder = req.body.folderID;

			_this.checkUserRights( req, res ).then(

				//ok
				function( user ){

					_this.getAllImagesFromUserFolders( user ).then(

						//ok
						function( images ){

							var filteredImages = [];

							for( var i=0; i < images.length;i++ ){

								if( images[i].averageRate >= minValue && images[i].averageRate <= maxValue ){
									filteredImages.push( images[i] );
								}

							}

							res.status( 200 ).send( filteredImages );

						}

					);

			}

		);

	});
}

	findImageByAutor( app ){

		var _this = this;

		app.get('/get-image-by-autor/:name', function( req, res ){

			_this.checkUserRights( req, res ).then( function( user ){

				UserFolder.find( { userOwner: user._id } ).exec( function( err, folders ){

					if( err ){

						console.log( err.message );
						console.log('ERROR');

					}else {

						var images = [];

						for( var i=0; i < folders.length; i++){

							images = images.concat( folders[i].imageFiles );

						}

						ProjectImage.find( { _id: { $in: images }, autor: new RegExp('('+req.params.name+')+', "i")  } ).deepPopulate('EditedUpload').exec( function( err, images ){

							if(  err ){

								console.log( err );

							}else {

								console.log('Znaleziono ' + images.length + ' obrazów');
								res.status( 200 ).send( images );

							}

						});


					}

				});

			});


		});

	}

	createAddAutor( app ){

		app.post('/set-image-autor/:imageID', function( req, res ){

			ProjectImage.findOne( { _id: req.params.imageID } ).exec( function( err, image ){

				if( err ){

					console.log( err );

				}else {

					image.autor = req.body.autor;
					image.save( function( err, saved ){
						if( err ){
							console.log( err);
						}else {

							res.status(201).send();

						}

					});

				}
			});
		});

	}

	findImageByPlace( app ){

		var _this = this;

		app.get('/get-image-by-place/:name', function( req, res ){

			_this.checkUserRights( req, res ).then(

				function( user ){

					UserFolder.find( {userOwner: user._id } ).exec( function( err, folders ){

						if( err ){

							console.log( err );

						}else {

							var images = [];

							for( var i=0; i < folders.length; i++){

								images = images.concat( folders[i].imageFiles );

							}

							ProjectImage.find( { _id: { $in: images }, place: new RegExp('('+req.params.name+')+', "i") }  ).deepPopulate( "EditedUpload" ).exec( function( err,  images ){

								res.status( 200 ).send( images );

							});


						}

					});

				}

			);


		});

	}

	createSetPlaceRoute( app ){

		var _this = this;

		app.post('/set-image-place/:imageID', function( req, res ){

			_this.checkUserRights( req, res ).then(

				function( user ){

					ProjectImage.findOne( { _id: req.params.imageID } ).exec( function( err, image ){

						if( err ){

							console.log( err );

						}else {

							image.place = req.body.place;
							image.save( function( err, saved ){

								if( err ){
									console.log( err);
								}else {
									res.status( 201 ).send();
								}

							});

						}

					});

				}

			);


		});

}

	getImageParentFolder( app ){

		var _this = this;

		app.get('/imagefolderParent/:imageID', function( req, res ){

			_this.checkUserRights( req, res  ).then(

				function( user ){

					UserFolder.findOne( { userOwner: user._id, imageFiles: { $in : [ req.params.imageID ] } }  ).deepPopulate('EditedUpload').exec( function( err, folder ){

						if( err ){
							console.log( err );
						}else {

							res.send( folder );

						}

					});

				}

			);


		});

	}

	createFindImageRoute( app ){

		var _this = this;

		app.post( '/folder/findImage/:name', function( req, res ){

			_this.checkUserRights( req, res  ).then(

				function( user ){

					UserFolder.find( { userOwner: user._id } ).exec( function( err, folders ){

						if( err ){

							console.log( err );

						}else {

							var imagesIDs = [];

							for( var i=0; i < folders.length; i++){

								imagesIDs = imagesIDs.concat( folders[i].imageFiles );

							}

							console.log( req.params.name);
							console.log('****************');

							ProjectImage.find( { _id: {$in: imagesIDs }, tags: { $in: [new RegExp('('+req.params.name+')+', "i")] } } ).deepPopulate('EditedUpload').exec( function( err, images ){

								res.status( 200 ).send( images );

							});

						}

					});
				}

			);


		});

	}

	createImageTagsRoute( app ){

		var _this = this;

		app.post('/folder/delete-image-tag/:imageID/:tag', function( req, res ){

			var image = ProjectImage.findOne( { _id: req.params.imageID } ).exec( function( err, image ){

				if( err ){
					console.log( err );
				}else {

					if( image.tags ){

						console.log( image.tags );
						image.tags.splice( image.tags.indexOf( req.params.tag ), 1 );
						console.log('))))))))))))))))))))))))))))))))))))))))))))))))))');
						console.log( image.tags );
					}

					image.save( function( err, saved ){

						if( err ){
							console.log( err );
						}else {

							res.status( 201 ).send();

						}

					});

				}

			});

		});

		app.post('/folder/image-tag/:imageID/:tag', function( req, res ){

			ProjectImage.findOne( { _id: req.params.imageID } ).exec( function( err, image ){

				if( err ){
					console.log( err );
				}else {

					if( image.tags ){
						image.tags.push( req.params.tag );
					}else {

						image.tags = [];
						image.tags.push( req.params.tag );

					}

					image.save( function( err, saved ){

						if( err ){

							console.log( err );

						}else {

							console.log('WYSYLAM');
							res.status( 201 ).send();

						}

					});

				}

			});

		});

	}

	createImageVoteRoute( app ){

		var _this = this;

		app.post( '/folder/image-vote/:imageID/:vote', function( req, res ){

			var user = new UserSessionController( req.headers['access-token'] );
			user.getUser().then(
				//ok
				function( user ){

					_this.userVoteForImage( user.userID, req.params.imageID, parseInt( req.params.vote )  ).then(

						//ok
						function( image ){

							var responseData = {

								userVote: req.params.vote,
								averageRate: image.averageRate

							}

							res.status( 200 ).send( responseData );

						},
						// fail
						function( reason ){
							console.log( reason );
							console.log( '---------------------------------------');
							res.status( 401 ).send( reason );

						}

					);

				},
				//fail
				function( reason ){

					if( reason.userID ){

						console.log('MOZESZ GLOSOWAC :)');

						_this.userVoteForImage( reason.userID, req.params.imageID, parseInt( req.params.vote )  ).then(

							//ok
							function( image ){

								var responseData = {

									userVote: req.params.vote,
									averageRate: image.averageRate

								}

								res.status( 200 ).send( responseData );

							},
							// fail
							function( reason ){
								console.log( reason );
								console.log( '---------------------------------------');
								res.status( 401 ).send( reason );

							}

						);

					}else {

						res.status( 401 ).send( reason );

					}

					console.log( reason );
					console.log( '---------------------------------------');

				}

			);

		});

	}

	createFolderVoteRoute( app ){

		var _this = this;

		app.post( '/folder/:folderID/vote/:vote', function( req, res ){

			var user = new UserSessionController( req.headers['access-token'] );
			user.getUser().then(
				//ok
				function( user ){

					_this.userVoteForFolder( user.userID, req.params.folderID, req.params.vote ).then(

						//ok
						function( folder ){

							var responseData = {

								userVote: req.params.vote,
								averageRate: folder.averageRate

							}

							res.status( 200 ).send( responseData );

						},
						// fail
						function( reason ){


							res.status( 401 ).send( reason );

						}

					);

				},
				//fail
				function( reason ){

					console.log( reason );
					if( reason.userID ){

						_this.userVoteForFolder( reason.userID, req.params.folderID, req.params.vote ).then(

							//ok
							function( folder ){

								var responseData = {

									userVote: req.params.vote,
									averageRate: folder.averageRate

								}

								res.status( 200 ).send( responseData );

							},
							// fail
							function( reason ){


								res.status( 401 ).send( reason );

							}

						);

					}else {

						res.status( 401 ).send( reason );

					}


				}

			);

		});

	}

	userVoteForFolder( userID, folderID, vote ){

		var def = Q.defer();
		var _this = this;

		UserFolder.findOne({ _id: folderID}).exec( function( err, folder ){

			if( err ){

				console.log( err );
				def.reject( err );

			}else {

				if( !folder.rating )
					folder.rating = {};

				folder.rating[ userID ] = vote;

				folder.save( function( err, saved ){

					if( err ){

						console.log( err );
						def.reject( err );

					}else {

						_this.recalculateFolderAverageVote( saved ).then(

							//ok
							function( saved ){

								def.resolve( saved);

							},
							// fail
							function( reason ){

								def.reject( reason );

							}

						);

					}

				});

			}

		});

		return def.promise;

	}

	userVoteForImage( userID, imageID, vote ){

		var def = Q.defer();
		var _this = this;

		ProjectImage.findOne({ _id: imageID}).exec( function( err, image ){

			if( err ){

				console.log( err );
				def.reject( err );

			}else {

				if( !image.rating )
					image.rating = {};

				image.rating[ userID ] = vote;

				image.save( function( err, saved ){

					if( err ){

						console.log( err );
						def.reject( err );

					}else {

						_this.recalculateImageAverageVote( saved ).then(

							//ok
							function( saved ){

								def.resolve( saved);

							},
							// fail
							function( reason ){

								def.reject( reason );

							}

						);

					}

				});

			}

		});

		return def.promise;

	}

	recalculateImageAverageVote( image ){

		var def = Q.defer();
		var votes = 0;
		var allVotes = 0;

		for( var key in image.rating ){

			votes++;
			allVotes+= parseInt( image.rating[key] );

		}

		console.log( allVotes );
		console.log( votes );
		console.log( '---------averageRate: ' + allVotes/votes );

		image.averageRate = allVotes/votes;
		image.save( function( err, saved ){

			if( err ){

				console.log( err );
				def.reject( err );

			}else {

				def.resolve( saved );

			}

		});

		return def.promise;

	}

	recalculateFolderAverageVote( folder ){

		var def = Q.defer();
		var votes = 0;
		var allVotes = 0;

		for( var key in folder.rating ){

			votes++;
			allVotes+= folder.rating[key];

		}

		folder.averageRate = allVotes/votes;
		folder.save( function( err, saved ){

			if( err ){

				console.log( err );
				def.reject( err );

			}else {

				def.resolve( saved );

			}

		});

		return def.promise;

	}

	uploadChangedFile( app ){

		app.post('/folder/user-image/creator/:imageID', function( req, res ){

			res.send('Widzę cię :)');

		});

	}

	makeBook( app ){

		var _this = this;

		app.post('/folder/make-book/:folder', function( req, res ){

			var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');
			global.sessions[ req.headers['access-token'] ] = decodedToken.userEditorID;
			var attributes = {};
			for( var key in req.body.attributes ){

				var _key = key.slice(1);
				attributes[ "" + _key ] = req.body.attributes[ key ];

			}

			_this.UserController._addProject( req.headers['access-token'], req.body.typeID, req.body.formatID, req.body.pages, attributes, req.params.folder ).then(
				// function ok
				function( project ){

					res.send( project );

				}

			);

		});

	}

	sendEmailShare( link, password, email ){

		console.log('LECI EM<AIL');
		console.log( password );
		console.log( link );
		console.log( email );

		var transporter = nodemailer.createTransport({
		    host: mainConf.smtp.host,
		    port: mainConf.smtp.port,

		    auth: {
		        user: mainConf.smtp.userName,
		        pass: mainConf.smtp.pass
		    },
			secure: false,
			tls: {
		        rejectUnauthorized:false
		    }
		});

		var mailOptions = {
		    from: 'zamowienia@efotogallery.pl', // sender address
		    to: email, // list of receivers
		    subject: 'Udostępniona zawartość', // Subject line
		    html: "Kliknij na link <a href='" + link + "'>Tutaj</a> i podaj hasło: " + password + " aby zobaczyc zawartosc.", // plain text body
		};

		transporter.sendMail(mailOptions, function(error, info){
		    if (error) {
		        return console.log(error);
		    }
		    console.log('Message %s sent: %s', info.messageId, info.response);

		});

	}

	facebookShareImage( app ){

		app.post('/folder/image/facebook-share/:image', function( req, res ){

			ProjectImage.findOne( { _id: req.params.image }).exec( function( err, image ){
				if( err ){
					console.log( err );
					res.status( 403 ).send( err );
				}else {

					image.facebookShare = true;

					image.save( function( err, savedImage ){
						if( err ){
							console.log( err );
							res.status( 403 ).send( err );
						}else {
							res.status( 201 ).send();
						}
					});

				}

			});

		});

	}

	facebookShareFolder( app ){

		app.post('/folder/facebook-share/:folder', function( req, res ){

			UserFolder.findOne( { _id: req.params.folder }).exec( function( err, folder ){
				if( err ){
					console.log( err );
					res.status( 403 ).send( err );
				}else {

					folder.facebookShare = true;

					folder.save( function( err, savedFolder ){
						if( err ){
							console.log( err );
							res.status( 403 ).send( err );
						}else {
							res.status( 201 ).send();
						}
					});

				}

			});

		});

	}

	getSharedFolder( app ){

		app.get('/folder/shared-by-facebook/:folder', function( req, res ){

			UserFolder.findOne( { _id: req.params.folder }).deepPopulate('imageFiles imageFiles.EditedUpload').exec( function( err, folder ){
				if( err ){

					console.log( err );
					res.status( 403 ).send( err );

				}else {

					if( folder.facebookShare ){

						var _folder = JSON.parse(JSON.stringify( folder ));
						delete _folder.password;
						res.send( _folder );

					}else {

						res.status( 403 ).send( err );

					}

				}

			});

		});

		app.get('/folder/image/shared-by-facebook/:image', function( req, res ){

			ProjectImage.findOne( { _id: req.params.image }).exec( function( err, image ){
				if( err ){

					console.log( err );
					res.status( 403 ).send( err );

				}else {

					if( image.facebookShare ){

						var _image = JSON.parse(JSON.stringify( image ));
						delete _image.password;
						res.send( _image );

					}else {

						res.status( 403 ).send( err );

					}

				}

			});

		});

		app.post('/folder/shared-by-mail/:folder', function( req, res ){

			UserFolder.findOne( { _id: req.params.folder }).deepPopulate('imageFiles imageFiles.EditedUpload').exec( function( err, folder ){
				if( err ){

					res.status( 403 ).send( err );

				}else {

					if( folder.emailShared ){

						if( req.body.password == folder.password ){

							var _folder = JSON.parse(JSON.stringify( folder ));
							delete _folder.password;

							res.send( _folder );

						}else {

							res.status( 403 ).send( err );

						}

					}else {

						res.status(403).send();

					}

				}

			});

		});

		app.post('/folder/image/shared-by-mail/:image', function( req, res ){

			ProjectImage.findOne( { _id: req.params.image }).deepPopulate('imageFiles imageFiles.EditedUpload').exec( function( err, image ){
				if( err ){

					res.status( 403 ).send( err );

				}else {

					if( image.emailShared ){

						if( req.body.password == image.password ){

							var _image = JSON.parse(JSON.stringify( image ));
							delete _image.password;

							res.send( _image );

						}else {

							res.status( 403 ).send( err );

						}

					}else {

						res.status(403).send();

					}

				}

			});

		});

	}

	emailShareImage( app ){

		var _this = this;
		//trzeba poprawic bezpieczenstwo
		app.post('/folder/image/email-share/:image', function( req, res ){

			ProjectImage.findOne( { _id: req.params.image }).exec( function( err, image ){
				if( err ){
					console.log( err );
					res.status( 403 ).send( err );
				}else {

					image.sharedEmails.push( req.body.email );
					image.emailShared = true;
					image.password = _this.passMaker();

					image.save( function( err, savedImage ){
						if( err ){
							console.log( err );
							res.status( 403 ).send( err );
						}else {

							var link = req.body.host + "/" + req.body.lang + "/" + "udostepnione-zdjecie/" + req.params.image + "/mail";
							_this.sendEmailShare( link, image.password ,req.body.email );
							res.status( 201 ).send();

						}

					});

				}

			});

		});

	}

	emailShareFolder( app ){

		var _this = this;
		//trzeba poprawic bezpieczenstwo
		app.post('/folder/email-share/:folder', function( req, res ){

			UserFolder.findOne( { _id: req.params.folder }).exec( function( err, folder ){
				if( err ){
					console.log( err );
					res.status( 403 ).send( err );
				}else {

					folder.sharedEmails.push( req.body.email );
					folder.emailShared = true;
					folder.password = _this.passMaker();

					folder.save( function( err, savedFolder ){
						if( err ){
							console.log( err );
							res.status( 403 ).send( err );
						}else {

							var link = req.body.host + "/" + req.body.lang + "/" + "udostepniony-folder/" + req.params.folder + "/mail";
							_this.sendEmailShare( link, folder.password ,req.body.email );
							res.status( 201 ).send();

						}

					});

				}

			});

		});

	}

	setPhotoLocation( app ){

		app.post('/folder/photo-location/:photoimage', function( req, res ){

			var image = req.params.photoimage;

			if( !req.headers['access-token'] ){

				notAccepted( 'Brak autoryzacji' );
				return;

			}else {

				if( !global.sessions[req.headers['access-token']] ){

					var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

					User.findOne({ userID: mongoose.Types.ObjectId(decodedToken.userEditorID) }).exec( function( err, user ){
						if( err ){
							console.log( err );
						}else {

							if( user ){
								userAccepted( user );
							}else {

								notAccepted( 'Nie ma takiego uzytkownika' );

							}

						}
					});

				}else {

					var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

					User.findOne({ userID: global.sessions[req.headers['access-token']] }).exec( function( err, user ){
						if( err ){
							console.log( err );
						}else {
							if( user ){
								userAccepted( user );
							}else {
								notAccepted( 'Jesteś nie zalogowany' );
							}

						}
					});

				}

			}

			function notAccepted( message ){
				res.status(401).send( message );
			}

			function userAccepted( user ){

				ProjectImage.findOne( { _id: image } ).exec( function( err, userImage ){

					if( err ){
						console.log( err );
					}else {

						if( userImage ){

							userImage.location = req.body.location;
							userImage.save( function( err, saved){
								if( err ){
									console.log( err );
								}else {
									res.status( 201 ).send();
								}
							});

						}else {

							res.status(401).send('Brak docelowego zdjęcia');

						}

					}

				});

			}

		});

	}

	setFolderLocation( app ){

		app.post('/folder/location/:folder', function( req, res ){

			var folder = req.params.folder;

			if( !req.headers['access-token'] ){

				notAccepted( 'Brak autoryzacji' );
				return;

			}else {

				if( !global.sessions[req.headers['access-token']] ){

					var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

					User.findOne({ userID: mongoose.Types.ObjectId(decodedToken.userEditorID) }).exec( function( err, user ){
						if( err ){
							console.log( err );
						}else {

							if( user ){
								userAccepted( user );
							}else {

								notAccepted( 'Nie ma takiego uzytkownika' );

							}

						}
					});

				}else {

					var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

					User.findOne({ userID: global.sessions[req.headers['access-token']] }).exec( function( err, user ){
						if( err ){
							console.log( err );
						}else {
							if( user ){
								userAccepted( user );
							}else {
								notAccepted( 'Jesteś nie zalogowany' );
							}

						}
					});

				}

			}

			function notAccepted( message ){
				res.status(401).send( message );
			}

			function userAccepted( user ){

				UserFolder.findOne( { _id: folder } ).exec( function( err, userFolder ){

					if( err ){
						console.log( err );
					}else {

						if( userFolder ){

							userFolder.location = req.body.location;
							userFolder.save( function( err, saved){
								if( err ){
									console.log( err );
								}else {
									res.status( 201 ).send();
								}
							});

						}else {

							res.status(401).send('Brak docelowego zdjęcia');

						}

					}

				});

			}

		});

	}

	copyPhoto( app ){

		app.post('/folder/photo-copy/:photoimage', function( req, res ){

			var image = req.params.photoimage;

			if( !req.headers['access-token'] ){

				notAccepted( 'Brak autoryzacji' );
				return;

			}else {

				if( !global.sessions[req.headers['access-token']] ){

					var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

					User.findOne({ userID: mongoose.Types.ObjectId(decodedToken.userEditorID) }).exec( function( err, user ){
						if( err ){
							console.log( err );
						}else {

							if( user ){
								userAccepted( user );
							}else {

								notAccepted( 'Nie ma takiego uzytkownika' );

							}

						}
					});

				}else {

					var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

					User.findOne({ userID: global.sessions[req.headers['access-token']] }).exec( function( err, user ){
						if( err ){
							console.log( err );
						}else {
							if( user ){
								console.log('Kopiowanie :)');
								userAccepted( user );
							}else {
								notAccepted( 'Jesteś nie zalogowany' );
							}

						}
					});

				}

			}

			function notAccepted( message ){
				res.status(401).send( message );
			}

			function userAccepted( user ){

				UserFolder.findOne( { _id: req.body.targetFolder } ).exec( function( err, folder ){

					if( err ){
						console.log( err );
					}else {

						if( folder ){

							if( folder.imageFiles.indexOf( image ) > -1) {

								res.status(401).send('Ten obrazek już tam jest');
								return;

							}

							if( folder.userOwner.toString() != user._id.toString() ){
								res.status(401).send('Brak prawa');
								return;
							}

							folder.imageFiles.push( image );
							folder.save( function( err, saved ){

								if( err ){

									console.log( err );

								}else {

									res.status( 201 ).send();

								}

							});

						}else {

							res.status(401).send('Brak docelowego folderu');

						}

					}

				});

			}

		});

	}

	movePhoto( app ){

		app.post('/folder/photo/move/:photoimage', function( req, res ){

			var image = req.params.photoimage

			if( !req.headers['access-token'] ){

				notAccepted( 'Brak autoryzacji' );
				return;

			}else {

				if( !global.sessions[req.headers['access-token']] ){

					var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

					User.findOne({ userID: mongoose.Types.ObjectId(decodedToken.userEditorID) }).exec( function( err, user ){
						if( err ){
							console.log( err );
						}else {

							if( user ){
								userAccepted( user );
							}else {

								notAccepted( 'Nie ma takiego uzytkownika' );

							}

						}
					});

				}else {

					var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

					User.findOne({ userID: global.sessions[req.headers['access-token']] }).exec( function( err, user ){
						if( err ){
							console.log( err );
						}else {
							if( user ){
								userAccepted( user );
							}else {
								notAccepted( 'Jesteś nie zalogowany' );
							}

						}
					});

				}

			}

			function notAccepted( message ){
				res.status(401).send( message );
			}

			function userAccepted( user ){

				UserFolder.findOne( { _id: req.body.from } ).exec( function( err, folder ){

					if( err ){
						console.log( err );
					}else {

						if( folder ){

							if( !(folder.imageFiles.indexOf( image ) > -1) ){

								res.status(401).send('Brak podanego obrazka w tym folderze');
								return;

							}

							if( folder.userOwner.toString() != user._id.toString() ){
								res.status(401).send('Brak prawa');
								return;
							}

							UserFolder.findOne( { _id: req.body.targetFolder } ).exec( function( err, targetFolder ){

								if( err ){
									console.log( err );
								}else {

									if( targetFolder ){

										if( targetFolder.userOwner.toString() != user._id.toString() ){

											res.status(401).send('Brak prawa');
											return;

										}else {

											var imagesInFolder = _.filter( folder.imageFiles, function( elem ){

												if( elem.toString() != image ){
													return true;
												} else {
													return false;
												}

											});

											folder.imageFiles = imagesInFolder;

											folder.save( function( err, ok ){

												if( err ){
													console.log( err );
												}else {
													targetFolder.imageFiles.push( image );
													targetFolder.save( function( err, ok ){

														if( err ){
															console.log( err );
														}else {

															console.log('OK :)');
															res.status(201).send();

														}

													} );
												}

											});

										}

									}else {
										res.status(401).send('Nie ma folderu docelowego');
										return;
									}

								}

							});

						}else {
							console.log('nie mofge odnaleźć foldera ze zdjeciem');
						}

					}

				});

			}

		});

	}

	removeUserImage( app ){

		app.delete('/folder/:folderid/projectImage/:imageid', function( req, res ){


			if( !req.headers['access-token'] ){

				notAccepted( 'Brak autoryzacji' );
				return;

			}else {

				if( !global.sessions[req.headers['access-token']] ){

					var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

					User.findOne({ userID: mongoose.Types.ObjectId(decodedToken.userEditorID) }).exec( function( err, user ){
						if( err ){
							console.log( err );
						}else {

							if( user ){
								userAccepted( user );
							}else {

								notAccepted( 'Nie ma takiego uzytkownika' );

							}

						}
					});

				}else {

					var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

					User.findOne({ userID: global.sessions[req.headers['access-token']] }).exec( function( err, user ){
						if( err ){
							console.log( err );
						}else {
							if( user ){
								userAccepted( user );
							}else {
								notAccepted( 'Jesteś nie zalogowany' );
							}

						}
					});

				}

			}




			function notAccepted( message ){

				res.status(401).send( message );

			}


			function userAccepted( user ){

				UserFolder.findOne( { _id: req.params.folderid } ).deepPopulate('imageFiles imageFiles.EditedUpload').exec( function( err, folder ){

					if( err ){

						console.log( err );

					}else {


						folder.imageFiles = _.filter( folder.imageFiles, function( elem ){
							console.log( elem._id.toString() );
							console.log( req.params.imageid );
							if( elem._id.toString() != req.params.imageid ){
								console.log('Zostaje');
								return true;
							} else {
								console.log('usuwam');
								elem.remove();
								return false;
							}

						});

						console.log( folder );
						folder.save( function( err, folder ){

							if( err ){
								console.log( err );
							}else {
								res.send( folder );
							}

						});

					}

				});

			}

		});

	}

	removeFolderRoute( app ){

		var _this = this;

		app.delete( '/folder', function( req, res ){

			if( !req.headers['access-token'] ){

				notAccepted( 'Brak autoryzacji' );

			}else {

				if( !global.sessions[req.headers['access-token']] ){

					var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

					User.findOne({ userID: mongoose.Types.ObjectId(decodedToken.userEditorID) }).exec( function( err, user ){
						if( err ){
							console.log( err );
						}else {

							if( user ){
								userAccepted( user );
							}else {

								notAccepted( 'Nie ma takiego uzytkownika' );

							}

						}
					});

				}else {

					var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

					User.findOne({ userID: global.sessions[req.headers['access-token']] }).exec( function( err, user ){
						if( err ){
							console.log( err );
						}else {
							if( user ){
								userAccepted( user );
							}else {
								notAccepted( 'Jesteś nie zalogowany' );
							}

						}
					});

				}

			}


			function notAccepted( message ){

				console.log( message );

			}

			function userAccepted( user ){

				if( req.body.folderId ){
					_this.remove( user._id, req.body.folderId ).then(
						function( folder ){
							res.send( folder );
						},
						function( message ){
							res.status( 400 ).send( message );
						}
					);
				}else {

					res.status( 400 ).send( 'Brak folderId' );

				}

			}

		});


	}

	updateFolderNameRoute( app ){

		var _this = this;

		app.post('/folder', function( req, res ){

			if( !req.headers['access-token'] ){
				notAccepted();
			}

			if( !global.sessions[req.headers['access-token']] ){

				var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

				User.findOne({ userID: mongoose.Types.ObjectId(decodedToken.userEditorID) }).exec( function( err, user ){
					if( err ){
						console.log( err );
					}else {

						if( user ){
							userAccepted( user );
						}else {

							notAccepted();

						}

					}
				});

			}else {

				User.findOne({ userID: global.sessions[req.headers['access-token']] }).exec( function( err, user ){
					if( err ){
						console.log( err );
					}else {
						if( user ){
							userAccepted( user );
						}else {
							notAccepted();
						}

					}
				});
			}

			function notAccepted(){
				res.status( 403 ).send();
			}

			function userAccepted( user ){

				UserFolder.findOne( { _id: req.body.folderId } ).exec( function( err, folder ){

					if( err ){
						console.log( err );
					}else {

						if( folder && folder.userOwner.toString()+'' == user._id ){

							if( req.body.folderName ){
								folder.folderName = req.body.folderName;
							}

							if( req.body.description ){
								folder.description = req.body.description;
							}

							folder.save( function( err, updatedFolder ){

								if( err ){
									console.log( err );

								}else {

									res.send( updatedFolder );
								}

							});

						}else {
							res.status(403).send('Nie posiadasz takiego foldera');
						}

					}

				});

			}

		});


	}
	//59087e5bed94c93244bc0b75
	getFoldersRoute( app ){

		var _this = this;

		app.get('/folder', function( req, res ){

			var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');
			console.log( decodedToken );
			if( !req.headers['access-token'] )
				notAccepted();

			if( !global.sessions[req.headers['access-token']] ){
				console.log('niema sesja');
				User.findOne({ userID:  mongoose.Types.ObjectId(decodedToken.userEditorID) }).exec( function( err, user ){
					if( err ){
						console.log( err );
					}else {
						console.log( user );
						console.log( "USER" );
						if( user ){
							//console.log(user);
							userAccepted( user._id );
						}else {

							notAccepted();

						}

					}

				});

			}else {

				console.log('jest sesja');
				User.findOne({ userID: global.sessions[req.headers['access-token']] }).exec( function( err, user ){
					if( err ){
						console.log( err );
					}else {
						console.log(user);
						if( user ){
							userAccepted( user._id );
						}else {

							notAccepted();

						}

					}
				});

			}

			function notAccepted(){
				res.status( 404 ).send();
			}

			function userAccepted( userEditorID ){

				if( req.query.sortBy ){

					UserFolder.find( { userOwner: userEditorID } ).sort([[req.query.sortBy, req.query.order ]]).skip( (req.query.page-1) * req.query.display ).limit( req.query.display ).deepPopulate('imageFiles imageFiles.EditedUpload').exec( function( err, folders ){

						if( err ){
							res.status(500).send( 'Błąd przy pobieraniu informacji o folderach' );
						}else {

							UserFolder.count({ userOwner: userEditorID}, function( err, count ){

								for( var i=0; i < folders.length; i++ ){

									if( folders[i].rating ){

										if( folders[i].rating[ userEditorID ] ){

											folders[i].userRating = folders[i].rating[ userEditorID ];
											delete folders[i].rating;

										}else {

											folders[i].userRating = null;
											delete folders[i].rating;

										}

									}else {

										folders[i].userRating = null;
										delete folders[i].rating;

									}

								}

								res.send( { data: folders, allCount: count });

							});
						}

					});

				}else {

					UserFolder.find( { userOwner: userEditorID } ).skip( (req.query.page-1) * req.query.display ).limit( req.query.display ).deepPopulate('imageFiles imageFiles.EditedUpload').exec( function( err, folders ){

						if( err ){
							res.status(500).send( 'Błąd przy pobieraniu informacji o folderach' );
						}else {

							UserFolder.count({ userOwner: userEditorID }, function( err, count ){

								for( var i=0; i < folders.length; i++ ){

									if( folders[i].rating ){

										if( folders[i].rating[ userEditorID ] ){

											folders[i].userRating = folders[i].rating[ userEditorID ];
											delete folders[i].rating;

										}else {

											folders[i].userRating = null;
											delete folders[i].rating;

										}

									}else {

										folders[i].userRating = null;
										delete folders[i].rating;

									}

								}

								res.send( { data: folders, allCount: count} );

							});

						}

					});

				}

			}

		})

	}


	getSingleFolderRoute( app ){

		app.get('/folder/:folderid', function( req, res ){

			if( !req.headers['access-token'] )
				notAccepted();

			if( !global.sessions[req.headers['access-token']] ){

				var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

				User.findOne({ userID: mongoose.Types.ObjectId(decodedToken.userEditorID) }).exec( function( err, user ){
					if( err ){
						console.log( err );
					}else {
						if( user ){
							console.log(user);
							userAccepted( user._id );
						}else {

							notAccepted();

						}

					}
				});

			}else {

				userAccepted( global.sessions[req.headers['access-token']] );

			}

			function notAccepted(){
				res.status( 403 ).send();
			}

			function userAccepted( userEditorID ){

				var sortOpt = {};
				sortOpt[req.query.sortBy] = req.query.order;

				var options = {
					populate:{
						'imageFiles':{
							options: {
								sort: sortOpt,
								skip: ((req.query.page-1) * req.query.display),
								limit: parseInt(req.query.display),
							}
						}
					}
				}

				UserFolder.findOne( { _id: req.params.folderid } ).deepPopulate('imageFiles imageFiles.EditedUpload', options).exec( function( err, folder ){

					if( err ){
						console.log( err );
						res.status(500).send( 'Błąd przy pobieraniu informacji o folderach' );
					}else {

						for( var i=0; i < folder.imageFiles.length; i++ ){

							if( folder.imageFiles[i].rating ){

								if( folder.imageFiles[i].rating[ userEditorID ] ){

									folder.imageFiles[i].userRating = folder.imageFiles[i].rating[ userEditorID ];
									delete folder.imageFiles[i].rating;

								}else {

									folder.imageFiles[i].userRating = 0;
									delete folder.imageFiles[i].rating;

								}

							}else {

								folder.imageFiles[i].userRating = 0;
								folder.imageFiles[i].averageRate = 0;
								delete folder.imageFiles[i].rating;

							}

						}

						if( folder.rating ){

							if( folder.rating[ userEditorID ] ){

								folder.userRating = folder.rating[ userEditorID ];
								delete folder.rating;

							}else {

								folder.userRating = 0;
								delete folder.rating;

							}

						}else {

							folder.userRating = 0;
							folder.averageRate = 0;
							delete folder.rating;

						}
						UserFolder.findOne( { _id: req.params.folderid } ).exec( function ( err, folderCount ){

							if( err ){
								console.log( err );
							}else {

								res.send( { data:folder, allCount: folderCount.imageFiles.length } );

							}

						});
					}

				});

			}

		})

	}

	createFolderRoute( app ){

		var _this = this;
		app.put('/folder', function( req, res ){
			console.log( req.headers['access-token'] );
			if( !req.headers['access-token'] )
				notAccepted();

			if( !global.sessions[req.headers['access-token']] ){

				var decodedToken = jwt.decode( req.headers['access-token'], jwt_secret, 'HS256');

				User.findOne({ userID: decodedToken.userEditorID }).exec( function( err, user ){

					console.log(user);

					if( err ){
						console.log( err );
					}else {
						if( user ){
							userAccepted( user._id );
						}else {
							var user = {
								userID: decodedToken.userEditorID
							}

							console.log( decodedToken );
							console.log('((((((((((decodedtoken))))))))))');
							console.log( user );
							var newUser = new User( user );
							newUser.save( user, function( err, user ){

								if( err ){
									//console.log( err );
									//console.log( user );
									userAccepted( user._id );
								}else {
									console.log( user );
									global.sessions[req.headers['access-token']] = user.userID;
									userAccepted( user._id );
								}

							});

						}

					}
				});

			}else {

				User.findOne({ userID: global.sessions[req.headers['access-token']] }).exec( function( err, user ){

					if( err ){
						console.log( err );
					}else {
						userAccepted( user._id );
					}
				});

			}

			function userAccepted( userID ){

				console.log( req.body.parent );

				if( req.body.parent ){

					UserFolder.findOne({_id: req.body.parent }).exec( function( err, folder){

						if( err || !folder ){
							console.log( err );
							res.status(400).send('Brak folderu nadrzędnego');
						}else {

							_this.create( userID, req.body.folderName, req.body.description, folder._id, req.body.date ).then(
								function(){

								},
								function(){

								}
							);

						}

					});

				}else {

					_this.create( userID, req.body.folderName, req.body.description, null, req.body.date ).then(
						function( folderData ){

							console.log( folderData );
							console.log('ZROBILEM FOLDER');
							res.status(200).send( folderData );

						},
						function(){
								console.log('nie wyszlo 1');
						}

					);

				}

			}

			function notAccepted(){
				console.log('nie wyszlo 2');
				res.status(403).send('Błąd autoryzacji');
			}

		});

	}

	remove( userID, folderId ){

		var def = Q.defer();

		UserFolder.findOne( { _id: folderId } ).exec( function( err, folder ){

			if( err ){
				console.log( err );
			}else {

				if( folder ){

					if( folder.userOwner.toString() == userID ){

						for( var i=0; i < folder.imageFiles.length; i++ ){

							ProjectImage.remove( folder.imageFiles[i] );
							console.log('Usuwam zdjęcie :P');
						}
						console.log( folder );
						UserFolder.remove( { _id : folder._id} ).exec( function( err, removed ){

							if( err ){
								console.log( err );
								def.reject( 'Błąd wewnętrzny' );
							}else {
								console.log( 'Usuniety folder' );
								def.resolve( folder );
							}

						} );

					}else {

						def.reject( 'Nie posiadasz takiego foldera' );

					}


				}else {

					def.reject('Brak folderu');

				}

			}

		});

		return def.promise;

	}

	create( userID, folderName, folderDescription, folderParent, date ){

		var def = Q.defer();

		var data = {
			userOwner: userID,
			folderName: folderName,
			folderParent: folderParent,
			description: folderDescription,
			date: date
		}

		var newFolder = new UserFolder(data);
		newFolder.save( data, function(err, folder){

			if( err ){
				console.log( err );
				res.status(500).send('Błąd wewnetrzny');
			}else {
				if( folderParent ){
					UserFolder.findOne({ _id: folderParent }).exec( function( err, parent ){

						if( err ){
							console.log( err );
						}else {
							parent.childFolders.push( folder._id );
							parent.save( function( err, updatedParentFolder ){
								if( err ){
									console.log( err);
								}else {
									def.resolve( { id: folder._id, name: folderName, parent: folderParent } );

								}
							});
						}

					});
				}else {
					def.resolve( { id: folder._id, name: folderName, parent: folderParent } );
				}
			}

		});

		return def.promise;

	}

}

module.exports = {
	UserFolder: UserFolderController
};
