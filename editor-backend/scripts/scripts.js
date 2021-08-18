const mongoose = require('mongoose')
const https = require('https')
const rootCas = require('ssl-root-cas/latest').create();
https.globalAgent.options.ca = rootCas
const url = require('url')
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
const fs = require('fs')
const shell = require('shelljs')

const EditorBitmap = require('../models/EditorBitmap.js').model;
const EditorText = require('../models/EditorText.js').model;
const ProductType = require('../models/ProductType.js').model;
const AdminProject = require('../models/AdminProject.js').model;
const View = require('../models/View.js').model;
const Page = require('../models/Page.js').model;
const Theme = require('../models/Theme.js').model;
const ProjectImage = require('../models/ProjectImage.js').model;
const ProposedTemplate = require('../models/ProposedTemplate.js').model;
const Category = require('../models/Category.js').model;
const ProposedImage = require('../models/ProposedImage.js').model;
const ProposedText = require('../models/ProposedText.js').model;
const MainTheme = require('../models/MainTheme.js').model;
const ThemeCategory = require('../models/ThemeCategory.js').model;
const ThemePage = require('../models/ThemePage.js').model;
const Connect = require('../models/Connect.js').model;
const User = require('../models/User.js').model;
const UserProject = require('../models/UserProject.js').model;
const Font = require('../models/Font.js').model;
const FontType = require('../models/FontType.js').model;
const ComplexView = require('../models/ComplexView.js').model;
const GroupLayer = require('../models/GroupLayer.js').model;
const FormatView = require('../models/FormatView.js').model;
const Format = require('../models/Format.js').model;
const SecretProof = require('../models/SecretProof.js').model;
const Session = require('../models/Session.js').model;
const ObjectOption = require('../models/ObjectOption.js').model;
const ProposedTemplateCategory = require('../models/ProposedTemplateCategory.js').model;
const ComplexUserProject = require('../models/ComplexUserProject.js').model;
const UserView = require('../models/UserView.js').model;

db = mongoose.connect("mongodb://editorDb:ed1t0rf69b54@localhost:27017/editor_25?authSource=admin", {useMongoClient: true}, function (err) {
    if (err) {
        console.log(err);
    }
})

const action = process.argv.slice(2)[0]
const destDir = process.argv.slice(2)[1]
const logErrorsOnly = process.argv.slice(2)[2] === 'true'
const downloadPath='static.dreamsoft.pro/editor'

