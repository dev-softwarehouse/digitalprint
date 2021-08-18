/**
 * Logowanie do aplikacji
 */

var express = require('express'),
    mongoose = require('mongoose');
    bodyParser = require('body-parser'),
	app = express(),
    https = require('https'),
    http = require('http'),
	fs = require('fs'),
	log_stdout = process.stdout,
	util = require('util'),
	log_file = fs.createWriteStream('./debug.log', {flags : 'w'}),
	httpRequest = require('http');

require('dotenv').config();

var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
var client = new auth.OAuth2('', '', '');

var password = require('./libs/password.js');
console.fs = require('./libs/fsconsole.js');
var Q = require('q');

var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var mainConf = require('./libs/mainConf.js');
var hashing = require('./libs/hashingProof.js');
var headers = require('./libs/headers');

// @TODO to zmienić na bardziej dynamiczne
var jwt_secret = mainConf.jwt_secret;
var accessTokenName = mainConf.accessTokenName;

var User = require('./models/User.js').model;
var AdminProject = require('./models/AdminProject.js').model;
var ProjectImage = require('./models/ProjectImage.js').model;
var Cart = require('./models/Cart.js').model;
var UserEditor = require('./models/UserEditor.js').model;
var ProductAddress = require('./models/ProductAddress.js').model;

var SessionController = require('./controllers/SessionController.js');
var UserEditorController = require('./controllers/UserEditorController.js');
var CartController = require('./controllers/CartController.js');
var ReclamationMessageController = require('./controllers/ReclamationMessageController.js');
var OrderMessageController = require('./controllers/OrderMessageController.js');
var OrderController = require('./controllers/OrderController.js');

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

port = mainConf.appPort;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, sourceApp, access-token, domainID, secretProof, lang");

    res.on('finish', function() {
        var intervalObject = setInterval(function () {
            console.log('FINISH REQUEST', connectionPool.countConnections());
            mongoose.disconnect();
            clearInterval(intervalObject);
        }, 0);
    });

  next();
});

if( mainConf.appWithSsl === 'true' ) {
    const options = {
        key: fs.readFileSync(mainConf.crt.key),
        cert: fs.readFileSync(mainConf.crt.cert)
    };
    var serv = https.createServer(options, app).listen(port);
} else {
    const options = {};
    var serv = http.createServer(options, app).listen(port);
}

var io = require('socket.io')(serv);


