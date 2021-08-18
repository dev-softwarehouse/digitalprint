var arguments = process.argv.slice(2);
const mainConf = require('./confs/main')

var fs = require('fs')

const certs = {
    key: fs.readFileSync('./certs/lets/dreamsoft.pro/privkey.pem'),
    cert: fs.readFileSync('./certs/lets/dreamsoft.pro/cert2.pem'),
    ca: fs.readFileSync('./certs/lets/dreamsoft.pro/chain2.pem')
};

var express = require('express'),
    mongoose = require('mongoose');
bodyParser = require('body-parser'),
    app = express(),
    http = mainConf.https?require('https').createServer(certs, app):require('http').createServer(app),
    io = require('socket.io')(http),
    util = require('util'),
    log_file = fs.createWriteStream('./debug.log', {flags: 'w'}),
    log_stdout = process.stdout,
    util = require('util'),
    _ = require('underscore'),
    requireDirectory = require('require-directory'),
    UserFolder = require('./controllers/UserFolderController.js').UserFolder,
    UserImage = require('./controllers/UserImage.js').UserImage;
    const pick = require('./libs/tools').pick;

var jwt = require('jsonwebtoken');
var jwt_secret = mainConf.jwt_secret;
const md5 = require('md5');


var UploadAssetController = require('./controllers/UploadAssetController.js');
var AdminAssetController = require('./controllers/AdminAssetController.js');
var sessions = [];

GLOBAL.sessions = sessions;

console.fs = require('./libs/fsconsole.js');
//var appRoot = require('app-root-path');


var conf = require('./confs/main.js');
console.log(conf);
console.log('-----------');
GLOBAL.companyID = conf.companyID;
var path = require('path');
global.appRoot = path.resolve(__dirname);
var multer = require('multer');
var exec = require('child_process').exec;

//var log4js = require("log4js");
console.fs(appRoot);
//log4js.configure(appRoot + "/libs/logging.json");
//var logger = log4js.getLogger();

var socketio_jwt = require('socketio-jwt');
var jwt = require('jsonwebtoken');
var jwt_secret = mainConf.jwt_secret;

var Q = require('q');
var passwordHash = require('password-hash');
var hashing = require('./libs/hashingProof.js');

var password = require('./libs/password.js');


// libs
var generator = require('./libs/generator.js');
var Generator = generator.Generator;

var EditorBitmap = require('./models/EditorBitmap.js').model;
var EditorText = require('./models/EditorText.js').model;
var ProductType = require('./models/ProductType.js').model;
var AdminProject = require('./models/AdminProject.js').model;
var View = require('./models/View.js').model;
var Page = require('./models/Page.js').model;
var Theme = require('./models/Theme.js').model;
var ProjectImage = require('./models/ProjectImage.js').model;
var ProposedTemplate = require('./models/ProposedTemplate.js').model;
var Category = require('./models/Category.js').model;
var ProposedImage = require('./models/ProposedImage.js').model;
var ProposedText = require('./models/ProposedText.js').model;
var MainTheme = require('./models/MainTheme.js').model;
var ThemeCategory = require('./models/ThemeCategory.js').model;
var ThemePage = require('./models/ThemePage.js').model;
var Connect = require('./models/Connect.js').model;
var User = require('./models/User.js').model;
var UserProject = require('./models/UserProject.js').model;
var Font = require('./models/Font.js').model;
var ComplexView = require('./models/ComplexView.js').model;
var GroupLayer = require('./models/GroupLayer.js').model;
var Format = require('./models/Format.js').model;
var FormatView = require('./models/FormatView.js').model;
var SecretProof = require('./models/SecretProof.js').model;
var Session = require('./models/Session.js').model;
var ObjectOption = require('./models/ObjectOption.js').model;
var ProposedTemplateCategory = require('./models/ProposedTemplateCategory.js').model;
var ComplexUserProject = require('./models/ComplexUserProject.js').model;

var controllers = requireDirectory(module, './controllers');
var Controller = controllers.Controller;
var AdminProjectController = controllers.AdminProjectController;
var AttributeController = controllers.AttributeController;
var ConnectController = controllers.ConnectController;
var ComplexAdminProjectController = controllers.ComplexAdminProjectController;
var ComplexProductTypeController = controllers.ComplexProductTypeController;
var ComplexViewController = controllers.ComplexViewController;
var EditorBitmapController = controllers.EditorBitmapController;
var EditorObjectController = controllers.EditorObjectController;
var EditorTextController = controllers.EditorTextController;
var FontController = controllers.FontController;
var FormatController = controllers.FormatController;
var MainThemeController = controllers.MainThemeController;
var PageController = controllers.PageController;
var ProductTypeController = controllers.ProductTypeController;
var ProposedTemplateCategoryController = controllers.ProposedTemplateCategoryController;
var ProposedTemplateController = controllers.ProposedTemplateController;
var ProjectImageController = controllers.ProjectImageController;
var TestController = controllers.TestController;
var ThemeController = controllers.ThemeController;
var ThemeCategoryController = controllers.ThemeCategoryController;
var ThemePageController = controllers.ThemePageController;
var UploadController = controllers.UploadController;
var UserController = controllers.UserController;
var UserPageController = controllers.UserPageController;
var UserProjectController = controllers.UserProjectController;
var UserViewController = controllers.UserViewController;
var ViewController = controllers.ViewController;
var ProposedImageController = controllers.ProposedImageController;
var AdminViewController = controllers.AdminViewController;
var FrameObjectController = controllers.FrameObjectController;
var ProposedTextController = controllers.ProposedTextController;