const createDirRecur = (path, callback) => {
    const previous = path.substr(0, path.lastIndexOf('/'))
    if (!fs.existsSync(previous)) {
        createDirRecur(previous, () => {
            createDirRecur(path, callback)
        })
    } else {
        fs.mkdir(path, () => {
            callback()
        })
    }
}
const updateField = (image, fieldName, clb = null) => {
    try {
        let newField
        try {
            newField = image[fieldName]
        } catch (e) {
            newField = null//TODO debug stop only
        }
        if (!newField) {
            if (clb)
                process.nextTick(clb)
            return
        }
        newField = newField.replace('/35/', '/25/').replace('undefined', '').replace('http://', 'https://')
        if (newField.indexOf('digitalprint.pro') === -1)
            newField = 'https://digitalprint.pro:1341' + newField
        const url1 = url.parse(newField)
        const path = url1.path
        if (fs.existsSync(`${destDir}${path}`)) {
            image[fieldName] = newField.replace('https://digitalprint.pro:1341', '')
            // if (!logErrorsOnly) console.log(`Exists: ${image[fieldName]}`)
            return image.save((err) => {
                if (err)
                    console.error(err)
                else {
                    // if (!logErrorsOnly) console.log(`saved modified ${path}`)
                    if (clb)
                        process.nextTick(clb)
                }

            })
        } else {
            let oldPath = image[fieldName]
            oldPath = oldPath.replace('undefined', '').replace('http://', 'https://')
            if (oldPath.indexOf('digitalprint.pro') === -1)
                oldPath = 'https://digitalprint.pro:1341' + oldPath
            oldPath = oldPath.replace('/25/', '/35/')
            oldPath = oldPath.replace('digitalprint.pro:1341', downloadPath)
            if (oldPath.indexOf('/userProjectImages/') > -1) {
                if (clb)
                    process.nextTick(clb)
                return
            }
            https.get(oldPath, (res) => {
                if (!logErrorsOnly) console.log(`fetching ${oldPath}`)
                if (res.statusCode !== 200) {
                    console.log(`not found ${oldPath} , code ${res.statusCode}`)
                    image[fieldName] = newField.replace('https://digitalprint.pro:1341', '')
                    image.save((err) => {
                        if (err)
                            console.error(err)
                        else {
                            if (!logErrorsOnly) console.log(`Updated field ${fieldName} to ${image[fieldName]} with not resolved download path ${oldPath}`)
                            if (clb)
                                process.nextTick(clb)
                        }

                    })
                } else {
                    let dir = `${destDir}${path}`
                    dir = dir.substr(0, dir.lastIndexOf('/'))
                    createDirRecur(dir, () => {
                        const file = fs.createWriteStream(`${destDir}/${path}`)
                        res.pipe(file).on('finish', () => {
                            if (!logErrorsOnly) console.log(`Create dir done ${path}`)
                            image[fieldName] = newField.replace('https://digitalprint.pro:1341', '')
                            image.save((err) => {
                                if (err)
                                    console.error(err)
                                else {
                                    if (!logErrorsOnly) console.log(`Saved file ${path}`)
                                    if (clb)
                                        process.nextTick(clb)
                                }

                            })
                        })
                    })
                }
            })
                .on('error', e => {
                    console.log(`Error while try ${oldPath}`)
                    console.error(e)
                    if (clb)
                        process.nextTick(clb)
                })
        }

    } catch (e) {
        console.error(e)
        if (clb)
            process.nextTick(clb)
    }
}
const fixExternalResources = () => {

    const items = []

    const imagesCollections = 'ProjectBackgrounds ProjectCliparts ProjectMasks ProjectPhotos'

    MainTheme.find({_id:'59fca46db9c38d6957c70ac1'}).deepPopulate(imagesCollections).exec((err, allThemes) => {
        allThemes.map(theme => {
            imagesCollections.split(' ').forEach(name => {
                theme[name].reduce((all, item) => {
                    all.push(item)
                    return all
                }, items)
            })
        })
    })
        .then(() => {
            return ProjectImage.find().exec((err, images) => {
                images.reduce((all, item) => {
                    all.push(item)
                    return all
                }, items)
            })
        })
        .then(() => {
            const fields = ['imageUrl', 'minUrl', 'thumbnail']
            let fieldI = 0
            let itemI = 0
            const next = () => {
                if (itemI < items.length && fieldI < fields.length) {
                    updateField(items[itemI], fields[fieldI++], next)
                }
                else if (itemI < items.length) {
                    fieldI = 0
                    itemI++
                    next()
                }
            }
            next()
        })

    const updateUrl = (collection) => {
        return new Promise((resolve, reject) => {
            let i = 0;
            const next = () => {
                if (i < collection.length - 1)
                    updateField(collection[i], 'url', next)
                else
                    resolve(i)
                i++
            }
            next()
        })

    }
    ProposedTemplate.find().exec((err, templates) => {
        updateUrl(templates).then((num) => {
            if (!logErrorsOnly) console.log(`Updated ProposedTemplate.url in ${num}`)
        })
    })

    Theme.find().exec((err, themes) => {
        updateUrl(themes).then((num) => {
            if (!logErrorsOnly) console.log(`Updated Theme.url in ${num}`)
        })
    })
    ThemePage.find().exec((err, themes) => {
        updateUrl(themes).then((num) => {
            if (!logErrorsOnly) console.log(`Updated ThemePage.url in ${num}`)
        })
    })
    MainTheme.find().exec((err, themes) => {
        updateUrl(themes).then((num) => {
            if (!logErrorsOnly) console.log(`Updated MainTheme.url in ${num}`)
        })
    })
}

if (action === 'fixExternalResources')
    fixExternalResources()

const session = () => {
    /*Session.find({sid: 'SOLGjRuqT5fxOYkvRHE5yXkMmw'}).exec((err, ss) => {
        ss.expireAt=(new Date()).getTime()+1000*365*24*60*60
        ss.save(err => {
            if (err)
                throw new Error(err)
            else
                process.exit(1)
        })
    })*/
    const sid = process.argv.slice(2)[1]
    /*Session.findOne({sid:sid}).exec((err,s)=>{
        if(err)
            throw new Error(err)
        s.remove()
        process.exit()
    })*/
    const ss = new Session()
    ss.sid = sid
    ss.createdAt = (new Date()).getTime() + 1000 * 365 * 24 * 60 * 60
    ss.data = '{"user":{"super":1}}'
    ss.save(err => {
        if (err)
            throw new Error(err)
        else
            process.exit()
    })
}
if (action === 'session')
    session()

const generateDevPassword = () => {

    const postData = `email=office@digitalprint.pro&password=1234`

    const options = {
        hostname: 'logowanie1.dreamsoft.pro',
        path: '/login?domainName=dreamsoft.pro',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = https.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Password response: ' + chunk);
            process.exit()
        });
    });
    req.on('error', (e) => {
        console.error(e);
    });
    req.write(postData);
    req.end();
}

if (action === 'generateDevPassword')
    generateDevPassword()

