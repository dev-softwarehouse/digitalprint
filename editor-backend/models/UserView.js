var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema,
    UserPage = require('./UserPage.js').model;

var UserViewSchema = new Schema({

	order : {

		type: 'Number',
		required: true

	},

	adminView : {

		type : mongoose.Schema.Types.ObjectId,
        ref : 'View'

    },

	Pages: [{

		type : mongoose.Schema.Types.ObjectId,
        ref : 'UserPage'

	}],

	mainTheme : {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theme'

    },
    
    startPage : 'Number',
    stopPage  : 'Number',

    nextPage  : {

		type : mongoose.Schema.Types.ObjectId,
        ref : 'UserPage'

	},

    previousPage  : {

		type : mongoose.Schema.Types.ObjectId,
        ref : 'UserPage'

	},

    usedImages : {

		type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectImage'

    },

    repeatable: {

        type: 'Boolean',
        default: false

    }

},{usePushEach:true});


UserViewSchema.pre('remove', function(next){

    this.model('UserProject').update(

        {Views:  this._id}, 
        {$pull: {'Views': this._id}}, 
        {multi: true}

    );

    var _this = this;
    var removedPages = 0;
    var pagesToRemove = this.Pages.length;

    for( var i=0; i< this.Pages.length; i++ ){

        UserPage.findOne({ _id : this.Pages[i]}, function(err, page ) {
            
            if( err ){

                console.fs( err );

            }else {

                page.remove( function( err ){

                    if( err ){

                        console.fs( err );

                    }else {

                        removedPages++;
                        checkRemovedPages();

                    }

                });

            }
            
        });

    }
    
    function checkRemovedPages(){

        if( removedPages == pagesToRemove )
            next();
    }

});

UserViewSchema.plugin(deepPopulate, {
  /*populate: {
    'Views.Pages': {
      select: 'name rotation width height slope x y'
    }
  }*/
});

module.exports.model = mongoose.model('UserView', UserViewSchema, 'UserView');