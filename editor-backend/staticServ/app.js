var paperboy = require('paperboy'),
    https = require('https'),
    path = require('path');
var fs = require('fs');
const certs = {key:fs.readFileSync('./certs/dreamsoft.pro/dreamsoft.pro.key'), cert:fs.readFileSync('./certs/dreamsoft.pro/dreamsoft.pro.cert')};
    

var webroot = path.join('/home/www/node/', 'uploads'),
    port = 1341;

https.createServer(certs, function(req, res) {
  var ip = req.connection.remoteAddress;
  paperboy
    .deliver(webroot, req, res)
    .addHeader('X-Powered-By', 'Atari')
    .addHeader('Access-Control-Allow-Origin','*')
    .addHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, lang')
    .addHeader('Access-Control-Allow-Credentials', true)
    .before(function() {
      console.log('Request received for ' + req.url);
    })
    .after(function(statusCode) {
      console.log(statusCode + ' - ' + req.url + ' ' + ip);
    })
    .error(function(statusCode, msg) {
      console.log([statusCode, msg, req.url, ip].join(' '));
      res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
      res.end('Error [' + statusCode + ']');
    })
    .otherwise(function(err) {
      console.log([404, err, req.url, ip].join(' '));
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Error 404: File not found');
    });
}).listen(port);

console.log('paperboy on port ' + port);
