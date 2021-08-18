var util = require('util');
console.fs = require('../libs/fsconsole.js');

var Controller = require("../controllers/Controller.js");

function TestController( controller ) {
	//var io;
	//var socket
	this.socket = controller.socket;
	//console.log(controller.io);
	//this.io = controller.io;

    this.name = "TestController";
    this.socketName = "Test";
}

util.inherits(TestController, Controller);

TestController.prototype.konRafal = function(){
	var socketName = this.socketName;
	var socket = this.socket;
	//console.log(this.io.sockets.emit('test','test') );
	socket.on(this.socketName+'.konRafal', function(data) {
		console.fs('konRafal - data: ');
		console.fs(data);
		data['zwrot'] = 'trzym';
		io.sockets.emit( 'krecik', data );
	});
	
}

module.exports = TestController;