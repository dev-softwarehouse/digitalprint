var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var ProposedTextSchema = new Schema({
    size: {
		width: 'Number',
    	height: 'Number'
	},
    pos: {
    	x: 'Number',
    	y: 'Number'
    },
    content : 'Mixed',
    bounds: {
    	width: 'Number',
    	height: 'Number',
    	x: 'Number',
    	y: 'Number'
    },
    fontFamily: 'String',
    rotation: 'Number',
    'default': 'String',
    'order': 'Number',
    showBackground: {
        type : 'Boolean',
        default : false
    },
    backgroundColor : {
        type : 'String',
        default : '#fff'
    },
    backgroundOpacity : {
        type : 'Number',
        default : 1
    },
    shadowBlur : {
        type: 'Number',
        default: 5
    },
    verticalPadding: {
        type: 'Number',
        default : 5
    },
    horizontalPadding: {
        type: 'Number',
        default : 5
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
    scaleY:{
        type: 'Number',
        default: 1
    },
    displaySimpleBorder:{
        type: 'Boolean',
        default: false
    },
    borderColor:{
        type: 'String',
        default: '#000'
    },
    borderWidth:{
        type: 'Number',
        default: 0
    },
    _align : {
        type: 'String',
        default: 'left'
    },
    verticalAlign : {
        type: 'String',
        default: 'top'
    },
    optionsData : 'Mixed',
    filters : 'Mixed',

},{usePushEach:true});

module.exports.model = mongoose.model('ProposedText', ProposedTextSchema, 'ProposedText');