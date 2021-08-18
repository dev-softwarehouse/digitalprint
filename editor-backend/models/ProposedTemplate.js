var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var ProposedTemplateSchema = new Schema({
    ProposedImages: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ProposedImage'
    }],
    ProposedTexts: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ProposedText'
    }],
    EditorBitmaps: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'EditorBitmap'
    }],
    url: 'String',
    width: 'Number',
    height: 'Number',
    'category': {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category'
    },
    ProposedTemplateCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProposedTemplateCategory'
    },
    isGlobal: {
        type: 'Boolean',    
        default: true
    },
    textOptions : [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ProposedTemplate'
    }],
    isOption : {
        type : 'Boolean',
        default : false
    },
    parentTemplate : {
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ProposedTemplate'
    },
    imagesCount : 'Number',
    textsCount   : 'Number'
},{usePushEach:true});

ProposedTemplateSchema.plugin(deepPopulate, {/*
  populate: {
    'ProposedImages': {
        select: 'size pos bounds'
    },
    'ProposedTexts': {
        select: 'size pos bounds default'
    }
  }
  */
});

ProposedTemplateSchema.methods.find = function (callback) {
    return this.model('ProposedTemplate').find({}, callback).populate('ProposedImage').populate('ProposedText');
};

module.exports.model = mongoose.model('ProposedTemplate', ProposedTemplateSchema, 'ProposedTemplate');