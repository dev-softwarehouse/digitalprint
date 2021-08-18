var util = require('util');
console.fs = require('../libs/fsconsole.js');

//var conf = require('../libs/conf.js');


var Controller = require("../controllers/Controller.js");

function EditorObjectController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "EditorObjectController";
    this.socketName = "ProposedTemplate";
}

// główny kontroler podpinamy
util.inherits(EditorObjectController, Controller);

// metody
EditorObjectController.prototype.move = function() {
	var socketName = this.socketName;
	var socket  = this.socket;
	socket.on(socketName+'.move', function(data) {
		//console.log('Dostaje!');
		//console.log(data);
		io.sockets.emit( socketName+'.move', data );
	});
};

EditorObjectController.prototype.scale = function() {
	var socketName = this.socketName;
	var socket  = this.socket;
	socket.on(socketName+'.scale', function(data) {
		io.sockets.emit( socketName+'.scale', data );
	});
};

EditorObjectController.prototype.rotate = function() {
	var socketName = this.socketName;
	var socket  = this.socket;
	socket.on(socketName+'.rotate', function(data) {
		io.sockets.emit( socketName+'.rotate', data );
	});
};

module.exports = EditorObjectController;