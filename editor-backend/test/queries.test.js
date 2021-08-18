const mongoose = require('mongoose')
const assert = require('chai').assert

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
const ComplexView = require('../models/ComplexView.js').model;
const GroupLayer = require('../models/GroupLayer.js').model;
const FormatView = require('../models/FormatView.js').model;
const SecretProof = require('../models/SecretProof.js').model;
const Session = require('../models/Session.js').model;
const ObjectOption = require('../models/ObjectOption.js').model;
const ProposedTemplateCategory = require('../models/ProposedTemplateCategory.js').model;
const ComplexUserProject = require('../models/ComplexUserProject.js').model;
const UserView = require('../models/UserView.js').model;

function autoPopulateSubs(next) {
    this.populate('subs');
    next();
}

describe('queries', () => {
    let db
    before((done) => {
        db = mongoose.connect("mongodb://editorDb:ed1t0rf69b54@localhost:27017/editor_25?authSource=admin", {useMongoClient: true}, (err) => {
            if (err) {
                console.fs(err);
            }
            done()
        });
    })
    it('list projects', (done) => {
        ComplexUserProject.findOne({_id: '5b585e91e7f3f445ccd585ac'})
            .deepPopulate('mainTheme mainTheme.MainTheme projects projects.Views projects.Views.Pages projects.Views.Pages.UsedImages')
            .exec((err, proj) => {
                //console.log(proj.projects[1].Views[0].Pages[0])
                done()
            })
    })
    it('list MainTheme', (done) => {
        MainTheme.find()/*findOne('59fca46db9c38d6957c70ac1')*/
            .deepPopulate('ProjectMasks')
            .exec((err, theme) => {
                console.log(theme)
                done()
            })
    })
    it('list Theme', (done) => {
        MainTheme.find()/*findOne('59fca46db9c38d6957c70ac1')*/
            .deepPopulate('ProjectMasks')
            .exec((err, theme) => {
                console.log(theme)
                done()
            })
    })

})