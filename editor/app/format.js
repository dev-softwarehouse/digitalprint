import {Theme} from './adminProject/admin/theme/theme.js';
	var View = require('./adminProject/admin/view/main').View;

	var Format = function( editor ){

		var Editor = editor;
		var views = [];
		var themes = [];
		var view = new View( editor );
		var theme = new Theme( editor );
        /**
        * Motywy oczekujące na akceptację przez administratora
        *
        * @property themesToCopy
        * @type {Array}
        * @default []
        */
        var themesToCopy = [];

		var formatID = null;
		var dbID = null;
		var width = null;
		var height = null;
		var slope = null;
		var viewAttributes = [];
		var attributes = [];

		var init = function( data ){

			$('.editingInfo .formatInfo .content').html( data.name );

			attributes = Editor.getAttributeOption( data.formatID ).attributes;
			views = data.Views;
			themes = data.Themes;
			themesToCopy = data.ThemesToCopy;
			formatID = data.formatID;
			dbID = data._id;
			width = data.width;
			height = data.height;
			slope = data.slope;

			if( data.viewAttributes )
				viewAttributes = data.viewAttributes;

			Editor.generateAttributesList( formatID );

			Editor.templateAdministration.updateSettings( formatID );
           	Editor.templateAdministration.updateThemes( themes );
            Editor.templateAdministration.updateViews( views );
            Editor.templateAdministration.updateThemesToCopy();
            Editor.templateAdministration.updateAttributes();

			if( $('#selectFormat').length )
				$('#selectFormat').remove();

			if( views.length > 0 ){

				Editor.adminProject.format.view.init( views[0]._id );

			}
			else {

				Editor.template.newViewWindow();

			}

		};

		var getAllOptionInfoByOptionID = function( optionID ){

			for( var key in attributes ){

				var currentAttribute = attributes[key].name;
				var currentAttributeID = key;

				for( var optKey in attributes[key].options ){

					if( optKey == optionID ){

						return {

							attributeName : currentAttribute,
							attributeID : currentAttributeID,
							optionID : optionID,
							optionName : attributes[key].options[optKey].name

						};

					}

				}


			}

			return null;

		};


        var setThemesToCopy = function( themesArray ){

            themesToCopy = themesArray;

        };


        var getThemesToCopy = function(){

            return themesToCopy;

        };


		var getSlope = function(){

			return slope;

		};


		var getHeight = function(){

			return height;

		};


		var getWidth = function(){

			return width;

		};


		var getViews = function(){

			return views;

		};

		var getDbId = function(){

			return dbID;

		};

		var getId = function(){

			return formatID;

		};

		var setViews = function( viewsArray ){

			views = viewsArray;

		};

		var getThemes = function(){

			return themes;

		};

		var updateThemes = function( themesArray ){

			themes = themesArray;

		};

		return {

			init : init,
			getAllOptionInfoByOptionID : getAllOptionInfoByOptionID,
			getId : getId,
			getDbId : getDbId,
			getHeight : getHeight,
			getSlope : getSlope,
			getThemes : getThemes,
			getWidth : getWidth,
			getViews : getViews,
			setViews : setViews,
			updateThemes : updateThemes,
			setThemesToCopy : setThemesToCopy,
			getThemesToCopy : getThemesToCopy,
			view : view,
			theme: theme

		};

	}

	export { Format };
