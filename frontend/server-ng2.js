var express = require('express');
var app = express();
var serveStatic = require('serve-static')

app.use(serveStatic('.'));

app.use('/*', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

module.exports = app;
