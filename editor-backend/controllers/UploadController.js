var util = require('util');
console.fs = require('../libs/fsconsole.js');
var path = require('path');
var fs = require('fs');
var dateFormat = require('dateformat');
var sharp = require('sharp');
var User = require('../models/User.js').model;
var UserFolder = require('../models/UserFolder.js').model;
var ProjectImage = require('../models/ProjectImage.js').model;
var ExifImage = require('exif').ExifImage;
//var form = require('connect-form');

//var app = require('../app.js');
var conf = require('../confs/main.js');
var mainConf = require('../libs/mainConf.js');


//var Controller = require("../controllers/Controller.js");
var Upload = require('../models/Upload.js').model;
var Q = require('q');
var jwt = require('jsonwebtoken');
var jwt_secret = mainConf.jwt_secret;

const resize = (saved, folderDest, dest, size) => {
    return new Promise((resolve, reject) => {
        sharp(folderDest + saved._id + saved.ext.toLowerCase())
            .resize(size.width, size.height)
            .toFile(dest, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(dest)

                }

            });
    })
}

function UploadController() {
    //this.socket = controller.socket;
    //this.io = controller.io;
    //AdminProjectController.super_.call(this);
    this.name = "UploadController";
    //this.socketName = "Page";
};

function generateUUID() {

    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    return uuid;

};

//util.inherits(UploadController, Controller);
function saveMin(req, res, folderType, folderDest, saved) {
    if (req.body.imageMin === null) {
        console.fs("Nie ma obrazka w treści POST'a");
        return;
    }

    var body = req.body.imageMin,
        base64Data = body.replace(/^data:image\/png;base64,/, ""),
        binaryData = new Buffer(base64Data, 'base64').toString('binary');

    var thumbDest = folderDest + 'min_' + saved._id + '.jpg';

    //console.fs(binaryData);

    fs.writeFile(thumbDest, binaryData, "binary", function (err) {
        if (err) {
            console.fs(err);
        } else {
            //var thumbDest = folderDest + 'min_' + saved._id + saved.ext;
            //saveMin( folderDest, saved );
            var dataRes = saved.toJSON();
            dataRes.thumbUrl = conf.staticPath + '/' + folderType + '/' + saved.date + '/' + saved.folderNumber + '/' + 'thumb_' + saved._id + '.jpg';
            dataRes.minUrl = conf.staticPath + '/' + folderType + '/' + saved.date + '/' + saved.folderNumber + '/' + 'min_' + saved._id + '.jpg';
            //console.fs('KONIEC SAVE: _!!___!__!_!_!_!___!_!_!_!');
            //console.fs(dataRes);
            res.send(dataRes);
        }
    });

};

function saveUserMin(req, res, folderType, folderDest, saved) {
    if (req.body.imageMin === null) {

        return;
    }

    var body = req.body.imageMin,
        base64Data = body.replace(/^data:image\/png;base64,/, ""),
        binaryData = new Buffer(base64Data, 'base64').toString('binary');

    var thumbDest = folderDest + 'min_' + saved._id + '.jpg';

    //console.fs(binaryData);

    fs.writeFile(thumbDest, binaryData, "binary", function (err) {
        if (err) {

            console.fs(err);

        } else {

            //var thumbDest = folderDest + 'min_' + saved._id + saved.ext;
            //saveMin( folderDest, saved );
            var dataRes = saved.toJSON();
            dataRes.thumbUrl = conf.staticPath + '/' + folderType + '/' + saved.userID + '/' + saved.date + '/' + saved.folderNumber + '/' + 'thumb_' + saved._id + '.jpg';
            dataRes.minUrl = conf.staticPath + '/' + folderType + '/' + saved.userID + '/' + saved.date + '/' + saved.folderNumber + '/' + 'min_' + saved._id + '.jpg';

            res.send(dataRes);


        }
    });

};

UploadController.saveUserImage = function (userID, file, miniature, thumbnail) {


};


