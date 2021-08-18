var fs = require('fs');
var app = require('../app.js');

var app = require('../app.js');
var conf = require('../confs/'+ app.companyID +'.js');

var companyID = 35;
module.exports.companyID = companyID;
module.exports.mainPort = 1345;
module.exports.staticPath = '/'+companyID;
module.exports.staticDir =  app.staticDir + companyID + '/';
module.exports.jwt_secret = '@!&#*@JHAKJHJKSD';
