var util = require('util');
var Q = require('q');
console.fs = require('../libs/fsconsole.js');
var ObjectId = require('mongoose').Types.ObjectId;


var ProposedTemplateController = require("../controllers/ProposedTemplateController.js");
var ThemePageController = require("../controllers/ThemePageController.js");
var ProjectImageController = require("../controllers/ProjectImageController.js");
var Controller = require("../controllers/Controller.js");
var ProjectImage = require('../models/ProjectImage.js').model;
var ProposedTemplate = require('../models/ProposedTemplate.js').model;
var ProposedImage = require('../models/ProposedImage.js').model;
var ProposedText = require('../models/ProposedText.js').model;
var ProposedImageController = require('../controllers/ProposedImageController.js');
var ProposedTextController = require('../controllers/ProposedTextController.js');
var EditorTextController = require('../controllers/EditorTextController.js');
var generatorUID = require('../libs/generator.js');
var UserPage = require('../models/UserPage.js').model;
var EditorBitmap = require('../models/EditorBitmap.js').model;
var EditorText = require('../models/EditorText.js').model;
var ThemePage = require('../models/ThemePage.js').model;
var UploadController = require('../controllers/UploadController.js');
//var app = require('../app.js');
var conf = require('../confs/main.js');
var mainConf = require('../libs/mainConf.js');

var jwt = require('jsonwebtoken');
var jwt_secret = mainConf.jwt_secret;

var _ = require('underscore');
var passwordHash = require('password-hash');

//var Generator = generator.Generator;

function UserPageController( controller ) {
	//console.fs(generator());
	this.socket = controller.socket;
	this.io = controller.io;
    //AdminProjectController.super_.call(this);
    this.name = "UserPageController";
    this.socketName = "UserPage";
};

util.inherits(UserPageController, Controller);

UserPageController.clone = function( pageID ){

	var def = Q.defer();

	UserPage.findOne({ _id: pageID }).exec( function( err, page ){

		if( err ){
			console.log( err );
		}else {

			var theme, proposedTemplate;
			var usedImages = [];
			var usedTexts = [];
			var textsCloned = false;
			var imagesCloned = false;

			ProposedTemplateController.clone( page.ProposedTemplate ).then(

				function( clonedTemplate ){

					proposedTemplate = clonedTemplate;
					checkDone();

				}

			);

			ThemePageController.clone( page.ThemePage ).then(

				function( clonedTheme ){

					theme = clonedTheme;
					checkDone();

				}

			);

			function cloneUsedImages ( imageIndex ) {

				if( page.UsedImages[imageIndex] ){

					EditorBitmapController._clone( page.UsedImages[imageIndex] ).then(

						function( clonedBitmap ){

							usedImages.push( clonedBitmap );
							cloneUsedImages( imageIndex+1 );

						}

					);

				}else {

					console.log('OBRAZY SKLONOWANE');
					imagesCloned = true;
					checkDone();

				}

			}

			cloneUsedImages( 0 );

			function cloneUsedTexts ( textIndex ) {

				if( page.UsedTexts[textIndex] ){

					EditorTextController.clone( page.UsedTexts[textIndex] ).then(

						function( clonedText ){

							usedTexts.push( clonedText );
							cloneUsedImages( textIndex+1 );

						}

					);

				}else {

					console.log('teksty sklonowane');
					textsCloned = true;
					checkDone();


				}

			}

			cloneUsedTexts( 0 );


			function checkDone(){


				// console.log( theme );
				// console.log( proposedTemplate );
				// console.log( textsCloned );
				// console.log( imagesCloned );
				// console.log( '______________________________________' );

				if( theme && proposedTemplate && textsCloned && imagesCloned ){

					console.log('LECI PRZYGOTOWANIE STRONY');
					var pageData = page;
					delete pageData._id;
					pageData.ThemePage = theme;
					pageData.ProposedTemplate = proposedTemplate;
					pageData.UsedImages = usedImages;
					pageData.UsedTexts = usedTexts;

					var newPage = new UserPage( pageData );

					newPage.save( function( err, saved ){

						if( err ){
							console.log( err )
						}else {

							UserPageController.prepareScene( saved._id ).then( function( userPage ){

								def.resolve( userPage );

							});
						}

					});

				}

			}

		}

	});

	return def.promise;

}

UserPageController.prototype.changeAllImagesSettings = function(){

    var socketName = this.socketName;
    var socket  = this.socket;
    var _this = this;

    socket.on( socketName+'.changeAllImagesSettings', function( data ) {

        console.log( data );
        console.log( 'chcesz ustawic wszystkim obrazą jakies smieszna rzeczy' );

    });

};

UserPageController.prototype.addProposedText = function(){

    var socketName = this.socketName;
    var socket  = this.socket;
    var _this = this;

    socket.on( socketName+'.addProposedText', function( data ) {

        var userPageID = data.userPageID;
        var width = data.width;
        var height = data.height;
        var x = data.x;
        var y = data.y;

        UserPage.findOne( { _id : userPageID} ).deepPopulate('ProposedTemplate ProposedTemplate.ProposedTexts').exec( function( err, userPage ){

            if( err ){

                console.fs( err);
                return false;

            }

            var proposedTextData = {

                size : {
                    width: width,
                    height: height
                },

                pos : {
                    x: x,
                    y: y
                },
                rotation: 0,
                order: userPage.ProposedTemplate.ProposedTexts.length+ userPage.ProposedTemplate.ProposedImages.length

            };


            var newProposedText = new ProposedText( proposedTextData );

            newProposedText.save( function( err, text ){

                if( err ){

                    console.fs( err );

                }else {

                    console.fs( text );
                    console.fs('zapisalem juz :)');

                }

                userPage.ProposedTemplate.ProposedTexts.push( text );
                userPage.ProposedTemplate.textsCount++;
                userPage.ProposedTemplate.save( function( err, template ){

                    if( err ){

                        console.fs( err );

                    }else {

                        var lastKey = 0;

                        for( var key in userPage.scene ){

                            lastKey = key;

                        }

                        userPage.scene[ Number(key)+1] = { objectType : 'proposedText', object: text._id, order: Number(key)+1};
                        userPage.markModified('scene');

                        userPage.save( function( err, updatedScene ){

                            if( err ){

                                console.fs( err );

                            }else {

                                ProposedTextController.sendDefaultThemePageValue( text._id, userPage.ThemePageFrom ).then(

                                    //ok
                                    function( text ){

                                        var data = {

                                            text: text,
                                            userPageID: userPageID

                                        };

                                        text.userPageID = userPage._id;
                                        socket.emit( socketName + '.addProposedText', data );


                                    }

                                );

                                /*

                                */


                            }

                        });

                    }

                });

            });


        });


    });

};

UserPageController.prototype.addEmptyProposedPosition = function(){

    var socketName = this.socketName;
    var socket  = this.socket;
    var _this = this;

    socket.on( socketName+'.addEmptyProposedPosition', function( data ) {

        console.fs( data  );
        console.fs('mam date');

        var x = data.x;
        var y = data.y;

        var width = data.width;
        var height = data.height;

        var userPageID = data.userPageID;

        UserPage.findOne( { _id: data.userPageID }).deepPopulate('ProposedTemplate ProposedTemplate.ProposedImages').exec( function( err, userPage ){

            if( err ){

                console.fs( err );
                return false;

            }

            var proposedImageData = {

                size : {

                    width: width,
                    height: height

                },
                pos: {

                    x: x,
                    y: y

                },
                rotation: 0,
                order: ( userPage.ProposedTemplate.ProposedImages.length + userPage.ProposedTemplate.ProposedTexts.length )

            };



            var proposedImage = new ProposedImage( proposedImageData );

            proposedImage.save( function ( err, savedImage ) {

                if( err ){

                    console.fs( err );
                    return false;

                }

                userPage.ProposedTemplate.ProposedImages.push( savedImage );
                userPage.ProposedTemplate.imagesCount++;
                userPage.ProposedTemplate.save( function( err, savedTemplate ){

                    if( err ){

                        console.fs( err );
                        return false;

                    }

                    for( var key in userPage.scene ){

                        lastKey = key;

                    }

                    userPage.scene[ Number(key)+1] = { objectType : 'proposedImage', object: savedImage._id, order: Number(key)+1};
                    userPage.markModified('scene');

                    userPage.save( function( err, savedPage ){

                        if( err ){

                            console.fs( err );
                            return false;

                        }

                        var _data = {

                            proposedImage : savedImage,
                            userPageID : userPageID

                        };

                        socket.emit( socketName + '.addEmptyProposedPosition', _data );

                    });

                });

            });

        });

    });

};

UserPageController.prototype.addProposedImagePosition = function(){

    var socketName = this.socketName;
    var socket  = this.socket;
    var _this = this;

    socket.on( socketName+'.addProposedImagePosition', function( data ) {

        var userPageID = data.userPageID;
        var width = data.width;
        var height = data.height;
        var x = data.posX;
        var y = data.posY;
        var bitmapData = data.bitmapData;
        var projectImageUID = data.projectImageUID;
        var userProjectID = data.userProjectID;

        UserPage.findOne( { _id: data.userPageID }).deepPopulate('ProposedTemplate ProposedTemplate.ProposedImages').exec( function( err, userPage ){

            if( err ){

                console.fs( err );
                return;
            }

            ProjectImage.findOne( {uid: projectImageUID} ).exec( function( err, projectImage ){

                if( err ){
                    console.fs( err );
                    return false;
                }

                var lastPosition = _.max( userPage.ProposedTemplate.ProposedImages, function( elem ){ return elem.order } );

                var data = {

                    order : lastPosition.order+1,
                    size : { width: width, height: height },
                    pos : { x: x, y: y }

                }

                bitmapData.uid = generatorUID();
                bitmapData.ProjectImage = projectImage;

                var bitmap = new EditorBitmap( bitmapData );

                bitmap.save( function( err, savedBitmap ){

                    if( err ){

                        console.fs( err );

                    }else {

                        data.objectInside = savedBitmap;

                        var newPosition = new ProposedImage( data );


                        newPosition.save( function( err, saved ){

                            if( err ){

                                console.fs( err );
                                return false;

                            }

                            //console.fs( newPosition );

                            userPage.ProposedTemplate.imagesCount++;
                            userPage.ProposedTemplate.ProposedImages.push( saved );
                            userPage.ProposedTemplate.save( function( err, proposedTemplateSaved ){

                                if( err ){

                                    console.fs( err );
                                    return false;

                                }

                                var lastKey = 0;

                                for( var key in userPage.scene ){

                                    lastKey = key;

                                }

                                userPage.scene[ Number(key)+1] = { objectType : 'proposedImage', object: saved._id, order: Number(key)+1};
                                userPage.markModified('scene');

                                userPage.save( function( err, savedPage ){

                                    if( err ){

                                        console.fs( err );
                                    }else {

                                        console.log(  );


                                        ProjectImageController._addedToProject( projectImageUID, userProjectID ).then(

                                            //ok
                                            function( projectImage ){

                                                var imageInfo = {};
                                                imageInfo[ projectImage.uid ] = projectImage.projectUsed[userProjectID];
                                                console.log( projectImage );
                                                console.log( imageInfo[ projectImage.uid ] );
                                                console.log('leci');
                                                socket.emit( 'UserProject.getProjectImagesUseNumber', imageInfo );

                                            }

                                        );


                                        ProposedImage.findOne( { _id: saved } ).deepPopulate('objectInside objectInside.ProjectImage').exec( function( err, proposedImage ){

                                            if( err ){

                                                console.fs( err );

                                            }else {

                                                var data = {

                                                    userPageID : userPageID,
                                                    proposedImage : proposedImage

                                                };

                                                socket.emit( socketName + '.addProposedImagePosition', data );

                                            }

                                        });


                                    }

                                });

                            });


                        });

                    }

                });


            });


        });

    });

};