UploadController.saveBaseFile = function (file, url, callback) {

    var base64Data = file.replace(/^data:image\/png;base64,/, "");
    var binaryData = new Buffer(base64Data, 'base64').toString('binary');

    fs.writeFile(url, binaryData, "binary", function (err) {
        if (err) {
            console.fs(err);
        } else {
            //var thumbDest = folderDest + 'min_' + saved._id + saved.ext;
            var outUrl = url.split(`${global.staticDir}35/`)[1];
            url = conf.staticPath + '/' + outUrl;

            callback(url);

        }

    });

};


function saveThumb(req, res, folderType, folderDest, saved) {

    var body = req.body.thumbnail,
        base64Data = body.replace(/^data:image\/png;base64,/, ""),
        binaryData = new Buffer(base64Data, 'base64').toString('binary');

    var thumbDest = folderDest + 'thumb_' + saved._id + '.jpg';

    fs.writeFile(thumbDest, binaryData, "binary", function (err) {
        if (err) {
            console.fs(err);
        } else {
            //var thumbDest = folderDest + 'min_' + saved._id + saved.ext;
            saveMin(req, res, folderType, folderDest, saved);
        }
    });
};

function saveUserThumb(req, res, folderType, folderDest, saved) {

    var body = req.body.thumbnail,
        base64Data = body.replace(/^data:image\/png;base64,/, ""),
        binaryData = new Buffer(base64Data, 'base64').toString('binary');

    var thumbDest = folderDest + 'thumb_' + saved._id + '.jpg';

    fs.writeFile(thumbDest, binaryData, "binary", function (err) {
        if (err) {
            console.fs(err);
        } else {
            //var thumbDest = folderDest + 'min_' + saved._id + saved.ext;
            saveUserMin(req, res, folderType, folderDest, saved);
        }
    });
};

function saveMainFile(req, res, folderType, filePath, folderDest, folderNumber, saved) {
    fs.rename(
        filePath,
        folderDest + saved._id + saved.ext,
        function (error) {
            if (error) {
                res.send({
                    errorCode: error,
                    error: 'Ah crap! Something bad happened'
                });
                return;
            } else {
                saved.url = conf.staticPath + '/' + folderType + '/' + saved.date + '/' + folderNumber + '/' + saved._id + saved.ext;
                saved.folderNumber = folderNumber;
                saved.save(function (err, saved2) {
                    if (err) {
                        console.fs(err);
                    } else {
                        //console.fs('Koniec zapisu!');
                        //console.fs(saved2);
                        //var thumbDest = folderDest + 'thumb_' + saved._id + saved.ext;
                        saveThumb(req, res, folderType, folderDest, saved2);
                        //res.send(saved2);
                    }
                });
            }

        }
    );
};

