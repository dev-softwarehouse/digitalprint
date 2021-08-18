var util = require('util');
console.fs = require('../libs/fsconsole.js');

function Controller(io, socket) {
	//console.log('Klasa');
	//this.io = io;
	this.socket = socket;
	this.localConnectID = null;
	this.setCompanyID = null;
};

Controller.prototype.setCompanyID = function( companyID ) {
    this.companyID = companyID;
};

Controller.prototype.getCompanyID = function(  ) {
    return this.companyID;
};

Controller.prototype.getSocket = function() {
    return this.socket;
};

Controller.prototype.setLocalConnectID = function( ID ){
	//this.localConnectID = ID;
	this.socket.connectID = ID;
};

Controller.prototype.getLocalConnectID = function() {
	//return this.localConnectID;
	return this.socket.connectID;
};

module.exports = Controller;