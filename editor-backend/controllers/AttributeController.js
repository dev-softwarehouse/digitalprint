var util = require('util');
console.fs = require('../libs/fsconsole.js');

var generatorUID = require('../libs/generator.js');

var Controller = require("../controllers/Controller.js");
var Attribute = require('../models/Attribute.js').model;
var Format = require('../models/Format.js').model;

function AttributeController( controller ) {
	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "AttributeController";
    this.socketName = "Attribute";
}

util.inherits(AttributeController, Controller);

// metody
AttributeController.prototype.add = function() {

	var socketName = this.socketName;
	
	var socket = this.socket;
	socket.on(socketName+'.add', function(data) {

		var formatID = data.formatID;
		var newAttribute = new Attribute({attributeID: data.attributeID, attributeName: data.attributeName});

		if( data.attributeOptions !== undefined && data.attributeOptions.length > 0 ){

			for (var aptID in data.attributeOptions) {
				var nextOption = {optionID: optID, optionName: data.attributeOptions[optID].name };
				newAttribute.Options.push(nextOption);
			}
			
		}

		newAttribute.save( function( err, savedAttr ){
			if( err ){
				console.fs(err);
			}
			Format.findOne({_id: formatID}, function(err, ft){
				ft.Attributes.push(savedAttr);
				ft.save( function( err, formatSaved ){
					if(err){
						console.fs(err);
					}
					Format.findOne({_id: formatID}, function(err, ft){
						if(err){
							console.fs(err);
						}
						if( ft.Attributes !== undefined ){
							io.sockets.emit(socketName+'.added', ft.Attributes);
						} else {
							io.sockets.emit(socketName+'.added', {});
						}
						
					}).populate('Attributes');
				});
			});
		});
	});

};

module.exports = AttributeController;