var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var UserProjectSchema = new Schema({

	Format : {
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Format'
	},
	typeID: {
		type: 'Number',
		required: true
	},
	formatID: {
		type: 'Number',
		required: true
	},
	updated: {
		type: Date,
		default: Date.now
	},
	created: {
		type: Date,
		default: Date.now
	},
	pages: 'Number',
	Attributes: [{
		type : mongoose.Schema.Types.ObjectId,
        ref : 'Attribute'
	}],
	mainTheme : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theme'
    },
    Pages : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserPage'
    }],
    Views : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserView'
    }],
    projectImages : [{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectImage'
    }],
    projectName: 'String',
    selectedAttributes : {
    	type: 'Mixed',
    	default: {}
    },
    sharedInstances: {
        type: 'Mixed',
    	default: []
    },
    userSettings : {}
},{usePushEach:true});

UserProjectSchema.plugin(deepPopulate, {
  /*populate: {
    'Views.Pages': {
      select: 'name rotation width height slope x y'
    }
  }*/
});


UserProjectSchema.pre('save', function(next){
	now = new Date();
	this.updated = now;
	if ( !this.created ) {
		this.created = now;
	}
	next();
});

module.exports.model = mongoose.model('UserProject', UserProjectSchema, 'UserProject');
