/**
 * Grupy produktów złożonych
 */

var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var GroupLayerSchema = new Schema({
    order: { 
        type: 'Number', 
        required: true 
    },
    name: {
    	type: 'String', 
        required: true
    },
    FormatViews: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'FormatView'
    }],
    complexGroupID:{
        type: 'Number', 
        required: true
    }
},{usePushEach:true});

GroupLayerSchema.plugin(deepPopulate, {
    
});

module.exports.model = mongoose.model('GroupLayer', GroupLayerSchema, 'GroupLayer');