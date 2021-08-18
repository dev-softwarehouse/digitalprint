var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var MainThemeSchema = new Schema({
    name: {
        type: 'String',
        required: true
    },
    ThemeCategories: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ThemeCategory'
    }],
    ThemePages: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ThemePage'
    }],
    ProjectPhotos : [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ProjectImage'
    }],
    ProjectBackgrounds : [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ProjectImage'
    }],
    ProjectCliparts : [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ProjectImage'
    }],
    ProjectMasks : [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ProjectImage'
    }],
    url: {
        type: 'String'
    }
},{usePushEach:true});

MainThemeSchema.plugin(deepPopulate, {
    
});

MainThemeSchema.pre('remove', function(next){
    var _this = this;
    var themePages = [];
    //var themeCategories = [];

    
    this.model('MainTheme').findOne({ '_id': this._id }, function(err, mth){
        for(var i = 0;i<mth.ThemePages.length;i++){
            themePages.push(mth.ThemePages[i]._id);
            fs.unlink(conf.staticDir+'min/'+mth._id+'/'+mth.ThemePages[i]._id+'.jpg', function (err) {
                if (err){
                    console.log(err);
                }
                console.log('Usunięto obrazek strony głównego motywu');
            });
        }
        for(var i = 0;i<mth.ThemeCategories.length;i++){
            themeCategories.push(mth.ThemeCategories[i]._id);
        }

    }).populate('ThemePages').populate('ThemeCategories');

    console.time('removeMainThemePages');
    _this.model('MainTheme').update({ _id: _this._id }, {'$pullAll': {ThemePages: themePages }})
      .exec(function(err) {
        _this.model('ThemePage').remove({ _id: { $in: themePages }}, function(err, numberRemoved) {
            console.log("Usunieto "+numberRemoved+" stron motywów");
        });
    });
    console.timeEnd('removeMainThemePages');

    /*console.time('removeMainThemeCategories');

    _this.model('MainTheme').update({ _id: _this._id }, {'$pullAll': {ThemeCategories: themeCategories }})
      .exec(function(err) {
        _this.model('ThemeCategory').remove({ _id: { $in: themeCategories }}, function(err, numberRemoved) {
            console.log("Usunieto "+numberRemoved+" kategorii motywów");
        });
    });

    console.timeEnd('removeMainThemeCategories');*/

});

module.exports.model = mongoose.model('MainTheme', MainThemeSchema, 'MainTheme');