function saveUserMainFile(req, res, folderType, filePath, folderDest, folderNumber, saved) {

    fs.rename(
        filePath,
        folderDest + saved._id + saved.ext.toLowerCase(),
        function (error) {

            if (error) {

                res.send({
                    errorCode: error,
                    error: 'Ah crap! Something bad happened'
                });
                return;

            } else {

                saved.url = conf.staticPath + '/' + folderType + '/' + saved.userID + '/' + saved.date + '/' + folderNumber + '/' + saved._id + (saved.ext.toLowerCase());
                saved.folderNumber = folderNumber;
                saved.save(function (err, saved2) {

                    if (err) {

                        console.fs(err);

                    } else {

                        if (saved.ext == '.svg') {

                            var data = saved2.toJSON();
                            data.minUrl = conf.staticPath + '/' + folderType + '/' + saved.userID + '/' + saved.date + '/' + folderNumber + '/' + saved._id + (saved.ext.toLowerCase());
                            data.thumbUrl = conf.staticPath + '/' + folderType + '/' + saved.userID + '/' + saved.date + '/' + folderNumber + '/' + saved._id + (saved.ext.toLowerCase());

                            res.send(data);

                        } else {

                            var minReady = false;
                            var thumbReady = false;

                            var thumbDest = folderDest + 'thumb_' + saved._id + saved.ext.toLowerCase();
                            var minDest = folderDest + 'min_' + saved._id + saved.ext.toLowerCase();

                            var thumbSize = JSON.parse(req.body.thumbSize);
                            var minSize = JSON.parse(req.body.minSize);

                            sharp(folderDest + saved._id + saved.ext.toLowerCase())
                                .resize(thumbSize.width, thumbSize.height)
                                .toFile(thumbDest, function (err) {

                                    if (err) {

                                        console.fs(err);

                                    } else {

                                        thumbReady = true;
                                        check();

                                    }

                                });

                            sharp(folderDest + saved._id + saved.ext.toLowerCase())
                                .resize(minSize.width, minSize.height)
                                .toFile(minDest, function (err) {

                                    if (err) {

                                        console.fs(err);

                                    } else {

                                        minReady = true;
                                        check();

                                    }

                                });

                            var data = saved2.toJSON();
                            data.minUrl = conf.staticPath + '/' + folderType + '/' + saved.userID + '/' + saved.date + '/' + folderNumber + '/min_' + saved._id + (saved.ext.toLowerCase());
                            data.thumbUrl = conf.staticPath + '/' + folderType + '/' + saved.userID + '/' + saved.date + '/' + folderNumber + '/thumb_' + saved._id + (saved.ext.toLowerCase());

                            function check() {

                                if (minReady && thumbReady) {

                                    if (req.body.folderId) {

                                        UserFolder.findOne({_id: req.body.folderId}).exec(function (err, folder) {

                                            if (err) {
                                                console.log(err);
                                            } else {
                                                if (folder && folder.userOwner == saved.userID) {

                                                    var projectImageData = {

                                                        name: req.files.userFile.name,
                                                        imageUrl: saved.url,
                                                        minUrl: data.minUrl,
                                                        thumbnail: data.thumbUrl,
                                                        type: 'Bitmap',
                                                        uid: generateUUID(),
                                                        width: minSize.width,
                                                        height: minSize.height,
                                                        trueWidth: JSON.parse(req.body.origin).width,
                                                        trueHeight: JSON.parse(req.body.origin).height,
                                                        Upload: saved

                                                    };

                                                    sharp(folderDest + saved._id + saved.ext.toLowerCase()).metadata().then(function (meta) {

                                                        if (meta.exif) {

                                                            var metadata = new ExifImage({image: folderDest + saved._id + saved.ext.toLowerCase()}, function (err, dataExif) {

                                                                if (dataExif.exif.CreateDate) {
                                                                    var dateSplit = dataExif.exif.CreateDate.split(' ');
                                                                    var re = new RegExp(':', 'g');
                                                                    dateSplit[0] = dateSplit[0].replace(re, '/');
                                                                    var creationDateStamp = new Date(dateSplit[0] + ' ' + dateSplit[1]).getTime();
                                                                    projectImageData.createDate = creationDateStamp;
                                                                }

                                                                var userImage = new ProjectImage(projectImageData);

                                                                userImage.save(function (err, saveImage) {

                                                                    if (err) {

                                                                        console.log(err);

                                                                    } else {

                                                                        folder.imageFiles.push(saveImage);
                                                                        folder.save(function (err, ok) {

                                                                            if (err) {
                                                                                console.log(err);
                                                                            } else {

                                                                                res.send(saveImage);

                                                                            }


                                                                        });

                                                                    }

                                                                });

                                                            });


                                                        } else {

                                                            var userImage = new ProjectImage(projectImageData);

                                                            userImage.save(function (err, saveImage) {

                                                                if (err) {

                                                                    console.log(err);

                                                                } else {

                                                                    folder.imageFiles.push(saveImage);
                                                                    folder.save(function (err, ok) {

                                                                        if (err) {
                                                                            console.log(err);
                                                                        } else {

                                                                            res.send(saveImage);

                                                                        }


                                                                    });

                                                                }

                                                            });

                                                        }


                                                    });

                                                } else {

                                                }
                                            }

                                        });

                                    } else {

                                        res.send(data);

                                    }

                                }

                            }
                        }

                    }

                });

            }

        }
    );

};


