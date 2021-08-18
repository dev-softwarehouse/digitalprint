/**
 * Logowanie do aplikacji
 */

var express = require('express'),
    mongoose = require('mongoose');
    bodyParser = require('body-parser'),
	app = express(),
	http = require('http').Server(app),
	fs = require('fs'),
	log_stdout = process.stdout,
	util = require('util'),
	log_file = fs.createWriteStream('./debug.log', {flags : 'w'}),
	httpRequest = require('http'),
	io = require('socket.io')(http);


var password = require('./libs/password.js');
console.fs = require('./libs/fsconsole.js');
var Q = require('q');

var mysql = require('mysql');
// test

//var socketio_jwt = require('socketio-jwt');
var jwt = require('jsonwebtoken');
var mainConf = require('./libs/mainConf.js');
var hashing = require('./libs/hashingProof.js');

// @TODO to zmienić na bardziej dynamiczne
var jwt_secret = mainConf.jwt_secret;

var User = require('./models/User.js').model;
var AdminProject = require('./models/AdminProject.js').model;
var ProjectImage = require('./models/ProjectImage.js').model;
var Cart = require('./models/Cart.js').model;
var UserEditor = require('./models/UserEditor.js').model;
var ProductAddress = require('./models/ProductAddress.js').model;

var SessionController = require('./controllers/SessionController.js');
var UserEditorController = require('./controllers/UserEditorController.js');
var CartController = require('./controllers/CartController.js');
try {
	var SessionControllerObject = new SessionController();
    var UserEditorControllerObject = new UserEditorController();
    var CartControllerObject = new CartController();
} catch(e) {
	console.fs('Problem z plikiem kontrolera!');
	console.fs( e );
}

connectionPool = require('./libs/connection.js');


var db;

var pools = {};
pools[0] = mysql.createPool(mainConf.rootDb);
pools[1] = mysql.createPool(mainConf.vpsDb);

app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.query());

port = 1600;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access_token, domainID, secretProof, lang");

    res.on('finish', function() {
        var intervalObject = setInterval(function () {
            console.log('FINISH REQUEST', connectionPool.countConnections());
            mongoose.disconnect();
            clearInterval(intervalObject);
        }, 0);
    });

  next();
});

var server = http.listen(port, function () {

	var host = 'digitalprint.pro';
	var port = server.address().port;

	console.log('Digitalprint.pro Nowe Logowanie: http://%s:%s', host, port);

});

// sockets
io.on('connection', function(socket){
  var mainSocket = socket;
  socket.emit('start', 'Welcome!');

  // token info
  socket.on('checkToken', function( actToken ) {



  	var decodedToken = jwt.decode(actToken, jwt_secret, 'HS256');
  	if( decodedToken ) {
  		SessionControllerObject.get( decodedToken.sessionID ).then( function( _session ) {
	  		if( _session === null ) {
	  			mainSocket.emit('tokenBroken', true);
	  		} else {
	  			mainSocket.emit('sessionExpires', session.expireAt);
	  		}
	  	});
  	}
  });

});

/**
 * @deprecated since 2017
 * @param companyID
 * @returns {*}
 */
function doRequest( companyID ){

	var _this = this;
	var def = Q.defer();

	var options = {
	  host: 'api.digitalprint.pro',
	  path: '/test/importUsers?companyID='+companyID,
	  port: '80',
	  method: 'GET'
	};

	callback = function(response) {
	  var str = ''
	  response.on('data', function (chunk) {
	    str += chunk;
	  });

	  response.on('end', function () {
	    def.resolve(str);
	  });
	}

	var req = httpRequest.request(options, callback);
	req.end();

	return def.promise;
};

function getRootDomain( domainName ){
	var _this = this;
	var def = Q.defer();

	try {

        pools[0].getConnection(function(err, connection) {

            connection.query('SELECT * FROM `dp_domains` WHERE `dp_domains`.`name` = ? LIMIT 1 ', [domainName], function (err, rows) {

                connection.release();

                if (err) {
                    console.fs(err);
                    def.reject(err);
                } else {

                    if (rows === undefined || rows.length === 0) {
                        def.reject('empty');
                    } else {

                        def.resolve(rows[0]);

                    }

                }

            });
        });

	} catch(err){
		console.fs(err);
		def.reject(err);
	}

	return def.promise;
};

