var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config.user')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');

var cert = fs.readFileSync(path.join(__dirname, './serv.crt'));
var key = fs.readFileSync(path.join(__dirname, './serv.key'));
var ca = fs.readFileSync(path.join(__dirname, './domain.key')) + "\n" + fs.readFileSync(path.join(__dirname, './domain.csr'));
const useHttps=false;//TODO
const handler={
	hot: true, stats: 'verbose', disableHostCheck:true
}
if(useHttps){
	handler.https= {
		cert: cert,
		key: key,

	}
}
const port=1400;
new WebpackDevServer(webpack(config), handler).listen(port, '127.0.0.1', function (err, result) {

	if (!err) {
		console.log(`server started on ${port}`);
	}else{
		console.error('error',err);
	}

});
