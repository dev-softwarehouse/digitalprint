(function(){

	var text_user = {

		context     : null,
		mainElement : null,

		createTool : function( context ){

			//console.log( context );

			if( context != text_user.context )
				text_user.context = context;
			else
				return false;

			var mainElement = document.createElement("DIV");
			mainElement.id = "proposed-position-toolsbox";

			text_user.mainElement = mainElement;


			// kontener
			var userTools = document.createElement("DIV");
			userTools.className = "proposedTextTools";


			// input color
			var colorInput = document.createElement('INPUT');
			colorInput.id = "colorPicker";

			var col = new jscolor.color( colorInput );

			col.onImmediateChange = function(){

				_this.proposedText._useDefaultValues = false;
				_this.proposedText.text._currentFontColor = $("#colorPicker").css("background-color");
				_this._updateToolBox();

			};

			mainElement.appendChild( userTools );
			userTools.appendChild( colorInput );

			document.body.appendChild( mainElement );

		},

		removeTool : function(){

		},

		updatePosition : function(){

			//console.log("wlazło");
			$(text_user.mainElement).css({"top" : "+=10"});

		},

		initEvents : function(){

			text_user.context.addEventListener('resize', text_user.updatePosition );

		}

	};

	Editor.tools.text_user = text_user;

})();