function getSuperUser( login, pass ){
	var _this = this;
	var def = Q.defer();

	try {

        pools[0].getConnection(function(err, connection) {

            var hashFromPost = password.hashPass(pass, false);

            connection.query('SELECT * FROM `dp_superusers` WHERE `dp_superusers`.`login` = ? AND `pass` = ? LIMIT 1 ', [login, hashFromPost], function (err, rows) {

                connection.release();

                if (err) {
                    console.fs(err);
                    def.reject(err);
                } else {

                    if (rows === undefined || rows.length === 0) {
                        def.reject('empty');
                    } else {

                        def.resolve(rows[0]);

                    }

                }

            });
        });


	} catch(err){
		console.fs(err);
		def.reject(err);
	}

	return def.promise;
};

function getPrinthouseDatabase( printhouseID ) {

    var def = Q.defer();

    try {

        pools[1].getConnection(function(err, connection) {

            var query = 'SELECT `users_settings`.`database` , `users_settings`.`dbpass` , `users`.user ' +
                ' FROM `users_settings` ' +
                ' LEFT JOIN `users` ON `users`.ID = `users_settings`.ID ' +
                ' WHERE `users_settings`.`ID` = ? ';

            connection.query(query, [printhouseID], function (err, rows) {

                connection.release();

                if (rows === undefined || rows.length === 0) {
                    def.reject(null);
                } else {
                    var dbSettings = {};
                    dbSettings.user = 'v_' + rows[0].user;
                    dbSettings.host = mainConf.rootDb.host;
                    dbSettings.password = rows[0].dbpass;
                    dbSettings.database = rows[0].database;
                    def.resolve(dbSettings);
                }
            });

        });

    } catch(err){
        console.fs(err);
        def.reject(err);
    }

    return def.promise;
};

function getRegularUser( printhouseID, user, pass, domainID )
{
    var def = Q.defer();

    try {
        getPrinthouseDatabase(printhouseID).then( function( databaseSettings ) {

            if (pools[printhouseID] === undefined) {
                pools[printhouseID] = mysql.createPool(databaseSettings);
            }

            pools[printhouseID].getConnection(function(err, connection) {

                var query = 'SELECT * FROM `users` WHERE `user` = ? AND `pass` = ? AND (`domainID` IS NULL OR domainID = ?) ';

                connection.query(query, [user, pass, domainID], function (err, rows) {

                    connection.release();

                    if (err) {
                        def.reject(err);
                    }

                    if (rows === undefined || rows.length === 0) {
                        def.resolve(null);
                    } else {
                        def.resolve(rows[0]);
                    }

                });

            });

        });
    } catch(err){
        console.fs(err);
        def.reject(err);
    }

    return def.promise;
};

function getSocialUser( printhouseID, user, domainID )
{
    var def = Q.defer();

    try {
        getPrinthouseDatabase(printhouseID).then( function( databaseSettings ) {

            if (typeof pools[printhouseID] === undefined) {
                pools[printhouseID] = mysql.createPool(databaseSettings);
            }

            pools[printhouseID].getConnection(function(err, connection) {

                var query = 'SELECT * FROM `users` WHERE `user` = ? AND (`domainID` IS NULL OR domainID = ?) ';

                connection.query(query, [user, domainID], function (err, rows) {

                    connection.release();

                    if (err) {
                        def.reject(err);
                    }

                    if (rows === undefined || rows.length === 0) {
                        def.resolve(null);
                    } else {
                        def.resolve(rows[0]);
                    }

                });

            });

        });
    } catch(err){
        console.fs(err);
        def.reject(err);
    }

    return def.promise;
};

