var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var SecretProofSchema = new Schema({
    userID: { 
        type: 'Number', 
        required: true 
    },
    secretProof: {
    	type: 'String', 
        required: true
    },
    datetime: {
        type: Date,
        required: true
    },
},{usePushEach:true});


module.exports.model = mongoose.model('SecretProof', SecretProofSchema, 'SecretProof');