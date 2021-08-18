var util = require('util');
console.fs = require('../libs/fsconsole.js');
var path = require('path');
var fs = require('fs');
var dateFormat = require('dateformat');
var Q = require('q');
var _ = require('underscore');
var mainConf = require('../libs/mainConf.js');
var AdminProject = require("../models/AdminProject.js").model;
var Controller = require("../controllers/Controller.js");
var ComplexUserProject = require('../models/ComplexUserProject.js').model;
var ProductType = require('../models/ProductType.js').model;
var Format = require('../models/Format.js').model;
var ProductTypeController = require('../controllers/ProductTypeController.js');
var ThemeController =       require('../controllers/ThemeController.js');
var UserPageController = require('../controllers/UserPageController.js');
var ProjectImage = require('../models/ProjectImage.js').model;
var Theme = require('../models/Theme.js').model;
var UserView = require('../models/UserView.js').model;
var UserPage = require('../models/UserPage.js').model;
var ProposedImageController = require('../controllers/ProposedImageController.js');
var ProposedImage = require('../models/ProposedImage.js').model;
var ProposedTemplate = require('../models/ProposedTemplate').model;
var ProjectImageController = require('../controllers/ProjectImageController.js');
var User = require('../models/User.js').model;
var jwt = require('jsonwebtoken');
var jwt_secret = mainConf.jwt_secret;
const nodemailer = require('nodemailer');

function ComplexUserProjectController( controller ) {

	this.socket = controller.socket;
	this.io = controller.io;

    this.name = "ComplexUserProjectController";
    this.socketName = "ComplexUserProject";

}


util.inherits(ComplexUserProjectController, Controller);

ComplexUserProjectController._addView = function( projectID, previousPageID, nextPageID ){



};


module.exports = ComplexUserProjectController;
