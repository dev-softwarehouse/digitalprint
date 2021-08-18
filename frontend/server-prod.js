var express = require('express');
var app = express();
var serveStatic = require('serve-static')

app.use(serveStatic('dist'));

app.use('/*', function(req, res){
  res.sendFile(__dirname + '/dist/index.tmp.html');
});

module.exports = app;