UploadController.prototype.upload = function (req, res) {

    const file = req.files.userFile;
    const folderType = 'projectImages';
    const now = new Date();

    const day = dateFormat(now, "yyyy-mm-dd");

    const projectImageId = req.body.projectImageId

    const newUpload = new Upload();
    newUpload.ext = path.extname(file.name).toLowerCase();
    newUpload.date = day;

    newUpload.save(function (err, upload) {

        if (err) {

            console.fs(err);

        } else {

            Upload.count({date: day}, function (err, counted) {

                if (err) {

                    console.fs(err);

                }

                const folderNumber = Math.round(counted / 30);
                const folderDest = conf.staticDir + folderType + '/' + day + '/' + folderNumber + '/';
                mainConf.mkdir(folderDest);

                const filePath = req.files.userFile.path;

                fs.rename(
                    filePath,
                    folderDest + upload._id + upload.ext,
                    function (error) {
                        if (error) {
                            res.send({
                                errorCode: error,
                                error: 'Ah crap! Something bad happened'
                            });

                            return;

                        } else {

                            let thumbReady = false;
                            let minReady = false;

                            const thumbDest = folderDest + 'thumb_' + upload._id + upload.ext.toLowerCase();
                            const minDest = folderDest + 'min_' + upload._id + upload.ext.toLowerCase();

                            if (newUpload.ext === '.svg') {

                                upload.url = conf.staticPath + '/' + folderType + '/' + upload.date + '/' + folderNumber + '/' + upload._id + upload.ext;
                                upload.folderNumber = folderNumber;
                                upload.save(function (err, saved2) {
                                    if (err) {
                                        console.fs(err);
                                    } else {
                                        const data = saved2.toJSON();
                                        data.minUrl = conf.staticPath + '/' + folderType + '/' + upload.date + '/' + folderNumber + '/' + upload._id + upload.ext;
                                        data.thumbUrl = conf.staticPath + '/' + folderType + '/' + upload.date + '/' + folderNumber + '/' + upload._id + upload.ext;
                                        res.send(data);
                                    }
                                });

                            } else {//not svg

                                const thumbSize = JSON.parse(req.body.thumbSize);
                                const minSize = JSON.parse(req.body.minSize);

                                upload.url = conf.staticPath + '/' + folderType + '/' + upload.date + '/' + folderNumber + '/' + upload._id + upload.ext;
                                upload.folderNumber = folderNumber;
                                upload.save(function (err, saved2) {
                                    if (err) {
                                        res.status(500).send(err);
                                    } else {
                                        Promise.all([
                                            resize(upload, folderDest, thumbDest, thumbSize),
                                            resize(upload, folderDest, minDest, minSize)
                                        ])
                                            .then(values => {
                                                const data = saved2.toJSON();
                                                data.minUrl = conf.staticPath + '/' + folderType + '/' + upload.date + '/' + folderNumber + '/min_' + upload._id + (upload.ext.toLowerCase());
                                                data.thumbUrl = conf.staticPath + '/' + folderType + '/' + upload.date + '/' + folderNumber + '/thumb_' + upload._id + (upload.ext.toLowerCase());
                                                if (projectImageId) {
                                                    ProjectImage.update({_id: req.params.id},
                                                        {EditedUpload: upload},
                                                        (err, affected) => {
                                                            if (err)
                                                                res.status(500).send(err)
                                                            else
                                                                res.status(200).send(data)
                                                        })
                                                } else {
                                                    res.send(data);
                                                }
                                            })
                                    }
                                });
                            }
                        }
                    }
                );
            });
        }
    });
};

