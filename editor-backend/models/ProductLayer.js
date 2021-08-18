var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var FormatLayerSchema = new Schema({
    order: { 
        type: 'Number', 
        required: true 
    },
    name: {
    	type: 'String', 
        required: true
    },
    ProductFormats: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ProductFormat'
    }],
    complexGroupID:{
        type: 'Number', 
        required: true
    }
},{usePushEach:true});

module.exports.model = mongoose.model('FormatLayer', FormatLayerSchema, 'FormatLayer');