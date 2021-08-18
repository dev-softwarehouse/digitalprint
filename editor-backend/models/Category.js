var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name: {
    	type: 'String',
    	required: true
    }
},{usePushEach:true});

CategorySchema.methods.findOne = function (callback) {
    return this.model('Category').findOne({'name': this.name}, callback);
};

module.exports.model = mongoose.model('Category', CategorySchema, 'Category');