UploadController.prototype.uploadEdited = function (req, res) {

    console.log('Zaczynam ');

    var def = new Q.defer();
    var file = req.body.image64;
    var folderType = 'projectImages';
    var now = new Date();
    var projectImage = req.body.projectImage;
    var day = dateFormat(now, "yyyy-mm-dd");

    var newUpload = new Upload();
    newUpload.ext = '.jpg';
    newUpload.date = day;

    newUpload.save(function (err, saved) {

        if (err) {

            console.fs(err);

        } else {

            Upload.count({date: day}, function (err, counted) {

                if (err) {

                    console.fs(err);

                }

                var folderNumber = Math.round(counted / 30);
                var folderDest = conf.staticDir + folderType + '/' + day + '/' + folderNumber + '/';
                mainConf.mkdir(folderDest);

                //saveMainFile( req, res, folderType, filePath, folderDest, folderNumber, saved );
                var body = file;
                console.log('JEST I BEDE ROBIŁ :)');
                base64Data = body.replace(/^data:image\/png;base64,/, ""),
                    binaryData = new Buffer(base64Data, 'base64').toString('binary');

                fs.writeFile(
                    folderDest + saved._id + saved.ext,
                    binaryData,
                    'binary',
                    function (error) {

                        if (error) {

                            res.send({
                                errorCode: error,
                                error: 'Ah crap! Something bad happened'
                            });
                            return;

                        } else {

                            var thumbReady = false;
                            var minReady = false;

                            var thumbDest = folderDest + 'thumb_' + saved._id + saved.ext.toLowerCase();
                            var minDest = folderDest + 'min_' + saved._id + saved.ext.toLowerCase();

                            var thumbSize = req.body.thumbSize;
                            var minSize = req.body.minSize;

                            saved.url = conf.staticPath + '/' + folderType + '/' + saved.date + '/' + folderNumber + '/' + saved._id + saved.ext;
                            saved.minUrl = conf.staticPath + '/' + folderType + '/' + saved.date + '/' + folderNumber + '/min_' + saved._id + (saved.ext.toLowerCase());
                            saved.thumbUrl = conf.staticPath + '/' + folderType + '/' + saved.date + '/' + folderNumber + '/thumb_' + saved._id + (saved.ext.toLowerCase());
                            saved.folderNumber = folderNumber;
                            console.log(')))))))))))))))))))))))))))))))))))))))))');
                            saved.save(function (err, saved2) {

                                if (err) {

                                    console.fs(err);

                                } else {
                                    console.log(thumbSize);
                                    sharp(folderDest + saved._id + saved.ext.toLowerCase())
                                        .resize(parseInt(thumbSize.width), parseInt(thumbSize.height))
                                        .toFile(thumbDest, function (err) {

                                            if (err) {

                                                console.fs(err);

                                            } else {

                                                thumbReady = true;
                                                check();

                                            }

                                        });


                                    sharp(folderDest + saved._id + saved.ext.toLowerCase())
                                        .resize(parseInt(minSize.width), parseInt(minSize.height))
                                        .toFile(minDest, function (err) {

                                            if (err) {

                                                console.fs(err);

                                            } else {

                                                minReady = true;
                                                check();

                                            }

                                        });


                                    var data = saved2.toJSON();
                                    data.minUrl = conf.staticPath + '/' + folderType + '/' + saved.date + '/' + folderNumber + '/min_' + saved._id + (saved.ext.toLowerCase());
                                    data.thumbUrl = conf.staticPath + '/' + folderType + '/' + saved.date + '/' + folderNumber + '/thumb_' + saved._id + (saved.ext.toLowerCase());

                                    function check() {

                                        if (minReady && thumbReady) {

                                            console.log('odsylam zapytanie');

                                            ProjectImage.findOne({_id: projectImage}).exec(function (err, image) {
                                                if (err) {
                                                    console.log(err);
                                                } else {

                                                    image.EditedUpload = saved;
                                                    image.save(function (err, savedImage) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            console.log('zapisalem');
                                                            res.send(savedImage);
                                                            def.resolve(savedImage);
                                                        }
                                                    });

                                                }
                                            });

                                        }

                                    }

                                    //console.fs('Koniec zapisu!');
                                    //console.fs(saved2);
                                    //var thumbDest = folderDest + 'thumb_' + saved._id + saved.ext;
                                    //saveThumb( req, res, folderType, folderDest, saved2 );

                                    //res.send(saved2);
                                }

                            });

                        }

                    }
                );

            });

        }

    });

    return def.promise;

}


