
//import { format } from '../controllers/C:/Users/rig/AppData/Local/Microsoft/TypeScript/2.6/node_modules/@types/sharp';

var util = require('util');
console.fs = require('../libs/fsconsole.js');
var path = require('path');
var fs = require('fs');
var dateFormat = require('dateformat');
var Q = require('q');
var _ = require('underscore');
var mainConf = require('../libs/mainConf.js');
var Controller = require("../controllers/Controller.js");
var UserProject = require('../models/UserProject.js').model;
var ComplexUserProject = require('../models/ComplexUserProject.js').model;
var ProductType = require('../models/ProductType.js').model;
var Format = require('../models/Format.js').model;
var ProductTypeController = require('../controllers/ProductTypeController.js');
var ThemeController =       require('../controllers/ThemeController.js');
var UserPageController = require('../controllers/UserPageController.js');
var ProjectImage = require('../models/ProjectImage.js').model;
var Theme = require('../models/Theme.js').model;
var UserView = require('../models/UserView.js').model;
var UserPage = require('../models/UserPage.js').model;
var UserViewController = require('../controllers/UserViewController.js');
var ProposedImage = require('../models/ProposedImage.js').model;
var ProposedTemplate = require('../models/ProposedTemplate').model;
var ProjectImageController = require('../controllers/ProjectImageController.js');
var User = require('../models/User.js').model;
var jwt = require('jsonwebtoken');
var jwt_secret = mainConf.jwt_secret;
const nodemailer = require('nodemailer');

function UserProjectController( controller ) {

	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "UserProjectController";
    this.socketName = "UserProject";

}


util.inherits(UserProjectController, Controller);

UserProjectController._addView = function( projectID, previousPageID, nextPageID ){



};

UserProjectController.returnShareLink = function( ref ){

	var link = 'edytor.nowa.efotogallery.pl/?loadProject=' + ref._id + '&typeID=' + ref.typeID + '&formatID=' + ref.formatID;
	console.log( link );
	return link;

}


UserProjectController.sendShareInfo = function( email, ref ){

	var def = Q.defer();

	let transporter = nodemailer.createTransport({
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

	var link = 'edytor.nowa.efotogallery.pl/?loadProject=' + ref._id + '&typeID=' + ref.typeID + '&formatID=' + ref.formatID;

	if( email ){

		let mailOptions = {
			from: 'zamowienia@efotogallery.pl', // sender address
			to: email, // list of receivers
			subject: 'Udostępniony projekt', // Subject line
			html: "Kliknij na link <a href='" + link + "'>Tutaj</a> i edytuj udostępniony projekt!", // plain text body
		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				return console.log(error);
			}
			console.log('Message %s sent: %s', info.messageId, info.response);

			def.resolve();

		});
	}else {
		def.resolve();
	}

	return def.promise;

}

UserProjectController.clone = function( projectID ){

	var def = Q.defer();

	UserProject.findOne( { _id: projectID } ).exec( function( err, project ){

		var projectImages = [];
		var views = [];

		function cloneViews( viewIndex ){

			if( project.Views[ viewIndex ] ){
				console.log('KLONOWANIE Vidowku: ' + viewIndex );
				UserViewController.clone( project.Views[ viewIndex ] ).then(

					function( view ){
						console.log('WIDOK SKLONOWANY');
						views.push( view );
						cloneViews( viewIndex+1 );

					}

				);

			}else {

				var projectData = project;
				delete projectData._id;
				projectData.Views = views;

				var newProject = new UserProject( projectData );
				newProject.save( function ( err, saved ){

					def.resolve( saved );

				});

			}

		}

		cloneViews( 0 );

	});

	return def.promise;

}

UserProjectController._calculateUserImageUsedCount = function( userProjectID, userImage ){

	UserProject.findOne({ _id : userProjectID }).deepPopulate('Pages').exec(function( err, userProject ){

		if( err ){

			console.fs( err );

		}else {

			console.fs('wlazloooo kuurwa i tera trze policzyc wszystko');

		}

	});

}


UserProjectController._prepareViews = function( userProject, pagesCount ){


	console.log( pagesCount );
	console.log( '(((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((');

	var prepared = Q.defer();
	
	var views = userProject.Format.Views;
	var pages = [];

	for( var v=0; v < views.length; v++ ){

		pages = pages.concat( views[v].Pages );

	}

	var minPages = 0;
	var pagesStep = 0;
	var stepingView = null;
	var maxPages = 0;

	for( var v=0; v < views.length; v++ ){

		var currentView = views[v];

		if( currentView.repeatable ){

			stepingView = currentView;

			for( var p=0; p < currentView.Pages.length; p++ ){

				pagesStep += currentView.Pages[p].pageValue;

			}

		}

		for( var p=0; p < currentView.Pages.length; p++ ){

			minPages += currentView.Pages[p].pageValue;

		}

	}

	var countOfStepView = Math.ceil((pagesCount-(minPages-pagesStep))/pagesStep);

	/*
	console.fs("=============== Dane do przygotowania stron");
	console.fs("pagesToCreate: " + pagesCount );
	//console.fs("stepingView: " + stepingView );
	console.fs("minPages: " + minPages );
	console.fs("pagesStep: " + pagesStep );
	console.fs("neededSteps: " + countOfStepView );
	console.fs("===========================================");
	*/

	var preparedViews = [];
	var order = 0;

	for( var v=0; v < views.length; v++ ){

		var currentView = views[v];

		if( currentView == stepingView ){

			for( var i=0; i< countOfStepView; i++){

				var viewToCreate = {

					adminView : stepingView._id,
					order : order,
					pages : []
					//pageValue : currentView.Pages[0].pageValue

				}

				for( var p=0; p < currentView.Pages.length; p++  ){

					var currentPage = currentView.Pages[p];
					var pageToCreate = {

						order     : p,
						pageValue : currentPage.pageValue,
						parent_id : currentPage._id,
						vacancy   : currentPage.vacancy

					};

					viewToCreate.pages.push( pageToCreate );

				}

				preparedViews.push( viewToCreate );

				order++;

			}

		}
		else {

				var viewToCreate = {

					adminView : currentView._id,
					order : order,
					pages : []

					//pageValue : currentView.Pages[0].pageValue

				}

				for( var p=0; p < currentView.Pages.length; p++  ){

					var currentPage = currentView.Pages[p];
					var pageToCreate = {

						order : p,
						pageValue : currentPage.pageValue,
						parent_id : currentPage._id,
						vacancy   : currentPage.vacancy

					};

					viewToCreate.pages.push( pageToCreate );

				}

				preparedViews.push( viewToCreate );

			order++;

		}

	}

	var addedViews = 0;
	var allViews = preparedViews.length;

	for( var i=0; i < preparedViews.length; i++ ){

		addView( preparedViews[i].order, preparedViews[i].adminView, preparedViews[i].pages );

	}

	function addView( order, adminView, pages ){

		var _addView = UserViewController._add( order, adminView, pages );

		_addView.then( function( addedView ){

			userProject.Views.push( addedView );
			addedViews++;
			checkDone();

		}, function( err ){

			console.fs( err );

		});

	}

	function checkDone(){

		if( addedViews == allViews ){

			userProject.save( function( err, savedUserProject ){

				prepared.resolve( savedUserProject );

			});

		}

	}

	return prepared.promise;

};

