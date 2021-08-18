	var ThemePage = function( editor ){

		var Editor = editor;
		var id, name, url, dbObject;

		var init = function( data ){

			id = data._id;
			url = data.url;
			dbObject = data;

			if( data.proposedTemplates.length ){

				console.log( data );

			}

			Editor.templateAdministration.updateProposedTemplates( data.proposedTemplates );

		};


		// powinno byc add Proposed Template
		var saveProposedTemplate = function( trueWidth, trueHeight, name, objectsInfo, imagesCount, textCount, categories, image, isGlobal, callback ){

			Editor.webSocketControllers.proposedTemplate.add( id, trueWidth, trueHeight, name, objectsInfo, imagesCount, textCount, categories, image, isGlobal, callback );

		};


		var getID = function(){

			return id;

		};

		var getObject = function(){

			return dbObject;

		};

		var getMiniature = function(){

			return url;

		};

		var getInfo = function(){

			return {

				_id : id,
				url : url

			};

		};

		var scaleToFormat = function(){



		};

		return {
			getInfo : getInfo,
			getMiniature : getMiniature,
			saveProposedTemplate : saveProposedTemplate,
			init : init,
			getID : getID,
			getObject : getObject

		}

	}

	export { ThemePage }
