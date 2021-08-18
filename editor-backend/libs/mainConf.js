module.exports.salt = 'Je$te$my_$-NajLp$I_#A#A!@#$%^&*';
module.exports.debug_mode = true;
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
module.exports.jwt_secret = '@!&#*@INNYSECRET';
module.exports.rootDb = {
    host: 'localhost',
	user: 'dp_user',
	password: 'be091eb0189MSQLR',
	database : 'dp'
};

module.exports.vpsDb = {
    host: 'localhost',
    user: 'vprojekt_select',
    password: 'A88d1QWf7e94ef7N',
    database : 'vprojekt'
};

module.exports.smtp = {
    host: 'smtp.efotogallery.pl',
    userName: 'zamowienia@efotogallery.pl',
    pass: 'Mm2h76y^',
    port: '587'
}

module.exports.expireTime = (3600*5);
