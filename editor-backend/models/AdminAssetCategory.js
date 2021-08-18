var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var AdminAssetCategory = new Schema({

  name: {},
  childrens: "Mixed"

},{usePushEach:true});

AdminAssetCategory.plugin(deepPopulate, {});

module.exports.model = mongoose.model('AdminAssetCategory', AdminAssetCategory, 'AdminAssetCategory');
