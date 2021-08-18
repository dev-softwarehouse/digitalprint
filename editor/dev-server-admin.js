var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config.admin')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');

var cert = fs.readFileSync(path.join(__dirname, './serv.crt'));
var key = fs.readFileSync(path.join(__dirname, './serv.key'));
var ca = fs.readFileSync(path.join(__dirname, './domain.key')) + "\n" + fs.readFileSync(path.join(__dirname, './domain.csr'));
const useHttps = false;//TODO
var port = 1300;

const handler = {
    hot: true, stats: 'verbose'
}
if (useHttps) {
    handler.https = {
        cert: cert,
        key: key,

    }
}
new WebpackDevServer(webpack(config), handler).listen(port, 'edytor1.dreamsoft.pro', function (err, result) {

    if (err) {
        console.log(err);
    }

    console.log('Admin dev build listening on ' + port);

});