var util = require('util');
var Q = require('q');
console.fs = require('../libs/fsconsole.js');

var UserProjectController = require("../controllers/UserProjectController.js");
var UploadController = require("../controllers/UploadController.js");
var Controller = require("../controllers/Controller.js");
var User = require('../models/User.js').model;
var UserProject = require('../models/UserProject.js').model;
var ComplexUserProject = require('../models/ComplexUserProject.js').model;
var ThemePage = require('../models/ThemePage.js').model;
var UserFolder = require('../models/UserFolder.js').model;
//var app = require('../app.js');
var conf = require('../confs/main.js');
var mainConf = require('../libs/mainConf.js');

var jwt = require('jsonwebtoken');
var jwt_secret = mainConf.jwt_secret;

var _ = require('underscore');
var passwordHash = require('password-hash');

//var Generator = generator.Generator;

function UserController( controller ) {

	//console.fs(generator());
	this.socket = controller.socket;
	this.io = controller.io;
    //AdminProjectController.super_.call(this);
    this.name = "UserController";
    this.socketName = "User";

};

util.inherits(UserController, Controller);


UserController._createProject = function( userID, typeID, formatID, pages, attributes ){

    var def = Q.defer();

    var addUserProject = UserProjectController._add( typeID, formatID, pages, attributes );

    addUserProject.then(

        function( userProject ){

            User.findOne( { 'userID' : userID }, function( err, foundUser ){

                foundUser.Projects.push( userProject );
                foundUser.save( function( err, updatedUser ){

                    if( err ){

                        console.log( err );
                        def.reject('error wystapil');

                    } else {

                        def.resolve( userProject );

                    }

                });

            });

        },

        function( err ){

            def.reject('error wystapil');

        }

    );

    return def.promise;

};


UserController.prototype.loadProject = function(){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on( socketName+'.loadProject', function( data ){

        ComplexUserProject.findOne({ _id : data.projectID }).deepPopulate('mainTheme, mainTheme.ThemePages,mainTheme.MainTheme, mainTheme.MainTheme.ProjectMasks, mainTheme.MainTheme.ProjectBackgrounds, mainTheme.MainTheme.ProjectCliparts, projects.Format projects.Format.Themes projects.Views projects.Views.Pages projects.Views.Pages.ProposedTemplate projects.Views.Pages.ProposedTemplate.ProposedImages projects.Views.Pages.ProposedTemplate.ProposedTexts projects.Views.Pages.EditorBitmaps projects.Views.Pages.EditorBitmaps.ProjectImage projects.Views.EditorTexts projectImages projects.Views.adminView projects.Views.adminView.Pages').exec( function( err, userProject ){

            socket.emit( socketName+'.loadProject', userProject );

        });

    });

};


UserController.prototype.getFullProject = function(){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on( socketName+'.getFullProject', function( data ){

        UserProject.findOne({ _id : data.userProject }).deepPopulate('Format Format.Themes Views Views.Pages Views.Pages.EditorBitmaps Views.Pages.EditorBitmaps.ProjectImage Views.Pages.ProposedTemplate Views.Pages.ProposedTemplate.ProposedTexts Views.Pages.ProposedTemplate.ProposedImages Views.EditorTexts projectImages').exec( function( err, userProject ){

            if( err ){

                console.fs( err );

            }
            else {

                socket.emit( socketName + '.getFullProject', userProject );

            }

        });

    });

}

