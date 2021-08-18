var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var AttributeSchema = new Schema({
	attributeID: {
		type: 'Number'
	},
	attributeName: {
		type: 'String'
	},
    Options: [{
    	optionID: {
    		type: 'Number'
    	},
    	optionName: {
    		type: 'String'
    	}
    }]
},{usePushEach:true});

module.exports.model = mongoose.model('Attribute', AttributeSchema, 'Attribute');