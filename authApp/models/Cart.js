var mongoose = require('mongoose'),
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;
var mainConf = require('../libs/mainConf.js');

var expireInMSecond = mainConf.expireTimeInSeconds;

var CartSchema = new Schema({
	calcID: {
        type: 'Number',
        required: true
    },
    orderID: {
    	type: 'Number',
        required: true
    },
    productID: {
    	type: 'Number',
        required: true
    },
    ProductAddresses: [{
        addressID: {
            type: 'Number'
        },
        deliveryID: {
            type: 'Number'
        },
        packagesNumber: {
            type: 'Number'
        },
        senderID: {
            type: 'Number'
        },
        volume: {
            type: 'Number'
        },
        allVolume: {
            type: 'Number'
        },
        join: {
            type: Boolean
        },
        commonDeliveryID: {
            type: Number
        },
        commonRealisationTime: {
            type: Date
        },
        collectionPointID: {
            type: Number
        }
    }],
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
}, {
    upsert: true,
    setDefaultsOnInsert: true
});

module.exports.model = mongoose.model('Cart', CartSchema, 'Cart');