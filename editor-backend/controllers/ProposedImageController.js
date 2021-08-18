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
var ProjectImageController = require('../controllers/ProjectImageController.js');

function ProposedImageController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "ProposedImageController";
    this.socketName = "ProposedImage";
}

// główny kontroler podpinamy
util.inherits(ProposedImageController, Controller);


ProposedImageController.loadPhotoSetCenterAndMaximize = function( projectImageID, proposedImageID ){



};


ProposedImageController._useDataFrom = function( proposedImageIDFrom, proposedImageIDTo ){

	var def = Q.defer();

	ProposedImage.find( { _id: { $in : [ proposedImageIDFrom, proposedImageIDTo ] }} ).deepPopulate('objectInside objectInside.ProjectImage').exec( function( err, proposedImages ){

		if( err ){

			console.fs( err );

		}else {

			var objectFrom = null;
			var objectTo = null;

			for( var i=0; i < proposedImages.length; i ++){

				if( proposedImages[i]._id.toString() == proposedImageIDFrom )
					objectFrom = proposedImages[i];

				if( proposedImages[i]._id.toString() == proposedImageIDTo )
					objectTo = proposedImages[i];

			}

			var clonedBitmap = false;

			if( objectFrom.objectInside ){

				if( objectFrom.width == objectTo.width && objectFrom.height == objectFrom.height ){
					ProposedImageController._loadImageWithData( objectFrom, objectTo ).then(

						//ok
						function( proposedImage ){

							clonedBitmap = true;
							checkDone();

						}

					);
				}else {

					ProposedImageController._loadImage( objectTo._id, objectFrom.objectInside.ProposedImage ).then(

						//ok
						function( proposedImage ){

							clonedBitmap = true;
							checkDone();

						}

					);

				}
				
			}else {

				clonedBitmap = true;
				checkDone();

			}

		}

		function checkDone(){

			if( clonedBitmap ){

				def.resolve( objectTo._id );

			}

		}

	});

	return def.promise;

};

ProposedImageController._loadImageWithData = function( from, to ){

	var def= new Q.defer();

	ProposedImage.findOne({_id: from._id}).exec(function( err, position ){

		if( err ){
			console.log( err );
		}else {

			ProposedImage.findOne( { _id: to._id} ).exec( function( err, toPosition ){

				if ( err ){
					console.log( err );
				}else {

				
					
                    var scale = toPosition.size.width/from.objectInside.ProjectImage.width;

                    if( toPosition.size.height > from.objectInside.ProjectImage.height*scale ){

                        scale = toPosition.size.height/from.objectInside.ProjectImage.height;
 
                    }
						
					from.objectInside.x = toPosition.size.width/2;
					from.objectInside.y = toPosition.size.height/2;
					from.objectInside.scaleX = scale,
					from.objectInside.scaleY = scale,

					from.objectInside.save( function(){

						toPosition.objectInside = from.objectInside;
						toPosition.save( function(err, ok){
	
							if( err ){
								cosnole.log( err );
							}else {
								def.resolve();
							}
	
						});

					});

					

				}

			});
			
		}

	});

	return def.promise;

}

ProposedImageController._loadImage = function(  proposedImageID, projectImageUID ){

	var def = Q.defer();

	ProposedImage.findOne({ _id: proposedImageID }, function( err, proposedImage ){

		if( err ){

			console.fs( err );

		}else {

			ProjectImage.findOne( { uid: projectImageUID }, function( err, projectImage ){

				if( err ){

					console.fs( err );

				}else {

                    var projectImageID = projectImage._id;
                    var scale = proposedImage.size.width/projectImage.width;

                    if( proposedImage.size.height > projectImage.height*scale ){

                        scale = proposedImage.size.height/projectImage.height;
 
                    }

					var data = {

			            ProjectImage : projectImageID,
			            x   : proposedImage.size.width/2,
			            y   : proposedImage.size.height/2,
			            uid : generatorUID(),
			            scaleX : scale,
			            scaleY : scale,
			            order  : proposedImage.order

			        };

			        var newBitmap = new EditorBitmap( data );

			        newBitmap.save( function( err, savedBitmap ){

			        	if( err ){

			        		console.fs( err );

			        	}else {

			        		proposedImage.objectInside = savedBitmap;

			        		proposedImage.save( function( err, saved ){

			        			if( err ){

			        				console.fs( err );

			        			}else {

			        				console.log('Wrozwiązane');
			        				def.resolve( saved );

			        			}

			        		});

			        	}

			        });

				}

			});

		}

	});

	return def.promise;

};

