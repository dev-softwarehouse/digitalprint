import {EditorObject} from './EditorObject';
import {TextLine} from './TextLine';
import {TextLetter} from './TextLetter';
import {TextTool} from './tools/textTools_admin';
    function Text2(){

    }

    var p = Text2.prototype;

    p.init = function( empty ){

        this._currentFont = this.editor.fonts.selectFont( this._currentFontFamily, this._currentFontType.regular, this._currentFontType.italic );
		var border = new createjs.Shape();
        this.border = border;
        this.border.visible = true;

		border.graphics.c().ss(1/this.editor.getStage().scaleX).s("#00F").mt(1,1).lt(this.width,1).lt(this.width,this.height).lt(0, this.height).cp();

        this.shapeBorder = new createjs.Shape();
        //this.shapeBorder.graphics.c().ss(2/Editor.getStage().scaleX).s("#00F").mt(1,1).lt(this.width-1,1).lt(this.width-1,this.height-1).lt(1, this.height-1).cp();

		this.addTopCompoundObject( 'border', border);
        //this.addTopCompoundObject('shapeBorder', this.shapeBorder );
        //this.border.visible = false;

        if( !empty ){

            var firstLine = new TextLine(0,0, this._currentLineHeight );
            this.addLine( firstLine );
            firstLine.initHitArea();
            firstLine.uncache();

        }

		var maskShape = new createjs.Shape();

		maskShape.graphics.c().f("rgba( 0,0,0,0.3)").r( 0, 0, this.trueWidth, this.trueHeight );
        maskShape.regX = this.regX;
        maskShape.regY = this.regY;
        maskShape.x = this.x;
        maskShape.y = this.y;

		this.background = new createjs.Shape();
		this.background.graphics.c().f("rgba(255,255,255,0.4)").r( 0, 0, this.trueWidth, this.trueHeight );

		//this.addBottomCompoundObject( "background", this.background );
	    this.mask = maskShape;
        this.updateTextWithDefaultValues();

		this._bindEvents();

        this.setBounds(0,0,this.trueWidth, this.trueHeight);

        //this.uncache();
        //this.cache( 0, 0, this.trueWidth, this.trueHeight,2 );
        this.hitArea = new createjs.Shape();
        this.hitArea.graphics.c().f('red').r( 0, 0, this.trueWidth, this.trueHeight );


	};

	/**
	* Ustala nowe wymiary obiektu i updateuje jego graficzną reprezentację. Odpowiedzialny jest za całkowite odświeżenie.
    * Wszystkie wprowadzone zmiany mogą zostać uaktualnione właśnie przez tę motodę
	*
	* @method _updateShape
	*/
	p._updateShape = function(){

        return;

        var border = this.getCompoundObjectByName( 'border' );
        border.graphics.c().ss(1/this.editor.getStage().scaleX).s("#00F").mt(1,1).lt( this.width,1).lt( this.width, this.height).lt(0, this.height).cp();

        var background = this.background;
        background.graphics.c().f("rgba(255,255,255,0.4)").r( 0, 0, this.trueWidth, this.trueHeight );

        this.mask.graphics.c().f("rgba( 0,0,0,0.3)").r( 0, 0, this.trueWidth, this.trueHeight );
        this.mask.regX = this.regX;
        this.mask.regY = this.regY;
        this.mask.x = this.x;
        this.mask.y = this.y;

        this.setBounds(0, 0, this.trueWidth, this.trueHeight);

        for( var i=0; i < this.lines.length; i++){

            var line = this.lines[i];
            line.setMaxWidth( this.trueWidth );
            line.complexRecalculate();
            line.uncache();
            line.updateBoundsAndHitArea();

        }

        if( this.toolBox )
            this.toolBox._updateToolsBoxPosition();

        this.initHitArea();
        this.verticalCenter();
        this.generateCursorMap();
        this.editor.tools.init();

        //var mapCursor = this.cursorMap[ this._cursorLine ][0];
        //mapCursor.line.complexRecalculate();

        this.generateCursorMap();

        this.setCursor( this._cursorPosition );

	};


    /**
    * Binduje event związane z edycją tekstu
    *
    * @method _bindEvents
    */
    p._bindEvents = function(){

        var _this = this;

        this.addEventListener('resize', function( e ){

            var border = _this.getCompoundObjectByName( 'border' );
            border.graphics.c().ss(1/_this.editor.getStage().scaleX).s("#00F").mt(1,1).lt( _this.width,1).lt( _this.width, _this.height).lt(0, _this.height).cp();

            var background = _this.background;
            background.graphics.c().f("rgba(255,255,255,0.4)").r( 0, 0, _this.trueWidth, _this.trueHeight );

            _this.mask.graphics.c().f("rgba( 0,0,0,0.3)").r( 0, 0, _this.trueWidth, _this.trueHeight );
            _this.mask.regX = _this.regX;
            _this.mask.regY = _this.regY;
            _this.mask.x = _this.x;
            _this.mask.y = _this.y;

            _this.setBounds(0,0,_this.trueWidth,_this.trueHeight);

            if( _this.displaySimpleBorder ){

                _this.updateSimpleBorder();

            }

            _this.initHitArea();

        });


        this.addEventListener('resizeCorner', function( e ){

            var border = _this.getCompoundObjectByName( 'border' );
            border.graphics.c().ss(1/_this.editor.getStage().scaleX).s("#00F").mt(1,1).lt( _this.width,1).lt( _this.width, _this.height).lt(0, _this.height).cp();

            var background = _this.background;
            background.graphics.c().f("rgba(255,255,255,0.4)").r( 0, 0, _this.trueWidth, _this.trueHeight );

            _this.mask.graphics.c().f("rgba( 0,0,0,0.3)").r( 0, 0, _this.trueWidth, _this.trueHeight );
            _this.mask.regX = _this.regX;
            _this.mask.regY = _this.regY;
            _this.mask.x = _this.x;
            _this.mask.y = _this.y;

            _this.setBounds(0,0,_this.trueWidth,_this.trueHeight);

            if( _this.displaySimpleBorder ){

                _this.updateSimpleBorder();

            }

            _this.initHitArea();

        });


        this.addEventListener('resizeEnd', function( e ){

            _this.mask.graphics.c().f("rgba( 0,0,0,0.3)").r( 0, 0, _this.trueWidth, _this.trueHeight );
            _this.mask.regX = _this.regX;
            _this.mask.regY = _this.regY;
            _this.mask.x = _this.x;
            _this.mask.y = _this.y;


            if( !_this.editMode ){
                e.stopPropagation();
                //_this.uncache();
                //_this.cache( 0, 0, _this.trueWidth, _this.trueHeight, 2 );
            }

            var bounds = _this.getTransformedBounds();

            _this.editor.webSocketControllers.editorText.setTransform(

                bounds.x,
                bounds.y,
                _this.rotation,
                _this.width,
                _this.height,
                _this.dbID

            );

        });


        this.addEventListener( 'paste', function( e ){

            document.getElementById("copyBox").focus();

            setTimeout(function(){

                if( Editor.clipboardData ){

                    e.preventDefault();
                    // pierwsza linia z skopiowanego ciągu.
                    var lineBefore = Editor.clipboardData[0].parentId;

                    // pierwsza linia, to w niej znajduje się kursor
                    var selectedLine = _this.cursorMap[ _this._cursorLine ][0].line;

                    //ostatnia linia, na niej konczy sie kopiowanie
                    var lastLine = _this.breakLine( selectedLine, _this._cursorPosition );

                    // wrzucamy wszystkie litery w nowe miejsce tekstu, powinny przybrać domyśle ustawienia
                    for( var i=0; i < Editor.clipboardData.length; i++ ){

                        if( lineBefore == Editor.clipboardData[i].parentId ){

                            selectedLine.addCreatedLetter( Editor.clipboardData[i] );

                        }
                        else {

                            selectedLine = _this.breakLine( selectedLine, selectedLine.letters );
                            lineBefore = Editor.clipboardData[i].parentId;
                            selectedLine.addCreatedLetter( Editor.clipboardData[i] );

                        }

                    }

                    _this.widthUpdate = true;
                    _this.concatLines( selectedLine, lastLine);

                    Editor.clipboardData = null;

                }
                else {

                    var test = document.getElementById("copyBox").value.replace(/\n/g, '||');
                    var tmp = "";
                    var tmp_open = false;

                    var line = _this.cursorMap[ _this._cursorLine ][0].line;

                    _this.breakLine( line, _this._cursorPosition );

                    for( var i= 0; i< test.length; i++ ){

                        if( test[i] == "|" ){

                            if( test[i+1] == "|" ){

                                var lineIndex = _this.getChildIndex( line );
                                line = new TextLine( 0, 0, _this.lineHeight );
                                _this.addLineAt( line, lineIndex );
                                i++;

                            }else {

                                if( i < test.length ){

                                    var letter = new TextLetter( test[i], _this._currentFontFamily, _this._currentFontSize, _this._currentFontColor, line.lineHeight, _this._currentFontType.regular , _this._currentFontType.italic,_this.editor );
                                    line.addLetter( letter );

                                }

                            }

                        }else {

                            var letter = new TextLetter( test[i], _this._currentFontFamily, _this._currentFontSize, _this._currentFontColor, line.lineHeight , _this._currentFontType.regular , _this._currentFontType.italic, _this.editor );
                            line.addLetter( letter );

                        }

                        line.uncache();

                    }

                    document.getElementById("copyBox").value = "";
                }

                _this.paste = false;
                _this._updateShape();

            },100);

        });

        this.addEventListener('mouseover', function( e ){

            e.stopPropagation();

            //_this.displayBorder( 2 );

        });

        this.addEventListener('mouseout', function( e ){

            e.stopPropagation();

            ///_this.hideBorder();

        });

        this.addEventListener('click', function(e){

            e.stopPropagation();

        });


        this.addEventListener("dblclick", function( e ){

            e.stopPropagation();

            if( _this.editMode ){
                // zaznaczenie wszystkich liter
                return;
            }

            if( _this.defaultTextVisible ){

                _this.removeAllLetters();

            }

            if( !_this.toolBox ){

                var toolboxInstance = new TextTool( _this );
                _this.toolBox = toolboxInstance;
                _this.toolBox._updateToolsBoxPosition();
                _this.toolBox.updateAlign( _this._align );
                _this.toolBox._updateToolBox();
                _this.toolBox.open = true;

            }else {
                if( _this.toolBox ){

                    _this.toolBox.remove();
                    _this.toolBox = null;

                    var toolboxInstance = new TextTool( _this );
                    _this.toolBox = toolboxInstance;
                    _this.toolBox._updateToolsBoxPosition();
                    _this.toolBox.updateAlign( _this._align );
                    _this.toolBox._updateToolBox();
                    _this.toolBox.open = true;

                }
            }

            _this.toolBox.open = true;

            _this.uncache();
            //_this.hitArea = null;
            _this.cursor = "text";
            _this.editMode = true;
            _this.editor.tools.keyboard.append( "keydown", _this );

            _this.removeAllEventListeners( 'mousedown' );
            _this.removeAllEventListeners( 'pressmove' );
            _this.removeAllEventListeners( 'pressup' );
            _this.editor.getStage().removeAllEventListeners('stagemousedown');

            _this._editModeEvents();
            var cords = _this.getCursorPositionInCursorMap();

            if( _this._cursorPosition == null ){

                if( _this.cursorMap.length > 1 ){

                    _this.setCursor( _this.cursorMap.length-1 );

                }else {

                    _this.setCursor( 0 );

                }

            }else {

                _this.setCursor( _this._cursorPosition );

            }

        });


        this.addEventListener( 'unclick', function(){

            if( _this.editMode ){

                //usuwamy wszystkie zbedne eventy
                _this._removeEditModeEvents();
                _this.selection.lastLetter = null;
                _this.selection.stopLine = null;
                _this.displaySelectedLetter();
                _this.cursor = 'pointer';

                /*
                if( jscolor.picker ){

                    delete jscolor.picker.owner;

                }
                */

                if( $(".Picekr").length > 0 ){

                    document.getElementsByTagName('body')[0].removeChild(jscolor.picker.boxB);

                }

            }

            _this.editor.tools.keyboard.detach("keydown");

            _this.editMode = false;

            if( _this.toolBox ){

                _this.toolBox.remove();
                _this.toolBox = null;

            }

            // usuniecie kursora i  wyłączenie intervala
            _this.removeChild( _this.cursorShape );
            _this.cursorShape = null;
            clearInterval(_this.cursorInterval);

            // inicjalizacja podstawowych eventów


             _this.initEvents();


            _this.initTextEvents();
            //zrobienie cache i zapisanie go
            //_this.cache( 0, 0, _this.trueWidth, _this.trueHeight );
            _this.hitArea = _this.background;



        });


        this.addEventListener("stageScroll", function(){

            if( _this.toolBox )
                _this.toolBox._updateToolsBoxPosition();

            var border = _this.getCompoundObjectByName( 'border' );
            border.graphics.c().ss(1/_this.editor.getStage().scaleX).s("#00F").mt(0,0).lt( _this.width,0).lt( _this.width, _this.height).lt(0, _this.height).cp();

        });

        this.addEventListener('stageMove', function( e ){

            if( _this.toolBox )
                _this.toolBox._updateToolsBoxPosition();

        });

    };

export { Text2 };
