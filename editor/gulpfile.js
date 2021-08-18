var gulp = require('gulp');
// var webserver = require('gulp-webserver');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var stripDebug = require('gulp-strip-debug');
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var Q = require('q');
var JSFtp = require("jsftp");
var handlebars = require("handlebars");
var babel = require('gulp-babel');

var testBuild = false;

gulp.task('build', function () {
    var buildStatus = doBuild();

    console.log('build status: ' + buildStatus);
});

function makeVersion(companyID, port, domain, frameworkUrl, authUrl, staticUrl, versionStamp,forFtp) {

    var defer = Q.defer();
    var admin = false;
    var user = false;
    var indexFiles = true;

    var indexFile = fs.readFileSync('./app/index_template.html', 'utf8');
    var templateData = {"companyID": companyID, versionStamp: versionStamp,script:forFtp?'/prod/dist/editor_user_'+versionStamp+'.min.js':'editor_user_'+versionStamp+'.min.js'};
    var template = handlebars.compile(indexFile);
    var result = template(templateData);

    var indexFileAdmin = fs.readFileSync('./app/index_template_admin.html', 'utf8');
    var templateDataAdmin = {"companyID": companyID, versionStamp: versionStamp};
    var templateAdmin = handlebars.compile(indexFileAdmin);
    var resultAdmin = templateAdmin(templateDataAdmin);
    var dir = __dirname + '/dist/';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    fs.writeFileSync('./dist/index_prod_user.html', result);
    fs.writeFileSync('./dist/index_prod_admin.html', resultAdmin);

    var admin_compiler = webpack({

        entry: './app/index.js',
        devtool: 'source-map',
        output: {
            filename: 'editor_admin.min.js',
            path: path.resolve(__dirname, 'dist/')
        },

        plugins: [
            new webpack.DefinePlugin({
                'EDITOR_ENV': {user: false, admin: true, companyID: companyID, port: port, domain: domain, frameworkUrl: frameworkUrl, authUrl: authUrl, staticUrl: staticUrl}
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify('production')
                }
            }),
            new webpack.optimize.UglifyJsPlugin(),

        ],

        module: {

            loaders: [

                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    query: {
                        compact: false,
                        presets: ['react', 'es2015', 'stage-2']
                    }
                }

            ]

        }

    });

    admin_compiler.run(function (err, stats) {

        if (err) {
            console.log(err);
            defer.reject(err);
        } else {
            admin = true;
            checkDone();
        }

    });


    var user_compiler = webpack({

        entry: './app/index.js',
        devtool: 'source-map',
        output: {
            filename: 'editor_user.min.js',
            path: path.resolve(__dirname, 'dist/')
        },

        plugins: [
            new webpack.DefinePlugin({
                'EDITOR_ENV': {user: true, admin: false, companyID: companyID, port: port, domain: domain, frameworkUrl: frameworkUrl,  authUrl: authUrl, staticUrl: staticUrl}
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify('production')
                }
            }),
            new webpack.optimize.UglifyJsPlugin(),

        ],

        module: {

            loaders: [

                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    query: {
                        compact: false,
                        presets: ['react', 'es2015', 'stage-2']
                    }
                }

            ]

        }

    });

    user_compiler.run(function (err, stats) {

        if (err) {

            console.log(err);
            defer.reject(err);

        } else {
            user = true;
            checkDone();
        }

    });

    function checkDone() {

        if (admin && user && indexFiles) {
            defer.resolve(companyID);
        }

    }

    return defer.promise;

}

