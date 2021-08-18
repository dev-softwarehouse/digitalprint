var fs = require('fs');

var app = require('../app.js');
var companyID = app.companyID;

//var companyID = 25;
module.exports.companyID = companyID;
module.exports.mainPort = 1351;
module.exports.staticPath = '/'+companyID;
module.exports.staticDir =  app.staticDir + companyID + '/';
module.exports.jwt_secret = '@!&#*@INNYSECRET';
