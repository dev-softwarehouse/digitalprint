var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var ProposedImageSchema = new Schema({
    
	size: {
		width: 'Number',
    	height: 'Number'
	},

    pos: {
    	x: 'Number',
    	y: 'Number'
    },

    bounds: {
    	width: 'Number',
    	height: 'Number',
    	x: 'Number',
    	y: 'Number'
    },

    rotation: 'Number',

    'order': 'Number',

    objectInside: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'EditorBitmap'
    },

    displaySimpleBorder:{
        type: 'Boolean',
        default: true
    },

    borderColor:{
        type: 'String',
        default: 'rgba(0,0,0,255)'
    },

    borderWidth:{
        type: 'Number',
        default: 0
    },

    shadowBlur : {
        type: 'Number',
        default: 10
    },

    shadowColor : {
        type: 'String',
        default: 'rgba(0,0,0,255)'
    },

    shadowOffsetX : {
        type: 'Number',
        default: 0
    },

    shadowOffsetY : {
        type: 'Number',
        default: 0
    },

    dropShadow : {
        type: 'Boolean',
        default: false
    },

    backgroundFrame: {

        type: 'Boolean',
        default: false

    },

    backgroundFrameID:{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'Frame'
    },

    maskFilter: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'ProjectImage'
    },

    effectName : {
        type: 'String',
        default: ''
    }

},{usePushEach:true});

ProposedImageSchema.plugin(deepPopulate, {/*
  populate: {
    'ProposedImages': {
        select: 'size pos bounds'
    },
    'ProposedTexts': {
        select: 'size pos bounds default'
    }
  }
  */
});

module.exports.model = mongoose.model('ProposedImage', ProposedImageSchema, 'ProposedImage');