function setUserID( printhouseID, userID, orderID)
{
    var def = Q.defer();

    try {
        getPrinthouseDatabase(printhouseID).then( function( databaseSettings ) {

            if (typeof pools[printhouseID] === undefined) {
                pools[printhouseID] = mysql.createPool(databaseSettings);
            }

            pools[printhouseID].getConnection(function(err, connection) {

                var query = ' UPDATE `dp_orders` SET `userID` = ? WHERE `ID` = ? ';

                connection.query(query, [userID, orderID], function (err, rows) {

                    connection.release();

                    if (err) {
                        def.reject(err);
                    } else {
                        def.resolve(true);
                    }

                });

            });

        });
    } catch(err){
        console.fs(err);
        def.reject(err);
    }

    return def.promise;
};

app.get('/test', function (req, res) {

	res.json({'res': 'ok'});


});

function login(email, pass, domainID, companyID, decodedToken) {
	var _this = this;
	var def = Q.defer();

	var saltOff = false;

	try {

        // @TODO to trzeba sprawdzać z bazy danych
        if( companyID === 249 || companyID === 686 ){
            saltOff = true;
        }

        var hashFromPost = password.hashPass(pass, saltOff);

        // tu przez mysql
        getRegularUser( companyID, email, hashFromPost, domainID ).then(function( _user ) {

            if( _user === null ){

                getSuperUser( email, pass ).then( function( _superuser ) {

                    var profile = {};
                    profile.first_name = _superuser.name;
                    profile.last_name = 'ADMIN';
                    profile.user = _superuser.login;
                    profile.userID = _superuser.ID;
                    profile.date = Date.now();
                    profile.domainID = domainID;
                    profile.super = 1;
                    var actTime = new Date();

                    SessionControllerObject.add2( profile ).then( function( session ) {
                        profile.sessionID = session['sid'];
                        var token = jwt.sign(profile, mainConf.jwt_secret, { expiresIn: mainConf.expireTime });
                        def.resolve({'token':token,'profile':profile,'addresses':session.addresses});
                    });

                }).fail( function(err) {
                    def.reject({'error':"Login lub hasło nieprawidłowe!",'response': false});
                });

            } else {

                var sessionID = null;

                if( decodedToken !== null && typeof decodedToken === 'object' ){
                    sessionID = decodedToken.sessionID;
                }

                var profile = {};
                profile.orderID = null;
                profile.first_name = _user.name;
                profile.last_name = _user.lastname;
                profile.user = _user.user;
                profile.login = _user.login;
                profile.userID = _user.ID;
                profile.date = Date.now();
                profile.super = 0;
                profile.domainID = domainID;
                var actTime = new Date();

                SessionControllerObject.get( sessionID ).then( function( session ) {

                    UserEditorControllerObject.check(_user.ID, session).then( function( _userEditorID ) {

                        profile.userEditorID = _userEditorID;

                        if( session ) {

                            SessionControllerObject.update( sessionID, profile ).then( function( session ) {
                                var sessionData = JSON.parse(session.data);

                                setUserID( companyID, sessionData.user.ID, session.orderID).then( function(isUpdated) {
                                    profile.sessionID = session.sid;
                                    var token = jwt.sign(profile, mainConf.jwt_secret, { expiresIn: mainConf.expireTime });
                                    def.resolve({'token':token,'profile':profile,'orderID': session.orderID, 'addresses':session.addresses });
                                });
                            });

                        } else {

                            SessionControllerObject.add2( profile ).then( function( session ) {
                                profile.sessionID = session['sid'];
                                var token = jwt.sign(profile, mainConf.jwt_secret, { expiresIn: mainConf.expireTime });
                                def.resolve({'token':token,'profile':profile, 'orderID': session.orderID, 'addresses':session.addresses });
                            }).fail( function(err) {
                                def.reject(err);
                            });
                        }

                    });

                });

            }

        });

	} catch(err){
		console.fs('Err in try: ');
		console.fs(err);
		def.reject(err);
	}

	return def.promise;
};

