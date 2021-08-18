var util = require('util');
var Q = require('q');
console.fs = require('../libs/fsconsole.js');


var Controller = require("../controllers/Controller.js");
var Connect = require('../models/Connect.js').model;
var AdminProject = require('../models/AdminProject.js').model;
var ComplexAdminProject = require('../models/ComplexAdminProject.js').model;

var generatorUID = require('../libs/generator.js');
var _ = require('underscore');

//var Generator = generator.Generator;

function ConnectController( controller ) {
	//console.fs(generator());
	this.socket = controller.socket;
	this.io = controller.io;
    //AdminProjectController.super_.call(this);
    this.name = "ConnectController";
    this.socketName = "Connect";
};

util.inherits(ConnectController, Controller);

// metody

ConnectController.prototype.new = function() {

	var _this = this;
	var def = Q.defer();

	Connect.find({})
    .sort('-connectID')
    .limit(1)
    .exec(function(err, doc){

    	if(err){
			def.reject(err);
    	}
    	if(doc !== null && doc.length > 0){
        	var newConnect = new Connect();
        	newConnect.connectID = (doc[0].connectID+1);
        	newConnect.save(function(err, saved) {

                _this.setLocalConnectID(saved.connectID);

        		def.resolve(saved);
    		});
    	} else {
    		var newConnect = new Connect();
        	newConnect.connectID = 1;
        	newConnect.save(function(err, saved) {
                if(err){
                    console.fs(err);
                    def.reject(err);
                } else {
                    console.log('New connect: '+saved.connectID);
                    def.resolve(saved);
                }
    		});
    	}

    });

    return def.promise;
};

ConnectController.prototype.delete = function( _connectID ) {


	Connect.findOne({connectID: _connectID}, function(err, _connect) {
		if(err){
			console.fs(err);
		} else {
			if(_connect !== null){
				_connect.remove(function(err, removed){
					if(err){
						console.fs(err);
					} else {
						console.fs('Usunięto połączenie: '+removed);
					}
				});
			}
		}
	});
};

ConnectController.prototype.setAdminProject = function() {
    var socketName = this.socketName;
    var socket = this.socket;
    socket.on(socketName+'.setAdminProject', function(data) {
        var adminProjectID = data.adminProjectID;
        var connectID = data.connectID;
        AdminProject.findOne({_id: adminProjectID}, function(err, _adminProject ) {
            if(err){
                console.fs(err);
            }
            Connect.findOne({id: connectID}, function(err, _connect) {
                if(err){
                    console.fs(err);
                }
                _connect.AdminProject = _adminProject;
                _connect.save(function(err, saved) {
                    socket.emit(socketName+'.setAdminProject', saved);
                });
            });
        });
    });
};

ConnectController.prototype.setView = function() {
    var socketName = this.socketName;
    var socket = this.socket;
    socket.on(socketName+'.setView', function(data) {
        var viewID = data.viewID;
        var connectID = data.connectID;
        View.findOne({_id: viewID}, function(err, _view ) {
            if(err){
                console.fs(err);
            }
            Connect.findOne({id: connectID}, function(err, _connect) {
                if(err){
                    console.fs(err);
                }
                _connect.View = _view;
                _connect.save(function(err, saved) {
                    socket.emit(socketName+'.setView', saved);
                });
            });
        });
    });
};

ConnectController.prototype.get = function() {
    var socketName = this.socketName;
    var socket = this.socket;
    socket.on(socketName+'.get', function(data) {
        if( data.adminProjectID === undefined){
            delete data.adminProjectID;
        }
        if( data.viewID === undefined){
            delete data.viewID;
        }
        Connect.findOne(data, function( err, _connect ){

        });

    });
};

ConnectController.prototype.clearDB = function( db ) {

};

ConnectController.prototype.createDB = function( db ) {

};

ConnectController.prototype.joinTo = function() {
    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;
    //console.fs(this.localConnectID);
    socket.on(socketName+'.joinTo', function(data) {
        //data.room
        if( data !== undefined ){
            var connectID = data.connectID;
            _this.setLocalConnectID(connectID);
            //socket.join('connect:'+connectID);
        }
    });
};