UserPageController.prototype.moveObjectUp = function(){

    var socketName = this.socketName;
    var socket  = this.socket;
    var _this = this;

    socket.on( socketName+'.moveObjectUp', function( data ) {

        console.fs( data );
        console.log('^^^^^^^^^^^^^^');


        var objectToMoveUp = data.objectID;
        UserPage.findOne({ _id: data.userPageID}).exec(function( err, page ){


            if( err ){

                console.fs( err );
                return false;

            }

            var scene = page.scene;

            var objectsInScene = 0;
            var populatedObjects = 0;


            var elemBefore = null;
            var currentElem = null;
            var previousKey = null;

            for( var key in scene ){

                if( !elemBefore && !currentElem ){

                    currentElem = scene[key];

                }else{

                    elemBefore = new Object( currentElem );
                    currentElem = scene[key];

                }

                if( elemBefore && elemBefore.object.toString() == objectToMoveUp ){

                    var temp = currentElem;
                    var tempOrder = elemBefore.order;

                    scene[key] = elemBefore;
                    scene[key].order = currentElem.order;
                    scene[key-1] = temp;
                    scene[key-1].order = tempOrder;


                    var _scene = {};

                    for( var key2 in scene ){

                        _scene[key2] = {};
                        _scene[key2].order = scene[key2].order;
                        _scene[key2].objectType = scene[key2].objectType;
                        _scene[key2].object =  scene[key2].object.toString();

                    }

                    page.scene = _scene;
                    page.markModified('scene');

                    page.save( function( err, updatedScene ){

                        if( err ){

                            console.fs( err );

                        }else {

                            console.fs('POWINNO DZIALAc:)');

                        }

                    });

                    break;

                }



            }

        });

    });

};

UserPageController._updatePagePrev = function( user, id, base64Array ){

	var def = Q.defer();

	UserPage.findOne({ _id: id}).exec( function( err, userPage){

		if( err ){
			console.log( err );
		}else {
			userPage.prevImage= [];
			userPage.save( function( err, saved ){

				savePrev( 0 );

			})
		}

	});

	function end(){


		def.resolve();

	}

	function savePrev( index ){

		if( index > base64Array.length-1 ){

			end();
			return;

		}

		base64 = base64Array[index];

		UploadController._savePagePrev ( user, id, base64 ).then(

			function( upload ){


				UserPage.findOne({ _id: id}).exec( function( err, page ){


					if( err ){
						console.log( err );
						console.log('Przejebane');
						console.log( page );
						console.log( id );
					}else {

						page.prevImage.push( upload );
						page.save( function( err, savedPage ){

							if( err ){

								console.log( err );

							}else {

								savePrev( index+1 );

							}

						});

					}

				});

			},
			 function (){
				 def.reject();
			 }

		);
	}

	return def.promise;

}

UserPageController._getScene = function( pageID ){

	var def = Q.defer();

	UserPage.findOne( {_id: pageID }).exec( function( err, userPage ){

		var scene = userPage.scene;

		var objectsInScene = 0;
		var populatedObjects = 0;

		function checkPopulated(){

			if( objectsInScene == populatedObjects ){

				def.resolve( scene );

			}

		}

		for( var key in scene ){

			objectsInScene++;

		}


		for( var key in scene ){

			populateObject( scene[key].object, scene[key].objectType, key ).then(

				// ok
				function( obj ){

					scene[ obj.key ].object = obj.obj;
					populatedObjects++;
					checkPopulated();

				}

			);

		}

		checkPopulated();

		function populateObject( id, typeName, key ){

			var def = Q.defer();

			if( typeName == 'bitmap' ){

				EditorBitmap.findOne( { _id: id }).deepPopulate('ProjectImage').exec( function(err, bitmap ){

					if( err ){

						console.fs( err );

					}else {

						var data = {

							obj : bitmap,
							key : key

						};

						def.resolve( data );

					}

				});

			}else if( typeName == 'text'){

				EditorText.findOne( { _id : id }, function( err, text ){

					if( err ){

						console.fs( err );

					}else {

						var data = {

							obj : text,
							key : key

						};

						def.resolve( data );

					}

				});

			}else if( typeName == 'proposedImage' ){

				ProposedImage.findOne( { _id : id }).deepPopulate('objectInside objectInside.ProjectImage').exec( function( err, image ){

					if( err ){

						console.fs( err );

					}else {

						var data = {

							obj : image,
							key : key

						};

						def.resolve( data );

					}

				});

			}else if( typeName == "proposedText" ){

				ProposedText.findOne( { _id : id }, function( err, text ){

					if( err ){

						console.fs( err );

					}else {

						var data = {

							obj : text,
							key : key

						};

						def.resolve( data );

					}

				} );

			}else {

				console.log('JEST KURWA “ŁAD');

			}

			return def.promise;

		}

	});

	return def.promise;

}


UserPageController.prototype.moveObjectDown = function(){

    var socketName = this.socketName;
    var socket  = this.socket;
    var _this = this;

    socket.on( socketName+'.moveObjectDown', function( data ) {

        var objectToMove = data.objectID;
        UserPage.findOne({ _id: data.userPageID}).exec(function( err, page ){

            if( err ){

                console.fs( err );
                return false;

            }

            var scene = page.scene;

            var objectsInScene = 0;
            var populatedObjects = 0;


            var elemBefore = null;
            var currentElem = null;
            var previousKey = null;

            for( var key in scene ){

                if( !elemBefore && !currentElem ){

                    currentElem = scene[key];

                }else{

                    elemBefore = new Object( currentElem );
                    currentElem = scene[key];

                }


                if( currentElem && currentElem.object.toString() == objectToMove ){

                    var temp = currentElem;
                    var tempOrder = elemBefore.order;

                    scene[key] = elemBefore;
                    scene[key].order = currentElem.order;
                    scene[key-1] = temp;
                    scene[key-1].order = tempOrder;


                    var _scene = {};


                    for( var key2 in scene ){

                        _scene[key2] = {};
                        _scene[key2].order = scene[key2].order;
                        _scene[key2].objectType = scene[key2].objectType;
                        _scene[key2].object =  scene[key2].object.toString();

                    }

                    console.log( _scene );

                    page.scene = _scene;
                    page.markModified('scene');

                    page.save( function( err, updatedScene ){

                        if( err ){

                            console.fs( err );

                        }else {

                            console.fs( updatedScene._id );
                            console.fs('POWINNO DZIALAc:)');

                        }

                    });

                    break;

                }



            }

        });

    });

};

UserPageController.prototype.removeProposedText = function(){

    var socketName = this.socketName;
    var socket  = this.socket;
    var _this = this;

    socket.on( socketName+'.removeProposedText', function( data ) {

        UserPage.findOne({ _id: data.userPageID}).deepPopulate('ThemePage ThemePage.proposedTemplates ThemePage.proposedTemplates.ProposedTexts ThemePage.proposedTemplates.ProposedImages ProposedTemplate UsedImages UsedTexts').exec( function( err, userPage ){

            if( err ){

                console.fs( err );

            }else {

                var templates = _.filter( userPage.ThemePage.proposedTemplates, function( template ){

                    return ( template.textsCount == userPage.ProposedTemplate.textsCount-1 && template.imagesCount == userPage.ProposedTemplate.imagesCount );

                });

                userPage.ProposedTemplateFrom = templates[0];

                ProposedTemplateController.clone( templates[0] ).then(

                    //ok
                    function( cloned ){

                        ProposedTemplateController.useDataFromOther( cloned._id, userPage.ProposedTemplate._id ).then(

                            //ok
                            function( ok ){

                                userPage.ProposedTemplate = ok;

                                userPage.save( function( err, saved ){

                                    if( err ){

                                        console.fs( err );

                                    }else {

                                        UserPageController.prepareScene( saved._id ).then(

                                            // ok
                                            function( preparedScene ){

                                                socket.emit( socketName+'.swapTemplate', preparedScene );

                                            }

                                        );

                                    }

                                });

                            }

                        );

                    }

                );

            }

        });

    });

};


UserPageController.prototype.removeOneProposedImage = function(){

    var socketName = this.socketName;
    var socket  = this.socket;
    var _this = this;

    socket.on( socketName+'.removeOneProposedImage', function( data ) {

        console.fs( data );
        console.fs('jak jest data :)');

        var userPageID = data.userPageID;

        UserPage.findOne( {_id : data.userPageID }).deepPopulate('ProposedTemplate ThemePage ThemePage.proposedTemplates ThemePage.proposedTemplates.ProposedImages ThemePage.proposedTemplates.ProposedTexts UsedImages UsedImages.ProjectImage').exec( function( err, userPage ){

            if( err ){

                console.fs( err );

            }else {

                var posibleTemplates = _.filter( userPage.ThemePage.proposedTemplates, function( template ){

                    return ( template.imagesCount == userPage.ProposedTemplate.imagesCount-1 && template.textsCount == userPage.ProposedTemplate.textsCount );

                });

                var nextTemplate = posibleTemplates[0];

                userPage.ProposedTemplateFrom = posibleTemplates[0];

                ProposedTemplateController.clone( posibleTemplates[0] ).then(

                    // ok
                    function( cloned ){

                        ProposedTemplateController.useDataFromOther( cloned._id, userPage.ProposedTemplate._id ).then(

                            //ok
                            function( ok ){

                                userPage.ProposedTemplate = ok;

                                userPage.save( function( err, saved ){

                                    if( err ){

                                        console.fs( err );

                                    }else {

                                        UserPageController.prepareScene( saved._id ).then(

                                            // ok
                                            function( preparedScene ){

                                                socket.emit( socketName+'.swapTemplate', preparedScene );

                                            }

                                        );

                                    }

                                });

                            }

                        );

                    }

                );

            }

        });

    });

};


UserPageController.prototype.removeUserText = function(){

    var socketName = this.socketName;
    var socket  = this.socket;
    var _this = this;

    socket.on( socketName+'.removeUserText', function( data ) {

        ProposedTemplate.findOne( { ProposedTexts : data.proposedTextID } ).deepPopulate('ProposedTexts').exec( function( err, template ){

            if( err ){

                console.fs( err );

            }else {

                template.ProposedTexts = _.filter( template.ProposedTexts, function( elem ){

                    if( elem._id.toString() == data.proposedTextID ){

                        return false;

                    }else {

                        return true;

                    }

                });

                template.textsCount--;
                template.save( function( err, newTemplate ){

                    if( err ){

                        console.fs( err );

                    }else {

                        UserPageController.prepareScene( data.userPageID ).then(

                            //ok
                            function( info ){

                                socket.emit( socketName + '.removeUserText', data );

                            }

                        );

                    }

                } );

            }

        });

    });

};

UserPageController.prototype.removeProposedImage = function(){

    var socketName = this.socketName;
    var socket  = this.socket;
    var _this = this;

    socket.on( socketName+'.removeProposedImage', function( data ) {

        ProposedTemplate.findOne( { ProposedImages : data.proposedPositionID } ).deepPopulate('ProposedImages').exec( function( err, template ){

            if( err ){

                console.fs( err );

            }else {

                ProposedImage.findOne( { _id : data.proposedPositionID }).deepPopulate('objectInside objectInside.ProjectImage').exec( function( err, proposedIm ){

                    if( err ){ console.error( err); return false; }



                    ProjectImageController._removedFromProject( proposedIm.objectInside.ProjectImage.uid, data.projectID ).then(

                        function ( info ){

                            var removeInfo = {};
                            removeInfo[ info.uid ] = info.projectUsed[ data.projectID ];

                            socket.emit( 'UserProject.getProjectImagesUseNumber', removeInfo );

                        }

                    );

                });

                template.ProposedImages = _.filter( template.ProposedImages, function( elem ){

                    if( elem._id.toString() == data.proposedPositionID ){

                        return false;

                    }else {

                        return true;

                    }

                });

                template.imagesCount--;
                template.save( function( err, newTemplate ){

                    if( err ){

                        console.fs( err );

                    }else {

                        UserPageController.prepareScene( data.userPageID ).then(

                            //ok
                            function( info ){

                                socket.emit( socketName + '.removeProposedImage', data );

                            }

                        );

                    }

                } );

            }

        });

    });

};



