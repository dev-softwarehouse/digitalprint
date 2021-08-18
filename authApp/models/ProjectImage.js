var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema,
    fs = require('fs'),
    conf = require('../libs/conf.js');

var ProjectImageSchema = new Schema({
    name :  { 
        type: 'String', 
        required: true 
    },
    imageUrl: 'String',
    minUrl: 'String',
    thumbnail: 'String',
    type: 'String',
    uid: {
        type: 'String',
        required: true
    },
    width: {
        type: 'Number',
        required: true
    },
    height : {
        type: 'Number',
        required: true
    },
    trueWidth : {
        type: 'Number',
        required: true
    },
    trueHeight : {
        type: 'Number',
        required: true
    },
    Upload: {
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'Upload' 
    },
    useCount : 'Number',
    imageOrder : 'Number',
    projectUsed : 'Mixed',
    
});

ProjectImageSchema.pre('remove', function(next){

    if( this.Upload !== undefined ){
        this.model('Upload').findOne({_id: this.Upload}, function(err, _upload){

            if( _upload !== null ){
                _upload.remove(function(err, removed) {
                    if(err){
                        console.fs(err);
                    }
                    var folderDest = conf.staticDir + 'projectImages/' + _upload.date +'/' + _upload.folderNumber + '/';
                    fs.unlinkSync(folderDest+'min_'+_upload._id+'.jpg');
                    fs.unlinkSync(folderDest+'thumb_'+_upload._id+'.jpg');
                    fs.unlinkSync(folderDest+_upload._id+_upload.ext);
                    console.fs('Usunięto pliki z bazy również *!*!*!***!*!**!*!*!*!**!**!**!**!*!*!*!*!*!**!');
                    console.fs("removed Upload: "+_upload._id);
                    next();
                });
            } else {
                next();
            }
            
        });
    }
});

ProjectImageSchema.methods.find = function (callback) {
    return this.model('ProjectImage').findOne({ '_id': this._id }, callback);
};

module.exports.model = mongoose.model('ProjectImage', ProjectImageSchema, 'ProjectImage');