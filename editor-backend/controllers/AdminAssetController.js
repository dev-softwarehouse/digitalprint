var util = require('util');
console.fs = require('../libs/fsconsole.js');

var ProjectImage = require('../models/ProjectImage.js').model;
var AdminAsset = require('../models/AdminAssets.js').model;
var AssetFolder = require('../models/AdminAssetFolder.js').model;
var util = require('util');
console.fs = require('../libs/fsconsole.js');


var Controller = require("../controllers/Controller.js");
var AdminProject = require('../models/AdminProject.js').model;
var MainTheme = require('../models/MainTheme.js').model;
var View = require('../models/View.js').model;
var Theme = require('../models/Theme.js').model;


class AdminAssetController {

	constructor( controller ){
		this.socket = controller.socket;
		this.io = controller.io;
		this.name = "AdminAssetController";
		this.socketName = "AdminAsset";
	}

	init(){
		//this.addImagesAssetListeners();
		this.addAssetFolder();
		this.getFolders();
		this.uploadAdminAsset();
		this.removeAsset();
		this.removeFolder();
	}

	removeAsset(){

		var _this = this;
		
		this.socket.on( this.socketName+'.removeAsset', function( data ){

			AdminAsset.findOne( { _id: data.id } ).remove().exec( function( err, asset ){

				if( err ){
					console.log( err );
				}else {

					console.log('USUNIETO :DDDD');
					var evtID = data.evtID;
					_this.socket.emit( _this.socketName + '.removeAsset', { evtID } );

				}

			});

			

		});	

	}

	uploadAdminAsset(){
		
		var _this = this;

		this.socket.on( this.socketName+'.uploadImageAsset', function( data ){
			console.log( data );
			console.log('Przyszlo :D');
			var newProjectImage = new ProjectImage( data );
		
			newProjectImage.save( function( err, _newProjectImage ){
	
				if( err ){
	
					console.fs( err );
	
				}
				else {

					console.log( _newProjectImage );
					console.log('ZAPISANO NOWY PROJECT IMAGE');
					var assetData = {};
					assetData.type = 'custom'	;
					assetData.reference = _newProjectImage;

					if( data.parent ){
						assetData.parent = data.parent
					}

					var newAsset = AdminAsset( assetData );
					newAsset.save( function( err, saved ){

						if( err ){
							console.log( 'ERROR');
						}else {
							console.log('ZAPISANY JEST NOWY ASSET :D');
							var evtID = data.evtID;
							_this.socket.emit( _this.socketName + '.uploadImageAsset', { asset:saved, evtID } );
						}

					});

				}
				
			});

		});			

	}

	removeFolder(){

		var _this = this;
		
		this.socket.on(this.socketName + '.removeFolder', ( data ) => {

			AssetFolder.findOne( { _id: data.id  }).remove().exec( function(){

				var evtID = data.evtID;
				_this.socket.emit( _this.socketName + '.removeFolder', { id: data.id, evtID } );

			})

		});

	}

	getFolders(){

		var _this = this;
		
		this.socket.on(this.socketName + '.getFolder', ( data ) => {

			var findQuery = {};

			if( !data.parent ){
				
				AssetFolder.find( {parent : { $exists: false }} ).exec( function( err, assetsFolder ){
					
					if( err  ){
						console.log( err );
						console.log('ERROR');
					}else {

						AdminAsset.find( {parent : { $exists: false }} ).deepPopulate('reference').exec( function( err, assets ){
							if( err ){
								console.log( err );
							}else {
								var evtID = data.evtID;
								_this.socket.emit( _this.socketName + '.getFolder', { assetsFolder, evtID, assets } );
							}
						})
						
					}

				});

			}else {
				findQuery.parent = data.parent;

				AssetFolder.find( {parent : data.parent } ).deepPopulate('assets').exec( function( err, assetsFolder ){
					
					if( err  ){
						console.log( err );
						console.log('ERROR');
					}else {

						AdminAsset.find( {parent :  data.parent } ).deepPopulate('reference').exec( function( err, assets ){
							if( err ){
								console.log( err );
							}else {

								AssetFolder.findOne( { _id: data.parent} ).exec( function( err, folder ){

									console.log( folder );
									console.log( data.parent );
									console.log('SSSSSSSSSSSSSSSSSSSS');
									console.log('POBIERAM DANE NA TEN TEMAT');
									var evtID = data.evtID;
									_this.socket.emit( _this.socketName + '.getFolder', { name: folder.name,parent: folder.parent, _id: folder._id ,folders : assetsFolder, evtID, assets : assets } );

								});

								
							}
						})
						
					}

				});

			}

			


		});	

	}

