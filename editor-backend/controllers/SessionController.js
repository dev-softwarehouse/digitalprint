var util = require('util');

//var serialize = require("php-serialization").serialize;

console.fs = require('../libs/fsconsole.js');

var Q = require('q');

var generatorUID = require('../libs/generator.js');

var hashing =  require('../libs/hashingProof.js');

//var Controller = require("../controllers/Controller.js");
var Session = require('../models/Session.js').model;

function SessionController( ) {
	//this.socket = controller.socket;
	//this.io = controller.io;

    this.name = "SessionController";
    //this.socketName = "Session";
}

//util.inherits(SessionController, Controller);

SessionController.prototype.get = function( sid ){

		var def = Q.defer();

		Session.findOne({ 'sid':  sid  }, function( err, _session ) {
			if( err ){
				console.fs(err);
				def.reject(err);
			} else {
				//console.fs( _session );
				def.resolve(_session);
			}
			
		});

		return def.promise;

};

SessionController.prototype.check = function( sid ){

	var def = Q.defer();

	//var thisSession=new this.constructor();
	//console.fs('TU ???');
	this.get( sid ).then( function( _newSession ) {

		console.fs( _newSession );
		if( _newSession !== null ){
			sid = hashing.generate(27);
			thisSession.check( sid );
		} else {
			//console.fs( sid );
			def.resolve(sid);
		}
		
		def.reject(false);
	});

	return def.promise;
};

SessionController.prototype.add = function(data) {

	var def = Q.defer();

	var newSession = new Session();
	newSession.sid = hashing.generate(27);

	this.check( newSession.sid ).then( function( okSid ) {
		
		if( okSid.length > 0 ){

			newSession.valid = true;
			var now = new Date();
			newSession.ts = now;
			newSession.data = "";
			/*newSession.data.push({
				'user': {
					'firstname': data.first_name,
					'lastname': data.last_name,
					'ID': data.userID,
					'super': data.super,
					'user': data.email
				}
			});*/
			newSession.valid = true;
			newSession.save( function(err, saved) {
				//console.fs(err);
				if(err){
					def.reject(err);
				} else {
					def.resolve(saved);
				}
			});

		} else {
			def.reject({'error': 'Problem z hashem'});
		}
	});
	
	return def.promise;
		
};

SessionController.prototype.add2 = function(data) {

	var def = Q.defer();

	var newSession = new Session();
	newSession.sid = hashing.generate(27);

	this.check( newSession.sid ).then( function( okSid ) {
		
		if( okSid.length > 0 ){
			//console.fs('???????');
			//newSession.valid = true;
			var now = new Date();
			newSession.ts = now;
			var newData = {'test': 1};
			//console.fs( serialize(newData) );
			var newData = {};
			newData.user = {
					'firstname': data.first_name,
					'lastname': data.last_name,
					'ID': data.userID,
					'super': data.super,
					'user': data.email
				};
			//console.fs( 'tu' );
			newSession.data = JSON.stringify( newData );
			//console.fs( newSession );
			newSession.valid = true;
			//console.fs( '??????' );
			newSession.save( function(err, saved) {
				//console.fs(err);
				if(err){
					def.reject(err);
				} else {
					def.resolve(saved);
				}
			});

		} else {
			def.reject({'error': 'Problem z hashem'});
		}
	});
	
	return def.promise;
		
};

module.exports = SessionController;