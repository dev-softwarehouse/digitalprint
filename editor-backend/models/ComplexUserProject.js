var mongoose = require('mongoose');
deepPopulate = require('mongoose-deep-populate'),
Schema = mongoose.Schema;

var ComplexUserProjectSchema = new Schema({

    projectImages : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectImage'
    }],
    projectName: 'String',
    sharedInstances: {
        type: 'Mixed',
        default: []
    },
	mainTheme : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theme'
    },
    updated: {
		type: Date,
		default: Date.now
	},
	created: {
		type: Date,
		default: Date.now
	},
    userSettings : {},
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserProject'
    }],
    typeID: "Number",
    adminSettings: {}

},{usePushEach:true});

ComplexUserProjectSchema.plugin(deepPopulate, {
/*populate: {
'Views.Pages': {
  select: 'name rotation width height slope x y'
}
}*/
});


ComplexUserProjectSchema.pre('save', function(next){
now = new Date();
this.updated = now;
if ( !this.created ) {
    this.created = now;
}
next();
});

module.exports.model = mongoose.model('ComplexUserProject', ComplexUserProjectSchema, 'ComplexUserProject');
