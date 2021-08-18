var mongoose = require('mongoose'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

var mainConf = require('../libs/mainConf.js');

var expireInMSecond = mainConf.expireTimeInSeconds;

var ProductAddressSchema = new Schema({
	addressID: {
        type: 'Number',
        required: true
    },
    deliveryID: {
    	type: 'Number',
        required: true
    },
    packagesNumber: {
    	type: 'Number'
    },
    senderID: {
    	type: 'Number'
    },
    volume: {
    	type: 'Number',
        required: true
    },
    join: {
	    type: Boolean
    },
    expireAt: {
        type: Date,
        validate: [ function(v) {
            return (v - new Date()) <= expireInMSecond;
        }, 'Cannot expire more than 60 seconds in the future.' ],
        default: function() {
            console.log( new Date(new Date().valueOf() + expireInMSecond) );
            return new Date(new Date().valueOf() + expireInMSecond);
        }
    }
});

module.exports.model = mongoose.model('ProductAddress', ProductAddressSchema, 'ProductAddress');