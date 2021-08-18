var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var FormatSchema = new Schema({
    formatID: { 
        type: 'Number', 
        required: true 
    },
    name: {
        type: 'String',
        required: true
    },
    width: {
        type: 'Number',
        required: true
    },
    height: {
        type: 'Number',
        required: true
    },
    slope: {
        type: 'Number',
        required: true
    },
    external: {
        type: 'Boolean',
        required: true
    },
    Themes: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Theme'
    }],
    Views: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'View'
    }],
    Attributes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attribute'
    }]
},{usePushEach:true});

FormatSchema.plugin(deepPopulate, {
    
});

FormatSchema.methods.findWithPopulate = function (callback) {
    // 
    return this.model('Format').findOne({ '_id': this._id }, callback).lean().populate('Themes').populate('Views').deepPopulate('Views.Pages');
};

FormatSchema.pre('remove', function(next){
    var _this = this;
    var views = [];
    var themes = [];
    this.model('Format').findOne({ '_id': this._id }, function(err, ap){
        console.time('removeViews');
        _this.model('Format').update({ _id: _this._id }, {'$pullAll': {Views: views }})
          .exec(function(err) {
            _this.model('View').remove({ _id: { $in: views }}, function(err, numberRemoved) {
                console.log("Usunieto "+numberRemoved+" widoków");
            });
        });
        console.timeEnd('removeViews');

        console.time('removeThemes');
        _this.model('Format').update({ _id: _this._id }, {'$pullAll': {Themes: themes }})
          .exec(function(err) {
            _this.model('Theme').remove({ _id: { $in: themes }}, function(err, numberRemoved) {
                console.log("Usunieto "+numberRemoved+" motywów");
            });
        });
        console.timeEnd('removeThemes');
    }).lean().populate('Views','_id').populate('Themes','_id');
    
    next();
});

module.exports.model  = mongoose.model('Format', FormatSchema, 'Format');