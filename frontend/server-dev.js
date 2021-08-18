var express = require('express');
var app = express();
var serveStatic = require('serve-static')

app.use(serveStatic('app'));
app.use(serveStatic('dist'));

app.use('/*', function(req, res){
  res.sendFile(__dirname + '/app/index.html');
});

module.exports = app;
