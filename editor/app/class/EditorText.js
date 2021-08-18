"use strict"

Editor = Editor||{};

(function(){

	/**
	* Klasa odpowiadająca za edycję tekstu, dziedziczy po EditorObject
	*
	* @class Text
	* @constructor
	*/
	function Text( name, object ){

		//createjs.Container.call( this );
		Editor.Object.call( this, false );

		var _this = this;


		this.toolBoxButtonsFuction = {

			italicText : function(){

				if( _this._currentFontType.italic ){
					_this._currentFontType.italic = 0;
				}
				else {
					_this._currentFontType.italic = 1;		
				}

				var selected = _this._getSelectedLetters();
				for( var i=0; i < selected.length; i++ ){

					selected[i].font =  _this.getSelectedFont();

					if( _this._currentFontType.italic )
						selected[i].italic = 1;
					else
						selected[i].italic = 0;

				}

				//_this.activeAvailableToolsForFont( _this._currentFont.split("_")[0] );
				_this.updateBoldButton();
				_this.updateItalicButton();
				_this._updateToolBox( _this._currentFontColor, _this._currentFontSize );
				_this._recalculateAllLines();

			},

			boldText : function(){

				if( _this._currentFontType.regular ){
					_this._currentFontType.regular = 0;
				}
				else {
					_this._currentFontType.regular = 1;				
				}
				_this._currentFont
				var selected = _this._getSelectedLetters();
				_this.font = _this.getSelectedFont();
				for( var i=0; i < selected.length; i++ ){
					selected[i].font = _this.font;

					if(_this._currentFontType.regular)
						selected[i].regular = 1;
					else
						selected[i].regular = 0;
				}
				//_this.activeAvailableToolsForFont( _this._currentFont.split("_")[0] );
				_this.updateBoldButton();
				_this.updateItalicButton();
				_this._updateToolBox( _this._currentFontColor, _this._currentFontSize );
				_this._recalculateAllLines();
			},

			alignLeft : function(){
				_this._align = "left";
				_this._recalculateAllLines();
				var settings = _this.getSettings();
				_this.updateInDB( "settings", JSON.stringify(settings) );
				_this.updateAlignButtons( this );
			},

			alignRight : function(){
				_this._align = "right";
				_this._recalculateAllLines();
				var settings = _this.getSettings();
				_this.updateInDB( "settings", JSON.stringify(settings) );
				_this.updateAlignButtons( this );
			},

			alignCenter : function(){
				_this._align = "center";
				_this._recalculateAllLines();
				var settings = _this.getSettings();
				_this.updateInDB( "settings", JSON.stringify(settings) );
				_this.updateAlignButtons( this );
			}
		};

		this.font = "30px Arial";


		/**
		* Aktualnie wybrana czionka.
		*
		* @property _currentFont
		* @type {String}
		* @default "Arial"
		* @private
		*/
		this._currentFont = "Arial";


		this._currentFontType = { regular : 1, italic : 0};

		/**
		* Aktualny rozmiar czcionki.
		*
		* @property _currentFontSize
		* @type {integer}
		* @default "30"
		* @private
		*/
		this._currentFontSize = 30;


		/**
		* Aktualny kolor czcionki.
		*
		* @property _currentFontColor
		* @type {String}
		* @default "#f00"
		* @private
		*/
		this._currentFontColor = "#f00";


		/**
		* Flaga informująca czy wpisywanie tekstu do pola, jest zablokowane.
		*
		* @property _blockKeys
		* @type {Boolean}
		* @default "false"
		* @private
		*/
		this._blockKeys = false;


		/**
		* Flaga informująca czy wykonywana jest operacja zaznaczania tekstu
		*
		* @property selectionMode
		* @type {Boolean}
		* @default "false"
		* @private
		*/
		this._selectionMode = false;


		/**
		* Kontener przechowujący obiekty zaznaczania - prostokątne bloki, wyświetlane pod zaznaczonymi literami
		*
		* @property selectionContainer
		* @type {Container}
		* @private
		*/
		this._selectionContainer = {};


		/**
		* Flaga informująca czy tekst jest zaznaczony
		*
		* @property isSelected
		* @type {Boolean}
		* @default "false"
		* @private
		*/
		this._isEditing = false;


		/**
		* Zmienna definujaca nazwe obiektu, nazwa ta jest wyświetlana w warstwach, aby ułatwićmodyfikację.
		*
		* @property name
		* @type {String}
		* @default "brak"
		*/
		this.name = name;


		/**
		* type określa rodzaj narzędzi edycyjnych, które mają zostać podpięte do obiektu po kliknięciu
		*
		* @property type
		* @type {String}
		* @default "bitmap"
		*/
		this.type = "bitmap";


		/**
		* Wskazuje na rodzaj justowania tekstu.
		*
		* @property _align
		* @type {String}
		* @default "left"
		*/
		this._align = "left";


		/**
		* Tablica przechowująca obiekty-linie tekstu. Każdy kolejny element tablicy jest nową linią w edytorze. Posiadają one
		* 3 atrybuty : letters, width, lineHeight
		*
		* @property textLetters
		* @type {Array}
		*/
		this.textLetters = [{ letters : [], width : 0, lineHeight : 0}];


		/**
		* Słownik przechowujący obiekty tekstu (poszczególne litery). Kluczem do nich jest id obiektu.
		* 
		*
		* @property textObjects
		* @type {Dictionary}
		*/
		this.textObjects = {};


		// tutaj ma byc przetrzymywany caly napis..., musi byc zmnienna prywatna
		this.text = "";


		/**
		* Określa położenie kursora. level to numer lini liczony od zera, position jest kolejną literą lini tekstu, również liczoną od zera
		*
		* @property cursorPosition
		* @type {Array}
		*/
		this.cursorPosition = { level: 0, position: 0 };


		/**
		* Przechowuje iformacje o zaznaczonym tekście. Jest obiektem o strukturze: { startElement : {line: y, position: x}, stopElement : {line:y2, position x2} }
		*
		* @property selectedElements
		* @type {Object}
		*/
		this._selectedElements = { startElement : {line: 0, position: 5}, stopElement : {line:3, position: 2} };

		this.lettersWidth = 0;
		this.currentLineHeight = "";

		//cursor 
		this.cursorShape = new createjs.Shape();
		this.addChild( this.cursorShape );

		var that = this;

		this.keyDown = function(e){

			if( !that._blockKeys ){
				if( e.which == 8){
					that.removeLetter( true );
					that._recalculateAllLines();
					e.preventDefault();
					that.updateSize();
					var evt = new Event('addedText');
					that.dispatchEvent('addedText');
					document.getElementById("textTools").dispatchEvent( evt );
					Editor.tools.updateCompoundBox();
					Editor.tools.init();
				}
				else if( e.which == 46 ){

					that.removeLetter( false );
					that._recalculateAllLines();
					e.preventDefault();
					that.updateSize();
					var evt = new Event('addedText');
					that.dispatchEvent('addedText');
					document.getElementById("textTools").dispatchEvent( evt );
					Editor.tools.updateCompoundBox();
					Editor.tools.init();

				}
				else if( e.which == 9 ){
					that._displaySelectionElements();
				}
				else if( e.which == 13 ){
					var level = 0;

					for(var key in that.textLetters){

						level = key;

					}
					that.sliceTextLine( that.cursorPosition.level, that.cursorPosition.position);

					that.cursorPosition.position = 0;
					that.updateSize();
					var evt = new Event('addedText');
					that.dispatchEvent('addedText');

					var textTools = document.getElementById("textTools");

					if( textTools)
						textTools.dispatchEvent( evt );

					Editor.tools.updateCompoundBox();
					Editor.tools.init();
					that.drawCursor();
				}
				// obsluga strzałki w lewo
				else if( e.which == 37 ){
					if( that.cursorPosition.position > 0 ){
						that.cursorPosition.position--;
					}
					else {
						if( that.cursorPosition.level > 0){
							that.cursorPosition.level--;
							that.cursorPosition.position = that.textLetters[ that.cursorPosition.level ].letters.length;
						}
					}
					that.drawCursor();
				}
				// obsługa strzałki w prawo
				else if( e.which == 39 ){
					if( that.cursorPosition.position < that.textLetters[ that.cursorPosition.level ].letters.length ){
						that.cursorPosition.position++;
					}
					else {
						if( that.cursorPosition.level < that.textLetters.length-1 ){
							that.cursorPosition.level++;
							that.cursorPosition.position = 0;
						}
					}
					that.drawCursor();
				}
				//obsluga strzałki w dół
				else if( e.which == 40 ){
					if( that.cursorPosition.level < that.textLetters.length-1 ){
						that.cursorPosition.level++;
						if( that.cursorPosition.position > that.textLetters[that.cursorPosition.level].letters.length ) 
							that.cursorPosition.position = that.textLetters[that.cursorPosition.level].letters.length;
						
					}
					that.drawCursor();
				}
				//obsluga strzałki w górę
				else if( e.which == 38 ){
					if( that.cursorPosition.level > 0){
						that.cursorPosition.level--;
						if( that.cursorPosition.position > that.textLetters[that.cursorPosition.level].letters.length ) 
							that.cursorPosition.position = that.textLetters[that.cursorPosition.level].letters.length;
						
					}
					that.drawCursor();
				}
				else {
					if(window.event )
						e.shiftKey = window.event.shiftKey;

					that.addFullEditableLetter(  ( e.shiftKey) ? String.fromCharCode( e.keyCode ) : (String.fromCharCode( e.keyCode )).toLowerCase() , that.getSelectedFont(), that._currentFontColor /*+Math.floor(Math.random()*16777215).toString(16) */);
					that._redrawSelection();
					//that.addLetter( String.fromCharCode( e.keyCode));
					that.updateSize();
					Editor.tools.updateCompoundBox();
					Editor.tools.init();
					var evt = new Event('addedText');
					that.dispatchEvent('addedText');

					var toolsy = document.getElementById("textTools")

					if( toolsy )
						toolsy.dispatchEvent( evt );


					that.drawCursor();
					that.updateInDB("content", JSON.stringify( that._getContent() ));

					that.saveTransformation();
		 		}

		 		that._cancelSelection();
		 	}
		};

		this.addEventListener('click', function(event){

			event.stopPropagation();
			that._redrawSelection();

		});

		this.addEventListener('dblclick', function( event ){

			event.stopPropagation();
			that.drawCursor();
			Editor.getStage().removeAllEventListeners('stagemousedown');

			if( !that._isEditing ){

				that._bindTextEvents({
					'toolbox' : true
				});

			}

		});

		this.addEventListener("unclick", function( event ){

				that._unbindTextEvents();
		});

		this.cursor = "text";

		//this.body.addEventListener();
	};

	var p = Text.prototype = $.extend( true, Object.create( createjs.Container.prototype ), Object.create( Editor.Object.prototype ) );

	p.constructor = Text;


	p._bindTextEvents = function( settings ){

		var _this = this;

		if( settings.toolbox )
			this.initToolsBox();

		this.activeAlignButton();
		this.removeAllEventListeners('mousedown');
		this.removeAllEventListeners('pressmove');
		this.removeAllEventListeners('pressup');

		document.body.addEventListener("keydown", _this.keyDown);

		this.cursorAnimation = setInterval(function(){

			( _this.cursorShape.alpha == 1 )? _this.cursorShape.alpha=0 : _this.cursorShape.alpha=1;

		}, 400);

		this._isEditing = true;

		this.addEventListener('pressup', function(e){

			_this._selectionMode = false;

		});

		this.addEventListener('pressmove', function(e){

			e.stopPropagation();
			_this._displaySelectionElements();

		});

	};


	p._unbindTextEvents = function(){

		var _this = this;

		this._redrawSelection();
		document.body.removeEventListener("keydown", this.keyDown);
		clearInterval( this.cursorAnimation );
		this.cursorShape.alpha = 0;

		if( this._isEditing ){

			this.initEvents();

		}

		this._isEditing = false;
		$("#textTools").remove();
		// EditorObject

		Editor.initEvents();
		this.cursorShape.visible = false;
		//document.removeAllEventListeners('stageMove');
		//that.updateInDB("content", JSON.stringify( that._getContent() ));

	};


	/**
	* Zbiera informacje o aktualnej czcionce i zwraca odpowiednią.
	*
	* @method getSelectedFont
	*/
	p.getSelectedFont = function(){

		var font = this._currentFontSize + "px " + this._currentFont;
		var fontFamily = this._currentFont.split("_")[0].replace(' ', '');
		var fontType = "";
		var fonts = Editor.fonts.getFonts();

		if(fontFamily == "Arial")
			return font;

		if( this._currentFontType.regular ){

			if( this._currentFontType.italic ){

				if( fonts[fontFamily][fontType+"Italic"] )
					fontType += "Italic";

			}
			else {

				fontType += "Regular";

			}

		}
		else {

			if( fonts[fontFamily][fontType+"Bold"] )
				fontType += "Bold";

			if( this._currentFontType.italic ){

				if( fonts[fontFamily][fontType+"Italic"] )
					fontType += "Italic";

			}
			
		}

		if( fonts[fontFamily][fontType] ){

			font = this._currentFontSize + "px " + fonts[fontFamily][fontType];	

		}
		else {

		}

		return font;
	};


	/**
	* Renderuje domyślny tekst.
	*
	* @method drawDefaultText
	*/
	p.drawDefaultText = function(){

		var defaultText = "Twój tekst";
		var defaultFont = this.getSelectedFont();
		var defaultColor = this._currentFontColor;

		//console.log( "CZCIONKA DOM");
		//console.log( defaultFont );
		//console.log( defaultColor );

		for( var i=0; i < defaultText.length; i++){

			this.addFullEditableLetter( defaultText[i], defaultFont, defaultColor );

		}

	};


	/**
	* Zwraca obiekt reprezentujący ustawienia edytowanego tekstu ( align ).
	*
	* @method getSettings
	*/
	p.getSettings = function(){

		var settings = {

			align : this._align

		}

		return settings;

	};


	/**
	* Funkcja blokuje przycisk pogrubiania czcionki.
	*
	* @method _blockBoldButton
	*/
	p._blockBoldButton = function(){

		var _this = this;
		$("#bold-text").addClass("blocked");
		this._currentFontType.regular = 1;
		document.getElementById("bold-text").removeEventListener("click", _this.toolBoxButtonsFuction["boldText"]);

	};


	/**
	* Funkcja odblokowuje przycisk pogrubiania czcionki.
	*
	* @method _unblockBoldButton
	*/
	p._unblockBoldButton = function(){

		var _this = this;
		$("#bold-text").removeClass("blocked");
		document.getElementById("bold-text").addEventListener("click", _this.toolBoxButtonsFuction["boldText"]);

	};


	/**
	* Funkcja blokuje przycisk pochylania czcionki.
	*
	* @method _blockItalicButton
	*/
	p._blockItalicButton = function(){

		var _this = this;
		$("#italic-text").addClass("blocked");
		this._currentFontType.italic = 0;
		document.getElementById("italic-text").removeEventListener("click", _this.toolBoxButtonsFuction["italicText"]);		

	};


	/**
	* Funkcja odblokowuje przycisk pochylania czcionki.
	*
	* @method _unblockItalicButton
	*/
	p._unblockItalicButton = function(){

		var _this = this;
		$("#italic-text").removeClass("blocked");
		document.getElementById("italic-text").addEventListener("click", _this.toolBoxButtonsFuction["italicText"]);		

	};


	/**
	* Sprawdza dostępne narzędzia dla danej czcionki, i blokuje te które są niedostępne.
	*
	* @method activeAvailableToolsForFont
	*/
	p.activeAvailableToolsForFont = function( fontFamily ){

		var font = Editor.fonts.getFonts()[fontFamily];

		if( font.Bold && font.Italic && font.BoldItalic ){

			if( $("#bold-text").hasClass('blocked') ){

				this._unblockBoldButton();

			}		
			if( $("#italic-text").hasClass('blocked') ){

				this._unblockItalicButton();

			}

		}

		else if( font.Bold && font.Italic && !font.BoldItalic ){

			if( $("#bold-text").hasClass('blocked') ){

				this._unblockBoldButton();

			}		
			if( $("#italic-text").hasClass('blocked') ){

				this._unblockItalicButton();

			}

			if(this._currentFontType.italic == 1){

				this._blockBoldButton();
				this._currentFontType.regular = 1;

			}
			if( this._currentFontType.regular == 0 ){

				this._blockItalicButton();
				this._currentFontType.italic = 0;

			}

		}

		else if( font.Bold && !font.Italic && font.BoldItalic){

			if( $("#bold-text").hasClass('blocked') ){

				this._unblockBoldButton();

			}
			if( this._currentFontType.regular == 0 ){

				if( $("#italic-text").hasClass('blocked') ){

					this._unblockItalicButton();

				}				

			}
			else {

				this._blockItalicButton();
				this._currentFontType.italic = 0;

			}


		}

		else if( !font.Bold && font.Italic && font.BoldItalic ){

			if( $("#italic-text").hasClass('blocked') ){

				this._unblockItalicButton();

			}
			if( this._currentFontType.italic == 1 ){

				if( $("#bold-text").hasClass('blocked') ){

					this._unblockBoldButton();

				}				
				else {

					this._blockBoldButton();
					this._currentFontType.regular = 1;

				}

			}
			else {

				if( this._currentFontType.regular == 0){

					this._currentFontType.regular = 1;

				}

			}


		}

		else if( !font.Bold && ! font.Italic ){

			this._blockBoldButton();
			this._blockItalicButton();

			if( this._currentFontType.regular == 0){

				this._currentFontType.regular = 1;

			}

			if( this._currentFontType.italic == 1 ){

				this._currentFontType.italic = 0;

			}

		}

	};


	/**
	* Inicjalizuje podpięty do tekstu toolBox.
	*
	* @method initToolsBox
	*/
	p.initToolsBox = function(){

		var _this = this;
		$('body').append("<div id='textTools'></div>");

		var input = document.createElement('INPUT');
		input.id = "colorPicker";

		var fontSizeInput = document.createElement('INPUT');
		fontSizeInput.id = "font-size";
		fontSizeInput.name = "font-size";

		var alignCenter = document.createElement("SPAN");
		alignCenter.id = "fot-align-center";
		alignCenter.className = "text-align";
		alignCenter.addEventListener( 'click', this.toolBoxButtonsFuction['alignCenter'] );

		var alignLeft = document.createElement("SPAN");
		alignLeft.id = "fot-align-left";
		alignLeft.className = "text-align";
		alignLeft.addEventListener( 'click', this.toolBoxButtonsFuction['alignLeft'] );

		var alignRight = document.createElement("SPAN");
		alignRight.id = "fot-align-right";
		alignRight.className = "text-align";
		alignRight.addEventListener( 'click', this.toolBoxButtonsFuction['alignRight'] );

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

		var boldText = document.createElement("SPAN");
		boldText.id = "bold-text";
		boldText.addEventListener( 'click', this.toolBoxButtonsFuction['boldText'] );


		var italicText = document.createElement("SPAN");
		italicText.id = "italic-text";
		italicText.addEventListener( 'click', this.toolBoxButtonsFuction['italicText'] );

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
				_this._currentFont = this.id;
				var selected = _this._getSelectedLetters();

				for( var i=0; i < selected.length; i++ ){

					selected[i].font = _this.getSelectedFont();

				}

				_this._recalculateAllLines();
				_this._updateToolBox( _this._currentFontColor, _this._currentFontSize );

			});

			fontScrollOverview.appendChild(option);
		}
		// koniec div'owego selekta

		fontSizeInput.onfocus = function(){

			_this._blockKeys = true;

		};

		fontSizeInput.onblur = function(){

			_this._blockKeys = false;

		};

		fontSizeInput.onchange = function(e){

			var selected = _this._getSelectedLetters();
			_this._currentFontSize = this.value;

			for( var i=0; i < selected.length; i++ ){

				var font = selected[i].font.split(" ")[1];
				selected[i].font = _this._currentFontSize + "px " +font;

			}

			_this._recalculateAllLines();

		};

		var col = new jscolor.color(input);

		col.onImmediateChange = function(){

			_this._currentFontColor = $("#colorPicker").css("background-color");
			_this.setTextColor( $("#colorPicker").css("background-color") );
			_this._updateToolBox( _this._currentFontColor, _this._currentFontSize );

		};

		document.getElementById("textTools").addEventListener('stageScroll', function( e ){

			var pos = _this.getGlobalPosition();
			var stage = Editor.getStage();
			var bounds = _this.getTransformedBounds();
			$("div#textTools").css({ top: pos[1] - (bounds.height/2)*stage.scaleY, left: pos[0] - (bounds.width/2)*stage.scaleX });

		});

		document.getElementById("textTools").addEventListener('addedText', function( e ){

			var pos = _this.getGlobalPosition();
			var stage = Editor.getStage();
			var bounds = _this.getTransformedBounds();
			$("div#textTools").css({ top: pos[1] - (bounds.height/2)*stage.scaleY, left: pos[0] - (bounds.width/2)*stage.scaleX });

		});

		document.addEventListener('stageMove', function(){

			if( $("div#textTools").length > 0){

				var pos = _this.getGlobalPosition();
				var stage = Editor.getStage();
				var bounds = _this.getTransformedBounds();
				$("div#textTools").css({ top: pos[1] - (bounds.height/2)*stage.scaleY, left: pos[0] - (bounds.width/2)*stage.scaleX  });

			}

		});

		$("#textTools").append( input );
		$("#textTools").append( fontSizeInput );
		$("#textTools").append( selectBox );
		$("#textTools").append( boldText );
		$("#textTools").append( italicText );
		$("#textTools").append( alignLeft );
		$("#textTools").append( alignCenter );
		$("#textTools").append( alignRight );

		var pos = this.getGlobalPosition();
		var stage = Editor.getStage();
		var bounds = _this.getTransformedBounds();
		$("div#textTools").css({ top: pos[1] - (bounds.height/2)*stage.scaleY, left: pos[0] - (bounds.width/2)*stage.scaleX  });

	};


	/**
	* Metoda prywatna, przeliczająca pozycje liter w lini. Należy jej używać przy każdej aktualicaji tekstu ( np. dodanie/usuniecie liter )
	*
	* @method recalculateLine
	* @param {Int} line Numer lini która ma zostać przeliczona
	* @private
	*/
	p._recalculateLine = function( line ){
		
		//console.log("KALKULACJA LINI");
		var linePosY = 0;

		for( var i=0; i < line; i++){

			linePosY += this.textLetters[i].lineHeight;

		}

		var textLine = this.textLetters[line];

		var lineHeight = this.textLetters[line].lineHeight;
		var lineWidth = 0;

		for( var i=0; i<textLine.letters.length; i++){

			var letter = textLine.letters[i];
			var block = this._selectionContainer[letter.id];

			var bounds = letter.getTransformedBounds();
			var font_size = letter.font.split(" ");
			font_size = font_size[0].slice(0, font_size[0].length-2);

			letter.x = 0;
			letter.width = bounds.width;
			letter.y = linePosY +50;//+ ( lineHeight - font_size);
			letter.letterPosition = i;
			letter.linePosition = line;

			for( var l=0; l<i;l++){

				letter.x += textLine.letters[l].width;

			}

			//block.graphics.c().f("#FF7A00").dr( letter.x, letter.y-lineHeight , bounds.width, bounds.height );	
			block.graphics.c().f("#FF7A00").dr( 0, 0 , bounds.width, bounds.height );
			block.x = letter.x;
			block.y = letter.y-lineHeight;
			lineWidth = letter.x + letter.width;
			textLine.width = lineWidth;

		}

		if( this._align == "center"){

			//console.log( this.trueWidth );

			var offset = (this.trueWidth - lineWidth) /2;

			for( var i=0; i<this.textLetters[line].letters.length; i++){

				var block = this._selectionContainer[this.textLetters[line].letters[i].id];
				this.textLetters[line].letters[i].x += offset;
				block.x += offset;
				//console.log("przeliczanie");

			}

			// this.updateAlignButtons( document.getElementById("fot-align-center") );
	
		}
		else if( this._align == "right"){

			var offset = this.trueWidth - lineWidth;

			for( var i=0; i<this.textLetters[line].letters.length; i++){

				var block = this._selectionContainer[this.textLetters[line].letters[i].id];
				this.textLetters[line].letters[i].x += offset;
				block.x += offset;
				//console.log("przeliczanie");
			}

		//	this.updateAlignButtons( document.getElementById("fot-align-right") );
	
		}

		else {

		//	this.updateAlignButtons( document.getElementById("fot-align-left") );
	
		}

	};


	/**
	* Metoda prywatna, przeliczająca pozycje liter we wszystkich liniach.
	*
	* @method recalculateAllLines
	* @private
	*/
	p._recalculateAllLines = function(){

		//console.log("RECALCULATE");

		for(var i=0; i < this.textLetters.length; i++){

			this._recalculateLine(i);

		}

		this.updateSize();
		Editor.tools.updateCompoundBox();
		Editor.tools.init();
		this.drawCursor();

	};


	/**
	* Metoda drawCursor rysuje kursor w obszarze tekstowym.
	*
	* @method setCursorPosition
	* @param {Int} level Linia w której ma zostać ustawiony kursor.
	* @param {Int} position	Pozycja litery za którą ma być ustawiony kursor.
	*/
	p.setCursorPosition = function( level, position ){

		this.cursorPosition.level = level;
		this.cursorPosition.position = position;
		var letter = this.textLetters[level][position];;
		this.drawCursor();

	};


	/**
	* 'Zapala' aktywną opcję judstowania tekstu.
	*
	* @method activeAlignButton
	*/
	p.activeAlignButton = function(){

		if( this._align == "center"){

			this.updateAlignButtons( document.getElementById("fot-align-center") );

		}
		else if( this._align == "right"){

			this.updateAlignButtons( document.getElementById("fot-align-right") );

		}

		else {

			this.updateAlignButtons( document.getElementById("fot-align-left") );

		}

	};



	/**
	* Metoda drawCursor rysuje kursor w obszarze tekstowym.
	*
	* @method drawCursor	
	*/
	p.drawCursor = function(){

		this.cursorShape.visible = true;
		var cursorPosition = { x: 0, y:0 };

		for( var i=0; i < this.cursorPosition.level; i++ ){

			cursorPosition.y += this.textLetters[i].lineHeight;

		}

		for( var i=0; i < this.cursorPosition.position; i++ ){

			cursorPosition.x += this.textLetters[this.cursorPosition.level].letters[i].width;

		}

		if( this._align == "center" ) cursorPosition.x += (this.trueWidth - this.textLetters[ this.cursorPosition.level ].width)/2;
		if( this._align == "right" ) cursorPosition.x += (this.trueWidth - this.textLetters[ this.cursorPosition.level ].width);

		this.cursorShape.graphics.c().beginFill("#fff").drawRect( cursorPosition.x, cursorPosition.y, 3, 50);

	};


	/**
	* Odświeża rozmiar pola tekstowego, należy wykonywać zawsze po dodaniu litery bądź transformacjach wykonanych na elemencie.
	*
	* @method updateSize
	*/
	p.updateSize = function(){

		var rot = this.rotation;
		var _this = this;
		this.rotation = 0;
		var bounds = this.getTransformedBounds();

		//console.log( this );

		if( bounds ){

			this.rotation = rot;

			this.trueWidth = this.width = bounds.width/this.scaleX;
			//this.width = this.trueWidth * this.body.scaleX;

			this.trueHeight = this.height = bounds.height/this.scaleY;
			//this.height = this.trueHeight * this.body.scaleY;

			this.regX = this.trueWidth/2;
			this.regY = this.trueHeight/2;

			for( var key in this.textObjects ){

				var hit = this.textObjects[key].hitArea;
				hit.graphics.c().beginFill("#000").drawRect( 0 , -this.textObjects[key].getMeasuredHeight(), this.textObjects[key].getMeasuredWidth(), this.textObjects[key].getMeasuredHeight());
			
			}
			
		}
		else {

			this.width = this.trueWidth = 30;
			this.height = this.trueHeight = 50;

		}
		if( $("div#textTools").length > 0){

			var pos = _this.getGlobalPosition();
			$("div#textTools").css({ top: pos.y, left: pos.x});

		}

	};


	/**
	* Dzieli bieżącą linę tekstu na dwa fragmenty. Pierwszy pozostaje w aktualnej pozycji, natomiast drugi zostaje przeniesiony
	* do lini niżej, spychając całą resztę o kolejną linię.
	*
	* @method sliceTextLine
	* @param {Int} line Dzielona linia.
	* @param {Int} position Pozycja litery od której zaczyna się kolejny wers.
	*/
	p.sliceTextLine = function( line, position ){

		var lineText = this.textLetters[line].letters;
		var lineHeight = this.textLetters[line].lineHeight;
		var firstTextPart = lineText.slice(0, position);
		var secondTextPart = lineText.slice( position, lineText.length);

		// aktualizacja pozycji liter
		for( var i=0; i < secondTextPart.length; i++ ){

			secondTextPart[i].linePosition++;
			secondTextPart[i].letterPosition = i;
			secondTextPart[i].y += lineHeight;
			secondTextPart[i].x = 0;
			
			for(var l=0; l < i; l++){

				secondTextPart[i].x += secondTextPart[l].width;

			}

		}

		var allTextFirstPart = this.textLetters.slice(0, line+1);
		var allTextSecondPart = this.textLetters.slice(line+1, this.textLetters.length);

		for( var i=0; i < allTextSecondPart.length; i++ ){

			for( var l=0; l < allTextSecondPart[i].letters.length; l++ ){

					allTextSecondPart[i].letters[l].y += lineHeight;
					allTextSecondPart[i].letters[l].linePosition++;
					allTextSecondPart[i].letters[l].letterPosition = l;

			}

		}

		allTextFirstPart[line].letters = firstTextPart;
		allTextFirstPart.push( { letters : secondTextPart, width : 0, lineHeight : lineHeight } );

		if( allTextSecondPart.length > 0){

			var newText = allTextFirstPart.concat( allTextSecondPart );

		}
		else {

			var newText = allTextFirstPart;

		}

		this.textLetters = newText;

		this.setCursorPosition(line+1, 0);

	};


	/**
	* Aktualizuje dane w toolbox'ie dla tekstu.
	*
	* @method _updateToolBox
	* @private
	*/
	p._updateToolBox= function( color, fontSize ){

		// prawdopodobnie trzeba zrobić nowa klasę toolBox
		$("#colorPicker").css("background-color", color);
		$("input#font-size").val(fontSize);
		$("#current-font").css( "font-family", (this.getSelectedFont()).split(" ")[1] );
		
	};


	p.updateBoldButton = function(){

		var button = document.getElementById("bold-text");

		if( this._currentFontType.regular ){

			button.style.backgroundColor = "#242424";
			button.style.boxShadow = "none";

		}
		else {

			button.style.backgroundColor = "#D44343";
			button.style.boxShadow = "0 0 7px #000 inset, 0 0 7px #000 inset";

		}

	};


	p.updateItalicButton = function(){

		var button = document.getElementById("italic-text");

		if( !this._currentFontType.italic ){

			button.style.backgroundColor = "#242424";
			button.style.boxShadow = "none";	

		}
		else {

			button.style.backgroundColor = "#D44343";
			button.style.boxShadow = "0 0 7px #000 inset, 0 0 7px #000 inset";

		}

	};


	p.updateAlignButtons = function( elem ){

		$(".text-align").css({
			boxShadow       : 'none',
			backgroundColor : "#242424"
		});

		$(elem).css({
			boxShadow       : "0 0 7px #000 inset, 0 0 7px #000 inset",
			backgroundColor : "#D44343"
		});

	};


	/**
	* Dodaje w pełni edytowalną (rozmiar, czcionka, kolor) literę do ciągu znaków, jej pozycja jest uwarunkowana aktualną pozycją kursora.
	*
	* @method addFullEditableLetter
	* @param {String} letter Dodawana litera.
	* @param {String} font	Rozmiar i rodzaj czcionki (np. 40px Arial).
	* @param {String} color Kolor czcionki.
	*/
	p.addFullEditableLetter = function( letter, font, color ){

		//this.uncache();

		var linePosY = 0;

		for( var i=0; i < this.cursorPosition.level; i++){

			linePosY += this.textLetters[i].lineHeight;

		}

		var lineText = this.textLetters[ this.cursorPosition.level ].letters;
		var firstTextPart = lineText.slice( 0, this.cursorPosition.position );
		var secondTextPart = lineText.slice( this.cursorPosition.position, lineText.length );

		var that = this;

		if( this.text.length == 0){

			this.trueWidth = this.width = 0;
			this.trueHeight = this.height = 0;
			this.regX = this.trueWidth/2;
			this.regY = this.trueHeight/2;

		}

		var letter = new createjs.Text( letter, font, color);
		letter.lineHeight = 50;
		letter.italic = this._currentFontType.italic;
		letter.regular = this._currentFontType.regular;

		this.textObjects[ letter.id ] = letter;

		var letterPosX = 0;

		for( var i=0; i <firstTextPart.length; i++ ){

			letterPosX += firstTextPart[i].width;

		}
		
		letter.x = letterPosX;
		letter.textBaseline = "alphabetic";

		var letterBounds = letter.getBounds();

		var selectionBackground =  new createjs.Shape();
		this.addChild( selectionBackground );

		//letter.cache(0, -letterBounds.height,letterBounds.width, letterBounds.height);

		selectionBackground.graphics.c().f("#FF7A00").dr( letterBounds.x,  letterBounds.y, letterBounds.width, letterBounds.height );
		selectionBackground.visible = false;
		this._selectionContainer[letter.id] = selectionBackground;
		selectionBackground.alpha = 0.4;



		this.addChild( letter );

		letter.width = letterBounds.width;
		letter.letterPosition = this.cursorPosition.position;
		letter.linePosition = this.cursorPosition.level;
		//letter.textBaseline = "alphabetic";

		firstTextPart.push( letter );

		var textArray = firstTextPart.concat( secondTextPart );

		for( var i=0; i < secondTextPart.length; i++ ){

			secondTextPart[i].x += letter.width;
			secondTextPart[i].letterPosition++;

		}

		//this.textLetters[this.cursorPosition.level].letters.push( letter );
		this.textLetters[this.cursorPosition.level].letters = textArray;
		this.textLetters[this.cursorPosition.level].width += letterBounds.width;

		if( this.textLetters[this.cursorPosition.level].lineHeight < letter.getMeasuredHeight() ) this.textLetters[this.cursorPosition.level].lineHeight = letter.getMeasuredHeight();

		//letter.y = -letterBounds.y;
		letter.y = linePosY + 50;

		this.lettersWidth += letterBounds.width;
		var hit = new createjs.Shape();
		hit.graphics.beginFill("#000").drawRect( 0 , -letter.getMeasuredHeight() , letter.getMeasuredWidth(), letter.getMeasuredHeight());

		letter.hitArea = hit;


		letter.addEventListener('mousedown', function(e){

			//e.stopPropagation();
			if( that._isEditing ){

				that._selectionMode = true;
				that._redrawSelection();
				that.setCursorPosition( letter.linePosition, letter.letterPosition);

			}

			that._setSelectionStartElement( letter.linePosition, letter.letterPosition );
			that._setSelectionLastElement( letter.linePosition, letter.letterPosition );

			if( that._selectionMode ){

				e.stopPropagation();
				that._currentFont = letter.font.split("px")[1].replace(" ", "");

				that._currentFontType.italic = e.target.italic;


				//that.updateItalicButton();


				that._currentFontType.regular = e.target.regular;


				//that.updateBoldButton();


				//that.activeAvailableToolsForFont( that._currentFont );
				that._currentFontSize = letter.font.split("px")[0];
				that._currentFontColor = letter.color;

				//that.activeAvailableToolsForFont( (that._currentFont).split("_")[0]  );

				that._updateToolBox( that._currentFontColor, that._currentFontSize );

			}

		});

		letter.addEventListener('mouseover', function(e){

			if((that._selectedElements.startElement.line == that._selectedElements.stopElement.line && that._selectedElements.stopElement.position > that._selectedElements.startElement.position ) || that._selectedElements.startElement.line < that._selectedElements.stopElement.line ){

				if( that._selectionMode )
					that._setSelectionLastElement( letter.linePosition, letter.letterPosition+1 );

			}
			else {

				if( that._selectionMode )
					that._setSelectionLastElement( letter.linePosition, letter.letterPosition );

			}
		});

		var bounds = this.getBounds();
		this.trueWidth = this.width = bounds.width;
		this.trueHeight = this.height = bounds.height;
		this.regX = this.trueWidth/2;
		this.regY = this.trueHeight/2;

		this.cursorPosition.position++;

		var bounds = this.getTransformedBounds();
		//console.log(bounds);

		//this.cache( that.x, that.y, that.trueWidth, that.trueHeight );

		this._recalculateAllLines();

		return letter;

	};


	p.singleText = function( text, font, color ){

		this.text = text;
		var text = new createjs.Text( text, font, color );
		this.textObjects[ text.id ] = text;
		text.textBaseline = "alphabetic";
		this.addChild( text );

		var bounds = this.getTransformedBounds();

		this.trueWidth = this.width = bounds.width;
		this.trueHeight = this.height = bounds.height;
		this.regX = this.trueWidth/2;
		this.regY = this.trueHeight/2;

		var hit = new createjs.Shape();
		hit.graphics.beginFill("#000").drawRect( bounds.x , bounds.y, text.getMeasuredWidth(), text.getMeasuredHeight());

		text.hitArea = hit;
		var textBounds = text.getTransformedBounds();
		text.y = -textBounds.y;

	};


	/**
	* Usuwa literę, bądź zaznaczony tekst
	*
	* @method removeLetter
	* @param {Boolean} is_backspace Określa nacisniety przycisk, backspace|delete
	*/
	p.removeLetter = function( is_backspace ){

		if( is_backspace == null ) is_backspace = true;

		var s = this._selectedElements;

		if( s.startElement.line == s.stopElement.line && s.startElement.position == s.stopElement.position){
		
			var letterToRemove = null;
			
			if( is_backspace ){
				
				if( this.cursorPosition.position == 0 && this.cursorPosition.level > 0){

					var firstTextPart = this.textLetters[ this.cursorPosition.level-1].letters;
					var secondTextPart = this.textLetters[ this.cursorPosition.level].letters;


					//update pozycji kolejnej lini
					var currentLevel = this.cursorPosition.level;

					var allTextFirstPart = this.textLetters.slice(0, this.cursorPosition.level);
					var allTextSecondPart = this.textLetters.slice( this.cursorPosition.level+1, this.textLetters.length );
					
					var newAllText = allTextFirstPart.concat(allTextSecondPart);

					this.textLetters = newAllText;
					//lete this.textLetters[this.cursorPosition.level];

					var newTextLine = firstTextPart.concat( secondTextPart );

					this.textLetters[this.cursorPosition.level-1].letters = newTextLine;

					for( var i=0; i<this.textLetters.length; i++){
				
						this._recalculateLine(i);
				
					}

					this.cursorPosition.level--;
					this.cursorPosition.position = firstTextPart.length+1;

				}
				else {

					this.removeChild( this.textLetters[ this.cursorPosition.level].letters[ this.cursorPosition.position-1 ] );
					var firstTextPart = this.textLetters[ this.cursorPosition.level].letters.slice(0, this.cursorPosition.position-1 );
					var secondTextPart = this.textLetters[ this.cursorPosition.level].letters.slice(this.cursorPosition.position, this.textLetters[ this.cursorPosition.level].letters.length  );

					var newTextLine = firstTextPart.concat( secondTextPart );
					this.cursorPosition.position--;

					this.textLetters[ this.cursorPosition.level].letters = newTextLine;
					this._recalculateLine(this.cursorPosition.level);

				}

			}
			else {

				if( this.cursorPosition.position == this.textLetters[ this.cursorPosition.level].letters.length && this.cursorPosition.level < this.textLetters.length){

					this._concatLineWithLineUnder( this.cursorPosition.level );

				}
				else {

					this.removeChild( this.textLetters[ this.cursorPosition.level].letters[ this.cursorPosition.position ] );
					var firstTextPart = this.textLetters[ this.cursorPosition.level].letters.slice(0, this.cursorPosition.position );
					var secondTextPart = this.textLetters[ this.cursorPosition.level].letters.slice(this.cursorPosition.position+1, this.textLetters[ this.cursorPosition.level].letters.length  );
					var newTextLine = firstTextPart.concat( secondTextPart );
					this.textLetters[ this.cursorPosition.level].letters = newTextLine;
					this._recalculateLine(this.cursorPosition.level);

				}

			}

			//this.textLetters[ this.cursorPosition.level][]
			this.drawCursor();

		}
		else {

			// selectedElements
			var s = this._selectedElements;
			this._removeTextBlock( s.startElement.line , s.startElement.position, s.stopElement.line, s.stopElement.position );
			this._redrawSelection();

		}

	};


	/**
	* Ustawia pierwszy element zaznaczenia
	*
	* @method setSelectionStartElement
	* @param {int} line Określa linię pierwszego elementu
	* @param {int} letter Określa 
	* @private
	*/
	p._setSelectionStartElement = function( line, letter ){

		this._selectedElements['startElement'] = { line: line, position: letter};

	};


	/**
	* Ustawia ostatni element zaznaczenia
	*
	* @method setSelectionLastElement
	* @param {int} line Określa linię pierwszego elementu
	* @param {int} letter Określa 
	* @private
	*/
	p._setSelectionLastElement = function( line, letter){

		this._selectedElements['stopElement'] = { line: line, position: letter};

	};


	/**
	* Zwraca zaznaczone elementy, jako obiekt { line : [selectedObjects] } .
	*
	* @method displaySelectionElements
	* @private
	*/
	p._displaySelectionElements = function(){

		if( this._selectionMode ){

			//this._setColorToAllLetters("#FFF");
			this._redrawSelection();
			//format zaznaczonych elementów { startElement : {line: y, position: x}, stopElement : {line:y2, position x2} }
			if( (this._selectedElements.startElement.line <=  this._selectedElements.stopElement.line && this._selectedElements.stopElement.position >= this._selectedElements.startElement.position) || (this._selectedElements.startElement.line < this._selectedElements.stopElement.line) ){

				for( var i= this._selectedElements.startElement.line; i <= this._selectedElements.stopElement.line; i++ ){
					
					if( this._selectedElements.startElement.line == this._selectedElements.stopElement.line){
					
						var line = this.textLetters[i].letters;
					
						for( var l=this._selectedElements.startElement.position;l < this._selectedElements.stopElement.position; l++ ){
				
							this._selectionContainer[line[l].id].visible = true;
							//line[l].color = "#F00";

						}

					}

					else if( i == this._selectedElements.startElement.line){

						var line = this.textLetters[this._selectedElements.startElement.line].letters;
						
						for( var l=this._selectedElements.startElement.position;l < line.length; l++ ){
						
							//line[l].color = "#F00";
							this._selectionContainer[line[l].id].visible = true;
						
						}

					}

					else if( i < this._selectedElements.stopElement.line){

						var line = this.textLetters[i].letters;

						for( var l=0; l < line.length; l++ ){

							//line[l].color = "#F00";
							this._selectionContainer[line[l].id].visible = true;

						}	

					}
					else if( i == this._selectedElements.stopElement.line ){

						var line = this.textLetters[this._selectedElements.stopElement.line].letters;

						for( var l=0;l < this._selectedElements.stopElement.position; l++ ){

							//line[l].color = "#F00";
							this._selectionContainer[line[l].id].visible = true;

						}	

					}

				}

			}
			else {

				for( var i= this._selectedElements.startElement.line; i >= this._selectedElements.stopElement.line; i-- ){
					
					if( this._selectedElements.startElement.line == this._selectedElements.stopElement.line){
				
						var line = this.textLetters[i].letters;
					
						for( var l= this._selectedElements.stopElement.position;l < this._selectedElements.startElement.position; l++ ){
						
							this._selectionContainer[line[l].id].visible = true;
							//this.setCursorPosition( i, this._selectedElements.stopElement.position);
							//line[l].color = "#F00";
					
						}

					}

					else if( i == this._selectedElements.stopElement.line){
					
						var line = this.textLetters[this._selectedElements.stopElement.line].letters;
					
						for( var l=this._selectedElements.stopElement.position;l < line.length; l++ ){
					
							//line[l].color = "#F00";
							this._selectionContainer[line[l].id].visible = true;
						
						}
					
					}
					else if( i < this._selectedElements.startElement.line){
						
						var line = this.textLetters[i].letters;
						
						for( var l=0; l < line.length; l++ ){
					
							//line[l].color = "#F00";
							this._selectionContainer[line[l].id].visible = true;
					
						}	

					}
					else if( i == this._selectedElements.startElement.line ){
						
						var line = this.textLetters[this._selectedElements.startElement.line].letters;
						
						for( var l=0;l < this._selectedElements.startElement.position; l++ ){
					
							//line[l].color = "#F00";
							this._selectionContainer[line[l].id].visible = true;

						}	

					}

				}	

			}

		}

	};


	/**
	* Ustawia wybrany kolor wszystkim literom w wybranym obiekcie.
	*
	* @method setColorToAllLetters
	* @private
	*/
	p._setColorToAllLetters = function( color ){

		for( var key in this.textObjects ){

			this.textObjects[key].color = color;

		}

	};


	/**
	* Przerysowywuje zaznaczenie tekstu;
	*
	* @method redrawSelection
	* @private
	*/
	p._redrawSelection = function(){

		for( var key in this._selectionContainer ){

			this._selectionContainer[key].visible = false;

		}

	};


	/**
	* Usuwa zaznaczenie tekstu - tylko zaznaczenie, nie ingeruje w tekst
	*
	* @method cancelSelection
	* @private
	*/
	p._cancelSelection = function(){

		this._setSelectionStartElement(0,0);
		this._setSelectionLastElement(0,0);
		this._redrawSelection();

	};


	/**
	* Usuwa zaznaczony blok tekstu.
	*
	* @method cancelSelection
	* @private
	*
	*/
	p._removeTextBlock = function(startLine, startLetter, stopLine, stopLetter){

		if( (startLine == stopLine && startLetter < stopLetter) || ( startLine < stopLine) ){

			var allText = this.textLetters;
			var newText = [];
			//startLine
			var sL = this.textLetters[startLine];

			for( var i=startLine; i <= stopLine; i++){

				if( i == startLine ){

					if( startLine != stopLine ){

						this._removeLettersFromLine( startLine, startLetter, sL.letters.length );
						this._removeLettersFromLine( stopLine, 0, stopLetter-1);
						var lineToRemove = startLine+1;

						for (var i = startLine+1; i < stopLine; i++) {

							this._removeLine(lineToRemove);

						};

						this._concatLineWithLineUnder(startLine);
						this.setCursorPosition( startLine, startLetter );

					}
					else {

						this._removeLettersFromLine( startLine, startLetter, stopLetter-1 );
						this.setCursorPosition( startLine, startLetter );

					}

				}

			}

		}
		else {
						
			var allText = this.textLetters;
			var newText = [];
			//startLine
			var sL = this.textLetters[startLine];

			for( var i=stopLine; i <= startLine; i++){

				if( i == startLine ){

					if( startLine != stopLine ){

						this._removeLettersFromLine( stopLine, stopLetter, sL.letters.length );
						this._removeLettersFromLine( startLine, 0, startLetter-1 );
						var lineToRemove = stopLine+1;

						for (var i = stopLine+1; i < startLine; i++) {

							this._removeLine(lineToRemove);

						};		

						this._concatLineWithLineUnder(stopLine);
						this.setCursorPosition( stopLine, stopLetter );

					}
					else {

						this._removeLettersFromLine( startLine, stopLetter, startLetter-1 );
						this.setCursorPosition( stopLine, stopLetter );

					}

				}

			}

		}

	};


	/**
	* Podana linia zostaje złączona z linią podspodem.
	*
	* @method concatWithLineUnder
	* @param {Integer} line Numer lini do której zostanie dodana następująca po niej linia.
	* @private
	*/
	p._concatLineWithLineUnder = function( line ){
		// caly tekst

		var text = this.textLetters;

		// wybrana linia
		var l = this.textLetters[line].letters;

		// następna linia
		var n_l = this.textLetters[line+1].letters;			

		var new_l = l.concat(n_l);

		text[line].letters = new_l;
		// petla przenoszaca linie ponizej o jeden poziom w górę

		for( var i = line+1; i < text.length; i++){

			text[i] = text[i+1];

		}

		var length = text.length;
		delete text[length-1];
		text.length--;

		this.textLetters = text;

		this._recalculateAllLines();

	};


	/**
	* Usuwa całą linię tekstu
	*
	* @method removeLine
	* @param {Integer} line Numer lini która ma zostać usunięta.
	* @private
	*/
	p._removeLine = function( line ){

		var text = this.textLetters;

		// lineToRemove
		var ltr = text[line];

		var textLength = text.length;

		for( var i=0; i < text[line].letters.length; i++ ){

			this.removeChild(text[line].letters[i]);

		}

		for( var i=line; i < textLength-1; i++ ){

			text[i] = text[i+1];

		}

		delete text[textLength];
		text.length--;

		this.textLetters = text;

		this._recalculateAllLines();

	};


	/**
	* Usuwa z lini litery w podanym przedziale
	*
	* @method removeLettersFromLine
	* @param {Integer} line Numer lini z której mają zostać .
	* @param {Integer} startLetter Numer litery od której ma zaczać usuwanie.
	* @param {Integer} stopLetter Numer litery do której ma usuwać tekst).
	* @private
	*/
	p._removeLettersFromLine = function( line, startLetter, stopLetter ){

		//line
		var l = this.textLetters[line].letters;

		if( stopLetter == null ) stopLetter = l.length-1;

		// newLine
		var nL = (l.slice(0, startLetter)).concat(l.slice(stopLetter+1, l.length));

		for( var i=0; i < l.length; i++){

			if( nL.indexOf(l[i]) == -1)
				this.removeChild( l[i] );

		}

		this.textLetters[line].letters = nL;

		this._recalculateLine( line );

	};


	/**
	* Zwraca caly kontent tekstu;
	*
	* @method _getContent
	*/
	p._getContent = function(){

		var content = {};

		for( var i=0; i<this.textLetters.length; i++){

			content[""+i] = { letters: [], lineHeight : this.textLetters[""+i].lineHeight };
			
			for( var letter=0; letter < this.textLetters[i].letters.length; letter++){
			
				content[""+i].letters.push( { letter: this.textLetters[i].letters[letter].text, font: this.textLetters[i].letters[letter].font, color : this.textLetters[i].letters[letter].color, italic : this.textLetters[i].letters[letter].italic, regular : this.textLetters[i].letters[letter].regular } );
			
			}
		
		}

		return content;

	};


	/**
	* Sprawdza czy wybrany tekst jest w  którymś miejscu zaznaczony;
	*
	* @method _textIsSelected
	*/
	p._textIsSelected = function(){

		if( this._selectedElements.startElement.line == this._selectedElements.stopElement.line && this._selectedElements.startElement.position == this._selectedElements.stopElement.position)
			return false;
		else 
			return true;		

	};


	/**
	* Generuje selecta z czcionkami, trzeba to wyciągnąć do obiektu tools -> tools.textToolBox( id, valueFor );
	*
	* @method _createFontSelect
	* @param {string} id Id elementu html
	* @param {Function} valueFor Funkcja obierająca jako argument otrzymaną wartość i odpowiednią ją modyfikująca
	*/
	p._createFontSelect = function( id, valueFor, textInstance ){

		var textInstance = textInstance;

		// div'owy selekt dla czcionek
		var selectBox = document.createElement("DIV");
		selectBox.id = id + "-box";
		selectBox.className = "select-box";
		var currentFont = document.createElement("SPAN");
		currentFont.id = "current-font";
		currentFont.innerHTML = "Aa";
		selectBox.appendChild( currentFont );
		var fakeSelect = document.createElement("DIV");
		fakeSelect.id = "select-font";
		selectBox.appendChild( fakeSelect );
		var fontOptions = document.createElement("DIV");
		fontOptions.id = id;
		fontOptions.className = "font-options";
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
		selectArrow.className = "select-arrow";

		selectArrow.addEventListener('click', function(e){

			e.stopPropagation();

			if( fontOptions.style.display == "none"){

				fontOptions.style.display = "block";
				selectArrow.className = selectArrow.className + " active";
				$("#"+ id).tinyscrollbar();

			}
			else {

				fontOptions.style.display = "none";
				selectArrow.className = "select-arrow";

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

				//_this.activeAvailableToolsForFont( this.getAttribute('id'))
				valueFor( this.id );


				if( textInstance ){

					var selected = textInstance._getSelectedLetters();

					for( var i=0; i < selected.length; i++ ){

						selected[i].font = textInstance.getSelectedFont();

					}

					_this._recalculateAllLines();
					_this._updateToolBox( _this._currentFontColor, _this._currentFontSize );

				}

			});

			fontScrollOverview.appendChild(option);

		}

		return selectBox;

	};


	p._updateAdminToolBox = function( func ){

		var values = func();

		$("#colorPicker").css("background-color", values.color );
		$("input#font-size").val( values.fontSize );
		$("#current-font").css( "font-family", values.fontFamily );



	};




	/**
	* Zwraca tablicę zaznaczonych liter
	*
	* @method removeLettersFromLine
	*/
	p._getSelectedLetters = function(){

		var tab = [];
		var startL = this._selectedElements.startElement.line;
		var stopL = this._selectedElements.stopElement.line;
		var startP = this._selectedElements.startElement.position;
		var stopP = this._selectedElements.stopElement.position;

		// litery z pozycji startowej
		if( (startL == stopL && startP < stopP) ){

			if( startL != stopL ){

				for( var i=startP; i < this.textLetters[startL].letters.length; i++ ){
				
					tab.push( this.textLetters[startL].letters[startP] );
			
				}
			
				for( var i=0; i < stopP; i++ ){
				
					tab.push( this.textLetters[stopL].letters[i] );
			
				}
				
				for( var i = startL+1; i < stopL; i++ ){
		
					for( var l=0; l < this.textLetters[i].length; l++ ){
				
						tab.push( this.textLetters[i].letters[l] );
				
					}
			
				}
		
			}
			else{

				for( var i=startP; i < stopP;i++ ){

						tab.push( this.textLetters[startL].letters[i]);

				}

			}

		}
		else {

			if( startL != stopL && startL < stopL ){

				for( var i=startP; i < this.textLetters[startL].letters.length; i++ ){
				
					tab.push( this.textLetters[startL].letters[i] );

				}

				for( var i=0; i < stopP; i++ ){

					tab.push( this.textLetters[stopL].letters[i] );

				}

				for( var i = startL+1; i < stopL; i++ ){

					for( var l=0; l < this.textLetters[i].letters.length; l++ ){

						tab.push( this.textLetters[i].letters[l] );

					}

				}

			}
			else{

				if( startL != stopL ){

					if(startL > stopL){

						for( var i=stopP; i < this.textLetters[stopL].letters.length; i++ ){
						
							tab.push( this.textLetters[stopL].letters[i] );

						}

						for( var i=0; i < startP; i++ ){

							tab.push( this.textLetters[startL].letters[i] );

						}

						for( var i = stopL+1; i < startL; i++ ){

							for( var l=0; l < this.textLetters[i].letters.length; l++ ){
							
								tab.push( this.textLetters[i].letters[l] );
							
							}
					
						}
					
					}
			
				}
				else {

					for( var i=stopP; i < startP; i++ ){

						tab.push( this.textLetters[stopL].letters[i] );

					}

				}

			}		

		}

		return tab;

	};


	/**
	* Ustawia kolor textu;
	*
	* @method removeLettersFromLine
	*/
	p.setTextColor = function( color ){

		if( this._textIsSelected() ){

			var letters = this._getSelectedLetters();

			for( var i=0; i < letters.length; i++){

				letters[i].color = color;

			}

		}
		else{

			//console.log("ustaw domyslny kolor");

		}

	};


	/**
	* Dodaje kolejną linię do tekstu.
	*
	* @method addLine
	* @param {Float} lineHeight Wysokość lini tekstu
	*/
	p.addLine = function( lineHeight ){

		var text = this.textLetters;
		text.push( { letters : [], width : 0, lineHeight : lineHeight } );

	};


	/**
	* Dodaje literę w konkretnym miejscu.
	*
	* @method addLetterInPosition
	* @param {Char} letter Dodawana litera
	* @param {Intiger} line Numer lini, do której ma zostać dodana nowa litera
	* @param {Intiger} position Pozycja, w której będzie dodana litera
	*/
	p.addLetterInPosition = function( letter, line, position ){

		this.setCursorPosition( line, position );
		this.addFullEditableLetter( letter, this._currentFontSize + "px " + this._currentFont, this._currentFontColor );
	
	};


	/**
	* Opisuje element na sposób HTML. Zwraca string reprezentujący HTML'owa strukturę
	*
	* @method HTMLoutput
	* @return {String} HTML Struktura opisująca obiekt
	*/
	p.HTMLoutput = function(){

		var HTML = "<li data-id='"+ this.id +"'><span class='li-button' data-id='" + this.id + "'><span class='visibility"+(( this.visible )? " active" : " un-active" )+"' data-id='"+this.id+"' data-base-id='" + this.dbId + "'></span><span class='image-miniature'><img src='textIcon.png'/></span><span class='object-name'>" + this.id + " " + this.name + "  </span><span class='locker"+((this.mouseEnabled)? " active" : " un-active" )+"'></span><span class='remover' data-id="+this.id+">x</span></span></li>";

		return HTML;

	};


	p.addLetter = function( letter ){
		
		this.text += letter;
	
		for( var key in this.textObjects){
	
			this.textObjects[key].text+= letter;
		
		}

	};

	p.saveToDB = function( project_id, layer_id ){
	
		var _this = this;
	
		$.ajax({

			url: 'https://api.digitalprint9.pro/adminProjects/'+project_id+'/adminProjectLayers/'+layer_id+'/adminProjectObjects',
			crossDomain: true,
			contentType: 'application/json',
			type: "POST",
			data: "{ \"name\" : \""+String( _this.name)+"\",\"typeID\" : \"5\" }",
			success: function( data ){

				_this.dbId = data.item.ID;
				Editor.updateLayers();
				var content = _this._getContent();
				_this.updateInDB("content", JSON.stringify( content ));

			},
			error : function(){

				alert('wystapil problem');

			}

		});

	};

	Editor.Text = Text;

})();