	/**
	 * Modul odpowiadajacy za zarządzanie czcionkami i ich plikami. Odwoływujemy sie za pomocą "Editor.fonts".
	 *
	 * @module Fonts
	 */
	export class fonts {


		constructor ( editor ) {

			this.editor = editor;
			this.fonts = {};
	        this.defaultFonts = [ 'Arial' ];
			this.tmp_fonts = {};
			this._fontsToUpload = {};

		}


		/**
		* Zwraca pierwszą, dopasowaną do parametrów czrzcionkę
		*
		* @method selectFont
		*/
        selectFont( family, regular, italic ){

            if( fonts[family] ){

                if( !regular && italic && fonts[family].FontTypes["BoldItalic"] )
                    return family+"_BoldItalic";
                else if( !regular && fonts[family].FontTypes["Bold"] )
                    return family+"_Bold";
                else if( italic && fonts[family].FontTypes["Italic"])
                    return family+"_Italic";
                else if( fonts[family].FontTypes["Regular"] )
                    return family+"_Regular";
                else
                    return "Arial";

            }
            else {

                return "Arial";

            }

        }


		/**
		* Ustawia podany obiekt jako informację o czcionkach.
		*
		* @method setFonts
		*/
		setFonts( _fonts ){
			fonts = _fonts;
		}


		/**
		* Zwraca informację o czcionkach
		*
		* @method getFonts
		*/
		getFonts(){

			return this.fonts;

		}

		checkFont( fontName ){

			if( this.fonts[fontName] ){

				if( this.fonts[ fontName ].FontTypes.Regular == '' &&
					this.fonts[ fontName ].FontTypes.Bold == '' &&
					this.fonts[ fontName ].FontTypes.BoldItalic == '' &&
					this.fonts[ fontName ].FontTypes.Italic == '' )
					return false;

				return true;

			}
			else {

				return false;

			}

		}

		waitForWebfonts(font, callback) {

			var loadedFonts = 0;

			var node = document.createElement('span');
			node.id = font;
			// Characters that vary significantly among different fonts
			node.innerHTML = '1234567890qweryuiop[mmmmnnnMMMMMNNNNNN!@#$%^&**() ABCDEFGHIJKłłąśśńżgiItT1WQy@!-/#.-Mm';
			// Visible - so we can measure it - but not on the screen
			node.style.position      = 'absolute';
			node.style.left          = '-10000px';
			node.style.top           = '-10000px';
			node.style.zIndex = -100;
			// Large font size makes even subtle changes obvious
			node.style.fontSize      = '300px';
			// Reset any font properties
			node.style.fontFamily    = 'fakeFont';
			node.style.fontVariant   = 'normal';
			node.style.fontStyle     = 'normal';
			node.style.fontWeight    = 'normal';
			node.className           = 'fonttester';
			node.style.letterSpacing = '0';
			document.body.appendChild(node);

			// Remember width with no applied web font
			var width = node.offsetWidth;

			node.style.fontFamily = font;

			var interval;

			function checkFont() {

				// Compare current width with original width
				if(node && node.offsetWidth != width) {
					++loadedFonts;
					node.parentNode.removeChild(node);
					node = null;

					//alert('zaladowana czcionka ' + font);
					clearInterval(interval);

					setTimeout( function(){

						callback( font );

					}, 500 );

					return true;

				}

			};

			if( !checkFont() ) {
				interval = setInterval( checkFont, 100 );
			}


		}

		addFontFile( fontName, callback ){

			var _this = this;
			//console.log('SPRAWDZAM DODANIE FONTA');
			if( !this.checkFont( fontName ) ){

				this.fonts[ fontName ] = {

					FontTypes : {

						Regular    : '',
						Bold       : '',
						Italic     : '',
						BoldItalic : ''

					},
					downloaded : false

				};

				this.editor.webSocketControllers.font.get( fontName, function( data ){

					_this.onGetFont( data, function( data ){

						//console.log( data );
						//console.log('FONT ZOSTAŁ DODANY :)');
						_this.fonts[ fontName ].downloaded = true;

						if( callback )
							callback( data );

					});

				});

			}else if( callback ){

				callback( true );
			}

		}

		/**
		* Funkcja zajmuje sie wczytywaniem plików czcionek.
		*
		* @method loadFonts
		*/
		loadFonts(){

			var Editor = this.editor;
			this.editor.webSocketControllers.font.getAll( function( data ){

	            var _fontsList = {}

	            Object.keys(data).sort().forEach(function(v, i) {
	              _fontsList[v] = data[v];

	            });

				Editor.newFonts = _fontsList;
				this.fonts = _fontsList;

				Editor.template.updateAvailableFontsBlock( _fontsList );

				for(var key in data){

					for( var fontType in data[key].FontTypes ){



						$("head").prepend("<style type=\"text/css\">" +
		                                "@font-face {\n" +
		                                    "\tfont-family: \""+ key +"_"+ fontType +"\";\n" +
		                                    "\tsrc: url("+ data[key].FontTypes[fontType].url+") format('truetype');\n" +
		                                "}\n" +
		        	                   "</style>");
						//data[key][fontType] = key +"_"+ fontType;

					}

				}

			}.bind( this ));


			/*

			$.ajax({
				url : config.getFrameworkUrl()+'/adminFonts',
				crossDomain: true,
				contentType: 'application/json',
				type: "GET",
				success : function( data ){
					fonts = data;
					for(var key in data){
						for( var fontType in data[key]){
							$("head").prepend("<style type=\"text/css\">" +
			                                "@font-face {\n" +
			                                    "\tfont-family: \""+ key +"_"+ fontType +"\";\n" +
			                                    "\tsrc: url("+ data[key][fontType]+") format('truetype');\n" +
			                                "}\n" +
			        	                   "</style>");
							data[key][fontType] = key +"_"+ fontType;

						}

					}

				}

			});
			*/

		}


		addTmpFont( name ){
			if( !this._fontsToUpload[name] )
				this._fontsToUpload[name] = {};
		}


		addTmpFontType( name, type, file ){
			this._fontsToUpload[name][type] = file;
		}


		loadTmpFont( name ){
			for( var fontType in this._fontsToUpload[name] ){
				$("head").prepend("<style type=\"text/css\">" +
	                "@font-face {\n" +
	                    "\tfont-family: \""+ name +"_"+ fontType +"\";\n" +
	                    "\tsrc: url("+ this._fontsToUpload[name][fontType]+") format('truetype');\n" +
	                "}\n" +
	               "</style>");
			}

		};


		fontLoader( dropBox, outputBox ){
			var _obj = this;
			dropBox.addEventListener('dragover', function(e){
				e.stopPropagation();
				e.preventDefault();
				e.dataTransfer.dropEffect = 'copy';

				if( this.className != 'fontDrop droped')
					this.className = 'fontDrop dragover';


			}, false);

			dropBox.addEventListener('dragleave', function( e ){

				e.stopPropagation();

				if( this.className != 'fontDrop droped')
					this.className = 'fontDrop';

			});

			dropBox.addEventListener('dragend', function( e ){

				e.stopPropagation();

				if( this.className != 'fontDrop droped')
					this.className = 'fontDrop';

			});

			dropBox.addEventListener('drop', function(e){

				var name = document.getElementById("fontName").value;

				if( name == "" ){

					alert("Podaj nazwę czcionki!");
					this.className = 'fontDrop';
					e.stopPropagation();
					e.preventDefault();
					return false;

				}

				this.className = 'fontDrop droped';

				var _this = this;
				e.stopPropagation();
				e.preventDefault();
				//Editor.handleFileSelect(e, 2);

				outputBox.innerHTML = "Aa";
				var file = new FileReader();
				file.readAsDataURL( e.dataTransfer.files[0] );

				file.onload = function( freader ){

					_obj.addTmpFont( name );
					_obj.addTmpFontType( name, _this.getAttribute("data-type"), freader.target.result );
					_obj.loadTmpFont( name);
					outputBox.style.fontFamily = _this.style.fontFamily = name +"_" + _this.getAttribute("data-type");

				};

			});

		}


		/**
		* Wyświetla box dodający czcionki.
		*
		* @method addFontBox
		*/
		addFontBox(){

			this._fontsToUpload = {};
			var width = window.innerWidth;
			var height = window.innerHeight;

			var boxOverflow = document.createElement("DIV");
			boxOverflow.id = "overflow-box";
			boxOverflow.style.width ="100%";
			boxOverflow.style.height = "100%";
			boxOverflow.style.position = "absolute";
			boxOverflow.style.top = "0px";
			boxOverflow.style.left = "0px";
			boxOverflow.style.zIndex = "2000";
			boxOverflow.style.backgroundColor = "rgba(121, 121, 121, 0.8)";

			var box = document.createElement("DIV");
			box.id = "fontBox";

			var fontName = document.createElement("INPUT");
			fontName.id = "fontName";
			fontName.type = "text";

			var fontDrop1 = document.createElement("DIV");
			fontDrop1.id = 'fontDrop1';
			fontDrop1.dataset.font = "fontFile_Regular";
			fontDrop1.dataset.type = "Regular";
			fontDrop1.className = "fontDrop";
			fontDrop1.innerHTML = "<h3>Regular</h3>Aby wgrać czcionkę, przeciągnij i upuść tutaj odpowiedni plik.";
			var fontBlockR = document.createElement("DIV");
			fontBlockR.className = "font-block";
			var fontFile_Regular = document.createElement("DIV");
			fontFile_Regular.id = "fontFile_Regular";
			fontFile_Regular.className = "font-loader";

			fontFile_Regular.ondrop = function( e ){

				e.stopPropagation();

			};



			fontBlockR.appendChild( fontFile_Regular );
			fontBlockR.appendChild( fontDrop1 );

			var fontBlockRegularItalic = document.createElement("DIV");
			fontBlockRegularItalic.className = "font-block";
			var fontFile_RegularItalic = document.createElement("DIV");
			fontFile_RegularItalic.id = "fontFile_italic";
			fontFile_RegularItalic.className = "font-loader";
			var fontDrop = document.createElement("DIV");
			fontDrop.dataset.font = "fontFile_italic";
			fontDrop.className = "fontDrop";
			fontDrop.dataset.type = "Italic";

			fontDrop.innerHTML = "<h3>Italic</h3>Aby wgrać czcionkę, przeciągnij i upuść tutaj odpowiedni plik.";
			fontBlockRegularItalic.appendChild( fontFile_RegularItalic );
			fontBlockRegularItalic.appendChild( fontDrop );


			var fontBlockB = document.createElement("DIV");
			fontBlockB.className = "font-block";
			var fontFile_Bold = document.createElement("DIV");
			fontFile_Bold.id = "fontFile_bold";
			fontFile_Bold.className = "font-loader";
			fontBlockB.appendChild( fontFile_Bold );
			var fontDrop2 = document.createElement("DIV");
			fontDrop2.dataset.font = "fontFile_Bold";
			fontDrop2.className = "fontDrop";
			fontDrop2.dataset.type = "Bold";
			fontDrop2.innerHTML = "<h3>Bold</h3>Aby wgrać czcionkę, przeciągnij i upuść tutaj odpowiedni plik.";
			fontBlockB.appendChild( fontDrop2 );



			var fontBlockBI = document.createElement("DIV");
			fontBlockBI.className = "font-block";
			var fontFile_BoldItalic = document.createElement("DIV");
			fontFile_BoldItalic.id = "fontFile_boldItalic";
			fontFile_BoldItalic.className = "font-loader";
			var fontDrop3 = document.createElement("DIV");
			fontDrop3.dataset.font = "fontFile_BoldItalic";
			fontDrop3.className = "fontDrop";
			fontDrop3.dataset.type = "BoldItalic";
			fontDrop3.innerHTML = "<h3>BoldItalic</h3>Aby wgrać czcionkę, przeciągnij i upuść tutaj odpowiedni plik.";
			fontBlockBI.appendChild( fontFile_BoldItalic );
			fontBlockBI.appendChild( fontDrop3 );


			var addFontButton = document.createElement("SPAN");
			addFontButton.id = "add-font-button";
			addFontButton.innerHTML = "Dodaj czcionkę";
			addFontButton.addEventListener( 'click', function(){
				this.uploadFontFile( function(){

					$("#fontBox, #overflow-box").animate({opacity: 0.}, 1000, function(){ $("#fontBox, #overflow-box").remove(); });

				});
			}.bind(this));

			box.innerHTML = "Nazwa czcionki: ";
			box.appendChild( fontName );
			box.appendChild( fontBlockR );
			box.appendChild( fontBlockRegularItalic );
			box.appendChild( fontBlockB );
			box.appendChild( fontBlockBI );
			box.appendChild( addFontButton );

			box.addEventListener("scroll", function( e ){
				//console.log(e);
			});

			boxOverflow.appendChild( box );

			var remover = document.createElement('div');
			remover.className = 'remover';
			remover.addEventListener('click', function( e ){

				e.stopPropagation();
				$(boxOverflow).remove();

			});

			boxOverflow.appendChild( remover );

			document.body.appendChild( boxOverflow );

			var width2 = 500;
			box.style.left = ( width - width2 )/2 + "px";
			box.style.top = ( height - 470 )/2 + "px";
			box.style.position = 'fixed';
			box.style.width = width2 + 'px';
			this.fontLoader( fontDrop1, fontFile_Regular);
			this.fontLoader( fontDrop3, fontFile_BoldItalic );
			this.fontLoader( fontDrop2, fontFile_Bold);
			this.fontLoader( fontDrop, fontFile_RegularItalic);

		}


		/**
		* Funkcja zajmująca sie uplodwaniem pliku czcionki.
		*
		* @method uploadFontFile
		* @param {string} name Nazwa czcionki
		* @param {string} type Typ czcionki (bold, boldItalic itp)
		* @param {file} file Plik czcionki do wgrania
		* @private
		*/
		uploadFontFile( callback ){

			var test = this._fontsToUpload;
			var miniature = this.generatePrev( document.getElementById("fontName").value );
			test[ document.getElementById("fontName").value ].miniature = miniature;
			//test = JSON.stringify( test );

			this.editor.webSocketControllers.font.add( test );
			this._fontsToUpload = {};

		};


		generatePrev( fontName ){

			var fontCanvas = document.createElement('canvas');
			fontCanvas.id = 'fontCanvas';
			fontCanvas.width = '50';
			fontCanvas.height = '50';

			document.body.appendChild( fontCanvas );

			var fontStage = new createjs.Stage("fontCanvas");

			var textObject = new createjs.Text('Aa', "50px " +fontName+ "_Regular", "#000" );
			textObject.textBaseline = "alphabetic";
			textObject.lineHeight = '60';


			var bounds =  textObject.getTransformedBounds();

			if( bounds.width > bounds.height ){

				fontCanvas.width = bounds.width;
				fontCanvas.height = bounds.width;

				var centerPosY = (fontCanvas.height - bounds.height)/2 + bounds.height;

				textObject.y = centerPosY;

			}else {

				fontCanvas.width = bounds.height;
				fontCanvas.height = bounds.height;

				var centerPosX = (fontCanvas.width - bounds.width)/2;

				var centerPosY = bounds.height;

				textObject.y = centerPosY/1.2;
				textObject.x = centerPosX;

			}

			fontStage.addChild( textObject );

			fontStage.update();

			var miniature = fontStage.toDataURL();

			$( fontCanvas ).remove();

			return miniature;

		}


		getFontOptions( fontName ){

			var font = this.fonts[ fontName ];

			var options = {

				italic : 0,
				bold : 0,
				boldItalic : 0

			};

			//console.log( fontName );
			//console.log( font );

			if( font ){

				//console.log( font );

				if( font.FontTypes.Bold != '' && font.FontTypes.Bold ){

					options.bold = 1;

				}

				if( font.FontTypes.Italic != '' && font.FontTypes.Italic ){

					options.italic = 1;

				}

				if( font.FontTypes.BoldItalic != '' && font.FontTypes.BoldItalic ){

					options.boldItalic = 1;

				}

			}

			return options;

		}

	}
