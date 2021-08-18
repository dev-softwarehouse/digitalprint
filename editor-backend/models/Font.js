var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var FontSchema = new Schema({
	name: {
		type: 'String',
		required: true,
	},
	FontTypes: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'FontType'
    }],
    miniature: {
        type: 'String'
    }
},{usePushEach:true});

FontSchema.plugin(deepPopulate, {
    
});

FontSchema.pre('remove', function(next){
	/*this.model('EditorBitmap').update(
        {ObjectOptions:  this._id}, 
        {$pull: {'ObjectOptions': this._id}}, 
        {multi: true},
        next
    );*/
});

module.exports.model = mongoose.model('Font', FontSchema, 'Font');