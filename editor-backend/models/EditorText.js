var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var EditorTextSchema = new Schema({
    name: 'String',
    width: 'Number',
    height: 'Number',
    //trueHeight: 'Number',
    //trueWidth: 'Number',
    content : 'Mixed',
    x: 'Number',
    y: 'Number',
    order : 'Number',
    rotation: 'Number', 
    uid: {
        type: 'String',
        required: false
    },
    showBackground: {
        type : 'Boolean',
        default : false
    },
    backgroundColor : {
        type : 'String',
        default : '#fff'
    },
    backgroundOpacity : {
        type : 'Number',
        default : 1
    },
    shadowBlur : {
        type: 'Number',
        default: 5
    },
    verticalPadding: {
        type: 'Number',
        default : 5
    },
    horizontalPadding: {
        type: 'Number',
        default : 5
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
        default: false
    },
    borderColor:{
        type: 'String',
        default: '#000'
    },
    borderWidth:{
        type: 'Number',
        default: 0
    },  
    optionsData : 'Mixed',
    filters : 'Mixed',

},{usePushEach:true});

EditorTextSchema.plugin(deepPopulate, {
    
});

EditorTextSchema.pre('remove', function(next){
    this.model('Page').update(
        {EditorTexts:  this._id}, 
        {$pull: {'EditorTexts': this._id}}, 
        {multi: true},
        next
    );

    this.model('View').update(
        {EditorTexts:  this._id}, 
        {$pull: {'EditorTexts': this._id}}, 
        {multi: true},
        next
    );
});

/*EditorBitmapSchema.methods.find = function (callback) {
    return this.model('EditorBitmap').findOne({ '_id': this._id }, callback);
};*/

module.exports.model = mongoose.model('EditorText', EditorTextSchema, 'EditorText');