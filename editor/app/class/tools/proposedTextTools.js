(function(){


	/**
	* Klasa odpowiadająca za boks z narzędziami do tekstu proponowanego
	*
	* @class ProposedTextToolBox
	* @constructor
	*/
	function ProposedTextToolBox( proposedTextInstance, useType, tools, defaultValues ){

		this.useType = useType;

		this.proposedText = proposedTextInstance;
		this.boxes = {};


		//console.log("-----------------");
		//console.log( this.proposedText );
		//console.log("-----------------");

		if( tools == null )
			this.initAllTools();



	};

	var p = ProposedTextToolBox.prototype;

	p.constructor = ProposedTextToolBox;


	/**
	* Update'uje box, aktualizując przyciski ( dodaje klasy do zaznaczonych zmieniając ichg wygląd )
	*
	* @method _updateToolBox
	*/
	p._updateToolBox = function(){

		if( this.proposedText._useDefaultValues ){
			//this.proposedText.useDefaultValues();
			this.proposedText.updateTextWithDefaultValues();
		}

		for( var key in this.boxes ){

			$(this.boxes[key]).removeClass('active-tool');

		}

		var text = this.proposedText.text;
		var defaults = this.proposedText.defaultSettings;
		var boxes = this.boxes;

		// align buttons
		// admin
		if( defaults.align == "left" ){

			$( boxes.alignLeft_default ).addClass('active-tool');

		}
		else if( defaults.align == "center" ){

			$( boxes.alignCenter_default ).addClass('active-tool');

		}
		else if( defaults.align == "right" ){

			$( boxes.alignRight_default ).addClass('active-tool');

		}

		// user
		if( text._align == "left" ){

			$( boxes.alignLeft ).addClass('active-tool');

		}
		else if( text._align == "center" ){

			$( boxes.alignCenter ).addClass('active-tool');

		}
		else if( text._align == "right" ){

			$( boxes.alignRight ).addClass('active-tool');

		}
		// koniec align


		// update color input
		// admin
		$( boxes.color_default).css( "background-color", this.proposedText.defaultSettings.color );

		//user
		$( boxes.color ).css( "background-color", text._currentFontColor );


		// font size input
		// admin
		$( boxes.size_default ).val( this.proposedText.defaultSettings.size );

		//user
		$( boxes.size ).val( text._currentFontSize );


		//select box
		$( "#current-font-default" ).css({
			"fontFamily" : this.proposedText.defaultSettings.family + "_regular"
		});

	};


	p._updateToolsBoxPosition = function(){

		var tools = this.toolsContainer;

		if( this.useType =="admin" )
			var adminTools = $('#proposed-position-tool-admin');

		var toolSize = {

			width  : $(tools).innerWidth(),
			height : $(tools).innerHeight()

		};


		var pos = this.proposedText.getGlobalPosition();
		var stage = Editor.getStage();
		var bounds = this.proposedText.getTransformedBounds();

		$(tools).css({ top: pos[1] + (bounds.height/2)*stage.scaleY + toolSize.height/2 + 50, left: pos[0] - toolSize.width/2 });

		if( this.useType == "admin" ){

			var adminToolSize = {

				width  : adminTools.innerWidth(),
				height : adminTools.innerHeight()

			}

			adminTools.css({ top: pos[1] + (bounds.height/2)*stage.scaleY + 50 + toolSize.height + toolSize.height/2 + 10, left: pos[0] - adminToolSize.width/2 });

		}

	};



	p.changeInText = function(){

	};

	p.changeDefaults = function(){

	};


	p.initAllTools = function(){

		var tools = document.createElement("DIV");
		tools.id = "proposed-position-toolsbox";

		var adminTools = document.createElement("DIV");
		adminTools.className = "proposedTextTools-admin";

		var userTools = document.createElement("DIV");
		userTools.className = "proposedTextTools";


		userTools.appendChild( this.createColorTool() );
		userTools.appendChild( this.createFontSizeTool() );
		userTools.appendChild( this.createFontSelect() );
		userTools.appendChild( this.createLeftAlignTool() );
		userTools.appendChild( this.createCenterAlignTool() );
		userTools.appendChild( this.createRightAlignTool() );
		userTools.appendChild( this.createBackToDefaultTool() );

		tools.appendChild( userTools );


		adminTools.innerHTML = "Wartości domyślne<br>";
		adminTools.appendChild( this.createColorTool_default() );
		adminTools.appendChild( this.createFontSizeTool_default() );
		adminTools.appendChild( this.createFontSelect_default() );
		adminTools.appendChild( this.createLeftAlignTool_default() );
		adminTools.appendChild( this.createCenterAlignTool_default() );
		adminTools.appendChild( this.createRightAlignTool_default() );

		tools.appendChild( adminTools );


		document.body.appendChild( tools );


		this._updateToolBox();

		this.adminBox       = adminTools;
		this.userBox        = userTools;
		this.toolsContainer = tools;

	};


	p.appendTools = function( elem ){

		elem.append( this.toolsContainer );

	};


	p.createBackToDefaultTool = function(){

		var _this = this;
		var backToDefault = document.createElement("DIV");
		backToDefault.id = "back-to-default";
		backToDefault.innerHTML = "Przywróć ustawienia domyślne";

		backToDefault.addEventListener('click', function(){

			_this.proposedText._useDefaultValues = true;
			_this._updateToolBox();

		});

		return backToDefault;

	};


	p.createColorTool = function( ){

		var _this = this;

		var colorInput = document.createElement('INPUT');
		colorInput.id = "colorPicker";

		var col = new jscolor.color( colorInput );

		col.onImmediateChange = function(){

			_this.proposedText._useDefaultValues = false;
			_this.proposedText.text._currentFontColor = $("#colorPicker").css("background-color");
			_this._updateToolBox();

		};

		this.boxes.color = colorInput;

		return colorInput;

	};


	p.createColorTool_default = function(){

		var _this = this;

		var colorInput = document.createElement('INPUT');
		colorInput.id = "colorPicker-default";

		var col = new jscolor.color( colorInput );

		col.onImmediateChange = function(){

			_this.proposedText.defaultSettings.color = $("#colorPicker-default").css("background-color");
			_this._updateToolBox();

		};

		this.boxes.color_default = colorInput;

		return colorInput;

	};


	// tworzy przycisk justowania do lewej strony
	p.createLeftAlignTool = function( ){

		var _this = this;

		var alignLeft = document.createElement("SPAN");
		alignLeft.className = "text-align fot-align-left";

		alignLeft.addEventListener('click', function(){

			_this.proposedText._useDefaultValues = false;
			_this.proposedText.text._align = 'left';
			_this.proposedText.text._recalculateAllLines();
			_this._updateToolBox();

		});

		this.boxes.alignLeft = alignLeft;

		return alignLeft;

	};


	// tworzy przycisk justowania do lewej strony
	p.createLeftAlignTool_default = function( ){

		var _this = this;

		var alignLeft = document.createElement("SPAN");
		alignLeft.className = "text-align fot-align-left";

		alignLeft.addEventListener('click', function(){

			_this.proposedText.defaultSettings.align = 'left';
			_this._updateToolBox();

		});

		this.boxes.alignLeft_default = alignLeft;

		return alignLeft;

	};


	// tworzy przycisk justowania do środka
	p.createCenterAlignTool = function( ){

		var _this = this;

		var alignCenter = document.createElement("SPAN");
		alignCenter.className = "text-align fot-align-center";

		//alignCenter.addEventListener( 'click', this.proposedText.text.toolBoxButtonsFuction['alignCenter'] );

		alignCenter.addEventListener('click', function(){

			_this.proposedText._useDefaultValues = false;
			_this.proposedText.text._align = 'center';
			_this.proposedText.text._recalculateAllLines();
			_this._updateToolBox();

		});

		this.boxes.alignCenter = alignCenter;

		return alignCenter;

	};


	// tworzy przycisk justowania do środka
	p.createCenterAlignTool_default = function( ){

		var _this = this;

		var alignCenter = document.createElement("SPAN");
		alignCenter.className = "text-align fot-align-center";

		//alignCenter.addEventListener( 'click', this.proposedText.text.toolBoxButtonsFuction['alignCenter'] );

		alignCenter.addEventListener('click', function(){

			_this.proposedText.defaultSettings.align = 'center';
			_this._updateToolBox();

		});

		this.boxes.alignCenter_default = alignCenter;

		return alignCenter;

	};


	// tworzy przycisk justowania do prawej strony
	p.createRightAlignTool = function(){

		var _this = this;

		var alignRight = document.createElement("SPAN");
		alignRight.className = "text-align fot-align-right";

		//alignRight.addEventListener( 'click', this.proposedText.text.toolBoxButtonsFuction['alignRight'] );

		alignRight.addEventListener( 'click', function(){

			_this.proposedText._useDefaultValues = false;
			_this.proposedText.text._align = 'right';
			_this.proposedText.text._recalculateAllLines();
			_this._updateToolBox();

		});

		this.boxes.alignRight = alignRight;

		return alignRight;

	};


	// tworzy przycisk justowania do prawej strony
	p.createRightAlignTool_default = function(){

		var _this = this;

		var alignRight = document.createElement("SPAN");
		alignRight.className = "text-align fot-align-right";

		//alignRight.addEventListener( 'click', this.proposedText.text.toolBoxButtonsFuction['alignRight'] );

		alignRight.addEventListener( 'click', function(){

			_this.proposedText.defaultSettings.align = 'right';
			_this._updateToolBox();

		});

		this.boxes.alignRight_default = alignRight;

		return alignRight;

	};


	// tworzy input wielkosci tekstu
	p.createFontSizeTool = function(){

		var _this = this;

		var fontSizeInput = document.createElement('INPUT');
		fontSizeInput.id = "font-size";
		fontSizeInput.name = "font-size";

		/*
		fontSizeInput.onfocus = function(){

			if( textInstance )
				textInstance._blockKeys = true;

		};

		fontSizeInput.onblur = function(){

			if( textInstance )
				textinstance._blockKeys = false;

		};
		*/

		fontSizeInput.onchange = function(e){

			var selected = _this.proposedText.text._getSelectedLetters();
			_this.proposedText.text._currentFontSize = this.value;

			if( _this.useType == "admin")
				_this.defaultSettings.size = this.value;

			for( var i=0; i < selected.length; i++ ){

				var font = selected[i].font.split(" ")[1];
				selected[i].font = _this.proposedText.text._currentFontSize + "px " +font;

			}

			_this.proposedText._useDefaultValues = false;
			_this.proposedText.text._recalculateAllLines();

		};

		this.boxes.size = fontSizeInput;

		return fontSizeInput;

	};


	// tworzy input wielkosci tekstu
	p.createFontSizeTool_default = function(){

		var _this = this;

		var fontSizeInput = document.createElement('INPUT');
		fontSizeInput.id = "font-size-default";
		fontSizeInput.name = "font-size";

		/*
		fontSizeInput.onfocus = function(){

			if( textInstance )
				textInstance._blockKeys = true;

		};

		fontSizeInput.onblur = function(){

			if( textInstance )
				textinstance._blockKeys = false;

		};
		*/

		fontSizeInput.onchange = function(e){

			_this.proposedText.defaultSettings.size = parseInt( $( this ).val() );

		};

		this.boxes.size_default = fontSizeInput;

		return fontSizeInput;

	};


	// tworzy select z dostępnymi czcionkami
	p.createFontSelect_default = function(){

		var _this = this;

		// div'owy selekt dla czcionek
		var selectBox = document.createElement("DIV");
		selectBox.id = "select-box-default";
		selectBox.className = "select-box";
		var currentFont = document.createElement("SPAN");
		currentFont.id = "current-font-default";
		currentFont.innerHTML = "Aa";
		selectBox.appendChild( currentFont );
		var fakeSelect = document.createElement("DIV");
		fakeSelect.id = "select-font";
		selectBox.appendChild( fakeSelect );
		var fontOptions = document.createElement("DIV");
		fontOptions.id = "font-options-default";
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
				$("#font-options-default").tinyscrollbar();

			}
			else {

				fontOptions.style.display = "none";
				selectArrow.className = "select-arrow";

			}

		});


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

			option.className = "font-option " + ( ( this.proposedText.defaultSettings.family == font ) ? "active" : "" );
			option.style.fontFamily = font + "_regular";
			optionPreview.innerHTML = "A";
			optionName.innerHTML = font;
			option.appendChild( optionPreview );
			option.appendChild( optionName );

			option.addEventListener('click', function(){

				$(".font-option").removeClass("active");
				this.className = "font-option active";
				_this.proposedText.defaultSettings.family = this.id;
				document.getElementById("current-font-default").style.fontFamily =  this.id+"_regular";

			});

			fontScrollOverview.appendChild(option);

		}

		this.boxes.family_default = selectBox;

		return selectBox;

	};


	p.createFontSelect = function(){

		var _this = this;

		// div'owy selekt dla czcionek
		var selectBox = document.createElement("DIV");
		selectBox.id = "select-box";
		selectBox.className = "select-box";
		var currentFont = document.createElement("SPAN");
		currentFont.id = "current-font";
		currentFont.innerHTML = "Aa";
		selectBox.appendChild( currentFont );
		var fakeSelect = document.createElement("DIV");
		fakeSelect.id = "select-font";
		selectBox.appendChild( fakeSelect );
		var fontOptions = document.createElement("DIV");
		fontOptions.id = "font-options";
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
				$("#font-options").tinyscrollbar();

			}
			else {

				fontOptions.style.display = "none";
				selectArrow.className = "select-arrow";

			}

		});


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

			option.className = "font-option " + ( ( this.proposedText.defaultSettings.family == font ) ? "active" : "" );
			option.style.fontFamily = font + "_regular";
			optionPreview.innerHTML = "A";
			optionName.innerHTML = font;
			option.appendChild( optionPreview );
			option.appendChild( optionName );

			option.addEventListener('click', function(){

				$(".font-option").removeClass("active");
				this.className = "font-option active";

				_this.proposedText.text._currentFont = this.id;

				var selected = _this.proposedText.text._getSelectedLetters();

				for( var i=0; i < selected.length; i++ ){

					selected[i].font = _this.proposedText.text.getSelectedFont();

				}
				$("#current-font").css({ "fontFamily" : this.id + "_regular" })

				_this.proposedText.text._recalculateAllLines();
				_this.proposedText.text._updateToolBox( _this.proposedText.text._currentFontColor, _this.text._currentFontSize );

				document.getElementById("current-font").style.fontFamily =  this.id+"_regular";

			});

			fontScrollOverview.appendChild(option);

		}

		this.boxes.family = selectBox;

		return selectBox;

	};


	/**
	* Metoda usuwająca toolbox z narzędziami
	*
	* @method remove
	*
	*/
	p.remove = function(){

		$(this.toolsContainer).remove();

	};


	Editor.tools.ProposedTextToolBox = ProposedTextToolBox;

})();