UploadController._userUpload = function (req, res) {

    var def = Q.defer();

    var file = req.files.userFile;
    var folderType = 'projectImages';
    var now = new Date();

    var day = dateFormat(now, "yyyy-mm-dd");


    var newUpload = new Upload();
    newUpload.ext = path.extname(file.name);
    newUpload.date = day;

    newUpload.save(function (err, saved) {

        if (err) {

            console.fs(err);

        } else {

            Upload.count({date: day}, function (err, counted) {

                if (err) {

                    console.fs(err);

                }

                var folderNumber = Math.round(counted / 30);
                var folderDest = conf.staticDir + folderType + '/' + day + '/' + folderNumber + '/';
                mainConf.mkdir(folderDest);

                var filePath = req.files.userFile.path;
                //saveMainFile( req, res, folderType, filePath, folderDest, folderNumber, saved );

                fs.rename(
                    filePath,
                    folderDest + saved._id + saved.ext,
                    function (error) {

                        if (error) {

                            res.send({
                                errorCode: error,
                                error: 'Ah crap! Something bad happened'
                            });
                            return;

                        } else {

                            var thumbReady = false;
                            var minReady = false;

                            var thumbDest = folderDest + 'thumb_' + saved._id + saved.ext.toLowerCase();
                            var minDest = folderDest + 'min_' + saved._id + saved.ext.toLowerCase();

                            var thumbSize = JSON.parse(req.body.thumbSize);
                            var minSize = JSON.parse(req.body.minSize);

                            saved.url = conf.staticPath + '/' + folderType + '/' + saved.date + '/' + folderNumber + '/' + saved._id + saved.ext;
                            saved.folderNumber = folderNumber;
                            saved.save(function (err, saved2) {

                                if (err) {

                                    console.fs(err);

                                } else {

                                    sharp(folderDest + saved._id + saved.ext.toLowerCase())
                                        .resize(thumbSize.width, thumbSize.height)
                                        .toFile(thumbDest, function (err) {

                                            if (err) {

                                                console.fs(err);

                                            } else {

                                                thumbReady = true;
                                                check();

                                            }

                                        });


                                    sharp(folderDest + saved._id + saved.ext.toLowerCase())
                                        .resize(minSize.width, minSize.height)
                                        .toFile(minDest, function (err) {

                                            if (err) {

                                                console.fs(err);

                                            } else {

                                                minReady = true;
                                                check();

                                            }

                                        });


                                    var data = saved2.toJSON();
                                    data.minUrl = conf.staticPath + '/' + folderType + '/' + saved.date + '/' + folderNumber + '/min_' + saved._id + (saved.ext.toLowerCase());
                                    data.thumbUrl = conf.staticPath + '/' + folderType + '/' + saved.date + '/' + folderNumber + '/thumb_' + saved._id + (saved.ext.toLowerCase());

                                    function check() {

                                        if (minReady && thumbReady) {

                                            def.resolve(data);

                                        }

                                    }

                                }

                            });

                        }

                    }
                );


            });

        }

    });

    return def.promise

}