UserController.createProjectFromImages = function(  token, typeID, formatID, pages, attributes, images ){

	var def = Q.defer();
	var decodedToken = jwt.decode( token, jwt_secret, 'HS256');

	if( decodedToken.userEditorID ){

			User.findOne( { userID :decodedToken.userEditorID }, function( err, user ){

					if( err ){

							console.fs( err );

					}else {

							if( user ){

									GLOBAL.sessions[token] = user.userID;
									console.log('JEST TAKI USER 1');

							}else {

									console.log('Niema takiego USER 1');
									var newUser = new User( { userID: decodedToken.userEditorID } );
									newUser.save( function( err, ok ){

											if( err ){

													console.log( err );

											}else {

													GLOBAL.sessions[token] = ok.userID;

											}

									});

							}

					}

			});

	}else if( decodedToken.userID ) {

			User.findOne( { userID :decodedToken.userID }, function( err, user ){

					if( err ){

							console.fs( err );

					}else {

							if( user ){

									GLOBAL.sessions[token] = user.userID;

							}else {

									var newUser = new User( { userID: decodedToken.userID } );
									newUser.save( function( err, ok ){

											if( err ){

													console.log( err );

											}else {

													var token = data.token;
													GLOBAL.sessions[token] = ok.userID;

											}

									});

							}

					}

			});

	}

	var creatingProject = UserController._createProject( GLOBAL.sessions[token], typeID, formatID, pages, attributes );

			creatingProject.then(

					function( userProject ){

							UserProject.findOne({ _id : userProject._id}).deepPopulate('Format Format.Themes Views Views.Pages Views.Pages.ProposedTemplate Views.Pages.ProposedTemplate.ProposedImages Views.Pages.ProposedTemplate.ProposedTexts Views.Pages.EditorBitmaps Views.Pages.EditorBitmaps.ProjectImage Views.EditorTexts projectImages').exec( function( err, userProject ){

									if( err ){

											console.fs( err );

									}
									else {

											userProject.projectImages = images;
											userProject.save( function( err, saved ){

													if( err ){
															console.log( err );
													}else {

															console.log('UDALO SIE:)');
															def.resolve( saved );

													}
											});

									}

							});

					},
					function( err ){

							console.fs( err );

					}

			);

	return def.promise;

}

UserController._addProject = function( token, typeID, formatID, pages, attributes, folder ){

    var def = Q.defer();

    var decodedToken = jwt.decode( token, jwt_secret, 'HS256');

    if( decodedToken.userEditorID ){

        User.findOne( { userID :decodedToken.userEditorID }, function( err, user ){

            if( err ){

                console.fs( err );

            }else {

                if( user ){

                    GLOBAL.sessions[token] = user.userID;
                    console.log('JEST TAKI USER 1');

                }else {

                    console.log('Niema takiego USER 1');
                    var newUser = new User( { userID: decodedToken.userEditorID } );
                    newUser.save( function( err, ok ){

                        if( err ){

                            console.log( err );

                        }else {

                            GLOBAL.sessions[token] = ok.userID;

                        }

                    });

                }

            }

        });

    }else if( decodedToken.userID ) {

        User.findOne( { userID :decodedToken.userID }, function( err, user ){

            if( err ){

                console.fs( err );

            }else {

                if( user ){

                    GLOBAL.sessions[token] = user.userID;

                }else {

                    var newUser = new User( { userID: decodedToken.userID } );
                    newUser.save( function( err, ok ){

                        if( err ){

                            console.log( err );

                        }else {

                            var token = data.token;
                            GLOBAL.sessions[token] = ok.userID;

                        }

                    });

                }

            }

        });

    }





    var creatingProject = UserController._createProject( GLOBAL.sessions[token], typeID, formatID, pages, attributes );

        creatingProject.then(

            function( userProject ){

                UserProject.findOne({ _id : userProject._id}).deepPopulate('Format Format.Themes Views Views.Pages Views.Pages.ProposedTemplate Views.Pages.ProposedTemplate.ProposedImages Views.Pages.ProposedTemplate.ProposedTexts Views.Pages.EditorBitmaps Views.Pages.EditorBitmaps.ProjectImage Views.EditorTexts projectImages').exec( function( err, userProject ){

                    if( err ){

                        console.fs( err );

                    }
                    else {

                        UserFolder.findOne( {_id: folder}).exec(function( err, fold){
                            if( err ){
                                console.log( err );
                            }else {
                                console.log( fold );
                                console.log('MAMY TEN FOLDER :)');
                                userProject.projectImages = fold.imageFiles;
                                userProject.save( function( err, saved ){

                                    if( err ){
                                        console.log( err );
                                    }else {

                                        console.log('UDALO SIE:)');
                                        def.resolve( saved );

                                    }
                                });
                            }
                        });

                    }

                });

            },
            function( err ){

                console.fs( err );

            }

        );


    return def.promise;

}

UserController._createComplexProject = function( userID, products, formats, pages, attributes, typeID ){

    var def  = Q.defer();

    var addUserMultiProject = UserProjectController._addMulti( products, formats, pages, attributes );
    
    addUserMultiProject.then( 

        // ok
        ( projects ) => {
            
            var complex = new ComplexUserProject( { projects: projects } );
            complex.typeID = typeID;
            complex.save( ( err, saved ) => {

                if( err ){
                    console.log( err );                        
                }                    
                else {

                    User.findOne( { 'userID' : userID }, function( err, foundUser ){
                        
                        foundUser.ComplexProjects.push( saved );
                        foundUser.save( function( err, updatedUser ){
        
                            if( err ){
        
                                console.log( err );
                                def.reject('error wystapil');
        
                            } else {
                                
                                def.resolve( saved );
        
                            }
        
                        });
        
                    });

                }

            });

        }
    
    );

    return def.promise;

}

