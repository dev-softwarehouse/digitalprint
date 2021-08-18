conf = require('./mainConf.js');
crypto = require('crypto');

module.exports.hashPass = function hashPass(pass, saltOff){
	var sum = crypto.createHash('sha512');
	//console.fs(conf.salt);
	if( saltOff === false ){
		sum.update(pass + conf.salt);
	} else {
		sum.update(pass);
	}
  	
  	return sum.digest('hex');
};