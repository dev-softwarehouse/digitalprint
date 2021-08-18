var fs = require('fs');

var companyID = 668;
module.exports.companyID = companyID;
module.exports.mainPort = 1350;
module.exports.staticPath = '/'+companyID;
module.exports.staticDir =  app.staticDir + companyID + '/';
module.exports.mkdir = function mkdir(path, root) {

    var dirs = path.split('/'), dir = dirs.shift(), root = (root||'')+dir+'/';

    try { fs.mkdirSync(root); }
    catch (e) {
    	//console.log('tutu');
        //dir wasn't made, something went wrong
        if(!fs.statSync(root).isDirectory()) throw new Error(e);
    }

    return !dirs.length||mkdir(dirs.join('/'), root);
};
module.exports.debug_mode = true;
module.exports.jwt_secret = 'J@K151NN%5ECRETKE%';
module.exports.salt = 'Je$te$my_$-NajLp$I_#A#A!@#$%^&*';