UserProjectController._addPage = function( userProject ){

	var def = Q.defer();



	return def.promise;

};

UserProjectController._addMulti = function( types, formats, pages, attributes ){

	var makeProject = Q.defer();

	var projects = [];

	var i=0;
	
	console.log('PRZED PJEDYNCZYM DODAWANIEM :) ');
	console.log( pages );

	addSingle( types[i], formats[i], pages[i], attributes[i] );

	function addSingle( type, format, pagesCount, attributes, callback ){
		console.log( 'CO JEST PODANE' );
		console.log( pages );
		UserProjectController._add( type, format, pagesCount, attributes ).then(
			//ok
			( project ) => {
				projects.push( project );
				
				i++;

				if( types[i] ){
					addSingle( types[i], formats[i], pages[i], attributes[i] );
				}else {
					
					console.log('Utowrzono projekty');
					makeProject.resolve( projects );

				}

			},
			// fail
			( data ) => {
				console.log( data );
			}

		);

	}

	return makeProject.promise;

}


UserProjectController._add = function( typeID, formatID, pages, attributes ){

	var makeProject = Q.defer();
	console.log('PAGES: --->' + pages);
	var getFormat = ProductTypeController._getActiveAdminProjectFormat( typeID, formatID );

	getFormat.then(

		function( format ){

			var newUserProject = new UserProject();

			newUserProject.Format   		  = format;
			newUserProject.typeID   		  = typeID;
			newUserProject.formatID 		  = formatID;
			newUserProject.created  		  = new Date();
			newUserProject.pages    		  = pages;
			newUserProject.selectedAttributes = attributes;

			newUserProject.save( function( err, savedProject ){

				if( err ){

					makeProject.reject({'error': 'blad przy zapisie'});

				}
				else {

					UserProject.findOne({ _id : savedProject._id }).deepPopulate('Format Format.Views Format.Views.Pages').exec(function( err, userProject ){

						makeProject.resolve( userProject );

					});

				}

			});

		},
		function (){

			console.fs('NIE UDAŁO SIE !!!! :((');

		}

	);

	var preparePages = Q.defer();

	makeProject.promise.then( function( createdProject ){

		console.log( pages );
		console.log('PRZYGOTOWYWANIE WIDOKU');

		var preparedPages = UserProjectController._prepareViews( createdProject, pages );

		preparedPages.then( function( userProject ){

			preparePages.resolve( userProject );

		}, function(){

			preparePages.reject('nie wyszlo');

		});

	});

	return preparePages.promise;

};


UserProjectController.getProjectPages = function( userProjectID ){

	var def = Q.defer();
	
	ComplexUserProject.findOne({ _id : userProjectID}).deepPopulate('projects projects.Views projects.Views.Pages projects.Views.Pages.ProposedTemplate projects.Views.Pages.ProposedTemplate.ProposedImages projects.Views.Pages.UsedImages').exec(function( err, userProject ){

		if( err ){

			console.fs( err );

		}
		else {

			var views = [];
			console.log( userProject );
			userProject.projects.map( ( elem, index ) => {

				console.log( elem );
				console.log( _.sortBy( elem.Views, 'order' ) );
				views = views.concat( _.sortBy( elem.Views, 'order' ) );
				console.log( elem.Views.length );
				console.log('VIEWS: ' + views.length );
			});
			console.log( views );
			console.log('=====');

			var pages = [];

			var order = 0;

			for( var i=0; i < views.length; i++ ){

				var viewPages = views[i].Pages;
				viewPages = _.sortBy( viewPages, 'order' );

				for( var p=0; p < viewPages.length; p++ ){

					var currentPage = viewPages[p];
					currentPage.order = order;
					order++;
					pages.push( currentPage );

				}

			}
	
			console.log('mam strony');

			def.resolve( pages );

		}


	});

	return def.promise;

}

UserProjectController._setViewsOrders = function( viewsOrdersList, projectID ){

	var def = Q.defer();

	var viewsToUpdate = viewsOrdersList.length;
	var updatedViewsOrders = 0;

	// brakuje listy zmienionych widokow

	var viewsInfo = [];

	for( var i=0; i < viewsToUpdate; i++ ){

		UserViewController._reorder( viewsOrdersList[i].viewID, viewsOrdersList[i].order ).then(

			// ok
			function( viewInfo ){

				updatedViewsOrders++;
				viewsInfo.push( viewInfo );
				checkDone();

			}

		);

	}

	function checkDone(){

		if( viewsToUpdate == updatedViewsOrders ){
			console.log( projectID );
			console.log('CO SIE DZIEJE ?');
			UserProject.findOne( { _id: projectID } ).deepPopulate('Views Views.Pages').exec( function ( err, project ){
	
				console.log( err  );
				console.log( projectID );
				console.log( project );

				def.resolve( project.Views );

			});

		}

	}

	checkDone();

	return def.promise;

};

UserProjectController.prototype.setViewsOrders = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName+'.setViewsOrders', function( data ){

		UserProjectController._setViewsOrders( data.orders, data.userProjectID ).then( function( viewsInfo ){
			
			socket.emit( socketName+'.setViewsOrders', { views:viewsInfo, project: data.userProjectID });

		});

	});

};

UserProjectController._removeView = function( mainProject, userProject, userViewID ){
	var def = Q.defer();

	UserProject.findOne( { _id : userProject }).deepPopulate( 'Views Views.Pages Views.Pages.UsedImages Views.Pages.UsedImages.ProjectImage' ).exec( function( err, userProject ){

		if ( err ){

			console.fs( err );

		}else {

			var sortedViews = _.sortBy( userProject.Views,  'order' );

			UserView.findOne( { _id : userViewID }).deepPopulate( 'Pages' ).exec( function( err, userView ){

				if( err ){

					console.fs( err );

				}else {


					for( var key in userView.Pages[0].scene ){
						
						if( userView.Pages[0].scene["" + key].objectType == 'proposedImage' ){

							ProposedImage.findOne( { _id : userView.Pages[0].scene["" + key].object }).deepPopulate('objectInside objectInside.ProjectImage').exec( function( err, position ){

								if( err ){
					
									console.fs( err );
					
								}else {
								if(position.objectInside && position.objectInside.ProjectImage)
									ProjectImageController._removedFromProject( position.objectInside.ProjectImage.uid, mainProject ).then( 
					
										//ok
										function( projectImage ){
					
											var imageInfo = {};
											imageInfo[ projectImage.uid ] = projectImage.projectUsed[data.projectID];
							
					
										}
					
									);
					
									position.objectInside = null;
					
					
									position.save( function( err, saved ){
					
										if( err ){
					
											console.fs( err );
					
										}else {
					//TODO
											//socket.emit( socketName + '.removeObjectInside', data );
										}
					
									});
					
								}
					
							});

						}else if ( userView.Pages[0].scene["" + key].objectType == 'bitmap' ){

							ProjectImageController._removedFromProject( userView.Pages[0].scene["" + key].object, mainProject ).then(
	
								//ok
								function( data ){
			
								}
		
							);

						}

						
	
					}

					var thisViewOrder = userView.order;

					var greater = _.filter( sortedViews, function( view ){

						if( view.order > thisViewOrder )
							return true;
						else
							return false;

					} );

					var viewsToReorder = greater.length;
					var reorderedViews = 0;

					function checkDoneReordered(  ){

						if( viewsToReorder == reorderedViews ){

							userView.remove( function( err , removed ){

								if( err ){

									console.fs( err );

								}else {

									def.resolve();

								}

							} );

						}

					};

					for( var i=0; i < greater.length; i++ ){

						UserViewController._reorder( greater[i]._id, greater[i].order-1 ).then(

							// ok
							function( _userView ){

								reorderedViews++;
								checkDoneReordered();

							}

						);

					}

				}

			});

		}

	});

	return def.promise;

};