ProposedImageController.prototype.loadImage = function(){

	var socketName = this.socketName;
	var socket  = this.socket;
	var _this = this;

	socket.on(socketName+'.loadImage', function( data ) {

		var userPage = data.userPageID;
		console.log('Jest info z edytor');
		ProposedImageController._loadImage( data.proposedImagePositionID ,data.projectImageUID ).then(

			// ok
			function( proposedImage ){


				ProjectImageController._addedToProject( data.projectImageUID, data.projectID ).then(

					//ok
					function( projectImage ){

						var imageInfo = {};
						imageInfo[ projectImage.uid ] = projectImage.projectUsed[data.projectID];
						socket.emit( 'UserProject.getProjectImagesUseNumber', imageInfo );

					}

				);

				ProposedImage.findOne( { _id: proposedImage._id } ).deepPopulate('objectInside objectInside.ProjectImage').exec( function( err, proposedPosition ){

					if( err ){

						console.fs( err );

					}else {

						var data = {

							userPageID : userPage,
							proposedImage : proposedPosition

						};

						socket.emit( socketName+ '.loadImage', data );

					}

				});

			}

		);

	});

};


ProposedImageController._replacePhoto = function( proposedPosition1, proposedPosition2 ){

	var def = Q.defer();

	ProposedImage.find({ _id: { $in : [ proposedPosition1, proposedPosition2 ] }}).deepPopulate('objectInside objectInside.ProjectImage').exec( function( err, proposedImages ){

		if( err ){

			console.fs( err );

		}else {

			var proposedP1 = null;
			var proposedP2 = null;

			for( var i=0; i < proposedImages.length; i++ ){

				if( proposedPosition1.toString() == proposedImages[i]._id.toString() )
					proposedP1 = proposedImages[i];

				if( proposedPosition2.toString() == proposedImages[i]._id.toString() )
					proposedP2 = proposedImages[i];

			}

			var prop1Inside = proposedP1.objectInside;
			var prop2Inside = proposedP2.objectInside;

			proposedP1.objectInside = prop2Inside;
			proposedP2.objectInside = prop1Inside;

			var updatedBitmaps =0;

			var scale1=1, scale2=1;

			if( prop2Inside ){

				if( prop2Inside.rotation%180 == 90 ){

		            var scale1 = proposedP1.size.height/prop2Inside.ProjectImage.width;

		            if( proposedP1.size.width > prop2Inside.ProjectImage.height*scale1 ){

		                scale1 = proposedP1.size.width/prop2Inside.ProjectImage.height;

		            }

		        }else {

		        	var scale1 = proposedP1.size.width/prop2Inside.ProjectImage.width;

		            if( proposedP1.size.height > prop2Inside.ProjectImage.height*scale1 ){

		                scale1 = proposedP1.size.height/prop2Inside.ProjectImage.height;

		            }

		        }
				
	            prop2Inside.scaleX = scale1;
	            prop2Inside.scaleY = scale1;
	            prop2Inside.x = proposedP1.size.width/2,
	            prop2Inside.y = proposedP1.size.height/2,

	            prop2Inside.save( function( err, saved ){

	            	if( err ){

	            		console.fs( err );

	            	}else {

	            		updatedBitmaps++;
	            		checkDone();

	            	}

	            });

			}else {

				updatedBitmaps++;
				checkDone();

			}

			if( prop1Inside ){

				if( prop1Inside.rotation%180 == 90 ){

					var scale2 = proposedP2.size.height/prop1Inside.ProjectImage.width;
		            if( proposedP2.size.width > prop1Inside.ProjectImage.height*scale2 ){

		                scale2 = proposedP2.size.width/prop1Inside.ProjectImage.height;

		            }

		            prop1Inside.scaleX = scale2;
		            prop1Inside.scaleY = scale2;
		            prop1Inside.x = proposedP2.size.width/2;
		            prop1Inside.y = proposedP2.size.height/2;
					
				}else {

		            var scale2 = proposedP2.size.width/prop1Inside.ProjectImage.width;

		            if( proposedP2.size.height > prop1Inside.ProjectImage.height*scale2 ){

		                scale2 = proposedP2.size.height/prop1Inside.ProjectImage.height;

		            }

		            prop1Inside.scaleX = scale2;
		            prop1Inside.scaleY = scale2;
		            prop1Inside.x = proposedP2.size.width/2;
		            prop1Inside.y = proposedP2.size.height/2;

	        	}

	        	console.log( prop1Inside.scaleX );

	            prop1Inside.save( function( err, saved ){

	            	if( err ){

	            		console.fs( err );

	            	}else {

	            		updatedBitmaps++;
	            		checkDone();

	            	}

	            });
				
			}else {

				updatedBitmaps++;
				checkDone();

			}

			var proposedUpdated = 0;

			proposedP1.save( function( err, saved ){

            	if( err ){

            		console.fs( err );

            	}else {

            		proposedUpdated++; 
            		checkDone();
            	}

            } );

			proposedP2.save( function( err, saved ){

            	if( err ){

            		console.fs( err );

            	}else {

            		proposedUpdated++;
            		checkDone();

            	}

            } );

			function checkDone(){

				if(  updatedBitmaps == 2 && proposedUpdated == 2 ){

					proposedP1 = proposedP1.toJSON();
					proposedP1.objectInside = prop2Inside;

					proposedP2 = proposedP2.toJSON();
					proposedP2.objectInside = prop1Inside;

					var data = {

						p1 : proposedP1, 
						p2 : proposedP2

					};

					def.resolve( data );

				}

			};

		}

	});

	return def.promise;

};