var SessionController = controllers.SessionController;
var SessionControllerObject = new SessionController();
const synchro = require('./libs/PsSynchro')
// serwer statyczny
var staticDir = conf.staticDir;
//var staticPort = 1341;

app.use(bodyParser.urlencoded({extended: true, limit: '100mb'}));
app.use(bodyParser.json());
app.use(express.query());

port = conf.mainPort;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access-token, domainID, lang, x-http-method-override");
    next();
});

const router = express.Router();
app.use(multer({dest: staticDir}));

router.use((req, res, next) => {
    console.log(req.originalUrl)
    next()
})

router.route('/set_admin/:action')
    .get((req, res) => {
        switch (req.params.action) {
            case 'formats':
                synchro.formats(conf.companyID).then(rows => {
                    res.json(rows);
                }).catch(e => {
                    res.status(500).send(e);
                })
                break
            default:
                res.status(500).send('Nie podano akcji');
                break
        }
    });

router.route('/template/:type')
    .get((req, res) => {
        let model
        switch (req.params.type) {
            case 'project':
                model = AdminProject
                break
            default:
                res.status(500).send(`Nie ma dla typu ${req.params.type}`);
                break
        }
        const obj = model.schema.obj
        const obj2 = Object.keys(obj).reduce((all, k) => {
            const type = obj[k].type ? obj[k].type : typeof obj[k] === 'string' ? obj[k] : null
            if (type) {
                switch (type) {
                    case 'Number':
                        all[k] = 0
                        break;
                    case 'String':
                        all[k] = ''
                        break
                }
            }
            return all
        }, {})
        res.json(obj2)
    });

router.route('/product')
    .get((req, res) => {
        ProductType.find().deepPopulate('AdminProjects AdminProjects.Formats AdminProjects.Formats.Views AdminProjects.Formats.Views.Pages AdminProjects.Formats.Themes AdminProjects.Formats.Themes.ThemePages AdminProjects.Formats.Themes.MainTheme AdminProjects.Formats.Themes.MainTheme.ProjectBackgrounds AdminProjects.Formats.Themes.MainTheme.ProjectCliparts AdminProjects.Formats.Themes.MainTheme.ProjectMasks AdminProjects.Formats.Themes.MainTheme.ThemeCategories AdminProjects.Formats.Themes.MainTheme.ThemePages AdminProjects.Formats.Themes.backgroundFrames AdminProjects.Formats.Themes.backgroundFrames.ProjectImage AdminProjects.Formats.Themes.fonts').exec((err, items) => {
            res.json(items)
        })
    })
router.route('/product')
    .post((req, resp) => {
        const params = pick('typeID', req.body)
        const product = new ProductType(params)
        product.save(
            params,
            (err, affected) => {
                if (err)
                    resp.status(500).send(err)
                else
                    resp.status(200).send(affected.id)
            })
    })
router.route('/product/:id')
    .put((req, resp) => {
        const params = pick('typeID', req.body)
        ProductType.update({_id: req.params.id},
            params,
            (err, affected) => {
                if (err)
                    resp.status(500).send(err)
                else
                    resp.status(200).send(req.params.id)
            })
    })
    .delete((req, resp) => {
        ProductType.deleteOne({_id: req.params.id},
            (err, affected) => {
                if (err)
                    resp.status(500).send(err)
                else
                    resp.status(200).send(req.params.id)
            })
    })

router.route('/project/:id')
    .put((req, resp) => {
        const params = pick('name active', req.body)
        AdminProject.update({_id: req.params.id},
            params,
            (err, affected) => {
                if (err)
                    resp.status(500).send(err)
                else
                    resp.status(200).send(req.params.id)
            })
    })
    .delete((req, resp) => {
        AdminProject.deleteOne({_id: req.params.id},
            (err, affected) => {
                if (err)
                    resp.status(500).send(err)
                else
                    resp.status(200).send(req.params.id)
            })
    })
router.route('/project/:productId')
    .post((req, resp) => {
        const params = pick('name active', req.body)
        const project = new AdminProject(params)
        project.save(
            params,
            (err, affected) => {
                if (err)
                    resp.status(500).send(err)
                else {
                    ProductType.findByIdAndUpdate(req.params.productId,
                        {$push: {AdminProjects: affected.id}},
                        {safe: true, upsert: true},
                        (err, prod) => {
                            prod.AdminProjects.push()
                            prod.update({_id: req.params.productId}, {AdminProjects: prod.AdminProjects}, (err, affectedProds) => {
                                if (err)
                                    resp.status(500).send(err)
                                else
                                    resp.status(200).send(affected.id)
                            })
                        })
                }

            })
    })

router.route('/format/:id')
    .put((req, resp) => {
        const params = pick('formatID width height slope name external Views', req.body)
        Format.update({_id: req.params.id},
            params,
            (err, affected) => {
                if (err)
                    resp.status(500).send(err)
                else
                    resp.status(200).send(req.params.id)
            })
    })
    .delete((req, resp) => {
        Format.deleteOne({_id: req.params.id},
            (err, affected) => {
                if (err)
                    resp.status(500).send(err)
                else
                    resp.status(200).send(req.params.id)
            })
    })

