var util = require('util');
console.fs = require('../libs/fsconsole.js');

var Controller = require("../controllers/Controller.js");
var ThemeCategory = require('../models/ThemeCategory.js').model;

function ThemeCategoryController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "ThemeCategoryController";
    this.socketName = "ThemeCategory";
}

util.inherits(ThemeCategoryController, Controller);

// metody
ThemeCategoryController.prototype.add = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.add', function(data){
		//console.fs('dodawanie:');
		//console.fs(data);
		var newThemeCategory = new ThemeCategory({name: data.name});
		
		newThemeCategory.findOne(function(err, tc){
			if( tc !== null ){
				console.fs('Obiekt istnieje');
				socket.emit(socketName+'.exist', tc);
			} else {
				console.fs('Dodano.');
				newThemeCategory.save( function(err, last) {
					if(err){
						console.fs(err);
					}
					ThemeCategory.find({}, function(err, all) {
						console.fs(all);
						io.sockets.emit(socketName+'.added', all);
					});
				});
				
				
			}
		});
	});

};

ThemeCategoryController.prototype.getAll = function() {
	var socketName = this.socketName;
	var socket = this.socket;
	socket.on(socketName+'.getAll', function(data) {
		//var list = [];
		//console.fs('Lista:');
		ThemeCategory.find({}, function(err, tc) {
			console.fs(tc);
			if( !err && tc !== null ){
				socket.emit(socketName+'.getAll', tc);
			} else {
				socket.emit(socketName+'.getAll', []);
			}
		});
		
	});
};


module.exports = ThemeCategoryController;