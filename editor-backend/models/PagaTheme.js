var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var PageThemeSchema = new Schema({
    name: {
        type: 'String',
        required: true
    },
    'order': {
        type: 'Number',
        required: true
    },
    ProposedTemplates: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ProposedTemplate'
    }],
    BackgroundObjects: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ProjectImage'
    }],
    ForegroundObjects: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ProjectImage'
    }],
    UsedImages: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ProjectImage'
    }],
    width: 'Number',
    height: 'Number'
},{usePushEach:true});

module.exports.schema = PageThemeSchema; 
module.exports.model  = mongoose.model('ThemePage', PageThemeSchema, 'ThemePage');