router.route('/format/:projectId')
    .post((req, resp) => {
        const params = pick('formatID width height slope name external Views', req.body)
        const format = new Format(params)
        format.save(
            params,
            (err, affected) => {
                if (err)
                    resp.status(500).send(err)
                else {
                    AdminProject.findByIdAndUpdate(req.params.projectId,
                        {$push: {Formats: affected.id}},
                        {safe: true, upsert: true},
                        (err, proj) => {
                            proj.Formats.push()
                            proj.update({_id: req.params.projectId}, {Formats: proj.Formats}, (err, affectedProj) => {
                                if (err)
                                    resp.status(500).send(err)
                                else
                                    resp.status(200).send(affected.id)
                            })
                        })
                }

            })
    })
router.route('/theme/:id')
    .put((req, resp) => {
        const params = pick('url name', req.body)
        Theme.update({_id: req.params.id},
            params,
            (err, affected) => {
                if (err)
                    resp.status(500).send(err)
                else
                    resp.status(200).send(req.params.id)
            })
    })
router.route('/view/:id')
    .get((req, res) => {
        View.findById(req.params.id).deepPopulate('Pages EditorBitmaps EditorTexts').exec((err, items) => {
            res.json(items)
        })
    })
router.route('/ProposedTemplate/:id')
    .get((req, res) => {
        ProposedTemplate.find({}).limit(10).deepPopulate('ProposedImages ProposedTexts EditorBitmaps').exec((err, items) => {
            res.json(items)
        })
    })
app.use('/rest', router);
var userfolderController = new UserFolder(app, UserController);
var userImageController = new UserImage(app);
var uploadAssetController = new UploadAssetController(app);


app.post('/getsharedProjectFromFB/:projectID', function (req, res) {

    UserProjectController.clone(req.params.projectID).then(
        function (clonedProject) {

            UserProject.findOne({_id: req.params.projectID}).exec(function (err, project) {

                if (err) {

                    console.log(err);

                } else {

                    if (project.sharedInstances) {

                        project.sharedInstances.push({fb: Date.now(), instanceRef: clonedProject});

                    } else {

                        project.sharedInstances = [];
                        project.sharedInstances.push({fb: Date.now(), instanceRef: clonedProject});

                    }

                    project.save(function (err, saved) {

                        console.log('WYSYŁAM ODPOWIEDZ :)');
                        res.status(200).send({'sharedStatus': 1, 'link': UserProjectController.returnShareLink(clonedProject)});

                    });

                }

            });
        }
    );

});


app.post('/shareMyProject/:projectID', function (req, res) {

    var cloned = [];

    function end() {

        res.status(200).send({'sharedStatus': 1, 'sharedInstances': cloned});

    }

    function clone(email_index) {

        if (!req.body.emails)
            end();

        if (!req.body.emails[email_index])
            end();

        UserProjectController.clone(req.params.projectID).then(
            function (clonedProject) {

                UserProject.findOne({_id: req.params.projectID}).exec(function (err, project) {

                    if (err) {

                        console.log(err);

                    } else {

                        if (project.sharedInstances) {

                            project.sharedInstances.push({userMail: req.body.emails[email_index], instanceRef: clonedProject});

                        } else {

                            project.sharedInstances = [];
                            project.sharedInstances.push({userMail: req.body.emails[email_index], instanceRef: clonedProject});

                        }

                        cloned.push(project.sharedInstances);

                        UserProjectController.sendShareInfo(req.body.emails[email_index], clonedProject).then(function () {

                            project.save(function (err, saved) {

                                if (err) {
                                    console.log(err);
                                } else {

                                    clone(email_index + 1);

                                }

                            });

                        });

                    }

                });
            }
        );

    }

    clone(0);

});

app.get('/getMyProjects', function (req, res) {

    var token = req.body.token;
    var decodedToken = jwt.decode(req.headers['access-token'], jwt_secret, 'HS256');

    if (decodedToken.userEditorID) {

        var sortOpt = {};
        sortOpt[req.query.sortBy] = req.query.order;

        var options = {
            populate: {
                'ComplexProjects': {
                    options: {
                        sort: sortOpt,
                        skip: ((req.query.page - 1) * req.query.display),
                        limit: req.query.display,
                    }
                }
            }
        }

        User.findOne({userID: decodedToken.userEditorID}).deepPopulate('ComplexProjects ComplexProjects.projects', options).exec(function (err, user) {

            if (err) {
                console.log(err);
                res.status(500).send();
            } else {

                if (user) {

                    var projects = user.ComplexProjects;

                    User.findOne({userID: decodedToken.userEditorID}).exec(
                        function (err, user2) {

                            res.send({data: projects, allCount: user2.ComplexProjects.length});

                        }
                    );
                } else {
                    res.status(403).send();
                }
            }

        });

    }

});

app.post('/getProjectsData', function (req, res) {

    ComplexUserProject.find({_id: {$in: req.body.projects}}).exec(function (err, userProjects) {

        if (err) {

            console.log(err);

        } else {

            res.send(userProjects);

        }

    });
});


