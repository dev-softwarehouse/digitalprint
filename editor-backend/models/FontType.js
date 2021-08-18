var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var FontTypeSchema = new Schema({
	name: {
		type: 'String',
		required: true,
	},
	url: {
        type: 'String'
    },
    folderNumber: {
        type: 'Number',
        required: true
    }
},{usePushEach:true});

FontTypeSchema.plugin(deepPopulate, {
    
});

FontTypeSchema.pre('remove', function(next){
	this.model('Font').update(
        {FontTypes:  this._id}, 
        {$pull: {'Font': this._id}}, 
        {multi: true},
        next
    );
});

module.exports.model = mongoose.model('FontType', FontTypeSchema, 'FontType');