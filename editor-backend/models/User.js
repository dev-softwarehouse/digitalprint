var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
	// mysql userID
	userID: {
		type: 'String',
		required: true
	},
	Photos: [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'ProjectImage'
    }],
  Projects: [{
      type : mongoose.Schema.Types.ObjectId,
      ref : 'UserProject'
  }],
  ComplexProjects: [{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'ComplexUserProject'
  }]

},{usePushEach:true});

UserSchema.plugin(deepPopulate, {
  /*populate: {
    'Views.Pages': {
      select: 'name rotation width height slope x y'
    }
  }*/
});


module.exports.model = mongoose.model('User', UserSchema, 'User');