UserProjectController.prototype.removeView = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName+'.removeView', function( data ){

		UserProjectController._removeView( data.mainProject, data.projectID, data.viewID ).then(

			// ok
			function( userProject ){
				UserProject.findOne( { _id :  data.projectID }).deepPopulate( 'Views Views.Pages' ).exec( function( err, userProject ){

					socket.emit( socketName+'.removeView', { projectID: userProject._id ,views :userProject.Views, viewID:data.viewID} );
					UserProjectController._getProjectImagesUseNumber( data.mainProject ).then(

						// ok
						function( info ){
							socket.emit( 'UserProject.getProjectImagesUseNumber', info );

						}

					);
				});
			}

		);

	});

};

UserProjectController.prototype.addNewView = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName+'.addNewView', function( data ){
		UserProject.findOne({ _id : data.userProjectID }).deepPopulate('Format Format.Views Format.Views.Pages Views Views.Pages mainTheme mainTheme.ThemePages').exec(function( err, userProject ){
			
			var targetOrder = data.order;
			var targetProject = data.userProjectID;

			if( data.order ){

				let views = _.sortBy( userProject.Views, 'order' );

				for( var i=0; i< views.length; i++ ){


					if( i >= data.order ){
						views[i].order++;
					}

					views[i].save();
					//console.log( views[i].order );

				}

				for( var i=0;i < views.length; i++ ){
					
									console.log( views[i].order );
					
								}

			}

			ThemeController._getAllNotVacancyPages( userProject.mainTheme ).then(

				// ok
				function( vacancyPages ){

					var vacancyPages = vacancyPages;
					var views = userProject.Format.Views;
					var stepingView = null;
					var pagesStep = 0;

					for( var v=0; v < views.length; v++ ){

						var currentView = views[v];

						if( currentView.repeatable ){

							stepingView = currentView;

							for( var p=0; p < currentView.Pages.length; p++ ){

								console.fs( currentView.Pages[p].pageValue );
								pagesStep += currentView.Pages[p].pageValue;

							}

						}

					}

					var userStepingViews = userProject.Views;
					userStepingViews = _.filter( userStepingViews, function( view ){

						var stid = stepingView._id.toString();
						var viid = view.adminView.toString();

						if( stid == viid ){

							return true;

						}
						else {

							return false;

						}

					});

					console.fs( userStepingViews );


					var lastSteppingView = _.max( userStepingViews, function(view){ return view.order; });
					console.fs( lastSteppingView );

					// szukam ostatniej strony motywu, aby wczytać kolejną, narazie będzie to random
					var lastSteppingViewPages = lastSteppingView.Pages;



					var lastView = _.max( _.filter( userProject.Views, function( view ){

						var stid = stepingView._id.toString();
						var viid = view.adminView.toString();

						if( stid != viid ){

							return true;

						}
						else {

							return false;

						}

					} ), function( view ){

						return view.order;

					});

					for( var i=0; i < userProject.Views.length; i++){

						console.fs( userProject.Views[i].order );

					}

					if( stepingView ){

						var _addView = UserViewController._add( targetOrder, stepingView, stepingView.Pages );

						_addView.then( function( addedView ){

							var pagesToSet = addedView.Pages.length;
							var setedPages = 0;

							function checkFillThemePages(){

								if( pagesToSet == setedPages ){

									startSave();

								}

							}

							for( var i=0; i < pagesToSet; i++ ){

								var ran = Math.floor( Math.random() * vacancyPages.length );

								var randomThemePage = vacancyPages[ran];

								UserPageController._useThemePage( addedView.Pages[ i ], randomThemePage._id ).then(

									// jezeli sie uda ustawic strone motywu dla strony uzytkownika
									function( data ){

										setedPages++;
										checkFillThemePages();

									}

								);

							}

							function startSave(){

								userProject.Views.push( addedView );

								userProject.save( function( err, updatedProject ){

									if( err ){

										console.fs( err );

									}else {


										UserView.findOne({ _id : addedView._id }).deepPopulate('Pages').exec( function( err, addedView ){

											if( err ){

												console.fs( err );

											}else {

												socket.emit( socketName + '.addNewView', { 'newView' : addedView, 'oldViews': userProject.Views, 'projectID': targetProject} );

											}

										});

										//addNewView

									}

								});

							};

						}, function( err ){

							console.fs( err );

						});
						//console.fs( stepingView );
						//console.fs('mozna dodac kolejny widok :), da tododatkowo ' + pagesStep + ' nowych stron');

					}
				}

			);

			return;


		});

	});

};

UserProjectController._getAllViews = function( userProjectID ){

	var def = Q.defer();

	ComplexUserProject.findOne({ _id : userProjectID }).deepPopulate('projects.Views projects.Views.Pages projects.Views.Pages.ThemePage projects.Views.Pages.ProposedTemplate projects.Views.Pages.ProposedTemplate.ProposedTexts projects.Views.Pages.ProposedTemplate.ProposedImages projects.Views.Pages.ProposedTemplate.ProposedImages.objectInside projects.Views.Pages.ProposedTemplate.ProposedImages.objectInside.ProjectImage projects.Views.Pages.UsedTexts').exec( function( err, userProject ){

		if( err ){

			console.fs( err );

		}else {

			def.resolve( userProject );

		}

	});

	return def.promise;

}


UserProjectController.prototype.getAllViews = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName+'.getAllViews', function( data ){

		console.fs( data );
		console.fs('jest info');

		UserProjectController._getAllViews( data.userProjectID ).then(

			// ok
			function( data ){

				socket.emit( socketName+'.getAllViews', data );

			}

		);

	});

}

