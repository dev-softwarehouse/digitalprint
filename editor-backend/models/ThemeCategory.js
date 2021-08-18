var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var ThemeCategorySchema = new Schema({
    name: {
    	type: 'String',
    	required: true
    },
    themes: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'Theme'
    }]
},{usePushEach:true});

ThemeCategorySchema.methods.findOne = function (callback) {
    return this.model('ThemeCategory').findOne({'name': this.name}, callback);
};

ThemeCategorySchema.pre('remove', function(next){
    this.model('MainTheme').update(
        {ThemeCategories:  this._id}, 
        {$pull: {'ThemeCategories': this._id}}, 
        {multi: true},
        next
    );
});

module.exports.model = mongoose.model('ThemeCategory', ThemeCategorySchema, 'ThemeCategory');