function loginSocial(email, domainID, companyID, decodedToken){
	var _this = this;
	var def = Q.defer();

	var saltOff = false;

	try {

        // @TODO to trzeba sprawdzać z bazy danych
        if( companyID === 249 || companyID === 686 ){
            saltOff = true;
        }

        getSocialUser( companyID, email, domainID ).then( function( _user ) {

            var sessionID = null;

            if( decodedToken !== null && typeof decodedToken === 'object' ){
                sessionID = decodedToken.sessionID;
            }

            var profile = {};
            profile.orderID = null;
            profile.first_name = _user.name;
            profile.last_name = _user.lastname;
            profile.email = _user.user;
            profile.login = _user.login;
            profile.userID = _user.ID;
            profile.date = Date.now();
            profile.super = 0;
            profile.domainID = domainID;
            var actTime = new Date();

            SessionControllerObject.get( sessionID ).then( function( session ) {

                UserEditorControllerObject.check(_user.ID, session).then( function( _userEditorID ) {

                    profile.userEditorID = _userEditorID;

                    if( session ) {

                        SessionControllerObject.update( sessionID, profile ).then( function( session ) {
                            var sessionData = JSON.parse(session.data);

                            setUserID( companyID, sessionData.user.ID, session.orderID).then( function(isUpdated) {
                                profile.sessionID = session.sid;
                                var token = jwt.sign(profile, mainConf.jwt_secret, {expiresIn: mainConf.expireTime});
                                def.resolve({
                                    'token': token,
                                    'profile': profile,
                                    'orderID': session.orderID,
                                    'addresses': session.addresses
                                });
                            });
                        });

                    } else {

                        SessionControllerObject.add2( profile ).then( function( session ) {
                            profile.sessionID = session['sid'];
                            var token = jwt.sign(profile, mainConf.jwt_secret, { expiresIn: mainConf.expireTime });
                            def.resolve({
                                'token':token,
                                'profile':profile,
                                'orderID': session.orderID,
                                'addresses': session.addresses
                            });
                        }).fail( function(err) {
                            console.fs('Err: ');
                            console.fs(err);
                            def.reject(err);
                        });
                    }

                });

            });

        });

	} catch(err){
		console.fs('Err in try: ');
		console.fs(err);
		def.reject(err);
	}

	return def.promise;
};

app.get('/', function (req, res) {
	res.json({test: 'Aplikacja logowania 2.0'});
});

function getDbData( companyID ){
	var _this = this;
	var def = Q.defer();

	try {

	    pools[1].getConnection(function(err, connection) {

            connection.query('SELECT `database`, `dbpass` FROM `users_settings` WHERE ID = ?', [companyID], function (err, rows) {

                connection.release();

                if (err) {
                    console.fs(err);
                    def.reject(err);
                } else {

                    if (rows === undefined || rows.length === 0) {
                        def.reject('empty');
                    } else {

                        def.resolve(rows[0]);

                    }

                }

            });
        });


	} catch(err){
		console.fs(err);
		def.reject(err);
	}

	return def.promise;
}

function getDbUser( companyID ){
	var _this = this;
	var def = Q.defer();

	try {

        pools[1].getConnection(function(err, connection) {

            connection.query('SELECT `user` FROM `users` WHERE ID = ? ', [companyID], function(err, rows) {

                connection.release();

                if( err ){
                    console.fs(err);
                    def.reject(err);
                } else {

                    if( rows === undefined || rows.length === 0 ){
                        def.reject('empty');
                    } else {

                        def.resolve(rows[0]);

                    }

                }

            });

        });


	} catch(err){
		console.fs(err);
		def.reject(err);
	}

	return def.promise;
}

function getDomain(connectData, domainName, companyID){
	var _this = this;
	var def = Q.defer();

	try {

        if ( pools[companyID] === undefined) {
            pools[companyID] = mysql.createPool(connectData);
        }

        pools[companyID].getConnection(function(err, connection) {

            connection.query('SELECT * FROM `dp_domains` WHERE host = ? ', [domainName], function(err, rows) {

                connection.release();

                if( err ){
                    console.fs(err);
                    def.reject(err);
                } else {

                    if( rows === undefined || rows.length === 0 ){
                        def.reject('empty');
                    } else {

                        def.resolve(rows[0]);

                    }

                }

            });

        });


	} catch(err){
		console.fs(err);
		def.reject(err);
	}

	return def.promise;
}