ConnectController.prototype.createAdminRoom = function() {
    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    function getAdminProjectFromFormat( formatID ){

        var def = Q.defer();

        AdminProject.findOne({ 'Formats':  formatID  }, function( err, _adminProject ) {

            if( err ){
                console.fs(err);
                def.reject(err);
            }

            def.resolve(_adminProject);

        });

        return def.promise;
    }

    function getFormatFromView( viewID ){

        var def = Q.defer();

        Format.findOne({ 'Views':  viewID  }, function( err, _format ) {

            if( err ){
                console.fs(err);
                def.reject(err);
            }

            def.resolve(_format);

        });

        return def.promise;
    }

    socket.on(socketName+'.createAdminRoom', function(data) {

        if( data !== undefined ){
            var roomType = data.roomType;
            var connectID = _this.getLocalConnectID();

            var roster = io.sockets.adapter.rooms[roomType+':'+data.objectID];

            if( roster === null || roster === undefined ){
                if( data.objectID === undefined ){
                    console.fs('Nie ma objectID');
                    return;
                }
                socket.join(roomType+':'+data.objectID, function (err, status) {
                    if(err){
                        console.fs(err);
                    }
                    socket.emit(socketName+'.createAdminRoom', 'created');
                });
            } else {

                if( roomType === 'View' ){
                    var parentFormat = getFormatFromView( data.objectID );
                    parentFormat.then( function( _format ) {
                        var parentAdminProject = getAdminProjectFromFormat( _format._id );
                        parentAdminProject.then( function ( _adminProject ){
                            var apRoster = io.sockets.adapter.rooms['AdminProject:'+_adminProject._id];

                            var joinedAdminProject = _.has(apRoster, socket.id);
                            if( joinedAdminProject ){

                                socket.join(roomType+':'+data.objectID, function (err, status) {
                                    if(err){
                                        console.fs('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--==-=-=-= ERROR bo już jest: ');
                                        console.fs(err);
                                    }
                                    socket.emit(socketName+'.createAdminRoom', 'created');
                                });
                            }
                        });
                    });
                } else {
                    var response = {};

                    var roster = io.sockets.adapter.rooms[roomType+':'+data.objectID];

                    var found = _.has(roster, data.socketID);

                    if( found ){

                        response.status = 'already_in_room';
                        response.socketID = resterKeys[0];
                        socket.emit(socketName+'.createAdminRoom', response);

                    } else {

                        response.status = 'room_not_empty';
                        var resterKeys = _.keys(roster);
                        response.socketID = resterKeys[0];
                        socket.emit(socketName+'.createAdminRoom', response);

                    }

                }
            }
        }
    });
};

ConnectController.prototype.requestCooperate = function() {
    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    socket.on(socketName+'.requestCooperate', function(data){
        var roomType = data.roomType;
        socket.broadcast.to(data.socketID).emit(socketName+'.requestCooperate', {'socketID': socket.id, 'roomType': roomType});
    });
};

ConnectController.prototype.respondCooperate = function() {
    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;

    function getComplexAdminProject( projectID ){

        var def = Q.defer();

        ComplexAdminProject.findOne({ '_id':  projectID  }, function( err, _complexAdminProject ) {

            if( err ){
                console.fs(err);
                def.reject(err);
            }

            def.resolve(_complexAdminProject);

        });

        return def.promise;
    }

    function getAdminProject( projectID ){

        var def = Q.defer();

        AdminProject.findOne({ '_id':  projectID  }, function( err, _adminProject ) {

            if( err ){
                console.fs(err);
                def.reject(err);
            }

            def.resolve(_adminProject);

        });

        return def.promise;
    }

    socket.on(socketName+'.respondCooperate', function(data){
        var roomType = data.roomType;
        var roster = io.sockets.adapter.rooms[roomType+':'+data.objectID];

        var found = _.has(roster, data.socketID);
        var res = {};
        if( data.respond === 'yes' ){
            var actSocket = _.findWhere(io.sockets.sockets, {id: data.socketID});
            if( found ){
                res.status = 'exist';
                socket.broadcast.to(data.socketID).emit(socketName+'.respondCooperate', res );
            } else {
                actSocket.join(roomType+':'+data.objectID, function (err, status) {
                    if(err){
                        console.fs(err);
                    }
                    res.status = 'joined';
                    res.objectID = data.objectID;
                    res.roomType = data.roomType;
                    //console.fs('roomType');
                    //console.fs( data.roomType );
                    if( data.roomType === 'ComplexAdminProject' ){
                        getComplexAdminProject( data.objectID ).then( function( _item ){
                            res.item = _item;
                            socket.broadcast.to(data.socketID).emit(socketName+'.respondCooperate', res);
                        });
                    } else if( data.roomType === 'AdminProject' ) {
                        getAdminProject( data.objectID ).then( function( _item ){
                            res.item = _item;
                            socket.broadcast.to(data.socketID).emit(socketName+'.respondCooperate', res);
                        });
                    }
                });
            }
        } else {
            res.status = 'rejected';
            socket.broadcast.to(data.socketID).emit(socketName+'.respondCooperate', res);
        }
    });
};

ConnectController.prototype.unsetRooms = function() {

    var socketName = this.socketName;
    var socket = this.socket;
    var _this = this;
    //console.fs(this.localConnectID);
    socket.on(socketName+'.unsetRooms', function(data) {

        socket.emit(socketName+'.unsetRooms', true);

    });

};

module.exports = ConnectController;
