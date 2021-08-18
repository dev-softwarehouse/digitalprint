var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./demo/webpack.config')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');

var cert = fs.readFileSync(path.join(__dirname, './serv.crt'));
var key = fs.readFileSync(path.join(__dirname, './serv.key'));
var ca = fs.readFileSync(path.join(__dirname, './domain.key')) + "\n" + fs.readFileSync(path.join(__dirname, './domain.csr'));

const port = 1410
const domain = 'edytor.dreamsoft.pro'
new WebpackDevServer(webpack(config), {

    https: {
        cert: cert,
        key: key,

    }, hot: true, stats: 'verbose'

}).listen(port, domain, function (err, result) {

    if (err) {
        console.log(err);
    }

    console.log(`demo listening https://${domain}:${port}`);

});