app.post('/login', function (req, res) {

	var domainName = req.query.domainName;
	if( domainName === undefined ){
		domainName = req.body.domainName;
	}

	console.log( domainName );

	try {

		getRootDomain( domainName ).then( function( domainData ) {

			console.log( domainData );
			var companyID = domainData['companyID'];

			getDbUser( companyID ).then( function( userName ) {

				getDbData( companyID ).then( function( dbData ) {

					var connectData = { host: 'localhost',
									    user: 'v_'+userName['user'],
									    password: dbData['dbpass'],
									    database : dbData['database'] };

					getDomain(connectData, domainName, companyID).then( function( domainData ) {

						if( !req.body.password || !req.body.email || !domainName ){
							res.status(400).send({'error': 'Wypełnij dane logowania!', 'data': req.body.toString()});
						} else {

							var databaseName = 'editor_'+companyID;

                            db = connectionPool.getDatabaseConnection(databaseName);

							var domainID = domainData['ID'];

							var decodedToken = null;
							if( req.headers.access_token !== undefined ){
								decodedToken = jwt.decode(req.headers.access_token, jwt_secret, 'HS256');
							}
							var loginUser = login(req.body.email, req.body.password, domainID, companyID, decodedToken);
							loginUser.then( function (loginData){

                                var user = {
                                    firstname: loginData['profile'].first_name,
                                    lastname: loginData['profile'].last_name,
                                    login: loginData['profile'].login,
                                    userID: loginData['profile'].userID
                                };

                                if( loginData['profile'].super !== undefined && loginData['profile'].super == 1 ) {
                                    user.super = true;
                                }

                                res.json({
                                    token: loginData.token,
                                    'userID': loginData['profile'].userID,
                                    'domainID': domainID,
                                    'user': user,
                                    'orderID': loginData.orderID,
                                    'addresses': loginData['addresses']
                                });

							}).fail(function (error) {
								console.fs(error);
								res.status(400).send(error);
							}).fin(function () {
				    			console.fs('wykonało się');
							});;
						}

					})

				});
			});

		});


	} catch (err){
		console.fs(err);
	}

});

app.post('/getNonUserToken', function (req, res) {

	function getNoLoginToken(){
		var _this = this;
		var def = Q.defer();

		try {
			var profile = {};
			profile.noLogin = true;

            var actTime = new Date();

            var newUserEditor = new UserEditor();

            newUserEditor.login = false;

            newUserEditor.save( function( err, _savedUserEditor ) {

                if( err ) {
                    console.log(err);
                }

                if( _savedUserEditor !== undefined ) {
                    profile.userEditorID = _savedUserEditor._id;
                }

                SessionControllerObject.addNoLogin( profile ).then( function( session ) {

                    profile.sessionID = session['sid'];

                    var token = jwt.sign(profile, mainConf.jwt_secret, { expiresIn: mainConf.expireTime });
                    def.resolve({'token':token,'profile':profile});


                }, function (err) {
                    console.log(err);
                });
            });


		} catch(err){
			console.fs('err: ',err);
			def.reject(err);
		}

		return def.promise;
	}


	var domainName = req.query.domainName;
	if( domainName === undefined ){
		domainName = req.body.domainName;
	}

	try {

		getRootDomain( domainName ).then( function( domainData ) {
			var companyID = domainData['companyID'];

			getDbUser( companyID ).then( function( userName ) {

				getDbData( companyID ).then( function( dbData ) {

					var connectData = { host: 'localhost',
									    user: 'v_'+userName['user'],
									    password: dbData['dbpass'],
									    database : dbData['database'] };

					getDomain(connectData, domainName, companyID).then( function( domainData ) {

						var databaseName = 'editor_'+companyID;

						/*if( !mongoose.connection.readyState ) {
							db = mongoose.connect("mongodb://localhost:27017/"+databaseName, function(err) {
								if( err ){
									console.fs('err: ',err);
									res.status(401).send( {"error": error, 'codeError': '02'} );
								}
							});
						}*/
                        db = connectionPool.getDatabaseConnection(databaseName);

						getNoLoginToken().then( function( data ) {
							res.json(data);
						}, function(err){
							res.json({'err':err});
						});

					});

				});
			});

		});


	} catch (err){
		console.fs(err);
	}





});