UserPageController.prototype.removeProposedPosition = function(){

    var socketName = this.socketName;
    var socket  = this.socket;
    var _this = this;

    socket.on( socketName+'.removeProposedPosition', function( data ) {


        UserPage.findOne( { _id : data.userPageID }).deepPopulate('UsedImages').exec( function( err, userPage ){

            if( err ){

                console.fs( err );

            }else {

                ProposedImage.findOne( { _id : data.proposedPositionID }, function( err, proposedPosition ){

                    if( err ){

                        console.fs( err );

                    }else {

                        var image = _.reject( userPage.UsedImages, { order : proposedPosition.order } );
                        userPage.UsedImages = image;

                        userPage.save( function( err, savedUserPage ){

                            if( err ){

                                console.fs( err );

                            }else {

                                ThemePage.findOne({ _id: userPage.ThemePage}).populate({
                                  path: 'proposedTemplates',
                                  match: { imagesCount: image.length },
                                  select: '_id ProposedImages ProposedTexts'
                                }).exec( function( err, themePage ){

                                    if( err ){

                                        console.fs( err );

                                    }else {

                                        if( themePage.proposedTemplates.length > 0 ){

                                            UserPageController.changeProposedTemplate( userPage._id, themePage.proposedTemplates[0] ).then( function( pageInfo ){

                                                var templateData = {

                                                    userPageID : pageInfo._id,
                                                    proposedTemplate : pageInfo.ProposedTemplate,
                                                    usedImages : pageInfo.UsedImages

                                                }

                                                UserPageController._fullFillProposedImages( pageInfo._id ).then( function(){

                                                    UserPage.findOne( { _id: pageInfo._id } ).deepPopulate('UsedImages UsedImages.ProjectImage').exec( function( err, userPage ){

                                                        if( err ){

                                                            console.fs( err );

                                                        }else {

                                                            templateData.usedImages = userPage.UsedImages;

                                                            socket.emit('UserPage.swapTemplate', templateData );

                                                        }

                                                    });

                                                });

                                            });


                                        }else {

                                            ThemePage.findOne({ _id : userPage.ThemePage }).deepPopulate('proposedTemplates proposedTemplates.ProposedImages proposedTemplates.ProposedTexts').exec(function( err, themePage ){

                                                UserPageController.changeProposedTemplate( userPage._id, themePage.proposedTemplates[0] ).then( function( pageInfo ){

                                                    var templateData = {

                                                        userPageID : pageInfo._id,
                                                        proposedTemplate : pageInfo.ProposedTemplate,
                                                        usedImages : pageInfo.UsedImages

                                                    }

                                                    UserPageController._fullFillProposedImages( pageInfo._id ).then( function(){

                                                        UserPage.findOne( { _id: pageInfo._id } ).deepPopulate('UsedImages UsedImages.ProjectImage').exec( function( err, userPage ){

                                                            if( err ){

                                                                console.fs( err );

                                                            }else {

                                                                templateData.usedImages = userPage.UsedImages;

                                                                socket.emit('UserPage.swapTemplate', templateData );

                                                            }

                                                        });

                                                    });

                                                });
                                            });

                                        }

                                    }

                                });

                            }

                        });

                    }

                });

            }

        });

    });

};

UserPageController.prototype.setTextContent = function(){

    var socketName = this.socketName;
    var socket  = this.socket;
    var _this = this;

    socket.on( socketName+'.setTextContent', function(data) {


        UserPage.findOne({ _id: data.userPageID }).deepPopulate('UsedTexts ProposedTemplate ProposedTemplate.ProposedTexts').exec(function( err, userPage ){

            if( err ){

                console.fs( err );

            }else {



                var findProposedPosition = -1;

                for( var i=0; i < userPage.ProposedTemplate.ProposedTexts.length; i++){

                    if( userPage.ProposedTemplate.ProposedTexts[i]._id.toString() == data.proposedTextID  ){

                        findProposedPosition =i;
                        break;

                    }

                }

                if( userPage.UsedTexts[ findProposedPosition ] ){

                    userPage.UsedTexts[ findProposedPosition ].content = data.content;
                    userPage.UsedTexts[ findProposedPosition ].save( function( err, savedText ){

                        if( err ){

                            console.fs( err );

                        }else {


                        }

                    });

                }else {

                    var proposedTextPosition = userPage.ProposedTemplate.ProposedTexts[ findProposedPosition ];

                    var textData = {

                        name : 'text',
                        width : proposedTextPosition.size.width,
                        height : proposedTextPosition.size.height,
                        rotation : proposedTextPosition.rotation,
                        uid : generatorUID(),
                        x : proposedTextPosition.pos.x,
                        y : proposedTextPosition.pos.y,
                        order :  proposedTextPosition.order,
                        content : data.content

                    };

                    console.log('wlasnie dodaje nowy tekst');

                    var newEditorObject = new EditorText( textData );

                    newEditorObject.save( function( err, savedText){

                        if( err ){

                            console.fs( err );

                        }else{

                            userPage.UsedTexts.push( savedText );
                            userPage.save( function( err, updatedPage ){

                                if( err ){

                                    console.fs( err );

                                }else {


                                }

                            });

                        }


                    } );

                }


            }

        });


    });


};

UserPageController._complexProposedTemplateChange = function( userPageID, template, projectID, socket ){

    var def = Q.defer();

    UserPageController.changeProposedTemplate( userPageID, template, projectID, socket ).then( function( pageInfo ){

        UserPageController._fullFillProposedImages(  userPageID ).then( function(){

            UserPage.findOne({ _id : userPageID }).deepPopulate('ProposedTemplate ProposedTemplate.ProposedTexts ProposedTemplate.ProposedImages ThemePage ThemePage.proposedTemplates ThemePage.proposedTemplates.ProposedImages ThemePage.proposedTemplates.ProposedTexts UsedImages UsedImages.ProjectImage UsedTexts').exec( function( err, userPage ){

                var data = {

                    userPage           : userPage,
                    proposedTemplate   : userPage.ProposedTemplate,
                    usedImages         : userPage.UsedImages,
                    usedTexts          : userPage.UsedTexts,
                    canAddOneMoreText  : ThemePageController.hasTemplateWith( userPage.ThemePage, userPage.ProposedTemplate.imagesCount, userPage.ProposedTemplate.textsCount+1 ),
                    canAddOneMoreImage : ThemePageController.hasTemplateWith( userPage.ThemePage, userPage.ProposedTemplate.imagesCount+1, userPage.ProposedTemplate.textsCount ),
                    canRemoveOneImage  : ThemePageController.hasTemplateWith( userPage.ThemePage, userPage.ProposedTemplate.imagesCount-1, userPage.ProposedTemplate.textsCount ),
                    canRemoveOneText   : ThemePageController.hasTemplateWith( userPage.ThemePage, userPage.ProposedTemplate.imagesCount, userPage.ProposedTemplate.textsCount-1 ),
                    canSwapTemplate    : ThemePageController.hasTemplateWith( userPage.ThemePage, userPage.ProposedTemplate.imagesCount, userPage.ProposedTemplate.textsCount ),

                };

                def.resolve( data );

            });

        });

    });

    return def.promise;

};

UserPageController.prototype.oneMoreImage = function(){

    var socketName = this.socketName;
    var socket  = this.socket;
    var _this = this;

    socket.on( socketName+'.oneMoreImage', function(data) {

        UserPage.findOne( {_id : data.userPageID }).deepPopulate('ProposedTemplate ThemePage ThemePage.proposedTemplates ThemePage.proposedTemplates.ProposedImages ThemePage.proposedTemplates.ProposedTexts UsedImages UsedImages.ProjectImage').exec( function( err, userPage ){

            if( err ){

                console.fs( err );

            }else {

                var posibleTemplates = _.filter( userPage.ThemePage.proposedTemplates, function( template ){

                    return ( template.imagesCount == userPage.ProposedTemplate.imagesCount+1 && template.textsCount == userPage.ProposedTemplate.textsCount );

                });

                var nextTemplate = posibleTemplates[0];

                userPage.ProposedTemplateFrom = posibleTemplates[0];

                ProposedTemplateController.clone( posibleTemplates[0] ).then(

                    // ok
                    function( cloned ){

                        ProposedTemplateController.useDataFromOther( cloned._id, userPage.ProposedTemplate._id ).then(

                            //ok
                            function( ok ){

                                userPage.ProposedTemplate = ok;

                                userPage.save( function( err, saved ){

                                    if( err ){

                                        console.fs( err );

                                    }else {

                                        UserPageController.prepareScene( saved._id ).then(

                                            // ok
                                            function( preparedScene ){

                                                socket.emit( socketName+'.swapTemplate', preparedScene );

                                            }

                                        );

                                    }

                                });

                            }

                        );

                    }

                );

            }

        });

    });

}

UserPageController.prototype.oneMoreText = function(){

    var socketName = this.socketName;
    var socket  = this.socket;
    var _this = this;

    socket.on( socketName+'.oneMoreText', function(data) {

        UserPage.findOne( {_id : data.userPageID }).deepPopulate('ProposedTemplate ThemePage ThemePage.proposedTemplates ThemePage.proposedTemplates.ProposedImages ThemePage.proposedTemplates.ProposedTexts UsedImages UsedImages.ProjectImage').exec( function( err, userPage ){

            if( err ){

                console.fs( err );

            }else {

                var posibleTemplates = _.filter( userPage.ThemePage.proposedTemplates, function( template ){

                    return ( template.imagesCount == userPage.ProposedTemplate.imagesCount && template.textsCount == userPage.ProposedTemplate.textsCount+1 );

                });

                var nextTemplate = posibleTemplates[0];

                userPage.ProposedTemplateFrom = posibleTemplates[0];

                ProposedTemplateController.clone( posibleTemplates[0] ).then(

                    // ok
                    function( cloned ){

                        ProposedTemplateController.useDataFromOther( cloned._id, userPage.ProposedTemplate._id, userPage.ThemePageFrom ).then(

                            //ok
                            function( ok ){

                                userPage.ProposedTemplate = ok;

                                userPage.save( function( err, saved ){

                                    if( err ){

                                        console.fs( err );

                                    }else {

                                        UserPageController.prepareScene( saved._id ).then(

                                            // ok
                                            function( preparedScene ){

                                                socket.emit( socketName+'.swapTemplate', preparedScene );

                                            }

                                        );

                                    }

                                });

                            }

                        );

                    }

                );

            }

        });

    });

};

