var util = require('util');
console.fs = require('../libs/fsconsole.js');
var Controller = require("../controllers/Controller.js");
var User = require('../models/User.js').model;
var UserFolder = require('../models/UserFolder.js').model;
var UserEditor = require('../models/UserEditor.js').model;
var MainTheme = require('../models/MainTheme.js').model;
var View = require('../models/View.js').model;
var Theme = require('../models/Theme.js').model;
var ProjectImage = require('../models/ProjectImage.js').model;
var mainConf = require('../libs/mainConf.js');
var jwt = require('jsonwebtoken');
var jwt_secret = mainConf.jwt_secret;
var Q = require('q');
var mongoose = require('mongoose');
var _ = require('underscore');
const nodemailer = require('nodemailer');

class UserSessionController {

    constructor( token ){

        var _this = this;
        this.token = token;

    }

    getUser (){

        var def = Q.defer();

        var _this = this;


        if( !GLOBAL.sessions[this.token] ){

            var decodedToken = jwt.decode( this.token, jwt_secret, 'HS256');
            console.log( decodedToken );
            User.findOne({ userID: mongoose.Types.ObjectId(decodedToken.userEditorID) }).exec( function( err, user ){
                if( err ){
                    console.log( err );
                    _this.user = null
                    def.reject( err );
                }else {

                    if( user ){

                        _this.user = user;
                        def.resolve( user );

                    }else {

                        _this.user = null;
                        def.reject( { reason:'Brak uzytkownika', userID:decodedToken.userEditorID } );

                    }

                }
            });

        }else {

            var decodedToken = jwt.decode( this.token, jwt_secret, 'HS256');
            User.findOne({ userID: GLOBAL.sessions[this.token] }).exec( function( err, user ){

                if( err ){

                    console.log( err );
                    _this.user = null
                    def.reject( err );

                }else {

                    if( user ){

                        _this.user = user;
                        def.resolve( user );

                    }else {

                        _this.user = null
                        def.reject( { reason:'Brak uzytkownika', userID:decodedToken.userEditorID } );

                    }

                }

            });

        }

        return def.promise;

    }

}

module.exports = {
    UserSessionController: UserSessionController
}
