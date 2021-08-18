var util = require('util');
var Q = require('q');
console.fs = require('../libs/fsconsole.js');

var Controller = require("../controllers/Controller.js");
var ProposedImage = require('../models/ProposedImage.js').model;
var ProposedText = require('../models/ProposedText.js').model;
var ThemePage = require('../models/ThemePage.js').model;
var View = require('../models/View.js').model;
var ThemePageController = require("../controllers/ThemePageController.js");

//var app = require('../app.js');
var conf = require('../confs/main.js');
var mainConf = require('../libs/mainConf.js');

var UserView = require('../models/UserView.js').model;
var UserPageController = require('../controllers/UserPageController.js');
var _ = require('underscore');

//var Generator = generator.Generator;

function UserViewController( controller ) {
	//console.fs(generator());
	this.socket = controller.socket;
	this.io = controller.io;
    //AdminProjectController.super_.call(this);
    this.name = "UserViewController";
    this.socketName = "UserView";
}

util.inherits(UserViewController, Controller);

UserViewController.clone = function( id ){

	var def = Q.defer();

	UserView.findOne({_id: id}).exec( function( err, view ){

		if( err ){
			console.log( err );
		}else {

			var pages = [];

			function clonePages( pageIndex ){
				console.log('KLONOWANIE STRONY: ' + pageIndex );
				if( view.Pages[pageIndex] ){

					UserPageController.clone( view.Pages[pageIndex] ).then(
						function( page ){

							console.log('STRONA SKOPIOWANA I LECI ITERACJA');
							pages.push( page );
							clonePages( pageIndex+1 );

						}
					);

				}else {


					var newView = view;
					delete newView._id;

					newView = new UserView( newView );
					newView.Pages = pages;
					newView.save( function( err, saved ){

						def.resolve( saved );

					});

				}

			}

			clonePages( 0 );

		}

	});

	return def.promise;

};

UserViewController._renderPreview = function( viewID, projectID ){

    /*
    var c = new Canvas(980, 580);
    var ctx = c.getContext('2d');

    //Create graphics object
    var g = new createjs.Graphics();
    var shape = new createjs.Shape(g);

    //Draw a circle
    g.setStrokeStyle(8)
    .beginStroke("#F0F")
    .beginRadialGradientFill(["#FF0","#00F"],[0,1],100,200,0,100,200,40)
    .drawCircle(100,200,40);

    //Add the item to our stage, and call .tick(); to draw the object.
    var stage = new createjs.Stage(c);
    stage.addChild(shape);
    stage.tick();

    //Create a PNG file.


    var folderDest = conf.staticDir + 'usersProjects/' + projectID +'/';
    mainConf.mkdir(folderDest);

    fs.writeFile( folderDest + '/test.png', c.toBuffer(), function() {
        createjs.Ticker.halt();
    });

    console.fs( folderDest );

    /*
                saved.url = 'http://digitalprint.pro:'+conf.staticPath+ '/'+ folderType +'/' + saved.userID + '/' + saved.date + '/' + folderNumber + '/' + saved._id + saved.ext;
                saved.folderNumber = folderNumber;
                saved.save(function(err, saved2){
                    if( err ){
                        console.fs(err);
                    } else {
                        //console.fs('Koniec zapisu!');
                        //console.fs(saved2);
                        //var thumbDest = folderDest + 'thumb_' + saved._id + saved.ext;
                        saveUserThumb( req, res, folderType, folderDest, saved2 );
                        //res.send(saved2);
                    }
                });
            }
    */

};


UserViewController._add = function( order, adminView, pages ){

    var def = Q.defer();

    View.findOne( { _id : adminView }, function( err, view ){

        if( err ){

            console.fs( err );

        }else {

            var newUserView = new UserView();
            newUserView.order = order;
            newUserView.adminView = adminView;
            newUserView.repeatable = view.repeatable;
            //newUserView.Pages = createdPages;

            newUserView.save( function( err, savedUserView ){

                if( err ){

                    console.fs( err );

                }else {

                    if( pages ){

                        var creatingPages = UserPageController._multiAdd( pages );

                        creatingPages.then( function( createdPages ){

                            newUserView.Pages = createdPages;

                            newUserView.save( function( err, savedView ){


                                def.resolve( savedView );

                            });

                        }, function( err ){

                            console.fs( err );

                        });

                    }

                }

            });

        }

    });

    return def.promise;

};