UserPageController.prototype.changeImage = function(){

    //changeImage
    var socketName = this.socketName;
    var socket = this.socket;

    socket.on( socketName+'.changeImage', function( data ){

        var userPageID = data.userPageID;
        var newProjectImageUID = data.projectImageUID;
        var projectID = data.projectID;

        console.fs(data);

        UserPage.findOne({ _id : data.userPageID }).deepPopulate('UsedImages ProposedTemplate ProposedTemplate.ProposedImages').exec( function( err, userPage ){

            if( err ){

                console.fs( err );

            }
            else {

                console.fs( userPage.ProposedTemplate.ProposedImages );

                var imagePosition = _.find( userPage.ProposedTemplate.ProposedImages, function( pI ){

                    return ( pI._id == data.proposedPositionID );

                });

                var currentBitmap = _.find( userPage.UsedImages, function( cB ){

                    return ( cB.order == imagePosition.order );

                });

                currentBitmap.remove( function( err, removedBitmap ){

                    if( err ){

                        console.fs( err );

                    }else {


                        ProjectImageController._removedFromProject( removedBitmap.ProjectImage, data.projectID ).then(

                            function ( info ){

                                var removeInfo = {};
                                removeInfo[ info.uid ] = info.projectUsed[ data.projectID ];

                                socket.emit( 'UserProject.getProjectImagesUseNumber', removeInfo );

                                ProjectImage.findOne({ uid : newProjectImageUID }, function( err, projectImage ){

                                    console.fs( projectImage );

                                    var scale = imagePosition.size.width/projectImage.width;

                                    if( imagePosition.size.height > projectImage.height*scale ){

                                        scale = imagePosition.size.height/projectImage.height;

                                    }

                                    console.fs( removedBitmap );
                                    var data = removedBitmap.toJSON();
                                    delete data._id;
                                    data.ProjectImage = projectImage._id;
                                    data.x   = imagePosition.size.width/2;
                                    data.y   = imagePosition.size.height/2;
                                    data.uid = generatorUID();
                                    data.scaleX = scale;
                                    data.scaleY = scale;
                                    data.order  = imagePosition.order;


                                    var newBitmap = new EditorBitmap( data );

                                    newBitmap.save( function( err, savedBitmap ){

                                        if( err ){

                                            console.fs( err );

                                        }else {

                                            EditorBitmap.findOne( { _id : savedBitmap }).deepPopulate( 'ProjectImage' ).exec( function( err, bitmap ){

                                                if( err ){

                                                    console.fs( err );

                                                }else {


                                                    UserPage.findOne({ _id : userPageID }).deepPopulate('UsedImages').exec( function( err, userPage ){

                                                        if( err ){

                                                            console.fs( err );

                                                        }else {

                                                            console.fs('mam strone');
                                                            userPage.UsedImages.push( bitmap );
                                                            userPage.save();

                                                            var data = {

                                                                userPageID : userPageID,
                                                                image      : bitmap,
                                                                proposedPositionID : imagePosition._id

                                                            };

                                                            socket.emit( socketName+'.changeImage', data );
                                                            ProjectImageController._addedToProject( bitmap.ProjectImage, projectID ).then(

                                                                //ok
                                                                function( info ){

                                                                    var addInfo = {};
                                                                    addInfo[ info.uid ] = info.projectUsed[ projectID ];

                                                                    console.fs( addInfo );

                                                                    socket.emit( 'UserProject.getProjectImagesUseNumber', addInfo );

                                                                }

                                                            );

                                                        }

                                                    });

                                                }

                                            });


                                        }

                                    });

                                });

                            }

                        );

                    }

                });

            }

        });

    });

};

UserPageController.prototype.loadImage = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName+'.loadImage', function( data ){

		var projectImageUID = data.projectImageUID;
		var userPageID = data.userPageID;
        var projectID = data.projectID;

		UserPage.findOne({ _id : data.userPageID }).deepPopulate('UsedImages ThemePage').exec( function( err, userPage ){

			if( err ){

				console.fs( err );

			}
			else {

				ProposedImage.findOne({ _id : data.proposedPositionID }, function( err, proposedPosition ){

					if( err ){

						console.fs( err );

					}
					else {

						ProjectImage.findOne( { uid: projectImageUID }, function( err, projectImage ){

                            var projectImageID = projectImage._id;
		                    var scale = proposedPosition.size.width/projectImage.width;

		                    if( proposedPosition.size.height > projectImage.height*scale ){

		                        scale = proposedPosition.size.height/projectImage.height;

		                    }

							var data = {

					            ProjectImage : projectImageID,
					            x   : proposedPosition.size.width/2,
					            y   : proposedPosition.size.height/2,
					            uid : generatorUID(),
					            scaleX : scale,
					            scaleY : scale,
					            order  : proposedPosition.order

					        };

                            /*
                            if( userPage.ThemePage ){

                                if( userPage.ThemePage.defaultSettings ){

                                    for( var key in userPage.ThemePage.defaultSettings ){

                                        data[key] = userPage.ThemePage.defaultSettings[key];

                                    }

                                }

                            }
                            */

                            ProposedTemplate.findOne({ ProposedImages : proposedPosition._id }).deepPopulate('ProposedImages').exec( function( err, template){

                                if( err ){

                                    console.log( err );

                                }else {

                                    console.log( template.ProposedImages.length );

                                    var sorted = _.sortBy( template.ProposedImages, 'order' );

                                    var objectOrder = null;

                                    for( var i=0; i < sorted.length; i++){

                                        if( sorted[i].order == proposedPosition.order ){

                                            objectOrder = i;

                                        }

                                    }

                                    /*
                                    if( objectOrder !== null ){

                                        if( userPage.ThemePage ){

                                            if( userPage.ThemePage.defaultSettings ){

                                                if( userPage.ThemePage.defaultSettings.proposedImagesOpt ){

                                                    if( userPage.ThemePage.defaultSettings.proposedImagesOpt[ objectOrder ]){

                                                        for( var key in userPage.ThemePage.defaultSettings.proposedImagesOpt[ objectOrder ] ){

                                                            data[key] = userPage.ThemePage.defaultSettings.proposedImagesOpt[objectOrder][ key ];

                                                        }

                                                    }

                                                }

                                            }

                                        }

                                    }
                                    */
                                    console.log( data );
                                    console.log('jaka data');


                                    var newBitmap = new EditorBitmap( data );

                                    newBitmap.save( function( err, savedBitmap ){

                                        if( err ){

                                            console.fs( err );

                                        }else {

                                            var images = [];

                                            for( var i=0; i < userPage.UsedImages.length; i++ ){

                                                if( userPage.UsedImages.order != savedBitmap.order )
                                                    images.push( userPage.UsedImages[i]._id || userPage.UsedImages[i] );

                                            }

                                            images.push( savedBitmap._id );

                                            userPage.UsedImages = images;

                                            userPage.save( function( err, _savedUserPage ){

                                                if( err ){

                                                    console.fs( err );

                                                }else {

                                                    EditorBitmap.findOne({_id : savedBitmap._id }).deepPopulate('ProjectImage').exec( function( err, bitmap ){


                                                        if (err ){

                                                            console.fs( err );

                                                        }else {


                                                        }
                                                        var data = {

                                                            userPageID : userPageID,
                                                            proposedPosition : proposedPosition._id,
                                                            image : bitmap

                                                        }

                                                        ProjectImageController._addedToProject( projectImageID, projectID ).then(

                                                            // ok
                                                            function( updatedImage ){

                                                                var imageInfo = {};
                                                                imageInfo[ updatedImage.uid ] = updatedImage.projectUsed[projectID];

                                                                data.projectImage = updatedImage;
                                                                socket.emit( 'UserProject.getProjectImagesUseNumber', imageInfo );
                                                                socket.emit( socketName+'.loadImage', data );

                                                            }

                                                        );

                                                    });

                                                }

                                            });

                                        }

                                    });

                                }

                            } );

						});

					}

				});

			}

		});

	});

};

UserPageController.prototype.replacePhotos = function(){

	var socketName = this.socketName;
	var socket = this.socket;

	socket.on( socketName+'.replacePhotos', function( data ){

		console.fs( data );
		console.fs('jesyt informacja o zmianie orderów');

		var userPageID = data.userPageID;
		var proposedPositionID = data.proposedPosition;

		EditorBitmap.find(
			{'_id': { $in: [
	        	data.editorObject1,
	        	data.editorObject2
	        ]}},
	        function( err, editorBitmaps ){

	        	if( err ){

	        		console.fs( err );

	        	}else {

	        		if( editorBitmaps[1]){

		        		console.fs( editorBitmaps );

						var bitmapsToUpdate = editorBitmaps.length;
						var updatedBitmaps = 0;

		        		var firstOrder = editorBitmaps[0].order;
		        		var secondOrder = editorBitmaps[1].order;

                        console.fs(  [ firstOrder, secondOrder ] );

		        		editorBitmaps[0].order = secondOrder;
		        		editorBitmaps[1].order = firstOrder;

		        		for( var i=0; i< editorBitmaps.length; i++ ){

		        			editorBitmaps[i].save( function( err, updatedBitmap ){

		        				if( err ){

		        					console.fs( err );

		        				}
		        				else {

		        					updatedBitmaps++;
		        					checkDone();

		        				}

		        			});

		        		}

		        		function checkDone(){

		        			if( updatedBitmaps == bitmapsToUpdate ){

								UserPageController._fullFillProposedImages( userPageID ).then( function(){

	                                UserPage.findOne( { _id : userPageID }).deepPopulate('UsedImages UsedImages.ProjectImage ProposedTemplate ProposedTemplate ProposedTemplate.ProposedImages ProposedTemplate.ProposedTexts').exec( function( err, userPage ){

	                                	if( err ){

	                                		console.fs( err );

	                                	}else {

	                                		var data = {

	                                			userPageID : userPage._id,
	                                			usedImages : userPage.UsedImages

	                                		}

	                                		socket.emit( 'UserPage.updateTemplatePhotos', data );

	                                	}

	                                });

	                            });

		        			}


		        		}

		        	}
		        	else {

		        		ProposedImage.findOne({ _id : proposedPositionID}, function( err,proposedPosition){

		        			if( err ){

		        				console.fs( err );

		        			}else {

		        				editorBitmaps[0].order = proposedPosition.order;

		        				editorBitmaps[0].save( function( err, savedBitmap){

		        					if( err ){

		        						console.fs( err );

		        					}else {

									UserPageController._fullFillProposedImages( userPageID ).then( function(){

		                                UserPage.findOne( { _id : userPageID }).deepPopulate('UsedImages UsedImages.ProjectImage ProposedTemplate ProposedTemplate ProposedTemplate.ProposedImages ProposedTemplate.ProposedTexts').exec( function( err, userPage ){

		                                	if( err ){

		                                		console.fs( err );

		                                	}else {

		                                		var data = {

		                                			userPageID : userPage._id,
		                                			usedImages : userPage.UsedImages

		                                		}

		                                		socket.emit( 'UserPage.updateTemplatePhotos', data );

		                                	}

		                                });

		                            });

		        					}

		        				});

		        			}


		        		});

		        	}

	        	}
	        }
        );

	});

};


UserPageController.fillWithImages = function( userPage, images, projectID ){

    var def = Q.defer();

    UserPage.findOne( { _id : userPage._id } ).deepPopulate('ProposedTemplate ProposedTemplate.ProposedImages UsedImages ThemePage').exec( function( err, populatedPage ){

        if( err ){

            console.fs( err );

        }
        else {

            var removedImages = 0;
            var imagesToRemove = populatedPage.UsedImages.length;

            function checkRemove(){

                if( removedImages == imagesToRemove ){

                    return true;

                }else {

                    return false;

                }

            }

            if( projectID ){

                for( var i=0; i < populatedPage.UsedImages.length; i++ ){

                    ProjectImageController._removedFromProject( populatedPage.UsedImages[i].ProjectImage, projectID ).then(

                        //ok
                        function( data ){

                            removedImages++;
                            if( checkRemove() ){

                                fill();

                            }

                        }

                    );

                }

                if( checkRemove() ){

                    fill();

                }

            }

            function fill(){

                populatedPage.UsedImages = [];
                var savedImages = 0;

                function checkDone(){

                    savedImages++;

                    if( savedImages == images.length){

                        populatedPage.save( function( err , savedPage ){

                            def.resolve( savedPage );

                        });

                    }

                }

                for( var i=0; i < images.length; i++ ){

                    var proposedImage = populatedPage.ProposedTemplate.ProposedImages[i];

                    var scale = proposedImage.size.width/images[i].width;

                    if( proposedImage.size.height > images[i].height*scale ){

                        scale = proposedImage.size.height/images[i].height;

                    }

                    ProposedImageController._changeImage( proposedImage._id, images[i].uid, projectID ).then(

                        //ok
                        function( info ){

                            if( info.oldObj ){

                                if( info.oldObj.uid != info.newObj ){

                                    ProjectImageController._removedFromProject( info.oldObj.uid, projectID );

                                    ProjectImageController._addedToProject( info.newObj, projectID );

                                }

                            }else {

                                ProjectImageController._addedToProject( info.newObj, projectID );

                            }

                            checkDone();

                        }

                    );

                }

            }

        }

    });

    return def.promise;

}