	addAssetFolder(){

		var _this = this;

		this.socket.on(this.socketName + '.addFolder', ( data ) => {


			var newAssetFolder = new AssetFolder( data );
			newAssetFolder.save( function( err,saved  ){

				if( err  ){
					console.log( err );
				}else {
					console.log('DODANO FOLDER :)');
				}

				_this.socket.emit( _this.socketName + '.addFolder', saved );

			});

		});

	}

	addImageAssetListeners(){

		this.socket.on( this.socketName + '.getClipartAssets', this.getClippartAssets.bind( this ));
		this.socket.on( this.socketName + '.getBackgroundAssets', this.getClippartAssets.bind( this ));
		this.socket.on( this.socketName + '.addImageAsset', this.addImageAsset.bind( this ));

	}

	addFontAsset(){

		this.socket.on( this.socketName + '.getClipartAssets', this.addFontAsset.bind( this ));

	}

	addFontAsset( data ){

		// aby dodać assety do fonta :)

	}

	addImageAsset ( data ){

		ProjectImage.findOne( { uid: data.projectImageUID } ).exec( function( err, projectImage ){

			if( err ){
				console.log( err );
			}else if( projectName ) {

				let newAsset = new AdminAssets({

					type: data.type,
					reference: projectImage

				});

				newAsset.save();
				console.log( newAsset );
				console.log('ZAPISAŁEM :)');

			}else {

				console.log('NIE ZNALEZIONO PROJECT IMAGE, ABY UTWORZYC ASSET!');

			}

		});

	}


}

function AdminProjectController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;
    //AdminProjectController.super_.call(this);
    this.name = "AdminProjectController";
    this.socketName = "AdminProject";
};

util.inherits(AdminProjectController, Controller);


AdminProjectController.prototype.setProjectAvatar = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.setProjectAvatar', function(data){

		console.fs( data.adminProjectID );
		console.fs( data.url );
		console.fs( '==========================================================' );

	});

};


/**
* Dodaje możliwy do wykorzystania kolor ramki, czcionki
*
* @method addColor
*/
AdminProjectController.prototype.addColor = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.addColor', function(data) {

		AdminProject.findOne({ _id : data.adminProjectID }, function( err, adminProject ){

			if( err ){

				console.fs( err );

			}
			else {

				console.fs( 'znalazlem admin projekt!' );

				adminProject.colors.push( data.color );

				adminProject.save(function( err, _adminProject ){

					//io.sockets.emit( socketName + '.addColor', _adminProject.colors );
					io.to('AdminProject:'+_adminProject._id).emit( socketName + '.addColor', _adminProject.colors );

				});

			}

		});


	});

};


/**
* Aktywne kolory dla użytkowników
*
* @method setActiveColor
*/
AdminProjectController.prototype.setActiveColors = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on(socketName+'.setActiveColors', function(data) {

		AdminProject.findOne({ _id : data.adminProjectID }, function( err, adminProject ){

			if( err ){

				console.fs( err );

			}
			else {

				adminProject.activeColors = data.colors;

				adminProject.save( function( err, _adminProject ){

					if( err ){

						console.log( err );

					}
					else {

						//io.sockets.emit( socketName + '.setActiveColors', _adminProject.activeColors );
						io.to('AdminProject:'+_adminProject._id).emit( socketName + '.setActiveColors', _adminProject.activeColors );
					}

				});

			}

		});

	});

}


AdminProjectController.prototype.getFormats = function(){

	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.getFormats', function(data) {

		AdminProject.findOne({ _id : data.adminProjectID }).deepPopulate('Formats').exec( function( err, adminProject){

			if( err ){

				console.fs( err );

			}
			else {

				var data = {

					formats : adminProject.Formats

				};

				//io.sockets.emit('AdminProject.getFormats', data );
				//io.to('AdminProject:'+adminProject._id).emit('AdminProject.getFormats', data );
				socket.emit( socketName+'.getFormats', data);

			}

		});

	});

};