app.get('/getProjectTimber/:project', function (req, res) {

    // Views.Pages Views.Pages.ProposedTemplate Views.Pages.ProposedTemplate.ProposedImages Views.Pages.ProposedTemplate.ProposedImages.bitmap Views.Pages.ThemePage ---  Views Views.Pages Views.Pages.scene
    ComplexUserProject.findOne({_id: req.params.project}).deepPopulate("projects projects.Format projects.Format projects.Views projects.Views.adminView projects.Views.adminView.Pages projects.Views.Pages projects.Views.Pages.scene").exec(function (err, userProject) {

        if (err) {

            console.log(err);

        } else {

            var data = {
                'projects': []
            };

            var pagesCount = 0;
            var populatedPages = 0;

            for (var i = 0; i < userProject.projects.length; i++) {

                var proj = userProject.projects[i];

                var projectData = {
                    typeID: proj.typeID,
                    formatID: proj.formatID,
                    pages: []
                }

                for (var v = 0; v < proj.Views.length; v++) {

                    var view = proj.Views[v];

                    for (var p = 0; p < view.Pages.length; p++) {
                        pagesCount++;
                    }

                    for (var p = 0; p < view.Pages.length; p++) {

                        var page = view.Pages[p];
                        // nartazie jeden view na jedna strone wiec order idzie z view
                        let pageObj = {
                            order: view.order,
                            pageID: page._id,
                            pageValue: page.pageValue,
                            vacancy: page.vacancy,
                            width: view.adminView.Pages[p].width,
                            height: view.adminView.Pages[p].height,
                        }

                        projectData.pages.push(pageObj);

                        UserPageController._getScene(page._id).then(
                            function (page) {
                                pageObj.scene = page;
                                populatedPages++;
                                check();
                            }
                        );

                    }

                }

                data.projects.push(projectData);

            }

            function check() {
                console.log('sprawdzam: ' + populatedPages + " / " + pagesCount);
                if (populatedPages == pagesCount) {

                    res.send(data);

                }

            }


        }


    });


});

app.post('/upload/projectImage/', function (req, res) {
    /**
     * Upload zdjęcia do projektu (admin)
     */
    uploadController.upload(req, res);
});

app.post('/userUpload/projectImage', function (req, res) {
    /**
     * Upload zdjęcia, ale wysyłany przez użytkownika
     */
    uploadController.userUpload(req, res);
});

app.post('/userUploadEdited/projectImage', function (req, res) {
    /**
     * Upload zdjęcia, ale wysyłany przez użytkownika
     */
    uploadController.uploadEdited(req, res);
});

app.post('/userUpload/projectImage', function (req, res) {
    /**
     * Upload zdjęcia, ale wysyłany przez użytkownika
     */
    uploadController.userUpload(req, res);

});

// Trzeba to jakoś stąd wyciągnąć...


var server = http.listen(port, function () {

    var host = mainConf.domain;
    var port = server.address().port;

    console.log('node-backend: http://%s:%s', host, port);

});


var companyID = conf.companyID;
var databaseName = 'editor_' + companyID;

console.log(databaseName);

db = mongoose.connect("mongodb://editorDb:ed1t0rf69b54@localhost:27017/" + databaseName + "?authSource=admin", {useMongoClient: true}, function (err) {
    if (err) {
        console.fs(err);
    }
});

var uploadController = new UploadController();

function login(email, pass) {
    var _this = this;
    var def = Q.defer();

    var saltOff = false;

    if (companyID === 249 || companyID === 686) {
        saltOff = true;
    }

    User.findOne({'email': email}, function (err, _user) {
        //console.fs( _user );
        if (err) {
            console.fs(err);
            def.reject(err);
        } else {
            if (_user === null) {
                def.reject({'error': "Login lub hasło nieprawidłowe!", 'user': _user});
            }
            var hashFromPost = password.hashPass(pass, saltOff);

            if (hashFromPost !== _user.password) {
                def.reject({'error': "Login lub hasło nieprawidłowe!", 'pass': pass});
            }

            var profile = {};
            profile.first_name = _user.first_name;
            profile.last_name = _user.last_name;
            profile.email = _user.email;
            profile.userID = _user.userID;
            profile.date = Date.now();
            var actTime = new Date();

            SessionControllerObject.add().then(function (session) {
                profile.proofTime = actTime.getTime() / 1000 | 0;
                profile.sessionID = session['sid'];
                var token = jwt.sign(profile, mainConf.jwt_secret, {expiresInMinutes: 60 * 5});
                //console.fs('token');
                //console.fs(token);
                def.resolve({'token': token, 'profile': profile});
            });
        }

    });

    return def.promise;
}

app.get('/updateProposedTemplates', function (req, res) {

    ProposedTemplate.find({/*imagesCount : { $exists : false }*/}, function (err, proposedTemplates) {

        if (err) {

            console.fs(err);

        } else {


            function checkDone() {

                if (proposedTemplatesToChange == updatedTemplates) {

                    console.fs('jest skonczone');

                    ProposedTemplate.find({imagesCount: {$exists: false}}, function (err, proposedTemplates) {

                        console.fs(proposedTemplates.length);

                    });

                    ProposedTemplate.find({textsCount: {$exists: false}}, function (err, proposedTemplates) {

                        console.fs(proposedTemplates.length);

                    });

                }

            }

            var updatedTemplates = 0;
            var proposedTemplatesToChange = proposedTemplates.length;

            for (var i = 0; i < proposedTemplatesToChange; i++) {

                var currentTemplate = proposedTemplates[i];

                currentTemplate.imagesCount = currentTemplate.ProposedImages.length;
                currentTemplate.textsCount = currentTemplate.ProposedTexts.length;

                currentTemplate.save(function (err, savedCurrentTemplate) {

                    if (err) {

                        console.fs(err);

                    } else {

                        updatedTemplates++;
                        checkDone();

                    }

                });

            }

        }

    })

});