UserPageController.prototype._fillProposedPositions = function( proposedTemplateID, proposedImages, usedImages, userPage ){

    var defer = Q.defer();

    var needToFill = 0;
    var filledCount = 0;

    function fillProposedImage( position, image ){

        var deferFill = Q.defer();

        var data = {

            ProjectImage : image._id,
            x   : position.size.width/2,
            y   : position.size.height/2,
            uid : generatorUID(),

        };

        var newBitmap = new EditorBitmap( data );
        newBitmap.order = position.order;

        newBitmap.save( function( err, savedBitmap ){

            if( err ){

                console.fs( err );

            }
            else {

                position.save( function( err, savedPosition ){

                    if( err ){

                        console.fs( err );

                    }
                    else {

                        deferFill.resolve();

                    }

                });

            }

        });

        return deferFill.promise;

    }

    if( proposedImages.length >= usedImages.length ){

        needToFill = usedImages.length;

        if( usedImages.length == 0 )
            checkFilled();

        for( var i=0; i<usedImages.length; i++ ){

            var image = usedImages[i];
            var position = proposedImages[i];

            var filled = fillProposedImage( position, image );

            filled.then( function(){

                filledCount++;
                checkFilled();

            });

        }

    }else {

        needToFill = proposedImages.length;

        if( usedImages.length == 0 )
            checkFilled();

        for( var i=0; i<proposedImages.length; i++ ){

            var image = usedImages[i];
            var position = proposedImages[i];

            var filled = fillProposedImage( position, image );

            filled.then( function(){

                filledCount++;
                checkFilled();

            });

        }

    }

    function checkFilled(){

        console.fs('=-=-=-=-=-=-=-=-=-=-=-=-###############################################################################');
        console.fs( "needToFill : " + needToFill );
        console.fs( "filledCount : " + filledCount );

        if( needToFill == filledCount ){

            ProposedTemplate.findOne( { _id: proposedTemplateID } ).deepPopulate('ProposedImages ProposedImages.bitmap ProposedImages.bitmap.ProjectImage').exec( function( err, updatedTemplate ){

                if( err ){


                }else {

                    defer.resolve( updatedTemplate );

                }

            });

        }

    };

    return defer.promise;

};

UserPageController._swapPhoto = function( userPageID, proposedImageID, projectImage ){

    console.fs( userPageID );
    console.fs( proposedImageID );
    console.fs( projectImage );

    var def = Q.defer();

    UserPage.findOne({ _id : userPageID}).deepPopulate('UsedImages UsedImages.ProjectImage ProposedTemplate ProposedTemplate.ProposedImages').exec( function( err, userPage ){

        if( err ){

            console.fs('tutaj blad');
            console.fs( err );

        }else {

            if( userPage.UsedImages.length == 0 ){

                ProposedImage.findOne( { _id : proposedImageID }, function( err, proposedImage ){

                    if( err ){

                        console.fs('a moze tu');
                        console.fs( err );

                    }else {

                        var scale = proposedImage.size.width/projectImage.width;

                        if( proposedImage.size.height > projectImage.height*scale ){

                            scale = proposedImage.size.height/projectImage.height;

                        }

                        var dataForBitmap = {

                            ProjectImage : projectImage._id,
                            scaleX : scale,
                            scaleY : scale,
                            x : proposedImage.size.width/2,
                            y : proposedImage.size.height/2,
                            order : proposedImage.order,
                            uid : generatorUID(),

                        };

                        var newBitmap = new EditorBitmap( dataForBitmap );
                        newBitmap.save( function( err, savedbitmap ){

                            if( err ){

                                console.fs('a jednak');
                                console.fs( err );

                            }else {

                                userPage.UsedImages.push( savedbitmap );

                                userPage.save( function( err, savedPage ){

                                    if( err ){

                                        console.fs('hmm...');
                                        console.fs( err );

                                    }
                                    else {

                                        def.resolve( savedPage );

                                    }

                                });

                            }

                        });

                    }

                });

            }else {

                //userPage.swapPhoto();


            }

        }

    });

    return def.promise;

}


UserPageController.prototype.swapPhoto = function(){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on('UserPage.swapPhoto', function( data ){

        UserPage.findOne({ _id : data.userPageID}).deepPopulate('UsedPhoto').exec( function( err, userPage ){

            if( err ){

                console.fs( err );

            }else {

                if( userPage.UsedImages.length == 0 ){

                    var dataForBitmap = {

                        ProjectImage : data.newPhotoData.ProjectImage,
                        scaleX : data.newPhotoData.scaleX,
                        scaleY : data.newPhotoData.scaleY,
                        x : data.newPhotoData.x,
                        y : data.newPhotoData.y,
                        order : data.order,
                        uid : generatorUID(),

                    };

                    console.fs( dataForBitmap );
                    console.fs('jest swapphoto ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

                    var newBitmap = new EditorBitmap( dataForBitmap );
                    newBitmap.save( function( err, savedbitmap ){

                        if( err ){

                            console.fs( err );

                        }else {

                            userPage.UsedImages.push( savedbitmap );

                            userPage.save( function( err, savedPage ){

                                if( err ){

                                    console.fs( err );

                                }
                                else {

                                    console.fs( savedPage );
                                    console.fs(")()()()()()()()()()()()()()()(");

                                }

                            });

                        }

                    });


                }else {

                    var dataForBitmap = {

                        ProjectImage : data.newPhotoData.ProjectImage,
                        scaleX : data.newPhotoData.scaleX,
                        scaleY : data.newPhotoData.scaleY,
                        x : data.newPhotoData.x,
                        y : data.newPhotoData.y,
                        order : data.order,
                        uid : generatorUID(),

                    };

                    console.fs( dataForBitmap );
                    console.fs('jest swapphoto ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

                    var newBitmap = new EditorBitmap( dataForBitmap );
                    newBitmap.save( function( err, savedbitmap ){

                        if( err ){

                            console.fs( err );

                        }else {

                            userPage.UsedImages.push( savedbitmap );

                            userPage.save( function( err, savedPage ){

                                if( err ){

                                    console.fs( err );

                                }
                                else {

                                    console.fs( savedPage );
                                    console.fs(")()()()()()()()()()()()()()()(");

                                }

                            });

                        }


                    });

                }

                console.fs( userPage );
                console.fs('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');

            }


        });

    });

}


UserPageController.prototype.useTemplate = function(){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on('UserPage.useTemplate', function( data ){


        UserPage.findOne({ _id : data.userPageID }).deepPopulate('UsedImages').exec( function( err, userPage ){

            if( err ){

                console.fs( err );

            }else {

                var cloningProposedTemplate = ProposedTemplateController._clone( data.templateID );
                cloningProposedTemplate.then( function( newProposedTemplate ){

                    //var fillingProposedImages = _this._fillProposedPositions( newProposedTemplate._id, newProposedTemplate.ProposedImages, userPage.UsedImages );

                    //fillingProposedImages.then( function( updatedTemplate ){

                    userPage.ProposedTemplate = newProposedTemplate;

                    userPage.save( function( err, savedPage ){

                        var data = newProposedTemplate;

                        socket.emit( 'UserPage.useTemplate', data );

                    });

                    //});

                });

            }

        });

    });

};

UserPageController.prototype.rotateUsedImage = function(  ){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on('UserPage.rotateUsedImage', function( data ){


        EditorBitmap.findOne( { _id : data.imageID } ).deepPopulate('ProjectImage').exec( function( err, bitmap ){

            if( err ){

                console.fs( err );

            }else {

                ProposedImage.findOne( { _id : data.proposedPositionID }, function( err, proposedImage ){

                    if( err ){

                        console.fs( err );

                    }else {

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

                                socket.emit( 'UserPage.rotateUsedImage', data );

                            }

                        });


                    }

                });

            }

        });

    });

};


UserPageController.prototype.addPhoto = function(){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on('UserPage.addPhoto', function( data ){

        var projectID = data.projectID;
        var projectImageUID = data.projectImageUID;

        UserPage.findOne( { _id: data.userPageID } ).deepPopulate( 'ThemePage ThemePage.proposedTemplates ThemePage.proposedTemplates.ProposedImages ProposedTemplate' ).exec( function( err, userPage ){

            if( err ){

                console.fs( err );

            }else {

                var posibleTemplates = _.filter( userPage.ThemePage.proposedTemplates, function( template ){

                    return ( template.imagesCount == userPage.ProposedTemplate.imagesCount+1 && template.textsCount == userPage.ProposedTemplate.textsCount );

                });

                var nextTemplate = posibleTemplates[0];

                userPage.ProposedTemplateFrom = posibleTemplates[0];

                ProposedTemplateController.clone( posibleTemplates[0] ).then(

                    // ok
                    function( cloned ){

                        ProposedTemplateController.useDataFromOther( cloned._id, userPage.ProposedTemplate._id ).then(

                            //ok
                            function( ok ){

                                userPage.ProposedTemplate = ok;

                                userPage.save( function( err, saved ){

                                    if( err ){

                                        console.fs( err );

                                    }else {

                                        ProposedTemplate.findOne({ _id: ok }).deepPopulate('ProposedImages').exec( function( err, template ){

                                            if( err ){

                                                console.fs( err );

                                            }else {

                                                var imagePosition = null;

                                                for( var i=0; i< template.ProposedImages.length; i++ ){

                                                    if( !template.ProposedImages[i].objectInside ){

                                                        imagePosition = template.ProposedImages[i];
                                                        break;

                                                    }

                                                }

                                                if( imagePosition ){

                                                    ProposedImageController._changeImage(  imagePosition._id, projectImageUID ).then(

                                                        //ok
                                                        function( image ){

                                                            ProjectImageController._addedToProject( projectImageUID, projectID ).then(

                                                                // ok
                                                                function( updatedImage ){

                                                                    var imageInfo = {};
                                                                    imageInfo[ updatedImage.uid ] = updatedImage.projectUsed[projectID];

                                                                    data.projectImage = updatedImage;
                                                                    socket.emit( 'UserProject.getProjectImagesUseNumber', imageInfo );

                                                                }

                                                            );

                                                            UserPageController.prepareScene( saved._id ).then(

                                                                // ok
                                                                function( preparedScene ){

                                                                    socket.emit( socketName+'.swapTemplate', preparedScene );

                                                                }

                                                            );

                                                        }

                                                    );

                                                }

                                            }

                                        });

                                        /*

                                        */

                                    }

                                });

                            }

                        );

                    }

                );


            }

        });

    });

}