UserViewController._reorder = function( viewID, newOrder ){

    var def = Q.defer();

    UserView.findOne({ _id : viewID }, function( err, userView ){

        if( err ){

            console.fs( err );

        }else {

            userView.order = newOrder;

            userView.save( function( err, userView ){

                if( err ){

                    console.fs( err );

                }else {

                    var viewInfo = {

                        viewID : userView._id,
                        order  : userView.order

                    };

                    def.resolve( viewInfo );

                }

            });

        }

    });

    return def.promise;

};

UserViewController.prototype.get = function(){

    var socketName = this.socketName;
    var socket = this.socket;

		console.log( socketName + ".get");

    socket.on(socketName+'.get', function(data){

        var evtID = data.evtID;

        UserView.findOne({ _id: data.userViewID}).deepPopulate("adminView adminView.Pages Pages Pages.ProposedTemplate Pages.ProposedTemplate.ProposedImages Pages.ProposedTemplate.ProposedImages Pages.ProposedTemplate.ProposedTexts").exec( function( err, userView ){

            if( err ){

                console.fs( err );

            }else {

                ThemePage.findOne( { _id : userView.Pages[0].ThemePage }).deepPopulate("proposedTemplates backgroundObjects.EditorTexts backgroundObjects.EditorBitmaps backgroundObjects.EditorBitmaps.ProjectImage foregroundObjects.EditorBitmaps foregroundObjects.EditorTexts foregroundObjects.EditorBitmaps.ProjectImage").exec( function( err, themePage ){

                    if( err ){

                        console.fs( err );

                    }
                    else {

                        var _userView = userView.toJSON();

                        _userView.Pages[0].ThemePage = (themePage) ? (themePage.toJSON()):(null);

                        if( _userView.Pages[0].ProposedTemplate ){

                            _userView.Pages[0].ProposedTemplate.options = {

                                canAddOneMoreText  : ThemePageController.hasTemplateWith( _userView.Pages[0].ThemePage, _userView.Pages[0].ProposedTemplate.imagesCount, _userView.Pages[0].ProposedTemplate.textsCount+1 ),
                                canAddOneMoreImage : ThemePageController.hasTemplateWith( _userView.Pages[0].ThemePage, _userView.Pages[0].ProposedTemplate.imagesCount+1, _userView.Pages[0].ProposedTemplate.textsCount ),
                                canRemoveOneImage  : ThemePageController.hasTemplateWith( _userView.Pages[0].ThemePage, _userView.Pages[0].ProposedTemplate.imagesCount-1, _userView.Pages[0].ProposedTemplate.textsCount ),
                                canRemoveOneText   : ThemePageController.hasTemplateWith( _userView.Pages[0].ThemePage, _userView.Pages[0].ProposedTemplate.imagesCount, _userView.Pages[0].ProposedTemplate.textsCount-1 ),
                                canSwapTemplate    : ThemePageController.hasTemplateWith( _userView.Pages[0].ThemePage, _userView.Pages[0].ProposedTemplate.imagesCount, _userView.Pages[0].ProposedTemplate.textsCount ),

                            };

                        }

                        var scene = _userView.Pages[0].scene;

                        var objectsInScene = 0;
                        var populatedObjects = 0;

                        function checkPopulated(){

							console.log( objectsInScene + " / " + populatedObjects );

                            if( objectsInScene == populatedObjects ){

                                if( themePage ){

                                    ThemePageController._getFonts(  userView.Pages[0].ThemePageFrom ).then(

                                        // ok
                                        function( fonts ){

                                            _userView.Pages[0].fonts = fonts;
                                            _userView.Pages[0].scene = scene;
                                            socket.emit( socketName + '.get', { view: _userView, evtID: evtID } );

                                        }

                                    );

                                }else {

                                    _userView.Pages[0].scene = scene;
                                    socket.emit( socketName + '.get', { view: _userView, evtID: evtID } );

                                }

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
														console.log('POPULOWANIE');
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

                                

                            }

                            return def.promise;

                        }

                    }

                });

            }

        });

    });

};

console.fs(UserViewController);

module.exports = UserViewController;
