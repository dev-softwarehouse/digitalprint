var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var ProposedTemplateCategorySchema = new Schema({
    name: {
    	type: 'String',
    	required: true
    }
},{usePushEach:true});

ProposedTemplateCategorySchema.plugin(deepPopulate, {
 
});

ProposedTemplateCategorySchema.pre('remove', function(next){
	
	ProposedTemplate.update({ProposedTemplateCategory: this._id}, {$unset: {ProposedTemplateCategory: this._id }}, function(err, updated) {
		if( err ){
			console.fs(err);
		}
		next();
	});

});

module.exports.model = mongoose.model('ProposedTemplateCategory', ProposedTemplateCategorySchema, 'ProposedTemplateCategory');