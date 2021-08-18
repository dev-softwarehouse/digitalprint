module.exports.salt = process.env.salt;
module.exports.debug_mode = true;
module.exports.mkdir = function mkdir(path, root) {

    var dirs = path.split('/'), dir = dirs.shift(), root = (root||'')+dir+'/';

    try { fs.mkdirSync(root); }
    catch (e) {
        if(!fs.statSync(root).isDirectory()) throw new Error(e);
    }

    return !dirs.length||mkdir(dirs.join('/'), root);
};
module.exports.jwt_secret = process.env.secretKey;
module.exports.rootDb = {
    host: process.env.DB_MASTER_HOST,
    user: process.env.DB_MASTER_USER,
    password: process.env.DB_MASTER_PASSWORD,
    database : process.env.DB_MASTER_DATABASE,
    connectionLimit: process.env.DB_CONNECTION_LIMIT
};

module.exports.vpsDb = {
    host: process.env.DB_SETTINGS_HOST,
    user: process.env.DB_SETTINGS_USER,
    password: process.env.DB_SETTINGS_PASSWORD,
    database : process.env.DB_SETTINGS_DATABASE,
    connectionLimit: process.env.DB_CONNECTION_LIMIT
};
module.exports.accessTokenName = 'access-token';

module.exports.expireTime = "48h";

// 2*24*60*60*1000
module.exports.expireTimeInSeconds = 2*24*60*60*1000;

module.exports.mongoHost = process.env.MONGODB_HOST;
module.exports.mongoPort = process.env.MONGODB_PORT;
module.exports.mongoUser = process.env.MONGODB_USER;
module.exports.mongoPwd = process.env.MONGODB_PASS;

module.exports.apiDomain = process.env.API_DOMAIN;
module.exports.companyID = process.env.COMPANY_ID;


module.exports.crt = {
    cert: process.env.AUTH_CRT,
    key: process.env.AUTH_KEY,
    ca: process.env.AUTH_CA
};

module.exports.appWithSsl = process.env.APP_WITH_SSL;
module.exports.appPort = process.env.APP_PORT;