UserProjectController._getProjectImagesUseNumber = function( userProjectID ){

	var def = Q.defer();
	console.log( userProjectID );
	ComplexUserProject.findOne({ _id : userProjectID }).deepPopulate('projectImages').exec( function( err, userProject ){

		if( err ){

			console.fs( err );

		}else {


			var info = {};

			for( var i=0; i < userProject.projectImages.length; i++ ){

				info[ userProject.projectImages[i].uid ] = userProject.projectImages[i].projectUsed[ userProject._id.toString() ];

			}

			def.resolve( info );

		}

	});

	return def.promise;

};

UserProjectController._resetAllImagesUseNumber = function( userProjectID ){

	var def = Q.defer();

	ComplexUserProject.findOne({ _id : userProjectID }).deepPopulate('projectImages').exec( function( err, userProject ){

		if( err ){

			console.fs( err );

		}else {

			var updated = 0;

			for( var i=0; i < userProject.projectImages.length; i++ ){
				console.log( userProject.projectImages );

				if( userProject.projectImages[i].projectUsed ){

					userProject.projectImages[i].projectUsed[ userProject._id.toString() ] = 0;

				}else {

					userProject.projectImages[i].projectUsed = { };
					userProject.projectImages[i].projectUsed[ userProject._id.toString() ] = 0;

				}

				userProject.projectImages[i].save( function( err, updatedImage ){

					if( err ){  console.error( err ); return false; }

					updated++;
					checkDone();

				});
			}

			function checkDone(){

				if( updated == userProject.projectImages.length ){

					def.resolve();

				}

			}

		}

	});

	return def.promise;


}

UserProjectController.prototype.getProjectImagesUseNumber = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName+'.getProjectImagesUseNumber', function( data ){

		ComplexUserProject.findOne({ _id : data.userProjectID }).deepPopulate('projectImages').exec( function( err, userProject ){

			if( err ){

				console.fs( err );

			}else {


				var info = {};

				for( var i=0; i < userProject.projectImages.length; i++ ){

					info[ userProject.projectImages[i].uid ] = userProject.projectImages[i].projectUsed[ userProject._id.toString() ];

				}

				socket.emit( socketName + '.getProjectImagesUseNumber', info );

			}

		});

	});

}

UserProjectController._getPrevData = function( projectID ){

	var def = Q.defer();

	UserProject.findOne( { _id: projectID } ).deepPopulate('Views Views.Pages Views.Pages.prevImage').exec( function( err, project ){

		if( err  ){
			console.log( err );
		}else {

			var collectedPages = [];
			project.Views =  _.sortBy(project.Views, 'order');
			for( var i=0; i< project.Views.length; i++){

				for( var p=0; p < project.Views[i].Pages.length; p++ ){

					collectedPages.push( project.Views[i].Pages[p] );

				}

			}

			colectedPages = _.sortBy( collectedPages, 'order');

			def.resolve( collectedPages );

		}

	});

	return def.promise;

};

UserProjectController.findViewWithProposedImage = function( proposedImageID ){

	var def = Q.defer();

	ProposedTemplate.findOne( { ProposedImages : { $in : [proposedImageID] } } ).exec( function( err, template ){

		if( err ){

			console.log( err );

		}else {

			console.log( template );

			UserPage.findOne( { ProposedTemplate: { $in : [template._id]} } ).exec( function( err, page ){

				if( err ){

					console.log( err );

				}else {


					UserView.findOne( { Pages: { $in: [page._id] } } ).exec( function( err, view ){

						if( err ){

							console.log( err );

						}else {

							def.resolve( view );

						}

					});


				}

			});

		}

	});

	return def.promise;

}


UserProjectController.prototype.updatePagesPrev = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName+'.updatePagesPrev', function( data ){

		var token  = data.token;
		var miniatures = data.min;
		var created = 0;

		if( !GLOBAL.sessions[token] ){

			console.log( token );
			var decodedToken = jwt.decode( token, jwt_secret, 'HS256');

			User.findOne({ userID: decodedToken.userEditorID }).exec( function( err, user ){

				if( err ){
					console.log( err );
				}else {

					userID = user._id;


					for( var i=0; i < miniatures.length; i++ ){

						UserPageController._updatePagePrev( user._id, miniatures[i].id, miniatures[i].prev ).then(
							//ok
							function(){
								created++;
								check();
							}
						);

					}
				}

			});

		}else {

			User.findOne({ userID: GLOBAL.sessions[token] }).exec( function( err, user ){

				if( err ){
					console.log( err );
				}else {

					userID = user._id;

					for( var i=0; i < miniatures.length; i++ ){

						UserPageController._updatePagePrev( user._id, miniatures[i].id, miniatures[i].prev ).then(
							//ok
							function(){
								created++;
								check();
							}
						);

					}

				}


			});
		}

		function check(){
			console.log( created );
			console.log( miniatures.length );
			if( created == miniatures.length ){

				console.log('WSZYSTKO SIE ZAPISALO :)');
				socket.emit( socketName+'.updatePagesPrev', {});
			}

		}

	});

}


UserProjectController.prototype.removePhoto = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName+'.removePhoto', function( data ){

		var projectID = data.projectID;
		var imageUID = data.photoUID;

		console.log('Usuwanie zdjęcie ');
		console.log( data );

		ComplexUserProject.findOne({ _id : data.projectID }).deepPopulate('projectImages').exec( function( err , project ){

			if( err ){

				console.fs( err );

			}else {

				var imageToRemove = _.find( project.projectImages, function( elem ){

					if( elem.uid == imageUID )
						return true;
					else
						return false;

				})

				project.projectImages = _.filter( project.projectImages, function( elem ){

					if( elem.uid != imageUID )
						return true;
					else
						return false;

				});

				var usedTimes = imageToRemove.projectUsed[ projectID ];

				if( usedTimes != 0 ){

					var arr = [imageToRemove._id];
					var projectImages = project.projectImages;

					EditorBitmap.find( { ProjectImage : { $in : arr } } ).exec( function( err, bitmaps){

						ProposedImage.find( { objectInside : { $in: bitmaps } } ).deepPopulate('objectInside objectInside.ProjectImage').exec( function( err, proposedImages ){

							if( err ){

								console.fs( err );

							}else {

								var viewsIDs = [];
								var iterations = proposedImages.length;
								var removed = 0;

								for( var i=0; i < proposedImages.length; i++ ){

									let _i = i;

									proposedImages[_i].objectInside.remove( function( err, image ){

										if( err ){

											console.log( err );

										}else {

											proposedImages[_i].objectInside = null;
											proposedImages[_i].save( function( err, ok ){

												if( err ){

													console.log( err );

												}else {

													UserProjectController.findViewWithProposedImage( proposedImages[_i] ).then(

														function( view ){

															removed++;
															viewsIDs.push( view._id );
															checkDone();

														},
														function( err ){

														}

													);


												}

											});

										}

									});


								}

								checkDone();

								function checkDone(){

									if( removed == iterations ){

										projectImages = _.filter( projectImages, function( elem ){

											if( elem.uid != imageUID )
												return true;
											else
												return false;

										});

										project.projectImages = projectImages;

										project.save( function( err, savedProject ){

											if( err ){

												console.fs( err );

											}else {

												socket.emit('UserProject.removePhoto', { 'imageUID' : imageUID, 'views' : viewsIDs }  );

											}

										});


									}

								}


							}

						});

					});


				}else {

					var projectImages = project.projectImages;

					projectImages = _.filter( projectImages, function( elem ){

						if( elem.uid != imageUID )
							return true;
						else
							return false;

					});

					project.projectImages = projectImages;

					project.save( function( err, savedProject ){

						if( err ){

							console.fs( err );

						}else {

							console.fs( savedProject.projectImages );

							//imageToRemove.remove();

							socket.emit('UserProject.removePhoto',{ 'imageUID' : imageUID, 'views' : [] }  );

						}

					});


				}

			}

		});

	});

};