ProposedImageController.prototype.removeObjectInside = function(){

	var socketName = this.socketName;
	var socket  = this.socket;
	var _this = this;

	socket.on(socketName+'.removeObjectInside', function( data ) {

		ProposedImage.findOne( { _id : data.proposedPositionID }).deepPopulate('objectInside objectInside.ProjectImage').exec( function( err, position ){

			if( err ){

				console.fs( err );

			}else {

				ProjectImageController._removedFromProject( position.objectInside.ProjectImage.uid, data.projectID ).then( 

					//ok
					function( projectImage ){

						var imageInfo = {};
						imageInfo[ projectImage.uid ] = projectImage.projectUsed[data.projectID];
						socket.emit( 'UserProject.getProjectImagesUseNumber', imageInfo );

					}

				);

				position.objectInside = null;


				position.save( function( err, saved ){

					if( err ){

						console.fs( err );

					}else {

						socket.emit( socketName + '.removeObjectInside', data );
					}

				});

			}

		});

	});

};

ProposedImageController.prototype.replacePhoto = function(){

	var socketName = this.socketName;
	var socket  = this.socket;
	var _this = this;

	socket.on(socketName+'.replacePhoto', function( data ) {

		var userPageID = data.page;

		ProposedImageController._replacePhoto( data.from, data.to ).then( 

			// ok
			function( data ){

				data.userPageID = userPageID;

				socket.emit( socketName + '.replacePhoto', data );

			}

		);

	});

};

ProposedImageController._changeImage = function(  proposedImageID, projectImageUID, projectID, socket ){

	var def = Q.defer();
	
	ProposedImage.findOne({ _id: proposedImageID }).deepPopulate('objectInside objectInside.ProjectImage').exec( function( err, proposedImage ){

		if( err ){

			console.fs( err );

		}else {

			var imageBefore = null;

			if( proposedImage.objectInside ){

				imageBefore = proposedImage.objectInside.ProjectImage;
				proposedImage.objectInside.remove();

			}

			ProjectImage.findOne( { uid: projectImageUID }, function( err, projectImage ){

				if( err ){

					console.fs( err );

				}else {

                    var projectImageID = projectImage._id;
                    var scale = proposedImage.size.width/projectImage.width;

                    if( proposedImage.size.height > projectImage.height*scale ){

                        scale = proposedImage.size.height/projectImage.height;
 
                    }

					var data = {

			            ProjectImage : projectImageID,
			            x   : proposedImage.size.width/2,
			            y   : proposedImage.size.height/2,
			            uid : generatorUID(),
			            scaleX : scale,
			            scaleY : scale,
			            order  : proposedImage.order

			        };

			        var newBitmap = new EditorBitmap( data );

			        newBitmap.save( function( err, savedBitmap ){

			        	if( err ){

			        		console.fs( err );

			        	}else {

			        		proposedImage.objectInside = savedBitmap;

			        		proposedImage.save( function( err, saved ){

			        			if( err ){

			        				console.fs( err );

			        			}else {

									var data = {

										oldObj : imageBefore,
										newObj : projectImageUID

									};

			        				def.resolve( data );

			        			}

			        		});

			        	}

			        });

				}

			});

		}

	});

	return def.promise;

};