UserPageController.changeProposedTemplate = function( userPageID, proposedTemplateID, projectID, socket ){

    var def = Q.defer();

    UserPage.findOne({_id : userPageID }).deepPopulate('UsedImages UsedImages.ProjectImage').exec( function( err, userPage ){

        if( err ){

            console.fs( err );

        }else {

            ProposedTemplate.findOne( { _id : proposedTemplateID } ).deepPopulate('ProposedImages ProposedTexts').exec( function( err, proposedTemplate ){

                if( err ){

                    console.fs( err );

                }
                else {

                    UserPage.findOne( { _id : userPageID }).deepPopulate('UsedImages UsedTexts').exec( function( err, userPage ){

                        if( err ){

                            console.fs( err );

                        }else {

                            if( userPage.UsedImages.length == 0 && userPage.UsedTexts.length == 0 ){

                                userPage.addedTexts = 0;

                                var newTextsArray = [];

                                function check(){

                                    if( userPage.UsedTexts.length == proposedTemplate.ProposedTexts.length ){

                                        userPage.ProposedTemplate = proposedTemplate;

                                        userPage.save( function( err, savedPage ){

                                            if( err ){

                                                console.fs( err );

                                            }else {

                                                UserPage.findOne( { _id : userPageID }).deepPopulate('UsedImages UsedImages.ProjectImage UsedTexts ProposedTemplate ProposedTemplate.ProposedTexts ProposedTemplate.ProposedImages').exec( function( err, userPage ){

                                                    if( err ){

                                                        console.fs( err );

                                                    }else {


                                                        def.resolve( userPage );

                                                    }

                                                });

                                            }

                                        });

                                    }

                                };

                                for( var i=0; i < proposedTemplate.ProposedTexts.length;i++){

                                    userPage.addedTexts++
                                    var addedText = new EditorText();
                                    addedText.order = proposedTemplate.ProposedTexts[ i ].order;
                                    addedText.save( function( err, savedText ){

                                        userPage.UsedTexts.push( savedText );
                                        check();

                                    });

                                }

                                check();


                            }
                            else {

                                function checkDone(){

                                    if( removedImages == imagesToRemove ){

                                        console.log('TEXTS INFO: ' + removedTexts + "/" + textsToRemove);

                                        if( neededImages < currentUsedImages ){

                                            if( neededImages == updatedImages && addedTexts == textsToAdd && removedTexts == textsToRemove ){

                                                userPage.UsedImages = usedImages;
                                                userPage.UsedTexts = usedTexts;
                                                userPage.ProposedTemplate = proposedTemplate;
                                                userPage.addedTexts = usedTexts.length;

                                                userPage.save( function( err, savedPage ){

                                                    if( err ){

                                                        console.fs( err );

                                                    }else {

                                                        UserPage.findOne( { _id : userPageID }).deepPopulate('UsedImages UsedImages.ProjectImage UsedTexts ProposedTemplate ProposedTemplate.ProposedTexts ProposedTemplate.ProposedImages').exec( function( err, userPage ){

                                                            if( err ){

                                                                console.fs( err );

                                                            }else {

                                                                def.resolve( userPage );


                                                            }

                                                        });

                                                    }

                                                });

                                            }

                                        }else {

                                            if( updatedImages == currentUsedImages && addedTexts == textsToAdd && removedTexts == textsToRemove ){

                                                userPage.UsedImages = usedImages;
                                                userPage.UsedTexts = usedTexts;
                                                userPage.ProposedTemplate = proposedTemplate;

                                                userPage.save( function( err, savedPage ){

                                                    if( err ){

                                                        console.fs( err );

                                                    }else {

                                                        UserPage.findOne({ _id : userPageID }).deepPopulate('ProposedTemplate ProposedTemplate.ProposedImages UsedImages UsedImages.ProjectImage').exec( function( err, lastStepUserPage ){

                                                            if( err ){

                                                                console.fs( err );

                                                            }else {

                                                                def.resolve( lastStepUserPage );

                                                            }

                                                        });

                                                    }

                                                });

                                            }

                                        }

                                    }

                                }

                                var neededTexts = proposedTemplate.ProposedTexts.length;
                                var neededImages = proposedTemplate.ProposedImages.length;
                                var updatedTexts = 0;
                                var textsToUpdate = proposedTemplate.ProposedTexts.length;
                                var currentUsedImages = userPage.UsedImages.length;
                                var currentUsedTexts = userPage.UsedTexts.length;

                                var usedTexts = userPage.UsedTexts;
                                var usedImages = userPage.UsedImages;
                                var proposedTexts = proposedTemplate.ProposedTexts;
                                var proposedImages = proposedTemplate.ProposedImages;

                                var imagesToRemove = ( currentUsedImages - neededImages <= 0 ) ? (0) : ( currentUsedImages - neededImages );
                                var textsToAdd = ( neededTexts - currentUsedTexts <= 0 ) ? ( 0 ) : ( neededTexts - currentUsedTexts );
                                var removedImages = 0;
                                var updatedImages = 0;
                                var addedTexts = 0;
                                var textsToRemove = ( currentUsedTexts - neededTexts <= 0 ) ? (0) : ( currentUsedTexts - neededTexts );
                                var removedTexts = 0;

                                usedTexts = _.sortBy( usedTexts, 'order');
                                usedImages = _.sortBy( usedImages, 'order');
                                proposedTexts = _.sortBy( proposedTexts, 'order' );
                                proposedImages = _.sortBy( proposedImages, 'order' );

                                // aktualizacja bitmap
                                for( var i=0; i< proposedImages.length; i++ ){

                                    if( usedImages[i] ){

                                        var image = usedImages[i];
                                        image.order = proposedImages[i].order;

                                        image.save( function( err, saved ){

                                            if( err ){

                                                console.fs( err );

                                            }else {

                                                updatedImages++;
                                                checkDone();

                                            }

                                        });

                                    }

                                }

                                // usuniecie zbyt duzej ilości bitmap
                                for( var i=proposedTemplate.ProposedImages.length; i < usedImages.length; i++){

                                    usedImages[i].remove( function( err, removed ){

                                        if( err ){

                                            console.fs( err );

                                        }else {

                                            removedImages++;
                                            checkDone();
                                            ProjectImageController._removedFromProject( removed.ProjectImage, projectID ).then(

                                                function ( info ){

                                                    console.log('no przeciez leciiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii');
                                                    var removeInfo = {};
                                                    removeInfo[ info.uid ] = info.projectUsed[ projectID ];

                                                    console.log( socket );

                                                    socket.emit( 'UserProject.getProjectImagesUseNumber', removeInfo );

                                                }

                                            );

                                        }

                                    });

                                }

                                // jezeli jest za malo tekstow trzeba je dodac
                                if( textsToAdd ){

                                    for( var i=0; i < textsToAdd; i++ ){

                                        var addedText = new EditorText();
                                        addedText.order = proposedTemplate.ProposedTexts[ i + currentUsedTexts ].order;
                                        addedText.save( function( err, savedText ){

                                            addedTexts++;
                                            usedTexts.push( addedText );
                                            checkDone();

                                        });

                                    }

                                }

                                if( textsToRemove ){

                                    for( var i=proposedTemplate.ProposedTexts.length; i < usedTexts.length; i++ ){

                                        usedTexts[i].remove( function( err, removedText ){

                                            if( err ){

                                                console.fs( err );

                                            }else {

                                                removedTexts++;
                                                checkDone();

                                            }

                                        });

                                    }

                                }

                                usedTexts = usedTexts.slice( 0, proposedTexts.length );
                                usedImages = usedImages.slice(0, proposedImages.length );

                                for( var i=0; i < proposedTexts.length; i++){

                                    if( usedTexts[i] ){

                                        usedTexts[i].order = proposedTexts[i].order;
                                        usedTexts[i].save( function( err, removed ){

                                            updatedTexts++;
                                            checkDone();

                                        });

                                    }

                                }

                            }

                        }

                    });

                }

            });

        }

    });

    return def.promise;

};


UserPageController.prototype.removeUsedImage = function(){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on('UserPage.removeUsedImage', function( data ){

        var usedImageID = data.imageID;

        UserPage.findOne({ _id : data.userPageID }).deepPopulate('ProposedTemplate ProposedTemplate.ProposedImages ThemePage ThemePage.proposedTemplates ThemePage.proposedTemplates.ProposedTexts ThemePage.proposedTemplates.ProposedImages UsedImages UsedImages.ProjectImage').exec( function( err, userPage ){

            if( err ){

                console.fs( err );

            }else {

                var usedImages = _.filter( userPage.UsedImages, function( image ){

                    return ( image._id.toString() != usedImageID );

                });

                var imageToRemove = _.find( userPage.UsedImages, function( image ){

                    return ( image._id.toString() == usedImageID );

                });

                userPage.UsedImages = usedImages;

                var template = _.find( userPage.ProposedTemplate.ProposedImages, function( pimage ){

                    return ( pimage.order == imageToRemove.order );

                } );

                data.proposedImageID = template._id;

                userPage.save( function( err, userPage ){

                    if( err ){

                        console.fs( err );

                    }else {

                        EditorBitmap.find({ _id : usedImageID }).remove().exec( function( err, bitmap ){

                            if( err ){

                                console.fs( err );

                            }else {

                                ProjectImageController._removedFromProject( imageToRemove.ProjectImage._id, data.projectID ).then( function( info ){

                                    var removeInfo = {};
                                    removeInfo[ info.uid ] = info.projectUsed[ data.projectID ];

                                    socket.emit( 'UserProject.getProjectImagesUseNumber', removeInfo );
                                    socket.emit('UserPage.removeUsedImage', data );

                                });

                            }

                        });

                    }

                });

            }

        });

    });

}



UserPageController.prototype.removeProposedImageAndPosition = function(){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on('UserPage.removeProposedImageAndPosition', function( data ){

        var usedImageID = data.imageID;
        var userPageID = data.userPageID;
        var projectID = data.projectID;

        UserPage.findOne({ _id : data.userPageID }).deepPopulate('ProposedTemplate ProposedTemplate.ProposedImages ThemePage ThemePage.proposedTemplates ThemePage.proposedTemplates.ProposedTexts ThemePage.proposedTemplates.ProposedImages UsedImages UsedImages.ProjectImage').exec( function( err, userPage ){

            if( err ){

                console.fs( err );

            }else {

                var usedImages = _.filter( userPage.UsedImages, function( image ){

                    return ( image._id.toString() != usedImageID );

                });

                var imageToRemove = _.find( userPage.UsedImages, function( image ){

                    return ( image._id.toString() == usedImageID );

                });

                userPage.UsedImages = usedImages;

                var template = _.find( userPage.ProposedTemplate.ProposedImages, function( pimage ){

                    return ( pimage.order == imageToRemove.order );

                } );

                data.proposedImageID = template._id;

                userPage.save( function( err, userPage ){

                    if( err ){

                        console.fs( err );

                    }else {

                        EditorBitmap.find({ _id : usedImageID }).remove().exec( function( err, bitmap ){

                            if( err ){

                                console.fs( err );

                            }else {

                                ProjectImageController._removedFromProject( imageToRemove.ProjectImage._id, projectID ).then( function( info ){

                                    var removeInfo = {};
                                    removeInfo[ info.uid ] = info.projectUsed[ projectID ];

                                    socket.emit( 'UserProject.getProjectImagesUseNumber', removeInfo );

                                    UserPage.findOne({ _id: userPageID }).deepPopulate('ThemePage ThemePage.proposedTemplates ThemePage.proposedTemplates.ProposedTexts ThemePage.proposedTemplates.ProposedImages ProposedTemplate UsedImages UsedTexts').exec( function( err, userPage ){

                                        if( err ){

                                            console.fs( err );

                                        }else {

                                            var templates = _.filter( userPage.ThemePage.proposedTemplates, function( template ){

                                                return ( template.textsCount == userPage.ProposedTemplate.textsCount && template.imagesCount == userPage.ProposedTemplate.imagesCount-1 );

                                            });

                                            if( templates.length == 0 ){

                                               UserPageController._complexProposedTemplateChange( userPage._id, userPage.proposedTemplate ).then( function( data ){

                                                    socket.emit( socketName+'.removeProposedImage', data );

                                                });

                                            }else {

                                                userPage.ProposedTemplate = templates[0];

                                                userPage.save( function( err, userPage ){

                                                    if( err ){

                                                        console.log( err );

                                                    }else {

                                                        UserPageController._complexProposedTemplateChange( userPage._id, templates[0] ).then( function( data ){

                                                            socket.emit( socketName+'.removeProposedImage', data );

                                                        });

                                                    }

                                                });

                                            }

                                        }

                                    });


                                });

                            }

                        });

                    }

                });

            }

        });

    });

}

UserPageController.prototype.setProposedTemplate = function(){


    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on('UserPage.setProposedTemplate', function( data ){

        var template = data.proposedTemplateID;
        var userPageID = data.userPageID;
        var projectID = data.projectID;

        UserPage.findOne({ _id : userPageID }).deepPopulate('ProposedTemplate ThemePage ThemePage.proposedTemplates ThemePage.proposedTemplates.ProposedTexts ThemePage.proposedTemplates.ProposedImages UsedImages UsedImages.ProjectImage').exec( function( err, userPage ){

            if( err ){

                console.fs( err );

            }else {

                ProposedTemplateController.clone( template ).then(

                    //ok
                    function( cloned ){

                        ProposedTemplateController.useDataFromOther( cloned._id, userPage.ProposedTemplate._id ).then(

                            //ok
                            function( proposedTemplate ){

                                userPage.ProposedTemplateFrom = template;
                                userPage.ProposedTemplate = proposedTemplate;

                                userPage.save( function( err, savedPage ){

                                    if( err ){

                                        console.fs( err );

                                    }else {

                                        UserPageController.prepareScene( savedPage._id ).then(

                                            //ok
                                            function( preparedScene ){

                                                socket.emit( socketName+'.swapTemplate', preparedScene );

                                            }

                                        );

                                    }

                                });

                            }

                        );

                    }

                );

            }

        });

    });

}


