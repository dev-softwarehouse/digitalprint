var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var ComplexViewSchema = new Schema({
    order: { 
        type: 'Number', 
        required: true 
    },
    name: {
    	type: 'String', 
        required: true
    },
    // Czy powtarzalny jest ComplexView ?
    repeatable: {
        type: 'Boolean',
        default: false
    },
    // Tutaj ma być ComplexView
    GroupLayers: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'GroupLayer'
    }]
},{usePushEach:true});

ComplexViewSchema.plugin(deepPopulate, {
    
});

module.exports.model = mongoose.model('ComplexView', ComplexViewSchema, 'ComplexView');