UserProjectController._removeProjectImage = function( socket, projectID, imageUID ){

	var def = Q.defer()

	ComplexUserProject.findOne({ _id : projectID }).deepPopulate('projectImages').exec( function( err , project ){

		if( err ){

			console.fs( err );

		}else {

			var imageToRemove = _.find( project.projectImages, function( elem ){

				if( elem.uid == imageUID )
					return true;
				else
					return false;

			})

			project.projectImages = _.filter( project.projectImages, function( elem ){

				if( elem.uid != imageUID )
					return true;
				else
					return false;

			});

			var usedTimes = imageToRemove.projectUsed[ projectID ];

			if( usedTimes != 0 ){

				var arr = [imageToRemove._id];
				var projectImages = project.projectImages;

				EditorBitmap.find( { ProjectImage : { $in : arr } } ).exec( function( err, bitmaps){

					ProposedImage.find( { objectInside : { $in: bitmaps } } ).deepPopulate('objectInside objectInside.ProjectImage').exec( function( err, proposedImages ){

						if( err ){

							console.fs( err );

						}else {

							var viewsIDs = [];
							var iterations = proposedImages.length;
							var removed = 0;

							for( var i=0; i < proposedImages.length; i++ ){

								let _i = i;

								proposedImages[_i].objectInside.remove( function( err, image ){

									if( err ){

										console.log( err );

									}else {

										proposedImages[_i].objectInside = null;
										proposedImages[_i].save( function( err, ok ){

											if( err ){

												console.log( err );

											}else {

												UserProjectController.findViewWithProposedImage( proposedImages[_i] ).then(

													function( view ){

														removed++;
														viewsIDs.push( view._id );
														checkDone();

													},
													function( err ){

													}

												);


											}

										});

									}

								});


							}

							checkDone();

							function checkDone(){

								if( removed == iterations ){

									projectImages = _.filter( projectImages, function( elem ){

										if( elem.uid != imageUID )
											return true;
										else
											return false;

									});

									project.projectImages = projectImages;

									project.save( function( err, savedProject ){

										if( err ){

											console.fs( err );

										}else {

											def.resolve( { 'imageUID' : imageUID, 'views' : viewsIDs } );

										}

									});


								}

							}


						}

					});

				});


			}else {

				var projectImages = project.projectImages;

				projectImages = _.filter( projectImages, function( elem ){

					if( elem.uid != imageUID )
						return true;
					else
						return false;

				});

				project.projectImages = projectImages;

				project.save( function( err, savedProject ){

					if( err ){

						console.fs( err );

					}else {

						console.fs( savedProject.projectImages );

						//imageToRemove.remove();
						def.resolve( { 'imageUID' : imageUID, 'views' : [] } );

					}

				});


			}

		}

	});

	return def.promise;

}


UserProjectController._removePhoto = function( projectID, projectImageUID, socket, dontRegenerate ){

		var def = Q.defer();

		var projectID = projectID;
		var imageUID = projectImageUID;



		UserProject.findOne({ _id : projectID }).deepPopulate('projectImages').exec( function( err , project ){

			if( err ){

				console.fs( err );

			}else {

				var imageToRemove = _.find( project.projectImages, function( elem ){

					if( elem.uid == imageUID )
						return true;
					else
						return false;

				});

				project.projectImages = _.filter( project.projectImages, function( elem ){

					if( elem.uid != imageUID )
						return true;
					else
						return false;

				});

				var usedTimes = imageToRemove.projectUsed[ projectID ];

				if( usedTimes != 0 ){

					var arr = [imageToRemove._id];

					EditorBitmap.find( { ProjectImage : { $in : arr } } ).exec( function( err, bitmaps){

						UserPage.find( { UsedImages : { $in: bitmaps } } ).deepPopulate('UsedImages').exec( function( err, pages ){

							if( err || pages == null ){

								console.fs( err );

							}else {

								var viewsIDs = [];
								var pagesToIterate = pages.length;
								var iteratedPages = 0;

								function checkRemoveFromPages(){

									if( pagesToIterate == iteratedPages ){

										project.save( function( err, proj ){

											if( err ){

												console.fs( err );

											}else {

												if( !dontRegenerate ){

													socket.emit('UserProject.removePhoto',  { 'imageUID' : imageUID, 'views' : viewsIDs } );

												}

												def.resolve( { 'imageUID' : imageUID, 'views' : viewsIDs } );

											}

										});


									}

								}

								for( var i=0 ; i < pages.length; i++ ){

									var usedImages = pages[i].UsedImages;

									usedImages = _.filter( usedImages, function( elem ){

										if( elem.ProjectImage.toString() == imageToRemove._id.toString() )
											return false;
										else
											return true;

									});

									pages[i].UsedImages = usedImages;
									pages[i].save( function( err, savedPage ){

										if( err ){

											console.fs( err );

										}else {

											UserView.findOne({ Pages : { $in : [ savedPage._id ] } }, function( err, view ){

												iteratedPages++;
												viewsIDs.push( view._id );
												checkRemoveFromPages();

											});

										}

									});

								}

							}

						});

					});


				}else {

					var projectImages = project.projectImages;

					projectImages = _.filter( projectImages, function( elem ){

						if( elem.uid != imageUID )
							return true;
						else
							return false;

					});

					console.fs( projectImages );

					project.projectImages = projectImages;

					project.save( function( err, savedProject ){

						if( err ){

							console.fs( err );

						}else {

							console.fs( savedProject.projectImages );

							if( !dontRegenerate ){

								socket.emit('UserProject.removePhoto', { 'imageUID' : imageUID, 'views' : [] } );

							}

							def.resolve( { 'imageUID' : imageUID, 'views' : [] }  );

						}

					});


				}

			}

		});

		return def.promise;

};


UserProjectController.prototype.setName = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName+'.setName', function( data ){
			
			ComplexUserProject.findOne({ _id : data.userProjectID }).exec( function( err, userProject ){
				if( err ){
					console.log( err );
				}else {
					userProject.projectName = data.projectName;
					userProject.save( function( err, saved ){
						if( err ){
							console.log( err );
						}else {
							socket.emit( socketName+'.setName', saved );
						}

					});
				}
			});
	});

};