ProposedImageController.prototype.rotateImageInside = function(){

	var socketName = this.socketName;
	var socket  = this.socket;
	var _this = this;

	socket.on(socketName+'.rotateImageInside', function( data ) {

		ProposedImage.findOne( { _id : data.proposedPositionID }).deepPopulate('objectInside objectInside.ProjectImage').exec( function( err, proposedImage ){

		    if( err ){

		        console.fs( err );

		    }else {

		    	var bitmap = proposedImage.objectInside;

		        bitmap.rotation += 90;
		        bitmap.rotation = bitmap.rotation%360;
		        
		        var scale = 1;
		        bitmap.x = proposedImage.size.width/2;
		        bitmap.y = proposedImage.size.height/2;

		        if( bitmap.rotation%180 == 90 ){

		            scale = proposedImage.size.width/bitmap.ProjectImage.height;

		            if( proposedImage.size.height > bitmap.ProjectImage.width * scale ){

		                scale = proposedImage.size.height/bitmap.ProjectImage.width;

		            }

		        }else {

		            scale = proposedImage.size.width/bitmap.ProjectImage.width;

		            if( proposedImage.size.height > bitmap.ProjectImage.height*scale ){

		                scale = proposedImage.size.height/bitmap.ProjectImage.height;

		            }
		            
		        }

		        bitmap.scaleX = scale;
		        bitmap.scaleY = scale;

		        bitmap.save( function( err, bitmap ){

		            if( err ){

		                console.fs( err );

		            }else {

		                data.imageInfo = bitmap;

		                socket.emit( 'ProposedImage.rotateImageInside', data );

		            }

		        });
		        

		    }

		});

	});

};

ProposedImageController.prototype.setAttributes = function(){

	var socketName = this.socketName;
	var socket  = this.socket;
	var _this = this;

	socket.on(socketName+'.setAttributes', function( data ) {

		ProposedImage.findOne( { _id : data.proposedImageID }).deepPopulate('objectInside objectInside.ProjectImage').exec( function( err, proposedImage ){

			if( err ){ console.fs( err ); return false; }

			console.fs( data );
			console.fs('MAM DATE :)');

			for( var key in data.attributes ){

				proposedImage[key] = data.attributes[key];

			}

			proposedImage.save( function( err, saved ){

				if( err ){ console.fs( err ); return false }
				
				socket.emit( 'ProposedImage.setAttributes', data );

			});

		});

	});

};

ProposedImageController.prototype.changeImage = function(){

	var socketName = this.socketName;
	var socket  = this.socket;
	var _this = this;

	socket.on(socketName+'.changeImage', function( data ) {

		var userPage = data.userPageID;
		var projectImageUID = data.projectImageUID;
		var projectID = data.projectID;
		var proposedImagePositionID = data.proposedImagePositionID;

		ProposedImageController._changeImage( data.proposedImagePositionID ,data.projectImageUID, projectID ).then(

			// ok
			function( info ){

				if( info.oldObj && projectImageUID != info.oldObj.uid ){

					if( info.oldObj ){

						ProjectImageController._removedFromProject( info.oldObj.uid, projectID ).then( 

							//ok
							function( projectImage ){

								var imageInfo = {};
								imageInfo[ info.oldObj.uid ] = projectImage.projectUsed[ projectID ];
								
								if( socket ){

									socket.emit( 'UserProject.getProjectImagesUseNumber', imageInfo );
									
								}

							}
						);

					}

					
					ProjectImageController._addedToProject( projectImageUID, projectID ).then(

						//ok
						function( projectImage ){

							var imageInfo = {};
							imageInfo[ projectImage.uid ] = projectImage.projectUsed[ projectID ];
							socket.emit( 'UserProject.getProjectImagesUseNumber', imageInfo );

						}

					);

				}

				var proposedImage = info.newObj;

				ProposedImage.findOne( { _id: proposedImagePositionID } ).deepPopulate('objectInside objectInside.ProjectImage').exec( function( err, proposedPosition ){

					if( err ){

						console.fs( err );

					}else {

						var data = {

							userPageID : userPage,
							proposedImage : proposedPosition

						};

						socket.emit( socketName+ '.changeImage', data );

					}

				});

			}

		);

	});

};


ProposedImageController.prototype.loadPhoto = function() {

	var socketName = this.socketName;
	var socket  = this.socket;
	var _this = this;

	socket.on(socketName+'.loadPhoto', function( data ) {

		var newEditorBitmap = new EditorBitmap( data.editorBitmap );
		newEditorBitmap.uid = generatorUID();

		newEditorBitmap.save( function( err, savedBitmap ){

			if( err ){

				console.fs( err );

			}else {

				ProposedImage.findOne({ _id: data.proposedPositionID }, function( err, pImage ){

					pImage.bitmap = savedBitmap;

					pImage.save( function( err, savedPosition ){

						if( err ){

							console.fs( err );

						}else {

							UserPage.findOne({ _id : data.userPageID }, function( err, userPage ){

								if( err ){

									console.fs( err );

								}else {

									userPage.UsedImages.push( data.editorBitmap.ProjectImage );

									userPage.save( function( err, updatedUserPage ){

										if( err ){

											console.fs( err );

										}else {


											socket.emit( socketName+'.loadPhoto', savedPosition );

										}

									});

								}

							});

						}

					});

				});

			}


		});


	});

};

module.exports = ProposedImageController;