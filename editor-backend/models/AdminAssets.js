var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var AdminAsset = new Schema({

  type: {
    type: 'String', // background, frame, mask, itd -> możliwość dodania przez admina nowych typwow
    require: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AssetFolder'
  },
  reference: {
    type : mongoose.Schema.Types.ObjectId, 
    ref : 'ProjectImage'
  },
  uses: [{
    type : mongoose.Schema.Types.ObjectId, 
    ref : 'ProjectImage'
  }]

},{usePushEach:true});

AdminAsset.plugin(deepPopulate, {});

module.exports.model = mongoose.model('AdminAsset', AdminAsset, 'AdminAsset');