UserController.prototype.addComplexProject = function (){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on( socketName+'.addComplexProject', function( data ){

        var creatingProject = UserController._createComplexProject( GLOBAL.sessions[data.token], data.products, data.formats, data.pages, data.attributes, data.typeID );

        creatingProject.then(

            ( complexProject ) => {

                ComplexUserProject.findOne({ _id : complexProject._id}).deepPopulate('projects projects.Format projects.Format.Themes projects.Format.Themes.MainTheme projects.Views projects.Views.adminView projects.Views.adminView.Pages projects.Views.Pages projects.Views.Pages.ProposedTemplate projects.Views.Pages.ProposedTemplate.ProposedImages projects.Views.Pages.ProposedTemplate.ProposedTexts projects.Views.Pages.EditorBitmaps projects.Views.Pages.EditorBitmaps.ProjectImage projects.Views projects.Views.EditorTexts projectImages').exec( function( err, userProject ){
                    
                    if( err ){

                        console.fs( err );

                    }
                    else {

                        console.log('Ukonczono tworzenie projektu :)');
                        socket.emit( socketName + '.addComplexProject', userProject );

                    }

                });

            }

        );

    });

}

UserController.prototype.addProject = function(){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on( socketName+'.addProject', function( data ){

        var creatingProject = UserController._createProject( GLOBAL.sessions[data.token], data.typeID, data.formatID, data.pages, data.attributes );

        creatingProject.then(

            function( userProject ){

                UserProject.findOne({ _id : userProject._id}).deepPopulate('Format Format.Themes Views Views.Pages Views.Pages.ProposedTemplate Views.Pages.ProposedTemplate.ProposedImages Views.Pages.ProposedTemplate.ProposedTexts Views.Pages.EditorBitmaps Views.Pages.EditorBitmaps.ProjectImage Views.EditorTexts projectImages').exec( function( err, userProject ){

                    if( err ){

                        console.fs( err );

                    }
                    else {

                        socket.emit( socketName + '.addProject', userProject );

                    }

                });

            },
            function( err ){

                console.fs( err );

            }

        );

    });

};


UserController._getPhotos = function( userID, callback ){

    User.findOne( { 'userID' : userID }, function( err, foundUser ){

        if( err ){

            console.log('Błąd w poszukiwaniu użytkownika');

        }else {


            callback( foundUser.Photos );

        }

    });

};


UserController.prototype.getPhotos =  function( userID ){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on(socketName+'.getPhotos', function( data ){

        UserController._getPhotos( data.userID, function( userPhotos ){

            socket.emit( socketName+'.getPhotos', userPhotos );

        });

    });

};


UserController._addUserImage = function( user, file ){

    UploadController.saveUserImage( 'userID', file )

};

UserController.addUserImage = function(){

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on(socketName+'.addUserImage', function( data ){

        _this._addUserImage( data.userID, data.file );

    });

};


UserController.prototype.login = function(email) {
	var _this = this;
	var def = Q.defer();

	//var socketName = this.socketName;
	//var socket = this.socket;
	//socket.on(socketName+'.login', function(data) {

		User.findOne({ 'email':  email  }, function( err, _user ) {

            if( err ){
                console.fs(err);
                def.reject(err);
            } else {
            	//var profile = _user;

            	def.resolve(_user);
 				//socket.emit(socketName+'.login',{token: token});
            }

        });

	//});

	return def.promise;
};

UserController.prototype.register = function() {
	//var socketName = this.socketName;
    //var socket = this.socket;
    //var _this = this;

    //socket.on(socketName+'.register', function(data){
    var def = Q.defer();

    var newUser = new User();
    newUser.first_name = data.first_name;
    newUser.last_name = data.last_name;
    newUser.email = data.email;
    newUser.password = passwordHash.generate(data.password);
    newUser.userID = data.userID;
    var res = {};
    newUser.save( function(err, saved) {
    	if(err){
			res.status = 'error';
			res.error = err;
			console.fs(err);
            def.reject(err);
    	} else {
    		res.status = 'ok';
    		res.item = saved;
    		socket.emit(socketName+'.register', res);
            def.resolve(res);
    	}
    });
    return def.promise;
    //});
};


module.exports = UserController;
