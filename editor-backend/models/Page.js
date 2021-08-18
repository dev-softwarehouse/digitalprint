var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema,
    ThemePage = require('./ThemePage.js');

var ThemePageSchema = ThemePage.schema;

var PageSchema = new Schema({
    'format': 'String', // bo jeszcze nie ma
    name: {
        type: 'String',
        required: true
    },
    type: {
        type: 'Number',
        default: 1,
    },
    x: 'Number',
    y: 'Number',
    rotation : 'Number',
    scaleX : 'Number',
    scaleY : 'Number',
    width: 'Number',
    height: 'Number',
    slope: 'Number',
    ThemePageFrom: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ThemePage'
    },
    ThemePage: [ThemePageSchema],
    ProposedTemplate: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ProposedTemplate'
    },
    UsedImages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectImage'
    }],
    EditorBitmaps: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'EditorBitmap'
    }],
    pageValue : {
        type: 'Number',
        default : 1
    },
    settings: {
        type: 'Mixed'
    },
    'vacancy': {
        type: 'Boolean',
        default: false
    },
    'spread': {
        type: 'Boolean',
        default: false
    }
},{usePushEach:true});

PageSchema.plugin(deepPopulate, {
    


});

PageSchema.methods.find = function (callback) {

    return this.model('Page').findOne({ '_id': this._id }, callback);

};

PageSchema.pre('remove', function(next){

    this.model('View').update(
        {Pages:  this._id}, 
        {$pull: {'Pages': this._id}}, 
        {multi: true},
        next
    );

});

module.exports.model  = mongoose.model('Page', PageSchema, 'Page');