AdminProjectController.prototype.add = function() {
	var socketName = this.socketName;
	this.socket.on(socketName+'.add', function(data) {

		console.fs( data );
		console.fs('================ Tworzenie nowego projektu =======================');

		var newAdminProject = new AdminProject({ name: data.name });
		newAdminProject.save(function(err, saved){
			if( err ){
				console.fs(err);
			} else {
				io.to('AdminProject:'+saved._id).emit(socketName+'AdminProject.added', newAdminProject);
			}
		});

		//io.sockets.emit( socketName+'AdminProject.added', newAdminProject );
		//io.to('AdminProject:'+saved._id).emit(socketName+'AdminProject.added', newAdminProject);
	});
};

AdminProjectController.prototype.remove = function() {
	var socketName = this.socketName;
	this.socket.on(socketName+'.remove', function(data) {

		//var newAdminProject = new AdminProject({ _id: data.ID });

		//newAdminProject.removeImages();

		AdminProject.findOne({_id: data.ID}, function(err, _ap) {
			if(err){
				console.fs(err);
			} else {
				if( _ap !== null ){

					_ap.remove(function(err, removed){
						if(err){
							console.fs(err);
						} else {
							io.to('AdminProject:'+_ap._id).emit( socketName+'.removed', 'Usunieto projekt!' );
						}
					});
				}

			}
		});

	});
};

AdminProjectController.prototype.changeMin = function() {
	var socketName = this.socketName;
	this.socket.on(socketName+'.changeMin', function(data) {
		var ID = data.ID;
		AdminProject.findOne({ _id: ID }, function (err, doc){
		  	doc.projectMin = data.projectMin;
			doc.save();
		});
	});
};

/*
Zwraca listę formatów dla danego AdminProject
 */
AdminProjectController.prototype.load = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.load', function(data) {

		var adminProjectID = data.ID;
		AdminProject.findOne({ _id: adminProjectID }, function (err, ap){
			if( ap === null ){
				socket.emit(socketName+'.load', []);
				return;
			}
		  	if( ap.ProjectImages !== undefined || ap.ProjectImages !== null ){

		  		socket.emit(socketName+'.load', ap );
		  	} else {
		  		socket.emit(socketName+'.load', []);
		  	}
		}).populate('ProjectImages');
	});
};

AdminProjectController.prototype.addProjectImage = function() {
	this.socket.on(this.socketName+'.addProjectImage', function(data) {
		var projectID = data.projectID;
		delete data.projectID;
		//console.log(data);
		var newProjectImage = new ProjectImage(data);
		newProjectImage.save();
		var existAdminProject = new AdminProject({ '_id': projectID });
		existAdminProject.find( function(err, ap) {
			if( err || ap === null ){
				io.to('AdminProject:'+projectID).emit( this.socketName+'.error', 'Nie ma projektu!' );
			}
			ap.ProjectImages.push(newProjectImage);
			ap.save(function(err, saved) {
				io.to('AdminProject:'+projectID).emit( this.socketName+'.addedProjectImage', newProjectImage );
			});
		});
		//io.sockets.emit( this.socketName+'.addedProjectImage', newProjectImage );
	});
};

AdminProjectController.prototype.removeProjectImage = function() {
	this.socket.on(this.socketName+'.removeProjectImage', function(ID) {
		var actProjectImage = new ProjectImage({ _id: ID });

		actProjectImage.find( function(err, pi) {
			if( err || pi === null ){
				io.sockets.emit( this.socketName+'.error', 'Nie ma obrazków projektu!' );
			} else {
				pi.remove(function(err){
					if(err){
						console.fs(err);
					} else {
						var response = { 'ID': ID, 'uid': pi.uid };
						//io.sockets.emit( this.socketName+'.removedProjectImage', response );
						io.to('AdminProject:'+ID).emit( this.socketName+'.removedProjectImage', response );
					}
				});
			}
		});
	});
};

module.exports = AdminAssetController;