function doBuild() {
    var args = require('yargs').argv;
    var productions = JSON.parse(fs.readFileSync('buildConfig.json', 'utf8'))['dev'];
    var createdProds = [];
    var postProd = 0;
    const dateFormat=(n)=>`${n}`.length===2?`${n}`:`0${n}`
    const d = new Date();
    const versionStamp = `${d.getFullYear()}${dateFormat(d.getMonth()+1)}${dateFormat(d.getDate())}${dateFormat(d.getHours())}${dateFormat(d.getMinutes())}`;
    for (var i = 0; i < productions.length; i++) {

        var prodVer = productions[i];
        var prodData = makeVersion(args.companyID, args.port, JSON.stringify(args.domain), JSON.stringify(args.frameworkUrl),  JSON.stringify(args.authUrl), JSON.stringify(args.staticUrl), versionStamp,args.forFtp);
        prodData.then(
            //ok
            function (prod) {
                postProd++;
                createdProds.push(prod);
                return status();
            },
            //err
            function (err) {

                postProd++
                console.log(err);
                console.log('Nie udalo sie zbudowac ');
                return status();

            }
        );

    }

    function status() {

        console.log("Przygotowane paczki [" + productions.length + "/" + createdProds.length + "]");
        if (postProd == productions.length) {
            console.log('Paczki zostały przeiterowane');

            if (createdProds.length == productions.length) {

                console.log('Wszystkie paczki utworzone.');

                console.log('opcje: ', args);

                if(args.upload){
                    pushFiles(createdProds, versionStamp);
                }else{

                    var filePath = './dist/editor_user.min.js';

                    fs.access(filePath, fs.F_OK, function(err) {
                        if (err) {
                            console.error(err)
                            return;
                        }

                        console.log('Plik: ' + filePath + ' - istnieje!');
                        //file exists
                    });

                    fs.copyFile('./dist/editor_user.min.js','./app/editor_user_' + versionStamp + '.min.js',(er)=>{
                        if(!er) {
                            fs.copyFile('./dist/index_prod_user.html','./app/index.html',(er)=>{
                                if(er) {
                                    console.log(er);
                                    return false;
                                } else {
                                    return true;
                                }
                            });
                        } else {
                            console.log(er);
                            return false;
                        }

                    });

                }
            } else {

                console.log('Błąd podczas generacji paczek.');
            }

        }

    }

    function pushFiles(companies, versionStamp) {

        var ftp = new JSFtp({
            host: "94.23.90.166",
            user: "upload", // defaults to "anonymous"
            pass: "!@sushiFtp2018#$" // defaults to "@anonymous"
        });

        ftp.ls('./editor/prod', function (err, res) {

            if (err) {
                console.log('ERR 1');
                console.log(err);
                return false;
            } else {

                var currentID = 0;

                return uploadQueue(currentID, ftp, res, versionStamp);

            }

        });

        function uploadQueue(currentID, ftp, res, versionStamp) {
            singleCompanyUpload(companies[currentID], ftp, res, versionStamp).then(
                function () {
                    currentID++;
                    if (companies[currentID]) {
                        uploadQueue(currentID, ftp, res, versionStamp);
                    } else {
                        console.log('Uploaded all companies');
                        return true;
                    }
                }
            );
        }
    }
}

function checkCompanyDir(companyID, dirs) {

    for (var i = 0; i < dirs.length; i++) {

        if (dirs[i].name == companyID) {
            return true;
        }

    }

    return false;

}

function singleCompanyUpload(companyID, ftp, directories, versionStamp) {
    console.log(`Upload companyId ${companyID} ...`);
    var def = Q.defer();
    if (testBuild) {
        def.resolve();
    }
    if (!testBuild && checkCompanyDir(companyID, directories)) {

        ftp.put('./dist/' + companyID + '/editor_admin.min.js', './editor/prod/' + companyID + '/dist/editor_admin_' + versionStamp + '.min.js', function (err, res) {

            if (err) {
                console.log('ERR2');
                console.log(err);
            } else {
                ftp.put('./dist/' + companyID + '/editor_user.min.js', './editor/prod/' + companyID + '/dist/editor_user_' + versionStamp + '.min.js', function (err, res) {

                    if (err) {
                        console.log('ERR2');
                        console.log(err);
                    } else {

                        ftp.put('./dist/' + companyID + '/index_prod_admin.html', './editor/prod/' + companyID + '/index_prod_admin.html', function (err, res) {

                            if (err) {
                                console.log('ERR2');
                                console.log(err);
                            } else {

                                ftp.put('./dist/' + companyID + '/index_prod_user.html', './editor/prod/' + companyID + '/index_prod_user.html', function (err, res) {

                                    if (err) {
                                        console.log('ERR2');
                                        console.log(err);
                                    } else {
                                        console.log('OK :)');
                                        def.resolve();
                                    }

                                });

                            }

                        });

                    }

                });
            }

        });

    } else {

    }

    return def.promise;

}
