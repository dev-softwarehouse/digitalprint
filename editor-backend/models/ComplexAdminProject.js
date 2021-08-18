var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var ComplexAdminProjectSchema = new Schema({
    name: { 
        type: 'String', 
        required: true 
    },
    /*typeID: {
        type: 'Number', 
        required: true 
    },*/
    // Czy powtarzalny jest ComplexView ?
    /*repeatable: {
        type: 'Boolean',
        default: false
    },*/
    // Tutaj ma być ComplexView
    ComplexViews: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ComplexView'
    }],
    active: {
        type: 'Boolean',
        default: false
    }
},{usePushEach:true});

ComplexAdminProjectSchema.plugin(deepPopulate, {

});

module.exports.model = mongoose.model('ComplexAdminProject', ComplexAdminProjectSchema, 'ComplexAdminProject');