var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var UserAssets = new Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  bitmaps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EditorBitmap'
  }],
  cliparts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EditorBitmap'
  }],
  fonts:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Font'
  }]

},{usePushEach:true});

UserAssets.plugin(deepPopulate, {});

module.exports.model = mongoose.model('UserAssets', UserAssets, 'UserAssets');
