var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var FrameShema = new Schema({

    name: "String",
    x: "Number",
    y: "Number",
    width: "Number",
    height: "Number",
    ProjectImage: {
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ProjectImage'
    }
},{usePushEach:true});

FrameShema.plugin(deepPopulate, {
    


});

module.exports.model  = mongoose.model('Frame', FrameShema, 'Frame');