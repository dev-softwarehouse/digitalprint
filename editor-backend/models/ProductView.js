var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var FormatViewSchema = new Schema({
    order: { 
        type: 'Number', 
        required: true 
    },
    View: {
    	type: mongoose.Schema.Types.ObjectId, 
        ref: 'View'
    },
    /*typeID: {
    	type: 'Number',
    	required: true 
    },*/
    position: {
    	x: 'Number',
    	y: 'Number'
    }
},{usePushEach:true});

module.exports.model = mongoose.model('FormatView', FormatViewSchema, 'FormatView');