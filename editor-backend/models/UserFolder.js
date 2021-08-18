var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var UserFolderSchema = new Schema({

    date: 'Number',
    description: 'String',
    folderName: 'String',
    folderContentCount: 'Number',
    childFolders: [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'UserFolder',
        default: null
    }],
    parentFolder: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'UserFolder',
        default: null
    },
    imageFiles: [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'ProjectImage'
    }],
    userOwner: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    isPublic: {
        type: 'Boolean',
        default: false
    },
    canAccessWithPassword: {
        type: 'Boolean',
        default: false
    },
    password: 'String',
    location : 'Mixed',
    sharedEmails: ['String'],
    emailShared: {
        type: 'Boolean',
        default: false
    },
    facebookShare: {
        type: 'Boolean',
        default: false
    },
    rating: {
        type: 'Mixed',
        default: {}
    },
    averageRate: {
        type: 'Number',
        default: 0
    }

},{usePushEach:true});

UserFolderSchema.plugin(deepPopulate, {
  /*populate: {
    'Views.Pages': {
      select: 'name rotation width height slope x y'
    }
  }*/
});

module.exports.model = mongoose.model('UserFolder', UserFolderSchema, 'UserFolder');
