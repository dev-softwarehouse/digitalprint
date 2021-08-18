var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;
var mainConf = require('../confs/main');

var ConnectSchema = new Schema({
    connectID: {
    	type: 'Number',
    	required: true,
    	unique: true,
    	default: 1
    },
    AdminProject:{
    	type: Schema.Types.ObjectId, 
        ref: 'AdminProject'
    },
    View: {
    	type: Schema.Types.ObjectId, 
        ref: 'View'
    },
    createdAt: { 
        type: Date, 
        expires: mainConf.expireTime, 
        default: Date.now 
    }
},{usePushEach:true});

module.exports.model = mongoose.model('Connect', ConnectSchema, 'Connect');