app.post('/verify', function (req, res) {

    var token = req.body.token;
    try {
        var postSecretProof = req.body.secretProof;
        //var postProofTime = req.body.proofTime;
        var decoded = jwt.verify(token, mainConf.jwt_secret);


        //res.json(decoded);
        if (decoded === undefined || decoded === null) {
            res.status(401).send({"error": 'Token błędny!'});
        }
        if (decoded.userID !== undefined && decoded.userID > 0) {

            time = decoded.exp * 1000;
            var dexp = new Date(time);
            var now = new Date();

            if (now < dexp) {
                if (postSecretProof === null || postSecretProof === undefined || postSecretProof === '') {

                    throw  {"pTime": decoded.proofTime, "error": 'Brak klucza!'};
                    console.fs('TU?????????TU?????????????????????????????????????????????????????????????????');
                }

                var secretToCheck = hashing.unhash(postSecretProof, decoded.proofTime);

                SecretProof.findOne({secretProof: secretToCheck}, function (err, sp) {
                    if (err) {
                        console.fs(err);
                        res.status(401).send({"error": 'Błąd podczas szukania klucza!', 'codeError': '01'});
                    } else {

                        if (sp === null) {
                            res.status(401).send({"error": "Błąd klucza !!!", 'codeError': '02'});
                        } else {
                            sp.remove(function (err, removed) {
                                if (err) {
                                    console.fs(err);
                                    res.status(401).send({"error": 'Błąd przy usuwaniu klucza!', 'codeError': '03'});
                                } else {
                                    var newSecretProof = new SecretProof();

                                    newSecretProof.userID = decoded.userID;
                                    newSecretProof.datetime = new Date();
                                    newSecretProof.secretProof = hashing.generate(20);
                                    var timestamp = newSecretProof.datetime.getTime() / 1000 | 0;
                                    console.fs('decoded TU: <<<<<<<<<<<<<<<<<<<<<');
                                    console.fs(decoded.first_name);
                                    newSecretProof.save(function (err, saved) {
                                        if (err) {
                                            console.fs(err);
                                            res.status(401).send({"error": 'Błąd przy zapisywaniu klucza!', 'codeError': '04'});
                                        } else {
                                            //var decoded = jwt.verify(token, jwt_secret);
                                            var profile = {};
                                            console.fs(decoded.first_name);
                                            profile.first_name = decoded.first_name;
                                            profile.last_name = decoded.last_name;
                                            profile.email = decoded.email;
                                            profile.userID = decoded.userID;
                                            profile.sessionID = decoded.sessionID;
                                            profile.date = Date.now();
                                            var actTime = new Date();

                                            profile.proofTime = actTime.getTime() / 1000 | 0;
                                            // 60*5
                                            var token = jwt.sign(profile, mainConf.jwt_secret, {expiresInMinutes: 60 * 5});


                                            console.fs('sprawdź czas trwania: ');
                                            console.fs(decoded);

                                            res.json({token: token, 'userID': decoded.userID, 'secretProof': newSecretProof.secretProof});
                                        }
                                    });
                                }

                            });

                        }

                    }
                });
            } else {
                res.status(401).send({"error": 'Token wygasł!', 'codeError': '05'});
            }
        } else {
            res.status(401).send({"error": 'Token nieprawidłowy!', 'codeError': '06'});
        }

    } catch (err) {
        //console.fs('TU::');
        console.fs(err);
        if (err.pTime !== undefined) {
            res.status(200).send({"error": "Brak secret proof.", "pTime": err.pTime, 'codeError': '08'});
        } else {
            res.status(401).send({"tokenError": err, "error": "Token jest błędny.", 'codeError': '07'});
        }

        //console.fs('TU::');
        //res.status(401).send( err.message );
    }
});


app.post('/login', function (req, res) {

    //console.fs(req.body.password);
    console.fs(req.body);
    if (!req.body.password || !req.body.email) {
        res.json({'error': 'Wypełnij dane logowania!', 'data': req.body.toString()});
    } else {
        var loginUser = login(req.body.email, req.body.password);
        loginUser.then(function (loginData) {

            var newSecretProof = new SecretProof();
            //console.fs(loginData);
            newSecretProof.userID = loginData['profile'].userID;
            newSecretProof.datetime = new Date();
            newSecretProof.secretProof = hashing.generate(20);
            var timestamp = newSecretProof.datetime.getTime() / 1000 | 0;

            newSecretProof.save(function (err, saved) {
                if (err) {
                    console.fs(err);
                } else {
                    //'datetime':timestamp
                    res.json({token: loginData.token, 'userID': loginData['profile'].userID, 'secretProof': newSecretProof.secretProof});
                }
            });
        }).fail(function (error) {
            res.json(error);
        });
    }

});