app.post('/cart/add', function(req, res) {

	var domainName = req.query.domainName;
	if( domainName === undefined ){
		domainName = req.body.domainName;
	}

	try {

		getRootDomain( domainName ).then( function( domainData ) {
			var companyID = domainData['companyID'];
			var databaseName = 'editor_'+companyID;

			/*if( !mongoose.connection.readyState ) {
				db = mongoose.connect("mongodb://localhost:27017/"+databaseName, function(err) {
					if( err ){
						console.fs('err: ',err);
						res.status(401).send( {"error": error, 'codeError': '02'} );
					}
				});
			}*/
            db = connectionPool.getDatabaseConnection(databaseName);

			var decodedToken = jwt.decode(req.headers.access_token, jwt_secret, 'HS256');

			SessionControllerObject.get( decodedToken.sessionID ).then( function( session ) {

				if( session === null ){
					res.json({'error': 'Brak tokena', 'response': false});
					throw ('Token error');
				}

				var newCart = new Cart();

				newCart.calcID = req.body.calcID;
				newCart.orderID = req.body.orderID;
				newCart.productID = req.body.productID;

				newCart.ProductAddresses = req.body.productAddresses;

				newCart.save( function(err, savedCart) {

					if( err ){
						console.fs( err );
					} else {

						session.Carts.push( savedCart );

						session.orderID = req.body.orderID;
						session.save( function(err, savedSession) {
							if(err){
								console.fs( err );
							} else {
								res.json({'carts': savedSession.Carts});
							}
						});
					}

				});
			});

		});
	} catch( err ) {
		console.fs(err);
	}

});

app.get('/cart/get', function(req, res) {

	var domainName = req.query.domainName;
	if( domainName === undefined ){
		domainName = req.body.domainName;
	}

	try {

		getRootDomain( domainName ).then( function( domainData ) {
			var companyID = domainData['companyID'];
			var databaseName = 'editor_'+companyID;

			/*if( !mongoose.connection.readyState ) {
				db = mongoose.connect("mongodb://localhost:27017/"+databaseName, function(err) {
					if( err ){
						console.fs('err: ',err);
						res.status(401).send( {"error": error, 'codeError': '02'} );
					}
				});
			}*/
            db = connectionPool.getDatabaseConnection(databaseName);

			var decodedToken = jwt.decode(req.headers.access_token, jwt_secret, 'HS256');

			SessionControllerObject.get( decodedToken.sessionID ).then( function( session ) {
				res.json({'carts': session.Carts, 'orderID': session.orderID });
			});


		});
	} catch( err ) {
		console.fs(err);
	}
});

// usuwanie produktu z koszyka
app.post('/cart/delete', function(req, res) {

	var domainName = req.query.domainName;
	if( domainName === undefined ){
		domainName = req.body.domainName;
	}

	try {

		getRootDomain( domainName ).then( function( domainData ) {
			var companyID = domainData['companyID'];
			var databaseName = 'editor_'+companyID;

			/*if( !mongoose.connection.readyState ) {
				db = mongoose.connect("mongodb://localhost:27017/"+databaseName, function(err) {
					if( err ){
						res.status(401).send( {"error": error, 'codeError': '02'} );
					}
				});
			}*/
            db = connectionPool.getDatabaseConnection(databaseName);

			var decodedToken = jwt.decode(req.headers.access_token, jwt_secret, 'HS256');

			console.log(req.body.calcID);

			var calcID = Number(req.body.calcID);
			var orderID = Number(req.body.orderID);
			var productID = Number(req.body.productID);

			Cart.findOne( { 'calcID': calcID, 'orderID': orderID, 'productID': productID }, function( err, oneCart  ) {
				//console.log(oneCart._id);
				if( err ){
					console.log(err);
				} else {

					if( !decodedToken ){
						throw 'Brak tokena';
					}

					SessionControllerObject.get( decodedToken.sessionID ).then( function( session ) {

						SessionControllerObject.updateCarts(session._id, oneCart._id).then( function( data ) {

					   		if(err){
            					console.log(err);
	                        } else {
	                        	oneCart.remove(function(err, removed) {
	                        		if(err){
	                        			console.log(err);
	                        		} else {
	                        			console.log(removed);
	                        			SessionControllerObject.get( decodedToken.sessionID ).then( function( newSession ) {
	                        				console.log( newSession );
											res.json({'response': true, 'removed': removed, 'carts': newSession.Carts });
										});
	                        		}
	                        	})
	                        }

					    });

					});
				}
			});

		});
	} catch( err ) {
		console.fs(err);
	}
});

