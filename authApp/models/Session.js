var mongoose = require('mongoose'),
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;
var mainConf = require('../libs/mainConf.js');

var expireInMSecond = mainConf.expireTimeInSeconds;

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
    "orderID": {
        type: Number
    },
	"ts": {
		type: Date
	},
	createdAt: { 
		type: Date,
		default: Date.now 
	},
	Carts: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Cart'
    }],
    addresses: [{
        type: 'String'
    }],
    expireAt: {
        type: Date,
        validate: [ function(v) {
            return (v - new Date()) <= expireInMSecond;
        }, 'Cannot expire more than 60 seconds in the future.' ],
        default: function() {
            return new Date(new Date().valueOf() + expireInMSecond);
        }
    }
}, {
    upsert: true,
    setDefaultsOnInsert: true
});

SessionSchema.index({ expireAt: 1 }, { expireAfterSeconds : 0 });

SessionSchema.pre('remove', function(next){
    var _this = this;
    
    var carts = [];
    this.model('Session').findOne({ '_id': this._id }, function(err, se){

        if( se === undefined || se === null ){

            next();

        } else {

            for(var i = 0;i<se.Carts.length;i++){
                carts.push(se.Carts[i]._id);
            }

            console.time('removeCarts');        
            _this.model('Session').update({ _id: _this._id }, {'$pullAll': {Carts: carts }})
              .exec(function(err) {
                _this.model('Cart').remove({ _id: { $in: carts }}, function(err, numberRemoved) {
                    console.log("Usunieto "+numberRemoved+" koszyków");
                });
            });
            console.timeEnd('removeCarts');
        }
        

    }).lean().populate('Carts','_id');

    next();
    
});

module.exports.model = mongoose.model('Session', SessionSchema, 'Session');