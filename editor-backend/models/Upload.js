var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var UploadSchema = new Schema({
    ext: {
        type: 'String',
        required: false
    },
    date: {
        type: 'String',
        required: false
    },
    url: {
        type: 'String',
        required: false
    },
    minUrl: {
        type: 'String',
        required: false
    },
    thumbUrl: {
        type: 'String',
        required: false
    },
    folderNumber: {
        type: 'Number',
        default: 0
    },
    type: {
        type: 'String',
        default: 'admin'
    },
    userID: {
        type: 'String'
    },
    files: ['String']
},{usePushEach:true});

module.exports.model  = mongoose.model('Upload', UploadSchema, 'Upload');
