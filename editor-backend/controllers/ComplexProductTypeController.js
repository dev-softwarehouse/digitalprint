var util = require('util');
console.fs = require('../libs/fsconsole.js');


var Controller = require("../controllers/Controller.js");
var ComplexProductType = require('../models/ComplexProductType.js').model;

function ComplexProductTypeController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;
    //AdminProjectController.super_.call(this);
    this.name = "ComplexProductTypeController";
    this.socketName = "ComplexProductType";
};

util.inherits(ComplexProductTypeController, Controller);

ComplexProductTypeController.prototype.get = function() {
	var socketName =  this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.get', function(data) {
		var response = {};
		ComplexProductType.findOne({typeID: data.typeID}, function(err, _complexProductType){
			if(err){
				console.fs(err);
			} else {
				if(_complexProductType === null){
					response.status = 'empty';
					response.item = [];
					socket.emit( socketName+'.get', response );
				} else {
					response.status = 'ok';
					response.item = _complexProductType;
					socket.emit( socketName+'.get', response );
				}
			}
		});
	});
};

ComplexProductTypeController.prototype.add = function() {

	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.add', function(data) {
		
		var newComplexProductType = new ComplexProductType({ typeID: data.typeID });
		newComplexProductType.save( function(err, saved){
			if(err){
				console.fs(err);
			} else {
				socket.emit( socketName+'.add', saved);
			}
		});
	});

};

module.exports = ComplexProductTypeController;