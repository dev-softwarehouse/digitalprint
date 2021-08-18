var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var ThemePageSchema = new Schema({
	name: {
		type: 'String',
		required: true
	},
	order: 'Number',
	backgroundObjects: {
		EditorBitmaps: [{
			type: mongoose.Schema.Types.ObjectId, 
        	ref: 'EditorBitmap'
		}],
        EditorTexts: [{
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'EditorText'
        }]
	},
	foregroundObjects: {
		EditorBitmaps: [{
			type: mongoose.Schema.Types.ObjectId, 
        	ref: 'EditorBitmap'
		}],
        EditorTexts: [{
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'EditorText'
        }]
	},
	proposedTemplates: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'ProposedTemplate'
	}],
	UsedImages: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'ProjectImage'
	}],
	width: 'Number',
	height: 'Number',
	ThemePageFrom: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'ThemePage'
	},
	url: 'String',
    vacancy: {
        type: 'Boolean',
        default: false
    },
    defaultSettings: {}
},{usePushEach:true});

ThemePageSchema.pre('remove', function(next){
    console.fs('-----------------------TUTAJ----------------------------');
    this.model('Theme').update(
        {ThemePages:  this._id}, 
        {$pull: {'ThemePages': this._id}}, 
        {multi: true}
    );
    this.model('MainTheme').update(
        {ThemePages:  this._id}, 
        {$pull: {'ThemePages': this._id}}, 
        {multi: true}
    );
    var _this = this;
    var editorBitmaps = [];
    var editorTexts = [];
    _this.model('ThemePage').findById(_this._id).deepPopulate('backgroundObjects.EditorBitmaps.ProjectImage foregroundObjects.EditorBitmaps.ProjectImage backgroundObjects.EditorTexts foregroundObjects.EditorTexts').exec(function(err, page){

    	if(err){
    		console.fs(err);
    	}
    	
    	if( page.backgroundObjects.EditorBitmaps && page.backgroundObjects.EditorBitmaps !== undefined ){
    		for(var i = 0;i<page.backgroundObjects.EditorBitmaps.length;i++){
    			var editorBitmapData = page.backgroundObjects.EditorBitmaps[i].toJSON();
				editorBitmaps.push(editorBitmapData._id);
    		}
    	}
    	if( page.foregroundObjects.EditorBitmaps && page.foregroundObjects.EditorBitmaps !== undefined ){
    		for(var i = 0;i<page.foregroundObjects.EditorBitmaps.length;i++){
    			var editorBitmapData = page.foregroundObjects.EditorBitmaps[i].toJSON();
				editorBitmaps.push(editorBitmapData._id);
    		}
    	}
        if( page.backgroundObjects.EditorTexts && page.backgroundObjects.EditorTexts !== undefined ){
            for(var i = 0;i<page.backgroundObjects.EditorTexts.length;i++){
                var editorTextData = page.backgroundObjects.EditorTexts[i].toJSON();
                editorTexts.push(editorTextData._id);
            }
        }
        if( page.foregroundObjects.EditorTexts && page.foregroundObjects.EditorTexts !== undefined ){
            for(var i = 0;i<page.foregroundObjects.EditorTexts.length;i++){
                var editorTextData = page.foregroundObjects.EditorTexts[i].toJSON();
                editorTexts.push(editorTextData._id);
            }
        }

    	console.time('removeEditorBitmaps');
        _this.model('EditorBitmap').remove({ _id: { $in: editorBitmaps }}, function(err, numberRemoved) {

            console.log("Usunieto "+numberRemoved+" EditorBitmaps");
            console.timeEnd('removeEditorBitmaps');
            next();

        });

        console.fs('usuwanie tekstow');

        _this.model('EditorText').remove({ _id: { $in: editorTexts }}, function( err, numberRemoved ){

            console.log("Usunieto "+numberRemoved+" EditorTexts");
            next();

        });
        
    });

});

ThemePageSchema.plugin(deepPopulate, {/*
  populate: {
    'backgroundObjects.EditorBitmaps.ProjectImage': {
        select: '_id name minUrl width height trueWidth trueHeight uid'
    }
  }
*/});

module.exports.model = mongoose.model('ThemePage', ThemePageSchema, 'ThemePage');
module.exports.schema = ThemePageSchema;