UserPageController._swapTemplate = function( userPageID ){

    var def = Q.defer();

    UserPage.findOne({ _id : userPageID }).deepPopulate('ProposedTemplate ThemePage ThemePage.proposedTemplates ThemePage.proposedTemplates.ProposedTexts ThemePage.proposedTemplates.ProposedImages UsedImages UsedImages.ProjectImage').exec( function( err, userPage ){

        if( err ){

            console.fs( err );

        }else {

            var usedImages = userPage.UsedImages;

            var templates = _.filter( userPage.ThemePage.proposedTemplates, function( template ){

                return ( userPage.ProposedTemplate.textsCount == template.textsCount && template.imagesCount == userPage.ProposedTemplate.imagesCount );

            });

            var nextTemplate = null;

            for( var i=0; i < templates.length; i++ ){

                if( templates[i]._id.toString() == userPage.ProposedTemplateFrom.toString() ){

                    if( i < templates.length-1 ){

                        nextTemplate = templates[ i+1 ];

                    }else {

                        nextTemplate = templates[0];

                    }

                    break;

                }

            }

            if( nextTemplate == null ){

                nextTemplate = templates[0];

            }

            ProposedTemplateController.clone( nextTemplate._id ).then(

                // oko
                function( proposedTemplate ){

                    ProposedTemplateController.useDataFromOther( proposedTemplate._id, userPage.ProposedTemplate._id ).then(

                        //ok
                        function( proposedTemplate ){

                            userPage.ProposedTemplate = proposedTemplate;
                            userPage.ProposedTemplateFrom = nextTemplate._id;

                            userPage.save( function( err, updatedPage ){

                                if( err ){

                                    console.fs( err );

                                }else {

                                    UserPageController.prepareScene( updatedPage._id ).then(

                                        //ok
                                        function( updated ){

                                            def.resolve( updated );

                                        }

                                    );

                                }

                            });

                        }

                    );

                }

            );

        }

    });

    return def.promise;

};

UserPageController.prototype.swapTemplate = function(){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on('UserPage.swapTemplate', function( data ){

        var userPageID = data.userPageID;

        UserPageController._swapTemplate( userPageID ).then(

            // ok
            function( updated ){

                socket.emit( 'UserPage.swapTemplate', updated );

            }

        );

        return;

    });

};

UserPageController._fullFillProposedImages = function( userPageID ){

    var def = Q.defer();

    UserPage.findOne({ _id : userPageID }).deepPopulate('ProposedTemplate ProposedTemplate.ProposedImages UsedImages UsedImages.ProjectImage').exec(function( err, userPage ){

        if( err ){

            console.fs( err );

        }else {

            var imagesToUpdate = 0;
            var updatedImages = 0;

            if ( userPage.UsedImages.length > userPage.ProposedTemplate.ProposedImages.length ){

                imagesToUpdate = userPage.ProposedTemplate.ProposedImages.length;

            }
            else {

                imagesToUpdate = userPage.UsedImages.length;

            }

            function checkDone(){

                if( imagesToUpdate == updatedImages ){

                    def.resolve();

                }

            }

            function updateUsedImage( usedImageID, scale, x, y ){

                var def = Q.defer();

                EditorBitmap.findOne({ _id : usedImageID }, function( err, usedImage ){

                    if( err ){

                        console.fs( err );

                    }else {

                        usedImage.x = x;
                        usedImage.y = y;
                        usedImage.scaleX = scale;
                        usedImage.scaleY = scale;


                        usedImage.save( function( err, updatedImage ){

                            if( err ){

                                console.fs( err );

                            }
                            else {

                                def.resolve();

                            }

                        });

                    }

                });

                return def.promise;

            }

            if( userPage.UsedImages.length >= userPage.ProposedTemplate.ProposedImages.length ){

                var proposedImages = userPage.ProposedTemplate.ProposedImages;
                proposedImages = _.sortBy( proposedImages, 'order');

                var usedImages = userPage.UsedImages;
                usedImages = _.sortBy( usedImages, 'order' );

                for( var i=0; i < userPage.ProposedTemplate.ProposedImages.length; i++ ){

                    var currentTemplate = proposedImages[i];
                    var currentUsedImage = usedImages[i];
                    var scale = 1;
                    var x = proposedImages[ i ].size.width/2;
                    var y = proposedImages[ i ].size.height/2;

                    if( currentUsedImage.rotation%180 == 90 ){

                        scale = currentTemplate.size.width/currentUsedImage.ProjectImage.height;

                        if( currentTemplate.size.height > currentUsedImage.ProjectImage.width*scale ){

                            scale = currentTemplate.size.height/currentUsedImage.ProjectImage.width;

                        }

                    }else {

                        scale = currentTemplate.size.width/currentUsedImage.ProjectImage.width;

                        if( currentTemplate.size.height > currentUsedImage.ProjectImage.height*scale ){

                            scale = currentTemplate.size.height/currentUsedImage.ProjectImage.height;

                        }

                    }

                    updateUsedImage( currentUsedImage._id, scale, x, y ).then( function(){

                        updatedImages++;
                        checkDone();

                    });


                }

            }else {

                var proposedImages = userPage.ProposedTemplate.ProposedImages;
                proposedImages = _.sortBy( proposedImages, 'order');

                var usedImages = userPage.UsedImages;
                usedImages = _.sortBy( usedImages, 'order' );

                for( var i=0; i < userPage.ProposedTemplate.ProposedImages.length; i++ ){


                	var even = _.find( usedImages, function( elem ){ return elem.order == proposedImages[i].order; });

                    var currentTemplate = proposedImages[i];
                    var currentUsedImage = even;

                    if( currentUsedImage ){

	                    var scale = 1;
	                    var x = proposedImages[ i ].size.width/2;
	                    var y = proposedImages[ i ].size.height/2;

                        if( currentUsedImage.rotation%180 == 90 ){

                            scale = currentTemplate.size.width/currentUsedImage.ProjectImage.height;

                            if( currentTemplate.size.height > currentUsedImage.ProjectImage.width*scale ){

                                scale = currentTemplate.size.height/currentUsedImage.ProjectImage.width;

                            }

                        }else {

                            scale = currentTemplate.size.width/currentUsedImage.ProjectImage.width;

                            if( currentTemplate.size.height > currentUsedImage.ProjectImage.height*scale ){

                                scale = currentTemplate.size.height/currentUsedImage.ProjectImage.height;

                            }

                        }

	                    updateUsedImage( currentUsedImage._id, scale, x, y ).then( function(){

	                        updatedImages++;
	                        checkDone();

	                    });

	                }

                }

            }


        }

        checkDone();

    });

    return def.promise;

};

UserPageController.useDefaultValuesForTemplate = function( userPageID ){

    UserPage.findOne( { _id: userPageID }).deepPopulate('UsedImages UsedImages.ProjectImage ProposedTemplate ProposedTemplate.ProposedImages ProposedTemplate.ProposedTexts ThemePage').exec( function( err, userPage ){

        if( err ){

            console.fs( err );

        }else {

            var proposedImages = userPage.ProposedTemplate.ProposedImages;
            var defaultSettings = userPage.ThemePage.defaultSettings;
            var imagesUpdated = 0;

            if( defaultSettings ){

                for( var i=0; i < proposedImages.length; i++){

                    for( var key in defaultSettings ){

                        proposedImages[i][key] = defaultSettings[key];

                    }

                    if( defaultSettings.proposedImagesOpt ){

                        if( defaultSettings.proposedImagesOpt[i] ){

                            for( var key in defaultSettings.proposedImagesOpt[i] ){

                                proposedImages[i][key] = defaultSettings.proposedImagesOpt[i][key];

                            }

                        }

                    }

                }

            }

            for( var i=0; i < proposedImages.length; i++ ){

                proposedImages[i].save( function( err, saved ){

                    if( err ){

                        console.fs( err );

                    }else {

                        imagesUpdated++;
                        checkDone();
                    }

                });

            }

            function checkDone(){

                if( imagesUpdated == proposedImages.length ){



                }

            }

        }

    });

};

UserPageController.prepareScene = function( userPageID ){

    var def = Q.defer();

    UserPage.findOne( { _id: userPageID }).deepPopulate('UsedImages UsedImages.ProjectImage ProposedTemplate ProposedTemplate.ProposedImages ProposedTemplate.ProposedTexts').exec( function( err, userPage ){

        if( err ){

            console.fs( err );

        }else {

            var scene = {};
            var objectOrder = 0;

            ThemePage.findOne( { _id: userPage.ThemePage } ).deepPopulate('backgroundObjects backgroundObjects.EditorBitmaps backgroundObjects.EditorTexts foregroundObjects.EditorBitmaps foregroundObjects.EditorTexts').exec( function( err, themePage ){

                if( err ){

                    console.fs( err );

                }else {

                    var backgroundObjects = [];
                    var usergroundObjects = [];
                    var foregroundObjects = [];

                    // kopiowanie obiektów z tła
                    for( var i=0 ; i < themePage.backgroundObjects.EditorBitmaps.length; i++ ){

                        var bitmap = themePage.backgroundObjects.EditorBitmaps[i];
                        bitmap.objectType = 'bitmap';
                        backgroundObjects.push( bitmap );

                    }

                    for( var i=0 ; i < themePage.backgroundObjects.EditorTexts.length; i++ ){

                        var text = themePage.backgroundObjects.EditorTexts[i];
                        text.objectType = 'text';
                        backgroundObjects.push( text );

                    }

                    // kopiowanie obiektów z warstwy usera
                    for( var i=0; i < userPage.ProposedTemplate.ProposedImages.length; i++ ){

                        var proposedImage = userPage.ProposedTemplate.ProposedImages[i];
                        proposedImage.objectType = 'proposedImage';
                        usergroundObjects.push( proposedImage );

                    }

                    for( var i=0; i < userPage.ProposedTemplate.ProposedTexts.length; i++ ){

                        var proposedText = userPage.ProposedTemplate.ProposedTexts[i];
                        proposedText.objectType = 'proposedText';
                        usergroundObjects.push( proposedText );

                    }

                    // kopiowanie obiektów z warstwy górnej
                    for( var i=0 ; i < themePage.foregroundObjects.EditorBitmaps.length; i++ ){

                        var bitmap = themePage.foregroundObjects.EditorBitmaps[i];
                        bitmap.objectType = 'bitmap';
                        foregroundObjects.push( bitmap );

                    }

                    for( var i=0 ; i < themePage.foregroundObjects.EditorTexts.length; i++ ){

                        var text = themePage.foregroundObjects.EditorTexts[i];
                        text.objectType = 'text';
                        foregroundObjects.push( text );

                    }

                    backgroundObjects = _.sortBy( backgroundObjects, 'order' );
                    foregroundObjects = _.sortBy( foregroundObjects, 'order' );
                    usergroundObjects = _.sortBy( usergroundObjects, 'order' );

                    var allObjects = backgroundObjects.concat( usergroundObjects.concat( foregroundObjects ) );

                    for( var i=0; i < allObjects.length; i++ ){

                        scene[i] = {

                            order  : i,
                            object : allObjects[i]._id,
                            objectType : allObjects[i].objectType

                        }

                    }

                    userPage.scene = scene;

					console.log('LECI TUTEJ');
                    userPage.save( function( err, savedScene ){

                        if( err ){

                            console.fs( err );

                        }else {

							console.log('SCENA ZAPISANA :)');
                            def.resolve( savedScene );
                            //UserPageController.useDefaultValuesForTemplate( userPageID );

                        }

                    });


                }

            });

        }

    });

    return def.promise;

};

