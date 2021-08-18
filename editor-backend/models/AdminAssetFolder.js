var mongoose = require('mongoose');
deepPopulate = require('mongoose-deep-populate'),
Schema = mongoose.Schema;

var AssetFolder = new Schema({

    name: {
        type: 'String', // background, frame, mask, itd -> możliwość dodania przez admina nowych typwow
        require: true
    },
    assets: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AdminAsset'
    }],
    parent: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AssetFolder'
    }
    
},{usePushEach:true});

AssetFolder.plugin(deepPopulate, {});

module.exports.model = mongoose.model('AssetFolder', AssetFolder, 'AssetFolder');
