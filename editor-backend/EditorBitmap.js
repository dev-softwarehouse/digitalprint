var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var EditorBitmapSchema = new Schema({
    name: 'String',
    width: 'Number',
    height: 'Number',
    //trueHeight: 'Number',
    //trueWidth: 'Number',
    ProjectImage: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'ProjectImage'
    },
    x: 'Number',
    y: 'Number',
    rotation: {
        type: 'Number',
        default: 0
    },
    scaleX: {
        type: 'Number',
        default: 1
    },
    shadowBlur : {
        type: 'Number',
        default: 10
    },
    shadowColor : {
        type: 'String',
        default: 'rgba(0,0,0,255)'
    },
    shadowOffsetX : {
        type: 'Number',
        default: 0
    },
    shadowOffsetY : {
        type: 'Number',
        default: 0
    },
    dropShadow : {
        type: 'Boolean',
        default: false
    },
    scaleY:{
        type: 'Number',
        default: 1
    },
    displaySimpleBorder:{
        type: 'Boolean',
        default: true
    },
    borderColor:{
        type: 'String',
        default: 'rgba(0,0,0,255)'
    },
    borderWidth:{
        type: 'Number',
        default: 0
    },
    order: 'Number',

    uid: {
        type: 'String',
        required: true
    },

    backgroundFrame: {

        type: 'Boolean',
        default: false

    },

    backgroundFrameID:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Frame'
    },
    svg: 'Boolean',
    optionsData : 'Mixed',
    filters : 'Mixed',
    'base': 'Boolean',
    'ObjectOptions': [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'ObjectOption'
    }],
    maskFilter: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'ProjectImage'
    }
});

EditorBitmapSchema.plugin(deepPopulate, {
    whitelist: [
    'ProjectImage',
    'ObjectOptions',
    'ObjectOptions.EditorBitmap',
    'backgroundFrameID',
    'backgroundFrameID.ProjectImage',
    'maskFilter'
  ],
});

EditorBitmapSchema.pre('remove', function(next){

    this.model('UserPage').update(
        {EditorTexts:  this._id},
        {$pull: {'UsedImages': this._id}},
        {multi: true},
        next
    );

    this.model('Page').update(
        {EditorBitmaps:  this._id},
        {$pull: {'EditorBitmaps': this._id}},
        {multi: true},
        next
    );

    this.model('View').update(
        {EditorBitmaps:  this._id},
        {$pull: {'EditorBitmaps': this._id}},
        {multi: true},
        next
    );

});

/*EditorBitmapSchema.methods.find = function (callback) {
    return this.model('EditorBitmap').findOne({ '_id': this._id }, callback);
};*/

module.exports.model = mongoose.model('EditorBitmap', EditorBitmapSchema, 'EditorBitmap');