UserPageController._useThemePage = function( userPageID, themePageID ){

    var def = Q.defer();

    UserPage.findOne({ _id : userPageID }).deepPopulate('UsedImages UsedImages.ProjectImage').exec( function( err, userPage ){

        if( err ){

            console.fs( err );

        }else {

            ThemePageController.clone( themePageID ).then(

                // ok
                function( userThemePage ){

                    userPage.ThemePageFrom = themePageID;
                    userPage.ThemePage = userThemePage;

                    ThemePage.findOne({ _id : themePageID }).deepPopulate("proposedTemplates proposedTemplates.ProposedImages proposedTemplates.ProposedTexts").exec( function( err, themePage ){

                        if( err ){

                            console.fs( err );

                        }else {

                            ProposedTemplateController.clone( themePage.proposedTemplates[0]._id ).then(

                                //ok
                                function( clonedTemplate ){

                                    if( userPage.ProposedTemplate ){

                                        ProposedTemplateController.useDataFromOther( clonedTemplate._id.toString(), userPage.ProposedTemplate ).then(

                                            // ok
                                            function( proposedPositionID ){

                                                userPage.ProposedTemplate = proposedPositionID;
                                                userPage.ProposedTemplateFrom = themePage.proposedTemplates[0];

                                                userPage.save( function( err, savedPage ){

                                                    if( err ){

                                                        console.fs( err );

                                                    }else {

                                                        UserPageController.prepareScene( userPage._id ).then(

                                                            // ok
                                                            function( userPage ){

                                                                //console.log( userPage );
                                                                //console.log('strona jest przygotowana');
                                                                def.resolve( userPage );

                                                            },
                                                            //err
                                                            function(){

                                                            }

                                                        );

                                                    }

                                                });

                                            }

                                        );

                                    }else {

                                        userPage.ProposedTemplate = clonedTemplate;
                                        userPage.ProposedTemplateFrom = themePage.proposedTemplates[0];

                                        ProposedTemplateController.setDefaultThemeSettings( clonedTemplate, themePage._id );

                                        userPage.save( function( err, savedPage ){

                                            if( err ){

                                                console.fs( err );

                                            }else {

                                                UserPageController.prepareScene( userPage._id ).then(

                                                    // ok
                                                    function( userPage ){

                                                        //console.log( userPage );
                                                        //console.log('strona jest przygotowana');
                                                        def.resolve( userPage );

                                                    },
                                                    //err
                                                    function(){

                                                    }

                                                );
                                                //def.resolve( savedPage );

                                            }

                                        });


                                    }



                                },

                                // err
                                function( err ){


                                }

                            );

                        }

                    });


                },

                //err
                function(){



                }

            );

        }


    });

    return def.promise;

}

            /*
            if( userPage.UsedImages.length == 0 ){
                ThemePage.findOne({ _id : themePageID }).deepPopulate("backgroundObjects.EditorTexts foregroundObjects.EditorTexts backgroundObjects.EditorBitmaps.ProjectImage foregroundObjects.EditorBitmaps.ProjectImage UsedImages proposedTemplates proposedTemplates.ProposedImages proposedTemplates.ProposedTexts ThemePageFrom").exec( function( err, themePage ){

                    if( err ){

                        console.fs( err );

                    }else {

                        var newProposedTemplate = themePage.proposedTemplates[0];

                        userPage.ProposedTemplate = newProposedTemplate;
                        userPage.ThemePage = themePage;

                        userPage.save( function( err, savedPage ){


                            var data = {

                                themePage : themePage,
                                proposedTemplate : newProposedTemplate,
                                createdFrom : themePage.proposedTemplates[0]._id,
                                usedImages  : userPage.UsedImages

                            }

                            def.resolve( data );

                            //socket.emit( 'UserPage.useThemePage', data );

                        });

                    }

                });

            }else {

                ThemePage.findOne({ _id: themePageID }).populate({
                  path: 'proposedTemplates',
                  match: { imagesCount: userPage.UsedImages.length },
                  select: '_id ProposedImages ProposedTexts'
                }).exec( function( err, themePage ){

                    if( err ){

                        console.fs( err );

                    }
                    else {

                        if( themePage && themePage.proposedTemplates.length > 0 ){

                            var newProposedTemplate = themePage.proposedTemplates[0];

                            ThemePage.findOne({ _id : themePage._id }).deepPopulate("backgroundObjects.EditorTexts foregroundObjects.EditorTexts backgroundObjects.EditorBitmaps.ProjectImage foregroundObjects.EditorBitmaps.ProjectImage UsedImages proposedTemplates proposedTemplates.ProposedImages proposedTemplates.ProposedTexts ThemePageFrom").exec( function( err, themePage ){

                                userPage.ProposedTemplate = newProposedTemplate;
                                userPage.ThemePage = themePage;

                                userPage.save( function( err, savedPage ){

                                    if( err ){

                                        console.fs( err );

                                    }else {

                                        ProposedTemplate.findOne({ _id : newProposedTemplate }).deepPopulate('ProposedImages ProposedTexts').exec(function( err, _proposedTemplate){

                                            var data = {

                                                themePage : themePage,
                                                proposedTemplate : _proposedTemplate,
                                                createdFrom : themePage.proposedTemplates[0]._id,
                                                usedImages  : userPage.UsedImages

                                            }

                                            UserPageController._fullFillProposedImages( userPageID ).then( function(){


                                                UserPage.findOne( { _id: userPageID } ).deepPopulate('UsedImages UsedImages.ProjectImage').exec( function( err, userPage ){

                                                    if( err ){

                                                        console.fs( err );

                                                    }else {

                                                        data.usedImages = userPage.UsedImages;

                                                        //socket.emit( 'UserPage.useThemePage', data );
                                                        def.resolve( data );

                                                    }

                                                });

                                            });



                                        });

                                    }

                                });

                            });

                        }else {

                            ThemePageController._getMinAndMaxProposedImages( themePage._id ).then( function( minMaxInfo ){

                                var withMoreImages = [];
                                var withLessImages = [];

                                console.fs('szuakam najlepszego szablonu');

                                for( var l=0; l < minMaxInfo.list.length; l++ ){


                                    if( minMaxInfo.list[l].imagesCount > userPage.UsedImages.length ){

                                        withMoreImages.push( minMaxInfo.list[l] );

                                    }else if( minMaxInfo.list[l].imagesCount < userPage.UsedImages.length ){

                                        withLessImages.push( minMaxInfo.list[l] );

                                    }

                                }


                                var closestTemplate = null;

                                if( withMoreImages.length > 0 ){

                                    var smallest = withMoreImages[0];

                                    for( var i=1; i < withMoreImages.length;i++ ){

                                        if( smallest.imagesCount > withMoreImages[i].imagesCount ){

                                            smallest = withMoreImages[i];

                                        }

                                    }

                                    closestTemplate = smallest;

                                }else if( withLessImages.length > 0 ){

                                    var bigest = withLessImages[0];

                                    for( var i=1; i < withLessImages.length;i++ ){

                                        if( bigest.imagesCount < withLessImages[i].imagesCount ){

                                            bigest = withLessImages[i];

                                        }

                                    }

                                    closestTemplate = bigest;

                                }
                                else {

                                    console.fs('blad po stronie administratora edytora ( zle skonfigurowany )!!!');
                                    return;

                                }

                                //console.fs( minMaxInfo );
                                //console.fs( closestTemplate );
                                //console.fs('lalala');

                                ThemePage.findOne({ _id : themePage._id }).deepPopulate("backgroundObjects.EditorTexts foregroundObjects.EditorTexts backgroundObjects.EditorBitmaps.ProjectImage foregroundObjects.EditorBitmaps.ProjectImage UsedImages proposedTemplates proposedTemplates.ProposedImages proposedTemplates.ProposedTexts ThemePageFrom").exec( function( err, themePage ){

                                    var usedImages = userPage.UsedImages;
                                    usedImages = _.sortBy( usedImages, 'order' );

                                    userPage.ProposedTemplate = closestTemplate._id;
                                    userPage.ThemePage = themePage;
                                    userPage.UsedImages = usedImages.slice(0, closestTemplate.imagesCount );

                                    userPage.save( function( err, savedPage ){

                                        if( err ){

                                            console.fs( err );

                                        }else {


                                            ProposedTemplate.findOne({ _id : closestTemplate._id }).deepPopulate('ProposedImages ProposedTexts').exec(function( err, _proposedTemplate){

                                                if( closestTemplate.imagesCount < userPage.UsedImages.length ){

                                                    var usedImages = userPage.UsedImages;

                                                    usedImages = _.sortBy( usedImages, 'order' );

                                                }

                                                var data = {

                                                    themePage : themePage,
                                                    proposedTemplate : _proposedTemplate,
                                                    createdFrom : themePage.proposedTemplates[0]._id,
                                                    usedImages  : userPage.UsedImages

                                                }

                                                UserPageController._fullFillProposedImages( userPageID ).then( function(){


                                                    UserPage.findOne( { _id: userPageID } ).deepPopulate('UsedImages UsedImages.ProjectImage').exec( function( err, userPage ){

                                                        if( err ){

                                                            console.fs( err );

                                                        }else {

                                                            data.usedImages = userPage.UsedImages;

                                                            //socket.emit( 'UserPage.useThemePage', data );
                                                            return def.resolve( data );

                                                        }

                                                    });

                                                });


                                            });

                                        }

                                    });

                                });



                            });


                        }

                    }


                });

            }


        }

    });

    return def.promise;

};

*/

UserPageController.prototype.useThemePage = function(){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on('UserPage.useThemePage', function( data ){

        var userPageID = data.userPageID;

        UserPageController._useThemePage( data.userPageID, data.themePageID ).then(

            function( data ){

                data._id = userPageID;
                socket.emit('UserPage.swapTemplate', data );

            }

        );

    });

};

/*
 * Tworzy więcej niż jedną stronę ( Lama )
*/
UserPageController._multiAdd = function( pages ){

    var def = Q.defer();

    var PagesToAdd = pages.length;
    var addedPages = 0;
    var createdPages = [];

    for( var i=0; i < pages.length; i++ ){

        var creatingPage = UserPageController._add( pages[i].order, pages[i].pageValue, pages[i].vacancy );

        creatingPage.then( function( createdPage ){

            addedPages++;
            createdPages.push( createdPage );
            checkDone();

        }, function( err ){

            console.fs( err );

        });

    };

    function checkDone(){

        if( addedPages == PagesToAdd )
            def.resolve( createdPages );

    }

    return def.promise;

};


UserPageController._add = function( order, pageValue, vacancy ){

    var def = Q.defer();

    var newUserPage = new UserPage();
    newUserPage.order = order || 0;
    newUserPage.pageValue = pageValue;
    newUserPage.vacancy = vacancy;

    newUserPage.save(function( err, savedPage ){

        if( err ){

            console.fs( err );
            def.reject('Nastapil error podczas zapisywania strony');

        }
        else {

            def.resolve( savedPage );

        }

    });

    return def.promise;

};

UserPageController.prototype.addBitmap = function(){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on('UserPage.addBitmap', function( data ){

        UserPage.findOne({ _id: data.userPageID}, function( err, userPage ){

            if( err ){

                console.fs( err );

            }
            else {

                ProjectImage.findOne({ _id : data.projectImage.projectImageID }, function(err, _projectImage ){

                    if( err){

                        console.fs( err );

                    }
                    else {

                        var newBitmap = new EditorBitmap();
                        newBitmap.ProjectImage = data.projectImage.projectImageID;
                        newBitmap.x = data.projectImage.x;
                        newBitmap.y = data.projectImage.y;
                        newBitmap.order = data.projectImage.order;
                        newBitmap.uid = generatorUID();
                        newBitmap.width = _projectImage.width;
                        newBitmap.height = _projectImage.height;

                        newBitmap.save( function( err, savedBitmap ){

                            if( err ){

                                console.fs( err );

                            }
                            else {

                                userPage.EditorBitmaps.push( savedBitmap );

                                userPage.save( function( err, _savedPage ){

                                    if( err ){

                                        console.fs( err );

                                    }else {

                                        socket.emit( 'UserPage.addBitmap', savedBitmap );

                                    }

                                });

                            }

                        });

                    }

                });

            }

        });

    });

}

module.exports = UserPageController;