UserProjectController.prototype.autoFill = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName+'.autoFill', function( data ){


		UserProjectController._resetAllImagesUseNumber( data.userProjectID ).then(

			//ok
			function(){

				ComplexUserProject.findOne({ _id : data.userProjectID }).deepPopulate('projectImages').exec( function( err, userProject ){

					if( err ){

						console.fs( err );

					}else {

						var resetedImages = 0;
						var allImagesPositions = 0;
						var userImages = _.sortBy( userProject.projectImages, 'imageOrder' );
						var addedImages = 0;
						var updatedImages = 0;
						var allPosibleInsertions = 0;
						
						var getProjectPages = UserProjectController.getProjectPages( data.userProjectID );

						getProjectPages.then( function( pages ){

							var currentPage = 0;

							function checkDone(){

								if( currentPage == pages.length || userImages.length == addedImages ){

									if( userImages.length == allImagesPositions || userImages.length == addedImages || allImagesPositions == addedImages ){

										socket.emit( socketName+'.autoFill' );

										setTimeout( function(){

											UserProjectController._getProjectImagesUseNumber( userProject._id ).then(

												// ok
												function( info ){
													
													socket.emit( 'UserProject.getProjectImagesUseNumber', info );
													
												}
	
											);

										}, 2000 );

										


									}

								}else {

									refillPage( currentPage );

								}


							}

							for( var i=0; i<pages.length; i++ ){

								var imagesForPage = [];

								allImagesPositions += pages[i].ProposedTemplate.ProposedImages.length;

							}


							function refillPage( ){

								var imagesForPage = [];

								var page = pages[ currentPage ];

								for( var pT=0; pT < page.ProposedTemplate.ProposedImages.length; pT++ ){

									if( addedImages < userImages.length ){

										addedImages++;

										imagesForPage.push( userImages[ addedImages-1 ] );

									}

								}
								if( imagesForPage.length > 0){

									UserPageController.fillWithImages( page, imagesForPage, userProject._id ).then( function( userPage ){

										updatedImages += imagesForPage.length;
										currentPage++;
										checkDone();

									});

								}

							}

							refillPage();

						});

					}

				});

			}

		);


	});

}

UserProjectController.prototype.setMainComplexTheme = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.setMainComplexTheme', function( data ){

		console.log('WPADLO');
		var userProjectID = data.userProjectID;
		var themeID = data.themeID;
		var evtID = data.evtID;

		ComplexUserProject.findOne( { _id: data.userProjectID } ).exec( ( err, project ) => {

			if( err ){
				console.log( err );
			}else {

				var pages = [];
				var iterr =0;
				var projectsDone=0;

				for( var i=0; i < project.projects.length; i++ ){

					let projectID =  project.projects[ i ];

					UserProjectController.getProjectPages( project.projects[ i ] ).then(
						
						( pages  ) => {
							console.log( pages );
							console.log( 'MAM STRONY:)' );
							Theme.findOne({ _id : themeID}).deepPopulate('ThemePages').exec( function( err, theme ){
								
								if( err ){
				
									console.fs( err );
				
								}else {
				
									var pagesToUpdate = pages.length;
									var updatedPages = 0;
				
				
										// strony wakatowe
									var vacancyPages = _.filter( theme.ThemePages, function( elem ){
				
										if( elem.vacancy ){
				
											return true;
				
										}else {
				
											return false;
				
										}
				
									});
				
										// strony całościowe
									var notVacancyPages = _.filter( theme.ThemePages, function( elem ){
				
										if( elem.vacancy ){
				
											return false;
				
										}else {
				
											return true;
				
										}
				
									} );
				
				
									function checkDone(){
				
										//console.fs( 'Co tam siedzi w tym monencie:' );
										//console.fs( pagesToUpdate );
										//console.fs( updatedPages );
										console.log('SPRAWDZAM SKONCZENIE budowania stron');
										if( pagesToUpdate == updatedPages ){
											console.log( 'Budowa dla projektu skonczona' );
											UserProject.findOne({ _id: projectID}, function( err, userProject ){
				
												if( err ){
				
													console.fs( err );
				
												}else {
				
													userProject.mainTheme = themeID;
													userProject.save( function( err, savedProject ){
				
														if( err ){
				
															console.fs( err );
				
														}
														else {
															
															projectsDone++;
															checkAllProjects();
															//socket.emit(socketName+'.setMainTheme', {evtID :data.evtID});
				
														}
				
													});
				
												}
				
				
											});
				
										}
				
									}
				
									var currentVacancyPageIndex = 0;
									var currentNotVacancyPageIndex = 0;
				
									function getNextVacancyPage(){
				
										if( vacancyPages.length == 0 ){
				
											console.fs( 'brak strony z wakatem w tym motywie ! Nie powinien być udostępniony dla użytkownika' );
				
											return false;
				
										}
				
										if( currentVacancyPageIndex >= vacancyPages.length ){
				
											currentVacancyPageIndex = 0;
				
										}
				
										currentVacancyPageIndex++;
				
										return vacancyPages[ currentVacancyPageIndex-1 ];
				
									}
				
									function getNextNoVacancyPage(){
				
										if( notVacancyPages.length == 0 ){
				
											console.fs('brak stron bezwakatowych w motywie!');
				
											return false;
				
										}
				
										if( currentNotVacancyPageIndex >= notVacancyPages.length ){
				
											currentNotVacancyPageIndex = 0;
				
										}
				
										currentNotVacancyPageIndex++;
				
										return notVacancyPages[ currentNotVacancyPageIndex-1 ];
				
									}
				
				
									for( var i=0; i < pages.length; i++ ){
				
										if( pages[i].vacancy ){
				
											var useThemePage = UserPageController._useThemePage( pages[i]._id, getNextVacancyPage()._id );
											useThemePage.then( function( page ){
				
												updatedPages++;
												checkDone();
				
											});
				
										}else {
				
											var useThemePage = UserPageController._useThemePage( pages[i]._id, getNextNoVacancyPage()._id );
											useThemePage.then( function( page ){
				
												updatedPages++;
												checkDone();
				
											});
				
										}
				
									/*
										//var useThemePage = UserPageController._useThemePage( pages[i]._id, theme.ThemePages[i%theme.ThemePages.length]._id );
										useThemePage.then( function( page ){
				
											updatedPages++;
											checkDone();
				
										});
				*/
									}
				
								}
				
							});
	
						}
	
					);

				}
				
				function checkAllProjects(){

					if( projectsDone == project.projects.length ){

						socket.emit(socketName+'.setMainComplexTheme', {evtID :data.evtID});

					}

				}

			}

		});

	});

}

