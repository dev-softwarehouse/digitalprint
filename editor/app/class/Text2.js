import {EditorObject} from './EditorObject';
import {TextLine} from './TextLine';
import {TextLetter} from './TextLetter';
import {Keyboard} from './tools/keyboard';
import _ from 'lodash';
import EditorShadow2 from "./EditorShadow2";
import React from "react";
import ReactDOM from "react-dom";
import {store} from "../ReactSetup";
import TextTool from './tools/textTools_user2';
import { Provider } from 'react-redux'
// import TextTool from "././tools/textTools_user2";

if( EDITOR_ENV.user ){
    //var TextTool = require('././tools/textTools_user2').TextTool;
    var TextExtend = require('./Text2_user').Text2;
}else {
    // var TextTool = require('././tools/textTools_admin').TextTool;
    var TextExtend = require('./Text2_admin').Text2;
}

	if (!Array.prototype.filter)
	{
	  Array.prototype.filter = function(fun /*, thisp*/)
	  {
	    var len = this.length;
	    if (typeof fun != "function")
	      throw new TypeError();

	    var res = new Array();
	    var thisp = arguments[1];

	    for (var i = 0; i < len; i++)
	    {
	      if (i in this)
	      {
	        var val = this[i]; // in case fun mutates this
	        if (fun.call(thisp, val, i, this))
	          res.push(val);
	      }
	    }

	    return res;

	  };

	}


	/**
	* Klasa odpowiadająca za edycję tekstu, dziedziczy po EditorObject
    * <h3>Scenariusze i funkcje z nimi połączone</h3>
    * <h4>Dodanie litery</h4>
    * <ul>
    * <li>dodanie litery</li>
    * <li>aktualizacja wielkości lini</li>
    * <li>aktualizacja rozmiarów obiektu ( Text )</li>
    * <li>aktualizacja obiektów graficznych ( border itp )</li>
    * <li>aktualizacja narzędzi Editor.tools</li>
    * </ul>
    * <h4>Usunięcie litery</h4>
    * <ul>
    * <li>usunięcie litery</li>
    * <li>aktualizacja wielkości lini</li>
    * <li>aktualizacja rozmiarów obiektu ( Text )</li>
    * <li>aktualizacja obiektów graficznych ( border itp )</li>
    * <li>aktualizacja narzędzi Editor.tools</li>
    * </ul>
    * <h4>Kopiowanie tekstu</h4>
    * <ul>
    * <li>klonowanie zaznaczonego tekstu do bufora Editor.clipboardData</li>
    * </ul>
    * <h4>Wklejanie tekstu</h4>
    * <ul>
    * <li>sprawdzenie bufora Editor.clipboardData</li>
    * <li>złamanie lini z kursorem</li>
    * <li><b>dodawane liter</b> na końcu złamanej lini</li>
    * <li>aktualizacja rozmiaru lini</li>
    * <li>aktualizacja rozmiarów obiektu ( Text )</li>
    * <li>aktualizacja obiektów graficznych ( border itp )</li>
    * <li>aktualizacja narzędzi Editor.tools</li>
    * </ul>
    * <h4>Zmiana rozmiaru szerokości tekstu</h4>
    * <ul>
    * <li>przeliczenie pozycji liter we wszystkich liniach</li>
    * <li>aktualizacjia romiarów wszystkich lini</li>
    * <li>aktualizacja obiektów graficznych tekstu</li>
    * <li>aktualizacja narzędzie Editor.tools</li>
    * </ul>
	*
    * Zmiany :<br>
    * należy zmienić wyświetlanie compound boksów, powinny być wyyświetlane razem z obiektem compoundBox z Editor.tools na samej górze
    * @class Text2
    * @constructor
    */

    function Text2( name, width, height, empty, initEvents ){

        var _this = this;
        EditorObject.call( this, initEvents );

        this.initAllEvents = initEvents;
        this.autoSize = false;
        //var height = lineHeight*1.2;
        this._cursorPosition = null;
        this.isProposedPosition = false;
        this.lines = [];
        this.regX = width/2;
        this.regY = height/2;
        this.width = this.trueWidth = width;
        this.height = this.trueHeight = height;
        this.socketController = 'editorText';
        this.minWidth = 10;
        this.minFontSize = 1;
        this.maxFontSize = 20;
        this.shadowUglify = 0.75;
        this.userFontSizeLineHeightAspect = null;
        this.defaultFontAspect = 1.5;
        this.defaultText = 'Dodaj tekst';

        this.padding = {

            top    : 0,
            bottom : 0,
            left   : 0,
            right  : 0

        };

        this.defaultSettings = {

            size       : 8,
            color      : '#000000',
            align      : 'left',
            family     : 'Arial',
            type       : { regular : 1, italic : 0 },
            lineHeight : 8*1.5

        };

        this.addEventListener('mouseover', function(e){

            e.stopPropagation();
            //_this.border.visible = true;

        });

        this.toolsType = 'text';
        this.type = "Text2";

        this.customSize = false;

        this.selection = {

            firstLetter : 0,
            startLine : 0

        };

        this.cursorMap = [];
        this.snapToPixel = true;
        this.widthUpdate = false;

        /**
        * Aktualnie wybrana czionka.
        *
        * @property _currentFont
        * @type {String}
        * @default "Arial"
        * @private
        */
        this._currentFontFamily = "Arial";
        this._currentFontType = { regular : 1, italic : 0};

        this._currentLineHeight = this.defaultSettings.lineHeight;
        this.backgroundColor = "#fff";
        /**
        * Aktualny rozmiar czcionki.
        *
        * @property _currentFontSize
        * @type {integer}
        * @default "30"
        * @private
        */
        this._currentFontSize = 8;

        // to można bty wrzucic do osobnej klasy ktora da mozliwosci wybierania różnych kolorów tła
        this.backgroundShape = new createjs.Shape();
        this.backgroundShape.visible = false;
        this.addChild( this.backgroundShape );
        this.backgroundShape.visible = true;
        //this.backgroundShape.graphics.f('#000').r( 0, 0, this.trueWidth, this.trueHeight );

        /**
        * Aktualny kolor czcionki.
        *
        * @property _currentFontColor
        * @type {String}
        * @default "#f00"
        * @private
        */
        this._currentFontColor = "#000";


        /**
        * Obiekty kompozycyjjne obiektu tekstu.
        *
        * @property composedObjects
        * @type {Object}
        */
        this.composedObjects = {

            top: [],
            bottom: []

        };

        this._useDefaultValues = true;

        this._align='left'

        this.lineHeight = this._currentFontSize * this.defaultFontAspect;

        this._selected = [];

        this.cursor = 'pointer';

        this.initTextEvents();

	};


	var p = Text2.prototype = $.extend( true, Object.create( createjs.Container.prototype ), Object.create( TextExtend.prototype ), Object.create( EditorObject.prototype ) );


    p.constructor = Text2;


    /**
	* Zmienia aktualne ustawienia na domyślne, kolejne dodawane litery będą korzystały z wartości domyślnych aż do czasu ręcznej zmiany ustawień
	*
	* @method useDefaultValues
	*/
    p.useDefaultValues = function(){

		this._currentFont      = this.defaultSettings.family;
		this._currentFontSize  = this.defaultSettings.size;
		this._currentFontColor = this.defaultSettings.color;
		this._currentFontType  = this.defaultSettings.type;
		this._align            = this.defaultSettings.align;

	};

    p.getAllLettersCount = function(){

        var lettersCount = 0;

        for( var i=0; i < this.lines.length; i++ ){

            lettersCount += this.lines[i].letters;

        }

        return lettersCount;

    };

    p.removeAllLetters = function(){


        for( var i=0; i < this.lines.length; i++ ){

            this.lines[i].removeAllLetters();

        }

        this.updateText({}, true );

        this.defaultTextVisible = false;

    };

    p.displayDefaultText = function(){

        this.defaultTextVisible = true;

        var _line = this.lines[0];
        _line.uncache();

        for( var letter=0; letter < this.defaultText.length; letter++ ){

            var _letter = new TextLetter(

                this.defaultText[letter],
                this._currentFontFamily,
                this._currentFontSize,
                this._currentFontColor,
                this._currentLineHeight,
                this._currentFontType.regular,
                this._currentFontType.italic,
                this.editor

            );

            _line.addCreatedLetter( _letter );

        }

        //this.getCompoundObjectByName('shapeBorder').visible = false;
        this.updateText({}, true );

    };

    p.setHorizontalPadding = function( value ){

        this.horizontalPadding=this.padding.left = this.padding.right = value;

        for( var i=0; i < this.lines.length; i++ ){

            this.lines[i].x = this.padding.left;
            this.lines[i].maxWidth = this.trueWidth - this.padding.left - this.padding.right;

        }

        this.updateText({
            lettersPositions : true,
            linesPosition    : true,
            save             : true
        });
        this.dispatchEvent( "resize" );
        this.editor.tools.init();

    };

    p.setVerticalPadding = function( value ){

        this.verticalPadding=this.padding.top = this.padding.bottom = value;

        this.updateText({

            lettersPositions : true,
            linesPosition    : true,
            save             : true

        });

    };

    p.selectAll = function(){

        this.selection.firstLetter = 0;//--this.lines[0].getChildIndex( this.lines[0].lettersObjects[0] );
        this.selection.startLine   = 0;
        this.selection.lastLetter  = this.lines[this.lines.length-1].getChildIndex( this.lines[ this.lines.length-1].lettersObjects[ this.lines[ this.lines.length-1].lettersObjects.length-1 ] );
        this.selection.stopLine    = this.lines.length-1;
        this.displaySelectedLetter();

    }

    p.collectFontsFamily = function(){

        var fonts = [];

        for( var i=0 ; i < this.lines.length; i++ ){

            var line = this.lines[i];

            for( var l=0; l < line.lettersObjects.length; l++ ){

                var letter = line.lettersObjects[l];
                var fontFamily = this.editor.fonts.selectFont( letter.fontFamily, letter.fontType.regular, letter.fontType.italic );

                if( fonts.indexOf( fontFamily ) < 0 ){

                    fonts.push( fontFamily );

                }

            }

        }

        return fonts;

    };


    // co w tekscie wymaga aktualizacji:
    // - aktualizacja wielkości boksu opisującego tekst
    // - aktualizacja liter ( wielkość,kolor, font )
    // - aktualizacja pozycji liter
    // - aktualizacja pozycji lini
    // - aktualizacja tła
    // - aktualizacja ramki
    p.updateText = function( toUpdate, all ){

        if( toUpdate.box || all ){

        }

        if( toUpdate.letters || all ){

            if( userType == 'user' || userType == 'advancedUser' ){

                if( toUpdate.letters || all ){

                    if( this.autoSize ){

                        this.updateSelectedFont();

                        this.updateAllLetters();

                    }else {

                        if( toUpdate.letters ){

                            if( toUpdate.letters.font || toUpdate.letters.all || all )
                            this.updateSelectedFont();

                            if( toUpdate.letters.size || toUpdate.letters.all || all )
                            this.updateSelectedSize();

                            if( toUpdate.letters.color || toUpdate.letters.all || all )
                            this.updateSelectedColor();
                        }else {

                            this.updateSelectedFont();


                        }

                    }


                }

            }else {

                if( toUpdate.letters ){
                    if( toUpdate.letters.font || toUpdate.letters.all )
                        this.updateSelectedFont();

                    if( toUpdate.letters.size || toUpdate.letters.all )
                        this.updateSelectedSize();

                    if( toUpdate.letters.color || toUpdate.letters.all )
                        this.updateSelectedColor();
                }

            }

        }

        if( toUpdate.lettersPositions || all ){

            for( var i=0; i < this.lines.length; i++){

                var line = this.lines[i];
                line.setMaxWidth( this.trueWidth -this.padding.left- this.padding.right );
                line.linesInfo();
                line.complexRecalculate();
        		line.updateBoundsAndHitArea();

            }

        }

        if( toUpdate.linesPosition || all ){

            if( userType == 'admin' || userType == 'advancedUser'){

                //this.verticalCenter();
                this.recalculateLinePositions( this.padding.top );

            }
            else {

                this.recalculateLinePositions( this.padding.top );

            }

        }

        if( toUpdate.background || all ){

        }

        if( toUpdate.border || all ){

        }

        this.generateCursorMap();
        //this.setCursor( this._cursorPosition );
        if( this.getTextHeight() > this.trueHeight && this._currentFontSize > this.minFontSize ){

            if( this.autoSize ){

                this._currentFontSize--;
                this.updateText( {}, true );

            }

        }else {

            if( this.autoSize ){

                if( this._currentFontSize+1 <= this.maxFontSize ){

                    var testHeight = this.getTextHeightWithFontSize( this._currentFontSize+1);

                    if( testHeight <= this.trueHeight ){

                        this._currentFontSize++;
                        this.updateAllLetters();
                        this.generateCursorMap();
                        this.updateText({ maximizeFontSize : true });

                    }

                }

            }

        }

    };

    p.clearPadding = function(){

        if( this.horizontalPaddingLeft ){

            this.removeChild( this.horizontalPaddingLeft );
            this.horizontalPaddingLeft = null;

        }

        if( this.horizontalPaddingRight ){

            this.removeChild( this.horizontalPaddingRight );
            this.horizontalPaddingRight = null;

        }

        if( this.horizontalPaddingTop ){

            this.removeChild( this.horizontalPaddingTop );
            this.horizontalPaddingTop = null;

        }

        if( this.horizontalPaddingBottom ){

            this.removeChild( this.horizontalPaddingBottom );
            this.horizontalPaddingBottom = null;

        }

    };


    p.clearVertical = function(){

        if( this.horizontalPaddingTop ){

            this.removeChild( this.horizontalPaddingTop );
            this.horizontalPaddingTop = null;

        }

        if( this.horizontalPaddingBottom ){

            this.removeChild( this.horizontalPaddingBottom );
            this.horizontalPaddingBottom = null;

        }

    }

    p.clearHorizontal = function(){

        if( this.horizontalPaddingLeft ){

            this.removeChild( this.horizontalPaddingLeft );
            this.horizontalPaddingLeft = null;

        }

        if( this.horizontalPaddingRight ){

            this.removeChild( this.horizontalPaddingRight );
            this.horizontalPaddingRight = null;

        }

    }

    p.drawHorizontal = function(){
        var paddingColor = 'rgba(0, 0, 0, 0.23)';

        if( !this.horizontalPaddingLeft ){

            this.horizontalPaddingLeft = new createjs.Shape();
            this.horizontalPaddingLeft.graphics.c().f(paddingColor).r( 0,0, this.padding.left, this.trueHeight );
            this.addChild( this.horizontalPaddingLeft );

        }else {

            this.horizontalPaddingLeft.graphics.c().f(paddingColor).r( 0,0, this.padding.left, this.trueHeight );

        }

        if( !this.horizontalPaddingRight ){

            this.horizontalPaddingRight = new createjs.Shape();
            this.horizontalPaddingRight.graphics.c().f(paddingColor).r( this.trueWidth - this.padding.right, 0, this.padding.right, this.trueHeight );
            this.addChild( this.horizontalPaddingRight );

        }else {

            this.horizontalPaddingRight.graphics.c().f(paddingColor).r( this.trueWidth - this.padding.right, 0, this.padding.right, this.trueHeight );

        }
    }

    p.drawVertical = function(){
        var paddingColor = 'rgba(0, 0, 0, 0.23)';

        if( !this.horizontalPaddingTop ){

            this.horizontalPaddingTop = new createjs.Shape();
            this.horizontalPaddingTop.graphics.c().f(paddingColor).r( 0, 0, this.trueWidth, this.padding.top );
            this.addChild( this.horizontalPaddingTop );

        }else {

            this.horizontalPaddingTop.graphics.c().f(paddingColor).r( 0, 0, this.trueWidth, this.padding.top );

        }

        if( !this.horizontalPaddingBottom ){

            this.horizontalPaddingBottom = new createjs.Shape();
            this.horizontalPaddingBottom.graphics.c().f(paddingColor).r( 0, this.trueHeight-this.padding.bottom, this.trueWidth, this.padding.bottom );
            this.addChild( this.horizontalPaddingBottom );

        }else {

            this.horizontalPaddingBottom.graphics.c().f(paddingColor).r( 0, this.trueHeight-this.padding.bottom, this.trueWidth, this.padding.bottom );

        }

    }

    p.drawPadding = function(){

        var paddingColor = 'rgba(0, 0, 0, 0.23)';

        if( !this.horizontalPaddingLeft ){

            this.horizontalPaddingLeft = new createjs.Shape();
            this.horizontalPaddingLeft.graphics.c().f(paddingColor).r( 0,0, this.padding.left, this.trueHeight );
            this.addChild( this.horizontalPaddingLeft );

        }else {

            this.horizontalPaddingLeft.graphics.c().f(paddingColor).r( 0,0, this.padding.left, this.trueHeight );

        }

        if( !this.horizontalPaddingRight ){

            this.horizontalPaddingRight = new createjs.Shape();
            this.horizontalPaddingRight.graphics.c().f(paddingColor).r( this.trueWidth - this.padding.right, 0, this.padding.right, this.trueHeight );
            this.addChild( this.horizontalPaddingRight );

        }else {

            this.horizontalPaddingRight.graphics.c().f(paddingColor).r( this.trueWidth - this.padding.right, 0, this.padding.right, this.trueHeight );

        }

        if( !this.horizontalPaddingTop ){

            this.horizontalPaddingTop = new createjs.Shape();
            this.horizontalPaddingTop.graphics.c().f(paddingColor).r( 0, 0, this.trueWidth, this.padding.top );
            this.addChild( this.horizontalPaddingTop );

        }else {

            this.horizontalPaddingTop.graphics.c().f(paddingColor).r( 0, 0, this.trueWidth, this.padding.top );

        }

        if( !this.horizontalPaddingBottom ){

            this.horizontalPaddingBottom = new createjs.Shape();
            this.horizontalPaddingBottom.graphics.c().f(paddingColor).r( 0, this.trueHeight-this.padding.bottom, this.trueWidth, this.padding.bottom );
            this.addChild( this.horizontalPaddingBottom );

        }else {

            this.horizontalPaddingBottom.graphics.c().f(paddingColor).r( 0, this.trueHeight-this.padding.bottom, this.trueWidth, this.padding.bottom );

        }


    };

    // trzeba napisac jedna funkcje ktora zajmiesie updatem tekstu, jest ich za duzo w tymmomencie i mozna sie pogubic

    p.getTextHeightWithFontSize = function( fontSize ){

        var currentFontSize = this._currentFontSize;
        var aspect = currentFontSize/fontSize;

        var linesCount = 0;
        var maxOneLineWidth = this.trueWidth - this.padding.left - this.padding.right;
        var textHeightWithoutPadding = 0;

        for( var i=0; i < this.lines.length; i++ ){

            var line = this.lines[i];

            for( var key in line.linesInfo_Object ){

                //var newLineWidth = line.linesInfo_Object[key].linewidth / aspect;

                var newLineWidth = 0;

                for( var lett = line.linesInfo_Object[key].firstLetter; lett <= line.linesInfo_Object[key].lastLetter; lett++ ){

                    var letter = line.lettersObjects[lett];
                    newLineWidth += Math.ceil( letter.width/aspect );

                }

                linesCount += Math.ceil( newLineWidth / maxOneLineWidth);

            }

            textHeightWithoutPadding += line.lineHeight*linesCount / aspect;

            //alert( Math.ceil( newLineWidth / maxOneLineWidth) );

        }

        return textHeightWithoutPadding + this.padding.top + this.padding.bottom;

    };

    p.setBackgroundAlpha = function( alphaValue ){

        this.backgroundShape.alpha = alphaValue;

    };

    p.getBackgroundAlpha = function(){

        return this.backgroundShape.alpha;

    };

    p.setBackgroundColor = function( color ){

        this.backgroundColor = color;
        this.backgroundShape.graphics.c().f( color ).r( 0, 0, this.trueWidth, this.trueHeight );

    };

    p.initTextEvents = function(){

        var _this = this;
        var Editor = this.editor;
        this.addEventListener('mousedown', function( e ){

            e.stopPropagation();

            if( userType == 'advancedUser'){

                if( !_this.textToolTarget ){

                    _this.textToolTarget=document.createElement('div');
                    document.body.appendChild(_this.textToolTarget);
                    ReactDOM.render( <Provider store={store}><TextTool textInstance={_this} advanced/></Provider>, _this.textToolTarget);

                }

            }

        });

    };


    p.toLayerHTML = function(){

        var _this = this;

        var layerElem = document.createElement('li');
        layerElem.addEventListener('click', function( e ){

            e.stopPropagation();

        });

        var layerVisibility = document.createElement('span');
        layerVisibility.className = 'objectVisibility ' + ( ( this.visible ) ? 'visible' : 'notvisible' );

        layerVisibility.addEventListener('click', function( e ){

            e.stopPropagation();

            if( _this.visible ){

                _this.visible = false;
                layerVisibility.className = 'objectVisibility ' + ( ( _this.visible ) ? 'visible' : 'notvisible' );

            }
            else {

                _this.visible = true;
                layerVisibility.className = 'objectVisibility ' + ( ( _this.visible ) ? 'visible' : 'notvisible' );

            }

        });

        var miniature = document.createElement('span');
        miniature.className = 'objectMiniature';
        miniature.innerHTML = 'T';

        var remover = document.createElement('span');
        remover.className = 'objectRemove';
        remover.setAttribute('object-id', this.dbID );

        remover.addEventListener('click', function( e ){

            e.stopPropagation();

            Editor.webSocketControllers.adminView.removeText( Editor.adminProject.format.view.getId(), this.getAttribute('object-id') );
            // Editor.webSocketControllers.editorBitmap.remove( this.getAttribute('object-id'), Editor.adminProject.format.view.getId() );

        });

        miniature.appendChild( remover );

        var layerElemTitle = document.createElement('span');
        layerElemTitle.className = 'objectName';
        layerElemTitle.innerHTML = this.name;
        layerElem.appendChild( layerVisibility );
        layerElem.appendChild( layerElemTitle );
        layerElem.appendChild( miniature );

        return layerElem;

    };


    p.updateMagneticLines = function(){

        return;
        var bounds = this.getGlobalTransformedBounds();

        this.magneticLines.vertical.left.x = bounds.x;
        this.magneticLines.vertical.right.x = bounds.x + bounds.width;
        this.magneticLines.vertical.center.x = bounds.x + (bounds.width/2);
        this.magneticLines.horizontal.top.y = bounds.y;
        this.magneticLines.horizontal.bottom.y = bounds.y + bounds.height;
        this.magneticLines.horizontal.center.y = bounds.y + bounds.height/2;

    };


    p.updateWithContentFromDB = function( info ){

        this.name             = info.content.name;
        this.height           = parseFloat( info.content.height );
        this.width            = parseFloat( info.content.width );
        this.trueWidth        = parseFloat( info.content.trueWidth );
        this.trueHeight       = parseFloat( info.content.trueHeight );
        this.x                = parseFloat( info.content.x );
        this.y                = parseFloat( info.content.y );
        this.regX             = parseFloat( info.content.regX );
        this.regY             = parseFloat( info.content.regY );
        this.rotation         = parseFloat( info.content.rotation );

    };

    p.loadContent = function( content ){

        this.removeAllLines();

    }

    p.removeAllLines = function(){

        for( var i=0; i < this.lines.length; i++ ){

            this.removeChild( this.lines[i] );

        }

        this.lines = [];

    }

 	/**
	* Tworzy cache całego obiektu
	*
	* @method makeCache
	*/
	p.makeCache = function(){

		//var bounds = this.getTransformedBounds();

		//this.uncache();
		//this.cache(0,0, bounds.width, bounds.height);

	};


 	/**
	* Updateuje tekst z ustawieniami domyślnymi, jakie są określone dla danej instancji tekstu
	*
	* @method updateTextWithDefaultValues
	*/
	p.updateTextWithDefaultValues = function(){

		for( var i=0; i < this.lines.length; i++ ){

			this.lines[i].linesInfo();
			this.lines[i]._recalculateAllLines();
			this.lines[i].uncache();

            if( userType == 'admin'){

                this.recalculateLinePositions();

            }
            else {

                this.verticalCenter();

            }

		}

	};


    p.getContent = function(){

        var textContent = [];

        if( this.getAllLettersCount() == 0 || this.defaultTextVisible )
            return;


        for( var li=0; li < this.lines.length; li++ ){

            var _line = this.lines[li];

            var line = {

                lineHeight : _line.lineHeight,
                letters : [],
                align   : _line.align,
                verticalAlign:_line.verticalAlign

            };

            for( var l=0; l < _line.children.length; l++ ){

                var letter = _line.children[l];

                var _letter = {

                    text : letter.text,
                    size : letter.size,
                    lineHeight : letter.lineHeight,
                    color : letter.color,
                    fontFamily : letter.fontFamily,
                    fontType : letter.fontType

                };

                for( var key in _line.linesInfo_Object ){

                    if( l >= _line.linesInfo_Object[ key ].firstLetter && l <= _line.linesInfo_Object[ key ].lastLetter ){

                        _letter.line = key;
                        break;

                    }

                }

                line.letters.push( _letter );

            }

            textContent.push( line );

        }

        return textContent;

    };


 	/**
	* Binduje event związane z edycją tekstu
	*
	* @method _bindEvents
	*/
    p.getCurrentFont = function(){

        var Editor = this.editor;
        var font = this._currentFont;

        if( Editor.fonts.defaultFonts.indexOf(font) != -1 ){



        }else {



        }

    };


    p.zoom = function(){

        var Editor = this.editor;

        if( !this.zoomed ){

            var bounds = this.getTransformedBounds();

            var maxSize = window.innerWidth*0.8 / Editor.getStage().scaleX;

            const toolbarHeight=80;

            var maxSizeH = window.innerHeight / Editor.getStage().scaleX-toolbarHeight;

            var scale = maxSize/bounds.width;

            if( bounds.height*Editor.getStage().scaleX * scale > window.innerHeight ){

                scale = maxSizeH/bounds.height;

            }

            var test = Editor.stage.getMousePositionFromScreen( window.innerWidth/2, window.innerHeight/2-toolbarHeight/2 );

            this.zoomed = true;

            this.xZoom = this.x;
            this.yZoom = this.y;
            if(userType === 'advancedUser') {
                Editor.toolsManager.getToolsFromType('proposedPosition').components[0].tools.hideCompoundBox();
            }

            createjs.Tween.get( this.mask ).to({ x: test.x, y : test.y , scaleX : scale, scaleY : scale }, 200, createjs.Ease.quadInOut );
            createjs.Tween.get( this ).to({ x: test.x, y : test.y , scaleX : scale, scaleY : scale }, 200, createjs.Ease.quadInOut ).call(function(){

                this.updateCursorShape();

            });


        }else {

            this.zoomed = false;

            createjs.Tween.get( this.mask ).to({ x: this.xZoom, y : this.yZoom , scaleX : 1, scaleY : 1 }, 200, createjs.Ease.quadInOut );
            createjs.Tween.get( this ).to({ x: this.xZoom, y : this.yZoom , scaleX : 1, scaleY : 1 }, 200, createjs.Ease.quadInOut ).call( function(){

                if(userType === 'advancedUser'){
                    Editor.toolsManager.getToolsFromType('proposedPosition').components[0].tools.showCompoundBox();
                }
                this.updateCursorShape();

            });

        }

    };



    p.focus = function(){

        var _this = this;

        var stageElem = this.editor.stage.getLayer( this.editor.stage.MAIN_LAYER );
        stageElem.mouseEnabled = false;
        //stageElem.cache(-2000,-2000, 4000,4000 );

        this.moveToToolsLayer();

        $('.displayController').css( { opacity: 0 } );
        $('.displayController').css( 'pointer-events', 'none' );

        var int = setInterval( function(){

            if( stageElem.alpha < 0.4 ) {

                clearInterval( int );
                return true;

            }else {

                stageElem.alpha -= 0.1;

            }

        }, 1000/60);

        this.editor.stage.getBackgroundLayer().addEventListener('click', canvasClick );

        function canvasClick( event ){

            event.stopPropagation();
            stageElem.mouseEnabled = true;

            $('.displayController').css( { opacity: 1 } );
            $('.displayController').css( 'pointer-events', 'auto' );
            var int2 = setInterval( function(){

                if( stageElem.alpha > 1 ) {

                    clearInterval( int2 );
                    return true;

                }else {

                    stageElem.alpha += 0.1;

                }

            }, 1000/60);

            createjs.Tween.get( _this ).to({ x: _this.xZoom, y : _this.yZoom , scaleX : 1, scaleY : 1 }, 200, createjs.Ease.quadInOut ).call( function(){

                _this.backFromToolsLayer( true );


            });

            _this.zoomed = false;
            _this.hideBorder();

            _this.editor.stage.getBackgroundLayer().removeEventListener('click', canvasClick );
            _this.editor.tools.setEditingObject( null );

        };

    };


    p.initUserEvents = function(){

        var _this = this;

		this.addEventListener( 'mousedown', function(e){

			e.stopPropagation();
			_this.setCenterReg();
			_this.editor.setVectorStart( e.stageX, e.stageY );
			_this.editor.tools.setEditingObject( e.currentTarget.id);

		});

    };

    p.getLetterLineNumber = function( letter ){

        var line = letter.parent;

        var indexInLine = line.getChildIndex( letter );

        for( var key in line.linesInfo_Object ){

            var lineInfo = line.linesInfo_Object[key];

            if( lineInfo.firstLetter <= indexInLine && indexInLine <= lineInfo.lastLetter ){

                return key;

            }

        }

        return null;

    };

    p.debugCursorMap = function(){

        for( var i=0;i < this.cursorMap.length; i++ ){



        }

    };

	p._keyboardInput = function( e ){


        var Editor = this.editor;
        var keys = [ 32 ];
		var line = this.lines[ this._cursorLine ];
        var charToAdd = Editor.tools.keyboard.getChar( e );

        if( e.keyCode === 65 && Keyboard.isCtrl(e) && !e.altKey){

            this.selectAll();
            return;

        }
        if( e.keyCode === 67 && Keyboard.isCtrl(e) && !e.altKey){

            const lines=this.getSelectedContent();
            this.toSystemClipboard(this.toFlatText(lines));
            Editor.clipboardData = lines;
            return;

        }

        if( e.keyCode === 88 && Keyboard.isCtrl(e) && !e.altKey){

            const lines=this.getSelectedContent();
            this.toSystemClipboard(this.toFlatText(lines));
            Editor.clipboardData = lines;
            this.removeTextBlock();
            return;

        }

        if( e.keyCode === 86 && Keyboard.isCtrl(e) && !e.altKey){

            // this.insertContent( Editor.clipboardData );
            return;

        }

        if( charToAdd ){

        if (!_.isEmpty(this.selection.lastLetter) && !_.isEmpty(this.selection.stopLine)) {

                this.removeTextBlock();
                this.generateCursorMap();

            }

            if( this._cursorPosition === 0 || this._cursorPosition === null ){

                var mapCursor = this.cursorMap[0];
                var addedLetter = mapCursor.line.addFullEditableLetter( charToAdd, this._currentFontFamily, this._currentFontSize , this._currentFontColor, 0 );
                this.updateText({

                    lettersPositions : true,
                    linesPosition : true,

                });


                this._cursorPosition = 1;
                this.generateCursorMap();
                this.setCursor( this._cursorPosition, addedLetter );

            }
            else {

                this.generateCursorMap();
                // obiekt opisujacy pozycje kursora
                var mapObject = this.cursorMap[ this._cursorPosition ];
                var nextObject = this.cursorMap[ this._cursorPosition+1 ];
                //var nextMapObject = this.cursorMap[ this._cursorLine ][ this._cursorPosition+1 ];

                if( mapObject ){

                    if( !nextObject ){

                        if( mapObject.line.letters == 0 ){
                            var letterPos = 0;
                        }else {

                            var letterPos = mapObject.pos+1;

                        }
                        var addedLetter = mapObject.line.addFullEditableLetter( charToAdd, this._currentFontFamily, this._currentFontSize , this._currentFontColor, letterPos );

                    }else {


                        if( mapObject.letter != nextObject.letter ){
                            if( mapObject.line.letters == 0 ){
                                var letterPos = 0;
                            }else {

                                var letterPos = mapObject.pos+1;

                            }
                            var addedLetter = mapObject.line.addFullEditableLetter( charToAdd, this._currentFontFamily, this._currentFontSize , this._currentFontColor, letterPos );

                        }else {

                            var addedLetter = mapObject.line.addFullEditableLetter( charToAdd, this._currentFontFamily, this._currentFontSize , this._currentFontColor, mapObject.pos );

                        }

                    }

                }else {

                    mapObject = this.cursorMap[0];
                    var addedLetter = mapObject.line.addFullEditableLetter( charToAdd, this._currentFontFamily, this._currentFontSize , this._currentFontColor, 0 );

                }

                this.updateText({

                    lettersPositions : true,
                    linesPosition : true,

                });

                this.generateCursorMap();

               if( this.cursorMap[ this._cursorPosition+1 ] ){

                   this._cursorPosition++;

                   if( this.cursorMap[ this._cursorPosition+1] ){
                       if( this.cursorMap[ this._cursorPosition+1].letter == this.cursorMap[ this._cursorPosition ].letter ){

                           if( this.cursorMap[ this._cursorPosition+1 ] ){

                               this._cursorPosition++;

                           }

                       }
                   }

               }

               this.setCursor( this._cursorPosition );

            }

            this.selection.firstLetter = null;
            this.selection.startLine   = null;
            this.selection.lastLetter  = null;
            this.selection.stopLine    = null;
            this.displaySelectedLetter();

            //alert('sprawdzaj mape kursorow2: ' + text);
        } else if( Keyboard.isCtrl(e) && e.keyCode == 86 ){

            if( !this.paste ){

                this.paste = true;
                e.stopPropagation();

                this.dispatchEvent( 'paste' );

            }

        }
        else if( Keyboard.isCtrl(e) && e.keyCode == 67 ){

            if( !this.copy ){

                this.copy = true;

                var array = [];

                for( var i=0; i < this._selected.length; i++ ){

                    var clone = this._selected[i].clone();
                    clone.parentId = this._selected[i].parent.id;
                    array.push( clone );

                }

                Editor.clipboardData = array;


                this.copy = false;
            }

        }
        else if( e.keyCode == 38 ){

            // strzalka do góry

            var letter = this.cursorMap[ this._cursorPosition ].letter;
            var letterIndex = letter.parent.getChildIndex( letter );
            var line = this.cursorMap[ this._cursorPosition ].line;
            var lineNumber = this.getLetterLineNumber( this.cursorMap[ this._cursorPosition ].letter );

            var letterOffset = letterIndex - line.linesInfo_Object[ lineNumber ].firstLetter;

            if( lineNumber > 1 ){

                if( line.linesInfo_Object[ lineNumber-1 ].firstLetter + letterOffset <= line.linesInfo_Object[ lineNumber-1 ].lastLetter ){

                    var letter = line.getChildAt( line.linesInfo_Object[ lineNumber-1 ].firstLetter + letterOffset );

                    this._cursorPosition = this.getLetterPositionInCursorMap( letter );

                }

            }else {

                var lineIndex = this.lines.indexOf( line );
                var currentLinePosition = line.linesInfo_Object[ lineNumber ];

                if(  lineIndex > 0 ){

                    var newLine = this.lines[ lineIndex-1 ];
                    var keys = Object.keys( newLine.linesInfo_Object );
                    var lastLetter = newLine.linesInfo_Object[ keys.length ].lastLetter - newLine.linesInfo_Object[ keys.length ].firstLetter;

                    if( lastLetter < letterIndex ){

                        var letter = newLine.getChildAt( newLine.linesInfo_Object[ keys.length ].lastLetter );
                        this._cursorPosition = this.getLetterPositionInCursorMap( letter );

                    }else {

                        var letter = newLine.getChildAt( newLine.linesInfo_Object[ keys.length ].firstLetter+letterIndex );
                        this._cursorPosition = this.getLetterPositionInCursorMap( letter );

                    }

                }

            }

            this.setCursor( this._cursorPosition, (( letter )? letter : null ) );

        }
        else if( e.keyCode == 40 ){
            //strzałka w dół

            var letter = this.cursorMap[ this._cursorPosition ].letter;
            var letterIndex = letter.parent.getChildIndex( letter );
            var line = this.cursorMap[ this._cursorPosition ].line;
            var lineNumber = this.getLetterLineNumber( this.cursorMap[ this._cursorPosition ].letter );
            var letterOffset = letterIndex - line.linesInfo_Object[ lineNumber ].firstLetter;

            var nextLine = parseInt(lineNumber)+1;

            if( line.linesInfo_Object[ nextLine ] ){

                if( line.linesInfo_Object[ nextLine ].firstLetter + letterOffset <= line.linesInfo_Object[ nextLine ].lastLetter ){

                    var letter = line.getChildAt( line.linesInfo_Object[ nextLine ].firstLetter + letterOffset );

                    this._cursorPosition = this.getLetterPositionInCursorMap( letter );

                }else {

                    var letter = line.getChildAt( line.linesInfo_Object[ nextLine ].lastLetter);
                    this._cursorPosition = this.getLetterPositionInCursorMap( letter );

                }


            }else {

                var lineIndex = this.lines.indexOf( line );
                var currentLinePosition = line.linesInfo_Object[ lineNumber ];

                if(  this.lines[ lineIndex+1 ] ){

                    var newLine = this.lines[ lineIndex+1 ];
                    var keys = Object.keys( line.linesInfo_Object );

                    var lastLetter = newLine.linesInfo_Object[ "1" ].lastLetter - newLine.linesInfo_Object[ "1" ].firstLetter;
                    var letterIndex = letterIndex - line.linesInfo_Object[ keys.length ].firstLetter;

                    if( lastLetter < letterIndex ){

                        var letter = newLine.getChildAt( lastLetter );
                        this._cursorPosition = this.getLetterPositionInCursorMap( letter );

                    }else {

                        var letter = newLine.getChildAt( letterIndex );
                        this._cursorPosition = this.getLetterPositionInCursorMap( letter );

                    }

                }

            }

            this.setCursor( this._cursorPosition, (( letter )? letter : null ) );

        }
        else if( e.keyCode == 37 ){

            var mapObject = this.cursorMap[ this._cursorPosition ];
            var beforeMapObject = this.cursorMap[ this._cursorPosition-1 ];

            if( beforeMapObject ){

                if( this.cursorMap[this._cursorPosition-2] ){

                    this._cursorPosition -=2;

                }else {

                    this._cursorPosition--;

                }

            }

            this.setCursor( this._cursorPosition, mapObject.letter );

        }
        else if( e.keyCode == 39 ){

            var mapObject = this.cursorMap[ this._cursorPosition ];
            var nextMapObject = this.cursorMap[ this._cursorPosition+1 ];

            if( nextMapObject ){

                if( this.cursorMap[this._cursorPosition+2] ){

                    this._cursorPosition +=2;

                }else {

                    this._cursorPosition++;

                }

            }

            this.setCursor( this._cursorPosition,  mapObject.letter );

        }
        else if( e.keyCode == 46 ){

            e.preventDefault();

            if( this.selection.lastLetter !== null && this.selection.stopLine !== null ){

                this.removeTextBlock();
                this.updateText({

                    lettersPositions : true,
                    linesPosition : true,
                    maximizeFontSize : true

                });

                this.setCursor( this._cursorPosition );
                return;

            }

            var mapObject = this.cursorMap[ this._cursorPosition ];

            if( mapObject.line.cursorMap.indexOf( mapObject ) == mapObject.line.cursorMap.length-1 ){

                var lineIndex = this.lines.indexOf( mapObject.line );
                var nextLine = ( this.lines[lineIndex+1] )? true: false;

                if( nextLine ){

                    if( this.lines[lineIndex+1].letters == 0 ){

                        this.removeLine( this.lines[lineIndex+1] );

                        this.updateText({

                            lettersPositions : true,
                            linesPosition : true,
                            maximizeFontSize : true

                        });

                    }else {

                        this.concatLines( this.lines[lineIndex],this.lines[lineIndex+1] );
                        this.updateText({

                            lettersPositions : true,
                            linesPosition : true,
                            maximizeFontSize : true

                        });
                    }

                }


            }else if( this.selection.stopLine === null || this.selection.lastLetter === null || this.selection.startLine === null || this.selection.firstLetter === null ){

                if( this._cursorPosition <= this.cursorMap.length-1 ){

                    if( this._cursorPosition%2 == 0   ){

                        var mapObject = this.cursorMap[ this._cursorPosition ];
                        mapObject.line.removeLetter( mapObject.letter );

                    }else {

                        var mapObject = this.cursorMap[ this._cursorPosition+1 ];
                        if( mapObject ){
                            mapObject.line.removeLetter( mapObject.letter );
                        }

                    }

                }

                this.updateText({

                    lettersPositions : true,
                    linesPosition : true,
                    maximizeFontSize : true

                });

                this.setCursor( this._cursorPosition );

            }
            else {

                if( this.selection.startLine == this.selection.stopLine ){

                    for( var i=0; i < this._selected.length; i++ ){

                        this._selected[i].parent.removeLetter( this._selected[i] );

                    }

                }

                this.updateText({

                    lettersPositions : true,
                    linesPosition : true,
                    maximizeFontSize : true

                });

                if( this.selection.firstLetter > this.selection.lastLetter ){

                    this._cursorPosition = ( this.selection.lastLetter * 2 ) -1;

                }

                this.setCursor( this._cursorPosition );

                //this.setCursor( this._cursorPosition, this._cursorLine );


            }

        }
        else if( e.keyCode == 35 ){

            var mapObject = this.cursorMap[ this._cursorPosition ];
            var lastIndex =  this.cursorMap.indexOf(mapObject.line.cursorMap[ mapObject.line.cursorMap.length-1 ] );
            this._cursorPosition = lastIndex;
            this.setCursor( lastIndex );

        }
        else if( e.keyCode == 36 ){

            var mapObject = this.cursorMap[ this._cursorPosition ];
            var firstIndex =  this.cursorMap.indexOf(mapObject.line.cursorMap[ 0 ] );
            this._cursorPosition = firstIndex;
            this.setCursor( firstIndex );

        }
        else if( e.keyCode == 13 ){

            if( this.selection.lastLetter !== null && this.selection.stopLine !== null ){

                this.removeTextBlock();

            }

            var currentLine = this.cursorMap[ this._cursorPosition ].line;
            var currentLetter = this.cursorMap[ this._cursorPosition ].letter;

            if( this.cursorMap[ this._cursorPosition ].letter == this._cursorLine.cursorMap[this._cursorLine.cursorMap.length-1].letter || currentLetter == null ){

                var newEmptyLine = new TextLine( 0, 0, currentLine.lineHeight );
                newEmptyLine.align = currentLine.align;
                newEmptyLine.x = this.padding.left;
                newEmptyLine.shadow=currentLine.shadow;
                newEmptyLine.parent = this;
                this.addLineAt( newEmptyLine, this.getChildIndex( currentLine ) );
                newEmptyLine.initHitArea();
                newEmptyLine.uncache();

                this.updateText({

                    lettersPositions : true,
                    linesPosition : true,

                });

                this.setCursor( this.cursorMap.indexOf( newEmptyLine.cursorMap[0] ), null );

            }
            else if( this._cursorPosition && ( this.cursorMap.length-1 >= this._cursorPosition+1 ) ){

                var mapObject = this.cursorMap[ this._cursorPosition+1 ];
                var line = this._cursorLine;
                var breakedLine = this.breakLine( line, mapObject.pos );


                this._cursorLine = breakedLine;
                //this._cursorPosition = 0;

                this.updateText({

                    lettersPositions : true,
                    linesPosition : true,

                });
                this.dispatchEvent( "resize" );

                if( this.cursorMap[ this._cursorPosition ].letter != mapObject.letter ){

                    this._cursorPosition++;

                }

                this.setCursor( this._cursorPosition, mapObject.letter );

            }
            else if( this._cursorPosition === 0 ){

                    var line = this.cursorMap[ this._cursorPosition ].line;

                    var newEmptyLine = new TextLine( 0, 0, line.lineHeight );
                    newEmptyLine.x = this.padding.left;
                    newEmptyLine.align = line.align;
                    newEmptyLine.shadow=line.shadow;
                    this.addLineBefore( line, newEmptyLine );
                    newEmptyLine.initHitArea();
                    newEmptyLine.uncache();
                    this._cursorLine = newEmptyLine;
                    this._cursorPosition = 0;

                    this.updateText({

                        lettersPositions : true,
                        linesPosition : true,

                    });
                    this.dispatchEvent( "resize" );

            }
            /*
            else {

                var line = this.cursorMap[ this._cursorLine ][ 0 ].line;

                var newEmptyLine = new Editor.TextLine( 0, 0, line.lineHeight );
                newEmptyLine.align = line.align;

                this.addLineAt( newEmptyLine, this.getChildIndex( line ) );
                newEmptyLine.initHitArea();

                for( var i=0; i < this.lines.length; i++){

                    var line = this.lines[i];
                    line.complexRecalculate();

                }

                this.generateCursorMap();

            }
            */

		}
		else if( e.keyCode == 8 ){

            //backspace
			e.preventDefault();
            if( this.selection.lastLetter !== null && this.selection.stopLine !== null ){

                this.removeTextBlock();
                this.updateText({

                    lettersPositions : true,
                    linesPosition : true,
                    maximizeFontSize : true

                });

                this.setCursor( this._cursorPosition );
                return;

            }


            var mapObject = this.cursorMap[ this._cursorPosition ];

            if( mapObject.letter == null ){

                if( mapObject.line ){
                    if( this.lines.length > 1 ){

                        this.removeLine( mapObject.line );

                        this._cursorPosition--;

                        this.updateText({

                            lettersPositions : true,
                            linesPosition : true,
                            maximizeFontSize : true

                        });

                        this.setCursor( this._cursorPosition );

                    }
                }


            }else if( mapObject.line.cursorMap.indexOf( mapObject ) == 0 ){

                var lineIndex = this.lines.indexOf( mapObject.line );
                if( lineIndex > 0 ){

                    this.concatLines( this.lines[lineIndex-1], this.lines[lineIndex] );
                    this.updateText({

                        lettersPositions : true,
                        linesPosition : true,
                        maximizeFontSize : true

                    });
                    this.lines[lineIndex-1].textParent = this;
                    this.setCursor( this._cursorPosition );

                }

            }else if( (this.selection.stopLine === null || !this.selection.stopLine)  || this.selection.lastLetter === null || this.selection.startLine === null || this.selection.firstLetter === null ){

                if( this._cursorPosition >= 1 ){

                    if( this._cursorPosition%2 == 0   ){


                        var mapObject = this.cursorMap[ this._cursorPosition-1 ];
                        mapObject.line.removeLetter( mapObject.letter );

                        if( this._cursorPosition -2 >= 0 ){

                            this._cursorPosition -= 2;

                        }

                    }else {

                        var mapObject = this.cursorMap[ this._cursorPosition-1 ];
                        mapObject.line.removeLetter( mapObject.letter );

                        if( this._cursorPosition -2 < 0 ){

                            if( this._cursorPosition -1 == 0 ){
                               this._cursorPosition -= 1;
                            }else {
                                this._cursorPosition = 0;
                            }

                        }else {

                            this._cursorPosition -= 2;

                        }

                    }

                }

                this.updateText({

                    lettersPositions : true,
                    linesPosition : true,
                    maximizeFontSize : true

                });

                this.setCursor( this._cursorPosition );

			}
			else {

                if( this.selection.startLine == this.selection.stopLine ){

                    for( var i=0; i < this._selected.length; i++ ){

                        this._selected[i].parent.removeLetter( this._selected[i] );

                    }

                }else {

                }

                this.updateText({

                    lettersPositions : true,
                    linesPosition : true,
                    maximizeFontSize : true

                });

                if( this.selection.firstLetter > this.selection.lastLetter ){

                    this._cursorPosition = ( this.selection.lastLetter * 2 ) -1;

                }

                this.setCursor( this._cursorPosition );

			}

            //this.setCursor( this._cursorPosition, this._cursorLine, true );

		}

        if( userType == 'user' && this.isProposedPosition ){


            if( this.parentBefore  ){

                var page = this.parentBefore.getFirstImportantParent();


            }else {

                var page = this.getFirstImportantParent();

            }

        }

    };

    /**
	* Dodaje treść w miejsce kursora|zaznaczenia
	*
	* @method insertContent
    * @param content Array Tablica obiektów
	*/
    p.insertContent = function( content ){

        if( !_.isEmpty(this.selection.lastLetter) && !_.isEmpty(this.selection.stopLine) ){

            this.removeTextBlock();
            this.generateCursorMap();

        }

        if( content.length == 1 ){//jedna linia

            for( var letter=0; letter < content[0].letters.length; letter++ ){

                var mapObject = this.cursorMap[ this._cursorPosition ];
                var nextObject = this.cursorMap[ this._cursorPosition+1 ];

                if( mapObject){

                    var letterPos=mapObject.line.letters == 0? 0 : mapObject.pos+1;

                    if( !nextObject ){

                        this.cursorMap[this._cursorPosition].line.addFullEditableLetter( content[0].letters[letter].text, content[0].letters[letter].fontFamily, content[0].letters[letter].size, content[0].letters[letter].color, letterPos );

                    } else {

                        if( mapObject.letter != nextObject.letter ){

                            this.cursorMap[this._cursorPosition].line.addFullEditableLetter( content[0].letters[letter].text, content[0].letters[letter].fontFamily, content[0].letters[letter].size, content[0].letters[letter].color, letterPos );

                        }else {

                            this.cursorMap[this._cursorPosition].line.addFullEditableLetter( content[0].letters[letter].text, content[0].letters[letter].fontFamily, content[0].letters[letter].size, content[0].letters[letter].color, letterPos );

                        }

                    }


                }else {//not mapObject

                    mapObject = this.cursorMap[0];
                    this.cursorMap[this._cursorPosition].line.addFullEditableLetter( content[0].letters[letter].text, this._currentFontFamily, content[0].letters[letter].size, content[0].letters[letter].color, 0 );

                }

                this.updateText({

                    lettersPositions : true,
                    linesPosition : true,

                });

                this.generateCursorMap();

                if( this.cursorMap[ this._cursorPosition+1 ] ){

                    this._cursorPosition++;

                    if( this.cursorMap[ this._cursorPosition+1] ){
                        if( this.cursorMap[ this._cursorPosition+1].letter == this.cursorMap[ this._cursorPosition ].letter ){

                            if( this.cursorMap[ this._cursorPosition+1 ] ){

                                this._cursorPosition++;

                            }

                        }

                    }

                }

                this.setCursor( this._cursorPosition );

            }

        }else if(content.length>0) {
            this.insertContent([content[0]]);

            const newLine = new TextLine( 0, 0, this.cursorMap[this._cursorPosition].line.lineHeight );
            newLine.align = this.cursorMap[this._cursorPosition].line.align;
            newLine.textParent = this;
            newLine.x = this.padding.left;
            newLine.shadow=this.cursorMap[this._cursorPosition].line.shadow;
            this.addLineAt( newLine, this.getChildIndex( this.cursorMap[this._cursorPosition].line ) );
            newLine.uncache();
            newLine.lineHeight = this.cursorMap[this._cursorPosition].line.lineHeight;
            newLine.initHitArea();

            this.generateCursorMap();

            this._cursorPosition++;

            this.insertContent(content.slice(1));
        }else{
            console.warn('Próba wstawienia pustej zawartości');
        }

        this.updateText( {}, true );

    }


 	/**
	* Łączy dwie linie w jedną
	*
	* @method concatLines
    * @param line1 TextLine Linia do której ma zostać dołączona inna linia
    * @param line2 TextLine linia która ma zostać dołączona do pierwszej
	*/
	p.concatLines = function( line1, line2 ){;

		var letters = line2.removeLetters( 0 );

		var linesLength = line1.letters;

		for( var i=0; i < letters.length; i++ ){

			line1.addCreatedLetter( letters[i] );

		}

        this.removeLine( line2 );
        return line1;

	};


    p.updateContentInDB = function(  ){

        const page = this.parentBefore ? this.parentBefore.getFirstImportantParent() : this.getFirstImportantParent();
        if (page.userPage)
            this.editor.webSocketControllers.userPage.setTextContent(page.userPage._id, this.dbID, this.getContent());
        else {
            console.error(`Nie ma page dla obiektu typu ${this.type} ${this.dbID} "${this.lines[0].lettersObjects.map(l=>l.text).join(' ')}"`)
        }

    }


    p.updateAttributesInDB = function(){


        /*
        Editor.webSocketControllers.editorText.setAttributes(
            this.dbID,
            {



            }
        );
        */

    };


 	/**
	* Usuwa lkonkretna linię
	*
	* @method removeLine
    * @param line TextLine Linia którama zostać usunięta
	*/
	p.removeLine = function( line ){

		var index = this.getChildIndex( line );
		var order = line.lineOrder;

		this.removeChild( line );

		var newLines_1 = this.lines.slice( 0, order );
		var newLines_2 = this.lines.slice(order+1, this.lines.length );

		this.lines = newLines_1.concat( newLines_2 );

		this.reorderLines();

        if( userType == 'admin'){

            this.recalculateLinePositions();

        }
        else {

            this.verticalCenter();

        }

	};


 	/**
	* Usuwa literę z kursorem
	*
	* @method removeNextLetter
	*/
    p.removeNextLetter = function(){

        if( this.cursorMap[ this._cursorLine ][ this._cursorPosition ] == this.cursorMap[ this._cursorLine ][ this._cursorPosition+1 ]  )
            var mapObject = this.cursorMap[ this._cursorLine ][ this._cursorPosition ]; //this.lines[ this._cursorLine ].getChildAt( this._cursorPosition );
        else
            var mapObject = this.cursorMap[ this._cursorLine ][ this._cursorPosition+1 ];
        mapObject.line.removeLetter( mapObject.letter );

    };


	/**
	* Usuwa literę przed kursorem
	*
	* @method removeLetter
	*/
	p.removeLetter = function(){

        var mapObject = this.cursorMap[ this._cursorLine ][ this._cursorPosition-1 ];
        mapObject.line.removeLetter( mapObject.letter );

	};


	/**
	* Łamie linię w miejscu kursora, i tworzy kolejną z liter następujących po cursorze do końca tej lini
	*
	* @method breakLine
    * @param {line} line Linia która ma zostać 'złamana'
    * @param {int} from Indeks litery od której ma się to stać
	*/
	p.breakLine = function( line, from ){

		var letters = line.removeLetters( from );
        line.linesInfo();
        line.complexRecalculate();
		line.updateBoundsAndHitArea();
		var newLine = new TextLine( 0, 0, line.lineHeight );
        newLine.align = line.align;
        newLine.textParent = this;
        newLine.x = this.padding.left;
        newLine.shadow=line.shadow;

		for( var i=0; i < letters.length; i++){

			newLine.addCreatedLetter( letters[i] );

		}

		this.addLineAt( newLine, this.getChildIndex( line ) );
		newLine.uncache();

        newLine.lineHeight = line.lineHeight;

        newLine.initHitArea();

        return newLine;

	};


    p.getLineLetters = function( lineNumber ){

        var line = null;

        for( var i=0; i < this.lines.length; i++ ){



        }

        return line;

    }

	/**
	* Zwraca linie
	*
	* @method getLineByOrder
    * @param {Int} lineOrder kolejność lini
    * @return {Obj} linia
	*/
    p.getLineByOrder = function( lineOrder ){

        return this.lines[lineOrder];

    };

    p.getTextHeight = function(){

        var height = 0;

        for( var i=0; i < this.lines.length; i++){

            var line = this.lines[i];
            height += line.lineHeight*line.lines;

        }

        height += this.padding.top;
        height += this.padding.bottom;

        return height;

    };




    /**
	* Ustala sposób justowania tekstu
	*
	* @method setAlign
    * @param {String} align
	*/
    p.setAlign = function( align ){

        this._align = align;

        for( var i=0; i < this.lines.length; i++ ){

            this.lines[i].align = align;

        }

    };

    p.setVerticalAlign = function( align ){

        this.verticalAlign = align;

        for( var i=0; i < this.lines.length; i++ ){

            this.lines[i].verticalAlign = align;

        }


    };


    /**
	* Zmienia color zaznaczonych liter
	*
	* @method updateSelectedColor
    * @param color string Kolor jaki ma zostać przypisany
	*/
    p.updateSelectedColor = function( color ){

        this.getSelectedLetters();

        for( var i=0; i< this._selected.length; i++ ){

            this._selected[i].color = color;
            this._selected[i].update();

            //this._selected[i].letter.makeCache();

        }

    };


    /**
	* Zmienia czcionkę zaznaczonych liter
	*
	* @method updateSelectedFont
	*/
    p.updateSelectedFont = function( ){

        this.updateFont();
        this.getCurrentFont();
        this.getSelectedLetters();
        //this._currentFont = font;

        for( var i=0; i< this._selected.length; i++ ){

            this._selected[i].fontFamily = this._currentFontFamily;
            this._selected[i].fontType.regular = this._currentFontType.regular;
            this._selected[i].fontType.italic = this._currentFontType.italic;
            this._selected[i].update();

        }

    };


    /**
	* Aktualizuje czcionkę względem lokalnych wartości instancji. Ta funkcja powinna być używana po każdej zmianie na czcione poza kolorem i rozmiarem
	*
	* @method updateFont
	*/
    p.updateFont = function(){

        this._currentFont = this.editor.fonts.selectFont( this._currentFontFamily, this._currentFontType.regular, this._currentFontType.italic );

        return this._currentFont;

    };


    /**
	* Zmienia wielkość zaznaczonych liter
	*
	* @method updateSelectedSize
    * @param size int Rozmiar czcionki
	*/
    p.updateSelectedSize = function( size ){

        this.getCurrentFont();
        this.getSelectedLetters();

        for( var i=0; i< this._selected.length; i++ ){

            this._selected[i].size = size;

            this._selected[i].update();

        }

        this.setCursor( this._cursorPosition, this._cursorLine );

    };

    p.updateSelectedLineHeight = function( lineHeight ){

        this.getSelectedLetters();
        var lines = this.getLinesFromSelectedLetters();

        for( var i=0; i < lines.length; i++ ){

            var aspect = lines[i].userFontSizeLineHeightAspect || lines[i].defaultFontAspect;
            var biggestLetters = lines[i].getBiggestLetters();

            var changeAllLine = true;

            for( var l=0; l< biggestLetters.length; l++) {
                if( this._selected.indexOf( biggestLetters[l] ) == -1 ){
                    changeAllLine = false;
                }
            }

            if( changeAllLine )
                lines[i].setLineHeight( lineHeight * aspect );

        }

    };

    p.getLinesFromSelectedLetters = function (){

        var lines = [];

        for( var i=0; i< this._selected.length; i++ ){


            if( lines.indexOf( this._selected[i].parent ) == -1 ){
                lines.push( this._selected[i].parent );
            }

        }

        return lines;

    };

    p.updateAllLetters = function(){

        // tutaj trzeba ustalić aktualną wielkość czcionki , interlini, jak i czcionkę, itp

        for( var i=0; i < this.lines.length; i++ ){

            for( var l=0; l < this.lines[i].lettersObjects.length; l++ ){

                var letter = this.lines[i].lettersObjects[l];

                //console.log( letter );
                //alert('jak jest teraz');

                letter.lineHeight = this._currentFontSize * 1.2;
                //letter.fontFamily = this._currentFontFamily;
                //letter.letter.color = this._currentFontColor;
                //letter.color = this._currentFontColor;
                letter.size = this._currentFontSize;
                //letter.fontType.regular = this._currentFontType.regular;
                //letter.fontType.italic = this._currentFontType.italic;
                letter.update();

                //alert('a jak teraz');

            }

            this.lines[i].lineHeight = this._currentFontSize * 1.2;
            this.lines[i].complexRecalculate();

        }

    }


    p.verticalCenter = function(){

        var textHeight = this.getTextHeight();

        var marginTop = ( ( this.trueHeight ) - textHeight )/2 + this.padding.top;

        this.recalculateLinePositions( marginTop );

    };


    p.getClosestLineInCursorMap = function( x, y ){

        var localPos = this.globalToLocal( x, y);

        var height = 0+ this.padding.top;

        if( localPos.y < height ){

            return 0;

        }

        var currentLine = 0;

        for( var i = 0; i < this.lines.length; i++ ){

            for( var key in this.lines[i].linesInfo_Object ){

                height += parseInt( this.lines[i].lineHeight );

                if( localPos.y < height ){
                    return currentLine;
                }

                currentLine++;

            }

        }

        return this.cursorMap.length-1;

    };

    p.getClosestLine = function( x, y ){

        var localPos = this.globalToLocal( x, y);

        var height = 0+ this.padding.top;

        if( localPos.y < height ){

            return 0;

        }

        var currentLine = 0;

        for( var i = 0; i < this.lines.length; i++ ){

            for( var key in this.lines[i].linesInfo_Object ){

                height += parseInt( this.lines[i].lineHeight );

                if( localPos.y < height ){
                    return currentLine;
                }

                currentLine++;

            }

        }

        return currentLine-1;

    };


    /*
    p.getClosestLineInCursorMap = function( x, y ){

        var localPos = this.globalToLocal( x, y);

        var height = 0;

        if( localPos.y < height ){

            return 0;

        }

        for( var i = 0; i < this.cursorMap.length; i++ ){

            height += parseInt( this.cursorMap[i][0].line.lineHeight );

            if( localPos.y < height ){
                return i;
            }

        }

        return this.cursorMap.length-1;

    };
    */

    p.getCursorPositionInCursorMap = function( letter, cursorMapLine, x, y ){

        var cords = this.getLetterPositionInMapInLine( letter, cursorMapLine );

        if( letter == null ){

            return cords;

        }

		var localPos = letter.parent.globalToLocal( x, y );

        if( letter.x + letter.width/2 > localPos.x){

            return cords;

        }
        else {

            cords.position++;

            return cords;

        }


    };


    p.getLetterPositionInCursorMap = function( letter, before ){

        for( var i=0; i < this.cursorMap.length; i++ ){

            if( letter == this.cursorMap[i].letter ){

                if( before )
                    return i;
                else
                    return i+1;

            }

        }

    };


    /**
	* Przypisanie eventów edycyjnych do tekstu.
	*
	* @method _editModeEvents
	*/
	p._editModeEvents = function(){

		var _this = this;

        this.addEventListener('dblclick', function( e ){
                e.stopPropagation();
                const line=_this.selection.startLine;
                const cursorPos=_this.selection.firstLetter;
                _this.selection.firstLetter =cursorPos-_this.lines[line].lettersObjects.map(l=>l.text).slice(0,cursorPos).reverse().concat([' ']).indexOf(' ');
                _this.selection.lastLetter=cursorPos+_this.lines[line].lettersObjects.slice(cursorPos).map(l=>l.text).concat([' ']).indexOf(' ')-1;
                _this.selection.stopLine=line;
                _this._selectionMode = true;
                _this.displaySelectedLetter();

        });

		this.addEventListener('mousedown', function(e){

            e.stopPropagation();

            var closestLine = _this.getClosestLine( e.stageX, e.stageY );

            var closestLetter = _this.getClosestLetterInLine( closestLine, e.stageX, e.stageY );
            var nextLetter = null;

            if( closestLetter ){

                var position = _this.getLetterPositionInCursorMap( closestLetter.letter, closestLetter.before );

            }else {

                position = null;

            }
            if( closestLetter ){

                _this.setCursor( position, closestLetter.letter );

            }else {

                _this.setCursor( _this.cursorMap.indexOf( closestLine.cursorMap[0] ), null );

            }

            _this._selectionMode = false;

            var letterIndex = null;
            var lineOrder   = null;

            if ( closestLetter ){

                letterIndex = closestLetter.letter.parent.getChildIndex( closestLetter.letter );
                lineOrder   = closestLetter.letter.parent.lineOrder;

            }

            _this.selection.firstLetter = letterIndex;
            _this.selection.startLine   = lineOrder;
            _this.selection.lastLetter  = null;
            _this.selection.stopLine    = null;

            _this.displaySelectedLetter();

            return;

		});

		this.addEventListener('pressup', function(e){

            e.stopPropagation();

			_this._selectionMode = false;

		});



		this.addEventListener('pressmove', function(e){

			e.stopPropagation();

            if( userType == 'admin'){

    			_this._selectionMode = true;

                var closestLine = _this.getClosestLine( e.stageX, e.stageY );
                var closestLetter = _this.getClosestLetterInLine( closestLine, e.stageX, e.stageY );
                var nextLetter = null;

                var position =  _this.getLetterPositionInCursorMap( closestLetter.letter, closestLetter.before );

                var letterIndex = null;
                var lineOrder   = null;

                if (closestLetter){

                    letterIndex = closestLetter.letter.parent.getChildIndex( closestLetter.letter );
                    lineOrder   = closestLetter.letter.parent.lineOrder;

                }

                _this.selection.lastLetter  = letterIndex;
                _this.selection.stopLine    = lineOrder;

                _this.displaySelectedLetter();


            }else {

                _this._selectionMode = true;

                var closestLine = _this.getClosestLine( e.stageX, e.stageY );
                var closestLetter = _this.getClosestLetterInLine( closestLine, e.stageX, e.stageY );
                var nextLetter = null;

                if( closestLetter ){

                    var position =  _this.getLetterPositionInCursorMap( closestLetter.letter, closestLetter.before );

                }

                var letterIndex = null;
                var lineOrder   = null;

                if (closestLetter){

                    letterIndex = closestLetter.letter.parent.getChildIndex( closestLetter.letter );
                    lineOrder   = closestLetter.letter.parent.lineOrder;

                }

                _this.selection.lastLetter  = letterIndex;
                _this.selection.stopLine    = lineOrder;

                _this.displaySelectedLetter();

            }


		});

	};


    /**
	* Usunięcie eventów edycynych do tekstu.
	*
	* @method _removeEditModeEvents
	*/
    p._removeEditModeEvents = function(){

        this.removeAllEventListeners("mousedown");
        this.removeAllEventListeners("pressup");
        this.removeAllEventListeners("pressmove");

    };


    /**
	* Aktualizuje pozycje lini ( atrybut order ), pierwsza linia otrzymuje 0, druga 1 itd ...
	*
	* @method reorderLines
	*/
	p.reorderLines = function(){

		for( var i = 0; i < this.lines.length; i++ ){

			this.lines[i].lineOrder = i;

		}

	};

    p.getSelectedContent = function(){
        if(this.selection.startLine>this.selection.stopLine){
            const stopLine=this.selection.stopLine;
            this.selection.stopLine=this.selection.startLine;
            this.selection.startLine=stopLine;
            const firstLetter=this.selection.firstLetter;
            this.selection.firstLetter=this.selection.lastLetter;
            this.selection.lastLetter=firstLetter;
        }
        if(this.selection.startLine===this.selection.stopLine && this.selection.lastLetter<this.selection.firstLetter){
            const firstLetter=this.selection.firstLetter;
            this.selection.firstLetter=this.selection.lastLetter;
            this.selection.lastLetter=firstLetter;
        }
        var content = this.getContent();
        var selectedArray = this.getSelectedLetters();

        var selected = [];
        var lines = [];
        for( var i=this.selection.startLine; i <= this.selection.stopLine; i++ ){

            if( this.selection.startLine == this.selection.stopLine ){

                var line = {
                    lineHeight: content[this.selection.startLine].lineHeight,
                    align: content[this.selection.startLine].align,
                    letters: content[this.selection.startLine].letters.slice( this.selection.firstLetter, this.selection.lastLetter+1 )
                };

                return [line];

            }else {

                if( i == this.selection.startLine ){
                    lines.push(
                        {
                            lineHeight: content[this.selection.startLine].lineHeight,
                            align: content[this.selection.startLine].align,
                            letters: content[this.selection.startLine].letters.slice( this.selection.firstLetter, content[this.selection.startLine].letters.length )
                        }
                    );
                }else if( i == this.selection.stopLine ){

                    lines.push(
                        {
                            lineHeight: content[this.selection.stopLine].lineHeight,
                            align: content[this.selection.stopLine].align,
                            letters: content[this.selection.stopLine].letters.slice( 0, this.selection.lastLetter+1 )
                        }
                    );

                }else {

                    lines.push(
                        {
                            lineHeight: content[i].lineHeight,
                            align: content[i].align,
                            letters: content[i].letters
                        }
                    );

                }

            }

        }


        return lines;

    }


    /**
	* Wyświetla obiekt zaznaczenia tekstu dla wybranego fragmentu
	*
	* @method displaySelectedLetter
	*/
	p.displaySelectedLetter = function(){

		var infoArray = this.getSelectedLetters();


		for( var i=0; i < this.lines.length; i++ ){

			var line = this.lines[i];

			for( var l=0; l<line.lettersObjects.length; l++ ){

				if( infoArray.indexOf( line.lettersObjects[l] ) == -1 ){

					if( line.lettersObjects[l].selected )
						line.lettersObjects[l].deactiveSelect();

				}
				else {

					if( !line.lettersObjects[l].selected )
						line.lettersObjects[l].activeSelect();

				}

			}

		}

		return false;

		if( infoArray.action == "reselect"){

			for( var i=0; i < infoArray.letters.length; i++ ){

				if( infoArray.letters[i] )
					infoArray.letters[i].deactiveSelect();

			}

		}
		else if( infoArray.action == "newSelect") {

			for( var i=0; i < infoArray.letters.length; i++ ){

				if( infoArray.letters[i] )
					infoArray.letters[i].activeSelect();

			}

		}

		//this.makeCache();

	};


	/**
	* Zwraca wszystkie linie jakie sa zaznaczone
	*
	* @method getSelectedLines
	*/
    p.getSelectedLines = function(){

        var lines = [];

        for( var i=0; i < this._selected.length; i++ ){

            if( lines.indexOf( this._selected[i].parent ) == -1 )
                lines.push( this._selected[i].parent );

        }

        return lines;

    };


    /**
	* Zbiera wszystkei zaznaczone litery i przypisuje je do atrybutu <b>_selected</b> danej instancji tekstu
	*
	* @method getSelectedLetters
	*/
	p.getSelectedLetters = function(){

		var _this = this;
		var selected  = [];
		var reselect  = [];
		var newSelect = [];

        if( this.selection.stopLine === null || this.selection.lastLetter === null ){

            this._selected = [];

            return selected;

        }




			if( this.selection.startLine == this.selection.stopLine ){

				var line = this.lines[ this.selection.startLine ];

				if( this.selection.firstLetter <= this.selection.lastLetter ){

					for( var i=0; i<= this.selection.lastLetter - this.selection.firstLetter; i++ ){

						selected.push( line.getChildAt(this.selection.firstLetter+i));

					}

				}
				else{

					for( var i=0; i<= this.selection.firstLetter - this.selection.lastLetter; i++ ){

						selected.push( line.getChildAt(this.selection.lastLetter+i));

					}

				}

			}
			else if( this.selection.startLine < this.selection.stopLine ){

				var lines = this.selection.stopLine - this.selection.startLine ;

				for( var i= this.selection.startLine; i <= this.selection.stopLine; i++ ){

					var line = this.lines[i];
					var startLetter = 0;
					var stopLetter = line.lettersObjects.length-1;

					if( line.lineOrder == this.selection.startLine ){

						startLetter = this.selection.firstLetter;

					}
					else if( line.lineOrder == this.selection.stopLine ){

						stopLetter = this.selection.lastLetter;

					}

					for( var l=startLetter; l <= stopLetter; l++ ){

						selected.push( line.getChildAt(l) );

					}

				}

			}
			else if( this.selection.startLine > this.selection.stopLine ){


				var lines = this.selection.startLine - this.selection.stopLine ;

				for( var i= this.selection.stopLine; i <=  this.selection.startLine; i++ ){

					var line = this.lines[i];
					var startLetter = 0;
					var stopLetter = line.lettersObjects.length-1;

					if( line.lineOrder == this.selection.stopLine ){

						startLetter = this.selection.lastLetter;

					}
					else if( line.lineOrder == this.selection.startLine ){

						stopLetter = this.selection.firstLetter;

					}

					for( var l=startLetter; l <= stopLetter; l++ ){

						selected.push( line.getChildAt(l) );

					}

				}

			}



		this._selected = selected;

		return selected;

	};


    /**
	* Zwraca najbliższą literę kursorowi myszki z danej lini
	*
	* @method getClosestLetterInLine
    * @param line TextLine Linia która ma zostać przebadana
    * @param x float pozycja x myszki
    * @param y float pozycja y myszki
	*/
	p.getClosestLetterInLine = function( line, x, y ){

        if( line.letters == 0 ){

            return null;

        }

        var localPos = line.globalToLocal( x, y );
        var lines = 0;

        for( var key in line.linesInfo_Object ){

            lines++;

        }

        var bounds = line.getTransformedBounds();
        var letters = [];

        // mozna to przerobic na algorytm polowicznego wyszukiwania
        // jezeli myszka jest nad litermi
        if( localPos.y < 0 ){

            if( localPos.x > 0 && localPos.x < bounds.width ){


                var closestLetter = null;

                var lineInfo_object = line.linesInfo_Object[1];

                for( var i=lineInfo_object.firstLetter; i <= lineInfo_object.lastLetter; i++ ){

                   letters.push( line.getChildAt( i ) );

                }

                for( var i=0; i < letters.length; i++){

                    if( localPos.x > letters[i].x &&  localPos.x < letters[i].x+letters[i].width){

                        closestLetter = letters[i];
                        break;

                    }

                }

                if( closestLetter ){

                    var closestLetter = {

                      letter : closestLetter,
                      before : true

                    };

                    return closestLetter;

                }else {

                    var closestLetter = {

                      letter :  line.getChildAt( line.linesInfo_Object[1].lastLetter ),
                      before : false

                    };

                    return closestLetter;

                }

            }else if( localPos.x <= bounds.x ){

                var letter = line.getChildAt( 0 );

                var closestLetter = {

                  letter : letter,
                  before : true

                };

                return closestLetter;

            }else if( localPos.x >= bounds.width ){

                var letter = line.getChildAt( line.linesInfo_Object[1].lastLetter );

                var closestLetter = {

                  letter : letter,
                  before : false

                };

                return closestLetter;

            }

        }else if( localPos.y >= 0 && localPos.y <= bounds.height ){

            var realLine = 0;

            for( var i=1; i <= lines; i++ ){

              if( i*line.lineHeight > localPos.y ){

                 realLine = i;
                 break;

              }

            }

            var linesCounter = 0;
            var lineInfo_object = line.linesInfo_Object[realLine];

            var firstLetterInLine = line.getChildAt( lineInfo_object.firstLetter );
            var lastLetterInLine = line.getChildAt( lineInfo_object.lastLetter );

            if( firstLetterInLine.x > localPos.x ){

              var closestLetter = {

                letter : firstLetterInLine,
                before : true

              }

            }else if( lastLetterInLine.x < localPos.x ){

              var closestLetter = {

                letter : lastLetterInLine,
                before : false

              }

            }else {

              for( var i=lineInfo_object.firstLetter; i <= lineInfo_object.lastLetter; i++ ){

                 letters.push( line.getChildAt( i ) );

              }

              var closestLetter = null;

              for( var i=0; i < letters.length; i++ ){

                if( localPos.x > letters[i].x &&  localPos.x < letters[i].x+letters[i].width){

                  closestLetter = letters[i];
                  break;

                }

              }

              var closestLetter = {

                letter : closestLetter,
                before : (( localPos.x > closestLetter.x + closestLetter.width/2 ) ? false : true )

              }

            }


        }else if( localPos.y > bounds.height ){

          var firstLetterInLine = line.getChildAt( line.linesInfo_Object[ lines ].firstLetter );
          var lastLetterInLine = line.getChildAt( line.linesInfo_Object[ lines ].lastLetter );

          if( localPos.x < firstLetterInLine.x ){

            var letter = line.getChildAt( line.linesInfo_Object[ lines ].firstLetter );

            var closestLetter = {

              letter : letter,
              before : true

            }

          }else if( localPos.x > lastLetterInLine.x ){

            var letter = line.getChildAt( line.linesInfo_Object[ lines ].lastLetter );
            var closestLetter = {

              letter : letter,
              before : false

            }

          }else {

                var closestLetter = null;

                var lineInfo_object = line.linesInfo_Object[ lines ];

                for( var i=lineInfo_object.firstLetter; i <= lineInfo_object.lastLetter; i++ ){

                   letters.push( line.getChildAt( i ) );

                }

                for( var i=0; i < letters.length; i++){

                    if( localPos.x > letters[i].x &&  localPos.x < letters[i].x+letters[i].width){

                        closestLetter = letters[i];
                        break;

                    }

                }

                if( closestLetter ){

                    var closestLetter = {

                      letter : closestLetter,
                      before : true

                    };

                    return closestLetter;

                }else {

                    var closestLetter = {

                      letter :  line.getChildAt( line.linesInfo_Object[lines].lastLetter ),
                      before : false

                    };

                    return closestLetter;

                }

          }

        }


        return closestLetter;

    };


    /**
	* Zwraca nalbliższą literę z konkretnej lini mapy kursora
	*
	* @method getClosestLetterInLineFromCursorMap
    * @param {int} lineNumber Numer lini, która ma zostać przeszukana
    * @param {int} x pozycja x
    * @param {int} y Pozycja y
    */
    p.getClosestLetterInLineFromCursorMap = function( lineNumber, x, y ){

        var line = this.cursorMap[lineNumber];

        var localPos = this.globalToLocal( x, y );

        if( line[0].letter === null){

            return null;

        }
        else if( line[ 0 ].letter.x > localPos.x  ){

            return line[0].letter;

        }
        else if( line[ line.length-1 ].letter.x < localPos.x){

            return line[ line.length-1 ].letter;

        }


        for( var i = 0; i < line.length; i++ ){

            if( line[i].letter == null ){

                return null;

            }else {

                if( line[i].letter.x <= localPos.x && line[i].letter.x + line[i].letter.width >= localPos.x  ){
                    return line[i].letter;
                }

            }

        }

    };


    /**
	* Zwraca najbliższą linię kursorowi myszki
	*
	* @method getClosestLine
    * @param _x float pozycja x myszki
    * @param _y float pozycja y myszki
    * @return line
	*/
	p.getClosestLine = function( _x, _y ){

		var lineTest = this.getLineUnderPointer( _x, _y);
		var y = this.getConcatenatedMatrix().ty;
		var bounds = this.getTransformedBounds();

		if( lineTest ){

			return lineTest;

		}
		else {

			var pos = this.editor.stage.getMousePosition( _x, _y );
			var localPos = this.globalToLocal( _x, _y );

			var firstlineHeight = this.lines[0].getTransformedBounds().height;
			var lastlineHeight = this.lines[ this.lines.length - 1 ].getTransformedBounds().height;
			var lasteLineY = this.lines[ this.lines.length - 1 ].getConcatenatedMatrix().ty;
			var firstLineY = this.lines[ 0 ].getConcatenatedMatrix().ty;

			var firstLineBounds = this.lines[0].getTransformedBounds();

			var last = this.lines[ this.lines.length-1 ];
			var lastLineBounds = this.lines[ this.lines.length-1].getTransformedBounds();

			if( localPos.y < firstLineBounds.y ){

				return this.lines[0];

			}
			else if( localPos.y > lastLineBounds.y + ( last.lineHeight * last.lines ) ){

				return last;

			}else {

				for( var i=0; i < this.lines.length; i++ ){

					var lineHeight = this.lines[i].lineHeight * this.lines[i].lines;
					var bounds = this.lines[i].getTransformedBounds();

					if( localPos.y > bounds.y && localPos.y + lineHeight >localPos.y  ){

						return this.lines[i];

					}

				}

			}

		}

	};


    /**
	* Zwraca linię która się znajduje w podanych kordynatach
	*
	* @method getLineUnderPointer
    * @param x float pozycja x
    * @param y float pozycja y
	*/
	p.getLineUnderPointer = function( x, y ){

		var pos = this.editor.stage.getMousePosition( x, y );

		var localPos = this.globalToLocal( x, y );

		for( var i=0; i < this.lines.length; i++ ){

			var width = this.lines[i].getTransformedBounds().width;
			var height = this.lines[i].getTransformedBounds().height;

			var x = this.lines[i].getTransformedBounds().x;
			var y = this.lines[i].getTransformedBounds().y;

			if( localPos.x > x && localPos.x < x + width && localPos.y > y && localPos.y < y + height ){

				return this.lines[i];

			}

		}

		return false;

	};


    /**
	* Dodaje linię na samym koncu tekstu
	*
	* @method addLine
    * @param line TextLine linia która ma zostać dodana
	*/
	p.addLine = function( line ){

		line.setParentText( this, this.lines.length );

		this.addChild( line );
		this.lines.push( line );

        return line;

	};


    /**
	* Dodaje linię na konkretnej pozycji
	*
	* @method addLineAt
    * @param line TextLine linia która ma zostać dodana
	*/
	p.addLineAt = function( line, position ){

		line.setParentText( this, position );

        var linePos = this.lines.indexOf( this.getChildAt( position ) );

		this.addChildAt( line, position+1 );

		var firstElem = this.lines.slice( 0, linePos+1 );

        firstElem.push( line );

		var secondElem = this.lines.slice( linePos+1, this.lines.length );

		this.lines = firstElem.concat( secondElem );

		this.reorderLines();

        return line;

	};


    /**
	* Dodaje linię przed podaną linią
	*
	* @method addLineBefore
    * @param line TextLine linia która ma zostać dodana
	*/
	p.addLineBefore = function( line, lineToAdd ){

        var linePos = this.lines.indexOf( line );

		this.addChildAt( lineToAdd, this.getChildIndex( line ) );

		var firstElem = this.lines.slice( 0, linePos );

        firstElem.push( lineToAdd );

		var secondElem = this.lines.slice( linePos, this.lines.length );

		this.lines = firstElem.concat( secondElem );

		this.reorderLines();

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
	* Dodaje obiekt kompozycjy do dolnej części obiektu ( wyświetlana jest zawsze na samym dole )
	*
	* @method addBottomCompoundObject
	*/
	p.addBottomCompoundObject = function( name, object ){

		var lastBottomComposedObject = this.composedObjects.bottom.length;
		this.addChildAt( object, this.composedObjects.bottom.length );
		this.composedObjects.bottom.push( { 'name' : name, 'object' : object }  );

	};


	/**
	* Dodaje obiekt kompozycjy do górnej części obiektu ( wyświetlana jest zawsze na samej górze)
	*
	* @method addTopCompoundObject
	*/
	p.addTopCompoundObject = function( name, object ){

		this.addChild( object );
		this.composedObjects.top.push( { 'name' : name, 'object' : object } );

	};


    p.getAllCompoundObjects = function(){

        var compounds = [];

        for( var i=0 ; i<this.composedObjects.top.length ; i++ ){

            var obj = this.composedObjects.top[i];

            compounds.push( obj );

        }

        for( var i=0 ; i<this.composedObjects.bottom.length ; i++ ){

            var obj = this.composedObjects.bottom[i];

            compounds.push( obj );

        }

        return compounds;

    };


    /**
	* Zwraca obiekt kompozycji o danej nazwie ( jeżeli został wcześniej dodany )
	*
	* @method getCompoundObjectByName
    * @param name String nazwa obiektu kompozycji
    * @return bound
	*/
	p.getCompoundObjectByName = function( name ){

		for( var i=0 ; i<this.composedObjects.top.length ; i++ ){

			var obj = this.composedObjects.top[i];

			if( obj.name == name )
				return obj.object;

		}

		for( var i=0 ; i<this.composedObjects.bottom.length ; i++ ){

			var obj = this.composedObjects.bottom[i];

			if( obj.name == name )
				return obj.object;

		}

		return false;

	};


    /**
	* Zwraca pozycję litery w mapie pozycji kursora ( _cursorMap )
	*
	* @method getLetterPositionInMap
    * @param name String nazwa obiektu kompozycji
    * @return bound
	*/
    p.getLetterPositionInMap = function( letter ){

        for( var i=0; i < this.cursorMap.length; i++ ){

            if( this.cursorMap[i].letter == letter ){

                return i;

            }

        }

        return null;

    };


    /**
	* Zwraca pozycję litery w mapie pozycji kursora ( _cursorMap )
	*
	* @method getLetterPositionInMap
    * @param name String nazwa obiektu kompozycji
    * @return bound
	*/
    p.getLetterPositionInMapInLine = function( letter, line ){

        if( letter == null ){
            return { line: line, position : null };
        }


        for( var l=0; l < this.cursorMap[line].length; l++ ){

            if( this.cursorMap[line][l].letter == letter ){

                return { line: line, position: l };

            }

        }

    };

    p.initCreator = function(){

        this.background = new createjs.Shape();
		this.background.graphics.c().ss(1/this.editor.getStage().scaleX).s("#00F").mt(0,0).lt(0,0).lt(0,0).lt(0, 0).cp();
        this.addChild( this.background );

    };


    p.updateCreator = function( width, height ){

        this.background.graphics.c().ss(1/this.editor.getStage().scaleX).s("#00F").mt(0,0).lt(width,0).lt(width,height).lt(0, height).cp();

    };

    p.stopCreator = function(){

        this.removeChild( this.background );

    };

    p.removeTextBlock = function(){

        var startLine=0, startLetter=0, stopLine=0, stopLetter=0;

        if( this.selection.startLine > this.selection.stopLine ){

            startLine = this.selection.stopLine;
            stopLine = this.selection.startLine;
            startLetter = this.selection.lastLetter;
            stopLetter = this.selection.firstLetter;

        }else if( this.selection.startLine < this.selection.stopLine ) {

            stopLine = this.selection.stopLine;
            startLine = this.selection.startLine;
            stopLetter = this.selection.lastLetter;
            startLetter = this.selection.firstLetter;

        }else if( this.selection.startLine == this.selection.stopLine ){

            stopLine = startLine = this.selection.stopLine;

            if( this.selection.lastLetter < this.selection.firstLetter ){
                startLetter = this.selection.lastLetter;
                stopLetter = this.selection.firstLetter;
            }else {
                stopLetter = this.selection.lastLetter;
                startLetter = this.selection.firstLetter;
            }

        }


        var linesToRemove = [];
        var lettersToRemove = [];
        var aditionalLinesToRemove = [];
        var startLetterGlobalIndex = this.findLetterInCursorMap( this.lines[startLine].children[ startLetter ] );
        var startLetterLocalIndex = this.lines[startLine].findLetterInCursorMap( this.cursorMap[startLetterGlobalIndex].letter );


        if( startLine != stopLine ){

            this.lines[ startLine ].removeLetters( startLetter );
            this.lines[ stopLine ].removeLetters( 0, stopLetter+1 );

        }else {

            this.lines[startLine].removeLetters( startLetter, stopLetter+1 );

        }

        if( startLine != stopLine ){
            if( this.lines[stopLine].letters == 0 ){
                aditionalLinesToRemove.push( this.lines[stopLine] );
            }
        }


        if( startLine != stopLine ){

            var letterToCursor = this.lines[ startLine ].children[ this.lines[ startLine ].letters-1 ];

            this.concatLines( this.lines[ startLine ], this.lines[ stopLine ] );

            this.updateText({

                lettersPositions : true,
                linesPosition : true,

            });
            var mapObj = this.lines[ startLine ];

            if( this.lines[ startLine ].letters == 0 ){

                if( startLine == 0 ){
                    this.setCursor( 0, null );
                }else {

                    this.setCursor( this.cursorMap.indexOf( this.lines[startLine].cursorMap[0] ), null);
                }

            }else {

                this.setCursorOnLetter( letterToCursor, 1 );

            }

            //this.setCursor( this.lines[ startLine ].lettersObjects[firstLetter] );

        }else {

            this.updateText({

                lettersPositions : true,
                linesPosition : true,

            });

            var letterToCursor = this.lines[ startLine ].children[ startLetter ];

            if( !letterToCursor ){
                if(  this.lines[ startLine ].children[ startLetter-1 ] ){

                    console.log( this.lines[ startLine ].children[ startLetter-1 ] );

                    this.setCursorOnLetter( this.lines[ startLine ].children[ startLetter-1 ], 1 );
                }else {

                    this.setCursor( this.cursorMap.indexOf(this.lines[ startLine ].cursorMap[0]), null );
                }
            }else {
                if( startLetterLocalIndex === 0 ){
                    this.setCursor( this.cursorMap.indexOf( this.lines[startLine].cursorMap[0]), null );

                }else {
                    this.setCursor( startLetterGlobalIndex-1, ( ( startLetterGlobalIndex-1>-1 )? this.cursorMap[startLetterGlobalIndex-1].letter: this.cursorMap[startLetterGlobalIndex].letter ) );
                }
                //this.setCursor( startLetterGlobalIndex-1, ( ( startLetterGlobalIndex-1>-1 )? this.cursorMap[startLetterGlobalIndex-1].letter: this.cursorMap[startLetterGlobalIndex].letter ) );
            }

            //alert('FGdzie jest ustawiony kursor? : ' + startLetterGlobalIndex );
        }

        for( var i = startLine+1; i < stopLine; i++ ){

            linesToRemove.push( this.lines[i] );

        }

        for( var i=0; i< linesToRemove.length; i++ ){

            if( this.lines.length > 1 ){
                this.removeLine( linesToRemove[i] );
            }

        }

        for( var i=0; i< aditionalLinesToRemove.length; i++ ){

            if( this.lines.length > 1 ){
                this.removeLine( aditionalLinesToRemove[i] );
            }

        }

        this.selection.firstLetter = null;
        this.selection.startLine   = null;
        this.selection.lastLetter  = null;
        this.selection.stopLine    = null;

    };

    p.findLetterInCursorMap = function( letter ){

        for( var i=0; i < this.cursorMap.length; i++){

            if( this.cursorMap[i].letter == letter ){
                return i;
            }

        }

        return null;

    }


    p.initHitArea = function(){

        this.hitArea = new createjs.Shape();
        this.hitArea.graphics.c().f('red').r( 0, 0, this.trueWidth, this.trueHeight );

    };

    p.displayBorder = function( size  ){

        var s = 3;
        this.border.visible = true;
        this.border.graphics.c().ss(s/this.editor.getStage().scaleX/this.scaleX).s("#00F").mt(0,0).lt(this.width,0).lt(this.width,this.height).lt(0, this.height).cp();

    }

    p.displayBackground = function(){

        this.backgroundShape.visible = true;

    }


    p.hideBackground = function(){

        this.backgroundShape.visible = false;

    }


    p.hideBorder = function(size){

        this.border.visible = false;

    }




    /**
    * Inicjalizuje instancję - oddaje obiekty kpompozycji itp
    *
    * @method init
    */
    p.initForUserTheme = function( lineHeight, empty ){

        this.themeElement = true;

        if( !empty ){
            var firstLine = new Editor.TextLine(0,0, this.lineHeight );
            this.addLine( firstLine );
            firstLine.initHitArea();
        }

        var maskShape = new createjs.Shape();

        maskShape.graphics.c().f("rgba( 0,0,0,0.3)").r( 0, 0, this.trueWidth, this.trueHeight );
        maskShape.regX = this.regX;
        maskShape.regY = this.regY;
        maskShape.x = this.x;
        maskShape.y = this.y;

        //this.addBottomCompoundObject( "background", this.background );
        this.mask = maskShape;

        this.updateTextWithDefaultValues();
        this.mouseEnabled = false;
        this.setBounds(0,0,this.trueWidth, this.trueHeight);

    };


    /**
	*  Przelicza pozycje wsztstkich lini, należy wykonać po zmianach lineHeighta
	*
	* @method recalculateLinePositions
	*/
	p.recalculateLinePositions = function( marginTop ){

        var marginTop = marginTop || 0;

        if( !this.verticalAlign ){
            this.verticalAlign = 'top';
        }


        if( !this.verticalAlign || this.verticalAlign == 'top' ){

    		for( var i=0; i < this.lines.length; i++){

    			var child = this.lines[i];

    			if( i == 0 ){

                    child.y = 0 + marginTop - (child.lineHeight*0.25);
                    var height = child.lineHeight* child.lines;


                } else {
                    var height = child.lineHeight* child.lines;
                }

    			if ( this.lines[i+1] ){

    				var nextChild = this.lines[i+1];
    				nextChild.y = height + child.y;

    			}

    		}

        }else if( this.verticalAlign == 'bottom' ) {

            var allLinesHeight = 0;

            for( var i=0; i < this.lines.length; i++){

                var child = this.lines[i];
                allLinesHeight += child.lineHeight* child.lines;

            }

            var lastLine = this.lines[ this.lines.length-1];

            var topMargin = this.height - allLinesHeight - (marginTop) - (lastLine.lineHeight*0.25);

            var currentY = topMargin;

            for( var i=0; i < this.lines.length; i++){

                var child = this.lines[i];
                var height = child.lineHeight* child.lines;

                child.y = currentY;
                currentY +=height;

            }

        }else if( this.verticalAlign == 'middle' ){

            var allLinesHeight = 0;

            for( var i=0; i < this.lines.length; i++){

                var child = this.lines[i];

                allLinesHeight += child.lineHeight* child.lines;

            }

            var topMargin = (this.height - allLinesHeight )/2;

            var currentY = topMargin;



            for( var i=0; i < this.lines.length; i++){


                var child = this.lines[i];
                var height = child.lineHeight* child.lines;

                child.y = currentY - (child.lineHeight*0.25);
                currentY +=height;

            }

        }else if( this.verticalAlign == 'justify' ){

            var allLinesHeight = 0;

            for( var i=0; i < this.lines.length; i++){

                var child = this.lines[i];
                allLinesHeight += child.lineHeight* (child.lines-1);

            }

            var linesSpace = (this.height - allLinesHeight )/this.lines.length;


            var top = 0;

            for( var i=0; i < this.lines.length; i++){

                var child = this.lines[i];
                var height = child.lineHeight* child.lines;

                child.y = top;
                top += (height + top );

            }


        }


		//this.updateSize();

	};



    /**
	* Generuje mape pozycji kursora
	*
	* @method generateCursorMap
	*/
    p.generateCursorMap = function(){

        this.cursorMap=this.lines.reduce((arr1,line)=>{
            line.generateCursorMap();
            line.cursorMap.reduce((arr2,cm)=>{
                arr2.push(cm);
                return arr2;
            },arr1);
            return arr1;
        },[]);
    };


    /**
	* Zwraca pierwszy row który jest częścią podanej lini
	*
	* @method getFirstLineRow
    * @param {line} line linia do zbadania
    * @return {Int} numer wiersza ( liczony od zera )
	*/
    p.getFirstLineRow = function( line ){

        for( var i=0; i<this.cursorMap.length; i++ ){

            var row = this.cursorMap[i][0].line;

            if( row == line ){

                return i;

            }

        }

        return null;

    };


    p.updateCursorShape = function(){

        this.cursorShape.graphics.c().f("#F00").r( 0, -this._cursorLetter.lineHeight, 1/this.getTrueScale().x, this._cursorLetter.lineHeight );

    }


    /**
	* Ustawia kursor w odpowiednim miejscu. oraz ustala atrybuty instancji Tekstu:
    * <ul>
    * <li><b>_cursorLine</b> linia z cursorMap </li>
    * <li><b>_cursorPosition</b> pozycja litery z cursorMap </li>
    * <li><b>_cursorLetter</b> litera na której  </li>
    *</ul>
	*
	* @method setCursor
    * @param position Int pozycja litery w cursorMap
    * @param line Int pozycja lini w cursorMap
	*/
	p.setCursor = function( position, letter ){

        if( position == null || position < 0 ){

            position = 0;

        }

        var mapObject = this.cursorMap[ position ];



        if( !mapObject ){
            mapObject = this.cursorMap[0];

        }


        if( letter ){

            this._currentFontFamily = letter.fontFamily;
            this._currentFontSize = letter.size;
            this._currentFontColor = letter.color;
            this._currentFontSize = letter.size;

        }else if( mapObject.letter ){
            this._currentFontFamily = mapObject.letter.fontFamily;
            this._currentFontSize = mapObject.letter.size;
            this._currentFontColor = mapObject.letter.color;
            this._currentFontSize = mapObject.letter.size;
        }

        if( this.cursorShape ){

            this.removeChild( this.cursorShape );
            clearInterval( this.cursorInterval );

        }

        var onLine = mapObject.line;

        var cs = new createjs.Shape();
        cs.graphics.c().f("#F00").r( 0, 0, 1/this.getTrueScale().x, -onLine.lineHeight );

        var local = onLine.localToLocal( mapObject.x, mapObject.y , this );



        var aligmentFix = onLine.lineHeight*0.25;

        cs.x = local.x;
        cs.y = local.y + aligmentFix;// + ((bounds.height/4)*0.25);//parseInt( line.lineHeight);

        this.cursorShape = cs;

        this.addChild( cs );

        var _this = this;

        this.cursorInterval = setInterval( function(){

            cs.visible = ( cs.visible ) ? false : true;

        }, 250 );

        if( mapObject.letter ){

            this._cursorLine = onLine;
            this._cursorPosition = position;
            this._cursorLetter = mapObject.letter;
            this._currentFontFamily = this._cursorLetter.fontFamily;
            this._currentFontType = { regular : this._cursorLetter.fontType.regular, italic : this._cursorLetter.fontType.italic };
            this._currentFont = this.editor.fonts.selectFont( this._currentFontFamily, this._currentFontType.regular, this._currentFontType.italic );
            this._currentLineHeight = this._cursorLetter.lineHeight;
            this._currentFontSize = this._cursorLetter.size;
            this._currentFontColor = this._cursorLetter.color;

        }else {

            this._cursorPosition = position;

        }

        return;

	};


    /**
	* Ustawia kursor w miejscu podanej litery. Jeżeli litera nie istnieje w danej instancji, krsor zostanie ustawiony w lini 0 na miejscu 0
	*
	* @method setCursorOnLetter
    * @param {TextLetter} letter litera na której ma zostać ustawiony kursor
	*/
    p.setCursorOnLetter = function( letter, part ){

        var letterInMap = this.getLetterPositionInMap( letter );

        if( letterInMap )
            this.setCursor( letterInMap + part, letter );
        else
            this.setCursor( 0, 0 );

    };


    /**
	* Ustawia kursor w miejscu podanej litery. Jeżeli litera nie istnieje w danej instancji, krsor zostanie ustawiony w lini 0 na miejscu 0
	*
	* @method setValues
    * @param {Dictionary} słownik wartości do ustawienia
	*/
    p.setValues = function( args ){

        this._currentFontType.italic = args.italic || this._currentFontType.italic;

    };


    p.update = function(){

        for( var l = 0; l < this.lines.length; l++ ){

            var line = this.lines[l];

            for( var lett = 0; lett < line.lettersObjects.length; lett++){

                var letter = line.lettersObjects[lett];
                letter.update();

            }

        }


        for( var i=0; i < this.lines.length; i++){
            this.lines[i].complexRecalculate();
        }

    };


    /**
	* W zależniości od podanego argumentu, włącza czcionkę italic albo ją wyłącza
	*
	* @method updateSelected_Italic
    * @param {boolean} arg
	*/
    p.updateSelected_Italic = function( arg ){

        if( arg ){

            var value = 1;

        }
        else {

            var value = 0;

        }

        for( var i=0; i < this._selected.length; i++ ){

            this._selected[i].italic( value );
            this._selected[i].update();

        }

        this._updateShape();

    };


    /**
	* W zależniości od podanego argumentu, włącza czcionkę bold albo ją wyłącza
	*
	* @method updateSelected_Bold
    * @param {boolean} arg
	*/
    p.updateSelected_Bold = function( arg ){

        if( arg ){

            var value = 1;

        }
        else {

            var value = 0;

        }

        for( var i=0; i < this._selected.length; i++ ){

            this._selected[i].bold( value );
            this._selected[i].update();

        }

        this._updateShape();

    };


    /**
	* Ustala wysokość lini dla całego tekstu ( wszystkie lini i litery). Nalaezy później przeliczyc pozycje lini
	*
	* @method setLineHeight
    * @param lineHeight Int nowa wysokość lini
	*/
    p.setLineHeight = function( lineHeight ){
        /*
        lineHeight=lineHeight*0.37;

        for( var i=0; i < this.lines.length; i++ ){

            this.lines[i].setLineHeight( lineHeight );

        }

        this.lineHeight = lineHeight;
        this.widthUpdate = true;
        this.updateSize();
        this._updateShape();

        if( this.initAllTools ){
            Editor.tools.update();
            Editor.tools.updateCompoundBox();
        }

        //this.updateSize();
        */
    };


    /**
	* Odświeża rozmiar tekstu analizując boks go opisujący
	*
	* @method updateSize
	*/
	p.updateSize = function(){

		var bounds = this.getTransformedBounds();

		this.width = this.trueWidth = bounds.width;
		this.height = this.trueHeight = bounds.height;

        if( this.initAllTools ){
		  Editor.tools.update();
        }

	};


    p._cloneObject = function(){

        var object = new Editor.Text2( this.name, this.lineHeight, this.width, this.height, true, true );
        //var object = new Editor.Text2();

        object.init( 50, true );
        object.x = this.x;
        object.y = this.y;
        object.regX = this.regX;
        object.regY = this.regY;
        object.rotation = this.rotation;
        object.mask.x = this.mask.x;
        object.mask.y = this.mask.y;
        object.mask.regX = this.mask.regX;
        object.mask.regY = this.mask.regY;
        object.mask.rotation = this.mask.rotation;
        object.shadowBlur = this.shadowBlur;
        object.shadowColor = this.shadowColor;
        object.shadowOffsetY = this.shadowOffsetY;
        object.shadowOffsetX = this.shadowOffsetX;
        object._dropShadow = this._dropShadow;


        for( var i=0; i < this.lines.length; i++ ){

            var line = object.addLine( new Editor.TextLine( this.lines[i].x, this.lines[i].y, this.lines[i].lineHeight ) );
            line.shadow=this.lines[i].shadow;
            line.initHitArea();

            for( var l=0; l < this.lines[i].children.length; l++ ){

                var letter = line.addFullEditableLetter( this.lines[i].children[l].letter.text, this.lines[i].children[l].fontFamily, this.lines[i].children[l].size, this.lines[i].children[l].color );

            }

            line.uncache();

        }

        for( var i=0; i < object.lines.length; i++){
            object.lines[i].complexRecalculate();
        }

        object.setAlign( this._align );
        object.setTrueHeight( this.height );
        object.setTrueWidth( this.width );
        object.recalculateLinePositions();
        var currentBounds = this.getTransformedBounds();

        object.x = this.x;
        object.y = this.y;

        object._updateShape();
        object.uncache();

        return object;

    };

    p.setTrueWidth = function( w, blockLeftCornerPosition ){

        var widthBefore = this.width;

        /*
        if( w-(this.padding.left+this.padding.right) < this.minWidth ){

            w = this.minWidth + this.padding.left + this.padding.right;
            blockLeftCornerPosition = false;
            console.log( this.x );

        }
        */

        this.trueWidth = w;
        this.width = w * this.scaleX;
        this.regX = w/2;

        if( this.mask ){

            this.mask.regX = this.regX;

        }

        if( blockLeftCornerPosition ){

            var vector = (this.width - widthBefore)/2;
            this.x += vector;

        }

    };



    p.setShadowBlur = function( blur ){

        this.shadowBlur = blur;

    };


    p.setShadowColor = function( color ){

        this.shadowColor = color;

    };


    p.setShadowOffsetY = function( posY ){

        this.shadowOffsetY = posY;

    };


    p.setShadowOffsetX = function( posX ){

        this.shadowOffsetX = posX;

    };

    p.dropShadow = function(){
        if ( !this._dropShadow){
            this._dropShadow=true;
            this.customShadow = new EditorShadow2( this,this.shadowBlur, this.shadowColor, this.shadowOffsetX, this.shadowOffsetY );
            // this.shadowLayer.addChild( this.customShadow );
        }else{
            this.customShadow.updateShadow( this,this.shadowBlur, this.shadowColor, this.shadowOffsetX, this.shadowOffsetY );
        }
    };

    p.unDropShadow = function () {
        if (this.customShadow)
            this.customShadow.reset(this)
        this._dropShadow = false;

    };

    /**
	* Zwraca budulec obiektu
	*
	* @method getObjectTimber
	*/
    p.getObjectTimber = function(){

        var _this = this;

        return {

            name : _this.name,
            content : {
                height           : _this.height,
                width            : _this.width,
                trueWidth        : _this.trueWidth,
                trueHeight       : _this.trueHeight,
                type             : _this.type,
                scaleX           : _this.scaleX,
                scaleY           : _this.scaleY,
                regX             : _this.regX,
                regY             : _this.regY,
                x                : _this.x,
                y                : _this.y,
                name             : _this.name,
                img              : _this.img,
                minImg           : _this.minImg,
                rotation         : _this.rotation,
                text             : _this.getTextObjects()

            }
        };

    };


    /**
	* Zwraca linie i litery budujące tekst
	*
	* @method HTMLoutput
    * @return {object} JSON'owy obiekt informujący o liniach i literach.
	*/
    p.getTextObjects = function(){

        var _this = this;

        var lines = [];

        for( var i=0; i < _this.lines.length; i++ ){

            var letters = [];


            for( var l=0; l < _this.lines[i].lettersObjects.length; l++ ){

                _this.lines[i].lettersObjects[l];

                letters.push( {

                    letter     : _this.lines[i].lettersObjects[l].text,
                    size       : _this.lines[i].lettersObjects[l].size,
                    lineHeight : _this.lines[i].lettersObjects[l].lineHeight,
                    fontFamily : _this.lines[i].lettersObjects[l].fontFamily,
                    color      : _this.lines[i].lettersObjects[l].color

                } );

            }

            lines.push({

                align       : _this.lines[i].align,
                lineOrder   : _this.lines[i].lineOrder,
                lineHeight  : _this.lines[i].lineHeight,
                letters     : letters

            });

        }

        return lines;

    };

    /**
     * Zamienia reprezentacje wewnętrzną na prosty tekst
     */
    p.toFlatText = (lines) =>lines.reduce((arr, line) => {
        line.letters.filter((letter)=>letter.text!=='').reduce((arr, letter) => {
            arr.push(letter.text);
            return arr;
        },arr);
        arr.push('\n');
        return arr;
    }, []).reduce((all,text)=>all+text,'');

    p.toSystemClipboard = (text) => {
        try {
            const output = document.querySelector('#copyTmp');
            output.textContent = text;
            output.select();
            document.execCommand('copy');
        } catch (e) {
            console.log(`Problem przy kopiowaniu do systemowego schowka`,e);
        }
    }

    /**
	* Zwraca htmlową reprezentację obiektu
	*
	* @method HTMLoutput
    * @return String
	*/
	p.HTMLoutput = function(){

		var HTML = "<li data-id='"+ this.id +"'><span class='li-button' data-id='" + this.id + "'><span class='visibility"+((this.visible)? " active" : " un-active" )+"' data-id='"+this.id+"' data-base-id='" + this.dbId + "'></span><span class='image-miniature'><img src='textIcon.png'/></span><span class='object-name'>" + this.dbId + " </span><span class='locker"+((this.mouseEnabled)? " active" : " un-active" )+"'></span><span class='remover' data-id="+this.id+">x</span></span>";

		return HTML;

	};

	p.initPasteProcessing=(_this)=>{
        if(window.oneText2PasteListener){
            document.removeEventListener('paste',window.oneText2PasteListener);
        }
        window.oneText2PasteListener=(e)=> {
            if(_.isEmpty(_this.editor)){
                return;
            }
            let text = '';
            try {
                text = e.clipboardData.getData('Text').replace(/\r/g,'');
            } catch (err) {
                console.warn(`Problem przy kopiowaniu z systemowego schowka`, err);
            }
            const appClipboardText = !_.isEmpty(_this.editor.clipboardData)?_this.toFlatText(_this.editor.clipboardData):'';
            if(appClipboardText!=text){
                //console.log(`insert appClipboardText= ${appClipboardText} text=${text}`)
                const currentLine = _this.cursorMap[ _this._cursorPosition ].line;
                const currentLetter = _this.cursorMap[ _this._cursorPosition ].letter || new TextLetter(
                    ' ',
                    _this._currentFontFamily,
                    _this._currentFontSize,
                    _this._currentFontColor,
                    _this.defaultSettings.lineHeight,
                    _this.defaultSettings.type.regular,
                    _this.defaultSettings.type.italic,
                    _this.editor
                );
                let lines=[];
                text.split('\n').reduce((lines,lineText,i)=>{

                    const line = {
                        letters: [],
                        lineHeight: currentLine.lineHeight,
                        align: currentLine.align
                    }

                    lineText.split('').reduce((letters, letter) => {
                        letters.push({
                            text: letter,
                            color: currentLetter.color,
                            fontFamily: currentLetter.fontFamily,
                            fontType: currentLetter.fontType,
                            line: '1',
                            lineHeight: currentLetter.lineHeight,
                            size: currentLetter.size
                        })
                        return letters;
                    }, line.letters);

                    lines.push(line);

                    return lines;
                },lines)
                _this.insertContent( lines);
            }else{
                _this.insertContent( _this.editor.clipboardData );
            }
        }
        document.addEventListener('paste',window.oneText2PasteListener);

    }

export {Text2};