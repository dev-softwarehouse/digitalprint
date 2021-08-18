var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var AdminProjectSchema = new Schema({
    name: { 
        type: 'String', 
        required: true 
    },
    url : 'String',
    'active': 'Boolean',
    'projectMin': 'String',
    /*Themes:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Theme'
    }],
    Views:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'View'
    }],*/
    Formats: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Format'
    }],
    'ProjectImages': [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ProjectImage'
    }],
    'colors' : [{ type: 'String' }],
    'activeColors' : [{ type: 'String' }]
    
},{usePushEach:true});

AdminProjectSchema.plugin(deepPopulate, {
  /*populate: {
    'Views.Pages': {
      select: 'name rotation width height slope x y'
    }
  }*/
});

AdminProjectSchema.methods.findWithPopulate = function (callback) {
    // 
    return this.model('AdminProject').findOne({ '_id': this._id }, callback).lean().populate('Themes').populate('ProjectImages').populate('Views').deepPopulate('Views.Pages');
};

AdminProjectSchema.methods.findWithPopulate_Custom = function ( settings, callback) {
    // 
    return this.model('AdminProject').findOne( settings, callback).lean().populate('Themes').populate('ProjectImages').populate('Views').deepPopulate('Views.Pages');
};

AdminProjectSchema.methods.unactiveAll = function (){
    console.log(this);
    this.model('AdminProject').update(
        { typeID: this.typeID },
        { $set:{ 'active': false } },
        { multi: true }
    );
}

AdminProjectSchema.pre('remove', function(next){
    var _this = this;
    
    var formats = [];
    var projectImages = [];
    this.model('AdminProject').findOne({ '_id': this._id }, function(err, ap){

        console.fs( ap );

        if( ap === undefined || ap === null ){

            next();

        } else {

            if( ap.Formats !== undefined ){
                for(var i = 0;i<ap.Formats.length;i++){
                    formats.push(ap.Formats[i]._id);
                }
            }

            for(var i = 0;i<ap.ProjectImages.length;i++){
                projectImages.push(ap.ProjectImages[i]._id);
            }

            console.time('removeFormats');
            _this.model('AdminProject').update({ _id: _this._id }, {'$pullAll': {Formats: formats }})
              .exec(function(err) {
                _this.model('Format').remove({ _id: { $in: formats }}, function(err, numberRemoved) {
                    console.log("Usunieto "+numberRemoved+" formatów");
                });
            });
            console.timeEnd('removeFormats');

            console.time('removeProjectImages');        
            _this.model('AdminProject').update({ _id: _this._id }, {'$pullAll': {ProjectImages: projectImages }})
              .exec(function(err) {
                _this.model('ProjectImage').remove({ _id: { $in: projectImages }}, function(err, numberRemoved) {
                    console.log("Usunieto "+numberRemoved+" zdjec");
                });
            });
            console.timeEnd('removeProjectImages');
        }
        

    }).lean().populate('Formats','_id').populate('ProjectImages','_id');

    next();
    
});

module.exports.model = mongoose.model('AdminProject', AdminProjectSchema, 'AdminProject');