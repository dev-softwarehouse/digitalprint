
var arguments = process.argv.slice(2);

var companyID = '35';
var mainPort = 1345;
var staticDir='/home/www/data/editor/';
let staticUrl='https://dreamsoft.pro:1341'
let domain='dreamsoft.pro'
let https=false

if( arguments[0] !== undefined && arguments[0].length > 0 ){
    companyID = arguments[0];
}
if( arguments[1] !== undefined && arguments[1].length > 1 ){
    mainPort = arguments[1];
}
if(arguments[2] !== undefined  && arguments[2].length > 1){
    staticDir=arguments[2];
}
if(arguments[3] !== undefined  && arguments[3].length > 1){
    staticUrl=arguments[3];
}
if(arguments[4] !== undefined  && arguments[4].length > 1){
    domain=arguments[4];
}
if(arguments[5] !== undefined  && arguments[5].length > 1){
    https=arguments[5]==='true';
}
GLOBAL.conf = {
	companyID,
	mainPort,
	staticDir: staticDir + companyID + '/',
	staticPath: '/'+companyID,
    staticUrl,
    domain,
    https,
}
module.exports.companyID = companyID;
module.exports.mainPort = mainPort;
module.exports.staticPath = '/'+companyID;
module.exports.staticDir =  staticDir + companyID + '/';
module.exports.staticUrl =  staticUrl;
module.exports.domain =  domain;
module.exports.https =  https;
module.exports.debug_mode = true;
module.exports.salt = 'Je$te$my_$-NajLp$I_#A#A!@#$%^&*';
module.exports.jwt_secret = '@!&#*@INNYSECRET';
module.exports.expireTime = (3600*5);


