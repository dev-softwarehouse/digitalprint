var util = require('util');
console.fs = require('../libs/fsconsole.js');

var _ = require('underscore');
var Q = require('q');


var Controller = require("../controllers/Controller.js");
var SecretProof = require('../models/SecretProof.js').model;


function SecretProofController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;
    //AdminProjectController.super_.call(this);
    this.name = "SecretProofController";
    this.socketName = "SecretProof";
};

util.inherits(SecretProofController, Controller);

// 
SecretProofController.prototype.add = function(data) {
	


	var newSecretProof = new SecretProof();
	newSecretProof.userID = data.userID;
	// newSecretProof

};

module.exports = SecretProofController;