var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema,
    conf = require('../libs/conf.js');

var UserSchema = new Schema({
	// mysql userID
	userID: {
		type: 'Number',
		required: true
	},
	Photos: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ProjectImage'
    }],
    Projects: [{
    	type : mongoose.Schema.Types.ObjectId, 
        ref : 'UserProject'
    }],
    email: {
    	type: 'String',
    	required: true
    },
    first_name: {
    	type: 'String',
    	required: true
    },
    last_name: {
    	type: 'String',
    	required: true
    },
    password: {
        type: 'String'
    }
});

module.exports.model = mongoose.model('User', UserSchema, 'User');