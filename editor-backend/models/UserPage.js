var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema,
    EditorBitmap = require('./EditorBitmap.js').model,
    EditorText = require('./EditorText.js').model;

var UserPageSchema = new Schema({

    order : {

        type: 'Number',
        required: true

    },

    prevImage: [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Upload'
    }],

    ThemePageFrom: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'ThemePage'

    },

    ThemePage: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'ThemePage'

    },

    pageValue : 'Number',

    ProposedTemplate: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProposedTemplate'

    },

    ProposedTemplateFrom: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProposedTemplate'

    },

    UsedImages: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'EditorBitmap'

    }],
    UsedTexts : [ {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'EditorText'

    } ],
    addedTexts : {
        type : 'Number',
        require : true,
        default: 0
    },
    vacancy : 'Boolean',
    userSettings : {},
    scene: {

        type:'Mixed'

    }

},{usePushEach:true});

UserPageSchema.methods.swapPhoto = function(){

    var usedImages = this.UsedImages;
    usedImages = _.sortBy( usedImages, 'order' );

    if( this.UsedImages.length > 1 ){

        usedImages[0].order = 1;
        usedImages[1].order = 0;
        usedImages[0].save();
        usedImages[1].save();
        console.fs( this.UsedImages );
        console.fs('jest wiecej obrazkow');

    }

};

UserPageSchema.pre('remove', function(next){


    this.model('View').update(

        {Views:  this._id},
        {$pull: {'Pages': this._id}},
        {multi: true}

    );

    var textToRemove = this.UsedTexts.length;
    var imagesToRemove = this.UsedImages.length;
    var removedImages = 0;
    var removedTexts = 0;
    var _this = this;

    for( var i=0; i< _this.UsedImages.length; i++ ){

        EditorBitmap.findOne({ _id : _this.UsedImages[i] }, function( err, usedImage ) {

            if( err ){

                console.fs( err );

            }else {

                usedImage.remove( function( err ){

                    if( err ){

                        console.fs( err );

                    }else {

                        removedImages++;
                        checkDone();

                    }

                });

            }

        });

    }

    for( var i=0; i< _this.UsedTexts.length; i++ ){

        EditorText.findOne({ _id : _this.UsedTexts[i] }, function( err, usedText ) {

            if( err ){

                console.fs( err );

            }else {

                usedText.remove( function( err ){

                    if( err ){

                        console.fs( err );

                    }else {

                        removedTexts++;
                        checkDone();

                    }

                });

            }

        });

    }

    checkDone();

    function checkDone(){

        if( imagesToRemove == removedImages || textToRemove == removedTexts ){
            console.fs('usunieto obrazy i teksty :)))))))))))))))))');
            next();
        }

    }

});

UserPageSchema.plugin(deepPopulate, {
  /*populate: {
    'Views.Pages': {
      select: 'name rotation width height slope x y'
    }
  }*/
});

module.exports.model = mongoose.model('UserPage', UserPageSchema, 'UserPage');
