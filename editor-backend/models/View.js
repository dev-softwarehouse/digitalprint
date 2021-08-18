var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var ViewSchema = new Schema({
    name: {
        type: 'String',
        required: true
    },
    order: {
        type: 'Number',
        required: true
    },
    baseObjects: [{
        type: Schema.Types.ObjectId,
        required: false
    }],
    Pages: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'Page'
    }],
    EditorBitmaps: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'EditorBitmap'
    }],
    EditorTexts: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'EditorText'
    }],
    repeatable: {
        type: 'Boolean',
        default: false
    }
},{usePushEach:true});

//ViewSchema.plugin(deepPopulate);

ViewSchema.plugin(deepPopulate, {
    whitelist: [
    'Pages',
    'EditorTexts',
    'EditorBitmaps',
    'EditorBitmaps.ProjectImage',
    'EditorBitmaps.ObjectOptions',
    'EditorBitmaps.ObjectOptions.EditorBitmap',
    'EditorBitmaps.ObjectOptions.EditorBitmap.ProjectImage'
  ],
  populate: {
    'EditorBitmaps.ProjectImage': {
        select: '_id name minUrl width height trueWidth trueHeight uid'
    }
  }
});

ViewSchema.methods.findOne = function (callback) {
    // .lean().populate('Pages').populate('EditorBitmaps')
    return this.model('View').findOne({ '_id': this._id }, callback).deepPopulate('EditorText EditorBitmap EditorBitmaps.ProjectImage');
};

ViewSchema.pre('remove', function(next){
    this.model('Format').update(
        {Views:  this._id}, 
        {$pull: {'Views': this._id}}, 
        {multi: true},
        next
    );
});

module.exports.model = mongoose.model('View', ViewSchema, 'View');