// weź numery adresów
app.get('/addresses', function(req, res) {

	var domainName = req.query.domainName;
	if( domainName === undefined ){
		domainName = req.body.domainName;
	}

	try {

		getRootDomain( domainName ).then( function( domainData ) {

			var companyID = domainData['companyID'];
			var databaseName = 'editor_'+companyID;

            db = connectionPool.getDatabaseConnection(databaseName);

			var decodedToken = jwt.decode(req.headers.access_token, jwt_secret, 'HS256');

			SessionControllerObject.get( decodedToken.sessionID ).then( function( session ) {

				res.json(session.addresses);

			});


		});
	} catch( err ) {
		console.fs(err);
	}
});

app.post('/addresses/add', function(req, res) {

	var domainName = req.query.domainName;
	if( domainName === undefined ){
		domainName = req.body.domainName;
	}

	try {

		getRootDomain( domainName ).then( function( domainData ) {
			var companyID = domainData['companyID'];
			var databaseName = 'editor_'+companyID;

			/*if( !mongoose.connection.readyState ) {
				db = mongoose.connect("mongodb://localhost:27017/"+databaseName, function(err) {
					if( err ){
						console.fs('err: ', err);
						res.status(401).send( {"error": error, 'codeError': '02'} );
					}
				});
			}*/
            db = connectionPool.getDatabaseConnection(databaseName);

			var decodedToken = jwt.decode(req.headers.access_token, jwt_secret, 'HS256');

			var addressID = Number(req.body.addressID);

			SessionControllerObject.get( decodedToken.sessionID ).then( function( session ) {

				session.addresses.push(addressID);

				session.save( function(err, savedSession) {
					if(err){
						console.fs( err );
					} else {
						res.json({'addresses': savedSession.addresses, 'session': savedSession});
					}
				});

			});


		});
	} catch( err ) {
		console.fs(err);
	}
});

app.get('/cleanSession', function (req, res) {

	var domainName = req.query.domainName;
	if( domainName === undefined ){
		domainName = req.body.domainName;
	}

	try {

		getRootDomain( domainName ).then( function( domainData ) {
			var companyID = domainData['companyID'];
			var databaseName = 'editor_'+companyID;

			/*if( !mongoose.connection.readyState ) {
				db = mongoose.connect("mongodb://localhost:27017/"+databaseName, function(err) {
					if( err ){
						console.fs('err: ', err);
						res.status(401).send( {"error": error, 'codeError': '02'} );
					}
				});
			}*/
            db = connectionPool.getDatabaseConnection(databaseName);

			var decodedToken = jwt.decode(req.headers.access_token, jwt_secret, 'HS256');

			SessionControllerObject.get( decodedToken.sessionID ).then( function( session ) {

				session.Carts = [];
				session.orderID = null;

				session.save( function(err, savedSession) {
					res.json({'session': savedSession});
				});

			});

		});

	} catch (err){
		console.fs(err);
	}

});

