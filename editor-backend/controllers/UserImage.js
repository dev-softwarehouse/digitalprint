var util = require('util');
console.fs = require('../libs/fsconsole.js');
var Controller = require("../controllers/Controller.js");
var User = require('../models/User.js').model;
var UserFolder = require('../models/UserFolder.js').model;
var MainTheme = require('../models/MainTheme.js').model;
var View = require('../models/View.js').model;
var Theme = require('../models/Theme.js').model;
var mainConf = require('../libs/mainConf.js');
var jwt = require('jsonwebtoken');
var jwt_secret = mainConf.jwt_secret;
var Q = require('q');
var Upload = require('../controllers/UploadStandalone.js').Upload;

class UserImage {

	constructor( app ){

		this.app = app;
		this.initRouting();
		
	}

	initRouting(){

		this.uploadRoute();
		this.changeDataRoute();
		this.changeDataRoute();

	}

	uploadRoute(){

		this.app.put('/image-data', function( req, res ){

			console.log('Przyszlo info o jakims image data :P');
			res.send('Widzę ale jeszcze jest nie ogarniete dodawanie zdjęć');

		})

	}

	duplicateRoute(){

		this.app.post( '/image-data', function( req, res ){

			if( req.body.action == 'duplicate'){
				res.send('Chcesz zduplikowac zdjecie');
			}

		});


	}

	changeDataRoute(){

		this.app.post('/image-data/:dataid', function( req, res ){

			console.log('Widze kolejną zmianę');
			res.send('Zmiana danych zdjęć, takich jak miejsce na mapie, nazwa, folder rodzic, opis');

		});

	}


}

module.exports = {
	UserImage: UserImage
}