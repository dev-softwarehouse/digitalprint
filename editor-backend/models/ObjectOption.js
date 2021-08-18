var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var ObjectOptionSchema = new Schema({
	ids: [{
        type: 'Number'
    }],
    EditorBitmap: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'EditorBitmap'
    }
},{usePushEach:true});

ObjectOptionSchema.plugin(deepPopulate, {
    
});

ObjectOptionSchema.pre('remove', function(next){
	this.model('EditorBitmap').update(
        {ObjectOptions:  this._id}, 
        {$pull: {'ObjectOptions': this._id}}, 
        {multi: true},
        next
    );
});

module.exports.model = mongoose.model('ObjectOption', ObjectOptionSchema, 'ObjectOption');