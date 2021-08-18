	import {Layer} from './Layer';

	/**
	* Klasa pozycji proponowanych tekstu
	*
	* @class ProposedTextPosition
	* @constructor
	*/
	export function ProposedTextPosition( name, dbId, width, height, useType ){

		Editor.Layer.call(this, name, dbId );

		this._useDefaultValues = true;

		this.init( width, height );

		this.objectInside = null;

		this.type = "proposedPosition";

		// to trzeba wyjebac i zostrawić zależność w zględem pliku ( proposedTextTools, proposedTextTools-admin, te same medoty, inne wywołanie)
		this.useType = "admin";

	};

	var p = ProposedTextPosition.prototype = Object.create( Layer.prototype );

	p.constructor = ProposedTextPosition;


	p.useDefaultValues = function(){

		this.text._currentFont      = this.defaultSettings.family;
		this.text._currentFontSize  = this.defaultSettings.size;
		this.text._currentFontColor = this.defaultSettings.color;
		this.text._currentFontType  = this.defaultSettings.type;
		this.text._align            = this.defaultSettings.align;

	};


	p.updateTextWithDefaultValues = function(){

		var text = this.text;

		this.useDefaultValues();

		//console.log( this.text._align );
		//console.log( this.getBounds() );

		for( var line=0; line < text.textLetters.length; line++ ){

			for( var letter=0; letter < text.textLetters[line].letters.length; letter++ ){

				var currentLetter = text.textLetters[line].letters[letter];
				currentLetter.italic = text._currentFontType.italic;
				currentLetter.regular = text._currentFontType.regular;
				currentLetter.font = text.getSelectedFont();
				currentLetter.color = text._currentFontColor;

			}

		}

		text._recalculateAllLines();

	};


	/**
	* Inicjalizacja propowanego obiektu tekstu
	*
	* @method init
	* @param {float} width szerokość propowanego oiektu
	* @param {float} height wysokość propowanego obiektu
	*/
	p.init = function( width, height ){

		var _this = this;

		this.defaultSettings = {

			size   : 50,
			color  : '#000000',
			align  : 'left',
			family : 'Arial',
			type   : { regular : 1, italic : 0 }

		};

		this.userSettings = {};

		this.history_tmp = null;
		this.toolboxElement = null;

		this.text = new Editor.Text();
		this.addChild( this.text );

		this.text.width = this.text.trueWidth = this.width;
		this.text.height = this.text.trueHeight = this.height;
		this.text.setBounds(0,0,this.width, this.height);

		// jezeli nastąpiła zmiana czcionki, nie uzywamy domyślnej, tylko aktualnie wybraną
		if( this._useDefaultValues )
			this.useDefaultValues();

		this.text.drawDefaultText();

		var textBounds = this.text.getTransformedBounds();
		this.text.x = textBounds.width/2;
		this.text.y = textBounds.height/2;

		this.history_tmp = null;
		this.width = this.trueWidth = width;
		this.height = this.trueHeight = height;

		this.background = new createjs.Shape();
		this.background.graphics.f("rgba(255,255,255, 0.1)").r(0,0, width, height);
		this.background.setBounds( 0, 0, width, height);

		this.border = new createjs.Shape();
		this.border.graphics.ss(1).s("rgb(0,0,255)").mt(1,1).lt(width-1,1).lt(width-1, height-1).lt(1, height-1).cp();

		this.mask = new createjs.Shape();
		this.mask.graphics.f("rgba(255,255,255, 0.1)").r(0,0, width, height);

		this._mask = this.mask;

		this.background = new createjs.Shape();
		this.background.graphics.f("rgba(255,255,255, 0.1)").r(0,0, width, height);
		this.hitArea = this.background;

		this.addBottomCompoundObject( this.background );

		this.setBounds( 0, 0, width, height);

		this.addTopCompoundObject( this.border );

		this.addEventListener('mousedown',function(){

			if( !_this.toolBox ){

				_this.initToolBox();

			}

		});

		this.text.addEventListener( 'addedText', function(){

			var textBounds = _this.text.getTransformedBounds();
			_this.text.x = textBounds.width/2;
			_this.text.y = textBounds.height/2;
			_this.text._recalculateAllLines();

		});

		this.addEventListener('unclick', function(){

			if( _this.isEditing ){

				_this.hitArea = _this.background;
				_this.text._unbindTextEvents();
				_this.isEditing = false;

			}

			_this.toolBox.remove();
			_this.toolBox = null;

		});

		this.addEventListener('resize', function( e ){

			_this.toolBox._updateToolsBoxPosition();
			var textBounds = _this.text.getTransformedBounds();
			_this.text.x = textBounds.width/2;
			_this.text.y = textBounds.height/2;
			_this.text._recalculateAllLines();

		});

		this.addEventListener('dblclick', function( e ){

			if( !_this.isEditing ){

				_this.hitArea = null;
				_this.isEditing = true;
				_this.text._bindTextEvents( {
						'toolbox' : false
				} );

			}

		});

	};


	p._updateShape = function(){

		//this.cache( -this.width/2, -this.height/2, this.width*2, this.height*2 );

		this.setBounds( 0,0, this.width, this.height );
		this.background.graphics.c().f("rgba(255,255,255, 0.1)").r( 0,0, this.width, this.height );
		this.background.setBounds( 0, 0, this.width, this.height);
		this.border.graphics.c().ss(1).s("rgb(0,0,255)").mt(1,1).lt( this.width-1,1).lt( this.width-1, this.height-1).lt(1, this.height-1).cp();
		this._mask.graphics.c().f("rgba(255,255,255, 0.1)").r( 0,0, this.width, this.height );

		this.text.width = this.text.trueWidth = this.width;
		this.text.height = this.text.trueHeight = this.height;
		this.text.setBounds(0,0,this.width, this.height);

		//this.objectInside.center();
		//this.updateCache();

	};


	p._updateToolsBoxPosition = function(){

		var tools = $("div#proposed-position-tool");

		if( this.useType =="admin" )
			var adminTools = $('#proposed-position-tool-admin');

		var toolSize = {

			width  : tools.innerWidth(),
			height : tools.innerHeight()

		};


		var pos = this.getGlobalPosition();
		var stage = Editor.getStage();
		var bounds = this.getTransformedBounds();

		tools.css({ top: pos[1] + (bounds.height/2)*stage.scaleY + toolSize.height/2 + 50, left: pos[0] - toolSize.width/2 });
	
		if( this.useType =="admin" ){

			var adminToolSize = {

				width  : adminTools.innerWidth(),
				height : adminTools.innerHeight()

			}

			adminTools.css({ top: pos[1] + (bounds.height/2)*stage.scaleY + 50 + toolSize.height + toolSize.height/2 + 10, left: pos[0] - adminToolSize.width/2 });

		}

	};


	p.initAdminToolBox = function(){

		var _this = this;
		$('body').append("<div id='proposed-position-tool-admin' class='proposed-tools tools-box admin'></div>");	

		var tools = $("div#proposed-position-tool");

		var adminTools = $('#proposed-position-tool-admin');
		adminTools.append("<div class='arrow-admin-tools'></div>");
		adminTools.append("<h4>Wartości domyślne</h4>");
		adminTools.append("<div class='admin-tools-container'></div>");


		/*
		var input = document.createElement('INPUT');
		input.id = "colorPicker-default";

		var col = new jscolor.color(input);

		col.onImmediateChange = function(){

			if( _this.useType == "admin" ){

				_this.defaultSettings.fontColor = $("#colorPicker-default").css("background-color");

			}

		};

		adminTools.append( input );

		*/

		var setValue = function( value ){

			_this.defaultSettings.family = value;

		}

		var alignValue = function( value ){

			_this.defaultSettings.align = value;

		}

		var setFontSize = function( value ){

			_this.defaultSettings.fontSize = value;

		}

		var toolboxInstance = new Editor.tools.ProposedTextToolBox( this, "admin" );
		//console.log( toolboxInstance );

		//toolboxInstance.appendTools( adminTools );

		/*
		adminTools.append( Editor.tools.text.createFontSizeTool( setFontSize ) );
		adminTools.append( Editor.tools.text.createFontSelect( "admin-font", setValue ) );
		adminTools.append( Editor.tools.text.createLeftAlignTool( alignValue ) );
		adminTools.append( Editor.tools.text.createCenterAlignTool( alignValue ) );		
		adminTools.append( Editor.tools.text.createRightAlignTool( alignValue ) );
		*/

		this.adminToolBox =	adminTools;

		var toolSize = {

			width  : tools.innerWidth(),
			height : tools.innerHeight()

		};


		var pos = this.getGlobalPosition();
		var stage = Editor.getStage();
		var bounds = this.getTransformedBounds();

		var adminToolSize = {

			width  : adminTools.innerWidth(),
			height : adminTools.innerHeight()

		}

		adminTools.css({ top: pos[1] + (bounds.height/2)*stage.scaleY + 50 + toolSize.height + toolSize.height/2 + 10, left: pos[0] - adminToolSize.width/2 });

	};


	p.initToolBox = function(){

		if( !this.toolBox ){

			var _this = this;

			//console.log("inicjalizacja boksów");

			var toolboxInstance = new Editor.tools.ProposedTextToolBox( this, "admin" );
			this.toolBox = toolboxInstance;


			/*
			this.toolbox = true;

			var _this = this;
			$('body').append("<div id='proposed-position-tool' class='proposed-tools tools-box'></div>");

			var tools = $("div#proposed-position-tool");

			this.toolBoxElement = $("div#proposed-position-tool");

			var input = document.createElement('INPUT');
			input.id = "colorPicker";

			var fontSizeInput = document.createElement('INPUT');
			fontSizeInput.id = "font-size";
			fontSizeInput.name = "font-size";

			
			var alignCenter = document.createElement("SPAN");
			alignCenter.id = "fot-align-center";
			alignCenter.className = "text-align";
			alignCenter.addEventListener( 'click', this.text.toolBoxButtonsFuction['alignCenter'] );

			if( this.useType == "admin"){

				alignCenter.addEventListener('click', function(){

					_this.defaultSettings.align = 'center';

				});

			}


			var alignLeft = document.createElement("SPAN");
			alignLeft.id = "fot-align-left";
			alignLeft.className = "text-align";
			alignLeft.addEventListener( 'click', this.text.toolBoxButtonsFuction['alignLeft'] );

			if( this.useType == "admin"){

				alignLeft.addEventListener('click', function(){

					_this.defaultSettings.align = 'left';

				});

			}

			
			var alignRight = document.createElement("SPAN");
			alignRight.id = "fot-align-right";
			alignRight.className = "text-align";
			alignRight.addEventListener( 'click', this.text.toolBoxButtonsFuction['alignRight'] );
			
			if( this.useType == "admin"){

				alignRight.addEventListener('click', function(){

					_this.defaultSettings.align = 'right';

				});

			}


			// div'owy selekt dla czcionek
			var selectBox = document.createElement("DIV");
			selectBox.id = "select-box";
			var currentFont = document.createElement("SPAN");
			currentFont.id = "current-font";
			currentFont.innerHTML = "Aa";
			selectBox.appendChild( currentFont );
			var fakeSelect = document.createElement("DIV");
			fakeSelect.id = "select-font";
			selectBox.appendChild( fakeSelect );
			var fontOptions = document.createElement("DIV");
			fontOptions.id = "font-options";
			fontOptions.style.display = "none";
			selectBox.appendChild( fontOptions );

			var fontScrollBar = document.createElement("DIV");
			fontScrollBar.className = "scrollbar";

			var fontScroll = document.createElement("DIV");
			fontScroll.className = "track";

			var fontScrollThumb = document.createElement("DIV");
			fontScrollThumb.className = "thumb";

			var fontScrollEnd = document.createElement("DIV");
			fontScrollEnd.className = "end";

			var fontScrollViewport = document.createElement("DIV");
			fontScrollViewport.className = "viewport";

			var fontScrollOverview = document.createElement("DIV");
			fontScrollOverview.className = "overview";		

			fontScrollThumb.appendChild( fontScrollEnd );
			fontScroll.appendChild( fontScrollThumb );

			fontScrollViewport.appendChild( fontScrollOverview );

			fontScrollBar.appendChild( fontScroll );

			fontOptions.appendChild( fontScrollBar );
			fontOptions.appendChild( fontScrollViewport );

			var selectArrow = document.createElement("SPAN");
			selectArrow.id = "select-arrow";

			selectArrow.addEventListener('click', function(e){

				e.stopPropagation();

				if( fontOptions.style.display == "none"){

					fontOptions.style.display = "block";
					selectArrow.className = selectArrow.className + " active";
					$("#font-options").tinyscrollbar();

				}
				else {

					fontOptions.style.display = "none";
					selectArrow.className = "";

				}
			});

			/*
			var boldText = document.createElement("SPAN");
			boldText.id = "bold-text";
			boldText.addEventListener( 'click', this.toolBoxButtonsFuction['boldText'] );


			var italicText = document.createElement("SPAN");
			italicText.id = "italic-text";
			italicText.addEventListener( 'click', this.toolBoxButtonsFuction['italicText'] );
			*/

			/*
			var addFont = document.createElement("DIV");
			addFont.id = "addFont";
			addFont.innerHTML = "+ dodaj nową czcionkę";
			addFont.addEventListener('click', function(){

				Editor.fonts.addFontBox();

			});

			fakeSelect.appendChild( selectArrow );
			fontOptions.appendChild( addFont );

			for( var font in Editor.fonts.getFonts() ){

				var option = document.createElement("DIV");
				var optionPreview = document.createElement("SPAN");
				var optionName = document.createElement("DIV");

				option.id = font;
				option.className = "font-option";
				option.style.fontFamily = font + "_regular";
				optionPreview.innerHTML = "A";
				optionName.innerHTML = font;
				option.appendChild( optionPreview );
				option.appendChild( optionName );

				option.addEventListener('click', function(){

					//_this.activeAvailableToolsForFont( this.getAttribute('id'));
					_this.text._currentFont = this.id;

					var selected = _this.text._getSelectedLetters();

					for( var i=0; i < selected.length; i++ ){

						selected[i].font = _this.text.getSelectedFont();

					}
					$("#current-font").css({ "fontFamily" : this.id + "_regular" })

					_this.text._recalculateAllLines();
					_this.text._updateToolBox( _this.text._currentFontColor, _this.text._currentFontSize );

				});

				fontScrollOverview.appendChild(option);
			}
			// koniec div'owego selekta

			fontSizeInput.onfocus = function(){

				_this.text._blockKeys = true;

			};

			fontSizeInput.onblur = function(){

				_this.text._blockKeys = false;

			};

			fontSizeInput.onchange = function(e){

				var selected = _this.text._getSelectedLetters();
				_this.text._currentFontSize = this.value;

				if( _this.useType == "admin")
					_this.defaultSettings.size = this.value;

				for( var i=0; i < selected.length; i++ ){

					var font = selected[i].font.split(" ")[1];
					selected[i].font = _this.text._currentFontSize + "px " +font;

				}

				_this._recalculateAllLines();

			};

			var col = new jscolor.color(input);

			col.onImmediateChange = function(){

				_this.text._currentFontColor = $("#colorPicker").css("background-color");
				_this.text.setTextColor( $("#colorPicker").css("background-color") );
				_this.text._updateToolBox( _this.text._currentFontColor, _this.text._currentFontSize );

				if( _this.useType == "admin" ){

					_this.defaultSettings.color = $("#colorPicker").css("background-color");

				}

			};



			tools.append( input );
			tools.append( fontSizeInput );
			tools.append( selectBox );
			//$("#textTools").append( boldText );
			//$("#textTools").append( italicText );
			tools.append( alignLeft );
			tools.append( alignCenter );
			tools.append( alignRight );




			var toolSize = {

				width  : tools.width(),
				height : tools.height()

			};


			var pos = this.getGlobalPosition();
			var stage = Editor.getStage();
			var bounds = this.getTransformedBounds();
			tools.css({ top: pos[1] + (bounds.height/2)*stage.scaleY + toolSize.height/2 + 50, left: pos[0] - toolSize.width/2 });
			*/


			this.toolBox._updateToolsBoxPosition();

			this.addEventListener('move', function( e ){

				_this.toolBox._updateToolsBoxPosition();

			});

			this.addEventListener('scale', function( e ){

				_this.toolBox._updateToolsBoxPosition();

			});

			this.addEventListener('rotate', function( e ){

				_this.toolBox._updateToolsBoxPosition();

			});

	/*
			tools.on('stageScroll', function( e ){

				_this.toolBox._updateToolsBoxPosition();

			});

			tools.on('stageMove', function( e ){

				_this.toolBox._updateToolsBoxPosition();

			});
	*/

			
		}

	};


	p._bindTextEvents = function(){

	};


	p._unbindTextEvents = function(){

	};


	p._unbindEvents = function(){

	};