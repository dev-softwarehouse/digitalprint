var express = require('express');
var fs = require('fs');
var path = require('path');
var https = require('https');

var app = express();
https.createServer({
    key: fs.readFileSync('encryption/server.key'),
    cert: fs.readFileSync('encryption/server.cert')
}, app).listen(443);

var serveStatic = require('serve-static');

app.use(serveStatic('app'));
app.use(serveStatic('dist'));

app.use('/*', function(req, res){
  res.sendFile(__dirname + '/app/index.html');
});

module.exports = app;
