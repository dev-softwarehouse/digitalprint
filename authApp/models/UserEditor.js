var mongoose = require('mongoose');
deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema,
    conf = require('../libs/conf.js');

var mainConf = require('../libs/mainConf.js');

var expireInMSecond = mainConf.expireTimeInSeconds;

var UserEditorSchema = new Schema({
    userID: {
        type: 'Number'
    },
    login: {
        type: Boolean,
        default: false
    },
    expireAt: {
        type: Date,
        /*validate: [ function(v) {
            console.log('v: ',v);
            console.log('this',this.login);
            return ((v - new Date()) <= expireInMSecond && this.login === false);
        }, 'Cannot expire more than 60 seconds in the future.' ],*/
        default: function() {
            console.fs('UserEditor entity exipred.');
            return new Date(new Date().valueOf() + expireInMSecond);
        }
    }

}, {
    upsert: true,
    setDefaultsOnInsert: true
});

UserEditorSchema.pre('update', function() {
    if( this.login == true ) {
        this.update({},{ $set: { expireAt: null } });
    }
});

module.exports.model = mongoose.model('UserEditor', UserEditorSchema, 'UserEditor');