UserProjectController.prototype.setMainTheme = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.setMainTheme', function( data ){

		var getProjectPages = UserProjectController.getProjectPages( data.userProjectID );
		var userProjectID = data.userProjectID;
		var themeID = data.themeID;
		var evtID = data.evtID;

		getProjectPages.then( function( pages ){

			Theme.findOne({ _id : data.themeID}).deepPopulate('ThemePages').exec( function( err, theme ){

				if( err ){

					console.fs( err );

				}else {

					var pagesToUpdate = pages.length;
					var updatedPages = 0;


 					// strony wakatowe
					var vacancyPages = _.filter( theme.ThemePages, function( elem ){

						if( elem.vacancy ){

							return true;

						}else {

							return false;

						}

					} );

 					// strony całościowe
					var notVacancyPages = _.filter( theme.ThemePages, function( elem ){

						if( elem.vacancy ){

							return false;

						}else {

							return true;

						}

					} );


					function checkDone(){

						if( pagesToUpdate == updatedPages ){

							ComplexUserProject.findOne({ _id: userProjectID}).deepPopulate('projects').exec( function( err, userProject ){

								if( err ){

									console.fs( err );

								}else {

									userProject.mainTheme = themeID;
									userProject.save( function( err, savedProject ){

										if( err ){

											console.fs( err );


										}
										else {

											for( var i=0; i< userProject.projects.length;i++){

												userProject.projects[i].mainTheme = themeID;
												userProject.projects[i].save();

											}

											socket.emit(socketName+'.setMainTheme', {evtID :data.evtID});

										}

									});

								}


							});

						}

					}

					var currentVacancyPageIndex = 0;
					var currentNotVacancyPageIndex = 0;

					function getNextVacancyPage(){

						if( vacancyPages.length == 0 ){

							console.fs( 'brak strony z wakatem w tym motywie ! Nie powinien być udostępniony dla użytkownika' );

							return false;

						}

						if( currentVacancyPageIndex >= vacancyPages.length ){

							currentVacancyPageIndex = 0;

						}

						currentVacancyPageIndex++;

						return vacancyPages[ currentVacancyPageIndex-1 ];

					}

					function getNextNoVacancyPage(){

						if( notVacancyPages.length == 0 ){

							console.fs('brak stron bezwakatowych w motywie!');

							return false;

						}

						if( currentNotVacancyPageIndex >= notVacancyPages.length ){

							currentNotVacancyPageIndex = 0;

						}

						currentNotVacancyPageIndex++;

						return notVacancyPages[ currentNotVacancyPageIndex-1 ];

					}


					for( var i=0; i < pages.length; i++ ){

						if( pages[i].vacancy ){

							var useThemePage = UserPageController._useThemePage( pages[i]._id, getNextVacancyPage()._id );
							useThemePage.then( function( page ){

								updatedPages++;
								checkDone();

							});

						}else {

							var useThemePage = UserPageController._useThemePage( pages[i]._id, getNextNoVacancyPage()._id );
							useThemePage.then( function( page ){

								updatedPages++;
								checkDone();

							});

						}

					/*
						//var useThemePage = UserPageController._useThemePage( pages[i]._id, theme.ThemePages[i%theme.ThemePages.length]._id );
						useThemePage.then( function( page ){

							updatedPages++;
							checkDone();

						});
*/
					}

				}

			});
			//console.fs( pages );

		});


	});


};



UserProjectController.prototype.add = function() {

	var socketName = this.socketName;
	var socket = this.socket;

	function getAdminProject( typeID ) {
		//var _this = this;
		var def = Q.defer();
		//
		//var existProductType = new ProductType({ typeID: typeID });
		console.fs(typeID);
		ProductType.findOne( {typeID: typeID} ).deepPopulate('AdminProjects AdminProjects.Formats').exec( function( err, pt){
			console.fs(pt);
			if( err ){
				//io.sockets.emit( 'ProductType.AdminProject.error', 'Nie ma typu!' );
				def.reject(err);
				console.fs(err);
			}

			if( pt === null ){
				console.fs('NIe ma AdminProject ');
				def.reject({'error': 'empty'});
			} else {
				if( pt.AdminProjects === undefined ){
					def.resolve({});
				} else {
					if( pt.AdminProjects.length > 0 ){
						for(var i=0;i<pt.AdminProjects.length;i++){
							if(pt.AdminProjects[i].active === true){
								def.resolve(pt.AdminProjects[i]);
							}
						}
					} else {
						def.resolve({});
					}
				}
			}

		});
		return def.promise;
	};

	function getFormat( formatID ){
		var def = Q.defer();

		Format.findOne( {_id: formatID} ).deepPopulate('Views Views.Pages').exec( function( err, _format){
			if(err){
				console.fs(err);
				def.reject(err);
			} else {
				def.resolve(_format);
			}
		});

		return def.promise;
	};

	socket.on(socketName+'.add', function(data) {
		console.fs('=mm=m=m=m=m=m=mm==m==m UserProject: ');
		//console.fs(data);
		var adminProject = getAdminProject( data.typeID );
		adminProject.then( function( _adminProject){
			console.fs(_adminProject);
			var selectedFormat = {};
			if( _adminProject.Formats.length > 0 ){
				for(var i=0;i<_adminProject.Formats.length;i++){
					if( _adminProject.Formats[i].formatID === data.formatID ){
						selectedFormat = _adminProject.Formats[i];
					}
				}
			}
			_adminProject = _adminProject.toJSON();
			delete _adminProject.Formats;
			_adminProject.Format = selectedFormat;
			var newUserProject = new UserProject();
			newUserProject.formatID = data.formatID;
			newUserProject.typeID = data.typeID;
			var formatData = getFormat( selectedFormat._id );
			var pageList = [];
			formatData.then( function( _format ) {
				_format.toJSON();
				if( _format.Views.length > 0 ){
					var actViews = _format.Views;
					for(var i=0;i<actViews.length;i++){
						for(var j=0;j<actViews[i].Pages.length;j++){
							var newPageItem = actViews[i].Pages[j].toObject();
							newPageItem.viewID = actViews[i]._id;
							pageList.push(newPageItem);
						}
					}
				}
				socket.emit(socketName+'.add', pageList);
			}).fail(function (error) {
				console.fs(error);
			});
			//socket.emit(socketName+'.add', _adminProject);
		}).fail(function (error) {
    		console.fs(error);
		});
		//socket.emit(socketName+'.add', _adminProject);
	});

};