io.use(socketio_jwt.authorize({
    secret: mainConf.jwt_secret,
    handshake: true
}));


io.sockets.on('connection', function (socket) {

    socket.on('authenticate', function (data) {

        var decodedToken = jwt.decode(data.token, jwt_secret, 'HS256');
        console.log('AUTHENTYKACJA');
        console.log(decodedToken.userEditorID);
        console.log('-------------------------------------------------');
        if (decodedToken.super) {
            socket.emit('authenticate', {'authenticate': 1});

        } else if (decodedToken.userEditorID) {

            console.log(decodedToken.userEditorID);

            User.findOne({userID: decodedToken.userEditorID}, function (err, user) {

                if (err) {

                    console.fs(err);

                } else {

                    if (user) {

                        console.fs(user);
                        console.fs('MAMY USERA');
                        var token = data.token;
                        sessions[token] = decodedToken.userEditorID;
                        socket.emit('authenticate', {'authenticate': 1});

                    } else {

                        console.log('Nowy urzytkownik');
                        var newUser = new User({userID: decodedToken.userEditorID});
                        newUser.save(function (err, ok) {

                            if (err) {

                                console.log(err);

                            } else {

                                console.fs(ok);
                                var token = data.token;
                                console.fs('utworzono nowego uzytkownika');
                                sessions[token] = decodedToken.userEditorID;
                                socket.emit('authenticate', {'authenticate': 1});

                            }

                        });

                    }

                }

            });

        } else if (decodedToken.userEditorID) {

            User.findOne({userID: decodedToken.userEditorID}, function (err, user) {

                if (err) {

                    console.fs(err);

                } else {

                    if (user) {

                        console.fs(user);
                        console.fs('MAMY USERA');
                        var token = data.token;
                        sessions[token] = decodedToken.userEditorID;
                        socket.emit('authenticate', {'authenticate': 1});

                    } else {

                        var newUser = new User({userID: decodedToken.userEditorID});
                        newUser.save(function (err, ok) {

                            if (err) {

                                console.log(err);

                            } else {

                                console.fs(ok);
                                var token = data.token;
                                console.fs('utworzono nowego uzytkownika');
                                sessions[token] = decodedToken.userEditorID;
                                socket.emit('authenticate', {'authenticate': 1});

                            }

                        });

                    }

                }

            });

        }

    });

// controller główny
    var cont = new Controller(io, socket);
    //cont.setCompanyID( confNumber );

    // kontrolory które, dziedziczą po głównym
    var apController = new AdminProjectController(cont);
    var ptController = new ProductTypeController(cont);
    var adminAssetController = new AdminAssetController(cont);
    adminAssetController.init();
    var cptController = new ComplexProductTypeController(cont);

    var capController = new ComplexAdminProjectController(cont);
    var userCont = new UserController(cont);
    var tController = new TestController(cont);
    var vController = new ViewController(cont);
    var paController = new PageController(cont);
    var ebController = new EditorBitmapController(cont);
    var etController = new EditorTextController(cont);
    var mtController = new MainThemeController(cont);
    var thController = new ThemeController(cont);
    var ptmpController = new ProposedTemplateController(cont);
    var tcController = new ThemeCategoryController(cont);
    var edController = new EditorObjectController(cont);
    var tpController = new ThemePageController(cont);
    var ftController = new FormatController(cont);
    var piController = new ProjectImageController(cont);
    var attrController = new AttributeController(cont);
    var connectController = new ConnectController(cont);
    var userProjectController = new UserProjectController(cont);
    var cvController = new ComplexViewController(cont);
    var fontController = new FontController(cont);
    var ptcController = new ProposedTemplateCategoryController(cont);
    var uViewController = new UserViewController(cont);
    var uPageController = new UserPageController(cont);
    var proposedImageController = new ProposedImageController(cont);
    var aViewController = new AdminViewController(cont);
    var fObjectController = new FrameObjectController(cont);
    var ptextController = new ProposedTextController(cont);

    var savedConnect = connectController.new().then(function (saved) {
        connectController.setLocalConnectID(saved.connectID);
    });


    ptextController.setContent();
    ptextController.setAttributes();

    fObjectController.add();
    fObjectController.get();
    fObjectController.remove();
    fObjectController.getAll();

    connectController.joinTo();

    connectController.createAdminRoom();
    connectController.requestCooperate();
    connectController.respondCooperate();

    /**
     *
     */

    /**
     * Produkty kompleksowe
     */

    /**
     * Pobierz z bazy jeden element
     */


    aViewController.removeText();

    //proposedImageController.loadPhoto();
    proposedImageController.loadImage();
    proposedImageController.changeImage();
    proposedImageController.replacePhoto();
    proposedImageController.removeObjectInside();
    proposedImageController.rotateImageInside();
    proposedImageController.setAttributes();

    uViewController.get();
    uPageController.useThemePage();
    uPageController.useTemplate();
    uPageController.addBitmap();
    uPageController.swapPhoto();
    uPageController.swapTemplate();
    uPageController.addPhoto();
    uPageController.replacePhotos();
    uPageController.loadImage();
    uPageController.changeImage();
    uPageController.removeProposedImageAndPosition();
    uPageController.setProposedTemplate();
    uPageController.moveObjectUp();
    uPageController.moveObjectDown();
    uPageController.addProposedImagePosition();
    uPageController.addEmptyProposedPosition();
    uPageController.addProposedText();
    uPageController.removeOneProposedImage();
    uPageController.removeUserText();

    userProjectController.setMainTheme();
    userProjectController.setMainComplexTheme();
    userProjectController.autoFill();
    userProjectController.setName();
    userProjectController.getAllViews();
    userProjectController.getProjectImagesUseNumber();
    userProjectController.sortProjectImages();
    userProjectController.removePhoto();
    userProjectController.removeAllImages();
    userProjectController.setSettingsForAllProposedImages();
    userProjectController.setSettingsForAllProposedTexts();
    userProjectController.updatePagesPrev();

    etController.setContent();
    etController.setTransform();
    etController.setBackgroundColor();
    etController.setAlphaBackground();
    etController.setVerticalPadding();
    etController.setHorizontalPadding();
    etController.setShadow();

    userCont.getPhotos();
    userCont.addProject();
    userCont.getFullProject();
    userCont.addComplexProject();
    //userCont.addUserImage();

    cptController.get();

    cptController.add();

    capController.getAll();

    capController.add();

    capController.load();

    capController.addComplexView();

    /**
     * Kompleksowe widoki
     */
    cvController.get();

    cvController.addViewObject();

    /**
     * Produkty kompleksowe END
     */

    tController.konRafal();

    tpController.updateImage();
    tpController.setDefaultSettings();
    tpController.getThemeBackgroundFrames();

    tpController.getSelectedProposedTemplates();

    // było ProductType.setActiveAdminProject
    ptController.setActiveAdminProject();
    ptController.check();
    ptController.registerNewType();
    // Ładowanie formatów z AdminProject
    apController.load();

    // ustawienie miniaturki projektu
    apController.setProjectAvatar();

    // addColor
    apController.addColor();
    apController.setActiveColors();

    // było AdminProject.add
    apController.add();
    apController.getFormats();

    // było AdminProject.remove
    apController.remove();

    // było ProductType.AdminProject i emitowało ProductType.AdminProject.exist || ProductType.AdminProject.empty
    ptController.getAdminProjects();

    // było ProductType.AdminProject.new i ProductType.AdminProject.error || ProductType.AdminProject.saved
    ptController.newAdminProject();

    // było AdminProject.changeMin
    apController.changeMin();

    // było AdminProject.load
    ftController.load();
    ftController.get();
    ftController.update();

    ftController.getByIntID();

    // było AdminProject.addView i AdminProject.addedView
    vController.add();

    vController.removeText();

    // było AdminProject.removeView i AdminProject.removedView
    vController.remove();

    // Update widoku
    vController.update();

    // dodanie tekstu do widoku
    vController.addNewText();


    // Obrazki do projektu
    // było AdminProject.addProjectImage i AdminProject.addedProjectImage
    piController.add();

    piController.addNoRef();

    // update obrazków
    piController.update();

    // było AdminProject.removeProjectImage i AdminProject.removedImage
    piController.remove();

    // Obrazki do projektu <--END--!>

    // Strony do widoku

    // Dodaj stronę
    paController.add();

    // usuń stronę
    paController.remove();

    // pobierz widok
    vController.get();

    // Strony do widoku <--END--!>

    // Editor bitmap do stron

    // było AdminProject.View.Page.addEditorBitmap i AdminProject.View.Page.addedEditorBitmap
    paController.addEditorBitmap();

    // pobierz stronę
    paController.get();

    paController.update();

    paController.savePosition();

    paController.saveRotation();

    // przesuwanie
    // było EditorBitmap.savePosition , EditorBitmap.error || EditorBitmap.savedPosition
    ebController.savePosition();
    ebController.setTransform();
    ebController.clone();
    ebController.get();
    ebController.setSettings();
    // skalowanie
    // było EditorBitmap.saveScale EditorBitmap.savedScale
    ebController.saveScale();

    // obracanie
    // było AdminProject.View.EditorBitmap.rotate || AdminProject.View.EditorBitmap.rotated
    ebController.saveRotate();

    // Ustaw base EditorBitmap
    ebController.setBase();

    ebController.getAllBase();

    ebController.unsetBase();

    // dodaj opcje
    ebController.setOptions();

    ebController.setAttributes();

    // opcje bitmapy
    ebController.getOptions();

    ebController.addAsOption();
    ebController.setBorderOptions();
    // Editor bitmap do stron <--END--!>

    // Pozycje proponowane

    // było AddProposedTemplate i AddedProposedTemplate
    ptmpController.add();
    ptmpController.addOption();
    ptmpController.setGlobal();
    uPageController.oneMoreText();
    uPageController.oneMoreImage();
    uPageController.setTextContent();
    uPageController.removeProposedPosition();
    uPageController.removeProposedText();
    uPageController.changeAllImagesSettings();
    uPageController.removeProposedImage();
    uPageController.removeUsedImage();
    uPageController.rotateUsedImage();
    // usuwanie pozycji proponowanej
    ptmpController.remove();

    // pobierz pozycje proponowane razem z pozycjami obrazów i tekstów
    // było GetAllProposedTemplates i AllProposedTemplates
    ptmpController.getAllGlobal();

    // pobranie konkretnego szablonu pozycji proponowanych
    ptmpController.get();

    // pobieranie szablonów pozycji proponowanych dla danej strony motywu
    ptmpController.getAllForThemePage();

    // Pozycje proponowane <!--END-->

    // Widoki

    // Zmiana widoku
    vController.change();

    vController.moveObjects();

    // Widoki <!--END-->

    // MOTYWY
    thController.get();
    thController.cloneCopiedPage();
    // Dodanie motywu do projektu

    //ftController.addTheme();
    thController.add();

    // Dodanie motywu do porojektu <!--END-->

    // Pobranie motywów dla danego AdminProject

    thController.getAll();

    // usuwanie strony lokalnej
    thController.removeLocalPage();

    // Pobranie motywów dla danego AdminProject <!--END-->

    // Usuwanie motywów z danego AdminProject

    // było AdminProject.removeTheme i będzie
    //ftController.removeTheme();
    thController.remove();

    // Usuwanie motywów z danego AdminProject
    mtController.remove();
    // Główne motyw dodaj
    mtController.add();
    mtController.addProjectPhoto();
    mtController.addProjectBackground();
    mtController.addProjectClipart();
    mtController.removeProjectImage();


    // Główne motyw edytuj
    mtController.update();

    // było GetMainThemes
    mtController.getAll();

    mtController.addBackgroundsFromAssets();
    mtController.addImagesFromAssets();
    mtController.addClipartsFromAssets();
    mtController.addMasksFromAssets();
    // Główne motywy <!--END-->

    // Pobierz strony motywu glownego
    mtController.getPages();

    // Pobierz strony motywu glownego <!--END-->

    // Dodaj stronę motywu glownego
    mtController.addPage();

    // Dodaj stronę motywu glownego <!--END-->

    // Wczytaj jedną stronę!
    mtController.getPage();

    // Wczytaj gówny motyw!
    mtController.get();

    mtController.copyPageFromLocal();

    // Wczytaj jedną stronę! <!--END-->

    // Pobierz strony motywu
    thController.getPages();

    thController.addLocalPage();

    thController.getUsedPages();
    thController.setBackgroundFrames();
    thController.setThemeFonts();
    thController.getThemeFonts();
    thController.getBackgroundFrames();
    thController.getFullBackgroundFrames();
    thController.removeCopiedPage();

    //thController.remove();

    // Pobierz strony motywu <!--END-->

    tpController.get();
    tpController.changeObjectsOrder();
    tpController.getFonts();
    tpController.update();

    // Kopia strony z motywu głównego do motywu

    thController.copyPageFromMainTheme();

    thController.copyThemes();

    // Kopia strony z motywu głównego do motywu <!--END-->


    // Kategorie motywów glownych

    // było AddThemeCategory, ExistThemeCategory, AddedThemeCategory
    // Dodaj
    tcController.add();

    // pobierz listę
    tcController.getAll();

    // Kategorie motywów glownych <!--END-->

    // Dodaj bitmape do widoku
    ebController.add();

    // Usuń EditorBitmap z widoku
    ebController.remove();

    // Dodaj bitmape do widoku <!--END-->

    // Przesuwanie obiektów

    // było i jest EditorObject.move
    edController.move();

    // Przesuwanie obiektów <!--END-->

    // Skalowanie obiektów

    edController.scale();

    // Skalowanie obiektów <!--END-->

    // Obracanie obiektów
    // było objectRotate
    edController.rotate();

    // Obracanie obiektów <!--END-->

    //
    attrController.add();

    // Projekty użytkownika
    // Dodaj:
    userProjectController.add();
    userProjectController.addPhoto();
    userProjectController.addNewView();
    userProjectController.removeView();
    userProjectController.setSettingsForAllBitmaps();
    userProjectController.setViewsOrders();
    userCont.loadProject();

    // Czcionki
    fontController.add();
    fontController.getAll();
    fontController.get();
    fontController.remove();

    // Kategorie proponowanych pozycji
    ptcController.add();
    ptcController.remove();
    ptcController.getAll();

    socket.on('disconnect', function () {
        console.log('Socket disconnected !');
        connectController.delete(connectController.getLocalConnectID());
    });

});


app.get('/getProjectPrev/:projectID', function (req, res) {

    controllers.UserProjectController._getPrevData(req.params.projectID).then(
        //ok
        function (project) {

            res.send(project);

        }
    );

});

function run_cmd(cmd, args, callBack) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";

    child.stdout.on('data', function (buffer) {
        resp += buffer.toString()
    });
    child.stdout.on('end', function () {
        callBack(resp)
    });
}


process.on('uncaughtException', function (err) {

    var text = 'Dzisiaj jest: ' + (new Date).toUTCString() + '. Nastąpił błąd: ' + err.message
    text += '\n\nPort: ' + conf.mainPort;
    text += '\n\n' + err.stack;

    // coś poszło nie tak. Zawiadomić Awengersów
    if (conf.debug_mode === false) {
        //logger.error(text);
    } else {
        console.fs(text);
    }

    Connect.remove({}, function (err) {
        //logger.info('Usunięcie wszystkich zapisanych połączeń.');
    });

    if (conf.debug_mode === false) {
        setTimeout(function () {
            run_cmd("rs", [], function (text) {
                console.log(text);
            });
        }, 120000);
    }
});