UploadController._savePagePrev = function (user, pageID, base64) {

    var def = Q.defer();

    var now = new Date();

    var day = dateFormat(now, "yyyy-mm-dd");

    var userID = user;

    var folderType = "userProjectImages";

    var newUpload = new Upload();
    newUpload.ext = ".jpg";
    newUpload.date = day;
    newUpload.type = 'user';
    newUpload.userID = userID;

    newUpload.save(function (err, saved) {
        if (err) {
            console.fs(err);
        } else {
            Upload.count({date: day}, function (err, counted) {
                if (err) {
                    console.fs(err);
                }
                var folderNumber = Math.round(counted / 30);
                //console.fs('req.files.userFile: _++_____++_+_+_+_+_+_');
                //console.fs(req.files.userFile);
                var folderDest = conf.staticDir + folderType + '/' + userID + '/' + day + '/' + folderNumber + '/';
                //console.fs('folderDest: _+_+_+_+__+_+_+_+__+_+_+_+_+_');
                //console.fs(folderDest);
                mainConf.mkdir(folderDest);

                var base64Data = base64.replace(/^data:image\/png;base64,/, ""),
                    binaryData = new Buffer(base64Data, 'base64').toString('binary');

                var thumbDest = folderDest + 'pagePREV_' + saved._id + '.jpg';

                fs.writeFile(thumbDest, binaryData, "binary", function (err) {
                    if (err) {
                        console.fs(err);
                    } else {
                        //var thumbDest = folderDest + 'min_' + saved._id + saved.ext;

                        saved.url = conf.staticPath + '/' + folderType + '/' + saved.userID + '/' + saved.date + '/' + folderNumber + '/pagePREV_' + saved._id + (saved.ext.toLowerCase());
                        saved.folderNumber = folderNumber;

                        saved.save(function (err, uploadSaved) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(uploadSaved);
                                console.log('ZAPISALOI SIE NAWET :P');
                                def.resolve(uploadSaved);
                            }
                        });

                    }
                });

            });
        }
    });

    return def.promise;


};

UploadController.prototype.userUpload = function (req, res) {

    var folderType = 'userProjectImages';
    //console.fs( '!_!_!_!__!_!_!_!_!_!_!__!_!_!_!_!_!_!_file: ' );
    var file = req.files.userFile;
    //console.fs(req.files);

    var now = new Date();

    var day = dateFormat(now, "yyyy-mm-dd");

    var userID = req.body.userID;

    if (!userID) {

        if (!GLOBAL.sessions[req.body['access_token']]) {

            var decodedToken = jwt.decode(req.body['access_token'], jwt_secret, 'HS256');

            User.findOne({userID: decodedToken.userEditorID}).exec(function (err, user) {

                if (err) {
                    console.log(err);
                } else {

                    userID = user._id;
                    createUpload();

                }

            });

        } else {

            var decodedToken = jwt.decode(req.body['access_token'], jwt_secret, 'HS256');

            User.findOne({userID: decodedToken.userEditorID}).exec(function (err, user) {

                if (err) {
                    console.log(err);
                } else {

                    userID = user._id;
                    createUpload();

                }

            });

        }

    } else {
        createUpload();
    }
    //console.fs( userID );

    //data = {};

    function createUpload() {

        var newUpload = new Upload();
        newUpload.ext = path.extname(file.name);
        newUpload.date = day;
        newUpload.type = 'user';
        newUpload.userID = userID;

        newUpload.save(function (err, saved) {
            if (err) {
                console.fs(err);
            } else {
                Upload.count({date: day}, function (err, counted) {
                    if (err) {
                        console.fs(err);
                    }
                    var folderNumber = Math.round(counted / 30);
                    //console.fs('req.files.userFile: _++_____++_+_+_+_+_+_');
                    //console.fs(req.files.userFile);
                    var folderDest = conf.staticDir + folderType + '/' + userID + '/' + day + '/' + folderNumber + '/';
                    //console.fs('folderDest: _+_+_+_+__+_+_+_+__+_+_+_+_+_');
                    //console.fs(folderDest);
                    mainConf.mkdir(folderDest);
                    var filePath = req.files.userFile.path;
                    saveUserMainFile(req, res, folderType, filePath, folderDest, folderNumber, saved);
                });
            }
        });

    }
};

module.exports = UploadController;