io.sockets.on('connection', function (socket) {

    var mainSocket = socket;

    console.log('Socket connect with id: ' + socket.id );

    socket.on('onReclamation', function(data) {
        console.log('on reclamation ', data);
       socket.join('reclamation_' + data.reclamationID);
    });

    socket.on('onOrder', function(data) {
        console.log('on order ', data);
        socket.join('order_' + data.orderID);
    });

    socket.on('onReclamationsPanel', function(data) {
        console.log('on panel', data);
        socket.join('user_' + data.userID);
    });

    socket.on('onOrdersPanel', function(data) {
        console.log('on panel', data);
        socket.join('user_' + data.userID);
    });

    socket.on('onReclamationsAdminPanel', function(data) {
        console.log('on admin panel');
        socket.join('adminPanel');
    });

    socket.on('onOrdersAdminPanel', function(data) {
        console.log('on order admin panel');
        socket.join('order.adminPanel');
    });

    socket.on('addMessage', function (data) {

        checkAccessToken(data.accessToken).then(function( tokenData ) {

            getMysqlControllers(data.companyID).then( function(controllers) {

                controllers.ReclamationMessage.add(data.reclamationID, data.message, tokenData.userID, 0).then(function(reclamationData) {

                    controllers.ReclamationMessage.get( reclamationData['insertId'] ).then(function(lastRow) {
                        io.sockets.to('reclamation_' + lastRow['reclamationID']).emit('messageSaved', lastRow);
                        io.sockets.to('adminPanel').emit('newMessage', lastRow);
                    });

                });
            });

        });

    });

    socket.on('order.addMessage', function (data) {

        checkAccessToken(data.accessToken).then(function( tokenData ) {

            getMysqlControllers(data.companyID).then( function(controllers) {

                controllers.OrderMessage.add(data.orderID, data.message, tokenData.userID, 0).then(function(orderData) {

                    controllers.OrderMessage.get( orderData['insertId'] ).then(function(lastRow) {

                        console.log(lastRow);

                        io.sockets.to('order_' + lastRow['orderID']).emit('order.messageSaved', lastRow);
                        io.sockets.to('order.adminPanel').emit('order.newMessage', lastRow);
                    });

                });
            });

        });

    });

    socket.on('addAdminMessage', function (data) {

        checkAccessToken(data.accessToken).then(function( tokenData ) {

            getMysqlControllers(data.companyID).then( function(controllers) {

                controllers.ReclamationMessage.add(data.reclamationID, data.message, null, 1).then(function(reclamationData) {

                    controllers.ReclamationMessage.get( reclamationData['insertId'] ).then(function(lastRow) {
                        io.sockets.to('reclamation_' + lastRow['reclamationID']).emit('messageSaved', lastRow);
                        io.sockets.to('user_' + lastRow['userID']).emit('newMessage', lastRow);
                    });

                });
            });

        });

    });

    socket.on('order.addAdminMessage', function (data) {

        checkAccessToken(data.accessToken).then(function( tokenData ) {

            getMysqlControllers(data.companyID).then( function(controllers) {

                controllers.OrderMessage.add(data.orderID, data.message, null, 1).then(function(orderData) {

                    controllers.OrderMessage.get( orderData['insertId'] ).then(function(lastRow) {
                        io.sockets.to('order_' + lastRow['orderID']).emit('order.messageSaved', lastRow);
                        io.sockets.to('user_' + lastRow['userID']).emit('order.newMessage', lastRow);
                    });

                });
            });
        });

    });

    // token info
    socket.on('checkToken', function (data) {

        var decodedToken = jwt.decode(data.accessToken, jwt_secret, 'HS256');

        if (decodedToken) {
            SessionControllerObject.get(decodedToken.sessionID).then(function (_session) {
                if (_session === null) {
                    socket.emit('tokenAccept', {'accept': false});
                } else {
                    socket.emit('tokenAccept', {'accept': true});
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
	  host: mainConf.apiDomain,
	  path: '/test/importUsers?companyID='+companyID,
	  port: '80',
	  method: 'GET'
	};

	callback = function(response) {
	  var str = '';
	  response.on('data', function (chunk) {
	    str += chunk;
	  });

	  response.on('end', function () {
	    def.resolve(str);
	  });
	};

	var req = httpRequest.request(options, callback);
	req.end();

	return def.promise;
}

function getMysqlControllers( companyID ) {

    var def = Q.defer();
    var controllers = {};

    getPrinthouseDatabase(companyID).then( function(databaseSettings) {

        if (pools[companyID] === undefined) {
            databaseSettings['charset'] = 'UTF8_GENERAL_CI';
            databaseSettings['host'] = mainConf.vpsDb.host;
            databaseSettings['connectionLimit'] = mainConf.vpsDb.connectionLimit;
            pools[companyID] = mysql.createPool(databaseSettings);
        }

        controllers.ReclamationMessage = new ReclamationMessageController( pools[companyID] );
        controllers.OrderMessage = new OrderMessageController( pools[companyID] );
        controllers.Order = new OrderController( pools[companyID] );
        def.resolve(controllers);

    }, function(rejectData) {
        console.log(rejectData);
    });

    return def.promise;
}

function checkAccessToken( accessToken ) {

    var def = Q.defer();

    var decodedToken = jwt.decode(accessToken, jwt_secret, 'HS256');

    if (decodedToken) {

        def.resolve(decodedToken);

    } else {
        def.reject(null);
    }

    return def.promise;
}

function getRootDomain( domainName ){
	var _this = this;
	var def = Q.defer();

	try {

        pools[0].getConnection(function(err, connection) {

            connection.query('SELECT * FROM `dp_domains` WHERE `dp_domains`.`name` = ? LIMIT 1 ', [domainName], function (err, rows) {

                connection.destroy();

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

function getSuperUser( login, pass ){
	var _this = this;
	var def = Q.defer();

	try {

        pools[0].getConnection(function(err, connection) {

            var hashFromPost = password.hashPass(pass, false);

            connection.query('SELECT * FROM `dp_superusers` WHERE `dp_superusers`.`login` = ? AND `pass` = ? LIMIT 1 ', [login, hashFromPost], function (err, rows) {

                connection.destroy();

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

function getPrinthouseDatabase( printhouseID ) {

    var def = Q.defer();

    try {

        pools[1].getConnection(function(err, connection) {

            var query = 'SELECT `users_settings`.`database` , `users_settings`.`dbpass` , `users`.user ' +
                ' FROM `users_settings` ' +
                ' LEFT JOIN `users` ON `users`.ID = `users_settings`.ID ' +
                ' WHERE `users_settings`.`ID` = ? ';

            connection.query(query, [printhouseID], function (err, rows) {

                connection.destroy();

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

        /*var dbSettings = {};
        dbSettings.user = mainConf.companyDb.user;
        dbSettings.host = mainConf.rootDb.host;
        dbSettings.password = mainConf.companyDb.password;
        dbSettings.database = mainConf.companyDb.database;
        def.resolve(dbSettings);*/

    } catch(err){
        console.fs(err);
        def.reject(err);
    }

    return def.promise;
}

function getGoogleUser(printhouseID, user, domainID) {
    var def = Q.defer();

    try {
        getPrinthouseDatabase(printhouseID).then( function( databaseSettings ) {

            if (pools[printhouseID] === undefined) {
                databaseSettings['charset'] = 'UTF8_GENERAL_CI';
                databaseSettings['host'] = mainConf.vpsDb.host;
                pools[printhouseID] = mysql.createPool(databaseSettings);
            }

            pools[printhouseID].getConnection(function(err, connection) {

                var query = 'SELECT * FROM `users` WHERE `user` = ? AND (`domainID` IS NULL OR domainID = ?) ';

                connection.query(query, [user, domainID], function (err, rows) {

                    connection.destroy();

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
}

function getRegularUser( printhouseID, user, pass, domainID )
{
    var def = Q.defer();

    try {
        getPrinthouseDatabase(printhouseID).then( function( databaseSettings ) {

            if (pools[printhouseID] === undefined) {
                databaseSettings['charset'] = 'UTF8_GENERAL_CI';
                databaseSettings['host'] = mainConf.vpsDb.host;
                pools[printhouseID] = mysql.createPool(databaseSettings);
            }

            pools[printhouseID].getConnection(function(err, connection) {

                var query = 'SELECT * FROM `users` WHERE `user` = ? AND `pass` = ? AND (`domainID` IS NULL OR domainID = ?) ';

                connection.query(query, [user, pass, domainID], function (err, rows) {

                    connection.destroy();

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
}

function getSocialUser( printhouseID, user, domainID )
{
    var def = Q.defer();

    try {
        getPrinthouseDatabase(printhouseID).then( function( databaseSettings ) {

            if (typeof pools[printhouseID] === undefined) {
                databaseSettings['charset'] = 'UTF8_GENERAL_CI';
                databaseSettings['host'] = mainConf.vpsDb.host;
                pools[printhouseID] = mysql.createPool(databaseSettings);
            }

            pools[printhouseID].getConnection(function(err, connection) {

                var query = 'SELECT * FROM `users` WHERE `user` = ? AND (`domainID` IS NULL OR domainID = ?) ';

                connection.query(query, [user, domainID], function (err, rows) {

                    connection.destroy();

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
}

function setUserID( printhouseID, userID, orderID)
{
    var def = Q.defer();

    try {
        getPrinthouseDatabase(printhouseID).then( function( databaseSettings ) {

            if (typeof pools[printhouseID] === undefined) {
                databaseSettings['charset'] = 'UTF8_GENERAL_CI';
                databaseSettings['host'] = mainConf.vpsDb.host;
                pools[printhouseID] = mysql.createPool(databaseSettings);
            }

            pools[printhouseID].getConnection(function(err, connection) {

                var query = ' UPDATE `dp_orders` SET `userID` = ? WHERE `ID` = ? ';

                connection.query(query, [userID, orderID], function (err, rows) {

                    connection.destroy();

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

function findMatchSession( user, companyID, sessionID ) {

    var def = Q.defer();

    getMysqlControllers(companyID).then( function(controllers) {
        controllers.Order.getLastUserOrder(user.ID).then(function (orderData) {
            if (orderData) {
                SessionControllerObject.getByOrder(orderData.ID).then(function (session) {
                    def.resolve(session)
                })
            } else {
                SessionControllerObject.get( sessionID ).then( function( session ) {
                    if(session) {
                        def.resolve(session);
                    } else {
                        def.resolve(false);
                    }
                })
            }
        });
    });

    return def.promise;

}

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
                    def.reject({'error':"current_password_incorrect",'response': false});
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
                profile.block = _user.block;
                profile.date = Date.now();
                profile.super = 0;
                profile.domainID = domainID;
                var actTime = new Date();

                SessionControllerObject.get( sessionID ).then( function( session ) {
                //findMatchSession(_user, companyID, sessionID).then( function( session ) {

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

                            console.log(profile);
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
}

function loginGoogle(email, domainID, companyID, decodedToken) {
    var def = Q.defer();

    try {

        // tu przez mysql
        getGoogleUser( companyID, email, domainID ).then(function( _user ) {

            if( _user === null ){

                def.reject({'error':"Brak usera",'response': false});

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
                profile.block = _user.block;
                profile.date = Date.now();
                profile.super = 0;
                profile.domainID = domainID;
                profile.service = 'google';
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
        console.log('Err in try: ');
        console.log(err);
        def.reject(err);
    }

    return def.promise;
}

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
            profile.block = _user.block;
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

                connection.destroy();

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

                connection.destroy();

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
            if(err){
                console.fs('Problem z połączeniem');
                console.fs(connectData);
                console.fs(err);
                return def.reject(err);
            }
            connection.query('SELECT * FROM `dp_domains` WHERE host = ? ', [domainName], function(err, rows) {

                connection.destroy();

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

	try {

		getRootDomain( domainName ).then( function( domainData ) {

			var companyID = domainData['companyID'];

			getDbUser( companyID ).then( function( userName ) {

				getDbData( companyID ).then( function( dbData ) {

					var connectData = { host: mainConf.rootDb.host,
									    user: 'v_'+userName['user'],
									    password: dbData['dbpass'],
									    database : dbData['database'] };

					getDomain(connectData, domainName, companyID).then( function( domainData ) {

					    if( req.body.service == 'google' ) {

                            var databaseName = 'editor_'+companyID;

                            db = connectionPool.getDatabaseConnection(databaseName);

                            var domainID = domainData['ID'];

                            var decodedToken = null;
                            if( headers.getHeader(req, accessTokenName) !== undefined ){
                                decodedToken = jwt.decode(headers.getHeader(req, accessTokenName), jwt_secret, 'HS256');
                            }
                            var loginUser = loginGoogle(req.body.email, domainID, companyID, decodedToken);
                            loginUser.then( function (loginData) {

                                var user = {
                                    firstname: loginData['profile'].first_name,
                                    lastname: loginData['profile'].last_name,
                                    login: loginData['profile'].login,
                                    userID: loginData['profile'].userID
                                };

                                if( loginData['profile'].super !== undefined && loginData['profile'].super == 1 ) {
                                    user.super = true;
                                }

                                if( loginData['profile'].block === 1 ) {
                                    res.status(400).send({'error': 'user_blocked', 'data': {'userID': loginData['profile'].ID}});
                                    return;
                                }

                                res.json({
                                    token: loginData.token,
                                    'userID': loginData['profile'].userID,
                                    'domainID': domainID,
                                    'user': user,
                                    'orderID': loginData.orderID,
                                    'addresses': loginData['addresses'],
                                    'service': loginData['profile'].service !== undefined ? loginData['profile'].service : null
                                });

                            }).fail(function (error) {
                                console.fs(error);
                                res.status(400).send(error);
                            }).fin(function () {
                                console.fs('wykonało się');
                            });

                        } else if( !req.body.password || !req.body.email || !domainName ){
							res.status(400).send({'error': 'select_all_required_fields', 'data': req.body.toString()});
						} else {

							var databaseName = 'editor_'+companyID;

                            db = connectionPool.getDatabaseConnection(databaseName);

							var domainID = domainData['ID'];

							var decodedToken = null;
							if( headers.getHeader(req, accessTokenName) !== undefined ){
								decodedToken = jwt.decode(headers.getHeader(req, accessTokenName), jwt_secret, 'HS256');
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

                                if( loginData['profile'].block === 1 ) {
                                    res.status(400).send({'error': 'user_blocked', 'data': {'userID': loginData['profile'].ID}});
                                    return;
                                }

                                res.json({
                                    token: loginData.token,
                                    'userID': loginData['profile'].userID,
                                    'domainID': domainID,
                                    'user': user,
                                    'orderID': loginData.orderID,
                                    'addresses': loginData['addresses'],
                                    'sid': loginData['profile'].sessionID
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

					var connectData = { host: mainConf.vpsDb.host,
									    user: 'v_'+userName['user'],
									    password: dbData['dbpass'],
									    database : dbData['database'] };

					getDomain(connectData, domainName, companyID).then( function( domainData ) {

						var databaseName = 'editor_'+companyID;

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

            db = connectionPool.getDatabaseConnection(databaseName);

			var decodedToken = jwt.decode(headers.getHeader(req, accessTokenName), jwt_secret, 'HS256');

			SessionControllerObject.get( decodedToken.sessionID ).then( function( session ) {

				if( session === null ){
					res.json({'error': 'error', 'response': false});
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

            db = connectionPool.getDatabaseConnection(databaseName);

			var decodedToken = jwt.decode(headers.getHeader(req, accessTokenName), jwt_secret, 'HS256');

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

            db = connectionPool.getDatabaseConnection(databaseName);

			var decodedToken = jwt.decode(headers.getHeader(req, accessTokenName), jwt_secret, 'HS256');

			var calcID = Number(req.body.calcID);
			var orderID = Number(req.body.orderID);
			var productID = Number(req.body.productID);

			Cart.findOne( { 'calcID': calcID, 'orderID': orderID, 'productID': productID }, function( err, oneCart  ) {

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
	                        			SessionControllerObject.get( decodedToken.sessionID ).then( function( newSession ) {
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

			var decodedToken = jwt.decode(headers.getHeader(req, accessTokenName), jwt_secret, 'HS256');

            if( decodedToken === null ) {
                res.json([]);
            }

			SessionControllerObject.get( decodedToken.sessionID ).then( function( session ) {

				res.json(session.addresses);

			}, function(err) {
			    console.log('err:', err);
            });


		});
	} catch( err ) {
        console.log('addresses exception:', err);
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

            db = connectionPool.getDatabaseConnection(databaseName);

			var decodedToken = jwt.decode(headers.getHeader(req, accessTokenName), jwt_secret, 'HS256');

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

            db = connectionPool.getDatabaseConnection(databaseName);

			var decodedToken = jwt.decode(headers.getHeader(req, accessTokenName), jwt_secret, 'HS256');

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

            db = connectionPool.getDatabaseConnection(databaseName);

			var decodedToken = jwt.decode(headers.getHeader(req, accessTokenName), jwt_secret, 'HS256');

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

			var companyID = domainData['companyID'];


			getDbUser( companyID ).then( function( userName ) {

				getDbData( companyID ).then( function( dbData ) {

					var connectData = { host: mainConf.vpsDb.host,
									    user: 'v_'+userName['user'],
									    password: dbData['dbpass'],
									    database : dbData['database'] };

					getDomain(connectData, domainName, companyID).then( function( domainData ) {

						if( !req.body.email || !domainName ){
							res.status(400).send({'error': 'select_all_required_fields', 'data': req.body.toString()});
						} else {

							var databaseName = 'editor_'+companyID;

                            db = connectionPool.getDatabaseConnection(databaseName);

							var domainID = domainData['ID'];

							var decodedToken = null;
							if( headers.getHeader(req, accessTokenName) !== undefined ){
								decodedToken = jwt.decode(headers.getHeader(req, accessTokenName), jwt_secret, 'HS256');
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

            db = connectionPool.getDatabaseConnection(databaseName);

            var decodedToken = jwt.decode(headers.getHeader(req, accessTokenName), jwt_secret, 'HS256');

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

app.post('/cart/joinAddresses', function(req, res) {

    var domainName = req.query.domainName;
    if( domainName === undefined ){
        domainName = req.body.domainName;
    }

    var addressID = parseInt(req.body.addressID);
    var active = (req.body.active === "true");
    var commonDeliveryID = parseInt(req.body.commonDeliveryID);
    var commonRealisationTime = req.body.commonRealisationTime;

    try {

        getRootDomain( domainName ).then( function( domainData ) {
            var companyID = domainData['companyID'];
            var databaseName = 'editor_'+companyID;

            db = connectionPool.getDatabaseConnection(databaseName);

            var decodedToken = jwt.decode(headers.getHeader(req, accessTokenName), jwt_secret, 'HS256');

            SessionControllerObject.get( decodedToken.sessionID ).then( function( session ) {

                CartControllerObject.joinAddresses(session.Carts, addressID, active, commonDeliveryID, commonRealisationTime).then( function(result) {
                    res.json({'active': active, addressID: addressID});
                });

            });

        });

    } catch (err){
        console.fs(err);
    }

});

app.post('/product/addresses', function(req, res) {

    var domainName = req.query.domainName;
    if( domainName === undefined ){
        domainName = req.body.domainName;
    }

    var orderID = req.body.orderID;
    var productID = req.body.productID;
    var productAddresses = req.body.productAddresses;

    try {

        getRootDomain( domainName ).then( function( domainData ) {
            var companyID = domainData['companyID'];
            var databaseName = 'editor_'+companyID;

            db = connectionPool.getDatabaseConnection(databaseName);

            var decodedToken = jwt.decode(headers.getHeader(req, accessTokenName), jwt_secret, 'HS256');

            SessionControllerObject.get( decodedToken.sessionID ).then( function( session ) {

                if( session ) {

                    var filteredProductAddresses = [];

                    productAddresses.forEach(function(address, addressIndex) {

                        var prepareAddress = {
                            "deliveryID": parseInt(address['deliveryID']),
                            "volume": parseInt(address['volume']),
                            "allVolume": parseInt(address['allVolume']),
                            "senderID": parseInt(address['senderID']),
                            "addressID": parseInt(address['addressID']),
                        };

                        if( address['collectionPointID'] !== undefined ) {
                            prepareAddress['collectionPointID'] = parseInt(address['collectionPointID']);
                        }

                        filteredProductAddresses.push(prepareAddress);
                    });

                    CartControllerObject.updateProductAddresses(orderID, productID, filteredProductAddresses).then(function(modifiedData) {
                        res.json({
                            'productAddresses': filteredProductAddresses,
                            'productID': productID,
                            'orderID': orderID,
                            'modifiedData': modifiedData,
                            'response': true
                        });
                    }, function(error) {
                        res.json({'error': true, 'info': 'error in update Cart', 'address': productAddresses});
                    });

                } else {
                    res.json({'error': true});
                }

            });

        });

    } catch (err){
        console.fs(err);
    }

});

app.post('/validFbLogin', function (req, res) {
    res.json({'valid': true});
});