UserProjectController.prototype.sortProjectImages = function(){

	var socket = this.socket;
	var socketName = this.socketName;

	socket.on(socketName+'.sortProjectImages', function( data ) {

		var orderList = data.sortList

		console.fs( orderList );

		ProjectImage.find({

		    uid: { $in: data.sortList }

		  }).exec( function( err, projectImages ){

		  	if( err ){

		  		console.fs( err );

		  	}else {

		  		var changedImages = 0;
		  		var imagesToChange = projectImages.length;

		  		console.fs( changedImages );
		  		console.fs( imagesToChange );

		  		function checkDone(){

		  			if( changedImages == imagesToChange ){

		  				var sortInfo = {};

		  				var sortedProjectImages = _.sortBy( projectImages, 'imageOrder' );

		  				for( var i=0; i < sortedProjectImages.length; i++){

		  					sortInfo[ sortedProjectImages[i].uid ] = sortedProjectImages[i].imageOrder;

		  				}

		  				console.fs( sortInfo );


		  				socket.emit('UserProject.sortProjectImages', sortInfo );

		  			}

		  		}

		  		for( var i=0; i < imagesToChange;i++ ){

		  			console.log( _.indexOf( orderList, projectImages[i].uid ) );
		  			projectImages[i].imageOrder = _.indexOf( orderList, projectImages[i].uid ) +1;

		  			projectImages[i].save( function( err, projectImage ){

		  				if( err ){

		  					console.fs( err );

		  				}else {

		  					changedImages++;
		  					checkDone();

		  				}

		  			});

		  		}


		  	}

		  });

	});

};

UserProjectController.prototype.setSettingsForAllProposedImages = function(){

	var socket = this.socket;
	var socketName = this.socketName;

	socket.on(socketName+'.setSettingsForAllProposedImages', function(data) {
		UserProject.findOne({ _id : data. userProjectID }).deepPopulate('Views Views.Pages Views.Pages.ProposedTemplate Views.Pages.ProposedTemplate.ProposedImages').exec( function( err, project ){

			if( err ) { console.fs( err ); return false; }

			var proposedImages = [];
			var updated = 0;

			for( var i=0; i < project.Views.length; i++){

				for( var p=0; p < project.Views[i].Pages.length; p++ ){

					for( var ima=0; ima < project.Views[i].Pages[p].ProposedTemplate.ProposedImages.length; ima++ ){

						proposedImages.push( project.Views[i].Pages[p].ProposedTemplate.ProposedImages[ima] );

					}

				}

			}

			for( var i=0; i < proposedImages.length; i++ ){

				for( var key in data.settings ){

					proposedImages[i][key] = data.settings[ key ];

				}

				proposedImages[i].save( function( err, saved ){

					if( err ){ console.fs( err ); return false; }

					updated++;
					checkDone();

				});

			}

			checkDone();

			function checkDone(){

				if( updated == proposedImages.length ){

					socket.emit( "UserProject.setSettingsForAllProposedImages", data );

				}

			}

		});

	});

};

UserProjectController.prototype.setSettingsForAllProposedTexts = function(){

    var socket = this.socket;
    var socketName = this.socketName;

    socket.on(socketName+'.setSettingsForAllProposedTexts', function(data) {
        UserProject.findOne({ _id : data. userProjectID }).deepPopulate('Views Views.Pages Views.Pages.ProposedTemplate Views.Pages.ProposedTemplate.ProposedTexts').exec( function( err, project ){

            if( err ) { console.fs( err ); return false; }

            const proposedTexts = [];
            project.Views.forEach((view)=>{
            	view.Pages.forEach((page)=>{
            		page.ProposedTemplate.ProposedTexts.forEach((text)=>{proposedTexts.push(text)})
				})
			})

            let updated = 0;

            for( var i=0; i < proposedTexts.length; i++ ){

                for( var key in data.settings ){

                    proposedTexts[i][key] = data.settings[ key ];

                }

                proposedTexts[i].save( function( err, saved ){

                    if( err ){ console.fs( err ); return false; }

                    updated++;
                    checkDone();

                });

            }

            checkDone();

            function checkDone(){

                if( updated == proposedTexts.length ){

                    socket.emit( "UserProject.setSettingsForAllProposedTexts", data );

                }

            }

        });

    });

};

UserProjectController.prototype.setSettingsForAllBitmaps = function(){

	var socket = this.socket;
	var socketName = this.socketName;

	socket.on(socketName+'.setSettingsForAllBitmaps', function(data) {

		console.log( data );
		var settings = data.settings;
		console.log('zmiana wsszystkich bitmap');
		UserProject.findOne({ _id : data. userProjectID }).deepPopulate('Views Views.Pages Views.Pages.UsedImages').exec( function( err, project ){

			if( err ){

				console.fs( err );

			}else {

				var usedImages = [];

				for( var i=0; i < project.Views.length; i++){

					for( var p=0; p < project.Views[i].Pages.length; p++ ){

						for( var ima=0; ima < project.Views[i].Pages[p].UsedImages.length; ima++ ){

							usedImages.push( project.Views[i].Pages[p].UsedImages[ima] );

						}

					}

				}

				var updatedImages = 0;

				function checkDone(){

					if( updatedImages == usedImages.length ){

					

					}

				}

				for( var i=0; i <usedImages.length; i++ ){

					image = usedImages[i];

					for( var key in settings ){

						image[key] = settings[key];

					}

					image.save( function( err, savedBitmap ){

						if( err ){

							console.fs( err );

						}else {

							updatedImages++;
							checkDone();

						}

					});

				}

				checkDone();

			}

		});

	});

};


UserProjectController.prototype.removeAllImages = function(){

	var socket = this.socket;
	var socketName = this.socketName;

	socket.on(socketName+'.removeAllImages', function(data) {

		ComplexUserProject.findOne( { _id : data.projectID }).deepPopulate('projectImages').exec( function( err, userProject ){

			if( err ){

				console.fs( err );

			}else {

				var removed = 0;

				function check(){

					if( removed == userProject.projectImages.length ){

						socket.emit( "UserProject.removeAllImages", { 'response' : 'ok' } );

					}else {

						removePhoto( removed );

					}

				}


				function removePhoto( i ){


					UserProjectController._removeProjectImage( socket, data.projectID, userProject.projectImages[i].uid ).then(

						// ok
						function(){

							removed++;
							check();

						}


					);

				}

				check();


			}


		});

	});

};


UserProjectController.prototype.addPhoto = function() {
	var socket = this.socket;
	var socketName = this.socketName;

	socket.on(socketName+'.addPhoto', function(data) {

		console.fs( data );
		console.fs(socketName+'.addPhoto <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<' );

		var userProjectID = data.userProjectID;

		data.projectUsed = {}

		data.projectUsed[userProjectID] = 0;

		console.log( data );
		delete data.projectID;
		//console.log(data);
		var newProjectImage = new ProjectImage(data);

		newProjectImage.save( function(err, saveProjectImage) {

			if( err ){

				console.fs( err );

			} else {
					//var existUserProject = new UserProject({ '_id': userProjectID });
				ComplexUserProject.findOne({ '_id': userProjectID },  function(err, ap) {
					if( err || ap === null ){
						socket.emit( socketName+'.error', 'Nie ma projektu!' );
					}

					ap.projectImages.push(saveProjectImage);
					ap.save(function(err, saved) {
						
						socket.emit( socketName+'.addPhoto', saved );
					});
				});
				//io.sockets.emit( this.socketName+'.addedProjectImage', newProjectImage );

			}



		});

	});

};

module.exports = UserProjectController;
