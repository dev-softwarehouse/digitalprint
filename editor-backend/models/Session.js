var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;
var mainConf = require('../confs/main');

var SessionSchema = new Schema({
	"started": {
		type: 'Date'
	},
	"last_accessed": {
		type: 'Date'
	},
	"data": 'String',
	"sid": {
		type: 'String',
		required: true,
		unique: true
	},
	"valid": {
		type: Boolean
	},
	"ts": {
		type: Date
	},
	createdAt: { 
		type: Date, 
		expires: mainConf.expireTime, 
		default: Date.now 
	}
},{usePushEach:true});

module.exports.model = mongoose.model('Session', SessionSchema, 'Session');