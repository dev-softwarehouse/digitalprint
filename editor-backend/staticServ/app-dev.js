var paperboy = require('paperboy'),
    http = require('http'),
    https = require('https'),
    path = require('path'),
    fs = require('fs');

const arguments = process.argv.slice(2);
const useHttps = arguments[0] !== undefined && arguments[0] === 'true'

var webroot = 'c:/workspace/digitalprint/node-backend/uploads',
    port = 1341;
const serverFunction = (req, res) => {
    fs.stat(path.join(webroot, req.url),
        function (err, stat) {
            if (!stat || !stat.isFile()) {
                console.log('Not found ' + req.url);
                // req.url = '/px.png';
            }
            var ip = req.connection.remoteAddress;
            paperboy
                .deliver(webroot, req, res)
                .addHeader('X-Powered-By', 'Atari')
                .addHeader('Access-Control-Allow-Origin', '*')
                .addHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, lang')
                .addHeader('Access-Control-Allow-Credentials', true)
                .before(function () {
                    console.log('Request received for ' + req.url);

                })
                .after(function (statusCode) {
                    // console.log(statusCode + ' - ' + req.url + ' ' + ip);
                })
                .error(function (statusCode, msg) {
                    // console.log([statusCode, msg, req.url, ip].join(' '));
                    res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
                    res.end('Error [' + statusCode + ']');
                })
                .otherwise(function (err) {
                    //console.log([404, err, req.url, ip].join(' '));
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Error 404: File not found');
                });
        })


}
if (useHttps){
    const certs = { key: fs.readFileSync('../certs/lets/dreamsoft.pro/privkey.pem'), cert: fs.readFileSync('../certs/lets/dreamsoft.pro/cert2.pem') };
    https.createServer(certs, serverFunction).listen(port);
}
else{
    http.createServer(serverFunction).listen(port);
}
    
console.log('paperboy on port:' + port);