app.get('/logout', function (req, res) {

	var domainName = req.query.domainName;
	if( domainName === undefined ){
		domainName = req.body.domainName;
	}

	try {

		getRootDomain( domainName ).then( function( domainData ) {
			var companyID = domainData['companyID'];
			var databaseName = 'editor_'+companyID;

			/*if( !mongoose.connection.readyState ) {
				db = mongoose.connect("mongodb://localhost:27017/"+databaseName, function(err) {
					if( err ){
						console.fs('err: ', err);
						res.status(401).send( {"error": error, 'codeError': '02'} );
					}
				});
			}*/
            db = connectionPool.getDatabaseConnection(databaseName);

			var decodedToken = jwt.decode(req.headers.access_token, jwt_secret, 'HS256');

			SessionControllerObject.remove( decodedToken.sessionID ).then( function( logout ) {

				res.json({'logout': logout});

			}, function(err){
			    console.log(err);
                res.json({'logout': true, 'info': 'session not exist'});
            });

		});

	} catch (err){
		console.fs(err);
	}

});

app.post('/socialLogin', function (req, res) {

	var domainName = req.query.domainName;
	if( domainName === undefined ){
		domainName = req.body.domainName;
	}

	try {

		getRootDomain( domainName ).then( function( domainData ) {

			console.log( domainData );
			var companyID = domainData['companyID'];


			getDbUser( companyID ).then( function( userName ) {


				console.log('mam uzytkownika ' + userName );

				getDbData( companyID ).then( function( dbData ) {

					var connectData = { host: 'localhost',
									    user: 'v_'+userName['user'],
									    password: dbData['dbpass'],
									    database : dbData['database'] };

					getDomain(connectData, domainName, companyID).then( function( domainData ) {

						if( !req.body.email || !domainName ){
							res.status(400).send({'error': 'Wypełnij dane logowania!', 'data': req.body.toString()});
						} else {

							var databaseName = 'editor_'+companyID;

							/*if( !mongoose.connection.readyState ){
								db = mongoose.connect("mongodb://localhost:27017/"+databaseName, function(err) {
									if( err ){
										console.fs(err);
										res.status(401).send( {"error": error, 'codeError': '02'} );
									}
								});
							}*/
                            db = connectionPool.getDatabaseConnection(databaseName);

							var domainID = domainData['ID'];

							var decodedToken = null;
							if( req.headers.access_token !== undefined ){
								decodedToken = jwt.decode(req.headers.access_token, jwt_secret, 'HS256');
							}

							var loginUser = loginSocial(req.body.email, domainID, companyID, decodedToken);

                            loginUser.then(function (loginData) {
                                var user = {
                                    firstname: loginData['profile'].first_name,
                                    lastname: loginData['profile'].last_name,
                                    mail: loginData['profile'].email
                                };
                                res.json({
                                    token: loginData.token,
                                    'userID': loginData['profile'].userID,
                                    'domainID': domainID,
                                    'user': user,
                                    'orderID': loginData.orderID,
                                    'addresses': loginData['addresses']
                                });

                            }).fail(function (error) {
                                console.fs(error);
                                res.status(400).send(error);
                            }).fin(function () {
                                console.fs('wykonało się');
                            });
						}

					})

				});
			});

		});

	} catch (err){
		console.fs(err);
	}
});

app.post('/cart/updateDefaultAddress', function (req, res) {

    var domainName = req.query.domainName;
    if( domainName === undefined ){
        domainName = req.body.domainName;
    }

    var addressID = req.body.addressID;

    try {

        getRootDomain( domainName ).then( function( domainData ) {
            var companyID = domainData['companyID'];
            var databaseName = 'editor_'+companyID;

            /*if( !mongoose.connection.readyState ) {
                db = mongoose.connect("mongodb://localhost:27017/"+databaseName, function(err) {
                    if( err ){
                        console.fs('err: ', err);
                        res.status(401).send( {"error": error, 'codeError': '02'} );
                    }
                });
            }*/
            db = connectionPool.getDatabaseConnection(databaseName);

            var decodedToken = jwt.decode(req.headers.access_token, jwt_secret, 'HS256');

            SessionControllerObject.get( decodedToken.sessionID ).then( function( session ) {

                CartControllerObject.setDefaultAddress(session.Carts, addressID).then( function(result) {
                    res.json({'result': result});
                });

            });

        });

    } catch (err){
        console.fs(err);
    }

});