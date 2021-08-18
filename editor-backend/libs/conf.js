var fs = require('fs');
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
module.exports.jwt_secret = '@!&#*@JHAKJHJKSD';
module.exports.salt = 'Je$te$my_$-NajLp$I_#A#A!@#$%^&*';
module.exports.expireTimeInSeconds = 2*24*60*60*1000;
